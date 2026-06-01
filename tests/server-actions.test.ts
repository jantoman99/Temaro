import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  createClient: vi.fn(),
  createBookingSelfServiceToken: vi.fn(),
  findMatchingClient: vi.fn(),
  getBookingBySelfServiceToken: vi.fn(),
  getTenantOwnerRecipients: vi.fn(),
  getSelfServiceCancellationState: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(),
  hasSupabaseEnv: vi.fn(),
  limitLogin: vi.fn(),
  limitPublicBooking: vi.fn(),
  limitRegister: vi.fn(),
  requireOwner: vi.fn(),
  revalidatePath: vi.fn(),
  revokeBookingSelfServiceTokens: vi.fn(),
  scheduleBookingReminder: vi.fn(),
  sendBookingConfirmationEmail: vi.fn(),
  sendBookingCancellationEmail: vi.fn(),
  sendBookingPendingEmail: vi.fn(),
  sendBookingReviewRequestEmail: vi.fn(),
  sendBookingRescheduleEmail: vi.fn(),
  sendOwnerNewBookingEmail: vi.fn(),
  skipPendingBookingReminders: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/booking/self-service", async () => {
  return {
    createBookingSelfServiceToken: mocks.createBookingSelfServiceToken,
    getBookingBySelfServiceToken: mocks.getBookingBySelfServiceToken,
    getBookingManageUrl: (token: string) => `http://localhost:3000/manage/${token}`,
    getSelfServiceCancellationState: mocks.getSelfServiceCancellationState,
    revokeBookingSelfServiceTokens: mocks.revokeBookingSelfServiceTokens,
  };
});

vi.mock("@/lib/email/booking-confirmation", () => ({
  getTenantOwnerRecipients: mocks.getTenantOwnerRecipients,
  scheduleBookingReminder: mocks.scheduleBookingReminder,
  sendBookingCancellationEmail: mocks.sendBookingCancellationEmail,
  sendBookingConfirmationEmail: mocks.sendBookingConfirmationEmail,
  sendBookingPendingEmail: mocks.sendBookingPendingEmail,
  sendBookingReviewRequestEmail: mocks.sendBookingReviewRequestEmail,
  sendBookingRescheduleEmail: mocks.sendBookingRescheduleEmail,
  sendOwnerNewBookingEmail: mocks.sendOwnerNewBookingEmail,
  skipPendingBookingReminders: mocks.skipPendingBookingReminders,
}));

vi.mock("@/lib/rate-limit/public-booking", () => ({
  limitPublicBooking: mocks.limitPublicBooking,
}));

vi.mock("@/lib/rate-limit/auth", () => ({
  limitLogin: mocks.limitLogin,
  limitRegister: mocks.limitRegister,
}));

vi.mock("@/lib/auth/require-owner", () => ({
  requireOwner: mocks.requireOwner,
}));

vi.mock("@/lib/env", () => ({
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv,
  hasSupabaseEnv: mocks.hasSupabaseEnv,
}));

vi.mock("@/lib/clients/find-matching-client", () => ({
  findMatchingClient: mocks.findMatchingClient,
}));

vi.mock("@/lib/staff/find-matching-staff", () => ({
  findMatchingStaff: vi.fn(),
}));

import {
  createPublicBookingAction,
  joinWaitlistAction,
} from "@/app/(booking)/[slug]/actions";
import { loginAction, requestPasswordResetAction, registerAction, updatePasswordAction } from "@/app/(auth)/actions";
import {
  cancelManagedBookingAction,
  rescheduleManagedBookingAction,
} from "@/app/(booking)/manage/[token]/actions";
import {
  cancelBookingAction,
  completeBookingAction,
  confirmBookingAction,
  createManualBookingAction,
  markNoShowAction,
  updateBookingAction,
} from "@/app/(dashboard)/calendar/actions";
import {
  createClientAction,
  hideClientAction,
  toggleClientFlagAction,
  updateClientAction,
} from "@/app/(dashboard)/clients/actions";
import {
  createStarterServicesAction,
  createServiceAction,
  hideServiceAction,
  updateServiceAction,
} from "@/app/(dashboard)/services/actions";
import { updateTenantSettingsAction } from "@/app/(dashboard)/settings/actions";
import { updateOnboardingIndustryAction } from "@/app/(dashboard)/start/actions";
import {
  assignStaffServiceAction,
  createStaffAction,
  createStaffExceptionAction,
  hideStaffAction,
  inviteStaffUserAction,
  removeStaffServiceAction,
  updateStaffAction,
} from "@/app/(dashboard)/staff/actions";

const BOOKING_ID = "11111111-1111-4111-8111-111111111111";
const CLIENT_ID = "22222222-2222-4222-8222-222222222222";
const STAFF_ID = "33333333-3333-4333-8333-333333333333";
const TENANT_ID = "44444444-4444-4444-8444-444444444444";

function createFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

function createUpdateChain<Result>(result: Result) {
  const chain = {
    eq: vi.fn(() => chain),
    gt: vi.fn(() => chain),
    in: vi.fn(() => chain),
    is: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => result),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createDeleteChain(result: { error: unknown } = { error: null }) {
  const chain = {
    eq: vi.fn((column: string) => {
      if (column === "id" || column === "user_id") {
        return Promise.resolve(result);
      }

      return chain;
    }),
  };

  return chain;
}

function createUserEmailLookupChain(result: { data: { id: string } | null; error: unknown } = {
  data: null,
  error: null,
}) {
  const chain = {
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => result),
  };

  return chain;
}

function createTenantCleanupChain(result: { data: { id: string } | null; error: unknown } = {
  data: { id: TENANT_ID },
  error: null,
}) {
  const chain = {
    eq: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => result),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createCountChain(count: number | null) {
  const chain = {
    eq: vi.fn(() => chain),
    gt: vi.fn(async () => ({ count })),
    in: vi.fn(() => chain),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createCountErrorChain() {
  const chain = {
    eq: vi.fn(() => chain),
    gt: vi.fn(async () => ({ count: null, error: { code: "500" } })),
    in: vi.fn(() => chain),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createTenantTimezoneChain(timezone = "Europe/Prague") {
  const chain = {
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => ({ data: { timezone }, error: null })),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createTenantTimezoneErrorChain() {
  const chain = {
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => ({ data: null, error: { code: "500" } })),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createBookingsForExceptionChain(
  result: {
    data: Array<{ ends_at: string; starts_at: string }> | null;
    error: unknown;
  },
) {
  const chain = {
    eq: vi.fn(() => chain),
    gt: vi.fn(() => chain),
    gte: vi.fn(() => chain),
    in: vi.fn(() => chain),
    lt: vi.fn(async () => result),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createFutureBookingsChain(
  result: {
    data: Array<{ ends_at: string; starts_at: string }> | null;
    error: unknown;
  },
) {
  const chain = {
    eq: vi.fn(() => chain),
    gt: vi.fn(async () => result),
    in: vi.fn(() => chain),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createFutureStaffExceptionsChain(
  result: {
    data: Array<{ date: string; end_time: string | null; is_working: boolean; start_time: string | null }> | null;
    error: unknown;
  },
) {
  const chain = {
    eq: vi.fn(() => chain),
    gte: vi.fn(async () => result),
    select: vi.fn(() => chain),
  };

  return chain;
}

describe("server actions hardening", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.hasSupabaseEnv.mockReturnValue(true);
    mocks.findMatchingClient.mockResolvedValue(null);
    mocks.getTenantOwnerRecipients.mockResolvedValue([]);
    mocks.limitLogin.mockResolvedValue({ success: true });
    mocks.limitPublicBooking.mockResolvedValue({ success: true });
    mocks.limitRegister.mockResolvedValue({ success: true });
  });

  it("nezapise event ani neposle email, kdyz self-service zruseni nic neupravi", async () => {
    const bookingsUpdateChain = createUpdateChain({ data: null, error: null });
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            update: vi.fn(() => bookingsUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken.mockResolvedValue({
      id: BOOKING_ID,
      tenant_id: TENANT_ID,
      service_id: "55555555-5555-4555-8555-555555555555",
      starts_at: "2026-04-27T10:00:00.000Z",
      ends_at: "2026-04-27T11:00:00.000Z",
      status: "confirmed",
      clients: { email: "klient@example.com", full_name: "Jan Novak", id: CLIENT_ID },
      services: { name: "Střih" },
      staff: { name: "Eva" },
      tenants: { name: "Demo podnik" },
    });
    mocks.getSelfServiceCancellationState.mockReturnValue({
      canCancel: true,
      depositAmount: 5000,
      depositPaid: true,
      depositPolicy: "Záloha je zaplacená.",
      hoursUntilStart: 48,
      noticeHours: 0,
      reason: null,
    });

    const result = await cancelManagedBookingAction(
      {},
      createFormData({ token: "a".repeat(64) }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo zrušit. Zkuste to prosím znovu.",
    });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.sendBookingCancellationEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("self-service zruseni zustane uspesne, kdyz selze navazujici historie", async () => {
    const bookingsUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            update: vi.fn(() => bookingsUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: vi.fn(() => {
              throw new Error("Audit unavailable");
            }),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken.mockResolvedValue({
      id: BOOKING_ID,
      tenant_id: TENANT_ID,
      service_id: "55555555-5555-4555-8555-555555555555",
      starts_at: "2026-04-27T10:00:00.000Z",
      ends_at: "2026-04-27T11:00:00.000Z",
      status: "confirmed",
      clients: { email: "klient@example.com", full_name: "Jan Novak", id: CLIENT_ID },
      services: { name: "Střih" },
      staff: { name: "Eva" },
      tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
    });
    mocks.getSelfServiceCancellationState.mockReturnValue({
      canCancel: true,
      noticeHours: 0,
      reason: null,
    });

    const result = await cancelManagedBookingAction(
      {},
      createFormData({ token: "b".repeat(64) }),
    );

    expect(result).toEqual({ success: "Rezervace byla zrušena." });
    expect(supabase.from).toHaveBeenCalledWith("booking_events");
    expect(mocks.skipPendingBookingReminders).toHaveBeenCalledOnce();
    expect(mocks.revokeBookingSelfServiceTokens).toHaveBeenCalledOnce();
    expect(mocks.sendBookingCancellationEmail).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/manage/${"b".repeat(64)}`);
  });

  it("self-service sprava nespadne, kdyz chybi service role konfigurace", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);

    const result = await cancelManagedBookingAction(
      {},
      createFormData({ token: "a".repeat(64) }),
    );

    expect(result).toEqual({ error: "Správa rezervace není v demo režimu dostupná." });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("self-service zruseni vrati jasnou chybu, kdyz nejde overit rezervaci", async () => {
    mocks.createAdminClient.mockReturnValue({});
    mocks.getBookingBySelfServiceToken.mockRejectedValueOnce(new Error("Database unavailable"));

    const result = await cancelManagedBookingAction(
      {},
      createFormData({ token: "a".repeat(64) }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo ověřit. Zkuste to prosím znovu.",
    });
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.sendBookingCancellationEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("registrace nespadne, kdyz chybi service role konfigurace", async () => {
    mocks.hasSupabaseAdminEnv.mockReturnValue(false);

    const result = await registerAction(
      {},
      createFormData({
        businessName: "Demo podnik",
        email: "owner@example.com",
        fullName: "Owner Novak",
        password: "supersecret",
      }),
    );

    expect(result).toEqual({ error: "Registrace vyžaduje Supabase service role klíč." });
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("registrace vrati jasnou chybu, kdyz po selhani auth uctu nejde uklidit tenant", async () => {
    const tenantSearchChain = {
      ilike: vi.fn(() => tenantSearchChain),
      is: vi.fn(() => tenantSearchChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    };
    const tenantInsertChain = {
      select: vi.fn(() => tenantInsertChain),
      single: vi.fn(async () => ({ data: { id: TENANT_ID }, error: null })),
    };
    const tenantCleanupChain = createTenantCleanupChain({ data: null, error: { code: "500" } });
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ data: { user: null }, error: { message: "Auth failed" } })),
        },
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            insert: vi.fn(() => tenantInsertChain),
            select: vi.fn(() => tenantSearchChain),
            update: vi.fn(() => tenantCleanupChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.createClient.mockResolvedValue({ auth: {} });

    const result = await registerAction(
      {},
      createFormData({
        businessName: "Demo podnik",
        email: "owner@example.com",
        fullName: "Owner Novak",
        password: "supersecret",
      }),
    );

    expect(result).toEqual({
      error: "Registraci se nepodařilo dokončit a rozpracovaná data se nepodařilo uklidit.",
    });
    expect(tenantCleanupChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
  });

  it("registrace vrati srozumitelnou chybu, kdyz je email uz pouzity", async () => {
    const tenantSearchChain = {
      ilike: vi.fn(() => tenantSearchChain),
      is: vi.fn(() => tenantSearchChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    };
    const tenantInsertChain = {
      select: vi.fn(() => tenantInsertChain),
      single: vi.fn(async () => ({ data: { id: TENANT_ID }, error: null })),
    };
    const tenantCleanupChain = createTenantCleanupChain();
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({
            data: { user: null },
            error: {
              message: "A user with this email address has already been registered",
              status: 422,
            },
          })),
        },
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            insert: vi.fn(() => tenantInsertChain),
            select: vi.fn(() => tenantSearchChain),
            update: vi.fn(() => tenantCleanupChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.createClient.mockResolvedValue({ auth: {} });

    const result = await registerAction(
      {},
      createFormData({
        businessName: "Demo podnik",
        email: "owner@example.com",
        fullName: "Owner Novak",
        password: "supersecret",
      }),
    );

    expect(result).toEqual({
      error: "E-mail už je použitý. Přihlaste se, nebo použijte jiný e-mail.",
    });
    expect(tenantCleanupChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
  });

  it("registrace vrati jasnou chybu, kdyz cleanup tenanta nenajde zadny radek", async () => {
    const tenantSearchChain = {
      ilike: vi.fn(() => tenantSearchChain),
      is: vi.fn(() => tenantSearchChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    };
    const tenantInsertChain = {
      select: vi.fn(() => tenantInsertChain),
      single: vi.fn(async () => ({ data: { id: TENANT_ID }, error: null })),
    };
    const tenantCleanupChain = createTenantCleanupChain({ data: null, error: null });
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ data: { user: null }, error: { message: "Auth failed" } })),
        },
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            insert: vi.fn(() => tenantInsertChain),
            select: vi.fn(() => tenantSearchChain),
            update: vi.fn(() => tenantCleanupChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.createClient.mockResolvedValue({ auth: {} });

    const result = await registerAction(
      {},
      createFormData({
        businessName: "Demo podnik",
        email: "owner@example.com",
        fullName: "Owner Novak",
        password: "supersecret",
      }),
    );

    expect(result).toEqual({
      error: "Registraci se nepodařilo dokončit a rozpracovaná data se nepodařilo uklidit.",
    });
    expect(tenantCleanupChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
    expect(tenantCleanupChain.select).toHaveBeenCalledWith("id");
  });

  it("registrace vrati jasnou chybu, kdyz po selhani profilu nejde uklidit auth uzivatele", async () => {
    const userId = "99999999-9999-4999-8999-999999999999";
    const tenantSearchChain = {
      ilike: vi.fn(() => tenantSearchChain),
      is: vi.fn(() => tenantSearchChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    };
    const tenantInsertChain = {
      select: vi.fn(() => tenantInsertChain),
      single: vi.fn(async () => ({ data: { id: TENANT_ID }, error: null })),
    };
    const tenantCleanupChain = createTenantCleanupChain();
    const deleteUser = vi.fn(async () => ({ error: { message: "Delete failed" } }));
    const tenantUsersInsert = vi.fn(async () => ({ error: null }));
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ data: { user: { id: userId } }, error: null })),
          deleteUser,
        },
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            insert: vi.fn(() => tenantInsertChain),
            select: vi.fn(() => tenantSearchChain),
            update: vi.fn(() => tenantCleanupChain),
          };
        }

        if (table === "users") {
          return {
            insert: vi.fn(async () => ({ error: { code: "500" } })),
          };
        }

        if (table === "tenant_users") {
          return {
            insert: tenantUsersInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.createClient.mockResolvedValue({ auth: {} });

    const result = await registerAction(
      {},
      createFormData({
        businessName: "Demo podnik",
        email: "owner@example.com",
        fullName: "Owner Novak",
        password: "supersecret",
      }),
    );

    expect(result).toEqual({
      error: "Registraci se nepodařilo dokončit a rozpracovaná data se nepodařilo uklidit.",
    });
    expect(deleteUser).toHaveBeenCalledWith(userId);
    expect(tenantCleanupChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
    expect(tenantUsersInsert).not.toHaveBeenCalled();
  });

  it("registrace po selhani pristupu do podniku uklidi auth uzivatele i verejny profil", async () => {
    const userId = "99999999-9999-4999-8999-999999999999";
    const tenantSearchChain = {
      ilike: vi.fn(() => tenantSearchChain),
      is: vi.fn(() => tenantSearchChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    };
    const tenantInsertChain = {
      select: vi.fn(() => tenantInsertChain),
      single: vi.fn(async () => ({ data: { id: TENANT_ID }, error: null })),
    };
    const tenantCleanupChain = createTenantCleanupChain();
    const usersDeleteChain = {
      eq: vi.fn(async () => ({ error: null })),
    };
    const deleteUser = vi.fn(async () => ({ error: null }));
    const signInWithPassword = vi.fn();
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ data: { user: { id: userId } }, error: null })),
          deleteUser,
        },
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            insert: vi.fn(() => tenantInsertChain),
            select: vi.fn(() => tenantSearchChain),
            update: vi.fn(() => tenantCleanupChain),
          };
        }

        if (table === "users") {
          return {
            delete: vi.fn(() => usersDeleteChain),
            insert: vi.fn(async () => ({ error: null })),
          };
        }

        if (table === "tenant_users") {
          return {
            insert: vi.fn(async () => ({ error: { code: "500" } })),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.createClient.mockResolvedValue({
      auth: {
        signInWithPassword,
      },
    });

    const result = await registerAction(
      {},
      createFormData({
        businessName: "Demo podnik",
        email: "owner@example.com",
        fullName: "Owner Novak",
        password: "supersecret",
      }),
    );

    expect(result).toEqual({ error: "Registraci se nepodařilo dokončit." });
    expect(usersDeleteChain.eq).toHaveBeenCalledWith("id", userId);
    expect(deleteUser).toHaveBeenCalledWith(userId);
    expect(tenantCleanupChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("registrace vrati presnou chybu, kdyz po selhani pristupu do podniku nejde uklidit verejny profil", async () => {
    const userId = "99999999-9999-4999-8999-999999999999";
    const tenantSearchChain = {
      ilike: vi.fn(() => tenantSearchChain),
      is: vi.fn(() => tenantSearchChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    };
    const tenantInsertChain = {
      select: vi.fn(() => tenantInsertChain),
      single: vi.fn(async () => ({ data: { id: TENANT_ID }, error: null })),
    };
    const tenantCleanupChain = createTenantCleanupChain();
    const usersDeleteChain = {
      eq: vi.fn(async () => ({ error: { code: "500" } })),
    };
    const deleteUser = vi.fn(async () => ({ error: null }));
    const signInWithPassword = vi.fn();
    const admin = {
      auth: {
        admin: {
          createUser: vi.fn(async () => ({ data: { user: { id: userId } }, error: null })),
          deleteUser,
        },
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            insert: vi.fn(() => tenantInsertChain),
            select: vi.fn(() => tenantSearchChain),
            update: vi.fn(() => tenantCleanupChain),
          };
        }

        if (table === "users") {
          return {
            delete: vi.fn(() => usersDeleteChain),
            insert: vi.fn(async () => ({ error: null })),
          };
        }

        if (table === "tenant_users") {
          return {
            insert: vi.fn(async () => ({ error: { code: "500" } })),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.createClient.mockResolvedValue({
      auth: {
        signInWithPassword,
      },
    });

    const result = await registerAction(
      {},
      createFormData({
        businessName: "Demo podnik",
        email: "owner@example.com",
        fullName: "Owner Novak",
        password: "supersecret",
      }),
    );

    expect(result).toEqual({
      error: "Registraci se nepodařilo dokončit a rozpracovaná data se nepodařilo uklidit.",
    });
    expect(usersDeleteChain.eq).toHaveBeenCalledWith("id", userId);
    expect(deleteUser).toHaveBeenCalledWith(userId);
    expect(tenantCleanupChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("login nespadne, kdyz rate limit provider docasne selze", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: { message: "Invalid credentials" } }));
    mocks.createClient.mockResolvedValue({
      auth: {
        signInWithPassword,
      },
    });
    mocks.limitLogin.mockRejectedValueOnce(new Error("Redis unavailable"));

    const result = await loginAction(
      {},
      createFormData({
        email: "owner@example.com",
        password: "supersecret",
        redirectedFrom: "/calendar",
      }),
    );

    expect(result).toEqual({ error: "Neplatné přihlašovací údaje." });
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "supersecret",
    });
  });

  it("reset hesla posle odkaz pres Supabase bez prozrazeni existence uctu", async () => {
    const resetPasswordForEmail = vi.fn(async () => ({ error: null }));

    mocks.createClient.mockResolvedValue({
      auth: {
        resetPasswordForEmail,
      },
    });

    const result = await requestPasswordResetAction(
      {},
      createFormData({
        email: "owner@example.com",
      }),
    );

    expect(result).toEqual({
      success: "Pokud e-mail v Temaru existuje, poslali jsme na něj odkaz pro nastavení nového hesla.",
    });
    expect(resetPasswordForEmail).toHaveBeenCalledWith("owner@example.com", {
      redirectTo: "http://localhost:3000/auth/callback?next=%2Freset-password",
    });
  });

  it("reset hesla vrati stejnou odpoved i pri Supabase chybe", async () => {
    const resetPasswordForEmail = vi.fn(async () => ({ error: { message: "User not found" } }));

    mocks.createClient.mockResolvedValue({
      auth: {
        resetPasswordForEmail,
      },
    });

    const result = await requestPasswordResetAction(
      {},
      createFormData({
        email: "missing@example.com",
      }),
    );

    expect(result).toEqual({
      success: "Pokud e-mail v Temaru existuje, poslali jsme na něj odkaz pro nastavení nového hesla.",
    });
  });

  it("nastaveni noveho hesla aktualizuje heslo v aktivni recovery session", async () => {
    const signOut = vi.fn(async () => ({ error: null }));
    const updateUser = vi.fn(async () => ({ error: null }));

    mocks.createClient.mockResolvedValue({
      auth: {
        signOut,
        updateUser,
      },
    });

    const result = await updatePasswordAction(
      {},
      createFormData({
        password: "newsecret123",
      }),
    );

    expect(result).toEqual({ success: "Heslo bylo změněné. Teď se můžete přihlásit." });
    expect(updateUser).toHaveBeenCalledWith({ password: "newsecret123" });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("login odhlasi relaci, kdyz po prihlaseni nejde nacist uzivatele", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: { user: null },
          error: { message: "Session unavailable" },
        })),
        signInWithPassword,
        signOut,
      },
    });

    const result = await loginAction(
      {},
      createFormData({
        email: "owner@example.com",
        password: "supersecret",
        redirectedFrom: "/dashboard",
      }),
    );

    expect(result).toEqual({ error: "Účet není přiřazený k žádnému podniku." });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("login odhlasi staff ucet bez propojeneho zamestnance", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              app_metadata: {
                role: "staff",
                tenant_id: TENANT_ID,
              },
            },
          },
          error: null,
        })),
        signInWithPassword,
        signOut,
      },
    });

    const result = await loginAction(
      {},
      createFormData({
        email: "staff@example.com",
        password: "supersecret",
        redirectedFrom: "/dashboard",
      }),
    );

    expect(result).toEqual({ error: "Staff účet není propojený se zaměstnancem." });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("login odhlasi ucet bez role v podniku", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              app_metadata: {
                tenant_id: TENANT_ID,
              },
            },
          },
          error: null,
        })),
        signInWithPassword,
        signOut,
      },
    });

    const result = await loginAction(
      {},
      createFormData({
        email: "staff@example.com",
        password: "supersecret",
        redirectedFrom: "/dashboard",
      }),
    );

    expect(result).toEqual({ error: "Účet nemá přiřazenou roli v podniku." });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("login odhlasi owner ucet, kdyz tenant uz neni aktivni", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    const tenantLookupChain = createUpdateChain({ data: null, error: null });
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              app_metadata: {
                role: "owner",
                tenant_id: TENANT_ID,
              },
            },
          },
          error: null,
        })),
        signInWithPassword,
        signOut,
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantLookupChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await loginAction(
      {},
      createFormData({
        email: "owner@example.com",
        password: "supersecret",
        redirectedFrom: "/dashboard",
      }),
    );

    expect(result).toEqual({ error: "Účet není přiřazený k žádnému podniku." });
    expect(tenantLookupChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("login odhlasi owner ucet, kdyz aktivniho tenanta nejde overit", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    const tenantLookupChain = createUpdateChain({ data: null, error: { code: "500" } });
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              app_metadata: {
                role: "owner",
                tenant_id: TENANT_ID,
              },
            },
          },
          error: null,
        })),
        signInWithPassword,
        signOut,
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantLookupChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await loginAction(
      {},
      createFormData({
        email: "owner@example.com",
        password: "supersecret",
        redirectedFrom: "/dashboard",
      }),
    );

    expect(result).toEqual({ error: "Účet není přiřazený k žádnému podniku." });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("login odhlasi staff ucet, kdyz propojeny zamestnanec uz neni aktivni", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    const tenantLookupChain = createUpdateChain({ data: { id: TENANT_ID }, error: null });
    const staffLookupChain = createUpdateChain({ data: null, error: null });
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              app_metadata: {
                role: "staff",
                staff_id: STAFF_ID,
                tenant_id: TENANT_ID,
              },
            },
          },
          error: null,
        })),
        signInWithPassword,
        signOut,
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantLookupChain),
          };
        }

        if (table === "staff") {
          return {
            select: vi.fn(() => staffLookupChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await loginAction(
      {},
      createFormData({
        email: "staff@example.com",
        password: "supersecret",
        redirectedFrom: "/dashboard",
      }),
    );

    expect(result).toEqual({ error: "Staff účet není propojený se zaměstnancem." });
    expect(staffLookupChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(staffLookupChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("login odhlasi staff ucet, kdyz aktivni profil zamestnance nejde overit", async () => {
    const signInWithPassword = vi.fn(async () => ({ error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    const tenantLookupChain = createUpdateChain({ data: { id: TENANT_ID }, error: null });
    const staffLookupChain = createUpdateChain({ data: null, error: { code: "500" } });
    mocks.createClient.mockResolvedValue({
      auth: {
        getUser: vi.fn(async () => ({
          data: {
            user: {
              app_metadata: {
                role: "staff",
                staff_id: STAFF_ID,
                tenant_id: TENANT_ID,
              },
            },
          },
          error: null,
        })),
        signInWithPassword,
        signOut,
      },
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantLookupChain),
          };
        }

        if (table === "staff") {
          return {
            select: vi.fn(() => staffLookupChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    });

    const result = await loginAction(
      {},
      createFormData({
        email: "staff@example.com",
        password: "supersecret",
        redirectedFrom: "/dashboard",
      }),
    );

    expect(result).toEqual({ error: "Staff účet není propojený se zaměstnancem." });
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("nevrati uspech, kdyz verejna rezervace nevrati vytvorenou rezervaci", async () => {
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: null, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo vytvořit. Vyberte prosím jiný termín.",
    });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.sendBookingPendingEmail).not.toHaveBeenCalled();
    expect(mocks.sendOwnerNewBookingEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("verejna rezervace odmitne lokalni cas bez timezone jeste pred databazi", async () => {
    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result.error).toBeTruthy();
    expect(mocks.limitPublicBooking).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("cekaci listina odmitne kontakt bez telefonu a emailu jeste pred databazi", async () => {
    const result = await joinWaitlistAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: "",
        clientName: "Jan Novak",
        clientEmail: "",
        clientPhone: "",
        notes: "Chci dopoledne",
      }),
    );

    expect(result).toEqual({ error: "Pro čekací listinu vyplňte telefon nebo e-mail." });
    expect(mocks.limitPublicBooking).not.toHaveBeenCalled();
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("cekaci listina uklada verejny tracking pres service-role RPC", async () => {
    const rpc = vi.fn(async () => ({
      data: { id: "66666666-6666-4666-8666-666666666666" },
      error: null,
    }));
    const supabase = { rpc };

    mocks.createAdminClient.mockReturnValue(supabase);

    const result = await joinWaitlistAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Chci dopoledne",
        source: "qr",
        sourceDetail: "Recepce",
        utmSource: "qr",
        utmMedium: "offline",
        utmCampaign: "jarni-akce",
        ref: "letak",
      }),
    );

    expect(result).toEqual({
      success: "Jste na čekací listině. Podnik se ozve, jakmile se uvolní vhodný termín.",
    });
    expect(mocks.limitPublicBooking).toHaveBeenCalledWith("test-business");
    expect(rpc).toHaveBeenCalledWith("create_waitlist_entry", {
      p_tenant_slug: "test-business",
      p_service_id: "55555555-5555-4555-8555-555555555555",
      p_staff_id: STAFF_ID,
      p_client_name: "Jan Novak",
      p_client_phone: "+420777123456",
      p_client_email: "jan@example.com",
      p_notes: "Chci dopoledne",
      p_source: "qr",
      p_source_detail: "Recepce",
      p_source_metadata: {
        ref: "letak",
        utm_campaign: "jarni-akce",
        utm_medium: "offline",
        utm_source: "qr",
      },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("verejna rezervace nespadne, kdyz rate limit provider docasne selze", async () => {
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID, tenant_id: TENANT_ID }, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.limitPublicBooking.mockRejectedValueOnce(new Error("Redis unavailable"));

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit.",
    });
    expect(bookingEventsInsert).toHaveBeenCalledOnce();
    expect(mocks.sendBookingPendingEmail).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("verejna rezervace zustane uspesna, kdyz selze zapis historie", async () => {
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: vi.fn(() => {
              throw new Error("Audit unavailable");
            }),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID, tenant_id: TENANT_ID }, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit.",
    });
    expect(mocks.sendBookingPendingEmail).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("verejna rezervace zustane uspesna, kdyz selzou navazujici notifikace", async () => {
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID, tenant_id: TENANT_ID }, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.sendBookingPendingEmail.mockRejectedValueOnce(new Error("Email unavailable"));

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit.",
    });
    expect(bookingEventsInsert).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("verejna rezervace zustane uspesna, kdyz selze obnoveni cache", async () => {
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID, tenant_id: TENANT_ID }, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.revalidatePath.mockImplementationOnce(() => {
      throw new Error("Cache unavailable");
    });

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit.",
    });
    expect(bookingEventsInsert).toHaveBeenCalledOnce();
    expect(mocks.sendBookingPendingEmail).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("verejna rezervace zustane uspesna, kdyz nejde nacist detail pro notifikace", async () => {
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({ data: null, error: { code: "500" } })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID, tenant_id: TENANT_ID }, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit.",
    });
    expect(bookingEventsInsert).toHaveBeenCalledOnce();
    expect(mocks.sendBookingPendingEmail).not.toHaveBeenCalled();
    expect(mocks.sendOwnerNewBookingEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("verejna rezervace posle klientovi manage odkaz a upozorni ownery", async () => {
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID, tenant_id: TENANT_ID }, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.createBookingSelfServiceToken.mockResolvedValue({
      url: "http://localhost:3000/manage/token-123",
    });
    mocks.getTenantOwnerRecipients.mockResolvedValue(["owner@example.com"]);

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit.",
    });
    expect(mocks.createBookingSelfServiceToken).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      tenantId: TENANT_ID,
    });
    expect(mocks.sendBookingPendingEmail).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        clientEmail: "jan@example.com",
        manageUrl: "http://localhost:3000/manage/token-123",
        tenantId: TENANT_ID,
        timeZone: "Europe/Prague",
      }),
    );
    expect(mocks.sendOwnerNewBookingEmail).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        tenantId: TENANT_ID,
      }),
      ["owner@example.com"],
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("verejna rezervace nespadne, kdyz nejde vytvorit manage odkaz", async () => {
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID, tenant_id: TENANT_ID }, error: null })),
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.createBookingSelfServiceToken.mockRejectedValueOnce(new Error("token failed"));

    const result = await createPublicBookingAction(
      {},
      createFormData({
        slug: "test-business",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        clientName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      success: "Rezervace byla odeslána. Podnik ji ještě musí potvrdit.",
    });
    expect(mocks.sendBookingPendingEmail).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        manageUrl: null,
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/test-business");
  });

  it("nevrati uspech, kdyz rucni rezervace nevrati vytvorenou rezervaci", async () => {
    const bookingEventsInsert = vi.fn();
    const tenantTimezoneChain = createTenantTimezoneChain("UTC");
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: null, error: null })),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createManualBookingAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        sendNotification: "on",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo vytvořit. Termín může být obsazený.",
    });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.sendBookingConfirmationEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rucni rezervace se zastavi, kdyz nejde overit timezone podniku", async () => {
    const tenantTimezoneChain = createTenantTimezoneErrorChain();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createManualBookingAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({ error: "Timezone podniku se nepodařilo ověřit." });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("pri rucni rezervaci bez checkboxu neposle potvrzovaci email ani reminder", async () => {
    const bookingEventsInsert = vi.fn();
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(async () => ({ data: { id: BOOKING_ID }, error: null })),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    await expect(createManualBookingAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        returnTo: "/calendar?view=week",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00",
        notes: "Poznamka",
      }),
    )).rejects.toThrow("NEXT_REDIRECT");
    expect(supabase.rpc).toHaveBeenCalledWith("create_booking", expect.objectContaining({
      p_starts_at: "2026-04-28T08:00:00.000Z",
    }));
    expect(bookingEventsInsert).toHaveBeenCalledOnce();
    expect(mocks.sendBookingConfirmationEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("rucni rezervace nevytvori duplicitniho klienta, kdyz nejde overit existujici klient", async () => {
    const tenantTimezoneChain = createTenantTimezoneChain("UTC");
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });
    mocks.findMatchingClient.mockRejectedValueOnce(new Error("Database unavailable"));

    const result = await createManualBookingAction(
      {},
      createFormData({
        clientId: "",
        clientFullName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Existujícího klienta se nepodařilo ověřit.",
    });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("rucni rezervace nepouzije existujiciho klienta, kdyz je mezitim skryty", async () => {
    const tenantTimezoneChain = createTenantTimezoneChain("UTC");
    const clientUpdateChain = createUpdateChain({ data: null, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "clients") {
          return {
            update: vi.fn(() => clientUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });
    mocks.findMatchingClient.mockResolvedValueOnce({
      created_at: "2026-04-01T00:00:00.000Z",
      deleted_at: null,
      email: "jan@example.com",
      flag_reason: null,
      full_name: "Jan Novak",
      id: CLIENT_ID,
      is_flagged: false,
      no_show_count: 0,
      notes: null,
      phone: "+420777123456",
      preferred_staff_id: null,
      tenant_id: TENANT_ID,
    });

    const result = await createManualBookingAction(
      {},
      createFormData({
        clientId: "",
        clientFullName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Existujícího klienta se nepodařilo použít.",
    });
    expect(clientUpdateChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("rucni rezervace neupravi blokovaneho existujiciho klienta", async () => {
    const tenantTimezoneChain = createTenantTimezoneChain("UTC");
    const clientsUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "clients") {
          return {
            update: clientsUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });
    mocks.findMatchingClient.mockResolvedValueOnce({
      created_at: "2026-04-01T00:00:00.000Z",
      deleted_at: null,
      email: "jan@example.com",
      flag_reason: "Blokace",
      full_name: "Jan Novak",
      id: CLIENT_ID,
      is_blacklisted: true,
      is_flagged: true,
      no_show_count: 0,
      notes: null,
      phone: "+420777123456",
      preferred_staff_id: null,
      tenant_id: TENANT_ID,
    });

    const result = await createManualBookingAction(
      {},
      createFormData({
        clientId: "",
        clientFullName: "Jan Novak",
        clientEmail: "jan@example.com",
        clientPhone: "+420777123456",
        serviceId: "55555555-5555-4555-8555-555555555555",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Klienta nelze použít pro rezervaci.",
    });
    expect(clientsUpdate).not.toHaveBeenCalled();
    expect(supabase.rpc).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("vytvoreni klienta vyzaduje prihlaseni i v demo rezimu pred validaci", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await createClientAction(
      {},
      createFormData({
        fullName: "",
        phone: "abc",
        email: "neplatny-email",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
  });

  it("vytvoreni klienta v demo rezimu nejdriv validuje formular", async () => {
    const supabase = { from: vi.fn() };

    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createClientAction(
      {},
      createFormData({
        fullName: "",
        phone: "abc",
        email: "neplatny-email",
      }),
    );

    expect(result).toEqual({ error: "Jméno musí mít alespoň 2 znaky." });
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("flag klienta vyzaduje prihlaseni i v demo rezimu pred validaci", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await toggleClientFlagAction(
      {},
      createFormData({
        clientId: "neplatne-id",
        isFlagged: "false",
        flagReason: "Opakovane no-show",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
  });

  it("flag klienta v demo rezimu nejdriv validuje formular", async () => {
    const supabase = { from: vi.fn() };

    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await toggleClientFlagAction(
      {},
      createFormData({
        clientId: "neplatne-id",
        isFlagged: "false",
        flagReason: "Opakovane no-show",
      }),
    );

    expect(result).toEqual({ error: "Invalid UUID" });
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("skryti klienta vyzaduje prihlaseni i v demo rezimu pred validaci", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await hideClientAction(
      {},
      createFormData({
        clientId: "neplatne-id",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
  });

  it("skryti klienta v demo rezimu nejdriv validuje formular", async () => {
    const supabase = { from: vi.fn() };

    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideClientAction(
      {},
      createFormData({
        clientId: "neplatne-id",
      }),
    );

    expect(result).toEqual({ error: "Klienta se nepodařilo ověřit." });
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("uprava klienta vyzaduje prihlaseni i v demo rezimu pred validaci", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await updateClientAction(
      {},
      createFormData({
        clientId: "neplatne-id",
        fullName: "",
        phone: "abc",
        email: "neplatny-email",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
  });

  it("uprava klienta v demo rezimu nejdriv validuje formular", async () => {
    const supabase = { from: vi.fn() };

    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateClientAction(
      {},
      createFormData({
        clientId: "neplatne-id",
        fullName: "",
        phone: "abc",
        email: "neplatny-email",
      }),
    );

    expect(result).toEqual({ error: "Jméno musí mít alespoň 2 znaky." });
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("staff owner actions vyzaduji prihlaseni i v demo rezimu pred validaci", async () => {
    const cases: Array<{
      action: (_state: Record<string, never>, formData: FormData) => Promise<{ error?: string; success?: string }>;
      formData: FormData;
    }> = [
      {
        action: createStaffAction,
        formData: createFormData({
          name: "",
          startTime: "abc",
          endTime: "abc",
        }),
      },
      {
        action: inviteStaffUserAction,
        formData: createFormData({
          fullName: "",
          email: "neplatny-email",
          staffId: "neplatne-id",
        }),
      },
      {
        action: hideStaffAction,
        formData: createFormData({
          staffId: "neplatne-id",
        }),
      },
      {
        action: assignStaffServiceAction,
        formData: createFormData({
          staffId: "neplatne-id",
          serviceId: "neplatne-id",
        }),
      },
      {
        action: removeStaffServiceAction,
        formData: createFormData({
          staffId: "neplatne-id",
          serviceId: "neplatne-id",
        }),
      },
      {
        action: createStaffExceptionAction,
        formData: createFormData({
          staffId: "neplatne-id",
          date: "neplatne-datum",
          isWorking: "true",
          startTime: "abc",
          endTime: "abc",
        }),
      },
      {
        action: updateStaffAction,
        formData: createFormData({
          staffId: "neplatne-id",
          name: "",
          startTime: "abc",
          endTime: "abc",
        }),
      },
    ];

    for (const testCase of cases) {
      vi.clearAllMocks();
      mocks.hasSupabaseEnv.mockReturnValue(false);
      mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

      const result = await testCase.action({}, testCase.formData);

      expect(result).toEqual({ error: "Přihlaste se znovu." });
      expect(mocks.requireOwner).toHaveBeenCalledOnce();
      expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
      expect(mocks.hasSupabaseAdminEnv).not.toHaveBeenCalled();
    }
  });

  it("staff owner actions v demo rezimu nejdriv validuji formular", async () => {
    const cases: Array<{
      action: (_state: Record<string, never>, formData: FormData) => Promise<{ error?: string; success?: string }>;
      formData: FormData;
    }> = [
      {
        action: createStaffAction,
        formData: createFormData({
          name: "",
          startTime: "abc",
          endTime: "abc",
        }),
      },
      {
        action: inviteStaffUserAction,
        formData: createFormData({
          fullName: "",
          email: "neplatny-email",
          staffId: "neplatne-id",
        }),
      },
      {
        action: hideStaffAction,
        formData: createFormData({
          staffId: "neplatne-id",
        }),
      },
      {
        action: assignStaffServiceAction,
        formData: createFormData({
          staffId: "neplatne-id",
          serviceId: "neplatne-id",
        }),
      },
      {
        action: removeStaffServiceAction,
        formData: createFormData({
          staffId: "neplatne-id",
          serviceId: "neplatne-id",
        }),
      },
      {
        action: createStaffExceptionAction,
        formData: createFormData({
          staffId: "neplatne-id",
          date: "neplatne-datum",
          isWorking: "true",
          startTime: "abc",
          endTime: "abc",
        }),
      },
      {
        action: updateStaffAction,
        formData: createFormData({
          staffId: "neplatne-id",
          name: "",
          startTime: "abc",
          endTime: "abc",
        }),
      },
    ];

    for (const testCase of cases) {
      const supabase = { from: vi.fn() };

      vi.clearAllMocks();
      mocks.hasSupabaseEnv.mockReturnValue(false);
      mocks.requireOwner.mockResolvedValue({
        supabase,
        tenantId: TENANT_ID,
        user: { id: "66666666-6666-4666-8666-666666666666" },
      });

      const result = await testCase.action({}, testCase.formData);

      expect(result.error).toBeTruthy();
      expect(result.success).toBeUndefined();
      expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
      expect(mocks.hasSupabaseAdminEnv).not.toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalled();
    }
  });

  it("kalendarove owner actions vyzaduji prihlaseni i v demo rezimu pred dalsimi kroky", async () => {
    const cases: Array<{
      action: (_state: Record<string, never>, formData: FormData) => Promise<{ error?: string; success?: string }>;
      formData: FormData;
    }> = [
      {
        action: createManualBookingAction,
        formData: createFormData({
          clientFullName: "",
          serviceId: "neplatne-id",
          staffId: "neplatne-id",
          startsAt: "neplatny-cas",
        }),
      },
      {
        action: completeBookingAction,
        formData: createFormData({
          bookingId: "neplatne-id",
        }),
      },
      {
        action: confirmBookingAction,
        formData: createFormData({
          bookingId: "neplatne-id",
        }),
      },
      {
        action: cancelBookingAction,
        formData: createFormData({
          bookingId: "neplatne-id",
          cancellationReason: "Duvod",
        }),
      },
      {
        action: updateBookingAction,
        formData: createFormData({
          bookingId: "neplatne-id",
          serviceId: "neplatne-id",
          staffId: "neplatne-id",
          startsAt: "neplatny-cas",
        }),
      },
      {
        action: markNoShowAction,
        formData: createFormData({
          bookingId: "neplatne-id",
        }),
      },
    ];

    for (const testCase of cases) {
      vi.clearAllMocks();
      mocks.hasSupabaseEnv.mockReturnValue(false);
      mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

      const result = await testCase.action({}, testCase.formData);

      expect(result).toEqual({ error: "Přihlaste se znovu." });
      expect(mocks.requireOwner).toHaveBeenCalledOnce();
      expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
    }
  });

  it("jednoduche kalendarove actions v demo rezimu nejdriv validuji formular", async () => {
    const cases: Array<{
      action: (_state: Record<string, never>, formData: FormData) => Promise<{ error?: string; success?: string }>;
      formData: FormData;
    }> = [
      {
        action: completeBookingAction,
        formData: createFormData({
          bookingId: "neplatne-id",
        }),
      },
      {
        action: confirmBookingAction,
        formData: createFormData({
          bookingId: "neplatne-id",
        }),
      },
      {
        action: cancelBookingAction,
        formData: createFormData({
          bookingId: "neplatne-id",
          cancellationReason: "Duvod",
        }),
      },
      {
        action: markNoShowAction,
        formData: createFormData({
          bookingId: "neplatne-id",
        }),
      },
    ];

    for (const testCase of cases) {
      const supabase = { from: vi.fn() };

      vi.clearAllMocks();
      mocks.hasSupabaseEnv.mockReturnValue(false);
      mocks.requireOwner.mockResolvedValue({
        supabase,
        tenantId: TENANT_ID,
        user: { id: "66666666-6666-4666-8666-666666666666" },
      });

      const result = await testCase.action({}, testCase.formData);

      expect(result.error).toBeTruthy();
      expect(result.success).toBeUndefined();
      expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalled();
    }
  });

  it("odmitne upravu klienta s neaktivnim oblibenym zamestnancem", async () => {
    const staffQuery = createUpdateChain({ data: null, error: null });
    const clientUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffQuery),
          };
        }

        if (table === "clients") {
          return {
            update: clientUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateClientAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        fullName: "Jan Novak",
        phone: "+420777123456",
        email: "jan@example.com",
        notes: "Poznámka",
        preferredStaffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Vybraný oblíbený zaměstnanec už není aktivní.",
    });
    expect(clientUpdate).not.toHaveBeenCalled();
  });

  it("neupravi klienta, kdyz oblibeneho zamestnance nejde overit", async () => {
    const staffQuery = createUpdateChain({ data: null, error: { code: "500" } });
    const clientUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffQuery),
          };
        }

        if (table === "clients") {
          return {
            update: clientUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateClientAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        fullName: "Jan Novak",
        phone: "+420777123456",
        email: "jan@example.com",
        notes: "Poznámka",
        preferredStaffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Oblíbeného zaměstnance se nepodařilo ověřit.",
    });
    expect(clientUpdate).not.toHaveBeenCalled();
  });

  it("nevytvori klienta, kdyz oblibeneho zamestnance nejde overit", async () => {
    const staffQuery = createUpdateChain({ data: null, error: { code: "500" } });
    const clientInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffQuery),
          };
        }

        if (table === "clients") {
          return {
            insert: clientInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createClientAction(
      {},
      createFormData({
        fullName: "Jan Novak",
        phone: "+420777123456",
        email: "jan@example.com",
        notes: "Poznámka",
        preferredStaffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Oblíbeného zaměstnance se nepodařilo ověřit.",
    });
    expect(clientInsert).not.toHaveBeenCalled();
  });

  it("vytvoreni klienta zustane uspesne, kdyz selze obnoveni stranky", async () => {
    const clientsInsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "clients") {
          return {
            insert: clientsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });
    mocks.revalidatePath.mockImplementationOnce(() => {
      throw new Error("Cache unavailable");
    });

    const result = await createClientAction(
      {},
      createFormData({
        fullName: "Jan Novak",
        phone: "+420777123456",
        email: "jan@example.com",
        notes: "Poznámka",
        preferredStaffId: "",
      }),
    );

    expect(result).toEqual({ success: "Klient byl vytvořen." });
    expect(clientsInsert).toHaveBeenCalledOnce();
    expect(clientsInsert).toHaveBeenCalledWith(expect.objectContaining({ tenant_id: TENANT_ID }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/clients");
  });

  it("uprava flagu klienta filtruje podle tenanta", async () => {
    const clientsUpdateChain = createUpdateChain({ data: { id: CLIENT_ID }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "clients") {
          return {
            update: vi.fn(() => clientsUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await toggleClientFlagAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        isFlagged: "true",
        flagReason: "Opakovane no-show",
      }),
    );

    expect(result).toEqual({ success: "Klient byl označen flagem." });
    expect(clientsUpdateChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
  });

  it("nedovoli skryt klienta s budoucimi rezervacemi", async () => {
    const bookingsQuery = createCountChain(1);
    const clientUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "clients") {
          return {
            update: clientUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideClientAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
      }),
    );

    expect(result).toEqual({
      error: "Klienta nejde skrýt, protože má ještě budoucí rezervace.",
    });
    expect(clientUpdate).not.toHaveBeenCalled();
  });

  it("neskryje klienta, kdyz nejde overit budouci rezervace", async () => {
    const bookingsQuery = createCountErrorChain();
    const clientUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "clients") {
          return {
            update: clientUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideClientAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
      }),
    );

    expect(result).toEqual({
      error: "Budoucí rezervace klienta se nepodařilo ověřit.",
    });
    expect(clientUpdate).not.toHaveBeenCalled();
  });

  it("neskryje klienta, kdyz selze ulozeni skryti", async () => {
    const bookingsQuery = createCountChain(0);
    const clientsUpdateChain = createUpdateChain({ data: null, error: { code: "500" } });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "clients") {
          return {
            update: vi.fn(() => clientsUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideClientAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
      }),
    );

    expect(result).toEqual({ error: "Klienta se nepodařilo skrýt." });
    expect(clientsUpdateChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("uprava klienta filtruje podle tenanta", async () => {
    const clientsUpdateChain = createUpdateChain({ data: { id: CLIENT_ID }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "clients") {
          return {
            update: vi.fn(() => clientsUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateClientAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        fullName: "Jan Novak",
        phone: "+420777123456",
        email: "jan@example.com",
        notes: "Poznámka",
        preferredStaffId: "",
      }),
    );

    expect(result).toEqual({ success: "Klient byl upraven." });
    expect(clientsUpdateChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
  });

  it("nedovoli skryt zamestnance s budoucimi rezervacemi", async () => {
    const bookingsQuery = createCountChain(1);
    const staffUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "staff") {
          return {
            update: staffUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Zaměstnance nejde skrýt, protože má ještě budoucí rezervace.",
    });
    expect(staffUpdate).not.toHaveBeenCalled();
  });

  it("neskryje zamestnance, kdyz nejde overit budouci rezervace", async () => {
    const bookingsQuery = createCountErrorChain();
    const staffUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "staff") {
          return {
            update: staffUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Budoucí rezervace zaměstnance se nepodařilo ověřit.",
    });
    expect(staffUpdate).not.toHaveBeenCalled();
  });

  it("neskryje zamestnance, kdyz selze ulozeni skryti", async () => {
    const bookingsQuery = createCountChain(0);
    const staffUpdateChain = createUpdateChain({ data: null, error: { code: "500" } });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "staff") {
          return {
            update: vi.fn(() => staffUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({ error: "Zaměstnance se nepodařilo skrýt." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nedovoli skryt sluzbu s budoucimi rezervacemi", async () => {
    const bookingsQuery = createCountChain(1);
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
      }),
    );

    expect(result).toEqual({
      error: "Službu nejde skrýt, protože má ještě budoucí rezervace.",
    });
    expect(serviceUpdate).not.toHaveBeenCalled();
  });

  it("vytvoreni sluzby vyzaduje prihlaseni i v demo rezimu pred validaci", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await createServiceAction(
      {},
      createFormData({
        name: "",
        durationMinutes: "abc",
        price: "abc",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
  });

  it("vytvoreni sluzby v demo rezimu nejdriv validuje formular", async () => {
    const supabase = { from: vi.fn() };

    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createServiceAction(
      {},
      createFormData({
        name: "",
        durationMinutes: "abc",
        price: "abc",
      }),
    );

    expect(result).toEqual({ error: "Název musí mít alespoň 2 znaky." });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rychle zalozi startovni sluzby podle oboru podniku", async () => {
    const tenantChain = {
      eq: vi.fn(() => tenantChain),
      is: vi.fn(() => tenantChain),
      single: vi.fn(async () => ({ data: { industry: "hair" }, error: null })),
      select: vi.fn(() => tenantChain),
    };
    const existingServicesChain = {
      eq: vi.fn(() => existingServicesChain),
      in: vi.fn(async () => ({ data: [{ name: "Střih" }], error: null })),
      is: vi.fn(() => existingServicesChain),
      select: vi.fn(() => existingServicesChain),
    };
    const serviceInsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return { select: vi.fn(() => tenantChain) };
        }

        if (table === "services") {
          return {
            insert: serviceInsert,
            select: vi.fn(() => existingServicesChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createStarterServicesAction(
      {},
      createFormData({
        templateIds: "hair-cut,hair-beard,hair-cut-beard",
      }),
    );

    expect(result).toEqual({ success: "Přidali jsme 2 služby. Jedna už existovala." });
    expect(serviceInsert).toHaveBeenCalledWith([
      expect.objectContaining({ name: "Úprava vousů", tenant_id: TENANT_ID }),
      expect.objectContaining({ name: "Střih + vousy", tenant_id: TENANT_ID }),
    ]);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/services");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/start");
  });

  it("skryti sluzby vyzaduje prihlaseni i v demo rezimu pred validaci", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await hideServiceAction(
      {},
      createFormData({
        serviceId: "neplatne-id",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
  });

  it("skryti sluzby v demo rezimu nejdriv validuje formular", async () => {
    const supabase = { from: vi.fn() };

    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideServiceAction(
      {},
      createFormData({
        serviceId: "neplatne-id",
      }),
    );

    expect(result).toEqual({ error: "Službu se nepodařilo ověřit." });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("uprava sluzby vyzaduje prihlaseni i v demo rezimu pred validaci", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "neplatne-id",
        name: "",
        durationMinutes: "abc",
        price: "abc",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.requireOwner).toHaveBeenCalledOnce();
    expect(mocks.hasSupabaseEnv).not.toHaveBeenCalled();
  });

  it("uprava sluzby v demo rezimu nejdriv validuje formular", async () => {
    const supabase = { from: vi.fn() };

    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "neplatne-id",
        name: "",
        durationMinutes: "abc",
        price: "abc",
      }),
    );

    expect(result).toEqual({ error: "Název musí mít alespoň 2 znaky." });
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("neskryje sluzbu, kdyz nejde overit budouci rezervace", async () => {
    const bookingsQuery = createCountErrorChain();
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
      }),
    );

    expect(result).toEqual({
      error: "Budoucí rezervace služby se nepodařilo ověřit.",
    });
    expect(serviceUpdate).not.toHaveBeenCalled();
  });

  it("neskryje sluzbu, kdyz selze ulozeni skryti", async () => {
    const bookingsQuery = createCountChain(0);
    const servicesUpdateChain = createUpdateChain({ data: null, error: { code: "500" } });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            update: vi.fn(() => servicesUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await hideServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
      }),
    );

    expect(result).toEqual({ error: "Službu se nepodařilo skrýt." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("uprava sluzby zustane uspesna, kdyz selze obnoveni stranky", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 0,
        duration_minutes: 30,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const servicesUpdateChain = createUpdateChain({ data: { id: "88888888-8888-4888-8888-888888888888" }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: vi.fn(() => servicesUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });
    mocks.revalidatePath.mockImplementationOnce(() => {
      throw new Error("Cache unavailable");
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "30",
        price: "450",
        currency: "CZK",
        bufferMinutes: "0",
      }),
    );

    expect(result).toEqual({ success: "Služba byla upravena." });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/services");
  });

  it("nevytvori sluzbu s delkou mimo krok 5 minut", async () => {
    const serviceInsert = vi.fn();
    const supabase = {
      from: vi.fn(() => ({
        insert: serviceInsert,
      })),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createServiceAction(
      {},
      createFormData({
        name: "Strih",
        description: "Popis",
        durationMinutes: "7",
        price: "450",
        currency: "CZK",
        bufferMinutes: "0",
      }),
    );

    expect(result).toEqual({ error: "Délka služby musí být v násobcích 5 minut." });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(serviceInsert).not.toHaveBeenCalled();
  });

  it("dovoli upravit legacy sluzbu, kdyz se neplatna delka ani buffer nemeni", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 3,
        duration_minutes: 7,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const servicesUpdateChain = createUpdateChain({ data: { id: "88888888-8888-4888-8888-888888888888" }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: vi.fn(() => servicesUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Novy nazev",
        description: "Popis",
        durationMinutes: "7",
        price: "500",
        currency: "CZK",
        bufferMinutes: "3",
      }),
    );

    expect(result).toEqual({ success: "Služba byla upravena." });
    expect(servicesUpdateChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/services");
  });

  it("dovoli zmenit legacy delku sluzby na platny krok a zachovat legacy buffer", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 3,
        duration_minutes: 7,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const bookingsQuery = createCountChain(0);
    const servicesUpdateChain = createUpdateChain({ data: { id: "88888888-8888-4888-8888-888888888888" }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: vi.fn(() => servicesUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "10",
        price: "450",
        currency: "CZK",
        bufferMinutes: "3",
      }),
    );

    expect(result).toEqual({ success: "Služba byla upravena." });
    expect(bookingsQuery.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(servicesUpdateChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
  });

  it("dovoli zmenit legacy buffer sluzby na platny krok a zachovat legacy delku", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 3,
        duration_minutes: 7,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const bookingsQuery = createCountChain(0);
    const servicesUpdateChain = createUpdateChain({ data: { id: "88888888-8888-4888-8888-888888888888" }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: vi.fn(() => servicesUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "7",
        price: "450",
        currency: "CZK",
        bufferMinutes: "5",
      }),
    );

    expect(result).toEqual({ success: "Služba byla upravena." });
    expect(bookingsQuery.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(servicesUpdateChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
  });

  it("nedovoli zmenit legacy delku sluzby na jinou hodnotu mimo krok 5 minut", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 3,
        duration_minutes: 7,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const bookingsQuery = createCountChain(0);
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "8",
        price: "450",
        currency: "CZK",
        bufferMinutes: "3",
      }),
    );

    expect(result).toEqual({ error: "Délka služby musí být v násobcích 5 minut." });
    expect(bookingsQuery.select).not.toHaveBeenCalled();
    expect(serviceUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nedovoli zmenit legacy buffer sluzby na jinou hodnotu mimo krok 5 minut", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 3,
        duration_minutes: 7,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const bookingsQuery = createCountChain(0);
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "7",
        price: "450",
        currency: "CZK",
        bufferMinutes: "4",
      }),
    );

    expect(result).toEqual({ error: "Buffer musí být v násobcích 5 minut." });
    expect(bookingsQuery.select).not.toHaveBeenCalled();
    expect(serviceUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nedovoli zmenit delku sluzby s budoucimi rezervacemi", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 0,
        duration_minutes: 30,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const bookingsQuery = createCountChain(1);
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "45",
        price: "450",
        currency: "CZK",
        bufferMinutes: "0",
      }),
    );

    expect(result).toEqual({
      error: "Časové parametry služby nejde změnit, protože má ještě budoucí rezervace.",
    });
    expect(serviceUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nedovoli zmenit buffer sluzby s budoucimi rezervacemi", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 0,
        duration_minutes: 30,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const bookingsQuery = createCountChain(1);
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "30",
        price: "450",
        currency: "CZK",
        bufferMinutes: "15",
      }),
    );

    expect(result).toEqual({
      error: "Časové parametry služby nejde změnit, protože má ještě budoucí rezervace.",
    });
    expect(serviceUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nedovoli zmenit delku sluzby, kdyz budouci rezervace nejdou overit", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 0,
        duration_minutes: 30,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const bookingsQuery = createCountErrorChain();
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "45",
        price: "450",
        currency: "CZK",
        bufferMinutes: "0",
      }),
    );

    expect(result).toEqual({
      error: "Budoucí rezervace služby se nepodařilo ověřit.",
    });
    expect(serviceUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neupravi sluzbu, ktera uz neni dostupna", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({ data: null, error: null });
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "30",
        price: "450",
        currency: "CZK",
        bufferMinutes: "0",
      }),
    );

    expect(result).toEqual({ error: "Služba už není dostupná." });
    expect(serviceUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neupravi sluzbu, kdyz se zneaktivni behem ukladani", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({
      data: {
        buffer_minutes: 0,
        duration_minutes: 30,
        id: "88888888-8888-4888-8888-888888888888",
      },
      error: null,
    });
    const serviceUpdateChain = createUpdateChain({ data: null, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: vi.fn(() => serviceUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "30",
        price: "450",
        currency: "CZK",
        bufferMinutes: "0",
      }),
    );

    expect(result).toEqual({ error: "Službu se nepodařilo upravit." });
    expect(serviceUpdateChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neupravi sluzbu, kdyz ji nejde overit", async () => {
    const matchingServiceChain = {
      eq: vi.fn(() => matchingServiceChain),
      is: vi.fn(() => matchingServiceChain),
      order: vi.fn(async () => ({ data: [], error: null })),
    };
    const currentServiceChain = createUpdateChain({ data: null, error: { code: "500" } });
    const serviceUpdate = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "services") {
          return {
            select: vi.fn((columns: string) => (
              columns.includes("duration_minutes") ? currentServiceChain : matchingServiceChain
            )),
            update: serviceUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateServiceAction(
      {},
      createFormData({
        serviceId: "88888888-8888-4888-8888-888888888888",
        name: "Strih",
        description: "Popis",
        durationMinutes: "30",
        price: "450",
        currency: "CZK",
        bufferMinutes: "0",
      }),
    );

    expect(result).toEqual({ error: "Službu se nepodařilo ověřit." });
    expect(serviceUpdate).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nedovoli odebrat sluzbu zamestnanci s budoucimi rezervacemi", async () => {
    const bookingsQuery = createCountChain(1);
    const staffServicesDeleteChain = {
      eq: vi.fn(() => staffServicesDeleteChain),
      delete: vi.fn(() => staffServicesDeleteChain),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "staff_services") {
          return staffServicesDeleteChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await removeStaffServiceAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
      }),
    );

    expect(result).toEqual({
      error: "Službu nejde odebrat, protože na ni už existují budoucí rezervace.",
    });
    expect(staffServicesDeleteChain.delete).not.toHaveBeenCalled();
  });

  it("neodebere sluzbu zamestnanci, kdyz nejde overit budouci rezervace", async () => {
    const bookingsQuery = createCountErrorChain();
    const staffServicesDeleteChain = {
      eq: vi.fn(() => staffServicesDeleteChain),
      delete: vi.fn(() => staffServicesDeleteChain),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "staff_services") {
          return staffServicesDeleteChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await removeStaffServiceAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
      }),
    );

    expect(result).toEqual({
      error: "Budoucí rezervace zaměstnance se nepodařilo ověřit.",
    });
    expect(staffServicesDeleteChain.delete).not.toHaveBeenCalled();
  });

  it("nevrati uspech pri odebrani sluzby zamestnanci, kdyz se nic nesmazalo", async () => {
    const bookingsQuery = createCountChain(0);
    const staffServicesDeleteChain = {
      eq: vi.fn(() => staffServicesDeleteChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
      select: vi.fn(() => staffServicesDeleteChain),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return bookingsQuery;
        }

        if (table === "staff_services") {
          return {
            delete: vi.fn(() => staffServicesDeleteChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await removeStaffServiceAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
      }),
    );

    expect(result).toEqual({ error: "Službu se nepodařilo odebrat." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("uprava rezervace se zastavi, kdyz nejde overit timezone podniku", async () => {
    const tenantTimezoneChain = createTenantTimezoneErrorChain();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc: vi.fn(),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({ error: "Timezone podniku se nepodařilo ověřit." });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("pri neuspesne uprave rezervace nezapise historii ani neposle notifikace", async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { code: "23P01" } }));
    const bookingEventsInsert = vi.fn();
    const tenantTimezoneChain = createTenantTimezoneChain();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo upravit. Termín může být obsazený.",
    });
    expect(rpc).toHaveBeenCalledOnce();
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("pri uprave rezervace bez vracene rezervace nezapise historii ani neposle notifikace", async () => {
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    const bookingEventsInsert = vi.fn();
    const tenantTimezoneChain = createTenantTimezoneChain();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo upravit. Termín může být obsazený.",
    });
    expect(rpc).toHaveBeenCalledOnce();
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("pri uprave rezervace prevede lokalni cas podle timezone podniku", async () => {
    const rpc = vi.fn(async () => ({ data: null, error: { code: "23P01" } }));
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo upravit. Termín může být obsazený.",
    });
    expect(rpc).toHaveBeenCalledWith("update_booking", expect.objectContaining({
      p_starts_at: "2026-04-28T08:00:00.000Z",
    }));
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
  });

  it("pri uspesne uprave rezervace zapise historii a naplanuje novy reminder s manage odkazem", async () => {
    const adminSupabase = { marker: "admin" };
    const rpc = vi.fn(async () => ({ data: { id: BOOKING_ID }, error: null }));
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          cancellation_reason: null,
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.createAdminClient.mockReturnValue(adminSupabase);
    mocks.createBookingSelfServiceToken.mockResolvedValue({
      expiresAt: "2026-05-28T10:00:00.000Z",
      token: "token",
      url: "http://localhost:3000/manage/token",
    });
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla upravena." });
    expect(rpc).toHaveBeenCalledWith("update_booking", expect.objectContaining({
      p_booking_id: BOOKING_ID,
      p_starts_at: "2026-04-28T08:00:00.000Z",
    }));
    expect(bookingEventsInsert).toHaveBeenCalledWith(expect.objectContaining({
      booking_id: BOOKING_ID,
      event_type: "rescheduled",
      tenant_id: TENANT_ID,
    }));
    expect(mocks.skipPendingBookingReminders).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      reason: "Booking rescheduled",
      tenantId: TENANT_ID,
    });
    expect(mocks.sendBookingRescheduleEmail).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        manageUrl: "http://localhost:3000/manage/token",
        timeZone: "Europe/Prague",
      }),
    );
    expect(mocks.scheduleBookingReminder).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        manageUrl: "http://localhost:3000/manage/token",
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("uprava rezervace zustane uspesna, kdyz nejde nacist detail pro notifikace", async () => {
    const rpc = vi.fn(async () => ({ data: { id: BOOKING_ID }, error: null }));
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: null,
        error: { code: "500" },
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00",
        notes: "Poznamka",
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla upravena." });
    expect(bookingEventsInsert).toHaveBeenCalledWith(expect.objectContaining({
      booking_id: BOOKING_ID,
      event_type: "rescheduled",
      tenant_id: TENANT_ID,
    }));
    expect(mocks.skipPendingBookingReminders).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      reason: "Booking rescheduled",
      tenantId: TENANT_ID,
    });
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("pri neuspesnem potvrzeni rezervace nezapise historii ani neposle notifikace", async () => {
    const bookingsUpdateChain = createUpdateChain({ data: null, error: null });
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            update: vi.fn(() => bookingsUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await confirmBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo potvrdit. Možná už změnila stav.",
    });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.sendBookingConfirmationEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("potvrzeni rezervace zustane uspesne, kdyz selze navazujici historie", async () => {
    const bookingsUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
        },
        error: null,
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
            update: vi.fn(() => bookingsUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: vi.fn(() => {
              throw new Error("Audit unavailable");
            }),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await confirmBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla potvrzena." });
    expect(mocks.sendBookingConfirmationEmail).toHaveBeenCalledOnce();
    expect(mocks.scheduleBookingReminder).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("potvrzeni rezervace zustane uspesne, kdyz nejde nacist detail pro notifikace", async () => {
    const bookingsUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const bookingEventsInsert = vi.fn();
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: null,
        error: { code: "500" },
      })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
            update: vi.fn(() => bookingsUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await confirmBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla potvrzena." });
    expect(bookingEventsInsert).toHaveBeenCalledWith(expect.objectContaining({
      booking_id: BOOKING_ID,
      event_type: "confirmed",
      tenant_id: TENANT_ID,
    }));
    expect(mocks.sendBookingConfirmationEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("pri potvrzeni rezervace vytvori manage odkaz pres admin klienta", async () => {
    const adminSupabase = { marker: "admin" };
    const bookingsUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: { name: "Demo podnik" },
        },
        error: null,
      })),
    };
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => detailsChain),
            update: vi.fn(() => bookingsUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(adminSupabase);
    mocks.createBookingSelfServiceToken.mockResolvedValue({
      expiresAt: "2026-05-28T10:00:00.000Z",
      token: "token",
      url: "http://localhost:3000/manage/token",
    });
    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await confirmBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla potvrzena." });
    expect(mocks.createBookingSelfServiceToken).toHaveBeenCalledWith(adminSupabase, {
      bookingId: BOOKING_ID,
      tenantId: TENANT_ID,
    });
    expect(mocks.sendBookingConfirmationEmail).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({ manageUrl: "http://localhost:3000/manage/token" }),
    );
    expect(mocks.scheduleBookingReminder).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({ manageUrl: "http://localhost:3000/manage/token" }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("pri no-show preskoci reminder a obnovi detail klienta", async () => {
    const bookingSelectChain = createUpdateChain({ data: { client_id: CLIENT_ID }, error: null });
    const bookingUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const clientSelectChain = createUpdateChain({ data: { no_show_count: 2 }, error: null });
    const clientUpdateChain = {
      eq: vi.fn(() => clientUpdateChain),
      update: vi.fn(() => clientUpdateChain),
    };
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingSelectChain),
            update: vi.fn(() => bookingUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "clients") {
          return {
            select: vi.fn(() => clientSelectChain),
            update: vi.fn(() => clientUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await markNoShowAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla označena jako no-show." });
    expect(bookingEventsInsert).toHaveBeenCalledOnce();
    expect(mocks.revokeBookingSelfServiceTokens).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      tenantId: TENANT_ID,
    });
    expect(mocks.skipPendingBookingReminders).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      reason: "Booking no-show",
      tenantId: TENANT_ID,
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/clients");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/clients/${CLIENT_ID}`);
  });

  it("no-show zustane uspesne, kdyz selze prepocet no-show poctu klienta", async () => {
    const bookingSelectChain = createUpdateChain({ data: { client_id: CLIENT_ID }, error: null });
    const bookingUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingSelectChain),
            update: vi.fn(() => bookingUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        if (table === "clients") {
          return {
            select: vi.fn(() => {
              throw new Error("Client count unavailable");
            }),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await markNoShowAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla označena jako no-show." });
    expect(bookingEventsInsert).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/clients");
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/clients/${CLIENT_ID}`);
  });

  it("neoznaci no-show, kdyz rezervaci nejde predem overit", async () => {
    const bookingSelectChain = createUpdateChain({ data: null, error: { code: "500" } });
    const bookingUpdate = vi.fn();
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingSelectChain),
            update: bookingUpdate,
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await markNoShowAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ error: "Rezervaci se nepodařilo ověřit." });
    expect(bookingUpdate).not.toHaveBeenCalled();
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neoznaci no-show ani nespusti navazujici kroky, kdyz rezervace mezitim zmeni stav", async () => {
    const bookingSelectChain = createUpdateChain({ data: { client_id: CLIENT_ID }, error: null });
    const bookingUpdateChain = createUpdateChain({ data: null, error: null });
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingSelectChain),
            update: vi.fn(() => bookingUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await markNoShowAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ error: "Rezervaci se nepodařilo označit jako no-show. Možná už změnila stav." });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nezrusi rezervaci, kdyz ji nejde predem overit", async () => {
    const bookingSelectChain = createUpdateChain({ data: null, error: { code: "500" } });
    const bookingUpdate = vi.fn();
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingSelectChain),
            update: bookingUpdate,
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await cancelBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        cancellationReason: "Klient nemuze prijit",
      }),
    );

    expect(result).toEqual({ error: "Rezervaci se nepodařilo ověřit." });
    expect(bookingUpdate).not.toHaveBeenCalled();
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingCancellationEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nezrusi rezervaci ani nespusti navazujici kroky, kdyz rezervace mezitim zmeni stav", async () => {
    const existingBookingChain = createUpdateChain({
      data: { id: BOOKING_ID, status: "confirmed" },
      error: null,
    });
    const bookingUpdateChain = createUpdateChain({ data: null, error: null });
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => existingBookingChain),
            update: vi.fn(() => bookingUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await cancelBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        cancellationReason: "Klient nemuze prijit",
      }),
    );

    expect(result).toEqual({ error: "Rezervaci se nepodařilo zrušit. Možná už změnila stav." });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingCancellationEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("zruseni rezervace zustane uspesne, kdyz nejde nacist detail pro notifikace", async () => {
    const existingBookingChain = createUpdateChain({
      data: { id: BOOKING_ID, status: "confirmed" },
      error: null,
    });
    const bookingUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: null,
        error: { code: "500" },
      })),
    };
    const bookingEventsInsert = vi.fn();
    const bookingsSelect = vi
      .fn()
      .mockReturnValueOnce(existingBookingChain)
      .mockReturnValueOnce(detailsChain);
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: bookingsSelect,
            update: vi.fn(() => bookingUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await cancelBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
        cancellationReason: "Klient nemuze prijit",
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla zrušena." });
    expect(bookingEventsInsert).toHaveBeenCalledWith(expect.objectContaining({
      booking_id: BOOKING_ID,
      event_type: "cancelled",
      tenant_id: TENANT_ID,
    }));
    expect(mocks.skipPendingBookingReminders).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      reason: "Booking cancelled",
      tenantId: TENANT_ID,
    });
    expect(mocks.revokeBookingSelfServiceTokens).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      tenantId: TENANT_ID,
    });
    expect(mocks.sendBookingCancellationEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("nedokonci rezervaci, kdyz ji nejde predem overit", async () => {
    const bookingSelectChain = createUpdateChain({ data: null, error: { code: "500" } });
    const bookingUpdate = vi.fn();
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingSelectChain),
            update: bookingUpdate,
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await completeBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ error: "Rezervaci se nepodařilo ověřit." });
    expect(bookingUpdate).not.toHaveBeenCalled();
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nedokonci rezervaci ani nespusti navazujici kroky, kdyz rezervace mezitim zmeni stav", async () => {
    const existingBookingChain = createUpdateChain({
      data: { id: BOOKING_ID, status: "confirmed" },
      error: null,
    });
    const bookingUpdateChain = createUpdateChain({ data: null, error: null });
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => existingBookingChain),
            update: vi.fn(() => bookingUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await completeBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ error: "Rezervaci se nepodařilo dokončit. Možná už změnila stav." });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.revokeBookingSelfServiceTokens).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("po dokonceni rezervace posle review request, kdyz ma podnik review odkaz", async () => {
    const existingBookingChain = createUpdateChain({
      data: { id: BOOKING_ID, status: "confirmed" },
      error: null,
    });
    const bookingUpdateChain = createUpdateChain({ data: { id: BOOKING_ID }, error: null });
    const detailsChain = {
      eq: vi.fn(() => detailsChain),
      single: vi.fn(async () => ({
        data: {
          cancellation_reason: null,
          clients: { email: "jan@example.com", full_name: "Jan Novak", id: CLIENT_ID, phone: "+420777123456" },
          ends_at: "2026-04-28T11:00:00.000Z",
          id: BOOKING_ID,
          services: { name: "Strih" },
          staff: { name: "Eva" },
          starts_at: "2026-04-28T10:00:00.000Z",
          tenant_id: TENANT_ID,
          tenants: {
            cancellation_message: null,
            confirmation_message: null,
            name: "Demo podnik",
            reminder_message: null,
            review_url: "https://g.page/r/demo/review",
            timezone: "Europe/Prague",
          },
        },
        error: null,
      })),
    };
    const bookingEventsInsert = vi.fn();
    const bookingsSelect = vi
      .fn()
      .mockReturnValueOnce(existingBookingChain)
      .mockReturnValueOnce(detailsChain);
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: bookingsSelect,
            update: vi.fn(() => bookingUpdateChain),
          };
        }

        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await completeBookingAction(
      {},
      createFormData({
        bookingId: BOOKING_ID,
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla dokončena." });
    expect(mocks.revokeBookingSelfServiceTokens).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      tenantId: TENANT_ID,
    });
    expect(mocks.skipPendingBookingReminders).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      reason: "Booking completed",
      tenantId: TENANT_ID,
    });
    expect(mocks.sendBookingReviewRequestEmail).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        clientEmail: "jan@example.com",
        reviewUrl: "https://g.page/r/demo/review",
        tenantId: TENANT_ID,
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/calendar");
  });

  it("neulozi vyjimku pracovni doby pro nedostupneho zamestnance", async () => {
    const staffSelectChain = createUpdateChain({ data: null, error: null });
    const staffExceptionsUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "staff_exceptions") {
          return {
            upsert: staffExceptionsUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createStaffExceptionAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        date: "2026-04-28",
        isWorking: "false",
        startTime: "",
        endTime: "",
        note: "Dovolena",
      }),
    );

    expect(result).toEqual({ error: "Zaměstnanec už není dostupný." });
    expect(staffExceptionsUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neulozi vyjimku pracovni doby, kdyz zamestnance nejde overit", async () => {
    const staffSelectChain = createUpdateChain({ data: null, error: { code: "500" } });
    const staffExceptionsUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "staff_exceptions") {
          return {
            upsert: staffExceptionsUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createStaffExceptionAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        date: "2026-04-28",
        isWorking: "false",
        startTime: "",
        endTime: "",
        note: "Dovolena",
      }),
    );

    expect(result).toEqual({ error: "Zaměstnance se nepodařilo ověřit." });
    expect(staffExceptionsUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neulozi volno zamestnance, kdyz v ten den existuje budouci rezervace", async () => {
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingsChain = createBookingsForExceptionChain({
      data: [
        {
          ends_at: "2026-04-28T09:30:00.000Z",
          starts_at: "2026-04-28T09:00:00.000Z",
        },
      ],
      error: null,
    });
    const staffExceptionsUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff_exceptions") {
          return {
            upsert: staffExceptionsUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createStaffExceptionAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        date: "2026-04-28",
        isWorking: "false",
        startTime: "",
        endTime: "",
        note: "Dovolena",
      }),
    );

    expect(result).toEqual({
      error: "Volno nejde uložit, protože zaměstnanec má v tento den budoucí rezervace.",
    });
    expect(staffExceptionsUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neulozi specialni pracovni dobu, kdyz by existujici rezervace byla mimo nove hodiny", async () => {
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingsChain = createBookingsForExceptionChain({
      data: [
        {
          ends_at: "2026-04-28T08:30:00.000Z",
          starts_at: "2026-04-28T08:00:00.000Z",
        },
      ],
      error: null,
    });
    const staffExceptionsUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff_exceptions") {
          return {
            upsert: staffExceptionsUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createStaffExceptionAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        date: "2026-04-28",
        isWorking: "true",
        startTime: "11:00",
        endTime: "15:00",
        note: "Kratka smena",
      }),
    );

    expect(result).toEqual({
      error: "Výjimku nejde uložit, protože některá budoucí rezervace je mimo zadanou pracovní dobu.",
    });
    expect(staffExceptionsUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neulozi vyjimku pracovni doby, kdyz rezervace v danem dni nejdou overit", async () => {
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingsChain = createBookingsForExceptionChain({ data: null, error: { code: "500" } });
    const staffExceptionsUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff_exceptions") {
          return {
            upsert: staffExceptionsUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createStaffExceptionAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        date: "2026-04-28",
        isWorking: "true",
        startTime: "11:00",
        endTime: "15:00",
        note: "Kratka smena",
      }),
    );

    expect(result).toEqual({
      error: "Rezervace v den výjimky se nepodařilo ověřit.",
    });
    expect(staffExceptionsUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nepriradi sluzbu, kdyz zamestnanec nebo sluzba uz nejsou dostupni", async () => {
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const serviceSelectChain = createUpdateChain({ data: null, error: null });
    const staffServicesInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "services") {
          return {
            select: vi.fn(() => serviceSelectChain),
          };
        }

        if (table === "staff_services") {
          return {
            insert: staffServicesInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await assignStaffServiceAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
      }),
    );

    expect(result).toEqual({ error: "Zaměstnanec nebo služba už nejsou dostupní." });
    expect(staffServicesInsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nepriradi sluzbu, kdyz dostupnost nejde overit", async () => {
    const staffSelectChain = createUpdateChain({ data: null, error: { code: "500" } });
    const serviceSelectChain = createUpdateChain({ data: { id: "77777777-7777-4777-8777-777777777777" }, error: null });
    const staffServicesInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "services") {
          return {
            select: vi.fn(() => serviceSelectChain),
          };
        }

        if (table === "staff_services") {
          return {
            insert: staffServicesInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await assignStaffServiceAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
      }),
    );

    expect(result).toEqual({
      error: "Dostupnost zaměstnance nebo služby se nepodařilo ověřit.",
    });
    expect(staffServicesInsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("prirazeni sluzby zamestnanci zustane uspesne, kdyz selze obnoveni stranky", async () => {
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const serviceSelectChain = createUpdateChain({ data: { id: "77777777-7777-4777-8777-777777777777" }, error: null });
    const staffServicesInsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        if (table === "services") {
          return {
            select: vi.fn(() => serviceSelectChain),
          };
        }

        if (table === "staff_services") {
          return {
            insert: staffServicesInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });
    mocks.revalidatePath.mockImplementationOnce(() => {
      throw new Error("Cache unavailable");
    });

    const result = await assignStaffServiceAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        serviceId: "77777777-7777-4777-8777-777777777777",
      }),
    );

    expect(result).toEqual({ success: "Služba byla přiřazena." });
    expect(staffServicesInsert).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/staff");
  });

  it("vrati chybu, kdyz flag klienta nejde upravit", async () => {
    const clientsUpdateChain = createUpdateChain({ data: null, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "clients") {
          return {
            update: vi.fn(() => clientsUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await toggleClientFlagAction(
      {},
      createFormData({
        clientId: CLIENT_ID,
        isFlagged: "false",
        flagReason: "Opakovane no-show",
      }),
    );

    expect(result).toEqual({ error: "Flag klienta se nepodařilo upravit." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("vrati chybu, kdyz pozvanku nejde propojit se zamestnancem", async () => {
    const invitedUserId = "99999999-9999-4999-8999-999999999999";
    const deleteUser = vi.fn(async () => ({ error: null }));
    const tenantUsersDeleteChain = createDeleteChain();
    const usersDeleteChain = createDeleteChain();
    const userEmailLookupChain = createUserEmailLookupChain();
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID, user_id: null }, error: null });
    const staffLinkChain = createUpdateChain({ data: null, error: null });
    const authSupabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
            update: vi.fn(() => staffLinkChain),
          };
        }

        throw new Error(`Unexpected auth table ${table}`);
      }),
    };
    const admin = {
      auth: {
        admin: {
          inviteUserByEmail: vi.fn(async () => ({
            data: { user: { id: invitedUserId } },
            error: null,
          })),
          deleteUser,
          updateUserById: vi.fn(async () => ({ error: null })),
        },
      },
      from: vi.fn((table: string) => {
        if (table === "users") {
          return {
            delete: vi.fn(() => usersDeleteChain),
            insert: vi.fn(async () => ({ error: null })),
            select: vi.fn(() => userEmailLookupChain),
          };
        }

        if (table === "tenant_users") {
          return {
            delete: vi.fn(() => tenantUsersDeleteChain),
            insert: vi.fn(async () => ({ error: null })),
          };
        }

        throw new Error(`Unexpected admin table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.requireOwner.mockResolvedValue({
      supabase: authSupabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await inviteStaffUserAction(
      {},
      createFormData({
        email: "staff@example.com",
        fullName: "Eva Novak",
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Pozvánka byla vytvořena, ale zaměstnance se nepodařilo propojit s účtem.",
    });
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("user_id", invitedUserId);
    expect(usersDeleteChain.eq).toHaveBeenCalledWith("id", invitedUserId);
    expect(staffLinkChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(staffLinkChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(deleteUser).toHaveBeenCalledWith(invitedUserId);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("vrati presnou chybu, kdyz po selhani staff pozvanky selze cleanup uctu", async () => {
    const invitedUserId = "99999999-9999-4999-8999-999999999999";
    const deleteUser = vi.fn(async () => ({ error: { message: "Delete failed" } }));
    const tenantUsersDeleteChain = createDeleteChain();
    const usersDeleteChain = createDeleteChain();
    const userEmailLookupChain = createUserEmailLookupChain();
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID, user_id: null }, error: null });
    const authSupabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        throw new Error(`Unexpected auth table ${table}`);
      }),
    };
    const admin = {
      auth: {
        admin: {
          inviteUserByEmail: vi.fn(async () => ({
            data: { user: { id: invitedUserId } },
            error: null,
          })),
          deleteUser,
          updateUserById: vi.fn(async () => ({ error: { message: "Metadata failed" } })),
        },
      },
      from: vi.fn((table: string) => {
        if (table === "users") {
          return {
            delete: vi.fn(() => usersDeleteChain),
            select: vi.fn(() => userEmailLookupChain),
          };
        }

        if (table === "tenant_users") {
          return {
            delete: vi.fn(() => tenantUsersDeleteChain),
          };
        }

        throw new Error(`Unexpected admin table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.requireOwner.mockResolvedValue({
      supabase: authSupabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await inviteStaffUserAction(
      {},
      createFormData({
        email: "staff@example.com",
        fullName: "Eva Novak",
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Pozvánka byla vytvořena, ale rozpracovaný účet se nepodařilo uklidit.",
    });
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("user_id", invitedUserId);
    expect(usersDeleteChain.eq).toHaveBeenCalledWith("id", invitedUserId);
    expect(deleteUser).toHaveBeenCalledWith(invitedUserId);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("uklidi rozpracovany staff ucet, kdyz selze ulozeni profilu uzivatele", async () => {
    const invitedUserId = "99999999-9999-4999-8999-999999999999";
    const deleteUser = vi.fn(async () => ({ error: null }));
    const tenantUsersDeleteChain = createDeleteChain();
    const usersDeleteChain = createDeleteChain();
    const userEmailLookupChain = createUserEmailLookupChain();
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID, user_id: null }, error: null });
    const authSupabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        throw new Error(`Unexpected auth table ${table}`);
      }),
    };
    const usersInsert = vi.fn(async () => ({ error: { code: "500" } }));
    const tenantUsersInsert = vi.fn(async () => ({ error: null }));
    const admin = {
      auth: {
        admin: {
          inviteUserByEmail: vi.fn(async () => ({
            data: { user: { id: invitedUserId } },
            error: null,
          })),
          deleteUser,
          updateUserById: vi.fn(async () => ({ error: null })),
        },
      },
      from: vi.fn((table: string) => {
        if (table === "users") {
          return {
            delete: vi.fn(() => usersDeleteChain),
            insert: usersInsert,
            select: vi.fn(() => userEmailLookupChain),
          };
        }

        if (table === "tenant_users") {
          return {
            delete: vi.fn(() => tenantUsersDeleteChain),
            insert: tenantUsersInsert,
          };
        }

        throw new Error(`Unexpected admin table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.requireOwner.mockResolvedValue({
      supabase: authSupabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await inviteStaffUserAction(
      {},
      createFormData({
        email: "staff@example.com",
        fullName: "Eva Novak",
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Pozvánka byla vytvořena, ale profil uživatele se nepodařilo uložit.",
    });
    expect(tenantUsersInsert).not.toHaveBeenCalled();
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("user_id", invitedUserId);
    expect(usersDeleteChain.eq).toHaveBeenCalledWith("id", invitedUserId);
    expect(deleteUser).toHaveBeenCalledWith(invitedUserId);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("uklidi profil i auth ucet, kdyz selze ulozeni staff pristupu do podniku", async () => {
    const invitedUserId = "99999999-9999-4999-8999-999999999999";
    const deleteUser = vi.fn(async () => ({ error: null }));
    const tenantUsersDeleteChain = createDeleteChain();
    const usersDeleteChain = createDeleteChain();
    const userEmailLookupChain = createUserEmailLookupChain();
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID, user_id: null }, error: null });
    const authSupabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        throw new Error(`Unexpected auth table ${table}`);
      }),
    };
    const admin = {
      auth: {
        admin: {
          inviteUserByEmail: vi.fn(async () => ({
            data: { user: { id: invitedUserId } },
            error: null,
          })),
          deleteUser,
          updateUserById: vi.fn(async () => ({ error: null })),
        },
      },
      from: vi.fn((table: string) => {
        if (table === "users") {
          return {
            delete: vi.fn(() => usersDeleteChain),
            insert: vi.fn(async () => ({ error: null })),
            select: vi.fn(() => userEmailLookupChain),
          };
        }

        if (table === "tenant_users") {
          return {
            delete: vi.fn(() => tenantUsersDeleteChain),
            insert: vi.fn(async () => ({ error: { code: "500" } })),
          };
        }

        throw new Error(`Unexpected admin table ${table}`);
      }),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.requireOwner.mockResolvedValue({
      supabase: authSupabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await inviteStaffUserAction(
      {},
      createFormData({
        email: "staff@example.com",
        fullName: "Eva Novak",
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Pozvánka byla vytvořena, ale přístup do podniku se nepodařilo uložit.",
    });
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("tenant_id", TENANT_ID);
    expect(tenantUsersDeleteChain.eq).toHaveBeenCalledWith("user_id", invitedUserId);
    expect(usersDeleteChain.eq).toHaveBeenCalledWith("id", invitedUserId);
    expect(deleteUser).toHaveBeenCalledWith(invitedUserId);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("staff pozvanka neoveruje email globalnim admin lookupem pred odeslanim", async () => {
    const staffSelectChain = createUpdateChain({ data: { id: STAFF_ID, user_id: null }, error: null });
    const authSupabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        throw new Error(`Unexpected auth table ${table}`);
      }),
    };
    const admin = {
      auth: {
        admin: {
          inviteUserByEmail: vi.fn(async () => ({
            data: { user: null },
            error: { code: "email_exists" },
          })),
        },
      },
      from: vi.fn(),
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.requireOwner.mockResolvedValue({
      supabase: authSupabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await inviteStaffUserAction(
      {},
      createFormData({
        email: "staff@example.com",
        fullName: "Eva Novak",
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({ error: "Pozvánku se nepodařilo odeslat." });
    expect(admin.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      "staff@example.com",
      expect.objectContaining({
        data: { full_name: "Eva Novak" },
      }),
    );
    expect(admin.from).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neodesle pozvanku, kdyz nejde overit vybraneho zamestnance", async () => {
    const staffSelectChain = createUpdateChain({ data: null, error: { code: "500" } });
    const authSupabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            select: vi.fn(() => staffSelectChain),
          };
        }

        throw new Error(`Unexpected auth table ${table}`);
      }),
    };
    const admin = {
      auth: {
        admin: {
          inviteUserByEmail: vi.fn(),
        },
      },
    };

    mocks.createAdminClient.mockReturnValue(admin);
    mocks.requireOwner.mockResolvedValue({
      supabase: authSupabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await inviteStaffUserAction(
      {},
      createFormData({
        email: "staff@example.com",
        fullName: "Eva Novak",
        staffId: STAFF_ID,
      }),
    );

    expect(result).toEqual({
      error: "Vybraného zaměstnance se nepodařilo ověřit.",
    });
    expect(admin.auth.admin.inviteUserByEmail).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("vytvoreni zamestnance vrati jasnou chybu, kdyz selze pracovni doba i cleanup", async () => {
    const staffInsertChain = {
      select: vi.fn(() => ({
        single: vi.fn(async () => ({ data: { id: STAFF_ID }, error: null })),
      })),
    };
    const staffCleanupChain = createUpdateChain({ data: null, error: { code: "500" } });
    const staffHoursInsert = vi.fn(async () => ({ error: { code: "23505" } }));
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            insert: vi.fn(() => staffInsertChain),
            update: vi.fn(() => staffCleanupChain),
          };
        }

        if (table === "staff_hours") {
          return {
            insert: staffHoursInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await createStaffAction(
      {},
      createFormData({
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "09:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({
      error: "Pracovní dobu se nepodařilo uložit a rozpracovaného zaměstnance se nepodařilo uklidit.",
    });
    expect(staffHoursInsert).toHaveBeenCalledOnce();
    expect(staffCleanupChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(staffCleanupChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("pri zalozeni zamestnance muze rovnou priradit vsechny aktivni sluzby", async () => {
    const staffLookupChain = {
      eq: vi.fn(() => staffLookupChain),
      is: vi.fn(() => staffLookupChain),
      order: vi.fn(async () => ({ data: [], error: null })),
      select: vi.fn(() => staffLookupChain),
    };
    const staffInsertChain = {
      select: vi.fn(() => ({
        single: vi.fn(async () => ({ data: { id: STAFF_ID }, error: null })),
      })),
    };
    const staffHoursInsert = vi.fn(async () => ({ error: null }));
    const servicesChain = {
      eq: vi.fn(() => servicesChain),
      is: vi.fn(async () => ({
        data: [
          { id: "55555555-5555-4555-8555-555555555555" },
          { id: "77777777-7777-4777-8777-777777777777" },
        ],
        error: null,
      })),
      select: vi.fn(() => servicesChain),
    };
    const staffServicesInsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "staff") {
          return {
            insert: vi.fn(() => staffInsertChain),
            select: vi.fn(() => staffLookupChain),
          };
        }

        if (table === "staff_hours") {
          return {
            insert: staffHoursInsert,
          };
        }

        if (table === "services") {
          return {
            select: vi.fn(() => servicesChain),
          };
        }

        if (table === "staff_services") {
          return {
            insert: staffServicesInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    await expect(createStaffAction(
      {},
      createFormData({
        assignAllServices: "on",
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "09:00",
        endTime: "17:00",
      }),
    )).rejects.toThrow("NEXT_REDIRECT");

    expect(staffHoursInsert).toHaveBeenCalledOnce();
    expect(staffServicesInsert).toHaveBeenCalledWith([
      {
        tenant_id: TENANT_ID,
        staff_id: STAFF_ID,
        service_id: "55555555-5555-4555-8555-555555555555",
      },
      {
        tenant_id: TENANT_ID,
        staff_id: STAFF_ID,
        service_id: "77777777-7777-4777-8777-777777777777",
      },
    ]);
  });

  it("pri chybe ulozeni pracovni doby nemaze starou pracovni dobu", async () => {
    const staffUpdateChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const bookingsChain = createFutureBookingsChain({ data: [], error: null });
    const staffHoursDelete = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff") {
          return {
            update: vi.fn(() => staffUpdateChain),
          };
        }

        if (table === "staff_hours") {
          return {
            delete: staffHoursDelete,
            upsert: vi.fn(async () => ({ error: { code: "23505" } })),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "09:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({
      error: "Zaměstnanec se upravil, ale pracovní dobu se nepodařilo uložit.",
    });
    expect(staffHoursDelete).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neupravi zamestnance, ktery uz neni dostupny", async () => {
    const staffUpdateChain = createUpdateChain({ data: null, error: null });
    const bookingsChain = createFutureBookingsChain({ data: [], error: null });
    const staffHoursUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff") {
          return {
            update: vi.fn(() => staffUpdateChain),
          };
        }

        if (table === "staff_hours") {
          return {
            upsert: staffHoursUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "09:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({ error: "Zaměstnanec už není dostupný." });
    expect(staffUpdateChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(staffHoursUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("upravi pracovni dobu bez overeni timezone, kdyz zamestnanec nema budouci rezervace", async () => {
    const staffUpdateChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const bookingsChain = createFutureBookingsChain({ data: [], error: null });
    const staffHoursDeleteChain = {
      eq: vi.fn(() => staffHoursDeleteChain),
      not: vi.fn(async () => ({ error: null })),
    };
    const staffHoursUpsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff") {
          return {
            update: vi.fn(() => staffUpdateChain),
          };
        }

        if (table === "staff_hours") {
          return {
            delete: vi.fn(() => staffHoursDeleteChain),
            upsert: staffHoursUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "09:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({ success: "Zaměstnanec byl upraven." });
    expect(staffHoursUpsert).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/staff");
  });

  it("neupravi pracovni dobu zamestnance, kdyz by budouci rezervace byla mimo nove hodiny", async () => {
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingsChain = createFutureBookingsChain({
      data: [
        {
          ends_at: "2026-04-28T09:30:00.000Z",
          starts_at: "2026-04-28T09:00:00.000Z",
        },
      ],
      error: null,
    });
    const staffExceptionsChain = createFutureStaffExceptionsChain({ data: [], error: null });
    const staffUpdate = vi.fn();
    const staffHoursUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff") {
          return {
            update: staffUpdate,
          };
        }

        if (table === "staff_hours") {
          return {
            upsert: staffHoursUpsert,
          };
        }

        if (table === "staff_exceptions") {
          return {
            select: vi.fn(() => staffExceptionsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "12:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({
      error: "Pracovní dobu nejde uložit, protože některá budoucí rezervace je mimo nové hodiny.",
    });
    expect(staffUpdate).not.toHaveBeenCalled();
    expect(staffHoursUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("povoli upravu bezne pracovni doby, kdyz existujici rezervaci pokryva specialni vyjimka", async () => {
    const staffUpdateChain = createUpdateChain({ data: { id: STAFF_ID }, error: null });
    const staffHoursDeleteChain = {
      eq: vi.fn(() => staffHoursDeleteChain),
      not: vi.fn(async () => ({ error: null })),
    };
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingsChain = createFutureBookingsChain({
      data: [
        {
          ends_at: "2026-04-28T09:30:00.000Z",
          starts_at: "2026-04-28T09:00:00.000Z",
        },
      ],
      error: null,
    });
    const staffExceptionsChain = createFutureStaffExceptionsChain({
      data: [
        {
          date: "2026-04-28",
          end_time: "12:00",
          is_working: true,
          start_time: "10:00",
        },
      ],
      error: null,
    });
    const staffHoursUpsert = vi.fn(async () => ({ error: null }));
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff") {
          return {
            update: vi.fn(() => staffUpdateChain),
          };
        }

        if (table === "staff_hours") {
          return {
            delete: vi.fn(() => staffHoursDeleteChain),
            upsert: staffHoursUpsert,
          };
        }

        if (table === "staff_exceptions") {
          return {
            select: vi.fn(() => staffExceptionsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "12:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({ success: "Zaměstnanec byl upraven." });
    expect(staffHoursUpsert).toHaveBeenCalledOnce();
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/staff");
  });

  it("neupravi pracovni dobu zamestnance, kdyz vyjimky pracovnich hodin nejdou overit", async () => {
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingsChain = createFutureBookingsChain({
      data: [
        {
          ends_at: "2026-04-28T09:30:00.000Z",
          starts_at: "2026-04-28T09:00:00.000Z",
        },
      ],
      error: null,
    });
    const staffExceptionsChain = createFutureStaffExceptionsChain({ data: null, error: { code: "500" } });
    const staffUpdate = vi.fn();
    const staffHoursUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff") {
          return {
            update: staffUpdate,
          };
        }

        if (table === "staff_hours") {
          return {
            upsert: staffHoursUpsert,
          };
        }

        if (table === "staff_exceptions") {
          return {
            select: vi.fn(() => staffExceptionsChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "12:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({
      error: "Výjimky pracovní doby se nepodařilo ověřit.",
    });
    expect(staffUpdate).not.toHaveBeenCalled();
    expect(staffHoursUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("neupravi pracovni dobu zamestnance, kdyz budouci rezervace nejdou overit", async () => {
    const tenantTimezoneChain = createTenantTimezoneChain("Europe/Prague");
    const bookingsChain = createFutureBookingsChain({ data: null, error: { code: "500" } });
    const staffUpdate = vi.fn();
    const staffHoursUpsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            select: vi.fn(() => tenantTimezoneChain),
          };
        }

        if (table === "bookings") {
          return {
            select: vi.fn(() => bookingsChain),
          };
        }

        if (table === "staff") {
          return {
            update: staffUpdate,
          };
        }

        if (table === "staff_hours") {
          return {
            upsert: staffHoursUpsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateStaffAction(
      {},
      createFormData({
        staffId: STAFF_ID,
        name: "Eva Novak",
        bio: "Bio",
        color: "#111827",
        workingDays: "1",
        startTime: "09:00",
        endTime: "17:00",
      }),
    );

    expect(result).toEqual({
      error: "Budoucí rezervace zaměstnance se nepodařilo ověřit.",
    });
    expect(staffUpdate).not.toHaveBeenCalled();
    expect(staffHoursUpsert).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("nevrati uspech, kdyz se nastaveni podniku neulozi", async () => {
    const tenantsUpdateChain = createUpdateChain({ data: null, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            update: vi.fn(() => tenantsUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateTenantSettingsAction(
      {},
      createFormData({
        name: "Demo podnik",
        timezone: "Europe/Prague",
        locale: "cs",
        defaultCurrency: "CZK",
        cancellationNoticeHours: "24",
      }),
    );

    expect(result).toEqual({ error: "Nastavení se nepodařilo uložit." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("odmitne ulozeni nastaveni bez prihlaseni", async () => {
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await updateTenantSettingsAction(
      {},
      createFormData({
        name: "Demo podnik",
        timezone: "Europe/Prague",
        locale: "cs",
        defaultCurrency: "CZK",
        cancellationNoticeHours: "24",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("odmitne ulozeni nastaveni bez prihlaseni i pri neplatnych datech", async () => {
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await updateTenantSettingsAction(
      {},
      createFormData({
        name: "D",
        timezone: "Invalid/Timezone",
        locale: "cs",
        defaultCurrency: "CZK",
        cancellationNoticeHours: "",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("odmitne demo ulozeni nastaveni bez prihlaseni", async () => {
    mocks.hasSupabaseEnv.mockReturnValue(false);
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await updateTenantSettingsAction(
      {},
      createFormData({
        name: "Demo podnik",
        timezone: "Europe/Prague",
        locale: "cs",
        defaultCurrency: "CZK",
        cancellationNoticeHours: "24",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("odmitne ulozeni nastaveni bez owner opravneni", async () => {
    mocks.requireOwner.mockResolvedValue({ error: "Forbidden" });

    const result = await updateTenantSettingsAction(
      {},
      createFormData({
        name: "Demo podnik",
        timezone: "Europe/Prague",
        locale: "cs",
        defaultCurrency: "CZK",
        cancellationNoticeHours: "24",
      }),
    );

    expect(result).toEqual({ error: "Nemáte oprávnění." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("odmitne neplatna data nastaveni pred ulozenim do databaze", async () => {
    const supabase = {
      from: vi.fn(),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateTenantSettingsAction(
      {},
      createFormData({
        name: "D",
        timezone: "Invalid/Timezone",
        locale: "cs",
        defaultCurrency: "CZK",
        cancellationNoticeHours: "",
      }),
    );

    expect(result).toEqual({ error: "Název musí mít alespoň 2 znaky." });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("ulozeni nastaveni zustane uspesne, kdyz selze obnoveni stranky", async () => {
    const tenantsUpdateChain = createUpdateChain({ data: { id: TENANT_ID }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            update: vi.fn(() => tenantsUpdateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });
    mocks.revalidatePath.mockImplementationOnce(() => {
      throw new Error("Cache unavailable");
    });

    const result = await updateTenantSettingsAction(
      {},
      createFormData({
        name: "Demo podnik",
        timezone: "Europe/Prague",
        locale: "cs",
        defaultCurrency: "CZK",
        cancellationNoticeHours: "24",
      }),
    );

    expect(result).toEqual({ success: "Nastavení bylo uloženo." });
    expect(tenantsUpdateChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
    expect(tenantsUpdateChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/settings");
  });

  it("ulozi onboarding obor podniku podle tenant ID z auth kontextu", async () => {
    const tenantsUpdateChain = createUpdateChain({ data: { id: TENANT_ID }, error: null });
    const tenantsUpdate = vi.fn(() => tenantsUpdateChain);
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return {
            update: tenantsUpdate,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateOnboardingIndustryAction(
      {},
      createFormData({
        industry: "nails",
      }),
    );

    expect(result).toEqual({
      success: "Obor byl uložen. Šablony služeb jsou připravené podle vybraného segmentu.",
    });
    expect(tenantsUpdate).toHaveBeenCalledWith({ industry: "nails" });
    expect(tenantsUpdateChain.eq).toHaveBeenCalledWith("id", TENANT_ID);
    expect(tenantsUpdateChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/start");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/services");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/settings");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/podniky");
  });

  it("odmitne onboarding obor bez prihlaseni pred validaci vstupu", async () => {
    mocks.requireOwner.mockResolvedValue({ error: "Unauthorized" });

    const result = await updateOnboardingIndustryAction(
      {},
      createFormData({
        industry: "autoservis",
      }),
    );

    expect(result).toEqual({ error: "Přihlaste se znovu." });
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("odmitne neplatny onboarding obor pred ulozenim do databaze", async () => {
    const supabase = {
      from: vi.fn(),
    };

    mocks.requireOwner.mockResolvedValue({
      supabase,
      tenantId: TENANT_ID,
      user: { id: "66666666-6666-4666-8666-666666666666" },
    });

    const result = await updateOnboardingIndustryAction(
      {},
      createFormData({
        industry: "autoservis",
      }),
    );

    expect(result).toEqual({ error: "Vyberte platný obor podniku." });
    expect(supabase.from).not.toHaveBeenCalled();
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("odmitne presun na stejny termin a stejneho poskytovatele", async () => {
    const rpc = vi.fn();
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken.mockResolvedValue({
      id: BOOKING_ID,
      tenant_id: TENANT_ID,
      service_id: "55555555-5555-4555-8555-555555555555",
      staff_id: STAFF_ID,
      starts_at: "2026-04-27T10:00:00.000Z",
      ends_at: "2026-04-27T11:00:00.000Z",
      status: "confirmed",
      clients: { email: "klient@example.com", full_name: "Jan Novak", id: CLIENT_ID },
      services: { name: "Střih" },
      staff: { name: "Eva" },
      tenants: { name: "Demo podnik" },
    });
    mocks.getSelfServiceCancellationState.mockReturnValue({
      canCancel: true,
      noticeHours: 0,
      reason: null,
    });

    const result = await rescheduleManagedBookingAction(
      {},
      createFormData({
        token: "b".repeat(64),
        staffId: STAFF_ID,
        startsAt: "2026-04-27T10:00:00.000Z",
      }),
    );

    expect(result).toEqual({
      error: "Vyberte prosím jiný termín.",
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
  });

  it("self-service presun vrati jasnou chybu, kdyz nejde overit rezervaci", async () => {
    const rpc = vi.fn();
    const supabase = { rpc };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken.mockRejectedValueOnce(new Error("Database unavailable"));

    const result = await rescheduleManagedBookingAction(
      {},
      createFormData({
        token: "b".repeat(64),
        staffId: STAFF_ID,
        startsAt: "2026-04-28T10:00:00.000Z",
      }),
    );

    expect(result).toEqual({
      error: "Rezervaci se nepodařilo ověřit. Zkuste to prosím znovu.",
    });
    expect(rpc).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
  });

  it("ukaze srozumitelnou hlasku, kdyz uz rezervaci nejde online presunout", async () => {
    const rpc = vi.fn(async () => ({ error: { code: "P0002" } }));
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken.mockResolvedValue({
      id: BOOKING_ID,
      tenant_id: TENANT_ID,
      service_id: "55555555-5555-4555-8555-555555555555",
      staff_id: STAFF_ID,
      starts_at: "2026-04-27T10:00:00.000Z",
      ends_at: "2026-04-27T11:00:00.000Z",
      status: "confirmed",
      clients: { email: "klient@example.com", full_name: "Jan Novak", id: CLIENT_ID },
      services: { name: "Střih" },
      staff: { name: "Eva" },
      tenants: { name: "Demo podnik" },
    });
    mocks.getSelfServiceCancellationState.mockReturnValue({
      canCancel: true,
      noticeHours: 0,
      reason: null,
    });

    const result = await rescheduleManagedBookingAction(
      {},
      createFormData({
        token: "c".repeat(64),
        staffId: "77777777-7777-4777-8777-777777777777",
        startsAt: "2026-04-28T10:00:00.000Z",
      }),
    );

    expect(result).toEqual({
      error: "Tuto rezervaci už nejde online změnit.",
    });
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
  });

  it("pri uspesnem online presunu zapise historii, preskoci stary reminder a naplanuje novy s manage odkazem", async () => {
    const rpc = vi.fn(async () => ({ data: { id: BOOKING_ID }, error: null }));
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken
      .mockResolvedValueOnce({
        id: BOOKING_ID,
        tenant_id: TENANT_ID,
        service_id: "55555555-5555-4555-8555-555555555555",
        staff_id: STAFF_ID,
        starts_at: "2026-04-27T10:00:00.000Z",
        ends_at: "2026-04-27T11:00:00.000Z",
        status: "confirmed",
        clients: { email: "klient@example.com", full_name: "Jan Novak", id: CLIENT_ID },
        services: { name: "Střih" },
        staff: { name: "Eva" },
        tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
      })
      .mockResolvedValueOnce({
        id: BOOKING_ID,
        tenant_id: TENANT_ID,
        service_id: "55555555-5555-4555-8555-555555555555",
        staff_id: "77777777-7777-4777-8777-777777777777",
        starts_at: "2026-04-28T08:00:00.000Z",
        ends_at: "2026-04-28T09:00:00.000Z",
        status: "confirmed",
        clients: { email: "klient@example.com", full_name: "Jan Novak", id: CLIENT_ID },
        services: { name: "Střih" },
        staff: { name: "Petr" },
        tenants: { name: "Demo podnik", timezone: "Europe/Prague" },
      });
    mocks.getSelfServiceCancellationState.mockReturnValue({
      canCancel: true,
      noticeHours: 0,
      reason: null,
    });

    const result = await rescheduleManagedBookingAction(
      {},
      createFormData({
        token: "e".repeat(64),
        staffId: "77777777-7777-4777-8777-777777777777",
        startsAt: "2026-04-28T08:00:00.000Z",
      }),
    );

    expect(result).toEqual({ success: "Rezervace byla přesunuta." });
    expect(bookingEventsInsert).toHaveBeenCalledWith(expect.objectContaining({
      actor_type: "client",
      booking_id: BOOKING_ID,
      event_type: "rescheduled",
      tenant_id: TENANT_ID,
    }));
    expect(mocks.skipPendingBookingReminders).toHaveBeenCalledWith(supabase, {
      bookingId: BOOKING_ID,
      reason: "Booking rescheduled by client",
      tenantId: TENANT_ID,
    });
    expect(mocks.sendBookingRescheduleEmail).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        manageUrl: `http://localhost:3000/manage/${"e".repeat(64)}`,
        timeZone: "Europe/Prague",
      }),
    );
    expect(mocks.scheduleBookingReminder).toHaveBeenCalledWith(
      supabase,
      expect.objectContaining({
        bookingId: BOOKING_ID,
        manageUrl: `http://localhost:3000/manage/${"e".repeat(64)}`,
        timeZone: "Europe/Prague",
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith(`/manage/${"e".repeat(64)}`);
  });

  it("pri online presunu bez vracene rezervace nezapise historii ani neposle notifikace", async () => {
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    const bookingEventsInsert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_events") {
          return {
            insert: bookingEventsInsert,
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc,
    };

    mocks.createAdminClient.mockReturnValue(supabase);
    mocks.getBookingBySelfServiceToken.mockResolvedValue({
      id: BOOKING_ID,
      tenant_id: TENANT_ID,
      service_id: "55555555-5555-4555-8555-555555555555",
      staff_id: STAFF_ID,
      starts_at: "2026-04-27T10:00:00.000Z",
      ends_at: "2026-04-27T11:00:00.000Z",
      status: "confirmed",
      clients: { email: "klient@example.com", full_name: "Jan Novak", id: CLIENT_ID },
      services: { name: "Střih" },
      staff: { name: "Eva" },
      tenants: { name: "Demo podnik" },
    });
    mocks.getSelfServiceCancellationState.mockReturnValue({
      canCancel: true,
      noticeHours: 0,
      reason: null,
    });

    const result = await rescheduleManagedBookingAction(
      {},
      createFormData({
        token: "d".repeat(64),
        staffId: "77777777-7777-4777-8777-777777777777",
        startsAt: "2026-04-28T10:00:00.000Z",
      }),
    );

    expect(result).toEqual({
      error: "Nový termín už není volný. Vyberte prosím jiný.",
    });
    expect(rpc).toHaveBeenCalledOnce();
    expect(bookingEventsInsert).not.toHaveBeenCalled();
    expect(mocks.skipPendingBookingReminders).not.toHaveBeenCalled();
    expect(mocks.sendBookingRescheduleEmail).not.toHaveBeenCalled();
    expect(mocks.scheduleBookingReminder).not.toHaveBeenCalled();
  });
});
