"use client";

import { useActionState } from "react";

import { createTenantLocationAction } from "@/app/(dashboard)/locations/actions";
import { Button } from "@/components/ui/button";

export function LocationForm() {
  const [state, action, pending] = useActionState(createTenantLocationAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nová pobočka</p>
        <p className="mt-1 text-sm text-muted-foreground">Základ multi-location evidence před napojením na booking engine.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={120} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Adresa
        <input name="address" maxLength={180} className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <input name="city" maxLength={90} placeholder="Město" className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="postalCode" maxLength={20} placeholder="PSČ" className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="countryCode" maxLength={2} defaultValue="CZ" placeholder="CZ" className="rounded-md border border-input bg-background px-3 py-2" />
      </div>
      <input name="region" maxLength={90} placeholder="Region/kraj" className="rounded-md border border-input bg-background px-3 py-2" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="latitude" inputMode="decimal" placeholder="49.1951" className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="longitude" inputMode="decimal" placeholder="16.6068" className="rounded-md border border-input bg-background px-3 py-2" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="phone" maxLength={40} placeholder="+420..." className="rounded-md border border-input bg-background px-3 py-2" />
        <input name="email" type="email" maxLength={254} placeholder="pobocka@example.cz" className="rounded-md border border-input bg-background px-3 py-2" />
      </div>
      <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm font-semibold">
        <input type="checkbox" name="isPrimary" className="mt-1 size-4 accent-primary" />
        Nastavit jako primární pobočku
      </label>
      {state.error ? <p className="text-sm font-semibold text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm font-semibold text-success">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>{pending ? "Ukládám..." : "Vytvořit pobočku"}</Button>
    </form>
  );
}
