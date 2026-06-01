import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { IndustryStartPanel } from "@/components/onboarding/industry-start-panel";
import { LaunchReadinessPanel, SetupStepsPanel } from "@/components/onboarding/setup-steps";
import { getBaseAppUrl } from "@/lib/app-url";
import { requireOwner } from "@/lib/auth/require-owner";
import { demoBookings, demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";
import { buildLaunchPlan } from "@/lib/onboarding/setup";
import { getServiceTemplatesForIndustry } from "@/lib/service-templates";
import { isTenantIndustry, type TenantIndustry } from "@/lib/tenant-industry";

export default async function StartPage() {
  if (!hasSupabaseEnv()) {
    const demoIndustry = isTenantIndustry(demoTenant.industry) ? demoTenant.industry : "hair";
    const launchPlan = buildLaunchPlan({
      bookingsCount: demoBookings.length,
      servicesCount: demoServices.length,
      staffCount: demoStaff.length,
      tenant: demoTenant,
    });

    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <PageHeader
          description="Tady podnik dokončí základ, ověří rezervační stránku a získá odkaz, který může hned poslat klientům."
          eyebrow="Spuštění"
          title="Nastavení první rezervace"
        />
        <LaunchReadinessPanel
          bookingUrl={`${getBaseAppUrl()}${launchPlan.bookingUrlPath}`}
          businessName={demoTenant.name}
          plan={launchPlan}
        />
        <IndustryStartPanel
          currentIndustry={demoIndustry}
          isDemo
          templates={getServiceTemplatesForIndustry(demoIndustry)}
        />
        <SetupStepsPanel steps={launchPlan.steps} />
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
  const launchPlan = buildLaunchPlan({
    bookingsCount: bookingsCount ?? 0,
    servicesCount: servicesCount ?? 0,
    staffCount: staffCount ?? 0,
    tenant: tenant ?? { name: "Podnik", slug: "" },
  });

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        description="Tady dokončíte základ, ověříte rezervační stránku a získáte odkaz, který můžete hned poslat klientům."
        eyebrow="Spuštění"
        title="Nastavení první rezervace"
      />
      <LaunchReadinessPanel
        bookingUrl={`${getBaseAppUrl()}${launchPlan.bookingUrlPath}`}
        businessName={tenant?.name ?? "Podnik"}
        plan={launchPlan}
      />
      <IndustryStartPanel
        currentIndustry={industry}
        hasStoredIndustry={Boolean(tenant?.industry)}
        templates={getServiceTemplatesForIndustry(industry)}
      />
      <SetupStepsPanel steps={launchPlan.steps} />
    </section>
  );
}
