import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Scissors, TriangleAlert } from "lucide-react";

import { DemoBanner } from "@/components/demo/demo-banner";
import { getDashboardContextRedirect, requireDashboardContext } from "@/lib/auth/require-dashboard-context";
import { getAvailabilitySlots } from "@/lib/booking/availability";
import { formatCurrencyForDisplay } from "@/lib/currency";
import { formatPercent, getNoShowRate, getOccupancyRate } from "@/lib/dashboard/metrics";
import { formatDateTimeForDisplay, getDateKeyForCalendar } from "@/lib/date-format";
import { demoBookings, demoServices, demoStaff, demoTenant } from "@/lib/demo/data";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { getSafeAppLocale } from "@/lib/locale";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSafeTimeZone, getUtcDayRangeForTimeZone, getUtcMonthStartForTimeZone } from "@/lib/time-zone";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: "Čeká",
  confirmed: "Potvrzeno",
  completed: "Hotovo",
  cancelled: "Zrušeno",
  no_show: "No-show",
};

const STATUS_TONES: Record<BookingStatus, string> = {
  pending: "bg-amber-500",
  confirmed: "bg-sky-500",
  completed: "bg-emerald-500",
  cancelled: "bg-slate-400",
  no_show: "bg-red-500",
};

function startOfDay() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay() {
  const value = startOfDay();
  value.setHours(23, 59, 59, 999);
  return value;
}

function addHours(date: Date, hours: number) {
  const value = new Date(date);
  value.setHours(value.getHours() + hours);
  return value;
}

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function formatDateTime(value: string, timeZone: string) {
  return formatDateTimeForDisplay(value, timeZone);
}

function formatDashboardDate(timeZone: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "full",
    timeZone,
  }).format(new Date());
}

function getDayKey(value: Date | string, timeZone = "Europe/Prague") {
  return getDateKeyForCalendar(value, timeZone);
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string | number;
  tone?: "default" | "warm" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "bg-red-50 text-red-700"
      : tone === "warm"
        ? "bg-amber-50 text-amber-700"
        : "bg-primary/10 text-primary";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-primary/12" aria-hidden="true" />
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="nums-tabular mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 24 - (value / max) * 20 - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg aria-hidden="true" className="mt-3 h-6 w-full overflow-visible text-current" preserveAspectRatio="none" viewBox="0 0 100 24">
      <polyline fill="none" points={points} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function DashboardKpiStrip({
  dateLabel,
  freeSlotsCount,
  revenue,
  riskCount,
  todayBookingsCount,
  trendValues,
}: {
  dateLabel: string;
  freeSlotsCount: number;
  revenue: string;
  riskCount: number;
  todayBookingsCount: number;
  trendValues: number[];
}) {
  const freeTone = freeSlotsCount > 2 ? "border-success/25 bg-success/10 text-success" : "border-warning/25 bg-warning/10 text-amber-800 dark:text-warning";
  const items = [
    {
      label: "Dnešní rezervace",
      value: todayBookingsCount,
      trend: todayBookingsCount >= (trendValues.at(-2) ?? 0) ? "↗ stabilní" : "↘ klidnější",
      className: "border-info/25 bg-info/10 text-info",
      values: trendValues,
    },
    {
      label: "Tržba dnes",
      value: revenue,
      trend: "z dokončených rezervací",
      className: "border-success/25 bg-success/10 text-success",
      values: trendValues.map((value, index) => value * (index + 1)),
    },
    {
      label: "Volná okna",
      value: freeSlotsCount,
      trend: freeSlotsCount > 2 ? "kapacita dostupná" : "řešit kapacitu",
      className: freeTone,
      values: [1, 2, 1, freeSlotsCount, 2, 1, Math.max(freeSlotsCount, 1)],
    },
    {
      label: "Riziko",
      value: riskCount,
      trend: riskCount > 0 ? "vyžaduje pozornost" : "bez signálu",
      className: "border-destructive/25 bg-destructive/10 text-destructive",
      values: [0, 1, 0, riskCount, 1, 0, riskCount],
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm md:col-span-2 xl:col-span-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{dateLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Přehled provozu</h1>
          </div>
          <Link href="/calendar" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
            Otevřít kalendář
          </Link>
        </div>
      </div>
      {items.map((item) => (
        <article key={item.label} className={`rounded-xl border p-4 shadow-sm ${item.className}`}>
          <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-75">{item.label}</p>
          <p className="nums-tabular mt-2 text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider opacity-75">{item.trend}</p>
          <Sparkline values={item.values} />
        </article>
      ))}
    </section>
  );
}

function MiniBarChart({
  bars,
  label,
}: {
  bars: { label: string; value: number }[];
  label: string;
}) {
  const maxValue = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">Jednoduchý trend bez zbytečného analytického šumu.</p>
        </div>
      </div>
      <div className="mt-5 flex h-36 items-end gap-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-28 w-full items-end rounded-md bg-muted/50 px-1">
              <div
                className="w-full rounded-sm bg-primary/80"
                style={{ height: `${Math.max(8, (bar.value / maxValue) * 100)}%` }}
              />
            </div>
            <div className="text-center">
              <p className="nums-tabular text-xs font-semibold">{bar.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{bar.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function getStatusCounts(bookings: { status: BookingStatus }[]) {
  return bookings.reduce<Record<BookingStatus, number>>(
    (counts, booking) => ({
      ...counts,
      [booking.status]: counts[booking.status] + 1,
    }),
    {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    },
  );
}

function StatusBreakdown({ counts }: { counts: Record<BookingStatus, number> }) {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const statuses = Object.entries(counts) as [BookingStatus, number][];

  return (
    <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Stavy rezervací</h2>
        <p className="mt-1 text-sm text-muted-foreground">Měsíční mix stavů. Pomáhá rychle poznat, kde vzniká provozní tření.</p>
      </div>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-muted">
        {statuses.map(([status, value]) => (
          <div
            key={status}
            className={STATUS_TONES[status]}
            style={{ width: total > 0 ? `${(value / total) * 100}%` : "0%" }}
            title={`${STATUS_LABELS[status]}: ${value}`}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {statuses.map(([status, value]) => (
          <div key={status} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className={`size-2.5 rounded-full ${STATUS_TONES[status]}`} />
              {STATUS_LABELS[status]}
            </span>
            <span className="nums-tabular text-sm font-semibold text-muted-foreground">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function OperationalSignals({
  noShowRate,
  occupancyRate,
}: {
  noShowRate: number;
  occupancyRate: number;
}) {
  const noShowTone = noShowRate >= 10 ? "border-destructive/25 bg-destructive/10 text-destructive" : "border-success/25 bg-success/10 text-success";
  const occupancyTone = occupancyRate >= 80 ? "border-success/25 bg-success/10 text-success" : occupancyRate >= 50 ? "border-warning/25 bg-warning/10 text-amber-800 dark:text-warning" : "border-info/25 bg-info/10 text-info";

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className={`rounded-xl border p-4 shadow-sm ${occupancyTone}`}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-75">Obsazenost dnes</p>
        <p className="nums-tabular mt-2 text-3xl font-semibold tracking-tight text-foreground">{formatPercent(occupancyRate)}</p>
        <p className="mt-1 text-sm font-semibold opacity-80">Poměr dnešních rezervací vůči dostupným a obsazeným oknům.</p>
      </article>
      <article className={`rounded-xl border p-4 shadow-sm ${noShowTone}`}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] opacity-75">No-show rate měsíc</p>
        <p className="nums-tabular mt-2 text-3xl font-semibold tracking-tight text-foreground">{formatPercent(noShowRate)}</p>
        <p className="mt-1 text-sm font-semibold opacity-80">Podíl no-show z měsíčních rezervací. Nad 10 % řešit připomínky nebo zálohy.</p>
      </article>
    </section>
  );
}

export default function DashboardPage() {
  return <DashboardContent />;
}

async function DashboardContent() {
  if (!hasSupabaseEnv() || !hasSupabaseAdminEnv()) {
    const revenue = 45000;
    const todayBookings = demoBookings.filter((booking) => {
      const startsAt = new Date(booking.starts_at);
      return startsAt >= startOfDay() && startsAt <= endOfDay();
    });
    const pendingBookings = demoBookings.filter((booking) => booking.status === "pending");
    const nextBooking = demoBookings[0] ?? null;
    const flaggedBookings = demoBookings.filter((booking) => booking.clients?.full_name === "Petr Svoboda");
    const arrivingSoonBookings = demoBookings.filter((booking) => {
      const startsAt = new Date(booking.starts_at);
      return startsAt >= new Date() && startsAt <= addHours(new Date(), 1);
    });
    const timeZone = getSafeTimeZone(demoTenant.timezone);
    const freeSlotsTodayCount = getAvailabilitySlots({
      bookings: demoBookings,
      daysAhead: 1,
      locale: demoTenant.locale,
      services: demoServices,
      staff: demoStaff,
      timeZone,
    }).filter((slot) => getDayKey(slot.startsAt, timeZone) === getDayKey(new Date(), timeZone)).length;
    const defaultCurrency = demoTenant.default_currency;
    const statusCounts = getStatusCounts(demoBookings);
    const noShowRate = getNoShowRate({ noShowBookings: statusCounts.no_show, totalBookings: demoBookings.length });
    const occupancyRate = getOccupancyRate({ bookedSlots: todayBookings.length, freeSlots: freeSlotsTodayCount });
    const trendBars = Array.from({ length: 7 }, (_, index) => {
      const dayOffset = index - 3;
      const date = new Date();
      date.setDate(date.getDate() + dayOffset);
      const dayKey = getDayKey(date, timeZone);
      const value = demoBookings.filter((booking) => getDayKey(booking.starts_at, timeZone) === dayKey).length;

      return {
        label: new Intl.DateTimeFormat("cs-CZ", { weekday: "short", timeZone }).format(date),
        value,
      };
    });

    return (
      <section className="flex flex-col gap-6">
        <DemoBanner />
        <DashboardKpiStrip
          dateLabel="Demo režim"
          freeSlotsCount={freeSlotsTodayCount}
          revenue={formatCurrencyForDisplay(revenue, defaultCurrency)}
          riskCount={pendingBookings.length + flaggedBookings.length}
          todayBookingsCount={todayBookings.length}
          trendValues={trendBars.map((bar) => bar.value)}
        />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={CalendarDays} label="Rezervace tento měsíc" value={12} />
          <StatCard icon={TriangleAlert} label="No-show tento měsíc" value={1} tone="danger" />
          <StatCard icon={Scissors} label="Tržby z dokončených rezervací" value={formatCurrencyForDisplay(revenue, defaultCurrency)} tone="warm" />
        </div>
        <OperationalSignals noShowRate={noShowRate} occupancyRate={occupancyRate} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <MiniBarChart bars={trendBars} label="Rezervace kolem dneška" />
          <StatusBreakdown counts={statusCounts} />
        </div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Dnešek</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Co je dnes důležité a co vás čeká nejdřív.
                </p>
              </div>
              <Link href="/calendar" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted">
                Otevřít kalendář
              </Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Rezervace dnes</p>
                <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{todayBookings.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Čeká na potvrzení</p>
                <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{pendingBookings.length}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
                <p className="text-sm text-muted-foreground">Volné termíny dnes</p>
                <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{freeSlotsTodayCount}</p>
              </div>
              <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm md:col-span-3">
                <p className="text-sm text-muted-foreground">Nejbližší termín</p>
                <p className="mt-2 text-sm font-medium">
                  {nextBooking ? formatDateTime(nextBooking.starts_at, timeZone) : "Žádný"}
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold tracking-tight">Rychlé akce</h2>
            <div className="mt-4 grid gap-3">
              <Link href="/calendar" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                Otevřít kalendář a rezervace
              </Link>
              <Link href="/clients" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                Správa klientů
              </Link>
              <Link href="/services" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                Upravit služby
              </Link>
              <Link href="/staff" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                Upravit zaměstnance
              </Link>
            </div>
          </section>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-tight">Nejbližší rezervace</h2>
            <Link href="/calendar" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Zobrazit vše
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {demoBookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-border bg-background/70 p-3 shadow-sm">
                <p className="nums-tabular text-sm font-semibold">{formatDateTime(booking.starts_at, timeZone)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.clients?.full_name} · {booking.services?.name} · {booking.staff?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-amber-900">Pozor dnes a brzy</h2>
              <p className="mt-1 text-sm text-amber-800">
                Přehled rezervací, kde je u klienta uložené varování.
              </p>
            </div>
            <Link href="/clients" className="text-sm font-medium text-amber-900 underline-offset-4 hover:underline">
              Otevřít klienty
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {flaggedBookings.length > 0 ? (
              flaggedBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-amber-500/25 bg-background/70 p-3 shadow-sm">
                  <p className="nums-tabular text-sm font-semibold">{formatDateTime(booking.starts_at, timeZone)}</p>
                  <p className="mt-1 text-sm text-amber-900">
                    {booking.clients?.full_name} · {booking.services?.name} · {booking.staff?.name}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-amber-900">Žádné varování pro nejbližší rezervace.</p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Kdo přijde do hodiny</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Rychlý přehled nejbližších příchodů bez hledání v kalendáři.
              </p>
            </div>
            <Link href="/calendar?view=day" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
              Otevřít den
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {arrivingSoonBookings.length > 0 ? (
              arrivingSoonBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-border bg-background/70 p-3 shadow-sm">
                  <p className="nums-tabular text-sm font-semibold">{formatDateTime(booking.starts_at, timeZone)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {booking.clients?.full_name ?? "Walk-in"} · {booking.services?.name ?? "Služba"} · {booking.staff?.name ?? "Poskytovatel"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Do hodiny nikdo nepřijde.</p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const auth = await requireDashboardContext();

  if ("error" in auth) {
    redirect(getDashboardContextRedirect(auth.error));
  }

  const admin = createAdminClient();
  const { isOwner, staffId: currentStaffId, supabase, tenantId } = auth;
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .is("deleted_at", null)
    .single();

  if (tenantError || !tenant) {
    return (
      <section className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Přehled měsíce
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Dashboard se nepodařilo načíst. Zkuste stránku obnovit.
        </div>
      </section>
    );
  }

  const timeZone = getSafeTimeZone(tenant?.timezone);
  const monthStart = getUtcMonthStartForTimeZone(new Date(), timeZone);
  const todayRange = getUtcDayRangeForTimeZone(new Date(), timeZone);
  const now = new Date();
  const nowIso = now.toISOString();
  const nextHour = addHours(new Date(), 1).toISOString();
  const dashboardHorizonEnd = addDays(now, 8).toISOString();
  const staffScopeFallbackId = currentStaffId ?? "00000000-0000-4000-8000-000000000000";
  let monthBookingsQuery = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("starts_at", monthStart);
  let noShowBookingsQuery = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "no_show")
    .gte("starts_at", monthStart);
  let completedBookingsQuery = supabase
    .from("bookings")
    .select("services(price)")
    .eq("tenant_id", tenantId)
    .eq("status", "completed")
    .gte("starts_at", monthStart);
  let monthStatusBookingsQuery = supabase
    .from("bookings")
    .select("status")
    .eq("tenant_id", tenantId)
    .gte("starts_at", monthStart);
  let upcomingBookingsQuery = supabase
    .from("bookings")
    .select("id, starts_at, clients!bookings_client_tenant_fkey(full_name, is_flagged, flag_reason), services(name), staff(name)")
    .eq("tenant_id", tenantId)
    .in("status", ["pending", "confirmed"])
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
    .limit(5);
  let todayBookingsQuery = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .gte("starts_at", todayRange.start)
    .lt("starts_at", todayRange.end);
  let pendingBookingsQuery = supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("status", "pending")
    .gte("starts_at", nowIso);
  let arrivingSoonBookingsQuery = supabase
    .from("bookings")
    .select("id, starts_at, clients!bookings_client_tenant_fkey(full_name), services(name), staff(name)")
    .eq("tenant_id", tenantId)
    .in("status", ["pending", "confirmed"])
    .gte("starts_at", nowIso)
    .lte("starts_at", nextHour)
    .order("starts_at", { ascending: true });
  let staffQuery = admin
    .from("staff")
    .select("*, staff_hours(*), staff_exceptions(*), staff_services(*)")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("name", { ascending: true });
  let futureBookingsQuery = admin
    .from("bookings")
    .select("staff_id, starts_at, ends_at, status")
    .eq("tenant_id", tenantId)
    .in("status", ["pending", "confirmed"])
    .gte("starts_at", nowIso)
    .lte("starts_at", dashboardHorizonEnd)
    .order("starts_at", { ascending: true });

  if (!isOwner) {
    monthBookingsQuery = monthBookingsQuery.eq("staff_id", staffScopeFallbackId);
    noShowBookingsQuery = noShowBookingsQuery.eq("staff_id", staffScopeFallbackId);
    completedBookingsQuery = completedBookingsQuery.eq("staff_id", staffScopeFallbackId);
    monthStatusBookingsQuery = monthStatusBookingsQuery.eq("staff_id", staffScopeFallbackId);
    upcomingBookingsQuery = upcomingBookingsQuery.eq("staff_id", staffScopeFallbackId);
    todayBookingsQuery = todayBookingsQuery.eq("staff_id", staffScopeFallbackId);
    pendingBookingsQuery = pendingBookingsQuery.eq("staff_id", staffScopeFallbackId);
    arrivingSoonBookingsQuery = arrivingSoonBookingsQuery.eq("staff_id", staffScopeFallbackId);
    staffQuery = staffQuery.eq("id", staffScopeFallbackId);
    futureBookingsQuery = futureBookingsQuery.eq("staff_id", staffScopeFallbackId);
  }

  const [
    { count: bookingsCount, error: bookingsCountError },
    { count: noShowCount, error: noShowCountError },
    { data: completedBookings, error: completedBookingsError },
    { data: monthStatusBookings, error: monthStatusBookingsError },
    { data: upcomingBookings, error: upcomingBookingsError },
    { count: todayBookingsCount, error: todayBookingsCountError },
    { count: pendingBookingsCount, error: pendingBookingsCountError },
    { data: arrivingSoonBookings, error: arrivingSoonBookingsError },
    { data: services, error: servicesError },
    { data: staff, error: staffError },
    { data: futureBookings, error: futureBookingsError },
  ] =
    await Promise.all([
      monthBookingsQuery,
      noShowBookingsQuery,
      completedBookingsQuery,
      monthStatusBookingsQuery,
      upcomingBookingsQuery,
      todayBookingsQuery,
      pendingBookingsQuery,
      arrivingSoonBookingsQuery,
      admin
        .from("services")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("position", { ascending: true })
        .order("name", { ascending: true }),
      staffQuery,
      futureBookingsQuery,
    ]);
  const hasLoadError = Boolean(
    bookingsCountError ||
      noShowCountError ||
      completedBookingsError ||
      monthStatusBookingsError ||
      upcomingBookingsError ||
      todayBookingsCountError ||
      pendingBookingsCountError ||
      arrivingSoonBookingsError ||
      servicesError ||
      staffError ||
      futureBookingsError,
  );

  const revenue = completedBookings?.reduce((sum, booking) => sum + (booking.services?.price ?? 0), 0) ?? 0;
  const statusCounts = getStatusCounts(monthStatusBookings ?? []);
  const defaultCurrency = tenant?.default_currency ?? "CZK";
  const nextBooking = upcomingBookings?.[0] ?? null;
  const flaggedUpcomingBookings = upcomingBookings?.filter((booking) => booking.clients?.is_flagged) ?? [];
  const freeSlotsTodayCount = getAvailabilitySlots({
    bookings: futureBookings ?? [],
    daysAhead: 1,
    locale: getSafeAppLocale(tenant?.locale),
    services: services ?? [],
    staff: staff ?? [],
    timeZone,
  }).filter((slot) => getDayKey(slot.startsAt, timeZone) === getDayKey(new Date(), timeZone)).length;
  const noShowRate = getNoShowRate({ noShowBookings: noShowCount ?? 0, totalBookings: bookingsCount ?? 0 });
  const occupancyRate = getOccupancyRate({ bookedSlots: todayBookingsCount ?? 0, freeSlots: freeSlotsTodayCount });
  const trendBars = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index - 3);
    const dayKey = getDayKey(date, timeZone);
    const value =
      futureBookings?.filter((booking) => getDayKey(booking.starts_at, timeZone) === dayKey).length ?? 0;

    return {
      label: new Intl.DateTimeFormat("cs-CZ", { weekday: "short", timeZone }).format(date),
      value,
    };
  });

  return (
    <section className="flex flex-col gap-6">
      <DashboardKpiStrip
        dateLabel={formatDashboardDate(timeZone)}
        freeSlotsCount={freeSlotsTodayCount}
        revenue={formatCurrencyForDisplay(revenue, defaultCurrency)}
        riskCount={(pendingBookingsCount ?? 0) + flaggedUpcomingBookings.length}
        todayBookingsCount={todayBookingsCount ?? 0}
        trendValues={trendBars.map((bar) => bar.value)}
      />
      {hasLoadError ? (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Část dashboardu se nepodařilo načíst. Zkuste stránku obnovit.
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={CalendarDays} label="Rezervace tento měsíc" value={bookingsCount ?? 0} />
        <StatCard icon={TriangleAlert} label="No-show tento měsíc" value={noShowCount ?? 0} tone="danger" />
        <StatCard icon={Scissors} label="Tržby z dokončených rezervací" value={formatCurrencyForDisplay(revenue, defaultCurrency)} tone="warm" />
      </div>
      <OperationalSignals noShowRate={noShowRate} occupancyRate={occupancyRate} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <MiniBarChart bars={trendBars} label="Rezervace kolem dneška" />
        <StatusBreakdown counts={statusCounts} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Dnešek</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Krátký přehled toho, co vás čeká právě dnes.
              </p>
            </div>
            <Link href="/calendar" className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-muted">
              Otevřít kalendář
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Rezervace dnes</p>
              <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{todayBookingsCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Čeká na potvrzení</p>
              <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{pendingBookingsCount ?? 0}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm">
              <p className="text-sm text-muted-foreground">Volné termíny dnes</p>
              <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight">{freeSlotsTodayCount}</p>
            </div>
            <div className="rounded-lg border border-border bg-background/70 p-4 shadow-sm md:col-span-3">
              <p className="text-sm text-muted-foreground">Nejbližší termín</p>
              <p className="mt-2 text-sm font-medium">
                {nextBooking ? formatDateTime(nextBooking.starts_at, timeZone) : "Žádný"}
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold tracking-tight">Rychlé akce</h2>
          <div className="mt-4 grid gap-3">
            <Link href="/calendar" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
              Otevřít kalendář a rezervace
            </Link>
            {isOwner ? (
              <>
                <Link href="/clients" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                  Správa klientů
                </Link>
                <Link href="/services" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                  Upravit služby
                </Link>
                <Link href="/staff" className="rounded-lg border border-border bg-background/70 px-4 py-3 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted">
                  Upravit zaměstnance
                </Link>
              </>
            ) : null}
          </div>
        </section>
      </div>
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Nejbližší rezervace</h2>
          <Link href="/calendar" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Zobrazit vše
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {upcomingBookings && upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <div key={`${booking.starts_at}-${booking.services?.name}`} className="rounded-lg border border-border bg-background/70 p-3 shadow-sm">
                <p className="nums-tabular text-sm font-semibold">{formatDateTime(booking.starts_at, timeZone)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.clients?.full_name ?? "Walk-in"} · {booking.services?.name ?? "Služba"} ·{" "}
                  {booking.staff?.name ?? "Poskytovatel"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Žádné nadcházející rezervace.</p>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-amber-900">Pozor dnes a brzy</h2>
            <p className="mt-1 text-sm text-amber-800">
              Tady rychle uvidíte rezervace klientů, u kterých je uložené varování.
            </p>
          </div>
          {isOwner ? (
            <Link href="/clients" className="text-sm font-medium text-amber-900 underline-offset-4 hover:underline">
              Otevřít klienty
            </Link>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3">
          {flaggedUpcomingBookings.length > 0 ? (
            flaggedUpcomingBookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-amber-500/25 bg-background/70 p-3 shadow-sm">
                <p className="nums-tabular text-sm font-semibold">{formatDateTime(booking.starts_at, timeZone)}</p>
                <p className="mt-1 text-sm text-amber-900">
                  {booking.clients?.full_name ?? "Klient"} · {booking.services?.name ?? "Služba"} ·{" "}
                  {booking.staff?.name ?? "Poskytovatel"}
                </p>
                {booking.clients?.flag_reason ? (
                  <p className="mt-2 text-sm text-amber-800">{booking.clients.flag_reason}</p>
                ) : null}
              </div>
            ))
          ) : (
            <p className="text-sm text-amber-900">Žádné varování pro nejbližší rezervace.</p>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Kdo přijde do hodiny</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Nejbližší příchody, které je dobré mít teď hned na očích.
            </p>
          </div>
          <Link href="/calendar?view=day" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
            Otevřít den
          </Link>
        </div>
        <div className="mt-4 grid gap-3">
          {arrivingSoonBookings && arrivingSoonBookings.length > 0 ? (
            arrivingSoonBookings.map((booking) => (
              <div key={booking.id} className="rounded-lg border border-border bg-muted p-3 shadow-sm">
                <p className="nums-tabular text-sm font-semibold">{formatDateTime(booking.starts_at, timeZone)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {booking.clients?.full_name ?? "Walk-in"} · {booking.services?.name ?? "Služba"} · {booking.staff?.name ?? "Poskytovatel"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Do hodiny <span className="font-serif-accent text-primary">nikdo</span> nepřijde.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
