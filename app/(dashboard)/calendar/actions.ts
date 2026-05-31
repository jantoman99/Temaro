"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createBookingSelfServiceToken, revokeBookingSelfServiceTokens } from "@/lib/booking/self-service";
import { requireOwner } from "@/lib/auth/require-owner";
import { findMatchingClient } from "@/lib/clients/find-matching-client";
import {
  scheduleBookingReminder,
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
  sendBookingReviewRequestEmail,
  sendBookingRescheduleEmail,
  skipPendingBookingReminders,
} from "@/lib/email/booking-confirmation";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeTimeZone, localDatetimeToUtcIso } from "@/lib/time-zone";
import { safePostCommit } from "@/lib/utils/post-commit";
import {
  bookingIdSchema,
  cancelBookingSchema,
  createBookingSchema,
  updateBookingSchema,
} from "@/lib/validations/bookings";
import { recordBookingPaymentSchema } from "@/lib/validations/payments";
import type { Database, Json } from "@/types/database";

type BookingActionState = {
  error?: string;
  success?: string;
};

type BookingEventType = Database["public"]["Tables"]["booking_events"]["Row"]["event_type"];

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getSafeDashboardRedirect(value: string, fallback: string) {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return fallback;
  }

  return value;
}

async function getTenantTimeZone(
  auth: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>,
) {
  const { data: tenant, error } = await auth.supabase
    .from("tenants")
    .select("timezone")
    .eq("id", auth.tenantId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !tenant) {
    return null;
  }

  return getSafeTimeZone(tenant?.timezone);
}

function toIsoDatetime(value: string, timeZone: string) {
  return localDatetimeToUtcIso(value, timeZone);
}

async function getBookingNotificationDetails(
  auth: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>,
  bookingId: string,
) {
  const { data: details } = await auth.supabase
    .from("bookings")
    .select(
      "id, tenant_id, starts_at, ends_at, cancellation_reason, clients!bookings_client_tenant_fkey(id, full_name, email, phone), services(name), staff(name), tenants(name, timezone, confirmation_message, reminder_message, cancellation_message, review_url)",
    )
    .eq("tenant_id", auth.tenantId)
    .eq("id", bookingId)
    .single();

  if (!details) {
    return null;
  }

  return {
    bookingId: details.id,
    cancellationReason: details.cancellation_reason ?? null,
    clientEmail: details.clients?.email ?? null,
    clientId: details.clients?.id ?? null,
    clientName: details.clients?.full_name ?? "Walk-in",
    clientPhone: details.clients?.phone ?? null,
    endsAt: details.ends_at,
    manageUrl: null,
    serviceName: details.services?.name ?? "Služba",
    staffName: details.staff?.name ?? "Poskytovatel",
    startsAt: details.starts_at,
    tenantId: details.tenant_id,
    tenantName: details.tenants?.name ?? "Podnik",
    timeZone: details.tenants?.timezone ?? null,
    confirmationMessage: details.tenants?.confirmation_message ?? null,
    reminderMessage: details.tenants?.reminder_message ?? null,
    cancellationMessage: details.tenants?.cancellation_message ?? null,
    reviewUrl: details.tenants?.review_url ?? null,
  };
}

async function attachManageUrlToBookingNotification(
  auth: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>,
  notificationDetails: NonNullable<Awaited<ReturnType<typeof getBookingNotificationDetails>>>,
) {
  if (!notificationDetails.clientEmail) {
    return notificationDetails;
  }

  if (!hasSupabaseAdminEnv()) {
    return notificationDetails;
  }

  try {
    const token = await createBookingSelfServiceToken(createAdminClient(), {
      bookingId: notificationDetails.bookingId,
      tenantId: notificationDetails.tenantId,
    });

    return {
      ...notificationDetails,
      manageUrl: token.url,
    };
  } catch {
    return notificationDetails;
  }
}

async function logBookingEvent(
  auth: Exclude<Awaited<ReturnType<typeof requireOwner>>, { error: "Unauthorized" | "Forbidden" }>,
  bookingId: string,
  eventType: BookingEventType,
  metadata: Json = {},
) {
  await auth.supabase.from("booking_events").insert({
    tenant_id: auth.tenantId,
    booking_id: bookingId,
    actor_user_id: auth.user.id,
    actor_type: "owner",
    event_type: eventType,
    metadata,
  });
}

export async function createManualBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const timeZone = await getTenantTimeZone(auth);

  if (!timeZone) {
    return { error: "Timezone podniku se nepodařilo ověřit." };
  }

  const parsed = createBookingSchema.safeParse({
    clientId: getStringValue(formData, "clientId"),
    clientEmail: getStringValue(formData, "clientEmail"),
    clientFullName: getStringValue(formData, "clientFullName"),
    clientPhone: getStringValue(formData, "clientPhone"),
    staffId: getStringValue(formData, "staffId"),
    serviceId: getStringValue(formData, "serviceId"),
    startsAt: toIsoDatetime(getStringValue(formData, "startsAt"), timeZone),
    sendNotification: formData.has("sendNotification") ? getStringValue(formData, "sendNotification") : false,
    notes: getStringValue(formData, "notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná rezervace." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: rezervace by se tady uložila do databáze." };
  }

  let clientId = parsed.data.clientId;

  if (!clientId && parsed.data.clientFullName) {
    let existingClient: Awaited<ReturnType<typeof findMatchingClient>>;

    try {
      existingClient = await findMatchingClient(auth.supabase, auth.tenantId, {
        email: parsed.data.clientEmail,
        phone: parsed.data.clientPhone,
      });
    } catch {
      return { error: "Existujícího klienta se nepodařilo ověřit." };
    }

    if (existingClient) {
      if (existingClient.is_blacklisted) {
        return { error: "Klienta nelze použít pro rezervaci." };
      }

      const { data: updatedClient, error: updateClientError } = await auth.supabase
        .from("clients")
        .update({
          email: parsed.data.clientEmail ?? existingClient.email,
          full_name: parsed.data.clientFullName,
          phone: parsed.data.clientPhone ?? existingClient.phone,
        })
        .eq("tenant_id", auth.tenantId)
        .eq("id", existingClient.id)
        .is("deleted_at", null)
        .select("id")
        .maybeSingle();

      if (updateClientError || !updatedClient) {
        return { error: "Existujícího klienta se nepodařilo použít." };
      }

      clientId = updatedClient.id;
    } else {
      const { data: createdClient, error: clientError } = await auth.supabase
        .from("clients")
        .insert({
          tenant_id: auth.tenantId,
          email: parsed.data.clientEmail ?? null,
          full_name: parsed.data.clientFullName,
          phone: parsed.data.clientPhone ?? null,
        })
        .select("id")
        .single();

      if (clientError || !createdClient) {
        return { error: "Nového klienta se nepodařilo vytvořit." };
      }

      clientId = createdClient.id;
    }
  }

  const { data: booking, error } = await auth.supabase.rpc("create_booking", {
    p_tenant_id: auth.tenantId,
    p_client_id: clientId,
    p_staff_id: parsed.data.staffId,
    p_service_id: parsed.data.serviceId,
    p_starts_at: parsed.data.startsAt,
    p_notes: parsed.data.notes ?? null,
    p_source: "manual",
  });

  if (error) {
    return { error: "Rezervaci se nepodařilo vytvořit. Termín může být obsazený." };
  }

  if (!booking) {
    return { error: "Rezervaci se nepodařilo vytvořit. Termín může být obsazený." };
  }

  await safePostCommit(async () => {
    await logBookingEvent(auth, booking.id, "created", { source: "manual" });
  }, "manual booking event insert");

  await safePostCommit(async () => {
    const notificationDetails = await getBookingNotificationDetails(auth, booking.id);

    if (notificationDetails && parsed.data.sendNotification) {
      const notificationWithManageUrl = await attachManageUrlToBookingNotification(
        auth,
        notificationDetails,
      );

      await sendBookingConfirmationEmail(auth.supabase, notificationWithManageUrl);
      await scheduleBookingReminder(auth.supabase, notificationWithManageUrl);
    }
  }, "manual booking notification");

  await safePostCommit(() => {
    revalidatePath("/calendar");
  }, "manual booking revalidate");

  redirect(getSafeDashboardRedirect(getStringValue(formData, "returnTo"), "/calendar"));
}

export async function completeBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  return updateBookingStatus(formData, "completed", "Demo režim: rezervace by se tady dokončila.");
}

export async function confirmBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = bookingIdSchema.safeParse({
    bookingId: getStringValue(formData, "bookingId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná rezervace." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: rezervace by se tady potvrdila." };
  }

  const { data: confirmedBooking, error } = await auth.supabase
    .from("bookings")
    .update({
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.bookingId)
    .eq("status", "pending")
    .select("id")
    .maybeSingle();

  if (error || !confirmedBooking) {
    return { error: "Rezervaci se nepodařilo potvrdit. Možná už změnila stav." };
  }

  await safePostCommit(async () => {
    await logBookingEvent(auth, parsed.data.bookingId, "confirmed");
  }, "booking confirmation event insert");

  await safePostCommit(async () => {
    const notificationDetails = await getBookingNotificationDetails(auth, parsed.data.bookingId);

    if (notificationDetails) {
      const notificationWithManageUrl = await attachManageUrlToBookingNotification(
        auth,
        notificationDetails,
      );

      await sendBookingConfirmationEmail(auth.supabase, notificationWithManageUrl);
      await scheduleBookingReminder(auth.supabase, notificationWithManageUrl);
    }
  }, "booking confirmation notification");

  await safePostCommit(() => {
    revalidatePath("/calendar");
  }, "booking confirmation revalidate");

  return { success: "Rezervace byla potvrzena." };
}

export async function cancelBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  return updateBookingStatus(formData, "cancelled", "Demo režim: rezervace by se tady zrušila.");
}

export async function updateBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const timeZone = await getTenantTimeZone(auth);

  if (!timeZone) {
    return { error: "Timezone podniku se nepodařilo ověřit." };
  }

  const parsed = updateBookingSchema.safeParse({
    bookingId: getStringValue(formData, "bookingId"),
    staffId: getStringValue(formData, "staffId"),
    serviceId: getStringValue(formData, "serviceId"),
    startsAt: toIsoDatetime(getStringValue(formData, "startsAt"), timeZone),
    notes: getStringValue(formData, "notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná úprava rezervace." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: rezervace by se tady upravila." };
  }

  const { data: updatedBooking, error } = await auth.supabase.rpc("update_booking", {
    p_tenant_id: auth.tenantId,
    p_booking_id: parsed.data.bookingId,
    p_staff_id: parsed.data.staffId,
    p_service_id: parsed.data.serviceId,
    p_starts_at: parsed.data.startsAt,
    p_notes: parsed.data.notes ?? null,
  });

  if (error) {
    return { error: "Rezervaci se nepodařilo upravit. Termín může být obsazený." };
  }

  if (!updatedBooking) {
    return { error: "Rezervaci se nepodařilo upravit. Termín může být obsazený." };
  }

  await safePostCommit(async () => {
    await logBookingEvent(auth, parsed.data.bookingId, "rescheduled", {
      new_service_id: parsed.data.serviceId,
      new_staff_id: parsed.data.staffId,
      new_starts_at: parsed.data.startsAt,
    });
  }, "booking update event insert");

  await safePostCommit(async () => {
    await skipPendingBookingReminders(auth.supabase, {
      bookingId: parsed.data.bookingId,
      reason: "Booking rescheduled",
      tenantId: auth.tenantId,
    });
  }, "booking update reminder skip");

  await safePostCommit(async () => {
    const notificationDetails = await getBookingNotificationDetails(auth, parsed.data.bookingId);

    if (notificationDetails) {
      const notificationWithManageUrl = await attachManageUrlToBookingNotification(
        auth,
        notificationDetails,
      );

      await sendBookingRescheduleEmail(auth.supabase, notificationWithManageUrl);
      await scheduleBookingReminder(auth.supabase, notificationWithManageUrl);
    }
  }, "booking update notification");

  await safePostCommit(() => {
    revalidatePath("/calendar");
  }, "booking update revalidate");

  return { success: "Rezervace byla upravena." };
}

export async function markNoShowAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = bookingIdSchema.safeParse({
    bookingId: getStringValue(formData, "bookingId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná rezervace." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: rezervace by se tady označila jako no-show." };
  }

  const { data: booking, error: bookingError } = await auth.supabase
    .from("bookings")
    .select("client_id")
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.bookingId)
    .maybeSingle();

  if (bookingError) {
    return { error: "Rezervaci se nepodařilo ověřit." };
  }

  if (!booking) {
    return { error: "Rezervace už není dostupná." };
  }

  const { data: updatedBooking, error } = await auth.supabase
    .from("bookings")
    .update({
      status: "no_show",
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.bookingId)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle();

  if (error || !updatedBooking) {
    return { error: "Rezervaci se nepodařilo označit jako no-show. Možná už změnila stav." };
  }

  await safePostCommit(async () => {
    await logBookingEvent(auth, parsed.data.bookingId, "no_show");
  }, "booking no-show event insert");

  await safePostCommit(async () => {
    await revokeBookingSelfServiceTokens(auth.supabase, {
      bookingId: parsed.data.bookingId,
      tenantId: auth.tenantId,
    });
  }, "booking no-show token revoke");

  await safePostCommit(async () => {
    await skipPendingBookingReminders(auth.supabase, {
      bookingId: parsed.data.bookingId,
      reason: "Booking no-show",
      tenantId: auth.tenantId,
    });
  }, "booking no-show reminder skip");

  if (booking?.client_id) {
    const clientId = booking.client_id;

    await safePostCommit(async () => {
      const { data: client } = await auth.supabase
        .from("clients")
        .select("no_show_count")
        .eq("tenant_id", auth.tenantId)
        .eq("id", clientId)
        .maybeSingle();

      await auth.supabase
        .from("clients")
        .update({
          no_show_count: (client?.no_show_count ?? 0) + 1,
        })
        .eq("tenant_id", auth.tenantId)
        .eq("id", clientId);
    }, "booking no-show client counter update");
  }

  await safePostCommit(() => {
    revalidatePath("/calendar");
    revalidatePath("/clients");
    if (booking?.client_id) {
      revalidatePath(`/clients/${booking.client_id}`);
    }
  }, "booking no-show revalidate");

  return { success: "Rezervace byla označena jako no-show." };
}

export async function recordBookingPaymentAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  const parsed = recordBookingPaymentSchema.safeParse({
    amount: getStringValue(formData, "amount"),
    bookingId: getStringValue(formData, "bookingId"),
    currency: getStringValue(formData, "currency") || "CZK",
    method: getStringValue(formData, "method"),
    note: getStringValue(formData, "note"),
    paymentScope: getStringValue(formData, "paymentScope") || "full",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Platbu se nepodařilo ověřit." };
  }

  if (!hasSupabaseEnv()) {
    return { success: "Demo režim: platba by se tady zaevidovala." };
  }

  const { data: booking, error: bookingError } = await auth.supabase
    .from("bookings")
    .select("id, deposit_amount, deposit_paid, services(currency)")
    .eq("tenant_id", auth.tenantId)
    .eq("id", parsed.data.bookingId)
    .maybeSingle();

  if (bookingError) {
    return { error: "Rezervaci se nepodařilo ověřit." };
  }

  if (!booking) {
    return { error: "Rezervace už není dostupná." };
  }

  const currency = booking.services?.currency ?? parsed.data.currency;
  const paidAt = new Date().toISOString();
  const { data: payment, error } = await auth.supabase
    .from("booking_payments")
    .insert({
      tenant_id: auth.tenantId,
      booking_id: parsed.data.bookingId,
      amount: parsed.data.amount,
      currency,
      method: parsed.data.method,
      note: parsed.data.note ?? null,
      paid_at: paidAt,
      payment_scope: parsed.data.paymentScope,
      status: "paid",
      created_by: auth.user.id,
    })
    .select("id")
    .single();

  if (error || !payment) {
    return { error: "Platbu se nepodařilo zaevidovat." };
  }

  if (
    parsed.data.paymentScope === "deposit" &&
    !booking.deposit_paid &&
    booking.deposit_amount > 0 &&
    parsed.data.amount >= booking.deposit_amount
  ) {
    await safePostCommit(async () => {
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
    }, "booking deposit paid update");
  }

  await safePostCommit(async () => {
    await logBookingEvent(auth, parsed.data.bookingId, "payment_recorded", {
      amount: parsed.data.amount,
      currency,
      method: parsed.data.method,
      payment_id: payment.id,
      payment_scope: parsed.data.paymentScope,
    });
  }, "booking payment event insert");

  await safePostCommit(() => {
    revalidatePath("/calendar");
  }, "booking payment revalidate");

  return { success: "Platba byla zaevidována." };
}

async function updateBookingStatus(
  formData: FormData,
  status: "completed" | "cancelled",
  demoSuccessMessage: string,
): Promise<BookingActionState> {
  const auth = await requireOwner();

  if ("error" in auth) {
    return { error: auth.error === "Unauthorized" ? "Přihlaste se znovu." : "Nemáte oprávnění." };
  }

  let bookingId = "";
  let cancellationReason: string | null = null;

  if (status === "cancelled") {
    const parsed = cancelBookingSchema.safeParse({
      bookingId: getStringValue(formData, "bookingId"),
      cancellationReason: getStringValue(formData, "cancellationReason"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Neplatné zrušení rezervace." };
    }

    bookingId = parsed.data.bookingId;
    cancellationReason = parsed.data.cancellationReason ?? null;
  } else {
    const parsed = bookingIdSchema.safeParse({
      bookingId: getStringValue(formData, "bookingId"),
    });

    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Neplatná rezervace." };
    }

    bookingId = parsed.data.bookingId;
  }

  if (!hasSupabaseEnv()) {
    return { success: demoSuccessMessage };
  }

  const { data: existingBooking, error: existingBookingError } = await auth.supabase
    .from("bookings")
    .select("id, status")
    .eq("tenant_id", auth.tenantId)
    .eq("id", bookingId)
    .maybeSingle();

  if (existingBookingError) {
    return { error: "Rezervaci se nepodařilo ověřit." };
  }

  if (!existingBooking) {
    return { error: "Rezervace už není dostupná." };
  }

  const { data: updatedBooking, error } = await auth.supabase
    .from("bookings")
    .update({
      status,
      cancellation_reason: status === "cancelled" ? cancellationReason ?? "Cancelled by owner" : null,
      cancelled_at: status === "cancelled" ? new Date().toISOString() : null,
      cancelled_by: status === "cancelled" ? auth.user.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq("tenant_id", auth.tenantId)
    .eq("id", bookingId)
    .in("status", ["pending", "confirmed"])
    .select("id")
    .maybeSingle();

  if (error || !updatedBooking) {
    return {
      error:
        status === "completed"
          ? "Rezervaci se nepodařilo dokončit. Možná už změnila stav."
          : "Rezervaci se nepodařilo zrušit. Možná už změnila stav.",
    };
  }

  const eventType = status === "completed" ? "completed" : existingBooking?.status === "pending" ? "rejected" : "cancelled";
  await safePostCommit(async () => {
    await logBookingEvent(auth, bookingId, eventType, {
      cancellation_reason: cancellationReason,
    });
  }, "booking status event insert");

  if (status === "cancelled" && existingBooking?.status !== "cancelled") {
    await safePostCommit(async () => {
      await skipPendingBookingReminders(auth.supabase, {
        bookingId,
        reason: "Booking cancelled",
        tenantId: auth.tenantId,
      });
    }, "booking cancellation reminder skip");

    await safePostCommit(async () => {
      await revokeBookingSelfServiceTokens(auth.supabase, {
        bookingId,
        tenantId: auth.tenantId,
      });
    }, "booking cancellation token revoke");

    await safePostCommit(async () => {
      const notificationDetails = await getBookingNotificationDetails(auth, bookingId);

      if (notificationDetails) {
        await sendBookingCancellationEmail(auth.supabase, {
          ...notificationDetails,
          cancellationReason: cancellationReason ?? notificationDetails.cancellationReason,
        });
      }
    }, "booking cancellation email");
  }

  if (status === "completed") {
    await safePostCommit(async () => {
      await revokeBookingSelfServiceTokens(auth.supabase, {
        bookingId,
        tenantId: auth.tenantId,
      });
    }, "booking completion token revoke");

    await safePostCommit(async () => {
      await skipPendingBookingReminders(auth.supabase, {
        bookingId,
        reason: "Booking completed",
        tenantId: auth.tenantId,
      });
    }, "booking completion reminder skip");

    await safePostCommit(async () => {
      const notificationDetails = await getBookingNotificationDetails(auth, bookingId);

      if (notificationDetails?.reviewUrl) {
        await sendBookingReviewRequestEmail(auth.supabase, notificationDetails);
      }
    }, "booking review request email");
  }

  await safePostCommit(() => {
    revalidatePath("/calendar");
  }, "booking status revalidate");

  return {
    success: status === "completed" ? "Rezervace byla dokončena." : "Rezervace byla zrušena.",
  };
}
