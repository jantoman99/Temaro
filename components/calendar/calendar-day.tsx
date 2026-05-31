import Link from "next/link";
import { Plus } from "lucide-react";

import { getBookingStatusClassName, getBookingStatusLabel } from "@/components/calendar/booking-status";
import { formatTimeForDisplay } from "@/lib/date-format";
import { getSafeTimeZone } from "@/lib/time-zone";
import type { Database } from "@/types/database";
import { getBookingSourceDescription } from "@/lib/booking/source";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  clients: Pick<Database["public"]["Tables"]["clients"]["Row"], "full_name"> | null;
  services: Pick<Database["public"]["Tables"]["services"]["Row"], "name"> | null;
  staff: Pick<Database["public"]["Tables"]["staff"]["Row"], "name" | "color"> | null;
};

const DAY_START_HOUR = 7;
const DAY_END_HOUR = 20;

function formatDayLabel(dayKey: string, timeZone: string) {
  const date = new Date(`${dayKey}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Neplatný den";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}

function formatTime(value: string, timeZone: string) {
  return formatTimeForDisplay(value, timeZone);
}

function getHourLabel(hour: number) {
  return `${hour.toString().padStart(2, "0")}:00`;
}

function getBookingHref(dayKey: string, bookingId: string) {
  return `/calendar?view=day&day=${dayKey}&booking=${bookingId}`;
}

function getDraftBookingHref(dayKey: string, hour: number) {
  const searchParams = new URLSearchParams();
  searchParams.set("view", "day");
  searchParams.set("day", dayKey);
  searchParams.set("draftStartsAt", `${dayKey}T${hour.toString().padStart(2, "0")}:00`);

  return `/calendar?${searchParams.toString()}`;
}

export function CalendarDay({
  bookings,
  canManageBookings = true,
  dayKey,
  timeZone = "Europe/Prague",
}: {
  bookings: Booking[];
  canManageBookings?: boolean;
  dayKey: string;
  timeZone?: string;
}) {
  const hours = Array.from(
    { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
    (_, index) => DAY_START_HOUR + index,
  );

  return (
    <div>
      <div className="border-b border-border bg-secondary/35 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Denní pohled</p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Denní kalendář</h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground capitalize">
          {formatDayLabel(dayKey, timeZone)}
        </p>
      </div>
      <div className="max-h-[68vh] divide-y divide-border/80 overflow-y-auto">
        {hours.map((hour) => {
          const hourBookings = bookings.filter((booking) => {
            const date = new Date(booking.starts_at);

            if (Number.isNaN(date.getTime())) {
              return false;
            }

            const bookingHour = Number(
              new Intl.DateTimeFormat("en-GB", {
                hour: "2-digit",
                hour12: false,
                timeZone: getSafeTimeZone(timeZone),
              }).format(date),
            );

            return bookingHour === hour;
          });

          return (
            <div key={hour} className="grid gap-3 px-4 py-2.5 transition hover:bg-primary/5 md:grid-cols-[4.5rem_minmax(0,1fr)]">
              <div className="nums-tabular font-mono text-sm font-medium text-muted-foreground">{getHourLabel(hour)}</div>
              <div className="grid gap-2">
                {hourBookings.length > 0 ? (
                  hourBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={getBookingHref(dayKey, booking.id)}
                      className="group rounded-lg border border-border bg-card p-3 text-sm shadow-sm transition hover:border-primary/40 hover:bg-muted/20 hover:shadow-md"
                      style={{
                        borderLeftColor: booking.staff?.color ?? "oklch(0.62 0.18 275)",
                        borderLeftWidth: 4,
                      }}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="nums-tabular font-semibold">
                            {formatTime(booking.starts_at, timeZone)} · {booking.services?.name ?? "Služba"}
                          </p>
                          <p className="mt-1 text-muted-foreground">
                            {booking.clients?.full_name ?? "Walk-in"} · {booking.staff?.name ?? "Zaměstnanec"}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getBookingStatusLabel(booking.status)} · {getBookingSourceDescription({
                              source: booking.source,
                              sourceDetail: booking.source_detail,
                            })}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getBookingStatusClassName(booking.status)}`}>
                          {getBookingStatusLabel(booking.status)}
                        </span>
                      </div>
                    </Link>
                  ))
                ) : canManageBookings ? (
                  <Link
                    href={getDraftBookingHref(dayKey, hour)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary hover:bg-primary/5 hover:text-foreground"
                  >
                    <Plus className="size-4 stroke-[1.75]" />
                    Volný slot
                  </Link>
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm font-medium text-muted-foreground">
                    Volno
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
