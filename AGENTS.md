# AGENTS.md – Temaro
Piš česky, stručně a věcně.

## Projekt a stack
- Temaro: multi-tenant SaaS booking platforma pro služby; fáze MVP/pre-launch.
- Docs: aktivní `/docs`, archiv `/docs/archive`.
- Frontend: Next.js 16, TypeScript, Tailwind CSS, shadcn/ui.
- Backend/data: Server Actions, API Routes, Supabase PostgreSQL/Auth, typovaný Supabase JS client.
- Integrace: Resend, Stripe, Cloudflare, Vercel, Upstash Redis; validace Zod všude.

## Struktura projektu
```
/app
  /(auth), /(dashboard), /(booking)/[slug]
/components/ui, /components/calendar, /components/booking
/lib/supabase, /lib/validations, /lib/utils
/types, /tests, /supabase/migrations
/proxy.ts
```

## Workflow
- Před implementací zmapuj relevantní soubory pomocí `rg`, `sed`, `ls`.
- Implementuj podle existujících vzorů; žádné nové abstrakce bez důvodu.
- Přidej/uprav testy podle rizika změny.
- Zkontroluj bezpečnost: tenant izolace, Zod, role, error handling.
- Aktualizuj dokumentaci jen při smysluplné změně.

## Dokumentace a komunikace
- Po feature/security/UX/runtime změně aktualizuj: `docs/implementation-progress.md`, `docs/handoff.md`, `docs/runtime-checklist.md`, případně `docs/manual-test-plan.md`.
- Restart prompt drž mimo repo.
- Po úspěšném `npm run check` zapiš počet testů a poslední ověření.
- Dokumentace nesmí odporovat kódu.
- Pracuj autonomně a udržuj komunikaci stručnou.
- Finální odpověď vždy zakonči krátkým review: co se udělalo v posledním promptu, co bylo ověřeno/commitnuto/pushnuto a co nás čeká dál.

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

## Databázová pravidla
- Vždy filtruj podle `tenant_id`: `supabase.from('clients').select('*').eq('tenant_id', tenantId).eq('id', clientId)`.
- Ceny ukládej jako INTEGER v haléřích/centech: `4500 = 45,00 Kč`; `Math.round(parseFloat(price) * 100)`.
- Rezervace vytvářej atomicky přes RPC `create_booking`, ne ručním select + insert flow.

## Kódovací standardy
- Strict TypeScript; žádný `any`.
- Funkcionální komponenty; Server Components pro data fetching; Client Components jen pro interakci.
- Soubory `kebab-case.ts`; komponenty `PascalCase.tsx`; proměnné `camelCase`.
- DB tabulky `snake_case`; konstanty `UPPER_SNAKE_CASE`.
- Endpoint pořadí: auth check → tenant check → role check → Zod validace → business logika → error handling → response.

## Dokumenty a pre-launch scope
- Před změnou čti relevantní: `docs/06-databazovy-model.md`, `docs/07-user-flows.md`, `docs/08-mvp-scope.md`, `docs/02-funkce-a-diferenciace.md`, `docs/14-market-analysis-booking-systems.md`, `docs/15-design-system-v3.md`, `docs/business-model.md`.
- Součást scope: Stripe platby, produkční SMS, Google/Outlook sync, iframe widget, waitlist, Last Minute, empty-slot recovery, POS minimum, účtenky, sklad minimum, vouchery/permanentky/kredity/balíčky/memberships, katalog/discovery, mapa, recenze, kampaně, PWA, více poboček, resources a skupinové kapacity.
- Mimo scope: provizní marketplace z vlastních klientů, AI bez konkrétního bezpečného workflow, cokoliv bez tenant izolace/Zod/auditu/bezpečných chyb.
- Implementuj po vrstvách podle `docs/08-mvp-scope.md`, `docs/roadmap.md`, `docs/20-competitive-analysis-booking-systems-2026.md`.

## Prostředí a env
```bash
npm install
npm run dev
npm run type-check
npm run lint
npm run build
```
Env v `.env.local`, nikdy do kódu: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_APP_URL`, `CRON_SECRET`.
