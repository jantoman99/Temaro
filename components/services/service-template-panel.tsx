import Link from "next/link";

import type { ServiceTemplate } from "@/lib/service-templates";
import { getTenantIndustryLabel, type TenantIndustry } from "@/lib/tenant-industry";

export function ServiceTemplatePanel({
  industry,
  selectedTemplateId,
  templates,
}: {
  industry: TenantIndustry;
  selectedTemplateId: string;
  templates: ServiceTemplate[];
}) {
  if (templates.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Šablony služeb</p>
        <h2 className="text-xl font-semibold tracking-tight">Rychlý start pro {getTenantIndustryLabel(industry)}</h2>
        <p className="text-sm font-medium leading-6 text-muted-foreground">
          Vyberte typickou službu pro obor. Formulář `Přidat službu` se předvyplní a hodnoty můžete před uložením upravit.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;

          return (
            <Link
              key={template.id}
              href={`/services?template=${template.id}`}
              className={`rounded-lg border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-muted ${
                isSelected ? "border-primary bg-primary/10" : "border-border bg-background"
              }`}
            >
              <span className="block text-sm font-semibold text-foreground">{template.name}</span>
              <span className="mt-1 block text-xs font-medium leading-5 text-muted-foreground">
                {template.durationMinutes} min · {template.price} Kč · buffer {template.bufferMinutes} min
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
