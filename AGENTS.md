# AGENTS.md – Instrukce pro Codex CLI
# Temaro – univerzální SaaS booking platforma

Tento soubor čte Codex CLI automaticky při každé session.
Přečti ho celý před každou akcí.

---

## Projekt

- **Název:** Temaro
- **Typ:** Multi-tenant SaaS
- **Cíl:** Univerzální rezervační systém pro jakýkoliv podnik (barbershopy, salony, lékaři, trenéři, autoservisy...)
- **Aktuální fáze:** MVP vývoj
- **Dokumentace:** Aktivní zdroje pravdy jsou v `/docs`; historické analýzy a design audity jsou v `/docs/archive`

---

## Tech Stack

| Vrstva | Technologie |
|---|---|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | Next.js Server Actions + API Routes |
| Databáze | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Email | Resend |
| Platby | Stripe / platební brána – nově součást pre-launch MVP, implementovat až po návrhu bezpečného flow |
| CDN/WAF | Cloudflare |
| Hosting | Vercel |
| Rate limit | Upstash Redis |
| Validace | Zod (všude – bez výjimky) |
| ORM | Supabase JS client (typovaný) |

---

## Struktura projektu

```
/app
  /(auth)           – přihlášení, registrace
  /(dashboard)      – admin panel (chráněno auth)
    /calendar       – kalendář rezervací
    /clients        – správa klientů
    /services       – správa služeb
    /staff          – správa zaměstnanců
    /settings       – nastavení podniku
  /(booking)        – veřejná booking stránka pro klienty
    /[slug]         – booking stránka konkrétního podniku
/components
  /ui               – shadcn/ui komponenty
  /calendar         – kalendářové komponenty
  /booking          – booking flow komponenty
/lib
  /supabase         – supabase client (server + client)
  /validations      – Zod schémata
  /utils            – pomocné funkce
/types              – TypeScript typy
/supabase
  /migrations       – DB migrace
/tests              – testy
/proxy.ts           – auth + tenant kontrola
.codex/agents/      – konfigurace subagentů
```

---

## SUBAGENTI – POVINNÉ POUŽITÍ

Codex CLI má k dispozici specializované subagenty v `.codex/agents/`.
Používej je aktivně – paralelizují práci a zajišťují kvalitu.

> Poznámka pro Codex v prostředích, kde jsou subagenti omezení systémem:
> pokud nástroj subagentů není dostupný nebo jej aktuální systémové instrukce nedovolují spustit bez explicitního požadavku uživatele,
> pokračuj lokálně, ale dodrž stejný kontrolní postup: průzkum, implementace, testy, bezpečnostní kontrola, dokumentace.

### Kdy spustit který subagent

#### explorer – před každou větší implementací
```
"Použij explorer agenta a zmapuj strukturu projektu
 relevantní pro implementaci [FEATURE]."
```
Kdy: Vždy před implementací nové feature nebo před refactoringem.
Model: gpt-5.4-mini (rychlý, levný, read-only)

#### security-auditor – průběžně a před deployem
```
"Spusť security-auditor na soubory které jsme
 dnes upravili. Hledej bezpečnostní problémy."
```
Kdy:
- Po každých 5 nových/upravených endpointech
- Před každým deployem na produkci
- Kdykoli máš pochybnosti o bezpečnosti
Model: gpt-5.4 s high reasoning (bezpečnost vyžaduje pečlivost)

#### test-writer – po každé nové feature
```
"Spusť test-writer a napiš testy pro endpoint
 POST /api/bookings který jsme právě vytvořili."
```
Kdy: Po implementaci každého nového endpointu nebo Server Action.
Model: gpt-5.4 medium reasoning

#### db-migrator – při změnách databáze
```
"Spusť db-migrator a vytvoř migraci pro přidání
 tabulky client_photos podle docs/06-databazovy-model.md."
```
Kdy: Vždy při přidávání nebo změně DB schématu.
Model: gpt-5.4 s high reasoning (chyba v migraci = průšvih)

---

### Paralelní spouštění subagentů

Pro komplexní úkoly spouštěj více subagentů najednou:

```
"Implementuj feature klientských poznámek.
 Spusť paralelně:
 1. explorer → zmapuj existující client soubory
 2. db-migrator → vytvoř migraci pro tabulku client_notes
 Počkej na výsledky, pak implementuj endpoint a komponenty.
 Po implementaci spusť test-writer a security-auditor."
```

### Typický workflow pro novou feature

```
1. explorer zmapuje strukturu
        ↓ (paralelně)
2. db-migrator vytvoří migraci
        ↓
3. Implementace endpointu + komponenty (hlavní agent)
        ↓ (paralelně)
4. test-writer napíše testy
5. security-auditor zkontroluje bezpečnost
        ↓
6. Výsledky zkontroluj a schval
```

---

## PRŮBĚŽNÁ DOKUMENTACE – POVINNÉ, ABY SE NEZTRATIL KONTEXT

Dokumentaci aktualizuj průběžně při každé smysluplné změně. Cíl: po přerušení práce musí jít kdykoli navázat bez ztráty kontextu.

### Vždy aktualizuj tyto soubory

- `docs/implementation-progress.md`
  - hlavní pravda o tom, co je hotové,
  - aktuální počet testů,
  - poslední technické zpevnění,
  - známé limity a další kroky.
- `docs/handoff.md`
  - rychlý navazovací kontext,
  - co se právě změnilo,
  - poslední ověření,
  - co dělat dál.
- `docs/runtime-checklist.md`
  - kroky pro pozdější reálný Supabase/runtime test,
  - env požadavky,
  - migrace a ověřovací příkazy.
- `docs/manual-test-plan.md`
  - pokud změna vyžaduje pozdější ruční ověření v prohlížeči,
  - přidej přesný postup krok za krokem.
- `restart-rezervacni-system.txt`
  - jednoduchý restart prompt přímo v kořeni projektu,
  - musí být použitelný po vypnutí/zapnutí počítače pro rychlé navázání,
  - aktualizuj ho průběžně stejně jako handoff dokumentaci.
- `/mnt/c/Users/hanys/Desktop/restart-rezervacni-system.txt`
  - kopie restart promptu na ploše,
  - udržuj stejný obsah jako projektový `restart-rezervacni-system.txt`.

### Kdy dokumentovat

- Po každé nové feature.
- Po každém bezpečnostním nebo UX zpevnění.
- Po každé změně testů nebo počtu testů.
- Po každé změně migrací nebo runtime/env požadavků.
- Po každém novém známém omezení, blockeru nebo ručním testovacím kroku.
- Po každé změně, která mění restartovací kontext další session.

### Jak dokumentovat

- Piš stručně, věcně a česky.
- Nepiš dlouhé deníkové zápisy.
- Zapisuj hlavně dopad: co je teď bezpečnější, co je ověřené, co zbývá.
- Když projde `npm run check`, aktualizuj počet testů a poslední ověření.
- Restart prompt piš jednoduše, jako instrukce pro další session: kde je projekt, co přečíst, co spustit, aktuální stav, co nedělat a co dělat dál.
- Nikdy nenechávej dokumentaci ve stavu, který odporuje kódu nebo testům.

---

## KOMUNIKACE S UŽIVATELEM – NERUŠIT PŘI PRÁCI

Uživatel nechce průběžné reporty do chatu. Pracuj autonomně a nepiš průběžné zprávy.

Do chatu piš jen tehdy, když:

- je skutečný blocker,
- je potřeba ruční vstup uživatele,
- je potřeba ruční ověření a musíš dát přesný postup krok za krokem,
- uživatel se přímo zeptá na stav nebo výsledek.

Nepiš ani potvrzovací zprávy typu „Pokračuju dál“. Po pokynu pokračovat rovnou pracuj.

Běžné průběžné informace, hotové dílčí změny, počty testů a technické poznámky zapisuj do dokumentace v `docs/`, ne do chatu.

---

## BEZPEČNOSTNÍ PRAVIDLA – ABSOLUTNÍ, BEZ VÝJIMEK

### #1 – tenant_id VŽDY z JWT tokenu

```typescript
// ✅ SPRÁVNĚ
const { data: { user } } = await supabase.auth.getUser()
const tenantId = user?.app_metadata?.tenant_id

// ❌ NIKDY TAKTO
const tenantId = params.tenantId        // z URL
const tenantId = body.tenantId          // z request body
const tenantId = searchParams.tenantId  // z query stringu
```

### #2 – Každý endpoint má auth check jako PRVNÍ věc

```typescript
export async function POST(request: Request) {
  // 1. Auth check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user || authError) return new Response('Unauthorized', { status: 401 })

  // 2. Tenant check
  const tenantId = user.app_metadata?.tenant_id
  if (!tenantId) return new Response('Forbidden', { status: 403 })

  // 3. Validace vstupu
  const body = await request.json()
  const parsed = MySchema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  // 4. Business logika s tenant_id
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('tenant_id', tenantId)
}
```

### #3 – Zod validace VŠECH vstupů

```typescript
const CreateBookingSchema = z.object({
  service_id: z.string().uuid(),
  staff_id: z.string().uuid(),
  starts_at: z.string().datetime(),
  client_name: z.string().min(1).max(100),
  client_phone: z.string().min(9).max(20).optional(),
  client_email: z.string().email().optional(),
  notes: z.string().max(500).optional(),
})
```

### #4 – Error responses nikdy neodhalují interní info

```typescript
// ✅ Správně
return new Response('Something went wrong', { status: 500 })

// ❌ Nikdy
return new Response(error.message, { status: 500 })
return new Response(JSON.stringify(error), { status: 500 })
```

### #5 – Žádné citlivé hodnoty v kódu

```typescript
// ✅ Správně
const apiKey = process.env.RESEND_API_KEY

// ❌ Nikdy
const apiKey = 're_abc123...'
```

### #6 – Kontrola role pro admin akce

```typescript
const userRole = user.app_metadata?.role
if (userRole !== 'owner') {
  return new Response('Forbidden', { status: 403 })
}
```

---

## DATABÁZOVÁ PRAVIDLA

### Vždy filtruj podle tenant_id

```typescript
const { data } = await supabase
  .from('clients')
  .select('*')
  .eq('tenant_id', tenantId)  // ← POVINNÉ
  .eq('id', clientId)
```

### Ceny vždy v haléřích/centech (INTEGER)

```typescript
// 4500 = 45,00 Kč
const priceInHalere = Math.round(parseFloat(price) * 100)
```

### Race conditions v rezervacích

```typescript
// Použij Supabase RPC pro atomické vytvoření rezervace
const { data, error } = await supabase.rpc('create_booking', {
  p_tenant_id: tenantId,
  p_staff_id: staffId,
  p_service_id: serviceId,
  p_starts_at: startsAt,
  p_ends_at: endsAt,
})
```

---

## KÓDOVACÍ STANDARDY

- Strict TypeScript – žádný `any`
- Funkcionální komponenty, žádné třídy
- Server Components pro data fetching, Client Components jen pro interakci
- Soubory: `kebab-case.ts` | Komponenty: `PascalCase.tsx` | Proměnné: `camelCase`
- DB tabulky: `snake_case` | Konstanty: `UPPER_SNAKE_CASE`

### Struktura každého endpointu (povinné pořadí)
1. Auth check
2. Tenant check
3. Role check (pokud potřeba)
4. Validace vstupu (Zod)
5. Business logika
6. Error handling
7. Return response

---

## DOKUMENTACE K PŘEČTENÍ

Před implementací vždy přečti relevantní soubory:

```
docs/06-databazovy-model.md    – struktura všech tabulek
docs/07-user-flows.md          – jak flows fungují
docs/08-mvp-scope.md           – co je a není v MVP
docs/02-funkce-a-diferenciace.md – feature list
docs/14-market-analysis-booking-systems.md – trh, must-have gapy a diferenciace
docs/15-design-system-v3.md     – aktuální vizuální směr
docs/business-model.md          – pricing/GTm rámec
```

---

## PRE-LAUNCH MVP SCOPE

Rozhodnutí 2026-05-08: konkurenčně důležité funkce jsou součástí pre-launch MVP. Neimplementuj je chaoticky najednou; řeš je po vrstvách podle `docs/08-mvp-scope.md`, `docs/roadmap.md` a `docs/20-competitive-analysis-booking-systems-2026.md`.

Součást pre-launch MVP:

- ✅ Stripe/platební brána pro online zálohy a platby
- ✅ produkční SMS notifikace přes konkrétního providera
- ✅ Google/Outlook Calendar sync
- ✅ plný booking widget / iframe
- ✅ waitlist, Last Minute a empty-slot recovery
- ✅ POS/pokladna minimum, účtenky, sklad minimum
- ✅ vouchery, permanentky, kredity, balíčky a memberships
- ✅ katalog/discovery, mapa, recenze a marketingové kampaně
- ✅ mobilní/PWA vrstva
- ✅ více poboček, resources/místnosti a skupinové kapacity

Záměrně mimo pre-launch MVP zůstává:

- ❌ provizní marketplace, který bere provizi z vlastních klientů podniku
- ❌ AI funkce bez konkrétního provozního workflow a bezpečnostního návrhu
- ❌ cokoliv, co obchází tenant izolaci, Zod validaci, audit a bezpečné error handling

---

## PŘI NEJASNOSTECH

1. Zeptej se PŘED implementací, ne po
2. Raději jeden konkrétní dotaz než špatná implementace
3. Pokud si nejsi jistý bezpečnostním aspektem → vždy spusť security-auditor
4. Nikdy neimplementuj "rychlé řešení" které obchází bezpečnost

---

## PROSTŘEDÍ

```bash
npm install      # instalace závislostí
npm run dev      # dev server
npm run type-check
npm run lint
npm run build
```

Env proměnné v `.env.local` (nikdy do kódu):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
```
