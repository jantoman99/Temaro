"use client";

import Link from "next/link";
import { useState, type CSSProperties, type PointerEvent } from "react";
import { useRouter } from "next/navigation";

import { getBookingStatusClassName, getBookingStatusLabel } from "@/components/calendar/booking-status";
import { formatTimeForDisplay, getDateKeyForCalendar } from "@/lib/date-format";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  clients: Pick<Database["public"]["Tables"]["clients"]["Row"], "full_name"> | null;
  services: Pick<Database["public"]["Tables"]["services"]["Row"], "name"> | null;
  staff: Pick<Database["public"]["Tables"]["staff"]["Row"], "name" | "color"> | null;
};

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
};

const DAY_MS = 24 * 60 * 60 * 1000;
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 20;
const HOUR_HEIGHT = 84;
const MIN_BOOKING_HEIGHT = 38;
const FALLBACK_STAFF_COLOR = "oklch(0.42 0.08 245)";

function startOfWeek(date: Date) {
  const value = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = value.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + mondayOffset);
  return value;
}

function formatDayName(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", { weekday: "short" }).format(date);
}

function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "numeric" }).format(date);
}

function formatWeekRange(days: Date[]) {
  const firstDay = days[0];
  const lastDay = days[days.length - 1];

  if (!firstDay || !lastDay) {
    return "";
  }

  return `${formatDayNumber(firstDay)} - ${formatDayNumber(lastDay)}`;
}

function getRangeLabel(daysCount: number) {
  if (daysCount === 1) {
    return "Denní kalendář";
  }

  return daysCount === 3 ? "Rozsah 3 dny" : "Týdenní kalendář";
}

function getGridMinWidth(daysCount: number) {
  if (daysCount === 1) {
    return "560px";
  }

  return daysCount === 3 ? "760px" : "980px";
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

function createBookingHref(dayKey: string, bookingId: string, range: "day" | "3days" | "week") {
  const view = range === "day" ? "day" : "week";

  return `/calendar?view=${view}&range=${range}&day=${dayKey}&booking=${bookingId}`;
}

function createDraftBookingHref(dayKey: string, startMinutes: number, range: "day" | "3days" | "week") {
  const searchParams = new URLSearchParams();
  const hour = Math.floor(startMinutes / 60);
  const minute = startMinutes % 60;

  searchParams.set("view", range === "day" ? "day" : "week");
  searchParams.set("range", range);
  searchParams.set("day", dayKey);
  searchParams.set("draftStartsAt", `${dayKey}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);

  return `/calendar?${searchParams.toString()}`;
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

export function CalendarWeek({
  anchorDate,
  bookings,
  canManageBookings = true,
  daysCount = 7,
  timeZone = "Europe/Prague",
}: {
  anchorDate?: Date;
  bookings: Booking[];
  canManageBookings?: boolean;
  daysCount?: 1 | 3 | 7;
  staff?: Pick<Database["public"]["Tables"]["staff"]["Row"], "id" | "name" | "color">[];
  timeZone?: string;
}) {
  const router = useRouter();
  const [dragSelection, setDragSelection] = useState<DragSelection | null>(null);
  const range = daysCount === 1 ? "day" : daysCount === 3 ? "3days" : "week";
  const selectedDate = anchorDate ?? new Date();
  const firstDay =
    daysCount === 1 || daysCount === 3
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())
      : startOfWeek(selectedDate);
  const days = Array.from({ length: daysCount }, (_, index) => new Date(firstDay.getTime() + index * DAY_MS));
  const calendarHeight = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;
  const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, index) => DAY_START_HOUR + index);
  const bookingsByDay = bookings.reduce<Record<string, Booking[]>>((groups, booking) => {
    const dayKey = getDayKey(booking.starts_at, timeZone);

    groups[dayKey] = [...(groups[dayKey] ?? []), booking];

    return groups;
  }, {});

  function handleSlotPointerDown(event: PointerEvent<HTMLDivElement>, dayKey: string) {
    if (!canManageBookings || event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);

    const startMinutes = getPointerMinutes(event, event.currentTarget);
    setDragSelection({
      currentMinutes: startMinutes,
      dayKey,
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

    setDragSelection(null);
    router.push(createDraftBookingHref(dragSelection.dayKey, startMinutes, range));
  }

  function handleSlotPointerCancel() {
    setDragSelection(null);
  }

  return (
    <div>
      <div className="border-b border-border bg-secondary/35 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{getRangeLabel(daysCount)}</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">
              {daysCount === 1 ? "Den × čas" : daysCount === 3 ? "3 dny × čas" : "Týden × čas"}
            </h2>
          </div>
          <p className="nums-tabular rounded-full border border-border bg-card px-3 py-1 text-sm font-semibold text-muted-foreground">
            {formatWeekRange(days)}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `56px repeat(${daysCount}, minmax(128px, 1fr))`,
            minWidth: getGridMinWidth(daysCount),
          }}
        >
          <div className="border-r border-border bg-muted/20" />
          {days.map((day) => {
            const dayKey = getDayKey(day, timeZone);

            return (
              <div key={dayKey} className="border-r border-border bg-card px-3 py-2 text-center last:border-r-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{formatDayName(day)}</p>
                <p className="nums-tabular mt-1 text-sm font-semibold text-foreground">{formatDayNumber(day)}</p>
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
          {days.map((day) => {
            const dayKey = getDayKey(day, timeZone);
            const positionedBookings = positionBookings(bookingsByDay[dayKey] ?? [], timeZone);

            return (
              <div
                key={dayKey}
                className={`relative touch-none border-r border-border bg-[linear-gradient(to_bottom,var(--card),var(--card)),repeating-linear-gradient(135deg,transparent_0,transparent_10px,var(--muted)_10px,var(--muted)_11px)] last:border-r-0 ${
                  canManageBookings ? "cursor-crosshair" : ""
                }`}
                style={{ height: calendarHeight }}
                onPointerCancel={handleSlotPointerCancel}
                onPointerDown={(event) => handleSlotPointerDown(event, dayKey)}
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
                      href={createBookingHref(dayKey, booking.id, range)}
                      onPointerDown={(event) => event.stopPropagation()}
                      className="absolute z-10 overflow-hidden rounded-md border px-2 py-1 text-xs shadow-sm ring-1 ring-black/[0.02] transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/35"
                      style={getBookingCardStyle({ color: staffColor, height: height - 4, left, top, width })}
                      title={`${formatTime(booking.starts_at, timeZone)} · ${booking.clients?.full_name ?? "Walk-in"} · ${booking.services?.name ?? "Služba"} · ${booking.staff?.name ?? "Zaměstnanec"}`}
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
                          {booking.services?.name ?? "Služba"} · {booking.staff?.name ?? "Tým"}
                        </p>
                      ) : null}
                    </Link>
                  );
                })}
                {dragSelection?.dayKey === dayKey ? (
                  <div
                    className="pointer-events-none absolute left-1 right-1 z-20 rounded-md border border-primary/60 bg-primary/15 px-2 py-1 text-xs font-bold text-primary shadow-sm ring-4 ring-primary/10"
                    style={{
                      height: getSelectionBounds(dragSelection).height,
                      top: getSelectionBounds(dragSelection).top,
                    }}
                  >
                    {formatMinutesLabel(getSelectionBounds(dragSelection).startMinutes)} - {" "}
                    {formatMinutesLabel(getSelectionBounds(dragSelection).endMinutes)}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
