import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { RegisterForm } from "@/components/auth/register-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

const noticeCopy = {
  google_admin_env: "Registrace přes Google vyžaduje Supabase service role klíč. Použijte e-mail a heslo nebo doplňte env.",
  google_registration_input: "Pro Google registraci vyplňte nejdřív název podniku a jméno vlastníka.",
  oauth_admin_env: "Registrace přes externí účet vyžaduje Supabase service role klíč. Použijte e-mail a heslo nebo doplňte env.",
  oauth_registration_failed: "Registraci přes externí účet se nepodařilo dokončit. Zkuste to znovu nebo použijte e-mail a heslo.",
} as const;

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const notice = params.error && params.error in noticeCopy ? noticeCopy[params.error as keyof typeof noticeCopy] : null;

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
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Nový podnik</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Založení podniku.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Nejrychlejší je začít přes Google. Název podniku doplníte až po ověření účtu.
          </p>
          <div className="mt-6">
            <RegisterForm notice={notice} />
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
