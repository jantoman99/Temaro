import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Link2, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { InteractiveProductDemo } from "@/components/marketing/interactive-product-demo";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MobileStickyCta } from "@/components/marketing/mobile-sticky-cta";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Klikatelná ukázka CRM Temaro | Kalendář a rezervace",
  description:
    "Projděte si interní CRM Temaro: kalendář týdne, detail rezervace, klienty a rezervační stránku bez obrázků a bez videa.",
  alternates: {
    canonical: "/ukazka",
  },
};

const proofCards = [
  {
    title: "Kalendář jako hlavní produkt",
    text: "Ukázka začíná tam, kde provoz reálně pracuje: týden × čas, rezervace, tým a vybraný termín.",
    icon: Clock3,
  },
  {
    title: "CRM místo marketingové grafiky",
    text: "Žádné obrázky webu. Demo je složené z kódu a patternů interní aplikace Temaro.",
    icon: CalendarDays,
  },
  {
    title: "Detail a klientská data",
    text: "Klik na rezervaci ukazuje klienta, službu, zdroj, zálohu, připomínku a rizikový signál.",
    icon: UsersRound,
  },
] as const;

const walkthrough = [
  ["01", "Kalendář", "Týdenní mřížka 7-20h, barevné rezervace podle týmu a rychlý výběr termínu."],
  ["02", "Detail rezervace", "Klient, služba, stav, zdroj, záloha a připomínka v pravém panelu."],
  ["03", "Přehled provozu", "Dnešní rezervace, tržba, volná okna a riziko jako vstup do kalendáře."],
  ["04", "Klienti", "CRM tabulka s kontakty, rizikem, profilem a akcí pro další rezervaci."],
  ["05", "Rezervační stránka", "Veřejný odkaz, QR a widget spravované přímo z interní aplikace."],
] as const;

export default function DemoPage() {
  return (
    <main className="temaro-time-page min-h-screen [overflow-x:clip]">
      <MarketingHeader />
      <MobileStickyCta />

      <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto grid w-full max-w-[1320px] gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:items-center">
          <Reveal>
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white/82 px-3 py-2 text-sm font-bold text-[var(--ink)] shadow-sm">
                <CheckCircle2 className="size-4 text-[var(--cobalt)]" strokeWidth={1.9} />
                Klikatelná ukázka interního CRM
              </div>

              <h1 className="font-display mt-7 text-balance text-[clamp(3.2rem,7.2vw,7rem)] font-semibold leading-[0.88] tracking-[-0.075em]">
                Tohle je produkt, který má být vidět.
              </h1>
              <p className="mt-7 max-w-xl text-pretty text-xl font-normal leading-8 text-[var(--ink-soft)]">
                Bez obrázků webu a bez předtočeného videa. Projděte si klikací ukázku interní aplikace: kalendář, detail rezervace, klienty a nastavení rezervační stránky.
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
                  href="/demo-barber"
                  className="temaro-focus-ring inline-flex h-13 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-7 text-base font-bold text-[var(--ink)] transition hover:border-[var(--cobalt)]"
                >
                  Vidět klientskou rezervaci
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <InteractiveProductDemo />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="section-eyebrow">Co ukázka řeší</p>
              <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Demo má ukázat CRM, ne dekoraci.
              </h2>
            </div>
            <p className="max-w-2xl text-lg font-normal leading-8 text-[var(--ink-soft)]">
              Vizuální důkaz je postavený ze zdrojáku interního produktu: sidebar, kalendářová mřížka, booking detail, klientská tabulka a rezervační stránka.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {proofCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 70} className="h-full">
              <article className="h-full rounded-[1.75rem] border border-[var(--paper-line)] bg-white p-5 shadow-sm">
                <span className="grid size-11 place-items-center rounded-2xl bg-[var(--cobalt-tint)] text-[var(--cobalt)]">
                  <card.icon className="size-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-5 text-2xl font-bold tracking-[-0.03em]">{card.title}</h3>
                <p className="mt-3 text-sm font-normal leading-6 text-[var(--ink-soft)]">{card.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[var(--porcelain-deep)] py-16 sm:py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.75fr_1.25fr] lg:px-8">
          <Reveal>
            <div>
              <p className="section-eyebrow">Demo scénář</p>
              <h2 className="font-display mt-3 max-w-xl text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Jeden CRM průchod, pět obrazovek.
              </h2>
              <p className="mt-5 max-w-md text-base font-normal leading-7 text-[var(--ink-soft)]">
                Kalendář je výchozí obrazovka. Ostatní části jen doplňují, co se děje kolem vybraného termínu.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-3">
            {walkthrough.map(([time, title, text], index) => (
              <Reveal key={`${time}-${title}`} delay={index * 50}>
                <article className="grid gap-4 rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-4 shadow-sm sm:grid-cols-[5.5rem_1fr]">
                  <div className="font-time flex h-12 items-center justify-center rounded-full bg-[var(--cobalt-tint)] text-sm font-semibold text-[var(--cobalt)]">
                    {time}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-[-0.02em]">{title}</h3>
                    <p className="mt-1 text-sm font-semibold leading-6 text-[var(--ink-soft)]">{text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid gap-8 rounded-[2rem] border border-[var(--paper-line)] bg-[var(--ink)] p-6 text-white shadow-[0_30px_90px_rgba(23,26,33,0.20)] sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="font-time text-xs font-semibold uppercase tracking-[0.18em] text-white/62">Další krok</p>
              <h2 className="font-display mt-3 max-w-2xl text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Pokud demo dává smysl, ověřte první reálnou rezervaci.
              </h2>
              <p className="mt-5 max-w-xl text-sm font-normal leading-6 text-white/72">
                Pilot začíná službami, týmem, pracovní dobou a veřejným odkazem. Bez marketplace provize z klientů, které si přivedete sami.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href="/register" className="temaro-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5">
                Registrovat salon
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/" className="temaro-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 text-sm font-bold text-white transition hover:bg-white/12">
                Zpět na web
                <Link2 className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
