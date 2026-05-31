"use client";

import { useActionState } from "react";

import { inviteStaffUserAction } from "@/app/(dashboard)/staff/actions";
import { Button } from "@/components/ui/button";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";
import type { Database } from "@/types/database";

type Staff = Pick<Database["public"]["Tables"]["staff"]["Row"], "id" | "name" | "user_id">;

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15 disabled:opacity-50";

export function StaffInviteForm({ embedded = false, staff = [] }: { embedded?: boolean; staff?: Staff[] }) {
  const [state, formAction, isPending] = useActionState(inviteStaffUserAction, initialState);
  const unlinkedStaff = staff.filter((member) => !member.user_id);

  return (
    <form action={formAction} className={embedded ? "" : "rounded-lg border border-border bg-card p-5 shadow-sm"}>
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Přístup do účtu
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Pozvat člena týmu</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Pozvánka propojí existující profil zaměstnance s přihlášením.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="invite-staffId">
            Propojit se zaměstnancem
          </label>
          <select
            id="invite-staffId"
            name="staffId"
            required
            disabled={unlinkedStaff.length === 0}
            className={inputClassName}
          >
            <option value="">Vyberte profil zaměstnance</option>
            {unlinkedStaff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="invite-fullName">
            Jméno uživatele
          </label>
          <input
            id="invite-fullName"
            name="fullName"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Jan Novák"
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="invite-email">
            Email
          </label>
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={EMAIL_INPUT_MAX_LENGTH}
            placeholder="jan@example.com"
            className={inputClassName}
          />
        </div>
      </div>
      {state.error ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="outline" size="lg" disabled={isPending || unlinkedStaff.length === 0} className="mt-5 w-full">
        {isPending ? "Odesílám..." : "Pozvat do účtu"}
      </Button>
      {unlinkedStaff.length === 0 ? (
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Nejdřív vytvořte zaměstnance bez připojeného účtu.
        </p>
      ) : null}
    </form>
  );
}
