"use client";

import Link from "next/link";
import { useState, type CSSProperties, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { getBookingStatusClassName, getBookingStatusLabel } from "@/components/calendar/booking-status";
import { formatTimeForDisplay, getDateKeyForCalendar } from "@/lib/date-format";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  clients: Pick<Database["public"]["Tables"]["clients"]["Row"], "full_name"> | null;
  services: Pick<Database["public"]["Tables"]["services"]["Row"], "name"> | null;
  staff: Pick<Database["public"]["Tables"]["staff"]["Row"], "name" | "color"> | null;
};

type CalendarStaff = Pick<Database["public"]["Tables"]["staff"]["Row"], "id" | "name" | "color">;

type PositionedBooking = {
  booking: Booking;
  top: number;
  height: number;
  left: number;
  width: number;
};
type DragSelection = {
  currentMinutes: number;
  dayKey: string;
  startMinutes: number;
  staffId: string;
};

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 20;
const HOUR_HEIGHT = 84;
const MIN_BOOKING_HEIGHT = 38;
const FALLBACK_STAFF_ID = "unassigned";
const FALLBACK_STAFF_COLOR = "oklch(0.42 0.08 245)";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayName(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "short",
  }).format(date);
}

function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
  }).format(date);
}

function formatTime(value: string, timeZone: string) {
  return formatTimeForDisplay(value, timeZone);
}

function getDayKey(date: Date | string, timeZone: string) {
  return getDateKeyForCalendar(date, timeZone);
}

function getMinutesInTimeZone(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("cs-CZ", {
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    timeZone,
  }).formatToParts(new Date(value));
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");

  return hour * 60 + minute;
}

function createBookingHref(dayKey: string, bookingId: string) {
  return `/calendar?view=team&day=${dayKey}&booking=${bookingId}`;
}

function createDraftBookingHref(dayKey: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("view", "team");
  searchParams.set("day", dayKey);
  searchParams.set("draftStartsAt", `${dayKey}T09:00`);

  return `/calendar?${searchParams.toString()}`;
}

function createDraftBookingHrefForSlot(dayKey: string, staffId: string, startMinutes: number) {
  const searchParams = new URLSearchParams();
  const hour = Math.floor(startMinutes / 60);
  const minute = startMinutes % 60;

  searchParams.set("view", "team");
  searchParams.set("day", dayKey);
  searchParams.set("draftStartsAt", `${dayKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);

  if (staffId !== FALLBACK_STAFF_ID) {
    searchParams.set("draftStaffId", staffId);
  }

  return `/calendar?${searchParams.toString()}`;
}

function getStaffId(booking: Booking) {
  return booking.staff_id || FALLBACK_STAFF_ID;
}

function getStaffForBookings(bookings: Booking[], staff?: CalendarStaff[]): CalendarStaff[] {
  if (staff && staff.length > 0) {
    return [...staff].sort((first, second) => first.name.localeCompare(second.name, "cs-CZ"));
  }

  const staffById = new Map<string, CalendarStaff>();

  for (const booking of bookings) {
    const staffId = getStaffId(booking);

    if (staffById.has(staffId)) {
      continue;
    }

    staffById.set(staffId, {
      id: staffId,
      name: booking.staff?.name ?? "Bez zaměstnance",
      color: booking.staff?.color ?? FALLBACK_STAFF_COLOR,
    });
  }

  if (staffById.size === 0) {
    return [
      {
        id: FALLBACK_STAFF_ID,
        name: "Zaměstnanec",
        color: FALLBACK_STAFF_COLOR,
      },
    ];
  }

  return [...staffById.values()].sort((first, second) => first.name.localeCompare(second.name, "cs-CZ"));
}

function getBookingTop(startsAt: string, timeZone: string) {
  const calendarStart = DAY_START_HOUR * 60;
  const startsAtMinutes = getMinutesInTimeZone(startsAt, timeZone);

  return Math.max(0, ((startsAtMinutes - calendarStart) / 60) * HOUR_HEIGHT);
}

function getBookingHeight(startsAt: string, endsAt: string, timeZone: string) {
  const calendarStart = DAY_START_HOUR * 60;
  const calendarEnd = DAY_END_HOUR * 60;
  const startsAtMinutes = Math.max(calendarStart, getMinutesInTimeZone(startsAt, timeZone));
  const endsAtMinutes = Math.min(calendarEnd, getMinutesInTimeZone(endsAt, timeZone));
  const duration = Math.max(15, endsAtMinutes - startsAtMinutes);

  return Math.max(MIN_BOOKING_HEIGHT, (duration / 60) * HOUR_HEIGHT);
}

function bookingsOverlap(first: PositionedBooking, second: PositionedBooking) {
  const firstEnd = first.top + first.height;
  const secondEnd = second.top + second.height;

  return first.top < secondEnd && second.top < firstEnd;
}

function positionBookings(bookings: Booking[], timeZone: string): PositionedBooking[] {
  const positioned = bookings
    .map((booking) => ({
      booking,
      top: getBookingTop(booking.starts_at, timeZone),
      height: getBookingHeight(booking.starts_at, booking.ends_at, timeZone),
      left: 0,
      width: 100,
    }))
    .sort((first, second) => first.top - second.top || first.height - second.height);

  const clusters: PositionedBooking[][] = [];

  for (const item of positioned) {
    const cluster = clusters.find((currentCluster) =>
      currentCluster.some((clusterItem) => bookingsOverlap(item, clusterItem)),
    );

    if (cluster) {
      cluster.push(item);
    } else {
      clusters.push([item]);
    }
  }

  for (const cluster of clusters) {
    cluster.forEach((item, index) => {
      item.width = 100 / cluster.length;
      item.left = index * item.width;
    });
  }

  return positioned;
}

function getBookingCardStyle({
  color,
  height,
  left,
  top,
  width,
}: {
  color: string;
  height: number;
  left: number;
  top: number;
  width: number;
}): CSSProperties {
  return {
    "--booking-color": color,
    backgroundColor: `color-mix(in srgb, ${color} 18%, white)`,
    borderColor: `color-mix(in srgb, ${color} 52%, var(--border))`,
    borderLeftColor: color,
    borderLeftWidth: 5,
    height,
    left: `calc(${left}% + 4px)`,
    top: top + 3,
    width: `calc(${width}% - 8px)`,
  } as CSSProperties;
}

function roundToQuarterHour(minutes: number) {
  return Math.round(minutes / 15) * 15;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPointerMinutes(event: PointerEvent<HTMLElement>, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const y = clamp(event.clientY - rect.top, 0, rect.height);
  const rawMinutes = DAY_START_HOUR * 60 + (y / HOUR_HEIGHT) * 60;

  return clamp(roundToQuarterHour(rawMinutes), DAY_START_HOUR * 60, DAY_END_HOUR * 60 - 15);
}

function getSelectionBounds(selection: DragSelection) {
  const startMinutes = Math.min(selection.startMinutes, selection.currentMinutes);
  const endMinutes = Math.max(selection.startMinutes, selection.currentMinutes) + 15;
  const top = ((startMinutes - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = Math.max(MIN_BOOKING_HEIGHT, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT);

  return { endMinutes, height, startMinutes, top };
}

function formatMinutesLabel(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function CalendarTeamDay({
  anchorDate,
  bookings,
  canManageBookings = true,
  staff,
  timeZone = "Europe/Prague",
}: {
  anchorDate?: Date;
  bookings: Booking[];
  canManageBookings?: boolean;
  staff?: CalendarStaff[];
  timeZone?: string;
}) {
  const router = useRouter();
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
  const selectedDay = startOfDay(anchorDate ?? new Date());
  const selectedDayKey = getDayKey(selectedDay, timeZone);
  const staffMembers = getStaffForBookings(bookings, staff);
  const calendarHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => DAY_START_HOUR + index);
  const bookingsByDayAndStaff = bookings.reduce<Record<string, Record<string, Booking[]>>>((groups, booking) => {
    const dayKey = getDayKey(booking.starts_at, timeZone);
    const staffId = getStaffId(booking);

    groups[dayKey] = groups[dayKey] ?? {};
    groups[dayKey][staffId] = [...(groups[dayKey][staffId] ?? []), booking];

    return groups;
  }, {});

  function handleSlotPointerDown(event: PointerEvent<HTMLDivElement>, dayKey: string, staffId: string) {
    if (!canManageBookings || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startMinutes = getPointerMinutes(event, event.currentTarget);
    setDragSelection({
      currentMinutes: startMinutes,
      dayKey,
      staffId,
      startMinutes,
    });
  }

  function handleSlotPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragSelection || !canManageBookings) {
      return;
    }

    const currentMinutes = getPointerMinutes(event, event.currentTarget);
    setDragSelection((currentSelection) =>
      currentSelection
        ? {
            ...currentSelection,
            currentMinutes,
          }
        : null,
    );
  }

  function handleSlotPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragSelection || !canManageBookings) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    const { startMinutes } = getSelectionBounds(dragSelection);
    const href = createDraftBookingHrefForSlot(dragSelection.dayKey, dragSelection.staffId, startMinutes);

    setDragSelection(null);
    router.push(href);
  }

  function handleSlotPointerCancel() {
    setDragSelection(null);
  }

  return (
    <div>
      <div className="border-b border-border bg-secondary/35 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Týmový kalendář</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">Den × zaměstnanci</h2>
          </div>
          <p className="nums-tabular rounded-full border border-border bg-card px-3 py-1 text-sm font-semibold text-muted-foreground">
            {formatDayName(selectedDay)} {formatDayNumber(selectedDay)}
          </p>
        </div>
      </div>
      <div className="bg-card">
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-border bg-muted/55 px-4 py-2.5">
          {canManageBookings ? (
            <Link
              href={createDraftBookingHref(selectedDayKey)}
              className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition hover:border-foreground/15 hover:bg-muted"
            >
              <Plus className="size-3.5 stroke-[1.75]" />
              Přidat
            </Link>
          ) : null}
        </div>
        <div className="overflow-x-auto">
          <div
            className="grid min-w-[820px]"
            style={{ gridTemplateColumns: `56px repeat(${staffMembers.length}, minmax(220px, 1fr))` }}
          >
            <div className="border-r border-border bg-muted/20" />
            {staffMembers.map((staffMember) => {
              return (
                <div key={staffMember.id} className="border-r border-border bg-card px-3 py-2 last:border-r-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: staffMember.color ?? FALLBACK_STAFF_COLOR }}
                      aria-hidden="true"
                    />
                    <p className="min-w-0 truncate text-sm font-semibold">{staffMember.name}</p>
                  </div>
                </div>
              );
            })}
            <div className="relative border-r border-border bg-muted/20" style={{ height: calendarHeight }}>
              {hours.slice(0, -1).map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border px-2 pt-1 text-right"
                  style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
                >
                  <span className="nums-tabular font-mono text-[11px] text-muted-foreground">
                    {String(hour).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
            {staffMembers.map((staffMember) => {
              const positionedBookings = positionBookings(bookingsByDayAndStaff[selectedDayKey]?.[staffMember.id] ?? [], timeZone);

              return (
                <div
                  key={`${selectedDayKey}:${staffMember.id}`}
                  className={`relative touch-none border-r border-border bg-[linear-gradient(to_bottom,var(--card),var(--card)),repeating-linear-gradient(135deg,transparent_0,transparent_10px,var(--muted)_10px,var(--muted)_11px)] last:border-r-0 ${
                    canManageBookings ? "cursor-crosshair" : ""
                  }`}
                  style={{ height: calendarHeight }}
                  onPointerCancel={handleSlotPointerCancel}
                  onPointerDown={(event) => handleSlotPointerDown(event, selectedDayKey, staffMember.id)}
                  onPointerMove={handleSlotPointerMove}
                  onPointerUp={handleSlotPointerUp}
                >
                  {hours.slice(0, -1).map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-border"
                      style={{ top: (hour - DAY_START_HOUR) * HOUR_HEIGHT }}
                    />
                  ))}
                  {positionedBookings.map(({ booking, top, height, left, width }) => {
                    const isCompact = height < 54;
                    const isTiny = height < 42;
                    const staffColor = booking.staff?.color ?? FALLBACK_STAFF_COLOR;

                    return (
                      <Link
                        key={booking.id}
                        href={createBookingHref(selectedDayKey, booking.id)}
                        onPointerDown={(event) => event.stopPropagation()}
                        className="absolute z-10 overflow-hidden rounded-md border px-2 py-1 text-xs shadow-sm ring-1 ring-black/[0.02] transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/35"
                        style={getBookingCardStyle({ color: staffColor, height: height - 4, left, top, width })}
                        title={`${formatTime(booking.starts_at, timeZone)} · ${booking.clients?.full_name ?? "Walk-in"} · ${booking.services?.name ?? "Služba"}`}
                      >
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <span className="nums-tabular shrink-0 font-mono text-[11px] font-bold text-foreground">
                            {formatTime(booking.starts_at, timeZone)}
                          </span>
                          {!isTiny ? (
                            <span
                              className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${getBookingStatusClassName(booking.status)}`}
                            >
                              {getBookingStatusLabel(booking.status)}
                            </span>
                          ) : null}
                        </div>
                        <p
                          className={`mt-1 truncate text-[12px] font-bold leading-tight ${
                            booking.status === "cancelled" ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        >
                          {booking.clients?.full_name ?? "Walk-in"}
                        </p>
                        {!isCompact ? (
                          <p className="mt-0.5 truncate text-[11px] font-medium leading-tight text-muted-foreground">
                            {booking.services?.name ?? "Služba"}
                          </p>
                        ) : null}
                      </Link>
                    );
                  })}
                  {dragSelection?.dayKey === selectedDayKey && dragSelection.staffId === staffMember.id ? (
                    <div
                      className="pointer-events-none absolute left-1 right-1 z-20 rounded-md border border-primary/60 bg-primary/15 px-2 py-1 text-xs font-bold text-primary shadow-sm ring-4 ring-primary/10"
                      style={{
                        height: getSelectionBounds(dragSelection).height,
                        top: getSelectionBounds(dragSelection).top,
                      }}
                    >
                      {formatMinutesLabel(getSelectionBounds(dragSelection).startMinutes)} -{" "}
                      {formatMinutesLabel(getSelectionBounds(dragSelection).endMinutes)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
