"use client";

import Link from "next/link";
import { useActionState } from "react";

import { updateOnboardingIndustryAction } from "@/app/(dashboard)/start/actions";
import { Button } from "@/components/ui/button";
import type { ServiceTemplate } from "@/lib/service-templates";
import { TENANT_INDUSTRIES, type TenantIndustry } from "@/lib/tenant-industry";

const initialState = {
  error: "",
  success: "",
};

const selectClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function IndustryStartPanel({
  currentIndustry,
  hasStoredIndustry = true,
  isDemo = false,
  templates,
}: {
  currentIndustry: TenantIndustry;
  hasStoredIndustry?: boolean;
  isDemo?: boolean;
  templates: ServiceTemplate[];
}) {
  const [state, formAction, isPending] = useActionState(updateOnboardingIndustryAction, initialState);
  const previewTemplates = templates.slice(0, 3);

  return (
    <section id="obor" className="rounded-3xl border border-border bg-card p-5 shadow-sm" data-tour="start">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div>
          <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Krok 1
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Nejdřív vyberte typ podnikání</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            Tím zkrátíme celé nastavení. Temaro hned nabídne služby, délky a ceny, které dávají pro váš obor smysl.
          </p>

          <form action={formAction} className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="sr-only" htmlFor="onboarding-industry">
              Obor podniku
            </label>
            <select
              id="onboarding-industry"
              name="industry"
              defaultValue={currentIndustry}
              disabled={isDemo || isPending}
              className={selectClassName}
            >
              {TENANT_INDUSTRIES.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={isDemo || isPending}>
              {isPending ? "Ukládám..." : hasStoredIndustry ? "Uložit obor" : "Pokračovat"}
            </Button>
          </form>

          {state.error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {state.success}
            </p>
          ) : null}
          {isDemo ? (
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              Demo používá výchozí salonní obor. V reálném účtu se volba uloží k vašemu podniku.
            </p>
          ) : null}
        </div>

        <div className="rounded-xl border border-border bg-secondary p-4">
          <p className="text-sm font-semibold text-foreground">Co připravíme dál</p>
          <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">
            Po výběru oboru můžete jedním kliknutím přidat tyto první služby.
          </p>
          <div className="mt-3 grid gap-2">
            {previewTemplates.map((template) => (
              <Link
                key={template.id}
                href={`/services?template=${template.id}`}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition hover:bg-muted"
              >
                <span className="block text-foreground">{template.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {template.durationMinutes} min · {template.price} Kč
                </span>
              </Link>
            ))}
          </div>
          <Link href="/services" className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline">
            Otevřít služby a použít šablony
          </Link>
        </div>
      </div>
    </section>
  );
}
