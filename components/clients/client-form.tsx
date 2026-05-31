"use client";

import { useActionState } from "react";

import { createClientAction } from "@/app/(dashboard)/clients/actions";
import { Button } from "@/components/ui/button";
import { CLIENT_NOTES_MAX_LENGTH } from "@/lib/client-form-limits";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";
import { PHONE_INPUT_MAX_LENGTH } from "@/lib/phone-ui";

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";
const textareaClassName =
  "rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function ClientForm({ embedded = false }: { embedded?: boolean }) {
  const [state, formAction, isPending] = useActionState(createClientAction, initialState);

  return (
    <form action={formAction} className={embedded ? "" : "rounded-lg border border-border bg-card p-5 shadow-sm"}>
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Rychlé založení
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Nový klient</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Kontakty a poznámky zůstanou interní v dashboardu.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="fullName">
            Jméno klienta
          </label>
          <input
            id="fullName"
            name="fullName"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Petr Svoboda"
            className={inputClassName}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="phone">
              Telefon
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={PHONE_INPUT_MAX_LENGTH}
              placeholder="+420 777 123 456"
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={EMAIL_INPUT_MAX_LENGTH}
              placeholder="petr@example.com"
              className={inputClassName}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="notes">
            Interní poznámky
          </label>
          <textarea
            id="notes"
            name="notes"
            maxLength={CLIENT_NOTES_MAX_LENGTH}
            rows={4}
            placeholder="Poznámky vidí jen provozovatel."
            className={textareaClassName}
          />
        </div>
      </div>
      {state.error ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending} className="mt-5 w-full">
        {isPending ? "Ukládám..." : "Přidat klienta"}
      </Button>
    </form>
  );
}
