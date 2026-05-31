"use client";

import { useActionState } from "react";

import { removeStaffServiceAction } from "@/app/(dashboard)/staff/actions";
import { Button } from "@/components/ui/button";

const initialState = {
  error: "",
  success: "",
};

export function StaffServiceRemoveForm({
  serviceId,
  serviceName,
  staffId,
}: {
  serviceId: string;
  serviceName: string;
  staffId: string;
}) {
  const [state, formAction, isPending] = useActionState(removeStaffServiceAction, initialState);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="staffId" value={staffId} />
      <input type="hidden" name="serviceId" value={serviceId} />
      <Button type="submit" variant="secondary" size="sm" disabled={isPending}>
        {isPending ? `${serviceName}...` : `${serviceName} ×`}
      </Button>
      {state.error ? (
        <p className="max-w-56 text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  );
}
