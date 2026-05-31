import type { Metadata } from "next";
import { AlertTriangle, CalendarDays, PhoneOff, Scissors } from "lucide-react";

import { IndustryLandingPage } from "@/components/marketing/industry-landing-page";

export const metadata: Metadata = {
  title: "Rezervační systém pro barbery | Temaro",
  description:
    "Temaro je rezervační systém pro barber shopy. Online rezervace, kalendář, klientská historie, no-show signály a méně telefonátů.",
  alternates: {
    canonical: "/rezervacni-system-pro-barbery",
  },
};

const benefits = [
  {
    icon: PhoneOff,
    title: "Méně telefonátů uprostřed práce",
    text: "Klient si vybere službu, barbera a termín online. Vy nemusíte přerušovat střih kvůli domlouvání času.",
  },
  {
    icon: AlertTriangle,
    title: "No-show není schované v hlavě",
    text: "U klienta vidíte historii, poznámky a rizikové signály. Provoz má lepší kontext před dalším termínem.",
  },
  {
    icon: CalendarDays,
    title: "Jeden přehledný kalendář",
    text: "Denní a týdenní pohled ukazuje rezervace, zaměstnance i volná okna bez papírového diáře.",
  },
] as const;

const workflows = [
  ["Nový klient", "Vybere střih nebo beard trim, zvolí barbera a pošle rezervaci bez volání."],
  ["Stálý klient", "V klientské historii zůstává poznámka k preferencím, no-show i další kontext."],
  ["Změna termínu", "Klient může přes self-service odkaz požádat o změnu nebo zrušení bez dalšího telefonátu."],
] as const;

const comparisonRows = [
  ["Telefon + papírový diář", "Stačí na nízký objem, ale špatně škáluje u více barberů a rušení termínů."],
  ["Google Calendar", "Dobrý osobní kalendář, ale nemá booking flow, klienty, služby a no-show historii v jednom."],
  ["Temaro", "Booking stránka, služby, tým, klienti, kalendář a provozní signály v jednom systému."],
] as const;

const faqs = [
  {
    question: "Jak Temaro pomůže barber shopu snížit no-show?",
    answer:
      "Temaro ukládá historii klienta, no-show signály a posílá e-mailové potvrzení. Další priorita produktu je SMS reminder a zálohy pro služby s vyšším rizikem nedostavení.",
  },
  {
    question: "Může si klient vybrat konkrétního barbera?",
    answer:
      "Ano. Veřejný booking může nabídnout výběr konkrétního zaměstnance nebo nejbližší dostupný termín podle nastavení služeb a pracovní doby.",
  },
  {
    question: "Hodí se Temaro i pro jednoho barbera?",
    answer:
      "Ano. Solo provoz získá booking odkaz, kalendář, služby, klientskou historii a méně ručního domlouvání. Týmové funkce se dají využít až později.",
  },
  {
    question: "Musí mít klient účet?",
    answer:
      "Ne. Klient může vytvořit rezervaci bez zákaznického účtu a změny řeší přes bezpečný self-service odkaz.",
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
        "Rezervační systém pro barber shopy: online rezervace, kalendář, klientská historie a no-show signály.",
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
          name: "Rezervační systém pro barbery",
          item: "/rezervacni-system-pro-barbery",
        },
      ],
    },
  ],
} as const;

export default function BarberBookingSystemPage() {
  return (
    <IndustryLandingPage
      eyebrow="Rezervační systém pro barbery"
      eyebrowIcon={Scissors}
      title="Méně telefonátů."
      highlight="Méně prázdných křesel."
      description="Temaro pomáhá barber shopům přijímat online rezervace, držet přehledný kalendář a pracovat s klientskou historií bez papírového diáře a zpráv rozházených po Instagramu."
      previewLabel="Dnešní provoz"
      previewTitle="Barber kalendář"
      previewStatus="Online"
      previewEntries={[
        ["09:00", "Petr", "Střih + vousy", "Potvrzeno"],
        ["10:30", "Martin", "Fade střih", "Čeká"],
        ["13:15", "Jakub", "Komplet", "Riziko no-show"],
        ["15:00", "Tomáš", "Úprava vousů", "Potvrzeno"],
      ]}
      benefits={benefits}
      workflowsLabel="Scénáře v barber shopu"
      workflowsTitle="Booking má řešit reálný den, ne jen formulář."
      workflowsText="Temaro propojuje online objednání s tím, co barber opravdu potřebuje vidět před návštěvou klienta."
      workflows={workflows}
      comparisonTitle="Kdy stačí diář a kdy už dává smysl Temaro"
      comparisonRows={comparisonRows}
      faqs={faqs}
      ctaTitle="Chcete vidět, jak by vypadal booking pro váš barber shop?"
      ctaText="Založte pilotní provoz, nastavte služby a pošlete klientům jeden odkaz místo další zprávy."
      primaryCtaLabel="Založit barber shop"
      primaryCtaHref="/register"
      secondaryCtaLabel="Jak snížit no-show"
      secondaryCtaHref="/jak-snizit-no-show"
      footerLinks={[
        { href: "/", label: "Homepage" },
        { href: "/jak-snizit-no-show", label: "No-show guide" },
        { href: "/register", label: "Registrace" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
