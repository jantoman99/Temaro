import { NextResponse, type NextRequest } from "next/server";

import { buildCalendarIcs, hashCalendarFeedToken, type IcalBooking } from "@/lib/calendar/ical";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CalendarFeedRouteProps = {
  params: Promise<{ token: string }>;
};

function normalizeToken(value: string) {
  return value.endsWith(".ics") ? value.slice(0, -4) : value;
}

export async function GET(_request: NextRequest, { params }: CalendarFeedRouteProps) {
  const { token: rawToken } = await params;
  const token = normalizeToken(rawToken);

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const admin = createAdminClient();
  const tokenHash = hashCalendarFeedToken(token);
  const { data: feedToken, error: tokenError } = await admin
    .from("calendar_feed_tokens")
    .select("id, tenant_id, staff_id")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .maybeSingle();

  if (tokenError || !feedToken) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();

  let bookingsQuery = admin
    .from("bookings")
    .select(
      "id, starts_at, ends_at, notes, status, clients!bookings_client_tenant_fkey(full_name), services(name), staff(name), tenants(name, timezone)",
    )
    .eq("tenant_id", feedToken.tenant_id)
    .in("status", ["pending", "confirmed"])
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at", { ascending: true })
    .limit(1000);

  if (feedToken.staff_id) {
    bookingsQuery = bookingsQuery.eq("staff_id", feedToken.staff_id);
  }

  const [{ data: bookings, error: bookingsError }] = await Promise.all([
    bookingsQuery,
    admin
      .from("calendar_feed_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", feedToken.id)
      .eq("tenant_id", feedToken.tenant_id),
  ]);

  if (bookingsError) {
    return new NextResponse("Calendar feed failed", { status: 500 });
  }

  const ics = buildCalendarIcs((bookings ?? []) as IcalBooking[]);

  return new NextResponse(ics, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'inline; filename="temaro-calendar.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
