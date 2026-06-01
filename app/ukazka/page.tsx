import { ArrowRight, CalendarDays, CheckCircle2, MousePointer2, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { InteractiveProductDemo } from "@/components/marketing/interactive-product-demo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata: Metadata = {
  title: "Interaktivní ukázka Temara | Rezervační systém",
  description:
    "Projděte si Temaro jako majitel provozu: přehled dne, kalendář týmu, rezervační stránku a zákaznický účet.",
  alternates: {
    canonical: "/ukazka",
  },
};

const previewPoints = [
  {
    title: "Přehled dne",
    text: "Rezervace, tržba, volná okna a rizikové termíny na jedné obrazovce.",
    icon: CheckCircle2,
  },
  {
    title: "Kalendář týmu",
    text: "Týdenní kapacita, lidé v kalendáři a rychlé založení nové rezervace.",
    icon: CalendarDays,
  },
  {
    title: "Rezervační stránka",
    text: "To, co posíláte klientům: služby, tým, sdílení a vzhled pod vlastní značkou.",
    icon: MousePointer2,
  },
  {
    title: "Zákaznický účet",
    text: "Klient vidí svoje termíny, historii a změny bez dalšího telefonátu.",
    icon: UsersRound,
  },
] as const;

export default function DemoPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <section className="signal-hero signal-grid relative">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col px-4 py-4 sm:px-6 lg:px-0">
          <header className="sticky top-3 z-30 flex min-h-16 flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/88 px-3 py-3 shadow-lg shadow-primary/5 backdrop-blur-md sm:px-4 lg:backdrop-blur-xl">
            <Link href="/" className="flex items-center gap-3">
              <TemaroLogo />
            </Link>

            <nav className="order-3 grid w-full grid-cols-3 gap-1 border-t border-border/70 pt-2 lg:order-none lg:flex lg:w-auto lg:border-t-0 lg:pt-0">
              {[
                ["/", "Pro podniky"],
                ["/podniky", "Pro zákazníky"],
                ["/demo-barber", "Rezervace klienta"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-2 py-2 text-center text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground lg:px-3"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/92"
              >
                Začít zdarma
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div className="grid gap-10 py-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:py-14">
            <section className="mx-auto max-w-2xl lg:mx-0">
              <div className="motion-reveal inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
                <span className="signal-pulse size-2 rounded-full bg-primary" />
                Interaktivní ukázka Temara
              </div>
              <h1 className="motion-reveal mt-7 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl">
                Projděte si Temaro jako majitel provozu.
              </h1>
              <p className="motion-reveal mt-6 max-w-xl text-lg font-medium leading-[1.55] text-muted-foreground">
                Ukázka odpovídá tomu, co po přihlášení reálně uvidíte: provozní přehled, kalendář, rezervační stránku a
                pohled klienta na jeho termíny.
              </p>

              <div className="motion-reveal mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="group inline-flex h-12 min-w-44 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 text-base font-semibold text-primary-foreground shadow-[var(--shadow-primary-glow)] transition hover:-translate-y-0.5 hover:bg-primary/92"
                >
                  Začít zdarma
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/podniky"
                  className="inline-flex h-12 min-w-40 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-card/85 px-6 text-base font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-card"
                >
                  Najít podnik
                </Link>
              </div>
            </section>

            <InteractiveProductDemo />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Co si vyzkoušet</p>
            <h2 className="mt-3 max-w-2xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Klikněte na části systému a projděte si běžný pracovní den.
            </h2>
          </div>
          <p className="max-w-sm text-sm font-medium leading-6 text-secondary-foreground">
            Místo dlouhého videa dostanete krátký průchod obrazovkami, které bude podnik používat každý den.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {previewPoints.map((point) => (
            <article key={point.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <point.icon className="size-5" strokeWidth={1.9} />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{point.title}</h3>
              <p className="mt-2 text-sm font-medium leading-6 text-secondary-foreground">{point.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
