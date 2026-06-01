import { TemaroLogo } from "@/components/brand/temaro-logo";
import { PasswordResetRequestForm } from "@/components/auth/password-reset-request-form";

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8 text-foreground sm:px-6">
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
    </main>
  );
}
