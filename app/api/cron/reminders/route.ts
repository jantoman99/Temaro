import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";

import { hasSupabaseAdminEnv } from "@/lib/env";
import { getBaseAppUrl } from "@/lib/app-url";
import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeTimeZone } from "@/lib/time-zone";

type AdminSupabase = ReturnType<typeof createAdminClient>;
type ReminderStatus = "failed" | "sent" | "skipped";
type ReminderStatusUpdate = {
  error: string | null;
  processing_started_at: null;
  sent_at?: string | null;
  status: ReminderStatus;
};

function formatDate(value: string, timeZone?: string | null) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: getSafeTimeZone(timeZone),
  }).format(new Date(value));
}

function createReminderText(details: {
  clientName: string;
  manageUrl?: string | null;
  reminderMessage?: string | null;
  serviceName: string;
  staffName: string;
  startsAt: string;
  tenantName: string;
  timeZone?: string | null;
}) {
  return [
    `Připomínka rezervace: ${details.tenantName}`,
    "",
    `Klient: ${details.clientName}`,
    `Služba: ${details.serviceName}`,
    `Poskytovatel: ${details.staffName}`,
    `Začátek: ${formatDate(details.startsAt, details.timeZone)}`,
    ...(details.reminderMessage ? ["", details.reminderMessage] : []),
    "",
    ...(details.manageUrl ? [`Správa rezervace: ${details.manageUrl}`, ""] : []),
    "Těšíme se na vás.",
  ].join("\n");
}

function getReminderMessageFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as { reminder_message?: unknown }).reminder_message;

  return typeof value === "string" && value.trim().length <= 500 ? value.trim() : null;
}

function getManageUrlFromMetadata(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as { manage_url?: unknown }).manage_url;

  if (typeof value !== "string") {
    return null;
  }

  try {
    const appOrigin = getBaseAppUrl();
    const manageUrl = new URL(value);

    if (manageUrl.origin !== appOrigin || !/^\/manage\/[a-f0-9]{64}$/.test(manageUrl.pathname)) {
      return null;
    }

    return manageUrl.toString();
  } catch {
    return null;
  }
}

async function updateReminderStatus(
  supabase: AdminSupabase,
  notification: { id: string; tenant_id: string },
  payload: ReminderStatusUpdate,
) {
  const { data: updatedNotification, error } = await supabase
    .from("notifications")
    .update(payload)
    .eq("tenant_id", notification.tenant_id)
    .eq("id", notification.id)
    .eq("status", "processing")
    .select("id")
    .maybeSingle();

  return error || (!updatedNotification ? new Error("Notification status update affected no rows") : null);
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCronRequest(request)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (!hasSupabaseAdminEnv()) {
    return NextResponse.json({ processed: 0, skipped: "supabase_admin_not_configured" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return NextResponse.json({ processed: 0, skipped: "resend_not_configured" });
  }

  const supabase = createAdminClient();
  const staleProcessingBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { error: resetError } = await supabase
    .from("notifications")
    .update({
      status: "pending",
      processing_started_at: null,
      error: "Previous reminder attempt timed out",
    })
    .eq("type", "reminder")
    .eq("channel", "email")
    .eq("status", "processing")
    .lt("processing_started_at", staleProcessingBefore);

  if (resetError) {
    return NextResponse.json({ processed: 0, failed: "stale_processing_reset_failed" }, { status: 500 });
  }

  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select(
      "id, tenant_id, recipient, metadata, bookings(status, starts_at, clients!bookings_client_tenant_fkey(full_name), services(name), staff(name), tenants(name, timezone))",
    )
    .eq("type", "reminder")
    .eq("channel", "email")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .limit(25);

  if (notificationsError) {
    return NextResponse.json({ processed: 0, failed: "notifications_load_failed" }, { status: 500 });
  }

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  const resend = new Resend(apiKey);
  let processed = 0;

  for (const notification of notifications) {
    const { data: claimedNotification, error: claimError } = await supabase
      .from("notifications")
      .update({
        status: "processing",
        processing_started_at: new Date().toISOString(),
        error: null,
      })
      .eq("tenant_id", notification.tenant_id)
      .eq("id", notification.id)
      .eq("status", "pending")
      .select("id")
      .maybeSingle();

    if (claimError) {
      return NextResponse.json({ processed, failed: "notification_claim_failed" }, { status: 500 });
    }

    if (!claimedNotification) {
      continue;
    }

    const booking = notification.bookings;

    if (!booking) {
      const updateError = await updateReminderStatus(supabase, notification, {
          status: "failed",
          processing_started_at: null,
          error: "Booking missing",
        });

      if (updateError) {
        return NextResponse.json({ processed, failed: "notification_status_update_failed" }, { status: 500 });
      }
      continue;
    }

    if (booking.status !== "pending" && booking.status !== "confirmed") {
      const updateError = await updateReminderStatus(supabase, notification, {
          status: "skipped",
          processing_started_at: null,
          error: "Booking is not active",
        });

      if (updateError) {
        return NextResponse.json({ processed, failed: "notification_status_update_failed" }, { status: 500 });
      }
      continue;
    }

    const bookingStartsAt = new Date(booking.starts_at);

    if (Number.isNaN(bookingStartsAt.getTime()) || bookingStartsAt <= new Date()) {
      const updateError = await updateReminderStatus(supabase, notification, {
          status: "skipped",
          processing_started_at: null,
          error: "Booking is not upcoming",
        });

      if (updateError) {
        return NextResponse.json({ processed, failed: "notification_status_update_failed" }, { status: 500 });
      }
      continue;
    }

    let sendFailed = false;

    try {
      const { error } = await resend.emails.send({
        from: fromEmail,
        to: notification.recipient,
        subject: `Připomínka rezervace - ${booking.tenants?.name ?? "Podnik"}`,
        text: createReminderText({
          clientName: booking.clients?.full_name ?? "Klient",
          manageUrl: getManageUrlFromMetadata(notification.metadata),
          reminderMessage: getReminderMessageFromMetadata(notification.metadata),
          serviceName: booking.services?.name ?? "Služba",
          staffName: booking.staff?.name ?? "Poskytovatel",
          startsAt: booking.starts_at,
          tenantName: booking.tenants?.name ?? "Podnik",
          timeZone: booking.tenants?.timezone ?? null,
        }),
      });

      sendFailed = Boolean(error);
    } catch {
      sendFailed = true;
    }

    const updateError = await updateReminderStatus(supabase, notification, {
        status: sendFailed ? "failed" : "sent",
        processing_started_at: null,
        sent_at: sendFailed ? null : new Date().toISOString(),
        error: sendFailed ? "Email provider rejected the message" : null,
      });

    if (updateError) {
      return NextResponse.json({ processed, failed: "notification_status_update_failed" }, { status: 500 });
    }

    processed += 1;
  }

  return NextResponse.json({ processed });
}
