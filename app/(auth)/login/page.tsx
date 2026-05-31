import { TemaroLogo } from "@/components/brand/temaro-logo";
import { LoginForm } from "@/components/auth/login-form";
import { getSafeRedirectPath } from "@/lib/auth/redirects";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    redirectedFrom?: string;
  }>;
};

const noticeCopy = {
  missing_tenant:
    "Účet nemá přiřazený podnik. Přihlaste se účtem vlastníka nebo požádejte o novou pozvánku.",
  missing_role:
    "Účet nemá přiřazenou roli v podniku. Přihlaste se účtem vlastníka nebo požádejte o novou pozvánku.",
  missing_staff: "Staff účet není propojený se zaměstnancem. Požádejte vlastníka o novou pozvánku.",
  auth_callback: "Přihlašovací odkaz se nepodařilo ověřit. Zkuste se přihlásit znovu.",
  oauth_unavailable: "Přihlášení přes Google teď není dostupné. Zkuste e-mail a heslo.",
  oauth_registration_failed: "Registraci přes Google se nepodařilo dokončit. Zkuste to znovu nebo použijte e-mail a heslo.",
} as const;

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectedFrom = getSafeRedirectPath(params.redirectedFrom ?? "");
  const notice = params.error && params.error in noticeCopy ? noticeCopy[params.error as keyof typeof noticeCopy] : null;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="w-full max-w-[400px]">
        <TemaroLogo className="justify-center" />
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Přihlášení</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vítejte zpět</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Použijte účet vlastníka nebo zaměstnance. Po přihlášení se ověří aktivní podnik a role.
          </p>
          <div className="mt-6">
            <LoginForm notice={notice} redirectedFrom={redirectedFrom} />
          </div>
        </div>
      </section>
    </main>
  );
}
