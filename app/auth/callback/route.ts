import { NextResponse, type NextRequest } from "next/server";

import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { consumeOAuthBusinessRegistrationIntentCookie } from "@/lib/auth/oauth-registration";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { getAuthContextError } from "@/lib/auth/session-context";
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
    const activeUser = user;

    if (userError || !activeUser) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/login?error=missing_tenant", requestUrl.origin));
    }

    let authContextError = getAuthContextError(activeUser);

    if (authContextError === "missing_tenant" && (safeNext.startsWith("/account") || safeNext === "/reset-password")) {
      authContextError = null;
    }

    if (authContextError === "missing_tenant") {
      const hasRegistrationIntent = safeNext === "/register/complete"
        ? await consumeOAuthBusinessRegistrationIntentCookie()
        : false;

      if (!hasRegistrationIntent) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?error=missing_tenant", requestUrl.origin));
      }

      authContextError = null;
    }

    if (authContextError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL(`/login?error=${authContextError}`, requestUrl.origin));
    }

    const shouldCheckActiveContext = !safeNext.startsWith("/account")
      && safeNext !== "/reset-password"
      && safeNext !== "/register/complete";

    if (shouldCheckActiveContext) {
      const activeAuthContextError = await getActiveAuthContextError(supabase, activeUser);

      if (activeAuthContextError) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL(`/login?error=${activeAuthContextError}`, requestUrl.origin));
      }
    }
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
