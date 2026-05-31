import { NextResponse, type NextRequest } from "next/server";

import { getBookingBySelfServiceToken } from "@/lib/booking/self-service";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasStripeCheckoutEnv, hasSupabaseAdminEnv } from "@/lib/env";
import { getBaseAppUrl } from "@/lib/app-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripeClient } from "@/lib/stripe/client";
import { bookingManageTokenSchema } from "@/lib/validations/bookings";

export const dynamic = "force-dynamic";

function getManageUrl(token: string, status: "success" | "cancelled") {
  return `${getBaseAppUrl()}/manage/${token}?payment=${status}`;
}

export async function POST(request: NextRequest) {
  if (!hasSupabaseAdminEnv() || !hasStripeCheckoutEnv()) {
    return new NextResponse("Online payments are not configured", { status: 503 });
  }

  const formData = await request.formData();
  const parsed = bookingManageTokenSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return new NextResponse("Online payments are not configured", { status: 503 });
  }

  const supabase = createAdminClient();
  const booking = await getBookingBySelfServiceToken(supabase, parsed.data.token);

  if (!booking) {
    return new NextResponse("Not Found", { status: 404 });
  }

  if (booking.deposit_paid || booking.deposit_amount <= 0) {
    return NextResponse.redirect(getManageUrl(parsed.data.token, "success"), { status: 303 });
  }

  const currency = (booking.services?.currency ?? "CZK").toLowerCase();
  const serviceName = booking.services?.name ?? "Rezervace";
  const tenantName = booking.tenants?.name ?? "Podnik";
  const checkoutSession = await stripe.checkout.sessions.create(
    {
      client_reference_id: booking.id,
      customer_email: booking.clients?.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: `Záloha: ${serviceName}`,
              description: tenantName,
            },
            unit_amount: booking.deposit_amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: booking.id,
        payment_scope: "deposit",
        tenant_id: booking.tenant_id,
      },
      mode: "payment",
      payment_intent_data: {
        metadata: {
          booking_id: booking.id,
          payment_scope: "deposit",
          tenant_id: booking.tenant_id,
        },
      },
      success_url: getManageUrl(parsed.data.token, "success"),
      cancel_url: getManageUrl(parsed.data.token, "cancelled"),
    },
    {
      idempotencyKey: `booking-deposit:${booking.tenant_id}:${booking.id}:${booking.deposit_amount}`,
    },
  );

  if (!checkoutSession.url) {
    return new NextResponse("Checkout session failed", { status: 500 });
  }

  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from("booking_payments")
    .select("id")
    .eq("tenant_id", booking.tenant_id)
    .eq("provider", "stripe")
    .eq("provider_payment_id", checkoutSession.id)
    .maybeSingle();

  if (existingPaymentError) {
    return new NextResponse("Checkout session failed", { status: 500 });
  }

  if (!existingPayment) {
    const { error } = await supabase.from("booking_payments").insert({
      tenant_id: booking.tenant_id,
      booking_id: booking.id,
      amount: booking.deposit_amount,
      currency: booking.services?.currency ?? "CZK",
      method: "online_card",
      note: `Stripe Checkout: ${formatCurrencyForDisplay(booking.deposit_amount, booking.services?.currency ?? "CZK", 2)}`,
      paid_at: null,
      payment_scope: "deposit",
      provider: "stripe",
      provider_payment_id: checkoutSession.id,
      status: "pending",
    });

    if (error) {
      return new NextResponse("Checkout session failed", { status: 500 });
    }
  }

  return NextResponse.redirect(checkoutSession.url, { status: 303 });
}
