"use client";

import { useActionState } from "react";

import { assignClientPassAction, createPackageAction, redeemClientPassAction } from "@/app/(dashboard)/packages/actions";
import { Button } from "@/components/ui/button";

type ServiceOption = { id: string; name: string };
type ClientOption = { id: string; full_name: string | null; email: string | null; phone: string | null };
type PackageOption = { id: string; name: string; package_type: "sessions" | "credit" };
type ClientPassOption = {
  id: string;
  package_type: "sessions" | "credit";
  remaining_credit: number | null;
  remaining_units: number | null;
  clients: { full_name: string | null } | null;
  service_packages: { name: string | null } | null;
};

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

export function CreatePackageForm({ services }: { services: ServiceOption[] }) {
  const [state, action, pending] = useActionState(createPackageAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nový balíček</p>
        <p className="mt-1 text-sm text-muted-foreground">Permanentka na vstupy nebo kredit v Kč/EUR.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Typ
        <select name="packageType" defaultValue="sessions" className="rounded-md border border-input bg-background px-3 py-2">
          <option value="sessions">Permanentka na vstupy</option>
          <option value="credit">Kreditní balíček</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Služba
        <select name="serviceId" className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Bez vazby na službu</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Počet vstupů
          <input name="totalUnits" inputMode="numeric" placeholder="10" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Kredit
          <input name="creditAmount" inputMode="decimal" placeholder="2500" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
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
        <label className="grid gap-1 text-sm font-semibold">
          Platnost dní
          <input name="validityDays" inputMode="numeric" placeholder="180" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>
        {pending ? "Ukládám..." : "Vytvořit balíček"}
      </Button>
    </form>
  );
}

export function AssignClientPassForm({ clients, packages }: { clients: ClientOption[]; packages: PackageOption[] }) {
  const [state, action, pending] = useActionState(assignClientPassAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Přiřadit klientovi</p>
        <p className="mt-1 text-sm text-muted-foreground">Z nabídky vznikne konkrétní permanentka/kredit klienta.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Balíček
        <select name="packageId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte balíček</option>
          {packages.map((packageOffer) => (
            <option key={packageOffer.id} value={packageOffer.id}>
              {packageOffer.name}
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
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || clients.length === 0 || packages.length === 0}>
        {pending ? "Přiřazuji..." : "Přiřadit"}
      </Button>
    </form>
  );
}

export function RedeemClientPassForm({ clientPasses }: { clientPasses: ClientPassOption[] }) {
  const [state, action, pending] = useActionState(redeemClientPassAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Čerpat permanentku</p>
        <p className="mt-1 text-sm text-muted-foreground">Čerpání běží atomicky a nemůže přečerpat zůstatek.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Permanentka
        <select name="clientPassId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte permanentku</option>
          {clientPasses.map((pass) => (
            <option key={pass.id} value={pass.id}>
              {pass.clients?.full_name ?? "Klient"} · {pass.service_packages?.name ?? "Balíček"}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Typ čerpání
        <select name="usageType" defaultValue="sessions" className="rounded-md border border-input bg-background px-3 py-2">
          <option value="sessions">Vstupy</option>
          <option value="credit">Kredit</option>
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Vstupy
          <input name="unitsUsed" inputMode="numeric" placeholder="1" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Kredit
          <input name="creditUsed" inputMode="decimal" placeholder="500" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || clientPasses.length === 0}>
        {pending ? "Čerpám..." : "Vyčerpat"}
      </Button>
    </form>
  );
}
