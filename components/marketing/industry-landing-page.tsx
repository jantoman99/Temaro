import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { MarketingHeader } from "@/components/marketing/marketing-header";

type JsonLdGraphItem = Record<string, unknown>;

type IndustryLandingPageProps = {
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: string;
  highlight: string;
  description: string;
  previewLabel: string;
  previewTitle: string;
  previewStatus: string;
  previewEntries: readonly (readonly [string, string, string, string])[];
  visualAlt: string;
  visualSrc: string;
  benefits: readonly {
    icon: LucideIcon;
    title: string;
    text: string;
  }[];
  workflowsLabel: string;
  workflowsTitle: string;
  workflowsText: string;
  workflows: readonly (readonly [string, string])[];
  comparisonTitle: string;
  comparisonRows: readonly (readonly [string, string])[];
  faqs: readonly {
    question: string;
    answer: string;
  }[];
  ctaTitle: string;
  ctaText: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  footerLinks: readonly {
    href: string;
    label: string;
  }[];
  jsonLd: {
    "@context": string;
    "@graph": readonly JsonLdGraphItem[];
  };
};

const articleNav = [
  ["#kroky", "Kroky"],
  ["#pravidla", "Pravidla"],
  ["#produkt", "Produkt"],
  ["#faq", "FAQ"],
] as const;

const slotToneClasses = [
  "temaro-article-slot-amber",
  "temaro-article-slot-green",
  "temaro-article-slot-blue",
  "temaro-article-slot-dark",
] as const;

export function IndustryLandingPage({
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  highlight,
  description,
  previewLabel,
  previewTitle,
  previewStatus,
  previewEntries,
  visualAlt,
  visualSrc,
  benefits,
  workflowsLabel,
  workflowsTitle,
  workflowsText,
  workflows,
  comparisonTitle,
  comparisonRows,
  faqs,
  ctaTitle,
  ctaText,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  footerLinks,
  jsonLd,
}: IndustryLandingPageProps) {
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
            <section className="motion-reveal">
              <p className="inline-flex items-center gap-2 rounded-full border border-[var(--paper-line)] bg-white/85 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--cobalt)] shadow-sm backdrop-blur">
                <EyebrowIcon className="size-4" />
                {eyebrow}
              </p>
              <h1 className="mt-7 text-balance font-display text-5xl font-semibold leading-[0.96] tracking-[-0.055em] text-[var(--ink)] sm:text-6xl">
                {title}
                <br />
                <span className="font-serif-accent text-[var(--cobalt)]">{highlight}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-[var(--ink-faint)]">{description}</p>

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
            </section>

            <aside className="temaro-article-visual motion-reveal" aria-label="Vizuální ukázka oboru">
              <div className="temaro-article-photo">
                <Image
                  src={visualSrc}
                  alt={visualAlt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 620px, 100vw"
                  className="object-cover"
                />
                <div className="temaro-article-photo-caption">{previewTitle}</div>
              </div>

              <div className="temaro-article-product-card" aria-label="Produktový náhled Temaro">
                <div className="flex items-center justify-between gap-3 border-b border-[var(--paper-line)] px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-[var(--ink)]">Temaro</p>
                    <p className="text-[0.66rem] font-black uppercase tracking-[0.15em] text-[var(--ink-faint)]">
                      {previewLabel}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--porcelain)] px-3 py-1 text-xs font-black text-[var(--cobalt)]">
                    {previewStatus}
                  </span>
                </div>

                <div className="grid gap-3 p-4">
                  {previewEntries.map(([time, name, service, status], index) => (
                    <div
                      key={`${time}-${name}`}
                      className={`temaro-article-slot ${slotToneClasses[index % slotToneClasses.length]}`}
                    >
                      <p className="text-xs font-black">{time}</p>
                      <p className="mt-1 text-sm font-black">{service}</p>
                      <p className="mt-1 text-xs font-bold opacity-75">
                        {name} · {status}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="temaro-article-metrics" aria-label="Rychlé shrnutí">
                <div>
                  <p className="nums-tabular text-3xl font-black text-[var(--cobalt)]">{previewEntries.length}</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    ukázkové sloty
                  </p>
                </div>
                <div>
                  <p className="nums-tabular text-3xl font-black text-[var(--cobalt)]">1</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    rezervační odkaz
                  </p>
                </div>
                <div>
                  <p className="nums-tabular text-3xl font-black text-[var(--cobalt)]">0</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--ink-faint)]">
                    zbytečných volání
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <nav className="temaro-article-mini-nav mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8" aria-label="Obsah stránky">
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

      <section id="kroky" className="mx-auto grid max-w-[1180px] gap-4 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="temaro-article-step rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-5 shadow-sm">
            <div className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-[var(--cobalt)] text-white shadow-sm">
              <benefit.icon className="size-5" />
            </div>
            <h2 className="text-xl font-black tracking-[-0.025em] text-[var(--ink)]">{benefit.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[var(--ink-faint)]">{benefit.text}</p>
            <Link href="#pravidla" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--cobalt)]">
              Číst kapitolu
              <ArrowRight className="size-4" />
            </Link>
          </article>
        ))}
      </section>

      <section id="pravidla" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <header className="lg:sticky lg:top-32">
            <p className="section-eyebrow text-[var(--cobalt)]">{workflowsLabel}</p>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-[-0.04em] text-[var(--ink)]">
              {workflowsTitle}
            </h2>
            <p className="mt-4 text-sm font-semibold leading-6 text-[var(--ink-faint)]">{workflowsText}</p>
          </header>

          <div className="grid gap-3">
            {workflows.map(([workflowTitle, workflowText], index) => (
              <article key={workflowTitle} className="rounded-[1.5rem] border border-[var(--paper-line)] bg-white p-5 shadow-sm">
                <div className="flex gap-4">
                  <span className="nums-tabular text-2xl font-black text-[var(--cobalt)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-[var(--ink)]">{workflowTitle}</h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[var(--ink-faint)]">{workflowText}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="produkt" className="mx-auto max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="temaro-article-product-proof">
          <div>
            <p className="section-eyebrow text-[var(--mint)]">Porovnání</p>
            <h2 className="mt-3 text-balance font-display text-4xl font-semibold tracking-[-0.045em] text-white">
              {comparisonTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/68">
              {previewTitle} má spojit vlastní rezervace, klientský kontext a přehled kapacity do jednoho provozního pohledu.
            </p>
          </div>

          <div className="temaro-article-flow">
            {comparisonRows.map(([tool, text]) => (
              <article key={tool} className="rounded-2xl border border-white/12 bg-white/[0.07] p-4">
                <div className="mb-4 flex size-9 items-center justify-center rounded-full bg-white text-[var(--ink)]">
                  <CheckCircle2 className="size-5" />
                </div>
                <h3 className="font-black text-white">{tool}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-white/64">{text}</p>
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
              Odpovědi pro konkrétní provoz.
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
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
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
            {footerLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl border border-[var(--paper-line)] bg-[var(--porcelain)] p-4 font-black text-[var(--ink)] transition hover:-translate-y-0.5 hover:bg-[var(--porcelain-deep)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--paper-line)] bg-white/65 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 text-sm font-bold text-[var(--ink-faint)]">
          <TemaroLogo />
          <div className="flex flex-wrap gap-3">
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
