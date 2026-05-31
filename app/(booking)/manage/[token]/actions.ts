"use server";

import { revalidatePath } from "next/cache";

import {
  getBookingBySelfServiceToken,
  getSelfServiceCancellationState,
  revokeBookingSelfServiceTokens,
} from "@/lib/booking/self-service";
import {
  sendBookingRescheduleEmail,
  scheduleBookingReminder,
  sendBookingCancellationEmail,
  skipPendingBookingReminders,
} from "@/lib/email/booking-confirmation";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { safePostCommit } from "@/lib/utils/post-commit";
import { bookingManageTokenSchema, rescheduleManagedBookingSchema } from "@/lib/validations/bookings";
import { getBookingManageUrl } from "@/lib/booking/self-service";

type ManageBookingActionState = {
  error?: string;
  success?: string;
};

function isSameRescheduleTarget(currentStartsAt: string, nextStartsAt: string, currentStaffId: string, nextStaffId: string) {
  return (
    currentStaffId === nextStaffId &&
    new Date(currentStartsAt).getTime() === new Date(nextStartsAt).getTime()
  );
}

function getRescheduleErrorMessage(error: { code?: string } | null) {
  if (!error?.code) {
    return "Nový termín už není volný. Vyberte prosím jiný.";
  }

  if (error.code === "P0002") {
    return "Tuto rezervaci už nejde online změnit.";
  }

  if (error.code === "22023") {
    return "Vybraný termín nebo poskytovatel už není platný. Vyberte prosím jiný.";
  }

  return "Nový termín už není volný. Vyberte prosím jiný.";
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

export async function cancelManagedBookingAction(
  _previousState: ManageBookingActionState,
  formData: FormData,
): Promise<ManageBookingActionState> {
  if (!hasSupabaseAdminEnv()) {
    return { error: "Správa rezervace není v demo režimu dostupná." };
  }

  const parsed = bookingManageTokenSchema.safeParse({
    token: getStringValue(formData, "token"),
  });

  if (!parsed.success) {
    return { error: "Odkaz pro správu rezervace není platný." };
  }

  const supabase = createAdminClient();
  let booking: Awaited<ReturnType<typeof getBookingBySelfServiceToken>>;

  try {
    booking = await getBookingBySelfServiceToken(supabase, parsed.data.token);
  } catch {
    return { error: "Rezervaci se nepodařilo ověřit. Zkuste to prosím znovu." };
  }

  if (!booking) {
    return { error: "Odkaz pro správu rezervace už není platný." };
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return { error: "Tuto rezervaci už není možné zrušit." };
  }

  const cancellationState = getSelfServiceCancellationState(booking);

  if (!cancellationState.canCancel) {
    return { error: cancellationState.reason ?? "Tuto rezervaci už nejde online zrušit." };
  }

  const timestamp = new Date().toISOString();
  const { data: cancelledBooking, error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: "Cancelled by client",
      cancelled_at: timestamp,
      cancelled_by: null,
      updated_at: timestamp,
    })
    .eq("tenant_id", booking.tenant_id)
    .eq("id", booking.id)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle();

  if (error || !cancelledBooking) {
    return { error: "Rezervaci se nepodařilo zrušit. Zkuste to prosím znovu." };
  }

  await safePostCommit(async () => {
    await supabase.from("booking_events").insert({
      tenant_id: booking.tenant_id,
      booking_id: booking.id,
      actor_user_id: null,
      actor_type: "client",
      event_type: "cancelled",
      metadata: {
        cancellation_notice_hours: cancellationState.noticeHours,
        cancellation_reason: "Cancelled by client",
        deposit_amount: cancellationState.depositAmount,
        deposit_paid: cancellationState.depositPaid,
        hours_until_start: cancellationState.hoursUntilStart,
      },
    });
  }, "managed booking cancellation event insert");

  await safePostCommit(async () => {
    await skipPendingBookingReminders(supabase, {
      bookingId: booking.id,
      reason: "Booking cancelled by client",
      tenantId: booking.tenant_id,
    });
  }, "managed booking cancellation reminder skip");

  await safePostCommit(async () => {
    await revokeBookingSelfServiceTokens(supabase, {
      bookingId: booking.id,
      tenantId: booking.tenant_id,
    });
  }, "managed booking cancellation token revoke");

  await safePostCommit(async () => {
    await sendBookingCancellationEmail(supabase, {
      bookingId: booking.id,
      clientEmail: booking.clients?.email ?? null,
      clientId: booking.clients?.id ?? null,
      clientName: booking.clients?.full_name ?? "Klient",
      endsAt: booking.ends_at,
      manageUrl: null,
      serviceName: booking.services?.name ?? "Služba",
      staffName: booking.staff?.name ?? "Poskytovatel",
      startsAt: booking.starts_at,
      tenantId: booking.tenant_id,
      tenantName: booking.tenants?.name ?? "Podnik",
      timeZone: booking.tenants?.timezone ?? null,
      cancellationMessage: booking.tenants?.cancellation_message ?? null,
    });
  }, "managed booking cancellation email");

  await safePostCommit(() => {
    revalidatePath(`/manage/${parsed.data.token}`);
  }, "managed booking cancellation revalidate");

  return { success: "Rezervace byla zrušena." };
}

export async function rescheduleManagedBookingAction(
  _previousState: ManageBookingActionState,
  formData: FormData,
): Promise<ManageBookingActionState> {
  if (!hasSupabaseAdminEnv()) {
    return { error: "Správa rezervace není v demo režimu dostupná." };
  }

  const parsed = rescheduleManagedBookingSchema.safeParse({
    token: getStringValue(formData, "token"),
    staffId: getStringValue(formData, "staffId"),
    startsAt: getStringValue(formData, "startsAt"),
  });

  if (!parsed.success) {
    return { error: "Nový termín není platný." };
  }

  const supabase = createAdminClient();
  let booking: Awaited<ReturnType<typeof getBookingBySelfServiceToken>>;

  try {
    booking = await getBookingBySelfServiceToken(supabase, parsed.data.token);
  } catch {
    return { error: "Rezervaci se nepodařilo ověřit. Zkuste to prosím znovu." };
  }

  if (!booking) {
    return { error: "Odkaz pro správu rezervace už není platný." };
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return { error: "Tuto rezervaci už není možné přesunout." };
  }

  const cancellationState = getSelfServiceCancellationState(booking);

  if (!cancellationState.canCancel) {
    return { error: cancellationState.reason ?? "Tuto rezervaci už nejde online změnit." };
  }

  if (
    isSameRescheduleTarget(
      booking.starts_at,
      parsed.data.startsAt,
      booking.staff_id,
      parsed.data.staffId,
    )
  ) {
    return { error: "Vyberte prosím jiný termín." };
  }

  const { data: rescheduledBooking, error } = await supabase.rpc("reschedule_booking_self_service", {
    p_booking_id: booking.id,
    p_service_id: booking.service_id,
    p_staff_id: parsed.data.staffId,
    p_starts_at: parsed.data.startsAt,
    p_tenant_id: booking.tenant_id,
  });

  if (error) {
    return { error: getRescheduleErrorMessage(error) };
  }

  if (!rescheduledBooking) {
    return { error: "Nový termín už není volný. Vyberte prosím jiný." };
  }

  await safePostCommit(async () => {
    await supabase.from("booking_events").insert({
      tenant_id: booking.tenant_id,
      booking_id: booking.id,
      actor_user_id: null,
      actor_type: "client",
      event_type: "rescheduled",
      metadata: {
        new_staff_id: parsed.data.staffId,
        new_starts_at: parsed.data.startsAt,
      },
    });
  }, "managed booking reschedule event insert");

  await safePostCommit(async () => {
    await skipPendingBookingReminders(supabase, {
      bookingId: booking.id,
      reason: "Booking rescheduled by client",
      tenantId: booking.tenant_id,
    });
  }, "managed booking reschedule reminder skip");

  let updatedBooking: Awaited<ReturnType<typeof getBookingBySelfServiceToken>>;

  try {
    updatedBooking = await getBookingBySelfServiceToken(supabase, parsed.data.token);
  } catch {
    updatedBooking = null;
  }

  if (updatedBooking) {
    await safePostCommit(async () => {
      await sendBookingRescheduleEmail(supabase, {
        bookingId: updatedBooking.id,
        clientEmail: updatedBooking.clients?.email ?? null,
        clientId: updatedBooking.clients?.id ?? null,
        clientName: updatedBooking.clients?.full_name ?? "Klient",
        clientPhone: updatedBooking.clients?.phone ?? null,
        endsAt: updatedBooking.ends_at,
        manageUrl: getBookingManageUrl(parsed.data.token),
        serviceName: updatedBooking.services?.name ?? "Služba",
        staffName: updatedBooking.staff?.name ?? "Poskytovatel",
        startsAt: updatedBooking.starts_at,
        tenantId: updatedBooking.tenant_id,
        tenantName: updatedBooking.tenants?.name ?? "Podnik",
        timeZone: updatedBooking.tenants?.timezone ?? null,
        confirmationMessage: updatedBooking.tenants?.confirmation_message ?? null,
        reminderMessage: updatedBooking.tenants?.reminder_message ?? null,
      });
    }, "managed booking reschedule email");

    await safePostCommit(async () => {
      await scheduleBookingReminder(supabase, {
        bookingId: updatedBooking.id,
        clientEmail: updatedBooking.clients?.email ?? null,
        clientId: updatedBooking.clients?.id ?? null,
        clientName: updatedBooking.clients?.full_name ?? "Klient",
        clientPhone: updatedBooking.clients?.phone ?? null,
        endsAt: updatedBooking.ends_at,
        manageUrl: getBookingManageUrl(parsed.data.token),
        serviceName: updatedBooking.services?.name ?? "Služba",
        staffName: updatedBooking.staff?.name ?? "Poskytovatel",
        startsAt: updatedBooking.starts_at,
        tenantId: updatedBooking.tenant_id,
        tenantName: updatedBooking.tenants?.name ?? "Podnik",
        timeZone: updatedBooking.tenants?.timezone ?? null,
        confirmationMessage: updatedBooking.tenants?.confirmation_message ?? null,
        reminderMessage: updatedBooking.tenants?.reminder_message ?? null,
      });
    }, "managed booking reschedule reminder schedule");
  }

  await safePostCommit(() => {
    revalidatePath(`/manage/${parsed.data.token}`);
  }, "managed booking reschedule revalidate");

  return { success: "Rezervace byla přesunuta." };
}
