import type { Metadata } from "next";
import { CalendarDays, PhoneOff, Sparkles, UsersRound } from "lucide-react";

import { IndustryLandingPage } from "@/components/marketing/industry-landing-page";

export const metadata: Metadata = {
  title: "Rezervační systém pro kadeřnictví | Temaro",
  description:
    "Temaro je rezervační systém pro kadeřnictví. Online rezervace, kalendář týmu, klientská historie a méně ručního domlouvání termínů.",
  alternates: {
    canonical: "/rezervacni-system-pro-kadernictvi",
  },
};

const faqs = [
  {
    question: "Hodí se Temaro pro malé i větší kadeřnictví?",
    answer:
      "Ano. Jeden člověk využije hlavně booking odkaz, kalendář a klientskou historii. Týmové kadeřnictví navíc získá rozdělení podle zaměstnanců, barevné vrstvy a přehled dostupnosti.",
  },
  {
    question: "Umí si klient vybrat konkrétní kadeřnici?",
    answer:
      "Ano. Veřejný booking může nabídnout výběr konkrétního člena týmu nebo nejbližší volný termín podle nastavených služeb a pracovní doby.",
  },
  {
    question: "Pomůže Temaro s opakovanými návštěvami?",
    answer:
      "Ano. U klienta zůstává historie návštěv, interní poznámky a kontakt, takže další objednání nebo navázání na předchozí službu je rychlejší.",
  },
  {
    question: "Musí klient volat kvůli změně termínu?",
    answer:
      "Nemusí. Klient dostane self-service odkaz pro přesun nebo zrušení, takže recepce ani kadeřnice nemusí řešit každou změnu telefonicky.",
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
        "Rezervační systém pro kadeřnictví: online rezervace, kalendář týmu, klientská historie a méně ručního domlouvání.",
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
          name: "Rezervační systém pro kadeřnictví",
          item: "/rezervacni-system-pro-kadernictvi",
        },
      ],
    },
  ],
} as const;

export default function HairSalonBookingSystemPage() {
  return (
    <IndustryLandingPage
      eyebrow="Rezervační systém pro kadeřnictví"
      eyebrowIcon={Sparkles}
      title="Klidnější recepce."
      highlight="Přehlednější den v salonu."
      description="Temaro pomáhá kadeřnictvím sjednotit online rezervace, týmový kalendář a klientskou historii tak, aby se termíny nemusely přepisovat mezi telefonem, Instagramem a diářem."
      previewLabel="Dnešní směna"
      previewTitle="Salon kalendář"
      previewStatus="Tým online"
      previewEntries={[
        ["08:30", "Adéla", "Střih + foukaná", "Potvrzeno"],
        ["10:00", "Veronika", "Barvení odrostů", "Čeká"],
        ["13:30", "Monika", "Střih mikádo", "Nová klientka"],
        ["16:15", "Lucie", "Regenerace + styling", "Potvrzeno"],
      ]}
      benefits={[
        {
          icon: PhoneOff,
          title: "Méně ručního domlouvání",
          text: "Klient si vybere službu, čas i konkrétní kadeřnici online bez přerušování provozu u telefonu.",
        },
        {
          icon: UsersRound,
          title: "Jasný přehled týmu",
          text: "Kalendář ukáže obsazení napříč členy týmu, takže recepce i owner rychle vidí kapacitu dne.",
        },
        {
          icon: CalendarDays,
          title: "Méně chaosu při změnách",
          text: "Přesuny a zrušení se dají řešit přes self-service odkaz místo dalších zpráv a přepisování termínů.",
        },
      ]}
      workflowsLabel="Scénáře v kadeřnictví"
      workflowsTitle="Každý slot v salonu potřebuje jasný kontext."
      workflowsText="Temaro drží v jednom toku objednání, týmovou dostupnost a klientské informace, které se v běžném provozu jinak ztrácí."
      workflows={[
        ["Nová klientka", "Vybere střih nebo barvení, konkrétní kadeřnici a dostupný termín bez dlouhého domlouvání."],
        ["Recepce řeší změnu", "Místo přepisování diáře pošle klientce self-service odkaz a kalendář zůstane čistý."],
        ["Stálá návštěva", "Historie návštěv a interní poznámky pomohou navázat na předchozí službu bez dohledávání."],
      ]}
      comparisonTitle="Kdy už je pro kadeřnictví lepší booking systém než ruční organizace"
      comparisonRows={[
        ["Telefon + papír", "Funguje krátce, ale u více lidí v týmu rychle roste zmatek v obsazení a změnách."],
        ["Sdílený kalendář", "Ukáže čas, ale neřeší služby, klientský kontext, samostatný booking ani self-service změny."],
        ["Temaro", "Spojí booking, týmový kalendář, klienty, služby i provozní signály bez marketplace provize."],
      ]}
      faqs={faqs}
      ctaTitle="Chcete si otestovat rezervační flow pro kadeřnictví?"
      ctaText="Vytvořte pilotní salon, nastavte služby a pošlete klientkám jeden booking odkaz místo dalšího domlouvání v chatu."
      primaryCtaLabel="Založit kadeřnictví"
      primaryCtaHref="/register"
      secondaryCtaLabel="Projít demo booking"
      secondaryCtaHref="/demo-barber"
      footerLinks={[
        { href: "/", label: "Homepage" },
        { href: "/rezervacni-system-pro-kosmeticky-salon", label: "Pro beauty salon" },
        { href: "/jak-snizit-no-show", label: "No-show guide" },
        { href: "/register", label: "Registrace" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
