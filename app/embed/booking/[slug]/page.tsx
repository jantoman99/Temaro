import { notFound } from "next/navigation";

import { PublicBookingForm } from "@/components/booking/public-booking-form";
import { getAvailabilitySlots } from "@/lib/booking/availability";
import { getBookingSourceTracking } from "@/lib/booking/source";
import { demoBookings, demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { getSafeAppLocale } from "@/lib/locale";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeTimeZone } from "@/lib/time-zone";
import { publicTenantSlugSchema } from "@/lib/validations/bookings";

type BookingWidgetPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  robots: {
    follow: false,
    index: false,
  },
};

export default async function BookingWidgetPage({ params, searchParams }: BookingWidgetPageProps) {
  const { slug: rawSlug } = await params;
  const parsedSlug = publicTenantSlugSchema.safeParse(rawSlug);

  if (!parsedSlug.success) {
    notFound();
  }

  const slug = parsedSlug.data;
  const sourceTracking = getBookingSourceTracking({
    ...(await searchParams),
    source: "widget",
  });

  if (!hasSupabaseAdminEnv()) {
    const timeZone = getSafeTimeZone(demoTenant.timezone);
    const availabilitySlots = getAvailabilitySlots({
      bookings: demoBookings,
      services: demoServices,
      staff: demoStaff,
      timeZone,
    });

    return (
      <main className="min-h-screen bg-background px-3 py-4 text-foreground">
        <section className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Online rezervace</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{demoTenant.name}</h1>
        </section>
        <PublicBookingForm
          availabilitySlots={availabilitySlots}
          services={demoServices}
          slug={slug || demoTenant.slug}
          sourceTracking={sourceTracking}
          staff={demoStaff}
        />
      </main>
    );
  }

  const supabase = createAdminClient();
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, timezone, locale, brand_color")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (tenantError || !tenant) {
    notFound();
  }

  const timeZone = getSafeTimeZone(tenant.timezone);
  const locale = getSafeAppLocale(tenant.locale);
  const [
    { data: services, error: servicesError },
    { data: staff, error: staffError },
    { data: bookings, error: bookingsError },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("staff")
      .select("*, staff_hours(*), staff_exceptions(*), staff_services(*)")
      .eq("tenant_id", tenant.id)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("bookings")
      .select("staff_id, starts_at, ends_at, status")
      .eq("tenant_id", tenant.id)
      .in("status", ["pending", "confirmed"])
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true }),
  ]);
  const loadError = Boolean(servicesError || staffError || bookingsError);
  const safeServices = loadError ? [] : (services ?? []);
  const safeStaff = loadError ? [] : (staff ?? []);
  const availabilitySlots = getAvailabilitySlots({
    bookings: loadError ? [] : (bookings ?? []),
    locale,
    services: safeServices,
    staff: safeStaff,
    timeZone,
  });

  return (
    <main className="min-h-screen bg-background px-3 py-4 text-foreground">
      <section className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Online rezervace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{tenant.name}</h1>
      </section>
      <PublicBookingForm
        availabilitySlots={availabilitySlots}
        loadError={loadError}
        services={safeServices}
        slug={tenant.slug}
        sourceTracking={sourceTracking}
        staff={safeStaff}
      />
    </main>
  );
}
