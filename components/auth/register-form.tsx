"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  registerAction,
  registerWithAppleAction,
  registerWithFacebookAction,
  registerWithGoogleAction,
} from "@/app/(auth)/actions";
import { SocialProviderIcon } from "@/components/auth/social-provider-icon";
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
      <div className="grid gap-3">
        <Button
          type="submit"
          formAction={registerWithGoogleAction}
          formNoValidate
          size="xl"
          className="w-full border-[#dadce0] bg-white text-[#1f1f1f] shadow-sm hover:bg-[#f8fafd]"
        >
          <SocialProviderIcon provider="google" className="size-5" />
          Pokračovat přes Google
        </Button>
        <Button
          type="submit"
          formAction={registerWithFacebookAction}
          formNoValidate
          size="xl"
          className="w-full border-[#1877f2] bg-[#1877f2] text-white shadow-sm hover:bg-[#166fe5]"
        >
          <SocialProviderIcon provider="facebook" className="size-5" />
          Pokračovat přes Facebook
        </Button>
        <Button
          type="submit"
          formAction={registerWithAppleAction}
          formNoValidate
          size="xl"
          className="w-full border-black bg-black text-white shadow-sm hover:bg-black/90"
        >
          <SocialProviderIcon provider="apple" className="size-5" />
          Pokračovat přes Apple
        </Button>
      </div>
      <p className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm font-medium leading-6 text-muted-foreground">
        Podnik doplníte až po ověření účtu. Google už je aktivní, Facebook a Apple zapneme po doplnění providerů.
      </p>
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        nebo e-mailem
        <span className="h-px flex-1 bg-border" />
      </div>
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
            Tento název se použije v přehledu provozu a později na veřejné rezervační stránce.
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
            Tento účet bude spravovat služby, tým a nastavení podniku.
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
        Po registraci vás pošleme do průvodce, kde nastavíte služby, tým a veřejnou rezervační stránku.
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
      <p className="rounded-lg bg-muted px-4 py-3 text-center text-sm font-medium text-muted-foreground">
        Už máte účet?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Přihlásit se
        </Link>
      </p>
    </form>
  );
}
