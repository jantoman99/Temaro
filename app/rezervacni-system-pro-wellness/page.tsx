import type { Metadata } from "next";
import { CalendarRange, HeartHandshake, ShieldPlus, Waves } from "lucide-react";

import { IndustryLandingPage } from "@/components/marketing/industry-landing-page";

export const metadata: Metadata = {
  title: "Rezervační systém pro wellness | Temaro",
  description:
    "Temaro je rezervační systém pro wellness služby. Online rezervace, přehled delších bloků, klientská historie a méně ručního provozního chaosu.",
  alternates: {
    canonical: "/rezervacni-system-pro-wellness",
  },
};

const faqs = [
  {
    question: "Pro jaké wellness provozy je Temaro vhodné?",
    answer:
      "Hodí se pro menší wellness studia, privátní spa, relaxační rituály i kombinaci masáží a péče, kde je důležité hlídat delší bloky a změny rezervací.",
  },
  {
    question: "Pomůže Temaro s přehledem kapacity dne?",
    answer:
      "Ano. V kalendáři vidíte délku služeb, obsazené bloky i čekající rezervace, takže se lépe plánují dlouhé rituály i mezery mezi nimi.",
  },
  {
    question: "Co když klient potřebuje změnit termín na poslední chvíli?",
    answer:
      "Klient může využít bezpečný self-service odkaz pro přesun nebo zrušení. Provoz tak nemusí řešit každou změnu ručně přes telefon.",
  },
  {
    question: "Dává smysl Temaro i bez marketplace?",
    answer:
      "Ano. Temaro míří na vlastní klienty a vlastní značku. Rezervační stránku máte pod kontrolou bez provize za klienta, kterého jste získali sami.",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Temaro",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "Rezervační systém pro wellness služby: online rezervace, přehled delších bloků, klientská historie a méně ručního provozního chaosu.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CZK",
        description: "Pilotní ověření MVP.",
      },
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
          name: "Rezervační systém pro wellness",
          item: "/rezervacni-system-pro-wellness",
        },
      ],
    },
  ],
} as const;

export default function WellnessBookingSystemPage() {
  return (
    <IndustryLandingPage
      eyebrow="Rezervační systém pro wellness"
      eyebrowIcon={Waves}
      title="Méně provozního hluku."
      highlight="Víc prostoru pro klidný zážitek."
      description="Temaro pomáhá wellness provozům držet pod kontrolou delší rezervace, změny termínů i klientský kontext tak, aby provoz nepůsobil chaoticky ještě před příchodem klienta."
      previewLabel="Wellness den"
      previewTitle="Privátní bloky"
      previewStatus="Pod kontrolou"
      previewEntries={[
        ["10:00", "Lenka", "Privátní wellness 120 min", "Potvrzeno"],
        ["13:00", "Marek", "Sauna + relax 90 min", "Čeká"],
        ["15:30", "Anna", "Spa rituál 150 min", "VIP klient"],
        ["19:00", "Pár Novákovi", "Večerní wellness", "Potvrzeno"],
      ]}
      benefits={[
        {
          icon: CalendarRange,
          title: "Lepší práce s dlouhými bloky",
          text: "Wellness provoz vidí skutečnou kapacitu dne a nepřeskakuje mezi několika nástroji kvůli jednomu termínu.",
        },
        {
          icon: HeartHandshake,
          title: "Vlastní vztah s klientem",
          text: "Rezervační stránka je pod vaší značkou a klientský kontext zůstává u vás, ne v marketplace profilu.",
        },
        {
          icon: ShieldPlus,
          title: "Méně prázdných oken",
          text: "Potvrzení, klientská historie a snadný přesun termínu snižují riziko, že drahý wellness blok zůstane nevyužitý.",
        },
      ]}
      workflowsLabel="Scénáře ve wellness provozu"
      workflowsTitle="Klidný zážitek začíná ještě před příchodem klienta."
      workflowsText="Temaro pomáhá wellness provozům řídit rezervace tak, aby nevznikal zmatek v kapacitě, změnách ani komunikaci."
      workflows={[
        ["Privátní wellness", "Klient si vybere delší blok bez ručního ladění termínu po telefonu."],
        ["Párový nebo prémiový rituál", "Provoz jasně vidí, které sloty jsou nejcennější a kde je no-show nejdražší."],
        ["Změna času", "Self-service odkaz umožní přesun dřív, než vznikne nevyužitý večerní blok."],
      ]}
      comparisonTitle="Proč wellness provozům nestačí obyčejné objednávání"
      comparisonRows={[
        ["Telefon a chat", "Je osobní, ale špatně se v něm hlídají delší bloky, storna a dostupnost."],
        ["Obyčejný kalendář", "Neřeší samostatnou rezervaci klienta, klientskou historii ani další provozní signály."],
        ["Temaro", "Dává dohromady booking, délky služeb, klienty a připravenost na reminder nebo zálohy."],
      ]}
      faqs={faqs}
      ctaTitle="Chcete pilotně ověřit booking pro wellness?"
      ctaText="Vytvořte si provoz, nastavte služby a otestujte, jak vypadá klidnější rezervace bez marketplace závislosti a ručního přepisování."
      primaryCtaLabel="Založit wellness provoz"
      primaryCtaHref="/register"
      secondaryCtaLabel="Projít booking pro masáže"
      secondaryCtaHref="/rezervacni-system-pro-masaze"
      footerLinks={[
        { href: "/", label: "Homepage" },
        { href: "/rezervacni-system-pro-masaze", label: "Pro masáže" },
        { href: "/rezervacni-system-pro-kosmeticky-salon", label: "Pro beauty salon" },
        { href: "/register", label: "Registrace" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
