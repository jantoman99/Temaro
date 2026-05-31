import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { hashCalendarFeedToken } from "@/lib/calendar/ical";

const mocks = vi.hoisted(() => {
  return {
    bookingResult: { data: [] as unknown[], error: null as { message: string } | null },
    bookingsSelectValue: "",
    feedResult: { data: null as null | { id: string; staff_id: string | null; tenant_id: string }, error: null as { message: string } | null },
    tokenHashFilter: "",
    updatePayload: null as null | Record<string, string>,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "calendar_feed_tokens") {
        const query = {
          eq: vi.fn((column: string, value: string) => {
            if (column === "token_hash") {
              mocks.tokenHashFilter = value;
            }
            return query;
          }),
          is: vi.fn(() => query),
          maybeSingle: vi.fn(async () => mocks.feedResult),
          select: vi.fn(() => query),
          update: vi.fn((payload: Record<string, string>) => {
            mocks.updatePayload = payload;
            return query;
          }),
        };

        return query;
      }

      const query = {
        eq: vi.fn(() => query),
        gte: vi.fn(() => query),
        in: vi.fn(() => query),
        limit: vi.fn(() => query),
        lte: vi.fn(() => query),
        order: vi.fn(() => query),
        select: vi.fn((value: string) => {
          mocks.bookingsSelectValue = value;
          return query;
        }),
        then: (resolve: (value: typeof mocks.bookingResult) => void) => resolve(mocks.bookingResult),
      };

      return query;
    }),
  })),
}));

function createRequest() {
  return new NextRequest("http://localhost:3000/calendar-feed/token.ics");
}

function createParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

describe("calendar feed route", () => {
  beforeEach(() => {
    mocks.bookingResult = { data: [], error: null };
    mocks.bookingsSelectValue = "";
    mocks.feedResult = { data: { id: "feed-1", staff_id: null, tenant_id: "tenant-1" }, error: null };
    mocks.tokenHashFilter = "";
    mocks.updatePayload = null;
  });

  it("vrati 404 pro neplatny token", async () => {
    const { GET } = await import("@/app/calendar-feed/[token]/route");

    const response = await GET(createRequest(), createParams("not-a-token.ics"));

    expect(response.status).toBe(404);
  });

  it("vrati 404 pro odvolany nebo neexistujici token", async () => {
    mocks.feedResult = { data: null, error: null };
    const { GET } = await import("@/app/calendar-feed/[token]/route");

    const response = await GET(createRequest(), createParams(`${"a".repeat(64)}.ics`));

    expect(response.status).toBe(404);
  });

  it("vrati text/calendar feed a aktualizuje last_used_at", async () => {
    const token = "b".repeat(64);
    mocks.bookingResult = {
      data: [
        {
          clients: { full_name: "Jan Novak" },
          ends_at: "2026-05-05T10:30:00.000Z",
          id: "booking-1",
          notes: "",
          services: { name: "Střih" },
          staff: { name: "Eva" },
          starts_at: "2026-05-05T10:00:00.000Z",
          status: "confirmed",
          tenants: { name: "Demo barber", timezone: "Europe/Prague" },
        },
      ],
      error: null,
    };
    const { GET } = await import("@/app/calendar-feed/[token]/route");

    const response = await GET(createRequest(), createParams(`${token}.ics`));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/calendar");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.tokenHashFilter).toBe(hashCalendarFeedToken(token));
    expect(mocks.bookingsSelectValue).toContain("clients!bookings_client_tenant_fkey");
    expect(mocks.updatePayload?.last_used_at).toBeTruthy();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("SUMMARY:Střih - Jan Novak");
  });

  it("vrati 500 bez detailu pri chybe nacitani rezervaci", async () => {
    mocks.bookingResult = { data: [], error: { message: "internal database error" } };
    const { GET } = await import("@/app/calendar-feed/[token]/route");

    const response = await GET(createRequest(), createParams(`${"c".repeat(64)}.ics`));
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toBe("Calendar feed failed");
    expect(body).not.toContain("internal database error");
  });
});
