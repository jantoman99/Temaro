import { ArrowRight, MapPin, Search } from "lucide-react";
import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { demoTenant } from "@/lib/demo/data";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getTenantIndustryLabel,
  isTenantIndustry,
  TENANT_INDUSTRIES,
  type TenantIndustry,
} from "@/lib/tenant-industry";
import { formatTenantAddress, getDistanceKm, getTenantMapHref, hasTenantCoordinates } from "@/lib/tenant-location";

type DirectoryPageProps = {
  searchParams: Promise<{
    city?: string;
    industry?: string;
    lat?: string;
    lng?: string;
    q?: string;
    radius?: string;
  }>;
};

type DirectoryTenant = Pick<
  typeof demoTenant,
  | "brand_color"
  | "cover_image_url"
  | "industry"
  | "is_publicly_listed"
  | "logo_url"
  | "name"
  | "public_address"
  | "public_city"
  | "public_country_code"
  | "public_description"
  | "public_latitude"
  | "public_longitude"
  | "public_map_url"
  | "public_postal_code"
  | "public_region"
  | "review_count"
  | "review_rating"
  | "review_source_label"
  | "slug"
>;

function normalizeSearch(value: string | undefined) {
  return (value ?? "").trim().slice(0, 80).toLocaleLowerCase("cs-CZ");
}

function normalizeIndustry(value: string | undefined): TenantIndustry | "" {
  const normalized = (value ?? "").trim();

  return isTenantIndustry(normalized) ? normalized : "";
}

function normalizeCoordinate(value: string | undefined, min: number, max: number) {
  const parsed = Number((value ?? "").replace(",", "."));

  return Number.isFinite(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

function normalizeRadius(value: string | undefined) {
  const parsed = Number(value ?? "");

  return Number.isFinite(parsed) && parsed > 0 && parsed <= 200 ? parsed : null;
}

function tenantMatchesSearch(tenant: DirectoryTenant, query: string, city: string, industry: TenantIndustry | "") {
  const industryLabel = getTenantIndustryLabel(tenant.industry);
  const haystack = [
    tenant.name,
    tenant.public_description,
    industryLabel,
    tenant.public_city,
    tenant.public_region,
    tenant.public_address,
    tenant.public_postal_code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("cs-CZ");

  const cityValue = (tenant.public_city ?? "").toLocaleLowerCase("cs-CZ");
  const matchesQuery = !query || haystack.includes(query);
  const matchesCity = !city || cityValue.includes(city);
  const matchesIndustry = !industry || tenant.industry === industry;

  return matchesQuery && matchesCity && matchesIndustry;
}

function tenantDistance(
  tenant: DirectoryTenant,
  origin: { latitude: number; longitude: number } | null,
) {
  if (!origin || !hasTenantCoordinates(tenant)) {
    return null;
  }

  return getDistanceKm(origin, {
    latitude: tenant.public_latitude,
    longitude: tenant.public_longitude,
  });
}

async function getDirectoryTenants(
  query: string,
  city: string,
  industry: TenantIndustry | "",
  origin: { latitude: number; longitude: number } | null,
  radiusKm: number | null,
): Promise<Array<DirectoryTenant & { distanceKm: number | null }>> {
  if (!hasSupabaseAdminEnv()) {
    return [demoTenant]
      .filter((tenant) => tenantMatchesSearch(tenant, query, city, industry))
      .map((tenant) => ({ ...tenant, distanceKm: tenantDistance(tenant, origin) }))
      .filter((tenant) => radiusKm === null || tenant.distanceKm === null || tenant.distanceKm <= radiusKm);
  }

  const supabase = createAdminClient();
  let queryBuilder = supabase
    .from("tenants")
    .select(
      "name, slug, industry, public_description, logo_url, cover_image_url, brand_color, public_address, public_city, public_region, public_postal_code, public_country_code, public_map_url, public_latitude, public_longitude, review_rating, review_count, review_source_label, is_publicly_listed",
    )
    .eq("is_publicly_listed", true)
    .is("deleted_at", null);

  if (industry) {
    queryBuilder = queryBuilder.eq("industry", industry);
  }

  const { data, error } = await queryBuilder
    .order("public_city", { ascending: true })
    .order("name", { ascending: true })
    .limit(100);

  if (error) {
    return [];
  }

  return (data ?? [])
    .filter((tenant) => tenantMatchesSearch(tenant, query, city, industry))
    .map((tenant) => ({ ...tenant, distanceKm: tenantDistance(tenant, origin) }))
    .filter((tenant) => radiusKm === null || tenant.distanceKm === null || tenant.distanceKm <= radiusKm)
    .sort((a, b) => {
      if (a.distanceKm === null && b.distanceKm === null) return a.name.localeCompare(b.name, "cs-CZ");
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;

      return a.distanceKm - b.distanceKm;
    });
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const query = normalizeSearch(params.q);
  const city = normalizeSearch(params.city);
  const industry = normalizeIndustry(params.industry);
  const latitude = normalizeCoordinate(params.lat, -90, 90);
  const longitude = normalizeCoordinate(params.lng, -180, 180);
  const radiusKm = normalizeRadius(params.radius);
  const origin = latitude !== null && longitude !== null ? { latitude, longitude } : null;
  const tenants = await getDirectoryTenants(query, city, industry, origin, radiusKm);

  return (
    <main className="signal-hero signal-grid min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/88 p-4 shadow-sm backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <TemaroLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/account/login" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-muted">
              Zákaznický účet
            </Link>
            <Link href="/register" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/92">
              Registrovat podnik
            </Link>
          </div>
        </header>

        <section className="grid gap-8 py-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Veřejný katalog</p>
            <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
              Najděte podnik podle města a rezervujte online.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-muted-foreground">
              První vrstva lokálního discovery pro Temaro. Podnik zůstává pod vlastní značkou a bez marketplace provizí,
              klient ale může najít provozovnu podle lokality.
            </p>
          </div>
          <form className="rounded-2xl border border-border bg-card p-4 shadow-sm" action="/podniky">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Hledat
                <span className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="q"
                    defaultValue={params.q ?? ""}
                    maxLength={80}
                    className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    placeholder="barber, masáže, název..."
                  />
                </span>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Město
                <input
                  name="city"
                  defaultValue={params.city ?? ""}
                  maxLength={80}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Brno"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Obor
                <select
                  name="industry"
                  defaultValue={industry}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                >
                  <option value="">Všechny obory</option>
                  {TENANT_INDUSTRIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="h-11 self-end rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/92">
                Vyhledat
              </button>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Moje šířka
                <input
                  name="lat"
                  defaultValue={params.lat ?? ""}
                  inputMode="decimal"
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="49.1951"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Moje délka
                <input
                  name="lng"
                  defaultValue={params.lng ?? ""}
                  inputMode="decimal"
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="16.6068"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Radius km
                <input
                  name="radius"
                  defaultValue={params.radius ?? ""}
                  inputMode="numeric"
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="10"
                />
              </label>
            </div>
          </form>
        </section>

        <section className="grid gap-4 pb-16 md:grid-cols-2">
          {tenants.length > 0 ? (
            tenants.map((tenant) => {
              const address = formatTenantAddress(tenant);
              const mapHref = getTenantMapHref(tenant);

              return (
                <article key={tenant.slug} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div
                    className="h-3"
                    style={{ backgroundColor: tenant.brand_color ?? "#635BFF" }}
                  />
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {tenant.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img alt={`${tenant.name} logo`} className="size-14 rounded-2xl border border-border bg-white object-cover p-1 shadow-sm" src={tenant.logo_url} />
                      ) : (
                        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary text-base font-black text-primary-foreground">
                          {tenant.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h2 className="text-2xl font-semibold tracking-tight">{tenant.name}</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs font-bold text-muted-foreground">
                            {getTenantIndustryLabel(tenant.industry)}
                          </span>
                          {tenant.public_city ? (
                            <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                              <MapPin className="size-4 text-primary" />
                              {tenant.public_city}
                            </span>
                          ) : null}
                          {tenant.distanceKm !== null ? (
                            <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-bold text-muted-foreground">
                              {tenant.distanceKm.toFixed(1)} km
                            </span>
                          ) : null}
                          {tenant.review_rating !== null && tenant.review_count > 0 ? (
                            <span className="rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">
                              {tenant.review_rating.toFixed(1)} · {tenant.review_count} recenzí
                              {tenant.review_source_label ? ` · ${tenant.review_source_label}` : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    {tenant.public_description ? (
                      <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">{tenant.public_description}</p>
                    ) : null}
                    {address ? <p className="mt-4 rounded-xl border border-border bg-secondary p-3 text-sm font-semibold">{address}</p> : null}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link href={`/${tenant.slug}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/92">
                        Rezervovat
                        <ArrowRight className="size-4" />
                      </Link>
                      {mapHref ? (
                        <a href={mapHref} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-semibold shadow-sm hover:bg-muted">
                          Otevřít mapu
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:col-span-2">
              <p className="text-lg font-semibold">Zatím tu není podnik pro zadané hledání.</p>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                Zkuste jiné město nebo otevřete demo booking. Katalog je připravený jako další vrstva produktu.
              </p>
              <Link href="/demo-barber" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
                Otevřít demo
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
