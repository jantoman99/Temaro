"use client";

import { ArrowRight, CheckCircle2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

type DemoReservation = {
  time: string;
  title: string;
  client: string;
  durationMin: number;
};

const DAY_START = 8;
const DAY_END = 18;
const DAY_MINUTES = (DAY_END - DAY_START) * 60;
const RESERVATION_LANES = [42, 124, 206] as const;
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

const salonServiceTabs = [
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

const industryOptions = salonServiceTabs;
const heroTrustItems = ["Bez karty na start", "Bez provize z vašich klientů", "Vlastní rezervační odkaz"] as const;

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
    <section id="produkt" className="business-discovery-hero photo-led-hero temaro-time-hero relative overflow-hidden pt-24 sm:pt-28">
      <div className="mx-auto grid min-h-[680px] w-full max-w-[1360px] items-center gap-8 px-4 pb-14 sm:min-h-[790px] sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:pb-20">
        <div className="relative z-10 max-w-2xl">
          <p className="section-eyebrow">Rezervační systém pro salony a služby</p>
          <h1 className="font-display mt-5 text-balance text-6xl font-semibold leading-[0.92] text-[var(--ink)] sm:text-7xl lg:text-[6.4rem]">
            Méně zvonění.
            <span className="block text-[var(--cobalt)]">Plnější kalendář.</span>
          </h1>
          <p className="mt-6 max-w-xl text-xl font-normal leading-[1.45] text-[var(--ink-soft)] sm:text-2xl">
            Klient vidí volný čas, rezervuje sám a tým se vrací k práci. Temaro drží rezervace, připomínky a klientský kontext v jednom klidném provozu.
          </p>

          <div className="mt-7 flex flex-wrap gap-2" aria-label="Ukázkové obory">
            {salonServiceTabs.map((option, index) => (
              <button
                key={option.label}
                type="button"
                className="temaro-focus-ring rounded-full border border-[var(--paper-line)] bg-white px-4 py-2 text-sm font-bold text-[var(--ink-soft)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--cobalt)] data-[active=true]:border-[var(--ink)] data-[active=true]:bg-[var(--ink)] data-[active=true]:text-white"
                data-active={activeIndustry === index}
                onClick={() => selectIndustry(index)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-9 hidden flex-col gap-3 lg:flex lg:flex-row">
            <Link
              href="/register"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-7 text-base font-bold text-white shadow-[0_18px_46px_rgba(43,63,242,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--cobalt-deep)]"
            >
              Vybrat pilot
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white/78 px-7 text-base font-bold text-[var(--ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--cobalt)]"
            >
              Spustit ukázku
            </Link>
          </div>

          <div className="mt-6 hidden gap-2 lg:grid lg:grid-cols-3">
            {heroTrustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2 text-sm font-bold text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)]">
                <CheckCircle2 className="size-4 text-[var(--mint-ink)]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="relative z-10" aria-label="Ukázka online rezervace v provozu" aria-live="off">
          <div className="relative min-h-[560px] overflow-hidden rounded-[2.25rem] border border-white/70 bg-[var(--ink)] shadow-[0_44px_120px_rgba(23,26,33,0.22)] sm:min-h-[650px]">
            <Image
              src="/marketing/salon-day-hero.webp"
              alt="Salonová recepce s tabletem, kde je vidět denní kalendář rezervací"
              fill
              priority
              sizes="(min-width: 1024px) 780px, 94vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(23,26,33,0.58),transparent_34%,rgba(23,26,33,0.04)),linear-gradient(0deg,rgba(23,26,33,0.46),transparent_42%)]" />

            <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 sm:left-6 sm:right-6 sm:top-6">
              <span className="font-time rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink)] backdrop-blur">
                Volno dnes
              </span>
              <span className="font-time rounded-full bg-[var(--mint)] px-3 py-1.5 text-xs font-semibold text-[var(--mint-ink)] shadow-sm">
                {active.person} online
              </span>
            </div>

            <div className="salon-phone-card !absolute inset-x-4 bottom-4 rounded-[1.75rem] border border-white/72 bg-white/92 p-4 text-[var(--ink)] shadow-[0_22px_70px_rgba(23,26,33,0.26)] backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[430px] sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
                    {active.label}
                  </p>
                  <h2 className="font-display mt-1 text-3xl font-semibold tracking-[-0.045em]">
                    {active.service}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">{active.person} · dnešní kapacita</p>
                </div>
                <span className="font-time rounded-full bg-[var(--apricot-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
                  24/7
                </span>
              </div>

              <div className="temaro-day-grid relative mt-4 hidden rounded-[1.25rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-3 sm:block sm:h-[330px]">
                <div className="font-time flex justify-between text-[0.68rem] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
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
                      className={`desktop-reservation-card absolute top-[3.5rem] hidden rounded-2xl border border-[var(--paper-line)] bg-white p-2.5 text-[var(--ink)] shadow-[0_14px_30px_rgba(23,26,33,0.12)] sm:block ${reduceMotion ? "" : "time-card-in"}`}
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
              </div>

              <div className="mobile-reservation-list mt-3 flex gap-2 overflow-x-auto pb-1 sm:hidden">
                {mobileReservations.map((reservation) => {
                  const isNewReservation = reservation.client === "Nová online rezervace";

                  return (
                    <article
                      key={`mobile-${reservation.time}-${reservation.client}`}
                      className={`min-w-[8.75rem] rounded-2xl bg-[var(--porcelain)] p-3 text-[var(--ink)] shadow-sm ${isNewReservation ? "ring-2 ring-[var(--cobalt)]" : ""} ${reduceMotion ? "" : "time-card-in"}`}
                    >
                      <p className="font-time text-sm font-semibold text-[var(--cobalt)]">{reservation.time}</p>
                      <div className="min-w-0">
                        <div className="mt-1 flex items-center gap-2">
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

              <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
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
                className="temaro-focus-ring mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-base font-bold text-white transition hover:bg-[var(--cobalt)] data-[confirmed=true]:bg-[var(--mint)] data-[confirmed=true]:text-[var(--mint-ink)]"
                data-confirmed={confirmedSlot === selectedSlot}
                disabled={!selectedSlotFree}
                onClick={reserveSelectedSlot}
              >
                <Plus className="size-4" />
                {confirmedSlot === selectedSlot ? `Rezervováno ${selectedSlot}` : `Rezervovat ${selectedSlot}`}
              </button>
            </div>
          </div>
        </aside>

        <div className="photo-led-mobile-actions relative z-10 grid gap-3 lg:hidden">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/register"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-7 text-base font-bold text-white shadow-[0_18px_46px_rgba(43,63,242,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--cobalt-deep)]"
            >
              Vybrat pilot
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white/78 px-7 text-base font-bold text-[var(--ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--cobalt)]"
            >
              Spustit ukázku
            </Link>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {heroTrustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2 text-sm font-bold text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)]">
                <CheckCircle2 className="size-4 text-[var(--mint-ink)]" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
