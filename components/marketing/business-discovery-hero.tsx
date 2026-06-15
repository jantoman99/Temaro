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
    label: "Kadeřnictví",
    detail: "10:30 barva a foukaná",
    image: "/marketing/industries/hair-salon-wide.webp",
    alt: "Kadeřnické studio s pracovními místy",
  },
  {
    label: "Barber",
    detail: "08:30 pánský střih",
    image: "/marketing/industries/barber.webp",
    alt: "Barber studio s křeslem pro střih",
  },
  {
    label: "Beauty",
    detail: "12:15 kosmetika",
    image: "/marketing/industries/beauty.webp",
    alt: "Beauty salon připravený na rezervaci",
  },
] as const;

const productNavItems = [
  { icon: CalendarDays, label: "Kalendář", active: true },
  { icon: Tag, label: "Služby", active: false },
  { icon: UsersRound, label: "Klienti", active: false },
  { icon: CreditCard, label: "Platby", active: false },
  { icon: Settings, label: "Nastavení", active: false },
] as const;

function HeroPhotoRibbon() {
  return (
    <div className="temaro-hero-photo-ribbon" aria-label="Typy služeb v Temaro kalendáři">
      {heroPhotoCards.map(({ label, detail, image, alt }, index) => (
        <figure key={label} className="temaro-hero-photo-card">
          <Image
            src={image}
            alt={alt}
            fill
            loading={index === 0 ? undefined : "lazy"}
            preload={index === 0}
            sizes="(max-width: 640px) 30vw, 220px"
          />
          <figcaption>
            <strong>{label}</strong>
            <span>{detail}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

function PremiumProductStage() {
  return (
    <div className="temaro-premium-stage temaro-hero-product-visual">
      <HeroPhotoRibbon />
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
      className="temaro-time-atelier-hero temaro-premium-hero relative overflow-hidden px-4 pb-12 pt-28 sm:px-6 sm:pb-16 sm:pt-32 lg:px-8"
    >
      <div className="temaro-premium-copy mx-auto max-w-[1040px] text-center">
        <h1 className="font-display mx-auto max-w-5xl text-balance text-[clamp(3.2rem,13vw,4rem)] font-semibold leading-[0.92] tracking-[-0.078em] sm:text-[clamp(3.8rem,7.2vw,7rem)] sm:leading-[0.88]">
          Plnější kalendář <span className="temaro-premium-highlight">bez volání.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base font-semibold leading-7 text-[var(--ink-soft)] sm:text-xl sm:leading-8">
          Online rezervace, klienti, SMS a zálohy v jednom pohledu pro salony, barbery a služby.
        </p>

        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:mt-7 sm:flex-row">
          <Link
            href="/register"
            className="temaro-focus-ring group inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-7 text-base font-bold text-white shadow-[0_18px_44px_rgba(43,63,242,0.24)] transition hover:-translate-y-0.5 hover:bg-[var(--cobalt-deep)] sm:w-auto"
          >
            Registrovat salon
            <ArrowRight className="size-5 transition group-hover:translate-x-1" />
          </Link>
          <Link
            href="/ukazka"
            className="temaro-focus-ring inline-flex h-13 w-full items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-7 text-base font-bold text-[var(--ink)] transition hover:border-[var(--cobalt)] sm:w-auto"
          >
            Vidět ukázku
          </Link>
        </div>

      </div>

      <PremiumProductStage />
    </section>
  );
}
