import { cookies } from "next/headers";

import { findAvailableTenantSlug } from "@/lib/auth/tenant-slug";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OauthBusinessRegistrationInput } from "@/lib/validations/auth";

const OAUTH_REGISTRATION_COOKIE = "temaro_oauth_business_registration";
const OAUTH_REGISTRATION_MAX_AGE_SECONDS = 10 * 60;

type OAuthRegistrationPayload = OauthBusinessRegistrationInput;

export async function setOAuthBusinessRegistrationIntentCookie() {
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_REGISTRATION_COOKIE, "1", {
    httpOnly: true,
    maxAge: OAUTH_REGISTRATION_MAX_AGE_SECONDS,
    path: "/auth/callback",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function consumeOAuthBusinessRegistrationIntentCookie() {
  const cookieStore = await cookies();
  const value = cookieStore.get(OAUTH_REGISTRATION_COOKIE)?.value;

  cookieStore.delete(OAUTH_REGISTRATION_COOKIE);

  return Boolean(value);
}

export async function createBusinessForOAuthUser({
  businessName,
  email,
  fullName,
  userId,
}: OAuthRegistrationPayload & {
  email: string;
  userId: string;
}) {
  const admin = createAdminClient();
  const slugResult = await findAvailableTenantSlug(admin, businessName);

  if (slugResult.error || !slugResult.slug) {
    return { error: "registration_failed" as const };
  }

  const { data: tenant, error: tenantError } = await admin
    .from("tenants")
    .insert({ name: businessName, slug: slugResult.slug })
    .select("id")
    .single();

  if (tenantError || !tenant) {
    return { error: "registration_failed" as const };
  }

  const { error: profileError } = await admin
    .from("users")
    .upsert({
      email,
      full_name: fullName,
      id: userId,
    }, { onConflict: "id" });

  const { error: tenantUserError } = await admin.from("tenant_users").insert({
    role: "owner",
    tenant_id: tenant.id,
    user_id: userId,
  });

  const { error: authUpdateError } = await admin.auth.admin.updateUserById(userId, {
    app_metadata: {
      role: "owner",
      tenant_id: tenant.id,
    },
    user_metadata: {
      full_name: fullName,
    },
  });

  if (profileError || tenantUserError || authUpdateError) {
    await admin.from("tenants").update({ deleted_at: new Date().toISOString() }).eq("id", tenant.id);
    return { error: "registration_failed" as const };
  }

  return { error: null, tenantId: tenant.id };
}
