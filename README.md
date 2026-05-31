# Temaro – Projektová dokumentace

Temaro je univerzální SaaS rezervační systém pro lokální služby.

Brand assety jsou v `public/brand` jako transparentní SVG:

- `temaro-mark.svg` - samotný logomark.
- `temaro-logo.svg` - horizontální logo pro světlé pozadí.
- `temaro-logo-light.svg` - horizontální logo pro tmavé pozadí.
Aktuální positioning: méně telefonátů, klidnější provoz, bez marketplace provizí z vlastních klientů.

---

## Struktura projektu

```
rezervacni-system/
├── AGENTS.md              ← Codex CLI čte automaticky (instrukce + bezpečnost)
├── README.md              ← Tento soubor
└── docs/
    ├── 02-funkce-a-diferenciace.md – Feature list + co máme navíc
    ├── 03-architektura.md          – Aktuální technická architektura
    ├── 06-databazovy-model.md      – Kompletní DB schema (SQL)
    ├── 07-user-flows.md            – Všechny flows (klient, admin, staff)
    ├── 08-mvp-scope.md             – Co je v MVP, pořadí vývoje
    ├── 14-market-analysis-booking-systems.md – Tržní analýza, must-have gapy a diferenciace
    ├── 15-design-system-v3.md      – Aktuální vizuální směr Temaro Signal OS
    ├── 15-performance-audit.md     – Lighthouse audit landing page
    ├── business-model.md           – Aktuální pricing/GTm rámec
    ├── handoff-2026-04-26.md       – Kontext pro navázání další den
    ├── implementation-progress.md  – Aktuální stav implementace
    ├── roadmap.md                  – Aktuální produktová roadmapa
    ├── manual-test-plan.md         – Přesný ruční testovací scénář na později
    ├── runtime-checklist.md        – Jednoduchý checklist pro reálné ověření
    └── archive/                    – Historické analýzy, design audity a paletové náhledy
```

---

## Rychlý přehled projektu

- **Typ:** Multi-tenant SaaS
- **Název produktu:** Temaro
- **Cíl:** Univerzální rezervační systém pro služby (barbershopy, salony, lékaři, trenéři...)
- **Hlavní diferenciace:** Anti-no-show ochrana, klientská paměť, flat fee bez marketplace provizí
- **Stack:** Next.js 16 + Supabase + Resend + Cloudflare + Vercel
- **Stav:** MVP základ je implementovaný; strategické gapy pro placený pilot jsou popsané v `docs/14-market-analysis-booking-systems.md`
- **Design:** Aktuální zdroj pravdy je `docs/15-design-system-v3.md` – Temaro Signal OS. Starší design audity jsou v `docs/archive/`.
- **Business:** Aktuální pricing/GTm rámec je v `docs/business-model.md`.

---

## Lokální spuštění

```bash
npm install
npm run dev
```

Web běží na:

```text
http://localhost:3000
```

Bez Supabase env proměnných se spustí demo režim s ukázkovými daty.

---

## Kontroly před předáním

```bash
npm run check
npm run env:check
npm run migrations:check
npm run migrations:list
npm test
npm run type-check
npm run lint
npm run build
```

Po nahrani na GitHub je pripraveny workflow `.github/workflows/check.yml`, ktery spousti `npm run check`.

---

## Jak pokračovat ve vývoji

1. Otevři terminál v kořeni projektu
2. Spusť `codex` – automaticky načte `AGENTS.md`
3. Před větší změnou čti relevantní dokumentaci v `docs/`
4. Aktuální stav práce je v `docs/implementation-progress.md`

---

## Fáze vývoje

### MVP (aktuální fáze)
Auth → Staff + Služby → Booking flow → Kalendář → Klientské profily → Notifikace → Audit historie

### Fáze 2
SMS nebo Stripe zálohy podle pilotní poptávky → branding booking profilu → widget/iCal → reporting

### Fáze 3+
Google/Outlook sync → waitlist → vouchery/permanentky → AI funkce → marketplace → více poboček
