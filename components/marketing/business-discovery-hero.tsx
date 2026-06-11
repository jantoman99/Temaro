"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Link2,
  MapPin,
  QrCode,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const industryProfiles = [
  {
    id: "barber",
    label: "Barber",
    business: "Sharp Cut Studio",
    focus: "rychlé střihy, vousy a opakovaní klienti",
    service: "Střih + vousy",
    staff: ["Adam", "Marek", "Nela"],
    services: [
      ["Pánský střih", "45 min", "450 Kč"],
      ["Střih + vousy", "60 min", "690 Kč"],
      ["Úprava vousů", "30 min", "320 Kč"],
    ],
  },
  {
    id: "beauty",
    label: "Kosmetika",
    business: "Luna Beauty",
    focus: "delší procedury, zálohy a klidnější plán",
    service: "Kosmetické ošetření",
    staff: ["Tereza", "Eva", "Nela"],
    services: [
      ["Kosmetické ošetření", "75 min", "1 190 Kč"],
      ["Laminace obočí", "45 min", "690 Kč"],
      ["Depilace", "30 min", "390 Kč"],
    ],
  },
  {
    id: "hair",
    label: "Kadeřnictví",
    business: "Studio Vlna",
    focus: "barvy, delší bloky a týmový kalendář",
    service: "Barva + styling",
    staff: ["Lucie", "Tereza", "Marek"],
    services: [
      ["Střih + foukaná", "60 min", "790 Kč"],
      ["Barva + styling", "120 min", "1 690 Kč"],
      ["Konzultace", "30 min", "0 Kč"],
    ],
  },
  {
    id: "massage",
    label: "Masáže",
    business: "Tiché Studio",
    focus: "dlouhé bloky bez telefonů mezi klienty",
    service: "Sportovní masáž",
    staff: ["Petr", "Anna", "David"],
    services: [
      ["Relaxační masáž", "60 min", "890 Kč"],
      ["Sportovní masáž", "75 min", "1 090 Kč"],
      ["Fyziokonzultace", "45 min", "790 Kč"],
    ],
  },
] as const;

type IndustryProfile = (typeof industryProfiles)[number];

const productSurfaces = [
  { id: "calendar", label: "Kalendář", icon: CalendarDays },
  { id: "booking", label: "Rezervace", icon: Smartphone },
  { id: "clients", label: "Klienti", icon: UsersRound },
  { id: "channels", label: "Kanály", icon: Link2 },
] as const;

type ProductSurfaceId = (typeof productSurfaces)[number]["id"];

const agendaRows = [
  { time: "09:00", title: "Nová rezervace", state: "potvrzeno", tone: "confirm" },
  { time: "10:30", title: "Volné okno", state: "dostupné", tone: "free" },
  { time: "13:15", title: "Změna termínu", state: "čeká", tone: "wait" },
  { time: "15:00", title: "Klient s rizikem", state: "ověřit", tone: "risk" },
] as const;

const bookingChannels = [
  ["Web podniku", "rezervační tlačítko"],
  ["Instagram bio", "vlastní odkaz"],
  ["QR v provozovně", "u recepce"],
  ["Google profil", "měřitelný zdroj"],
] as const;

const heroTrustItems = ["Pilot bez karty", "Bez provize z vlastních klientů", "Vlastní rezervační odkaz"] as const;

const toneClassNames = {
  confirm: "border-[#BDE8CE] bg-[#F0FBF4] text-[#146B3A] before:bg-[#2EAD63]",
  free: "border-[#BFE1FF] bg-[#EAF6FF] text-[#0B5CAD] before:bg-[#2B3FF2]",
  wait: "border-[#F4D3AA] bg-[#FFF8EC] text-[#8A4B14] before:bg-[#E8A23A]",
  risk: "border-[#F5C2C0] bg-[#FFF0F0] text-[#B42318] before:bg-[#E5484D]",
} as const;

function CalendarSurface({ industry }: { industry: IndustryProfile }) {
  return (
    <div className="grid h-full content-start gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
            Dnešní provoz
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-[-0.04em] sm:text-3xl">
            {industry.business}
          </h2>
          <p className="mt-1 text-sm font-semibold leading-5 text-[var(--ink-soft)]">
            {industry.focus}
          </p>
        </div>
        <span className="font-time rounded-full bg-[var(--mint)] px-3 py-1.5 text-xs font-semibold text-[var(--mint-ink)]">
          demo provoz
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_0.74fr]">
        <div className="rounded-[1.35rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-3">
          <div className="grid grid-cols-3 gap-2">
            {industry.staff.map((person, personIndex) => (
              <div key={person} className="rounded-2xl bg-white p-3 shadow-sm">
                <p className="text-sm font-bold">{person}</p>
                <div className="mt-3 grid gap-2">
                  {agendaRows.slice(0, 3).map((row, rowIndex) => {
                    const isActive = personIndex === rowIndex;
                    return (
                      <span
                        key={`${person}-${row.time}`}
                        className={`font-time rounded-xl px-2 py-2 text-xs font-semibold ${
                          isActive ? "bg-[var(--cobalt)] text-white" : "bg-[var(--porcelain)] text-[var(--ink-soft)]"
                        }`}
                      >
                        {row.time}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-2">
          {agendaRows.map((row) => (
            <article
              key={`${row.time}-${row.title}`}
              className={`relative grid grid-cols-[3.8rem_1fr_auto] items-center gap-2 rounded-2xl border p-3 pl-4 shadow-sm before:absolute before:inset-y-3 before:left-2 before:w-1 before:rounded-full ${toneClassNames[row.tone]}`}
            >
              <p className="font-time text-xs font-bold text-[var(--ink)]">{row.time}</p>
              <p className="truncate font-bold text-[var(--ink)]">{row.title}</p>
              <span className="hidden rounded-full bg-white px-2.5 py-1 text-xs font-bold text-[var(--ink)] shadow-sm sm:inline-flex">
                {row.state}
              </span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingSurface({ industry }: { industry: IndustryProfile }) {
  return (
    <div className="grid h-full content-start gap-4">
      <div>
        <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
          Stránka pro klienta
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">
          Klient vidí jen volné časy.
        </h2>
      </div>
      <div className="rounded-[1.5rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-bold">{industry.business}</p>
            <p className="text-xs font-semibold text-[var(--ink-soft)]">
              {industry.services.length} služby, {industry.staff.length} lidé v kalendáři
            </p>
          </div>
          <span className="rounded-full bg-[var(--mint)] px-3 py-1 text-xs font-bold text-[var(--mint-ink)]">
            online
          </span>
        </div>
        <div className="mt-4 grid gap-2">
          {industry.services.map(([service, duration, price]) => (
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

function ClientsSurface({ industry }: { industry: IndustryProfile }) {
  return (
    <div className="grid h-full content-start gap-4">
      <div>
        <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
          Paměť podniku
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">
          Klient nezmizí v cizí aplikaci.
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-[0.86fr_1.14fr]">
        <div className="rounded-[1.5rem] border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[var(--cobalt)] text-white">
            <UsersRound className="size-6" />
          </div>
          <p className="mt-4 text-xl font-bold">Karta klienta</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ink-soft)]">
            Historie, poznámky, preference a no-show signál zůstávají u podniku.
          </p>
        </div>
        <div className="grid gap-2">
          {[
            ["Poslední služba", industry.service],
            ["Preferovaný čas", "dopoledne"],
            ["Stav", "ověřený klient"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[var(--paper-line)] bg-white p-3 shadow-sm">
              <p className="font-time text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                {label}
              </p>
              <p className="mt-1 font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelsSurface() {
  return (
    <div className="grid h-full content-start gap-4">
      <div>
        <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
          Vlastní kanály
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-[-0.04em]">
          Rezervace z vašich míst.
        </h2>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {bookingChannels.map(([channel, detail], index) => {
          const Icon = index === 0 ? Link2 : index === 1 ? Smartphone : index === 2 ? QrCode : MapPin;
          return (
            <article key={channel} className="rounded-2xl border border-[var(--paper-line)] bg-[var(--porcelain)] p-4">
              <Icon className="size-5 text-[var(--cobalt)]" strokeWidth={1.9} />
              <p className="mt-4 font-bold">{channel}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink-soft)]">{detail}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function SurfacePanel({
  activeSurfaceId,
  industry,
}: {
  activeSurfaceId: ProductSurfaceId;
  industry: IndustryProfile;
}) {
  if (activeSurfaceId === "booking") {
    return <BookingSurface industry={industry} />;
  }

  if (activeSurfaceId === "clients") {
    return <ClientsSurface industry={industry} />;
  }

  if (activeSurfaceId === "channels") {
    return <ChannelsSurface />;
  }

  return <CalendarSurface industry={industry} />;
}

function BookingPhonePreview({ industry }: { industry: IndustryProfile }) {
  return (
    <aside className="booking-phone-preview absolute -bottom-5 right-4 hidden w-[232px] rounded-[2rem] border-[8px] border-[var(--ink)] bg-white p-3 text-[var(--ink)] shadow-[0_28px_70px_rgba(23,26,33,0.26)] xl:block">
      <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-[var(--ink)]/12" />
      <p className="font-time text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
        Rezervace online
      </p>
      <h3 className="mt-1 text-xl font-black tracking-[-0.04em]">{industry.business}</h3>
      <div className="mt-3 grid gap-2">
        {industry.services.slice(0, 2).map(([service, duration]) => (
          <div key={service} className="rounded-2xl bg-[var(--porcelain)] p-3">
            <p className="text-sm font-bold">{service}</p>
            <p className="font-time mt-1 text-xs font-semibold text-[var(--ink-soft)]">{duration}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {["10:30", "12:30", "15:00"].map((time, index) => (
          <span
            key={time}
            className={`font-time shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
              index === 1 ? "bg-[var(--cobalt)] text-white" : "bg-[var(--cobalt-tint)] text-[var(--cobalt)]"
            }`}
          >
            {time}
          </span>
        ))}
      </div>
      <button className="mt-3 h-10 w-full rounded-full bg-[var(--ink)] text-sm font-bold text-white">
        Rezervovat
      </button>
    </aside>
  );
}

export function BusinessDiscoveryHero() {
  const reduceMotion = usePrefersReducedMotion();
  const [activeIndustryId, setActiveIndustryId] = useState<IndustryProfile["id"]>("barber");
  const [activeSurfaceId, setActiveSurfaceId] = useState<ProductSurfaceId>("calendar");
  const activeIndustry =
    industryProfiles.find((industry) => industry.id === activeIndustryId) ?? industryProfiles[0];
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
    }, 4800);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion]);

  return (
    <section id="produkt" className="business-discovery-hero salon-operating-hero temaro-time-hero relative overflow-hidden pt-24 sm:pt-28">
      <div className="mx-auto grid min-h-[760px] w-full max-w-[1360px] items-center gap-8 px-4 pb-14 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8 lg:pb-20">
        <div className="relative z-10 max-w-2xl">
          <p className="section-eyebrow">Rezervační systém pro salony, barbery a beauty služby</p>
          <h1 className="font-display mt-5 text-balance text-[3.35rem] font-semibold leading-[0.94] text-[var(--ink)] sm:text-7xl lg:text-[5.7rem]">
            Plnější kalendář bez marketplace provizí.
          </h1>
          <p className="mt-5 max-w-xl text-lg font-normal leading-[1.45] text-[var(--ink-soft)] sm:mt-6 sm:text-2xl">
            Klient si vezme skutečně volný čas, tým ho hned vidí v kalendáři a vztah s klientem zůstává pod vaší značkou.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {heroTrustItems.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full bg-white/72 px-3 py-2 text-sm font-bold text-[var(--ink-soft)] ring-1 ring-[var(--paper-line)]">
                <CheckCircle2 className="size-4 text-[var(--mint-ink)]" />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/register"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-7 text-base font-bold text-white shadow-[0_18px_46px_rgba(43,63,242,0.25)] transition hover:-translate-y-0.5 hover:bg-[var(--cobalt-deep)]"
            >
              Registrovat salon
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/ukazka"
              className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white/78 px-7 text-base font-bold text-[var(--ink)] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[var(--cobalt)]"
            >
              Spustit ukázku
            </Link>
          </div>

          <div className="industry-switcher mt-7 rounded-[1.5rem] border border-[var(--paper-line)] bg-white/76 p-2 shadow-sm">
            <p className="font-time px-2 pb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              Vyberte typ provozu
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {industryProfiles.map((industry) => (
                <button
                  key={industry.id}
                  type="button"
                  aria-pressed={activeIndustry.id === industry.id}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-bold transition ${
                    activeIndustry.id === industry.id
                      ? "bg-[var(--ink)] text-white"
                      : "bg-[var(--porcelain)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
                  }`}
                  onClick={() => setActiveIndustryId(industry.id)}
                >
                  {industry.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="relative z-10 min-w-0" aria-label="Produktový pohled Temaro pro salonový provoz" aria-live="off">
          <div className="salon-command-frame relative max-w-[calc(100vw-2rem)] rounded-[2rem] border border-white/70 bg-[var(--ink)] p-3 shadow-[0_44px_120px_rgba(23,26,33,0.22)]">
            <div className="overflow-hidden rounded-[1.55rem] bg-[#ECE8DF]">
              <div className="flex items-center justify-between gap-3 bg-[var(--ink)] px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-[#E5484D]" />
                  <span className="size-2.5 rounded-full bg-[#FFB98A]" />
                  <span className="size-2.5 rounded-full bg-[#BFEAD4]" />
                </div>
                <span className="font-time rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-white/72">
                  Reálný app pohled
                </span>
              </div>

              <div className="grid min-h-[500px] lg:min-h-[560px] lg:grid-cols-[13rem_minmax(0,1fr)]">
                <nav className="hidden bg-[var(--ink)] p-4 text-white lg:block" aria-label="Ukázkové produktové plochy">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-[var(--cobalt)] text-white">
                      <Scissors className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{activeIndustry.business}</p>
                      <p className="text-xs font-semibold text-white/54">{activeIndustry.label}</p>
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
                          className={`relative flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold transition ${
                            isActive ? "bg-white/12 text-white" : "text-white/56 hover:bg-white/8 hover:text-white"
                          }`}
                          onClick={() => setActiveSurfaceId(surface.id)}
                        >
                          {isActive ? <span className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-[var(--cobalt)]" /> : null}
                          <Icon className="size-4" />
                          {surface.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="marketplace-free-proof mt-8 rounded-2xl border border-white/12 bg-white/8 p-3">
                    <ShieldCheck className="size-5 text-[var(--mint)]" />
                    <p className="mt-3 text-sm font-bold">Vlastní klienti</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/58">
                      Temaro nebere provizi z rezervací, které přivedete ze svých kanálů.
                    </p>
                  </div>
                </nav>

                <div className="min-w-0 p-3 sm:p-5">
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                    {productSurfaces.map((surface) => (
                      <button
                        key={surface.id}
                        type="button"
                        onClick={() => setActiveSurfaceId(surface.id)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                          activeSurface.id === surface.id ? "bg-[var(--cobalt)] text-white" : "bg-white text-[var(--ink-soft)]"
                        }`}
                      >
                        {surface.label}
                      </button>
                    ))}
                  </div>

                  <div className="mb-4 flex items-center gap-2 rounded-2xl border border-[var(--paper-line)] bg-white px-3 py-2 shadow-sm">
                    <Search className="size-4 shrink-0 text-[var(--ink-soft)]" />
                    <span className="truncate text-xs font-semibold text-[var(--ink-soft)]">
                      Hledat klienta, službu nebo volné okno
                    </span>
                  </div>

                  <div className="min-h-[340px] rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-4 shadow-sm sm:min-h-[448px] sm:p-5">
                    <SurfacePanel activeSurfaceId={activeSurface.id} industry={activeIndustry} />
                  </div>
                </div>
              </div>
            </div>
            <BookingPhonePreview industry={activeIndustry} />
          </div>
        </aside>
      </div>
    </section>
  );
}
