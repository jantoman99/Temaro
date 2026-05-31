import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export type SetupStep = {
  description: string;
  done: boolean;
  href: string;
  title: string;
};

export function SetupStepsPanel({ steps }: { steps: SetupStep[] }) {
  const completedSetupSteps = steps.filter((step) => step.done).length;

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">První kroky</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Cesta k první rezervaci</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Hotovo {completedSetupSteps} z {steps.length}. Checklist je stranou od běžného dashboardu.
          </p>
        </div>
        <span className="rounded-md bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {Math.round((completedSetupSteps / steps.length) * 100)} %
        </span>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {steps.map((step) => (
          <Link
            key={step.title}
            href={step.href}
            className={`rounded-xl border px-4 py-3 shadow-sm transition ${
              step.done
                ? "border-emerald-500/25 bg-emerald-500/10"
                : "border-border bg-background/70 hover:bg-muted/40"
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckCircle2 className={`h-4 w-4 ${step.done ? "text-emerald-600" : "text-muted-foreground"}`} />
              {step.done ? "Hotovo" : "Chybí"} · {step.title}
            </p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">{step.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
