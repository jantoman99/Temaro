"use client";

import {
  ArrowRight,
  BellRing,
  CalendarDays,
  Clock3,
  Globe2,
  MessageCircle,
  QrCode,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect width="15.5" height="15.5" x="4.25" y="4.25" rx="4.2" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.35" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="16.9" cy="7.35" r="1.05" fill="currentColor" />
    </svg>
  );
}

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

const heroStats = [
  { value: "16:00", label: "volné", signal: "16:00 volné", tone: "mint" },
  { value: "10:30", label: "čeká", signal: "10:30 čeká", tone: "apricot" },
  { value: "0 Kč", label: "provize", signal: "0 Kč provize", tone: "ink" },
] as const;

const channelCards = [
  {
    icon: InstagramGlyph,
    label: "Instagram",
    title: "Story odkaz",
    note: "16:00 volné okno",
    tone: "instagram",
  },
  {
    icon: Search,
    label: "Google",
    title: "Profil podniku",
    note: "nový klient",
    tone: "google",
  },
  {
    icon: QrCode,
    label: "QR",
    title: "Recepce",
    note: "rychlá rezervace",
    tone: "qr",
  },
  {
    icon: Globe2,
    label: "Web",
    title: "Web podniku",
    note: "bez marketplace",
    tone: "web",
  },
] as const;

const bookingRows = [
  {
    time: "08:30",
    title: "Pánský střih",
    meta: "Adam · potvrzeno",
    tone: "confirmed",
  },
  {
    time: "10:30",
    title: "Konzultace",
    meta: "Lucie · čeká na potvrzení",
    tone: "pending",
  },
  {
    time: "16:00",
    title: "Nová rezervace",
    meta: "Instagram · SMS připravena",
    tone: "new",
  },
] as const;

const proofFlow = [
  { label: "Story", text: "klient bere odkaz", tone: "instagram" },
  { label: "Volný slot", text: "16:00 drží kalendář", tone: "mint" },
  { label: "SMS", text: "připomínka připravena", tone: "cobalt" },
] as const;

const productMoments = [
  { icon: CalendarDays, title: "Kalendář", text: "tým, volno a riziko" },
  { icon: Smartphone, title: "Rezervace", text: "mobilní rezervace" },
  { icon: UsersRound, title: "Klienti", text: "historie a preference" },
  { icon: ShieldCheck, title: "Bez provize", text: "vlastní klienti zůstávají vám" },
] as const;

function ChannelCard({
  channel,
}: {
  channel: (typeof channelCards)[number];
}) {
  return (
    <article className={`temaro-channel-card ${channel.tone}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-[var(--ink)] shadow-sm">
        <channel.icon className="size-5" strokeWidth={1.9} />
      </span>
      <div>
        <p className="font-time text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          {channel.label}
        </p>
        <h3 className="mt-1 text-base font-bold tracking-[-0.02em]">{channel.title}</h3>
        <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">{channel.note}</p>
      </div>
    </article>
  );
}

function SalonCommandWall() {
  return (
    <div className="temaro-salon-wall">
      <div className="temaro-hero-photo">
        <Image
          src="/marketing/hero/salon-command-wall.webp"
          alt="Atmosférický barber a salon interiér pro ukázku provozu Temaro"
          fill
          priority
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-cover"
        />
        <div className="temaro-photo-badge">
          <Clock3 className="size-4" strokeWidth={1.9} />
          Dnes 16:00 volné
        </div>
      </div>

      <div className="temaro-booking-stack">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Živý provoz</p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em]">Rezervace dne</h2>
          </div>
          <span className="rounded-full bg-[var(--mint)] px-3 py-1.5 text-xs font-bold text-[var(--mint-ink)]">
            bez volání
          </span>
        </div>

        <div className="mt-5 grid gap-2">
          {bookingRows.map((booking) => (
            <article key={`${booking.time}-${booking.title}`} className={`temaro-booking-row ${booking.tone}`}>
              <span className="temaro-booking-time font-time">{booking.time}</span>
              <div>
                <p className="font-bold">{booking.title}</p>
                <p className="text-sm font-semibold text-[var(--ink-soft)]">{booking.meta}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="temaro-risk-strip mt-4 grid gap-2 rounded-[1.25rem] bg-[var(--ink)] p-3 text-white">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-[var(--mint)]" strokeWidth={1.9} />
            <p className="text-sm font-bold">SMS připomínka připravena</p>
          </div>
          <div className="flex items-center gap-2">
            <BellRing className="size-4 text-[var(--apricot)]" strokeWidth={1.9} />
            <p className="text-sm font-bold">No-show signál u 10:30</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-white" strokeWidth={1.9} />
            <p className="text-sm font-bold">Záloha 300 Kč připravena</p>
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
    <section id="produkt" className="temaro-time-atelier-hero temaro-salon-hero relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 sm:pb-20 lg:px-8">
      <div className="mx-auto grid w-full max-w-[1320px] gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white/88 px-3 py-2 text-sm font-bold text-[var(--ink)] shadow-sm">
            <Scissors className="size-4 text-[var(--cobalt)]" strokeWidth={1.9} />
            Rezervace ze všech kanálů
          </div>

          <h1 className="font-display mt-7 text-balance text-[clamp(3rem,7vw,7.1rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
            Klienti rezervují. Kalendář drží den.
          </h1>

          <p className="temaro-command-copy mt-7 max-w-2xl text-pretty text-xl font-semibold leading-8 text-[var(--ink-soft)]">
            Instagram, Google, QR i web posílají termíny rovnou do jednoho dne.
          </p>

          <div className="temaro-channel-dock mt-7 flex flex-wrap gap-2">
            {channelCards.map((channel) => (
              <span key={channel.label} className={`temaro-channel-pill ${channel.tone}`}>
                <channel.icon className="size-4" />
                {channel.label}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
              Vidět ukázku
            </Link>
          </div>

          <div className="mt-8 hidden gap-3 sm:grid sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} aria-label={stat.signal} className={`temaro-stat-card ${stat.tone}`}>
                <p className="font-time text-3xl font-semibold text-[var(--ink)]">{stat.value}</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-[var(--ink-soft)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <SalonCommandWall />
      </div>

      <div className="temaro-hero-channels mx-auto mt-10 grid max-w-[1320px] gap-3 md:grid-cols-4">
        {channelCards.map((channel) => (
          <ChannelCard key={channel.label} channel={channel} />
        ))}
      </div>

      <div className="temaro-proof-flow mx-auto mt-4 grid max-w-[1320px] gap-3 md:grid-cols-3">
        {proofFlow.map((step, index) => (
          <article key={step.label} className={`temaro-proof-step ${step.tone}`}>
            <span className="font-time text-xs font-semibold uppercase tracking-[0.16em]">0{index + 1}</span>
            <div>
              <h3 className="text-lg font-bold tracking-[-0.03em]">{step.label}</h3>
              <p className="text-sm font-semibold text-[var(--ink-soft)]">{step.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="industry-switcher mx-auto mt-8 max-w-[1320px] rounded-[2rem] border border-white/70 bg-white/72 p-3 shadow-[0_20px_70px_rgba(23,26,33,0.11)]">
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

      <div className="mx-auto mt-8 grid max-w-[1320px] gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
