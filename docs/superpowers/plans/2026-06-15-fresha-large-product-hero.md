# Fresha Large Product Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Temaro landing hero to a Fresha-like centered layout with a dominant desktop + phone product preview and black used mainly for CTA/navigation.

**Architecture:** Keep the existing marketing page structure and `PremiumProductStage` component. Change the hero composition from split photo-stack-first to centered copy plus large product stage, with photos reduced to supporting overlays and proof band softened away from a black slab.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS utilities, project CSS in `app/globals.css`, Vitest source guards, Playwright browser audit.

---

### Task 1: Guard Test

**Files:**
- Modify: `tests/landing-polish.test.ts`

- [x] **Step 1: Update source guard**

Require `temaro-fresha-product-hero`, `temaro-product-glow`, large product sizing, and light proof band. Keep black CTA/header guard.

- [x] **Step 2: Run red test**

Run: `npx vitest run tests/landing-polish.test.ts`
Expected: FAIL until implementation adds the new hero signatures.

### Task 2: Hero Composition

**Files:**
- Modify: `components/marketing/business-discovery-hero.tsx`
- Modify: `app/globals.css`

- [x] **Step 1: Center copy and CTAs**

Make the hero copy centered on desktop and mobile. Keep black primary CTA, white secondary CTA.

- [x] **Step 2: Restore large product**

Move `PremiumProductStage` below copy as the main object. Desktop should be wide like Fresha and include both desktop and phone preview. Photos become small supporting cards around the product, not the main layout.

- [x] **Step 3: Soften color system**

Use white canvas with soft violet/cobalt/mint glow under the product. Remove the black proof slab from the first transition; black remains in CTA/nav and product device frame.

### Task 3: Verification

**Files:**
- Modify: `docs/implementation-progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/runtime-checklist.md`

- [x] **Step 1: Run source checks**

Run: `npx vitest run tests/landing-polish.test.ts`, `git diff --check`, `npx impeccable detect app components`.

- [x] **Step 2: Browser audit**

Capture desktop 1440x1000 and mobile 390x940 into `output/playwright/fresha-large-product-hero-2026-06-15/`. Verify `overflowX=0`, desktop product is dominant, mobile text is not clipped.

- [x] **Step 3: Full check**

Run: `npm run check`. Expected: 600 Vitest tests and build pass.

### Task 4: Deploy

**Files:**
- Modify: docs from Task 3

- [x] **Step 1: Commit and push**

Commit implementation and docs to `dev`, push to `origin/dev`.

- [x] **Step 2: Deploy dev Vercel**

Run `npx vercel build`, `npx vercel deploy --prebuilt --yes --format json`, alias preview to `rezervacni-system-dev.vercel.app`, and verify `/api/health` plus HTML/browser signatures.
