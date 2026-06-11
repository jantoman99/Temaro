# Landing Dispatch Direction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Zesilit landing jako provozni dispecink dne s jednou zapamatovatelnou casovou osou.

**Architecture:** Upravy zustanou v existujicich marketing souborech. `BusinessDiscoveryHero` nese hlavni live rail, `app/page.tsx` napoji navazujici sekce a `app/globals.css` prida sdilene vizualni utility. `next.config.ts` doplni povolenou image quality.

**Tech Stack:** Next.js 16, React, TypeScript, Tailwind CSS, Vitest.

---

### Task 1: Guard Tests

**Files:**
- Modify: `tests/landing-polish.test.ts`

- [x] Add failing tests for dispatch direction strings/classes, mobile rail and image quality config.
- [x] Run `npx vitest run tests/landing-polish.test.ts` and confirm failure before production edits.

### Task 2: Hero Dispatch Rail

**Files:**
- Modify: `components/marketing/business-discovery-hero.tsx`
- Modify: `app/globals.css`

- [x] Add `dayRailEvents` and render a desktop/mobile rail that names obsazeno, volno, riziko and potvrzeno states.
- [x] Keep booking widget functional and preserve disabled occupied slots.
- [x] Add CSS utilities for rail marks and reduced-motion-safe polish.

### Task 3: Page Rhythm

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [x] Replace generic trust marquee with a static dispatch proof strip.
- [x] Add rail wrappers to engine, workflow and product demo sections.
- [x] Reduce repeated card-grid feel without inventing claims.

### Task 4: Config And Verification

**Files:**
- Modify: `next.config.ts`
- Modify: `docs/implementation-progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/runtime-checklist.md`
- Modify: `docs/manual-test-plan.md`

- [x] Allow `images.qualities: [70, 75]`.
- [x] Update docs after successful verification.
- [x] Run `npm run check`.
