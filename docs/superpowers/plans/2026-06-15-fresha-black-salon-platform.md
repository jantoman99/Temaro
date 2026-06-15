# Fresha Black Salon Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dostat Temaro landing blíž k Fresha 10/10 směru pomocí černobílého header/CTA systému, kompaktnějšího hero a více fotek v first foldu.

**Architecture:** Změna zůstává v marketing vrstvě. `BusinessDiscoveryHero` dostane split layout s foto/product scénou, `MarketingHeader` a `LandingNavigation` přejdou na silnější black CTA/header měřítko, `app/globals.css` definuje nové marketing-only třídy a `tests/landing-polish.test.ts` hlídá nové signatury.

**Tech Stack:** Next.js 16, TypeScript, Tailwind utility classes, globální CSS, Vitest source guards, Playwright browser audit.

---

### Task 1: Test Guard

- [ ] Upravit `tests/landing-polish.test.ts`, aby vyžadoval `temaro-black-hero-grid`, `temaro-hero-photo-stack`, `heroPhotoCards`, černé CTA v headeru a kompaktnější stage.
- [ ] Spustit `npx vitest run tests/landing-polish.test.ts`.
- [ ] Očekávat RED failure na chybějících nových signaturách.

### Task 2: Header And Hero

- [ ] Upravit `components/marketing/marketing-header.tsx` na výraznější topbar s černým registračním CTA.
- [ ] Upravit `components/marketing/landing-navigation.tsx` na větší text a černý hover/active feeling.
- [ ] Přestavět `components/marketing/business-discovery-hero.tsx` na split hero a přidat lokální fotky přes `next/image`.
- [ ] Zmenšit produktový stage a telefon CSS v `app/globals.css`.

### Task 3: Proof And Visual Audit

- [ ] Zpřesnit `app/page.tsx` proof labels na silnější obchodní důkaz bez fake čísel.
- [ ] Zachytit Playwright desktop/mobile screenshoty do `output/playwright/fresha-black-platform-2026-06-15/`.
- [ ] Spustit `git diff --check`, `npx impeccable detect app components`, `npm run check`.
- [ ] Commit, push `dev`, Vercel preview deploy a alias `rezervacni-system-dev.vercel.app`.
