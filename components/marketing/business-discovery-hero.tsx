"use client";

import {
  ArrowRight,
  CalendarDays,
  CreditCard,
  Globe2,
  MessageCircle,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
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

const freshaPremiumStats = [
  { value: "24/7", label: "online rezervace" },
  { value: "0 Kč", label: "provize z vlastních kanálů" },
  { value: "1 den", label: "kalendář, klient i platba" },
] as const;

const premiumProductColumns = [
  {
    icon: InstagramGlyph,
    label: "Online rezervace",
    title: "16:00 z Instagramu",
    note: "klient vybral volný čas",
    tone: "apricot",
  },
  {
    icon: CalendarDays,
    label: "Týmový kalendář",
    title: "Adam / Lucie / Eva",
    note: "den bez kolizí",
    tone: "mint",
  },
  {
    icon: UsersRound,
    label: "Klientská karta",
    title: "Lucie čeká na potvrzení",
    note: "historie, poznámka, no-show signál",
    tone: "porcelain",
  },
  {
    icon: CreditCard,
    label: "SMS a záloha",
    title: "300 Kč připraveno",
    note: "SMS připomínka připravena",
    tone: "ink",
  },
] as const;

const salonImageTiles = [
  {
    src: "/marketing/premium/salon-hero-wide.webp",
    alt: "Světlý salon interiér pro Temaro",
    label: "Beauty provoz",
  },
  {
    src: "/marketing/premium/beauty-room.webp",
    alt: "Kosmetický provoz pro online rezervace",
    label: "Klienti",
  },
  {
    src: "/marketing/premium/barber-chair.webp",
    alt: "Barber pracovní místo pro Temaro",
    label: "Barber",
  },
  {
    src: "/marketing/premium/salon-detail.webp",
    alt: "Detail salon provozu pro Temaro",
    label: "Wellness",
  },
] as const;

const sourceChannels = [
  { icon: Globe2, label: "Web podniku" },
  { icon: InstagramGlyph, label: "Instagram" },
  { icon: Search, label: "Google" },
  { icon: QrCode, label: "QR recepce" },
] as const;

function PremiumProductStage() {
  return (
    <div className="temaro-premium-stage">
      <div className="temaro-premium-product">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--paper-line)] p-4 sm:p-5">
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
              Dnešní provoz
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Salon v jednom pohledu</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {sourceChannels.map(({ icon: Icon, label }) => (
              <span key={label} className="temaro-premium-channel">
                <Icon className="size-4" strokeWidth={1.9} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:p-5 lg:grid-cols-4">
          {premiumProductColumns.map((column) => (
            <article key={column.label} className={`temaro-premium-product-column ${column.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-white/78 text-[var(--ink)]">
                  <column.icon className="size-5" strokeWidth={1.9} />
                </span>
                <span className="font-time text-[0.68rem] font-semibold uppercase tracking-[0.14em] opacity-70">
                  {column.label}
                </span>
              </div>
              <h3 className="mt-9 text-2xl font-bold tracking-[-0.04em]">{column.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 opacity-75">{column.note}</p>
            </article>
          ))}
        </div>

        <div className="temaro-premium-flow-card mx-4 mb-4 grid gap-3 rounded-[1.4rem] bg-[var(--ink)] p-4 text-white sm:mx-5 sm:mb-5 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="size-4 text-[var(--mint)]" strokeWidth={1.9} />
            <p className="text-sm font-bold">SMS připomínka připravena</p>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-[var(--apricot)]" strokeWidth={1.9} />
            <p className="text-sm font-bold">vlastní klienti zůstávají vám</p>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="size-4 text-white" strokeWidth={1.9} />
            <p className="text-sm font-bold">záloha připravená bez volání</p>
          </div>
        </div>
      </div>

      <div className="temaro-salon-image-strip">
        {salonImageTiles.map((tile, index) => (
          <figure key={tile.label} className={`temaro-salon-image-tile tile-${index + 1}`}>
            <Image
              src={tile.src}
              alt={tile.alt}
              fill
              sizes="(min-width: 1024px) 24vw, 48vw"
              className="object-cover"
            />
            <figcaption>{tile.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function BusinessDiscoveryHero() {
  return (
    <section
      id="produkt"
      className="temaro-time-atelier-hero temaro-premium-hero relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8"
    >
      <div className="temaro-premium-copy mx-auto max-w-[1120px] text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white/86 px-4 py-2 text-sm font-bold text-[var(--ink)] shadow-sm">
          <Sparkles className="size-4 text-[var(--cobalt)]" strokeWidth={1.9} />
          Salon platforma Temaro
        </div>

        <h1 className="font-display mx-auto mt-5 max-w-6xl text-balance text-[clamp(2.85rem,13vw,3.45rem)] font-semibold leading-[0.92] tracking-[-0.078em] sm:mt-7 sm:text-[clamp(3.35rem,8.6vw,8.4rem)] sm:leading-[0.88]">
          Rezervace, platby a klienti <span className="temaro-premium-highlight">v jednom salon systému.</span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base font-semibold leading-7 text-[var(--ink-soft)] sm:mt-6 sm:text-xl sm:leading-8">
          Temaro spojí web, Instagram, Google a QR do jednoho přehledného kalendáře.
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

        <div className="mx-auto mt-7 grid max-w-3xl gap-2 sm:grid-cols-3">
          {freshaPremiumStats.map((stat) => (
            <div key={stat.label} className="temaro-premium-stat">
              <p className="font-time text-xl font-semibold text-[var(--ink)]">{stat.value}</p>
              <p className="text-xs font-bold text-[var(--ink-soft)]">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <PremiumProductStage />
    </section>
  );
}
