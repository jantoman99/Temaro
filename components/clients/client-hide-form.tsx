"use client";

import { useActionState } from "react";

import { hideClientAction } from "@/app/(dashboard)/clients/actions";
import { Button } from "@/components/ui/button";

const initialState = {
  error: "",
  success: "",
};

export function ClientHideForm({ clientId, compact = false }: { clientId: string; compact?: boolean }) {
  const [state, formAction, isPending] = useActionState(hideClientAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <input type="hidden" name="clientId" value={clientId} />
      <Button type="submit" variant="outline" size={compact ? "sm" : "sm"} disabled={isPending} aria-label="Skrýt klienta">
        {isPending ? "..." : "Skrýt"}
      </Button>
      {state.error ? (
        <p className="max-w-56 text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
