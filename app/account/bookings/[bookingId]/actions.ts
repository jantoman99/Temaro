"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createBookingSelfServiceToken,
  getSelfServiceCancellationState,
  revokeBookingSelfServiceTokens,
} from "@/lib/booking/self-service";
import {
  scheduleBookingReminder,
  sendBookingCancellationEmail,
  sendBookingRescheduleEmail,
  skipPendingBookingReminders,
} from "@/lib/email/booking-confirmation";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { safePostCommit } from "@/lib/utils/post-commit";
import { z } from "zod";

const cancelCustomerBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

const rescheduleCustomerBookingSchema = z.object({
  bookingId: z.string().uuid(),
  slotChoice: z.string().min(1),
}).transform((data, context) => {
  const [staffId, startsAt] = data.slotChoice.split("|");
  const parsed = z.object({
    bookingId: z.string().uuid(),
    staffId: z.string().uuid(),
    startsAt: z.string().datetime(),
  }).safeParse({
    bookingId: data.bookingId,
    staffId,
    startsAt,
  });

  if (!parsed.success) {
    context.addIssue({
      code: "custom",
      message: "Neplatný termín.",
    });

    return z.NEVER;
  }

  return parsed.data;
});

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getRedirectUrl(bookingId: string, status: "cancelled" | "error" | "forbidden" | "too-late") {
  return `/account/bookings/${bookingId}?cancellation=${status}`;
}

function getRescheduleRedirectUrl(bookingId: string, status: "success" | "error" | "forbidden" | "same" | "too-late") {
  return `/account/bookings/${bookingId}?reschedule=${status}`;
}

function getRescheduleErrorCode(error: { code?: string } | null) {
  if (error?.code === "P0002") return "forbidden";
  if (error?.code === "22023") return "error";

  return "error";
}

export async function cancelCustomerBookingAction(formData: FormData) {
  const parsed = cancelCustomerBookingSchema.safeParse({
    bookingId: getStringValue(formData, "bookingId"),
  });

  if (!parsed.success) {
    redirect("/account");
  }

  const bookingId = parsed.data.bookingId;

  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    redirect(getRedirectUrl(bookingId, "error"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login");
  }

  const userEmail = user.email;
  const admin = createAdminClient();
  const normalizedEmail = userEmail.trim().toLowerCase();
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id, full_name, email, phone")
    .ilike("email", normalizedEmail)
    .is("deleted_at", null)
    .limit(100);

  if (clientsError || !clients?.length) {
    redirect(getRedirectUrl(bookingId, "forbidden"));
  }

  const clientIds = clients.map((client) => client.id);
  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .select("id, tenant_id, client_id, starts_at, ends_at, status, deposit_amount, deposit_paid, clients!bookings_client_tenant_fkey(id, full_name, email), services(name), staff(name), tenants(name, timezone, cancellation_notice_hours, cancellation_message)")
    .eq("id", bookingId)
    .in("client_id", clientIds)
    .maybeSingle();

  if (bookingError || !booking) {
    redirect(getRedirectUrl(bookingId, "forbidden"));
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    redirect(getRedirectUrl(bookingId, "error"));
  }

  const cancellationState = getSelfServiceCancellationState(booking);

  if (!cancellationState.canCancel) {
    redirect(getRedirectUrl(bookingId, "too-late"));
  }

  const timestamp = new Date().toISOString();
  const { data: cancelledBooking, error: cancelError } = await admin
    .from("bookings")
    .update({
      status: "cancelled",
      cancellation_reason: "Cancelled by customer account",
      cancelled_at: timestamp,
      cancelled_by: null,
      updated_at: timestamp,
    })
    .eq("tenant_id", booking.tenant_id)
    .eq("id", booking.id)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle();

  if (cancelError || !cancelledBooking) {
    redirect(getRedirectUrl(bookingId, "error"));
  }

  await safePostCommit(async () => {
    await admin.from("booking_events").insert({
      tenant_id: booking.tenant_id,
      booking_id: booking.id,
      actor_user_id: null,
      actor_type: "client",
      event_type: "cancelled",
      metadata: {
        cancellation_notice_hours: cancellationState.noticeHours,
        cancellation_reason: "Cancelled by customer account",
        deposit_amount: cancellationState.depositAmount,
        deposit_paid: cancellationState.depositPaid,
        hours_until_start: cancellationState.hoursUntilStart,
        source: "customer_account",
      },
    });
  }, "customer account booking cancellation event insert");

  await safePostCommit(async () => {
    await skipPendingBookingReminders(admin, {
      bookingId: booking.id,
      reason: "Booking cancelled by customer account",
      tenantId: booking.tenant_id,
    });
  }, "customer account booking cancellation reminder skip");

  await safePostCommit(async () => {
    await revokeBookingSelfServiceTokens(admin, {
      bookingId: booking.id,
      tenantId: booking.tenant_id,
    });
  }, "customer account booking cancellation token revoke");

  await safePostCommit(async () => {
    await sendBookingCancellationEmail(admin, {
      bookingId: booking.id,
      cancellationMessage: booking.tenants?.cancellation_message ?? null,
      clientEmail: booking.clients?.email ?? userEmail,
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
    });
  }, "customer account booking cancellation email");

  await safePostCommit(() => {
    revalidatePath("/account");
    revalidatePath(`/account/bookings/${booking.id}`);
  }, "customer account booking cancellation revalidate");

  redirect(getRedirectUrl(booking.id, "cancelled"));
}

export async function rescheduleCustomerBookingAction(formData: FormData) {
  const parsed = rescheduleCustomerBookingSchema.safeParse({
    bookingId: getStringValue(formData, "bookingId"),
    slotChoice: getStringValue(formData, "slotChoice"),
  });

  if (!parsed.success) {
    redirect("/account");
  }

  const { bookingId, staffId, startsAt } = parsed.data;

  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    redirect(getRescheduleRedirectUrl(bookingId, "error"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/account/login");
  }

  const userEmail = user.email;
  const admin = createAdminClient();
  const normalizedEmail = userEmail.trim().toLowerCase();
  const { data: clients, error: clientsError } = await admin
    .from("clients")
    .select("id, full_name, email, phone")
    .ilike("email", normalizedEmail)
    .is("deleted_at", null)
    .limit(100);

  if (clientsError || !clients?.length) {
    redirect(getRescheduleRedirectUrl(bookingId, "forbidden"));
  }

  const { data: booking, error: bookingError } = await admin
    .from("bookings")
    .select("id, tenant_id, client_id, service_id, staff_id, starts_at, ends_at, status, deposit_amount, deposit_paid, clients!bookings_client_tenant_fkey(id, full_name, email, phone), services(name), staff(name), tenants(name, timezone, cancellation_notice_hours, confirmation_message, reminder_message)")
    .eq("id", bookingId)
    .in("client_id", clients.map((client) => client.id))
    .maybeSingle();

  if (bookingError || !booking) {
    redirect(getRescheduleRedirectUrl(bookingId, "forbidden"));
  }

  if (booking.status !== "pending" && booking.status !== "confirmed") {
    redirect(getRescheduleRedirectUrl(bookingId, "forbidden"));
  }

  const cancellationState = getSelfServiceCancellationState(booking);

  if (!cancellationState.canCancel) {
    redirect(getRescheduleRedirectUrl(bookingId, "too-late"));
  }

  if (booking.staff_id === staffId && new Date(booking.starts_at).getTime() === new Date(startsAt).getTime()) {
    redirect(getRescheduleRedirectUrl(bookingId, "same"));
  }

  const { data: rescheduledBooking, error: rescheduleError } = await admin.rpc("reschedule_booking_self_service", {
    p_booking_id: booking.id,
    p_service_id: booking.service_id,
    p_staff_id: staffId,
    p_starts_at: startsAt,
    p_tenant_id: booking.tenant_id,
  });

  if (rescheduleError || !rescheduledBooking) {
    redirect(getRescheduleRedirectUrl(bookingId, getRescheduleErrorCode(rescheduleError)));
  }

  await safePostCommit(async () => {
    await admin.from("booking_events").insert({
      tenant_id: booking.tenant_id,
      booking_id: booking.id,
      actor_user_id: null,
      actor_type: "client",
      event_type: "rescheduled",
      metadata: {
        new_staff_id: staffId,
        new_starts_at: startsAt,
        old_staff_id: booking.staff_id,
        old_starts_at: booking.starts_at,
        source: "customer_account",
      },
    });
  }, "customer account booking reschedule event insert");

  await safePostCommit(async () => {
    await skipPendingBookingReminders(admin, {
      bookingId: booking.id,
      reason: "Booking rescheduled by customer account",
      tenantId: booking.tenant_id,
    });
  }, "customer account booking reschedule reminder skip");

  let manageUrl: string | null = null;

  await safePostCommit(async () => {
    const token = await createBookingSelfServiceToken(admin, {
      bookingId: booking.id,
      tenantId: booking.tenant_id,
    });
    manageUrl = token.url;
  }, "customer account booking reschedule token refresh");

  const { data: updatedBooking } = await admin
    .from("bookings")
    .select("id, tenant_id, starts_at, ends_at, clients!bookings_client_tenant_fkey(id, full_name, email, phone), services(name), staff(name), tenants(name, timezone, confirmation_message, reminder_message)")
    .eq("tenant_id", booking.tenant_id)
    .eq("id", booking.id)
    .maybeSingle();

  const notificationBooking = updatedBooking ?? booking;

  await safePostCommit(async () => {
    await sendBookingRescheduleEmail(admin, {
      bookingId: notificationBooking.id,
      clientEmail: notificationBooking.clients?.email ?? userEmail,
      clientId: notificationBooking.clients?.id ?? null,
      clientName: notificationBooking.clients?.full_name ?? "Klient",
      clientPhone: notificationBooking.clients?.phone ?? null,
      confirmationMessage: notificationBooking.tenants?.confirmation_message ?? null,
      endsAt: notificationBooking.ends_at,
      manageUrl,
      reminderMessage: notificationBooking.tenants?.reminder_message ?? null,
      serviceName: notificationBooking.services?.name ?? "Služba",
      staffName: notificationBooking.staff?.name ?? "Poskytovatel",
      startsAt: notificationBooking.starts_at,
      tenantId: notificationBooking.tenant_id,
      tenantName: notificationBooking.tenants?.name ?? "Podnik",
      timeZone: notificationBooking.tenants?.timezone ?? null,
    });
  }, "customer account booking reschedule email");

  await safePostCommit(async () => {
    await scheduleBookingReminder(admin, {
      bookingId: notificationBooking.id,
      clientEmail: notificationBooking.clients?.email ?? userEmail,
      clientId: notificationBooking.clients?.id ?? null,
      clientName: notificationBooking.clients?.full_name ?? "Klient",
      clientPhone: notificationBooking.clients?.phone ?? null,
      confirmationMessage: notificationBooking.tenants?.confirmation_message ?? null,
      endsAt: notificationBooking.ends_at,
      manageUrl,
      reminderMessage: notificationBooking.tenants?.reminder_message ?? null,
      serviceName: notificationBooking.services?.name ?? "Služba",
      staffName: notificationBooking.staff?.name ?? "Poskytovatel",
      startsAt: notificationBooking.starts_at,
      tenantId: notificationBooking.tenant_id,
      tenantName: notificationBooking.tenants?.name ?? "Podnik",
      timeZone: notificationBooking.tenants?.timezone ?? null,
    });
  }, "customer account booking reschedule reminder schedule");

  await safePostCommit(() => {
    revalidatePath("/account");
    revalidatePath(`/account/bookings/${booking.id}`);
  }, "customer account booking reschedule revalidate");

  redirect(getRescheduleRedirectUrl(booking.id, "success"));
}
