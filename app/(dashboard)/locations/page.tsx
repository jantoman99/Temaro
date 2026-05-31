import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { LocationForm } from "@/components/locations/location-form";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type TenantLocation = {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country_code: string;
  is_primary: boolean;
  phone: string | null;
  email: string | null;
};

function LocationsHeader() {
  return (
    <PageHeader
      description="Evidence více poboček pro budoucí filtrování služeb, týmu a bookingu podle lokality."
      eyebrow="Operations"
      title="Pobočky"
    />
  );
}

function LocationList({ locations }: { locations: TenantLocation[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Pobočky</h2>
      <div className="mt-4 grid gap-3">
        {locations.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není vytvořená žádná pobočka.</p>
        ) : (
          locations.map((location) => (
            <article key={location.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{location.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {[location.address, [location.postal_code, location.city].filter(Boolean).join(" "), location.country_code]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {location.phone || location.email ? (
                    <p className="mt-1 text-xs text-muted-foreground">{[location.phone, location.email].filter(Boolean).join(" · ")}</p>
                  ) : null}
                </div>
                {location.is_primary ? (
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">Primární</span>
                ) : null}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoLocations: TenantLocation[] = [
  {
    address: "Kobližná 12",
    city: "Brno",
    country_code: "CZ",
    email: null,
    id: "demo-location-1",
    is_primary: true,
    name: "Demo Brno",
    phone: "+420777123456",
    postal_code: "602 00",
  },
];

export default async function LocationsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <LocationsHeader />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <LocationList locations={demoLocations} />
          <LocationForm />
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const { data: locations } = await auth.supabase
    .from("tenant_locations")
    .select("id, name, address, city, postal_code, country_code, is_primary, phone, email")
    .eq("tenant_id", auth.tenantId)
    .eq("is_active", true)
    .order("is_primary", { ascending: false })
    .order("name", { ascending: true });

  return (
    <section className="flex flex-col gap-6">
      <LocationsHeader />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <LocationList locations={(locations ?? []) as TenantLocation[]} />
        <LocationForm />
      </div>
    </section>
  );
}
