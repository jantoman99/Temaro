import type { Metadata } from "next";
import {
  BellRing,
  CalendarClock,
  CreditCard,
  MailCheck,
  ShieldAlert,
} from "lucide-react";

import { SeoArticlePage } from "@/components/marketing/seo-article-page";

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
    href: "#pravidla",
  },
  {
    icon: BellRing,
    title: "Připomeňte termín včas",
    text: "E-mail je minimum. U provozů s vyšším no-show rizikem dává smysl SMS připomínka 24 hodin předem.",
    href: "#produkt",
  },
  {
    icon: CalendarClock,
    title: "Usnadněte přesun termínu",
    text: "Klient, který se nemůže dostavit, nesmí muset volat. Self-service přesun zachrání část prázdných oken.",
    href: "#produkt",
  },
  {
    icon: CreditCard,
    title: "U drahých služeb zvažte zálohu",
    text: "U dlouhých služeb, barvení, wellness balíčků nebo prémiových termínů může záloha snížit impulzivní rezervace.",
    href: "#faq",
  },
] as const;

const policyRules = [
  {
    label: "Krátké služby",
    value: "Lehký režim",
    text: "Stačí potvrzení, připomínka a jednoduchý přesun. Rezervaci zbytečně nezpomalujte.",
  },
  {
    label: "Dlouhé služby",
    value: "Silnější pravidla",
    text: "Přidejte jasné storno pravidlo a později zálohu, protože prázdné okno bolí víc.",
  },
  {
    label: "Opakované no-show",
    value: "Rizikový klient",
    text: "Označte klienta, sledujte historii a vyžadujte potvrzení nebo zálohu.",
  },
  {
    label: "Noví klienti",
    value: "Jistota kontaktu",
    text: "Chtějte telefon/e-mail a pošlete jasné instrukce k termínu bez ručního dopisování.",
  },
] as const;

const productSlots = [
  { time: "08:30", title: "Pánský střih", meta: "Potvrzeno e-mailem", tone: "amber" },
  { time: "10:30", title: "Barva a foukaná", meta: "SMS 24 h předem", tone: "green" },
  { time: "12:15", title: "Kosmetika", meta: "Možnost přesunu", tone: "blue" },
  { time: "16:00", title: "Nová rezervace", meta: "Instagram klient", tone: "dark" },
] as const;

const productHighlights = [
  {
    title: "Potvrzení hned po rezervaci",
    text: "Klient dostane službu, čas, místo a pravidla změny dřív, než začne hledat zprávy v chatu.",
  },
  {
    title: "Přesun bez telefonátu",
    text: "Když klient nemůže dorazit, má udělat jeden bezpečný krok, ne volat během práce.",
  },
  {
    title: "Historie klienta",
    text: "Opakované no-show se neztratí v hlavě provozovatele. Je vidět u další rezervace.",
  },
  {
    title: "Zálohy jen tam, kde dávají smysl",
    text: "Dlouhé nebo drahé služby chráníte silněji, běžné střihy necháte rychlé.",
  },
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
          name: "Jak snížit no-show",
          item: "/jak-snizit-no-show",
        },
      ],
    },
  ],
};

export default function ReduceNoShowPage() {
  return (
    <SeoArticlePage
      jsonLd={jsonLd}
      badgeIcon={ShieldAlert}
      badge="No-show v salonu"
      title={(
        <>
          Jak snížit no-show
          <br />
          <span className="font-serif-accent text-[var(--cobalt)]">bez složitého systému.</span>
        </>
      )}
      intro="Klienti často nezapomenou schválně. Potřebují jasné potvrzení, připomínku a jednoduchý způsob, jak termín přesunout dřív, než vznikne prázdné okno v kalendáři."
      imageSrc="/marketing/industries/barber.webp"
      imageAlt="Barber salon s připraveným termínem v online kalendáři"
      imageLabel="No-show ochrana začíná před termínem"
      metrics={[
        { value: "1", label: "potvrzení ihned" },
        { value: "24 h", label: "připomínka" },
        { value: "0", label: "zbytečných volání" },
      ]}
      steps={steps}
      comparisonKicker="Pravidla podle rizika"
      comparisonTitle="Ne každá služba potřebuje stejnou ochranu."
      comparisonIntro="U běžného střihu nechcete brzdit rezervaci. U dlouhé služby za několik hodin už dává smysl silnější potvrzení a později záloha."
      comparisonRows={policyRules}
      secondaryImageSrc="/marketing/industries/hair-salon-wide.webp"
      secondaryImageAlt="Kadeřnický salon s delší službou, která potřebuje pevnější pravidla rezervace"
      secondaryImageLabel="Pravidla podle délky služby"
      proofTitle="No-show ochrana začíná už při rezervaci."
      proofText="Temaro spojuje online rezervace, e-mailové potvrzení, klientskou historii, počítadlo no-show a změny termínu bez telefonátu. SMS a zálohy mají být cílené podle rizika, ne plošný strašák."
      productSlots={productSlots}
      productHighlights={productHighlights}
      faqs={faqs}
      ctaTitle="Chcete no-show řešit přímo v rezervacích?"
      ctaText="Začněte online rezervacemi, klientskou historií a připomínkami. Zálohy a SMS pak přidávejte podle rizika služeb, ne plošně všem."
      primaryCtaHref="/register"
      primaryCtaLabel="Začít zdarma"
      secondaryCtaHref="/rezervacni-system-pro-barbery"
      secondaryCtaLabel="Pro barbery"
      related={[
        {
          href: "/sms-pripominky-rezervaci",
          label: "SMS připomínky",
          text: "Kdy SMS chrání dražší termíny a kdy je zbytečná.",
        },
        {
          href: "/rezervacni-system-bez-marketplace-provizi",
          label: "Bez marketplace provizí",
          text: "Jak držet vlastní klientský vztah bez další provizní vrstvy.",
        },
        {
          href: "/ukazka",
          label: "Produktová ukázka",
          text: "Proklikněte interní CRM pohled majitele salonu.",
        },
      ]}
    />
  );
}
