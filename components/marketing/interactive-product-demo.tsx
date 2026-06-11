"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  LayoutPanelTop,
  Search,
  Settings2,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const productSurfaces = [
  {
    id: "overview",
    label: "Přehled provozu",
    icon: LayoutPanelTop,
  },
  {
    id: "calendar",
    label: "Kalendář",
    icon: CalendarDays,
  },
  {
    id: "bookingPage",
    label: "Rezervační stránka",
    icon: Settings2,
  },
  {
    id: "clientAccount",
    label: "Zákaznický účet",
    icon: UsersRound,
  },
] as const;

type SurfaceId = (typeof productSurfaces)[number]["id"];

const kpiItems = [
  ["Dnešní rezervace", "12", "stabilní den", "border-info/25 bg-info/10 text-info"],
  ["Tržba dnes", "8 400 Kč", "z dokončených rezervací", "border-success/25 bg-success/10 text-success"],
  ["Volná okna", "3", "kapacita dostupná", "border-warning/25 bg-warning/10 text-amber-800 dark:text-warning"],
  ["Riziko", "1", "vyžaduje pozornost", "border-destructive/25 bg-destructive/10 text-destructive"],
] as const;

const agenda = [
  { time: "09:00", client: "Adam Novák", service: "Pánský střih", state: "Potvrzeno", tone: "confirm" },
  { time: "10:30", client: "Lucie Veselá", service: "Konzultace", state: "Čeká", tone: "wait" },
  { time: "13:15", client: "Eva Nováková", service: "Barva + styling", state: "Potvrzeno", tone: "confirm" },
  { time: "15:00", client: "Petr Marek", service: "Úprava vousů", state: "Riziko", tone: "risk" },
] as const;

const toneClassNames = {
  confirm: "bg-success/10 text-success before:bg-success",
  wait: "bg-warning/10 text-warning before:bg-warning",
  risk: "bg-destructive/10 text-destructive before:bg-destructive",
} as const;

const calendarDays = [
  { day: "Po", bookings: 4, height: 62 },
  { day: "Út", bookings: 6, height: 78 },
  { day: "St", bookings: 3, height: 46 },
  { day: "Čt", bookings: 7, height: 88 },
  { day: "Pá", bookings: 5, height: 70 },
] as const;

const bookingPageItems = [
  ["Služby", "8 aktivních služeb"],
  ["Tým", "3 lidé v kalendáři"],
  ["Sdílení", "Odkaz, QR kód a tlačítko na web"],
] as const;

const accountBookings = [
  ["Zítra 10:30", "Pánský střih", "Přesun možný"],
  ["12. 6. 15:00", "Úprava vousů", "Potvrzeno"],
  ["Historie", "Barva + styling", "Dokončeno"],
] as const;

const tourSteps: readonly {
  surfaceId: SurfaceId;
  title: string;
  points: readonly string[];
}[] = [
  {
    surfaceId: "overview",
    title: "Začněte přehledem dne",
    points: ["Rezervace", "Tržba", "Volná okna"],
  },
  {
    surfaceId: "calendar",
    title: "Otevřete kalendář týmu",
    points: ["Lidé", "Filtry", "Nový termín"],
  },
  {
    surfaceId: "bookingPage",
    title: "Pošlete klientům rezervační stránku",
    points: ["Služby", "Tým", "Sdílení"],
  },
  {
    surfaceId: "clientAccount",
    title: "Klient si hlídá svoje termíny",
    points: ["Termíny", "Historie", "Změny"],
  },
];

function SurfacePanel({ activeSurfaceId }: { activeSurfaceId: SurfaceId }) {
  if (activeSurfaceId === "calendar") {
    return (
      <div className="grid h-full content-start gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Kalendář</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">Týden podle týmu</h2>
          </div>
          <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
            Nová rezervace
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {calendarDays.map((day) => (
            <div key={day.day} className="rounded-xl border border-border bg-secondary/75 p-2">
              <p className="text-center text-xs font-bold text-muted-foreground">{day.day}</p>
              <div className="mt-3 flex h-28 items-end rounded-lg bg-card p-1">
                <div className="w-full rounded-md bg-info/70" style={{ height: `${day.height}%` }} />
              </div>
              <p className="nums-tabular mt-2 text-center text-sm font-semibold">{day.bookings}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2 rounded-xl border border-border bg-secondary/70 p-3 sm:grid-cols-3">
          {["Lidé v týmu", "Stav rezervace", "Služba"].map((label) => (
            <div key={label} className="rounded-lg bg-card px-3 py-2 text-xs font-bold text-muted-foreground">
              {label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeSurfaceId === "bookingPage") {
    return (
      <div className="grid h-full content-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Rezervační stránka</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">To, co posíláte klientům</h2>
          <p className="mt-2 text-sm font-semibold leading-5 text-muted-foreground">
            Náhled, sdílení a vzhled bez další administrace.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-secondary/75 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">Studio Magnolia</p>
              <p className="text-xs font-semibold text-muted-foreground">8 služeb, 3 lidé v týmu</p>
            </div>
            <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-bold text-success">
              Veřejná
            </span>
          </div>
          <button className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
            Spravovat rezervace
          </button>
          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {bookingPageItems.map(([title, value]) => (
              <div key={title} className="rounded-xl border border-border bg-card p-3 min-h-24">
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSurfaceId === "clientAccount") {
    return (
      <div className="grid h-full content-start gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Zákaznický účet</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Moje rezervace</h2>
          <p className="mt-2 text-sm font-semibold leading-5 text-muted-foreground">
            Klient vidí termíny a změny bez dalšího telefonátu.
          </p>
        </div>
        <div className="space-y-2">
          {accountBookings.map(([date, service, state]) => (
            <div key={`${date}-${service}`} className="flex items-center gap-3 rounded-xl border border-border bg-secondary/75 p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success/10 text-sm font-bold text-success">
                <Clock3 className="size-4" />
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
      </div>
    );
  }

  return (
    <div className="grid h-full content-start gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Dnes</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Přehled provozu</h2>
        </div>
        <button className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground">
          Otevřít kalendář
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {kpiItems.map(([label, value, trend, className]) => (
          <article key={label} className={`rounded-xl border p-3 shadow-sm ${className}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-75">{label}</p>
            <p className="nums-tabular mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider opacity-75">{trend}</p>
          </article>
        ))}
      </div>
      <div className="space-y-2">
        {agenda.slice(1, 3).map((item) => (
          <div
            key={`${item.time}-${item.client}`}
            className={`relative grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-xl border border-border p-3 pl-4 shadow-sm before:absolute before:inset-y-3 before:left-2 before:w-1 before:rounded-full ${toneClassNames[item.tone]}`}
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
    </div>
  );
}

export function InteractiveProductDemo() {
  const [activeSurfaceId, setActiveSurfaceId] = useState<SurfaceId>("overview");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState<number | null>(null);
  const activeSurface = productSurfaces.find((surface) => surface.id === activeSurfaceId) ?? productSurfaces[0];
  const activeTourStep = tourStepIndex === null ? null : tourSteps[tourStepIndex];

  function selectSurface(surfaceId: SurfaceId) {
    setHasInteracted(true);
    setTourStepIndex(null);
    setActiveSurfaceId(surfaceId);
  }

  function startTour() {
    setHasInteracted(true);
    setTourStepIndex(0);
    setActiveSurfaceId(tourSteps[0].surfaceId);
  }

  function showNextTourStep() {
    setHasInteracted(true);

    const nextIndex = tourStepIndex === null ? 0 : tourStepIndex + 1;
    if (nextIndex >= tourSteps.length) {
      setTourStepIndex(null);
      return;
    }

    setTourStepIndex(nextIndex);
    setActiveSurfaceId(tourSteps[nextIndex].surfaceId);
  }

  function closeTour() {
    setHasInteracted(true);
    setTourStepIndex(null);
  }

  useEffect(() => {
    if (hasInteracted) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSurfaceId((current) => {
        const currentIndex = productSurfaces.findIndex((surface) => surface.id === current);
        return productSurfaces[(currentIndex + 1) % productSurfaces.length].id;
      });
    }, 5200);

    return () => window.clearInterval(intervalId);
  }, [hasInteracted]);

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
              Reálný pohled po přihlášení
            </div>
            <button
              type="button"
              onClick={startTour}
              className="rounded-full border border-primary/35 bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              Spustit ukázku
            </button>
          </div>

          <div className="grid min-h-[40rem] min-w-0 lg:h-[40rem] lg:grid-cols-[12rem_minmax(0,1fr)]">
            <aside className="hidden border-r border-white/10 p-4 lg:block">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                  <ShieldCheck className="size-5" />
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
                      onClick={() => selectSurface(surface.id)}
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
              <div className="mb-4 flex gap-2 overflow-x-auto lg:hidden">
                {productSurfaces.map((surface) => (
                  <button
                    key={surface.id}
                    type="button"
                    onClick={() => selectSurface(surface.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      activeSurface.id === surface.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {surface.label}
                  </button>
                ))}
              </div>

              <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-xs font-semibold text-muted-foreground">
                  Hledat klienta nebo službu
                </span>
              </div>

              <div>
                <div className="signal-rail relative min-h-[31.5rem] overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm lg:h-[31.5rem]">
                  <SurfacePanel activeSurfaceId={activeSurface.id} />
                  {activeTourStep && tourStepIndex !== null ? (
                    <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-lg shadow-primary/10 backdrop-blur">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                            Krok {tourStepIndex + 1} / {tourSteps.length}
                          </p>
                          <h3 className="mt-1 text-base font-semibold tracking-tight">{activeTourStep.title}</h3>
                          <ul className="mt-2 grid gap-1.5 text-sm font-medium leading-5 text-muted-foreground">
                            {activeTourStep.points.map((point) => (
                              <li key={point} className="flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-primary/70" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <button
                          type="button"
                          onClick={closeTour}
                          className="shrink-0 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground hover:text-foreground"
                        >
                          Zavřít ukázku
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={showNextTourStep}
                        className="mt-3 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                      >
                        {tourStepIndex + 1 >= tourSteps.length ? "Dokončit ukázku" : "Další krok"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
