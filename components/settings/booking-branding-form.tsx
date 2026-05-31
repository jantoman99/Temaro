"use client";

import { useActionState } from "react";

import { updateTenantBookingBrandingAction } from "@/app/(dashboard)/settings/actions";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Tenant = Pick<
  Database["public"]["Tables"]["tenants"]["Row"],
  "brand_color" | "cancellation_message" | "confirmation_message" | "cover_image_url" | "logo_url" | "public_description" | "reminder_message"
>;

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";
const textareaClassName =
  "rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function BookingBrandingForm({ tenant }: { tenant: Tenant }) {
  const [state, formAction, isPending] = useActionState(updateTenantBookingBrandingAction, initialState);

  return (
    <form action={formAction} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Branding</p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">Co uvidí zákazník</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
          Nahrajte logo nebo úvodní fotku. Případně lze ponechat přímou URL.
        </p>
      </div>
      <div className="mt-5 grid gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold" htmlFor="publicDescription">
            Krátký veřejný popis
          </label>
          <textarea
            id="publicDescription"
            name="publicDescription"
            maxLength={280}
            rows={3}
            defaultValue={tenant.public_description ?? ""}
            placeholder="Např. Moderní barber studio v centru Brna. Vyberte službu a termín bez telefonování."
            className={textareaClassName}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="logoFile">
              Logo
            </label>
            <input
              id="logoFile"
              name="logoFile"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
            />
            <input
              id="logoUrl"
              name="logoUrl"
              type="url"
              maxLength={500}
              defaultValue={tenant.logo_url ?? ""}
              placeholder="https://..."
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" htmlFor="coverImageFile">
              Úvodní fotka
            </label>
            <input
              id="coverImageFile"
              name="coverImageFile"
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-primary-foreground"
            />
            <input
              id="coverImageUrl"
              name="coverImageUrl"
              type="url"
              maxLength={500}
              defaultValue={tenant.cover_image_url ?? ""}
              placeholder="https://..."
              className={inputClassName}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:max-w-xs">
          <label className="text-sm font-semibold" htmlFor="brandColor">
            Barva podniku
          </label>
          <input
            id="brandColor"
            name="brandColor"
            type="color"
            defaultValue={tenant.brand_color ?? "#635BFF"}
            className="h-11 rounded-md border border-input bg-background px-2 py-1"
          />
        </div>
        <div className="rounded-xl border border-border bg-secondary p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Vlastní texty e-mailů</p>
          <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">
            Krátký podpis nebo instrukce. Temaro k němu vždy přidá termín, službu a bezpečný manage odkaz.
          </p>
          <div className="mt-4 grid gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="confirmationMessage">Text potvrzení</label>
              <textarea
                id="confirmationMessage"
                name="confirmationMessage"
                maxLength={500}
                rows={3}
                defaultValue={tenant.confirmation_message ?? ""}
                placeholder="Např. Přijďte prosím 5 minut předem. Parkování je za rohem."
                className={textareaClassName}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="reminderMessage">Text připomínky</label>
              <textarea
                id="reminderMessage"
                name="reminderMessage"
                maxLength={500}
                rows={3}
                defaultValue={tenant.reminder_message ?? ""}
                placeholder="Např. Pokud víte, že nestíháte, změňte termín přes odkaz v e-mailu."
                className={textareaClassName}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" htmlFor="cancellationMessage">Text zrušení</label>
              <textarea
                id="cancellationMessage"
                name="cancellationMessage"
                maxLength={500}
                rows={3}
                defaultValue={tenant.cancellation_message ?? ""}
                placeholder="Např. Pokud chcete nový termín, rezervujte se znovu přes náš online odkaz."
                className={textareaClassName}
              />
            </div>
          </div>
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
      <Button type="submit" size="lg" disabled={isPending} className="mt-5">
        {isPending ? "Ukládám..." : "Uložit booking stránku"}
      </Button>
    </form>
  );
}
