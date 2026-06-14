import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

const forbiddenOldLandingSignatures = [
  "dispatch-day-rail",
  "mobile-day-rail",
  "dispatch-proof-strip",
  'id="trust-bar"',
  "hero-before-after-stage",
  "Den před Temarem",
  "Den s Temarem",
  "operating-table-stage",
  "Provozní stůl dne",
  "photo-led-hero",
  "salon-phone-card",
  "/marketing/salon-day-hero.webp",
  "/marketing/salon-day-barber.webp",
  "/marketing/salon-day-beauty.webp",
  "/marketing/salon-day-fitness.webp",
] as const;

describe("landing polish guard", () => {
  test("homepage declares the Temaro redesign 2026 visual system", () => {
    const layout = readProjectFile("app/layout.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(layout).toContain("Bricolage_Grotesque");
    expect(layout).toContain("Instrument_Sans");
    expect(layout).toContain("IBM_Plex_Mono");
    expect(layout).toContain("--font-bricolage");
    expect(layout).toContain("--font-instrument");
    expect(layout).toContain("--font-plex-mono");
    expect(globals).toContain("--porcelain: #F6F4EF");
    expect(globals).toContain("--cobalt: #2B3FF2");
    expect(globals).toContain("--apricot: #FFB98A");
    expect(globals).toContain("--mint: #BFEAD4");
    expect(globals).toContain(".font-display");
    expect(globals).toContain(".font-time");
    expect(globals).toContain(".temaro-focus-ring");
  });

  test("homepage uses the Fresha-like premium salon platform architecture", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("temaro-time-page");
    expect(page).toContain("<MarketingHeader />");
    expect(page).toContain("<BusinessDiscoveryHero />");
    expect(page).toContain("MobileStickyCta");
    expect(page).toContain("heroProofItems");
    expect(page).toContain("temaro-hero-proof-band");
    expect(page).toContain("temaro-hero-proof-card");
    expect(page).toContain("Bez marketplace provize");
    expect(page).toContain("Kanály v jednom kalendáři");
    expect(page).toContain("Zálohy a SMS");
    expect(page).toContain("Klikatelná ukázka");
    expect(page).toContain("industryCards");
    expect(page).toContain("featuredIndustry");
    expect(page).toContain("secondaryIndustries");
    expect(page).toContain("compactIndustries");
    expect(page).toContain("next/image");
    expect(page).toContain("temaro-industry-showcase");
    expect(page).toContain("temaro-industry-pill-strip");
    expect(page).toContain("temaro-industry-photo-card");
    expect(page).toContain("temaro-industry-feature-card");
    expect(page).toContain("temaro-industry-overlay");
    expect(page).toContain("Dnešní plán");
    expect(page).toContain("Google rezervace");
    expect(page).toContain("/marketing/industries/barber.webp");
    expect(page).toContain("/marketing/industries/hair-salon.webp");
    expect(page).toContain("/marketing/industries/beauty.webp");
    expect(page).toContain("/marketing/industries/massage.webp");
    expect(page).toContain("/marketing/industries/wellness.webp");
    expect(page).toContain("/marketing/industries/fitness.webp");
    expect(page).toContain("productProofScenes");
    expect(page).toContain("temaro-operations-strip");
    expect(page).toContain("temaro-operations-board");
    expect(page).toContain("temaro-proof-module");
    expect(page).toContain("Vše, co salon řeší každý den");
    expect(page).toContain("provozní signál");
    expect(page).toContain("Méně textu. Více jasných akcí");
    expect(page).not.toContain("/marketing/product/temaro-product-app-screen.jpg");
    expect(page).not.toContain("/marketing/product/temaro-client-booking-mobile.jpg");
    expect(page).not.toContain("/marketing/product/temaro-business-discovery.jpg");
    expect(page).toContain("pricingPlans");
    expect(page).toContain("marketplaceRows");
    expect(page).toContain("workflowSteps");
    expect(page).toContain('id="pro-koho"');
    expect(page).toContain('id="produktovy-dukaz"');
    expect(page).toContain('id="cenik"');
    expect(page).toContain('id="bez-marketplace"');
    expect(page).toContain('id="jak-to-funguje"');
    expect(page).toContain('id="bezpecnost"');
    expect(page).not.toContain("bentoCards");
    expect(page).not.toContain("trustBarItems");
    expect(page).not.toContain('id="scenare"');
    expect(page).not.toContain("Salona ukazuje");
  });

  test("homepage hero follows the Fresha-like premium salon platform direction", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(hero).toContain('"use client"');
    expect(hero).toContain("calendarEvents");
    expect(hero).toContain("sourceChannels");
    expect(hero).toContain("productNavItems");
    expect(hero).toContain("temaro-time-atelier-hero");
    expect(hero).toContain("temaro-premium-hero");
    expect(hero).toContain("temaro-premium-copy");
    expect(hero).toContain("temaro-premium-stage");
    expect(hero).toContain("temaro-hero-product-visual");
    expect(hero).toContain("temaro-premium-product");
    expect(hero).toContain("temaro-product-desktop");
    expect(hero).toContain("temaro-product-calendar");
    expect(hero).toContain("temaro-product-grid");
    expect(hero).toContain("temaro-calendar-event");
    expect(hero).toContain("temaro-booking-detail-card");
    expect(hero).toContain("temaro-product-side-nav");
    expect(hero).toContain("temaro-product-action-icons");
    expect(hero).toContain("temaro-booking-client");
    expect(hero).toContain("temaro-product-phone");
    expect(hero).toContain("temaro-premium-highlight");
    expect(hero).not.toContain("next/image");
    expect(hero).not.toContain("/marketing/premium/salon-hero-wide.webp");
    expect(hero).not.toContain("/marketing/premium/beauty-room.webp");
    expect(hero).not.toContain("/marketing/premium/barber-chair.webp");
    expect(hero).not.toContain("/marketing/premium/salon-detail.webp");
    expect(hero).not.toContain("/marketing/product/temaro-product-app-screen.jpg");
    expect(hero).not.toContain("/marketing/product/temaro-client-booking-mobile.jpg");
    expect(hero).not.toContain("/marketing/product/temaro-business-discovery.jpg");
    expect(hero).not.toContain("booking-phone-preview");
    expect(hero).toContain("Rezervace");
    expect(hero).toContain("pro salony");
    expect(hero).toContain("Kalendář, klienti a platby bez volání");
    expect(hero).toContain("Registrovat salon");
    expect(hero).toContain("Vidět ukázku");
    expect(hero).toContain("Dnes v salonu");
    expect(hero).toContain("Nová rezervace");
    expect(hero).toContain("16:00 z Instagramu");
    expect(hero).toContain("Lucie čeká na potvrzení");
    expect(hero).toContain("SMS připomínka připravena");
    expect(hero).toContain("300 Kč záloha");
    expect(hero).not.toContain("freshaPremiumStats");
    expect(hero).not.toContain("premiumProductColumns");
    expect(hero).not.toContain("salonImageTiles");
    expect(hero).not.toContain("Sharp Cut Studio");
    expect(hero).not.toContain("Luna Beauty");
    expect(hero).not.toContain("Studio Vlna");
    expect(hero).not.toContain("Tiché Studio");
    expect(hero).not.toContain("SalonCommandWall");
    expect(hero).not.toContain("temaro-salon-wall");
    expect(hero).not.toContain("temaro-proof-flow");
    expect(hero).not.toContain("temaro-stat-card");
    expect(hero).not.toContain("Klienti rezervují. Kalendář drží den");
    expect(hero).not.toContain("salon-operating-hero");
    expect(hero).not.toContain("salon-command-frame");
    expect(hero).not.toContain("product-window-hero");
    expect(hero).not.toContain("product-window-frame");
    expect(hero).not.toContain("Rezervace, které vidíte hned v kalendáři");
  });

  test("hero control room shows product truth without fabricated testimonials or logos", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(hero).toContain("Web podniku");
    expect(hero).toContain("Dnes v salonu");
    expect(hero).toContain("16:00 z Instagramu");
    expect(hero).toContain("Lucie čeká na potvrzení");
    expect(hero).toContain("SMS připomínka připravena");
    expect(hero).toContain("300 Kč záloha");
    expect(hero).toContain("Instagram");
    expect(hero).toContain("Google");
    expect(hero).toContain("QrCode");
    expect(hero).toContain("CalendarDays");
    expect(hero).toContain("temaro-product-phone");
    expect(hero).not.toContain("usePrefersReducedMotion");
    expect(hero).not.toContain("window.setInterval");
    expect(hero).not.toContain("reduceMotion");
    expect(hero).not.toContain("overflow-x-auto");
    expect(hero).not.toContain("CalendarSurface");
    expect(hero).not.toContain("BookingSurface");
    expect(hero).not.toContain("ClientsSurface");
    expect(hero).not.toContain("ChannelsSurface");
    expect(hero).not.toContain("testimonial");
    expect(hero).not.toContain("logo zákazníka");
    expect(hero).not.toContain("12 000+");
    expect(hero).not.toContain("99 %");
    expect(hero).not.toContain("faker");
  });

  test("homepage explains industry focus, product proof, pricing and marketplace difference", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("temaro-premium-industries");
    expect(page).toContain("Jeden kalendář pro provozy, které prodávají");
    expect(page).toContain('text-[var(--cobalt)]">čas.');
    expect(page).not.toContain("Jeden systém, různé tempo provozu");
    expect(page).toContain("Barber");
    expect(page).toContain("Kadeřnictví");
    expect(page).toContain("Beauty");
    expect(page).toContain("Masáže");
    expect(page).toContain("Wellness");
    expect(page).toContain("Fitness");
    expect(page).toContain("Vše, co salon řeší každý den");
    expect(page).toContain("Čas, stav, klientský kontext a kanál rezervace");
    expect(page).toContain("provozní signál");
    expect(page).toContain("Kalendář");
    expect(page).toContain("Rezervační stránka");
    expect(page).toContain("Klientská paměť");
    expect(page).toContain("Cena má být čitelná dřív než smlouva");
    expect(page).toContain("Pilot");
    expect(page).toContain("Solo");
    expect(page).toContain("Tým");
    expect(page).toContain("Váš klient nemá být daň za cizí aplikaci");
    expect(page).toContain("Bez provize z vlastního webu, QR nebo Instagramu");
  });

  test("homepage follows DESIGN.md 5/5 product-object rhythm", () => {
    const design = readProjectFile("DESIGN.md");
    const page = readProjectFile("app/page.tsx");
    const globals = readProjectFile("app/globals.css");
    const combined = `${page}\n${globals}`;

    expect(design).toContain("Fresha-like Premium Salon Platform");
    expect(design).toContain("No decorative grid background is visible");
    expect(page).toContain("serviceCommandMoments");
    expect(page).toContain("temaro-command-band");
    expect(page).toContain("temaro-market-story");
    expect(page).toContain("temaro-market-device-stage");
    expect(page).toContain("temaro-market-phone");
    expect(page).toContain("temaro-market-word");
    expect(page).toContain("temaro-market-channel-flow");
    expect(page).toContain("temaro-market-booking-card");
    expect(page).toContain("Vlastní rezervace · bez marketplace");
    expect(page).toContain("Vlastní");
    expect(page).toContain("rezervační cesta");
    expect(page).toContain("temaro-visual-moment");
    expect(page).toContain("temaro-channel-strip");
    expect(page).toContain("temaro-risk-stack");
    expect(page).toContain("temaro-flow-panel");
    expect(page).toContain("Kanály rezervací");
    expect(page).toContain("No-show ochrana");
    expect(page).toContain("Web, Instagram, Google, QR");
    expect(page).toContain("SMS připomínka připravena");
    expect(page).toContain("Záloha 300 Kč");
    expect(page).toContain("Klientská paměť");
    expect(page).toContain("web");
    expect(page).toContain("Instagram");
    expect(page).toContain("QR");
    expect(page).toContain("Google");
    expect(globals).toContain(".temaro-command-band");
    expect(globals).toContain(".temaro-market-story");
    expect(globals).toContain(".temaro-market-phone");
    expect(globals).toContain(".temaro-market-word");
    expect(globals).toContain(".temaro-market-channel-flow");
    expect(globals).toContain(".temaro-market-booking-card");
    expect(globals).toContain("@keyframes temaro-market-pin");
    expect(globals).toContain(".temaro-visual-moment");
    expect(globals).toContain(".temaro-channel-strip");
    expect(globals).toContain(".temaro-risk-stack");
    expect(globals).toContain(".temaro-flow-panel");
    expect(combined).not.toContain("background-image: linear-gradient(var(--paper-line)");
  });

  test("homepage keeps pricing honest without fake final tariffs", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain('price: "0 Kč"');
    expect(page).toContain("Cena bude upřesněna po pilotu");
    expect(page).toContain("Finální tarify se zamknou po pilotu");
    expect(page).toContain("žádná provize z vlastních klientů");
    expect(page).not.toContain("299 Kč");
    expect(page).not.toContain("599 Kč");
    expect(page).not.toContain("247 Kč / měsíc");
    expect(page).not.toContain("Neomezené rezervace zdarma");
  });

  test("homepage avoids internal product and marketing terms", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const combined = `${page}\n${hero}`;
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
      expect(combined).not.toContain(term);
    }
  });

  test("homepage avoids lifestyle image proof and old landing signatures", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const globals = readProjectFile("app/globals.css");
    const combined = `${page}\n${hero}\n${globals}`;

    expect(page).not.toContain("salonSceneImages");
    expect(hero).not.toContain("salonServiceTabs");
    expect(combined).not.toContain("/marketing/time-engine-salon.webp");
    expect(combined).not.toContain("/marketing/barber-studio-ai.webp");
    expect(combined).not.toContain("/marketing/salon-interior-ai.webp");
    expect(combined).not.toContain("/marketing/training-studio-ai.webp");

    for (const signature of forbiddenOldLandingSignatures) {
      expect(combined).not.toContain(signature);
    }
  });

  test("new control room visual classes are declared and old active classes are gone", () => {
    const globals = readProjectFile("app/globals.css");

    expect(globals).toContain(".temaro-time-atelier-hero");
    expect(globals).toContain(".temaro-premium-hero");
    expect(globals).toContain(".temaro-premium-copy");
    expect(globals).toContain(".temaro-premium-stage");
    expect(globals).toContain(".temaro-premium-product");
    expect(globals).toContain(".temaro-hero-product-visual");
    expect(globals).toContain(".temaro-product-desktop");
    expect(globals).toContain(".temaro-product-side-nav");
    expect(globals).toContain(".temaro-product-action-icons");
    expect(globals).toContain(".temaro-booking-client");
    expect(globals).toContain(".temaro-product-calendar");
    expect(globals).toContain(".temaro-calendar-event");
    expect(globals).toContain(".temaro-booking-detail-card");
    expect(globals).toContain(".temaro-product-phone");
    expect(globals).toContain(".temaro-hero-proof-band");
    expect(globals).toContain(".temaro-hero-proof-card");
    expect(globals).toContain(".temaro-premium-industries");
    expect(globals).toContain(".temaro-industry-showcase");
    expect(globals).toContain(".temaro-industry-kicker-row");
    expect(globals).toContain(".temaro-industry-pill-strip");
    expect(globals).toContain(".temaro-industry-photo-card");
    expect(globals).toContain(".temaro-industry-feature-card");
    expect(globals).toContain(".temaro-industry-mini-card");
    expect(globals).toContain(".temaro-industry-overlay");
    expect(globals).toContain(".temaro-industry-compact-card");
    expect(globals).toContain(".temaro-product-desktop::before");
    expect(globals).toContain(".temaro-product-phone::before");
    expect(globals).toContain("border: 0.62rem solid color-mix(in srgb, var(--ink) 88%, var(--cobalt))");
    expect(globals).toContain("overflow: hidden");
    expect(globals).toContain("font-family: var(--font-body-stack)");
    expect(globals).toContain("linear-gradient(180deg, #ffffff 0%, #fbfcf9 52%, #f3f7ef 100%)");
    expect(globals).toContain("aspect-ratio: 9 / 16");
    expect(globals).toContain("min-height: 34rem");
    expect(globals).toContain("bottom: 1.15rem");
    expect(globals).toContain("right: 4.2rem");
    expect(globals).toContain("width: min(19rem, 24vw)");
    expect(globals).toContain("width: min(17.4rem, calc(100% - 6.4rem))");
    expect(globals).not.toContain(".temaro-product-phone .temaro-phone-event:nth-of-type(1)");
    expect(globals).not.toContain(".temaro-premium-product-column");
    expect(globals).not.toContain(".temaro-salon-image-strip");
    expect(globals).not.toContain(".temaro-salon-image-tile");
    expect(globals).not.toContain(".temaro-premium-flow-card");
    expect(globals).not.toContain(".temaro-salon-wall");
    expect(globals).not.toContain(".temaro-booking-stack");
    expect(globals).not.toContain(".temaro-proof-flow");
    expect(globals).not.toContain(".temaro-stat-card");
    expect(globals).toContain(".temaro-operations-strip");
    expect(globals).toContain(".temaro-operations-board");
    expect(globals).toContain(".temaro-proof-module");
    expect(globals).toContain(".industry-switcher");
    expect(globals).toContain(".marketplace-compare-panel");
    expect(globals).toContain("@media (prefers-reduced-motion: reduce)");
    expect(globals).toContain(".temaro-time-page");
    expect(globals).toContain("color-scheme: light");
    expect(globals).toContain("padding-bottom: calc(env(safe-area-inset-bottom) + 6.5rem)");
    expect(globals).not.toContain(".salon-operating-hero");
    expect(globals).not.toContain(".salon-command-frame");
    expect(globals).not.toContain(".product-window-hero");
    expect(globals).not.toContain(".product-window-frame");
    expect(globals).not.toContain(".temaro-hero-flow");
    expect(globals).not.toContain(".temaro-arrival-card");
    expect(globals).not.toContain(".temaro-orbit-card");
    expect(globals).not.toContain(".temaro-live-thread");
    expect(globals).not.toContain("temaro-thread-scan");
    expect(globals).not.toContain("temaro-arrival-pop");
    expect(globals).not.toContain("temaro-orbit-float");
    expect(globals).not.toContain(".temaro-cinema-frame");
    expect(globals).not.toContain(".temaro-screenshot-strip");
  });

  test("marketing light-only setup stays intact", () => {
    const header = readProjectFile("components/marketing/marketing-header.tsx");
    const globals = readProjectFile("app/globals.css");
    const page = readProjectFile("app/page.tsx");

    expect(header).not.toContain("ThemeToggle");
    expect(page).toContain("temaro-time-page");
    expect(globals).toContain("--background: var(--porcelain)");
    expect(globals).toContain("--foreground: var(--ink)");
    expect(globals).toContain("--card: var(--surface-card)");
    expect(globals).toContain("--primary: var(--cobalt)");
    expect(globals).toContain("color-scheme: light");
  });

  test("mobile CTA, menu and header match the salon direction", () => {
    const header = readProjectFile("components/marketing/marketing-header.tsx");
    const menu = readProjectFile("components/marketing/mobile-marketing-menu.tsx");
    const stickyCta = readProjectFile("components/marketing/mobile-sticky-cta.tsx");

    expect(header).toContain("marketing-fixed-header");
    expect(header).toContain("top-[max(0.75rem,env(safe-area-inset-top))]");
    expect(header).toContain("Registrovat salon");
    expect(stickyCta).toContain("0 Kč · bez karty");
    expect(stickyCta).toContain("Registrovat salon");
    expect(stickyCta).toContain("pb-[calc(env(safe-area-inset-bottom)+0.625rem)]");
    expect(menu).toContain("max-h-[calc(100dvh-6rem)]");
    expect(menu).toContain("overflow-y-auto");
    expect(menu).toContain("keydown");
    expect(menu).toContain("Escape");
    expect(menu).toContain("bg-[var(--ink)]/42");
    expect(menu).not.toContain("<details");
  });

  test("public navigation exposes product, industry, pricing and anti-marketplace paths", () => {
    const navigation = readProjectFile("components/marketing/landing-navigation.tsx");

    expect(navigation).toContain('"use client"');
    expect(navigation).toContain("openGroup");
    expect(navigation).toContain("Produkt");
    expect(navigation).toContain("Pro koho");
    expect(navigation).toContain("Návody");
    expect(navigation).toContain("Ceník");
    expect(navigation).toContain("Bez marketplace");
    expect(navigation).toContain("Bezpečnost");
    expect(navigation).toContain("Produktový pohled");
    expect(navigation).toContain("Produktový důkaz");
    expect(navigation).toContain("/rezervacni-system-pro-barbery");
    expect(navigation).toContain("/rezervacni-system-pro-kadernictvi");
    expect(navigation).toContain("/rezervacni-system-pro-kosmeticky-salon");
    expect(navigation).toContain("/rezervacni-system-pro-masaze");
    expect(navigation).not.toContain("<details");
  });

  test("business marketing pages keep the same shared header", () => {
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
    expect(sharedHeader).toContain("marketing-fixed-header");
    expect(sharedHeader).not.toContain("ThemeToggle");
    expect(sharedHeader).toContain("Přihlášení");
    expect(sharedHeader).toContain("Registrovat salon");

    for (const filePath of businessPages) {
      const source = readProjectFile(filePath);

      expect(source).toContain("MarketingHeader");
      expect(source).not.toContain("<LandingNavigation />");
      expect(source).not.toContain('aria-label="Hlavní navigace"');
    }
  });

  test("demo page uses the internal CRM calendar product tour", () => {
    const demoPage = readProjectFile("app/ukazka/page.tsx");
    const demo = readProjectFile("components/marketing/interactive-product-demo.tsx");
    const globals = readProjectFile("app/globals.css");
    const combined = `${demoPage}\n${demo}\n${globals}`;

    expect(demoPage).toContain("temaro-time-page");
    expect(demoPage).toContain("Klikatelná ukázka CRM Temaro");
    expect(demoPage).toContain("interního CRM");
    expect(demoPage).not.toContain("signal-hero");
    expect(demo).toContain("crmDemoViews");
    expect(demo).toContain("crm-demo-shell");
    expect(demo).toContain("crm-sidebar");
    expect(demo).toContain("crm-calendar-grid");
    expect(demo).toContain("crm-booking-detail");
    expect(demo).toContain("Přehled provozu");
    expect(demo).toContain("Kalendář");
    expect(demo).toContain("Detail rezervace");
    expect(demo).toContain("Klienti");
    expect(demo).toContain("Rezervační stránka");
    expect(demo).toContain("usePrefersReducedMotion");
    expect(demo).not.toContain("command-surface");
    expect(demo).not.toContain("time-demo-stage");
    expect(demo).not.toContain("Zákaznický pohled");
    expect(combined).toContain("@media (prefers-reduced-motion: reduce)");
  });

  test("homepage preserves custom-domain fallback without touching tenant inputs", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("getCustomDomainTenantSlug");
    expect(page).toContain("normalizeRequestHost");
    expect(page).toContain("isLikelyPlatformHost");
    expect(page).toContain("createAdminClient()");
    expect(page).toContain(".eq(\"custom_domain\", host)");
    expect(page).toContain(".eq(\"custom_domain_status\", \"active\")");
    expect(page).toContain("PublicSlugBookingPage");
    expect(page).not.toContain("params.tenantId");
    expect(page).not.toContain("body.tenantId");
    expect(page).not.toContain("searchParams.tenantId");
  });

  test("interactive demo page is present", () => {
    const demoPage = readProjectFile("app/ukazka/page.tsx");

    expect(demoPage).toContain("Klikatelná ukázka CRM Temaro");
    expect(demoPage).toContain("InteractiveProductDemo");
    expect(demoPage).toContain("temaro-time-page");
    expect(demoPage).toContain("Klikatelná ukázka interního CRM");
    expect(demoPage).toContain("Tohle je produkt, který má být vidět.");
    expect(demoPage).toContain("Jeden CRM průchod, pět obrazovek.");
    expect(demoPage).toContain("Vidět klientskou rezervaci");
    expect(demoPage).toContain("Registrovat salon");
    expect(demoPage).not.toContain("signal-hero");
  });

  test("interactive product demo keeps customer-facing labels", () => {
    const demo = readProjectFile("components/marketing/interactive-product-demo.tsx");

    expect(demo).toContain("crmDemoViews");
    expect(demo).toContain("crm-demo-shell");
    expect(demo).toContain("crm-calendar-grid");
    expect(demo).toContain("crm-booking-detail");
    expect(demo).toContain("crm-sidebar");
    expect(demo).toContain("Přehled provozu");
    expect(demo).toContain("Dnešní rezervace");
    expect(demo).toContain("Tržba dnes");
    expect(demo).toContain("Volná okna");
    expect(demo).toContain("Riziko");
    expect(demo).toContain("Otevřít kalendář");
    expect(demo).toContain("Kalendář");
    expect(demo).toContain("Den × čas");
    expect(demo).toContain("Týden × čas");
    expect(demo).toContain("Detail rezervace");
    expect(demo).toContain("Klienti");
    expect(demo).toContain("Rezervační stránka");
    expect(demo).toContain("Zdroj: online");
    expect(demo).toContain("Vybraný termín");
    expect(demo).toContain("selectView");
    expect(demo).toContain("setHasInteracted(true)");
    expect(demo).toContain("usePrefersReducedMotion");
    expect(demo).toContain("Další obrazovka");
    expect(demo).not.toContain("quickLinks");
    expect(demo).not.toContain("command-surface");
    expect(demo).not.toContain("time-demo-stage");
    expect(demo).not.toContain("Zákaznický pohled");
    expect(demo).not.toContain("overflow-y-auto");
    expect(demo).not.toContain("Temaro MVP");
    expect(demo).not.toContain("tenant izolace");
    expect(demo).not.toContain("/dashboard");
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
    expect(reveal).toContain('willChange: active && !reduce ? "transform" : "auto"');
    expect(reveal).not.toContain("opacity: active ? 1 : 0");
    expect(reveal).not.toContain('willChange: "opacity, transform"');
    expect(countUp).toContain("toLocaleString(\"cs-CZ\"");
    expect(countUp).toContain("node.textContent");
    expect(countUp).toContain("{fmt(to, decimals)}");
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
