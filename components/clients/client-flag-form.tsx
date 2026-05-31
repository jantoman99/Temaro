"use client";

import { useActionState } from "react";

import { toggleClientFlagAction } from "@/app/(dashboard)/clients/actions";
import { Button } from "@/components/ui/button";
import { CLIENT_FLAG_REASON_MAX_LENGTH } from "@/lib/client-form-limits";

const initialState = {
  error: "",
  success: "",
};

export function ClientFlagForm({
  clientId,
  flagReason,
  compact = false,
  isFlagged,
}: {
  clientId: string;
  compact?: boolean;
  flagReason: string | null;
  isFlagged: boolean;
}) {
  const [state, formAction, isPending] = useActionState(toggleClientFlagAction, initialState);

  if (compact) {
    return (
      <details className="relative">
        <summary
          aria-label={isFlagged ? "Upravit flag klienta" : "Flagovat klienta"}
          className="inline-flex h-8 w-12 cursor-pointer list-none items-center justify-center rounded-md border border-border bg-card text-xs font-semibold text-foreground shadow-sm hover:bg-muted"
          title={isFlagged ? "Upravit flag" : "Flag"}
        >
          Flag
        </summary>
        <form action={formAction} className="absolute right-0 top-10 z-30 w-80 rounded-xl border border-border bg-card p-3 shadow-xl">
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="isFlagged" value={isFlagged ? "false" : "true"} />
          <input
            name="flagReason"
            placeholder="Důvod flagu"
            defaultValue={flagReason ?? ""}
            maxLength={CLIENT_FLAG_REASON_MAX_LENGTH}
            className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-4 focus:ring-primary/15"
          />
          <Button type="submit" variant={isFlagged ? "secondary" : "outline"} size="sm" disabled={isPending} className="mt-2 w-full">
            {isPending ? "Ukládám..." : isFlagged ? "Odebrat flag" : "Flagovat"}
          </Button>
          {state.error ? <p className="mt-2 text-xs text-destructive">{state.error}</p> : null}
          {state.success ? <p className="mt-2 text-xs text-emerald-700">{state.success}</p> : null}
        </form>
      </details>
    );
  }

  return (
    <form action={formAction} className="mt-5 grid gap-2 rounded-2xl border border-border bg-muted/40 p-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="isFlagged" value={isFlagged ? "false" : "true"} />
        <input
          name="flagReason"
          placeholder="Důvod flagu, např. opakované no-show"
          defaultValue={flagReason ?? ""}
          maxLength={CLIENT_FLAG_REASON_MAX_LENGTH}
          className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm shadow-sm outline-none transition placeholder:text-muted-foreground focus:bg-card focus:ring-3 focus:ring-ring/30"
        />
        <Button type="submit" variant={isFlagged ? "secondary" : "outline"} size="sm" disabled={isPending}>
          {isPending ? "Ukládám..." : isFlagged ? "Odebrat flag" : "Flagovat"}
        </Button>
      </div>
      {state.error ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs text-emerald-700">{state.success}</p>
      ) : null}
    </form>
  );
}
