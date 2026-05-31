import { notFound } from "next/navigation";

import { PublicBookingForm } from "@/components/booking/public-booking-form";
import { DemoBanner } from "@/components/demo/demo-banner";
import { getAvailabilitySlots } from "@/lib/booking/availability";
import { demoBookings, demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { getSafeAppLocale } from "@/lib/locale";
import { buildTenantLocalBusinessJsonLd } from "@/lib/seo/local-business-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTenantAddress, getTenantMapHref } from "@/lib/tenant-location";
import { getSafeTimeZone } from "@/lib/time-zone";
import { publicTenantSlugSchema } from "@/lib/validations/bookings";
import { getBookingSourceTracking } from "@/lib/booking/source";

type BookingPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function BookingHeader({
  brandColor,
  coverImageUrl,
  description,
  eyebrow,
  locale,
  logoUrl,
  mapHref,
  name,
  publicAddress,
  servicesCount,
  staffCount,
  timeZone,
}: {
  brandColor?: string | null;
  coverImageUrl?: string | null;
  description: string;
  eyebrow: string;
  locale?: string;
  logoUrl?: string | null;
  mapHref?: string | null;
  name: string;
  publicAddress?: string | null;
  servicesCount?: number;
  staffCount?: number;
  timeZone?: string;
}) {
  return (
    <header className="command-surface relative overflow-hidden rounded-xl p-6 shadow-[var(--shadow-command)] lg:sticky lg:top-8">
      {coverImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" src={coverImageUrl} />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 15%, ${brandColor ?? "#635BFF"} 0, transparent 32%), linear-gradient(135deg, rgba(7,12,20,.96), rgba(18,24,38,.9))`,
        }}
      />
      <div className="relative">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={`${name} logo`} className="mb-6 size-14 rounded-2xl border border-white/15 bg-white object-cover p-1 shadow-md" src={logoUrl} />
      ) : (
        <div className="mb-6 grid size-14 place-items-center rounded-2xl text-base font-black text-white shadow-md" style={{ backgroundColor: brandColor ?? "#635BFF" }}>
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/62">{eyebrow}</p>
      <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
        Rezervovat se k <span className="font-serif-accent text-white">{name}</span>
      </h1>
      <p className="mt-4 max-w-md text-base font-medium leading-7 text-white/68">{description}</p>
      {publicAddress || mapHref ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/8 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/48">Kde nás najdete</p>
          {publicAddress ? <p className="mt-2 text-sm font-semibold leading-6 text-white/78">{publicAddress}</p> : null}
          {mapHref ? (
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex text-sm font-bold text-white underline-offset-4 hover:underline"
            >
              Otevřít mapu
            </a>
          ) : null}
        </div>
      ) : null}
      {servicesCount !== undefined && staffCount !== undefined && locale && timeZone ? (
        <div className="mt-7 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/8 p-3">
            <p className="nums-tabular text-xl font-semibold text-white">{servicesCount}</p>
            <p className="mt-1 text-xs font-bold text-white/55">služeb</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/8 p-3">
            <p className="nums-tabular text-xl font-semibold text-white">{staffCount}</p>
            <p className="mt-1 text-xs font-bold text-white/55">lidí</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/8 p-3">
            <p className="text-xl font-semibold text-white">{locale.toUpperCase()}</p>
            <p className="mt-1 truncate text-xs font-bold text-white/55">{timeZone}</p>
          </div>
        </div>
      ) : null}
      <div className="mt-7 rounded-2xl border border-white/10 bg-white/8 p-4">
        <p className="text-sm font-semibold text-white">Co se stane dál?</p>
        <div className="mt-3 space-y-2 text-sm font-medium text-white/65">
          <p>1. Vyberete službu a termín.</p>
          <p>2. Podnik rezervaci potvrdí.</p>
          <p>3. Potvrzení přijde e-mailem.</p>
        </div>
      </div>
      </div>
    </header>
  );
}

function PublicBookingLoadError() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Online rezervace
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Rezervace se teď nepodařilo načíst</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Zkuste stránku obnovit za chvíli. Pokud problém trvá, kontaktujte prosím podnik přímo.
          </p>
        </section>
      </div>
    </main>
  );
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { slug: rawSlug } = await params;
  const sourceTracking = getBookingSourceTracking(await searchParams);
  const parsedSlug = publicTenantSlugSchema.safeParse(rawSlug);

  if (!parsedSlug.success) {
    notFound();
  }

  const slug = parsedSlug.data;

  if (!hasSupabaseAdminEnv()) {
    const timeZone = getSafeTimeZone(demoTenant.timezone);
    const jsonLd = buildTenantLocalBusinessJsonLd({ services: demoServices, tenant: demoTenant });
    const availabilitySlots = getAvailabilitySlots({
      bookings: demoBookings,
      services: demoServices,
      staff: demoStaff,
      timeZone,
    });

    return (
    <main className="signal-hero signal-grid min-h-screen px-4 py-10 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="lg:col-span-2">
            <DemoBanner />
          </div>
          <BookingHeader
            description="Tohle je ukázková veřejná rezervační stránka. Rezervace se zatím reálně neukládá."
            eyebrow="Demo booking"
            name={demoTenant.name}
          />
          <PublicBookingForm
            availabilitySlots={availabilitySlots}
            services={demoServices}
            slug={slug || demoTenant.slug}
            sourceTracking={sourceTracking}
            staff={demoStaff}
          />
        </div>
      </main>
    );
  }

  const supabase = createAdminClient();
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, timezone, locale, industry, public_description, logo_url, cover_image_url, brand_color, public_address, public_city, public_region, public_postal_code, public_country_code, public_map_url")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (tenantError) {
    return <PublicBookingLoadError />;
  }

  if (!tenant) {
    if (slug === demoTenant.slug) {
      const demoTimeZone = getSafeTimeZone(demoTenant.timezone);
      const jsonLd = buildTenantLocalBusinessJsonLd({ services: demoServices, tenant: demoTenant });
      const availabilitySlots = getAvailabilitySlots({
        bookings: demoBookings,
        services: demoServices,
        staff: demoStaff,
        timeZone: demoTimeZone,
      });

      return (
    <main className="signal-hero signal-grid min-h-screen px-4 py-10 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div className="lg:col-span-2">
              <DemoBanner />
            </div>
            <BookingHeader
              description="Tohle je ukázková veřejná rezervační stránka. Rezervace se zatím reálně neukládá."
              eyebrow="Demo booking"
              name={demoTenant.name}
            />
            <PublicBookingForm
              availabilitySlots={availabilitySlots}
              services={demoServices}
              slug={demoTenant.slug}
              sourceTracking={sourceTracking}
              staff={demoStaff}
            />
          </div>
        </main>
      );
    }

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
  const dataLoadFailed = Boolean(servicesError || staffError || bookingsError);
  const safeServices = dataLoadFailed ? [] : (services ?? []);
  const safeStaff = dataLoadFailed ? [] : (staff ?? []);
  const jsonLd = buildTenantLocalBusinessJsonLd({ services: safeServices, tenant });
  const availabilitySlots = getAvailabilitySlots({
    bookings: dataLoadFailed ? [] : (bookings ?? []),
    locale,
    services: safeServices,
    staff: safeStaff,
    timeZone,
  });

  return (
    <main className="signal-hero signal-grid min-h-screen px-4 py-10 text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.86fr_1.14fr]">
        <BookingHeader
          brandColor={tenant.brand_color}
          coverImageUrl={tenant.cover_image_url}
          description={
            tenant.public_description ??
            "Vyberte službu, poskytovatele a termín. Rezervace se uloží přímo do kalendáře podniku."
          }
          eyebrow="Online rezervace"
          logoUrl={tenant.logo_url}
          locale={locale}
          mapHref={getTenantMapHref(tenant)}
          name={tenant.name}
          publicAddress={formatTenantAddress(tenant)}
          servicesCount={safeServices.length}
          staffCount={safeStaff.length}
          timeZone={timeZone}
        />
        <PublicBookingForm
          availabilitySlots={availabilitySlots}
          loadError={dataLoadFailed}
          services={safeServices}
          slug={tenant.slug}
          sourceTracking={sourceTracking}
          staff={safeStaff}
        />
      </div>
    </main>
  );
}
