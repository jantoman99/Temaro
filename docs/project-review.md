# Project Review

Aktualizováno: 2026-06-08 19:10 CEST

## Shrnutí

Temaro je jako portfolio a pre-launch MVP silný projekt: nejde jen o landing page, ale o multi-tenant SaaS s auth, tenant izolací, veřejným bookingem, admin dashboardem, kalendářem, klienty, platbami, notifikacemi, katalogem, embed widgetem, PWA základem, migracemi, testy a runtime dokumentací.

Nejbližší riziko není nedostatek funkcí. Riziko je šířka scope, produkční runtime připravenost a to, že první reálný pilot musí projít menším ověřeným flow, ne všemi moduly najednou.

## Ověření

- `npx playwright test tests/e2e/admin-demo-smoke.spec.ts` prošlo 2026-06-08: 2/2.
- `npm run check` prošlo 2026-06-08 19:05 CEST: 593 Vitest testů, migrations check, type-check, lint a produkční build.
- Předchozí public smoke 2026-06-08 prošel 10/10 a hlídá `/demo-barber` bez 404 assetů a bez mobilního horizontálního overflow.

## Opraveno při review

- `docs/roadmap.md` je přepsaná do operativního `Now / Next / Later / Nedělat Teď`.
- Anonymní zákaznické routy `/account*` už proxy posílá na `/account/login`, ne na podnikatelský `/login`.
- Přidané testy pro customer account redirect v `tests/e2e/admin-demo-smoke.spec.ts` a aktualizované proxy unit testy.

## Findings

### P1: Produkční rate limit není vynucený

`/api/health` může hlásit `rate_limit.configured=false` a public booking rate limit při chybě nebo chybějícím Upstash env fail-open. Pro portfolio je to přijatelné, pro veřejný pilot ne.

Riziko: spam veřejných rezervací, waitlistu a auth flow.

Fix: před pilotem vyplnit `UPSTASH_REDIS_REST_URL` a `UPSTASH_REDIS_REST_TOKEN`, ověřit `/api/health`, a zvážit fail-closed režim pro produkci.

### P1: Produkční runtime flow není kompletně ručně ověřený

Automatika je dobrá, ale pilot vyžaduje ruční průchod s reálnými env: registrace, onboarding, služba, tým, booking stránka, rezervace, e-mail, kalendář, manage link, platba a storno/přesun.

Riziko: produkt vypadá hotově, ale první reálný uživatel narazí na env/provider detail.

Fix: držet se `docs/runtime-checklist.md` a neotevírat pilot, dokud neprojde malý end-to-end scénář.

### P1: SMS a OAuth jsou připravené technicky, ne provozně

SMS má provider-agnostic webhook základ, ale chybí konkrétní provider, pricing, env a reálný test. Google OAuth je v kódu, ale runtime aktivace je odložená až po produkční doméně a finálním Supabase/Google nastavení.

Riziko: v marketingu nebo pilotu slibovat víc, než je runtime zapnuté.

Fix: veřejně formulovat jako připravený modul nebo pre-launch krok, ne jako garantovanou produkční funkci.

### P2: Partner API vrací klientské PII přes dlouhodobý API klíč

`/api/partners/v1/bookings` je tenant-scoped a používá hashovaný API klíč se scope, ale vrací jméno, e-mail a telefon klienta. Než se dá externím partnerům, potřebuje rate limit, jasné scopes, audit čtení a ideálně možnost omezit pole.

Riziko: únik osobních údajů přes kompromitovaný partner token.

Fix: před externím použitím přidat rate limit, audit access event a volitelné `fields`/scope oddělení pro PII.

### P2: Embed CSP je záměrně široké

`/embed/booking/[slug]` používá `frame-ancestors *`, což odpovídá cíli vložitelného widgetu, ale je to široké bezpečnostní rozhodnutí.

Riziko: veřejný widget může vložit kdokoliv. Proto v něm nesmí být auth stav, interní data ani cookies-dependent chování.

Fix: ponechat pro MVP, ale před větším nasazením zvážit tenant allowlist domén.

### P2: Dokumentace je pořád dlouhá

Roadmapa je srovnaná, ale `docs/handoff.md` a `docs/runtime-checklist.md` pořád obsahují hodně historických záznamů.

Riziko: nový agent nebo člověk bude číst moc historie a hůř pozná aktuální stav.

Fix: držet krátký aktuální blok nahoře, historické detaily postupně přesouvat do archivu jen při reálné potřebě.

## Silné stránky

- Tenant izolace je v hlavních admin flows řešená přes auth metadata a tenant-scoped dotazy.
- Veřejné service-role flows používají slug/token/RPC pattern místo přijímání `tenant_id` z klienta.
- Testovací základ je nadprůměrný: Vitest, migrace, Playwright public smoke, opt-in authenticated smoke.
- README a public repo jsou vhodné pro recruiter/prospekt první dojem.
- Live demo má realistický veřejný booking flow a demo fallback bez zápisu do DB.
- Produkt má jasnou diferenciaci: vlastní klienti, žádná marketplace provize, provozní booking systém pro malé služby.

## Doporučené pořadí

1. Produkční runtime smoke s reálnými env.
2. Upstash rate limit a health ověření.
3. SMS provider rozhodnutí a jeden reálný SMS reminder test.
4. Pilotní scénář pro hair/beauty/wellness provoz.
5. Až potom Google/Outlook sync.

## Nedoporučené teď

- Nepřidávat další velké moduly.
- Neslibovat produkční SMS/OAuth/sync, dokud nejsou runtime ověřené.
- Nedělat další velký redesign veřejného webu bez screenshot/browser kontroly.
- Neotevírat marketplace ani AI funkce bez konkrétního bezpečného workflow.
