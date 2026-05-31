"use client";

import { useActionState } from "react";

import { createStaffAction } from "@/app/(dashboard)/staff/actions";
import { Button } from "@/components/ui/button";
import { STAFF_BIO_MAX_LENGTH } from "@/lib/staff-form-limits";

const initialState = {
  error: "",
  success: "",
};

const inputClassName =
  "h-11 rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";
const textareaClassName =
  "rounded-md border border-input bg-background px-3 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15";

const days = [
  { value: 0, label: "Po" },
  { value: 1, label: "Út" },
  { value: 2, label: "St" },
  { value: 3, label: "Čt" },
  { value: 4, label: "Pá" },
  { value: 5, label: "So" },
  { value: 6, label: "Ne" },
];

export function StaffForm({ embedded = false }: { embedded?: boolean }) {
  const [state, formAction, isPending] = useActionState(createStaffAction, initialState);

  return (
    <form action={formAction} className={embedded ? "" : "rounded-lg border border-border bg-card p-5 shadow-sm"}>
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Nový profil
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Přidat zaměstnance</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Vytvořte poskytovatele, kterému později přiřadíte služby a účet.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="name">
            Jméno poskytovatele
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            placeholder="Jan Novák"
            className={inputClassName}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            maxLength={STAFF_BIO_MAX_LENGTH}
            rows={3}
            placeholder="Krátký popis pro booking stránku"
            className={textareaClassName}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="color">
              Barva v kalendáři
            </label>
            <input
              id="color"
              name="color"
              type="color"
              defaultValue="#111827"
              className="h-11 rounded-md border border-input bg-background px-2 py-1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="startTime">
              Od
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              defaultValue="09:00"
              className={inputClassName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground" htmlFor="endTime">
              Do
            </label>
            <input
              id="endTime"
              name="endTime"
              type="time"
              required
              defaultValue="17:00"
              className={inputClassName}
            />
          </div>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-foreground">Pracovní dny</legend>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => (
              <label
                key={day.value}
                className="flex cursor-pointer items-center justify-center rounded-md border border-border bg-background px-2 py-2 text-sm font-semibold text-foreground transition has-checked:border-primary/40 has-checked:bg-primary has-checked:text-primary-foreground"
              >
                <input
                  className="sr-only"
                  type="checkbox"
                  name="workingDays"
                  value={day.value}
                  defaultChecked={day.value < 5}
                />
                {day.label}
              </label>
            ))}
          </div>
        </fieldset>
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
      <Button type="submit" size="lg" disabled={isPending} className="mt-5 w-full">
        {isPending ? "Ukládám..." : "Přidat zaměstnance"}
      </Button>
    </form>
  );
}
