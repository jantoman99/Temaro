import { NextResponse, type NextRequest } from "next/server";

import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { consumeOAuthBusinessRegistrationCookie, createBusinessForOAuthUser } from "@/lib/auth/oauth-registration";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getAuthContextError } from "@/lib/auth/session-context";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const safeNext = getSafeRedirectPath(next);

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_callback", requestUrl.origin));
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    let activeUser = user;

    if (userError || !activeUser) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?error=missing_tenant", requestUrl.origin));
    }

    let authContextError = getAuthContextError(activeUser);

    if (authContextError === "missing_tenant" && safeNext.startsWith("/account")) {
      authContextError = null;
    }

    if (authContextError === "missing_tenant") {
      const pendingRegistration = await consumeOAuthBusinessRegistrationCookie();

      if (!pendingRegistration || !hasSupabaseAdminEnv() || !activeUser.email) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?error=missing_tenant", requestUrl.origin));
      }

      const registration = await createBusinessForOAuthUser({
        businessName: pendingRegistration.businessName,
        email: activeUser.email,
        fullName: pendingRegistration.fullName,
        userId: activeUser.id,
      });

      if (registration.error) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?error=oauth_registration_failed", requestUrl.origin));
      }

      const { error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?error=oauth_registration_failed", requestUrl.origin));
      }

      const {
        data: { user: refreshedUser },
        error: refreshedUserError,
      } = await supabase.auth.getUser();

      if (refreshedUserError || !refreshedUser) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?error=oauth_registration_failed", requestUrl.origin));
      }

      activeUser = refreshedUser;
      authContextError = null;
    }

    if (authContextError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(`/login?error=${authContextError}`, requestUrl.origin));
    }

    const activeAuthContextError = await getActiveAuthContextError(supabase, activeUser);

    if (activeAuthContextError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(`/login?error=${activeAuthContextError}`, requestUrl.origin));
    }
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
