"use client";

import { useActionState, useState } from "react";

import { updateStaffAction } from "@/app/(dashboard)/staff/actions";
import { Button } from "@/components/ui/button";
import { STAFF_BIO_MAX_LENGTH } from "@/lib/staff-form-limits";
import type { Database } from "@/types/database";

const initialState = {
  error: "",
  success: "",
};

const days = [
  { value: 0, label: "Po" },
  { value: 1, label: "Út" },
  { value: 2, label: "St" },
  { value: 3, label: "Čt" },
  { value: 4, label: "Pá" },
  { value: 5, label: "So" },
  { value: 6, label: "Ne" },
];

const inputClassName =
  "h-10 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const textareaClassName =
  "rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

type Staff = Database["public"]["Tables"]["staff"]["Row"] & {
  staff_hours: Database["public"]["Tables"]["staff_hours"]["Row"][];
};

export function StaffEditForm({ member }: { member: Staff }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateStaffAction, initialState);
  const workingDays = new Set(member.staff_hours.filter((hour) => hour.is_working).map((hour) => hour.day_of_week));
  const firstWorkingHour = member.staff_hours.find((hour) => hour.is_working) ?? null;

  return (
    <div className="w-full sm:w-auto">
      <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen((value) => !value)}>
        {isOpen ? "Zavřít úpravu" : "Upravit"}
      </Button>

      {isOpen ? (
        <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-border bg-background p-4 text-left shadow-sm sm:min-w-[28rem]">
          <input type="hidden" name="staffId" value={member.id} />

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Jméno poskytovatele</span>
            <input
              name="name"
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
              defaultValue={member.name}
              className={inputClassName}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Bio</span>
            <textarea
              name="bio"
              maxLength={STAFF_BIO_MAX_LENGTH}
              rows={3}
              defaultValue={member.bio ?? ""}
              className={textareaClassName}
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Barva v kalendáři</span>
            <input
              name="color"
              type="color"
              defaultValue={member.color ?? "#111827"}
              className="h-10 rounded-md border border-border bg-card px-2 py-1 shadow-sm"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Od</span>
              <input
                name="startTime"
                type="time"
                required
                defaultValue={firstWorkingHour?.start_time.slice(0, 5) ?? "09:00"}
                className={inputClassName}
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Do</span>
              <input
                name="endTime"
                type="time"
                required
                defaultValue={firstWorkingHour?.end_time.slice(0, 5) ?? "17:00"}
                className={inputClassName}
              />
            </label>
          </div>

          <fieldset className="grid gap-2">
            <legend className="text-sm font-medium text-foreground">Pracovní dny</legend>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day) => (
                <label
                  key={day.value}
                  className="flex cursor-pointer items-center justify-center rounded-md border border-border bg-card px-2 py-2 text-sm font-medium text-foreground transition has-checked:border-primary/40 has-checked:bg-primary has-checked:text-primary-foreground"
                >
                  <input
                    className="sr-only"
                    type="checkbox"
                    name="workingDays"
                    value={day.value}
                    defaultChecked={workingDays.has(day.value)}
                  />
                  {day.label}
                </label>
              ))}
            </div>
          </fieldset>

          {state.error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive">
              {state.error}
            </p>
          ) : null}

          {state.success ? (
            <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success">
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
