"use client";

import {
  ArrowRight,
  Bell,
  CalendarDays,
  CreditCard,
  Globe2,
  Menu,
  QrCode,
  Search,
  Settings,
  Smile,
  Tag,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <rect width="15.5" height="15.5" x="4.25" y="4.25" rx="4.2" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="3.35" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="16.9" cy="7.35" r="1.05" fill="currentColor" />
    </svg>
  );
}

const calendarEvents = [
  {
    time: "08:30",
    title: "Pánský střih",
    source: "Web",
    staff: "Adam",
    tone: "apricot",
  },
  {
    time: "10:30",
    title: "Barva a foukaná",
    source: "Google",
    staff: "Lucie",
    tone: "mint",
  },
  {
    time: "12:15",
    title: "Kosmetika",
    source: "QR",
    staff: "Eva",
    tone: "blue",
  },
  {
    time: "16:00",
    title: "Nová rezervace",
    source: "Instagram",
    staff: "Lucie",
    tone: "ink",
  },
] as const;

const sourceChannels = [
  { icon: Globe2, label: "Web podniku" },
  { icon: InstagramGlyph, label: "Instagram" },
  { icon: Search, label: "Google" },
  { icon: QrCode, label: "QR recepce" },
] as const;

const heroPhotoCards = [
  {
    src: "/marketing/premium/salon-hero-wide.webp",
    label: "Kadeřnictví",
    title: "Barva a foukaná",
  },
  {
    src: "/marketing/premium/barber-chair.webp",
    label: "Barber",
    title: "Volné okno",
  },
  {
    src: "/marketing/premium/beauty-room.webp",
    label: "Beauty",
    title: "Klientská karta",
  },
  {
    src: "/marketing/industries/massage-wide.webp",
    label: "Masáže",
    title: "Klidný blok",
  },
] as const;

const productNavItems = [
  { icon: CalendarDays, label: "Kalendář", active: true },
  { icon: Tag, label: "Služby", active: false },
  { icon: UsersRound, label: "Klienti", active: false },
  { icon: CreditCard, label: "Platby", active: false },
  { icon: Settings, label: "Nastavení", active: false },
] as const;

function PremiumProductStage() {
  return (
    <div className="temaro-premium-stage temaro-hero-product-visual">
      <div className="temaro-premium-product temaro-product-desktop">
        <nav className="temaro-product-side-nav" aria-label="Produktové moduly">
          {productNavItems.map(({ icon: Icon, label, active }) => (
            <span key={label} className={active ? "active" : undefined} aria-label={label}>
              <Icon className="size-4" strokeWidth={2} />
            </span>
          ))}
        </nav>

        <div className="temaro-product-topbar">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-[var(--cobalt)] text-sm font-black text-white">
              T
            </div>
            <div>
              <p className="text-sm font-black tracking-[-0.02em]">Temaro</p>
              <p className="font-time text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                Dnes v salonu
              </p>
            </div>
          </div>
          <div className="temaro-product-action-icons">
            <Search className="size-4" strokeWidth={2} />
            <Bell className="size-4" strokeWidth={2} />
            <Smile className="size-6 rounded-full bg-[var(--apricot)] p-1 text-[var(--ink)]" strokeWidth={2} />
          </div>
          <div className="hidden flex-wrap gap-2 md:flex">
            {sourceChannels.map(({ icon: Icon, label }) => (
              <span key={label} className="temaro-premium-channel">
                <Icon className="size-4" strokeWidth={1.9} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="temaro-product-calendar">
          <div className="temaro-product-rail">
            {["08", "10", "12", "14", "16"].map((hour) => (
              <span key={hour}>{hour}:00</span>
            ))}
          </div>
          <div className="temaro-product-grid">
            {["Adam", "Lucie", "Eva", "Recepce"].map((staff) => (
              <div key={staff} className="temaro-product-staff">
                <span>{staff}</span>
              </div>
            ))}
            {calendarEvents.map((event, index) => (
              <article key={`${event.time}-${event.title}`} className={`temaro-calendar-event ${event.tone} event-${index + 1}`}>
                <p className="font-time text-xs font-semibold">{event.time}</p>
                <h3>{event.title}</h3>
                <span>{event.source}</span>
              </article>
            ))}
          </div>
          <aside className="temaro-booking-detail-card">
            <p className="font-time text-xs font-semibold uppercase tracking-[0.14em] text-[var(--cobalt)]">
              Nová rezervace
            </p>
            <h3>16:00 z Instagramu</h3>
            <div className="temaro-booking-client">
              <div className="grid size-11 place-items-center rounded-full bg-[var(--mint)] text-sm font-black text-[var(--ink)]">
                MK
              </div>
              <div>
                <strong>Klientská karta</strong>
                <small>poznámka, historie, zdroj</small>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              <span>Lucie čeká na potvrzení</span>
              <span className="paid">300 Kč záloha připravena</span>
              <span>SMS připomínka připravena</span>
            </div>
          </aside>
        </div>
      </div>

      <div className="temaro-product-phone" aria-label="Mobilní náhled rezervací">
        <div className="temaro-phone-top">
          <Menu className="size-4" strokeWidth={2} />
          <span>Středa</span>
          <CalendarDays className="size-4" strokeWidth={2} />
        </div>
        <div className="grid gap-2">
          {calendarEvents.slice(1).map((event) => (
            <article key={event.time} className={`temaro-phone-event ${event.tone}`}>
              <span>{event.time}</span>
              <strong>{event.title}</strong>
              <small>{event.source}</small>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BusinessDiscoveryHero() {
  return (
    <section
      id="produkt"
      className="temaro-time-atelier-hero temaro-premium-hero relative overflow-hidden px-4 pb-0 pt-28 sm:px-6 sm:pt-32 lg:px-8"
    >
      <div className="temaro-fresha-product-hero mx-auto w-full max-w-[1320px]">
        <div className="temaro-fresha-copy-shell temaro-premium-copy mx-auto min-w-0 w-full max-w-[56rem] text-center">
          <p className="font-time text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-soft)]">
            Rezervační systém pro služby
          </p>
          <h1 className="font-display mx-auto mt-5 max-w-full break-words text-balance text-[clamp(2.35rem,10.5vw,2.95rem)] font-semibold leading-[0.92] tracking-[-0.065em] sm:max-w-4xl sm:text-[clamp(4.2rem,6.5vw,6.35rem)] sm:leading-[0.88] sm:tracking-[-0.078em]">
            <span className="block">Plnější kalendář</span>
            <span className="temaro-premium-highlight block sm:inline-block">bez volání.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[40rem] text-pretty text-base font-semibold leading-7 text-[var(--ink-soft)] sm:text-xl sm:leading-8">
            Online rezervace, klienti, SMS a zálohy v jednom pohledu pro salony, barbery a služby.
          </p>

          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/register"
              className="temaro-focus-ring group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-7 text-base font-bold text-white shadow-[0_22px_58px_rgba(0,0,0,0.24)] transition hover:-translate-y-0.5 hover:bg-black"
            >
              Registrovat salon
              <ArrowRight className="size-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-14 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-7 text-base font-bold text-[var(--ink)] transition hover:border-[var(--ink)]"
            >
              Vidět ukázku
            </Link>
          </div>

          <div className="mx-auto mt-7 grid max-w-[32rem] grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center">
            {["Salony", "Barbeři", "Beauty", "Masáže"].map((item) => (
              <span key={item} className="temaro-hero-segment-pill">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="temaro-fresha-product-shell temaro-hero-photo-stack" aria-label="Temaro pro salony a služby">
          <div className="temaro-product-glow" aria-hidden="true" />
          {heroPhotoCards.map((card, index) => (
            <article key={card.src} className={`temaro-hero-photo-card card-${index + 1}`}>
              <Image
                src={card.src}
                alt={`${card.label} v Temaro`}
                fill
                sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 84vw"
                priority={index === 0}
              />
              <div>
                <span>{card.label}</span>
                <strong>{card.title}</strong>
              </div>
            </article>
          ))}
          <PremiumProductStage />
          <aside className="temaro-hero-platform-card" aria-label="Produktová zkratka">
            <span>Bez marketplace provize</span>
            <strong>Web, Instagram, Google a QR v jednom kalendáři.</strong>
          </aside>
        </div>
      </div>
    </section>
  );
}
