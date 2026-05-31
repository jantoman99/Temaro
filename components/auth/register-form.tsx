"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction, registerWithGoogleAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";
import { PASSWORD_INPUT_MAX_LENGTH } from "@/lib/password-input";

const initialState = {
  error: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function RegisterForm({ notice }: { notice?: string | null }) {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2.5 sm:col-span-2">
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
            Tento název se použije v dashboardu a později na veřejné booking stránce.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:col-span-2">
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
            placeholder="Jana Nováková"
            className={inputClassName}
          />
          <p className="text-sm leading-5 text-muted-foreground">
            Owner účet bude mít oprávnění spravovat služby, tým a nastavení podniku.
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={EMAIL_INPUT_MAX_LENGTH}
            required
            placeholder="vy@podnik.cz"
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2.5">
          <label className="text-sm font-medium text-foreground" htmlFor="password">
            Heslo
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={PASSWORD_INPUT_MAX_LENGTH}
            placeholder="Minimálně 8 znaků"
            className={inputClassName}
          />
        </div>
      </div>
      <p className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2.5 text-sm font-medium leading-6 text-primary">
        Po registraci vznikne nový tenant a váš účet dostane owner roli. Další data se
        budou ukládat odděleně pro váš podnik.
      </p>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium leading-6 text-red-700">
          {state.error}
        </p>
      ) : notice ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-medium leading-6 text-amber-800">
          {notice}
        </p>
      ) : null}
      <Button type="submit" size="xl" disabled={isPending} className="w-full">
        {isPending ? "Vytvářím účet..." : "Vytvořit podnik"}
      </Button>
      <Button type="submit" formAction={registerWithGoogleAction} formNoValidate variant="secondary" size="xl" className="w-full">
        Vytvořit podnik přes Google
      </Button>
      <p className="text-center text-xs font-medium leading-5 text-muted-foreground">
        U Google registrace stačí vyplnit název podniku a jméno vlastníka. Tenant vznikne až po úspěšném ověření Google účtu.
      </p>
      <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
        Už máte účet?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Přihlásit se
        </Link>
      </p>
    </form>
  );
}
