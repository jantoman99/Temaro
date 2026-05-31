import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { AssignClientPassForm, CreatePackageForm, RedeemClientPassForm } from "@/components/packages/package-forms";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type ServicePackage = {
  id: string;
  name: string;
  package_type: "sessions" | "credit";
  total_units: number | null;
  credit_amount: number | null;
  price: number;
  currency: string;
  validity_days: number | null;
  services: { name: string | null } | null;
};

type ClientPass = {
  id: string;
  package_type: "sessions" | "credit";
  remaining_units: number | null;
  remaining_credit: number | null;
  status: string;
  expires_at: string | null;
  clients: { full_name: string | null } | null;
  service_packages: { name: string | null; currency: string | null } | null;
};

type PassRedemption = {
  id: string;
  units_used: number | null;
  credit_used: number | null;
  created_at: string;
  client_passes: {
    clients: { full_name: string | null } | null;
    service_packages: { name: string | null; currency: string | null } | null;
  } | null;
};

type ClientOption = { id: string; full_name: string | null; email: string | null; phone: string | null };
type ServiceOption = { id: string; name: string };

function PackagesHeader() {
  return (
    <PageHeader
      description="Permanentky, kredity a balíčky služeb s klientským zůstatkem a auditovaným čerpáním."
      eyebrow="Business suite"
      title="Balíčky"
    />
  );
}

function PackagesSummary({ clientPasses, packages }: { clientPasses: ClientPass[]; packages: ServicePackage[] }) {
  const activePasses = clientPasses.filter((pass) => pass.status === "active");
  const remainingSessions = activePasses.reduce((sum, pass) => sum + (pass.remaining_units ?? 0), 0);
  const remainingCredit = activePasses.reduce((sum, pass) => sum + (pass.remaining_credit ?? 0), 0);

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Nabídky</p>
        <p className="mt-2 text-2xl font-semibold">{packages.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Aktivní permanentky</p>
        <p className="mt-2 text-2xl font-semibold">{activePasses.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Zůstatky</p>
        <p className="mt-2 text-2xl font-semibold">
          {remainingSessions} vst. · {formatCurrencyForDisplay(remainingCredit, "CZK", 2)}
        </p>
      </div>
    </section>
  );
}

function PackageList({ packages }: { packages: ServicePackage[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold">Nabídka balíčků</h2>
        <p className="mt-1 text-sm text-muted-foreground">Šablony, ze kterých se klientům vystavují permanentky.</p>
      </div>
      {packages.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-muted-foreground">Zatím není vytvořený žádný balíček.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Balíček</th>
                <th className="px-4 py-3">Obsah</th>
                <th className="px-4 py-3">Cena</th>
                <th className="px-4 py-3">Platnost</th>
                <th className="px-4 py-3">Služba</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {packages.map((packageOffer) => (
                <tr key={packageOffer.id}>
                  <td className="px-4 py-3 font-semibold">{packageOffer.name}</td>
                  <td className="px-4 py-3">
                    {packageOffer.package_type === "sessions"
                      ? `${packageOffer.total_units ?? 0} vstupů`
                      : formatCurrencyForDisplay(packageOffer.credit_amount ?? 0, packageOffer.currency, 2)}
                  </td>
                  <td className="px-4 py-3">{formatCurrencyForDisplay(packageOffer.price, packageOffer.currency, 2)}</td>
                  <td className="px-4 py-3">{packageOffer.validity_days ? `${packageOffer.validity_days} dní` : "Bez expirace"}</td>
                  <td className="px-4 py-3">{packageOffer.services?.name ?? "Bez vazby"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function ClientPassList({ clientPasses }: { clientPasses: ClientPass[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Klientské permanentky</h2>
      <div className="mt-4 grid gap-3">
        {clientPasses.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není přiřazená žádná permanentka.</p>
        ) : (
          clientPasses.map((pass) => (
            <article key={pass.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{pass.clients?.full_name ?? "Klient"}</p>
                  <p className="text-xs text-muted-foreground">
                    {pass.service_packages?.name ?? "Balíček"} · {pass.expires_at ? `do ${new Date(pass.expires_at).toLocaleDateString("cs-CZ")}` : "bez expirace"}
                  </p>
                </div>
                <p className="font-bold">
                  {pass.package_type === "sessions"
                    ? `${pass.remaining_units ?? 0} vst.`
                    : formatCurrencyForDisplay(pass.remaining_credit ?? 0, pass.service_packages?.currency ?? "CZK", 2)}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function RedemptionList({ redemptions }: { redemptions: PassRedemption[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Poslední čerpání</h2>
      <div className="mt-4 grid gap-3">
        {redemptions.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím neproběhlo žádné čerpání.</p>
        ) : (
          redemptions.map((redemption) => (
            <article key={redemption.id} className="rounded-xl border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{redemption.client_passes?.clients?.full_name ?? "Klient"}</p>
                  <p className="text-xs text-muted-foreground">
                    {redemption.client_passes?.service_packages?.name ?? "Balíček"} · {new Date(redemption.created_at).toLocaleString("cs-CZ")}
                  </p>
                </div>
                <p className="font-bold text-destructive">
                  {redemption.units_used
                    ? `-${redemption.units_used} vst.`
                    : `-${formatCurrencyForDisplay(redemption.credit_used ?? 0, redemption.client_passes?.service_packages?.currency ?? "CZK", 2)}`}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoPackages: ServicePackage[] = [
  {
    credit_amount: null,
    currency: "CZK",
    id: "demo-package-1",
    name: "10 vstupů Barber",
    package_type: "sessions",
    price: 450000,
    services: { name: "Střih" },
    total_units: 10,
    validity_days: 180,
  },
];

export default async function PackagesPage() {
  if (!hasSupabaseEnv()) {
    const demoPasses: ClientPass[] = [
      {
        clients: { full_name: "Demo klient" },
        expires_at: null,
        id: "demo-pass-1",
        package_type: "sessions",
        remaining_credit: null,
        remaining_units: 7,
        service_packages: { currency: "CZK", name: "10 vstupů Barber" },
        status: "active",
      },
    ];

    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <PackagesHeader />
        <PackagesSummary clientPasses={demoPasses} packages={demoPackages} />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <PackageList packages={demoPackages} />
            <ClientPassList clientPasses={demoPasses} />
            <RedemptionList redemptions={[]} />
          </div>
          <div className="grid gap-6">
            <CreatePackageForm services={[]} />
            <AssignClientPassForm clients={[]} packages={demoPackages} />
            <RedeemClientPassForm clientPasses={demoPasses} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: packages }, { data: clientPasses }, { data: redemptions }, { data: services }, { data: clients }] =
    await Promise.all([
      auth.supabase
        .from("service_packages")
        .select("id, name, package_type, total_units, credit_amount, price, currency, validity_days, services(name)")
        .eq("tenant_id", auth.tenantId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(50),
      auth.supabase
        .from("client_passes")
        .select("id, package_type, remaining_units, remaining_credit, status, expires_at, clients(full_name), service_packages(name, currency)")
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .limit(50),
      auth.supabase
        .from("client_pass_redemptions")
        .select("id, units_used, credit_used, created_at, client_passes(clients(full_name), service_packages(name, currency))")
        .eq("tenant_id", auth.tenantId)
        .order("created_at", { ascending: false })
        .limit(10),
      auth.supabase
        .from("services")
        .select("id, name")
        .eq("tenant_id", auth.tenantId)
        .is("deleted_at", null)
        .eq("is_active", true)
        .order("name", { ascending: true }),
      auth.supabase
        .from("clients")
        .select("id, full_name, email, phone")
        .eq("tenant_id", auth.tenantId)
        .is("deleted_at", null)
        .order("full_name", { ascending: true })
        .limit(100),
    ]);

  const packageRows = (packages ?? []) as ServicePackage[];
  const passRows = (clientPasses ?? []) as ClientPass[];

  return (
    <section className="flex flex-col gap-6">
      <PackagesHeader />
      <PackagesSummary clientPasses={passRows} packages={packageRows} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <PackageList packages={packageRows} />
          <ClientPassList clientPasses={passRows} />
          <RedemptionList redemptions={(redemptions ?? []) as PassRedemption[]} />
        </div>
        <div className="grid gap-6">
          <CreatePackageForm services={(services ?? []) as ServiceOption[]} />
          <AssignClientPassForm clients={(clients ?? []) as ClientOption[]} packages={packageRows} />
          <RedeemClientPassForm clientPasses={passRows} />
        </div>
      </div>
    </section>
  );
}
