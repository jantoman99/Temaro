import { TemaroLogo } from "@/components/brand/temaro-logo";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="w-full max-w-[400px]">
        <TemaroLogo className="justify-center" />
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nové heslo</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Nastavte nové heslo</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Odkaz z e-mailu vás přihlásil jen pro změnu hesla. Zadejte nové heslo a potom se přihlaste znovu.
          </p>
          <div className="mt-6">
            <UpdatePasswordForm />
          </div>
        </div>
      </section>
    </main>
  );
}
