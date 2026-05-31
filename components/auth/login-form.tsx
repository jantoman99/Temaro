"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, signInWithGoogleAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";
import { PASSWORD_INPUT_MAX_LENGTH } from "@/lib/password-input";

const initialState = {
  error: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function LoginForm({
  notice,
  redirectedFrom = "/dashboard",
}: {
  notice?: string | null;
  redirectedFrom?: string;
}) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex w-full flex-col gap-5">
      <form action={signInWithGoogleAction}>
        <input type="hidden" name="redirectedFrom" value={redirectedFrom} />
        <Button type="submit" variant="secondary" size="xl" className="w-full">
          Pokračovat přes Google
        </Button>
      </form>
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        nebo e-mailem
        <span className="h-px flex-1 bg-border" />
      </div>
    <form action={formAction} className="flex w-full flex-col gap-5">
      <input type="hidden" name="redirectedFrom" value={redirectedFrom} />
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
        <p className="text-sm leading-5 text-muted-foreground">
          Použijte e-mail, kterým jste podnik registrovali nebo přijali pozvánku.
        </p>
      </div>
      <div className="flex flex-col gap-2.5">
        <label className="text-sm font-medium text-foreground" htmlFor="password">
          Heslo
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          maxLength={PASSWORD_INPUT_MAX_LENGTH}
          placeholder="Minimálně 8 znaků"
          className={inputClassName}
        />
        <p className="text-sm leading-5 text-muted-foreground">
          Přístup do dashboardu se po přihlášení ověří podle role v podniku.
        </p>
      </div>
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
        {isPending ? "Přihlašuji..." : "Přihlásit se"}
      </Button>
      <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
        Nemáte účet?{" "}
        <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
          Registrovat podnik
        </Link>
      </p>
    </form>
    </div>
  );
}
