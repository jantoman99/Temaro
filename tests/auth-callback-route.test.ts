import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  consumeOAuthBusinessRegistrationCookie: vi.fn(),
  createBusinessForOAuthUser: vi.fn(),
  createClient: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/auth/oauth-registration", () => ({
  consumeOAuthBusinessRegistrationCookie: mocks.consumeOAuthBusinessRegistrationCookie,
  createBusinessForOAuthUser: mocks.createBusinessForOAuthUser,
}));

vi.mock("@/lib/env", () => ({
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv,
}));

import { GET } from "@/app/auth/callback/route";

function createRequest(url: string) {
  return { url } as NextRequest;
}

function createLookupChain(result: { data: { id: string } | null; error: unknown } = {
  data: { id: "ok" },
  error: null,
}) {
  const chain = {
    eq: vi.fn(() => chain),
    is: vi.fn(() => chain),
    maybeSingle: vi.fn(async () => result),
    select: vi.fn(() => chain),
  };

  return chain;
}

function createSupabaseAuthMock({
  exchangeError = null,
  refreshedUser = { app_metadata: { role: "owner", tenant_id: "tenant-1" } },
  refreshError = null,
  staffLookup = { data: { id: "staff-1" }, error: null },
  tenantLookup = { data: { id: "tenant-1" }, error: null },
  user = { app_metadata: { role: "owner", tenant_id: "tenant-1" } },
}: {
  exchangeError?: unknown;
  refreshedUser?: unknown;
  refreshError?: unknown;
  staffLookup?: { data: { id: string } | null; error: unknown };
  tenantLookup?: { data: { id: string } | null; error: unknown };
  user?: unknown;
} = {}) {
  const tenantChain = createLookupChain(tenantLookup);
  const staffChain = createLookupChain(staffLookup);

  return {
    auth: {
      exchangeCodeForSession: vi.fn(async () => ({ error: exchangeError })),
      getUser: vi
        .fn()
        .mockResolvedValueOnce({ data: { user }, error: null })
        .mockResolvedValue({ data: { user: refreshedUser }, error: null }),
      refreshSession: vi.fn(async () => ({ error: refreshError })),
      signOut: vi.fn(async () => ({ error: null })),
    },
    from: vi.fn((table: string) => {
      if (table === "tenants") {
        return {
          select: vi.fn(() => tenantChain),
        };
      }

      if (table === "staff") {
        return {
          select: vi.fn(() => staffChain),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
    staffChain,
    tenantChain,
  };
}

describe("auth callback route", () => {
  beforeEach(() => {
    mocks.consumeOAuthBusinessRegistrationCookie.mockReset();
    mocks.consumeOAuthBusinessRegistrationCookie.mockResolvedValue(null);
    mocks.createBusinessForOAuthUser.mockReset();
    mocks.createBusinessForOAuthUser.mockResolvedValue({ error: null, tenantId: "tenant-1" });
    mocks.createClient.mockReset();
    mocks.hasSupabaseAdminEnv.mockReset();
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
  });

  it("po uspesnem callbacku povoli jen bezpecne dashboard presmerovani", async () => {
    const supabase = createSupabaseAuthMock();
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar?view=day"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/calendar?view=day");
    expect(supabase.auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("po uspesnem callbacku zablokuje externi next adresu", async () => {
    const supabase = createSupabaseAuthMock();
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=https://evil.example"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
  });

  it("pri chybe vymeny kodu posle uzivatele zpet na login", async () => {
    const supabase = createSupabaseAuthMock({ exchangeError: { message: "bad code" } });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=bad&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=auth_callback");
    expect(supabase.auth.getUser).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("odhlasi uzivatele bez tenant kontextu", async () => {
    const supabase = createSupabaseAuthMock({ user: { app_metadata: { role: "owner" } } });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_tenant");
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("pri Google registraci vytvori tenant z pending cookie a obnovi session", async () => {
    const supabase = createSupabaseAuthMock({
      refreshedUser: {
        app_metadata: { role: "owner", tenant_id: "tenant-1" },
        email: "owner@example.com",
        id: "user-1",
      },
      user: {
        app_metadata: {},
        email: "owner@example.com",
        id: "user-1",
      },
    });
    mocks.consumeOAuthBusinessRegistrationCookie.mockResolvedValue({
      businessName: "Google Barber",
      fullName: "Owner Google",
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/calendar");
    expect(mocks.createBusinessForOAuthUser).toHaveBeenCalledWith({
      businessName: "Google Barber",
      email: "owner@example.com",
      fullName: "Owner Google",
      userId: "user-1",
    });
    expect(supabase.auth.refreshSession).toHaveBeenCalledOnce();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("pusti zakaznicky ucet bez tenant metadata jen na account routu", async () => {
    const supabase = createSupabaseAuthMock({
      user: {
        app_metadata: {},
        email: "client@example.com",
        id: "client-user-1",
      },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/account"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/account");
    expect(mocks.consumeOAuthBusinessRegistrationCookie).not.toHaveBeenCalled();
    expect(mocks.createBusinessForOAuthUser).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("pusti recovery session bez tenant metadata na nastaveni noveho hesla", async () => {
    const supabase = createSupabaseAuthMock({
      user: {
        app_metadata: {},
        email: "owner@example.com",
        id: "recovery-user-1",
      },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/reset-password"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/reset-password");
    expect(mocks.consumeOAuthBusinessRegistrationCookie).not.toHaveBeenCalled();
    expect(mocks.createBusinessForOAuthUser).not.toHaveBeenCalled();
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });

  it("pri neuspesne Google registraci odhlasi uzivatele", async () => {
    const supabase = createSupabaseAuthMock({
      user: {
        app_metadata: {},
        email: "owner@example.com",
        id: "user-1",
      },
    });
    mocks.consumeOAuthBusinessRegistrationCookie.mockResolvedValue({
      businessName: "Google Barber",
      fullName: "Owner Google",
    });
    mocks.createBusinessForOAuthUser.mockResolvedValue({ error: "registration_failed" });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=oauth_registration_failed");
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("odhlasi uzivatele bez role v podniku", async () => {
    const supabase = createSupabaseAuthMock({ user: { app_metadata: { tenant_id: "tenant-1" } } });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_role");
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("odhlasi staff uzivatele bez propojeni na zamestnance", async () => {
    const supabase = createSupabaseAuthMock({
      user: { app_metadata: { role: "staff", tenant_id: "tenant-1" } },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_staff");
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("odhlasi uzivatele bez aktivniho tenanta", async () => {
    const supabase = createSupabaseAuthMock({
      tenantLookup: { data: null, error: null },
      user: { app_metadata: { role: "owner", tenant_id: "tenant-1" } },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_tenant");
    expect(supabase.tenantChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("odhlasi uzivatele, kdyz aktivniho tenanta nejde overit", async () => {
    const supabase = createSupabaseAuthMock({
      tenantLookup: { data: null, error: { code: "500" } },
      user: { app_metadata: { role: "owner", tenant_id: "tenant-1" } },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_tenant");
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("odhlasi staff uzivatele bez aktivniho profilu zamestnance", async () => {
    const supabase = createSupabaseAuthMock({
      staffLookup: { data: null, error: null },
      user: {
        app_metadata: {
          role: "staff",
          staff_id: "staff-1",
          tenant_id: "tenant-1",
        },
      },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_staff");
    expect(supabase.staffChain.eq).toHaveBeenCalledWith("is_active", true);
    expect(supabase.staffChain.is).toHaveBeenCalledWith("deleted_at", null);
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });

  it("odhlasi staff uzivatele, kdyz aktivni profil zamestnance nejde overit", async () => {
    const supabase = createSupabaseAuthMock({
      staffLookup: { data: null, error: { code: "500" } },
      user: {
        app_metadata: {
          role: "staff",
          staff_id: "staff-1",
          tenant_id: "tenant-1",
        },
      },
    });
    mocks.createClient.mockResolvedValue(supabase);

    const response = await GET(createRequest("http://localhost:3000/auth/callback?code=abc&next=/calendar"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=missing_staff");
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
  });
});
