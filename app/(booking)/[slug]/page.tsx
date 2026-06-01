import { notFound } from "next/navigation";
import { ExternalLink, Globe, MapPin, Navigation, Sparkles, Star } from "lucide-react";

import { PublicBookingForm } from "@/components/booking/public-booking-form";
import { DemoBanner } from "@/components/demo/demo-banner";
import { getAvailabilitySlots } from "@/lib/booking/availability";
import { demoBookings, demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { getSafeAppLocale } from "@/lib/locale";
import { buildTenantLocalBusinessJsonLd } from "@/lib/seo/local-business-schema";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatTenantAddress, getTenantMapEmbedUrl, getTenantMapHref } from "@/lib/tenant-location";
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
  amenities = [],
  brandColor,
  coverImageUrl,
  description,
  eyebrow,
  galleryImageUrls = [],
  locale,
  logoUrl,
  mapEmbedUrl,
  mapHref,
  name,
  publicAddress,
  reviewCount = 0,
  reviewRating,
  reviewSourceLabel,
  servicesCount,
  socialLinks = [],
  staffCount,
  timeZone,
}: {
  amenities?: string[];
  brandColor?: string | null;
  coverImageUrl?: string | null;
  description: string;
  eyebrow: string;
  galleryImageUrls?: string[];
  locale?: string;
  logoUrl?: string | null;
  mapEmbedUrl?: string | null;
  mapHref?: string | null;
  name: string;
  publicAddress?: string | null;
  reviewCount?: number;
  reviewRating?: number | null;
  reviewSourceLabel?: string | null;
  servicesCount?: number;
  socialLinks?: Array<{ href: string; label: string; type: "facebook" | "instagram" | "tiktok" | "website" }>;
  staffCount?: number;
  timeZone?: string;
}) {
  const profileImages = [coverImageUrl, ...galleryImageUrls].filter(Boolean).slice(0, 5) as string[];
  const hasRating = typeof reviewRating === "number" && reviewCount > 0;

  return (
    <header className="space-y-4 lg:sticky lg:top-8">
      <section className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[var(--shadow-command)]">
        <div className="grid min-h-[280px] gap-2 bg-secondary p-2 sm:grid-cols-[1.5fr_1fr]">
          <div className="relative overflow-hidden rounded-[1.35rem] bg-sidebar">
            {profileImages[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt={`${name} úvodní fotka`} className="absolute inset-0 h-full w-full object-cover" src={profileImages[0]} />
            ) : null}
            <div
              className="absolute inset-0"
              style={{
                background: profileImages[0]
                  ? "linear-gradient(180deg, rgba(7,12,20,.08), rgba(7,12,20,.62))"
                  : `radial-gradient(circle at 18% 15%, ${brandColor ?? "#635BFF"} 0, transparent 32%), linear-gradient(135deg, rgba(7,12,20,.96), rgba(18,24,38,.9))`,
              }}
            />
            <div className="relative flex h-full min-h-[280px] flex-col justify-between p-5 text-white">
              <div className="flex items-start justify-between gap-3">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={`${name} logo`} className="size-14 rounded-2xl border border-white/20 bg-white object-cover p-1 shadow-md" src={logoUrl} />
                ) : (
                  <div className="grid size-14 place-items-center rounded-2xl text-base font-black text-white shadow-md" style={{ backgroundColor: brandColor ?? "#635BFF" }}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                {hasRating ? (
                  <div className="flex items-center gap-1 rounded-full border border-white/20 bg-white/14 px-3 py-1 text-sm font-bold text-white shadow-sm">
                    <Star className="size-4 fill-current" />
                    {reviewRating.toFixed(1)}
                  </div>
                ) : null}
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/70">{eyebrow}</p>
                <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
                  Rezervovat se k <span className="font-serif-accent text-white">{name}</span>
                </h1>
                <p className="mt-4 max-w-md text-base font-medium leading-7 text-white/78">{description}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
            {profileImages.slice(1, 5).map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="relative min-h-32 overflow-hidden rounded-[1.1rem] bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${name} fotka ${index + 2}`} className="absolute inset-0 h-full w-full object-cover" src={imageUrl} />
              </div>
            ))}
            {profileImages.length <= 1 ? (
              <div className="col-span-2 grid min-h-32 place-items-center rounded-[1.1rem] border border-dashed border-border bg-background p-4 text-center text-sm font-semibold text-muted-foreground sm:col-span-1">
                Fotky prací a prostoru se zobrazí tady.
              </div>
            ) : null}
          </div>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {hasRating ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-bold text-foreground">
                <Star className="size-4 fill-current text-amber-500" />
                {reviewRating.toFixed(1)} / 5 · {reviewCount} hodnocení{reviewSourceLabel ? ` · ${reviewSourceLabel}` : ""}
              </span>
            ) : null}
            {publicAddress ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-1 text-sm font-bold text-foreground">
                <MapPin className="size-4" />
                {publicAddress}
              </span>
            ) : null}
          </div>
          {socialLinks.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-bold text-foreground transition hover:border-primary/45 hover:text-primary"
                >
                  {link.type === "website" ? <Globe className="size-4" /> : null}
                  {link.type === "instagram" ? <span className="text-xs font-black">IG</span> : null}
                  {link.type === "facebook" ? <span className="text-xs font-black">f</span> : null}
                  {link.type === "tiktok" ? <span className="text-xs font-black">TT</span> : null}
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold text-foreground">Rezervace online</p>
        <div className="mt-3 space-y-2 text-sm font-medium text-muted-foreground">
          <p>1. Vyberete službu a termín.</p>
          <p>2. Doplníte kontakt.</p>
          <p>3. Potvrzení přijde e-mailem.</p>
        </div>
        {servicesCount !== undefined && staffCount !== undefined && locale && timeZone ? (
          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-secondary p-3">
              <p className="nums-tabular text-xl font-semibold text-foreground">{servicesCount}</p>
              <p className="mt-1 text-xs font-bold text-muted-foreground">služeb</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary p-3">
              <p className="nums-tabular text-xl font-semibold text-foreground">{staffCount}</p>
              <p className="mt-1 text-xs font-bold text-muted-foreground">lidí</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary p-3">
              <p className="text-xl font-semibold text-foreground">{locale.toUpperCase()}</p>
              <p className="mt-1 truncate text-xs font-bold text-muted-foreground">{timeZone}</p>
            </div>
          </div>
        ) : null}
      </section>

      {amenities.length > 0 ? (
        <section className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Sparkles className="size-4 text-primary" />
            Co u nás dostanete
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {amenities.map((amenity) => (
              <span key={amenity} className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-bold text-foreground">
                {amenity}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {publicAddress || mapHref ? (
        <section className="overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm">
          {mapEmbedUrl ? (
            <iframe
              className="h-52 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
              title={`Mapa ${name}`}
            />
          ) : null}
          <div className="p-5">
            <p className="text-sm font-bold text-foreground">Kde nás najdete</p>
            {publicAddress ? <p className="mt-2 text-sm font-semibold leading-6 text-muted-foreground">{publicAddress}</p> : null}
            {mapHref ? (
              <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary underline-offset-4 hover:underline">
                <Navigation className="size-4" />
                Navigovat
                <ExternalLink className="size-3" />
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
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

function DemoBookingPage({
  slug,
  sourceTracking,
}: {
  slug: string;
  sourceTracking: ReturnType<typeof getBookingSourceTracking>;
}) {
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
          galleryImageUrls={demoTenant.public_gallery_image_urls}
          name={demoTenant.name}
          amenities={demoTenant.public_amenities}
          mapEmbedUrl={getTenantMapEmbedUrl(demoTenant)}
          mapHref={getTenantMapHref(demoTenant)}
          publicAddress={formatTenantAddress(demoTenant)}
          reviewCount={demoTenant.review_count}
          reviewRating={demoTenant.review_rating}
          reviewSourceLabel={demoTenant.review_source_label}
          socialLinks={[
            { href: demoTenant.social_instagram_url ?? "", label: "Instagram", type: "instagram" as const },
            { href: demoTenant.social_facebook_url ?? "", label: "Facebook", type: "facebook" as const },
            { href: demoTenant.social_tiktok_url ?? "", label: "TikTok", type: "tiktok" as const },
          ].filter((link) => link.href)}
        />
        <PublicBookingForm
          availabilitySlots={availabilitySlots}
          services={demoServices}
          slug={slug}
          sourceTracking={sourceTracking}
          staff={demoStaff}
        />
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
    return <DemoBookingPage slug={slug || demoTenant.slug} sourceTracking={sourceTracking} />;
  }

  const supabase = createAdminClient();
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug, timezone, locale, industry, public_description, logo_url, cover_image_url, brand_color, public_address, public_city, public_region, public_postal_code, public_country_code, public_map_url, public_gallery_image_urls, public_amenities, social_instagram_url, social_facebook_url, social_tiktok_url, social_website_url")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (tenantError && slug === demoTenant.slug) {
    return <DemoBookingPage slug={demoTenant.slug} sourceTracking={sourceTracking} />;
  }

  if (tenantError) {
    return <PublicBookingLoadError />;
  }

  if (!tenant) {
    if (slug === demoTenant.slug) {
      return <DemoBookingPage slug={demoTenant.slug} sourceTracking={sourceTracking} />;
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
          galleryImageUrls={tenant.public_gallery_image_urls}
          logoUrl={tenant.logo_url}
          locale={locale}
          mapEmbedUrl={null}
          mapHref={getTenantMapHref(tenant)}
          name={tenant.name}
          amenities={tenant.public_amenities}
          publicAddress={formatTenantAddress(tenant)}
          servicesCount={safeServices.length}
          socialLinks={[
            { href: tenant.social_instagram_url ?? "", label: "Instagram", type: "instagram" as const },
            { href: tenant.social_facebook_url ?? "", label: "Facebook", type: "facebook" as const },
            { href: tenant.social_tiktok_url ?? "", label: "TikTok", type: "tiktok" as const },
            { href: tenant.social_website_url ?? "", label: "Web", type: "website" as const },
          ].filter((link) => link.href)}
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
