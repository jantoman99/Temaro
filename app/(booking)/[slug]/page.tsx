import { notFound } from "next/navigation";
import { ExternalLink, Globe, MapPin, Navigation, Sparkles, Star } from "lucide-react";
import Link from "next/link";

import { PublicBookingForm } from "@/components/booking/public-booking-form";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { DemoBanner } from "@/components/demo/demo-banner";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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

function BookingProfile({
  amenities = [],
  brandColor,
  coverImageUrl,
  description,
  eyebrow,
  galleryImageUrls = [],
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
}: {
  amenities?: string[];
  brandColor?: string | null;
  coverImageUrl?: string | null;
  description: string;
  eyebrow: string;
  galleryImageUrls?: string[];
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
}) {
  const profileImages = [coverImageUrl, ...galleryImageUrls].filter(Boolean).slice(0, 5) as string[];
  const galleryImages = profileImages.slice(1, 5);
  const hasRating = typeof reviewRating === "number" && reviewCount > 0;

  return (
    <div className="min-w-0 space-y-6">
      <section className="overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-[var(--shadow-command)]">
        <div className="relative h-[260px] bg-sidebar sm:h-[340px]">
          {profileImages[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={`${name} úvodní fotka`} className="absolute inset-0 h-full w-full object-cover" src={profileImages[0]} />
          ) : null}
          <div
            className="absolute inset-0"
            style={{
              background: profileImages[0]
                ? "linear-gradient(180deg, rgba(7,12,20,.08), rgba(7,12,20,.18))"
                : `radial-gradient(circle at 18% 15%, ${brandColor ?? "#635BFF"} 0, transparent 32%), linear-gradient(135deg, rgba(7,12,20,.96), rgba(18,24,38,.9))`,
            }}
          />
        </div>
        <div className="relative px-5 pb-6 pt-0 sm:px-7">
          <div className="-mt-10 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={`${name} logo`} className="size-24 rounded-3xl border-4 border-card bg-card object-cover p-1 shadow-lg" src={logoUrl} />
              ) : (
                <div className="grid size-24 place-items-center rounded-3xl border-4 border-card text-2xl font-black text-white shadow-lg" style={{ backgroundColor: brandColor ?? "#635BFF" }}>
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="pb-1">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {name}
                </h1>
              </div>
            </div>
            <a href="#rezervace" className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[var(--shadow-primary-glow)] transition hover:translate-y-[-1px]">
              Rezervovat termín
            </a>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
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
            {servicesCount !== undefined ? (
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-bold text-foreground">
                {servicesCount} služeb
              </span>
            ) : null}
            {staffCount !== undefined ? (
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-sm font-bold text-foreground">
                {staffCount} lidí v týmu
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">O podniku</h2>
        <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-muted-foreground">{description}</p>
        {socialLinks.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
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
      </section>

      {galleryImages.length > 0 ? (
        <section className="rounded-[1.5rem] border border-border bg-card p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Fotky</h2>
            <span className="text-sm font-semibold text-muted-foreground">{galleryImages.length} fotky</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {galleryImages.map((imageUrl, index) => (
              <div key={`${imageUrl}-${index}`} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={`${name} fotka ${index + 2}`} className="absolute inset-0 h-full w-full object-cover" src={imageUrl} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {amenities.length > 0 ? (
        <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <Sparkles className="size-5 text-primary" />
            Co tu najdete
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
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={mapEmbedUrl}
              title={`Mapa ${name}`}
            />
          ) : null}
          <div className="p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">Kde nás najdete</h2>
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

      <section className="rounded-[1.5rem] border border-border bg-card p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">Jak rezervace probíhá</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {["Vyberete službu", "Zvolíte termín", "Potvrzení přijde e-mailem"].map((step, index) => (
            <div key={step} className="rounded-2xl border border-border bg-secondary p-4">
              <div className="grid size-8 place-items-center rounded-full bg-primary text-sm font-black text-primary-foreground">{index + 1}</div>
              <p className="mt-3 text-sm font-bold text-foreground">{step}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
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
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-4 flex min-h-16 flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/88 px-3 py-3 shadow-lg shadow-primary/5 backdrop-blur-md sm:px-4">
          <Link href="/" className="flex items-center gap-3" aria-label="Zpět na web Temaro">
            <TemaroLogo />
          </Link>
          <nav className="order-3 grid w-full grid-cols-3 gap-1 border-t border-border/70 pt-2 lg:order-none lg:flex lg:w-auto lg:border-t-0 lg:pt-0">
            {[
              ["/", "Zpět na web"],
              ["/ukazka", "Interaktivní ukázka"],
              ["/register", "Registrovat podnik"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="rounded-md px-2 py-2 text-center text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground lg:px-3"
              >
                {label}
              </Link>
            ))}
          </nav>
          <ThemeToggle compact />
        </header>
        <div className="mb-6">
          <DemoBanner />
        </div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          <BookingProfile
            description="Tohle je ukázková veřejná rezervační stránka. Rezervace se zatím reálně neukládá."
            eyebrow="Online rezervace"
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
          <aside id="rezervace" className="min-w-0 lg:sticky lg:top-6">
            <PublicBookingForm
              availabilitySlots={availabilitySlots}
              services={demoServices}
              slug={slug}
              sourceTracking={sourceTracking}
              staff={demoStaff}
            />
          </aside>
        </div>
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
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_430px] lg:items-start">
          <BookingProfile
            brandColor={tenant.brand_color}
            coverImageUrl={tenant.cover_image_url}
            description={
              tenant.public_description ??
              "Vyberte službu, poskytovatele a termín. Rezervace se uloží přímo do kalendáře podniku."
            }
            eyebrow="Online rezervace"
            galleryImageUrls={tenant.public_gallery_image_urls}
            logoUrl={tenant.logo_url}
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
          />
          <aside id="rezervace" className="min-w-0 lg:sticky lg:top-6">
            <PublicBookingForm
              availabilitySlots={availabilitySlots}
              loadError={dataLoadFailed}
              services={safeServices}
              slug={tenant.slug}
              sourceTracking={sourceTracking}
              staff={safeStaff}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
