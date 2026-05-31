import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));
vi.mock("@/lib/env", () => ({
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv,
}));

import { GET } from "@/app/api/cron/sms-reminders/route";
import {
  createSmsReminderText,
  normalizeSmsRecipient,
  sendSmsReminder,
} from "@/lib/sms/reminders";

const TEST_CRON_SECRET = "a".repeat(24);
const TEST_MANAGE_URL = `http://localhost:3000/manage/${"b".repeat(64)}`;

function createRequest(token: string | null = TEST_CRON_SECRET) {
  return new Request("http://localhost:3000/api/cron/sms-reminders", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }) as NextRequest;
}

function createActiveSmsSupabaseMock() {
  const resetChain = {
    eq: vi.fn(() => resetChain),
    lt: vi.fn(async () => ({ data: null, error: null })),
  };
  const notificationsQuery = {
    eq: vi.fn(() => notificationsQuery),
    limit: vi.fn(async () => ({
      data: [
        {
          bookings: {
            clients: { full_name: "Jan Novak" },
            services: { name: "Střih" },
            starts_at: "2026-05-05T10:00:00.000Z",
            status: "confirmed",
            tenants: { name: "Demo barber", timezone: "Europe/Prague" },
          },
          id: "notification-1",
          metadata: { manage_url: TEST_MANAGE_URL },
          recipient: "+420777123456",
          tenant_id: "tenant-1",
        },
      ],
      error: null,
    })),
    lte: vi.fn(() => notificationsQuery),
  };
  const claimChain = {
    eq: vi.fn(() => claimChain),
    maybeSingle: vi.fn(async () => ({ data: { id: "notification-1" }, error: null })),
    select: vi.fn(() => claimChain),
  };
  const finalUpdateChain = {
    eq: vi.fn(() => finalUpdateChain),
    maybeSingle: vi.fn(async () => ({ data: { id: "notification-1" }, error: null })),
    select: vi.fn(() => finalUpdateChain),
  };
  const update = vi.fn((payload) => {
    if (payload.status === "pending") return resetChain;
    if (payload.status === "processing") return claimChain;
    return finalUpdateChain;
  });
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update,
    })),
  };

  return { finalUpdateChain, notificationsQuery, resetChain, supabase, update };
}

describe("SMS reminder helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-04T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete process.env.SMS_WEBHOOK_SECRET;
    delete process.env.SMS_WEBHOOK_URL;
  });

  it("normalizuje telefon do E.164 formatu", () => {
    expect(normalizeSmsRecipient("+420 777-123-456")).toBe("+420777123456");
    expect(normalizeSmsRecipient("00420777123456")).toBe("+420777123456");
    expect(normalizeSmsRecipient("777123456")).toBeNull();
  });

  it("vytvori kratky SMS text s manage odkazem", () => {
    const text = createSmsReminderText({
      manageUrl: TEST_MANAGE_URL,
      clientName: "Jan Novak",
      serviceName: "Střih",
      startsAt: "2026-05-05T10:00:00.000Z",
      tenantName: "Demo barber",
      timeZone: "Europe/Prague",
    });

    expect(text).toContain("Demo barber: připomínka rezervace");
    expect(text).toContain("Střih");
    expect(text).toContain(TEST_MANAGE_URL);
  });

  it("odesle SMS pres webhook s bearer secretem", async () => {
    process.env.SMS_WEBHOOK_URL = "https://sms.example/send";
    process.env.SMS_WEBHOOK_SECRET = "sms-secret";
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      sendSmsReminder("+420777123456", {
        clientName: "Jan Novak",
        serviceName: "Střih",
        startsAt: "2026-05-05T10:00:00.000Z",
        tenantName: "Demo barber",
        timeZone: "Europe/Prague",
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://sms.example/send",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer sms-secret" }),
        method: "POST",
      }),
    );
  });
});

describe("GET /api/cron/sms-reminders", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-04T10:00:00.000Z"));
    process.env.CRON_SECRET = TEST_CRON_SECRET;
    process.env.SMS_WEBHOOK_URL = "https://sms.example/send";
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete process.env.CRON_SECRET;
    delete process.env.SMS_WEBHOOK_URL;
  });

  it("odmitne request bez cron secretu", async () => {
    const response = await GET(createRequest(null));

    expect(response.status).toBe(401);
  });

  it("preskoci beh bez SMS webhook konfigurace", async () => {
    delete process.env.SMS_WEBHOOK_URL;

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0, skipped: "sms_webhook_not_configured" });
  });

  it("odesle aktivni SMS reminder a oznaci ho jako sent", async () => {
    const { finalUpdateChain, notificationsQuery, resetChain, supabase, update } = createActiveSmsSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);
    const fetchMock = vi.fn(async () => new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ processed: 1 });
    expect(resetChain.eq).toHaveBeenCalledWith("channel", "sms");
    expect(notificationsQuery.eq).toHaveBeenCalledWith("channel", "sms");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ status: "sent", error: null }));
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("id", "notification-1");
  });
});
