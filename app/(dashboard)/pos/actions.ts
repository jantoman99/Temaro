"use server";

import { revalidatePath } from "next/cache";

import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";
import { getPosPaymentScope, getRemainingAmount } from "@/lib/pos/checkout";
import { safePostCommit } from "@/lib/utils/post-commit";
import { posCheckoutSchema } from "@/lib/validations/payments";

type PosActionState = {
  error?: string;
  success?: string;
};

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function completePosCheckoutAction(
  _previousState: PosActionState,
  formData: FormData,
): Promise<PosActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = posCheckoutSchema.safeParse({
    bookingId: getStringValue(formData, "bookingId"),
    method: getStringValue(formData, "method"),
    note: getStringValue(formData, "note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Platbu se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: pokladní platba by se tady zaevidovala." };
  }

  const { data: booking, error: bookingError } = await auth.supabase
    .from("bookings")
    .select(
      `
        id,
        status,
        deposit_amount,
        deposit_paid,
        services!bookings_service_tenant_fkey(price, currency),
        booking_payments(amount, status)
      `,
    )
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.bookingId)
    .in("status", ["pending", "confirmed", "completed"])
    .maybeSingle();

  if (bookingError) {
    return { error: "Rezervaci se nepodařilo ověřit." };
  }

  if (!booking || !booking.services) {
    return { error: "Rezervace už není dostupná." };
  }

  const remainingAmount = getRemainingAmount({
    payments: booking.booking_payments ?? [],
    servicePrice: booking.services.price,
  });

  if (remainingAmount <= 0) {
    return { error: "Rezervace už je plně uhrazená." };
  }

  const paidAt = new Date().toISOString();
  const paymentScope = getPosPaymentScope({
    payments: booking.booking_payments ?? [],
    servicePrice: booking.services.price,
  });
  const { data: payment, error: paymentError } = await auth.supabase
    .from("booking_payments")
    .insert({
      amount: remainingAmount,
      booking_id: parsed.data.bookingId,
      created_by: auth.user.id,
      currency: booking.services.currency,
      method: parsed.data.method,
      note: parsed.data.note ?? null,
      paid_at: paidAt,
      payment_scope: paymentScope,
      status: "paid",
      tenant_id: auth.tenantId,
    })
    .select("id")
    .single();

  if (paymentError || !payment) {
    return { error: "Platbu se nepodařilo zaevidovat." };
  }

  await safePostCommit(async () => {
    if (!booking.deposit_paid && booking.deposit_amount > 0 && remainingAmount >= booking.deposit_amount) {
      await auth.supabase
        .from("bookings")
        .update({
          deposit_paid: true,
          deposit_paid_at: paidAt,
          updated_at: paidAt,
        })
        .eq("tenant_id", auth.tenantId)
        .eq("id", parsed.data.bookingId)
        .eq("deposit_paid", false);
    }
  }, "pos deposit update");

  await safePostCommit(async () => {
    if (booking.status !== "completed") {
      await auth.supabase
        .from("bookings")
        .update({
          status: "completed",
          updated_at: paidAt,
        })
        .eq("tenant_id", auth.tenantId)
        .eq("id", parsed.data.bookingId)
        .in("status", ["pending", "confirmed"]);
    }
  }, "pos booking complete");

  await safePostCommit(async () => {
    await auth.supabase.from("booking_events").insert({
      actor_type: "owner",
      actor_user_id: auth.user.id,
      booking_id: parsed.data.bookingId,
      event_type: "payment_recorded",
      metadata: {
        amount: remainingAmount,
        currency: booking.services.currency,
        method: parsed.data.method,
        payment_id: payment.id,
        payment_scope: paymentScope,
        source: "pos",
      },
      tenant_id: auth.tenantId,
    });
  }, "pos payment event");

  revalidatePath("/pos");
  revalidatePath("/payments");
  revalidatePath("/reports");
  revalidatePath("/calendar");

  return { success: "Platba byla zaevidována a rezervace dokončena." };
}
