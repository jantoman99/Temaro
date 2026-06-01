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
  isDemo = false,
  templates,
}: {
  currentIndustry: TenantIndustry;
  isDemo?: boolean;
  templates: ServiceTemplate[];
}) {
  const [state, formAction, isPending] = useActionState(updateOnboardingIndustryAction, initialState);
  const previewTemplates = templates.slice(0, 3);

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Obor podniku</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">Vybrat obor pro rychlejší nastavení</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
            Podle oboru nabídneme vhodné služby a texty pro veřejnou stránku. Volbu můžete později změnit.
          </p>

          <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="onboarding-industry">
              Obor podniku
            </label>
            <select
              id="onboarding-industry"
              name="industry"
              defaultValue={currentIndustry}
              disabled={isDemo || isPending}
              className={`${selectClassName} sm:min-w-80`}
            >
              {TENANT_INDUSTRIES.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={isDemo || isPending}>
              {isPending ? "Ukládám..." : "Uložit obor"}
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
          <p className="text-sm font-semibold text-foreground">Doporučené první služby</p>
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
