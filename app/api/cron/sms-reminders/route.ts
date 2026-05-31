import { NextResponse, type NextRequest } from "next/server";

import { getBaseAppUrl } from "@/lib/app-url";
import { isAuthorizedCronRequest } from "@/lib/cron/auth";
import { hasSupabaseAdminEnv } from "@/lib/env";
import {
  getSmsWebhookConfig,
  sendSmsReminder,
} from "@/lib/sms/reminders";
import { createAdminClient } from "@/lib/supabase/admin";

type AdminSupabase = ReturnType<typeof createAdminClient>;
type ReminderStatus = "failed" | "sent" | "skipped";
type ReminderStatusUpdate = {
  error: string | null;
  processing_started_at: null;
  sent_at?: string | null;
  status: ReminderStatus;
};

export const dynamic = "force-dynamic";

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

  if (!getSmsWebhookConfig().configured) {
    return NextResponse.json({ processed: 0, skipped: "sms_webhook_not_configured" });
  }

  const supabase = createAdminClient();
  const staleProcessingBefore = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { error: resetError } = await supabase
    .from("notifications")
    .update({
      status: "pending",
      processing_started_at: null,
      error: "Previous SMS reminder attempt timed out",
    })
    .eq("type", "reminder")
    .eq("channel", "sms")
    .eq("status", "processing")
    .lt("processing_started_at", staleProcessingBefore);

  if (resetError) {
    return NextResponse.json({ processed: 0, failed: "stale_processing_reset_failed" }, { status: 500 });
  }

  const { data: notifications, error: notificationsError } = await supabase
    .from("notifications")
    .select(
      "id, tenant_id, recipient, metadata, bookings(status, starts_at, clients!bookings_client_tenant_fkey(full_name), services(name), tenants(name, timezone))",
    )
    .eq("type", "reminder")
    .eq("channel", "sms")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .limit(25);

  if (notificationsError) {
    return NextResponse.json({ processed: 0, failed: "notifications_load_failed" }, { status: 500 });
  }

  if (!notifications || notifications.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

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

    const result = await sendSmsReminder(notification.recipient, {
      clientName: booking.clients?.full_name ?? "Klient",
      manageUrl: getManageUrlFromMetadata(notification.metadata),
      serviceName: booking.services?.name ?? "Služba",
      startsAt: booking.starts_at,
      tenantName: booking.tenants?.name ?? "Podnik",
      timeZone: booking.tenants?.timezone ?? null,
    });

    const updateError = await updateReminderStatus(supabase, notification, {
      status: result.ok ? "sent" : "failed",
      processing_started_at: null,
      sent_at: result.ok ? new Date().toISOString() : null,
      error: result.ok ? null : "SMS provider rejected the message",
    });

    if (updateError) {
      return NextResponse.json({ processed, failed: "notification_status_update_failed" }, { status: 500 });
    }

    processed += 1;
  }

  return NextResponse.json({ processed });
}
