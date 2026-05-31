"use client";

import { useActionState } from "react";

import { createGroupClassAction, enrollGroupClassAction } from "@/app/(dashboard)/classes/actions";
import { Button } from "@/components/ui/button";

type Option = { id: string; name: string };

function ActionMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>{error ?? success}</p>;
}

export function GroupClassForm({
  locations,
  resources,
  services,
  staff,
}: {
  locations: Option[];
  resources: Option[];
  services: Option[];
  staff: Option[];
}) {
  const [state, action, pending] = useActionState(createGroupClassAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nová skupinová lekce</p>
        <p className="mt-1 text-sm text-muted-foreground">První kapacitní vrstva pro kurzy, lekce a workshopy.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="title" required maxLength={140} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Služba
        <select name="serviceId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte službu</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Začátek
          <input name="startsAt" type="datetime-local" required className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Konec
          <input name="endsAt" type="datetime-local" required className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">
          Kapacita
          <input name="capacity" inputMode="numeric" defaultValue="8" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Cena
          <input name="price" inputMode="decimal" placeholder="350" className="rounded-md border border-input bg-background px-3 py-2" />
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
        <select name="staffId" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Bez člena týmu</option>
          {staff.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="resourceId" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Bez zdroje</option>
          {resources.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select name="locationId" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
          <option value="">Bez pobočky</option>
          {locations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || services.length === 0}>{pending ? "Ukládám..." : "Vytvořit lekci"}</Button>
    </form>
  );
}

export function ClassEnrollmentForm({
  classes,
  clients,
}: {
  classes: Option[];
  clients: Option[];
}) {
  const [state, action, pending] = useActionState(enrollGroupClassAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Přihlásit klienta</p>
        <p className="mt-1 text-sm text-muted-foreground">Kapacita se kontroluje atomicky v databázi.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Lekce
        <select name="groupClassId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte lekci</option>
          {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Klient
        <select name="clientId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte klienta</option>
          {clients.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Poznámka
        <textarea name="note" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || classes.length === 0 || clients.length === 0}>
        {pending ? "Přihlašuji..." : "Přihlásit klienta"}
      </Button>
    </form>
  );
}
