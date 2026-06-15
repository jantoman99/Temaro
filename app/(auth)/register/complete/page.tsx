import Link from "next/link";
import { redirect } from "next/navigation";

import { CompleteOAuthRegistrationForm } from "@/components/auth/complete-oauth-registration-form";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getAuthContextError } from "@/lib/auth/session-context";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function getDefaultFullName(metadata: unknown) {
  if (!metadata || typeof metadata !== "object") {
    return "";
  }

  const value = (metadata as { full_name?: unknown; name?: unknown }).full_name
    ?? (metadata as { name?: unknown }).name;

  return typeof value === "string" ? value : "";
}

export default async function CompleteOAuthRegistrationPage() {
  if (!hasSupabaseEnv()) {
    redirect("/start");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/register");
  }

  const authContextError = getAuthContextError(user);

  if (!authContextError) {
    redirect("/start");
  }

  if (authContextError !== "missing_tenant") {
    await supabase.auth.signOut();
    redirect(`/login?error=${authContextError}`);
  }

  if (!user.email) {
    await supabase.auth.signOut();
    redirect("/register?error=oauth_registration_failed");
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f7f8f1_48%,#eef1e8_100%)] px-4 py-6 text-foreground sm:px-6">
      <header className="mx-auto flex w-full max-w-[520px] items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          Zpět na web
        </Link>
        <ThemeToggle compact />
      </header>
      <div className="grid min-h-[calc(100vh-5rem)] place-items-center">
        <section className="w-full max-w-[480px]">
          <TemaroLogo className="justify-center" />
          <div className="mt-8 rounded-[1.4rem] border border-[#d8d4c8] bg-white/95 p-6 shadow-[0_24px_70px_rgba(19,24,39,0.14)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Druhý krok</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Doplňte podnik.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Účet je ověřený. Teď stačí pojmenovat podnik a Temaro připraví první provozní nastavení.
            </p>
            <div className="mt-6">
              <CompleteOAuthRegistrationForm
                defaultFullName={getDefaultFullName(user.user_metadata)}
                email={user.email}
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
