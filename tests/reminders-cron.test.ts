import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(),
  resendSend: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return {
      emails: {
        send: mocks.resendSend,
      },
    };
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));

vi.mock("@/lib/env", () => ({
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv,
}));

import { GET } from "@/app/api/cron/reminders/route";

const TEST_CRON_SECRET = "a".repeat(24);
const TEST_MANAGE_URL = `http://localhost:3000/manage/${"b".repeat(64)}`;

function createRequest(token: string | null = TEST_CRON_SECRET) {
  return new Request("http://localhost:3000/api/cron/reminders", {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }) as NextRequest;
}

function createNoNotificationsSupabaseMock() {
  const resetChain = {
    eq: vi.fn(() => resetChain),
    lt: vi.fn(async () => ({ data: null, error: null })),
  };
  const notificationsQuery = {
    eq: vi.fn(() => notificationsQuery),
    limit: vi.fn(async () => ({ data: [], error: null })),
    lte: vi.fn(() => notificationsQuery),
  };
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update: vi.fn(() => resetChain),
    })),
  };

  return { notificationsQuery, resetChain, supabase };
}

function createResetErrorSupabaseMock() {
  const resetChain = {
    eq: vi.fn(() => resetChain),
    lt: vi.fn(async () => ({ data: null, error: { message: "reset failed" } })),
  };
  const supabase = {
    from: vi.fn(() => ({
      update: vi.fn(() => resetChain),
    })),
  };

  return { supabase };
}

function createNotificationsErrorSupabaseMock() {
  const resetChain = {
    eq: vi.fn(() => resetChain),
    lt: vi.fn(async () => ({ data: null, error: null })),
  };
  const notificationsQuery = {
    eq: vi.fn(() => notificationsQuery),
    limit: vi.fn(async () => ({ data: null, error: { message: "load failed" } })),
    lte: vi.fn(() => notificationsQuery),
  };
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update: vi.fn(() => resetChain),
    })),
  };

  return { supabase };
}

function createClaimSkippedSupabaseMock() {
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
            services: { name: "Strih" },
            staff: { name: "Eva" },
            starts_at: "2026-04-28T10:00:00.000Z",
            tenants: { name: "Demo podnik" },
          },
          id: "notification-1",
          metadata: { manage_url: TEST_MANAGE_URL },
          recipient: "jan@example.com",
          tenant_id: "tenant-1",
        },
      ],
      error: null,
    })),
    lte: vi.fn(() => notificationsQuery),
  };
  const claimChain = {
    eq: vi.fn(() => claimChain),
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    select: vi.fn(() => claimChain),
  };
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update: vi.fn((payload) => (payload.status === "processing" ? claimChain : resetChain)),
    })),
  };

  return { claimChain, supabase };
}

function createClaimErrorSupabaseMock() {
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
            services: { name: "Strih" },
            staff: { name: "Eva" },
            starts_at: "2026-04-28T10:00:00.000Z",
            status: "confirmed",
            tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
          },
          id: "notification-1",
          metadata: { manage_url: TEST_MANAGE_URL },
          recipient: "jan@example.com",
          tenant_id: "tenant-1",
        },
      ],
      error: null,
    })),
    lte: vi.fn(() => notificationsQuery),
  };
  const claimChain = {
    eq: vi.fn(() => claimChain),
    maybeSingle: vi.fn(async () => ({ data: null, error: { message: "claim failed" } })),
    select: vi.fn(() => claimChain),
  };
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update: vi.fn((payload) => (payload.status === "processing" ? claimChain : resetChain)),
    })),
  };

  return { supabase };
}

function createInactiveBookingSupabaseMock() {
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
            services: { name: "Strih" },
            staff: { name: "Eva" },
            starts_at: "2026-04-28T10:00:00.000Z",
            status: "cancelled",
            tenants: { name: "Demo podnik" },
          },
          id: "notification-1",
          metadata: { manage_url: TEST_MANAGE_URL },
          recipient: "jan@example.com",
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
    maybeSingle: vi.fn(async (): Promise<{ data: { id: string } | null; error: null }> => ({
      data: { id: "notification-1" },
      error: null,
    })),
    select: vi.fn(() => finalUpdateChain),
  };
  const update = vi.fn((payload) => {
    if (payload.status === "processing") {
      return claimChain;
    }

    if (payload.status === "skipped") {
      return finalUpdateChain;
    }

    return resetChain;
  });
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update,
    })),
  };

  return { finalUpdateChain, supabase, update };
}

function createPastBookingSupabaseMock() {
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
            services: { name: "Strih" },
            staff: { name: "Eva" },
            starts_at: "2026-04-25T10:00:00.000Z",
            status: "confirmed",
            tenants: { name: "Demo podnik" },
          },
          id: "notification-1",
          metadata: { manage_url: TEST_MANAGE_URL },
          recipient: "jan@example.com",
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
    maybeSingle: vi.fn(async (): Promise<{ data: { id: string } | null; error: null }> => ({
      data: { id: "notification-1" },
      error: null,
    })),
    select: vi.fn(() => finalUpdateChain),
  };
  const update = vi.fn((payload) => {
    if (payload.status === "processing") {
      return claimChain;
    }

    if (payload.status === "skipped") {
      return finalUpdateChain;
    }

    return resetChain;
  });
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update,
    })),
  };

  return { finalUpdateChain, supabase, update };
}

function createMissingBookingSupabaseMock() {
  const resetChain = {
    eq: vi.fn(() => resetChain),
    lt: vi.fn(async () => ({ data: null, error: null })),
  };
  const notificationsQuery = {
    eq: vi.fn(() => notificationsQuery),
    limit: vi.fn(async () => ({
      data: [
        {
          bookings: null,
          id: "notification-1",
          recipient: "jan@example.com",
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
    if (payload.status === "processing") {
      return claimChain;
    }

    if (payload.status === "failed") {
      return finalUpdateChain;
    }

    return resetChain;
  });
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update,
    })),
  };

  return { finalUpdateChain, supabase, update };
}

function createSuccessfulReminderSupabaseMock(metadata: unknown = { manage_url: TEST_MANAGE_URL }) {
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
            services: { name: "Strih" },
            staff: { name: "Eva" },
            starts_at: "2026-04-28T10:00:00.000Z",
            status: "confirmed",
            tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
          },
          id: "notification-1",
          metadata,
          recipient: "jan@example.com",
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
    if (payload.status === "processing") {
      return claimChain;
    }

    if (payload.status === "sent" || payload.status === "failed") {
      return finalUpdateChain;
    }

    return resetChain;
  });
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update,
    })),
  };

  return { finalUpdateChain, supabase, update };
}

function createFinalStatusUpdateErrorSupabaseMock() {
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
            services: { name: "Strih" },
            staff: { name: "Eva" },
            starts_at: "2026-04-28T10:00:00.000Z",
            status: "confirmed",
            tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
          },
          id: "notification-1",
          metadata: { manage_url: TEST_MANAGE_URL },
          recipient: "jan@example.com",
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
    maybeSingle: vi.fn(async () => ({ data: null, error: { message: "status update failed" } })),
    select: vi.fn(() => finalUpdateChain),
  };
  const update = vi.fn((payload) => {
    if (payload.status === "processing") {
      return claimChain;
    }

    if (payload.status === "sent" || payload.status === "failed") {
      return finalUpdateChain;
    }

    return resetChain;
  });
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update,
    })),
  };

  return { finalUpdateChain, supabase, update };
}

function createFinalStatusUpdateNoRowsSupabaseMock() {
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
            services: { name: "Strih" },
            staff: { name: "Eva" },
            starts_at: "2026-04-28T10:00:00.000Z",
            status: "confirmed",
            tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
          },
          id: "notification-1",
          metadata: { manage_url: TEST_MANAGE_URL },
          recipient: "jan@example.com",
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
    maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    select: vi.fn(() => finalUpdateChain),
  };
  const update = vi.fn((payload) => {
    if (payload.status === "processing") {
      return claimChain;
    }

    if (payload.status === "sent" || payload.status === "failed") {
      return finalUpdateChain;
    }

    return resetChain;
  });
  const supabase = {
    from: vi.fn(() => ({
      select: vi.fn(() => notificationsQuery),
      update,
    })),
  };

  return { finalUpdateChain, supabase, update };
}

describe("reminders cron route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    process.env.CRON_SECRET = TEST_CRON_SECRET;
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
  });

  afterEach(() => {
    delete process.env.CRON_SECRET;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
  });

  it("odmitne request bez spravneho cron secretu", async () => {
    const response = await GET(createRequest("wrong"));

    expect(response.status).toBe(401);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("odmitne multibyte cron token bez technickeho padu", async () => {
    const response = await GET(createRequest("é".repeat(24)));

    expect(response.status).toBe(401);
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("preskoci odesilani, kdyz neni nastaveny Resend", async () => {
    delete process.env.RESEND_API_KEY;

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0, skipped: "resend_not_configured" });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("nespadne, kdyz chybi Supabase service role konfigurace", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0, skipped: "supabase_admin_not_configured" });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("neodesle reminder, kdyz ho mezitim zpracoval jiny beh cronu", async () => {
    const { claimChain, supabase } = createClaimSkippedSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0 });
    expect(claimChain.maybeSingle).toHaveBeenCalledOnce();
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("vrati chybu, kdyz se nepodari vratit zaseknute processing remindery", async () => {
    const { supabase } = createResetErrorSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ processed: 0, failed: "stale_processing_reset_failed" });
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("vrati chybu, kdyz se nepodari nacist splatne remindery", async () => {
    const { supabase } = createNotificationsErrorSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ processed: 0, failed: "notifications_load_failed" });
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("vrati chybu, kdyz se reminder nepodari zamknout pro aktualni beh", async () => {
    const { supabase } = createClaimErrorSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ processed: 0, failed: "notification_claim_failed" });
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("preskoci reminder, kdyz rezervace uz neni aktivni", async () => {
    const { finalUpdateChain, supabase, update } = createInactiveBookingSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0 });
    expect(update).toHaveBeenCalledWith({
      status: "skipped",
      processing_started_at: null,
      error: "Booking is not active",
    });
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("status", "processing");
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("preskoci reminder, kdyz termin rezervace uz probehl", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { finalUpdateChain, supabase, update } = createPastBookingSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0 });
    expect(update).toHaveBeenCalledWith({
      status: "skipped",
      processing_started_at: null,
      error: "Booking is not upcoming",
    });
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("status", "processing");
    expect(mocks.resendSend).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("oznaci reminder jako failed, kdyz rezervace chybi", async () => {
    const { finalUpdateChain, supabase, update } = createMissingBookingSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0 });
    expect(update).toHaveBeenCalledWith({
      status: "failed",
      processing_started_at: null,
      error: "Booking missing",
    });
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("status", "processing");
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("odesle aktivni reminder a oznaci ho jako sent", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { finalUpdateChain, supabase, update } = createSuccessfulReminderSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.resendSend.mockResolvedValue({ error: null });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 1 });
    expect(mocks.resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "test@example.com",
        subject: "Připomínka rezervace - Demo podnik",
        text: expect.stringContaining(`Správa rezervace: ${TEST_MANAGE_URL}`),
        to: "jan@example.com",
      }),
    );
    expect(update).toHaveBeenCalledWith({
      status: "sent",
      processing_started_at: null,
      sent_at: expect.any(String),
      error: null,
    });
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("status", "processing");
    vi.useRealTimers();
  });

  it("nevlozi do reminder emailu manage odkaz z cizi domeny", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { supabase } = createSuccessfulReminderSupabaseMock({
      manage_url: "https://evil.example/manage/token",
    });
    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.resendSend.mockResolvedValue({ error: null });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 1 });
    expect(mocks.resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.not.stringContaining("Správa rezervace:"),
      }),
    );
    vi.useRealTimers();
  });

  it("nevlozi do reminder emailu manage odkaz s neplatnym tokenem", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { supabase } = createSuccessfulReminderSupabaseMock({
      manage_url: "http://localhost:3000/manage/neplatny-token",
    });
    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.resendSend.mockResolvedValue({ error: null });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 1 });
    expect(mocks.resendSend).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.not.stringContaining("Správa rezervace:"),
      }),
    );
    vi.useRealTimers();
  });

  it("oznaci aktivni reminder jako failed, kdyz email provider odmítne zpravu", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { finalUpdateChain, supabase, update } = createSuccessfulReminderSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.resendSend.mockResolvedValue({ error: { message: "Rejected" } });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 1 });
    expect(update).toHaveBeenCalledWith({
      status: "failed",
      processing_started_at: null,
      sent_at: null,
      error: "Email provider rejected the message",
    });
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("status", "processing");
    vi.useRealTimers();
  });

  it("vrati chybu, kdyz se po odeslani nepodari ulozit finalni stav reminderu", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { finalUpdateChain, supabase } = createFinalStatusUpdateErrorSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.resendSend.mockResolvedValue({ error: null });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ processed: 0, failed: "notification_status_update_failed" });
    expect(mocks.resendSend).toHaveBeenCalledOnce();
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("status", "processing");
    vi.useRealTimers();
  });

  it("vrati chybu, kdyz finalni stav reminderu nezasahne zadny radek", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { finalUpdateChain, supabase } = createFinalStatusUpdateNoRowsSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.resendSend.mockResolvedValue({ error: null });

    const response = await GET(createRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ processed: 0, failed: "notification_status_update_failed" });
    expect(mocks.resendSend).toHaveBeenCalledOnce();
    expect(finalUpdateChain.eq).toHaveBeenCalledWith("status", "processing");
    expect(finalUpdateChain.select).toHaveBeenCalledWith("id");
    vi.useRealTimers();
  });

  it("vrati nulu, kdyz nejsou zadne splatne remindery", async () => {
    const { supabase } = createNoNotificationsSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0 });
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });

  it("vrati zaseknute processing remindery zpet do fronty", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T10:00:00.000Z"));
    const { resetChain, supabase } = createNoNotificationsSupabaseMock();
    mocks.createAdminClient.mockReturnValue(supabase);

    const response = await GET(createRequest());
    const body = await response.json();

    expect(body).toEqual({ processed: 0 });
    expect(resetChain.lt).toHaveBeenCalledWith("processing_started_at", "2026-04-26T09:45:00.000Z");
    vi.useRealTimers();
  });
});
