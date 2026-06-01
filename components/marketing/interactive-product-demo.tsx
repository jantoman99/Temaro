"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  Search,
  UsersRound,
} from "lucide-react";

const productSurfaces = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    id: "calendar",
    label: "Kalendář",
    icon: CalendarDays,
  },
  {
    id: "booking",
    label: "Booking",
    icon: ClipboardCheck,
  },
  {
    id: "account",
    label: "Účet klienta",
    icon: UsersRound,
  },
] as const;

const agenda = [
  { time: "09:00", client: "Adam Novák", service: "Pánský střih", state: "Potvrzeno", tone: "confirm" },
  { time: "10:30", client: "Lucie Veselá", service: "Konzultace", state: "Čeká", tone: "wait" },
  { time: "13:15", client: "Eva Nováková", service: "Barva + styling", state: "Potvrzeno", tone: "confirm" },
  { time: "15:00", client: "Petr Marek", service: "Úprava vousů", state: "Riziko", tone: "risk" },
] as const;

const toneClassNames = {
  confirm: "border-l-success bg-success/10 text-success",
  wait: "border-l-warning bg-warning/10 text-warning",
  risk: "border-l-destructive bg-destructive/10 text-destructive",
} as const;

const calendarDays = [
  { day: "Po", bookings: 4, height: 62 },
  { day: "Út", bookings: 6, height: 78 },
  { day: "St", bookings: 3, height: 46 },
  { day: "Čt", bookings: 7, height: 88 },
  { day: "Pá", bookings: 5, height: 70 },
] as const;

const bookingSteps = [
  ["01", "Služba", "Pánský střih", "30 min"],
  ["02", "Termín", "Zítra 10:30", "Adam Novák"],
  ["03", "Kontakt", "Petr Marek", "potvrzení e-mailem"],
] as const;

const dashboardMetrics = [
  ["12", "rezervací dnes"],
  ["68 %", "obsazenost"],
  ["1", "rizikový termín"],
] as const;

const surfaceMeta = {
  dashboard: {
    title: "Dnešní provoz",
    subtitle: "Rezervace, obsazenost a rizika jsou vidět hned po přihlášení.",
    route: "/dashboard",
  },
  calendar: {
    title: "Kalendář podle týmu",
    subtitle: "Týdenní kapacita, volná okna a potvrzené návštěvy v jedné ploše.",
    route: "/calendar",
  },
  booking: {
    title: "Veřejný booking",
    subtitle: "Klient projde službu, termín a kontakt bez telefonátu.",
    route: "/demo-barber",
  },
  account: {
    title: "Účet klienta",
    subtitle: "Zákazník vidí nadcházející rezervace, historii a bezpečné změny.",
    route: "/account",
  },
} as const;

const accountBookings = [
  ["Zítra 10:30", "Pánský střih", "Studio Magnolia"],
  ["12. 6. 15:00", "Úprava vousů", "Studio Magnolia"],
  ["Historie", "Barva + styling", "dokončeno"],
] as const;

export function InteractiveProductDemo() {
  const [activeSurfaceId, setActiveSurfaceId] = useState<(typeof productSurfaces)[number]["id"]>("dashboard");
  const activeSurface = productSurfaces.find((surface) => surface.id === activeSurfaceId) ?? productSurfaces[0];
  const activeMeta = surfaceMeta[activeSurface.id];

  return (
    <section id="produkt" className="relative min-w-0">
      <div className="relative rounded-xl border border-primary/15 bg-card/70 p-3 shadow-[var(--shadow-command)] backdrop-blur-md lg:backdrop-blur-xl">
        <div className="command-surface interactive-demo-shell overflow-hidden rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-destructive/80" />
              <span className="size-2.5 rounded-full bg-warning/80" />
              <span className="size-2.5 rounded-full bg-success/80" />
            </div>
            <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-white/72">
              Temaro MVP
            </div>
            <div className="nums-tabular text-xs font-semibold text-white/55">Live demo</div>
          </div>

          <div className="border-b border-white/10 px-4 py-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto">
              {productSurfaces.map((surface) => (
                <button
                  key={surface.id}
                  type="button"
                  onClick={() => setActiveSurfaceId(surface.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                    activeSurface.id === surface.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/8 text-white/62 hover:bg-white/12 hover:text-white"
                  }`}
                >
                  {surface.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid min-h-[31rem] min-w-0 lg:grid-cols-[13rem_minmax(0,1fr)]">
            <aside className="hidden border-r border-white/10 p-4 lg:block">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  SM
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Studio Magnolia</p>
                  <p className="text-xs font-medium text-white/55">Dnes 12 rezervací</p>
                </div>
              </div>

              <div className="mt-8 space-y-1.5 text-sm font-semibold text-white/55">
                {productSurfaces.map((surface) => {
                  const Icon = surface.icon;
                  const isActive = activeSurface.id === surface.id;

                  return (
                    <button
                      key={surface.id}
                      type="button"
                      onClick={() => setActiveSurfaceId(surface.id)}
                      className={`relative flex h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                        isActive ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {isActive ? (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-primary" />
                      ) : null}
                      <Icon className="size-4" strokeWidth={1.75} />
                      {surface.label}
                    </button>
                  );
                })}
              </div>
            </aside>

            <div className="min-w-0 bg-secondary p-4 text-foreground sm:p-5">
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs font-semibold text-muted-foreground">
                  Hledat klienta, službu, rezervaci...
                </span>
              </div>

              <div className="mb-4 flex gap-2 overflow-x-auto">
                <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                  {activeMeta.route}
                </span>
                <span className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground">
                  tenant izolace
                </span>
                <span className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground">
                  self-service
                </span>
              </div>

              <div className="grid min-w-0 gap-4">
                <div className="min-w-0 space-y-4">
                  <div className="signal-rail min-h-[18rem] rounded-2xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                          {activeSurface.label}
                        </p>
                        <h2 className="mt-1 min-h-[4.25rem] max-w-[18rem] text-2xl font-semibold leading-[1.05] tracking-tight xl:text-3xl">
                          {activeMeta.title}
                        </h2>
                        <p className="mt-2 min-h-10 max-w-[18rem] text-sm font-semibold leading-5 text-muted-foreground">
                          {activeMeta.subtitle}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-sm font-bold text-success">
                        Online
                      </div>
                    </div>

                    {activeSurface.id === "dashboard" ? (
                      <>
                        <div className="mt-5 grid gap-2 sm:grid-cols-3">
                          {dashboardMetrics.map(([value, label]) => (
                            <div key={label} className="min-w-0 rounded-xl border border-border bg-secondary/75 p-3">
                              <p className="nums-tabular truncate text-2xl font-semibold tracking-tight">{value}</p>
                              <p className="mt-1 truncate text-[11px] font-bold leading-4 text-muted-foreground">
                                {label}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 rounded-2xl border border-border bg-secondary/70 p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold">Kapacita dne</p>
                            <p className="nums-tabular text-xs font-bold text-muted-foreground">68 % obsazeno</p>
                          </div>
                          <div className="flex h-24 items-end gap-2">
                            {[42, 58, 74, 66, 82, 61, 88].map((height, index) => (
                              <div key={`${height}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                                <span
                                  className={`block w-full rounded-t-md transition-all duration-500 ${
                                    index === 4 ? "bg-primary" : "bg-primary/22"
                                  }`}
                                  style={{ height: `${height}px` }}
                                />
                                <span className="nums-tabular text-[10px] font-bold text-muted-foreground">
                                  {index + 8}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : null}

                    {activeSurface.id === "calendar" ? (
                      <div className="mt-5 grid grid-cols-5 gap-2">
                        {calendarDays.map((day) => (
                          <div key={day.day} className="rounded-xl border border-border bg-secondary/75 p-2">
                            <p className="text-center text-xs font-bold text-muted-foreground">{day.day}</p>
                            <div className="mt-3 flex h-32 items-end rounded-lg bg-card p-1">
                              <div className="w-full rounded-md bg-info/70" style={{ height: `${day.height}%` }} />
                            </div>
                            <p className="nums-tabular mt-2 text-center text-sm font-semibold">{day.bookings}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {activeSurface.id === "booking" ? (
                      <div className="mt-5 space-y-2">
                        {bookingSteps.map(([step, title, value, detail]) => (
                          <div key={step} className="grid grid-cols-[2.5rem_1fr] gap-3 rounded-xl border border-border bg-secondary/75 p-3">
                            <span className="nums-tabular text-sm font-bold text-primary">{step}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{title}</p>
                              <p className="truncate text-sm font-semibold text-foreground">{value}</p>
                              <p className="truncate text-xs font-semibold text-muted-foreground">{detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {activeSurface.id === "account" ? (
                      <div className="mt-5 space-y-2">
                        {accountBookings.map(([date, service, state]) => (
                          <div key={`${date}-${service}`} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/75 p-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success/10 text-sm font-bold text-success">
                              {date.slice(0, 1)}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{service}</p>
                              <p className="truncate text-xs font-semibold text-muted-foreground">{date}</p>
                            </div>
                            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                              {state}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {activeSurface.id === "dashboard" ? (
                      <div className="mt-5 space-y-2">
                        {agenda.slice(2).map((item) => (
                          <div
                            key={`${item.time}-${item.client}`}
                            className={`grid grid-cols-[3.75rem_1fr_auto] items-center gap-3 rounded-xl border border-border border-l-4 p-3 shadow-sm ${toneClassNames[item.tone]}`}
                          >
                            <p className="nums-tabular text-sm font-bold text-foreground">{item.time}</p>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-foreground">{item.service}</p>
                              <p className="truncate text-xs font-semibold text-muted-foreground">{item.client}</p>
                            </div>
                            <span className="rounded-full bg-card px-2.5 py-1 text-xs font-bold text-foreground shadow-sm">
                              {item.state}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
