import type { Metadata } from "next";
import { CalendarDays, HeartPulse, PhoneOff, ShieldPlus } from "lucide-react";

import { IndustryLandingPage } from "@/components/marketing/industry-landing-page";

export const metadata: Metadata = {
  title: "Rezervační systém pro masáže | Temaro",
  description:
    "Temaro je rezervační systém pro masáže. Online rezervace, přehledný kalendář, klientská historie a nižší no-show u delších termínů.",
  alternates: {
    canonical: "/rezervacni-system-pro-masaze",
  },
};

const faqs = [
  {
    question: "Proč je rezervační systém pro masáže důležitější než běžný kalendář?",
    answer:
      "Masáže často blokují delší časová okna. Potřebujete proto nejen vidět slot, ale i typ služby, klienta, historii a možnost snadné změny termínu bez dalších telefonátů.",
  },
  {
    question: "Pomůže Temaro s delšími a dražšími termíny?",
    answer:
      "Ano. Už dnes řeší potvrzení rezervace, změny termínu bez telefonátu a klientský kontext. Pro dlouhé termíny je další logický krok SMS připomínka a záloha.",
  },
  {
    question: "Mohu rozlišit různé typy masáží podle délky?",
    answer:
      "Ano. Služby mají vlastní délku, cenu i buffer, takže klient rezervuje reálné časové okno podle typu masáže.",
  },
  {
    question: "Funguje Temaro i pro jednoho maséra?",
    answer:
      "Ano. Solo provoz získá rezervační odkaz, kalendář, služby, klienty a méně ruční organizace. Týmové funkce se dají zapojit až při růstu.",
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
        "Rezervační systém pro masáže: online rezervace, přehledný kalendář, klientská historie a nižší no-show u delších termínů.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "CZK",
        description: "Pilotní ověření v prvních zapojených provozech.",
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
          name: "Rezervační systém pro masáže",
          item: "/rezervacni-system-pro-masaze",
        },
      ],
    },
  ],
} as const;

export default function MassageBookingSystemPage() {
  return (
    <IndustryLandingPage
      eyebrow="Rezervační systém pro masáže"
      eyebrowIcon={HeartPulse}
      title="Méně výpadků."
      highlight="Víc jistoty u dlouhých termínů."
      description="Temaro pomáhá masérům a wellness provozům držet přehled o delších termínech, klientské historii a změnách rezervací bez ručního přepisování nebo zbytečných telefonátů."
      previewLabel="Dnešní kapacita"
      previewTitle="Masážní kalendář"
      previewStatus="Aktivní"
      previewEntries={[
        ["09:00", "Pavel", "Sportovní masáž 90 min", "Potvrzeno"],
        ["11:30", "Tereza", "Relaxační masáž 60 min", "Čeká"],
        ["14:00", "Marie", "Wellness rituál 120 min", "Vyšší riziko"],
        ["17:00", "David", "Regenerace zad 45 min", "Potvrzeno"],
      ]}
      visualAlt="Klidné studio připravené na delší službu"
      visualSrc="/marketing/training-studio-ai.webp"
      benefits={[
        {
          icon: PhoneOff,
          title: "Klient rezervuje bez volání",
          text: "Vyšší komfort pro klienta a méně vyrušování během terapie nebo mezi bloky dne.",
        },
        {
          icon: CalendarDays,
          title: "Délka služby sedí s realitou",
          text: "Každá masáž může mít vlastní délku a buffer, takže kalendář odpovídá skutečné kapacitě dne.",
        },
        {
          icon: ShieldPlus,
          title: "Lepší ochrana před no-show",
          text: "Potvrzení rezervace, klientská historie a změny bez telefonátu dávají delším termínům větší jistotu.",
        },
      ]}
      workflowsLabel="Scénáře v masážním provozu"
      workflowsTitle="Dlouhé služby potřebují víc než jen prázdný slot."
      workflowsText="Temaro pomáhá masérům a wellness službám držet přehled o čase, klientovi i riziku, které u delších bloků nejvíc bolí."
      workflows={[
        ["Nový klient", "Vybere typ masáže, délku a volný termín bez ručního hledání vhodného slotu."],
        ["Delší wellness blok", "Kalendář drží kapacitu dne a zviditelní, kde je no-show nebo pozdní změna nejdražší."],
        ["Přesun termínu", "Klient dostane bezpečný odkaz a provoz nemusí každý přesun řešit ručně po telefonu."],
      ]}
      comparisonTitle="Kdy už masáže potřebují víc než ruční diář"
      comparisonRows={[
        ["Papírový diář", "Rychle selže u delších bloků, změn a potřeby dohledat klientský kontext."],
        ["Běžný kalendář", "Ukáže volný čas, ale neřeší online rezervaci, délku služeb, klienty ani no-show signály."],
        ["Temaro", "Spojí online rezervace, délky služeb, klientskou historii a připravenost na připomínky a zálohy v jednom toku."],
      ]}
      faqs={faqs}
      ctaTitle="Chcete si vyzkoušet online rezervace pro masáže nebo wellness?"
      ctaText="Založte pilotní provoz a nastavte si služby tak, aby každý delší termín měl jasná pravidla a menší riziko prázdného okna."
      primaryCtaLabel="Založit masáže"
      primaryCtaHref="/register"
      secondaryCtaLabel="Projít wellness variantu"
      secondaryCtaHref="/rezervacni-system-pro-wellness"
      footerLinks={[
        { href: "/", label: "Úvod" },
        { href: "/rezervacni-system-pro-wellness", label: "Pro wellness" },
        { href: "/jak-snizit-no-show", label: "No-show návod" },
        { href: "/register", label: "Registrace" },
      ]}
      jsonLd={jsonLd}
    />
  );
}
