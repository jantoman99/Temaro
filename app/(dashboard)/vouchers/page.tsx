import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { CreateVoucherForm, RedeemVoucherForm } from "@/components/vouchers/voucher-forms";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type Voucher = {
  id: string;
  code_last4: string;
  label: string;
  initial_amount: number;
  remaining_amount: number;
  currency: string;
  status: string;
  expires_at: string | null;
  issued_to_name: string | null;
  created_at: string;
};

type VoucherRedemption = {
  id: string;
  amount: number;
  created_at: string;
  note: string | null;
  vouchers: { label: string | null; code_last4: string | null; currency: string | null } | null;
};

const statusLabels: Record<string, string> = {
  active: "Aktivní",
  cancelled: "Zrušený",
  expired: "Propadlý",
  redeemed: "Vyčerpaný",
};

function VouchersHeader() {
  return (
    <PageHeader
      description="Dárkové poukazy a kredity s hashovaným kódem, zůstatkem a auditovaným čerpáním."
      eyebrow="Business suite"
      title="Vouchery"
    />
  );
}

function VoucherSummary({ vouchers }: { vouchers: Voucher[] }) {
  const active = vouchers.filter((voucher) => voucher.status === "active");
  const remaining = active.reduce((sum, voucher) => sum + voucher.remaining_amount, 0);
  const currency = active[0]?.currency ?? "CZK";

  return (
    <section className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Aktivní</p>
        <p className="mt-2 text-2xl font-semibold">{active.length}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Zůstatek</p>
        <p className="mt-2 text-2xl font-semibold">{formatCurrencyForDisplay(remaining, currency, 2)}</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Vystaveno</p>
        <p className="mt-2 text-2xl font-semibold">{vouchers.length}</p>
      </div>
    </section>
  );
}

function VoucherList({ vouchers }: { vouchers: Voucher[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <h2 className="text-lg font-semibold">Vystavené vouchery</h2>
        <p className="mt-1 text-sm text-muted-foreground">Plný kód se neukládá, v seznamu je jen poslední čtveřice.</p>
      </div>
      {vouchers.length === 0 ? (
        <div className="p-8 text-center text-sm font-medium text-muted-foreground">Zatím není vystavený žádný voucher.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Voucher</th>
                <th className="px-4 py-3">Zůstatek</th>
                <th className="px-4 py-3">Původní hodnota</th>
                <th className="px-4 py-3">Platí do</th>
                <th className="px-4 py-3">Stav</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {vouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{voucher.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Kód končí {voucher.code_last4} · {voucher.issued_to_name ?? "Bez jména"}
                    </p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{formatCurrencyForDisplay(voucher.remaining_amount, voucher.currency, 2)}</td>
                  <td className="px-4 py-3">{formatCurrencyForDisplay(voucher.initial_amount, voucher.currency, 2)}</td>
                  <td className="px-4 py-3">{voucher.expires_at ? new Date(voucher.expires_at).toLocaleDateString("cs-CZ") : "Bez expirace"}</td>
                  <td className="px-4 py-3 font-semibold">{statusLabels[voucher.status] ?? voucher.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function RedemptionList({ redemptions }: { redemptions: VoucherRedemption[] }) {
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
                  <p className="font-semibold">{redemption.vouchers?.label ?? "Voucher"}</p>
                  <p className="text-xs text-muted-foreground">
                    Kód končí {redemption.vouchers?.code_last4 ?? "----"} · {new Date(redemption.created_at).toLocaleString("cs-CZ")}
                  </p>
                  {redemption.note ? <p className="mt-1 text-sm text-muted-foreground">{redemption.note}</p> : null}
                </div>
                <p className="font-bold text-destructive">
                  -{formatCurrencyForDisplay(redemption.amount, redemption.vouchers?.currency ?? "CZK", 2)}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoVouchers: Voucher[] = [
  {
    code_last4: "8K2M",
    created_at: new Date().toISOString(),
    currency: "CZK",
    expires_at: null,
    id: "demo-voucher-1",
    initial_amount: 150000,
    issued_to_name: "Demo klient",
    label: "Dárkový poukaz",
    remaining_amount: 100000,
    status: "active",
  },
];

export default async function VouchersPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <VouchersHeader />
        <VoucherSummary vouchers={demoVouchers} />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <VoucherList vouchers={demoVouchers} />
            <RedemptionList redemptions={[]} />
          </div>
          <div className="grid gap-6">
            <CreateVoucherForm />
            <RedeemVoucherForm />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: vouchers }, { data: redemptions }] = await Promise.all([
    auth.supabase
      .from("vouchers")
      .select("id, code_last4, label, initial_amount, remaining_amount, currency, status, expires_at, issued_to_name, created_at")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
    auth.supabase
      .from("voucher_redemptions")
      .select("id, amount, created_at, note, vouchers(label, code_last4, currency)")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <VouchersHeader />
      <VoucherSummary vouchers={(vouchers ?? []) as Voucher[]} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <VoucherList vouchers={(vouchers ?? []) as Voucher[]} />
          <RedemptionList redemptions={(redemptions ?? []) as VoucherRedemption[]} />
        </div>
        <div className="grid gap-6">
          <CreateVoucherForm />
          <RedeemVoucherForm />
        </div>
      </div>
    </section>
  );
}
