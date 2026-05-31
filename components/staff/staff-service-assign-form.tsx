"use client";

import { useActionState } from "react";

import { assignStaffServiceAction } from "@/app/(dashboard)/staff/actions";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];

const initialState = {
  error: "",
  success: "",
};

export function StaffServiceAssignForm({ services, staffId }: { services: Service[]; staffId: string }) {
  const [state, formAction, isPending] = useActionState(assignStaffServiceAction, initialState);

  return (
    <form action={formAction} className="mt-3 grid gap-2">
      <div className="flex gap-2">
        <input type="hidden" name="staffId" value={staffId} />
        <select
          name="serviceId"
          className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-card px-3 text-sm shadow-sm outline-none transition focus:ring-3 focus:ring-primary/25"
          disabled={isPending}
        >
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          {isPending ? "Přiřazuji..." : "Přiřadit"}
        </Button>
      </div>
      {state.error ? (
        <p className="text-xs font-medium text-destructive">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-xs font-medium text-success">{state.success}</p>
      ) : null}
    </form>
  );
}
