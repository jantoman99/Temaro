"use client";

import { useActionState } from "react";

import { completePosCheckoutAction } from "@/app/(dashboard)/pos/actions";
import { Button } from "@/components/ui/button";

const initialState = {
  error: "",
  success: "",
};

export function PosCheckoutForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, isPending] = useActionState(completePosCheckoutAction, initialState);

  return (
    <form action={formAction} className="grid gap-3">
      <input type="hidden" name="bookingId" value={bookingId} />
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <select
          name="method"
          defaultValue="cash"
          className="h-10 rounded-md border border-input bg-background px-3 text-sm font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
        >
          <option value="cash">Hotově</option>
          <option value="card_terminal">Karta na místě</option>
          <option value="bank_transfer">Bankovní převod</option>
          <option value="voucher">Voucher</option>
          <option value="other">Jiné</option>
        </select>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Ukládám..." : "Zaevidovat a dokončit"}
        </Button>
      </div>
      <input
        name="note"
        placeholder="Poznámka k platbě"
        maxLength={500}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
      />
      {state.error ? <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm font-semibold text-destructive">{state.error}</p> : null}
      {state.success ? <p className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm font-semibold text-success">{state.success}</p> : null}
    </form>
  );
}
