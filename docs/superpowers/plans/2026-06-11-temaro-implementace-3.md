# TEMARO Implementace 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Opravit landing page podle `docs/TEMARO_IMPLEMENTACE_3.md`: pravdivý hero booking widget, kratší homepage bez duplicitních scénářů, funkční sticky engine sekce, přístupnější kontrast a rozumnější animace.

**Architecture:** Změny zůstávají ve stávající landing vrstvě bez nové produktové abstrakce. Hero widget dopočítá obsazenost, lane a šířky lokálně v client komponentě. Engine sekce dostane malý client wrapper pro viewport-gated animace, zatímco obsah homepage zůstane v server komponentě.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Vitest textové guardy, Playwright smoke pro ruční/runtime ověření.

---

### Task 1: Landing Guard Tests

**Files:**
- Modify: `tests/landing-polish.test.ts`

- [ ] **Step 1: Write failing tests**

Add or adjust guards so they require:
- `overlaps`, `isSlotFree`, `findFirstFreeSlot`, `width: \`${Math.min(`, `laneForSlot(reservation.time)` and no `lane:` in hero reservation data.
- `id="scenare"` and `scenarioCards` absent from `app/page.tsx`.
- engine image objects include `text`, image components include `quality={70}`, and product demo uses `3 volná okna`.
- `Reveal` uses `willChange: active && !reduce ? "transform" : "auto"`.
- main uses `[overflow-x:clip]` and not `overflow-hidden`.
- CSS contains viewport-gated classes and mobile scan disable.

- [ ] **Step 2: Verify tests fail**

Run: `npm run test -- tests/landing-polish.test.ts`

Expected before implementation: at least one landing guard fails because current code still contains `scenarioCards`, `#scenare`, permanent `willChange`, and old hero slot logic.

### Task 2: Hero Collision Engine

**Files:**
- Modify: `components/marketing/business-discovery-hero.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Implement slot geometry**

Use:

```ts
function overlaps(aStart: number, aWidth: number, bStart: number, bWidth: number) {
  return Math.max(aStart, bStart) < Math.min(aStart + aWidth, bStart + bWidth);
}

function isSlotFree(time: string, reservations: readonly DemoReservation[]) {
  const left = toPct(time);
  const width = durationToPct(45);
  return !reservations.some((reservation) =>
    overlaps(left, width, toPct(reservation.time), durationToPct(reservation.durationMin)),
  );
}
```

- [ ] **Step 2: Remove stored lanes**

Delete `lane` from `DemoReservation` and all seed data. Render with `laneForSlot(reservation.time)`.

- [ ] **Step 3: Fix default and chip states**

Set selected slot to first free slot per industry. Render occupied chips with `disabled`, `aria-disabled`, `data-free`, ink background and no hover.

- [ ] **Step 4: Fix desktop card geometry**

Use `width: \`${Math.min(durationToPct(reservation.durationMin), 100 - toPct(reservation.time))}%\`` and lower minimum duration width to `8`.

- [ ] **Step 5: Fix mobile list**

Render `[...reservations].sort((a, b) => toPct(a.time) - toPct(b.time))`. Highlight `client === "Nová online rezervace"` with cobalt ring and `nové` badge.

### Task 3: Homepage Engine and Scenario Removal

**Files:**
- Modify: `app/page.tsx`
- Create: `components/marketing/time-engine-panel.tsx`
- Modify: `app/globals.css`
- Modify: `next.config.ts`

- [ ] **Step 1: Remove duplicate scenario section**

Delete `scenarioCards` and the whole `<section id="scenare">`.

- [ ] **Step 2: Move scenario copy into engine photos**

Add `text` to each `visualProofImages` object and render under `image.title` with `text-sm font-normal text-white/80`.

- [ ] **Step 3: Replace fake progress bars**

Render three mono time chips in every photo-proof card: two occupied ink chips and one mint free chip.

- [ ] **Step 4: Fix no-show contrast**

Change `Riziko no-show` slot to apricot tint, ink text, and `AlertTriangle` red icon only.

- [ ] **Step 5: Gate animations in viewport**

Create `TimeEnginePanel` as a client wrapper using `useInView` and `usePrefersReducedMotion`. Add `data-engine-active` only when in viewport and motion is allowed.

- [ ] **Step 6: Fix sticky and overflow**

Update `Reveal` `willChange`; replace main `overflow-hidden` with `[overflow-x:clip]`; remove `business-discovery-page`.

- [ ] **Step 7: Configure images**

Add `images: { formats: ["image/avif", "image/webp"] }` to `next.config.ts` and `quality={70}` to engine `Image`.

### Task 4: Docs and Verification

**Files:**
- Modify: `docs/implementation-progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/runtime-checklist.md`
- Modify: `docs/manual-test-plan.md`

- [ ] **Step 1: Update docs**

Record landing implementation 3, Vercel env owner note for `NEXT_PUBLIC_APP_URL`, runtime checks, and latest local verification once available.

- [ ] **Step 2: Run verification**

Run:

```bash
npm run test -- tests/landing-polish.test.ts
npm run type-check
npm run lint
npm run check
```

Expected: targeted test, type-check, lint and full check pass. If full check is too slow or blocked, record the exact command/output and do not claim it passed.

