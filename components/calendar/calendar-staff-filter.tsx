"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { updateStaffColorAction } from "@/app/(dashboard)/staff/actions";

type StaffOption = {
  color?: string | null;
  id: string;
  name: string;
};

const STAFF_COLOR_PALETTE = [
  "#111827",
  "#2563eb",
  "#0f766e",
  "#7c3aed",
  "#b45309",
  "#dc2626",
  "#0891b2",
  "#be185d",
];

function getSelectedStaffIds(value: string | null) {
  return new Set(
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function CalendarStaffFilter({
  staff,
  staffIdsParam,
}: {
  staff: StaffOption[];
  staffIdsParam?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const selectedStaffIds = getSelectedStaffIds(staffIdsParam ?? searchParams.get("staffIds"));
  const allSelected = selectedStaffIds.size === 0;

  function setStaffFilter(nextStaffIds: Set<string>) {
    const nextParams = new URLSearchParams(searchParams);

    nextParams.delete("staffId");

    if (nextStaffIds.size > 0) {
      nextParams.set("staffIds", [...nextStaffIds].sort().join(","));
    } else {
      nextParams.delete("staffIds");
    }

    startTransition(() => {
      router.push(`${pathname}?${nextParams.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2.5 text-sm font-semibold text-foreground transition has-checked:border-primary/40 has-checked:bg-primary/10">
        <input
          type="checkbox"
          checked={allSelected}
          disabled={isPending}
          onChange={() => setStaffFilter(new Set())}
          className="size-4 rounded border-border accent-primary"
        />
        Všichni
      </label>
      {staff.map((member) => {
        const color = member.color ?? "#111827";
        const checked = allSelected || selectedStaffIds.has(member.id);

        return (
          <div key={member.id} className="flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={checked}
                disabled={isPending}
                onChange={(event) => {
                  const nextStaffIds = allSelected ? new Set(staff.map((item) => item.id)) : new Set(selectedStaffIds);

                  if (event.target.checked) {
                    nextStaffIds.add(member.id);
                  } else {
                    nextStaffIds.delete(member.id);
                  }

                  setStaffFilter(nextStaffIds.size === staff.length ? new Set() : nextStaffIds);
                }}
                className="size-4 rounded border-border accent-primary"
              />
              <span className="max-w-28 truncate">{member.name}</span>
            </label>
            <details className="relative">
              <summary className="grid size-5 cursor-pointer place-items-center rounded-full hover:bg-muted">
                <span className="sr-only">Barva</span>
                <span className="size-3 rounded-full ring-2 ring-border" style={{ backgroundColor: color }} aria-hidden="true" />
              </summary>
              <div className="absolute right-0 top-7 z-30 flex w-56 flex-wrap gap-1.5 rounded-lg border border-border bg-card p-2 shadow-lg">
                {STAFF_COLOR_PALETTE.map((paletteColor) => (
                  <form key={paletteColor} action={updateStaffColorAction}>
                    <input type="hidden" name="staffId" value={member.id} />
                    <input type="hidden" name="color" value={paletteColor} />
                    <button
                      type="submit"
                      className="size-7 rounded-md border border-border shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30"
                      style={{ backgroundColor: paletteColor }}
                      aria-label={`Nastavit barvu ${paletteColor}`}
                    />
                  </form>
                ))}
                <form action={updateStaffColorAction} className="flex items-center gap-1.5">
                  <input type="hidden" name="staffId" value={member.id} />
                  <input
                    name="color"
                    type="color"
                    defaultValue={color}
                    className="size-7 cursor-pointer rounded-md border border-border bg-card p-0.5"
                    aria-label={`Vlastní barva pro ${member.name}`}
                  />
                  <button type="submit" className="h-7 rounded-md border border-border bg-card px-2 text-xs font-semibold">
                    Uložit
                  </button>
                </form>
              </div>
            </details>
          </div>
        );
      })}
    </div>
  );
}
