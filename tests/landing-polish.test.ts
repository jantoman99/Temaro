import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("landing polish guard", () => {
  test("homepage consolidates scenario copy into engine proof images", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("/marketing/time-engine-salon.webp");
    expect(page).toContain("/marketing/time-engine-beauty.webp");
    expect(page).toContain("/marketing/time-engine-fitness.webp");
    expect(page).toContain("Rychlé přeobjednání");
    expect(page).toContain("Klientská historie");
    expect(page).toContain("Jeden rezervační odkaz");
    expect(page).toContain("quality={70}");
    expect(page).not.toContain("scenarioCards");
    expect(page).not.toContain('id="scenare"');
    expect(page).not.toContain("/marketing/barber-studio-ai.webp");
    expect(page).not.toContain("/marketing/salon-interior-ai.webp");
    expect(page).not.toContain("/marketing/training-studio-ai.webp");
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

  test("homepage follows the time-as-material section architecture", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("temaro-time-page");
    expect(page).toContain("<BusinessDiscoveryHero />");
    expect(page).toContain("trustBarItems");
    expect(page).toContain("bentoCards");
    expect(page).toContain("finalCta");
    expect(page).toContain('id="jak-to-funguje"');
    expect(page).toContain('id="bento"');
    expect(page).toContain('id="produktove-demo"');
    expect(page).toContain('id="cenik"');
    expect(page).toContain('id="bezpecnost"');
    expect(page).not.toContain('id="trust-bar"');
    expect(page).not.toContain("scenarioCards");
    expect(page).not.toContain('id="scenare"');
    expect(page).not.toContain('id="pro-koho"');
    expect(page).not.toContain("audienceSegments");
    expect(page).not.toContain("Praktické návody");
  });

  test("homepage hero implements an interactive live timeline widget", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(hero).toContain('"use client"');
    expect(hero).toContain("industryOptions");
    expect(hero).toContain("timeSlots");
    expect(hero).toContain("reservations");
    expect(hero).toContain("selectedSlot");
    expect(hero).toContain("setReservations");
    expect(hero).toContain("usePrefersReducedMotion");
    expect(hero).toContain('aria-live="off"');
    expect(hero).toContain("temaro-time-hero");
    expect(hero).toContain("temaro-day-grid");
    expect(hero).toContain("time-chip");
    expect(hero).toContain("Rezervovat");
    expect(hero).toContain("Kadeřnictví");
    expect(hero).toContain("Barber");
    expect(hero).toContain("Kosmetika");
    expect(hero).toContain("Trenér");
    expect(hero).not.toContain("bookingSources");
    expect(hero).not.toContain("business-hero-visual");
  });

  test("update 2 keeps marketing light-only and removes marketing theme toggle", () => {
    const header = readProjectFile("components/marketing/marketing-header.tsx");
    const globals = readProjectFile("app/globals.css");
    const page = readProjectFile("app/page.tsx");

    expect(header).not.toContain("ThemeToggle");
    expect(header).not.toContain('tone="editorial"');
    expect(page).toContain("temaro-time-page");
    expect(globals).toContain(".temaro-time-page");
    expect(globals).toContain("--background: var(--porcelain)");
    expect(globals).toContain("--foreground: var(--ink)");
    expect(globals).toContain("--card: var(--surface-card)");
    expect(globals).toContain("--primary: var(--cobalt)");
    expect(globals).toContain("color-scheme: light");
  });

  test("update 2 calculates hero reservations from real time data without clipping", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(hero).toContain("DAY_START");
    expect(hero).toContain("DAY_END");
    expect(hero).toContain("toPct");
    expect(hero).toContain("durationMin");
    expect(hero).toContain("overlaps");
    expect(hero).toContain("isSlotFree");
    expect(hero).toContain("findFirstFreeSlot");
    expect(hero).toContain("laneForSlot(reservation.time)");
    expect(hero).toContain("Math.min(durationToPct(reservation.durationMin), 100 - toPct(reservation.time))");
    expect(hero).toContain("durationToPct(45)");
    expect(hero).toContain("reserveSelectedSlot");
    expect(hero).toContain("confirmedSlot");
    expect(hero).toContain('aria-disabled={!slotFree}');
    expect(hero).toContain('disabled={!slotFree}');
    expect(hero).toContain("mobileReservations");
    expect(hero).toContain('client === "Nová online rezervace"');
    expect(hero).toContain("nové");
    expect(hero).not.toContain("lane: ");
    expect(hero).not.toContain("width: \"");
    expect(hero).not.toContain("left: \"");
    expect(hero).not.toContain("index * 66");
    expect(hero).not.toContain("h-[330px] overflow-hidden");
  });

  test("update 2 restores strong bento arguments and consolidates booking channels", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("No-show pod kontrolou");
    expect(page).toContain("riziková rezervace");
    expect(page).toContain("Paměť podniku");
    expect(page).toContain("12. 03.");
    expect(page).toContain("Jeden odkaz, všechny kanály");
    expect(page).toContain("Zálohy a platby");
    expect(page).toContain("SMS / e-mail");
    expect(page).toContain("Tým a role");
    expect(page).not.toContain('title: "Vlastní web"');
    expect(page).not.toContain('title: "Instagram bio"');
    expect(page).not.toContain('title: "Google profil"');
    expect(page).not.toContain('title: "QR v provozovně"');
  });

  test("update 2 fixes mobile CTA, menu, marquee and pricing release blockers", () => {
    const page = readProjectFile("app/page.tsx");
    const menu = readProjectFile("components/marketing/mobile-marketing-menu.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(page).toContain("MobileStickyCta");
    expect(page).toContain("skip-link");
    expect(page).toContain("status");
    expect(page).toContain("pripravujeme");
    expect(page).toContain("price: null");
    expect(page).not.toContain("BadgeEuro");
    expect(page).toContain("sr-only");
    expect(page).toContain('aria-hidden="true"');
    expect(menu).toContain("max-h-[calc(100dvh-6rem)]");
    expect(menu).toContain("overflow-y-auto");
    expect(menu).toContain("keydown");
    expect(menu).toContain("Escape");
    expect(menu).toContain("bg-[var(--ink)]/42");
    expect(menu).not.toContain("description");
    expect(globals).toContain("@media (prefers-reduced-motion: reduce)");
    expect(globals).toContain(".trust-marquee:hover");
    expect(globals).toContain(".section-eyebrow::before");
    expect(globals).toContain(".time-chip:hover");
    expect(globals).toContain(".time-chip[data-active=\"true\"]");
  });

  test("photo motion layer turns service imagery into product proof", () => {
    const page = readProjectFile("app/page.tsx");
    const timeEnginePanel = readProjectFile("components/marketing/time-engine-panel.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(page).toContain("visualProofImages");
    expect(page).toContain("/marketing/time-engine-salon.webp");
    expect(page).toContain("/marketing/time-engine-beauty.webp");
    expect(page).toContain("/marketing/time-engine-fitness.webp");
    expect(page).toContain('id="casovy-engine"');
    expect(page).toContain("Chaos se skládá do dne");
    expect(page).toContain("messageCloud");
    expect(page).toContain("engineSlots");
    expect(page).toContain("photo-proof-card");
    expect(page).toContain("AlertTriangle");
    expect(page).toContain("text-[var(--signal-red)]");
    expect(page).toContain("3 volná okna");
    expect(page).toContain("timeProofChips");
    expect(page).toContain("slot se uvolní");
    expect(page).toContain("SMS připomínka");
    expect(page).not.toContain("bg-[var(--signal-red)] text-white");
    expect(page).not.toContain("rgba(229,72,77,0.10)");
    expect(timeEnginePanel).toContain("time-engine-flow");
    expect(timeEnginePanel).toContain("useInView");
    expect(timeEnginePanel).toContain("data-engine-active={active}");
    expect(globals).toContain(".photo-proof-card");
    expect(globals).toContain(".time-engine-flow");
    expect(globals).toContain(".engine-message");
    expect(globals).toContain(".engine-slot");
    expect(globals).toContain("[data-engine-active=\"true\"] .engine-message");
    expect(globals).toContain("animation-iteration-count: 3");
    expect(globals).toContain(".time-engine-flow::after");
    expect(globals).toContain("animation: none");
    expect(globals).toContain("@keyframes engine-message");
    expect(globals).toContain("@keyframes engine-slot");
  });

  test("visual audit fixes mobile clipping, sticky overlap and menu text spacing", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const header = readProjectFile("components/marketing/marketing-header.tsx");
    const menu = readProjectFile("components/marketing/mobile-marketing-menu.tsx");
    const nav = readProjectFile("components/marketing/landing-navigation.tsx");
    const stickyCta = readProjectFile("components/marketing/mobile-sticky-cta.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(hero).toContain("mobile-reservation-list");
    expect(hero).toContain("desktop-reservation-card");
    expect(hero).toContain("sm:block");
    expect(hero).toContain("sm:hidden");
    expect(hero).toContain("min-h-[680px]");
    expect(hero).toContain("sm:min-h-[790px]");
    expect(hero).toContain("sm:h-[330px]");
    expect(hero).not.toContain("sm:h-[360px]");
    expect(hero).not.toContain("sm:h-[392px]");

    expect(header).toContain("top-[max(0.75rem,env(safe-area-inset-top))]");
    expect(header).toContain("marketing-fixed-header");
    expect(menu).toContain("bg-[var(--ink)]/42");
    expect(menu).toContain("backdrop-blur-[2px]");
    expect(menu).toContain("top-[calc(max(0.75rem,env(safe-area-inset-top))+4.75rem)]");
    expect(nav).toContain("group.items.map(([href, label])");
    expect(nav).toContain("text-base font-bold");
    expect(nav).not.toContain("{description}");
    expect(stickyCta).toContain("pb-[calc(env(safe-area-inset-bottom)+0.625rem)]");
    expect(globals).toContain(".temaro-time-page");
    expect(globals).toContain("scroll-padding-top: 7rem");
    expect(globals).toContain("padding-bottom: calc(env(safe-area-inset-bottom) + 6.5rem)");
  });

  test("homepage avoids the previous cream serif editorial direction", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(page).not.toContain("temaro-editorial-page");
    expect(hero).not.toContain("temaro-editorial-hero");
    expect(hero).not.toContain("font-serif-accent");
    expect(hero).not.toContain("bg-[#E8DCC7]");
    expect(hero).not.toContain("bg-[#606C38]");
    expect(hero).not.toContain("bg-[#C66B3D]");
    expect(hero).not.toContain("linear-gradient(135deg,#8b5cf6,#7c3aed_52%,#4c1d95)");
    expect(hero).not.toContain("text-[#facc15]");
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
    expect(reveal).toContain('willChange: active && !reduce ? "transform" : "auto"');
    expect(reveal).not.toContain("opacity: active ? 1 : 0");
    expect(reveal).not.toContain('willChange: "opacity, transform"');
    expect(countUp).toContain("toLocaleString(\"cs-CZ\"");
    expect(countUp).toContain("node.textContent");
    expect(countUp).toContain("{fmt(to, decimals)}");
  });

  test("implementation 3 fixes sticky, image formats and engine overflow constraints", () => {
    const page = readProjectFile("app/page.tsx");
    const nextConfig = readProjectFile("next.config.ts");
    const globals = readProjectFile("app/globals.css");

    expect(page).toContain("[overflow-x:clip]");
    expect(page).not.toContain("business-discovery-page");
    expect(page).not.toContain("min-h-screen overflow-hidden");
    expect(page).toContain('<TimeEnginePanel messageCloud={messageCloud} engineSlots={engineSlots} />');
    expect(page).toContain('href="#jak-to-funguje"');
    expect(page).not.toContain('href="#produkt" className="text-[var(--ink)] hover:underline">Produkt');
    expect(nextConfig).toContain("images");
    expect(nextConfig).toContain('"image/avif"');
    expect(nextConfig).toContain('"image/webp"');
    expect(globals).toContain("@media (max-width: 640px)");
    expect(globals).toContain(".time-engine-flow::after");
    expect(globals).toContain("opacity: 0");
  });

  test("implementation 5 turns the first fold into a before-after day proof", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const globals = readProjectFile("app/globals.css");
    const nextConfig = readProjectFile("next.config.ts");

    expect(hero).toContain("beforeAfterMoments");
    expect(hero).toContain("hero-before-after-stage");
    expect(hero).toContain("chaos-column");
    expect(hero).toContain("calm-column");
    expect(hero).toContain("before-after-connector");
    expect(hero).toContain("mobile-proof-panel");
    expect(hero).toContain("Den před Temarem");
    expect(hero).toContain("Den s Temarem");
    expect(hero).toContain("Z chaosu do čitelného dne");
    expect(hero).toContain("Tři zprávy čekají");
    expect(hero).toContain("Volné okno");
    expect(hero).toContain("Riziko no-show");
    expect(hero).toContain("Potvrzeno online");
    expect(hero).toContain("Rezervace bez volání");

    expect(page).not.toContain("dispatchProofItems");
    expect(page).not.toContain("dispatch-proof-strip");
    expect(page).not.toContain("Časová osa od prvního scrollu");
    expect(page).not.toContain('id="trust-bar"');
    expect(page).toContain("engine-rail-section");
    expect(page).toContain("workflow-rail-grid");
    expect(page).toContain("product-demo-rail");
    expect(page).not.toContain("trust-marquee flex min-w-max");

    expect(globals).toContain(".hero-before-after-stage");
    expect(globals).toContain(".chaos-column");
    expect(globals).toContain(".calm-column");
    expect(globals).toContain(".before-after-connector");
    expect(globals).toContain(".engine-rail-section");
    expect(globals).toContain(".workflow-rail-grid");
    expect(globals).toContain(".product-demo-rail");
    expect(nextConfig).toContain("qualities: [70, 75]");
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

  test("public navigation uses the reduced redesign navigation model", () => {
    const page = readProjectFile("app/page.tsx");
    const navigation = readProjectFile("components/marketing/landing-navigation.tsx");

    expect(page).toContain("<MarketingHeader />");
    expect(navigation).toContain('"use client"');
    expect(navigation).toContain("openGroup");
    expect(navigation).toContain("setOpenGroup(isOpen ? null : group.label)");
    expect(navigation).toContain("setOpenGroup(null)");
    expect(navigation).toContain("Produkt");
    expect(navigation).toContain("Ceník");
    expect(navigation).toContain("Ukázka");
    expect(navigation).toContain("Návody");
    expect(navigation).toContain("Jak to funguje");
    expect(navigation).toContain("Proč Temaro");
    expect(page).toContain("/ukazka");
    expect(navigation).not.toContain("Řešení");
    expect(navigation).not.toContain("Pro zákazníky");
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
    expect(sharedHeader).toContain("marketing-fixed-header");
    expect(sharedHeader).toContain("top-[max(0.75rem,env(safe-area-inset-top))]");
    expect(sharedHeader).toContain("min-h-16");
    expect(sharedHeader).toContain("max-w-[1280px]");
    expect(sharedHeader).toContain("px-3 text-sm");
    expect(sharedHeader).not.toContain("ThemeToggle");
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
    expect(desktopNavigation).toContain("Ceník");
    expect(desktopNavigation).toContain("Návody");
    expect(mobileMenu).not.toContain("<details");
  });

  test("homepage explains setup flow and strong bento arguments", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("workflowSteps");
    expect(page).toContain("Nastavíte služby a tým");
    expect(page).toContain("Sdílíte rezervační odkaz");
    expect(page).toContain("Klient si vybere termín");
    expect(page).toContain("Provoz má přehled");
    expect(page).toContain("bentoCards");
    expect(page).toContain("Méně telefonátů");
    expect(page).toContain("No-show pod kontrolou");
    expect(page).toContain("Paměť podniku");
    expect(page).toContain("Jeden odkaz, všechny kanály");
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
