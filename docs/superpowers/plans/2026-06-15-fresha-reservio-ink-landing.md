# Fresha/Reservio Ink Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zklidnit Temaro landing podle Fresha/Reservio směru: bez oranžových ambientních fleků, s větším navem a tmavším produktovým ukotvením.

**Architecture:** Jde o CSS/markup pass nad existující root landing architekturou. Stávající komponenty zůstanou, ale jejich vizuální vrstvy se zpřísní: header, hero surface, proof band a produktový příběh.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS utility classes, globální CSS v `app/globals.css`, Vitest guard `tests/landing-polish.test.ts`.

---

### Task 1: Guard

**Files:**
- Modify: `tests/landing-polish.test.ts`

- [ ] Přidat očekávání, že header obsahuje větší výšku a navigace větší typografii.
- [ ] Přidat očekávání, že CSS obsahuje tmavý proof/ink stage a neobsahuje starý růžovo-oranžový proof gradient.
- [ ] Spustit `npx vitest run tests/landing-polish.test.ts` a ověřit RED failure.

### Task 2: Visual Implementation

**Files:**
- Modify: `components/marketing/marketing-header.tsx`
- Modify: `components/marketing/landing-navigation.tsx`
- Modify: `components/marketing/feature-story-bento.tsx`
- Modify: `app/globals.css`

- [ ] Zvětšit header a nav CTA.
- [ ] Odstranit ambientní hero/page radials.
- [ ] Přidat tmavé `temaro-premium-stage::before` ukotvení za device.
- [ ] Přepsat `temaro-hero-proof-band` na ink surface.
- [ ] Přidat `temaro-feature-panel` wrapper a zklidnit bento karty do méně pastelového produktového panelu.

### Task 3: Verification And Deploy

**Files:**
- Modify: `docs/implementation-progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/runtime-checklist.md`

- [ ] Spustit landing guard.
- [ ] Spustit vizuální Playwright screenshot/metrics pro desktop a mobile.
- [ ] Spustit `git diff --check`, `npx impeccable detect app components` a `npm run check`.
- [ ] Commitnout, pushnout `dev`, ručně nasadit staging pokud GitHub Actions dál selže ve `vercel pull`.
