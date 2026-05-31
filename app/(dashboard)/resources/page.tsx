import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { ResourceForm, ServiceResourceForm } from "@/components/resources/resource-forms";
import { requireOwner } from "@/lib/auth/require-owner";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type Resource = {
  id: string;
  name: string;
  resource_type: string;
  capacity: number;
  description: string | null;
};

type ServiceResource = {
  service_id: string;
  resource_id: string;
  services: { name: string | null } | null;
  bookable_resources: { name: string | null } | null;
};

type ServiceOption = { id: string; name: string };

function ResourcesHeader() {
  return (
    <PageHeader
      description="Evidence místností, židlí, vybavení a dalších zdrojů pro budoucí kapacitní booking pravidla."
      eyebrow="Operations"
      title="Resources"
    />
  );
}

function ResourceList({ resources }: { resources: Resource[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Zdroje</h2>
      <div className="mt-4 grid gap-3">
        {resources.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není vytvořený žádný zdroj.</p>
        ) : (
          resources.map((resource) => (
            <article key={resource.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{resource.name}</p>
                  <p className="text-xs text-muted-foreground">{resource.resource_type} · kapacita {resource.capacity}</p>
                  {resource.description ? <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p> : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function ServiceResourceList({ links }: { links: ServiceResource[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Vazby na služby</h2>
      <div className="mt-4 grid gap-3">
        {links.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není žádný zdroj přiřazený ke službě.</p>
        ) : (
          links.map((link) => (
            <article key={`${link.service_id}-${link.resource_id}`} className="rounded-xl border border-border bg-background p-3">
              <p className="font-semibold">{link.services?.name ?? "Služba"}</p>
              <p className="text-sm text-muted-foreground">{link.bookable_resources?.name ?? "Zdroj"}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoResources: Resource[] = [
  { capacity: 1, description: "Hlavní křeslo u okna", id: "demo-resource-1", name: "Křeslo 1", resource_type: "chair" },
];

export default async function ResourcesPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <ResourcesHeader />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <ResourceList resources={demoResources} />
            <ServiceResourceList links={[]} />
          </div>
          <div className="grid gap-6">
            <ResourceForm />
            <ServiceResourceForm resources={demoResources} services={[]} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: resources }, { data: links }, { data: services }] = await Promise.all([
    auth.supabase
      .from("bookable_resources")
      .select("id, name, resource_type, capacity, description")
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    auth.supabase
      .from("service_resources")
      .select("service_id, resource_id, services(name), bookable_resources(name)")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
    auth.supabase
      .from("services")
      .select("id, name")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const resourceRows = (resources ?? []) as Resource[];

  return (
    <section className="flex flex-col gap-6">
      <ResourcesHeader />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <ResourceList resources={resourceRows} />
          <ServiceResourceList links={(links ?? []) as ServiceResource[]} />
        </div>
        <div className="grid gap-6">
          <ResourceForm />
          <ServiceResourceForm resources={resourceRows} services={(services ?? []) as ServiceOption[]} />
        </div>
      </div>
    </section>
  );
}
