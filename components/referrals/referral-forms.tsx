"use client";

import { useActionState } from "react";

import { createReferralProgramAction, issueReferralCodeAction } from "@/app/(dashboard)/referrals/actions";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string };

function ActionMessage({ code, error, success }: { code?: string; error?: string; success?: string }) {
  if (!error && !success && !code) return null;

  return (
    <div className="grid gap-2">
      {code ? (
        <code className="rounded-md border border-border bg-background px-3 py-2 text-sm font-bold tracking-[0.18em]">
          {code}
        </code>
      ) : null}
      <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>{error ?? success}</p>
    </div>
  );
}

export function ReferralProgramForm() {
  const [state, action, pending] = useActionState(createReferralProgramAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nový referral program</p>
        <p className="mt-1 text-sm text-muted-foreground">Odměny jsou zatím provozní evidence, ne automatický billing.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={140} placeholder="Doporuč kamaráda" className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Typ odměny
          <select name="rewardType" defaultValue="credit" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="credit">Kredit</option>
            <option value="discount">Sleva</option>
            <option value="manual">Ručně</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Měna
          <select name="currency" defaultValue="CZK" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="referrerRewardAmount" inputMode="decimal" placeholder="Odměna doporučitele" className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="referredRewardAmount" inputMode="decimal" placeholder="Odměna nového klienta" className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="maxUsesPerCode" inputMode="numeric" placeholder="Limit použití" className="rounded-md border border-input bg-background px-3 py-2" />
      </div>
      <textarea name="note" rows={3} maxLength={500} placeholder="Interní pravidla programu" className="rounded-md border border-input bg-background px-3 py-2" />
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>{pending ? "Ukládám..." : "Vytvořit program"}</Button>
    </form>
  );
}

export function ReferralCodeForm({
  clients,
  programs,
}: {
  clients: Option[];
  programs: Option[];
}) {
  const [state, action, pending] = useActionState(issueReferralCodeAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Vydat referral kód</p>
        <p className="mt-1 text-sm text-muted-foreground">Celý kód se zobrazí jen jednou. Do databáze se ukládá hash a poslední 4 znaky.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Program
        <select name="programId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte program</option>
          {programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Klient
        <select name="clientId" className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Bez klienta</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
      </label>
      <input name="label" maxLength={140} placeholder="Štítek / kanál" className="rounded-md border border-input bg-background px-3 py-2" />
      <ActionMessage code={state.code} error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || programs.length === 0}>{pending ? "Vydávám..." : "Vydat kód"}</Button>
    </form>
  );
}
