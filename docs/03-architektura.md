# Architektura

Aktualizováno: 2026-05-08

## Stack

| Vrstva | Technologie |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend | Next.js Server Actions, API Routes |
| Databáze | Supabase PostgreSQL, RLS, SQL migrace |
| Auth | Supabase Auth |
| Email | Resend |
| Rate limit | Upstash Redis |
| Hosting | Vercel |
| CDN/WAF | Cloudflare |
| Validace | Zod |
| Testy | Vitest, Testing Library |

Konkrétní SMS provider, plný Google/Outlook sync, marketplace, AI a skupinové kapacity nejsou v MVP implementované. Stripe zálohy, provider-agnostic SMS webhook základ, iCal read-only export, plný iframe widget, booking button embed a pobočky jsou implementované jako první vrstvy. Booking share kit generuje Instagram texty a QR přes `chart.googleapis.com`. Google OAuth je připravené pro podnikové i zákaznické účty přes Supabase Auth.

## Multi-tenancy

Model je shared database + `tenant_id`.

Základní pravidla:

- Každá tenantová tabulka má `tenant_id`.
- `tenant_id` se bere z JWT `app_metadata.tenant_id`, nikdy z URL/body/query.
- Owner/staff role se bere z `app_metadata.role`.
- Staff účet má navíc aktivní `staff_id` a vidí jen vlastní rezervace.
- Supabase RLS je databázová pojistka, aplikační filtry jsou povinné také.

## Hlavní vrstvy aplikace

- `app/(auth)` řeší registraci, login a callback.
- `app/account` je zákaznický účet; používá ověřený auth e-mail, ne tenant ID z URL, a zobrazuje jen omezený read-only přehled rezervací.
- Google OAuth registrace používá krátkodobou HTTP-only pending cookie a tenant vytváří až v `/auth/callback` po ověření uživatele.
- `app/(dashboard)` je chráněný admin/staff panel.
- `app/(booking)` je veřejná booking a self-service část.
- `app/calendar-feed/[token]` je veřejný read-only `.ics` endpoint; autorizace stojí na neuhodnutelném tokenu, jehož hash je uložený v databázi.
- `public/embed/booking-button.js` je veřejný statický skript pro vložení booking CTA na web podniku.
- `components/ui` drží sdílené UI prvky.
- `components/booking`, `components/calendar`, `components/dashboard` drží produktové části.
- `lib/supabase` drží server/client/admin klienty.
- `lib/validations` drží Zod schémata a sdílené limity.
- `lib/calendar/ical.ts` generuje iCal feed a feed tokeny.
- `lib/booking/embed.ts` generuje bezpečný embed snippet pro booking tlačítko.
- `supabase/migrations` je jediný zdroj pravdy pro databázové změny.

## Bezpečnostní pořadí endpointů/actions

1. Auth check.
2. Tenant check.
3. Role/staff check, pokud je potřeba.
4. Zod validace vstupu.
5. Business logika s tenant filtrem.
6. Bezpečné error response bez interních detailů.
7. Revalidace/cache refresh až po úspěšném zápisu.

## Runtime závislosti

Povinné pro reálný provoz:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

Volitelné podle testované části:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `SMS_REMINDERS_ENABLED`
- `SMS_WEBHOOK_URL`
- `SMS_WEBHOOK_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `CRON_SECRET`

## Migrace

Používat pouze jednotlivé soubory v `supabase/migrations` ve vzestupném pořadí.

Starý spojený export `supabase/combined-migrations.sql` byl odstraněný, aby nevznikl falešný zdroj pravdy.

## Ověření

Před předáním spouštět:

```bash
npm run check
```

Pro reálný Supabase runtime postupovat podle `docs/runtime-checklist.md`.
