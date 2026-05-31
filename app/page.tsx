import {
  AlertTriangle,
  ArrowRight,
  BadgeEuro,
  Building2,
  CheckCircle2,
  PhoneOff,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";

import PublicSlugBookingPage from "@/app/(booking)/[slug]/page";
import { TemaroLogo } from "@/components/brand/temaro-logo";
import { InteractiveProductDemo } from "@/components/marketing/interactive-product-demo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { isLikelyPlatformHost, normalizeRequestHost } from "@/lib/custom-domain";
import { hasSupabaseAdminEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

const CTA = {
  primary: { href: "/register", label: "Začít zdarma" },
  secondary: { href: "/demo-barber", label: "Projít booking" },
} as const;

const navLinks = [
  ["#produkt", "Produkt"],
  ["#ucty", "Účty"],
  ["#pro-koho", "Pro koho"],
  ["/podniky", "Podniky"],
  ["#cenik", "Ceník"],
  ["#bezpecnost", "Bezpečnost"],
  [CTA.secondary.href, "Demo"],
] as const;

const features = [
  {
    icon: PhoneOff,
    title: "Méně telefonátů",
    description: "Rezervace vznikne bez zpráv tam a zpět. Vy řešíte práci, ne hledání volného okna.",
  },
  {
    icon: AlertTriangle,
    title: "No-show pod kontrolou",
    description: "Rizikový klient nebo čekající termín se neztratí v poznámkách. Systém ho vytáhne dopředu.",
  },
  {
    icon: UsersRound,
    title: "Paměť podniku",
    description: "Historie návštěv, preference a poznámky zůstávají u klienta, ne v hlavě jednoho člověka.",
  },
] as const;

const audienceSegments = [
  {
    title: "Salony a barber shopy",
    text: "Klient si vybere službu, člověka i čas. Tým má přehled bez papírového diáře.",
    points: ["oblíbený zaměstnanec", "historie návštěv", "rychlé přeobjednání"],
  },
  {
    title: "Trenéři a konzultanti",
    text: "Pošlete jeden odkaz a klient si najde čas, který sedí oběma stranám.",
    points: ["veřejný booking link", "volná okna", "potvrzení e-mailem"],
  },
  {
    title: "Ordinace a péče",
    text: "Přehledné potvrzování, změny termínů a historie bez zbytečného provozního hluku.",
    points: ["čekající rezervace", "audit změn", "bezpečné self-service odkazy"],
  },
  {
    title: "Autoservisy a lokální služby",
    text: "Kapacita dne, kontakt na klienta a interní poznámky jsou dostupné ve správný moment.",
    points: ["kapacita dne", "interní poznámky", "rizikové termíny"],
  },
] as const;

const pricingPlans = [
  {
    name: "Pilot",
    price: "0 Kč",
    note: "po dobu ověření MVP",
    description: "Pro první podniky, které chtějí ověřit booking flow a kalendář v reálném provozu.",
    features: ["online booking", "kalendář", "klienti", "služby a tým"],
  },
  {
    name: "Solo",
    price: "připravujeme",
    note: "pro jednoho provozovatele",
    description: "Jednoduchý tarif pro freelancery, trenéry a malé provozy bez složité správy týmu.",
    features: ["1 provoz", "booking stránka", "e-mail potvrzení", "self-service změny"],
  },
  {
    name: "Tým",
    price: "připravujeme",
    note: "pro více lidí v kalendáři",
    description: "Pro salony, ordinace a služby, kde rezervace řeší více zaměstnanců.",
    features: ["více zaměstnanců", "role owner/staff", "pracovní doba", "provozní přehledy"],
  },
] as const;

const trustItems = [
  ["Multi-tenant základ", "Data podniků jsou oddělená tenant kontextem a serverovou validací."],
  ["Bezpečné rezervace", "Veřejný booking neposílá tenant_id z klienta a termíny se ověřují serverově."],
  ["Evropský provoz", "Projekt cílí na český a EU trh, s důrazem na jednoduchost a kontrolu dat."],
] as const;

const proofMetrics = [
  ["448", "automatických testů chrání core flow"],
  ["0 %", "marketplace provize z vlastních klientů"],
  ["24 h", "reminder vrstva připravená pro ostrý provoz"],
] as const;

const guideLinks = [
  {
    title: "Rezervační systém pro barbery",
    href: "/rezervacni-system-pro-barbery",
    text: "Online booking, barevný kalendář, klientská historie a méně telefonátů pro barber shopy.",
  },
  {
    title: "Rezervační systém pro kadeřnictví",
    href: "/rezervacni-system-pro-kadernictvi",
    text: "Týmový kalendář, klientská historie a méně ručního domlouvání pro kadeřnictví a hair studia.",
  },
  {
    title: "Rezervační systém pro kosmetický salon",
    href: "/rezervacni-system-pro-kosmeticky-salon",
    text: "Beauty booking, klientský kontext a menší no-show pro kosmetiku, lash i brow služby.",
  },
  {
    title: "Rezervační systém pro masáže a wellness",
    href: "/rezervacni-system-pro-masaze",
    text: "Delší termíny, klidnější kapacita dne a připravenost na reminder a zálohy pro masáže i wellness.",
  },
  {
    title: "Jak snížit no-show",
    href: "/jak-snizit-no-show",
    text: "Praktický postup pro potvrzení termínu, připomínky, self-service změny a no-show signály.",
  },
  {
    title: "SMS připomínky rezervací",
    href: "/sms-pripominky-rezervaci",
    text: "Kdy se SMS reminder opravdu vyplatí, pro které služby dává smysl a proč ho nespouštět plošně všem.",
  },
  {
    title: "Rezervační systém bez marketplace provizí",
    href: "/rezervacni-system-bez-marketplace-provizi",
    text: "Proč některé provozy chtějí vlastní booking link, vlastní klientský vztah a bez provize z rezervací, které získaly samy.",
  },
] as const;

const flowSteps = [
  ["01", "Klient rezervuje", "Vybere službu, osobu a volný termín bez telefonátu."],
  ["02", "Podnik vidí signál", "Termín se objeví v kalendáři jako potvrzený nebo čekající."],
  ["03", "Historie zůstává", "Klientský kontext se použije při další návštěvě i změně termínu."],
] as const;

const accountTypes = [
  {
    label: "Účet pro podnikatele",
    title: "Provoz, tým a kalendář pod kontrolou",
    href: "/register",
    cta: "Registrovat podnik",
    points: ["služby, zaměstnanci a pracovní doba", "kalendář, klienti a platby", "booking stránka, sdílení a iCal export"],
  },
  {
    label: "Účet pro zákazníka",
    title: "Rezervace a historie bez volání",
    href: "/account/login",
    cta: "Přihlásit se jako zákazník",
    points: ["přihlášení přes Google", "přehled rezervací podle ověřeného e-mailu", "bez přístupu do admin dashboardu"],
  },
] as const;

const nextProductLayers = [
  ["Vyhledání podniků", "Veřejný katalog podle města, lokality a oboru, aby klient našel podnik podobně jako u velkých rezervačních platforem."],
  ["Mapa podniku", "Adresa, poloha na mapě a navigační kontext u veřejného profilu podniku i v discovery výsledcích."],
  ["Plný Google Calendar sync", "Obousměrnější integrace po současném iCal exportu, hlavně pro solo profesionály žijící v Google Kalendáři."],
] as const;

const signalMapNodes = [
  ["Klient", "pošle požadavek", "left-[8%] top-[18%]"],
  ["Slot", "najde volné okno", "left-[38%] top-[10%]"],
  ["Kalendář", "ověří kapacitu", "right-[10%] top-[25%]"],
  ["Riziko", "zvýrazní no-show", "left-[18%] bottom-[15%]"],
  ["Historie", "uloží kontext", "right-[18%] bottom-[12%]"],
] as const;

const bentoItems = [
  ["No-show signál", "Rizikový klient nezůstane schovaný v poznámce. Temaro ho ukáže tam, kde se rozhoduje o čase.", "2 potvrzení", "1 riziko"],
  ["Paměť klienta", "Historie, preference a poznámky se vrací do další rezervace bez hledání.", "6 návštěv", "VIP kontext"],
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
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="signal-hero signal-grid relative">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-4 sm:px-6 lg:px-8">
          <header className="sticky top-3 z-30 mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/88 px-3 py-3 shadow-lg shadow-primary/5 backdrop-blur-md sm:px-4 lg:backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3">
              <TemaroLogo />
            </Link>

            <nav className="order-3 flex w-full gap-1 overflow-x-auto border-t border-border/70 pt-2 lg:order-none lg:w-auto lg:border-t-0 lg:pt-0">
              {navLinks.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="shrink-0 rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <Link
                href="/login"
                className="hidden h-10 items-center justify-center rounded-md border border-border bg-card px-4 text-sm font-semibold text-muted-foreground shadow-sm transition hover:text-foreground sm:inline-flex"
              >
                Přihlášení
              </Link>
              <Link
                href={CTA.primary.href}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
              >
                {CTA.primary.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
            <section className="mx-auto max-w-2xl lg:mx-0">
              <div className="motion-reveal inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                <span className="signal-pulse size-2 rounded-full bg-primary" />
                Rezervační systém pro služby
              </div>

              <h1 className="motion-reveal mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
                Méně telefonátů.
                <br />
                <span className="font-serif-accent text-primary">Klidnější</span> provoz.
              </h1>
              <p className="motion-reveal mt-6 max-w-xl text-lg font-medium leading-[1.6] text-muted-foreground sm:text-xl">
                Pro salony, ordinace, trenéry a autoservisy. Klient si zarezervuje online, vy vidíte dnešní termíny,
                rizika a klientský kontext v jednom přehledu.
              </p>

              <div className="motion-reveal mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={CTA.primary.href}
                  className="group/cta inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-primary-glow)] transition hover:-translate-y-0.5 hover:bg-primary/92"
                >
                  {CTA.primary.label}
                  <ArrowRight className="h-5 w-5 transition group-hover/cta:translate-x-0.5" />
                </Link>
                <Link
                  href={CTA.secondary.href}
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card/85 px-6 text-base font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-card"
                >
                  {CTA.secondary.label}
                </Link>
              </div>

              <div id="dukaz" className="motion-reveal mt-12 grid gap-3 sm:grid-cols-3">
                {proofMetrics.map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-border/80 bg-card/78 p-4 shadow-sm backdrop-blur">
                    <p className="nums-tabular text-3xl font-semibold tracking-tight text-primary">{value}</p>
                    <p className="mt-2 text-sm font-medium leading-5 text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <InteractiveProductDemo />
          </div>
        </div>
      </section>

      <section id="provoz" className="relative mx-auto w-full max-w-[1180px] px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Provozní realita</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
              Neprodáváme formulář. Prodáváme klid v provozu.
            </h2>
            <p className="mt-5 max-w-md text-sm font-medium leading-6 text-muted-foreground">
              Rezervace není izolovaný formulář. Je to tok mezi klientem, kalendářem, týmem a historií podniku.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
              >
                <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary" aria-hidden>
                  <feature.icon className="h-5 w-5" strokeWidth={1.9} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Temaro Signal Map</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Vizuální podpis, který není jen další <span className="text-primary">SaaS karta</span>.
            </h2>
            <p className="mt-5 max-w-md text-sm font-medium leading-6 text-muted-foreground">
              Každá rezervace je signál. Temaro ho propojí s kapacitou dne, klientem, rizikem a dalším krokem. Tenhle
              motiv se má opakovat napříč landingem, bookingem i aplikací.
            </p>
          </header>

          <div className="signal-map relative min-h-[28rem] overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20 bg-primary/10" />
            <div className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20">
              Temaro
            </div>
            <div className="signal-flow absolute left-[14%] right-[14%] top-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="signal-flow absolute bottom-[20%] left-1/2 top-[18%] w-px bg-gradient-to-b from-transparent via-info/45 to-transparent" />
            {signalMapNodes.map(([title, text, position], index) => (
              <div
                key={title}
                className={`motion-reveal absolute ${position} w-36 rounded-2xl border border-border bg-card/88 p-4 shadow-sm backdrop-blur`}
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="size-2 rounded-full bg-primary" />
                </div>
                <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
                <p className="mt-1 text-xs font-semibold leading-5 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="command-surface interactive-demo-shell overflow-hidden rounded-xl p-5 shadow-[var(--shadow-command)] sm:p-6">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">Rezervační tok</p>
              <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
                Od volného okna k návratu klienta.
              </h2>
              <p className="mt-5 max-w-md text-base font-medium leading-7 text-white/68">
                Temaro má působit jako provozní systém, ne jen jako online formulář. Každý termín má stav, klienta a
                další krok.
              </p>
            </div>

            <div className="grid gap-3">
              {flowSteps.map(([number, title, text]) => (
                <article key={number} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                  <div className="flex items-start gap-4">
                    <span className="nums-tabular grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
                      {number}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
                      <p className="mt-1 text-sm font-medium leading-6 text-white/62">{text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="bento" className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Bento provozu</p>
            <h2 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Jeden systém. Více provozních signálů.
            </h2>
          </div>
          <p className="max-w-sm text-sm font-medium leading-6 text-muted-foreground">
            Bento vrstva ukazuje produkt po částech: kalendář, klient, riziko, důkaz a použitelnost v různých oborech.
          </p>
        </div>
        <div className="grid auto-rows-[11rem] gap-4 md:grid-cols-4">
          <article className="motion-reveal relative overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm md:col-span-2 md:row-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Client memory</p>
            <h3 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight">Klient není jen jméno v kalendáři.</h3>
            <p className="mt-3 max-w-md text-sm font-medium leading-6 text-muted-foreground">
              Poznámka, historie, preferovaný člověk a no-show signál jsou dostupné dřív, než vznikne další problém.
            </p>
            <div className="absolute bottom-5 left-5 right-5 grid gap-2 sm:grid-cols-3">
              {["Preference", "Historie", "Riziko"].map((item, index) => (
                <div key={item} className="rounded-lg border border-border bg-secondary/80 p-3">
                  <p className="nums-tabular text-lg font-semibold">{index + 1}</p>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </article>
          {bentoItems.map(([title, text, value, label]) => (
            <article key={title} className="motion-reveal rounded-xl border border-border bg-card p-5 shadow-sm md:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{text}</p>
                </div>
                <div className="shrink-0 rounded-lg bg-secondary px-3 py-2 text-right">
                  <p className="nums-tabular text-lg font-semibold">{value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
                </div>
              </div>
            </article>
          ))}
          <article className="motion-reveal rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="nums-tabular text-3xl font-semibold text-primary">422</p>
            <p className="mt-2 text-sm font-bold text-foreground">automatických testů</p>
            <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">Core flow hlídané před pilotem.</p>
          </article>
          <article className="motion-reveal rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="nums-tabular text-3xl font-semibold text-primary">0 %</p>
            <p className="mt-2 text-sm font-bold text-foreground">provize</p>
            <p className="mt-1 text-xs font-medium leading-5 text-muted-foreground">Vlastní klient zůstává váš.</p>
          </article>
          <article className="motion-reveal rounded-xl border border-border bg-card p-5 shadow-sm md:col-span-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Kalendář jako vrstva</p>
            <div className="mt-4 grid grid-cols-7 gap-1">
              {[35, 58, 80, 42, 68, 74, 50].map((height, index) => (
                <div key={`${height}-${index}`} className="flex h-24 items-end rounded-md bg-secondary p-1">
                  <div className="w-full rounded bg-primary/70" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
          </article>
          <article className="motion-reveal rounded-xl border border-border bg-card p-5 shadow-sm md:col-span-4">
            <div className="flex flex-wrap items-center gap-2">
              {["barber", "salon", "ordinace", "trenér", "autoservis", "konzultace"].map((chip) => (
                <span key={chip} className="rounded-full border border-border bg-secondary px-3 py-1.5 text-sm font-semibold text-muted-foreground">
                  {chip}
                </span>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section id="pro-koho" className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pro koho</p>
            <h2 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Jeden systém pro služby, kde rozhoduje <span className="font-serif-accent text-primary">čas</span>.
            </h2>
          </div>
          <p className="max-w-sm text-sm font-medium leading-6 text-muted-foreground">
            Jeden základ pro různé provozy: kalendář, lidé, služby, klienti a jasný booking odkaz.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {audienceSegments.map((segment, index) => (
            <article key={segment.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Building2 className="size-5" strokeWidth={1.9} />
                </span>
                <span className="nums-tabular text-xs font-bold text-muted-foreground">{`0${index + 1}`}</span>
              </div>
              <h3 className="text-xl font-semibold tracking-tight">{segment.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{segment.text}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {segment.points.map((point) => (
                  <span key={point} className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
                    {point}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="ucty" className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Dva typy účtů</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Jeden systém pro podnik. Druhý pohled pro jeho zákazníky.
            </h2>
            <p className="mt-5 max-w-md text-sm font-medium leading-6 text-muted-foreground">
              Podnikatel spravuje provoz, tým a booking stránku. Zákazník se může přihlásit přes Google a vidět své
              rezervace podle ověřeného e-mailu, aniž by měl přístup do administrace.
            </p>
          </header>

          <div className="grid gap-4">
            {accountTypes.map((account, index) => (
              <article key={account.label} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{account.label}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{account.title}</h3>
                  </div>
                  <span className="nums-tabular grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-sm font-bold text-primary">
                    {`0${index + 1}`}
                  </span>
                </div>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  {account.points.map((point) => (
                    <div key={point} className="rounded-xl border border-border bg-secondary/75 p-3 text-sm font-semibold leading-5 text-muted-foreground">
                      {point}
                    </div>
                  ))}
                </div>
                <Link
                  href={account.href}
                  className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:border-primary/35 hover:text-primary"
                >
                  {account.cta}
                  <ArrowRight className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Další produktová vrstva</p>
              <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl">
                Od vlastního booking odkazu k vyhledání podniku.
              </h2>
            </div>
            <p className="max-w-sm text-sm font-medium leading-6 text-muted-foreground">
              Temaro dnes staví na vlastním klientském vztahu bez marketplace provizí. Discovery podle měst, mapa a
              plný sync kalendáře jsou schválené další vrstvy po stabilním core.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {nextProductLayers.map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-border bg-secondary/75 p-5">
                <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-xl border border-border bg-card p-5 shadow-sm lg:grid-cols-[0.82fr_1.18fr] lg:p-6">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Praktické návody</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl">
              Začínáme tam, kde české provozovny nejvíc bolí čas a výpadky.
            </h2>
            <p className="mt-4 max-w-md text-sm font-medium leading-6 text-muted-foreground">
              První SEO/GEO vrstva není obecný blog. Je to produktový obsah pro konkrétní segmenty a časté provozní
              otázky, které mají přivádět relevantní piloty.
            </p>
          </header>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {guideLinks.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-2xl border border-border bg-secondary/80 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:bg-secondary"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">{guide.title}</h3>
                  <ArrowRight className="mt-1 size-4 shrink-0 text-primary transition group-hover:translate-x-0.5" />
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{guide.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="cenik" className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
          <div className="command-surface p-6 sm:p-8">
            <div className="mb-8 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <BadgeEuro className="size-6" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/58">Ceník</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Transparentní cena bez marketplace překvapení.
            </h2>
            <p className="mt-5 max-w-md text-base font-medium leading-7 text-white/68">
              Nechceme stavět systém, který vydělává na tom, že vám přivede vlastního klienta. Pilot ověří workflow,
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
                    <p className="mt-2 max-w-md text-sm font-medium leading-6 text-muted-foreground">
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
      </section>

      <section id="bezpecnost" className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Bezpečnost a důvěra</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Rezervace jsou jednoduché. Data musí být <span className="font-serif-accent text-primary">pevná</span>.
            </h2>
            <p className="mt-5 max-w-md text-sm font-medium leading-6 text-muted-foreground">
              Rezervační systém pracuje s klienty, termíny a historií podniku. Proto je důležité, aby se data nepletla
              mezi podniky a veřejný booking nešel obejít ručně poslaným formulářem.
            </p>
          </header>

          <div className="grid gap-3">
            {trustItems.map(([title, text]) => (
              <article key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" strokeWidth={1.9} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1 text-sm font-medium leading-6 text-muted-foreground">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:grid-cols-3">
          {[
            ["Před Temarem", "Telefon, poznámky bokem, ruční přepis a nejasné změny."],
            ["S Temarem", "Rezervace, potvrzení, klient i riziko jsou vidět v jednom toku."],
            ["Další krok", "SMS, zálohy a waitlist promění prázdná místa na řešitelný signál."],
          ].map(([title, text], index) => (
            <div key={title} className={`rounded-2xl p-5 ${index === 1 ? "command-surface" : "bg-secondary"}`}>
              <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">{`0${index + 1}`}</p>
              <h3 className="mt-3 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 opacity-75">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-2">
            <TemaroLogo />
            <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-muted-foreground">
              Signal OS pro salony, ordinace, trenéry a další služby. Vyrobeno v Česku, připraveno pro EU provoz.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Produkt</p>
            <ul className="mt-4 space-y-2 text-sm font-semibold">
              <li><Link href="#produkt" className="text-foreground hover:underline">Funkce</Link></li>
              <li><Link href="#ucty" className="text-foreground hover:underline">Typy účtů</Link></li>
              <li><Link href="#pro-koho" className="text-foreground hover:underline">Pro koho</Link></li>
              <li><Link href="/podniky" className="text-foreground hover:underline">Katalog podniků</Link></li>
              <li><Link href="/rezervacni-system-pro-barbery" className="text-foreground hover:underline">Pro barbery</Link></li>
              <li><Link href="/rezervacni-system-pro-kadernictvi" className="text-foreground hover:underline">Pro kadeřnictví</Link></li>
              <li><Link href="/rezervacni-system-pro-kosmeticky-salon" className="text-foreground hover:underline">Pro beauty salon</Link></li>
              <li><Link href="/rezervacni-system-pro-masaze" className="text-foreground hover:underline">Pro masáže</Link></li>
              <li><Link href="/jak-snizit-no-show" className="text-foreground hover:underline">No-show guide</Link></li>
              <li><Link href="/sms-pripominky-rezervaci" className="text-foreground hover:underline">SMS připomínky</Link></li>
              <li><Link href="/rezervacni-system-bez-marketplace-provizi" className="text-foreground hover:underline">Bez marketplace provizí</Link></li>
              <li><Link href="#cenik" className="text-foreground hover:underline">Ceník</Link></li>
              <li><Link href="#bezpecnost" className="text-foreground hover:underline">Bezpečnost</Link></li>
              <li><Link href="#provoz" className="text-foreground hover:underline">Provoz</Link></li>
              <li><Link href="/demo-barber" className="text-foreground hover:underline">Demo</Link></li>
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
            <p>© 2026 Temaro · Signal OS v3</p>
            <p className="font-mono">made with coffee in Brno</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
