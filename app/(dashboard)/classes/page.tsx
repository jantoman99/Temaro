import { redirect } from "next/navigation";

import { ClassEnrollmentForm, GroupClassForm } from "@/components/classes/class-forms";
import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type Option = { id: string; name: string };

type GroupClass = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  price: number | null;
  currency: "CZK" | "EUR";
  status: "scheduled" | "cancelled" | "completed";
  services: { name: string | null } | null;
  staff: { name: string | null } | null;
  bookable_resources: { name: string | null } | null;
  tenant_locations: { name: string | null } | null;
  group_class_attendees: { status: "booked" | "cancelled" | "attended" | "no_show" }[];
};

type Attendee = {
  id: string;
  status: "booked" | "cancelled" | "attended" | "no_show";
  note: string | null;
  group_classes: { title: string | null; starts_at: string | null } | null;
  clients: { full_name: string | null; email: string | null; phone: string | null } | null;
};

function ClassesHeader() {
  return (
    <PageHeader
      description="Skupinové lekce, kurzy a workshopy s kapacitou, účastníky a návazností na službu, tým, resource nebo pobočku."
      eyebrow="Capacity"
      title="Skupinové lekce"
    />
  );
}

function formatDateTime(value: string | null) {
  if (!value) return "Bez termínu";

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function ClassList({ classes }: { classes: GroupClass[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Lekce</h2>
      <div className="mt-4 grid gap-3">
        {classes.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není vytvořená žádná skupinová lekce.</p>
        ) : (
          classes.map((item) => {
            const occupied = item.group_class_attendees.filter((attendee) => attendee.status === "booked" || attendee.status === "attended").length;
            const meta = [
              item.services?.name,
              item.staff?.name ? `Tým: ${item.staff.name}` : null,
              item.bookable_resources?.name ? `Zdroj: ${item.bookable_resources.name}` : null,
              item.tenant_locations?.name ? `Pobočka: ${item.tenant_locations.name}` : null,
            ].filter(Boolean);

            return (
              <article key={item.id} className="rounded-xl border border-border bg-background p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDateTime(item.starts_at)} - {formatDateTime(item.ends_at)}</p>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">{meta.join(" · ")}</p>
                  </div>
                  <div className="grid gap-1 text-left md:text-right">
                    <p className="text-sm font-semibold">{occupied}/{item.capacity} míst</p>
                    <p className="text-xs text-muted-foreground">{item.price === null ? "Bez ceny" : formatCurrencyForDisplay(item.price, item.currency)}</p>
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.status}</p>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function AttendeeList({ attendees }: { attendees: Attendee[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Účastníci</h2>
      <div className="mt-4 grid gap-3">
        {attendees.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není přihlášený žádný účastník.</p>
        ) : (
          attendees.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-background p-3">
              <p className="font-semibold">{item.clients?.full_name ?? item.clients?.email ?? item.clients?.phone ?? "Klient"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.group_classes?.title ?? "Lekce"} · {formatDateTime(item.group_classes?.starts_at ?? null)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{item.status}</p>
              {item.note ? <p className="mt-2 text-sm text-muted-foreground">{item.note}</p> : null}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoClasses: GroupClass[] = [
  {
    bookable_resources: { name: "Studio 1" },
    capacity: 8,
    currency: "CZK",
    ends_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    group_class_attendees: [{ status: "booked" }, { status: "booked" }],
    id: "demo-class-1",
    price: 35000,
    services: { name: "Skupinová lekce" },
    staff: { name: "Eva" },
    starts_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: "scheduled",
    tenant_locations: { name: "Hlavní pobočka" },
    title: "Ranní workshop",
  },
];

export default async function ClassesPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <ClassesHeader />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <ClassList classes={demoClasses} />
            <AttendeeList attendees={[]} />
          </div>
          <div className="grid gap-6">
            <GroupClassForm locations={[]} resources={[]} services={[]} staff={[]} />
            <ClassEnrollmentForm classes={demoClasses.map((item) => ({ id: item.id, name: item.title }))} clients={[]} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: classes }, { data: attendees }, { data: services }, { data: staff }, { data: resources }, { data: locations }, { data: clients }] = await Promise.all([
    auth.supabase
      .from("group_classes")
      .select("id, title, starts_at, ends_at, capacity, price, currency, status, services(name), staff(name), bookable_resources(name), tenant_locations(name), group_class_attendees(status)")
      .eq("tenant_id", auth.tenantId)
      .order("starts_at", { ascending: true })
      .limit(50),
    auth.supabase
      .from("group_class_attendees")
      .select("id, status, note, group_classes(title, starts_at), clients(full_name, email, phone)")
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
    auth.supabase
      .from("staff")
      .select("id, name")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    auth.supabase
      .from("bookable_resources")
      .select("id, name")
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    auth.supabase
      .from("tenant_locations")
      .select("id, name")
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .order("name", { ascending: true }),
    auth.supabase
      .from("clients")
      .select("id, full_name, email, phone")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .order("full_name", { ascending: true })
      .limit(200),
  ]);

  const classRows = (classes ?? []) as GroupClass[];
  const clientOptions = (clients ?? []).map((client) => ({
    id: client.id,
    name: client.full_name ?? client.email ?? client.phone ?? "Klient",
  }));

  return (
    <section className="flex flex-col gap-6">
      <ClassesHeader />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <ClassList classes={classRows} />
          <AttendeeList attendees={(attendees ?? []) as Attendee[]} />
        </div>
        <div className="grid gap-6">
          <GroupClassForm
            locations={(locations ?? []) as Option[]}
            resources={(resources ?? []) as Option[]}
            services={(services ?? []) as Option[]}
            staff={(staff ?? []) as Option[]}
          />
          <ClassEnrollmentForm
            classes={classRows.filter((item) => item.status === "scheduled").map((item) => ({ id: item.id, name: item.title }))}
            clients={clientOptions}
          />
        </div>
      </div>
    </section>
  );
}
