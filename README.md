# Temaro

Temaro je multi-tenant SaaS rezervační systém pro lokální služby: salony, barbery, ordinace, trenéry, konzultanty a další provozy, které potřebují online booking, týmový kalendář a klientský kontext bez marketplace provizí.

Live demo: https://rezervacni-system-xi.vercel.app  
Demo booking: https://rezervacni-system-xi.vercel.app/demo-barber

## Co projekt ukazuje

- Veřejný booking flow s ukázkovým demo režimem bez nutnosti produkční databáze.
- Admin vrstvu pro služby, tým, klienty, kalendář, reporting a provozní nastavení.
- Multi-tenant architekturu nad Supabase PostgreSQL.
- Bezpečnostní pravidla pro tenant izolaci, Zod validaci a server-side autorizaci.
- Automatické kontroly: unit/integration testy, migrace, type-check, lint, build a Playwright smoke.
- Vercel production deployment s bezpečnými hlavičkami a externě ověřeným public smoke testem.

Aktuální proof point: `556` Vitest testů plus Playwright smoke pro veřejné demo.

## Stack

| Vrstva | Technologie |
| --- | --- |
| Frontend | Next.js 16, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Next.js Server Actions, API Routes |
| Databáze | Supabase PostgreSQL |
| Auth | Supabase Auth |
| E-mail | Resend |
| Platby | Stripe připravený ve flow, produkční zapnutí až po env/runtime kontrole |
| Hosting | Vercel |
| Rate limit | Upstash Redis |
| Validace | Zod |

## Lokální spuštění

```bash
npm install
npm run dev
```

Lokální web běží na:

```text
http://localhost:3000
```

Bez Supabase env proměnných aplikace používá demo fallback pro veřejný booking. Reálný runtime vyžaduje hodnoty z `.env.local.example`.

## Kontroly

```bash
npm run check
npm run test:e2e
npm audit --audit-level=moderate
```

`npm run check` spouští:

- `vitest run`
- kontrolu migrací
- TypeScript type-check
- ESLint
- produkční Next.js build

Externí smoke proti Vercelu:

```bash
PLAYWRIGHT_BASE_URL=https://rezervacni-system-xi.vercel.app npx playwright test tests/e2e/public-smoke.spec.ts
```

## Dokumentace

Aktivní dokumentace je v `docs/`. Starší analýzy a design audity jsou v `docs/archive/`.

Nejdůležitější soubory:

- `docs/README.md` - mapa dokumentace.
- `docs/handoff.md` - rychlý kontext pro navázání práce.
- `docs/implementation-progress.md` - aktuální implementační stav.
- `docs/runtime-checklist.md` - env, deploy a runtime ověření.
- `docs/manual-test-plan.md` - ruční proklikávací scénáře.
- `docs/project-review.md` - aktuální project/code/UI/UX review.
- `docs/15-design-system-v3.md` - aktivní vizuální směr.
- `docs/08-mvp-scope.md` - pre-launch MVP scope.
- `docs/20-competitive-analysis-booking-systems-2026.md` - konkurenční gapy.

## Deployment

Production deploy běží na Vercelu:

```text
https://rezervacni-system-xi.vercel.app
```

Aktuální production demo běží bez produkčních Supabase/Resend/Stripe/Upstash env, proto `/api/health` vrací `degraded`. To je pro portfolio demo očekávané. Endpoint nevrací názvy ani hodnoty secret env proměnných.

## Repo poznámky

- `.env.local` se necommituje.
- `.vercel`, `.next`, coverage reporty, Playwright reporty a test-results jsou ignorované.
- `AGENTS.md` obsahuje pracovní a bezpečnostní pravidla pro Codex.
- Při změnách databáze je zdrojem pravdy `supabase/migrations`.
