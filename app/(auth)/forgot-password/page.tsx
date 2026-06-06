import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
      <header className="mx-auto flex w-full max-w-[440px] items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          Zpět na web
        </Link>
        <ThemeToggle compact />
      </header>
      <div className="grid min-h-[calc(100vh-5rem)] place-items-center">
      <section className="w-full max-w-[400px]">
        <TemaroLogo className="justify-center" />
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Obnova přístupu</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Zapomenuté heslo</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Zadejte e-mail k podnikatelskému účtu a pošleme vám odkaz pro nastavení nového hesla.
          </p>
          <div className="mt-6">
            <PasswordResetRequestForm />
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
