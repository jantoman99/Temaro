import type { Metadata } from "next";
import {
  BadgePercent,
  Coins,
  ShieldCheck,
  Store,
  UsersRound,
} from "lucide-react";

import { SeoArticlePage } from "@/components/marketing/seo-article-page";

export const metadata: Metadata = {
  title: "Rezervační systém bez marketplace provizí | Temaro",
  description:
    "Proč některé provozy nechtějí být závislé na marketplace platformě a kdy dává smysl rezervační systém bez provize z vlastních klientů.",
  alternates: {
    canonical: "/rezervacni-system-bez-marketplace-provizi",
  },
};

const principles = [
  {
    icon: UsersRound,
    title: "Vaši klienti zůstávají vaši",
    text: "Pokud si klienta přivedete sami přes web, Instagram, doporučení nebo vizitku, dává smysl držet vztah pod vlastní značkou.",
    href: "#pravidla",
  },
  {
    icon: Coins,
    title: "Cena má být čitelná",
    text: "Měsíční tarif nebo cena za SMS je předvídatelnější než model, kde se do ceny potichu promítá každá rezervace.",
    href: "#pravidla",
  },
  {
    icon: Store,
    title: "Rezervace má posilovat podnik",
    text: "Rezervační stránka má působit jako součást vašeho provozu, ne jako cizí tržiště s cizí značkou.",
    href: "#produkt",
  },
  {
    icon: ShieldCheck,
    title: "Menší závislost na cizích pravidlech",
    text: "Když jsou rezervace pod vaší kontrolou, snáz hlídáte klientská data, komunikaci i ekonomiku provozu.",
    href: "#faq",
  },
] as const;

const comparisonRows = [
  {
    label: "Marketplace",
    value: "Akvizice",
    text: "Může přivést nové klienty, ale zároveň vytváří závislost na cizích pravidlech, provizích a cizím vztahu se zákazníkem.",
  },
  {
    label: "Vlastní rezervace",
    value: "Kontrola",
    text: "Lépe funguje tam, kde si provoz klienty přivádí sám a chce mít jasnou ekonomiku i značku pod kontrolou.",
  },
  {
    label: "Temaro",
    value: "Vlastní kanál",
    text: "Míří na vlastní klienty, vlastní rezervační odkaz a provozní jistotu bez provize z rezervací, které jste získali sami.",
  },
] as const;

const productSlots = [
  { time: "Web", title: "Vlastní rezervační odkaz", meta: "bez cizího katalogu", tone: "blue" },
  { time: "Instagram", title: "Klient jde rovnou k vám", meta: "vlastní vztah", tone: "green" },
  { time: "QR recepce", title: "Rezervace po návštěvě", meta: "bez provize", tone: "amber" },
  { time: "Google", title: "Vlastní kanál", meta: "přehled v CRM", tone: "dark" },
] as const;

const productHighlights = [
  {
    title: "Rezervační odkaz pod vaší značkou",
    text: "Klient nemá pocit, že odchází do cizího marketplace prostředí.",
  },
  {
    title: "Vlastní klientský vztah",
    text: "Historie, poznámky a komunikace zůstávají tam, kde se odehrává provoz.",
  },
  {
    title: "Čitelná cena",
    text: "Platíte za software a provozní funkce, ne za každou vlastní rezervaci jako za novou akvizici.",
  },
  {
    title: "Marketplace jen jako volba",
    text: "Externí katalog dává smysl pro získávání nových klientů, ne jako nutný základ pro vlastní klientelu.",
  },
] as const;

const faqItems = [
  {
    question: "Proč řešit rezervační systém bez marketplace provize?",
    answer:
      "Protože některé provozy nechtějí platit další vrstvu za klienty, které už samy získaly. Chtějí spíš přehledné rezervace, vlastní značku a čitelnou cenu.",
  },
  {
    question: "Znamená to, že marketplace je vždy špatně?",
    answer:
      "Ne. Cizí katalog může pomoci s novými klienty. Jen není ideální pro každý provoz. Pokud už máte vlastní poptávku, může být důležitější kontrola vztahu a nižší závislost na cizích pravidlech.",
  },
  {
    question: "Komu dává vlastní rezervační kanál největší smysl?",
    answer:
      "Nejčastěji barberům, kadeřnictvím, beauty, masážím a wellness provozům, které už mají vlastní klientelu a chtějí spíš méně chaosu než další distribuční kanál.",
  },
  {
    question: "Jak to Temaro řeší dnes?",
    answer:
      "Temaro staví na vlastním rezervačním odkazu, klientské historii, kalendáři a připomínkách. Neřeší provizi z vlastních klientů.",
  },
  {
    question: "Kdy naopak dává marketplace smysl?",
    answer:
      "Když je pro vás prioritou získávání nových klientů přes externí katalog a jste ochotní přijmout vyšší závislost na jeho pravidlech a ekonomice.",
  },
] as const;

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Rezervační systém bez marketplace provizí",
      description:
        "Kdy dává smysl rezervační systém bez marketplace provize a proč některé provozy chtějí vlastní rezervační odkaz a vlastní klientský vztah.",
      author: {
        "@type": "Organization",
        name: "Temaro",
      },
      dateModified: "2026-06-15",
      inLanguage: "cs",
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((faq) => ({
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
          name: "Rezervační systém bez marketplace provizí",
          item: "/rezervacni-system-bez-marketplace-provizi",
        },
      ],
    },
  ],
};

export default function NoMarketplaceCommissionPage() {
  return (
    <SeoArticlePage
      jsonLd={jsonLd}
      badgeIcon={BadgePercent}
      badge="Bez marketplace provizí"
      title={(
        <>
          Vlastní klienti.
          <br />
          <span className="font-serif-accent text-[var(--cobalt)]">Vlastní rezervační odkaz.</span>
        </>
      )}
      intro="Ne každý provoz potřebuje marketplace. Pokud si klienty přivádíte sami, často dává větší smysl mít rezervační systém, který z vlastních rezervací neukrajuje další provizi."
      imageSrc="/marketing/industries/hair-salon-wide.webp"
      imageAlt="Kadeřnický salon s vlastní rezervační cestou bez cizího katalogu"
      imageLabel="Vlastní kanály bez provize"
      metrics={[
        { value: "0 %", label: "provize z vlastních klientů" },
        { value: "1", label: "vlastní rezervační odkaz" },
        { value: "100 %", label: "vztah pod vaší značkou" },
      ]}
      steps={principles}
      comparisonKicker="Marketplace vs. vlastní rezervace"
      comparisonTitle="Otázka není jen jak klient rezervuje. Otázka je, komu ten vztah patří."
      comparisonIntro="Některé provozy potřebují nové klienty zvenku. Jiné už klienty mají a chtějí hlavně klidnější provoz, přehled a férovější ekonomiku rezervací."
      comparisonRows={comparisonRows}
      secondaryImageSrc="/marketing/premium/salon-hero-wide.webp"
      secondaryImageAlt="Prémiový salon, kde rezervační cesta podporuje vlastní značku"
      secondaryImageLabel="Rezervace jako součást značky"
      proofTitle="Vlastní rezervace má posilovat váš podnik."
      proofText="Temaro cílí na provozy, které chtějí méně telefonátů, lepší přehled a vlastní klientský vztah. Ne na model, kde každá vlastní rezervace působí jako další akvizice z cizí platformy."
      productSlots={productSlots}
      productHighlights={productHighlights}
      faqs={faqItems}
      ctaTitle="Chcete rezervace, které posilují vaši značku?"
      ctaText="Začněte vlastním rezervačním odkazem, klientskou historií a připomínkami. Provizní katalog řešte jen pokud opravdu potřebujete nové klienty zvenku."
      primaryCtaHref="/register"
      primaryCtaLabel="Začít zdarma"
      secondaryCtaHref="/sms-pripominky-rezervaci"
      secondaryCtaLabel="SMS připomínky"
      related={[
        {
          href: "/jak-snizit-no-show",
          label: "No-show návod",
          text: "Jak chránit kalendář bez přehnaného tření pro klienta.",
        },
        {
          href: "/sms-pripominky-rezervaci",
          label: "SMS připomínky",
          text: "Kdy cílená zpráva chrání drahý termín lépe než e-mail.",
        },
        {
          href: "/ukazka",
          label: "Produktová ukázka",
          text: "Proklikněte interní CRM a kalendář Temaro.",
        },
      ]}
    />
  );
}
