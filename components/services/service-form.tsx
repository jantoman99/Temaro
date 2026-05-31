"use client";

import { useActionState } from "react";

import { createServiceAction } from "@/app/(dashboard)/services/actions";
import { Button } from "@/components/ui/button";
import { getSafeCurrency } from "@/lib/currency";
import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";
import type { ServiceTemplate } from "@/lib/service-templates";
import {
  SERVICE_DESCRIPTION_MAX_LENGTH,
  SERVICE_NAME_MAX_LENGTH,
  SERVICE_TIME_STEP_MINUTES,
} from "@/lib/service-form-limits";

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";
const textareaClassName =
  "rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

export function ServiceForm({
  defaultCurrency = "CZK",
  embedded = false,
  initialTemplate = null,
}: {
  defaultCurrency?: string | null;
  embedded?: boolean;
  initialTemplate?: ServiceTemplate | null;
}) {
  const [state, formAction, isPending] = useActionState(createServiceAction, initialState);

  return (
    <form action={formAction} className={embedded ? "" : "rounded-lg border border-border bg-card p-5 shadow-sm"}>
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nabídka
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Nová služba</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Cena se uloží bezpečně v haléřích nebo centech.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground" htmlFor="name">
            Název služby
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={SERVICE_NAME_MAX_LENGTH}
            placeholder="Střih + úprava vousu"
            defaultValue={initialTemplate?.name ?? ""}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium text-foreground" htmlFor="description">
            Popis
          </label>
          <textarea
            id="description"
            name="description"
            maxLength={SERVICE_DESCRIPTION_MAX_LENGTH}
            rows={3}
            placeholder="Krátký popis pro booking stránku"
            defaultValue={initialTemplate?.description ?? ""}
            className={textareaClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="durationMinutes">
            Délka v minutách
          </label>
          <input
            id="durationMinutes"
            name="durationMinutes"
            type="number"
            inputMode="numeric"
            min={5}
            max={1440}
            step={SERVICE_TIME_STEP_MINUTES}
            required
            defaultValue={initialTemplate?.durationMinutes ?? 45}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="bufferMinutes">
            Buffer po službě
          </label>
          <input
            id="bufferMinutes"
            name="bufferMinutes"
            type="number"
            inputMode="numeric"
            min={0}
            max={240}
            step={SERVICE_TIME_STEP_MINUTES}
            defaultValue={initialTemplate?.bufferMinutes ?? 0}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="price">
            Cena
          </label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            required
            maxLength={PRICE_INPUT_MAX_LENGTH}
            placeholder="450"
            defaultValue={initialTemplate?.price ?? ""}
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="currency">
            Měna
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={getSafeCurrency(defaultCurrency)}
            className={inputClassName}
          >
            <option value="CZK">CZK</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="depositType">
            Záloha
          </label>
          <select id="depositType" name="depositType" defaultValue="none" className={inputClassName}>
            <option value="none">Bez zálohy</option>
            <option value="fixed">Fixní částka</option>
            <option value="percent">Procento z ceny</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="depositValue">
            Hodnota zálohy
          </label>
          <input
            id="depositValue"
            name="depositValue"
            inputMode="decimal"
            maxLength={PRICE_INPUT_MAX_LENGTH}
            placeholder="100 nebo 30"
            className={inputClassName}
          />
          <p className="text-xs leading-5 text-muted-foreground">
            U fixní částky zadejte částku v měně služby, u procent celé číslo 1-100.
          </p>
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
        {isPending ? "Ukládám..." : "Přidat službu"}
      </Button>
    </form>
  );
}
