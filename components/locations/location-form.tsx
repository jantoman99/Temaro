"use client";

import { useActionState } from "react";

import { createTenantLocationAction } from "@/app/(dashboard)/locations/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LocationForm() {
  const [state, action, pending] = useActionState(createTenantLocationAction, {});

  return (
    <Card className="grid gap-4" padding="md">
      <form action={action} className="contents">
        <div>
          <p className="text-sm font-semibold">Nová pobočka</p>
          <p className="mt-1 text-sm text-muted-foreground">Základ multi-location evidence před napojením na booking engine.</p>
        </div>
        <label className="grid gap-1 text-sm font-semibold">
          Název
          <Input name="name" required maxLength={120} />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Adresa
          <Input name="address" maxLength={180} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="city" maxLength={90} placeholder="Město" />
          <Input name="postalCode" maxLength={20} placeholder="PSČ" />
          <Input name="countryCode" maxLength={2} defaultValue="CZ" placeholder="CZ" />
        </div>
        <Input name="region" maxLength={90} placeholder="Region/kraj" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="latitude" inputMode="decimal" placeholder="49.1951" />
          <Input name="longitude" inputMode="decimal" placeholder="16.6068" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="phone" maxLength={40} placeholder="+420..." />
          <Input name="email" type="email" maxLength={254} placeholder="pobocka@example.cz" />
        </div>
        <label className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm font-semibold">
          <input type="checkbox" name="isPrimary" className="mt-1 size-4 accent-primary" />
          Nastavit jako primární pobočku
        </label>
        {state.error ? <p className="text-sm font-semibold text-destructive">{state.error}</p> : null}
        {state.success ? <p className="text-sm font-semibold text-success">{state.success}</p> : null}
        <Button type="submit" disabled={pending}>{pending ? "Ukládám..." : "Vytvořit pobočku"}</Button>
      </form>
    </Card>
  );
}
