import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { IndustryStartPanel } from "@/components/onboarding/industry-start-panel";
import { SetupStepsPanel, type SetupStep } from "@/components/onboarding/setup-steps";
import { requireOwner } from "@/lib/auth/require-owner";
import { demoBookings, demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";
import { getServiceTemplatesForIndustry } from "@/lib/service-templates";
import { isTenantIndustry, type TenantIndustry } from "@/lib/tenant-industry";

function buildSetupSteps({
  bookingsCount,
  servicesCount,
  staffCount,
  tenant,
}: {
  bookingsCount: number;
  servicesCount: number;
  staffCount: number;
  tenant: { name: string; slug: string };
}): SetupStep[] {
  return [
    {
      done: tenant.name.trim().length >= 2,
      href: "/settings",
      title: "Zkontrolovat podnik",
      description: "Název, jazyk, měna a storno pravidla.",
    },
    {
      done: servicesCount > 0,
      href: "/services",
      title: "Přidat služby",
      description: "Co si klient může rezervovat a kolik to stojí.",
    },
    {
      done: staffCount > 0,
      href: "/staff",
      title: "Přidat tým",
      description: "Kdo služby dělá a kdy má pracovní dobu.",
    },
    {
      done: servicesCount > 0 && staffCount > 0,
      href: "/booking-page",
      title: "Zkontrolovat booking stránku",
      description: "Náhled toho, co uvidí zákazník.",
    },
    {
      done: bookingsCount > 0,
      href: `/${tenant.slug}`,
      title: "Získat první rezervaci",
      description: "Sdílet veřejný odkaz nebo přidat termín ručně.",
    },
  ];
}

export default async function StartPage() {
  if (!hasSupabaseEnv()) {
    const demoIndustry = isTenantIndustry(demoTenant.industry) ? demoTenant.industry : "hair";

    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <PageHeader
          description="Checklist je oddělený od běžného dashboardu, aby přehled dne zůstal čistý."
          eyebrow="Onboarding"
          title="První kroky"
        />
        <IndustryStartPanel
          currentIndustry={demoIndustry}
          isDemo
          templates={getServiceTemplatesForIndustry(demoIndustry)}
        />
        <SetupStepsPanel
          steps={buildSetupSteps({
            bookingsCount: demoBookings.length,
            servicesCount: demoServices.length,
            staffCount: demoStaff.length,
            tenant: demoTenant,
          })}
        />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [
    { count: bookingsCount },
    { count: servicesCount },
    { count: staffCount },
    { data: tenant },
  ] = await Promise.all([
    auth.supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", auth.tenantId),
    auth.supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .is("deleted_at", null),
    auth.supabase
      .from("staff")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .is("deleted_at", null),
    auth.supabase
      .from("tenants")
      .select("name, slug, industry")
      .eq("id", auth.tenantId)
      .is("deleted_at", null)
      .single(),
  ]);
  const rawIndustry = tenant?.industry ?? "";
  const industry: TenantIndustry = isTenantIndustry(rawIndustry) ? rawIndustry : "hair";

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        description="Checklist je oddělený od běžného dashboardu, aby přehled dne zůstal čistý."
        eyebrow="Onboarding"
        title="První kroky"
      />
      <IndustryStartPanel
        currentIndustry={industry}
        templates={getServiceTemplatesForIndustry(industry)}
      />
      <SetupStepsPanel
        steps={buildSetupSteps({
          bookingsCount: bookingsCount ?? 0,
          servicesCount: servicesCount ?? 0,
          staffCount: staffCount ?? 0,
          tenant: tenant ?? { name: "Podnik", slug: "" },
        })}
      />
    </section>
  );
}
