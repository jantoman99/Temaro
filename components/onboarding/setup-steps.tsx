import Link from "next/link";
import { ArrowRight, CheckCircle2, ExternalLink } from "lucide-react";

import { getBookingShareKit } from "@/lib/booking/share-kit";
import type { LaunchPlan } from "@/lib/onboarding/setup";

export type SetupStep = {
  description: string;
  done: boolean;
  href: string;
  title: string;
};

export function SetupStepsPanel({ steps }: { steps: SetupStep[] }) {
  const completedSetupSteps = steps.filter((step) => step.done).length;

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Spuštění rezervací</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Co musí být hotové před sdílením</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Hotovo {completedSetupSteps} z {steps.length}. Každý krok vede k tomu, aby klient mohl bezpečně poslat rezervaci.
          </p>
        </div>
        <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {Math.round((completedSetupSteps / steps.length) * 100)} %
        </span>
      </div>
      <div className="mt-5 grid gap-3">
        {steps.map((step, index) => (
          <Link
            key={step.title}
            href={step.href}
            className={`grid gap-3 rounded-2xl border px-4 py-3 shadow-sm transition sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center ${
              step.done
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-border bg-background/70 hover:bg-muted/40"
            }`}
          >
            <span className={`grid size-10 place-items-center rounded-full text-sm font-bold ${step.done ? "bg-emerald-600 text-white" : "bg-secondary text-foreground"}`}>
              {step.done ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">{step.title}</span>
              <span className="mt-1 block text-sm font-medium text-muted-foreground">{step.description}</span>
            </span>
            <span className={`text-sm font-semibold ${step.done ? "text-emerald-700" : "text-primary"}`}>
              {step.done ? "Hotovo" : "Pokračovat"}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function LaunchReadinessPanel({
  bookingUrl,
  businessName,
  plan,
}: {
  bookingUrl: string;
  businessName: string;
  plan: LaunchPlan;
}) {
  const readinessLabel = plan.isReadyToShare
    ? "Rezervační stránka je připravená ke kontrole a sdílení."
    : "Doplňte základ, aby klient viděl službu, čas i člověka, u kterého se objednává.";
  const shareKit = getBookingShareKit({ bookingUrl, businessName });

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-x-0 top-0 h-1 bg-primary" aria-hidden="true" />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Start podniku</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Nejkratší cesta k první online rezervaci.
          </h2>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground md:text-base">
            Temaro potřebuje jen tři věci: co nabízíte, kdo má čas a jak vypadá stránka pro klienta. Zbytek provozu můžete ladit až potom.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={plan.nextAction.href}
              data-tour="start"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              {plan.nextAction.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={plan.bookingUrlPath}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
            >
              Náhled stránky klienta
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-secondary/70 p-4">
            <p className="text-sm font-semibold text-foreground">Veřejný odkaz</p>
            <p className="mt-2 break-all rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted-foreground">
              {bookingUrl}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Web podniku · Instagram bio · QR kód · SMS klientům
            </p>
          </div>

          <div className={`mt-4 rounded-2xl border p-4 ${plan.isReadyToShare ? "border-success/30 bg-success/10" : "border-border bg-secondary/60"}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">{plan.sharePanel.headline}</p>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{plan.sharePanel.text}</p>
                <div className="mt-3 grid gap-2">
                  <p className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
                    {shareKit.instagramBio}
                  </p>
                  <p className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium leading-6 text-foreground">
                    {shareKit.instagramStory}
                  </p>
                </div>
                <Link
                  href={plan.sharePanel.primaryHref}
                  className={`mt-3 inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold shadow-sm transition ${
                    plan.isReadyToShare
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "pointer-events-none border border-border bg-background text-muted-foreground"
                  }`}
                >
                  {plan.sharePanel.primaryLabel}
                </Link>
              </div>
              <div className="rounded-xl border border-border bg-background p-3 text-center shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`QR kód pro ${businessName}`}
                  className={`mx-auto size-28 rounded-lg border border-border bg-white p-2 ${plan.isReadyToShare ? "" : "opacity-35 grayscale"}`}
                  src={shareKit.qrImageUrl}
                />
                <p className="mt-2 text-xs font-semibold text-muted-foreground">QR pro provozovnu</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="border-t border-border bg-primary/10 p-6 lg:border-l lg:border-t-0 md:p-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Připravenost</p>
              <p className="nums-tabular mt-2 text-5xl font-semibold tracking-tight text-foreground">{plan.readiness} %</p>
            </div>
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-background text-sm font-bold text-primary shadow-sm">
              {plan.completedSteps}/{plan.steps.length}
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-background">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${plan.readiness}%` }} />
          </div>
          <p className="mt-5 text-sm font-semibold leading-6 text-foreground">{readinessLabel}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.nextAction.description}</p>
        </aside>
      </div>
    </section>
  );
}
