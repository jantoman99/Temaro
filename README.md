# Temaro

**Multi-tenant SaaS rezervační platforma pro lokální služby.** Temaro řeší online rezervace, týmový kalendář, klienty, platby, notifikace a provozní nastavení pro salony, barbery, ordinace, trenéry, konzultanty a další služby bez marketplace provizí.

Projekt vznikl jako AI-assisted build s Codexem. Cílem bylo postavit reálnější SaaS MVP než jen landing page: s produkčním deploymentem, tenant izolací, databázovými migracemi, testy, bezpečnostními pravidly a dokumentovaným runtime postupem.

Live demo: https://rezervacni-system-xi.vercel.app  
Demo booking flow: https://rezervacni-system-xi.vercel.app/demo-barber

## Proč tenhle projekt

Temaro je portfolio projekt zaměřený na schopnost rychle navrhnout, implementovat a ověřit komplexnější webovou aplikaci. Ukazuje práci s moderním Next.js stackem, server-side autorizací, Supabase databází, public booking flow, admin dashboardem a bezpečnostními guardy potřebnými pro multi-tenant produkt.

Nejde o statickou ukázku. Aplikace má veřejný marketing web, demo rezervační průchod, přihlášení, onboarding podniku, dashboard, správu služeb, tým, klienty, kalendář, booking stránku, integrace a produkční Vercel deploy.

## Highlights

- **Multi-tenant architektura**: tenant kontext je odvozovaný z auth/JWT metadata, ne z URL/body vstupů.
- **Veřejný booking flow**: služba, zaměstnanec, termín, kontakt, potvrzení a self-service správa rezervace.
- **Admin provozní vrstva**: dashboard, kalendář, klienti, služby, tým, pracovní doba, nastavení a booking stránka.
- **Bezpečnostní baseline**: Zod validace vstupů, tenant-only dotazy, role checks, safe error responses a RLS-first databázový model.
- **Platby a notifikace**: Stripe/Resend/SMS/cron flow jsou připravené za runtime env kontrolou.
- **Integrace**: iCal feed, iframe widget, partner API klíče hashované v databázi a read-only partner endpoint.
- **Ověření**: `npm run check` pokrývá Vitest suite, migrace, TypeScript, lint a produkční build.
- **Dokumentace**: aktivní docs pro architekturu, runtime checklist, manuální testy, scope, roadmapu a handoff.

## Stack

| Vrstva | Technologie |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Server Actions, Route Handlers, Supabase JS client |
| Databáze | Supabase PostgreSQL, migrations, RLS |
| Auth | Supabase Auth |
| Validace | Zod |
| E-mail | Resend |
| Platby | Stripe Checkout/webhook flow |
| Rate limit | Upstash Redis |
| Hosting | Vercel |
| Testy | Vitest, Playwright, ESLint, TypeScript |

## Funkční rozsah

Hotové nebo připravené v MVP vrstvě:

- veřejný marketing web a demo booking,
- registrace/přihlášení podniku,
- onboarding nového podniku,
- služby, tým, pracovní doba a výjimky,
- admin kalendář a ruční rezervace,
- klienti, historie, poznámky a preference,
- veřejná booking stránka podniku,
- self-service zrušení/přesun rezervace,
- e-mailové notifikace a reminder flow,
- Stripe zálohy přes checkout flow,
- iCal export kalendáře,
- iframe booking widget,
- partner API minimum,
- health endpoint a runtime env check.

Některé produkční integrace jsou záměrně za env/runtime kontrolou. Demo je optimalizované pro bezpečné portfolio zobrazení, ne pro okamžitý placený pilot.

## Lokální spuštění

```bash
npm install
npm run dev
```

Lokální URL:

```text
http://localhost:3000
```

Bez Supabase env proměnných běží veřejná část v demo fallback režimu. Reálný runtime vyžaduje hodnoty podle `.env.local.example`.

## Kontroly

```bash
npm run check
npm run test:e2e
npm audit --audit-level=moderate
```

`npm run check` spouští:

- `vitest run`,
- kontrolu databázových migrací,
- TypeScript type-check,
- ESLint,
- produkční Next.js build.

Externí smoke proti Vercelu:

```bash
PLAYWRIGHT_BASE_URL=https://rezervacni-system-xi.vercel.app npx playwright test tests/e2e/public-smoke.spec.ts
```

Poslední zdokumentované lokální ověření: `npm run check` prošlo 2026-06-06 s `593` Vitest testy, kontrolou migrací, type-checkem, lintem a produkčním buildem. Public smoke prošel `10/10`.

## Bezpečnostní principy

Projekt je navržený tak, aby bezpečnost nebyla dodatečná dekorace:

- `tenant_id` se bere z ověřeného auth kontextu/JWT metadata,
- vstupy pro mutace a API routy validuje Zod,
- databázové dotazy jsou tenant-scoped,
- admin akce kontrolují roli,
- interní chyby se neposílají klientovi,
- secrets jsou pouze v env proměnných,
- `.env.local`, `.vercel`, `.next`, coverage a Playwright reporty nejsou commitované.

## Dokumentace

Aktivní dokumentace je v `docs/`. Archiv starších analýz a design auditů je v `docs/archive/`.

Nejdůležitější soubory:

- `docs/README.md` - mapa dokumentace,
- `docs/handoff.md` - rychlý kontext pro navázání práce,
- `docs/implementation-progress.md` - aktuální implementační stav,
- `docs/runtime-checklist.md` - env, deploy a runtime ověření,
- `docs/manual-test-plan.md` - ruční proklikávací scénáře,
- `docs/project-review.md` - project/code/UI/UX review,
- `docs/08-mvp-scope.md` - pre-launch MVP scope,
- `docs/15-design-system-v3.md` - aktivní vizuální směr,
- `docs/20-competitive-analysis-booking-systems-2026.md` - konkurenční gapy.

## Deployment a demo režim

Production demo běží na Vercelu:

```text
https://rezervacni-system-xi.vercel.app
```

Portfolio demo může běžet i bez všech produkčních Supabase/Resend/Stripe/Upstash env. Pokud některá integrační env chybí, aplikace má demo fallback nebo ukáže omezený stav. `/api/health` nevrací názvy ani hodnoty secret proměnných.

## Repo poznámky

- `.env.local` se necommituje.
- Zdroj pravdy pro databázové změny je `supabase/migrations`.
- `AGENTS.md` obsahuje pracovní a bezpečnostní pravidla pro vývoj s Codexem.
- Projekt je pořád pre-launch MVP, ne hotový komerční SaaS provoz.
