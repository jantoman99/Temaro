import { TemaroLogo } from "@/components/brand/temaro-logo";
import { RegisterForm } from "@/components/auth/register-form";

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
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8 text-foreground sm:px-6">
      <section className="w-full max-w-[440px]">
        <TemaroLogo className="justify-center" />
        <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Onboarding</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Založení podniku</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Vytvoříme podnik, owner účet a první přístup do dashboardu. Po registraci doplníte služby,
            tým a veřejný booking.
          </p>
          <div className="mt-6">
            <RegisterForm notice={notice} />
          </div>
        </div>
      </section>
    </main>
  );
}
