"use client";

import { useActionState } from "react";

import { updateClientAction } from "@/app/(dashboard)/clients/actions";
import { Button } from "@/components/ui/button";
import { CLIENT_NOTES_MAX_LENGTH } from "@/lib/client-form-limits";
import { EMAIL_INPUT_MAX_LENGTH } from "@/lib/email-input";
import { PHONE_INPUT_MAX_LENGTH } from "@/lib/phone-ui";

const initialState = {
  error: "",
  success: "",
};

export function ClientEditForm({
  client,
  staff = [],
}: {
  client: {
    clientTier?: "standard" | "trusted" | "risk";
    email: string | null;
    fullName: string;
    id: string;
    notes: string | null;
    phone: string | null;
    preferenceNotes?: string | null;
    preferredContactChannel?: "any" | "email" | "sms" | "phone";
    preferredStaffId?: string | null;
    preferredTimeOfDay?: "any" | "morning" | "afternoon" | "evening";
  };
  staff?: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(updateClientAction, initialState);

  return (
    <form action={formAction} className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <input type="hidden" name="clientId" value={client.id} />
      <div className="mb-5">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Profil klienta
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">Upravit údaje</h2>
      </div>
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="edit-fullName">
            Jméno klienta
          </label>
          <input
            id="edit-fullName"
            name="fullName"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            defaultValue={client.fullName}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-phone">
              Telefon
            </label>
            <input
              id="edit-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={PHONE_INPUT_MAX_LENGTH}
              defaultValue={client.phone ?? ""}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-email">
              Email
            </label>
            <input
              id="edit-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={EMAIL_INPUT_MAX_LENGTH}
              defaultValue={client.email ?? ""}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="edit-preferredStaffId">
            Oblíbený zaměstnanec
          </label>
          <select
            id="edit-preferredStaffId"
            name="preferredStaffId"
            defaultValue={client.preferredStaffId ?? ""}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
          >
            <option value="">Není nastaveno</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-preferredContactChannel">
              Preferovaný kontakt
            </label>
            <select
              id="edit-preferredContactChannel"
              name="preferredContactChannel"
              defaultValue={client.preferredContactChannel ?? "any"}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
            >
              <option value="any">Bez preference</option>
              <option value="email">E-mail</option>
              <option value="sms">SMS</option>
              <option value="phone">Telefon</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-preferredTimeOfDay">
              Preferovaný čas
            </label>
            <select
              id="edit-preferredTimeOfDay"
              name="preferredTimeOfDay"
              defaultValue={client.preferredTimeOfDay ?? "any"}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
            >
              <option value="any">Bez preference</option>
              <option value="morning">Ráno</option>
              <option value="afternoon">Odpoledne</option>
              <option value="evening">Večer</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium" htmlFor="edit-clientTier">
              Profil klienta
            </label>
            <select
              id="edit-clientTier"
              name="clientTier"
              defaultValue={client.clientTier ?? "standard"}
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
            >
              <option value="standard">Standard</option>
              <option value="trusted">Trusted/VIP</option>
              <option value="risk">Rizikový</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="edit-preferenceNotes">
            Preference klienta
          </label>
          <textarea
            id="edit-preferenceNotes"
            name="preferenceNotes"
            maxLength={500}
            rows={3}
            defaultValue={client.preferenceNotes ?? ""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="edit-notes">
            Interní poznámky
          </label>
          <textarea
            id="edit-notes"
            name="notes"
            maxLength={CLIENT_NOTES_MAX_LENGTH}
            rows={4}
            defaultValue={client.notes ?? ""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none transition focus:bg-card focus:ring-3 focus:ring-ring/30"
          />
        </div>
      </div>
      {state.error ? (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={isPending} className="mt-5 h-11">
        {isPending ? "Ukládám..." : "Uložit klienta"}
      </Button>
    </form>
  );
}
