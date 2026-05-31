import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";

import { CalendarStaffFilter } from "@/components/calendar/calendar-staff-filter";
import { BookingDetail } from "@/components/calendar/booking-detail";
import { CalendarTeamDay } from "@/components/calendar/calendar-team-day";
import { CalendarWeek } from "@/components/calendar/calendar-week";
import { DemoBanner } from "@/components/demo/demo-banner";
import { ManualBookingForm } from "@/components/calendar/manual-booking-form";
import { getDashboardContextRedirect, requireDashboardContext } from "@/lib/auth/require-dashboard-context";
import { getDateKeyForCalendar } from "@/lib/date-format";
import { demoBookings, demoClients, demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeTimeZone } from "@/lib/time-zone";
import { calendarSearchParamsSchema } from "@/lib/validations/calendar";
import { getBookingSourceDescription, getBookingSourceLabel, type BookingSource } from "@/lib/booking/source";

export const dynamic = "force-dynamic";

type CalendarPageProps = {
  searchParams: Promise<{
    booking?: string;
    day?: string;
    draftClientId?: string;
    draftStartsAt?: string;
    draftStaffId?: string;
    query?: string;
    range?: string;
    source?: string;
    staffId?: string;
    staffIds?: string;
    status?: string;
    view?: string;
  }>;
};

type CalendarFilters = {
  query: string;
  range: CalendarRange;
  source: "all" | BookingSource;
  staffId?: string;
  staffIds: string[];
  staffIdsParam?: string;
  status: "all" | "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
};
type CalendarStaffOption = {
  color?: string | null;
  id: string;
  name: string;
};
type WaitlistPreviewItem = {
  client_email: string | null;
  client_name: string;
  client_phone: string | null;
  created_at: string;
  id: string;
  services?: { name?: string | null } | null;
  source: BookingSource;
  source_detail: string | null;
  staff?: { name?: string | null } | null;
};
type CalendarView = "day" | "week" | "team";
type CalendarRange = "day" | "3days" | "week";

function getRangeDays(range: CalendarRange) {
  return range === "3days" ? 3 : range === "week" ? 7 : 1;
}

function getViewForRange(range: CalendarRange): CalendarView {
  return range === "day" ? "day" : "week";
}

function getDayKey(date: Date | string, timeZone = "Europe/Prague") {
  return getDateKeyForCalendar(date, timeZone);
}

function getDateFromDayKey(dayKey: string) {
  return new Date(`${dayKey}T12:00:00`);
}

function addDays(dayKey: string, days: number) {
  const value = getDateFromDayKey(dayKey);
  value.setDate(value.getDate() + days);
  return getDayKey(value);
}

function parseStaffIds(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildCalendarHref({
  booking,
  day,
  draftClientId,
  draftStartsAt,
  draftStaffId,
  filters,
  view,
}: {
  booking?: string;
  day: string;
  draftClientId?: string;
  draftStartsAt?: string;
  draftStaffId?: string;
  filters: CalendarFilters;
  view: CalendarView;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("view", view);
  searchParams.set("day", day);
  searchParams.set("status", filters.status);
  searchParams.set("source", filters.source);

  if (filters.query) {
    searchParams.set("query", filters.query);
  }

  searchParams.set("range", filters.range);

  if (filters.staffId) {
    searchParams.set("staffId", filters.staffId);
  }

  if (filters.staffIdsParam) {
    searchParams.set("staffIds", filters.staffIdsParam);
  }

  if (booking) {
    searchParams.set("booking", booking);
  }

  if (draftClientId) {
    searchParams.set("draftClientId", draftClientId);
  }

  if (draftStartsAt) {
    searchParams.set("draftStartsAt", draftStartsAt);
  }

  if (draftStaffId) {
    searchParams.set("draftStaffId", draftStaffId);
  }

  return `/calendar?${searchParams.toString()}`;
}

function filterBookings<
  T extends {
    clients?: { full_name?: string | null } | null;
    services?: { name?: string | null } | null;
    source: BookingSource;
    staff_id: string;
    status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  },
>(bookings: T[], filters: CalendarFilters) {
  return bookings.filter((booking) => {
    const matchesStatus = filters.status === "all" || booking.status === filters.status;
    const matchesSource = filters.source === "all" || booking.source === filters.source;
    const matchesStaff =
      filters.staffIds.length > 0
        ? filters.staffIds.includes(booking.staff_id)
        : !filters.staffId || booking.staff_id === filters.staffId;
    const matchesQuery =
      !filters.query ||
      [booking.clients?.full_name ?? "", booking.services?.name ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(filters.query.toLowerCase());

    return matchesStatus && matchesSource && matchesStaff && matchesQuery;
  });
}

function FilterLink({
  active,
  children,
  href,
}: {
  active: boolean;
  children: ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex h-9 shrink-0 items-center rounded-md px-3 text-sm font-semibold transition ${
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "border border-border bg-background text-foreground hover:bg-muted"
      }`}
    >
      {children}
    </Link>
  );
}

function CalendarFilterPanel({
  availableStaff,
  dayKey,
  draftClientId,
  draftStaffId,
  draftStartsAt,
  filters,
  waitlistEntries = [],
  view,
}: {
  availableStaff: CalendarStaffOption[];
  dayKey: string;
  draftClientId?: string;
  draftStaffId?: string;
  draftStartsAt?: string;
  filters: CalendarFilters;
  waitlistEntries?: WaitlistPreviewItem[];
  view: CalendarView;
}) {
  const statusOptions = [
    ["all", "Vše"],
    ["pending", "Čeká"],
    ["confirmed", "Potvrzené"],
    ["completed", "Hotovo"],
    ["cancelled", "Zrušené"],
    ["no_show", "No-show"],
  ] as const;
  const sourceOptions = [
    ["all", "Vše"],
    ["manual", "Ručně"],
    ["online", getBookingSourceLabel("online")],
    ["instagram", getBookingSourceLabel("instagram")],
    ["qr", getBookingSourceLabel("qr")],
    ["widget", getBookingSourceLabel("widget")],
    ["catalog", getBookingSourceLabel("catalog")],
    ["google", getBookingSourceLabel("google")],
    ["referral", getBookingSourceLabel("referral")],
  ] as const;

  return (
    <aside className="rounded-xl border border-border bg-card p-3 shadow-sm xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Filtry</p>
      </div>
      <form className="grid gap-2">
        <div className="min-w-0">
          <input
            id="calendar-query"
            name="query"
            type="search"
            autoComplete="off"
            maxLength={100}
            defaultValue={filters.query}
            placeholder="Klient nebo služba"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/15"
          />
        </div>
        <input type="hidden" name="view" value={view} />
        <input type="hidden" name="day" value={dayKey} />
        <input type="hidden" name="range" value={filters.range} />
        <input type="hidden" name="status" value={filters.status} />
        <input type="hidden" name="source" value={filters.source} />
        {filters.staffId ? <input type="hidden" name="staffId" value={filters.staffId} /> : null}
        {filters.staffIdsParam ? <input type="hidden" name="staffIds" value={filters.staffIdsParam} /> : null}
        <div className="flex gap-2">
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
            Hledat
          </button>
          {filters.query ? (
            <Link
              href={buildCalendarHref({
                day: dayKey,
                draftClientId,
                draftStaffId,
                draftStartsAt,
                filters: { ...filters, query: "" },
                view,
              })}
              className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
            >
              Vyčistit
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-4 grid gap-4">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Stav</p>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map(([statusValue, label]) => (
              <FilterLink
                key={statusValue}
                active={filters.status === statusValue}
                href={buildCalendarHref({
                  day: dayKey,
                  draftClientId,
                  draftStaffId,
                  draftStartsAt,
                  filters: { ...filters, status: statusValue },
                  view,
                })}
              >
                {label}
              </FilterLink>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Zdroj</p>
          <div className="flex flex-wrap gap-1.5">
            {sourceOptions.map(([sourceValue, label]) => (
              <FilterLink
                key={sourceValue}
                active={filters.source === sourceValue}
                href={buildCalendarHref({
                  day: dayKey,
                  draftClientId,
                  draftStaffId,
                  draftStartsAt,
                  filters: { ...filters, source: sourceValue },
                  view,
                })}
              >
                {label}
              </FilterLink>
            ))}
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Zaměstnanci</p>
          <div>
            <CalendarStaffFilter staff={availableStaff} staffIdsParam={filters.staffIdsParam} />
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-border bg-background p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Čekací listina</p>
            <span className="nums-tabular rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
              {waitlistEntries.length}
            </span>
          </div>
          {waitlistEntries.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {waitlistEntries.map((entry) => (
                <article key={entry.id} className="rounded-lg border border-border bg-card p-2">
                  <p className="truncate text-sm font-semibold text-foreground">{entry.client_name}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                    {entry.services?.name ?? "Služba"}{entry.staff?.name ? ` · ${entry.staff.name}` : ""}
                  </p>
                  <p className="mt-1 truncate text-xs font-semibold text-primary">
                    {getBookingSourceDescription({ source: entry.source, sourceDetail: entry.source_detail })}
                  </p>
                  <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                    {entry.client_phone ?? entry.client_email ?? "Bez kontaktu"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs font-medium leading-5 text-muted-foreground">
              Zatím nikdo nečeká na uvolněný termín.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function CalendarTitle() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Rezervace</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Kalendář</h1>
      </div>
    </div>
  );
}

function CalendarFrame({
  calendar,
  dayKey,
  draftClientId,
  draftStaffId,
  draftStartsAt,
  filters,
  nextRangeLabel,
  nextRange,
  previousRangeLabel,
  previousRange,
  selectedBookingId,
  todayKey,
  view,
}: {
  calendar: ReactNode;
  dayKey: string;
  draftClientId?: string;
  draftStaffId?: string;
  draftStartsAt?: string;
  filters: CalendarFilters;
  nextRangeLabel: string;
  nextRange: string;
  previousRangeLabel: string;
  previousRange: string;
  selectedBookingId?: string;
  todayKey: string;
  view: CalendarView;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/60 px-3 py-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildCalendarHref({ day: previousRange, draftClientId, draftStartsAt, draftStaffId, filters, view })}
            className="grid size-9 place-items-center rounded-md border border-border bg-card text-lg font-semibold text-foreground shadow-sm hover:bg-muted"
            aria-label={previousRangeLabel}
          >
            ‹
          </Link>
          <Link
            href={buildCalendarHref({ day: todayKey, draftClientId, draftStartsAt, draftStaffId, filters, view })}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium leading-9 text-foreground shadow-sm hover:bg-muted"
          >
            Dnes
          </Link>
          <Link
            href={buildCalendarHref({ day: nextRange, draftClientId, draftStartsAt, draftStaffId, filters, view })}
            className="grid size-9 place-items-center rounded-md border border-border bg-card text-lg font-semibold text-foreground shadow-sm hover:bg-muted"
            aria-label={nextRangeLabel}
          >
            ›
          </Link>
        </div>
        <form className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="view" value={getViewForRange(filters.range)} />
          <input type="hidden" name="status" value={filters.status} />
          <input type="hidden" name="source" value={filters.source} />
          {filters.query ? <input type="hidden" name="query" value={filters.query} /> : null}
          {filters.staffId ? <input type="hidden" name="staffId" value={filters.staffId} /> : null}
          {filters.staffIdsParam ? <input type="hidden" name="staffIds" value={filters.staffIdsParam} /> : null}
          <label className="sr-only" htmlFor="calendar-day-picker">
            Vybrat datum
          </label>
          <input
            id="calendar-day-picker"
            name="day"
            type="date"
            defaultValue={dayKey}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <label className="sr-only" htmlFor="calendar-range-picker">
            Vybrat rozsah
          </label>
          <select
            id="calendar-range-picker"
            name="range"
            defaultValue={filters.range}
            className="h-9 rounded-md border border-border bg-card px-2 text-sm font-medium text-foreground shadow-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value="day">1 den</option>
            <option value="3days">3 dny</option>
            <option value="week">7 dní</option>
          </select>
          <button className="h-9 rounded-md border border-border bg-card px-3 text-sm font-semibold text-foreground shadow-sm hover:bg-muted">
            Přejít
          </button>
        </form>
        <div className="flex rounded-md border border-border bg-card p-1 shadow-sm">
          <Link
            href={buildCalendarHref({
              day: dayKey,
              draftClientId,
              draftStartsAt,
              draftStaffId,
              filters: { ...filters, range: "day" },
              view: "day",
              booking: selectedBookingId,
            })}
            className={`rounded-md px-3 py-2 text-sm font-medium ${view === "day" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Den
          </Link>
          <Link
            href={buildCalendarHref({
              day: dayKey,
              draftClientId,
              draftStartsAt,
              draftStaffId,
              filters: { ...filters, range: "week" },
              view: "week",
              booking: selectedBookingId,
            })}
            className={`rounded-md px-3 py-2 text-sm font-medium ${view === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Týden
          </Link>
        </div>
      </div>
      {calendar}
    </section>
  );
}

function CalendarModal({
  children,
  closeHref,
  title,
}: {
  children: ReactNode;
  closeHref: string;
  title: string;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-sidebar/55 px-4 py-6 backdrop-blur-sm">
      <Link href={closeHref} className="absolute inset-0" aria-label="Zavřít popup" />
      <section
        aria-modal="true"
        role="dialog"
        aria-label={title}
        className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-3 shadow-2xl"
      >
        <Link
          href={closeHref}
          className="sticky right-0 top-0 z-20 ml-auto flex size-8 items-center justify-center rounded-md border border-border bg-card text-base font-semibold leading-none text-muted-foreground shadow-sm transition hover:bg-muted hover:text-foreground"
          aria-label="Zavřít"
        >
          ×
        </Link>
        {children}
      </section>
    </div>
  );
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const rawSearchParams = await searchParams;
  const parsedSearchParams = calendarSearchParamsSchema.safeParse(rawSearchParams);
  const dayKey = parsedSearchParams.success
    ? (parsedSearchParams.data.day ?? getDayKey(new Date()))
    : getDayKey(new Date());
  const parsedRange: CalendarRange = parsedSearchParams.success
    ? (parsedSearchParams.data.range ?? (parsedSearchParams.data.view === "day" ? "day" : "week"))
    : "week";
  const filters: CalendarFilters = parsedSearchParams.success
    ? (() => {
        const staffIds = parseStaffIds(parsedSearchParams.data.staffIds);

        return {
          query: parsedSearchParams.data.query ?? "",
          range: parsedRange,
          source: parsedSearchParams.data.source ?? "all",
          staffId: parsedSearchParams.data.staffId,
          staffIds: staffIds.length > 0 ? staffIds : parsedSearchParams.data.staffId ? [parsedSearchParams.data.staffId] : [],
          staffIdsParam: parsedSearchParams.data.staffIds ?? parsedSearchParams.data.staffId,
          status: parsedSearchParams.data.status ?? "all",
        };
      })()
    : {
        query: "",
        range: "week",
        source: "all",
        staffId: undefined,
        staffIds: [],
        staffIdsParam: undefined,
        status: "all",
      };
  const view = parsedSearchParams.success && parsedSearchParams.data.view === "team" ? "team" : getViewForRange(parsedRange);
  const booking = parsedSearchParams.success ? parsedSearchParams.data.booking : undefined;
  const draftClientId = parsedSearchParams.success ? parsedSearchParams.data.draftClientId : undefined;
  const draftStartsAt = parsedSearchParams.success ? parsedSearchParams.data.draftStartsAt : undefined;
  const draftStaffId = parsedSearchParams.success ? parsedSearchParams.data.draftStaffId : undefined;

  return (
    <CalendarContent
      dayKey={dayKey}
      draftClientId={draftClientId}
      draftStartsAt={draftStartsAt}
      draftStaffId={draftStaffId}
      filters={filters}
      selectedBookingId={booking}
      view={view}
    />
  );
}

async function CalendarContent({
  dayKey,
  draftClientId,
  draftStartsAt,
  draftStaffId,
  filters,
  selectedBookingId,
  view,
}: {
  dayKey: string;
  draftClientId?: string;
  draftStartsAt?: string;
  draftStaffId?: string;
  filters: CalendarFilters;
  selectedBookingId?: string;
  view: CalendarView;
}) {
  const previousDay = addDays(dayKey, -1);
  const nextDay = addDays(dayKey, 1);
  const rangeDays = getRangeDays(filters.range);
  const previousRange = view === "week" ? addDays(dayKey, -rangeDays) : previousDay;
  const nextRange = view === "week" ? addDays(dayKey, rangeDays) : nextDay;
  const todayKey = getDayKey(new Date());
  const closeHref = buildCalendarHref({ day: dayKey, filters, view });

  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    const availableStaff = demoStaff;
    const timeZone = getSafeTimeZone(demoTenant.timezone);
    const visibleBookings = filterBookings(demoBookings, filters);
    const selectedBooking = visibleBookings.find((booking) => booking.id === selectedBookingId) ?? null;
    const hasModal = Boolean(selectedBooking || draftClientId || draftStartsAt || draftStaffId);

    return (
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-4">
          <DemoBanner />
          <CalendarTitle />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
            <CalendarFrame
              calendar={
                view === "team" ? (
                  <CalendarTeamDay
                    anchorDate={getDateFromDayKey(dayKey)}
                    bookings={visibleBookings}
                    staff={availableStaff}
                    timeZone={timeZone}
                  />
                ) : (
                  <CalendarWeek
                    anchorDate={getDateFromDayKey(dayKey)}
                    bookings={visibleBookings}
                    daysCount={filters.range === "day" ? 1 : filters.range === "3days" ? 3 : 7}
                    staff={availableStaff}
                    timeZone={timeZone}
                  />
                )
              }
              dayKey={dayKey}
              draftClientId={draftClientId}
              draftStaffId={draftStaffId}
              draftStartsAt={draftStartsAt}
              filters={filters}
              nextRangeLabel={filters.range === "3days" ? "Další 3 dny" : view === "week" ? "Další týden" : "Další den"}
              nextRange={nextRange}
              previousRangeLabel={
                filters.range === "3days" ? "Předchozí 3 dny" : view === "week" ? "Předchozí týden" : "Předchozí den"
              }
              previousRange={previousRange}
              selectedBookingId={selectedBookingId}
              todayKey={todayKey}
              view={view}
            />
            <CalendarFilterPanel
              availableStaff={availableStaff}
              dayKey={dayKey}
              draftClientId={draftClientId}
              draftStaffId={draftStaffId}
              draftStartsAt={draftStartsAt}
              filters={filters}
              waitlistEntries={[]}
              view={view}
            />
          </div>
        </div>
        {hasModal ? (
          <CalendarModal closeHref={closeHref} title={selectedBooking ? "Detail rezervace" : "Nová rezervace"}>
            {selectedBooking ? (
              <BookingDetail
                key={selectedBooking.id}
                booking={selectedBooking}
                closeHref={closeHref}
                services={demoServices}
                staff={demoStaff}
                timeZone={timeZone}
              />
            ) : (
              <ManualBookingForm
                key={`${draftClientId ?? "no-client"}:${draftStaffId ?? "no-staff"}:${draftStartsAt ?? "no-start"}`}
                clients={demoClients}
                initialClientId={draftClientId}
                initialStartsAt={draftStartsAt}
                initialStaffId={draftStaffId}
                returnTo={closeHref}
                services={demoServices}
                staff={demoStaff}
                timeZone={timeZone}
              />
            )}
          </CalendarModal>
        ) : null}
      </section>
    );
  }

  const auth = await requireDashboardContext();

  if ("error" in auth) {
    redirect(getDashboardContextRedirect(auth.error));
  }

  const admin = createAdminClient();
  const { isOwner, staffId: currentStaffId, supabase, tenantId } = auth;
  const staffScopeFallbackId = currentStaffId ?? "00000000-0000-4000-8000-000000000000";
  let clientsQuery = admin
    .from("clients")
    .select("*")
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .order("full_name", { ascending: true });
  let staffQuery = admin
    .from("staff")
    .select("*, staff_services(*)")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name", { ascending: true });
  let bookingsQuery = admin
    .from("bookings")
    .select(
      "*, clients!bookings_client_tenant_fkey(full_name, phone, email, is_flagged, flag_reason, no_show_count), services(name, duration_minutes, price, currency), staff(name, color)",
    )
    .eq("tenant_id", tenantId)
    .order("starts_at", { ascending: true })
    .limit(50);
  let waitlistQuery = admin
    .from("waitlist_entries")
    .select("id, client_name, client_phone, client_email, source, source_detail, created_at, services(name), staff(name)")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(8);

  if (!isOwner) {
    clientsQuery = clientsQuery.limit(0);
    staffQuery = staffQuery.eq("id", staffScopeFallbackId);
    bookingsQuery = bookingsQuery.eq("staff_id", staffScopeFallbackId);
    waitlistQuery = waitlistQuery.limit(0);
  }

  const [
    { data: clients, error: clientsError },
    { data: services, error: servicesError },
    { data: staff, error: staffError },
    { data: bookings, error: bookingsError },
    { data: tenant, error: tenantError },
    { data: waitlistEntries, error: waitlistError },
  ] = await Promise.all([
    clientsQuery,
    admin
      .from("services")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("position", { ascending: true })
      .order("name", { ascending: true }),
    staffQuery,
    bookingsQuery,
    admin
      .from("tenants")
      .select("timezone, locale")
      .eq("id", tenantId)
      .is("deleted_at", null)
      .maybeSingle(),
    waitlistQuery,
  ]);
  const availableStaff = staff ?? [];
  const timeZone = getSafeTimeZone(tenant?.timezone);
  const visibleBookings = filterBookings(bookings ?? [], filters);
  const hasLoadError = Boolean(clientsError || servicesError || staffError || bookingsError || tenantError || waitlistError);
  const selectedBooking = visibleBookings.find((booking) => booking.id === selectedBookingId) ?? null;
  const hasModal = Boolean(selectedBooking || draftClientId || draftStartsAt || draftStaffId);
  const { data: bookingEvents } = selectedBooking
    ? await supabase
        .from("booking_events")
        .select("id, event_type, actor_type, metadata, created_at, users(full_name, email)")
        .eq("tenant_id", tenantId)
        .eq("booking_id", selectedBooking.id)
        .order("created_at", { ascending: false })
    : { data: [] };
  const { data: bookingPayments } = selectedBooking
    ? await supabase
        .from("booking_payments")
        .select("id, amount, currency, payment_scope, method, status, note, paid_at, refunded_at, created_at")
        .eq("tenant_id", tenantId)
        .eq("booking_id", selectedBooking.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <CalendarTitle />
        {hasLoadError ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Kalendář se nepodařilo načíst. Zkuste stránku obnovit.
          </div>
        ) : null}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem] 2xl:grid-cols-[minmax(0,1fr)_20rem]">
          <CalendarFrame
            calendar={
              view === "team" ? (
                <CalendarTeamDay
                  anchorDate={getDateFromDayKey(dayKey)}
                  bookings={visibleBookings}
                  canManageBookings={isOwner}
                  staff={availableStaff}
                  timeZone={timeZone}
                />
              ) : (
                <CalendarWeek
                  anchorDate={getDateFromDayKey(dayKey)}
                  bookings={visibleBookings}
                  canManageBookings={isOwner}
                  daysCount={filters.range === "day" ? 1 : filters.range === "3days" ? 3 : 7}
                  staff={availableStaff}
                  timeZone={timeZone}
                  />
              )
            }
            dayKey={dayKey}
            draftClientId={draftClientId}
            draftStaffId={draftStaffId}
            draftStartsAt={draftStartsAt}
            filters={filters}
            nextRangeLabel={filters.range === "3days" ? "Další 3 dny" : view === "week" ? "Další týden" : "Další den"}
            nextRange={nextRange}
            previousRangeLabel={
              filters.range === "3days" ? "Předchozí 3 dny" : view === "week" ? "Předchozí týden" : "Předchozí den"
            }
            previousRange={previousRange}
            selectedBookingId={selectedBookingId}
            todayKey={todayKey}
            view={view}
          />
          <CalendarFilterPanel
            availableStaff={availableStaff}
            dayKey={dayKey}
            draftClientId={draftClientId}
            draftStaffId={draftStaffId}
            draftStartsAt={draftStartsAt}
            filters={filters}
            waitlistEntries={(waitlistEntries ?? []) as WaitlistPreviewItem[]}
            view={view}
          />
        </div>
      </div>
      {hasModal ? (
        <CalendarModal closeHref={closeHref} title={selectedBooking ? "Detail rezervace" : "Nová rezervace"}>
          {selectedBooking ? (
            <BookingDetail
              key={selectedBooking.id}
              booking={selectedBooking}
              bookingEvents={bookingEvents ?? []}
              bookingPayments={bookingPayments ?? []}
              canManageBookings={isOwner}
              closeHref={closeHref}
              services={services ?? []}
              staff={staff ?? []}
              timeZone={timeZone}
            />
          ) : isOwner ? (
            <ManualBookingForm
              key={`${draftClientId ?? "no-client"}:${draftStaffId ?? "no-staff"}:${draftStartsAt ?? "no-start"}`}
              clients={clients ?? []}
              initialClientId={draftClientId}
              initialStaffId={draftStaffId}
              initialStartsAt={draftStartsAt}
              returnTo={closeHref}
              services={services ?? []}
              staff={staff ?? []}
              timeZone={timeZone}
            />
          ) : null}
        </CalendarModal>
      ) : null}
    </section>
  );
}
