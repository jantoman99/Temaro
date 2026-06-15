import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { MarketingHeader } from "@/components/marketing/marketing-header";

type ArticleTone = "blue" | "green" | "amber" | "dark";

type ArticleMetric = {
  value: string;
  label: string;
};

type ArticleStep = {
  icon: LucideIcon;
  title: string;
  text: string;
  href?: string;
};

type ArticleRow = {
  label: string;
  value?: string;
  text: string;
};

type ProductSlot = {
  time: string;
  title: string;
  meta: string;
  tone: ArticleTone;
};

type ProductHighlight = {
  title: string;
  text: string;
};

type ArticleFaq = {
  question: string;
  answer: string;
};

type RelatedLink = {
  href: string;
  label: string;
  text: string;
};

type SeoArticlePageProps = {
  jsonLd: unknown;
  badgeIcon: LucideIcon;
  badge: string;
  title: ReactNode;
  intro: string;
  imageSrc: string;
  imageAlt: string;
  imageLabel: string;
  metrics: readonly ArticleMetric[];
  steps: readonly ArticleStep[];
  comparisonKicker: string;
  comparisonTitle: string;
  comparisonIntro: string;
  comparisonRows: readonly ArticleRow[];
  secondaryImageSrc: string;
  secondaryImageAlt: string;
  secondaryImageLabel: string;
  proofTitle: string;
  proofText: string;
  productSlots: readonly ProductSlot[];
  productHighlights: readonly ProductHighlight[];
  faqs: readonly ArticleFaq[];
  related: readonly RelatedLink[];
  ctaTitle: string;
  ctaText: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaLabel: string;
};

const productSlotToneClass: Record<ArticleTone, string> = {
  amber: "temaro-article-slot-amber",
  blue: "temaro-article-slot-blue",
  dark: "temaro-article-slot-dark",
  green: "temaro-article-slot-green",
};

const articleNav = [
  ["#kroky", "Kroky"],
  ["#pravidla", "Pravidla"],
  ["#produkt", "Produkt"],
  ["#faq", "FAQ"],
] as const;

export function SeoArticlePage({
  jsonLd,
  badgeIcon: BadgeIcon,
  badge,
  title,
  intro,
  imageSrc,
  imageAlt,
  imageLabel,
  metrics,
  steps,
  comparisonKicker,
  comparisonTitle,
  comparisonIntro,
  comparisonRows,
  secondaryImageSrc,
  secondaryImageAlt,
  secondaryImageLabel,
  proofTitle,
  proofText,
  productSlots,
  productHighlights,
  faqs,
  related,
  ctaTitle,
  ctaText,
  primaryCtaHref,
  primaryCtaLabel,
  secondaryCtaHref,
  secondaryCtaLabel,
}: SeoArticlePageProps) {
  return (
    <main className="temaro-public-light temaro-seo-article min-h-screen bg-[var(--porcelain)] text-[var(--ink)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="temaro-article-hero px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <MarketingHeader />

          <div className="grid items-center gap-10 pb-14 pt-28 lg:grid-cols-[0.9fr_1.1fr] lg:pb-20 lg:pt-32">
            <article className="motion-reveal">
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white/85 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--cobalt)] shadow-sm backdrop-blur">
                <BadgeIcon className="size-4" />
                {badge}
              </p>
              <h1 className="mt-7 text-balance font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-[var(--ink)] sm:text-6xl">
                {title}
              </h1>
              <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[var(--ink-faint)]">
                {intro}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryCtaHref}
                  className="temaro-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-6 text-base font-bold text-white shadow-[0_18px_40px_rgba(43,63,242,0.22)] transition hover:bg-[color-mix(in_srgb,var(--cobalt)_92%,black)]"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="size-5" />
                </Link>
                <Link
                  href={secondaryCtaHref}
                  className="temaro-focus-ring inline-flex h-12 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-6 text-base font-bold text-[var(--ink)] shadow-sm transition hover:bg-[var(--porcelain-deep)]"
                >
                  {secondaryCtaLabel}
                </Link>
              </div>
            </article>

            <aside className="temaro-article-visual motion-reveal" aria-label="Vizuální ukázka článku">
              <div className="temaro-article-photo">
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 620px, 100vw"
                  className="object-cover"
                />
                <div className="temaro-article-photo-caption">{imageLabel}</div>
              </div>

              <div className="temaro-article-product-card" aria-label="Produktový náhled Temaro">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--paper-line)] px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-[var(--ink)]">Temaro</p>
                    <p className="text-[0.66rem] font-black uppercase tracking-[0.15em] text-[var(--ink-faint)]">
                      dnes v salonu
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--porcelain)] px-3 py-1 text-xs font-black text-[var(--cobalt)]">
                    live kalendář
                  </span>
                </div>

                <div className="grid gap-3 p-4">
                  {productSlots.map((slot) => (
                    <div key={`${slot.time}-${slot.title}`} className={`temaro-article-slot ${productSlotToneClass[slot.tone]}`}>
                      <p className="text-xs font-black">{slot.time}</p>
                      <p className="mt-1 text-sm font-black">{slot.title}</p>
                      <p className="mt-1 text-xs font-bold opacity-75">{slot.meta}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="temaro-article-metrics" aria-label="Rychlé shrnutí">
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="nums-tabular text-3xl font-black text-[var(--cobalt)]">{metric.value}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                      {metric.label}
                    </p>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <nav className="temaro-article-mini-nav mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8" aria-label="Obsah článku">
        <div className="flex gap-2 overflow-x-auto rounded-full border border-[var(--paper-line)] bg-white/88 p-1 shadow-sm backdrop-blur">
          {articleNav.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="temaro-focus-ring whitespace-nowrap rounded-full px-4 py-2 text-sm font-black text-[var(--ink-soft)] transition hover:bg-[var(--porcelain-deep)] hover:text-[var(--ink)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <section id="kroky" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.title} className="temaro-article-step rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-5 shadow-sm">
              <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-[var(--cobalt)] text-white shadow-sm">
                <step.icon className="size-5" />
              </div>
              <h2 className="text-xl font-black tracking-[-0.025em] text-[var(--ink)]">{step.title}</h2>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--ink-faint)]">{step.text}</p>
              <Link
                href={step.href ?? "#pravidla"}
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--cobalt)]"
              >
                Číst kapitolu
                <ArrowRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="pravidla" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <header className="lg:sticky lg:top-32">
            <p className="section-eyebrow text-[var(--cobalt)]">{comparisonKicker}</p>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
              {comparisonTitle}
            </h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-[var(--ink-faint)]">{comparisonIntro}</p>
          </header>

          <div className="overflow-hidden rounded-[1.5rem] border border-[var(--paper-line)] bg-white shadow-sm">
            {comparisonRows.map((row) => (
              <div key={row.label} className="grid gap-3 border-b border-[var(--paper-line)] p-5 last:border-b-0 sm:grid-cols-[12rem_7rem_1fr]">
                <p className="font-black text-[var(--ink)]">{row.label}</p>
                <p className="text-sm font-black text-[var(--cobalt)]">{row.value ?? "Doporučení"}</p>
                <p className="text-sm font-semibold leading-6 text-[var(--ink-faint)]">{row.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="temaro-article-photo-break">
          <Image
            src={secondaryImageSrc}
            alt={secondaryImageAlt}
            fill
            sizes="(min-width: 1024px) 1180px, 100vw"
            className="object-cover"
          />
          <div className="temaro-article-photo-note">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--cobalt)]">
              {secondaryImageLabel}
            </p>
            <p className="mt-3 max-w-xl font-display text-3xl font-semibold leading-tight tracking-[-0.035em] text-[var(--ink)]">
              Fotka má vysvětlit provoz, ne jen vyplnit prázdné místo.
            </p>
          </div>
        </div>
      </section>

      <section id="produkt" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="temaro-article-product-proof">
          <div>
            <p className="section-eyebrow text-[var(--mint)]">Jak to řeší Temaro</p>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-[-0.045em] text-white">
              {proofTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/68">{proofText}</p>
          </div>

          <div className="temaro-article-flow">
            {productHighlights.map((highlight) => (
              <article key={highlight.title} className="rounded-2xl border border-white/12 bg-white/[0.07] p-4">
                <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-white text-[var(--ink)]">
                  <CheckCircle2 className="size-5" />
                </div>
                <h3 className="font-black text-white">{highlight.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/64">{highlight.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <header>
            <p className="section-eyebrow text-[var(--cobalt)]">FAQ</p>
            <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
              Rychlé odpovědi bez dalšího scrollu.
            </h2>
          </header>

          <div className="temaro-article-faq grid gap-3">
            {faqs.map((faq, index) => (
              <details key={faq.question} open={index === 0}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[var(--paper-line)] bg-white p-6 shadow-[0_24px_70px_rgba(17,21,35,0.08)] sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="section-eyebrow text-[var(--cobalt)]">Další krok</p>
              <h2 className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
                {ctaTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[var(--ink-faint)]">{ctaText}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryCtaHref}
                className="temaro-focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--cobalt)] px-6 text-base font-bold text-white shadow-sm transition hover:bg-[color-mix(in_srgb,var(--cobalt)_92%,black)]"
              >
                {primaryCtaLabel}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href={secondaryCtaHref}
                className="temaro-focus-ring inline-flex h-12 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-6 text-base font-bold text-[var(--ink)] shadow-sm transition hover:bg-[var(--porcelain-deep)]"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-[var(--paper-line)] bg-[var(--porcelain)] p-4 transition hover:-translate-y-0.5 hover:bg-[var(--porcelain-deep)]"
              >
                <p className="font-black text-[var(--ink)]">{link.label}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ink-faint)]">{link.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--paper-line)] bg-white/65 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 text-sm font-bold text-[var(--ink-faint)]">
          <TemaroLogo />
          <div className="flex flex-wrap gap-3">
            <Link href="/">Úvod</Link>
            <Link href="/jak-snizit-no-show">No-show návod</Link>
            <Link href="/sms-pripominky-rezervaci">SMS připomínky</Link>
            <Link href="/register">Registrace</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
