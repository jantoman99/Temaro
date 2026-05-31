"use client";

import { useActionState } from "react";

import { hideStaffAction } from "@/app/(dashboard)/staff/actions";
import { Button } from "@/components/ui/button";

const initialState = {
  error: "",
  success: "",
};

export function StaffHideForm({ staffId }: { staffId: string }) {
  const [state, formAction, isPending] = useActionState(hideStaffAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="staffId" value={staffId} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending} className="rounded-xl">
        {isPending ? "Skrývám..." : "Skrýt"}
      </Button>
      {state.error ? (
        <p className="max-w-56 text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
