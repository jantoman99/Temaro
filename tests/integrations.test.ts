import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import {
  generateTenantApiKey,
  getTenantApiKeyLast4,
  getTenantApiKeyPrefix,
  hashTenantApiKey,
  isTenantApiKeyFormat,
} from "@/lib/api-keys/keys";
import { partnerBookingsQuerySchema } from "@/lib/validations/integrations";

const TOKEN = "tmro_123456789ABCDEFGHJKLMNPQRSUVWXYZ";

const mocks = vi.hoisted(() => ({
  bookingsResult: { data: [] as unknown[], error: null as { message: string } | null },
  keyResult: {
    data: {
      id: "key-1",
      revoked_at: null,
      scopes: ["bookings:read"],
      tenant_id: "tenant-1",
    } as unknown,
    error: null as { message: string } | null,
  },
  tokenHashFilter: "",
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === "tenant_api_keys") {
        const updateQuery = {
          eq: vi.fn(() => updateQuery),
        };
        const keyQuery = {
          eq: vi.fn((column: string, value: string) => {
            if (column === "token_hash") {
              mocks.tokenHashFilter = value;
            }
            return keyQuery;
          }),
          maybeSingle: vi.fn(async () => mocks.keyResult),
          select: vi.fn(() => keyQuery),
          update: vi.fn(() => updateQuery),
        };

        return keyQuery;
      }

      const bookingsQuery = {
        eq: vi.fn(() => bookingsQuery),
        gte: vi.fn(() => bookingsQuery),
        limit: vi.fn(async () => mocks.bookingsResult),
        lte: vi.fn(() => bookingsQuery),
        order: vi.fn(() => bookingsQuery),
        select: vi.fn(() => bookingsQuery),
      };

      return bookingsQuery;
    }),
  })),
}));

function createRequest(path: string, token = TOKEN) {
  return new NextRequest(new URL(`http://localhost:3000${path}`), {
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
}

describe("integrations api keys", () => {
  beforeEach(() => {
    mocks.bookingsResult = { data: [], error: null };
    mocks.keyResult = {
      data: {
        id: "key-1",
        revoked_at: null,
        scopes: ["bookings:read"],
        tenant_id: "tenant-1",
      },
      error: null,
    };
    mocks.tokenHashFilter = "";
  });

  it("generuje hashovany tenant API klic bez raw ulozeni", () => {
    const token = generateTenantApiKey();

    expect(isTenantApiKeyFormat(token)).toBe(true);
    expect(hashTenantApiKey(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashTenantApiKey(token)).not.toBe(token);
    expect(getTenantApiKeyPrefix(token)).toHaveLength(13);
    expect(getTenantApiKeyLast4(token)).toHaveLength(4);
  });

  it("validuje query pro partner bookings endpoint", () => {
    expect(partnerBookingsQuerySchema.safeParse({
      from: "2026-05-09T12:00:00.000Z",
      to: "2026-05-09T10:00:00.000Z",
    }).success).toBe(false);
  });

  it("partner bookings endpoint odmita request bez Bearer tokenu", async () => {
    const { GET } = await import("@/app/api/partners/v1/bookings/route");

    const response = await GET(createRequest("/api/partners/v1/bookings", ""));

    expect(response.status).toBe(401);
  });

  it("partner bookings endpoint pouzije hash tokenu a vrati tenant-only data", async () => {
    mocks.bookingsResult = {
      data: [{
        clients: { email: "jan@example.com", full_name: "Jan Novak", phone: "+420777111222" },
        ends_at: "2026-05-09T11:00:00.000Z",
        id: "booking-1",
        services: { name: "Střih" },
        source: "manual",
        staff: { name: "Eva" },
        starts_at: "2026-05-09T10:00:00.000Z",
        status: "confirmed",
      }],
      error: null,
    };
    const { GET } = await import("@/app/api/partners/v1/bookings/route");

    const response = await GET(createRequest("/api/partners/v1/bookings?limit=10"));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(mocks.tokenHashFilter).toBe(hashTenantApiKey(TOKEN));
    expect(payload.data).toHaveLength(1);
    expect(JSON.stringify(payload)).not.toContain("token_hash");
  });

  it("partner bookings endpoint odmita odvolany klic", async () => {
    mocks.keyResult = {
      data: {
        id: "key-1",
        revoked_at: "2026-05-08T12:00:00.000Z",
        scopes: ["bookings:read"],
        tenant_id: "tenant-1",
      },
      error: null,
    };
    const { GET } = await import("@/app/api/partners/v1/bookings/route");

    const response = await GET(createRequest("/api/partners/v1/bookings"));

    expect(response.status).toBe(401);
  });
});
