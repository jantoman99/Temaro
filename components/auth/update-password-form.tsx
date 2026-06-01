"use client";

import Link from "next/link";
import { useActionState } from "react";

import { updatePasswordAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { PASSWORD_INPUT_MAX_LENGTH } from "@/lib/password-input";

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Nové heslo
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
        <p className="text-sm leading-5 text-muted-foreground">
          Po uložení se z bezpečnostních důvodů znovu přihlásíte.
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
        {isPending ? "Ukládám..." : "Nastavit nové heslo"}
      </Button>
      <p className="text-center text-sm font-medium text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Zpět na přihlášení
        </Link>
      </p>
    </form>
  );
}
