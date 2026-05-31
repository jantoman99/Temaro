import { Download, ReceiptText } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatDateTimeForDisplay } from "@/lib/date-format";
import { hasSupabaseEnv } from "@/lib/env";
import { requireOwner } from "@/lib/auth/require-owner";
import type { PaymentExportRow } from "@/lib/payments/export";

export const dynamic = "force-dynamic";

const PAYMENT_SCOPE_LABELS: Record<string, string> = {
  deposit: "Záloha",
  remaining: "Doplatek",
  full: "Celá platba",
  other: "Jiná platba",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bankovní převod",
  card_terminal: "Karta na místě",
  cash: "Hotově",
  online_card: "Online karta",
  other: "Jiné",
  voucher: "Voucher",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  failed: "Selhalo",
  paid: "Zaplaceno",
  pending: "Čeká",
  refunded: "Vráceno",
};

function PaymentsHeader() {
  return (
    <PageHeader
      action={{ href: "/payments/export", label: "Export CSV" }}
      description="Evidence zaplacených záloh, doplatků a plateb na místě. Není to plné účetnictví, ale praktický podklad pro provoz a účetní."
      eyebrow="Finance"
      title="Platby"
    />
  );
}

function getLabel(labels: Record<string, string>, value: string) {
  return labels[value] ?? value;
}

function EmptyPaymentsState({ isDemo = false }: { isDemo?: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <ReceiptText className="size-5" />
      </div>
      <h2 className="mt-4 text-lg font-semibold">Zatím žádné zaevidované platby</h2>
      <p className="mx-auto mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
        {isDemo
          ? "V demo režimu se platby neukládají do databáze. V reálném tenantu se platba zapisuje v detailu rezervace v kalendáři."
          : "Platbu zaevidujete v detailu rezervace v kalendáři. Jakmile vznikne první záloha nebo doplatek, zobrazí se tady a půjde exportovat do CSV."}
      </p>
      <Link
        href="/calendar"
        className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
      >
        Otevřít kalendář
      </Link>
    </div>
  );
}

function PaymentsTable({ payments, timeZone }: { payments: PaymentExportRow[]; timeZone: string }) {
  const paidTotal = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + payment.amount, 0);
  const currency = payments.find((payment) => payment.status === "paid")?.currency ?? "CZK";

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold">Posledních {payments.length} plateb</p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Zaplaceno celkem {formatCurrencyForDisplay(paidTotal, currency, 2)}
          </p>
        </div>
        <Link
          href="/payments/export"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Download className="size-4" />
          Export CSV
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="border-b border-border bg-muted/45 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-semibold">Datum</th>
              <th className="px-4 py-3 font-semibold">Klient</th>
              <th className="px-4 py-3 font-semibold">Služba</th>
              <th className="px-4 py-3 font-semibold">Typ</th>
              <th className="px-4 py-3 font-semibold">Metoda</th>
              <th className="px-4 py-3 text-right font-semibold">Částka</th>
              <th className="px-4 py-3 font-semibold">Stav</th>
              <th className="px-4 py-3 text-right font-semibold">Doklad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-muted/35">
                <td className="px-4 py-3 font-medium">
                  {formatDateTimeForDisplay(payment.paid_at ?? payment.created_at, timeZone)}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold">{payment.bookings?.clients?.full_name ?? "Bez klienta"}</p>
                  <p className="text-xs font-medium text-muted-foreground">{payment.bookings?.clients?.phone ?? payment.bookings?.clients?.email ?? ""}</p>
                </td>
                <td className="px-4 py-3 font-medium">{payment.bookings?.services?.name ?? "Bez služby"}</td>
                <td className="px-4 py-3 font-medium">{getLabel(PAYMENT_SCOPE_LABELS, payment.payment_scope)}</td>
                <td className="px-4 py-3 font-medium">{getLabel(PAYMENT_METHOD_LABELS, payment.method)}</td>
                <td className="px-4 py-3 text-right font-semibold">
                  {formatCurrencyForDisplay(payment.amount, payment.currency, 2)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {getLabel(PAYMENT_STATUS_LABELS, payment.status)}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/payments/receipt/${payment.id}`}
                    target="_blank"
                    className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Otevřít
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return <PaymentsContent />;
}

async function PaymentsContent() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <PaymentsHeader />
        <EmptyPaymentsState isDemo />
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: tenant }, { data: payments, error: paymentsError }] = await Promise.all([
    auth.supabase
      .from("tenants")
      .select("timezone")
      .eq("id", auth.tenantId)
      .is("deleted_at", null)
      .maybeSingle(),
    auth.supabase
      .from("booking_payments")
      .select(
        `
          id,
          amount,
          currency,
          payment_scope,
          method,
          status,
          note,
          paid_at,
          created_at,
          bookings!booking_payments_booking_tenant_fkey (
            starts_at,
            clients!bookings_client_tenant_fkey (full_name, email, phone),
            services!bookings_service_tenant_fkey (name),
            staff!bookings_staff_tenant_fkey (name)
          )
        `,
      )
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const rows = (payments ?? []) as PaymentExportRow[];

  return (
    <section className="flex flex-col gap-6">
      <PaymentsHeader />
      {paymentsError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          Platby se nepodařilo načíst. Ověřte, že je v Supabase aplikovaná poslední payment migrace.
        </div>
      ) : rows.length > 0 ? (
        <PaymentsTable payments={rows} timeZone={tenant?.timezone ?? "Europe/Prague"} />
      ) : (
        <EmptyPaymentsState />
      )}
    </section>
  );
}
