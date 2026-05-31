import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

const resendSendMock = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("resend", () => ({
  Resend: vi.fn(function ResendMock() {
    return {
      emails: {
        send: resendSendMock,
      },
    };
  }),
}));

import {
  getTenantOwnerRecipients,
  scheduleBookingReminder,
  sendBookingConfirmationEmail,
  sendBookingReviewRequestEmail,
  sendBookingRescheduleEmail,
  sendOwnerNewBookingEmail,
  skipPendingBookingReminders,
  type BookingDetails,
} from "@/lib/email/booking-confirmation";
import type { Database } from "@/types/database";

type TypedSupabase = SupabaseClient<Database>;

function createBookingDetails(overrides: Partial<BookingDetails> = {}): BookingDetails {
  return {
    bookingId: "booking-1",
    clientEmail: "jan@example.com",
    clientId: "client-1",
    clientName: "Jan Novak",
    clientPhone: null,
    endsAt: "2026-04-28T09:30:00.000Z",
    serviceName: "Strih",
    staffName: "Adam",
    startsAt: "2026-04-28T09:00:00.000Z",
    tenantId: "tenant-1",
    tenantName: "Barber",
    ...overrides,
  };
}

function createInsertSupabaseMock() {
  const insert = vi.fn(async () => ({ error: null }));
  const supabase = {
    from: vi.fn(() => ({ insert })),
  };

  return { insert, supabase: supabase as unknown as TypedSupabase };
}

function createInsertErrorSupabaseMock() {
  const insert = vi.fn(async () => ({ error: { code: "500" } }));
  const supabase = {
    from: vi.fn(() => ({ insert })),
  };

  return { insert, supabase: supabase as unknown as TypedSupabase };
}

function createUpdateSupabaseMock() {
  const eq = vi.fn(function eqMock() {
    return chain;
  });
  const inFilter = vi.fn(function inMock() {
    return chain;
  });
  const update = vi.fn(() => chain);
  const chain = { eq, in: inFilter };
  const supabase = {
    from: vi.fn(() => ({ update })),
  };

  return { eq, inFilter, supabase: supabase as unknown as TypedSupabase, update };
}

function createUpdateErrorSupabaseMock() {
  const eq = vi.fn(function eqMock() {
    return chain;
  });
  const inFilter = vi.fn(function inMock() {
    return inFilter.mock.calls.length === 1 ? chain : Promise.resolve({ error: { code: "500" } });
  });
  const update = vi.fn(() => chain);
  const chain = { eq, in: inFilter };
  const supabase = {
    from: vi.fn(() => ({ update })),
  };

  return { supabase: supabase as unknown as TypedSupabase, update };
}

function createEmailSupabaseMock() {
  const eq = vi.fn(function eqMock() {
    return updateChain;
  });
  const maybeSingle = vi.fn(async () => ({ data: { id: "notification-1" }, error: null }));
  const updateSelect = vi.fn(() => ({ maybeSingle }));
  const update = vi.fn(() => updateChain);
  const updateChain = { eq, select: updateSelect };
  const single = vi.fn(async () => ({ data: { id: "notification-1" } }));
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const supabase = {
    from: vi.fn(() => ({ insert, update })),
  };

  return { eq, insert, maybeSingle, supabase: supabase as unknown as TypedSupabase, update, updateSelect };
}

function createEmailStatusUpdateErrorSupabaseMock() {
  const eq = vi.fn(() => {
    return updateChain;
  });
  const maybeSingle = vi.fn(async () => ({ data: null, error: { code: "500" } }));
  const updateSelect = vi.fn(() => ({ maybeSingle }));
  const update = vi.fn(() => updateChain);
  const updateChain = { eq, select: updateSelect };
  const single = vi.fn(async () => ({ data: { id: "notification-1" } }));
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const supabase = {
    from: vi.fn(() => ({ insert, update })),
  };

  return { eq, insert, maybeSingle, supabase: supabase as unknown as TypedSupabase, update, updateSelect };
}

function createEmailStatusUpdateNoRowsSupabaseMock() {
  const eq = vi.fn(() => {
    return updateChain;
  });
  const maybeSingle = vi.fn(async () => ({ data: null, error: null }));
  const updateSelect = vi.fn(() => ({ maybeSingle }));
  const update = vi.fn(() => updateChain);
  const updateChain = { eq, select: updateSelect };
  const single = vi.fn(async () => ({ data: { id: "notification-1" } }));
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const supabase = {
    from: vi.fn(() => ({ insert, update })),
  };

  return { eq, insert, maybeSingle, supabase: supabase as unknown as TypedSupabase, update, updateSelect };
}

function createFailedNotificationInsertSupabaseMock() {
  const update = vi.fn();
  const single = vi.fn(async () => ({ data: null, error: { code: "500" } }));
  const select = vi.fn(() => ({ single }));
  const insert = vi.fn(() => ({ select }));
  const supabase = {
    from: vi.fn(() => ({ insert, update })),
  };

  return { insert, supabase: supabase as unknown as TypedSupabase, update };
}

function createOwnerRecipientsSupabaseMock() {
  const eq = vi.fn(async () => ({
    data: [
      { users: { email: "OWNER@example.com " } },
      { users: { email: "owner@example.com" } },
      { users: { email: "" } },
      { users: null },
    ],
    error: null,
  }));
  const select = vi.fn(() => ({ eq: vi.fn(() => ({ eq })) }));
  const supabase = {
    from: vi.fn(() => ({ select })),
  };

  return { supabase: supabase as unknown as TypedSupabase };
}

function createOwnerRecipientsErrorSupabaseMock() {
  const eq = vi.fn(async () => ({
    data: null,
    error: { code: "500" },
  }));
  const select = vi.fn(() => ({ eq: vi.fn(() => ({ eq })) }));
  const supabase = {
    from: vi.fn(() => ({ select })),
  };

  return { supabase: supabase as unknown as TypedSupabase };
}

describe("email notification helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-26T09:00:00.000Z"));
    resendSendMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.SMS_REMINDERS_ENABLED;
  });

  it("naplanuje reminder 24 hodin pred rezervaci", async () => {
    const { insert, supabase } = createInsertSupabaseMock();

    await scheduleBookingReminder(supabase, createBookingDetails());

    expect(insert).toHaveBeenCalledWith({
      tenant_id: "tenant-1",
      booking_id: "booking-1",
      client_id: "client-1",
      type: "reminder",
      channel: "email",
      recipient: "jan@example.com",
      status: "pending",
      scheduled_at: "2026-04-27T09:00:00.000Z",
      metadata: {},
    });
  });

  it("ulozi manage odkaz do reminder metadata", async () => {
    const { insert, supabase } = createInsertSupabaseMock();

    await scheduleBookingReminder(
      supabase,
      createBookingDetails({ manageUrl: "http://localhost:3000/manage/token" }),
    );

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      metadata: { manage_url: "http://localhost:3000/manage/token" },
    }));
  });

  it("naplanuje SMS reminder, kdyz je zapnuty SMS kanal a klient ma validni telefon", async () => {
    process.env.SMS_REMINDERS_ENABLED = "true";
    const { insert, supabase } = createInsertSupabaseMock();

    await scheduleBookingReminder(
      supabase,
      createBookingDetails({ clientPhone: "+420 777-123-456" }),
    );

    expect(insert).toHaveBeenCalledWith(expect.objectContaining({
      channel: "email",
      recipient: "jan@example.com",
    }));
    expect(insert).toHaveBeenCalledWith({
      tenant_id: "tenant-1",
      booking_id: "booking-1",
      client_id: "client-1",
      type: "reminder",
      channel: "sms",
      recipient: "+420777123456",
      status: "pending",
      scheduled_at: "2026-04-27T09:00:00.000Z",
      metadata: {},
    });
  });

  it("nezamlci chybu databaze pri planovani reminderu", async () => {
    const { insert, supabase } = createInsertErrorSupabaseMock();

    await expect(scheduleBookingReminder(supabase, createBookingDetails())).rejects.toThrow(
      "Reminder scheduling failed",
    );
    expect(insert).toHaveBeenCalledOnce();
  });

  it("nenaplanuje reminder bez emailu klienta a bez zapnuteho SMS kanalu", async () => {
    const { insert, supabase } = createInsertSupabaseMock();

    await scheduleBookingReminder(supabase, createBookingDetails({ clientEmail: null }));

    expect(insert).not.toHaveBeenCalled();
  });

  it("nenaplanuje reminder, pokud by vysel do minulosti", async () => {
    const { insert, supabase } = createInsertSupabaseMock();

    await scheduleBookingReminder(
      supabase,
      createBookingDetails({ startsAt: "2026-04-26T18:00:00.000Z" }),
    );

    expect(insert).not.toHaveBeenCalled();
  });

  it("nenaplanuje reminder pro neplatny cas rezervace", async () => {
    const { insert, supabase } = createInsertSupabaseMock();

    await scheduleBookingReminder(
      supabase,
      createBookingDetails({ startsAt: "neplatny-cas" }),
    );

    expect(insert).not.toHaveBeenCalled();
  });

  it("preskoci pending nebo processing email reminder dane rezervace", async () => {
    const { eq, inFilter, supabase, update } = createUpdateSupabaseMock();

    await skipPendingBookingReminders(supabase, {
      bookingId: "booking-1",
      reason: "Booking cancelled",
      tenantId: "tenant-1",
    });

    expect(update).toHaveBeenCalledWith({
      status: "skipped",
      processing_started_at: null,
      error: "Booking cancelled",
    });
    expect(eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(eq).toHaveBeenCalledWith("booking_id", "booking-1");
    expect(eq).toHaveBeenCalledWith("type", "reminder");
    expect(inFilter).toHaveBeenCalledWith("channel", ["email", "sms"]);
    expect(inFilter).toHaveBeenCalledWith("status", ["pending", "processing"]);
  });

  it("nezamlci chybu databaze pri preskoceni pending reminderu", async () => {
    const { supabase, update } = createUpdateErrorSupabaseMock();

    await expect(skipPendingBookingReminders(supabase, {
      bookingId: "booking-1",
      reason: "Booking cancelled",
      tenantId: "tenant-1",
    })).rejects.toThrow("Reminder skip failed");

    expect(update).toHaveBeenCalledWith({
      status: "skipped",
      processing_started_at: null,
      error: "Booking cancelled",
    });
  });

  it("oznaci email jako failed, kdyz email provider vyhodi chybu", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockRejectedValue(new Error("Provider unavailable"));
    const { eq, insert, supabase, update } = createEmailSupabaseMock();

    await sendBookingConfirmationEmail(supabase, createBookingDetails());

    expect(insert).toHaveBeenCalledWith({
      tenant_id: "tenant-1",
      booking_id: "booking-1",
      client_id: "client-1",
      type: "confirmation",
      channel: "email",
      recipient: "jan@example.com",
      scheduled_at: "2026-04-26T09:00:00.000Z",
    });
    expect(update).toHaveBeenCalledWith({
      status: "failed",
      sent_at: null,
      error: "Email provider rejected the message",
    });
    expect(eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(eq).toHaveBeenCalledWith("id", "notification-1");
  });

  it("formatuje cas v emailu podle timezone podniku", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { supabase } = createEmailSupabaseMock();

    await sendBookingConfirmationEmail(
      supabase,
      createBookingDetails({
        startsAt: "2026-04-28T08:00:00.000Z",
        endsAt: "2026-04-28T08:30:00.000Z",
        timeZone: "Europe/Prague",
      }),
    );

    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("Začátek: úterý 28. dubna 2026 v 10:00"),
      }),
    );
  });

  it("vlozi vlastni potvrzovaci text do confirmation emailu", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { supabase } = createEmailSupabaseMock();

    await sendBookingConfirmationEmail(
      supabase,
      createBookingDetails({
        confirmationMessage: "Přijďte prosím 5 minut předem.",
      }),
    );

    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("Přijďte prosím 5 minut předem."),
      }),
    );
  });

  it("ulozi vlastni reminder text do metadata reminderu", async () => {
    const { insert, supabase } = createInsertSupabaseMock();

    await scheduleBookingReminder(
      supabase,
      createBookingDetails({
        manageUrl: "http://localhost:3000/manage/token",
        reminderMessage: "Pokud nestíháte, změňte termín přes odkaz.",
      }),
    );

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: {
          manage_url: "http://localhost:3000/manage/token",
          reminder_message: "Pokud nestíháte, změňte termín přes odkaz.",
        },
      }),
    );
  });

  it("email nespadne pri neplatnem case rezervace", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { supabase } = createEmailSupabaseMock();

    await sendBookingConfirmationEmail(
      supabase,
      createBookingDetails({
        startsAt: "neplatny-cas",
      }),
    );

    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("Začátek: Neplatný termín"),
      }),
    );
  });

  it("presunovaci email obsahuje manage odkaz", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { supabase } = createEmailSupabaseMock();

    await sendBookingRescheduleEmail(
      supabase,
      createBookingDetails({
        manageUrl: "http://localhost:3000/manage/token",
      }),
    );

    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Nový termín rezervace - Barber",
        text: expect.stringContaining("Správa rezervace: http://localhost:3000/manage/token"),
      }),
    );
  });

  it("review request email obsahuje odkaz na recenzi", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { insert, supabase } = createEmailSupabaseMock();

    await sendBookingReviewRequestEmail(
      supabase,
      createBookingDetails({
        reviewUrl: "https://g.page/r/demo/review",
      }),
    );

    expect(insert).toHaveBeenCalledWith({
      tenant_id: "tenant-1",
      booking_id: "booking-1",
      client_id: "client-1",
      type: "review_request",
      channel: "email",
      recipient: "jan@example.com",
      scheduled_at: "2026-04-26T09:00:00.000Z",
    });
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: "Jaká byla návštěva - Barber",
        text: expect.stringContaining("Napsat recenzi: https://g.page/r/demo/review"),
      }),
    );
  });

  it("review request bez review odkazu nic neposila", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    const { insert, supabase } = createEmailSupabaseMock();

    await sendBookingReviewRequestEmail(supabase, createBookingDetails());

    expect(insert).not.toHaveBeenCalled();
    expect(resendSendMock).not.toHaveBeenCalled();
  });

  it("neodesle email a nezamlci chybu, kdyz se nepodari zalozit notifikaci", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    const { insert, supabase, update } = createFailedNotificationInsertSupabaseMock();

    await expect(sendBookingConfirmationEmail(supabase, createBookingDetails())).rejects.toThrow(
      "Notification insert failed",
    );

    expect(insert).toHaveBeenCalledOnce();
    expect(resendSendMock).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("nezamlci chybu databaze pri oznaceni emailu jako odeslaneho", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { eq, supabase, update, updateSelect } = createEmailStatusUpdateErrorSupabaseMock();

    await expect(sendBookingConfirmationEmail(supabase, createBookingDetails())).rejects.toThrow(
      "Notification status update failed",
    );

    expect(resendSendMock).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith({
      status: "sent",
      sent_at: "2026-04-26T09:00:00.000Z",
      error: null,
    });
    expect(eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(eq).toHaveBeenCalledWith("id", "notification-1");
    expect(updateSelect).toHaveBeenCalledWith("id");
  });

  it("nezamlci chybu, kdyz oznaceni emailu jako odeslaneho nezasahne zadny radek", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { eq, supabase, update, updateSelect } = createEmailStatusUpdateNoRowsSupabaseMock();

    await expect(sendBookingConfirmationEmail(supabase, createBookingDetails())).rejects.toThrow(
      "Notification status update failed",
    );

    expect(resendSendMock).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith({
      status: "sent",
      sent_at: "2026-04-26T09:00:00.000Z",
      error: null,
    });
    expect(eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(eq).toHaveBeenCalledWith("id", "notification-1");
    expect(updateSelect).toHaveBeenCalledWith("id");
  });

  it("nezamlci chybu databaze pri oznaceni owner emailu jako odeslaneho", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { eq, supabase, update } = createEmailStatusUpdateErrorSupabaseMock();

    await expect(sendOwnerNewBookingEmail(
      supabase,
      createBookingDetails(),
      ["owner@example.com"],
    )).rejects.toThrow("Notification status update failed");

    expect(resendSendMock).toHaveBeenCalledOnce();
    expect(update).toHaveBeenCalledWith({
      status: "sent",
      sent_at: "2026-04-26T09:00:00.000Z",
      error: null,
    });
    expect(eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(eq).toHaveBeenCalledWith("id", "notification-1");
  });

  it("vrati unikatni emaily owneru podniku", async () => {
    const { supabase } = createOwnerRecipientsSupabaseMock();

    const recipients = await getTenantOwnerRecipients(supabase, "tenant-1");

    expect(recipients).toEqual(["owner@example.com"]);
  });

  it("nezamlci chybu databaze pri hledani owner emailu", async () => {
    const { supabase } = createOwnerRecipientsErrorSupabaseMock();

    await expect(getTenantOwnerRecipients(supabase, "tenant-1")).rejects.toThrow(
      "Owner recipients lookup failed",
    );
  });

  it("odesle owner email jen jednou pro duplicitni adresu", async () => {
    process.env.RESEND_API_KEY = "re_test";
    process.env.RESEND_FROM_EMAIL = "test@example.com";
    resendSendMock.mockResolvedValue({ error: null });
    const { supabase } = createEmailSupabaseMock();

    await sendOwnerNewBookingEmail(
      supabase,
      createBookingDetails(),
      ["OWNER@example.com", "owner@example.com "],
    );

    expect(resendSendMock).toHaveBeenCalledOnce();
    expect(resendSendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        subject: "Nová rezervace - Barber",
      }),
    );
  });
});
