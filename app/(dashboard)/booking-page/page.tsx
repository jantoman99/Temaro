import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { BookingBrandingForm } from "@/components/settings/booking-branding-form";
import { BookingEmbedCode } from "@/components/settings/booking-embed-code";
import { BookingPagePreview } from "@/components/settings/booking-page-preview";
import { BookingShareKit } from "@/components/settings/booking-share-kit";
import { requireOwner } from "@/lib/auth/require-owner";
import { demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";

export default async function BookingPageAdmin() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <PageHeader
          description="Tady provozovatel vidí, co posílá klientům. Branding je oddělený od technického nastavení."
          eyebrow="Zákaznický pohled"
          title="Booking stránka"
        />
        <BookingPagePreview servicesCount={demoServices.length} staffCount={demoStaff.length} tenant={demoTenant} />
        <BookingShareKit businessName={demoTenant.name} slug={demoTenant.slug} />
        <BookingEmbedCode brandColor={demoTenant.brand_color} slug={demoTenant.slug} />
        <BookingBrandingForm tenant={demoTenant} />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [
    { data: tenant, error: tenantError },
    { count: servicesCount },
    { count: staffCount },
  ] = await Promise.all([
    auth.supabase
      .from("tenants")
      .select("name, slug, timezone, locale, public_description, logo_url, cover_image_url, brand_color, confirmation_message, reminder_message, cancellation_message")
      .eq("id", auth.tenantId)
      .is("deleted_at", null)
      .single(),
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
  ]);

  if (tenantError || !tenant) {
    redirect("/settings");
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        description="Tady provozovatel vidí, co posílá klientům. Branding je oddělený od technického nastavení."
        eyebrow="Zákaznický pohled"
        title="Booking stránka"
      />
      <BookingPagePreview servicesCount={servicesCount ?? 0} staffCount={staffCount ?? 0} tenant={tenant} />
      <BookingShareKit businessName={tenant.name} slug={tenant.slug} />
      <BookingEmbedCode brandColor={tenant.brand_color} slug={tenant.slug} />
      <BookingBrandingForm tenant={tenant} />
    </section>
  );
}
