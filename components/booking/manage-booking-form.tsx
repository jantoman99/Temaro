"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  cancelManagedBookingAction,
  rescheduleManagedBookingAction,
} from "@/app/(booking)/manage/[token]/actions";
import { Button } from "@/components/ui/button";
import type { AvailabilitySlot } from "@/lib/booking/availability";

const initialState = {
  error: "",
  success: "",
};

export function ManageBookingForm({
  cancellationAllowed = true,
  cancellationMessage,
  rescheduleAllowed = true,
  rescheduleMessage,
  slots = [],
  token,
}: {
  cancellationAllowed?: boolean;
  cancellationMessage?: string | null;
  rescheduleAllowed?: boolean;
  rescheduleMessage?: string | null;
  slots?: (AvailabilitySlot & { staffName: string })[];
  token: string;
}) {
  const router = useRouter();
  const [cancelState, cancelAction, isCancelling] = useActionState(cancelManagedBookingAction, initialState);
  const [rescheduleState, rescheduleAction, isRescheduling] = useActionState(
    rescheduleManagedBookingAction,
    initialState,
  );
  const [selectedSlotId, setSelectedSlotId] = useState(slots[0]?.id ?? "");
  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId) ?? slots[0] ?? null;

  useEffect(() => {
    if (cancelState.success) {
      router.replace("/manage/cancelled");
    }
  }, [cancelState.success, router]);

  return (
    <div className="mt-8 grid gap-4">
      <form
        action={rescheduleAction}
        className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
      >
        <input type="hidden" name="token" value={token} />
        <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-accent/10 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Změna termínu
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">Vyberte nový volný čas</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Nabízíme nejbližší dostupné termíny pro stejnou službu.
          </p>
        </div>
        <div className="grid gap-4 p-4 sm:p-5">
          {slots.length > 0 ? (
            <div className="grid max-h-72 gap-2 overflow-y-auto rounded-lg border border-border bg-background/70 p-2">
              {slots.map((slot) => (
                <label
                  key={slot.id}
                  className="group flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card px-3 py-3 text-sm shadow-sm transition hover:border-primary/30 has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground"
                >
                  <input
                    type="radio"
                    name="slotChoice"
                    value={slot.id}
                    checked={selectedSlot?.id === slot.id}
                    onChange={() => setSelectedSlotId(slot.id)}
                    className="mt-1 size-3 accent-primary"
                  />
                  <span className="grid gap-1">
                    <span className="font-medium">{slot.label}</span>
                    <span className="text-xs text-muted-foreground group-has-checked:text-primary-foreground/75">
                      {slot.staffName}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-background/70 px-4 py-5 text-center">
              <p className="text-base font-semibold text-foreground">Žádné volné časy</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Pro tuto rezervaci teď nejsou k dispozici jiné volné termíny.
              </p>
            </div>
          )}
          {selectedSlot ? <input type="hidden" name="staffId" value={selectedSlot.staffId} /> : null}
          {selectedSlot ? <input type="hidden" name="startsAt" value={selectedSlot.startsAt} /> : null}
          {rescheduleState.error ? (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {rescheduleState.error}
            </p>
          ) : null}
          {!rescheduleState.error && rescheduleMessage ? (
            <p className="rounded-md border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
              {rescheduleMessage}
            </p>
          ) : null}
          {rescheduleState.success ? (
            <p className="rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-emerald-800">
              {rescheduleState.success}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-md"
            disabled={!rescheduleAllowed || !selectedSlot || isRescheduling || Boolean(rescheduleState.success)}
          >
            {!rescheduleAllowed
              ? "Změna termínu už nejde"
              : isRescheduling
                ? "Přesouvám rezervaci..."
                : rescheduleState.success
                  ? "Rezervace přesunuta"
                  : "Přesunout rezervaci"}
          </Button>
        </div>
      </form>

      <form
        action={cancelAction}
        className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 shadow-sm sm:p-5"
      >
        <input type="hidden" name="token" value={token} />
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-destructive/80">
            Storno rezervace
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Zrušení je trvalé. Po potvrzení už termín nebude blokovaný v kalendáři.
          </p>
        </div>
        {cancelState.error ? (
          <p className="mb-3 rounded-md border border-destructive/25 bg-card px-4 py-3 text-sm font-medium text-destructive">
            {cancelState.error}
          </p>
        ) : null}
        {!cancelState.error && cancellationMessage ? (
          <p className="mb-3 rounded-md border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
            {cancellationMessage}
          </p>
        ) : null}
        {cancelState.success ? (
          <p className="mb-3 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-emerald-800">
            {cancelState.success}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="destructive"
          size="lg"
          className="w-full rounded-md"
          disabled={!cancellationAllowed || isCancelling || Boolean(cancelState.success)}
        >
          {!cancellationAllowed
            ? "Storno lhůta uplynula"
            : isCancelling
              ? "Ruším rezervaci..."
              : cancelState.success
                ? "Rezervace zrušena"
                : "Zrušit rezervaci"}
        </Button>
      </form>
    </div>
  );
}
