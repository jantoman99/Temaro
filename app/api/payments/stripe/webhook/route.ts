import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe/client";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type TypedSupabase = SupabaseClient<Database>;

function getStringMetadata(session: Stripe.Checkout.Session, key: string) {
  const value = session.metadata?.[key];

  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function getPaymentIntentId(session: Stripe.Checkout.Session) {
  if (!session.payment_intent) {
    return null;
  }

  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent.id;
}

function getSupportedCurrency(value: string | null | undefined): "CZK" | "EUR" {
  const normalized = value?.toUpperCase();

  return normalized === "EUR" ? "EUR" : "CZK";
}

async function handleCheckoutSessionCompleted(
  supabase: TypedSupabase,
  session: Stripe.Checkout.Session,
) {
  if (session.payment_status !== "paid") {
    return;
  }

  const tenantId = getStringMetadata(session, "tenant_id");
  const bookingId = getStringMetadata(session, "booking_id");
  const paymentScope = getStringMetadata(session, "payment_scope");
  const amount = session.amount_total ?? 0;
  const currency = getSupportedCurrency(session.currency);
  const paidAt = new Date().toISOString();

  if (!tenantId || !bookingId || paymentScope !== "deposit" || amount <= 0) {
    throw new Error("Invalid checkout metadata");
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, deposit_amount, deposit_paid")
    .eq("tenant_id", tenantId)
    .eq("id", bookingId)
    .maybeSingle();

  if (bookingError || !booking) {
    throw new Error("Booking lookup failed");
  }

  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from("booking_payments")
    .select("id, status")
    .eq("tenant_id", tenantId)
    .eq("provider", "stripe")
    .eq("provider_payment_id", session.id)
    .maybeSingle();

  if (existingPaymentError) {
    throw new Error("Payment lookup failed");
  }

  if (existingPayment?.status === "paid") {
    return;
  }

  let paymentId = existingPayment?.id ?? null;
  const paymentIntentId = getPaymentIntentId(session);

  if (paymentId) {
    const { data: updatedPayment, error } = await supabase
      .from("booking_payments")
      .update({
        amount,
        currency,
        method: "online_card",
        note: paymentIntentId ? `Stripe payment_intent: ${paymentIntentId}` : "Stripe Checkout",
        paid_at: paidAt,
        status: "paid",
      })
      .eq("tenant_id", tenantId)
      .eq("id", paymentId)
      .select("id")
      .maybeSingle();

    if (error || !updatedPayment) {
      throw new Error("Payment update failed");
    }
  } else {
    const { data: insertedPayment, error } = await supabase
      .from("booking_payments")
      .insert({
        tenant_id: tenantId,
        booking_id: bookingId,
        amount,
        currency,
        method: "online_card",
        note: paymentIntentId ? `Stripe payment_intent: ${paymentIntentId}` : "Stripe Checkout",
        paid_at: paidAt,
        payment_scope: "deposit",
        provider: "stripe",
        provider_payment_id: session.id,
        status: "paid",
      })
      .select("id")
      .single();

    if (error || !insertedPayment) {
      throw new Error("Payment insert failed");
    }

    paymentId = insertedPayment.id;
  }

  if (!booking.deposit_paid && booking.deposit_amount > 0 && amount >= booking.deposit_amount) {
    const { error } = await supabase
      .from("bookings")
      .update({
        deposit_paid: true,
        deposit_paid_at: paidAt,
        updated_at: paidAt,
      })
      .eq("tenant_id", tenantId)
      .eq("id", bookingId)
      .eq("deposit_paid", false);

    if (error) {
      throw new Error("Booking deposit update failed");
    }
  }

  const { error: eventError } = await supabase.from("booking_events").insert({
    tenant_id: tenantId,
    booking_id: bookingId,
    actor_user_id: null,
    actor_type: "system",
    event_type: "payment_recorded",
    metadata: {
      amount,
      currency,
      method: "online_card",
      payment_id: paymentId,
      payment_intent_id: paymentIntentId,
      payment_scope: "deposit",
      provider: "stripe",
      stripe_checkout_session_id: session.id,
    },
  });

  if (eventError) {
    throw new Error("Payment event insert failed");
  }
}

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = getStripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");

  if (!stripe || !webhookSecret || !signature) {
    return new NextResponse("Webhook not configured", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await request.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      await handleCheckoutSessionCompleted(
        createAdminClient(),
        event.data.object as Stripe.Checkout.Session,
      );
    }
  } catch {
    return new NextResponse("Webhook processing failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}
