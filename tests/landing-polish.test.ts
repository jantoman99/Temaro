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

  test("homepage follows the clean Czech SaaS direction", () => {
    const page = readProjectFile("app/page.tsx");
    const showcase = readProjectFile("components/marketing/live-product-showcase.tsx");

    expect(page).toContain("clean-saas-page");
    expect(showcase).toContain("clean-saas-showcase");
    expect(showcase).toContain("phone-booking-preview");
    expect(showcase).toContain("Ukázka v počítači i telefonu");
    expect(page).toContain("Bez karty na start");
    expect(page).toContain("Žádná provize z vašich klientů");
    expect(page).toContain("relative signal-hero");
    expect(page).not.toContain("command-surface interactive-demo-shell py-20");
  });

  test("homepage uses contrast rhythm with product as a full-bleed hero", () => {
    const page = readProjectFile("app/page.tsx");
    const showcase = readProjectFile("components/marketing/live-product-showcase.tsx");

    expect(page).toContain('<section className="relative signal-hero">');
    expect(page).toContain('<section id="produkt" className="command-surface border-y border-white/10 py-20">');
    expect(page).toContain('max-w-[1320px]');
    expect(page).toContain("Reálný pohled");
    expect(page).toContain("Takhle vypadá běžný den ve vašem provozu.");
    expect(page).toContain("<LiveProductShowcase />");
    expect(page).not.toContain("lg:grid-cols-[0.78fr_1.22fr]");
    expect(showcase).not.toContain('id="produkt"');
    expect(showcase).toContain("xl:right-0");
  });

  test("homepage hero is centered and only as tall as its content", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain(
      'className="mx-auto flex w-full max-w-[1180px] flex-col px-4 py-4 sm:px-6 lg:px-0"',
    );
    expect(page).toContain('<div className="py-16 lg:py-24">');
    expect(page).toContain('<section className="mx-auto w-full max-w-3xl text-center">');
    expect(page).toContain('className="mt-7 mx-auto max-w-4xl text-balance');
    expect(page).toContain('className="mt-6 mx-auto max-w-xl text-lg');
    expect(page).toContain('className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"');
    expect(page).toContain('className="mt-6 flex flex-wrap justify-center gap-2"');
    expect(page).toContain('className="mt-8 mx-auto grid max-w-2xl grid-cols-3 gap-2 sm:gap-3"');
    expect(page).not.toContain("min-h-[78vh]");
    expect(page).not.toContain("lg:min-h-[76vh]");
    expect(page).not.toContain("flex flex-1 items-center py-12 lg:py-16");
    expect(page).not.toContain("text-left lg:mx-0");
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
    expect(page).toContain('import { LiveProductShowcase } from "@/components/marketing/live-product-showcase"');
    expect(page).toContain("<LiveProductShowcase />");
    expect(page).toContain("<Reveal");
    expect(page).toContain("delay={");
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
    expect(reveal).toContain("opacity: active ? 1 : 0");
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

  test("public navigation separates business and customer paths", () => {
    const page = readProjectFile("app/page.tsx");

    expect(page).toContain("Pro podniky");
    expect(page).toContain("Pro zákazníky");
    expect(page).toContain("/ukazka");
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
