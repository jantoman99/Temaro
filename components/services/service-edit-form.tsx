"use client";

import { useActionState, useState } from "react";

import { updateServiceAction } from "@/app/(dashboard)/services/actions";
import { Button } from "@/components/ui/button";
import { getSafeCurrency } from "@/lib/currency";
import { PRICE_INPUT_MAX_LENGTH } from "@/lib/price-input";
import {
  isServiceTimeStepAligned,
  SERVICE_DESCRIPTION_MAX_LENGTH,
  SERVICE_NAME_MAX_LENGTH,
  SERVICE_TIME_STEP_MINUTES,
} from "@/lib/service-form-limits";
import type { Database } from "@/types/database";

const initialState = {
  error: "",
  success: "",
};

type Service = Database["public"]["Tables"]["services"]["Row"];

function formatPriceForInput(price: number) {
  return (price / 100).toFixed(2).replace(".", ",");
}

function formatDepositValueForInput(service: Service) {
  if (service.deposit_type === "fixed") {
    return formatPriceForInput(service.deposit_value);
  }

  if (service.deposit_type === "percent") {
    return String(service.deposit_value);
  }

  return "";
}

export function ServiceEditForm({ service }: { service: Service }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateServiceAction, initialState);
  const durationStep = isServiceTimeStepAligned(service.duration_minutes) ? SERVICE_TIME_STEP_MINUTES : 1;
  const bufferStep = isServiceTimeStepAligned(service.buffer_minutes) ? SERVICE_TIME_STEP_MINUTES : 1;

  return (
    <div className="w-full sm:w-auto">
      <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Zavřít úpravu" : "Upravit"}
      </Button>

      {isOpen ? (
        <form
          action={formAction}
          className="mt-4 grid gap-3 rounded-lg border border-border bg-muted/40 p-4 text-left shadow-sm sm:min-w-[28rem]"
        >
          <input type="hidden" name="serviceId" value={service.id} />

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Název služby</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={SERVICE_NAME_MAX_LENGTH}
              defaultValue={service.name}
              className="h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Popis</span>
            <textarea
              name="description"
              maxLength={SERVICE_DESCRIPTION_MAX_LENGTH}
              rows={3}
              defaultValue={service.description ?? ""}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Délka v minutách</span>
              <input
                name="durationMinutes"
                type="number"
                inputMode="numeric"
                min={5}
                max={1440}
                step={durationStep}
                required
                defaultValue={service.duration_minutes}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Buffer po službě</span>
              <input
                name="bufferMinutes"
                type="number"
                inputMode="numeric"
                min={0}
                max={240}
                step={bufferStep}
                defaultValue={service.buffer_minutes}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Cena</span>
              <input
                name="price"
                inputMode="decimal"
                required
                maxLength={PRICE_INPUT_MAX_LENGTH}
                defaultValue={formatPriceForInput(service.price)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Měna</span>
              <select
                name="currency"
                defaultValue={getSafeCurrency(service.currency)}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
              >
                <option value="CZK">CZK</option>
                <option value="EUR">EUR</option>
              </select>
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Záloha</span>
              <select
                name="depositType"
                defaultValue={service.deposit_type}
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
              >
                <option value="none">Bez zálohy</option>
                <option value="fixed">Fixní částka</option>
                <option value="percent">Procento z ceny</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Hodnota zálohy</span>
              <input
                name="depositValue"
                inputMode="decimal"
                maxLength={PRICE_INPUT_MAX_LENGTH}
                defaultValue={formatDepositValueForInput(service)}
                placeholder="100 nebo 30"
                className="h-10 rounded-lg border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-ring/30"
              />
            </label>
          </div>

          {state.error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
              {state.success}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Ukládám..." : "Uložit změny"}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Zrušit
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
