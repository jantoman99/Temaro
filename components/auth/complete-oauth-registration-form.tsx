"use client";

import { useActionState } from "react";

import { completeOAuthBusinessRegistrationAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";

const initialState = {
  error: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

type CompleteOAuthRegistrationFormProps = {
  defaultFullName?: string;
  email: string;
};

export function CompleteOAuthRegistrationForm({
  defaultFullName = "",
  email,
}: CompleteOAuthRegistrationFormProps) {
  const [state, formAction, isPending] = useActionState(completeOAuthBusinessRegistrationAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <p className="rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium leading-6 text-primary">
        Přihlášení proběhlo přes {email}. Teď založíme podnik a otevřeme průvodce nastavením.
      </p>
      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium text-foreground" htmlFor="businessName">
          Název podniku
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          autoComplete="organization"
          required
          minLength={2}
          maxLength={100}
          placeholder="Studio Magnolia"
          className={inputClassName}
        />
        <p className="text-sm leading-5 text-muted-foreground">
          Název se použije v administraci a později na veřejné rezervační stránce.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium text-foreground" htmlFor="fullName">
          Jméno vlastníka
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={100}
          defaultValue={defaultFullName}
          placeholder="Jana Nováková"
          className={inputClassName}
        />
        <p className="text-sm leading-5 text-muted-foreground">
          Tento účet bude spravovat služby, tým a nastavení podniku.
        </p>
      </div>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium leading-6 text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="xl" disabled={isPending} className="w-full">
        {isPending ? "Zakládám podnik..." : "Dokončit registraci"}
      </Button>
    </form>
  );
}
