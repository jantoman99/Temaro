"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutPanelTop,
  Link2,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const productSurfaces = [
  { id: "overview", label: "Přehled provozu", icon: LayoutPanelTop },
  { id: "calendar", label: "Týmový kalendář", icon: CalendarDays },
  { id: "booking", label: "Rezervační stránka", icon: Link2 },
  { id: "account", label: "Zákaznický účet", icon: UsersRound },
] as const;

type ProductSurfaceId = (typeof productSurfaces)[number]["id"];

const kpiItems = [
  ["Dnešní rezervace", "12", "stabilní den", "bg-[#EAF6FF] text-[#0B5CAD] border-[#BFE1FF]"],
  ["Tržba dnes", "8 400 Kč", "z dokončených rezervací", "bg-[#EAF7EF] text-[#146B3A] border-[#BDE8CE]"],
  ["Volná okna", "3", "kapacita dostupná", "bg-[#FFF5E9] text-[#8A4B14] border-[#F4D3AA]"],
  ["Riziko", "1", "vyžaduje pozornost", "bg-[#FDECEC] text-[#B42318] border-[#F5C2C0]"],
] as const;

const agendaRows = [
  { time: "09:00", title: "Pánský střih", client: "Adam Novák", state: "Potvrzeno", tone: "confirm" },
  { time: "10:30", title: "Konzultace", client: "Lucie Veselá", state: "Čeká", tone: "wait" },
  { time: "13:15", title: "Barva + styling", client: "Eva Nováková", state: "Potvrzeno", tone: "confirm" },
  { time: "15:00", title: "Úprava vousů", client: "Petr Marek", state: "Riziko", tone: "risk" },
] as const;

const toneClassNames = {
  confirm: "border-[#BDE8CE] bg-[#F0FBF4] text-[#146B3A] before:bg-[#2EAD63]",
  wait: "border-[#F4D3AA] bg-[#FFF8EC] text-[#8A4B14] before:bg-[#E8A23A]",
  risk: "border-[#F5C2C0] bg-[#FFF0F0] text-[#B42318] before:bg-[#E5484D]",
} as const;

const calendarColumns = [
  { day: "Po", bookings: 4, height: 54 },
  { day: "Út", bookings: 7, height: 82 },
  { day: "St", bookings: 5, height: 66 },
  { day: "Čt", bookings: 8, height: 92 },
  { day: "Pá", bookings: 6, height: 74 },
] as const;

const bookingServices = [
  ["Pánský střih", "45 min", "450 Kč"],
  ["Střih + vousy", "60 min", "690 Kč"],
  ["Barva + styling", "90 min", "1 290 Kč"],
] as const;

const accountBookings = [
  ["Zítra 10:30", "Pánský střih", "Přesun možný"],
  ["12. 6. 15:00", "Úprava vousů", "Potvrzeno"],
  ["Historie", "Barva + styling", "Dokončeno"],
] as const;

const heroTrustItems = ["Bez karty na start", "Bez provize z vašich klientů", "Vlastní rezervační odkaz"] as const;

function SurfacePanel({ activeSurfaceId }: { activeSurfaceId: ProductSurfaceId }) {
  if (activeSurfaceId === "calendar") {
    return (
      <div className="grid h-full content-start gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Kalendář</p>
            <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Týden podle týmu</h2>
          </div>
          <span className="font-time rounded-full bg-[var(--cobalt-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--cobalt)]">
            3 lidé
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {calendarColumns.map((column) => (
            <div key={column.day} className="rounded-2xl border border-[var(--paper-line)] bg-[var(--porcelain)] p-2">
              <p className="text-center text-xs font-bold text-[var(--ink-soft)]">{column.day}</p>
              <div className="mt-3 flex h-28 items-end rounded-xl bg-white p-1 shadow-inner lg:h-32">
                <div className="w-full rounded-lg bg-[var(--cobalt)]" style={{ height: `${column.height}%` }} />
              </div>
              <p className="font-time mt-2 text-center text-sm font-semibold text-[var(--ink)]">{column.bookings}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-2 rounded-2xl border border-[var(--paper-line)] bg-white p-3 sm:grid-cols-3">
          {["Tereza", "Adam", "Nela"].map((name) => (
            <span key={name} className="rounded-xl bg-[var(--porcelain)] px-3 py-2 text-xs font-bold text-[var(--ink-soft)]">
              {name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (activeSurfaceId === "booking") {
    return (
      <div className="grid h-full content-start gap-4">
        <div>
          <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Veřejná rezervační stránka</p>
          <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">To, co posíláte klientům</h2>
          <p className="mt-2 text-sm font-semibold leading-5 text-[var(--ink-soft)]">
            Služby, tým a volné časy bez další administrace.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold">Hair Studio Luna</p>
              <p className="text-xs font-semibold text-[var(--ink-soft)]">8 služeb, 3 lidé v kalendáři</p>
            </div>
            <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-bold text-[var(--mint-ink)]">Veřejná</span>
          </div>
          <div className="mt-4 grid gap-2">
            {bookingServices.map(([service, duration, price]) => (
              <div key={service} className="grid grid-cols-[1fr_auto] gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div>
                  <p className="font-bold">{service}</p>
                  <p className="font-time mt-1 text-xs font-semibold text-[var(--ink-soft)]">{duration}</p>
                </div>
                <p className="font-time text-sm font-semibold text-[var(--cobalt)]">{price}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeSurfaceId === "account") {
    return (
      <div className="grid h-full content-start gap-4">
        <div>
          <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Zákaznický účet</p>
          <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">Moje rezervace</h2>
          <p className="mt-2 text-sm font-semibold leading-5 text-[var(--ink-soft)]">
            Klient vidí termíny a změny bez dalšího telefonátu.
          </p>
        </div>
        <div className="grid gap-2">
          {accountBookings.map(([date, service, state]) => (
            <div key={`${date}-${service}`} className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 rounded-2xl border border-[var(--paper-line)] bg-[var(--porcelain)] p-3">
              <span className="grid size-11 place-items-center rounded-xl bg-[var(--mint)] text-[var(--mint-ink)]">
                <Clock3 className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{service}</p>
                <p className="truncate text-xs font-semibold text-[var(--ink-soft)]">{date}</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--ink-soft)] shadow-sm">{state}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-full content-start gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Dnes</p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] sm:text-3xl">Přehled provozu</h2>
        </div>
        <button className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--cobalt)] px-4 text-xs font-bold text-white">
          Otevřít kalendář
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {kpiItems.map(([label, value, trend, className]) => (
          <article key={label} className={`rounded-2xl border p-3 sm:p-4 ${className}`}>
            <p className="font-time text-[0.66rem] font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p>
            <p className="font-display mt-2 text-3xl font-semibold tracking-[-0.05em] text-[var(--ink)] sm:text-4xl">{value}</p>
            <p className="font-time mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] opacity-75">{trend}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-2">
        {agendaRows.slice(0, 3).map((row, index) => (
          <article
            key={`${row.time}-${row.client}`}
            className={`relative grid grid-cols-[4rem_1fr_auto] items-center gap-3 rounded-2xl border p-3 pl-4 shadow-sm before:absolute before:inset-y-3 before:left-2 before:w-1 before:rounded-full ${toneClassNames[row.tone]} ${index === 2 ? "product-window-active" : ""}`}
          >
            <p className="font-time text-xs font-bold text-[var(--ink)] sm:text-sm">{row.time}</p>
            <div className="min-w-0">
              <p className="truncate font-bold text-[var(--ink)]">{row.title}</p>
              <p className="truncate text-xs font-semibold text-[var(--ink-soft)]">{row.client}</p>
            </div>
            <span className="hidden rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--ink)] shadow-sm sm:inline-flex">{row.state}</span>
          </article>
        ))}
      </div>
    </div>
  );
}

function BookingPhonePreview() {
  return (
    <aside className="booking-phone-preview absolute -bottom-5 right-4 hidden w-[232px] rounded-[2rem] border-[8px] border-[var(--ink)] bg-white p-3 text-[var(--ink)] shadow-[0_28px_70px_rgba(23,26,33,0.26)] xl:block">
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[var(--ink)]/12" />
      <p className="font-time text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">Online rezervace</p>
      <h3 className="mt-1 text-xl font-black tracking-[-0.04em]">Hair Studio Luna</h3>
      <div className="mt-3 grid gap-2">
        {["Střih + foukaná", "Barva + styling"].map((service) => (
          <div key={service} className="rounded-2xl bg-[var(--porcelain)] p-3">
            <p className="text-sm font-bold">{service}</p>
            <p className="font-time mt-1 text-xs font-semibold text-[var(--ink-soft)]">45-90 min</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {["10:30", "12:30", "15:00"].map((time, index) => (
          <span key={time} className={`font-time shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${index === 1 ? "bg-[var(--cobalt)] text-white" : "bg-[var(--cobalt-tint)] text-[var(--cobalt)]"}`}>
            {time}
          </span>
        ))}
      </div>
      <button className="mt-3 h-10 w-full rounded-full bg-[var(--ink)] text-sm font-bold text-white">Rezervovat</button>
    </aside>
  );
}

function ProductWindowHero() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeSurfaceId, setActiveSurfaceId] = useState<ProductSurfaceId>("overview");
  const activeSurface = productSurfaces.find((surface) => surface.id === activeSurfaceId) ?? productSurfaces[0];

  useEffect(() => {
    if (reduceMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setActiveSurfaceId((current) => {
        const currentIndex = productSurfaces.findIndex((surface) => surface.id === current);
        return productSurfaces[(currentIndex + 1) % productSurfaces.length].id;
      });
    }, 4600);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion]);

  return (
    <section id="produkt" className="business-discovery-hero product-window-hero temaro-time-hero relative overflow-hidden pt-24 sm:pt-28">
      <div className="mx-auto grid min-h-[760px] w-full max-w-[1360px] items-center gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[0.76fr_1.24fr] lg:px-8 lg:pb-20">
        <div className="relative z-10 max-w-2xl">
          <p className="section-eyebrow">Rezervační systém pro salony a služby</p>
          <h1 className="font-display mt-5 text-balance text-[3.45rem] font-semibold leading-[0.94] text-[var(--ink)] sm:text-7xl lg:text-[5.9rem]">
            Rezervace, které vidíte hned v kalendáři.
          </h1>
          <p className="mt-5 max-w-xl text-lg font-normal leading-[1.45] text-[var(--ink-soft)] sm:mt-6 sm:text-2xl">
            Temaro ukazuje majiteli i klientovi stejnou pravdu: volný čas, potvrzenou rezervaci, rizikový termín a další krok bez telefonátu.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/register"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-7 text-base font-bold text-white shadow-[0_18px_46px_rgba(43,63,242,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--cobalt-deep)]"
            >
              Začít zdarma
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white/78 px-7 text-base font-bold text-[var(--ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--cobalt)]"
            >
              Spustit produktovou ukázku
            </Link>
          </div>

          <div className="mt-6 hidden gap-2 sm:grid sm:grid-cols-3">
            {heroTrustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2 text-sm font-bold text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)]">
                <CheckCircle2 className="size-4 text-[var(--mint-ink)]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="relative z-10 min-w-0" aria-label="Reálný produktový pohled Temaro" aria-live="off">
          <div className="product-window-frame relative rounded-[2rem] border border-white/70 bg-[var(--ink)] p-3 shadow-[0_44px_120px_rgba(23,26,33,0.22)]">
            <div className="overflow-hidden rounded-[1.55rem] bg-[#ECE8DF]">
              <div className="flex items-center justify-between gap-3 bg-[var(--ink)] px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#E5484D]" />
                  <span className="size-2.5 rounded-full bg-[#FFB98A]" />
                  <span className="size-2.5 rounded-full bg-[#BFEAD4]" />
                </div>
                <span className="font-time rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white/72">
                  Reálný pohled po přihlášení
                </span>
              </div>

              <div className="grid min-h-[560px] lg:grid-cols-[13rem_minmax(0,1fr)]">
                <nav className="hidden bg-[var(--ink)] p-4 text-white lg:block" aria-label="Ukázkové produktové plochy">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[var(--cobalt)] text-white">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Studio Luna</p>
                      <p className="text-xs font-semibold text-white/54">Demo provoz</p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-1.5">
                    {productSurfaces.map((surface) => {
                      const Icon = surface.icon;
                      const isActive = activeSurface.id === surface.id;

                      return (
                        <button
                          key={surface.id}
                          type="button"
                          className={`relative flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold transition ${isActive ? "bg-white/12 text-white" : "text-white/56 hover:bg-white/8 hover:text-white"}`}
                          onClick={() => setActiveSurfaceId(surface.id)}
                        >
                          {isActive ? <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[var(--cobalt)]" /> : null}
                          <Icon className="size-4" />
                          {surface.label}
                        </button>
                      );
                    })}
                  </div>
                </nav>

                <div className="min-w-0 p-3 sm:p-5">
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                    {productSurfaces.map((surface) => (
                      <button
                        key={surface.id}
                        type="button"
                        onClick={() => setActiveSurfaceId(surface.id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${activeSurface.id === surface.id ? "bg-[var(--cobalt)] text-white" : "bg-white text-[var(--ink-soft)]"}`}
                      >
                        {surface.label}
                      </button>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[var(--paper-line)] bg-white px-3 py-2 shadow-sm">
                    <Search className="size-4 shrink-0 text-[var(--ink-soft)]" />
                    <span className="truncate text-xs font-semibold text-[var(--ink-soft)]">Hledat klienta nebo službu</span>
                  </div>

                  <div className="min-h-[380px] rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-4 shadow-sm sm:min-h-[448px] sm:p-5">
                    <SurfacePanel activeSurfaceId={activeSurface.id} />
                  </div>
                </div>
              </div>
            </div>
            <BookingPhonePreview />
          </div>
        </aside>
      </div>
    </section>
  );
}

export function BusinessDiscoveryHero() {
  return <ProductWindowHero />;
}
