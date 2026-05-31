import { BarChart3, CircleDollarSign, Percent, ReceiptText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { demoBookings, demoServices, demoStaff } from "@/lib/demo/data";
import { hasSupabaseEnv } from "@/lib/env";
import {
  buildRevenueReport,
  getRevenueReportPeriod,
  type RevenueBreakdownRow,
  type RevenueReportPaymentRow,
} from "@/lib/reports/revenue";
import { requireOwner } from "@/lib/auth/require-owner";
import { revenueReportSearchParamsSchema } from "@/lib/validations/reports";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const PERIOD_OPTIONS = [
  { href: "/reports?period=30d", key: "30d", label: "30 dní" },
  { href: "/reports?period=90d", key: "90d", label: "90 dní" },
  { href: "/reports?period=year", key: "year", label: "Rok" },
] as const;

function ReportsHeader() {
  return (
    <PageHeader
      action={{ href: "/payments/export", label: "Export plateb CSV" }}
      description="Tržby podle období, služby, zaměstnance a zdroje rezervace. Bere jen zaplacené platby, aby reporting nebyl nafouknutý neuhrazenými zálohami."
      eyebrow="Reporting"
      title="Tržby a výkon"
    />
  );
}

function PeriodTabs({ activePeriod }: { activePeriod: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PERIOD_OPTIONS.map((option) => (
        <Link
          key={option.key}
          href={option.href}
          className={
            activePeriod === option.key
              ? "inline-flex h-10 items-center rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm"
              : "inline-flex h-10 items-center rounded-full border border-border bg-card px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          }
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CircleDollarSign;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-muted-foreground">{label}</p>
      <p className="nums-tabular mt-1 text-2xl font-semibold tracking-tight">{value}</p>
    </article>
  );
}

function BreakdownTable({
  currency,
  emptyLabel,
  rows,
  title,
}: {
  currency: string;
  emptyLabel: string;
  rows: RevenueBreakdownRow[];
  title: string;
}) {
  const maxAmount = Math.max(...rows.map((row) => row.amount), 1);

  return (
    <section className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm font-medium text-muted-foreground">{emptyLabel}</p>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{row.label}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    {row.bookingCount} plateb · {row.percentage} %
                  </p>
                </div>
                <p className="nums-tabular text-right font-semibold">
                  {formatCurrencyForDisplay(row.amount, currency, 2)}
                </p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${Math.max(4, (row.amount / maxAmount) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function createDemoRevenueRows(): RevenueReportPaymentRow[] {
  return demoBookings
    .filter((booking) => booking.status === "completed")
    .map((booking) => {
      const service = demoServices.find((item) => item.id === booking.service_id) ?? null;
      const staff = demoStaff.find((item) => item.id === booking.staff_id) ?? null;

      return {
        amount: service?.price ?? 0,
        bookings: {
          services: service ? { name: service.name } : null,
          source: booking.source ?? "manual",
          staff: staff ? { name: staff.name } : null,
        },
        currency: service?.currency ?? "CZK",
        paid_at: booking.ends_at,
        status: "paid",
      };
    });
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const parsedSearchParams = revenueReportSearchParamsSchema.parse(await searchParams);
  const period = getRevenueReportPeriod(parsedSearchParams.period);
  const rows = await getRevenueRows(period.startIso, period.endIso);
  const report = buildRevenueReport(rows);

  return (
    <section className="flex flex-col gap-6">
      {!hasSupabaseEnv() ? <DemoBanner /> : null}
      <ReportsHeader />
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">{period.label}</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Reporting používá jen zaplacené platby ve vybraném období.
          </p>
        </div>
        <PeriodTabs activePeriod={period.key} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          icon={CircleDollarSign}
          label="Tržba"
          value={formatCurrencyForDisplay(report.totalRevenue, report.currency, 2)}
        />
        <KpiCard icon={ReceiptText} label="Zaplacené platby" value={String(report.paidBookingCount)} />
        <KpiCard
          icon={Percent}
          label="Průměrná platba"
          value={formatCurrencyForDisplay(report.averagePaymentAmount, report.currency, 2)}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <BreakdownTable
          currency={report.currency}
          emptyLabel="Zatím žádné zaplacené platby podle služeb."
          rows={report.serviceBreakdown}
          title="Tržby podle služby"
        />
        <BreakdownTable
          currency={report.currency}
          emptyLabel="Zatím žádné zaplacené platby podle zaměstnanců."
          rows={report.staffBreakdown}
          title="Tržby podle zaměstnance"
        />
        <BreakdownTable
          currency={report.currency}
          emptyLabel="Zatím žádné zaplacené platby podle zdroje."
          rows={report.sourceBreakdown}
          title="Tržby podle zdroje rezervace"
        />
      </div>
      <div className="rounded-2xl border border-info/25 bg-info/10 p-4 text-sm font-medium leading-6 text-info">
        <BarChart3 className="mr-2 inline size-4 align-[-2px]" />
        Další vrstva reportingu může přidat provize zaměstnanců, cashflow podle metod platby a export souhrnu pro účetní.
      </div>
    </section>
  );
}

async function getRevenueRows(startIso: string, endIso: string): Promise<RevenueReportPaymentRow[]> {
  if (!hasSupabaseEnv()) {
    return createDemoRevenueRows();
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const { data, error } = await auth.supabase
    .from("booking_payments")
    .select(
      `
        amount,
        currency,
        status,
        paid_at,
        bookings!booking_payments_booking_tenant_fkey (
          source,
          services!bookings_service_tenant_fkey (name),
          staff!bookings_staff_tenant_fkey (name)
        )
      `,
    )
    .eq("tenant_id", auth.tenantId)
    .eq("status", "paid")
    .not("paid_at", "is", null)
    .gte("paid_at", startIso)
    .lte("paid_at", endIso)
    .order("paid_at", { ascending: false })
    .limit(500);

  if (error) {
    return [];
  }

  return (data ?? []) as RevenueReportPaymentRow[];
}
