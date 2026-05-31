import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import {
  AssignMembershipForm,
  CreateMembershipPlanForm,
  MembershipStatusForm,
} from "@/components/memberships/membership-forms";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type MembershipPlan = {
  id: string;
  name: string;
  billing_period: "monthly" | "quarterly" | "yearly";
  price: number;
  currency: string;
  included_units: number | null;
  included_credit: number | null;
};

type ClientMembership = {
  id: string;
  status: string;
  starts_at: string;
  next_billing_date: string;
  clients: { full_name: string | null } | null;
  membership_plans: { name: string | null; price: number | null; currency: string | null; billing_period: string | null } | null;
};

type ClientOption = { id: string; full_name: string | null; email: string | null; phone: string | null };

const periodLabels: Record<string, string> = {
  monthly: "měsíčně",
  quarterly: "čtvrtletně",
  yearly: "ročně",
};

function MembershipsHeader() {
  return (
    <PageHeader
      description="Opakovaná členství pro provozy, které pracují s pravidelným měsíčním nebo ročním vztahem klienta."
      eyebrow="Business suite"
      title="Členství"
    />
  );
}

function MembershipSummary({ memberships, plans }: { memberships: ClientMembership[]; plans: MembershipPlan[] }) {
  const active = memberships.filter((membership) => membership.status === "active");
  const monthlyValue = active.reduce((sum, membership) => sum + (membership.membership_plans?.price ?? 0), 0);
  const currency = active[0]?.membership_plans?.currency ?? "CZK";

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Plány</p>
        <p className="mt-2 text-2xl font-semibold">{plans.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Aktivní členství</p>
        <p className="mt-2 text-2xl font-semibold">{active.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Hodnota období</p>
        <p className="mt-2 text-2xl font-semibold">{formatCurrencyForDisplay(monthlyValue, currency, 2)}</p>
      </div>
    </section>
  );
}

function PlanList({ plans }: { plans: MembershipPlan[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold">Plány členství</h2>
        <p className="mt-1 text-sm text-muted-foreground">Evidence plánů bez automatických plateb. Platby se zatím řeší provozně.</p>
      </div>
      {plans.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-muted-foreground">Zatím není vytvořený žádný plán členství.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Plán</th>
                <th className="px-4 py-3">Cena</th>
                <th className="px-4 py-3">Obsah</th>
                <th className="px-4 py-3">Období</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-4 py-3 font-semibold">{plan.name}</td>
                  <td className="px-4 py-3">{formatCurrencyForDisplay(plan.price, plan.currency, 2)}</td>
                  <td className="px-4 py-3">
                    {(plan.included_units ?? 0) > 0 ? `${plan.included_units} vst. ` : ""}
                    {(plan.included_credit ?? 0) > 0 ? formatCurrencyForDisplay(plan.included_credit ?? 0, plan.currency, 2) : ""}
                    {!plan.included_units && !plan.included_credit ? "Bez zahrnutého zůstatku" : null}
                  </td>
                  <td className="px-4 py-3">{periodLabels[plan.billing_period]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function MembershipList({ memberships }: { memberships: ClientMembership[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Klientská členství</h2>
      <div className="mt-4 grid gap-3">
        {memberships.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není přiřazené žádné členství.</p>
        ) : (
          memberships.map((membership) => (
            <article key={membership.id} className="rounded-xl border border-border bg-background p-3">
              <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <p className="font-semibold">{membership.clients?.full_name ?? "Klient"}</p>
                  <p className="text-xs text-muted-foreground">
                    {membership.membership_plans?.name ?? "Plán"} · další platba {new Date(membership.next_billing_date).toLocaleDateString("cs-CZ")}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary">{membership.status}</p>
                </div>
                <MembershipStatusForm membershipId={membership.id} status={membership.status} />
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoPlans: MembershipPlan[] = [
  {
    billing_period: "monthly",
    currency: "CZK",
    id: "demo-membership-plan-1",
    included_credit: null,
    included_units: 4,
    name: "Klub 4 návštěvy",
    price: 160000,
  },
];

export default async function MembershipsPage() {
  if (!hasSupabaseEnv()) {
    const demoMemberships: ClientMembership[] = [
      {
        clients: { full_name: "Demo klient" },
        id: "demo-membership-1",
        membership_plans: { billing_period: "monthly", currency: "CZK", name: "Klub 4 návštěvy", price: 160000 },
        next_billing_date: "2026-06-08",
        starts_at: "2026-05-08",
        status: "active",
      },
    ];

    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <MembershipsHeader />
        <MembershipSummary memberships={demoMemberships} plans={demoPlans} />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <PlanList plans={demoPlans} />
            <MembershipList memberships={demoMemberships} />
          </div>
          <div className="grid gap-6">
            <CreateMembershipPlanForm />
            <AssignMembershipForm clients={[]} plans={demoPlans} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: plans }, { data: memberships }, { data: clients }] = await Promise.all([
    auth.supabase
      .from("membership_plans")
      .select("id, name, billing_period, price, currency, included_units, included_credit")
      .eq("tenant_id", auth.tenantId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(50),
    auth.supabase
      .from("client_memberships")
      .select("id, status, starts_at, next_billing_date, clients(full_name), membership_plans(name, price, currency, billing_period)")
      .eq("tenant_id", auth.tenantId)
      .order("next_billing_date", { ascending: true })
      .limit(50),
    auth.supabase
      .from("clients")
      .select("id, full_name, email, phone")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .order("full_name", { ascending: true })
      .limit(100),
  ]);

  const planRows = (plans ?? []) as MembershipPlan[];
  const membershipRows = (memberships ?? []) as ClientMembership[];

  return (
    <section className="flex flex-col gap-6">
      <MembershipsHeader />
      <MembershipSummary memberships={membershipRows} plans={planRows} />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <PlanList plans={planRows} />
          <MembershipList memberships={membershipRows} />
        </div>
        <div className="grid gap-6">
          <CreateMembershipPlanForm />
          <AssignMembershipForm clients={(clients ?? []) as ClientOption[]} plans={planRows} />
        </div>
      </div>
    </section>
  );
}
