import { redirect } from "next/navigation";

import { CommissionRuleForm } from "@/components/commissions/commission-form";
import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { requireOwner } from "@/lib/auth/require-owner";
import { calculateEstimatedCommission, type CommissionRule } from "@/lib/commissions/calculate";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type StaffOption = { id: string; name: string };

type StaffRow = {
  id: string;
  name: string;
  staff_commission_rules: CommissionRule[] | null;
};

type PaymentRow = {
  amount: number;
  currency: "CZK" | "EUR";
  bookings: { staff_id: string | null } | null;
};

type BookingRow = {
  id: string;
  staff_id: string | null;
};

function CommissionsHeader() {
  return (
    <PageHeader
      description="Odhad provizí a výkonu týmu podle zaplacených plateb a dokončených rezervací. Finální payroll vždy zkontrolujte ručně."
      eyebrow="Finance"
      title="Provize"
    />
  );
}

function getRuleLabel(rule?: CommissionRule | null) {
  if (!rule || !rule.is_active) return "Bez pravidla";

  if (rule.rule_type === "fixed_completed_booking") {
    return `${formatCurrencyForDisplay(rule.fixed_amount, rule.currency, 2)} / hotová rezervace`;
  }

  return `${(rule.percent_bps / 100).toLocaleString("cs-CZ")} % ze zaplacených plateb`;
}

function getThirtyDaysAgoIso() {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString();
}

function PerformanceTable({
  bookings,
  payments,
  staff,
}: {
  bookings: BookingRow[];
  payments: PaymentRow[];
  staff: StaffRow[];
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Výkon týmu za posledních 30 dní</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-3 py-3">Člen týmu</th>
              <th className="px-3 py-3">Hotovo</th>
              <th className="px-3 py-3">Zaplaceno</th>
              <th className="px-3 py-3">Pravidlo</th>
              <th className="px-3 py-3 text-right">Odhad provize</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((member) => {
              const completedBookings = bookings.filter((booking) => booking.staff_id === member.id).length;
              const staffPayments = payments.filter((payment) => payment.bookings?.staff_id === member.id);
              const paidRevenue = staffPayments.reduce((sum, payment) => sum + payment.amount, 0);
              const currency = staffPayments[0]?.currency ?? member.staff_commission_rules?.[0]?.currency ?? "CZK";
              const rule = member.staff_commission_rules?.[0] ?? null;
              const commission = calculateEstimatedCommission({ completedBookings, paidRevenue, rule });

              return (
                <tr key={member.id}>
                  <td className="px-3 py-3 font-semibold">{member.name}</td>
                  <td className="px-3 py-3">{completedBookings}</td>
                  <td className="px-3 py-3">{formatCurrencyForDisplay(paidRevenue, currency, 2)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{getRuleLabel(rule)}</td>
                  <td className="px-3 py-3 text-right font-semibold">{formatCurrencyForDisplay(commission, currency, 2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const demoStaff: StaffRow[] = [
  {
    id: "demo-staff-1",
    name: "Eva",
    staff_commission_rules: [{
      currency: "CZK",
      fixed_amount: 0,
      is_active: true,
      percent_bps: 1500,
      rule_type: "percent_paid_revenue",
    }],
  },
];

export default async function CommissionsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <CommissionsHeader />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <PerformanceTable bookings={[{ id: "demo-booking", staff_id: "demo-staff-1" }]} payments={[{ amount: 200000, bookings: { staff_id: "demo-staff-1" }, currency: "CZK" }]} staff={demoStaff} />
          <CommissionRuleForm staff={demoStaff.map((member) => ({ id: member.id, name: member.name }))} />
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const from = getThirtyDaysAgoIso();
  const [{ data: staff }, { data: payments }, { data: bookings }] = await Promise.all([
    auth.supabase
      .from("staff")
      .select("id, name, staff_commission_rules(rule_type, percent_bps, fixed_amount, currency, is_active)")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    auth.supabase
      .from("booking_payments")
      .select("amount, currency, bookings!booking_payments_booking_tenant_fkey(staff_id)")
      .eq("tenant_id", auth.tenantId)
      .eq("status", "paid")
      .gte("paid_at", from),
    auth.supabase
      .from("bookings")
      .select("id, staff_id")
      .eq("tenant_id", auth.tenantId)
      .eq("status", "completed")
      .gte("starts_at", from),
  ]);

  const staffRows = (staff ?? []) as StaffRow[];

  return (
    <section className="flex flex-col gap-6">
      <CommissionsHeader />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <PerformanceTable bookings={(bookings ?? []) as BookingRow[]} payments={(payments ?? []) as PaymentRow[]} staff={staffRows} />
        <CommissionRuleForm staff={staffRows.map((member) => ({ id: member.id, name: member.name })) as StaffOption[]} />
      </div>
    </section>
  );
}
