"use client";

import { useActionState } from "react";

import { createStaffExceptionAction } from "@/app/(dashboard)/staff/actions";
import { Button } from "@/components/ui/button";
import { STAFF_EXCEPTION_NOTE_MAX_LENGTH } from "@/lib/staff-form-limits";

const initialState = {
  error: "",
  success: "",
};
const fieldClassName = "h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15";

export function StaffExceptionForm({ staffId }: { staffId: string }) {
  const [state, formAction, isPending] = useActionState(createStaffExceptionAction, initialState);

  return (
    <form action={formAction} className="mt-3 grid gap-2 sm:grid-cols-2">
      <input type="hidden" name="staffId" value={staffId} />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor={`exception-date-${staffId}`}>
          Datum
        </label>
        <input
          id={`exception-date-${staffId}`}
          name="date"
          type="date"
          required
          className={fieldClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor={`exception-type-${staffId}`}>
          Typ
        </label>
        <select
          id={`exception-type-${staffId}`}
          name="isWorking"
          defaultValue="false"
          className={fieldClassName}
        >
          <option value="false">Volno</option>
          <option value="true">Speciální hodiny</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor={`exception-start-${staffId}`}>
          Od
        </label>
        <input
          id={`exception-start-${staffId}`}
          name="startTime"
          type="time"
          className={fieldClassName}
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground" htmlFor={`exception-end-${staffId}`}>
          Do
        </label>
        <input
          id={`exception-end-${staffId}`}
          name="endTime"
          type="time"
          className={fieldClassName}
        />
      </div>
      <input
        name="note"
        placeholder="Poznámka"
        maxLength={STAFF_EXCEPTION_NOTE_MAX_LENGTH}
        className={`${fieldClassName} sm:col-span-2`}
      />
      {state.error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive sm:col-span-2">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm font-medium text-success sm:col-span-2">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" variant="outline" size="sm" disabled={isPending} className="sm:col-span-2">
        {isPending ? "Ukládám..." : "Přidat výjimku"}
      </Button>
    </form>
  );
}
