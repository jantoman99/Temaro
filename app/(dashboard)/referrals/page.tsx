import { redirect } from "next/navigation";

import { DemoBanner } from "@/components/demo/demo-banner";
import { PageHeader } from "@/components/layouts/page-header";
import { ReferralCodeForm, ReferralProgramForm } from "@/components/referrals/referral-forms";
import { requireOwner } from "@/lib/auth/require-owner";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { hasSupabaseEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type Option = { id: string; name: string };

type ReferralProgram = {
  id: string;
  name: string;
  reward_type: "credit" | "discount" | "manual";
  referrer_reward_amount: number;
  referred_reward_amount: number;
  currency: "CZK" | "EUR";
  max_uses_per_code: number | null;
  is_active: boolean;
  note: string | null;
};

type ReferralCode = {
  id: string;
  code_last4: string;
  label: string | null;
  uses_count: number;
  is_active: boolean;
  referral_programs: { name: string | null; max_uses_per_code: number | null } | null;
  clients: { full_name: string | null; email: string | null; phone: string | null } | null;
};

function ReferralsHeader() {
  return (
    <PageHeader
      description="Doporučovací programy a referral kódy bez marketplace provizí. Kódy se ukládají jen jako hash a poslední 4 znaky."
      eyebrow="Growth"
      title="Referral"
    />
  );
}

function getRewardTypeLabel(value: ReferralProgram["reward_type"]) {
  const labels = {
    credit: "Kredit",
    discount: "Sleva",
    manual: "Ručně",
  };

  return labels[value];
}

function ProgramList({ programs }: { programs: ReferralProgram[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Programy</h2>
      <div className="mt-4 grid gap-3">
        {programs.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není vytvořený žádný referral program.</p>
        ) : (
          programs.map((program) => (
            <article key={program.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{program.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{getRewardTypeLabel(program.reward_type)}</p>
                  {program.note ? <p className="mt-2 text-sm text-muted-foreground">{program.note}</p> : null}
                </div>
                <div className="text-sm font-medium text-muted-foreground sm:text-right">
                  <p>Doporučitel: {formatCurrencyForDisplay(program.referrer_reward_amount, program.currency, 2)}</p>
                  <p>Nový klient: {formatCurrencyForDisplay(program.referred_reward_amount, program.currency, 2)}</p>
                  <p>Limit: {program.max_uses_per_code ?? "bez limitu"}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function CodeList({ codes }: { codes: ReferralCode[] }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-lg font-semibold">Kódy</h2>
      <div className="mt-4 grid gap-3">
        {codes.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">Zatím není vydaný žádný referral kód.</p>
        ) : (
          codes.map((code) => (
            <article key={code.id} className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{code.referral_programs?.name ?? "Program"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Klient: {code.clients?.full_name ?? code.clients?.email ?? code.clients?.phone ?? "Bez klienta"}
                  </p>
                  {code.label ? <p className="mt-2 text-sm text-muted-foreground">{code.label}</p> : null}
                </div>
                <div className="text-sm font-medium text-muted-foreground sm:text-right">
                  <p>Končí na {code.code_last4}</p>
                  <p>Použití: {code.uses_count}/{code.referral_programs?.max_uses_per_code ?? "∞"}</p>
                  <p>{code.is_active ? "Aktivní" : "Vypnutý"}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const demoPrograms: ReferralProgram[] = [
  {
    currency: "CZK",
    id: "demo-referral-program",
    is_active: true,
    max_uses_per_code: 5,
    name: "Doporuč kamaráda",
    note: "Pilotní referral evidence bez automatického uplatnění.",
    referred_reward_amount: 10000,
    referrer_reward_amount: 10000,
    reward_type: "credit",
  },
];

export default async function ReferralsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <ReferralsHeader />
        <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-6">
            <ProgramList programs={demoPrograms} />
            <CodeList codes={[]} />
          </div>
          <div className="grid gap-6">
            <ReferralProgramForm />
            <ReferralCodeForm clients={[]} programs={demoPrograms.map((program) => ({ id: program.id, name: program.name }))} />
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireOwner();

  if ("error" in auth) {
    redirect(auth.error === "Unauthorized" ? "/login" : "/dashboard");
  }

  const [{ data: programs }, { data: codes }, { data: clients }] = await Promise.all([
    auth.supabase
      .from("referral_programs")
      .select("id, name, reward_type, referrer_reward_amount, referred_reward_amount, currency, max_uses_per_code, is_active, note")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
    auth.supabase
      .from("referral_codes")
      .select("id, code_last4, label, uses_count, is_active, referral_programs(name, max_uses_per_code), clients(full_name, email, phone)")
      .eq("tenant_id", auth.tenantId)
      .order("created_at", { ascending: false })
      .limit(50),
    auth.supabase
      .from("clients")
      .select("id, full_name, email, phone")
      .eq("tenant_id", auth.tenantId)
      .is("deleted_at", null)
      .order("full_name", { ascending: true })
      .limit(200),
  ]);

  const programRows = (programs ?? []) as ReferralProgram[];
  const programOptions = programRows.filter((program) => program.is_active).map((program) => ({ id: program.id, name: program.name }));
  const clientOptions: Option[] = (clients ?? []).map((client) => ({
    id: client.id,
    name: client.full_name ?? client.email ?? client.phone ?? "Klient",
  }));

  return (
    <section className="flex flex-col gap-6">
      <ReferralsHeader />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <ProgramList programs={programRows} />
          <CodeList codes={(codes ?? []) as ReferralCode[]} />
        </div>
        <div className="grid gap-6">
          <ReferralProgramForm />
          <ReferralCodeForm clients={clientOptions} programs={programOptions} />
        </div>
      </div>
    </section>
  );
}
