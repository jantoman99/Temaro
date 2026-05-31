"use client";

import { useActionState } from "react";

import {
  cancelBookingAction,
  completeBookingAction,
  confirmBookingAction,
  markNoShowAction,
} from "@/app/(dashboard)/calendar/actions";
import { BOOKING_CANCELLATION_REASON_MAX_LENGTH } from "@/lib/booking-form-limits";

const initialState = {
  error: "",
  success: "",
};

const actions = {
  cancel: cancelBookingAction,
  complete: completeBookingAction,
  confirm: confirmBookingAction,
  noShow: markNoShowAction,
};

type BookingStatusAction = keyof typeof actions;

type BookingStatusActionFormProps = {
  action: BookingStatusAction;
  bookingId: string;
  buttonClassName?: string;
  cancellationReason?: boolean;
  className?: string;
  label: string;
  pendingLabel?: string;
  textareaPlaceholder?: string;
};

export function BookingStatusActionForm({
  action,
  bookingId,
  buttonClassName = "border-border",
  cancellationReason = false,
  className = "",
  label,
  pendingLabel = "Ukládám...",
  textareaPlaceholder,
}: BookingStatusActionFormProps) {
  const [state, formAction, isPending] = useActionState(actions[action], initialState);

  return (
    <form action={formAction} className={className}>
      <input type="hidden" name="bookingId" value={bookingId} />
      {cancellationReason ? (
        <label className="grid gap-1 text-sm">
          <span className="text-xs text-muted-foreground">Důvod pro klienta</span>
          <textarea
            name="cancellationReason"
            maxLength={BOOKING_CANCELLATION_REASON_MAX_LENGTH}
            rows={3}
            placeholder={textareaPlaceholder}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none ring-ring/40 focus:ring-3"
          />
        </label>
      ) : null}
      <button
        className={`h-10 rounded-md border px-3 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-60 ${buttonClassName}`}
        disabled={Boolean(state.success) || isPending}
      >
        {isPending ? pendingLabel : label}
      </button>
      {state.error ? (
        <p className="mt-2 text-xs text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="mt-2 text-xs text-emerald-700">{state.success}</p>
      ) : null}
    </form>
  );
}
