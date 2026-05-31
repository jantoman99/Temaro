"use client";

import { useActionState } from "react";

import { upsertCommissionRuleAction } from "@/app/(dashboard)/commissions/actions";
import { Button } from "@/components/ui/button";

type StaffOption = { id: string; name: string };

export function CommissionRuleForm({ staff }: { staff: StaffOption[] }) {
  const [state, action, pending] = useActionState(upsertCommissionRuleAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Provizní pravidlo</p>
        <p className="mt-1 text-sm text-muted-foreground">První provozní odhad provizí podle zaplacených plateb nebo hotových rezervací.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Člen týmu
        <select name="staffId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte člena týmu</option>
          {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Typ pravidla
        <select name="ruleType" defaultValue="percent_paid_revenue" className="rounded-md border border-input bg-background px-3 py-2">
          <option value="percent_paid_revenue">% ze zaplacených plateb</option>
          <option value="fixed_completed_booking">Fix za hotovou rezervaci</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="percent" inputMode="decimal" placeholder="Procento, např. 15" className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="fixedAmount" inputMode="decimal" placeholder="Fixní částka" className="rounded-md border border-input bg-background px-3 py-2" />
        <select name="currency" defaultValue="CZK" className="rounded-md border border-input bg-background px-3 py-2">
          <option value="CZK">CZK</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <textarea name="note" rows={3} maxLength={500} placeholder="Interní poznámka k pravidlu" className="rounded-md border border-input bg-background px-3 py-2" />
      {state.error ? <p className="text-sm font-semibold text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm font-semibold text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending || staff.length === 0}>{pending ? "Ukládám..." : "Uložit pravidlo"}</Button>
    </form>
  );
}
