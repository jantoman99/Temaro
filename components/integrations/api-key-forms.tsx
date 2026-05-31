"use client";

import { useActionState } from "react";

import { createTenantApiKeyAction, revokeTenantApiKeyAction } from "@/app/(dashboard)/integrations/actions";
import { Button } from "@/components/ui/button";

function ActionMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;

  return <p className={error ? "text-sm font-semibold text-destructive" : "text-sm font-semibold text-success"}>{error ?? success}</p>;
}

export function ApiKeyCreateForm() {
  const [state, action, pending] = useActionState(createTenantApiKeyAction, {});

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">Nový API klíč</p>
        <p className="mt-1 text-sm text-muted-foreground">Klíč je read-only pro budoucí partnery. Raw token se zobrazí jen jednou.</p>
      </div>
      <label className="grid gap-1 text-sm font-semibold">
        Název
        <input name="name" required maxLength={80} placeholder="Např. CRM integrace" className="rounded-md border border-input bg-background px-3 py-2" />
      </label>
      <ActionMessage error={state.error} success={state.success} />
      {state.token ? (
        <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm">
          <p className="font-semibold">Uložte si token teď. Později už nepůjde zobrazit.</p>
          <code className="mt-2 block break-all rounded-md bg-background px-3 py-2 text-xs">{state.token}</code>
        </div>
      ) : null}
      <Button type="submit" disabled={pending}>{pending ? "Vytvářím..." : "Vytvořit API klíč"}</Button>
    </form>
  );
}

export function ApiKeyRevokeForm({ keyId, revoked }: { keyId: string; revoked: boolean }) {
  const [state, action, pending] = useActionState(revokeTenantApiKeyAction, {});

  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="keyId" value={keyId} />
      <Button type="submit" variant="outline" disabled={pending || revoked}>
        {revoked ? "Odvoláno" : pending ? "Odvolávám..." : "Odvolat"}
      </Button>
      <ActionMessage error={state.error} success={state.success} />
    </form>
  );
}
