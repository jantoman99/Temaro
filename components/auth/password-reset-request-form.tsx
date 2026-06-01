"use client";

import Link from "next/link";
import { useActionState } from "react";

import { requestPasswordResetAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function PasswordResetRequestForm() {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium text-foreground" htmlFor="email">
          E-mail
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
        <p className="text-sm leading-5 text-muted-foreground">
          Pošleme vám bezpečný odkaz pro nastavení nového hesla.
        </p>
      </div>
      {state.error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium leading-6 text-red-700">
          {state.error}
        </p>
      ) : state.success ? (
        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm font-medium leading-6 text-green-800">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="xl" disabled={isPending} className="w-full">
        {isPending ? "Odesílám..." : "Poslat odkaz"}
      </Button>
      <p className="text-center text-sm font-medium text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Zpět na přihlášení
        </Link>
      </p>
    </form>
  );
}
