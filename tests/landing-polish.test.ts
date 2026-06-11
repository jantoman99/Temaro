import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const rootDir = process.cwd();

function readProjectFile(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("landing polish guard", () => {
  test("homepage uses app product views instead of lifestyle image proof", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(hero).toContain("product-window-hero");
    expect(hero).toContain("product-window-frame");
    expect(hero).toContain("booking-phone-preview");
    expect(hero).toContain("ProductWindowHero");
    expect(hero).toContain("Přehled provozu");
    expect(hero).toContain("Dnešní rezervace");
    expect(hero).toContain("Týmový kalendář");
    expect(hero).toContain("Rezervační stránka");
    expect(hero).toContain("Zákaznický účet");
    expect(page).toContain("productProofScenes");
    expect(page).toContain("product-proof-gallery");
    expect(page).toContain("Co klient a tým skutečně uvidí");
    expect(page).toContain("Veřejná rezervační stránka");
    expect(page).toContain("Zákaznický účet bez telefonátu");
    expect(globals).toContain(".product-window-hero");
    expect(globals).toContain(".product-window-frame");
    expect(globals).toContain(".booking-phone-preview");
    expect(globals).toContain(".product-proof-gallery");
    expect(page).not.toContain("salonSceneImages");
    expect(hero).not.toContain("salonServiceTabs");
    expect(hero).not.toContain("/marketing/salon-day-hero.webp");
    expect(hero).not.toContain("photo-led-hero");
    expect(hero).not.toContain("salon-phone-card");
    expect(page).not.toContain("/marketing/salon-day-barber.webp");
    expect(page).not.toContain("/marketing/salon-day-beauty.webp");
    expect(page).not.toContain("/marketing/salon-day-fitness.webp");
    expect(page).not.toContain("scenarioCards");
    expect(page).not.toContain('id="scenare"');
    expect(page).not.toContain("/marketing/time-engine-salon.webp");
    expect(page).not.toContain("/marketing/time-engine-beauty.webp");
    expect(page).not.toContain("/marketing/time-engine-fitness.webp");
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

  test("homepage hero implements a product-window app demo", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(hero).toContain('"use client"');
    expect(hero).toContain("productSurfaces");
    expect(hero).toContain("activeSurfaceId");
    expect(hero).toContain("setActiveSurfaceId");
    expect(hero).toContain("ProductWindowHero");
    expect(hero).toContain("SurfacePanel");
    expect(hero).toContain("BookingPhonePreview");
    expect(hero).toContain("usePrefersReducedMotion");
    expect(hero).toContain('aria-live="off"');
    expect(hero).toContain("temaro-time-hero");
    expect(hero).toContain("product-window-hero");
    expect(hero).toContain("product-window-frame");
    expect(hero).toContain("booking-phone-preview");
    expect(hero).toContain("Rezervace, které vidíte hned v kalendáři");
    expect(hero).toContain("Přehled provozu");
    expect(hero).toContain("Dnešní rezervace");
    expect(hero).toContain("Tržba dnes");
    expect(hero).toContain("Volná okna");
    expect(hero).toContain("Riziko");
    expect(hero).toContain("Otevřít kalendář");
    expect(hero).toContain("Veřejná rezervační stránka");
    expect(hero).toContain("Zákaznický účet");
    expect(hero).toContain("Spustit produktovou ukázku");
    expect(hero).not.toContain("salon-day-hero.webp");
    expect(hero).not.toContain("salon-phone-card");
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

  test("product-window hero keeps real product surfaces readable without fake screenshot data", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");

    expect(hero).toContain("kpiItems");
    expect(hero).toContain("agendaRows");
    expect(hero).toContain("calendarColumns");
    expect(hero).toContain("bookingServices");
    expect(hero).toContain("accountBookings");
    expect(hero).toContain("window.setInterval");
    expect(hero).toContain("reduceMotion");
    expect(hero).toContain("min-w-0");
    expect(hero).toContain("overflow-x-auto");
    expect(hero).not.toContain("Kokot");
    expect(hero).not.toContain("Jebat");
    expect(hero).not.toContain("faker");
    expect(hero).not.toContain("AI");
    expect(hero).not.toContain("12 000+");
    expect(hero).not.toContain("99 %");
  });

  test("update 2 keeps strong photo-led bento arguments and booking ownership", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("Klient rezervuje sám");
    expect(page).toContain("No-show pod kontrolou");
    expect(page).toContain("riziková rezervace");
    expect(page).toContain("Vlastní klienti");
    expect(page).toContain("Připomínky a platby");
    expect(page).toContain("Potvrzení, připomínky a zálohy");
    expect(page).toContain("Temaro není marketplace");
    expect(page).toContain("bez provizních překvapení");
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

  test("product proof layer shows app surfaces before dense product sections", () => {
    const page = readProjectFile("app/page.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(page).toContain("productProofScenes");
    expect(page).toContain('id="casovy-engine"');
    expect(page).toContain("product-proof-strip");
    expect(page).toContain("product-proof-gallery");
    expect(page).toContain("product-proof-card");
    expect(page).toContain("Co klient a tým skutečně uvidí");
    expect(page).toContain("Týmový kalendář");
    expect(page).toContain("Veřejná rezervační stránka");
    expect(page).toContain("Zákaznický účet bez telefonátu");
    expect(page).not.toContain("salonSceneImages");
    expect(page).not.toContain("salon-proof-strip");
    expect(page).not.toContain("salon-scenes-grid");
    expect(page).not.toContain("salon-scene-card");
    expect(page).not.toContain("messageCloud");
    expect(page).not.toContain("engineSlots");
    expect(page).not.toContain("timeProofChips");
    expect(page).not.toContain("bg-[var(--signal-red)] text-white");
    expect(page).not.toContain("rgba(229,72,77,0.10)");
    expect(globals).toContain(".product-proof-strip");
    expect(globals).toContain(".product-proof-gallery");
    expect(globals).toContain(".product-proof-card");
    expect(globals).toContain("animation: none");
  });

  test("visual audit fixes mobile clipping, sticky overlap and menu text spacing", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const header = readProjectFile("components/marketing/marketing-header.tsx");
    const menu = readProjectFile("components/marketing/mobile-marketing-menu.tsx");
    const nav = readProjectFile("components/marketing/landing-navigation.tsx");
    const stickyCta = readProjectFile("components/marketing/mobile-sticky-cta.tsx");
    const globals = readProjectFile("app/globals.css");

    expect(hero).toContain("product-window-frame");
    expect(hero).toContain("booking-phone-preview");
    expect(hero).toContain("lg:grid-cols-[0.76fr_1.24fr]");
    expect(hero).toContain("min-w-0");
    expect(hero).toContain("overflow-x-auto");
    expect(hero).not.toContain("mobile-reservation-list");
    expect(hero).not.toContain("desktop-reservation-card");
    expect(hero).not.toContain("min-h-[680px]");
    expect(hero).not.toContain("sm:min-h-[790px]");

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

  test("implementation 3 keeps image formats and landing overflow constraints", () => {
    const page = readProjectFile("app/page.tsx");
    const nextConfig = readProjectFile("next.config.ts");
    const globals = readProjectFile("app/globals.css");

    expect(page).toContain("[overflow-x:clip]");
    expect(page).not.toContain("business-discovery-page");
    expect(page).not.toContain("min-h-screen overflow-hidden");
    expect(page).toContain("product-proof-strip");
    expect(page).toContain("product-proof-gallery");
    expect(page).toContain('href="#jak-to-funguje"');
    expect(page).not.toContain('href="#produkt" className="text-[var(--ink)] hover:underline">Produkt');
    expect(nextConfig).toContain("images");
    expect(nextConfig).toContain('"image/avif"');
    expect(nextConfig).toContain('"image/webp"');
    expect(globals).toContain("@media (max-width: 640px)");
    expect(globals).toContain(".product-proof-strip");
    expect(globals).toContain("opacity: 0");
  });

  test("implementation 7 turns the landing into a product-window app proof", () => {
    const page = readProjectFile("app/page.tsx");
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const globals = readProjectFile("app/globals.css");
    const nextConfig = readProjectFile("next.config.ts");

    expect(hero).toContain("product-window-hero");
    expect(hero).toContain("product-window-frame");
    expect(hero).toContain("booking-phone-preview");
    expect(hero).toContain("productSurfaces");
    expect(hero).toContain("Rezervace, které vidíte hned v kalendáři");
    expect(hero).toContain("Přehled provozu");
    expect(hero).toContain("Týmový kalendář");
    expect(hero).toContain("Rezervační stránka");
    expect(hero).toContain("Zákaznický účet");
    expect(hero).toContain("Rezervační systém pro salony a služby");
    expect(hero).toContain("Bez provize z vašich klientů");
    expect(hero).toContain("Začít zdarma");
    expect(hero).not.toContain("salon-day-hero.webp");
    expect(hero).not.toContain("salonServiceTabs");
    expect(hero).not.toContain("photo-led-hero");
    expect(hero).not.toContain("salon-phone-card");
    expect(hero).not.toContain("dailyOperations");
    expect(hero).not.toContain("decisionStack");
    expect(hero).not.toContain("operating-table-stage");
    expect(hero).not.toContain("operations-inbox");
    expect(hero).not.toContain("shift-time-band");
    expect(hero).not.toContain("decision-stack-panel");
    expect(hero).not.toContain("Provozní stůl dne");
    expect(hero).not.toContain("Rezervace drží den pohromadě");
    expect(hero).not.toContain("Klient vybírá jen skutečně volný čas");
    expect(hero).not.toContain("Jeden den, žádné přepínání");
    expect(hero).not.toContain("beforeAfterMoments");
    expect(hero).not.toContain("Den před Temarem");
    expect(hero).not.toContain("Den s Temarem");
    expect(hero).not.toContain("hero-before-after-stage");
    expect(hero).not.toContain("chaos-column");
    expect(hero).not.toContain("calm-column");
    expect(hero).not.toContain("before-after-connector");
    expect(hero).not.toContain("mobile-proof-panel");

    expect(page).not.toContain("dispatchProofItems");
    expect(page).not.toContain("dispatch-proof-strip");
    expect(page).not.toContain("Časová osa od prvního scrollu");
    expect(page).not.toContain('id="trust-bar"');
    expect(page).toContain("product-proof-strip");
    expect(page).toContain("product-proof-gallery");
    expect(page).toContain("productProofScenes");
    expect(page).not.toContain("/marketing/salon-day-barber.webp");
    expect(page).not.toContain("/marketing/salon-day-beauty.webp");
    expect(page).not.toContain("/marketing/salon-day-fitness.webp");
    expect(page).toContain("product-demo-rail");
    expect(page).not.toContain("trust-marquee flex min-w-max");

    expect(globals).toContain(".product-window-hero");
    expect(globals).toContain(".product-window-frame");
    expect(globals).toContain(".booking-phone-preview");
    expect(globals).toContain(".product-proof-gallery");
    expect(globals).not.toContain(".operating-table-stage");
    expect(globals).not.toContain(".operations-inbox");
    expect(globals).not.toContain(".shift-time-band");
    expect(globals).not.toContain(".decision-stack-panel");
    expect(globals).not.toContain(".hero-before-after-stage");
    expect(globals).not.toContain(".before-after-connector");
    expect(globals).toContain(".product-demo-rail");
    expect(nextConfig).toContain("qualities: [70, 75]");
  });

  test("implementation 8 keeps the product frame visible before mobile action clutter", () => {
    const hero = readProjectFile("components/marketing/business-discovery-hero.tsx");
    const globals = readProjectFile("app/globals.css");
    const relativePositionGroup = globals.match(/\.product-window-hero,[\s\S]*?position: relative;\n\s*}/)?.[0] ?? "";

    expect(relativePositionGroup).not.toContain(".booking-phone-preview");
    expect(hero).toContain("product-window-frame relative");
    expect(hero).toContain("booking-phone-preview absolute");
    expect(hero).toContain("mb-4 flex gap-2 overflow-x-auto pb-1 lg:hidden");
    expect(hero).toContain("grid min-h-[560px] lg:grid-cols-[13rem_minmax(0,1fr)]");
    expect(hero.indexOf('aria-label="Reálný produktový pohled Temaro"')).toBeGreaterThan(
      hero.indexOf("Rezervace, které vidíte hned v kalendáři"),
    );
    expect(hero).toContain("lg:grid-cols-[0.76fr_1.24fr]");
    expect(hero).not.toContain("photo-led-mobile-actions");
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
    expect(page).toContain("Klient rezervuje sám");
    expect(page).toContain("No-show pod kontrolou");
    expect(page).toContain("Vlastní klienti");
    expect(page).toContain("Připomínky a platby");
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
