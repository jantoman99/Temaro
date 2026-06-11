"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type DemoReservation = {
  time: string;
  title: string;
  client: string;
  durationMin: number;
};

type DecisionStackItem = {
  time: string;
  title: string;
  text: string;
  tone: string;
  risk?: boolean;
};

const DAY_START = 8;
const DAY_END = 18;
const DAY_MINUTES = (DAY_END - DAY_START) * 60;
const RESERVATION_LANES = [44, 140, 236] as const;
const timeSlots = ["10:30", "11:00", "14:00", "15:30", "17:30"] as const;
type TimeSlot = (typeof timeSlots)[number];

function toPct(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return Math.min(100, Math.max(0, ((hours + minutes / 60 - DAY_START) / (DAY_END - DAY_START)) * 100));
}

function durationToPct(durationMin: number) {
  return Math.max(8, Math.min(32, (durationMin / DAY_MINUTES) * 100));
}

function laneForSlot(time: string) {
  const pct = toPct(time);
  if (pct < 33.3) return 0;
  if (pct < 66.6) return 1;
  return 2;
}

function overlaps(aStart: number, aWidth: number, bStart: number, bWidth: number) {
  return Math.max(aStart, bStart) < Math.min(aStart + aWidth, bStart + bWidth);
}

function isSlotFree(time: string, reservations: readonly DemoReservation[]) {
  const left = toPct(time);
  const width = durationToPct(45);

  return !reservations.some((reservation) =>
    overlaps(left, width, toPct(reservation.time), durationToPct(reservation.durationMin)),
  );
}

function findFirstFreeSlot(reservations: readonly DemoReservation[]) {
  return timeSlots.find((time) => isSlotFree(time, reservations)) ?? timeSlots[0];
}

const industryOptions = [
  {
    label: "Kadeřnictví",
    service: "Střih + foukaná",
    person: "Tereza",
    reservations: [
      { time: "09:30", title: "Barva kořínků", client: "Lenka S.", durationMin: 90 },
      { time: "12:00", title: "Střih + péče", client: "Jana K.", durationMin: 75 },
      { time: "16:30", title: "Melír", client: "Michaela P.", durationMin: 90 },
    ],
  },
  {
    label: "Barber",
    service: "Skin fade + vousy",
    person: "Adam",
    reservations: [
      { time: "10:00", title: "Fade", client: "Tomáš M.", durationMin: 45 },
      { time: "13:30", title: "Střih vousů", client: "Petr D.", durationMin: 45 },
      { time: "17:00", title: "Komplet", client: "David R.", durationMin: 60 },
    ],
  },
  {
    label: "Kosmetika",
    service: "Lash lift",
    person: "Nela",
    reservations: [
      { time: "08:30", title: "Hydratace pleti", client: "Eva H.", durationMin: 75 },
      { time: "11:30", title: "Brow styling", client: "Klára V.", durationMin: 45 },
      { time: "15:30", title: "Lash lift", client: "Anna T.", durationMin: 60 },
    ],
  },
  {
    label: "Trenér",
    service: "Osobní trénink",
    person: "Filip",
    reservations: [
      { time: "08:00", title: "Silový trénink", client: "Martin L.", durationMin: 60 },
      { time: "12:30", title: "Konzultace", client: "Sára N.", durationMin: 45 },
      { time: "17:30", title: "Technika běhu", client: "Ondřej B.", durationMin: 45 },
    ],
  },
] as const;

const heroTrustItems = ["Bez karty na start", "Bez provize z vašich klientů", "Vlastní rezervační odkaz"] as const;

const dailyOperations = [
  { time: "09:48", channel: "zpráva", text: "Můžu dnes po práci?", state: "čeká na slot" },
  { time: "13:12", channel: "storno", text: "Nepřijdu, omlouvám se", state: "vrátit do nabídky" },
  { time: "15:04", channel: "telefon", text: "Má Tereza něco v 15:30?", state: "ověřit kapacitu" },
] as const;

const decisionStack: readonly DecisionStackItem[] = [
  {
    time: "11:00",
    title: "Volné okno chráněné",
    text: "Mezera v kalendáři zůstane dostupná pro další rezervaci.",
    tone: "bg-[var(--mint)] text-[var(--mint-ink)]",
  },
  {
    time: "16:30",
    title: "Rizikový klient",
    text: "Historie nedorazení je vidět před potvrzením termínu.",
    tone: "bg-[var(--apricot-tint)] text-[var(--ink)]",
    risk: true,
  },
  {
    time: "17:30",
    title: "Potvrzeno online",
    text: "Nový termín se zařadí do dne bez ručního přepisování.",
    tone: "bg-[var(--cobalt-tint)] text-[var(--cobalt)]",
  },
] as const;

export function BusinessDiscoveryHero() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>(findFirstFreeSlot(industryOptions[0].reservations));
  const [reservations, setReservations] = useState<DemoReservation[]>([...industryOptions[0].reservations]);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const active = industryOptions[activeIndustry];
  const mobileReservations = [...reservations].sort((a, b) => toPct(a.time) - toPct(b.time));
  const selectedSlotFree = isSlotFree(selectedSlot, reservations);

  function selectIndustry(index: number) {
    const nextReservations = [...industryOptions[index].reservations];

    setActiveIndustry(index);
    setReservations(nextReservations);
    setConfirmedSlot(null);
    setSelectedSlot(findFirstFreeSlot(nextReservations));
  }

  function reserveSelectedSlot() {
    if (!isSlotFree(selectedSlot, reservations)) {
      return;
    }

    setReservations((current) => {
      const nextReservation = {
        time: selectedSlot,
        title: active.service,
        client: "Nová online rezervace",
        durationMin: 45,
      };

      return [...current.filter((item) => item.client !== "Nová online rezervace"), nextReservation];
    });
    setConfirmedSlot(selectedSlot);
  }

  return (
    <section id="produkt" className="business-discovery-hero temaro-time-hero relative overflow-hidden pt-24 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(43,63,242,0.13),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(255,185,138,0.58),transparent_27rem),radial-gradient(circle_at_42%_86%,rgba(191,234,212,0.44),transparent_28rem)]" />
      <div className="mx-auto grid min-h-[680px] w-full max-w-[1360px] items-center gap-8 px-4 pb-14 sm:min-h-[790px] sm:px-6 lg:grid-cols-[0.5fr_1.5fr] lg:px-8 lg:pb-20">
        <div className="relative z-10 max-w-2xl">
          <p className="section-eyebrow">Provozní stůl dne</p>
          <h1 className="font-display mt-5 text-balance text-5xl font-semibold leading-[0.93] text-[var(--ink)] sm:text-6xl lg:text-[5.9rem]">
            Rezervace drží den pohromadě.
          </h1>
          <p className="mt-5 max-w-xl text-lg font-normal leading-[1.45] text-[var(--ink-soft)] sm:mt-7 sm:text-2xl">
            Klient vybírá jen skutečně volný čas. Tým vidí zprávy, riziko no-show, klientskou historii i nový termín v jednom provozním obrazu.
          </p>

          <div className="mt-6 flex flex-wrap gap-2 sm:mt-8" aria-label="Ukázkové obory">
            {industryOptions.map((option, index) => (
              <button
                key={option.label}
                type="button"
                className="temaro-focus-ring rounded-full border border-[var(--paper-line)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink-soft)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--cobalt)] data-[active=true]:border-[var(--cobalt)] data-[active=true]:bg-[var(--cobalt)] data-[active=true]:text-white"
                data-active={activeIndustry === index}
                onClick={() => selectIndustry(index)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-8 hidden gap-3 sm:flex sm:flex-row">
            <Link
              href="/register"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-7 text-base font-bold text-white shadow-[0_18px_46px_rgba(43,63,242,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--cobalt-deep)]"
            >
              Nastavit stejný den
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white/72 px-7 text-base font-bold text-[var(--ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--cobalt)]"
            >
              Spustit ukázku
            </Link>
          </div>

          <div className="mt-6 hidden flex-wrap gap-2 sm:flex">
            {heroTrustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)]">
                <CheckCircle2 className="size-4 text-[var(--mint-ink)]" />
                {item}
              </span>
            ))}
          </div>

          <div className="operation-time-ribbon mt-8 hidden max-w-xl grid-cols-6 overflow-hidden rounded-[1.45rem] border border-[var(--ink)] bg-[var(--ink)] p-2 shadow-[0_18px_54px_rgba(23,26,33,0.12)] sm:grid">
            {["08", "10", "12", "14", "16", "18"].map((hour) => (
              <span key={hour} className="font-time relative z-10 rounded-[1rem] px-2 py-3 text-center text-sm font-semibold text-white/76">
                {hour}
              </span>
            ))}
            <strong className="col-span-6 rounded-[1rem] bg-[var(--mint)] px-3 py-2 text-xs font-bold leading-4 text-[var(--mint-ink)]">
              Jeden den, žádné přepínání
            </strong>
          </div>
        </div>

        <aside
          className="operating-table-stage relative z-10 overflow-hidden rounded-[2rem] border border-[var(--ink)] bg-white p-3 text-[var(--ink)] shadow-[0_42px_120px_rgba(23,26,33,0.24)] sm:p-4"
          aria-label="Interaktivní provozní stůl dne"
          aria-live="off"
        >
          <div className="relative z-10 grid gap-4">
            <div className="grid gap-3 rounded-[1.45rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-time text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
                  Dnes 08:00-18:00
                </p>
                <h2 className="font-display mt-1 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
                  Provozní stůl dne
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold sm:min-w-56">
                <span className="rounded-full bg-white px-3 py-2 text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)]">
                  {active.person} online
                </span>
                <span className="rounded-full bg-[var(--mint)] px-3 py-2 text-[var(--mint-ink)]">
                  3 volná okna
                </span>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.58fr_1.22fr_0.72fr]">
              <div className="operations-inbox hidden rounded-[1.5rem] border border-[var(--paper-line)] bg-[var(--ink)] p-4 text-white xl:grid">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-time text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
                      Příchozí provoz
                    </p>
                    <h3 className="font-display mt-2 text-3xl font-semibold leading-none tracking-[-0.04em]">
                      Zprávy se mění na sloty.
                    </h3>
                  </div>
                  <span className="font-time rounded-full bg-[var(--apricot)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
                    živé
                  </span>
                </div>

                <div className="mt-5 grid gap-2">
                  {dailyOperations.map((item) => (
                    <article key={`${item.time}-${item.text}`} className="rounded-[1.15rem] bg-white p-3 text-[var(--ink)] shadow-[0_16px_38px_rgba(0,0,0,0.16)]">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-time text-xs font-semibold text-[var(--cobalt)]">{item.time}</p>
                        <span className="rounded-full bg-[var(--apricot-tint)] px-2 py-0.5 text-[0.65rem] font-bold text-[var(--ink)]">{item.channel}</span>
                      </div>
                      <p className="mt-2 text-sm font-bold leading-5">{item.text}</p>
                      <p className="mt-1 text-xs font-semibold text-[var(--ink-soft)]">{item.state}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.5rem] bg-[var(--ink)] p-4 text-white lg:p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-time text-xs uppercase tracking-[0.18em] text-white/70">
                        {active.label} · {active.person}
                      </p>
                      <h3 className="font-display mt-1 text-3xl font-semibold tracking-[-0.04em]">
                        Kalendář bez přepínání
                      </h3>
                    </div>
                    <span className="font-time rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/78 ring-1 ring-white/12">
                      kapacita dne
                    </span>
                  </div>

                  <div className="temaro-day-grid relative rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-3 sm:h-[330px]">
                    <div className="shift-time-band font-time hidden justify-between text-[0.68rem] uppercase tracking-[0.12em] text-white/70 sm:flex">
                      {["08", "10", "12", "14", "16", "18"].map((hour) => (
                        <span key={hour}>{hour}:00</span>
                      ))}
                    </div>

                    {reservations.map((reservation) => {
                      const left = toPct(reservation.time);
                      const width = Math.min(durationToPct(reservation.durationMin), 100 - toPct(reservation.time));

                      return (
                        <article
                          key={`${reservation.time}-${reservation.client}`}
                          className={`desktop-reservation-card absolute top-[3.5rem] hidden rounded-2xl border border-white/12 bg-white p-2.5 text-[var(--ink)] shadow-[0_16px_34px_rgba(0,0,0,0.20)] sm:block ${reduceMotion ? "" : "time-card-in"}`}
                          style={{
                            left: `${left}%`,
                            width: `${width}%`,
                            transform: `translateY(${RESERVATION_LANES[laneForSlot(reservation.time)] ?? RESERVATION_LANES[0]}px)`,
                          }}
                        >
                          <div className="flex min-w-0 items-baseline gap-1.5">
                            <p className="font-time shrink-0 text-xs font-semibold text-[var(--cobalt)]">{reservation.time}</p>
                            <h3 className="truncate text-xs font-bold leading-5">{reservation.title}</h3>
                          </div>
                          {width < 11 ? null : (
                            <p className="mt-1 truncate text-xs font-medium text-[var(--ink-soft)]">{reservation.client}</p>
                          )}
                        </article>
                      );
                    })}

                    <div className="mobile-reservation-list grid gap-2 sm:hidden">
                      {mobileReservations.map((reservation) => {
                        const isNewReservation = reservation.client === "Nová online rezervace";

                        return (
                          <article
                            key={`mobile-${reservation.time}-${reservation.client}`}
                            className={`grid grid-cols-[4.25rem_1fr] items-center gap-3 rounded-2xl bg-white p-3 text-[var(--ink)] shadow-[0_12px_26px_rgba(0,0,0,0.18)] ${isNewReservation ? "ring-2 ring-[var(--cobalt)]" : ""} ${reduceMotion ? "" : "time-card-in"}`}
                          >
                            <p className="font-time text-sm font-semibold text-[var(--cobalt)]">{reservation.time}</p>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="truncate text-sm font-bold leading-5">{reservation.title}</h3>
                                {isNewReservation ? (
                                  <span className="font-time rounded-full bg-[var(--cobalt-tint)] px-2 py-0.5 text-[0.65rem] font-semibold text-[var(--cobalt)]">
                                    nové
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-0.5 truncate text-xs font-medium text-[var(--ink-soft)]">{reservation.client}</p>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="section-eyebrow">Klient vybírá čas</p>
                      <p className="mt-1 text-lg font-bold text-[var(--ink)]">
                        {active.service} · {active.person}
                      </p>
                    </div>
                    <span className="font-time rounded-full bg-[var(--apricot-tint)] px-3 py-1.5 text-sm font-semibold text-[var(--ink)]">
                      24/7
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {timeSlots.map((time) => {
                      const slotFree = isSlotFree(time, reservations);

                      return (
                        <button
                          key={time}
                          type="button"
                          className="time-chip temaro-focus-ring"
                          data-active={selectedSlot === time}
                          data-free={slotFree}
                          aria-disabled={!slotFree}
                          disabled={!slotFree}
                          onClick={() => setSelectedSlot(time)}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="temaro-focus-ring mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] text-base font-bold text-white transition hover:bg-[var(--cobalt-deep)] data-[confirmed=true]:bg-[var(--mint)] data-[confirmed=true]:text-[var(--mint-ink)]"
                    data-confirmed={confirmedSlot === selectedSlot}
                    disabled={!selectedSlotFree}
                    onClick={reserveSelectedSlot}
                  >
                    <Plus className="size-4" />
                    {confirmedSlot === selectedSlot ? `Rezervováno ${selectedSlot}` : `Rezervovat ${selectedSlot}`}
                  </button>
                  {confirmedSlot ? (
                    <div className={`confirm-toast-in mt-3 rounded-2xl bg-white p-3 text-sm font-medium text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)] ${reduceMotion ? "animate-none" : ""}`}>
                      <strong className="text-[var(--mint-ink)]">Rezervace přijata.</strong> Takhle ji uvidí váš tým.
                      <Link href="/ukazka" className="ml-1 font-bold text-[var(--cobalt)] underline-offset-4 hover:underline">
                        Projít celou ukázku
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="decision-stack-panel grid gap-3 rounded-[1.5rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
                <div>
                  <p className="font-time text-xs font-semibold uppercase tracking-[0.18em] text-[var(--cobalt)]">
                    Rozhodnutí dne
                  </p>
                  <h3 className="font-display mt-2 text-3xl font-semibold leading-none tracking-[-0.04em]">
                    Jeden den, žádné přepínání.
                  </h3>
                </div>
                {decisionStack.map((decision) => (
                  <article key={decision.title} className="rounded-[1.15rem] bg-white p-3 shadow-sm ring-1 ring-[var(--paper-line)]">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`font-time rounded-full px-2.5 py-1 text-xs font-semibold ${decision.tone}`}>
                        {decision.time}
                      </span>
                      {decision.risk ? (
                        <AlertTriangle className="size-4 text-[var(--signal-red)]" strokeWidth={2.1} />
                      ) : (
                        <CheckCircle2 className="size-4 text-[var(--mint-ink)]" strokeWidth={2.1} />
                      )}
                    </div>
                    <h4 className="mt-3 text-sm font-bold tracking-[-0.02em]">{decision.title}</h4>
                    <p className="mt-1 hidden text-xs font-medium leading-5 text-[var(--ink-soft)] sm:block">{decision.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
