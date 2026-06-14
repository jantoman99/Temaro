"use client";

import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Link2,
  MessageSquareText,
  Scissors,
  Smartphone,
  Sparkles,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const industryProfiles = [
  {
    id: "barber",
    label: "Barber",
    business: "Barber provoz",
    promise: "rychlé střihy, vousy, návraty klientů",
    cue: "45 min",
  },
  {
    id: "beauty",
    label: "Kosmetika",
    business: "Beauty provoz",
    promise: "delší procedury bez přepisování zpráv",
    cue: "75 min",
  },
  {
    id: "hair",
    label: "Kadeřnictví",
    business: "Kadeřnický tým",
    promise: "barvy, tým a bloky v jednom dni",
    cue: "120 min",
  },
  {
    id: "massage",
    label: "Masáže",
    business: "Masérské studio",
    promise: "tichý provoz bez telefonů mezi klienty",
    cue: "60 min",
  },
] as const;

const proofStats = [
  { value: 12, suffix: "", label: "rezervací v demo dni" },
  { value: 3, suffix: "", label: "volná okna v přehledu" },
  { value: 0, suffix: " %", label: "marketplace provize" },
] as const;

const heroTrustItems = [
  "Živý CRM kalendář",
  "Bez provize z vlastních klientů",
  "Vlastní rezervační odkaz",
] as const;

const controlBookings = [
  {
    time: "08:30",
    title: "Pánský střih",
    staff: "Adam",
    status: "confirmed",
    lane: "Barber",
  },
  {
    time: "10:30",
    title: "Konzultace",
    staff: "Lucie",
    status: "pending",
    lane: "Beauty",
  },
  {
    time: "13:15",
    title: "Barva + styling",
    staff: "Eva",
    status: "confirmed",
    lane: "Kadeřnictví",
  },
  {
    time: "16:00",
    title: "Volné okno",
    staff: "Instagram kampaň",
    status: "open",
    lane: "Last minute",
  },
] as const;

const controlSignals = [
  ["Dnešní rezervace", "12", "stabilní den"],
  ["Tržba dnes", "8 400 Kč", "z dokončených rezervací"],
  ["Riziko", "1", "čeká na potvrzení"],
] as const;

const productMoments = [
  { icon: CalendarDays, title: "Kalendář", text: "tým, volno a riziko" },
  { icon: Smartphone, title: "Rezervace", text: "mobilní rezervace" },
  { icon: UsersRound, title: "Klienti", text: "historie a preference" },
  { icon: Link2, title: "Kanály", text: "web, QR, Instagram, Google" },
] as const;

const heroFlowSteps = [
  {
    icon: Smartphone,
    label: "Nový termín z Instagramu",
    title: "Klient bere 16:00",
    tone: "blue",
  },
  {
    icon: CalendarDays,
    label: "Volné okno chráněné",
    title: "Kalendář blokuje kolizi",
    tone: "mint",
  },
  {
    icon: BellRing,
    label: "Potvrzení bez volání",
    title: "SMS připomínka připravena",
    tone: "apricot",
  },
] as const;

function HeroSignalFlow() {
  return (
    <div className="temaro-hero-flow mt-8 grid gap-2 rounded-[1.75rem] border border-white/78 bg-white/78 p-3 shadow-[0_22px_70px_rgba(23,26,33,0.12)]">
      <div className="flex items-center justify-between gap-3 px-2">
        <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
          Právě teď
        </p>
        <span className="rounded-full bg-[var(--mint)] px-3 py-1.5 text-xs font-bold text-[var(--mint-ink)]">
          živý demo den
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {heroFlowSteps.map((step, index) => (
          <article key={step.label} className={`temaro-arrival-card ${step.tone}`} style={{ animationDelay: `${index * 180}ms` }}>
            <span className="grid size-10 place-items-center rounded-2xl bg-white/82 text-[var(--cobalt)]">
              <step.icon className="size-5" strokeWidth={1.9} />
            </span>
            <div>
              <p className="font-time text-[0.68rem] font-semibold uppercase tracking-[0.13em]">{step.label}</p>
              <h3 className="mt-1 text-sm font-bold leading-5">{step.title}</h3>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function AnimatedNumber({
  label,
  suffix,
  value,
}: {
  label: string;
  suffix: string;
  value: number;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const [current, setCurrent] = useState(value);
  const displayedValue = reduceMotion ? value : current;

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    let frame = 0;
    const totalFrames = 34;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(frame / totalFrames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(value * eased));

      if (progress === 1) {
        window.clearInterval(timer);
      }
    }, 28);

    return () => window.clearInterval(timer);
  }, [reduceMotion, value]);

  return (
    <div className="rounded-[1.35rem] border border-[var(--paper-line)] bg-white/82 p-4 shadow-sm">
      <p className="font-time text-3xl font-semibold text-[var(--ink)]">
        {displayedValue}
        {suffix}
      </p>
      <p className="mt-1 text-sm font-semibold leading-5 text-[var(--ink-soft)]">
        {label}
      </p>
    </div>
  );
}

function OperationControlRoom() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeBooking, setActiveBooking] = useState(1);

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveBooking((current) => (current + 1) % controlBookings.length);
    }, 2600);

    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  const selected = controlBookings[activeBooking];

  return (
    <div className="temaro-control-room relative">
      <div className="temaro-orbit-card left">
        <MessageSquareText className="size-4" strokeWidth={1.9} />
        <span>Nová rezervace</span>
      </div>
      <div className="temaro-orbit-card right">
        <BellRing className="size-4" strokeWidth={1.9} />
        <span>SMS připravena</span>
      </div>
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-[#FF5F57]" />
          <span className="size-3 rounded-full bg-[#FFBD2E]" />
          <span className="size-3 rounded-full bg-[#28C840]" />
        </div>
        <span className="font-time rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em]">
          Provozní kalendář
        </span>
      </div>

      <div className="relative overflow-hidden rounded-b-[1.9rem] bg-[var(--porcelain)] p-4 sm:p-5">
        <div className="temaro-live-thread" aria-hidden="true" />
        <div className="grid gap-4 md:grid-cols-[0.7fr_1.3fr]">
          <aside className="order-2 rounded-[1.5rem] bg-[var(--ink)] p-4 text-white md:order-1">
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Studio Magnolia</p>
            <p className="mt-2 text-2xl font-bold tracking-[-0.04em]">Dnes</p>
            <div className="mt-5 grid gap-2">
              {controlSignals.map(([label, value, note], index) => (
                <div key={label} className={`rounded-2xl p-3 ${index === 2 ? "bg-[rgba(255,185,138,0.16)]" : "bg-white/8"}`}>
                  <p className="font-time text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/50">{label}</p>
                  <p className="mt-1 text-2xl font-bold">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-white/55">{note}</p>
                </div>
              ))}
            </div>
          </aside>

          <div className="temaro-calendar-surface order-1 rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-4 shadow-sm md:order-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-time text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cobalt)]">Úterý 16. 6.</p>
                <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">Kalendář týmu</h2>
              </div>
              <Link
                href="/ukazka"
                className="temaro-focus-ring hidden rounded-full bg-[var(--cobalt)] px-4 py-2 text-sm font-bold text-white sm:inline-flex"
              >
                Kliknout demo
              </Link>
            </div>

            <div className="temaro-arrival-card blue mt-4">
              <span className="grid size-10 place-items-center rounded-2xl bg-white/82 text-[var(--cobalt)]">
                <Smartphone className="size-5" strokeWidth={1.9} />
              </span>
              <div>
                <p className="font-time text-[0.68rem] font-semibold uppercase tracking-[0.13em]">Nový termín z Instagramu</p>
                <h3 className="mt-1 text-sm font-bold leading-5">16:00 se mění z volného okna na rezervaci</h3>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[4.25rem_1fr] gap-3">
              <div className="grid gap-2 pt-8 font-time text-xs font-semibold text-[var(--ink-faint)]">
                {["08:00", "10:00", "12:00", "14:00", "16:00"].map((time) => (
                  <span key={time}>{time}</span>
                ))}
              </div>
              <div className="temaro-calendar-board grid gap-2">
                {controlBookings.map((booking, index) => {
                  const isActive = index === activeBooking;

                  return (
                    <button
                      key={`${booking.time}-${booking.title}`}
                      type="button"
                      onClick={() => setActiveBooking(index)}
                      className={`temaro-focus-ring temaro-live-booking text-left ${booking.status} ${isActive ? "is-active" : ""}`}
                    >
                      <span className="font-time text-sm font-bold">{booking.time}</span>
                      <span>
                        <strong>{booking.title}</strong>
                        <small>{booking.staff} · {booking.lane}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 rounded-[1.5rem] border border-[var(--paper-line)] bg-white/86 p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cobalt)]">
              Vybraný signál
            </p>
            <p className="mt-1 text-xl font-bold tracking-[-0.03em]">
              {selected.time} · {selected.title}
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">
              {selected.staff} · {selected.lane}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--cobalt-tint)] px-4 py-3 text-sm font-bold text-[var(--cobalt)]">
            Potvrzení bez volání
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessDiscoveryHero() {
  const [activeIndustryId, setActiveIndustryId] = useState<(typeof industryProfiles)[number]["id"]>("barber");
  const activeIndustry = industryProfiles.find((item) => item.id === activeIndustryId) ?? industryProfiles[0];

  return (
    <section id="produkt" className="temaro-time-atelier-hero relative overflow-hidden px-4 pb-18 pt-32 sm:px-6 sm:pb-24 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1320px] gap-12 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white/82 px-3 py-2 text-sm font-bold text-[var(--ink)] shadow-sm">
            <Sparkles className="size-4 text-[var(--cobalt)]" strokeWidth={1.9} />
            Právě teď v Temaru
          </div>

          <h1
            aria-label="Nová rezervace. Klidný den."
            className="font-display mt-7 text-balance text-[clamp(3.45rem,7vw,7rem)] font-semibold leading-[0.86] tracking-[-0.075em]"
          >
            Nová rezervace. Klidný den.
          </h1>

          <p className="mt-7 max-w-2xl text-pretty text-xl font-normal leading-8 text-[var(--ink-soft)]">
            Rezervace přichází z webu, Instagramu nebo QR. Temaro ověří dostupnost, zapíše termín a připraví další krok.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="temaro-focus-ring group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-7 text-base font-bold text-white shadow-[0_18px_44px_rgba(43,63,242,0.26)] transition hover:-translate-y-0.5 hover:bg-[var(--cobalt-deep)]"
            >
              Registrovat salon
              <ArrowRight className="size-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-7 text-base font-bold text-[var(--ink)] transition hover:border-[var(--cobalt)]"
            >
              Spustit ukázku
            </Link>
          </div>

          <HeroSignalFlow />

          <div className="mt-7 flex flex-wrap gap-2">
            {heroTrustItems.map((item) => (
              <span key={item} className="font-time rounded-full border border-[var(--paper-line)] bg-white/74 px-3 py-2 text-xs font-semibold text-[var(--ink-soft)]">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-8 hidden gap-3 lg:grid lg:grid-cols-3">
            {proofStats.map((stat) => (
              <AnimatedNumber key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        <OperationControlRoom />
      </div>

      <div className="industry-switcher mx-auto mt-12 max-w-[1320px] rounded-[2rem] border border-white/70 bg-white/72 p-3 shadow-[0_20px_70px_rgba(23,26,33,0.11)]">
        <div className="grid gap-2 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <p className="font-time px-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cobalt)]">
            Vyberte tempo provozu
          </p>
          <div className="flex gap-2 overflow-x-auto">
            {industryProfiles.map((industry) => {
              const isActive = industry.id === activeIndustry.id;

              return (
                <button
                  key={industry.id}
                  type="button"
                  className={`temaro-focus-ring flex min-w-max items-center gap-2 rounded-full px-4 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-[var(--ink)] text-white"
                      : "bg-[var(--porcelain)] text-[var(--ink-soft)] hover:bg-[var(--cobalt-tint)] hover:text-[var(--cobalt)]"
                  }`}
                  onClick={() => setActiveIndustryId(industry.id)}
                >
                  <Scissors className="size-4" strokeWidth={1.9} />
                  {industry.label}
                </button>
              );
            })}
          </div>
          <div className="rounded-[1.35rem] bg-[var(--porcelain)] px-4 py-3">
            <p className="font-bold text-[var(--ink)]">{activeIndustry.business}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">
              {activeIndustry.promise} · <span className="font-time">{activeIndustry.cue}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1320px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {productMoments.map(({ icon: Icon, title, text }) => (
          <article key={title} className="rounded-[1.5rem] border border-[var(--paper-line)] bg-white/74 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-2xl bg-[var(--cobalt-tint)] text-[var(--cobalt)]">
                <Icon className="size-5" strokeWidth={1.9} />
              </span>
              <div>
                <p className="font-bold">{title}</p>
                <p className="text-sm font-semibold text-[var(--ink-soft)]">{text}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
