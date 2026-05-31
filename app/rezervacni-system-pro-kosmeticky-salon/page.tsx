import type { Metadata } from "next";
import { CalendarDays, HeartHandshake, PhoneOff, Sparkles } from "lucide-react";

import { IndustryLandingPage } from "@/components/marketing/industry-landing-page";

export const metadata: Metadata = {
  title: "Rezervační systém pro kosmetický salon | Temaro",
  description:
    "Temaro je rezervační systém pro kosmetické a beauty salony. Online objednání, klientská historie, přehledný kalendář a méně no-show.",
  alternates: {
    canonical: "/rezervacni-system-pro-kosmeticky-salon",
  },
};

const faqs = [
  {
    question: "Pro jaké beauty provozy je Temaro vhodné?",
    answer:
      "Hodí se pro kosmetiku, lash, brow, skincare i menší beauty salony, které chtějí online objednání, kalendář a klientskou historii bez marketplace závislosti.",
  },
  {
    question: "Pomůže Temaro s no-show u delších služeb?",
    answer:
      "Ano. Už dnes pomáhá přes potvrzení rezervace, klientskou historii a self-service změny. Pro vyšší no-show riziko jsou další logické kroky SMS reminder a zálohy.",
  },
  {
    question: "Vidím u klientky předchozí návštěvy a poznámky?",
    answer:
      "Ano. U klienta zůstává historie návštěv, interní poznámka a další provozní kontext, takže další rezervace nebo navazující péče není naslepo.",
  },
  {
    question: "Musí mít klientka účet?",
    answer:
      "Nemusí. Rezervaci vytvoří bez zákaznického účtu a změnu termínu řeší přes bezpečný self-service odkaz.",
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
        "Rezervační systém pro kosmetické a beauty salony: online objednání, klientská historie, přehledný kalendář a méně no-show.",
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
          name: "Rezervační systém pro kosmetický salon",
          item: "/rezervacni-system-pro-kosmeticky-salon",
        },
      ],
    },
  ],
} as const;

export default function BeautySalonBookingSystemPage() {
  return (
    <IndustryLandingPage
      eyebrow="Rezervační systém pro kosmetický salon"
      eyebrowIcon={Sparkles}
      title="Méně výpadků."
      highlight="Víc klidné péče o klientku."
      description="Temaro pomáhá beauty salonům držet objednání, historii návštěv a změny termínů v jednom přehledném toku, bez marketplace provize a bez dalšího domlouvání po zprávách."
      previewLabel="Beauty provoz"
      previewTitle="Kosmetický den"
      previewStatus="Připraveno"
      previewEntries={[
        ["09:00", "Nela", "Lash lifting", "Potvrzeno"],
        ["11:00", "Karolína", "Kosmetické ošetření", "Nová klientka"],
        ["14:30", "Eva", "Brow shape", "Čeká"],
        ["17:00", "Jana", "Skin care konzultace", "Potvrzeno"],
      ]}
      benefits={[
        {
          icon: PhoneOff,
          title: "Objednání bez zbytečných zpráv",
          text: "Klientka si vybere službu a čas sama, takže salon neřeší každou rezervaci přes DM nebo telefon.",
        },
        {
          icon: HeartHandshake,
          title: "Historie vztahu s klientkou",
          text: "Návštěvy, interní poznámky a rizikové signály zůstávají u klientky pro další termín i follow-up.",
        },
        {
          icon: CalendarDays,
          title: "Přehledné řízení dne",
          text: "Kalendář ukáže obsazení, čekající rezervace a změny bez skákání mezi několika nástroji.",
        },
      ]}
      workflowsLabel="Scénáře v beauty salonu"
      workflowsTitle="Beauty booking má chránit čas i vztah s klientkou."
      workflowsText="Temaro staví na jednoduchém objednání, přehledné kapacitě a kontextu, který je u opakovaných návštěv důležitý."
      workflows={[
        ["Nová klientka", "Vybere typ ošetření, dostupný čas a dostane jasné potvrzení bez dalšího domlouvání."],
        ["Delší služba", "Salon rychle pozná, které termíny mají vyšší riziko no-show a kde bude později dávat smysl záloha."],
        ["Opakovaná péče", "Před další návštěvou je po ruce historie i interní poznámka, ne jen jméno v kalendáři."],
      ]}
      comparisonTitle="Co beauty salon získá oproti ručnímu objednávání"
      comparisonRows={[
        ["Instagram + zprávy", "Působí osobně, ale špatně se v tom hledají změny, storna i kapacita týmu."],
        ["Obyčejný kalendář", "Umí čas, ale ne online booking, klientské informace ani provozní signály kolem no-show."],
        ["Temaro", "Spojí online objednání, klienty, tým i připravenost na reminder a zálohy v jednom systému."],
      ]}
      faqs={faqs}
      ctaTitle="Chcete otestovat booking pro kosmetický salon?"
      ctaText="Založte beauty provoz v pilotu a vyzkoušejte si, jak funguje objednání, kalendář a klientská historie bez ručního chaosu."
      primaryCtaLabel="Založit beauty salon"
      primaryCtaHref="/register"
      secondaryCtaLabel="Jak snížit no-show"
      secondaryCtaHref="/jak-snizit-no-show"
      footerLinks={[
        { href: "/", label: "Homepage" },
        { href: "/rezervacni-system-pro-kadernictvi", label: "Pro kadeřnictví" },
        { href: "/rezervacni-system-pro-masaze", label: "Pro masáže" },
        { href: "/register", label: "Registrace" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
