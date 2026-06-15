import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function ResetPasswordPage() {
  return (
    <main className="temaro-public-auth min-h-screen px-4 py-6 text-foreground sm:px-6">
      <header className="mx-auto flex w-full max-w-[440px] items-center justify-start">
        <Link href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          Zpět na web
        </Link>
      </header>
      <div className="grid min-h-[calc(100vh-5rem)] place-items-center">
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
      </div>
    </main>
  );
}
