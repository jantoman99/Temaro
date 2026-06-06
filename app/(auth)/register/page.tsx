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
} as const;

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const notice = params.error && params.error in noticeCopy ? noticeCopy[params.error as keyof typeof noticeCopy] : null;

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6">
      <header className="mx-auto flex w-full max-w-[480px] items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-muted-foreground transition hover:text-foreground">
          Zpět na web
        </Link>
        <ThemeToggle compact />
      </header>
      <div className="grid min-h-[calc(100vh-5rem)] place-items-center">
      <section className="w-full max-w-[440px]">
        <TemaroLogo className="justify-center" />
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Nový podnik</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Založení podniku</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Vytvoříme podnik a první přístup do administrace. Hned potom doplníte služby,
            tým a veřejnou rezervační stránku.
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
