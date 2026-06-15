import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { TemaroLogo } from "@/components/brand/temaro-logo";
import { LandingNavigation } from "@/components/marketing/landing-navigation";
import { MobileMarketingMenu } from "@/components/marketing/mobile-marketing-menu";

export function MarketingHeader() {
  return (
    <header className="marketing-fixed-header fixed left-4 right-4 top-[max(0.75rem,env(safe-area-inset-top))] z-50 mx-auto flex min-h-20 max-w-[1320px] items-center justify-between gap-4 rounded-[1.75rem] border border-[var(--paper-line)] bg-white/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-md sm:left-6 sm:right-6 sm:px-5 lg:left-8 lg:right-8">
      <Link href="/" className="flex items-center gap-3" aria-label="Temaro homepage">
        <TemaroLogo />
      </Link>

      <LandingNavigation />

      <div className="flex min-w-0 items-center gap-2">
        <Link
          href="/login"
          className="temaro-focus-ring hidden h-12 items-center justify-center rounded-full border border-[var(--paper-line)] bg-white px-5 text-[0.96rem] font-bold text-[var(--ink-soft)] shadow-sm transition hover:border-[var(--ink)] hover:text-[var(--ink)] sm:inline-flex"
        >
          Přihlášení
        </Link>
        <Link
          href="/register"
          className="temaro-focus-ring inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--ink)] px-4 text-[0.96rem] font-bold text-white shadow-[0_16px_38px_rgba(0,0,0,0.18)] transition hover:bg-black sm:gap-2 sm:px-5"
        >
          Registrovat salon
          <ArrowRight className="h-4 w-4" />
        </Link>
        <MobileMarketingMenu />
      </div>
    </header>
  );
}
