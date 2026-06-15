import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
  hasSupabaseAdminEnv: vi.fn(),
  hasSupabaseEnv: vi.fn(),
  limitLogin: vi.fn(),
  limitRegister: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
  setOAuthBusinessRegistrationCookie: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/env", () => ({
  hasSupabaseAdminEnv: mocks.hasSupabaseAdminEnv,
  hasSupabaseEnv: mocks.hasSupabaseEnv,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: mocks.createClient,
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));

vi.mock("@/lib/rate-limit/auth", () => ({
  limitLogin: mocks.limitLogin,
  limitRegister: mocks.limitRegister,
}));

vi.mock("@/lib/auth/oauth-registration", () => ({
  setOAuthBusinessRegistrationCookie: mocks.setOAuthBusinessRegistrationCookie,
}));

function createFormData(entries: Record<string, string>) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }

  return formData;
}

type OAuthAction = (formData?: FormData) => Promise<void>;
type OAuthCall = { options: { redirectTo: string }; provider: string };

async function loadActions() {
  return await import("@/app/(auth)/actions") as unknown as Record<string, OAuthAction>;
}

describe("OAuth auth actions", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.createClient.mockReset();
    mocks.hasSupabaseAdminEnv.mockReset();
    mocks.hasSupabaseEnv.mockReset();
    mocks.redirect.mockClear();
    mocks.setOAuthBusinessRegistrationCookie.mockReset();
    mocks.hasSupabaseAdminEnv.mockReturnValue(true);
    mocks.hasSupabaseEnv.mockReturnValue(true);
    process.env.NEXT_PUBLIC_APP_URL = "https://app.temaro.test";
  });

  async function expectProviderRedirect(actionName: string, provider: string, formData = new FormData()) {
    const signInWithOAuth = vi.fn(async () => ({
      data: { url: `https://auth.example/${provider}` },
      error: null,
    }));
    mocks.createClient.mockResolvedValue({
      auth: {
        signInWithOAuth,
      },
    });
    const actions = await loadActions();

    expect(actions[actionName]).toBeTypeOf("function");
    await expect(actions[actionName](formData)).rejects.toThrow(`NEXT_REDIRECT:https://auth.example/${provider}`);
    expect(signInWithOAuth).toHaveBeenCalledWith({
      provider,
      options: {
        redirectTo: expect.stringContaining("https://app.temaro.test/auth/callback?next="),
      },
    });

    const calls = signInWithOAuth.mock.calls as unknown as Array<[OAuthCall]>;

    return calls[0]?.[0].options.redirectTo;
  }

  it.each([
    ["signInWithGoogleAction", "google"],
    ["signInWithFacebookAction", "facebook"],
    ["signInWithAppleAction", "apple"],
  ])("spusti podnikatelske OAuth prihlaseni pres %s", async (actionName, provider) => {
    await expectProviderRedirect(actionName, provider, createFormData({ redirectedFrom: "/calendar?view=week" }));
  });

  it.each([
    ["signInCustomerWithGoogleAction", "google"],
    ["signInCustomerWithFacebookAction", "facebook"],
    ["signInCustomerWithAppleAction", "apple"],
  ])("spusti zakaznicke OAuth prihlaseni pres %s na account", async (actionName, provider) => {
    const redirectTo = await expectProviderRedirect(actionName, provider);

    expect(redirectTo).toBe("https://app.temaro.test/auth/callback?next=%2Faccount");
  });

  it.each([
    ["registerWithGoogleAction", "google"],
    ["registerWithFacebookAction", "facebook"],
    ["registerWithAppleAction", "apple"],
  ])("ulozi pending podnik a spusti OAuth registraci pres %s", async (actionName, provider) => {
    const formData = createFormData({
      businessName: "Studio Magnolia",
      fullName: "Jana Novakova",
    });

    await expectProviderRedirect(actionName, provider, formData);
    expect(mocks.setOAuthBusinessRegistrationCookie).toHaveBeenCalledWith({
      businessName: "Studio Magnolia",
      fullName: "Jana Novakova",
    });
  });
});
