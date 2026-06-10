import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("landing polish guard", () => {
  test("homepage uses generated segment images instead of older source photos", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("/marketing/barber-studio-ai.webp");
    expect(page).toContain("/marketing/salon-interior-ai.webp");
    expect(page).toContain("/marketing/training-studio-ai.webp");
    expect(page).not.toContain("/marketing/barber-studio.jpg");
    expect(page).not.toContain("/marketing/salon-interior.jpg");
    expect(page).not.toContain("/marketing/training-studio.jpg");
  });

  test("homepage avoids weak local-origin copy in the footer", () => {
    const page = readProjectFile("app/page.tsx").toLowerCase();

    expect(page).not.toContain("postaveno v brně");
  });

  test("product demo uses customer-facing labels and mirrors signed-in screens", () => {
    const demo = readProjectFile("components/marketing/interactive-product-demo.tsx");

    expect(demo).toContain("Přehled provozu");
    expect(demo).toContain("Dnešní rezervace");
    expect(demo).toContain("Tržba dnes");
    expect(demo).toContain("Volná okna");
    expect(demo).toContain("Riziko");
    expect(demo).toContain("Otevřít kalendář");
    expect(demo).toContain("Spravovat rezervace");
    expect(demo).toContain("selectSurface");
    expect(demo).toContain("setHasInteracted(true)");
    expect(demo).toContain("overflow-hidden");
    expect(demo).toContain("Spustit ukázku");
    expect(demo).toContain("Další krok");
    expect(demo).toContain("Zavřít ukázku");

    expect(demo).not.toContain("quickLinks");
    expect(demo).not.toContain("overflow-y-auto");
    expect(demo).not.toContain("Dashboard");
    expect(demo).not.toContain("Temaro MVP");
    expect(demo).not.toContain("Live demo");
    expect(demo).not.toContain("tenant izolace");
    expect(demo).not.toContain("self-service");
    expect(demo).not.toContain("/dashboard");
    expect(demo).not.toContain("/calendar");
  });

  test("homepage copy avoids internal product and marketing terms", () => {
    const page = readProjectFile("app/page.tsx");
    const forbiddenTerms = [
      "MVP",
      "booking flow",
      "SEO/GEO",
      "tenant izolace",
      "tenant_id",
      "self-service",
      "Multi-tenant",
      "booking link",
      "SaaS šablona",
      "role owner/staff",
    ];

    for (const term of forbiddenTerms) {
      expect(page).not.toContain(term);
    }
  });

  test("homepage avoids low-contrast muted text on tinted surfaces", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).not.toContain("text-sm font-medium leading-6 text-muted-foreground");
    expect(page).not.toContain("border border-border bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground");
  });

  test("homepage follows the full-width business discovery direction", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(page).toContain("business-discovery-page");
    expect(page).toContain("<BusinessDiscoveryHero />");
    expect(hero).toContain("business-discovery-hero");
    expect(hero).toContain("Získejte rezervace");
    expect(hero).toContain("Bez volání");
    expect(hero).toContain("Vlastní booking odkaz");
    expect(hero).toContain("Dnešní provoz");
    expect(hero).toContain("Kadeřnictví / barber");
    expect(hero).toContain("Méně telefonátů");
    expect(hero).toContain("Bez karty na start");
    expect(hero).toContain("Žádná provize z vašich klientů");
    expect(hero).toContain('id="produkt"');
    expect(hero).toContain("temaro-editorial-hero relative overflow-hidden");
    expect(hero).toContain("bg-[#E8DCC7]");
    expect(page).not.toContain("command-surface interactive-demo-shell py-20");
    expect(page).not.toContain("clean-saas-page");
  });

  test("homepage uses a warmer 2026 editorial discovery palette instead of a purple-only hero", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(page).toContain("temaro-editorial-page");
    expect(hero).toContain("temaro-editorial-hero");
    expect(hero).toContain("bg-[#E8DCC7]");
    expect(hero).toContain("bg-[#606C38]");
    expect(hero).toContain("bg-[#C66B3D]");
    expect(hero).toContain("backdrop-blur");
    expect(hero).toContain("Dnešní provoz");
    expect(hero).not.toContain("linear-gradient(135deg,#8b5cf6,#7c3aed_52%,#4c1d95)");
    expect(hero).not.toContain("text-[#facc15]");
  });

  test("homepage uses an edge-to-edge hero with business booking visuals", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(page).toContain("<BusinessDiscoveryHero />");
    expect(hero).toContain('<section');
    expect(hero).toContain('id="produkt"');
    expect(hero).toContain(
      '<div className="mx-auto grid min-h-[760px] w-full max-w-[1280px] items-center gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:px-8 lg:pb-20 lg:pt-32">',
    );
    expect(hero).toContain("business-hero-visual");
    expect(hero).toContain("booking-source-card");
    expect(hero).toContain("business-dashboard-card");
    expect(hero).toContain("client-booking-card");
    expect(page).not.toContain('<section id="produkt" className="command-surface border-y border-white/10 py-20">');
    expect(page).not.toContain("Reálný pohled");
    expect(page).not.toContain("<LiveProductShowcase />");
  });

  test("homepage hero is not constrained to the old centered SaaS shell", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(hero).toContain("max-w-[1280px]");
    expect(hero).toContain("text-5xl font-black");
    expect(hero).toContain("text-[#C66B3D]");
    expect(hero).toContain("rounded-[1.6rem] bg-[#f7eddc]/82 p-2");
    expect(hero).toContain("business-chip");
    expect(hero).toContain("Žádná provize z vašich klientů");
    expect(page).not.toContain("max-w-[1180px] flex-col px-4 py-4");
    expect(page).not.toContain("grid flex-1 items-center gap-10 pb-10 pt-28");
    expect(page).not.toContain("py-16 lg:py-24");
    expect(page).not.toContain("max-w-3xl text-center");
    expect(page).not.toContain("min-h-[78vh]");
    expect(page).not.toContain("lg:min-h-[76vh]");
  });

  test("homepage has one editorial statement and keeps the serif accent rare", () => {
    const page = readProjectFile("app/page.tsx");
    const serifAccentCount = (page.match(/font-serif-accent/g) ?? []).length;

    expect(page).toContain("Neprodáváme formulář. Prodáváme");
    expect(page).toContain("klidný provoz");
    expect(page).toContain("Vlastní rezervační odkaz, váš kalendář, vaši klienti.");
    expect(serifAccentCount).toBe(1);
  });

  test("homepage uses progressive motion components without inline product showcase", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain('import { Reveal } from "@/components/motion/reveal"');
    expect(page).toContain('import { BusinessDiscoveryHero } from "@/components/marketing/business-discovery-hero"');
    expect(page).toContain("<BusinessDiscoveryHero />");
    expect(page).toContain("<Reveal");
    expect(page).toContain("delay={");
    expect(page).not.toContain('import { LiveProductShowcase } from "@/components/marketing/live-product-showcase"');
    expect(page).not.toContain("function ProductShowcase()");
    expect(page).not.toContain("<ProductShowcase />");
  });

  test("motion primitives preserve SSR content and respect reduced motion", () => {
    const reveal = readProjectFile("components/motion/reveal.tsx");
    const countUp = readProjectFile("components/motion/count-up.tsx");
    const reducedMotion = readProjectFile("hooks/use-prefers-reduced-motion.ts");
    const inView = readProjectFile("hooks/use-in-view.ts");

    expect(reducedMotion).toContain('window.matchMedia("(prefers-reduced-motion: reduce)")');
    expect(inView).toContain("IntersectionObserver");
    expect(inView).toContain("setInView(true)");
    expect(reveal).toContain("usePrefersReducedMotion");
    expect(reveal).toContain("opacity: 1");
    expect(reveal).not.toContain("opacity: active ? 1 : 0");
    expect(countUp).toContain("toLocaleString(\"cs-CZ\"");
    expect(countUp).toContain("node.textContent");
    expect(countUp).toContain("{fmt(to, decimals)}");
  });

  test("live product showcase animates only as progressive enhancement", () => {
    const showcase = readProjectFile("components/marketing/live-product-showcase.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(showcase).toContain('"use client"');
    expect(showcase).toContain("BOOKING_POOL");
    expect(showcase).toContain("PHONE_TIMES");
    expect(showcase).toContain("usePrefersReducedMotion");
    expect(showcase).toContain("if (reduce) return");
    expect(showcase).toContain("booking-row-in");
    expect(showcase).toContain("confirm-toast-in");
    expect(showcase).toContain("data-motion-booking-row");
    expect(showcase).toContain("data-motion-phone-time");
    expect(showcase).toContain("Rezervace potvrzena");
    expect(showcase).toContain("<CountUp to={12}");
    expect(showcase).toContain("<CountUp to={76} suffix=\" %\"");
    expect(showcase).toContain("<CountUp to={4.9} decimals={1}");
    expect(showcase).toContain("<CountUp to={128}");
    expect(globals).toContain(".booking-row-in");
    expect(globals).toContain("@keyframes booking-row-in");
    expect(globals).toContain(".confirm-toast-in");
    expect(globals).toContain("@keyframes confirm-toast-in");
  });

  test("public navigation uses product, solution and resource dropdowns", () => {
    const page = readProjectFile("app/page.tsx");
    const navigation = readProjectFile("components/marketing/landing-navigation.tsx");

    expect(page).toContain("<MarketingHeader />");
    expect(navigation).toContain('"use client"');
    expect(navigation).toContain("openGroup");
    expect(navigation).toContain("setOpenGroup(isOpen ? null : group.label)");
    expect(navigation).toContain("setOpenGroup(null)");
    expect(navigation).toContain("Produkt");
    expect(navigation).toContain("Řešení");
    expect(navigation).toContain("Návody");
    expect(navigation).toContain("Jak to funguje");
    expect(navigation).toContain("Booking kanály");
    expect(navigation).toContain("Barber shopy");
    expect(navigation).toContain("Pro zákazníky");
    expect(page).toContain("/ukazka");
    expect(navigation).not.toContain("<details");
  });

  test("business marketing pages keep the same landing navigation", () => {
    const sharedHeader = readProjectFile("components/marketing/marketing-header.tsx");
    const businessPages = [
      "app/page.tsx",
      "components/marketing/industry-landing-page.tsx",
      "app/jak-snizit-no-show/page.tsx",
      "app/sms-pripominky-rezervaci/page.tsx",
      "app/rezervacni-system-bez-marketplace-provizi/page.tsx",
      "app/ukazka/page.tsx",
    ];

    expect(sharedHeader).toContain("<LandingNavigation />");
    expect(sharedHeader).toContain("<MobileMarketingMenu />");
    expect(sharedHeader).toContain("fixed left-4 right-4 top-3");
    expect(sharedHeader).toContain("min-h-16");
    expect(sharedHeader).toContain("max-w-[1280px]");
    expect(sharedHeader).toContain('className="hidden sm:block"');
    expect(sharedHeader).toContain("px-3 text-sm");
    expect(sharedHeader).toContain("Přihlášení");
    expect(sharedHeader).toContain("Začít zdarma");

    for (const filePath of businessPages) {
      const source = readProjectFile(filePath);

      expect(source).toContain("MarketingHeader");
      expect(source).not.toContain("<LandingNavigation />");
      expect(source).not.toContain('aria-label="Hlavní navigace"');
    }

    const customerDirectory = readProjectFile("app/podniky/page.tsx");

    expect(customerDirectory).not.toContain("MarketingHeader");
    expect(customerDirectory).toContain("Pro podniky");
    expect(customerDirectory).toContain("Pro zákazníky");
  });

  test("mobile marketing navigation uses a compact hamburger menu", () => {
    const sharedHeader = readProjectFile("components/marketing/marketing-header.tsx");
    const desktopNavigation = readProjectFile("components/marketing/landing-navigation.tsx");
    const mobileMenu = readProjectFile("components/marketing/mobile-marketing-menu.tsx");

    expect(sharedHeader).toContain("<MobileMarketingMenu />");
    expect(desktopNavigation).toContain("hidden lg:flex");
    expect(mobileMenu).toContain("lg:hidden");
    expect(mobileMenu).toContain('"use client"');
    expect(mobileMenu).toContain("Menu");
    expect(mobileMenu).toContain("Otevřít menu");
    expect(mobileMenu).toContain("navGroups");
    expect(desktopNavigation).toContain("Produkt");
    expect(desktopNavigation).toContain("Řešení");
    expect(desktopNavigation).toContain("Návody");
    expect(mobileMenu).not.toContain("<details");
  });

  test("homepage explains setup flow and booking channels", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("workflowSteps");
    expect(page).toContain("Nastavíte služby a tým");
    expect(page).toContain("Sdílíte rezervační odkaz");
    expect(page).toContain("Klient si vybere termín");
    expect(page).toContain("Provoz má přehled");
    expect(page).toContain("bookingChannels");
    expect(page).toContain("Vlastní web");
    expect(page).toContain("Instagram bio");
    expect(page).toContain("Google profil");
    expect(page).toContain("QR v provozovně");
  });

  test("homepage adds a product demo CTA with concrete demo moments", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("demoMoments");
    expect(page).toContain("Produktová ukázka");
    expect(page).toContain("Spustit produktovou ukázku");
    expect(page).toContain("Přehled provozu");
    expect(page).toContain("Týmový kalendář");
    expect(page).toContain("Rezervační stránka");
    expect(page).toContain('id="produktove-demo"');
  });

  test("customer directory uses address search without raw coordinates", () => {
    const directory = readProjectFile("app/podniky/page.tsx");

    expect(directory).toContain("Kde");
    expect(directory).toContain("Město, adresa nebo čtvrť");
    expect(directory).toContain("Pro zákazníky");
    expect(directory).toContain("ThemeToggle");
    expect(directory).not.toContain("zeměpisná šířka");
    expect(directory).not.toContain("zeměpisná délka");
    expect(directory).not.toContain('name="lat"');
    expect(directory).not.toContain('name="lng"');
    expect(directory).not.toContain('name="radius"');
  });

  test("interactive demo page is present", () => {
    const demoPage = readProjectFile("app/ukazka/page.tsx");

    expect(demoPage).toContain("Interaktivní ukázka Temara");
    expect(demoPage).toContain("InteractiveProductDemo");
    expect(demoPage).toContain("demoFlow");
    expect(demoPage).toContain("Krátký průchod místo dlouhé prezentace.");
    expect(demoPage).toContain("Vidět klientskou rezervaci");
    expect(demoPage).toContain("Začít zdarma");
  });

  test("demo booking page keeps visitors connected to Temaro", () => {
    const bookingPage = readProjectFile("app/(booking)/[slug]/page.tsx");

    expect(bookingPage).toContain("Zpět na web");
    expect(bookingPage).toContain("ThemeToggle");
    expect(bookingPage).toContain("/ukazka");
    expect(bookingPage).toContain("/register");
  });

  test("auth entry points expose a way back and theme controls", () => {
    const loginPage = readProjectFile("app/(auth)/login/page.tsx");
    const registerPage = readProjectFile("app/(auth)/register/page.tsx");
    const customerLoginPage = readProjectFile("app/account/login/page.tsx");

    for (const page of [loginPage, registerPage, customerLoginPage]) {
      expect(page).toContain("ThemeToggle");
      expect(page).toContain("Zpět na web");
    }
  });
});
