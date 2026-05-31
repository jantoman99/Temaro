import Link from "next/link";
import { CalendarOff } from "lucide-react";

import { BookingStatusActionForm } from "@/components/calendar/booking-status-action-form";
import { getBookingStatusClassName, getBookingStatusLabel } from "@/components/calendar/booking-status";
import { DemoSubmitButton } from "@/components/demo/demo-submit-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatTimeForDisplay, getDateKeyForCalendar } from "@/lib/date-format";
import { hasSupabaseEnv } from "@/lib/env";
import { getSafeTimeZone } from "@/lib/time-zone";
import type { Database } from "@/types/database";
import { getBookingSourceDescription } from "@/lib/booking/source";

type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  clients: Pick<Database["public"]["Tables"]["clients"]["Row"], "flag_reason" | "full_name" | "is_flagged"> | null;
  services: Pick<Database["public"]["Tables"]["services"]["Row"], "name"> | null;
  staff: Pick<Database["public"]["Tables"]["staff"]["Row"], "name" | "color"> | null;
};

function formatDateTime(value: string, timeZone: string) {
  return formatTimeForDisplay(value, timeZone);
}

function formatDay(value: string, timeZone: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Neplatný termín";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "long",
    timeZone: getSafeTimeZone(timeZone),
    weekday: "long",
  }).format(date);
}

function createBookingHref(dayKey: string, bookingId: string) {
  return `/calendar?view=week&day=${dayKey}&booking=${bookingId}`;
}

function createDraftBookingHref(dayKey: string) {
  const searchParams = new URLSearchParams();
  searchParams.set("view", "week");
  searchParams.set("day", dayKey);
  searchParams.set("draftStartsAt", `${dayKey}T09:00`);

  return `/calendar?${searchParams.toString()}`;
}

export function BookingList({
  bookings,
  canManageBookings = true,
  timeZone = "Europe/Prague",
}: {
  bookings: Booking[];
  canManageBookings?: boolean;
  timeZone?: string;
}) {
  const isDemo = !hasSupabaseEnv();
  const groupedBookings = bookings.reduce<Record<string, Booking[]>>((groups, booking) => {
    const dayKey = getDateKeyForCalendar(booking.starts_at, timeZone);

    groups[dayKey] = [...(groups[dayKey] ?? []), booking];

    return groups;
  }, {});
  const days = Object.entries(groupedBookings);

  if (bookings.length === 0) {
    return (
      <EmptyState
        description="Až klienti začnou rezervovat nebo vytvoříš ruční termín, uvidíš je tady."
        icon={CalendarOff}
        title={<>Zatím <span className="font-serif-accent text-primary">žádné</span> rezervace</>}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {days.map(([day, dayBookings]) => (
        <section key={day} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-5 py-3">
            <h2 className="text-sm font-semibold capitalize tracking-tight">{formatDay(dayBookings[0].starts_at, timeZone)}</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground">
                {dayBookings.length} rezervací
              </span>
              {canManageBookings ? (
                <Link
                  href={createDraftBookingHref(day)}
                  className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-foreground"
                >
                  Nová rezervace
                </Link>
              ) : null}
            </div>
          </div>
          <div className="divide-y divide-border/80">
            {dayBookings.map((booking) => (
              <article key={booking.id} className="p-5 transition hover:bg-primary/5">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="grid gap-2 sm:grid-cols-[5rem_minmax(0,1fr)]">
                    <p className="nums-tabular font-mono text-2xl font-semibold">{formatDateTime(booking.starts_at, timeZone)}</p>
                    <div>
                      <Link
                        href={createBookingHref(day, booking.id)}
                        className="text-lg font-semibold tracking-tight underline-offset-4 hover:underline"
                      >
                        {booking.services?.name ?? "Služba"} · {booking.staff?.name ?? "Zaměstnanec"}
                      </Link>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-medium text-muted-foreground">
                        <span>{booking.clients?.full_name ?? "Walk-in"}</span>
                        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getBookingStatusClassName(booking.status)}`}>
                          {getBookingStatusLabel(booking.status)}
                        </span>
                        <span>{getBookingSourceDescription({ source: booking.source, sourceDetail: booking.source_detail })}</span>
                      </div>
                      {booking.clients?.is_flagged ? (
                        <p className="mt-2 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
                          Pozor na klienta{booking.clients.flag_reason ? `: ${booking.clients.flag_reason}` : "."}
                        </p>
                      ) : null}
                      {booking.notes ? <p className="mt-3 text-sm font-medium text-muted-foreground">{booking.notes}</p> : null}
                    </div>
                  </div>
                  <div
                    className="size-4 rounded-full border border-border shadow-sm"
                    style={{ backgroundColor: booking.staff?.color ?? "oklch(0.62 0.18 275)" }}
                  />
                </div>
                {canManageBookings && (booking.status === "pending" || booking.status === "confirmed") ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {isDemo ? (
                      <>
                        <DemoSubmitButton>Dokončit</DemoSubmitButton>
                        <DemoSubmitButton>No-show</DemoSubmitButton>
                        <DemoSubmitButton>Zrušit</DemoSubmitButton>
                      </>
                    ) : (
                      <>
                        {booking.status === "pending" ? (
                          <BookingStatusActionForm
                            action="confirm"
                            bookingId={booking.id}
                            buttonClassName="border-primary bg-primary text-primary-foreground"
                            label="Potvrdit"
                            pendingLabel="Potvrzuji..."
                          />
                        ) : (
                          <>
                            <BookingStatusActionForm
                              action="complete"
                              bookingId={booking.id}
                              buttonClassName="border-primary bg-primary text-primary-foreground"
                              label="Dokončit"
                              pendingLabel="Dokončuji..."
                            />
                            <BookingStatusActionForm
                              action="noShow"
                              bookingId={booking.id}
                              label="No-show"
                              pendingLabel="Ukládám..."
                            />
                          </>
                        )}
                        <BookingStatusActionForm
                          action="cancel"
                          bookingId={booking.id}
                          buttonClassName="border-destructive/30 text-destructive"
                          label={booking.status === "pending" ? "Odmítnout" : "Zrušit"}
                          pendingLabel={booking.status === "pending" ? "Odmítám..." : "Ruším..."}
                        />
                      </>
                    )}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
