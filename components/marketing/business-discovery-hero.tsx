import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const heroTrustItems = ["Bez karty na start", "Žádná provize z vašich klientů", "Vlastní rezervační odkaz"] as const;

const bookingSources = [
  {
    title: "Studio Magnolia",
    subtitle: "Ukázka rezervační stránky",
    meta: "Vlastní odkaz",
    value: "Online",
    image: "/marketing/salon-interior-ai.webp",
    className: "left-2 top-2 -rotate-3",
  },
  {
    title: "Barber House",
    subtitle: "Booking z Instagram bio",
    meta: "Volné dnes",
    value: "15:00",
    image: "/marketing/barber-studio-ai.webp",
    className: "right-0 top-36 rotate-3",
  },
  {
    title: "Wellness Room",
    subtitle: "QR kód v provozovně",
    meta: "Bez volání",
    value: "24/7",
    image: "/marketing/training-studio-ai.webp",
    className: "bottom-4 left-14 -rotate-1",
  },
] as const;

const dashboardRows = [
  ["11:30", "Marek Holeček", "Střih vousů", "web"],
  ["14:30", "Adéla Pohorská", "Střih + foukaná", "IG"],
  ["15:00", "Nová online rezervace", "booking odkaz", "nové"],
] as const;

export function BusinessDiscoveryHero() {
  return (
    <section
      id="produkt"
      className="business-discovery-hero relative overflow-hidden rounded-b-[3rem] bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.38),transparent_28rem),radial-gradient(circle_at_80%_0%,rgba(244,114,182,0.42),transparent_30rem),linear-gradient(135deg,#8b5cf6,#7c3aed_52%,#4c1d95)] text-white shadow-[0_34px_90px_rgba(76,29,149,0.28)] lg:rounded-b-[4rem]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_44%,rgba(255,255,255,0.16),transparent_24rem)]" />
      <div className="mx-auto grid min-h-[760px] w-full max-w-[1280px] items-center gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-20 lg:pt-32">
        <section className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white/85 ring-1 ring-white/15">
            Pro salony, barbery a lokální služby
          </div>

          <h1 className="mt-7 max-w-4xl text-balance text-5xl font-black leading-[0.9] tracking-[-0.07em] text-white sm:text-7xl lg:text-[6.75rem]">
            Získejte rezervace.
            <br />
            <span className="text-[#facc15]">Bez volání.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg font-bold leading-[1.45] text-white/78 sm:text-2xl">
            Temaro dá salonu vlastní rezervační stránku, týmový kalendář a booking odkaz pro web, Instagram, Google profil i QR kód v provozovně.
          </p>

          <div className="mt-8 grid max-w-3xl gap-2 rounded-[1.6rem] bg-white p-2 text-left text-[#21142e] shadow-[0_22px_48px_rgba(76,29,149,0.22)] sm:grid-cols-[1fr_1fr_auto]">
            <div className="rounded-[1.15rem] px-4 py-3">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#6a5b74]">Obor podnikání</p>
              <p className="mt-1 truncate text-base font-black sm:text-lg">Kadeřnictví / barber</p>
            </div>
            <div className="rounded-[1.15rem] px-4 py-3">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#6a5b74]">Co chcete vyřešit</p>
              <p className="mt-1 truncate text-base font-black sm:text-lg">Méně telefonátů</p>
            </div>
            <Link
              href="/register"
              className="inline-flex min-h-14 items-center justify-center rounded-[1.15rem] bg-[#7c3aed] px-6 text-lg font-black text-white transition hover:bg-[#6d28d9]"
            >
              <ArrowRight className="size-5" />
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="business-chip rounded-full bg-[#facc15] px-3 py-2 text-sm font-black text-[#21142e]">
              Vlastní booking odkaz
            </span>
            {heroTrustItems.map((item) => (
              <span key={item} className="business-chip rounded-full bg-white/14 px-3 py-2 text-sm font-extrabold text-white/85 ring-1 ring-white/10">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-base font-black text-[#21142e] shadow-lg transition hover:-translate-y-0.5"
            >
              Začít zdarma
              <ArrowRight className="size-5" />
            </Link>
            <Link
              href="/ukazka"
              className="inline-flex h-12 items-center justify-center rounded-full bg-white/14 px-6 text-base font-black text-white ring-1 ring-white/15 transition hover:-translate-y-0.5 hover:bg-white/20"
            >
              Spustit ukázku
            </Link>
          </div>
        </section>

        <section className="business-hero-visual relative z-10 min-h-[620px] lg:min-h-[690px]" aria-label="Ukázka provozu Temaro">
          {bookingSources.map((card) => (
            <article
              key={card.title}
              className={`booking-source-card absolute hidden w-72 overflow-hidden rounded-[1.75rem] bg-white text-[#21142e] shadow-[0_24px_70px_rgba(76,29,149,0.24)] lg:block ${card.className}`}
            >
              <div className="relative h-36">
                <Image src={card.image} alt="" fill sizes="288px" className="object-cover" priority={card.title === "Studio Magnolia"} />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-black tracking-[-0.04em]">{card.title}</h2>
                <p className="mt-1 text-sm font-bold text-[#6a5b74]">{card.subtitle}</p>
                <div className="mt-4 flex items-center justify-between text-sm font-black text-[#42245f]">
                  <span>{card.meta}</span>
                  <span>{card.value}</span>
                </div>
              </div>
            </article>
          ))}

          <aside className="business-dashboard-card absolute left-0 top-10 w-full max-w-[24rem] overflow-hidden rounded-[2rem] bg-[#24102f]/88 text-white shadow-[0_30px_80px_rgba(36,16,64,0.32)] ring-1 ring-white/15 backdrop-blur-md sm:left-4 lg:left-8 lg:top-[12.5rem]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
              <strong className="inline-flex gap-1.5 text-lg font-black tracking-normal" aria-label="Dnešní provoz">
                <span>Dnešní</span>
                <span>provoz</span>
              </strong>
              <span className="rounded-full bg-[#facc15]/20 px-3 py-1 text-xs font-black text-[#fde68a]">12 rezervací</span>
            </div>
            <div className="grid gap-2 p-4">
              {dashboardRows.map(([time, name, service, source]) => (
                <div key={`${time}-${name}`} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-2xl bg-white/9 p-3">
                  <b className="nums-tabular text-lg">{time}</b>
                  <div>
                    <p className="font-bold leading-5 tracking-normal">{name}</p>
                    <p className="flex flex-wrap gap-x-1 text-sm font-semibold tracking-normal text-white/62">
                      {service.split(" ").map((word) => (
                        <span key={`${time}-${word}`}>{word}</span>
                      ))}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[0.68rem] font-black uppercase text-white/70">{source}</span>
                </div>
              ))}
            </div>
          </aside>

          <aside className="client-booking-card absolute bottom-0 right-0 w-full max-w-[25rem] rounded-[2rem] bg-white/94 p-5 text-[#21142e] shadow-[0_30px_80px_rgba(76,29,149,0.26)] backdrop-blur-md sm:right-3 lg:bottom-[5.5rem] lg:right-0">
            <h2 className="text-2xl font-black tracking-[-0.04em]">Klient vybírá čas</h2>
            <p className="mt-1 text-sm font-bold text-[#6a5b74]">Střih + foukaná · vlastní booking stránka</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["10:30", "13:30", "15:00"].map((time) => (
                <span
                  key={time}
                  className={`rounded-full px-3 py-2 text-center text-sm font-black ${
                    time === "15:00" ? "bg-[#7c3aed] text-white" : "bg-[#7c3aed]/10 text-[#7c3aed]"
                  }`}
                >
                  {time}
                </span>
              ))}
            </div>
            <Link
              href="/demo-barber"
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#7c3aed] text-base font-black text-white transition hover:bg-[#6d28d9]"
            >
              Rezervovat
            </Link>
          </aside>
        </section>
      </div>
    </section>
  );
}
