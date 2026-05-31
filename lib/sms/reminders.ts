import "server-only";

import { formatDateTimeForDisplay } from "@/lib/date-format";

export type SmsReminderDetails = {
  clientName: string;
  manageUrl?: string | null;
  serviceName: string;
  startsAt: string;
  tenantName: string;
  timeZone?: string | null;
};

export function isSmsReminderSchedulingEnabled() {
  return process.env.SMS_REMINDERS_ENABLED === "true";
}

export function getSmsWebhookConfig() {
  const webhookUrl = process.env.SMS_WEBHOOK_URL?.trim() ?? "";
  const webhookSecret = process.env.SMS_WEBHOOK_SECRET?.trim() ?? "";

  return {
    configured: Boolean(webhookUrl),
    webhookSecret,
    webhookUrl,
  };
}

export function normalizeSmsRecipient(value: string | null | undefined) {
  const normalized = value?.trim().replace(/[\s().-]/g, "").replace(/^00/, "+") ?? "";

  return /^\+[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

export function createSmsReminderText(details: SmsReminderDetails) {
  const lines = [
    `${details.tenantName}: připomínka rezervace`,
    `${details.serviceName}, ${formatDateTimeForDisplay(details.startsAt, details.timeZone)}`,
    details.manageUrl ? `Změna/zrušení: ${details.manageUrl}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

export async function sendSmsReminder(recipient: string, details: SmsReminderDetails) {
  const config = getSmsWebhookConfig();

  if (!config.configured) {
    return { ok: false, error: "sms_webhook_not_configured" as const };
  }

  try {
    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.webhookSecret ? { Authorization: `Bearer ${config.webhookSecret}` } : {}),
      },
      body: JSON.stringify({
        channel: "sms",
        to: recipient,
        text: createSmsReminderText(details),
        type: "reminder",
      }),
    });

    return response.ok
      ? { ok: true as const }
      : { ok: false as const, error: "sms_webhook_rejected" as const };
  } catch {
    return { ok: false as const, error: "sms_webhook_failed" as const };
  }
}
