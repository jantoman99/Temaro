import { redirect } from "next/navigation";
import Link from "next/link";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { CalendarFeedSettings } from "@/components/settings/calendar-feed-settings";
import { CustomDomainSettings } from "@/components/settings/custom-domain-settings";
import { TenantSettingsForm } from "@/components/settings/tenant-settings-form";
import { requireOwner } from "@/lib/auth/require-owner";
import { demoTenant } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";

function SettingsHeader({ isDemo }: { isDemo: boolean }) {
  return (
    <PageHeader
      action={{ href: "/booking-page", label: "Náhled booking stránky" }}
      description="Technické nastavení podniku. Zákaznický vzhled je oddělený v sekci Booking stránka."
      eyebrow={isDemo ? "Demo režim" : "Konfigurace"}
      title="Nastavení"
    />
  );
}

function SettingsGuide() {
  return (
    <section className="grid gap-3 md:grid-cols-3">
      {[
        ["Podnik", "Název, časová zóna, jazyk, měna a veřejná adresa."],
        ["Pravidla", "Storno lhůta a provozní limity rezervací."],
        ["Katalog", "Město, adresa a mapa pro budoucí veřejné vyhledání."],
      ].map(([title, description]) => (
        <div key={title} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">{description}</p>
          {title === "Katalog" ? (
            <Link href="/podniky" className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline">
              Otevřít katalog
            </Link>
          ) : null}
        </div>
      ))}
    </section>
  );
}

export default function SettingsPage() {
  return <SettingsContent />;
}

async function SettingsContent() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <SettingsHeader isDemo />
        <SettingsGuide />
        <TenantSettingsForm tenant={demoTenant} />
        <CustomDomainSettings />
        <CalendarFeedSettings feeds={[]} isDemo />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: tenant, error: tenantError }, { data: calendarFeeds }] = await Promise.all([
    auth.supabase
      .from("tenants")
      .select("*")
      .eq("id", auth.tenantId)
      .is("deleted_at", null)
      .single(),
    auth.supabase
      .from("calendar_feed_tokens")
      .select("id, name, created_at, last_used_at")
      .eq("tenant_id", auth.tenantId)
      .is("revoked_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (tenantError) {
    return (
      <section className="flex flex-col gap-6">
        <SettingsHeader isDemo={false} />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700 shadow-sm">
          Nastavení podniku se nepodařilo načíst. Zkuste stránku obnovit.
        </div>
      </section>
    );
  }

  if (!tenant) {
    redirect("/login?error=missing_tenant");
  }

  return (
    <section className="flex flex-col gap-6">
      <SettingsHeader isDemo={false} />
      <SettingsGuide />
      <TenantSettingsForm tenant={tenant} />
      <CustomDomainSettings
        customDomain={tenant.custom_domain}
        status={tenant.custom_domain_status}
        verificationToken={tenant.custom_domain_verification_token}
        verifiedAt={tenant.custom_domain_verified_at}
      />
      <CalendarFeedSettings feeds={calendarFeeds ?? []} />
    </section>
  );
}
