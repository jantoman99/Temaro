"use client";

import { useActionState } from "react";

import { createStarterServicesAction } from "@/app/(dashboard)/services/actions";
import type { ServiceTemplate } from "@/lib/service-templates";

const initialState = {
  error: "",
  success: "",
};

export function StarterServicesForm({ templates }: { templates: ServiceTemplate[] }) {
  const [state, formAction, isPending] = useActionState(createStarterServicesAction, initialState);

  return (
    <form action={formAction} className="border-t border-border bg-primary/10 p-4 md:p-5 lg:border-l lg:border-t-0">
      <p className="text-sm font-semibold text-foreground">Přidat tři služby najednou</p>
      <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
        Pro první spuštění stačí základní nabídka. Po uložení můžete ceny i délky upravit.
      </p>
      <div className="mt-3 grid gap-2">
        {templates.map((template) => (
          <label key={template.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm">
            <input type="checkbox" name="templateIds" value={template.id} defaultChecked className="h-4 w-4 accent-primary" />
            <span>{template.name}</span>
          </label>
        ))}
      </div>
      {state.error ? (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.success}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Přidávám..." : "Přidat doporučené služby"}
      </button>
    </form>
  );
}
