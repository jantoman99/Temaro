import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  CheckCircle2,
  Coins,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Rezervační systém bez marketplace provizí | Temaro",
  description:
    "Proč některé provozy nechtějí být závislé na marketplace platformě a kdy dává smysl rezervační systém bez provize z vlastních klientů.",
  alternates: {
    canonical: "/rezervacni-system-bez-marketplace-provizi",
  },
};

const principles = [
  {
    icon: UsersRound,
    title: "Vaši klienti zůstávají vaši",
    text: "Pokud si klienta přivedete sami přes web, Instagram, doporučení nebo vizitku, dává smysl držet si vztah i rezervace pod vlastní značkou.",
  },
  {
    icon: Coins,
    title: "Cena má být čitelná",
    text: "Měsíční tarif nebo cena za SMS je předvídatelnější než model, kde se do ceny potichu promítá každá rezervace nebo další vrstva navíc.",
  },
  {
    icon: Store,
    title: "Rezervace má posilovat podnik, ne cizí značku",
    text: "Rezervační stránka má působit jako součást vašeho provozu, ne jako cizí tržiště, na kterém klient vnímá hlavně značku někoho jiného.",
  },
  {
    icon: ShieldCheck,
    title: "Menší závislost na cizích pravidlech",
    text: "Když jsou rezervace pod vaší kontrolou, snáz si hlídáte klientská data, komunikaci i to, jak se změní ekonomika provozu při růstu.",
  },
] as const;

const comparisonRows = [
  ["Marketplace", "Může přivést nové klienty, ale zároveň vytváří závislost na cizích pravidlech, provizích a cizím vztahu se zákazníkem."],
  ["Vlastní rezervace bez provize", "Lépe funguje tam, kde si provoz klienty přivádí sám a chce mít jasnou ekonomiku i značku pod kontrolou."],
  ["Temaro", "Míří na vlastní klienty, vlastní rezervační odkaz a provozní jistotu bez provize z rezervací, které jste získali sami."],
] as const;

const faqItems = [
  {
    question: "Proč řešit rezervační systém bez marketplace provize?",
    answer:
      "Protože některé provozy nechtějí platit další vrstvu za klienty, které už samy získaly. Chtějí spíš přehledné rezervace, vlastní značku a čitelnou cenu.",
  },
  {
    question: "Znamená to, že marketplace je vždy špatně?",
    answer:
      "Ne. Cizí katalog může pomoci s novými klienty. Jen není ideální pro každý provoz. Pokud už máte vlastní poptávku, může být důležitější kontrola vztahu a nižší závislost na cizích pravidlech.",
  },
  {
    question: "Komu dává vlastní rezervační kanál největší smysl?",
    answer:
      "Nejčastěji barberům, kadeřnictvím, beauty, masážím a wellness provozům, které už mají vlastní klientelu a chtějí spíš méně chaosu než další distribuční kanál.",
  },
  {
    question: "Jak to Temaro řeší dnes?",
    answer:
      "Temaro staví na vlastním rezervačním odkazu, klientské historii, kalendáři a připomínkách. Neřeší provizi z vlastních klientů.",
  },
  {
    question: "Kdy naopak dává marketplace smysl?",
    answer:
      "Když je pro vás prioritou získávání nových klientů přes externí katalog a jste ochotní přijmout vyšší závislost na jeho pravidlech a ekonomice.",
  },
] as const;

const rolloutSteps = [
  ["Změřte odkud klienti chodí", "Pokud většina rezervací přichází přes vaše kanály, vlastní rezervační odkaz bývá silnější než další provizní vrstva."],
  ["Oddělte akvizici od provozu", "Jiná otázka je získat klienta a jiná otázka je efektivně odbavit rezervaci, změny a připomínky."],
  ["Držte si vlastní značku", "Rezervační odkaz, vzhled a klientský kontext mají pomáhat vašemu podniku, ne rozpoznatelnosti externí značky."],
  ["Plaťte za jasnou hodnotu", "Dává větší smysl platit za software, SMS nebo platby transparentně než nejasně přes ztrátu marže na vlastních rezervacích."],
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Rezervační systém bez marketplace provizí",
      description:
        "Kdy dává smysl rezervační systém bez marketplace provize a proč některé provozy chtějí vlastní rezervační odkaz a vlastní klientský vztah.",
      author: {
        "@type": "Organization",
        name: "Temaro",
      },
      dateModified: "2026-05-03",
      inLanguage: "cs",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Temaro",
          item: "/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Rezervační systém bez marketplace provizí",
          item: "/rezervacni-system-bez-marketplace-provizi",
        },
      ],
    },
  ],
};

export default function NoMarketplaceCommissionPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="signal-hero signal-grid px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <MarketingHeader />

          <div className="grid items-center gap-10 pb-16 pt-28 lg:grid-cols-[0.92fr_1.08fr] lg:pb-24 lg:pt-32">
            <section>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                <BadgePercent className="size-4" />
                Bez marketplace provizí
              </p>
              <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                Vlastní klienti.
                <br />
                <span className="font-serif-accent text-primary">Vlastní rezervační odkaz.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-muted-foreground">
                Ne každý provoz potřebuje marketplace. Pokud si klienty přivádíte sami, často dává větší smysl mít
                rezervační systém, který z vlastních rezervací neukrajuje další provizi a drží vztah pod vaší značkou.
              </p>
            </section>

            <aside className="rounded-xl border border-border bg-card/88 p-5 shadow-[var(--shadow-command)] backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["0 %", "provize z vlastních klientů"],
                  ["1", "vlastní rezervační odkaz"],
                  ["100 %", "vztah pod vaší značkou"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-border bg-background/80 p-4">
                    <p className="nums-tabular text-3xl font-semibold text-primary">{value}</p>
                    <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-border bg-background/80 p-4">
                <p className="text-sm font-semibold">Praktické pravidlo</p>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  Pokud rezervace slouží hlavně vašim vlastním klientům, má systém zjednodušovat provoz a připomínky,
                  ne přidávat další závislost na externím katalogu.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {principles.map((principle) => (
            <article key={principle.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <principle.icon className="size-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">{principle.title}</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Marketplace vs. vlastní rezervace</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight">
              Otázka není jen jak klient rezervuje. Otázka je, komu ten vztah patří.
            </h2>
            <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
              Některé provozy potřebují nové klienty zvenku. Jiné už klienty mají a chtějí hlavně klidnější provoz, přehled a
              férovější ekonomiku rezervací.
            </p>
          </header>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              {comparisonRows.map(([tool, text]) => (
                <div key={tool} className="grid gap-2 p-5 sm:grid-cols-[11rem_1fr]">
                  <p className="font-semibold">{tool}</p>
                  <p className="text-sm font-medium leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Jak to uchopit prakticky</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Nejdřív zjistěte, jestli potřebujete akvizici nebo klidný provoz.</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
                Temaro cílí na provozy, které chtějí méně telefonátů, lepší přehled a vlastní klientský vztah. Ne na
                model cizí platformy, kde hlavní hodnota stojí na externím přísunu klientů.
              </p>
            </div>
            <div className="grid gap-3">
              {rolloutSteps.map(([title, text]) => (
                <div key={title} className="rounded-xl border border-border bg-background/80 p-4">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {faqItems.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-start gap-3 text-lg font-semibold">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                {faq.question}
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-command)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Další krok</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Chcete rezervace, které posilují vaši značku?</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
                Začněte vlastním rezervačním odkazem, klientskou historií a připomínkami. Provizní katalog řešte jen pokud
                opravdu potřebujete nové klienty zvenku, ne jako výchozí stav.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
              >
                Začít zdarma
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/sms-pripominky-rezervaci"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-base font-semibold text-foreground shadow-sm transition hover:bg-muted"
              >
                SMS připomínky
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
          <TemaroLogo />
          <div className="flex flex-wrap gap-3">
            <Link href="/">Úvod</Link>
            <Link href="/sms-pripominky-rezervaci">SMS připomínky</Link>
            <Link href="/rezervacni-system-pro-barbery">Pro barbery</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
