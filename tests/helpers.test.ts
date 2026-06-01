import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { getAuthContextError } from "@/lib/auth/session-context";
import { findAvailableTenantSlug } from "@/lib/auth/tenant-slug";
import { getBaseAppUrl } from "@/lib/app-url";
import {
  createBookingSelfServiceToken,
  getBookingBySelfServiceToken,
  getBookingManageUrl,
  getSelfServiceCancellationState,
  hashBookingSelfServiceToken,
  revokeBookingSelfServiceTokens,
} from "@/lib/booking/self-service";
import {
  getAvailableServicesForStaff,
  getSafeInitialId,
  getSafeSelectedServiceId,
} from "@/lib/calendar/manual-booking";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
  formatTimeForDisplay,
  getSafeDateLocale,
  getDateKeyForCalendar,
  getValidTimestamp,
} from "@/lib/date-format";
import { getClientIp } from "@/lib/rate-limit/client-ip";
import { getSafeAppLocale } from "@/lib/locale";
import { normalizePhoneInput } from "@/lib/phone";
import { createRateLimitKey } from "@/lib/rate-limit/key";
import { findMatchingClient } from "@/lib/clients/find-matching-client";
import { buildClientSearchFilter } from "@/lib/clients/search-filter";
import { formatCurrencyForDisplay, getSafeCurrency } from "@/lib/currency";
import { findMatchingService } from "@/lib/services/find-matching-service";
import { findMatchingStaff } from "@/lib/staff/find-matching-staff";
import { createSlug, createSlugWithSuffix } from "@/lib/slug";
import {
  getDateKeyInTimeZone,
  getSafeTimeZone,
  getUtcDayRangeForTimeZone,
  getUtcMonthStartForTimeZone,
  localDatetimeToUtcIso,
  utcIsoToLocalDatetimeValue,
} from "@/lib/time-zone";
import { escapeSupabaseLike, normalizeForCompare } from "@/lib/utils/normalize-search";

describe("helper functions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("vytvori bezpecny slug z ceskeho nazvu podniku", () => {
    expect(createSlug("  Pánské Střihy & Káva!!!  ")).toBe("panske-strihy-kava");
  });

  it("slug po zkraceni nezacina ani nekonci pomlckou", () => {
    const slug = createSlug(`${"a".repeat(63)} / demo`);

    expect(slug).toHaveLength(63);
    expect(slug).toMatch(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/);
  });

  it("povoli jen bezpecne lokalni presmerovani po loginu", () => {
    expect(getSafeRedirectPath("/calendar?view=day")).toBe("/calendar?view=day");
    expect(getSafeRedirectPath("/account")).toBe("/account");
    expect(getSafeRedirectPath("/start")).toBe("/start");
    expect(getSafeRedirectPath("https://evil.example")).toBe("/dashboard");
    expect(getSafeRedirectPath("//evil.example")).toBe("/dashboard");
    expect(getSafeRedirectPath("/login")).toBe("/dashboard");
    expect(getSafeRedirectPath("/register")).toBe("/dashboard");
    expect(getSafeRedirectPath("/api/cron/reminders")).toBe("/dashboard");
    expect(getSafeRedirectPath("/auth/callback?next=/calendar")).toBe("/dashboard");
  });

  it("pozna chybejici tenant nebo staff kontext v auth metadata", () => {
    expect(getAuthContextError(null)).toBe("missing_tenant");
    expect(getAuthContextError({ app_metadata: { role: "owner", tenant_id: " " } })).toBe("missing_tenant");
    expect(getAuthContextError({ app_metadata: { role: "owner", tenant_id: "tenant-1" } })).toBeNull();
    expect(getAuthContextError({ app_metadata: { tenant_id: "tenant-1" } })).toBe("missing_role");
    expect(getAuthContextError({ app_metadata: { role: "manager", tenant_id: "tenant-1" } })).toBe("missing_role");
    expect(getAuthContextError({ app_metadata: { role: "staff", tenant_id: "tenant-1" } })).toBe("missing_staff");
    expect(
      getAuthContextError({
        app_metadata: {
          role: "staff",
          staff_id: " ",
          tenant_id: "tenant-1",
        },
      }),
    ).toBe("missing_staff");
    expect(
      getAuthContextError({
        app_metadata: {
          role: "staff",
          staff_id: "staff-1",
          tenant_id: "tenant-1",
        },
      }),
    ).toBeNull();
  });

  it("overi aktivni tenant a staff profil ze sdileneho auth helperu", async () => {
    const createLookupChain = (result: { data: { id: string } | null; error: unknown }) => {
      const chain = {
        eq: vi.fn(() => chain),
        is: vi.fn(() => chain),
        maybeSingle: vi.fn(async () => result),
        select: vi.fn(() => chain),
      };

      return chain;
    };
    const tenantChain = createLookupChain({ data: { id: "tenant-1" }, error: null });
    const staffChain = createLookupChain({ data: { id: "staff-1" }, error: null });
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return { select: vi.fn(() => tenantChain) };
        }

        if (table === "staff") {
          return { select: vi.fn(() => staffChain) };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    } as unknown as Parameters<typeof getActiveAuthContextError>[0];

    await expect(
      getActiveAuthContextError(supabase, {
        app_metadata: {
          role: "staff",
          staff_id: " staff-1 ",
          tenant_id: " tenant-1 ",
        },
      }),
    ).resolves.toBeNull();

    expect(tenantChain.eq).toHaveBeenCalledWith("id", "tenant-1");
    expect(staffChain.eq).toHaveBeenCalledWith("id", "staff-1");
    expect(staffChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(staffChain.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("sdileny auth helper odmitne neoveritelny tenant nebo staff profil", async () => {
    const createLookupChain = (result: { data: { id: string } | null; error: unknown }) => {
      const chain = {
        eq: vi.fn(() => chain),
        is: vi.fn(() => chain),
        maybeSingle: vi.fn(async () => result),
        select: vi.fn(() => chain),
      };

      return chain;
    };
    const tenantMissingChain = createLookupChain({ data: null, error: null });
    const tenantOkChain = createLookupChain({ data: { id: "tenant-1" }, error: null });
    const staffMissingChain = createLookupChain({ data: null, error: { code: "500" } });
    const tenantMissingSupabase = {
      from: vi.fn(() => ({ select: vi.fn(() => tenantMissingChain) })),
    } as unknown as Parameters<typeof getActiveAuthContextError>[0];
    const staffMissingSupabase = {
      from: vi.fn((table: string) => {
        if (table === "tenants") {
          return { select: vi.fn(() => tenantOkChain) };
        }

        if (table === "staff") {
          return { select: vi.fn(() => staffMissingChain) };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    } as unknown as Parameters<typeof getActiveAuthContextError>[0];

    await expect(
      getActiveAuthContextError(tenantMissingSupabase, {
        app_metadata: { role: "owner", tenant_id: "tenant-1" },
      }),
    ).resolves.toBe("missing_tenant");
    await expect(
      getActiveAuthContextError(staffMissingSupabase, {
        app_metadata: {
          role: "staff",
          staff_id: "staff-1",
          tenant_id: "tenant-1",
        },
      }),
    ).resolves.toBe("missing_staff");
  });

  it("prida ke slugu ciselnou priponu a udrzi maximalni delku", () => {
    const longSlug = "a".repeat(64);

    expect(createSlugWithSuffix("barber", 2)).toBe("barber-2");
    expect(createSlugWithSuffix(`${"a".repeat(61)}-demo`, 2)).not.toContain("--2");
    expect(createSlugWithSuffix(longSlug, 25)).toHaveLength(64);
    expect(createSlugWithSuffix(longSlug, 25)).toMatch(/-25$/);
  });

  it("pri hledani volneho slugu ignoruje smazane podniky", async () => {
    const maybeSingle = vi.fn(async () => ({ data: null, error: null }));
    const query = {
      ilike: vi.fn(() => query),
      is: vi.fn(() => query),
      maybeSingle,
      select: vi.fn(() => query),
    };
    const admin = {
      from: vi.fn(() => query),
    };

    const result = await findAvailableTenantSlug(admin, "Demo podnik");

    expect(result).toEqual({ error: false, slug: "demo-podnik" });
    expect(query.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("pri obsazenem slugu zkusi ciselny suffix", async () => {
    const maybeSingle = vi
      .fn()
      .mockResolvedValueOnce({ data: { id: "tenant-1" }, error: null })
      .mockResolvedValueOnce({ data: null, error: null });
    const query = {
      ilike: vi.fn(() => query),
      is: vi.fn(() => query),
      maybeSingle,
      select: vi.fn(() => query),
    };
    const admin = {
      from: vi.fn(() => query),
    };

    const result = await findAvailableTenantSlug(admin, "Demo podnik");

    expect(result).toEqual({ error: false, slug: "demo-podnik-2" });
    expect(query.ilike).toHaveBeenNthCalledWith(1, "slug", "demo-podnik");
    expect(query.ilike).toHaveBeenNthCalledWith(2, "slug", "demo-podnik-2");
  });

  it("vezme prvni IP adresu z x-forwarded-for", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.10, 198.51.100.20",
      "cf-connecting-ip": "198.51.100.30",
    });

    expect(getClientIp(headers)).toBe("203.0.113.10");
  });

  it("pouzije Cloudflare IP, kdyz chybi x-forwarded-for", () => {
    const headers = new Headers({
      "cf-connecting-ip": "198.51.100.30",
    });

    expect(getClientIp(headers)).toBe("198.51.100.30");
  });

  it("oreze mezery ve fallback IP hlavickach", () => {
    const cloudflareHeaders = new Headers({
      "cf-connecting-ip": " 198.51.100.30 ",
    });
    const realIpHeaders = new Headers({
      "x-real-ip": " 203.0.113.10 ",
    });

    expect(getClientIp(cloudflareHeaders)).toBe("198.51.100.30");
    expect(getClientIp(realIpHeaders)).toBe("203.0.113.10");
  });

  it("preskoci unknown hodnotu v IP hlavickach", () => {
    const headers = new Headers({
      "cf-connecting-ip": "198.51.100.30",
      "x-forwarded-for": "unknown, 203.0.113.10",
    });

    expect(getClientIp(headers)).toBe("198.51.100.30");
  });

  it("vrati unknown az kdyz chybi pouzitelna IP hlavicka", () => {
    const headers = new Headers({
      "cf-connecting-ip": "unknown",
      "x-real-ip": " ",
    });

    expect(getClientIp(headers)).toBe("unknown");
  });

  it("rate-limit klic neobsahuje email ani IP adresu", () => {
    const key = createRateLimitKey(["auth", "203.0.113.10", "JAN@EXAMPLE.COM"]);

    expect(key).toMatch(/^[a-f0-9]{64}$/);
    expect(key).not.toContain("203.0.113.10");
    expect(key).not.toContain("jan@example.com");
    expect(key).toBe(createRateLimitKey(["auth", "203.0.113.10", "jan@example.com"]));
  });

  it("normalizuje text pro jednoduche porovnani", () => {
    expect(normalizeForCompare("  JAN@EXAMPLE.COM ")).toBe("jan@example.com");
    expect(normalizeForCompare("  Jan   Novak  ")).toBe("jan novak");
  });

  it("normalizuje telefon pred ulozenim a porovnavanim", () => {
    expect(normalizePhoneInput(" +420 777 123 456 ")).toBe("+420777123456");
    expect(normalizePhoneInput("(777) 123-456")).toBe("777123456");
    expect(normalizePhoneInput("777/123/456")).toBe("777123456");
  });

  it("formatovani meny spadne na CZK pri neplatne hodnote", () => {
    expect(getSafeCurrency("EUR")).toBe("EUR");
    expect(getSafeCurrency("bad-currency")).toBe("CZK");
    expect(formatCurrencyForDisplay(12345, "bad-currency")).toContain("Kč");
  });

  it("neplatny datum vrati jako chybejici timestamp", () => {
    expect(getValidTimestamp("2026-05-01T10:00:00.000Z")).toBe(Date.parse("2026-05-01T10:00:00.000Z"));
    expect(getValidTimestamp("neni-datum")).toBeNull();
  });

  it("formatovani data spadne na bezpecny locale pri neplatne hodnote", () => {
    expect(getSafeDateLocale("sk")).toBe("sk");
    expect(getSafeDateLocale("neni validni locale")).toBe("cs-CZ");
    expect(formatDateTimeForDisplay("2026-05-01T10:00:00.000Z", "Europe/Prague", "neni validni locale")).toContain("2026");
  });

  it("aplikacni locale spadne na cestinu pri neplatne hodnote", () => {
    expect(getSafeAppLocale("SK")).toBe("sk");
    expect(getSafeAppLocale("neni-validni")).toBe("cs");
  });

  it("escapuje specialni znaky pro Supabase like hledani", () => {
    expect(escapeSupabaseLike("Novak, Jan_%\\")).toBe("Novak\\, Jan\\_\\%\\\\");
  });

  it("pri hledani klientu prida normalizovany telefonni dotaz", () => {
    expect(buildClientSearchFilter("+420 777")).toBe(
      "full_name.ilike.%+420 777%,phone.ilike.%+420 777%,email.ilike.%+420 777%,notes.ilike.%+420 777%,flag_reason.ilike.%+420 777%,phone.ilike.%+420777%",
    );
  });

  it("pri hledani klientu neduplikuje uz normalizovany telefonni dotaz", () => {
    expect(buildClientSearchFilter("+420777")).toBe(
      "full_name.ilike.%+420777%,phone.ilike.%+420777%,email.ilike.%+420777%,notes.ilike.%+420777%,flag_reason.ilike.%+420777%",
    );
  });

  it("pri chybe databaze nezamlci hledani existujiciho klienta", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      limit: vi.fn(() => query),
      maybeSingle: vi.fn(async () => ({ data: null, error: { code: "500" } })),
      or: vi.fn(() => query),
      order: vi.fn(() => query),
      select: vi.fn(() => query),
    };
    const supabase = {
      from: vi.fn(() => query),
    };

    await expect(
      findMatchingClient(supabase as never, "tenant-1", {
        email: "jan@example.com",
      }),
    ).rejects.toThrow("Failed to find matching client.");
  });

  it("pri hledani existujiciho klienta zkusi normalizovany i puvodni telefon", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      limit: vi.fn(() => query),
      maybeSingle: vi.fn(async () => ({ data: { id: "client-1" }, error: null })),
      or: vi.fn(() => query),
      order: vi.fn(() => query),
      select: vi.fn(() => query),
    };
    const supabase = {
      from: vi.fn(() => query),
    };

    await expect(
      findMatchingClient(supabase as never, "tenant-1", {
        phone: " +420 777 123 456 ",
      }),
    ).resolves.toEqual({ id: "client-1" });

    expect(query.or).toHaveBeenCalledWith("phone.eq.+420777123456,phone.eq.+420 777 123 456");
  });

  it("pri chybe databaze nezamlci hledani existujici sluzby", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      order: vi.fn(async () => ({ data: null, error: { code: "500" } })),
      select: vi.fn(() => query),
    };
    const supabase = {
      from: vi.fn(() => query),
    };

    await expect(findMatchingService(supabase as never, "tenant-1", "Strih")).rejects.toThrow(
      "Failed to find matching service.",
    );
  });

  it("najde existujici sluzbu i pri rozdilnych vnitrnich mezerach", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      order: vi.fn(async () => ({
        data: [{ id: "service-1", name: "Pansky   strih" }],
        error: null,
      })),
      select: vi.fn(() => query),
    };
    const supabase = {
      from: vi.fn(() => query),
    };

    await expect(findMatchingService(supabase as never, "tenant-1", "pansky strih")).resolves.toEqual({
      id: "service-1",
      name: "Pansky   strih",
    });
  });

  it("pri chybe databaze nezamlci hledani existujiciho zamestnance", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      order: vi.fn(async () => ({ data: null, error: { code: "500" } })),
      select: vi.fn(() => query),
    };
    const supabase = {
      from: vi.fn(() => query),
    };

    await expect(findMatchingStaff(supabase as never, "tenant-1", "Adam")).rejects.toThrow(
      "Failed to find matching staff.",
    );
  });

  it("najde existujiciho zamestnance i pri rozdilnych vnitrnich mezerach", async () => {
    const query = {
      eq: vi.fn(() => query),
      is: vi.fn(() => query),
      order: vi.fn(async () => ({
        data: [{ id: "staff-1", name: "Eva   Novak" }],
        error: null,
      })),
      select: vi.fn(() => query),
    };
    const supabase = {
      from: vi.fn(() => query),
    };

    await expect(findMatchingStaff(supabase as never, "tenant-1", "eva novak")).resolves.toEqual({
      id: "staff-1",
      name: "Eva   Novak",
    });
  });

  it("prevede datetime-local z prazskeho casu na UTC", () => {
    expect(localDatetimeToUtcIso("2026-04-28T10:00", "Europe/Prague")).toBe(
      "2026-04-28T08:00:00.000Z",
    );
  });

  it("prevede datetime-local spravne pred jarnim posunem casu", () => {
    expect(localDatetimeToUtcIso("2026-03-29T01:30", "Europe/Prague")).toBe(
      "2026-03-29T00:30:00.000Z",
    );
  });

  it("neprevede neexistujici lokalni cas pri jarnim posunu na jiny termin", () => {
    expect(localDatetimeToUtcIso("2026-03-29T02:30", "Europe/Prague")).toBe(
      "2026-03-29T02:30",
    );
  });

  it("necha uz hotovy ISO cas jako ISO cas", () => {
    expect(localDatetimeToUtcIso("2026-04-28T10:00:00.000Z", "Europe/Prague")).toBe(
      "2026-04-28T10:00:00.000Z",
    );
  });

  it("neprevede neexistujici lokalni datum na jiny den", () => {
    expect(localDatetimeToUtcIso("2026-02-31T10:00", "Europe/Prague")).toBe(
      "2026-02-31T10:00",
    );
  });

  it("prevede UTC cas do datetime-local podle timezone", () => {
    expect(utcIsoToLocalDatetimeValue("2026-04-28T08:00:00.000Z", "Europe/Prague")).toBe(
      "2026-04-28T10:00",
    );
  });

  it("prevede UTC cas s fallbackem pri neplatne timezone", () => {
    expect(utcIsoToLocalDatetimeValue("2026-04-28T08:00:00.000Z", "Invalid/Timezone")).toBe(
      "2026-04-28T10:00",
    );
  });

  it("nahradi neplatnou timezone bezpecnou vychozi hodnotou", () => {
    expect(getSafeTimeZone("Invalid/Timezone")).toBe("Europe/Prague");
    expect(getSafeTimeZone("UTC")).toBe("UTC");
  });

  it("nahradi i neplatny timezone fallback bezpecnou vychozi hodnotou", () => {
    expect(getSafeTimeZone("Invalid/Timezone", "Invalid/Fallback")).toBe("Europe/Prague");
  });

  it("formatovani casu nespadne pri neplatnem terminu", () => {
    expect(formatDateTimeForDisplay("neplatny-cas", "Europe/Prague")).toBe("Neplatný termín");
  });

  it("formatovani samotneho casu nespadne pri neplatnem terminu", () => {
    expect(formatTimeForDisplay("neplatny-cas", "Europe/Prague")).toBe("Neplatný termín");
  });

  it("formatovani data nespadne pri neplatnem datu", () => {
    expect(formatDateForDisplay("neplatne-datum")).toBe("Neplatné datum");
  });

  it("formatovani casu pouzije bezpecnou timezone", () => {
    expect(formatDateTimeForDisplay("2026-04-28T08:00:00.000Z", "Invalid/Timezone")).toContain(
      "10:00",
    );
  });

  it("calendar day key ma fallback pri neplatnem casu", () => {
    expect(
      getDateKeyForCalendar("neplatny-cas", "Europe/Prague", new Date("2026-04-28T08:00:00.000Z")),
    ).toBe("2026-04-28");
  });

  it("calendar day key nespadne ani pri neplatnem fallbacku", () => {
    expect(
      getDateKeyForCalendar("neplatny-cas", "Europe/Prague", new Date("neplatny-fallback")),
    ).toBe("1970-01-01");
  });

  it("timezone day key ma fallback pri neplatnem vstupu", () => {
    expect(
      getDateKeyInTimeZone("neplatny-cas", "Europe/Prague", new Date("2026-04-28T08:00:00.000Z")),
    ).toBe("2026-04-28");
  });

  it("timezone day key nespadne ani pri neplatnem fallbacku", () => {
    expect(
      getDateKeyInTimeZone("neplatny-cas", "Europe/Prague", new Date("neplatny-fallback")),
    ).toBe("1970-01-01");
  });

  it("spocita denni a mesicni UTC hranice podle timezone", () => {
    expect(getDateKeyInTimeZone("2026-04-27T22:30:00.000Z", "Europe/Prague")).toBe("2026-04-28");
    expect(getUtcDayRangeForTimeZone("2026-04-27T22:30:00.000Z", "Europe/Prague")).toEqual({
      start: "2026-04-27T22:00:00.000Z",
      end: "2026-04-28T22:00:00.000Z",
    });
    expect(getUtcMonthStartForTimeZone("2026-04-27T22:30:00.000Z", "Europe/Prague")).toBe(
      "2026-03-31T22:00:00.000Z",
    );
  });

  it("povoli online zruseni pred storno lhutou", () => {
    const state = getSelfServiceCancellationState(
      {
        starts_at: "2026-04-27T12:00:00.000Z",
        tenants: { cancellation_notice_hours: 24 },
      },
      new Date("2026-04-26T10:00:00.000Z"),
    );

    expect(state.canCancel).toBe(true);
    expect(state.reason).toBeNull();
  });

  it("zakaze online zruseni po storno lhute", () => {
    const state = getSelfServiceCancellationState(
      {
        deposit_amount: 5000,
        deposit_paid: true,
        starts_at: "2026-04-27T12:00:00.000Z",
        tenants: { cancellation_notice_hours: 24 },
      },
      new Date("2026-04-27T00:00:00.000Z"),
    );

    expect(state.canCancel).toBe(false);
    expect(state.reason).toContain("storno lhůtu 24 hodin");
    expect(state.reason).toContain("Zaplacenou zálohu");
    expect(state.depositAmount).toBe(5000);
    expect(state.depositPaid).toBe(true);
    expect(state.depositPolicy).toContain("Záloha je zaplacená");
    expect(state.hoursUntilStart).toBe(12);
  });

  it("ukaze storno informaci i u nezaplacene zalohy pred lhutou", () => {
    const state = getSelfServiceCancellationState(
      {
        deposit_amount: 3000,
        deposit_paid: false,
        starts_at: "2026-04-27T12:00:00.000Z",
        tenants: { cancellation_notice_hours: 24 },
      },
      new Date("2026-04-26T10:00:00.000Z"),
    );

    expect(state.canCancel).toBe(true);
    expect(state.depositPolicy).toContain("Záloha zatím není zaplacená");
    expect(state.hoursUntilStart).toBe(26);
  });

  it("zakaze online zruseni po zacatku terminu i bez storno lhuty", () => {
    const state = getSelfServiceCancellationState(
      {
        starts_at: "2026-04-27T12:00:00.000Z",
        tenants: { cancellation_notice_hours: 0 },
      },
      new Date("2026-04-27T12:00:01.000Z"),
    );

    expect(state.canCancel).toBe(false);
    expect(state.reason).toContain("už začal nebo proběhl");
  });

  it("zakaze online zruseni pri neplatnem casu rezervace", () => {
    const state = getSelfServiceCancellationState(
      {
        starts_at: "neni-datum",
        tenants: { cancellation_notice_hours: 0 },
      },
      new Date("2026-04-26T10:00:00.000Z"),
    );

    expect(state.canCancel).toBe(false);
    expect(state.reason).toContain("není platný");
  });

  it("sestavi self-service manage odkaz bez dvojiteho lomitka", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://rezervace.example/");

    expect(getBookingManageUrl("abc123")).toBe("https://rezervace.example/manage/abc123");
  });

  it("zakladni app URL bere jen origin bez cesty", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://rezervace.example/app/");

    expect(getBaseAppUrl()).toBe("https://rezervace.example");
    expect(getBookingManageUrl("abc123")).toBe("https://rezervace.example/manage/abc123");
  });

  it("zakladni app URL spadne na localhost pri neplatne env hodnote", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "neni-url");

    expect(getBaseAppUrl()).toBe("http://localhost:3000");
    expect(getBookingManageUrl("abc123")).toBe("http://localhost:3000/manage/abc123");
  });

  it("zakladni app URL nepovoli ne-http protokol", () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "javascript:alert(1)");

    expect(getBaseAppUrl()).toBe("http://localhost:3000");
    expect(getBookingManageUrl("abc123")).toBe("http://localhost:3000/manage/abc123");
  });

  it("nevytvori novy self-service token, kdyz se nepodari zneplatnit stary", async () => {
    const updateChain = {
      eq: vi.fn(() => updateChain),
      is: vi.fn(async () => ({ error: { code: "500" } })),
    };
    const insert = vi.fn();
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_self_service_tokens") {
          return {
            insert,
            update: vi.fn(() => updateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    await expect(
      createBookingSelfServiceToken(supabase as never, {
        bookingId: "booking-1",
        tenantId: "tenant-1",
      }),
    ).rejects.toThrow("Failed to revoke previous booking self-service tokens.");
    expect(insert).not.toHaveBeenCalled();
  });

  it("nezamlci chybu databaze pri zneplatneni self-service tokenu", async () => {
    const updateChain = {
      eq: vi.fn(() => updateChain),
      is: vi.fn(async () => ({ error: { code: "500" } })),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_self_service_tokens") {
          return {
            update: vi.fn(() => updateChain),
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    await expect(
      revokeBookingSelfServiceTokens(supabase as never, {
        bookingId: "booking-1",
        tenantId: "tenant-1",
      }),
    ).rejects.toThrow("Failed to revoke booking self-service tokens.");
  });

  it("self-service token dohleda jen aktivni budouci rezervaci", async () => {
    const tokenChain = {
      eq: vi.fn(() => tokenChain),
      gt: vi.fn(() => tokenChain),
      is: vi.fn(() => tokenChain),
      maybeSingle: vi.fn(async () => ({
        data: {
          booking_id: "booking-1",
          tenant_id: "tenant-1",
        },
      })),
      select: vi.fn(() => tokenChain),
    };
    const bookingChain = {
      eq: vi.fn(() => bookingChain),
      gt: vi.fn(() => bookingChain),
      in: vi.fn(() => bookingChain),
      maybeSingle: vi.fn(async () => ({ data: { id: "booking-1" } })),
      select: vi.fn(() => bookingChain),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_self_service_tokens") {
          return tokenChain;
        }

        if (table === "bookings") {
          return bookingChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    const booking = await getBookingBySelfServiceToken(supabase as never, "abc123");

    expect(booking).toEqual({ id: "booking-1" });
    expect(tokenChain.eq).toHaveBeenCalledWith("token_hash", hashBookingSelfServiceToken("abc123"));
    expect(tokenChain.gt).toHaveBeenCalledWith("expires_at", expect.any(String));
    expect(tokenChain.is).toHaveBeenCalledWith("revoked_at", null);
    expect(bookingChain.eq).toHaveBeenCalledWith("tenant_id", "tenant-1");
    expect(bookingChain.eq).toHaveBeenCalledWith("id", "booking-1");
    expect(bookingChain.in).toHaveBeenCalledWith("status", ["pending", "confirmed"]);
    expect(bookingChain.gt).toHaveBeenCalledWith("starts_at", expect.any(String));
  });

  it("self-service token nezamlci chybu pri overeni tokenu", async () => {
    const tokenChain = {
      eq: vi.fn(() => tokenChain),
      gt: vi.fn(() => tokenChain),
      is: vi.fn(() => tokenChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: { code: "500" } })),
      select: vi.fn(() => tokenChain),
    };
    const supabase = {
      from: vi.fn(() => tokenChain),
    };

    await expect(getBookingBySelfServiceToken(supabase as never, "abc123")).rejects.toThrow(
      "Failed to verify booking self-service token.",
    );
  });

  it("self-service token nezamlci chybu pri nacteni rezervace", async () => {
    const tokenChain = {
      eq: vi.fn(() => tokenChain),
      gt: vi.fn(() => tokenChain),
      is: vi.fn(() => tokenChain),
      maybeSingle: vi.fn(async () => ({
        data: {
          booking_id: "booking-1",
          tenant_id: "tenant-1",
        },
        error: null,
      })),
      select: vi.fn(() => tokenChain),
    };
    const bookingChain = {
      eq: vi.fn(() => bookingChain),
      gt: vi.fn(() => bookingChain),
      in: vi.fn(() => bookingChain),
      maybeSingle: vi.fn(async () => ({ data: null, error: { code: "500" } })),
      select: vi.fn(() => bookingChain),
    };
    const supabase = {
      from: vi.fn((table: string) => {
        if (table === "booking_self_service_tokens") {
          return tokenChain;
        }

        if (table === "bookings") {
          return bookingChain;
        }

        throw new Error(`Unexpected table ${table}`);
      }),
    };

    await expect(getBookingBySelfServiceToken(supabase as never, "abc123")).rejects.toThrow(
      "Failed to load booking for self-service token.",
    );
  });

  it("vrati jen platne predvybrane ID", () => {
    expect(getSafeInitialId(["a", "b"], "b", "x")).toBe("b");
    expect(getSafeInitialId(["a", "b"], "c", "x")).toBe("x");
  });

  it("vrati jen dostupne sluzby vybraneho zamestnance", () => {
    const services = [
      {
        id: "service-1",
        tenant_id: "tenant-1",
        name: "Strih",
        description: null,
        duration_minutes: 30,
        price: 1000,
        currency: "CZK" as const,
        buffer_minutes: 0,
        is_active: true,
        position: 0,
        created_at: "2026-04-01T00:00:00.000Z",
        deleted_at: null,
      },
      {
        id: "service-2",
        tenant_id: "tenant-1",
        name: "Vousy",
        description: null,
        duration_minutes: 30,
        price: 1000,
        currency: "CZK" as const,
        buffer_minutes: 0,
        is_active: true,
        position: 0,
        created_at: "2026-04-01T00:00:00.000Z",
        deleted_at: null,
      },
    ];
    const staff = [
      {
        id: "staff-1",
        tenant_id: "tenant-1",
        user_id: null,
        name: "Adam",
        bio: null,
        avatar_url: null,
        color: "#000000",
        is_active: true,
        created_at: "2026-04-01T00:00:00.000Z",
        deleted_at: null,
        staff_services: [{ tenant_id: "tenant-1", staff_id: "staff-1", service_id: "service-2" }],
      },
    ];

    expect(getAvailableServicesForStaff(services, staff, "staff-1").map((service) => service.id)).toEqual([
      "service-2",
    ]);
  });

  it("udrzi nebo nahradi vybranou sluzbu podle dostupnosti", () => {
    const services = [
      {
        id: "service-1",
        tenant_id: "tenant-1",
        name: "Strih",
        description: null,
        duration_minutes: 30,
        price: 1000,
        currency: "CZK" as const,
        buffer_minutes: 0,
        is_active: true,
        position: 0,
        created_at: "2026-04-01T00:00:00.000Z",
        deleted_at: null,
      },
    ];

    expect(getSafeSelectedServiceId(services, "service-1")).toBe("service-1");
    expect(getSafeSelectedServiceId(services, "service-2")).toBe("service-1");
    expect(getSafeSelectedServiceId([], "service-1")).toBe("");
  });
});
