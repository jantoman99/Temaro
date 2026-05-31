import "server-only";

import { Resend } from "resend";

import { formatDateTimeForDisplay } from "@/lib/date-format";
import { isSmsReminderSchedulingEnabled, normalizeSmsRecipient } from "@/lib/sms/reminders";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type BookingDetails = {
  bookingId: string;
  cancellationMessage?: string | null;
  cancellationReason?: string | null;
  clientEmail: string | null;
  clientId: string | null;
  clientName: string;
  clientPhone?: string | null;
  confirmationMessage?: string | null;
  endsAt: string;
  manageUrl?: string | null;
  reminderMessage?: string | null;
  reviewUrl?: string | null;
  serviceName: string;
  staffName: string;
  startsAt: string;
  tenantId: string;
  tenantName: string;
  timeZone?: string | null;
};

type TypedSupabase = SupabaseClient<Database>;
type NotificationType = Database["public"]["Tables"]["notifications"]["Row"]["type"];

async function updateNotificationSendStatus(
  supabase: TypedSupabase,
  {
    notificationId,
    sendFailed,
    tenantId,
  }: {
    notificationId: string;
    sendFailed: boolean;
    tenantId: string;
  },
) {
  const { data: updatedNotification, error } = await supabase
    .from("notifications")
    .update({
      status: sendFailed ? "failed" : "sent",
      sent_at: sendFailed ? null : new Date().toISOString(),
      error: sendFailed ? "Email provider rejected the message" : null,
    })
    .eq("tenant_id", tenantId)
    .eq("id", notificationId)
    .select("id")
    .maybeSingle();

  if (error || !updatedNotification) {
    throw new Error("Notification status update failed");
  }
}

function createConfirmationText(details: BookingDetails) {
  return [
    `Rezervace potvrzena: ${details.tenantName}`,
    "",
    `Klient: ${details.clientName}`,
    `Služba: ${details.serviceName}`,
    `Poskytovatel: ${details.staffName}`,
    `Začátek: ${formatDateTimeForDisplay(details.startsAt, details.timeZone)}`,
    `Konec: ${formatDateTimeForDisplay(details.endsAt, details.timeZone)}`,
    ...(details.confirmationMessage ? ["", details.confirmationMessage] : []),
    "",
    details.manageUrl ? `Správa rezervace: ${details.manageUrl}` : "Pokud potřebujete termín změnit, kontaktujte podnik přímo.",
  ].join("\n");
}

function createPendingText(details: BookingDetails) {
  return [
    `Rezervace čeká na potvrzení: ${details.tenantName}`,
    "",
    `Klient: ${details.clientName}`,
    `Služba: ${details.serviceName}`,
    `Poskytovatel: ${details.staffName}`,
    `Začátek: ${formatDateTimeForDisplay(details.startsAt, details.timeZone)}`,
    `Konec: ${formatDateTimeForDisplay(details.endsAt, details.timeZone)}`,
    ...(details.confirmationMessage ? ["", details.confirmationMessage] : []),
    "",
    ...(details.manageUrl ? [`Správa rezervace: ${details.manageUrl}`, ""] : []),
    "Podnik rezervaci zkontroluje. Jakmile ji potvrdí, přijde vám další email.",
  ].join("\n");
}

function createCancellationText(details: BookingDetails) {
  return [
    `Rezervace zrušena: ${details.tenantName}`,
    "",
    `Klient: ${details.clientName}`,
    `Služba: ${details.serviceName}`,
    `Poskytovatel: ${details.staffName}`,
    `Původní začátek: ${formatDateTimeForDisplay(details.startsAt, details.timeZone)}`,
    ...(details.cancellationReason ? ["", `Důvod: ${details.cancellationReason}`] : []),
    ...(details.cancellationMessage ? ["", details.cancellationMessage] : []),
    "",
    "Rezervace byla úspěšně zrušena.",
  ].join("\n");
}

function createOwnerNewBookingText(details: BookingDetails) {
  return [
    `Nová rezervace: ${details.tenantName}`,
    "",
    `Klient: ${details.clientName}`,
    `Služba: ${details.serviceName}`,
    `Poskytovatel: ${details.staffName}`,
    `Začátek: ${formatDateTimeForDisplay(details.startsAt, details.timeZone)}`,
    `Konec: ${formatDateTimeForDisplay(details.endsAt, details.timeZone)}`,
    "",
    "Rezervace byla právě vytvořena přes online booking stránku.",
  ].join("\n");
}

function createRescheduleText(details: BookingDetails) {
  return [
    `Rezervace přesunuta: ${details.tenantName}`,
    "",
    `Klient: ${details.clientName}`,
    `Služba: ${details.serviceName}`,
    `Poskytovatel: ${details.staffName}`,
    `Nový začátek: ${formatDateTimeForDisplay(details.startsAt, details.timeZone)}`,
    `Nový konec: ${formatDateTimeForDisplay(details.endsAt, details.timeZone)}`,
    ...(details.confirmationMessage ? ["", details.confirmationMessage] : []),
    "",
    details.manageUrl ? `Správa rezervace: ${details.manageUrl}` : "Pokud potřebujete další změnu, kontaktujte podnik přímo.",
  ].join("\n");
}

function createReviewRequestText(details: BookingDetails) {
  return [
    `Děkujeme za návštěvu: ${details.tenantName}`,
    "",
    `Klient: ${details.clientName}`,
    `Služba: ${details.serviceName}`,
    `Poskytovatel: ${details.staffName}`,
    `Termín: ${formatDateTimeForDisplay(details.startsAt, details.timeZone)}`,
    "",
    "Pokud bylo vše v pořádku, budeme rádi za krátkou recenzi.",
    details.reviewUrl ? `Napsat recenzi: ${details.reviewUrl}` : "",
  ].filter(Boolean).join("\n");
}

async function sendBookingEmail(
  supabase: TypedSupabase,
  details: BookingDetails,
  notificationType: NotificationType,
  subject: string,
  text: string,
) {
  if (!details.clientEmail) {
    const { error } = await supabase.from("notifications").insert({
      tenant_id: details.tenantId,
      booking_id: details.bookingId,
      client_id: details.clientId,
      type: notificationType,
      channel: "email",
      recipient: "missing-email",
      status: "skipped",
      scheduled_at: new Date().toISOString(),
      error: "Client email missing",
    });
    if (error) {
      throw new Error("Notification insert failed");
    }
    return;
  }

  const notification = {
    tenant_id: details.tenantId,
    booking_id: details.bookingId,
    client_id: details.clientId,
    type: notificationType,
    channel: "email" as const,
    recipient: details.clientEmail,
    scheduled_at: new Date().toISOString(),
  };

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    const { error } = await supabase.from("notifications").insert({
      ...notification,
      status: "skipped",
      error: "Resend is not configured",
    });
    if (error) {
      throw new Error("Notification insert failed");
    }
    return;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("notifications")
    .insert(notification)
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error("Notification insert failed");
  }

  const resend = new Resend(apiKey);
  let sendFailed = false;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: details.clientEmail,
      subject,
      text,
    });

    sendFailed = Boolean(error);
  } catch {
    sendFailed = true;
  }

  await updateNotificationSendStatus(supabase, {
    notificationId: inserted.id,
    sendFailed,
    tenantId: details.tenantId,
  });
}

async function sendDirectBookingEmail(
  supabase: TypedSupabase,
  {
    bookingId,
    clientId,
    notificationType,
    recipient,
    subject,
    tenantId,
    text,
  }: {
    bookingId: string;
    clientId: string | null;
    notificationType: NotificationType;
    recipient: string;
    subject: string;
    tenantId: string;
    text: string;
  },
) {
  const notification = {
    tenant_id: tenantId,
    booking_id: bookingId,
    client_id: clientId,
    type: notificationType,
    channel: "email" as const,
    recipient,
    scheduled_at: new Date().toISOString(),
  };

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    const { error } = await supabase.from("notifications").insert({
      ...notification,
      status: "skipped",
      error: "Resend is not configured",
    });
    if (error) {
      throw new Error("Notification insert failed");
    }
    return;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("notifications")
    .insert(notification)
    .select("id")
    .single();

  if (insertError || !inserted) {
    throw new Error("Notification insert failed");
  }

  const resend = new Resend(apiKey);
  let sendFailed = false;

  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: recipient,
      subject,
      text,
    });

    sendFailed = Boolean(error);
  } catch {
    sendFailed = true;
  }

  await updateNotificationSendStatus(supabase, {
    notificationId: inserted.id,
    sendFailed,
    tenantId,
  });
}

export async function getTenantOwnerRecipients(
  supabase: TypedSupabase,
  tenantId: string,
) {
  const { data, error } = await supabase
    .from("tenant_users")
    .select("users!tenant_users_user_id_fkey(email)")
    .eq("tenant_id", tenantId)
    .eq("role", "owner");

  if (error) {
    throw new Error("Owner recipients lookup failed");
  }

  return [...new Set((data ?? []).map((item) => item.users?.email?.trim().toLowerCase()).filter(Boolean))];
}

export async function sendBookingPendingEmail(
  supabase: TypedSupabase,
  details: BookingDetails,
) {
  await sendBookingEmail(
    supabase,
    details,
    "confirmation",
    `Rezervace čeká na potvrzení - ${details.tenantName}`,
    createPendingText(details),
  );
}

export async function sendBookingConfirmationEmail(
  supabase: TypedSupabase,
  details: BookingDetails,
) {
  await sendBookingEmail(
    supabase,
    details,
    "confirmation",
    `Potvrzení rezervace - ${details.tenantName}`,
    createConfirmationText(details),
  );
}

export async function sendBookingCancellationEmail(
  supabase: TypedSupabase,
  details: BookingDetails,
) {
  await sendBookingEmail(
    supabase,
    details,
    "cancellation",
    `Zrušení rezervace - ${details.tenantName}`,
    createCancellationText(details),
  );
}

export async function sendOwnerNewBookingEmail(
  supabase: TypedSupabase,
  details: BookingDetails,
  recipients: string[],
) {
  const uniqueRecipients = [...new Set(recipients.map((value) => value.trim().toLowerCase()).filter(Boolean))];

  for (const recipient of uniqueRecipients) {
    await sendDirectBookingEmail(supabase, {
      bookingId: details.bookingId,
      clientId: details.clientId,
      notificationType: "owner_booking_created",
      recipient,
      subject: `Nová rezervace - ${details.tenantName}`,
      tenantId: details.tenantId,
      text: createOwnerNewBookingText(details),
    });
  }
}

export async function sendBookingRescheduleEmail(
  supabase: TypedSupabase,
  details: BookingDetails,
) {
  await sendBookingEmail(
    supabase,
    details,
    "reschedule",
    `Nový termín rezervace - ${details.tenantName}`,
    createRescheduleText(details),
  );
}

export async function sendBookingReviewRequestEmail(
  supabase: TypedSupabase,
  details: BookingDetails,
) {
  if (!details.reviewUrl) {
    return;
  }

  await sendBookingEmail(
    supabase,
    details,
    "review_request",
    `Jaká byla návštěva - ${details.tenantName}`,
    createReviewRequestText(details),
  );
}

export async function scheduleBookingReminder(
  supabase: TypedSupabase,
  details: BookingDetails,
) {
  const startsAt = new Date(details.startsAt);

  if (Number.isNaN(startsAt.getTime())) {
    return;
  }

  const scheduledAt = new Date(startsAt.getTime() - 24 * 60 * 60 * 1000);

  if (scheduledAt <= new Date()) {
    return;
  }

  const metadata = {
    ...(details.manageUrl ? { manage_url: details.manageUrl } : {}),
    ...(details.reminderMessage ? { reminder_message: details.reminderMessage } : {}),
  };

  if (details.clientEmail) {
    const { error } = await supabase.from("notifications").insert({
      tenant_id: details.tenantId,
      booking_id: details.bookingId,
      client_id: details.clientId,
      type: "reminder",
      channel: "email",
      recipient: details.clientEmail,
      status: "pending",
      scheduled_at: scheduledAt.toISOString(),
      metadata,
    });

    if (error) {
      throw new Error("Reminder scheduling failed");
    }
  }

  const smsRecipient = isSmsReminderSchedulingEnabled()
    ? normalizeSmsRecipient(details.clientPhone)
    : null;

  if (smsRecipient) {
    const { error } = await supabase.from("notifications").insert({
      tenant_id: details.tenantId,
      booking_id: details.bookingId,
      client_id: details.clientId,
      type: "reminder",
      channel: "sms",
      recipient: smsRecipient,
      status: "pending",
      scheduled_at: scheduledAt.toISOString(),
      metadata,
    });

    if (error) {
      throw new Error("SMS reminder scheduling failed");
    }
  }
}

export async function skipPendingBookingReminders(
  supabase: TypedSupabase,
  {
    bookingId,
    reason = "Booking changed",
    tenantId,
  }: {
    bookingId: string;
    reason?: string;
    tenantId: string;
  },
) {
  const { error } = await supabase
    .from("notifications")
    .update({
      status: "skipped",
      processing_started_at: null,
      error: reason,
    })
    .eq("tenant_id", tenantId)
    .eq("booking_id", bookingId)
    .eq("type", "reminder")
    .in("channel", ["email", "sms"])
    .in("status", ["pending", "processing"]);

  if (error) {
    throw new Error("Reminder skip failed");
  }
}
