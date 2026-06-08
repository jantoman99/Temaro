import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Link2,
  MailCheck,
  MonitorPlay,
  MousePointerClick,
  PhoneOff,
  QrCode,
  ShieldCheck,
  Smartphone,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";

import PublicSlugBookingPage from "@/app/(booking)/[slug]/page";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { LiveProductShowcase } from "@/components/marketing/live-product-showcase";
import { MarketingHeader } from "@/components/marketing/marketing-header";
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

const heroTrustItems = ["Bez karty na start", "Žádná provize z vašich klientů", "Vlastní rezervační odkaz"] as const;

const features = [
  {
    icon: PhoneOff,
    title: "Méně telefonátů",
    description: "Rezervace vznikne bez zpráv tam a zpět. Vy řešíte práci, ne hledání volného okna.",
    tone: "border-info/25 bg-info/10 text-info hover:border-info/45",
  },
  {
    icon: AlertTriangle,
    title: "No-show pod kontrolou",
    description: "Rizikový klient nebo čekající termín se neztratí v poznámkách. Systém ho vytáhne dopředu.",
    tone: "border-warning/25 bg-warning/10 text-warning hover:border-warning/45",
  },
  {
    icon: UsersRound,
    title: "Paměť podniku",
    description: "Historie návštěv, preference a poznámky zůstávají u klienta, ne v hlavě jednoho člověka.",
    tone: "border-success/25 bg-success/10 text-success hover:border-success/45",
  },
] as const;

const visualSegments = [
  {
    title: "Barber a salon",
    text: "Online termíny, oblíbený člověk a rychlé přeobjednání bez zpráv tam a zpět.",
    image: "/marketing/barber-studio-ai.webp",
    alt: "Detail barber služby během úpravy vousů",
  },
  {
    title: "Beauty provoz",
    text: "Klientská historie, poznámky a kapacita dne pro opakované návštěvy.",
    image: "/marketing/salon-interior-ai.webp",
    alt: "Klientka s upravenými vlasy v salonním prostředí",
  },
  {
    title: "Trenéři a konzultace",
    text: "Jeden rezervační odkaz pro termíny, které klient zvládne vybrat sám.",
    image: "/marketing/training-studio-ai.webp",
    alt: "Trénink s činkou ve fitness studiu",
  },
] as const;

const audienceSegments = [
  {
    title: "Salony a barber shopy",
    text: "Klient si vybere službu, člověka i čas. Tým má přehled bez papírového diáře.",
    points: ["oblíbený člověk", "historie návštěv", "rychlé přeobjednání"],
    tone: "border-l-tag-blue",
    iconTone: "bg-tag-blue/10 text-tag-blue",
  },
  {
    title: "Trenéři a konzultanti",
    text: "Pošlete jeden odkaz a klient si najde čas, který sedí oběma stranám.",
    points: ["veřejný rezervační odkaz", "volná okna", "potvrzení e-mailem"],
    tone: "border-l-tag-green",
    iconTone: "bg-tag-green/10 text-tag-green",
  },
  {
    title: "Ordinace a péče",
    text: "Přehledné potvrzování, změny termínů a historie bez zbytečného provozního hluku.",
    points: ["čekající rezervace", "přehled změn", "bezpečné odkazy pro klienty"],
    tone: "border-l-tag-amber",
    iconTone: "bg-tag-amber/10 text-tag-amber",
  },
  {
    title: "Autoservisy a lokální služby",
    text: "Kapacita dne, kontakt na klienta a interní poznámky jsou dostupné ve správný moment.",
    points: ["kapacita dne", "interní poznámky", "rizikové termíny"],
    tone: "border-l-tag-violet",
    iconTone: "bg-tag-violet/10 text-tag-violet",
  },
] as const;

const pricingPlans = [
  {
    name: "Pilot",
    price: "0 Kč",
    note: "pro první zapojené provozy",
    description: "Pro první podniky, které chtějí ověřit online rezervace a kalendář v reálném provozu.",
    features: ["online rezervace", "kalendář", "klienti", "služby a tým"],
  },
  {
    name: "Solo",
    price: "připravujeme",
    note: "pro jednoho provozovatele",
    description: "Jednoduchý tarif pro freelancery, trenéry a malé provozy bez složité správy týmu.",
    features: ["1 provoz", "rezervační stránka", "e-mail potvrzení", "změny termínu klientem"],
  },
  {
    name: "Tým",
    price: "připravujeme",
    note: "pro více lidí v kalendáři",
    description: "Pro salony, ordinace a služby, kde rezervace řeší více zaměstnanců.",
    features: ["více zaměstnanců", "role vlastníka a týmu", "pracovní doba", "provozní přehledy"],
  },
] as const;

const trustItems = [
  ["Data každého podniku zvlášť", "Klienti, termíny a historie jednoho provozu se nemíchají s jiným podnikem."],
  ["Bezpečné rezervace", "Volné termíny se ověřují při odeslání, aby klient nemohl obsadit čas, který už neplatí."],
  ["Evropský provoz", "Projekt cílí na český a EU trh, s důrazem na jednoduchost a kontrolu dat."],
] as const;

const proofMetrics = [
  [CheckCircle2, "3 kroky", "rezervace", "bg-info/10 text-info"],
  [BadgeEuro, "0 Kč", "pilot", "bg-success/10 text-success"],
  [ShieldCheck, "0 %", "provize", "bg-warning/10 text-warning"],
] as const;

const workflowSteps = [
  {
    icon: ClipboardList,
    title: "Nastavíte služby a tým",
    text: "Vyberete obor, přidáte služby, pracovní dobu a lidi, kteří se dají rezervovat.",
  },
  {
    icon: Link2,
    title: "Sdílíte rezervační odkaz",
    text: "Odkaz dáte na web, Instagram, Google profil, do zprávy nebo na QR kód v provozovně.",
  },
  {
    icon: CalendarDays,
    title: "Klient si vybere termín",
    text: "Klient vidí volné časy, vybere službu, doplní kontakt a dostane potvrzení.",
  },
  {
    icon: MailCheck,
    title: "Provoz má přehled",
    text: "Rezervace se objeví v kalendáři, klient zůstane v historii a připomínky omezí výpadky.",
  },
] as const;

const bookingChannels = [
  {
    icon: MonitorPlay,
    title: "Vlastní web",
    text: "Rezervační tlačítko nebo widget vložený přímo na web podniku.",
  },
  {
    icon: Smartphone,
    title: "Instagram bio",
    text: "Krátký odkaz pro story, profil a zprávy klientům.",
  },
  {
    icon: MousePointerClick,
    title: "Google profil",
    text: "Měřitelný odkaz pro klienty, kteří podnik našli ve vyhledávání.",
  },
  {
    icon: QrCode,
    title: "QR v provozovně",
    text: "Klient si uloží odkaz nebo se rovnou objedná na další návštěvu.",
  },
  {
    icon: CreditCard,
    title: "Zálohy a platby",
    text: "Připravené flow pro zálohy, doplatky a přehled plateb.",
  },
  {
    icon: MailCheck,
    title: "E-mail a SMS",
    text: "Potvrzení, připomínky a později cílené Last Minute nabídky.",
  },
] as const;

const demoMoments = [
  ["01", "Přehled provozu", "Co se děje dnes, kolik rezervací čeká a kde hrozí výpadek."],
  ["02", "Týmový kalendář", "Jak vypadá den, týden, volná okna a rezervace podle lidí."],
  ["03", "Rezervační stránka", "Jak klient vybere službu, termín a odešle rezervaci bez telefonátu."],
] as const;

const guideLinks = [
  {
    title: "Rezervační systém pro barbery",
    href: "/rezervacni-system-pro-barbery",
    text: "Online rezervace, barevný kalendář, klientská historie a méně telefonátů pro barber shopy.",
  },
  {
    title: "Rezervační systém pro kadeřnictví",
    href: "/rezervacni-system-pro-kadernictvi",
    text: "Týmový kalendář, klientská historie a méně ručního domlouvání pro kadeřnictví a hair studia.",
  },
  {
    title: "Rezervační systém pro kosmetický salon",
    href: "/rezervacni-system-pro-kosmeticky-salon",
    text: "Online rezervace, klientský kontext a menší no-show pro kosmetiku, lash i brow služby.",
  },
  {
    title: "Rezervační systém pro masáže a wellness",
    href: "/rezervacni-system-pro-masaze",
    text: "Delší termíny, klidnější kapacita dne a připravenost na připomínky a zálohy pro masáže i wellness.",
  },
  {
    title: "Jak snížit no-show",
    href: "/jak-snizit-no-show",
    text: "Praktický postup pro potvrzení termínu, připomínky, změny bez telefonátu a no-show signály.",
  },
  {
    title: "SMS připomínky rezervací",
    href: "/sms-pripominky-rezervaci",
    text: "Kdy se SMS připomínka opravdu vyplatí, pro které služby dává smysl a proč ji nespouštět plošně všem.",
  },
  {
    title: "Rezervační systém bez marketplace provizí",
    href: "/rezervacni-system-bez-marketplace-provizi",
    text: "Proč některé provozy chtějí vlastní rezervační odkaz, vlastní klientský vztah a bez provize z rezervací, které získaly samy.",
  },
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
    <main className="clean-saas-page min-h-screen overflow-hidden bg-[#f7f7f9] text-foreground dark:bg-background">
      <section id="produkt" className="relative signal-hero">
        <div className="mx-auto flex min-h-[88vh] w-full max-w-[1180px] flex-col px-4 py-4 sm:px-6 lg:px-0">
          <MarketingHeader />

          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12 lg:py-12">
            <section className="mx-auto w-full max-w-2xl text-left lg:mx-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm">
                <span className="signal-pulse size-2 rounded-full bg-primary" />
                Pro české salony, barbery a služby
              </div>

              <h1 className="mt-7 max-w-2xl text-balance text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-[5.25rem]">
                Méně telefonátů.
                <br />
                Více rezervací.
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-[1.55] text-secondary-foreground sm:text-xl">
                Temaro dá vašemu podniku vlastní rezervační stránku, týmový kalendář a přehled klientů. Klient se objedná sám, vy se věnujete práci.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={CTA.primary.href}
                  className="group/cta inline-flex h-12 min-w-44 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-primary-glow)] transition hover:-translate-y-0.5 hover:bg-primary/92"
                >
                  {CTA.primary.label}
                  <ArrowRight className="h-5 w-5 transition group-hover/cta:translate-x-0.5" />
                </Link>
                <Link
                  href={CTA.secondary.href}
                  className="inline-flex h-12 min-w-40 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-card/85 px-6 text-base font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-card"
                >
                  {CTA.secondary.label}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {heroTrustItems.map((item) => (
                  <span key={item} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-foreground shadow-sm">
                    {item}
                  </span>
                ))}
              </div>

              <div id="dukaz" className="mt-8 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
                {proofMetrics.map(([Icon, value, label, tone]) => (
                  <div key={label} className="rounded-xl border border-border bg-card p-3 shadow-sm sm:min-h-32 sm:p-4">
                    <div className={`mb-3 grid size-8 place-items-center rounded-lg sm:size-9 ${tone}`}>
                      <Icon className="size-4" strokeWidth={1.9} />
                    </div>
                    <p className="nums-tabular text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                      {value}
                    </p>
                    <p className="mt-1 max-w-[15rem] text-xs font-medium leading-4 text-secondary-foreground sm:mt-2 sm:text-sm sm:leading-5">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <LiveProductShowcase />
          </div>
        </div>
      </section>

      <section id="provoz" className="relative mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <Reveal>
            <header>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Proč Temaro</p>
              <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
                Postaveno pro provozy, ne pro marketplace.
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-7 text-secondary-foreground">
                Temaro má pomoct s vlastním klientským vztahem: odkaz na váš podnik, kalendář vašeho týmu a žádná provize z rezervací, které jste získali sami.
              </p>
            </header>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={index * 70} className="h-full">
                <article
                  className={`relative h-full overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 ${feature.tone}`}
                >
                  <div className={`mb-5 flex size-11 items-center justify-center rounded-xl ${feature.tone}`} aria-hidden>
                    <feature.icon className="h-5 w-5" strokeWidth={1.9} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{feature.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="jak-to-funguje" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Jak to funguje</p>
              <h2 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Od prázdného kalendáře k první online rezervaci.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-medium leading-6 text-secondary-foreground">
              Nejdřív musí být jasné, jak se podnik dostane od nastavení služeb k první rezervaci bez telefonátu.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-3 md:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <Reveal key={step.title} delay={index * 70} className="h-full">
              <article className="relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
                <span className="nums-tabular absolute right-4 top-4 text-xs font-bold text-muted-foreground">
                  {`0${index + 1}`}
                </span>
                <div className="mb-5 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="size-5" strokeWidth={1.9} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="booking-kanaly" className="bg-card py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <Reveal>
            <header className="lg:sticky lg:top-28">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Booking kanály</p>
              <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Rezervace nemá žít jen na jedné stránce.
              </h2>
              <p className="mt-5 max-w-md text-sm font-medium leading-6 text-secondary-foreground">
                Salony a lokální služby získávají klienty z webu, Instagramu, Google profilu, QR kódů i přímých zpráv.
                Temaro má tyto vstupy spojit do jednoho kalendáře a jednoho přehledu zdrojů.
              </p>
              <Link
                href="/ukazka"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-secondary"
              >
                Projít ukázku
                <ArrowRight className="size-4" />
              </Link>
            </header>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {bookingChannels.map((channel, index) => (
              <Reveal key={channel.title} delay={index * 55} className="h-full">
                <article className="group h-full rounded-2xl border border-border bg-background p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/35 hover:bg-card">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <channel.icon className="size-5" strokeWidth={1.9} />
                    </span>
                    <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-bold text-muted-foreground">
                      kanál
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{channel.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{channel.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="produktove-demo" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="overflow-hidden rounded-[1.75rem] border border-border bg-foreground text-background shadow-sm dark:bg-card dark:text-foreground">
            <div className="grid gap-0 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="p-6 sm:p-8">
                <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <MonitorPlay className="size-6" strokeWidth={1.8} />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-background/60 dark:text-secondary-foreground">
                  Produktová ukázka
                </p>
                <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  Místo dlouhého vysvětlování ukažte, jak rezervace projde systémem.
                </h2>
                <p className="mt-5 max-w-md text-base font-medium leading-7 text-background/70 dark:text-secondary-foreground">
                  Krátká ukázka pomůže rychle pochopit, že Temaro není jen formulář. Je to cesta od klienta přes kalendář až po provozní přehled.
                </p>
                <Link
                  href="/ukazka"
                  className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/92"
                >
                  Spustit produktovou ukázku
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="bg-background/8 p-4 sm:p-6 dark:bg-background/40">
                <div className="grid h-full gap-3">
                  {demoMoments.map(([step, title, text], index) => (
                    <Reveal key={title} delay={index * 80} className="h-full">
                      <article className="grid h-full gap-4 rounded-2xl border border-white/10 bg-background/95 p-5 text-foreground shadow-sm dark:border-border dark:bg-card sm:grid-cols-[4rem_1fr]">
                        <div className="nums-tabular grid size-12 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                          {step}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                          <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{text}</p>
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-24 text-center sm:px-6 lg:px-8">
        <Reveal>
          <p className="mx-auto max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
            Neprodáváme formulář. Prodáváme <span className="font-serif-accent text-primary">klidný provoz</span>.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base font-medium leading-7 text-secondary-foreground">
            Vlastní rezervační odkaz, váš kalendář, vaši klienti. Žádná provize z toho, co jste si přivedli sami.
          </p>
        </Reveal>
      </section>

      <section className="bg-card py-20">
        <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Provozní scénáře</p>
                <h2 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                  Vypadá jako systém pro služby, ne jako obecná šablona.
                </h2>
              </div>
              <p className="max-w-sm text-sm font-medium leading-6 text-secondary-foreground">
                Temaro míří na provozy, kde se střídají klienti, zaměstnanci, termíny a opakované návštěvy.
              </p>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {visualSegments.map((segment, index) => (
              <Reveal key={segment.title} delay={index * 70} className="h-full">
                <article className="group h-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={segment.image}
                      alt={segment.alt}
                      fill
                      sizes="(min-width: 1024px) 360px, 100vw"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold tracking-tight">{segment.title}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{segment.text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="pro-koho" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pro koho</p>
              <h2 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Jeden systém pro služby, kde rozhoduje čas.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-medium leading-6 text-secondary-foreground">
              Jeden základ pro různé provozy: kalendář, lidé, služby, klienti a jasný rezervační odkaz.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-3 md:grid-cols-2">
          {audienceSegments.map((segment, index) => (
            <Reveal key={segment.title} delay={index * 70} className="h-full">
              <article
                className={`h-full rounded-2xl border border-l-4 border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${segment.tone}`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className={`grid size-10 place-items-center rounded-xl ${segment.iconTone}`}>
                    <Building2 className="size-5" strokeWidth={1.9} />
                  </span>
                  <span className="nums-tabular text-xs font-bold text-muted-foreground">{`0${index + 1}`}</span>
                </div>
                <h3 className="text-xl font-semibold tracking-tight">{segment.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{segment.text}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {segment.points.map((point) => (
                    <span key={point} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-[#f7f7f9] py-20 dark:bg-background">
        <div className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
          <Reveal>
            <header>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Praktické návody</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-4xl">
                Začínáme tam, kde české provozovny nejvíc bolí čas a výpadky.
              </h2>
              <p className="mt-4 max-w-md text-sm font-medium leading-6 text-secondary-foreground">
                Praktické stránky řeší konkrétní situace: prázdná okna v kalendáři, zmeškané návštěvy, připomínky a
                vlastní vztah s klientem bez cizí provize.
              </p>
            </header>
          </Reveal>

          <div className="grid gap-3 sm:grid-cols-2">
            {guideLinks.slice(0, 4).map((guide, index) => (
              <Reveal key={guide.href} delay={index * 70} className="h-full">
                <Link
                  href={guide.href}
                  className="group block h-full rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/35"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">{guide.title}</h3>
                    <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                  </div>
                  <p className="mt-3 text-sm font-medium leading-6 text-secondary-foreground">{guide.text}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="cenik" className="mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
            <div className="bg-foreground p-6 text-background sm:p-8 dark:bg-card dark:text-foreground">
              <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <BadgeEuro className="size-6" strokeWidth={1.8} />
              </div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-background/60 dark:text-secondary-foreground">Ceník</p>
              <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Transparentní cena bez provizních překvapení.
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-7 text-background/70 dark:text-secondary-foreground">
                Nechceme stavět systém, který vydělává na tom, že vám přivede vlastního klienta. Pilot ověří provozní cestu,
                finální tarify zůstanou jednoduché a čitelné.
              </p>
            </div>

            <div className="grid gap-3 bg-secondary p-4 sm:p-6">
              {pricingPlans.map((plan, index) => (
                <article
                  key={plan.name}
                  className={`rounded-2xl border p-5 shadow-sm ${
                    index === 0 ? "border-primary/30 bg-card shadow-primary/10" : "border-border bg-card"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight">{plan.name}</h3>
                      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-secondary-foreground">
                        {plan.description}
                      </p>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <p className="text-2xl font-semibold tracking-tight text-primary">{plan.price}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">{plan.note}</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="size-4 text-success" strokeWidth={1.9} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
              <Link
                href={CTA.primary.href}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
              >
                {CTA.primary.label}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="bezpecnost" className="bg-secondary/70 py-20">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <Reveal>
            <header>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Bezpečnost a důvěra</p>
              <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
                Rezervace jsou jednoduché. Data musí být bezpečně oddělená.
              </h2>
              <p className="mt-5 max-w-md text-sm font-medium leading-6 text-secondary-foreground">
                Rezervační systém pracuje s klienty, termíny a historií podniku. Proto je důležité, aby se data nepletla
                mezi podniky a veřejná rezervace nešla obejít ručně poslaným formulářem.
              </p>
            </header>
          </Reveal>

          <div className="grid gap-3">
            {trustItems.map(([title, text], index) => (
              <Reveal key={title} delay={index * 70}>
                <article className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="size-5" strokeWidth={1.9} />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-secondary-foreground">{text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr_0.8fr] lg:px-8">
          <div>
            <TemaroLogo />
            <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-secondary-foreground">
              Rezervační systém pro salony, ordinace, trenéry a další služby. Vyrobeno v Česku, připraveno pro EU provoz.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Produkt</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              <li><Link href="#produkt" className="text-foreground hover:underline">Funkce</Link></li>
              <li><Link href="#pro-koho" className="text-foreground hover:underline">Pro koho</Link></li>
              <li><Link href="/podniky" className="text-foreground hover:underline">Pro zákazníky</Link></li>
              <li><Link href="/ukazka" className="text-foreground hover:underline">Interaktivní ukázka</Link></li>
              <li><Link href="#cenik" className="text-foreground hover:underline">Ceník</Link></li>
              <li><Link href="#bezpecnost" className="text-foreground hover:underline">Bezpečnost</Link></li>
              <li><Link href="/demo-barber" className="text-foreground hover:underline">Ukázka rezervace</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Návody</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              <li><Link href="/rezervacni-system-pro-barbery" className="text-foreground hover:underline">Pro barbery</Link></li>
              <li><Link href="/rezervacni-system-pro-kadernictvi" className="text-foreground hover:underline">Pro kadeřnictví</Link></li>
              <li><Link href="/rezervacni-system-pro-kosmeticky-salon" className="text-foreground hover:underline">Pro beauty salon</Link></li>
              <li><Link href="/rezervacni-system-pro-masaze" className="text-foreground hover:underline">Pro masáže</Link></li>
              <li><Link href="/jak-snizit-no-show" className="text-foreground hover:underline">No-show návod</Link></li>
              <li><Link href="/sms-pripominky-rezervaci" className="text-foreground hover:underline">SMS připomínky</Link></li>
              <li><Link href="/rezervacni-system-bez-marketplace-provizi" className="text-foreground hover:underline">Bez marketplace provizí</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Firma</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              <li><Link href="/login" className="text-foreground hover:underline">Přihlášení</Link></li>
              <li><Link href="/register" className="text-foreground hover:underline">Registrace podniku</Link></li>
              <li><Link href="/account/login" className="text-foreground hover:underline">Zákaznický účet</Link></li>
              <li><a href="mailto:hello@temaro.cz" className="text-foreground hover:underline">Kontakt</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-4 py-4 text-xs font-semibold text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p>© 2026 Temaro</p>
            <p>Online rezervace pro služby</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
