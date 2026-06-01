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
      "Ano. Jeden člověk využije hlavně rezervační odkaz, kalendář a klientskou historii. Týmové kadeřnictví navíc získá rozdělení podle zaměstnanců, barevné vrstvy a přehled dostupnosti.",
  },
  {
    question: "Umí si klient vybrat konkrétní kadeřnici?",
    answer:
      "Ano. Veřejná rezervace může nabídnout výběr konkrétního člena týmu nebo nejbližší volný termín podle nastavených služeb a pracovní doby.",
  },
  {
    question: "Pomůže Temaro s opakovanými návštěvami?",
    answer:
      "Ano. U klienta zůstává historie návštěv, interní poznámky a kontakt, takže další objednání nebo navázání na předchozí službu je rychlejší.",
  },
  {
    question: "Musí klient volat kvůli změně termínu?",
    answer:
      "Nemusí. Klient dostane bezpečný odkaz pro přesun nebo zrušení, takže recepce ani kadeřnice nemusí řešit každou změnu telefonicky.",
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
        description: "Pilotní ověření v prvních zapojených salonech.",
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
      visualAlt="Kadeřnický salon s klientkou po stylingu"
      visualSrc="/marketing/salon-interior-ai.webp"
      benefits={[
        {
          icon: PhoneOff,
          title: "Méně ručního domlouvání",
          text: "Klient si vybere službu, čas i konkrétní kadeřnici online bez přerušování provozu u telefonu.",
        },
        {
          icon: UsersRound,
          title: "Jasný přehled týmu",
          text: "Kalendář ukáže obsazení napříč členy týmu, takže recepce i vlastník rychle vidí kapacitu dne.",
        },
        {
          icon: CalendarDays,
          title: "Méně chaosu při změnách",
          text: "Přesuny a zrušení se dají řešit přes bezpečný odkaz místo dalších zpráv a přepisování termínů.",
        },
      ]}
      workflowsLabel="Scénáře v kadeřnictví"
      workflowsTitle="Každý slot v salonu potřebuje jasný kontext."
      workflowsText="Temaro drží v jednom toku objednání, týmovou dostupnost a klientské informace, které se v běžném provozu jinak ztrácí."
      workflows={[
        ["Nová klientka", "Vybere střih nebo barvení, konkrétní kadeřnici a dostupný termín bez dlouhého domlouvání."],
        ["Recepce řeší změnu", "Místo přepisování diáře pošle klientce bezpečný odkaz a kalendář zůstane čistý."],
        ["Stálá návštěva", "Historie návštěv a interní poznámky pomohou navázat na předchozí službu bez dohledávání."],
      ]}
      comparisonTitle="Kdy už je pro kadeřnictví lepší rezervační systém než ruční organizace"
      comparisonRows={[
        ["Telefon + papír", "Funguje krátce, ale u více lidí v týmu rychle roste zmatek v obsazení a změnách."],
        ["Sdílený kalendář", "Ukáže čas, ale neřeší služby, klientský kontext, samostatné rezervace ani změny termínu klientem."],
        ["Temaro", "Spojí online rezervace, týmový kalendář, klienty, služby i provozní signály bez provize z vlastních klientů."],
      ]}
      faqs={faqs}
      ctaTitle="Chcete si otestovat rezervace pro kadeřnictví?"
      ctaText="Vytvořte pilotní salon, nastavte služby a pošlete klientkám jeden rezervační odkaz místo dalšího domlouvání v chatu."
      primaryCtaLabel="Založit kadeřnictví"
      primaryCtaHref="/register"
      secondaryCtaLabel="Projít ukázkovou rezervaci"
      secondaryCtaHref="/demo-barber"
      footerLinks={[
        { href: "/", label: "Úvod" },
        { href: "/rezervacni-system-pro-kosmeticky-salon", label: "Pro beauty salon" },
        { href: "/jak-snizit-no-show", label: "No-show návod" },
        { href: "/register", label: "Registrace" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
