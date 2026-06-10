"use client";

import { ArrowRight, CheckCircle2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type DemoReservation = {
  time: string;
  title: string;
  client: string;
  durationMin: number;
  lane: number;
};

const DAY_START = 8;
const DAY_END = 18;
const DAY_MINUTES = (DAY_END - DAY_START) * 60;
const RESERVATION_LANES = [56, 138, 220] as const;

function toPct(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return Math.min(100, Math.max(0, ((hours + minutes / 60 - DAY_START) / (DAY_END - DAY_START)) * 100));
}

function durationToPct(durationMin: number) {
  return Math.max(12, Math.min(32, (durationMin / DAY_MINUTES) * 100));
}

function laneForSlot(time: string) {
  const pct = toPct(time);
  if (pct < 36) return 0;
  if (pct < 70) return 1;
  return 2;
}

const industryOptions = [
  {
    label: "Kadeřnictví",
    service: "Střih + foukaná",
    person: "Tereza",
    reservations: [
      { time: "09:30", title: "Barva kořínků", client: "Lenka S.", durationMin: 90, lane: 0 },
      { time: "12:00", title: "Střih + péče", client: "Jana K.", durationMin: 75, lane: 1 },
      { time: "16:30", title: "Melír", client: "Michaela P.", durationMin: 90, lane: 2 },
    ],
  },
  {
    label: "Barber",
    service: "Skin fade + vousy",
    person: "Adam",
    reservations: [
      { time: "10:00", title: "Fade", client: "Tomáš M.", durationMin: 45, lane: 0 },
      { time: "13:30", title: "Střih vousů", client: "Petr D.", durationMin: 45, lane: 1 },
      { time: "17:00", title: "Komplet", client: "David R.", durationMin: 60, lane: 2 },
    ],
  },
  {
    label: "Kosmetika",
    service: "Lash lift",
    person: "Nela",
    reservations: [
      { time: "08:30", title: "Hydratace pleti", client: "Eva H.", durationMin: 75, lane: 0 },
      { time: "11:30", title: "Brow styling", client: "Klára V.", durationMin: 45, lane: 1 },
      { time: "15:30", title: "Lash lift", client: "Anna T.", durationMin: 60, lane: 2 },
    ],
  },
  {
    label: "Trenér",
    service: "Osobní trénink",
    person: "Filip",
    reservations: [
      { time: "08:00", title: "Silový trénink", client: "Martin L.", durationMin: 60, lane: 0 },
      { time: "12:30", title: "Konzultace", client: "Sára N.", durationMin: 45, lane: 1 },
      { time: "17:30", title: "Technika běhu", client: "Ondřej B.", durationMin: 45, lane: 2 },
    ],
  },
] as const;

const timeSlots = ["10:30", "11:00", "14:00", "15:30", "17:30"] as const;

const heroTrustItems = ["Bez karty na start", "Žádná provize z vašich klientů", "Vlastní rezervační odkaz"] as const;

export function BusinessDiscoveryHero() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeIndustry, setActiveIndustry] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<(typeof timeSlots)[number]>("15:30");
  const [reservations, setReservations] = useState<DemoReservation[]>([...industryOptions[0].reservations]);
  const [confirmedSlot, setConfirmedSlot] = useState<string | null>(null);
  const active = industryOptions[activeIndustry];

  function selectIndustry(index: number) {
    setActiveIndustry(index);
    setReservations([...industryOptions[index].reservations]);
    setConfirmedSlot(null);
    setSelectedSlot(index === 0 ? "15:30" : timeSlots[Math.min(index + 1, timeSlots.length - 1)]);
  }

  function reserveSelectedSlot() {
    setReservations((current) => {
      const nextReservation = {
        time: selectedSlot,
        title: active.service,
        client: "Nová online rezervace",
        durationMin: 45,
        lane: laneForSlot(selectedSlot),
      };

      return [...current.filter((item) => item.client !== "Nová online rezervace"), nextReservation];
    });
    setConfirmedSlot(selectedSlot);
  }

  return (
    <section id="produkt" className="business-discovery-hero temaro-time-hero relative overflow-hidden pt-24 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(43,63,242,0.08),transparent_42%),radial-gradient(circle_at_82%_20%,rgba(255,185,138,0.55),transparent_28rem)]" />
      <div className="mx-auto grid min-h-[790px] w-full max-w-[1280px] items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-24">
        <div className="relative z-10 max-w-3xl">
          <p className="section-eyebrow">Rezervační systém pro služby</p>
          <h1 className="font-display mt-5 text-balance text-6xl font-semibold leading-[0.96] text-[var(--ink)] sm:text-7xl lg:text-[6.8rem]">
            Rezervace bez volání.
            <span className="relative block text-[var(--cobalt)]">
              Čas bez chaosu.
              <svg className="absolute -bottom-2 left-1 h-5 w-[82%]" viewBox="0 0 420 24" aria-hidden>
                <path d="M5 14C90 3 210 25 416 6" fill="none" stroke="var(--apricot)" strokeLinecap="round" strokeWidth="12" />
              </svg>
            </span>
          </h1>
          <p className="mt-8 max-w-2xl text-xl font-normal leading-[1.45] text-[var(--ink-soft)] sm:text-2xl">
            Temaro mění prázdná okna, zprávy a přesuny termínů v jednu živou časovou osu pro tým i klienta.
          </p>

          <div className="mt-8 flex flex-wrap gap-2" aria-label="Ukázkové obory">
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
              Začít zdarma
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white/72 px-7 text-base font-bold text-[var(--ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--cobalt)]"
            >
              Spustit ukázku
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {heroTrustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-sm font-bold text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)]">
                <CheckCircle2 className="size-4 text-[var(--mint-ink)]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside
          className="relative z-10 overflow-hidden rounded-[2rem] border border-[var(--paper-line)] bg-white/86 p-4 shadow-[0_32px_90px_rgba(23,26,33,0.16)] backdrop-blur sm:p-5"
          aria-label="Interaktivní ukázka denního rozvrhu"
          aria-live="off"
        >
          <div className="flex flex-col gap-4 rounded-[1.5rem] bg-[var(--ink)] p-4 text-white sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-time text-xs uppercase tracking-[0.18em] text-white/70">Dnes · středa</p>
                <h2 className="font-display mt-1 text-3xl font-semibold tracking-[-0.04em]">Živý den v salonu</h2>
              </div>
              <div className="rounded-full bg-[var(--mint)] px-3 py-1.5 text-sm font-bold text-[var(--mint-ink)]">
                {active.person} online
              </div>
            </div>

            <div className="temaro-day-grid relative h-[360px] rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-3">
              <div className="font-time flex justify-between text-[0.68rem] uppercase tracking-[0.12em] text-white/70">
                {["08", "10", "12", "14", "16", "18"].map((hour) => (
                  <span key={hour}>{hour}:00</span>
                ))}
              </div>

              {reservations.map((reservation) => (
                <article
                  key={`${reservation.time}-${reservation.client}`}
                  className={`absolute top-[4.2rem] rounded-2xl border border-white/12 bg-white p-3 text-[var(--ink)] shadow-[0_16px_34px_rgba(0,0,0,0.20)] ${reduceMotion ? "" : "time-card-in"}`}
                  style={{
                    left: `${toPct(reservation.time)}%`,
                    width: `${durationToPct(reservation.durationMin)}%`,
                    transform: `translateY(${RESERVATION_LANES[reservation.lane] ?? RESERVATION_LANES[0]}px)`,
                  }}
                >
                  <p className="font-time text-sm font-semibold text-[var(--cobalt)]">{reservation.time}</p>
                  <h3 className="mt-1 text-sm font-bold leading-5">{reservation.title}</h3>
                  <p className="mt-1 text-xs font-medium text-[var(--ink-soft)]">{reservation.client}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
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
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  className="time-chip temaro-focus-ring"
                  data-active={selectedSlot === time}
                  onClick={() => setSelectedSlot(time)}
                >
                  {time}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="temaro-focus-ring mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] text-base font-bold text-white transition hover:bg-[var(--cobalt-deep)] data-[confirmed=true]:bg-[var(--mint)] data-[confirmed=true]:text-[var(--mint-ink)]"
              data-confirmed={confirmedSlot === selectedSlot}
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
        </aside>
      </div>
    </section>
  );
}
