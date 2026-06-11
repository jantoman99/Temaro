# Temaro Product Window Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the dev landing page so the first impression is a real Temaro product interface, not salon/lifestyle imagery.

**Architecture:** Keep the current Next.js marketing route and design tokens, but replace the photo-led hero with code-native app screens based on `/ukazka` and `/demo-barber`. Remove AI/lifestyle image dependence from homepage content; any visual proof must be a real product view rendered in HTML/CSS or a screenshot generated from the app.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, existing marketing components, Vitest, Playwright browser screenshots.

---

### Task 1: Product-Window Guard

**Files:**
- Modify: `tests/landing-polish.test.ts`

- [x] Add a failing test that requires `ProductWindowHero`, product surface labels, no `/marketing/salon-day-*.webp` usage on `app/page.tsx`, no `photo-led-hero`, and new signatures `product-window-hero`, `product-window-frame`, `booking-phone-preview`, `product-proof-gallery`.
- [x] Run `npx vitest run tests/landing-polish.test.ts` and verify the new guard fails on the current photo-led implementation.

### Task 2: Product Hero

**Files:**
- Modify: `components/marketing/business-discovery-hero.tsx`
- Modify: `app/globals.css`

- [x] Replace lifestyle image hero with a dominant app browser frame showing `Přehled provozu`, KPIs, agenda rows, sidebar, and a phone booking preview.
- [x] Keep existing booking collision helpers only if still used by tests; otherwise move product proof to cleaner product-surface data.
- [x] Add meaningful motion: one auto-rotating active surface and a booking confirmation pulse; respect `usePrefersReducedMotion`.

### Task 3: Product-Led Page Rhythm

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [x] Remove `salonSceneImages` and the `Provoz v obrazech` photo gallery.
- [x] Add a `Co klient a tým skutečně uvidí` section with three code-native product scenes: týmový kalendář, veřejná rezervační stránka, zákaznický účet.
- [x] Compress bento and product demo sections so the page does not repeat the same claim in card form.

### Task 4: Navigation And CTA

**Files:**
- Modify: `components/marketing/marketing-header.tsx`
- Modify: `components/marketing/landing-navigation.tsx`
- Modify: `components/marketing/mobile-marketing-menu.tsx`

- [x] Keep navigation compact but product-led: `Produkt`, `Ukázka`, `Ceník`, `Návody`.
- [x] Make `/ukazka` visually important without adding a second loud primary CTA.
- [x] Verify mobile header does not overflow at 375px.

### Task 5: Verification And Docs

**Files:**
- Modify: `docs/implementation-progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/runtime-checklist.md`
- Modify: `docs/manual-test-plan.md`

- [x] Run targeted landing tests.
- [x] Run `npx impeccable detect app components`.
- [x] Capture screenshots at 1440, 1366, 768, 390, 375 and verify no horizontal overflow.
- [x] Run `npm run check`.
- [x] Update docs with product-window direction and screenshots.
- [ ] Commit and push to `origin/dev`, deploy staging, verify `/api/health` and HTML signatures.
