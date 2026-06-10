import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { LandingNavigation } from "@/components/marketing/landing-navigation";
import { MobileMarketingMenu } from "@/components/marketing/mobile-marketing-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MarketingHeader() {
  return (
    <header className="fixed left-4 right-4 top-3 z-50 mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-3 rounded-[1.35rem] border border-[var(--paper-line)] bg-white/82 px-3 py-3 shadow-[0_16px_48px_rgba(23,26,33,0.10)] backdrop-blur-md sm:left-6 sm:right-6 sm:px-4 lg:left-8 lg:right-8">
      <Link href="/" className="flex items-center gap-3" aria-label="Temaro homepage">
        <TemaroLogo />
      </Link>

      <LandingNavigation />

      <div className="flex min-w-0 items-center gap-2">
        <div className="hidden sm:block">
          <ThemeToggle compact tone="editorial" />
        </div>
        <Link
          href="/login"
          className="temaro-focus-ring hidden h-10 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-4 text-sm font-bold text-[var(--ink-soft)] shadow-sm transition hover:border-[var(--cobalt)] hover:text-[var(--ink)] sm:inline-flex"
        >
          Přihlášení
        </Link>
        <Link
          href="/register"
          className="temaro-focus-ring inline-flex h-10 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--cobalt)] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--cobalt-deep)] sm:gap-2 sm:px-4"
        >
          Začít zdarma
          <ArrowRight className="h-4 w-4" />
        </Link>
        <MobileMarketingMenu />
      </div>
    </header>
  );
}
