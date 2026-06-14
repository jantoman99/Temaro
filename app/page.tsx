import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Link2,
  MailCheck,
  MousePointerClick,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";

import PublicSlugBookingPage from "@/app/(booking)/[slug]/page";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { BusinessDiscoveryHero } from "@/components/marketing/business-discovery-hero";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MobileStickyCta } from "@/components/marketing/mobile-sticky-cta";
import { Reveal } from "@/components/motion/reveal";
import { isLikelyPlatformHost, normalizeRequestHost } from "@/lib/custom-domain";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Rezervační systém pro salony bez marketplace provizí | Temaro",
  description:
    "Temaro je český rezervační systém pro salony, barbery, beauty, masáže a lokální služby. Online rezervace, týmový kalendář, klientská historie a vlastní klienti bez provizí.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rezervační systém pro salony bez marketplace provizí | Temaro",
    description:
      "Online rezervace, týmový kalendář a klientský kontext pro provozy, kde každý volný termín stojí peníze.",
    type: "website",
    locale: "cs_CZ",
    siteName: "Temaro",
  },
};

const CTA = {
  primary: { href: "/register", label: "Registrovat salon" },
  secondary: { href: "/ukazka", label: "Spustit ukázku" },
} as const;

const industryCards = [
  {
    href: "/rezervacni-system-pro-barbery",
    label: "Barber",
    title: "Rychlé střihy bez zpráv tam a zpět.",
    text: "Služby po 30-60 minutách, opakovaní klienti, volná okna a no-show signál.",
  },
  {
    href: "/rezervacni-system-pro-kadernictvi",
    label: "Kadeřnictví",
    title: "Barvy, střihy a delší bloky v jednom kalendáři.",
    text: "Délky služeb, tým, pracovní doba a změny termínů bez ručního přepisování.",
  },
  {
    href: "/rezervacni-system-pro-kosmeticky-salon",
    label: "Beauty",
    title: "Klidnější plán pro procedury, které nejdou uspěchat.",
    text: "Klient vidí dostupnost, provoz vidí historii a riziko ještě před návštěvou.",
  },
  {
    href: "/rezervacni-system-pro-masaze",
    label: "Masáže",
    title: "Dlouhé bloky bez telefonů mezi klienty.",
    text: "Rezervace, připomínky a změny drží den pohromadě i u tichých provozů.",
  },
] as const;

const productProofScenes = [
  {
    icon: CalendarDays,
    label: "Kalendář",
    title: "Den je mapa, ne seznam.",
    text: "Rezervace, volná okna a rizikové termíny mají vlastní signál přímo v provozním plánu.",
    accent: "blue",
    meta: ["08:30 potvrzeno", "10:30 čeká", "16:00 volno"],
  },
  {
    icon: MousePointerClick,
    label: "Rezervační stránka",
    title: "Klient si vezme jen dostupný čas.",
    text: "Odkaz z webu, Instagramu nebo QR vede do jednoduchého flow bez volání a přepisování zpráv.",
    accent: "apricot",
    meta: ["služba", "čas", "potvrzení"],
  },
  {
    icon: UsersRound,
    label: "Klientská paměť",
    title: "Kontext zůstává u podniku.",
    text: "Historie, poznámky, preference a no-show signál patří provozu, ne cizímu marketplace.",
    accent: "mint",
    meta: ["historie", "poznámka", "no-show signál"],
  },
] as const;

const pricingPlans = [
  {
    name: "Pilot",
    price: "0 Kč",
    status: "aktivní",
    note: "pro první ověření provozu",
    description: "Pro salony a služby, které chtějí ověřit online rezervace na reálném kalendáři.",
    features: ["online rezervace", "kalendář", "klienti", "služby a tým"],
  },
  {
    name: "Solo",
    price: null,
    status: "po pilotu",
    note: "pro jednoho profesionála",
    description: "Finální cena se zamkne až po pilotu, bez skrytých provizí z vlastních klientů.",
    features: ["rezervační stránka", "připomínky", "klientská historie", "základní reporting"],
  },
  {
    name: "Tým",
    price: null,
    status: "po pilotu",
    note: "pro více lidí v kalendáři",
    description: "Pro provozy, kde se rezervace řeší přes více zaměstnanců, směny a služby.",
    features: ["více zaměstnanců", "role vlastníka a týmu", "pracovní doba", "provozní přehledy"],
  },
] as const;

const marketplaceRows = [
  ["Vlastní klienti", "Zůstávají u vašeho podniku", "Vztah se často přesouvá do platformy"],
  ["Rezervace ze svých kanálů", "Bez provize z vlastního webu, QR nebo Instagramu", "Provizní model může zvyšovat náklady"],
  ["Značka podniku", "Klient rezervuje pod vaší značkou", "Klient často vnímá hlavně cizí aplikaci"],
  ["Data a historie", "Klientská paměť je součást provozu", "Export a vlastnictví dat bývá citlivé téma"],
] as const;

const workflowSteps = [
  {
    icon: ClipboardList,
    time: "01",
    title: "Nastavíte služby a tým",
    text: "Délky, ceny, pracovní dobu a lidi dáte do jednoho čitelného rozvrhu.",
  },
  {
    icon: Link2,
    time: "02",
    title: "Sdílíte vlastní odkaz",
    text: "Odkaz patří na web, Instagram, Google profil, zprávu nebo QR u recepce.",
  },
  {
    icon: CalendarDays,
    time: "03",
    title: "Klient si vybere termín",
    text: "Vidí jen dostupná okna, zvolí službu a odešle rezervaci bez telefonátu.",
  },
  {
    icon: MailCheck,
    time: "04",
    title: "Tým vidí další krok",
    text: "Rezervace se propíše do kalendáře a klient zůstane v historii podniku.",
  },
] as const;

const securityItems = [
  ["Oddělená data podniků", "Klienti, termíny a historie jednoho provozu se nemíchají s jiným podnikem."],
  ["Bezpečná dostupnost termínu", "Volné časy se ověřují při odeslání, aby dva klienti nevzali stejný čas."],
  ["Český a EU provozní kontext", "Temaro cílí na lokální služby, které chtějí kontrolu nad vlastní značkou a daty."],
] as const;

const guideLinks = [
  ["/rezervacni-system-pro-barbery", "Pro barbery"],
  ["/rezervacni-system-pro-kadernictvi", "Pro kadeřnictví"],
  ["/rezervacni-system-pro-kosmeticky-salon", "Pro beauty salon"],
  ["/rezervacni-system-pro-masaze", "Pro masáže"],
  ["/jak-snizit-no-show", "No-show návod"],
  ["/sms-pripominky-rezervaci", "SMS připomínky"],
  ["/rezervacni-system-bez-marketplace-provizi", "Bez marketplace provizí"],
] as const;

async function getCustomDomainTenantSlug() {
  if (!hasSupabaseAdminEnv()) {
    return null;
  }

  const host = normalizeRequestHost((await headers()).get("host"));

  if (isLikelyPlatformHost(host, process.env.NEXT_PUBLIC_APP_URL)) {
    return null;
  }

  const { data } = await createAdminClient()
    .from("tenants")
    .select("slug")
    .eq("custom_domain", host)
    .eq("custom_domain_status", "active")
    .is("deleted_at", null)
    .maybeSingle();

  return data?.slug ?? null;
}

export default async function Home() {
  const customDomainSlug = await getCustomDomainTenantSlug();

  if (customDomainSlug) {
    return PublicSlugBookingPage({
      params: Promise.resolve({ slug: customDomainSlug }),
      searchParams: Promise.resolve({ source: "online", source_detail: "custom-domain" }),
    });
  }

  return (
    <main className="temaro-time-page min-h-screen [overflow-x:clip]">
      <a
        href="#produkt"
        className="skip-link temaro-focus-ring sr-only fixed left-4 top-4 z-[80] rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--ink)] shadow-lg focus:not-sr-only"
      >
        Přeskočit na obsah
      </a>
      <MarketingHeader />
      <BusinessDiscoveryHero />
      <MobileStickyCta />

      <section id="pro-koho" className="salon-industry-board mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
            <div>
              <p className="section-eyebrow">Pro koho</p>
              <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Jeden systém, různé tempo provozu.
              </h2>
            </div>
            <p className="max-w-2xl text-lg font-normal leading-8 text-[var(--ink-soft)]">
              Temaro je stavěné pro provozy, kde délka služby, tým, volná okna a návraty klientů rozhodují o tom, jestli den běží klidně.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {industryCards.map((card, index) => (
            <Reveal key={card.href} delay={index * 70} className="h-full">
              <Link
                href={card.href}
                className="temaro-focus-ring group flex h-full flex-col justify-between rounded-[1.75rem] border border-[var(--paper-line)] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[var(--cobalt)]"
              >
                <div>
                  <span className="font-time rounded-full bg-[var(--cobalt-tint)] px-3 py-1.5 text-xs font-semibold text-[var(--cobalt)]">
                    {card.label}
                  </span>
                  <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em]">{card.title}</h3>
                  <p className="mt-3 text-sm font-normal leading-6 text-[var(--ink-soft)]">{card.text}</p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[var(--cobalt)]">
                  Otevřít obor
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="produktovy-dukaz" className="temaro-operations-strip relative overflow-hidden py-20 sm:py-24">
        <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="section-eyebrow">Produktový důkaz</p>
                <h2 className="font-display mt-3 max-w-2xl text-balance text-5xl font-semibold leading-[0.96] sm:text-7xl">
                  Produkt má být živý, ne vyfocený.
                </h2>
              </div>
              <p className="max-w-2xl text-lg font-normal leading-8 text-[var(--ink-soft)]">
                Landing ukazuje stejnou logiku jako interní CRM: časový plán, stav rezervace, klientský kontext a kanál, ze kterého termín přišel.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="temaro-operations-board mt-10 grid gap-4 rounded-[2.25rem] border border-white/70 bg-[var(--ink)] p-3 text-[var(--ink)] shadow-[0_34px_110px_rgba(23,26,33,0.22)] sm:p-4 lg:grid-cols-[1.25fr_0.9fr_0.9fr]">
              {productProofScenes.map((scene, index) => (
                <article
                  key={scene.label}
                  className={`temaro-proof-module ${scene.accent} ${index === 0 ? "lg:row-span-2" : ""} overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-[var(--porcelain)] px-3 py-2 text-xs font-bold text-[var(--ink)]">
                      <scene.icon className="size-4 text-[var(--cobalt)]" strokeWidth={1.9} />
                      {scene.label}
                    </div>
                    <span className="temaro-proof-pulse" aria-hidden="true" />
                  </div>
                  <div className="mt-8">
                    <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cobalt)]">
                      provozní signál
                    </p>
                    <h3 className="mt-2 text-3xl font-bold tracking-[-0.04em]">{scene.title}</h3>
                    <p className="mt-3 text-sm font-normal leading-6 text-[var(--ink-soft)]">{scene.text}</p>
                  </div>
                  <div className={`${index === 0 ? "mt-8" : "mt-6"} grid gap-2`}>
                    {scene.meta.map((item) => (
                      <div key={item} className="temaro-proof-row">
                        <span />
                        <p>{item}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="cenik" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="section-eyebrow">Ceník</p>
              <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Cena má být čitelná dřív než smlouva.
              </h2>
            </div>
            <p className="max-w-2xl text-lg font-normal leading-8 text-[var(--ink-soft)]">
              Finální tarify se zamknou po pilotu. Princip je pevný už teď: žádná provize z vlastních klientů a žádné “zdarma” se skrytými náklady.
            </p>
          </div>
        </Reveal>
        <div className="mt-10 grid snap-x gap-4 overflow-x-auto pb-2 lg:grid-cols-3 lg:overflow-visible">
          {pricingPlans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 70} className="h-full min-w-[84vw] snap-center lg:min-w-0">
              <article className={`flex h-full flex-col rounded-[1.75rem] border p-6 shadow-sm ${index === 0 ? "border-[var(--cobalt)] bg-white shadow-[0_18px_54px_rgba(43,63,242,0.12)]" : "border-[var(--paper-line)] bg-white/70"}`}>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <h3 className="text-3xl font-bold tracking-[-0.04em]">{plan.name}</h3>
                  <span className={`font-time rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${index === 0 ? "bg-[var(--cobalt-tint)] text-[var(--cobalt)]" : "bg-[var(--apricot-tint)] text-[var(--ink)]"}`}>
                    {plan.status}
                  </span>
                </div>
                {plan.price ? (
                  <p className="font-display text-5xl font-semibold tracking-[-0.05em] text-[var(--cobalt)]">{plan.price}</p>
                ) : (
                  <p className="text-base font-normal leading-7 text-[var(--ink-soft)]">Cena bude upřesněna po pilotu.</p>
                )}
                <p className="font-time mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">{plan.note}</p>
                <p className="mt-5 text-sm font-normal leading-6 text-[var(--ink-soft)]">{plan.description}</p>
                <div className="mt-6 grid gap-3">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm font-bold text-[var(--ink)]">
                      <CheckCircle2 className="size-4 text-[var(--mint-ink)]" strokeWidth={1.9} />
                      {feature}
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="bez-marketplace" className="marketplace-compare-panel bg-[var(--ink)] py-20 text-white sm:py-24">
        <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-4 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8">
          <Reveal>
            <div>
              <p className="font-time text-xs font-semibold uppercase tracking-[0.18em] text-white/62">Bez marketplace provizí</p>
              <h2 className="font-display mt-4 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Váš klient nemá být daň za cizí aplikaci.
              </h2>
              <p className="mt-5 max-w-md text-base font-normal leading-7 text-white/72">
                Temaro může později pomáhat s discovery, ale ne jako provizní marketplace z klientů, které si podnik přivedl sám.
              </p>
              <Link
                href="/rezervacni-system-bez-marketplace-provizi"
                className="temaro-focus-ring mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5"
              >
                Proč bez provizí
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-3">
            {marketplaceRows.map(([topic, temaro, marketplace], index) => (
              <Reveal key={topic} delay={index * 70}>
                <article className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-4 sm:grid-cols-[0.8fr_1fr_1fr] sm:items-center">
                  <p className="font-bold">{topic}</p>
                  <p className="rounded-2xl bg-[var(--mint)] px-3 py-2 text-sm font-bold text-[var(--mint-ink)]">{temaro}</p>
                  <p className="rounded-2xl bg-white/8 px-3 py-2 text-sm font-semibold text-white/68">{marketplace}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="jak-to-funguje" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="section-eyebrow">Jak to funguje</p>
              <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Online rezervace bez změny návyků klientů.
              </h2>
            </div>
            <p className="max-w-xl text-lg font-normal leading-8 text-[var(--ink-soft)] lg:pt-8">
              Klient klikne na odkaz tam, kde vás už sleduje. Systém ověří dostupnost, zapíše termín a tým vidí další krok.
            </p>
          </div>
        </Reveal>

        <div className="workflow-rail-grid mt-10 grid gap-4 md:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70} className="h-full">
              <article className="relative h-full rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-5 shadow-sm">
                <span className="font-time text-sm font-semibold text-[var(--cobalt)]">{step.time}</span>
                <div className="mt-8 grid size-11 place-items-center rounded-2xl bg-[var(--cobalt-tint)] text-[var(--cobalt)]">
                  <step.icon className="size-5" strokeWidth={1.9} />
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-[-0.02em]">{step.title}</h3>
                <p className="mt-3 text-sm font-normal leading-6 text-[var(--ink-soft)]">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="bezpecnost" className="bg-[var(--porcelain-deep)] py-20 sm:py-24">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <header>
              <p className="section-eyebrow">Důvěra a bezpečnost</p>
              <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Jednoduchá rezervace nesmí znamenat slabá data.
              </h2>
              <p className="mt-5 max-w-md text-sm font-normal leading-6 text-[var(--ink-soft)]">
                Rezervační systém drží klienty, termíny a historii podniku. Proto je kontrola dat základ, ne doplněk.
              </p>
            </header>
          </Reveal>
          <div className="grid gap-3">
            {securityItems.map(([title, text], index) => (
              <Reveal key={title} delay={index * 70}>
                <article className="flex gap-4 rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-5 shadow-sm">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[var(--cobalt-tint)] text-[var(--cobalt)]">
                    <ShieldCheck className="size-5" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="text-xl font-bold tracking-[-0.02em]">{title}</h3>
                    <p className="mt-1 text-sm font-normal leading-6 text-[var(--ink-soft)]">{text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
        <Reveal>
          <div className="grid gap-6 rounded-[2rem] border border-[var(--paper-line)] bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="section-eyebrow">Další krok</p>
              <h2 className="font-display mt-3 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Ověřte, jestli se váš kalendář dá řídit klidněji.
              </h2>
              <p className="mt-5 max-w-xl text-base font-normal leading-7 text-[var(--ink-soft)]">
                Začněte pilotem, projděte ukázku nebo otevřete oborovou stránku pro svůj typ provozu.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link href={CTA.primary.href} className="temaro-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-6 text-sm font-bold text-white transition hover:bg-[var(--cobalt-deep)]">
                {CTA.primary.label}
                <ArrowRight className="size-4" />
              </Link>
              <Link href={CTA.secondary.href} className="temaro-focus-ring inline-flex h-12 items-center justify-center rounded-full border border-[var(--paper-line)] bg-[var(--porcelain)] px-6 text-sm font-bold text-[var(--ink)] transition hover:border-[var(--cobalt)]">
                {CTA.secondary.label}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[var(--paper-line)] bg-white">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr_0.8fr] lg:px-8">
          <div>
            <TemaroLogo />
            <p className="mt-3 max-w-sm text-sm font-normal leading-6 text-[var(--ink-soft)]">
              Rezervační systém pro salony, barbery, beauty a další služby. Vyrobeno v Česku, připraveno pro EU provoz.
            </p>
          </div>
          <div>
            <p className="section-eyebrow text-[var(--ink-soft)]">Produkt</p>
            <ul className="mt-4 space-y-2 text-sm font-bold">
              <li><Link href="#produkt" className="text-[var(--ink)] hover:underline">Produkt</Link></li>
              <li><Link href="#pro-koho" className="text-[var(--ink)] hover:underline">Pro koho</Link></li>
              <li><Link href="#cenik" className="text-[var(--ink)] hover:underline">Ceník</Link></li>
              <li><Link href="#bez-marketplace" className="text-[var(--ink)] hover:underline">Bez marketplace</Link></li>
              <li><Link href="#bezpecnost" className="text-[var(--ink)] hover:underline">Bezpečnost</Link></li>
            </ul>
          </div>
          <div>
            <p className="section-eyebrow text-[var(--ink-soft)]">Návody</p>
            <ul className="mt-4 space-y-2 text-sm font-bold">
              {guideLinks.map(([href, label]) => (
                <li key={href}><Link href={href} className="text-[var(--ink)] hover:underline">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="section-eyebrow text-[var(--ink-soft)]">Firma</p>
            <ul className="mt-4 space-y-2 text-sm font-bold">
              <li><Link href="/login" className="text-[var(--ink)] hover:underline">Přihlášení</Link></li>
              <li><Link href="/register" className="text-[var(--ink)] hover:underline">Registrace podniku</Link></li>
              <li><Link href="/account/login" className="text-[var(--ink)] hover:underline">Zákaznický účet</Link></li>
              <li><a href="mailto:hello@temaro.cz" className="text-[var(--ink)] hover:underline">Kontakt</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--paper-line)]">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-4 py-4 text-xs font-semibold text-[var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© 2026 Temaro</p>
            <p>Online rezervace pro služby</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
