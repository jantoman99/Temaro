import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Globe2,
  History,
  Link2,
  MailCheck,
  MonitorPlay,
  MousePointerClick,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import PublicSlugBookingPage from "@/app/(booking)/[slug]/page";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { BusinessDiscoveryHero } from "@/components/marketing/business-discovery-hero";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MobileStickyCta } from "@/components/marketing/mobile-sticky-cta";
import { TimeEnginePanel } from "@/components/marketing/time-engine-panel";
import { Reveal } from "@/components/motion/reveal";
import { isLikelyPlatformHost, normalizeRequestHost } from "@/lib/custom-domain";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Rezervační systém pro služby | Temaro",
  description:
    "Temaro je český rezervační systém pro salony, barbery, ordinace, trenéry a lokální služby. Online rezervace, týmový kalendář, klientská historie a méně telefonátů.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Rezervační systém pro služby | Temaro",
    description:
      "Online rezervace, týmový kalendář a klientský kontext pro provozy, kde každý volný termín stojí peníze.",
    type: "website",
    locale: "cs_CZ",
    siteName: "Temaro",
  },
};

const CTA = {
  primary: { href: "/register", label: "Začít zdarma" },
  secondary: { href: "/ukazka", label: "Spustit ukázku" },
} as const;

const trustBarItems = [
  "Praha",
  "Brno",
  "Ostrava",
  "Salony",
  "Barbeři",
  "Kosmetika",
  "Trenéři",
  "Lokální služby",
] as const;

const dispatchProofItems = [
  {
    label: "Časová osa od prvního scrollu",
    text: "Návštěvník hned vidí den, ne obecný formulář.",
  },
  {
    label: "Pouze dostupná okna",
    text: "Volné a obsazené časy jsou oddělené vizuálně i funkčně.",
  },
  {
    label: "Riziko jako signál",
    text: "No-show stav varuje, ale nepřebarví celou značku na červeno.",
  },
  {
    label: "Vlastní vztah s klientem",
    text: "Rezervace zůstává u podniku, ne v cizím marketplace.",
  },
] as const;

const workflowSteps = [
  {
    icon: ClipboardList,
    time: "01",
    title: "Nastavíte služby a tým",
    text: "Služby, pracovní dobu a lidi přepíšete do jednoho čitelného rozvrhu.",
  },
  {
    icon: Link2,
    time: "02",
    title: "Sdílíte rezervační odkaz",
    text: "Odkaz dáte na web, Instagram, Google, zprávu nebo QR v provozovně.",
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
    title: "Provoz má přehled",
    text: "Rezervace se propíše do kalendáře, klient zůstane v historii a tým ví, co se děje.",
  },
] as const;

const bentoCards = [
  {
    icon: MousePointerClick,
    title: "Méně telefonátů",
    text: "Klient si najde volný čas sám. Tým neřeší dlouhé zprávy tam a zpět ani během špičky.",
    detail: "Rezervace, změna i potvrzení běží ve stejném rytmu.",
    className: "lg:col-span-2 lg:row-span-2 bg-[var(--cobalt)] text-white",
  },
  {
    icon: AlertTriangle,
    title: "No-show pod kontrolou",
    text: "Riziková rezervace je vidět dřív, než rozbije denní kapacitu.",
    chip: "riziková rezervace · 2× nedorazil",
    className: "bg-[var(--apricot-tint)]",
  },
  {
    icon: History,
    title: "Paměť podniku",
    text: "Historie návštěv, poznámky a preference zůstávají u klienta, ne v chatu.",
    history: ["12. 03. Střih · Tereza", "05. 04. Barva · alergie nehlášena"],
    className: "bg-[var(--mint)] text-[var(--mint-ink)]",
  },
  {
    icon: Globe2,
    title: "Jeden odkaz, všechny kanály",
    text: "Stejný rezervační vstup funguje pro web, Instagram, Google i QR v provozovně.",
    channels: ["web", "Instagram", "Google", "QR"],
    className: "lg:col-span-2 bg-white",
  },
  {
    icon: ShieldCheck,
    title: "Bez provize",
    text: "Temaro není marketplace. Rezervace z vašeho odkazu patří vašemu podniku.",
    className: "bg-white",
  },
  {
    icon: CreditCard,
    title: "Zálohy a platby",
    text: "Pro dražší služby můžete vyžadovat zálohu a snížit prázdná místa v kalendáři.",
    className: "bg-white",
  },
  {
    icon: BellRing,
    title: "SMS / e-mail",
    text: "Potvrzení a připomínky drží klienta v obraze bez ručního obvolávání.",
    className: "bg-white",
  },
  {
    icon: UsersRound,
    title: "Tým a role",
    text: "Vlastník, tým i konkrétní pracovníci vidí jen to, co potřebují pro provoz.",
    className: "bg-[var(--porcelain-deep)]",
  },
] as const;

const demoMoments = [
  ["08:00", "Přehled provozu", "Volná okna jsou vidět hned"],
  ["12:30", "Týmový kalendář", "Rizikové přesuny nezmizí v poznámkách"],
  ["17:00", "Rezervační stránka", "Nová rezervace se zařadí do dne"],
] as const;

const visualProofImages = [
  {
    src: "/marketing/time-engine-salon.webp",
    alt: "Moderní barber a salon jako provozní prostředí pro online rezervace",
    label: "Salon",
    signal: "4 volná okna",
    title: "Telefon zvoní. Slot už drží místo.",
    text: "Rychlé přeobjednání, oblíbený člověk a jasný denní rytmus pro tým.",
  },
  {
    src: "/marketing/time-engine-beauty.webp",
    alt: "Světlé beauty studio s lehátkem a produktovou vrstvou rezervací",
    label: "Beauty",
    signal: "SMS připomínka",
    title: "Připomínka odejde dřív, než vznikne díra.",
    text: "Klientská historie, poznámky a kapacita dne pro opakované návštěvy.",
  },
  {
    src: "/marketing/time-engine-fitness.webp",
    alt: "Tréninkové studio s volnými sloty pro konzultace a lekce",
    label: "Trénink",
    signal: "slot se uvolní",
    title: "Uvolněný termín se vrátí do nabídky.",
    text: "Jeden rezervační odkaz pro termíny, které klient zvládne vybrat sám.",
  },
] as const;

const messageCloud = [
  "Můžu dnes po práci?",
  "Přesuneme to na pátek?",
  "Nepřijdu, omlouvám se",
  "Má Tereza něco v 15:30?",
] as const;

const engineSlots = [
  { time: "09:30", title: "Barva kořínků", tone: "bg-[var(--cobalt)] text-white" },
  { time: "11:00", title: "Volné okno", tone: "bg-[var(--apricot)] text-[var(--ink)]" },
  { time: "14:00", title: "SMS připomínka", tone: "bg-[var(--mint)] text-[var(--mint-ink)]" },
  { time: "16:30", title: "Riziko no-show", tone: "bg-[var(--apricot-tint)] text-[var(--ink)]", iconTone: "text-[var(--signal-red)]" },
] as const;

const timeProofChips = [
  { time: "09:30", label: "obsazeno", tone: "bg-[var(--ink)] text-white" },
  { time: "11:00", label: "obsazeno", tone: "bg-[var(--ink)] text-white" },
  { time: "14:00", label: "volno", tone: "bg-[var(--mint)] text-[var(--mint-ink)]" },
] as const;

const pricingPlans = [
  {
    name: "Pilot",
    price: "0 Kč",
    status: "active",
    note: "pro první zapojené provozy",
    description: "Pro podniky, které chtějí ověřit online rezervace a kalendář v reálném provozu.",
    features: ["online rezervace", "kalendář", "klienti", "služby a tým"],
  },
  {
    name: "Solo",
    price: null,
    status: "pripravujeme",
    note: "pro jednoho provozovatele",
    description: "Jednoduchý tarif pro freelancery, trenéry a malé provozy bez složité správy týmu.",
    features: ["1 provoz", "rezervační stránka", "e-mail potvrzení", "změny termínu klientem"],
  },
  {
    name: "Tým",
    price: null,
    status: "pripravujeme",
    note: "pro více lidí v kalendáři",
    description: "Pro salony, ordinace a služby, kde rezervace řeší více zaměstnanců.",
    features: ["více zaměstnanců", "role vlastníka a týmu", "pracovní doba", "provozní přehledy"],
  },
] as const;

const securityItems = [
  ["Data každého podniku zvlášť", "Klienti, termíny a historie jednoho provozu se nemíchají s jiným podnikem."],
  ["Bezpečné rezervace", "Volné termíny se ověřují při odeslání, aby klient neobsadil čas, který už neplatí."],
  ["Evropský provoz", "Projekt cílí na český a EU trh, s důrazem na jednoduchost a kontrolu dat."],
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

const finalCta = {
  title: "Pojďme zkusit, jestli se váš den dá číst líp.",
  text: "Začněte pilotem, projděte ukázku nebo si otevřete demo rezervace z pohledu klienta.",
} as const;

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

      <section id="trust-bar" className="dispatch-proof-strip border-y border-[var(--ink)] bg-[var(--ink)] py-5 text-white">
        <div className="mx-auto grid w-full max-w-[1280px] gap-4 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.4fr] lg:px-8">
          <span className="sr-only" aria-hidden="true" />
          <p className="sr-only">Temaro pro {trustBarItems.join(", ")}.</p>
          <div>
            <p className="font-time text-xs font-semibold uppercase tracking-[0.16em] text-white/58">Dispečink dne</p>
            <h2 className="font-display mt-2 max-w-xl text-3xl font-semibold leading-[0.98] sm:text-5xl">
              Jeden den, čtyři provozní signály.
            </h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {dispatchProofItems.map((item, index) => (
              <article key={item.label} className="grid gap-1 rounded-[1.15rem] border border-white/12 bg-white/[0.06] px-4 py-3">
                <p className="font-time text-xs font-semibold text-[var(--apricot)]">0{index + 1}</p>
                <h3 className="text-base font-bold tracking-[-0.02em]">{item.label}</h3>
                <p className="text-xs font-medium leading-5 text-white/68">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="casovy-engine" className="engine-rail-section relative overflow-hidden py-20 sm:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(43,63,242,0.14),transparent_24rem)]" />
        <div className="relative mx-auto grid w-full max-w-[1280px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <div className="sticky top-28">
              <p className="section-eyebrow">Časový engine</p>
              <h2 className="font-display mt-3 max-w-2xl text-balance text-5xl font-semibold leading-[0.96] sm:text-7xl">
                Chaos se skládá do dne.
              </h2>
              <p className="mt-5 max-w-xl text-lg font-normal leading-8 text-[var(--ink-soft)]">
                Fotka provozu ukáže realitu. Temaro přes ni položí signály dne: volné okno, riziko no-show, připomínku a potvrzenou rezervaci.
              </p>
              <TimeEnginePanel messageCloud={messageCloud} engineSlots={engineSlots} />
            </div>
          </Reveal>

          <div className="grid gap-4">
            {visualProofImages.map((image, index) => (
              <Reveal key={image.src} delay={index * 80}>
                <article className="photo-proof-card group relative min-h-[300px] overflow-hidden rounded-[2rem] border border-[var(--paper-line)] bg-[var(--ink)] shadow-[0_26px_80px_rgba(23,26,33,0.18)] sm:min-h-[360px]">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 700px, 95vw"
                    quality={70}
                    className="object-cover transition duration-700 group-hover:scale-[1.045]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(23,26,33,0.78)] via-[rgba(23,26,33,0.26)] to-transparent" />
                  <div className="absolute inset-x-4 bottom-4 grid gap-3 sm:inset-x-6 sm:bottom-6 sm:grid-cols-[1fr_auto] sm:items-end">
                    <div>
                      <span className="font-time inline-flex rounded-full bg-white/88 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink)] backdrop-blur">
                        {image.label}
                      </span>
                      <p className="font-display mt-3 max-w-md text-4xl font-semibold leading-[0.96] text-white sm:text-5xl">
                        {image.title}
                      </p>
                      <p className="mt-3 max-w-md text-sm font-normal leading-6 text-white/80">
                        {image.text}
                      </p>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/18 bg-white/90 p-3 text-[var(--ink)] shadow-xl backdrop-blur">
                      <p className="font-time text-xs font-semibold uppercase tracking-[0.12em] text-[var(--cobalt)]">{image.signal}</p>
                      <div className="mt-3 flex w-48 flex-wrap gap-1.5">
                        {timeProofChips.map((chip) => (
                          <span key={`${image.src}-${chip.time}`} className={`font-time rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${chip.tone}`}>
                            {chip.time} · {chip.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="jak-to-funguje" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid gap-6 lg:grid-cols-[0.86fr_1.14fr]">
            <div>
              <p className="section-eyebrow">Jak to funguje</p>
              <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Z chaosu vznikne čitelná časová osa.
              </h2>
            </div>
            <p className="max-w-xl text-lg font-normal leading-8 text-[var(--ink-soft)] lg:pt-8">
              Temaro nestaví další formulář. Skládá službu, člověka, klienta a čas do stejného provozního rytmu.
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

      <section id="bento" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 max-w-3xl">
            <p className="section-eyebrow">Proč Temaro</p>
            <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
              Rezervace tam, kde už klient rozhoduje.
            </h2>
          </div>
        </Reveal>
        <div className="grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4">
          {bentoCards.map((card, index) => (
            <Reveal key={card.title} delay={index * 55} className="h-full">
              <article className={`group flex h-full flex-col justify-between rounded-[1.75rem] border border-[var(--paper-line)] p-6 shadow-sm transition hover:-translate-y-1 ${card.className}`}>
                <div className="grid size-12 place-items-center rounded-2xl bg-white/22 text-current ring-1 ring-current/10">
                  <card.icon className="size-6" strokeWidth={1.9} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-[-0.03em]">{card.title}</h3>
                  <p className={`mt-3 text-sm font-normal leading-6 ${card.className.includes("text-white") ? "text-white/92" : "text-[var(--ink-soft)]"}`}>
                    {card.text}
                  </p>
                  {"detail" in card ? (
                    <p className="mt-8 max-w-xs text-2xl font-semibold leading-tight text-white">
                      {card.detail}
                    </p>
                  ) : null}
                  {"chip" in card ? (
                    <span className="font-time mt-5 inline-flex rounded-full bg-white/72 px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
                      {card.chip}
                    </span>
                  ) : null}
                  {"history" in card ? (
                    <div className="mt-5 grid gap-2">
                      {card.history.map((item) => (
                        <span key={item} className="font-time rounded-full bg-white/58 px-3 py-2 text-xs font-semibold text-[var(--mint-ink)]">
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {"channels" in card ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {card.channels.map((channel) => (
                        <span key={channel} className="font-time rounded-full border border-[var(--paper-line)] bg-[var(--porcelain)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]">
                          {channel}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="produktove-demo" className="product-demo-rail mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[2rem] border border-[var(--paper-line)] bg-[var(--ink)] text-white shadow-[0_34px_100px_rgba(23,26,33,0.22)]">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="p-6 sm:p-8">
                <div className="grid size-13 place-items-center rounded-2xl bg-[var(--apricot)] text-[var(--ink)]">
                  <MonitorPlay className="size-6" strokeWidth={1.8} />
                </div>
                <p className="font-time mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-white/56">Produktová ukázka</p>
                <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                  Kalendář, který ukazuje napětí dne.
                </h2>
                <p className="mt-5 max-w-md text-base font-normal leading-7 text-white/70">
                  Ukázka staví před oči to hlavní: volná okna, rezervace, zdroje klientů a místa, kde může den prasknout.
                </p>
                <Link
                  href="/ukazka"
                  className="temaro-focus-ring mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-bold text-[var(--ink)] transition hover:-translate-y-0.5"
                >
                  Spustit produktovou ukázku
                  <ArrowRight className="size-4" />
                </Link>
              </div>
              <div className="bg-white/[0.06] p-4 sm:p-6">
                <div className="rounded-[1.5rem] border border-white/12 bg-white p-4 text-[var(--ink)]">
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--paper-line)] pb-4">
                    <div>
                      <p className="section-eyebrow">Přehled provozu</p>
                      <h3 className="mt-1 text-2xl font-bold tracking-[-0.03em]">Středa v Hair Studio Luna</h3>
                    </div>
                    <span className="font-time rounded-full bg-[var(--cobalt-tint)] px-3 py-1.5 text-sm font-semibold text-[var(--cobalt)]">3 volná okna</span>
                  </div>
                  <div className="mt-5 grid gap-3">
                    {demoMoments.map(([time, title, text]) => (
                      <div key={time} className="grid grid-cols-[4.5rem_1fr] items-center gap-4 rounded-2xl bg-[var(--porcelain)] p-4">
                        <span className="font-time text-lg font-semibold text-[var(--cobalt)]">{time}</span>
                        <div>
                          <p className="font-bold">{title}</p>
                          <p className="mt-1 text-sm font-normal text-[var(--ink-soft)]">{text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="rounded-[2rem] bg-[var(--ink)] p-8 text-white shadow-[0_30px_90px_rgba(23,26,33,0.28)] sm:p-12">
            <p className="font-time text-xs font-semibold uppercase tracking-[0.18em] text-white/64">Manifest</p>
            <p className="font-display mt-5 max-w-5xl text-balance text-5xl font-semibold leading-[0.98] sm:text-7xl">
              Neprodáváme formulář. Prodáváme klidný provoz.
            </p>
            <p className="mt-6 max-w-2xl text-lg font-normal leading-8 text-white/78">
              Vlastní rezervační odkaz, váš kalendář, vaši klienti. Žádná provize z toho, co jste si přivedli sami.
            </p>
          </div>
        </Reveal>
      </section>

      <section id="cenik" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 max-w-3xl">
            <p className="section-eyebrow">Ceník</p>
            <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
              Transparentní cena bez provizních překvapení.
            </h2>
          </div>
        </Reveal>
        <div className="grid snap-x gap-4 overflow-x-auto pb-2 lg:grid-cols-3 lg:overflow-visible">
          {pricingPlans.map((plan, index) => (
            <Reveal key={plan.name} delay={index * 70} className="h-full min-w-[84vw] snap-center lg:min-w-0">
              <article className={`flex h-full flex-col rounded-[1.75rem] border p-6 shadow-sm ${index === 0 ? "border-[var(--cobalt)] bg-white shadow-[0_18px_54px_rgba(43,63,242,0.12)]" : "border-[var(--paper-line)] bg-white/70"}`}>
                <div className="mb-8 flex items-center justify-between gap-4">
                  <h3 className="text-3xl font-bold tracking-[-0.04em]">{plan.name}</h3>
                  <span className={`font-time rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${plan.status === "pripravujeme" ? "bg-[var(--apricot-tint)] text-[var(--ink)]" : "bg-[var(--cobalt-tint)] text-[var(--cobalt)]"}`}>
                    {plan.status === "pripravujeme" ? "připravujeme" : "pilot"}
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

      <section id="bezpecnost" className="bg-[var(--porcelain-deep)] py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <header>
              <p className="section-eyebrow">Důvěra a bezpečnost</p>
              <h2 className="font-display mt-3 text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                Jednoduchá rezervace nesmí znamenat slabá data.
              </h2>
              <p className="mt-5 max-w-md text-sm font-normal leading-6 text-[var(--ink-soft)]">
                Rezervační systém pracuje s klienty, termíny a historií podniku. Proto musí být kontrola dat základ, ne doplněk.
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

      <section className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid gap-6 rounded-[2rem] border border-[var(--paper-line)] bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="section-eyebrow">Další krok</p>
              <h2 className="font-display mt-3 max-w-3xl text-balance text-5xl font-semibold leading-[0.98] sm:text-6xl">
                {finalCta.title}
              </h2>
              <p className="mt-5 max-w-xl text-base font-normal leading-7 text-[var(--ink-soft)]">{finalCta.text}</p>
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
              Rezervační systém pro salony, ordinace, trenéry a další služby. Vyrobeno v Česku, připraveno pro EU provoz.
            </p>
          </div>
          <div>
            <p className="section-eyebrow text-[var(--ink-soft)]">Produkt</p>
            <ul className="mt-4 space-y-2 text-sm font-bold">
              <li><Link href="#jak-to-funguje" className="text-[var(--ink)] hover:underline">Produkt</Link></li>
              <li><Link href="#bento" className="text-[var(--ink)] hover:underline">Proč Temaro</Link></li>
              <li><Link href="/podniky" className="text-[var(--ink)] hover:underline">Pro zákazníky</Link></li>
              <li><Link href="/ukazka" className="text-[var(--ink)] hover:underline">Interaktivní ukázka</Link></li>
              <li><Link href="#cenik" className="text-[var(--ink)] hover:underline">Ceník</Link></li>
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
