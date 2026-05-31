"use client";

import { useActionState } from "react";

import { updateCustomDomainAction, verifyCustomDomainAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import { getCustomDomainTxtName } from "@/lib/custom-domain";

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function CustomDomainSettings({
  customDomain,
  status,
  verificationToken,
  verifiedAt,
}: {
  customDomain?: string | null;
  status?: "none" | "pending" | "active";
  verificationToken?: string | null;
  verifiedAt?: string | null;
}) {
  const [updateState, updateAction, isUpdatePending] = useActionState(updateCustomDomainAction, initialState);
  const [verifyState, verifyAction, isVerifyPending] = useActionState(verifyCustomDomainAction, initialState);
  const txtName = customDomain ? getCustomDomainTxtName(customDomain) : "";

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vlastní doména</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Booking na vlastní doméně</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Zákazník může otevřít booking stránku přímo na vaší doméně. Ověření běží přes DNS TXT záznam, aby doménu nemohl připojit cizí tenant.
        </p>
      </div>

      <form action={updateAction} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="grid gap-2 text-sm font-semibold">
          Doména bez `https://`
          <input
            name="customDomain"
            defaultValue={customDomain ?? ""}
            placeholder="rezervace.vasedomena.cz"
            className={inputClassName}
          />
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={isUpdatePending}>
            {isUpdatePending ? "Ukládám..." : customDomain ? "Uložit doménu" : "Přidat doménu"}
          </Button>
        </div>
      </form>

      {updateState.error ? <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">{updateState.error}</p> : null}
      {updateState.success ? <p className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">{updateState.success}</p> : null}

      {customDomain && verificationToken ? (
        <div className="mt-5 rounded-xl border border-border bg-muted/35 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Stav: {status === "active" ? "ověřeno" : "čeká na DNS"}</p>
              {verifiedAt ? <p className="mt-1 text-sm text-muted-foreground">Ověřeno: {new Date(verifiedAt).toLocaleString("cs-CZ")}</p> : null}
            </div>
            <form action={verifyAction}>
              <Button type="submit" variant="secondary" disabled={isVerifyPending || status === "active"}>
                {isVerifyPending ? "Ověřuji..." : "Ověřit DNS"}
              </Button>
            </form>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <div>
              <p className="font-semibold">TXT název</p>
              <code className="mt-1 block break-all rounded-lg bg-background p-3 text-xs">{txtName}</code>
            </div>
            <div>
              <p className="font-semibold">TXT hodnota</p>
              <code className="mt-1 block break-all rounded-lg bg-background p-3 text-xs">{verificationToken}</code>
            </div>
            <p className="text-muted-foreground">
              Po ověření musí doména v DNS směřovat na hosting aplikace. Konkrétní CNAME/A záznam se nastaví podle produkčního hostingu.
            </p>
          </div>
          {verifyState.error ? <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">{verifyState.error}</p> : null}
          {verifyState.success ? <p className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">{verifyState.success}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
