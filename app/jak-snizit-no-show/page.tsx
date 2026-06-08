import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  MailCheck,
  PhoneCall,
  ShieldAlert,
} from "lucide-react";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Jak snížit no-show v salonu | Temaro",
  description:
    "Praktický návod, jak v salonu, barber shopu nebo wellness provozu snížit no-show pomocí připomínek, jednoduchého přesunu a záloh.",
  alternates: {
    canonical: "/jak-snizit-no-show",
  },
};

const steps = [
  {
    icon: MailCheck,
    title: "Potvrďte rezervaci ihned",
    text: "Klient musí po vytvoření rezervace dostat jasné potvrzení: služba, datum, čas, místo a pravidla změny termínu.",
  },
  {
    icon: BellRing,
    title: "Připomeňte termín včas",
    text: "E-mail je minimum. U provozů s vyšším no-show rizikem dává smysl SMS připomínka 24 hodin předem.",
  },
  {
    icon: CalendarClock,
    title: "Usnadněte přesun termínu",
    text: "Klient, který se nemůže dostavit, nesmí muset volat. Self-service přesun nebo zrušení zachrání část prázdných oken.",
  },
  {
    icon: CreditCard,
    title: "U drahých služeb zvažte zálohu",
    text: "U dlouhých služeb, barvení, wellness balíčků nebo prémiových termínů může záloha snížit impulzivní rezervace bez účasti.",
  },
] as const;

const policyRules = [
  ["Krátké služby", "Stačí potvrzení, připomínka a jednoduchý přesun."],
  ["Dlouhé služby", "Přidejte jasné storno pravidlo a později zálohu."],
  ["Opakované no-show", "Označte klienta, sledujte historii a vyžadujte potvrzení nebo zálohu."],
  ["Noví klienti", "Chtějte telefon/e-mail a pošlete jasné instrukce k termínu."],
] as const;

const faqs = [
  {
    question: "Co je no-show?",
    answer:
      "No-show znamená, že klient má rezervovaný termín, ale bez včasného zrušení nebo přesunu nepřijde. Pro služby s časovým kalendářem to znamená přímou ztrátu tržby i nevyužité pracovní okno.",
  },
  {
    question: "Jak nejrychleji snížit no-show?",
    answer:
      "Nejrychlejší kombinace je jasné potvrzení rezervace, připomínka před termínem a jednoduchý odkaz na přesun nebo zrušení. U dražších nebo dlouhých služeb pomáhá také záloha.",
  },
  {
    question: "Jsou lepší SMS nebo e-mail připomínky?",
    answer:
      "E-mail je levný základ, ale SMS má obvykle vyšší šanci, že si ji klient všimne včas. Pro barber shopy, salony, masáže a wellness dává SMS smysl hlavně u rizikovějších termínů.",
  },
  {
    question: "Kdy zavést rezervační zálohu?",
    answer:
      "Zálohu zavádějte hlavně u služeb, které blokují dlouhý čas nebo mají vysokou cenu. Důležité je mít jasně napsaná storno pravidla a nepoužívat zálohy tam, kde by zbytečně brzdily běžné rezervace.",
  },
  {
    question: "Pomůže s no-show klientská historie?",
    answer:
      "Ano. Pokud vidíte, kdo se opakovaně nedostavil, můžete u takového klienta vyžadovat potvrzení, volit jinou komunikaci nebo později zálohu. Bez historie se riziko ztrácí v hlavě provozovatele.",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Jak snížit no-show v salonu",
      description:
        "Praktický návod pro služby s rezervacemi: potvrzení, připomínky, změny termínu bez telefonátu, zálohy a klientská historie.",
      author: {
        "@type": "Organization",
        name: "Temaro",
      },
      dateModified: "2026-05-02",
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
          name: "Jak snížit no-show",
          item: "/jak-snizit-no-show",
        },
      ],
    },
  ],
};

export default function ReduceNoShowPage() {
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
                <ShieldAlert className="size-4" />
                No-show v salonu
              </p>
              <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                Jak snížit no-show
                <br />
                bez složitého <span className="font-serif-accent text-primary">systému.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-muted-foreground">
                Klienti často nezapomenou schválně. Potřebují jasné potvrzení, připomínku a jednoduchý způsob, jak
                termín přesunout dřív, než vznikne prázdné okno v kalendáři.
              </p>
            </section>

            <aside className="rounded-xl border border-border bg-card/88 p-5 shadow-[var(--shadow-command)] backdrop-blur">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "potvrzení ihned"],
                  ["24 h", "připomínka předem"],
                  ["0", "zbytečných volání"],
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
                  Čím delší nebo dražší služba, tím silnější potvrzení potřebuje: připomínku, jasné storno podmínky a
                  později zálohu.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">{step.title}</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Pravidla podle rizika</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight">
              Ne každá služba potřebuje stejnou ochranu.
            </h2>
            <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
              U běžného střihu nechcete brzdit rezervaci. U dlouhé služby za několik hodin už dává smysl silnější
              potvrzení a později záloha.
            </p>
          </header>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="divide-y divide-border">
              {policyRules.map(([type, rule]) => (
                <div key={type} className="grid gap-2 p-5 sm:grid-cols-[13rem_1fr]">
                  <p className="font-semibold">{type}</p>
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
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Jak to řeší Temaro</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">No-show ochrana začíná už při rezervaci.</h2>
              <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">
                Temaro už dnes řeší online rezervace, e-mailové potvrzení, klientskou historii, počítadlo no-show a
                změny termínu bez telefonátu. SMS připomínky a zálohy jsou další kandidáti pro placený pilot.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                [CheckCircle2, "Klientská historie a poznámky"],
                [CheckCircle2, "No-show counter a flag"],
                [CheckCircle2, "Self-service přesun nebo zrušení"],
                [PhoneCall, "SMS připomínky jako P0 kandidát"],
              ].map(([Icon, label]) => (
                <div key={label as string} className="flex items-center gap-3 rounded-xl border border-border bg-background/80 p-3">
                  <Icon className="size-5 text-primary" />
                  <span className="text-sm font-semibold">{label as string}</span>
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
              <h2 className="text-lg font-semibold">{faq.question}</h2>
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
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">Chcete no-show řešit přímo v rezervacích?</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
                Začněte online rezervacemi, klientskou historií a připomínkami. Zálohy a SMS pak přidávejte podle rizika
                služeb, ne plošně všem.
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
                href="/rezervacni-system-pro-barbery"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-base font-semibold text-foreground shadow-sm transition hover:bg-muted"
              >
                Rezervační systém pro barbery
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
            <Link href="/rezervacni-system-pro-barbery">Pro barbery</Link>
            <Link href="/register">Registrace</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
