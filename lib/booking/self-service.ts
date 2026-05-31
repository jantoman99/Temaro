import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getBaseAppUrl } from "@/lib/app-url";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type TypedSupabase = SupabaseClient<Database>;

const DEFAULT_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function hashBookingSelfServiceToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createRawBookingSelfServiceToken() {
  return randomBytes(32).toString("hex");
}

export function getBookingManageUrl(token: string) {
  return `${getBaseAppUrl()}/manage/${token}`;
}

export function getSelfServiceCancellationState(
  booking: {
    deposit_amount?: number | null;
    deposit_paid?: boolean | null;
    starts_at: string;
    tenants?: {
      cancellation_notice_hours?: number | null;
    } | null;
  },
  now = new Date(),
) {
  const noticeHours = booking.tenants?.cancellation_notice_hours ?? 0;
  const depositAmount = booking.deposit_amount ?? 0;
  const depositPaid = Boolean(booking.deposit_paid);
  const startsAt = new Date(booking.starts_at);
  const depositPolicy =
    depositAmount <= 0
      ? null
      : depositPaid
        ? "Záloha je zaplacená. Při zrušení ji podnik zkontroluje podle storno pravidel; automatické vrácení zatím Temaro nespouští."
        : "Záloha zatím není zaplacená. Storno pravidla se pořád řídí časem do termínu.";

  if (Number.isNaN(startsAt.getTime())) {
    return {
      canCancel: false,
      depositAmount,
      depositPaid,
      depositPolicy,
      hoursUntilStart: null,
      noticeHours,
      reason: "Termín rezervace není platný.",
    };
  }

  const hoursUntilStart = (startsAt.getTime() - now.getTime()) / (60 * 60 * 1000);

  if (hoursUntilStart <= 0) {
    return {
      canCancel: false,
      depositAmount,
      depositPaid,
      depositPolicy,
      hoursUntilStart,
      noticeHours,
      reason: "Tento termín už začal nebo proběhl.",
    };
  }

  if (noticeHours <= 0) {
    return {
      canCancel: true,
      depositAmount,
      depositPaid,
      depositPolicy,
      hoursUntilStart,
      noticeHours,
      reason: null,
    };
  }

  if (hoursUntilStart < noticeHours) {
    const depositSuffix = depositPaid
      ? " Zaplacenou zálohu je potřeba řešit přímo s podnikem podle storno podmínek."
      : "";

    return {
      canCancel: false,
      depositAmount,
      depositPaid,
      depositPolicy,
      hoursUntilStart,
      noticeHours,
      reason: `Zrušení online už není možné. Podnik má storno lhůtu ${noticeHours} hodin před termínem.${depositSuffix}`,
    };
  }

  return {
    canCancel: true,
    depositAmount,
    depositPaid,
    depositPolicy,
    hoursUntilStart,
    noticeHours,
    reason: null,
  };
}

export async function createBookingSelfServiceToken(
  supabase: TypedSupabase,
  {
    bookingId,
    tenantId,
    ttlMs = DEFAULT_TOKEN_TTL_MS,
  }: {
    bookingId: string;
    tenantId: string;
    ttlMs?: number;
  },
) {
  const token = createRawBookingSelfServiceToken();
  const tokenHash = hashBookingSelfServiceToken(token);
  const expiresAt = new Date(Date.now() + ttlMs).toISOString();

  const { error: revokeError } = await supabase
    .from("booking_self_service_tokens")
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .eq("booking_id", bookingId)
    .is("revoked_at", null);

  if (revokeError) {
    throw new Error("Failed to revoke previous booking self-service tokens.");
  }

  const { error } = await supabase.from("booking_self_service_tokens").insert({
    tenant_id: tenantId,
    booking_id: bookingId,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  if (error) {
    throw new Error("Failed to create booking self-service token.");
  }

  return {
    expiresAt,
    token,
    url: getBookingManageUrl(token),
  };
}

export async function revokeBookingSelfServiceTokens(
  supabase: TypedSupabase,
  {
    bookingId,
    tenantId,
  }: {
    bookingId: string;
    tenantId: string;
  },
) {
  const { error } = await supabase
    .from("booking_self_service_tokens")
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("tenant_id", tenantId)
    .eq("booking_id", bookingId)
    .is("revoked_at", null);

  if (error) {
    throw new Error("Failed to revoke booking self-service tokens.");
  }
}

export async function getBookingBySelfServiceToken(
  supabase: TypedSupabase,
  token: string,
) {
  const tokenHash = hashBookingSelfServiceToken(token);
  const now = new Date().toISOString();

  const { data: tokenRow, error: tokenError } = await supabase
    .from("booking_self_service_tokens")
    .select("booking_id, tenant_id, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .gt("expires_at", now)
    .is("revoked_at", null)
    .maybeSingle();

  if (tokenError) {
    throw new Error("Failed to verify booking self-service token.");
  }

  if (!tokenRow) {
    return null;
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      "id, tenant_id, client_id, staff_id, service_id, starts_at, ends_at, status, deposit_amount, deposit_paid, deposit_paid_at, notes, source, cancellation_reason, cancelled_at, clients!bookings_client_tenant_fkey(id, full_name, email, phone), services(name, duration_minutes, price, currency), staff(name), tenants(name, slug, timezone, locale, cancellation_notice_hours, confirmation_message, reminder_message, cancellation_message)",
    )
    .eq("tenant_id", tokenRow.tenant_id)
    .eq("id", tokenRow.booking_id)
    .in("status", ["pending", "confirmed"])
    .gt("starts_at", now)
    .maybeSingle();

  if (bookingError) {
    throw new Error("Failed to load booking for self-service token.");
  }

  if (!booking) {
    return null;
  }

  return booking;
}
