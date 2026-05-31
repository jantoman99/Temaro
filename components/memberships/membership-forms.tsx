"use client";

import { useActionState } from "react";

import {
  assignMembershipAction,
  createMembershipPlanAction,
  updateMembershipStatusAction,
} from "@/app/(dashboard)/memberships/actions";
import { Button } from "@/components/ui/button";

type ClientOption = { id: string; full_name: string | null; email: string | null; phone: string | null };
type MembershipPlanOption = { id: string; name: string; billing_period: "monthly" | "quarterly" | "yearly" };

function ActionMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) {
    return null;
  }

  return (
    <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>
      {error ?? success}
    </p>
  );
}

export function CreateMembershipPlanForm() {
  const [state, action, pending] = useActionState(createMembershipPlanAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nový plán členství</p>
        <p className="mt-1 text-sm text-muted-foreground">Evidence opakovaného členství bez automatického strhávání.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">
          Období
          <select name="billingPeriod" defaultValue="monthly" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="monthly">Měsíčně</option>
            <option value="quarterly">Čtvrtletně</option>
            <option value="yearly">Ročně</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Cena
          <input name="price" required inputMode="decimal" className="rounded-md border border-input bg-background px-3 py-2" />
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
          Vstupy v období
          <input name="includedUnits" inputMode="numeric" placeholder="4" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Kredit v období
          <input name="includedCredit" inputMode="decimal" placeholder="1000" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Popis
        <textarea name="description" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Ukládám..." : "Vytvořit plán"}
      </Button>
    </form>
  );
}

export function AssignMembershipForm({
  clients,
  plans,
}: {
  clients: ClientOption[];
  plans: MembershipPlanOption[];
}) {
  const [state, action, pending] = useActionState(assignMembershipAction, {});
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Přiřadit členství</p>
        <p className="mt-1 text-sm text-muted-foreground">Vytvoří aktivní členství s dalším billing datem podle plánu.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Plán
        <select name="membershipPlanId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte plán</option>
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Klient
        <select name="clientId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte klienta</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.full_name ?? client.email ?? client.phone ?? "Klient"}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Začátek
        <input name="startsAt" type="date" defaultValue={today} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || clients.length === 0 || plans.length === 0}>
        {pending ? "Přiřazuji..." : "Přiřadit členství"}
      </Button>
    </form>
  );
}

export function MembershipStatusForm({ membershipId, status }: { membershipId: string; status: string }) {
  const nextStatus = status === "active" ? "paused" : "active";

  return (
    <form action={updateMembershipStatusAction} className="flex gap-2">
      <input type="hidden" name="membershipId" value={membershipId} />
      <button
        type="submit"
        name="status"
        value={nextStatus}
        className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
      >
        {nextStatus === "paused" ? "Pozastavit" : "Aktivovat"}
      </button>
      <button
        type="submit"
        name="status"
        value="cancelled"
        className="rounded-md border border-border px-2 py-1 text-xs font-semibold text-destructive hover:bg-muted"
      >
        Zrušit
      </button>
    </form>
  );
}
