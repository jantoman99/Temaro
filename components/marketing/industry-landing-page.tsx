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
    <main className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="signal-hero signal-grid px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <MarketingHeader />

          <div className="grid items-center gap-10 py-16 lg:grid-cols-[0.92fr_1.08fr] lg:py-24">
            <section>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                <EyebrowIcon className="size-4" />
                {eyebrow}
              </p>
              <h1 className="mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] sm:text-6xl">
                {title}
                <br />
                <span className="font-serif-accent text-primary">{highlight}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-muted-foreground">{description}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={primaryCtaHref}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-primary-glow)] transition hover:bg-primary/92"
                >
                  {primaryCtaLabel}
                  <ArrowRight className="size-5" />
                </Link>
                <Link
                  href={secondaryCtaHref}
                  className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card/85 px-6 text-base font-semibold text-foreground shadow-sm transition hover:bg-card"
                >
                  {secondaryCtaLabel}
                </Link>
              </div>
            </section>

            <aside className="overflow-hidden rounded-xl border border-border bg-card/88 shadow-[var(--shadow-command)] backdrop-blur">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={visualSrc}
                  alt={visualAlt}
                  fill
                  sizes="(min-width: 1024px) 520px, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
              </div>
              <div className="p-5">
              <div className="rounded-xl border border-border bg-background/88 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{previewLabel}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{previewTitle}</h2>
                  </div>
                  <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                    {previewStatus}
                  </span>
                </div>
                <div className="mt-6 grid gap-3">
                  {previewEntries.map(([time, name, service, status]) => (
                    <div
                      key={`${time}-${name}`}
                      className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm"
                    >
                      <span className="nums-tabular text-sm font-semibold">{time}</span>
                      <span>
                        <span className="block text-sm font-semibold">{service}</span>
                        <span className="text-xs font-medium text-muted-foreground">{name}</span>
                      </span>
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-[0.68rem] font-bold text-primary">
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <benefit.icon className="size-5" />
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{benefit.title}</h2>
            <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{benefit.text}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <header>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">{workflowsLabel}</p>
            <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight">{workflowsTitle}</h2>
            <p className="mt-4 text-sm font-medium leading-6 text-muted-foreground">{workflowsText}</p>
          </header>
          <div className="grid gap-3">
            {workflows.map(([workflowTitle, workflowText], index) => (
              <article key={workflowTitle} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex gap-4">
                  <span className="nums-tabular text-2xl font-semibold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold">{workflowTitle}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{workflowText}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Porovnání</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{comparisonTitle}</h2>
          </div>
          <div className="divide-y divide-border">
            {comparisonRows.map(([tool, text]) => (
              <div key={tool} className="grid gap-2 p-5 sm:grid-cols-[14rem_1fr]">
                <p className="font-semibold">{tool}</p>
                <p className="text-sm font-medium leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-start gap-3 text-lg font-semibold">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                {faq.question}
              </h2>
              <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-command)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Další krok</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">{ctaTitle}</h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">{ctaText}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={primaryCtaHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
              >
                {primaryCtaLabel}
                <ArrowRight className="size-5" />
              </Link>
              <Link
                href={secondaryCtaHref}
                className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-base font-semibold text-foreground shadow-sm transition hover:bg-muted"
              >
                {secondaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-sm font-medium text-muted-foreground">
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
