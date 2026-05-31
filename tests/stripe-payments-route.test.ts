import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  createAdminClient: vi.fn(),
  getBookingBySelfServiceToken: vi.fn(),
  stripeCheckoutCreate: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/booking/self-service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/booking/self-service")>();

  return {
    ...actual,
    getBookingBySelfServiceToken: mocks.getBookingBySelfServiceToken,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));

vi.mock("@/lib/stripe/client", () => ({
  getStripeClient: vi.fn(() => ({
    checkout: {
      sessions: {
        create: mocks.stripeCheckoutCreate,
      },
    },
    webhooks: {
      constructEvent: mocks.constructEvent,
    },
  })),
  getStripeWebhookSecret: vi.fn(() => process.env.STRIPE_WEBHOOK_SECRET?.trim() || null),
}));

const BOOKING_ID = "11111111-1111-4111-8111-111111111111";
const TENANT_ID = "22222222-2222-4222-8222-222222222222";
const TOKEN = "a".repeat(64);

function createCheckoutRequest(token = TOKEN) {
  return new NextRequest("http://localhost:3000/api/payments/stripe/checkout", {
    method: "POST",
    body: new URLSearchParams({ token }),
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
  });
}

function createWebhookRequest() {
  return new NextRequest("http://localhost:3000/api/payments/stripe/webhook", {
    method: "POST",
    body: JSON.stringify({ id: "evt_1" }),
    headers: {
      "stripe-signature": "sig_123",
    },
  });
}

function createBookingPaymentLookupSupabaseMock() {
  const insert = vi.fn(async () => ({ error: null }));
  const lookupChain = {
    eq: vi.fn(() => lookupChain),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    select: vi.fn(() => lookupChain),
  };
  const supabase = {
    from: vi.fn((table: string) => {
      if (table !== "booking_payments") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        insert,
        select: lookupChain.select,
      };
    }),
  };

  return { insert, lookupChain, supabase };
}

function createWebhookSupabaseMock() {
  const bookingLookupChain = {
    eq: vi.fn(() => bookingLookupChain),
    maybeSingle: vi.fn(async () => ({
      data: {
        deposit_amount: 5000,
        deposit_paid: false,
        id: BOOKING_ID,
      },
      error: null,
    })),
    select: vi.fn(() => bookingLookupChain),
  };
  const paymentLookupChain = {
    eq: vi.fn(() => paymentLookupChain),
    maybeSingle: vi.fn(async () => ({
      data: {
        id: "payment-1",
        status: "pending",
      },
      error: null,
    })),
    select: vi.fn(() => paymentLookupChain),
  };
  const paymentUpdateChain = {
    eq: vi.fn(() => paymentUpdateChain),
    maybeSingle: vi.fn(async () => ({ data: { id: "payment-1" }, error: null })),
    select: vi.fn(() => paymentUpdateChain),
  };
  const bookingUpdateChain = {
    eq: vi.fn(() => bookingUpdateChain),
    then: (resolve: (value: { error: null }) => void) => resolve({ error: null }),
  };
  const eventInsert = vi.fn(async () => ({ error: null }));
  const paymentUpdate = vi.fn(() => paymentUpdateChain);
  const bookingUpdate = vi.fn(() => bookingUpdateChain);
  const from = vi.fn((table: string) => {
    if (table === "bookings") {
      return {
        select: bookingLookupChain.select,
        update: bookingUpdate,
      };
    }

    if (table === "booking_payments") {
      return {
        select: paymentLookupChain.select,
        update: paymentUpdate,
      };
    }

    if (table === "booking_events") {
      return {
        insert: eventInsert,
      };
    }

    throw new Error(`Unexpected table ${table}`);
  });

  return {
    bookingUpdate,
    eventInsert,
    from,
    paymentUpdate,
    supabase: { from },
  };
}

describe("Stripe payment routes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_123";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
  });

  it("checkout route validuje self-service token pred provider volanim", async () => {
    const { POST } = await import("@/app/api/payments/stripe/checkout/route");

    const response = await POST(createCheckoutRequest("invalid"));

    expect(response.status).toBe(400);
    expect(mocks.stripeCheckoutCreate).not.toHaveBeenCalled();
  }, 10_000);

  it("checkout route vytvori Stripe session a pending payment audit", async () => {
    const { insert, supabase } = createBookingPaymentLookupSupabaseMock();

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken.mockResolvedValue({
      clients: { email: "jan@example.com" },
      deposit_amount: 5000,
      deposit_paid: false,
      id: BOOKING_ID,
      services: { currency: "CZK", name: "Střih" },
      tenant_id: TENANT_ID,
      tenants: { name: "Demo podnik" },
    });
    mocks.stripeCheckoutCreate.mockResolvedValue({
      id: "cs_test_123",
      url: "https://checkout.stripe.com/c/pay/cs_test_123",
    });
    const { POST } = await import("@/app/api/payments/stripe/checkout/route");

    const response = await POST(createCheckoutRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://checkout.stripe.com/c/pay/cs_test_123");
    expect(mocks.stripeCheckoutCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        client_reference_id: BOOKING_ID,
        customer_email: "jan@example.com",
        metadata: {
          booking_id: BOOKING_ID,
          payment_scope: "deposit",
          tenant_id: TENANT_ID,
        },
        mode: "payment",
      }),
      {
        idempotencyKey: `booking-deposit:${TENANT_ID}:${BOOKING_ID}:5000`,
      },
    );
    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      amount: 5000,
      booking_id: BOOKING_ID,
      provider: "stripe",
      provider_payment_id: "cs_test_123",
      status: "pending",
      tenant_id: TENANT_ID,
    }));
  });

  it("webhook route odmitne neplatny podpis bez internich detailu", async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const { POST } = await import("@/app/api/payments/stripe/webhook/route");

    const response = await POST(createWebhookRequest());
    const body = await response.text();

    expect(response.status).toBe(400);
    expect(body).toBe("Invalid signature");
  });

  it("webhook route oznaci Stripe deposit jako zaplaceny idempotentnim provider id", async () => {
    const { bookingUpdate, eventInsert, paymentUpdate, supabase } = createWebhookSupabaseMock();

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.constructEvent.mockReturnValue({
      data: {
        object: {
          amount_total: 5000,
          currency: "czk",
          id: "cs_test_123",
          metadata: {
            booking_id: BOOKING_ID,
            payment_scope: "deposit",
            tenant_id: TENANT_ID,
          },
          payment_intent: "pi_123",
          payment_status: "paid",
        },
      },
      type: "checkout.session.completed",
    });
    const { POST } = await import("@/app/api/payments/stripe/webhook/route");

    const response = await POST(createWebhookRequest());

    expect(response.status).toBe(200);
    expect(paymentUpdate).toHaveBeenCalledWith(expect.objectContaining({
      amount: 5000,
      currency: "CZK",
      method: "online_card",
      status: "paid",
    }));
    expect(bookingUpdate).toHaveBeenCalledWith(expect.objectContaining({
      deposit_paid: true,
    }));
    expect(eventInsert).toHaveBeenCalledWith(expect.objectContaining({
      actor_type: "system",
      booking_id: BOOKING_ID,
      event_type: "payment_recorded",
      tenant_id: TENANT_ID,
    }));
  });
});
