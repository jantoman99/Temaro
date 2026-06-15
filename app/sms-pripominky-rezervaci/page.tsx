import type { Metadata } from "next";
import {
  BellRing,
  CircleDollarSign,
  Clock3,
  MailCheck,
  MessageSquareText,
} from "lucide-react";

import { SeoArticlePage } from "@/components/marketing/seo-article-page";

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
    href: "#pravidla",
  },
  {
    icon: BellRing,
    title: "SMS funguje, když okno bolí víc",
    text: "Čím dražší nebo delší termín, tím větší šance, že se SMS vyplatí víc než prázdné místo v kalendáři.",
    href: "#produkt",
  },
  {
    icon: Clock3,
    title: "Ne každá služba potřebuje stejné pravidlo",
    text: "SMS není potřeba plošně. Dává smysl hlavně pro rizikové termíny, nové klienty nebo opakované no-show.",
    href: "#pravidla",
  },
  {
    icon: CircleDollarSign,
    title: "Náklad musí být čitelný",
    text: "SMS mají být transparentní provozní náklad, ne skrytý poplatek, který znejasní cenu celého systému.",
    href: "#faq",
  },
] as const;

const whenRows = [
  {
    label: "Krátký střih",
    value: "Spíš ne",
    text: "Často stačí potvrzení a e-mailová připomínka.",
  },
  {
    label: "90+ minut",
    value: "Ano",
    text: "Prázdné okno u barvení, wellness balíčku nebo delší masáže je dražší než cena jedné SMS.",
  },
  {
    label: "Nový klient",
    value: "Často ano",
    text: "Pomáhá zvýšit jistotu, že klient termín opravdu zachytí.",
  },
  {
    label: "Opakovaný no-show",
    value: "Ano",
    text: "SMS je vhodný mezikrok před zavedením zálohy nebo přísnějšího potvrzení.",
  },
] as const;

const productSlots = [
  { time: "09:00", title: "E-mail potvrzení", meta: "odesláno ihned", tone: "blue" },
  { time: "Den předem", title: "SMS připomínka", meta: "jen rizikový slot", tone: "green" },
  { time: "12:15", title: "Dlouhá služba", meta: "vyšší priorita", tone: "amber" },
  { time: "16:00", title: "No-show signál", meta: "historie klienta", tone: "dark" },
] as const;

const productHighlights = [
  {
    title: "SMS jen pro rizikové termíny",
    text: "Neplatíte za každou rezervaci, když stačí levnější e-mail.",
  },
  {
    title: "E-mail jako základní vrstva",
    text: "Potvrzení a připomínka běží bez ručního dopisování klientům.",
  },
  {
    title: "Rozhodnutí podle služby",
    text: "Dlouhé, drahé nebo nové termíny mohou dostat silnější notifikaci.",
  },
  {
    title: "Čitelná ekonomika",
    text: "SMS je provozní náklad, který má být vidět a vyhodnocovatelný.",
  },
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
      dateModified: "2026-06-15",
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
    <SeoArticlePage
      jsonLd={jsonLd}
      badgeIcon={MessageSquareText}
      badge="SMS připomínky rezervací"
      title={(
        <>
          Kdy SMS opravdu
          <br />
          <span className="font-serif-accent text-[var(--cobalt)]">dávají smysl.</span>
        </>
      )}
      intro="SMS připomínka není povinná výbava pro každý termín. Má největší smysl tam, kde je prázdné okno dražší než cena jedné zprávy a e-mail už nestačí jako jistota."
      imageSrc="/marketing/industries/beauty.webp"
      imageAlt="Beauty salon, kde delší termíny potřebují jistější připomínku"
      imageLabel="SMS jako cílená pojistka"
      metrics={[
        { value: "24 h", label: "typický timing" },
        { value: "SMS", label: "rizikové sloty" },
        { value: "0", label: "skrytých poplatků" },
      ]}
      steps={decisionRules}
      comparisonKicker="Kdy ano a kdy ne"
      comparisonTitle="SMS nepřidávejte plošně. Přidávejte ji tam, kde chrání dražší čas."
      comparisonIntro="Rozhodujte podle ekonomiky termínu, ne podle dojmu, že bez SMS není systém dost profesionální."
      comparisonRows={whenRows}
      secondaryImageSrc="/marketing/industries/massage-wide.webp"
      secondaryImageAlt="Masážní studio s delšími bloky v kalendáři"
      secondaryImageLabel="Dlouhé služby chráníte silněji"
      proofTitle="Nejdřív flow, potom dražší notifikace."
      proofText="Temaro řeší potvrzení rezervace, e-mailové připomínky, klientský kontext a změny termínu bez telefonátu. SMS připomínka má přijít až nad tímto základem."
      productSlots={productSlots}
      productHighlights={productHighlights}
      faqs={faqs}
      ctaTitle="Chcete nejdřív zpevnit no-show základ?"
      ctaText="Začněte potvrzením rezervace, klientskou historií a jednoduchým přesunem termínu. SMS pak přidejte tam, kde ekonomicky chrání nejcennější sloty dne."
      primaryCtaHref="/jak-snizit-no-show"
      primaryCtaLabel="Jak snížit no-show"
      secondaryCtaHref="/register"
      secondaryCtaLabel="Začít zdarma"
      related={[
        {
          href: "/jak-snizit-no-show",
          label: "No-show návod",
          text: "Praktický rámec pro potvrzení, přesun termínu a zálohy.",
        },
        {
          href: "/rezervacni-system-pro-masaze",
          label: "Pro masáže",
          text: "Dlouhé bloky, klid mezi klienty a jasné připomínky.",
        },
        {
          href: "/ukazka",
          label: "Produktová ukázka",
          text: "Podívejte se na kalendář a klientský kontext v Temaru.",
        },
      ]}
    />
  );
}
