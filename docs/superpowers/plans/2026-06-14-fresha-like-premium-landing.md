# Fresha-Like Premium Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the public homepage toward a Fresha-like premium salon platform: strong centered hero, full-width product demonstration, minimal text, more imagery, clean typography, and restrained motion.

**Architecture:** Keep the existing marketing route and header. Replace `BusinessDiscoveryHero` with a Fresha-like full-width hero and product stage; update the first product/story sections in `app/page.tsx` only where needed for visual continuity. Add CSS under existing marketing styles without touching dashboard/auth/business logic.

**Tech Stack:** Next.js 16, TypeScript, Tailwind utility classes, local WebP assets, existing Vitest landing guard, Playwright screenshots.

---

### Task 1: Guard Fresha-Like Direction

**Files:**
- Modify: `tests/landing-polish.test.ts`

- [ ] **Step 1: Replace current hero guard expectations**

Require these source strings/classes in `BusinessDiscoveryHero`:

```ts
expect(hero).toContain("freshaPremiumStats");
expect(hero).toContain("premiumProductColumns");
expect(hero).toContain("salonImageTiles");
expect(hero).toContain("temaro-premium-hero");
expect(hero).toContain("temaro-premium-stage");
expect(hero).toContain("temaro-premium-product");
expect(hero).toContain("temaro-premium-copy");
expect(hero).toContain("temaro-salon-image-strip");
expect(hero).toContain("Rezervace, platby a klienti");
expect(hero).toContain("v jednom salon systému");
expect(hero).toContain("Online rezervace");
expect(hero).toContain("Týmový kalendář");
expect(hero).toContain("Klientská karta");
expect(hero).toContain("SMS a záloha");
```

Keep these negative checks:

```ts
expect(hero).not.toContain("temaro-salon-wall");
expect(hero).not.toContain("temaro-proof-flow");
expect(hero).not.toContain("temaro-stat-card");
expect(hero).not.toContain("Klienti rezervují. Kalendář drží den");
expect(hero).not.toContain("/marketing/product/temaro-product-app-screen.jpg");
```

- [ ] **Step 2: Run RED**

Run: `npx vitest run tests/landing-polish.test.ts`

Expected: fails because the Fresha-like symbols/classes do not exist yet.

### Task 2: Rebuild Hero Component

**Files:**
- Modify: `components/marketing/business-discovery-hero.tsx`

- [ ] **Step 1: Replace old command-wall data**

Use new arrays:

```ts
const freshaPremiumStats = [
  { value: "24/7", label: "online rezervace" },
  { value: "0 Kč", label: "provize z vlastních kanálů" },
  { value: "1 den", label: "kalendář, klient i platba" },
] as const;

const premiumProductColumns = [
  { label: "Online rezervace", title: "16:00 z Instagramu", note: "klient vybral volný čas" },
  { label: "Týmový kalendář", title: "Adam / Lucie / Eva", note: "den bez kolizí" },
  { label: "Klientská karta", title: "Lucie čeká na potvrzení", note: "historie, poznámka, no-show signál" },
  { label: "SMS a záloha", title: "300 Kč připraveno", note: "připomínka bez volání" },
] as const;

const salonImageTiles = [
  { src: "/marketing/hero/salon-command-wall.webp", alt: "Salon interiér pro Temaro" },
  { src: "/marketing/hero/salon-command-wall.webp", alt: "Barber pracovní místo pro Temaro" },
  { src: "/marketing/hero/salon-command-wall.webp", alt: "Beauty provoz pro Temaro" },
] as const;
```

- [ ] **Step 2: Implement centered hero**

Render:

```tsx
<section className="temaro-premium-hero ...">
  <div className="temaro-premium-copy ...">
    <p>Salon platforma Temaro</p>
    <h1>Rezervace, platby a klienti <span>v jednom salon systému.</span></h1>
    <p>Temaro spojí web, Instagram, Google a QR do jednoho přehledného kalendáře.</p>
    <Link>Registrovat salon</Link>
    <Link>Vidět ukázku</Link>
  </div>
  <div className="temaro-premium-stage">
    <div className="temaro-premium-product">...</div>
    <div className="temaro-salon-image-strip">...</div>
  </div>
</section>
```

Remove old `SalonCommandWall`, old orbit/flow/stat remnants, and old split hero layout.

### Task 3: Premium CSS System

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Add Fresha-like classes**

Add CSS classes:

```css
.temaro-premium-hero {}
.temaro-premium-copy {}
.temaro-premium-copy h1 span {}
.temaro-premium-stage {}
.temaro-premium-product {}
.temaro-premium-product-column {}
.temaro-salon-image-strip {}
.temaro-salon-image-tile {}
```

Use warm premium surfaces, generous whitespace, one cobalt CTA, subtle apricot/mint labels, large product panel, and no decorative grids.

- [ ] **Step 2: Mobile requirements**

In `@media (max-width: 640px)`, keep CTA visible, product stage directly under CTA, no horizontal overflow, and no tiny text cards.

### Task 4: First Follow-Up Section

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Simplify first section rhythm**

Keep sections but make the first section after hero visually compatible:

```tsx
<section id="pro-koho" className="temaro-premium-industries ...">
```

Reduce dense text, keep four industry cards, and make the section feel like a continuation of the Fresha-like premium story.

### Task 5: Verify And Deploy

**Files:**
- Modify docs only after verification: `docs/implementation-progress.md`, `docs/handoff.md`, `docs/runtime-checklist.md`

- [ ] **Step 1: Run guard**

Run: `npx vitest run tests/landing-polish.test.ts`

Expected: 22/22 pass.

- [ ] **Step 2: Screenshot audit**

Run local dev server, capture desktop and mobile screenshots into:

`output/playwright/fresha-like-premium-2026-06-14/`

Metrics must show `overflowX=0`, product stage visible above fold on desktop, and product preview visible before long scroll on mobile.

- [ ] **Step 3: Full verification**

Run:

```bash
npm run lint
git diff --check
npx impeccable detect app components
npm run check
```

Expected: all pass; `npm run check` includes 600 Vitest tests, migrations, type-check, lint, build.

- [ ] **Step 4: Commit and push**

Commit:

```bash
git add .
git commit -m "feat(marketing): redesign landing like premium salon platform"
git push origin dev
```

- [ ] **Step 5: Vercel staging**

Run:

```bash
npx vercel build
npx vercel deploy --prebuilt --yes --format json
npx vercel alias set <preview-host> rezervacni-system-dev.vercel.app
```

Verify staging HTML contains `temaro-premium-hero`, `temaro-premium-stage`, `Rezervace, platby a klienti`, and does not contain old command-wall signatures.
