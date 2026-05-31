import { signInCustomerWithGoogleAction } from "@/app/(auth)/actions";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { Button } from "@/components/ui/button";

export default function CustomerAccountLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-8 text-foreground sm:px-6">
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
    </main>
  );
}
