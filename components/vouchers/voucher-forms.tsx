"use client";

import { useActionState } from "react";

import { createVoucherAction, redeemVoucherAction } from "@/app/(dashboard)/vouchers/actions";
import { Button } from "@/components/ui/button";

function ActionMessage({ code, error, success }: { code?: string; error?: string; success?: string }) {
  if (!error && !success) {
    return null;
  }

  return (
    <div className="grid gap-2">
      <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>
        {error ?? success}
      </p>
      {code ? (
        <code className="rounded-md border border-border bg-background px-3 py-2 text-sm font-bold tracking-[0.18em]">
          {code}
        </code>
      ) : null}
    </div>
  );
}

export function CreateVoucherForm() {
  const [state, action, pending] = useActionState(createVoucherAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Vystavit voucher</p>
        <p className="mt-1 text-sm text-muted-foreground">Kód se uloží jen jako hash a zobrazí se pouze po vytvoření.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="label" required maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Částka
          <input name="amount" required inputMode="decimal" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Měna
          <select name="currency" defaultValue="CZK" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Pro koho
          <input name="issuedToName" maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          E-mail
          <input name="issuedToEmail" type="email" maxLength={254} className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Platí do
        <input name="expiresAt" type="date" className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage code={state.code} error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Vystavuji..." : "Vystavit voucher"}
      </Button>
    </form>
  );
}

export function RedeemVoucherForm() {
  const [state, action, pending] = useActionState(redeemVoucherAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Čerpat voucher</p>
        <p className="mt-1 text-sm text-muted-foreground">Čerpání je atomické, takže zůstatek nemůže jít do mínusu.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Kód
        <input name="code" required maxLength={32} className="rounded-md border border-input bg-background px-3 py-2 uppercase tracking-[0.12em]" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Čerpaná částka
        <input name="amount" required inputMode="decimal" className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Čerpám..." : "Vyčerpat voucher"}
      </Button>
    </form>
  );
}
