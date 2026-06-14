# CRM Calendar Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `/ukazka` marketing-style demo with a code-native clickable internal CRM/product demo centered on the calendar.

**Architecture:** Keep the demo isolated in `components/marketing/interactive-product-demo.tsx`, but base its UI vocabulary on dashboard source files: sidebar navigation, calendar week grid, booking detail, filters, clients table and booking page settings. `/ukazka` becomes a short product page around this real app demo, not a screenshot gallery.

**Tech Stack:** Next.js 16, React client component, TypeScript, Tailwind CSS, existing Temaro design tokens, Vitest guard tests, Playwright visual verification.

---

### Task 1: Guard The New Demo Contract

**Files:**
- Modify: `tests/landing-polish.test.ts`

- [ ] Write a failing test that requires CRM demo signatures: `crmDemoViews`, `crm-demo-shell`, `crm-calendar-grid`, `crm-booking-detail`, `Kalendář`, `Klienti`, `Rezervační stránka`.
- [ ] Run `npx vitest run tests/landing-polish.test.ts -t "interactive product demo keeps customer-facing labels"` and verify it fails on the current Time Atelier demo.

### Task 2: Rebuild InteractiveProductDemo

**Files:**
- Modify: `components/marketing/interactive-product-demo.tsx`

- [ ] Replace the Time Atelier visual with a fake logged-in CRM shell.
- [ ] Default view is `Kalendář`: week grid 7-20h, staff-colored reservation blocks, filter chips, KPI strip, selected booking detail.
- [ ] Add click targets for `Přehled`, `Kalendář`, `Klienti`, `Rezervační stránka`.
- [ ] Keep motion minimal and state-based; respect `usePrefersReducedMotion`.
- [ ] Do not use images, screenshots, or landing page assets.

### Task 3: Reframe /ukazka Page

**Files:**
- Modify: `app/ukazka/page.tsx`

- [ ] Rewrite copy to say this is a clickable internal CRM preview after login.
- [ ] Make calendar the first promised outcome.
- [ ] Remove language that implies screenshots, video, or landing proof.

### Task 4: Visual Polish And Verification

**Files:**
- Modify: `app/globals.css` only if needed for demo-specific shell/grid classes.
- Modify docs after successful verification.

- [ ] Run targeted Vitest, lint, type-check.
- [ ] Run local Playwright screenshot pass for `/ukazka` desktop/tablet/mobile and clicked states.
- [ ] Use vision to inspect screenshots and fix overlap/overflow.
- [ ] Run `npm run check`.
- [ ] Update `docs/implementation-progress.md`, `docs/handoff.md`, `docs/runtime-checklist.md`, and `docs/manual-test-plan.md`.
