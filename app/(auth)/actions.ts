"use server";

import { redirect } from "next/navigation";

import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { setOAuthBusinessRegistrationCookie } from "@/lib/auth/oauth-registration";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getAuthContextError } from "@/lib/auth/session-context";
import { findAvailableTenantSlug } from "@/lib/auth/tenant-slug";
import { getBaseAppUrl } from "@/lib/app-url";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { limitLogin, limitRegister } from "@/lib/rate-limit/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, oauthBusinessRegistrationSchema, registerSchema } from "@/lib/validations/auth";

type AuthActionState = {
  error?: string;
};

function isDuplicateAuthEmailError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const { code, message, status } = error as {
    code?: unknown;
    message?: unknown;
    status?: unknown;
  };
  const normalizedCode = typeof code === "string" ? code.toLowerCase() : "";
  const normalizedMessage = typeof message === "string" ? message.toLowerCase() : "";

  return (
    normalizedCode.includes("email")
    && (normalizedCode.includes("exist") || normalizedCode.includes("registered"))
  ) || (
    status === 422
    && normalizedMessage.includes("email")
    && (
      normalizedMessage.includes("already")
      || normalizedMessage.includes("exist")
      || normalizedMessage.includes("registered")
    )
  );
}

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function getRegisterInput(formData: FormData) {
  return {
    businessName: getStringValue(formData, "businessName"),
    fullName: getStringValue(formData, "fullName"),
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  };
}

function getLoginInput(formData: FormData) {
  return {
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
    redirectedFrom: getStringValue(formData, "redirectedFrom"),
  };
}

function getOAuthBusinessRegistrationInput(formData: FormData) {
  return {
    businessName: getStringValue(formData, "businessName"),
    fullName: getStringValue(formData, "fullName"),
  };
}

async function redirectToGoogleOAuth(nextPath: string): Promise<void> {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const redirectTo = `${getBaseAppUrl()}/auth/callback?next=${encodeURIComponent(getSafeRedirectPath(nextPath))}`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth_unavailable");
  }

  redirect(data.url);
}

async function softDeleteTenant(
  admin: ReturnType<typeof createAdminClient>,
  tenantId: string,
) {
  const { data: deletedTenant, error } = await admin
    .from("tenants")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", tenantId)
    .select("id")
    .maybeSingle();

  return !error && Boolean(deletedTenant);
}

async function cleanupFailedRegistration(
  admin: ReturnType<typeof createAdminClient>,
  tenantId: string,
  userId?: string,
  deleteProfile = false,
) {
  let cleanupFailed = false;

  if (userId) {
    if (deleteProfile) {
      const { error } = await admin
        .from("users")
        .delete()
        .eq("id", userId);
      cleanupFailed = cleanupFailed || Boolean(error);
    }

    const { error } = await admin.auth.admin.deleteUser(userId);
    cleanupFailed = cleanupFailed || Boolean(error);
  }

  const tenantDeleted = await softDeleteTenant(admin, tenantId);
  cleanupFailed = cleanupFailed || !tenantDeleted;

  return cleanupFailed;
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
  }

  if (!hasSupabaseAdminEnv()) {
    return { error: "Registrace vyžaduje Supabase service role klíč." };
  }

  const parsed = registerSchema.safeParse(getRegisterInput(formData));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatná registrace." };
  }

  let rateLimit = { success: true };

  try {
    rateLimit = await limitRegister(parsed.data.email);
  } catch {
    rateLimit = { success: true };
  }

  if (!rateLimit.success) {
    return { error: "Příliš mnoho pokusů. Zkuste to později." };
  }

  const admin = createAdminClient();
  const supabase = await createClient();
  const slugResult = await findAvailableTenantSlug(admin, parsed.data.businessName);

  if (slugResult.error) {
    return { error: "Registraci se nepodařilo dokončit." };
  }

  if (!slugResult.slug) {
    return { error: "Pro podobný název už existuje příliš mnoho podniků. Upravte název podniku." };
  }

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({
      name: parsed.data.businessName,
      slug: slugResult.slug,
    })
    .select("id")
    .single();

  if (tenantError || !tenant) {
    return { error: "Registraci se nepodařilo dokončit." };
  }

  const { data: authUser, error: authUserError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.fullName,
    },
    app_metadata: {
      role: "owner",
      tenant_id: tenant.id,
    },
  });

  if (authUserError || !authUser.user) {
    const cleanupFailed = await cleanupFailedRegistration(admin, tenant.id);

    if (cleanupFailed) {
      return { error: "Registraci se nepodařilo dokončit a rozpracovaná data se nepodařilo uklidit." };
    }

    if (isDuplicateAuthEmailError(authUserError)) {
      return { error: "E-mail už je použitý. Přihlaste se, nebo použijte jiný e-mail." };
    }

    return { error: "Registraci se nepodařilo dokončit." };
  }

  const { error: profileError } = await admin.from("users").insert({
    id: authUser.user.id,
    email: parsed.data.email,
    full_name: parsed.data.fullName,
  });

  if (profileError) {
    const cleanupFailed = await cleanupFailedRegistration(admin, tenant.id, authUser.user.id);

    if (cleanupFailed) {
      return { error: "Registraci se nepodařilo dokončit a rozpracovaná data se nepodařilo uklidit." };
    }

    return { error: "Registraci se nepodařilo dokončit." };
  }

  const { error: tenantUserError } = await admin.from("tenant_users").insert({
    tenant_id: tenant.id,
    user_id: authUser.user.id,
    role: "owner",
  });

  if (tenantUserError) {
    const cleanupFailed = await cleanupFailedRegistration(admin, tenant.id, authUser.user.id, true);

    if (cleanupFailed) {
      return { error: "Registraci se nepodařilo dokončit a rozpracovaná data se nepodařilo uklidit." };
    }

    return { error: "Registraci se nepodařilo dokončit." };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (signInError) {
    return { error: "Účet byl vytvořen, ale přihlášení se nepodařilo." };
  }

  redirect("/dashboard");
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
  }

  const input = getLoginInput(formData);
  const parsed = loginSchema.safeParse({
    email: input.email,
    password: input.password,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Neplatné přihlášení." };
  }

  let rateLimit = { success: true };

  try {
    rateLimit = await limitLogin(parsed.data.email);
  } catch {
    rateLimit = { success: true };
  }

  if (!rateLimit.success) {
    return { error: "Příliš mnoho pokusů. Zkuste to později." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Neplatné přihlašovací údaje." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    await supabase.auth.signOut();
    return { error: "Účet není přiřazený k žádnému podniku." };
  }

  const authContextError = getAuthContextError(user);

  if (authContextError === "missing_tenant") {
    await supabase.auth.signOut();
    return { error: "Účet není přiřazený k žádnému podniku." };
  }

  if (authContextError === "missing_role") {
    await supabase.auth.signOut();
    return { error: "Účet nemá přiřazenou roli v podniku." };
  }

  if (authContextError === "missing_staff") {
    await supabase.auth.signOut();
    return { error: "Staff účet není propojený se zaměstnancem." };
  }

  const activeContextError = await getActiveAuthContextError(supabase, user);

  if (activeContextError === "missing_tenant") {
    await supabase.auth.signOut();
    return { error: "Účet není přiřazený k žádnému podniku." };
  }

  if (activeContextError === "missing_staff") {
    await supabase.auth.signOut();
    return { error: "Staff účet není propojený se zaměstnancem." };
  }

  redirect(getSafeRedirectPath(input.redirectedFrom));
}

export async function signInWithGoogleAction(formData: FormData): Promise<void> {
  await redirectToGoogleOAuth(getStringValue(formData, "redirectedFrom"));
}

export async function signInCustomerWithGoogleAction(): Promise<void> {
  await redirectToGoogleOAuth("/account");
}

export async function registerWithGoogleAction(formData: FormData): Promise<void> {
  if (!hasSupabaseAdminEnv()) {
    redirect("/register?error=google_admin_env");
  }

  const parsed = oauthBusinessRegistrationSchema.safeParse(getOAuthBusinessRegistrationInput(formData));

  if (!parsed.success) {
    redirect("/register?error=google_registration_input");
  }

  await setOAuthBusinessRegistrationCookie(parsed.data);

  await redirectToGoogleOAuth("/dashboard");
}

export async function logoutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
