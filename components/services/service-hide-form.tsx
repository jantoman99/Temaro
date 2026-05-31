"use client";

import { useActionState } from "react";

import { hideServiceAction } from "@/app/(dashboard)/services/actions";
import { Button } from "@/components/ui/button";

const initialState = {
  error: "",
  success: "",
};

export function ServiceHideForm({ serviceId }: { serviceId: string }) {
  const [state, formAction, isPending] = useActionState(hideServiceAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="serviceId" value={serviceId} />
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        {isPending ? "Skrývám..." : "Skrýt"}
      </Button>
      {state.error ? (
        <p className="max-w-56 text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
