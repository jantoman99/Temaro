import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MailCheck,
  MessageSquareText,
} from "lucide-react";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "SMS připomínky rezervací: kdy dávají smysl | Temaro",
  description:
    "Kdy mají SMS připomínky rezervací větší dopad než e-mail, pro které služby dávají smysl a jak je zavádět bez zbytečných nákladů.",
  alternates: {
    canonical: "/sms-pripominky-rezervaci",
  },
};

const decisionRules = [
  {
    icon: MailCheck,
    title: "E-mail je levný základ",
    text: "U nízkorizikových a kratších služeb často stačí potvrzení rezervace a e-mailová připomínka před termínem.",
  },
  {
    icon: BellRing,
    title: "SMS funguje, když okno bolí víc",
    text: "Čím dražší nebo delší termín, tím větší šance, že se SMS vyplatí víc než prázdné místo v kalendáři.",
  },
  {
    icon: Clock3,
    title: "Ne každá služba potřebuje stejné pravidlo",
    text: "SMS není potřeba plošně. Dává smysl hlavně pro rizikové termíny, nové klienty nebo opakované no-show.",
  },
  {
    icon: CircleDollarSign,
    title: "Náklad musí být čitelný",
    text: "SMS mají být transparentní provozní náklad, ne skrytý poplatek, který znejasní cenu celého systému.",
  },
] as const;

const whenRows = [
  ["Krátký střih nebo kontrola", "Spíš ne", "Často stačí potvrzení a e-mailová připomínka."],
  ["Barvení, wellness balíček, 90+ minut", "Ano", "Prázdné okno je dražší než cena jedné SMS."],
  ["Nový klient bez historie", "Často ano", "Pomáhá zvýšit jistotu, že klient termín opravdu zachytí."],
  ["Opakovaný no-show klient", "Ano", "SMS je vhodný mezikrok před zavedením zálohy nebo přísnějšího potvrzení."],
] as const;

const rolloutSteps = [
  ["Začněte e-mailem", "Nejdřív mějte jisté potvrzení rezervace, jasná storno pravidla a jednoduchou změnu termínu bez telefonátu."],
  ["Označte rizikové služby", "Vyberte služby, kde neobsazené okno stojí nejvíc času nebo tržby."],
  ["SMS nespouštějte plošně", "Pošlete je jen tam, kde mají ekonomický smysl: delší termíny, nový klient, vyšší riziko."],
  ["Sledujte no-show a náklad", "Průběžně porovnávejte, jestli SMS opravdu snižují výpadky a mají lepší návratnost než nic nedělat."],
] as const;

const faqs = [
  {
    question: "Jsou SMS připomínky lepší než e-mail?",
    answer:
      "Ne univerzálně. E-mail je levnější základ. SMS má větší smysl tam, kde klient notifikaci potřebuje opravdu zachytit a výpadek termínu je dražší.",
  },
  {
    question: "Pro které provozy dávají SMS připomínky největší smysl?",
    answer:
      "Nejčastěji pro barber shopy, salony, beauty, masáže a wellness služby s delšími nebo dražšími termíny. U velmi krátkých služeb se často nevyplatí plošně.",
  },
  {
    question: "Kdy nasadit SMS a kdy rovnou zálohu?",
    answer:
      "SMS je dobrý mezikrok, pokud chcete snížit no-show bez tření při rezervaci. Záloha dává smysl tam, kde je termín natolik cenný, že samotná připomínka nestačí.",
  },
  {
    question: "Má smysl posílat SMS každému klientovi?",
    answer:
      "Obvykle ne. Lepší je cílit SMS na rizikovější termíny a klienty, zatímco zbytek nechat na potvrzení a e-mailové připomínce.",
  },
  {
    question: "Jsou SMS připomínky už v Temaru hotové?",
    answer:
      "Základ produktu je připravený: Temaro umí naplánovat SMS připomínku a odeslat ji přes napojenou SMS službu. Před ostrým provozem je ještě potřeba vybrat dodavatele SMS a nastavit cenu.",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "SMS připomínky rezervací: kdy dávají smysl",
      description:
        "Praktický návod, kdy mají SMS připomínky rezervací větší dopad než e-mail a pro které služby se skutečně vyplatí.",
      author: {
        "@type": "Organization",
        name: "Temaro",
      },
      dateModified: "2026-05-03",
      inLanguage: "cs",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
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
          name: "SMS připomínky rezervací",
          item: "/sms-pripominky-rezervaci",
        },
      ],
    },
  ],
};

export default function SmsRemindersPage() {
  return (
    <main className="temaro-public-light min-h-screen bg-background text-foreground">
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
                <MessageSquareText className="size-4" />
                SMS připomínky rezervací
              </p>
              <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                Kdy SMS opravdu
                <br />
                <span className="font-serif-accent text-primary">dávají smysl.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-muted-foreground">
                SMS připomínka není povinná výbava pro každý termín. Má největší smysl tam, kde je prázdné okno dražší
                než cena jedné zprávy a e-mail už nestačí jako jistota.
              </p>
            </section>

            <aside className="rounded-xl border border-border bg-card/88 p-5 shadow-[var(--shadow-command)] backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["24 h", "typická připomínka"],
                  ["SMS", "jen pro rizikové sloty"],
                  ["0", "skrytých poplatků"],
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
                  Čím delší služba a vyšší no-show riziko, tím větší šance, že se SMS vrátí lépe než další prázdný
                  slot v kalendáři.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {decisionRules.map((rule) => (
            <article key={rule.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <rule.icon className="size-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">{rule.title}</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{rule.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Kdy ano a kdy ne</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight">
              SMS nepřidávejte plošně. Přidávejte ji tam, kde chrání dražší čas.
            </h2>
            <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
              Rozhodujte podle ekonomiky termínu, ne podle dojmu, že bez SMS není systém dost profesionální.
            </p>
          </header>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              {whenRows.map(([service, fit, rule]) => (
                <div key={service} className="grid gap-2 p-5 sm:grid-cols-[12rem_7rem_1fr]">
                  <p className="font-semibold">{service}</p>
                  <p className="text-sm font-semibold text-primary">{fit}</p>
                  <p className="text-sm font-medium leading-6 text-muted-foreground">{rule}</p>
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
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Jak zavádět SMS rozumně</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Nejdřív flow, potom dražší notifikace.</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
                Temaro už dnes řeší potvrzení rezervace, e-mailové připomínky, klientský kontext a změny termínu bez telefonátu.
                SMS připomínka je silný kandidát pro pilot, ale dává smysl až nad jasně nastaveným základem.
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
          {faqs.map((faq) => (
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
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Chcete nejdřív zpevnit no-show základ?</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
                Začněte potvrzením rezervace, klientskou historií a jednoduchým přesunem termínu. SMS pak přidejte tam,
                kde ekonomicky chrání nejcennější sloty dne.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/jak-snizit-no-show"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
              >
                Jak snížit no-show
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-base font-semibold text-foreground shadow-sm transition hover:bg-muted"
              >
                Začít zdarma
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
            <Link href="/jak-snizit-no-show">No-show návod</Link>
            <Link href="/rezervacni-system-pro-barbery">Pro barbery</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
