"use client";

import { useActionState } from "react";

import { assignServiceResourceAction, createResourceAction } from "@/app/(dashboard)/resources/actions";
import { Button } from "@/components/ui/button";

type ResourceOption = { id: string; name: string };
type ServiceOption = { id: string; name: string };

function ActionMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>{error ?? success}</p>;
}

export function ResourceForm() {
  const [state, action, pending] = useActionState(createResourceAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nový zdroj</p>
        <p className="mt-1 text-sm text-muted-foreground">Místnost, židle, vybavení nebo jiné kapacitní omezení.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-semibold">
          Typ
          <select name="resourceType" defaultValue="room" className="rounded-md border border-input bg-background px-3 py-2">
            <option value="room">Místnost</option>
            <option value="chair">Židle/stanoviště</option>
            <option value="equipment">Vybavení</option>
            <option value="vehicle">Vozidlo</option>
            <option value="other">Jiné</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Kapacita
          <input name="capacity" inputMode="numeric" defaultValue="1" className="rounded-md border border-input bg-background px-3 py-2" />
        </label>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Popis
        <textarea name="description" rows={3} maxLength={500} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending}>{pending ? "Ukládám..." : "Vytvořit zdroj"}</Button>
    </form>
  );
}

export function ServiceResourceForm({
  resources,
  services,
}: {
  resources: ResourceOption[];
  services: ServiceOption[];
}) {
  const [state, action, pending] = useActionState(assignServiceResourceAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Přiřadit ke službě</p>
        <p className="mt-1 text-sm text-muted-foreground">Připraví kapacitní pravidla pro booking engine.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Služba
        <select name="serviceId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte službu</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Zdroj
        <select name="resourceId" required className="rounded-md border border-input bg-background px-3 py-2">
          <option value="">Vyberte zdroj</option>
          {resources.map((resource) => <option key={resource.id} value={resource.id}>{resource.name}</option>)}
        </select>
      </label>
      <ActionMessage error={state.error} success={state.success} />
      <Button type="submit" disabled={pending || resources.length === 0 || services.length === 0}>
        {pending ? "Přiřazuji..." : "Přiřadit zdroj"}
      </Button>
    </form>
  );
}
