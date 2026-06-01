import { ArrowRight, CalendarCheck2, MapPin, Search, UserRoundCheck } from "lucide-react";
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
import { formatTenantAddress, getTenantMapHref } from "@/lib/tenant-location";

type DirectoryPageProps = {
  searchParams: Promise<{
    city?: string;
    industry?: string;
    location?: string;
    q?: string;
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
  | "public_map_url"
  | "public_postal_code"
  | "public_region"
  | "review_count"
  | "review_rating"
  | "review_source_label"
  | "slug"
>;

const customerSteps = [
  {
    title: "Najděte podnik",
    text: "Zadejte službu, město, adresu nebo čtvrť a vyberte podnik, který vám sedí.",
    icon: Search,
  },
  {
    title: "Vyberte termín",
    text: "Na stránce podniku si zvolíte službu, člověka a volné okno v kalendáři.",
    icon: CalendarCheck2,
  },
  {
    title: "Mějte přehled",
    text: "Přes zákaznický účet najdete své aktuální i minulé rezervace.",
    icon: UserRoundCheck,
  },
] as const;

function normalizeSearch(value: string | undefined) {
  return (value ?? "").trim().slice(0, 80).toLocaleLowerCase("cs-CZ");
}

function normalizeIndustry(value: string | undefined): TenantIndustry | "" {
  const normalized = (value ?? "").trim();

  return isTenantIndustry(normalized) ? normalized : "";
}

function tenantMatchesSearch(tenant: DirectoryTenant, query: string, location: string, industry: TenantIndustry | "") {
  const industryLabel = getTenantIndustryLabel(tenant.industry);
  const queryHaystack = [
    tenant.name,
    tenant.public_description,
    industryLabel,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("cs-CZ");
  const locationHaystack = [
    tenant.public_city,
    tenant.public_region,
    tenant.public_address,
    tenant.public_postal_code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("cs-CZ");

  const matchesQuery = !query || `${queryHaystack} ${locationHaystack}`.includes(query);
  const matchesLocation = !location || locationHaystack.includes(location);
  const matchesIndustry = !industry || tenant.industry === industry;

  return matchesQuery && matchesLocation && matchesIndustry;
}

async function getDirectoryTenants(
  query: string,
  location: string,
  industry: TenantIndustry | "",
): Promise<DirectoryTenant[]> {
  if (!hasSupabaseAdminEnv()) {
    return [demoTenant].filter((tenant) => tenantMatchesSearch(tenant, query, location, industry));
  }

  const supabase = createAdminClient();
  let queryBuilder = supabase
    .from("tenants")
    .select(
      "name, slug, industry, public_description, logo_url, cover_image_url, brand_color, public_address, public_city, public_region, public_postal_code, public_country_code, public_map_url, review_rating, review_count, review_source_label, is_publicly_listed",
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
    .filter((tenant) => tenantMatchesSearch(tenant, query, location, industry))
    .sort((a, b) => a.name.localeCompare(b.name, "cs-CZ"));
}

export default async function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const params = await searchParams;
  const query = normalizeSearch(params.q);
  const location = normalizeSearch(params.location ?? params.city);
  const industry = normalizeIndustry(params.industry);
  const tenants = await getDirectoryTenants(query, location, industry);

  return (
    <main className="signal-hero signal-grid min-h-screen bg-background px-4 py-8 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1180px]">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-card/88 p-4 shadow-sm backdrop-blur">
          <Link href="/" className="flex items-center gap-3">
            <TemaroLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="hidden rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold shadow-sm hover:bg-muted sm:inline-flex">
              Pro podniky
            </Link>
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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pro zákazníky</p>
            <h1 className="mt-4 max-w-3xl text-balance text-5xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
              Najděte podnik a rezervujte si termín online.
            </h1>
            <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-muted-foreground">
              Vyhledejte salon, barber, masáž nebo jinou službu podle města, adresy nebo čtvrti. Rezervaci dokončíte
              přímo na stránce podniku.
            </p>
          </div>
          <form className="rounded-2xl border border-border bg-card p-4 shadow-sm" action="/podniky">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold">
                Co hledáte?
                <span className="relative block min-w-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    name="q"
                    defaultValue={params.q ?? ""}
                    maxLength={80}
                    className="h-11 w-full min-w-0 rounded-md border border-input bg-background pl-9 pr-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                    placeholder="barber, masáž, název podniku..."
                  />
                </span>
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold">
                Kde
                <input
                  name="location"
                  defaultValue={params.location ?? params.city ?? ""}
                  maxLength={80}
                  className="h-11 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                  placeholder="Město, adresa nebo čtvrť"
                />
              </label>
              <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold">
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
          </form>
        </section>

        <section className="grid gap-3 pb-10 md:grid-cols-3">
          {customerSteps.map((step) => (
            <article key={step.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" strokeWidth={1.9} />
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{step.title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{step.text}</p>
            </article>
          ))}
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
                Zkuste jiné místo, obor nebo otevřete ukázkovou rezervaci. Katalog se bude plnit zapojenými provozy.
              </p>
              <Link href="/demo-barber" className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
                Otevřít ukázku
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
