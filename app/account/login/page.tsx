import Link from "next/link";

import { signInCustomerWithGoogleAction } from "@/app/(auth)/actions";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function CustomerAccountLoginPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
      <header className="mx-auto flex w-full max-w-[460px] items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          Zpět na web
        </Link>
        <ThemeToggle compact />
      </header>
      <div className="grid min-h-[calc(100vh-5rem)] place-items-center">
      <section className="w-full max-w-[420px]">
        <TemaroLogo className="justify-center" />
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Zákaznický účet</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vaše rezervace napříč podniky</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Přihlaste se Google účtem. Temaro zobrazí rezervace podle ověřeného e-mailu, ne podle odkazu v URL.
          </p>
          <form action={signInCustomerWithGoogleAction} className="mt-6">
            <Button type="submit" size="xl" className="w-full">
              Pokračovat přes Google
            </Button>
          </form>
          <p className="mt-4 rounded-lg bg-muted px-4 py-3 text-sm font-medium leading-6 text-muted-foreground">
            Správa konkrétní rezervace dál používá bezpečný odkaz z e-mailu. Účet zatím slouží jako přehled termínů.
          </p>
        </div>
      </section>
      </div>
    </main>
  );
}
