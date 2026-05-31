import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => {
  return {
    activeContextError: null as string | null,
    authContextError: null as string | null,
    queryResult: { data: [] as unknown[], error: null as { message: string } | null },
    selectValue: "",
    user: null as null | {
      app_metadata: {
        role?: string;
        tenant_id?: string;
      };
    },
  };
});

vi.mock("@/lib/auth/active-context", () => ({
  getActiveAuthContextError: vi.fn(async () => mocks.activeContextError),
}));

vi.mock("@/lib/auth/session-context", () => ({
  getAuthContextError: vi.fn(() => mocks.authContextError),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: mocks.user },
        error: null,
      })),
    },
    from: vi.fn(() => {
      const query = {
        eq: vi.fn(() => query),
        gte: vi.fn(() => query),
        lte: vi.fn(() => query),
        order: vi.fn(() => query),
        select: vi.fn((value: string) => {
          mocks.selectValue = value;
          return query;
        }),
        then: (resolve: (value: typeof mocks.queryResult) => void) => resolve(mocks.queryResult),
      };

      return query;
    }),
  })),
}));

function createRequest(path = "/payments/export") {
  return new NextRequest(new URL(`http://localhost:3000${path}`));
}

describe("payments export route", () => {
  beforeEach(() => {
    mocks.activeContextError = null;
    mocks.authContextError = null;
    mocks.queryResult = { data: [], error: null };
    mocks.selectValue = "";
    mocks.user = {
      app_metadata: {
        role: "owner",
        tenant_id: "tenant-1",
      },
    };
  });

  it("odmitne anonymni request", async () => {
    mocks.user = null;
    const { GET } = await import("@/app/(dashboard)/payments/export/route");

    const response = await GET(createRequest());

    expect(response.status).toBe(401);
  }, 10_000);

  it("odmitne ne-owner roli", async () => {
    mocks.user = {
      app_metadata: {
        role: "staff",
        tenant_id: "tenant-1",
      },
    };
    const { GET } = await import("@/app/(dashboard)/payments/export/route");

    const response = await GET(createRequest());

    expect(response.status).toBe(403);
  });

  it("validuje query parametry", async () => {
    const { GET } = await import("@/app/(dashboard)/payments/export/route");

    const response = await GET(createRequest("/payments/export?status=unknown"));

    expect(response.status).toBe(400);
  });

  it("vrati prazdny CSV export bez internich detailu", async () => {
    const { GET } = await import("@/app/(dashboard)/payments/export/route");

    const response = await GET(createRequest());
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(csv).toContain('"Datum platby";"Stav";"Typ platby"');
    expect(csv).not.toContain("tenant-1");
  });

  it("pri DB chybe vrati obecnou chybu bez internich detailu", async () => {
    mocks.queryResult = {
      data: [],
      error: { message: "internal database error with table name" },
    };
    const { GET } = await import("@/app/(dashboard)/payments/export/route");

    const response = await GET(createRequest());
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toBe("Export se nepodařilo připravit");
    expect(body).not.toContain("internal database error");
  });

  it("vrati CSV a pouzije explicitni Supabase FK embed", async () => {
    mocks.queryResult = {
      data: [
        {
          amount: 12345,
          bookings: {
            clients: {
              email: "jan@example.com",
              full_name: "Jan Novak",
              phone: "+420777111222",
            },
            services: { name: "Strih" },
            staff: { name: "Petr" },
            starts_at: "2026-05-03T10:00:00.000Z",
          },
          created_at: "2026-05-03T09:00:00.000Z",
          currency: "CZK",
          id: "payment-1",
          method: "cash",
          note: "",
          paid_at: "2026-05-03T09:05:00.000Z",
          payment_scope: "remaining",
          status: "paid",
        },
      ],
      error: null,
    };
    const { GET } = await import("@/app/(dashboard)/payments/export/route");

    const response = await GET(createRequest("/payments/export?from=2026-05-01&to=2026-05-31"));
    const csv = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/csv");
    expect(response.headers.get("content-disposition")).toContain("temaro-platby");
    expect(mocks.selectValue).toContain("bookings!booking_payments_booking_tenant_fkey");
    expect(mocks.selectValue).toContain("clients!bookings_client_tenant_fkey");
    expect(csv).toContain("Jan Novak");
    expect(csv).toContain("Doplatek");
    expect(csv).toContain("123,45");
  });
});
