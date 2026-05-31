import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

import { buildPaymentReceiptHtml, escapeHtml, type PaymentReceiptData, type TenantReceiptData } from "@/lib/payments/receipt";

const PAYMENT_ID = "11111111-1111-4111-8111-111111111111";

const mocks = vi.hoisted(() => {
  return {
    activeContextError: null as string | null,
    authContextError: null as string | null,
    paymentResult: { data: null as unknown, error: null as { message: string } | null },
    tenantResult: { data: null as unknown, error: null as { message: string } | null },
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
    from: vi.fn((table: string) => {
      const result = table === "tenants" ? mocks.tenantResult : mocks.paymentResult;
      const query = {
        eq: vi.fn(() => query),
        is: vi.fn(() => query),
        maybeSingle: vi.fn(async () => result),
        select: vi.fn(() => query),
      };

      return query;
    }),
  })),
}));

function createRequest() {
  return new NextRequest(`http://localhost:3000/payments/receipt/${PAYMENT_ID}`);
}

function createParams(paymentId = PAYMENT_ID) {
  return { params: Promise.resolve({ paymentId }) };
}

describe("payment receipt", () => {
  beforeEach(() => {
    mocks.activeContextError = null;
    mocks.authContextError = null;
    mocks.paymentResult = { data: null, error: null };
    mocks.tenantResult = { data: null, error: null };
    mocks.user = {
      app_metadata: {
        role: "owner",
        tenant_id: "tenant-1",
      },
    };
  });

  it("escapuje HTML hodnoty v dokladu", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("sestavi tiskovy doklad bez tenant id", () => {
    const tenant: TenantReceiptData = {
      default_currency: "CZK",
      locale: "cs-CZ",
      name: "Demo salon",
      public_address: "Hlavní 1",
      public_city: "Brno",
      public_country_code: "CZ",
      public_postal_code: "60200",
      timezone: "Europe/Prague",
    };
    const payment: PaymentReceiptData = {
      amount: 12345,
      bookings: {
        clients: { email: "jan@example.com", full_name: "Jan Novak", phone: "+420777111222" },
        services: { name: "Střih" },
        staff: { name: "Petr" },
        starts_at: "2026-05-08T10:00:00.000Z",
      },
      created_at: "2026-05-08T09:00:00.000Z",
      currency: "CZK",
      id: PAYMENT_ID,
      method: "cash",
      note: "Zaplaceno",
      paid_at: "2026-05-08T09:05:00.000Z",
      payment_scope: "remaining",
      status: "paid",
    };

    const html = buildPaymentReceiptHtml(payment, tenant);

    expect(html).toContain("Demo salon");
    expect(html).toContain("Jan Novak");
    expect(html).toContain("123,45");
    expect(html).not.toContain("tenant-1");
  });

  it("route odmitne anonymni request", async () => {
    mocks.user = null;
    const { GET } = await import("@/app/(dashboard)/payments/receipt/[paymentId]/route");

    const response = await GET(createRequest(), createParams());

    expect(response.status).toBe(401);
  }, 10_000);

  it("route validuje payment id", async () => {
    const { GET } = await import("@/app/(dashboard)/payments/receipt/[paymentId]/route");

    const response = await GET(createRequest(), createParams("bad-id"));

    expect(response.status).toBe(404);
  });

  it("route vrati HTML doklad pro owner tenant platbu", async () => {
    mocks.tenantResult = {
      data: {
        default_currency: "CZK",
        locale: "cs-CZ",
        name: "Demo salon",
        public_address: "Hlavní 1",
        public_city: "Brno",
        public_country_code: "CZ",
        public_postal_code: "60200",
        timezone: "Europe/Prague",
      },
      error: null,
    };
    mocks.paymentResult = {
      data: {
        amount: 12345,
        bookings: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", phone: "+420777111222" },
          services: { name: "Střih" },
          staff: { name: "Petr" },
          starts_at: "2026-05-08T10:00:00.000Z",
        },
        created_at: "2026-05-08T09:00:00.000Z",
        currency: "CZK",
        id: PAYMENT_ID,
        method: "cash",
        note: "Zaplaceno",
        paid_at: "2026-05-08T09:05:00.000Z",
        payment_scope: "remaining",
        status: "paid",
      },
      error: null,
    };
    const { GET } = await import("@/app/(dashboard)/payments/receipt/[paymentId]/route");

    const response = await GET(createRequest(), createParams());
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(html).toContain("Temaro doklad o platbě");
    expect(html).not.toContain("tenant-1");
  });
});
