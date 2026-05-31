# 17 – Pre-launch hardening: cesta k 10/10

Datum: 2026-05-02
Stav: aktivní implementační plán pro Codex; A1 až A6.1 hotové lokálně, E2E smoke běží v Chromium, další krok je runtime/pilot proklik a volba další P0 vrstvy podle provozní bolesti
Navazuje na: `docs/16-design-trends-2026-implementation.md` (vizuální vrstva)
Doplňuje: `docs/03-architektura.md`, `AGENTS.md`

---

## 0. Kontext a realita

Současný stav projektu:

- Projekt běží **pouze lokálně** (vývojový stroj uživatele).
- Žádný deploy na Vercel ani jiný hosting.
- Žádná produkční Supabase DB.
- Žádní pilotní klienti.
- 381 automatických testů, MVP jádro implementované.

Tohle je **správná fáze pro hardening kódu**, ale **špatná fáze pro
provozní hardening** (monitoring, deploy automation, atd.). Některé
úkoly proto čekají, až bude co monitorovat.

---

## 1. Upřímný verdikt: cesta k 10/10

Aktuální celkové hodnocení projektu: **8.4/10**.

10/10 **nelze dosáhnout pouze lokálním vývojem**. Je to strop, který má
smysl mít na vědomí:

| Aspekt | Lokální strop | Po deployi a 5+ pilotech |
|---|---:|---:|
| Bezpečnost | 9.7/10 | 10/10 |
| Architektura | 9.5/10 | 9.5/10 |
| Kvalita kódu | 9/10 | 9/10 |
| Database design | 9/10 | 9.5/10 |
| Testy | 8.5/10 | 9.5/10 |
| Dokumentace | 9.5/10 | 9.5/10 |
| DevOps & CI/CD | 7/10 | 9.5/10 |
| Vizuální design | 9/10 (po doc 16) | 9/10 |
| SEO/GEO/AEO | 6/10 (po základech) | 9/10 |
| **Celkové skóre** | **9.0/10** | **9.5/10** |

Skutečné 10/10 SaaS produkty mají roky provozních dat, audit reporty
od třetích stran, certifikace (SOC 2), a tisíce klientů. To není cíl
této roadmapy. Reálný cíl tohoto dokumentu je **9.0/10 lokálně, 9.5/10
po prvním pilotu**.

---

## 2. Strategie: tři fáze hardeningu

### Fáze A – Lokální (teď, P0 + P1)

Co lze udělat **bez deploymentu**, jen úpravou kódu a konfigurace.
Posun z 8.4 → 9.0.

### Fáze B – Pre-deploy (až bude potřeba pustit ven)

Co je potřeba **těsně před prvním deployem**. Ještě bez klientů.
Posun z 9.0 → 9.3.

### Fáze C – Pre-pilot (před prvním placeným klientem)

Co je potřeba **před tím, než někdo zaplatí**. Provozní jistota.
Posun z 9.3 → 9.5.

Vše po Fázi C je „po prvním pilotovi“ a řeší se až podle reálné poptávky.

---

## 3. FÁZE A – Lokální hardening (dělat teď)

### TASK A1 – Content Security Policy (CSP)

**Stav:** Hotovo 2026-05-02. CSP je v `next.config.ts` a je krytá testem v `tests/hardening.test.ts`.

**Kategorie: S (jednoduchá změna)**
Důvod kategorie: jeden konfigurační soubor, zasáhne všechny routy přes
hlavičku, vyžaduje testování že nic neblokuje legitimní zdroje.

**Proč:**
CSP je 2026 standard pro XSS prevenci. Nestojí nic, dává Lighthouse plné
Best Practices skóre, brání injekci skriptů. Tvoje app už má skoro vše
potřebné (Next.js fonts, Lucide ikony – všechno self-hosted), takže CSP
bude relativně liberální a nic nerozbije.

**Kde:**
`next.config.ts` – do existujícího `headers()` bloku.

**Co bylo uděláno:**

Přidat `Content-Security-Policy` hlavičku se základní policy:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https://*.supabase.co blob:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
```

Také přidat `Strict-Transport-Security` pro HTTPS (až bude deploy):

```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Pravidla:**
- `unsafe-inline` u stylů je nutný kvůli Tailwindu a inline `style={}` v
  page.tsx (radial gradient pro tenant brand color). Časem řešit přes
  CSS proměnné nebo nonce.
- `unsafe-eval` u skriptů je nutný kvůli Next.js dev modu; pro production
  build se dá zúžit přes nonce.
- Test: spustit `npm run build && npm start` a ověřit v DevTools console,
  že žádný legitimní zdroj není blokovaný.
- Supabase Storage URL fallback je v public booking; CSP ho musí povolit.

**Akceptace:**
- `curl -I http://localhost:3000` ukazuje CSP hlavičku.
- DevTools console v dev i production buildu nemá CSP errors.
- Lighthouse Best Practices zůstává 100.

---

### TASK A2 – Sjednocení error handling pattern

**Stav:** Hotovo 2026-05-02. Sdílený helper je `lib/utils/post-commit.ts`; booking/calendar/manage actions používají `safePostCommit`.

**Kategorie: S (jednoduchá změna)**
Důvod kategorie: úprava existujících catch bloků, jeden helper, propisuje
se do několika Server Actions.

**Proč:**
Původně byl pattern `ignorePostCommitError` v `calendar/actions.ts`, ale
v `(booking)/[slug]/actions.ts` byly třikrát zopakované `try { ... } catch {}`
inline bloky. To nebylo konzistentní a komentáře v každém catch bloku byly
duplikované.

**Kde:**
- `lib/utils/post-commit.ts` – nový helper soubor
- `app/(booking)/[slug]/actions.ts`
- `app/(dashboard)/calendar/actions.ts`
- Případné další actions s post-commit pattern

**Co bylo uděláno:**

1. Lokální `ignorePostCommitError` byl nahrazen sdíleným helperem
   `lib/utils/post-commit.ts`.

2. Helper se jmenuje `safePostCommit`.

3. Refaktor inline `try/catch` v `(booking)/[slug]/actions.ts`:

   ```typescript
   // Před:
   try {
     await supabase.from("booking_events").insert({...});
   } catch {
     // Rezervace uz existuje; chyba auditni historie nesmi vratit klientovi neuspech.
   }

   // Po:
   await safePostCommit(async () => {
     await supabase.from("booking_events").insert({...});
   }, "booking_events insert");
   ```

4. Helper navíc loguje chybu na console.error v dev modu (pro debug),
   ale v production zůstává tichý (až na Sentry, který přijde ve Fázi C).

**Pravidla:**
- Žádná nová logic, jen refactor.
- Logování pouze přes `console.error`, žádná závislost na monitoring.
- `safePostCommit` musí přijmout jak sync, tak async funkci.

**Akceptace:**
- Žádný `try { ... } catch {}` inline blok v Server Actions s prázdným
  catch bodyem.
- `npm test` projde bez změny.
- V dev modu se chyba post-commit kroku objeví v console s popisem.

---

### TASK A3 – Health check endpoint

**Stav:** Hotovo 2026-05-02. Endpoint je `app/api/health/route.ts`, je dynamický a krytý testem v `tests/hardening.test.ts`.

**Kategorie: XS (minimální změna)**
Důvod kategorie: nový route soubor s 30 řádky kódu, bez závislostí na
zbytku aplikace, viditelný okamžitě v prohlížeči.

**Proč:**
I když teď nemáš deploy, health check je užitečný i lokálně pro:

- ověření, že env proměnné jsou správně načtené,
- verifikaci, že Supabase je dostupný,
- rychlý test, že migrace jsou aplikované,
- později jako cíl pro uptime monitoring (Better Uptime, Cronitor, atd.).

Tohle je 30 minut práce a šetří hodiny debug času později.

**Kde:**
`app/api/health/route.ts` – nový soubor.

**Co bylo uděláno:**

Endpoint `GET /api/health` vrací JSON:

```json
{
  "status": "ok" | "degraded" | "error",
  "timestamp": "2026-05-02T18:30:00.000Z",
  "checks": {
    "env": { "ok": true, "missing": [] },
    "supabase": { "ok": true, "latencyMs": 42 },
    "rate_limit": { "ok": true, "configured": true }
  },
  "version": "0.1.0"
}
```

Kontroly:

1. **env**: použít `hasSupabaseEnv()` + `hasSupabaseAdminEnv()`. Vrátit
   seznam chybějících proměnných (NEPOSÍLAT hodnoty, jen názvy).
2. **supabase**: jednoduchý `select 1` přes admin client, změřit latency.
3. **rate_limit**: ověřit, že Upstash URL/token jsou nastavené (ale nedělat
   skutečný request, abychom neplýtvali quotou).

Pravidla pro response:

- Pokud Supabase env chybí → `status: "degraded"` (běží demo režim).
- Pokud Supabase je nakonfigurovaný ale nedostupný → `status: "error"`.
- Pokud vše OK → `status: "ok"`.
- HTTP status: `200` pro ok i degraded, `503` pro error.

**Pravidla:**
- Endpoint NIKDY nesmí vrátit konkrétní env values, jen jejich přítomnost.
- Žádné DB credentials v error message.
- Bez auth – endpoint je veřejný, ale nesděluje nic citlivého.
- Nepoužívat na něj rate limit (uptime monitoring by ho zbytečně blokoval).

**Akceptace:**
- `curl http://localhost:3000/api/health` vrací validní JSON.
- V demo režimu (bez Supabase env) odpovídá `degraded`.
- S nakonfigurovaným Supabase odpovídá `ok`.
- Response time závisí na Supabase latenci; v lokálním WSL/Windows testu byl health funkční, ale Supabase ping může být pomalejší než 100 ms.

---

### TASK A4 – Dependabot konfigurace

**Stav:** Hotovo 2026-05-02. Konfigurace je v `.github/dependabot.yml`.

**Kategorie: XS (minimální změna)**
Důvod kategorie: jeden YAML soubor v `.github/`, žádný kód aplikace.

**Proč:**
Next.js 16, React 19, Supabase JS – všechno aktivně vyvíjené balíky.
Bez auto-update procesu se ti za 6 měsíců nahromadí 50+ updatů, mezi
kterými budou bezpečnostní záplaty pohřbené v noise feature releasů.

Dependabot nebo Renovate pošle PR pro každý update, ty si je projdeš
a smergneš nebo ignoruješ. To je rozdíl mezi „dělám hardening jednou za
půl roku v panice“ a „mám čistý lockfile pořád“.

**Kde:**
`.github/dependabot.yml` – nový soubor.

**Co:**

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 5
    groups:
      next:
        patterns:
          - "next"
          - "@next/*"
          - "eslint-config-next"
      react:
        patterns:
          - "react"
          - "react-dom"
          - "@types/react"
          - "@types/react-dom"
      supabase:
        patterns:
          - "@supabase/*"
      tailwind:
        patterns:
          - "tailwindcss"
          - "@tailwindcss/*"
          - "tw-animate-css"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "monthly"
```

**Pravidla:**
- Major updates ignorované – musí se schválit ručně po review changelogu.
- Grupování zabraňuje 20 jednotlivých PR pro každý malý balík.
- Github actions taky updatuj, ale jen měsíčně (méně rušivé).

**Akceptace:**
- Soubor existuje a je validní YAML.
- Po pushi do GitHubu Dependabot začne otevírat PR (pokud jsou dostupné).

---

### TASK A5 – Test coverage report v CI

**Stav:** Hotovo lokálně 2026-05-02. Script `npm run test:coverage` používá V8 provider; CI už může tento script přidat jako samostatný krok.

**Kategorie: XS (minimální změna)**
Důvod kategorie: úprava jednoho npm scriptu a jednoho YAML kroku.

**Proč:**
Aktuálně víš, že máš 381 testů, ale nevíš, co reálně testují. Coverage
report ti ukáže blind spots – třeba že `lib/email/booking-confirmation.ts`
není pokryté vůbec (mocky nepokrývají skutečné větve).

**Kde:**
- `package.json` – nový script
- `vitest.config.ts` – coverage config
- `.github/workflows/check.yml` – upload reportu

**Co:**

1. V `package.json` přidat:
   ```json
   "test:coverage": "vitest run --coverage"
   ```

2. V `vitest.config.ts` přidat coverage konfiguraci:
   ```typescript
   coverage: {
     provider: "v8",
     reporter: ["text", "html", "json-summary"],
     include: ["lib/**", "app/**"],
     exclude: [
       "**/*.test.ts",
       "**/types/**",
       "**/demo/**",
       ".next/**",
     ],
     thresholds: {
       lines: 70,
       functions: 70,
       branches: 60,
       statements: 70,
     },
   }
   ```

3. V `check.yml` přidat krok, který vypíše coverage summary do logu
   (komentář v PR až po deployi, teď stačí log).

**Pravidla:**
- Thresholds zatím nastavené nízko (60–70 %), aby CI neselhával hned.
- Postupně zvyšovat, ne zametat existující díry.
- Coverage report **neuploadovat na external services** (Codecov atd.)
  zatím; lokální HTML stačí.

**Akceptace:**
- `npm run test:coverage` generuje HTML report do `coverage/`.
- CI projde s thresholdy.
- Vidíš v konzoli, které soubory jsou pod 70 %.

---

### TASK A6 – E2E testy pro booking flow (Playwright)

**Stav:** Hotovo lokálně 2026-05-03. Chromium dependencies byly nainstalované do WSL přes `wsl -u root`; `npm run test:e2e` prošlo s 8 smoke testy včetně odeslání demo rezervace bez DB zápisu, validace špatného telefonu a přihlášeného owner admin smoke přes dočasný tenant včetně vytvoření služby a klienta. Playwright běží proti produkčnímu `next build && next start` serveru jedním workerem, aby se obešel lokální Turbopack dev chunk race.

**Kategorie: M (středně složitá změna)**
Důvod kategorie: nová test infrastruktura, nový devDep, několik scénářů,
zasahuje do CI workflow.

**Proč:**
Tohle je **nejdůležitější task celého dokumentu**.

Booking flow je tvoje komerční cesta. Pokud se rozbije, nemáš produkt.
Aktuálně ho testuješ ručně podle `manual-test-plan.md`, což znamená:

- po každé změně to musíš projít manuálně,
- snadno na něco zapomeneš,
- staff/owner role check se prakticky netestuje E2E.

Playwright (Microsoft) je 2026 standard pro E2E. Headless, paralelní,
trace viewer.

**Kde:**
- `playwright.config.ts` – nový soubor
- `e2e/` – nová složka pro testy
- `.gitignore` – přidat `playwright-report/`, `test-results/`
- `package.json` – nové scripty
- `.github/workflows/check.yml` – nový krok

**Co:**

1. Instalace:
   ```bash
   npm install -D @playwright/test
   npx playwright install --with-deps chromium
   ```

2. `playwright.config.ts`:
   ```typescript
   import { defineConfig } from "@playwright/test";

   export default defineConfig({
     testDir: "./e2e",
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: "html",
     use: {
       baseURL: "http://localhost:3000",
       trace: "on-first-retry",
     },
     webServer: {
       command: "npm run dev",
       url: "http://localhost:3000",
       reuseExistingServer: !process.env.CI,
     },
   });
   ```

3. První tři E2E testy v `e2e/`:

   **`e2e/booking-public.spec.ts`** – veřejný booking flow:
   - navigace na `/demo-barber`
   - výběr služby
   - výběr zaměstnance (any)
   - výběr termínu
   - vyplnění kontaktu
   - submit
   - ověření success state

   **`e2e/auth.spec.ts`** – auth happy path:
   - registrace nového podniku
   - automatické přesměrování na dashboard
   - logout
   - login
   - přesměrování zpět

   **`e2e/dashboard-protected.spec.ts`** – ochrana routes:
   - bez session – `/dashboard` redirect na `/login`
   - bez session – `/calendar` redirect na `/login`
   - veřejný booking `/demo-barber` zůstává dostupný

4. Scripty v `package.json`:
   ```json
   "e2e": "playwright test",
   "e2e:ui": "playwright test --ui",
   "e2e:debug": "playwright test --debug"
   ```

5. CI workflow nový job (běží jen pro PR, ne na každý push do main):
   ```yaml
   e2e:
     runs-on: ubuntu-latest
     steps:
       - uses: actions/checkout@v4
       - uses: actions/setup-node@v4
         with:
           node-version: 22
           cache: npm
       - run: npm ci
       - run: npx playwright install --with-deps chromium
       - run: npm run e2e
       - uses: actions/upload-artifact@v4
         if: failure()
         with:
           name: playwright-report
           path: playwright-report/
   ```

**Pravidla:**
- E2E testy běží proti **demo režimu** (bez Supabase env), aby nepotřebovaly
  produkční DB.
- Pro auth scénáře se pokud možno použije test-only mock účet, nikoli
  reálná Supabase registrace.
- Trace upload jen při failure, jinak se report vyplýtvá.
- Žádné citlivé údaje v testech (žádné reálné e-maily, hesla mimo `test123!`).

**Akceptace:**
- `npm run e2e` projde lokálně všechny tři spec soubory.
- CI pro PR spouští E2E paralelně s `check`.
- Při selhání se v Actions tabu objeví Playwright HTML report.
- `manual-test-plan.md` se zkrátí o sekce, které už pokrývají E2E.

---

### TASK A6.1 – Admin performance budget

**Stav:** Hotovo 2026-05-02. Guard je v `tests/admin-performance-budget.test.ts` a běží v `npm run check`; přesné staff řazení používá view `staff_directory_metrics`. `npm run perf:smoke` je zpevněný pro lokální dev režim: mimo CI měří sekvenčně, má jeden retry a při neběžícím serveru vrací čitelný `ERR/ECONNREFUSED`.

**Proč:**
Pomalé přepínání admin sekcí je kritická UX regresní plocha. E2E smoke zatím ověřuje anonymní admin redirect; pro skutečný auth-aware admin průchod je potřeba izolovaný test tenant nebo auth setup. Do té doby existuje levný statický guard, který hlídá nejdražší server render vzory.

**Co bylo uděláno:**

- Dashboard pro výpočet volných slotů a 7denního trendu už netahá všechny budoucí rezervace; `futureBookingsQuery` je omezený na 8denní horizont.
- `Klienti`, `Služby` a `Tým` stránkují v databázi přes `count: "exact"` a `range(from, to)`.
- Nový test hlídá dashboard horizont, DB stránkování entit a paralelizaci nezávislých dashboard query přes `Promise.all`.
- Staff stránka používá `security_invoker` view `staff_directory_metrics`, aby šlo přesně řadit podle počtu pracovních dnů, přiřazených služeb a výjimek bez dotahování celého týmu do klienta.
- `scripts/performance-smoke.mjs` v lokálním dev režimu neběží paralelně, takže po čistém `rm -rf .next` méně často vyvolá Turbopack cold chunk race. Pro čistý warm průchod bez retry použij `PERF_RETRIES=0 npm run perf:smoke`.

**Limit:**
`staff_directory_metrics` je view nad tenant-scoped tabulkami a běží jako `security_invoker`, takže se na ni vztahují RLS policies podkladových tabulek.

---

### TASK A7 – Reálné ceny v ceníku (rozhodnutí, ne kód)

**Kategorie: S (jednoduchá změna)**
Důvod kategorie: jeden datový blok v `app/page.tsx`, ale vyžaduje business
rozhodnutí o pricing strategii (před implementací).

**Proč:**
Aktuálně máš v ceníku „připravujeme“ u Solo a Tým planů. Tohle je **trust
killer** v 2026 SaaS landingu. Návštěvník očekává, že vidí cenu nebo
explicitní „custom pricing, kontaktujte nás“. „Připravujeme“ působí jako
projekt, ne jako produkt.

Jsou dvě cesty:

**Varianta A: Reálné ceny už teď**

Vychází z `docs/business-model.md`. Příklad:

- Pilot: 0 Kč po dobu pilotu (do 50 rezervací/měsíc)
- Solo: 390 Kč/měsíc (1 provoz, neomezeně rezervací, e-mail)
- Tým: 990 Kč/měsíc (do 5 staff, neomezeně rezervací)

**Varianta B: Schovat tarify do „Pilot zdarma“ + „Domluva po pilotu“**

Místo tří plánů jen jeden:

- Pilot zdarma do 31. 12. 2026.
- „Po pilotu se domluvíme na ceně, která bude férová pro váš provoz.“
- Pricing strategie se zafixuje až po datech od pilotů.

Variantu B doporučuju – nepředstíráš ceník, který nemáš.

**Kde:**
`app/page.tsx` – `pricingPlans` const a sekce `id="cenik"`.

**Co (pokud Varianta B):**

1. Smazat tři pricing karty.
2. Nahradit jedním velkým „Pilot zdarma“ blokem s textem:
   - „Pilot je zdarma a bez závazku.“
   - „Po pilotu společně najdeme cenu, která vám sedne.“
   - „Žádné marketplace provize z vlastních klientů. Nikdy.“
3. Tlačítko „Začít pilot“ → existující `/register`.
4. Pod blokem malý disclaimer: „Detailní ceník zveřejníme po prvních
   pilotech, jakmile budeme rozumět reálnému provozu.“

**Co (pokud Varianta A):**

1. Vyplnit reálné ceny do `pricingPlans`.
2. Přidat poznámku „Cena platí od X. Y. 2026“.
3. Přidat detail features per plan.

**Pravidla:**
- Neuvádět falešné limity, které ještě nejsou v kódu.
- Neuvádět funkce, které jsou v MVP scope NEimplementované. SMS lze komunikovat jen jako připravený webhook základ, ne jako hotový produkční provider.
- Cena musí být v souladu s `docs/business-model.md`.

**Akceptace:**
- Žádný plán neukazuje „připravujeme“.
- Pricing sekce má jasné CTA a žádný trust gap.
- `docs/business-model.md` je v souladu s landing page (jeden zdroj pravdy).

---

## 4. FÁZE B – Pre-deploy hardening (až bude deploy)

Tyto úkoly mají smysl, **až rozhodneš, že chceš pustit aplikaci ven**
(staging na Vercel, vlastní VPS, cokoli).

### TASK B1 – Vercel deploy konfigurace

**Kategorie: M**
Důvod: Vercel project setup, env variables, preview deployments per PR,
production branch protection.

**Co:**
- Vytvořit Vercel projekt napojený na GitHub repo.
- Nastavit env variables ve Vercel dashboard (`NEXT_PUBLIC_SUPABASE_URL`
  atd.) odděleně pro Preview a Production.
- Nastavit `main` branch jako production, vše ostatní jako preview.
- Doplnit `vercel.json` s funkcí timeoutem pro CRON endpoint.
- Aktualizovat CSP header (z A1) – povolit Vercel analytics doménu, pokud
  budeš používat.

**Akceptace:**
- Push do PR vytvoří preview deployment na URL.
- Push do main aktualizuje production.
- Health check endpoint `/api/health` odpovídá z preview URL.

---

### TASK B2 – Migration deployment workflow

**Kategorie: M**
Důvod: SQL migrace musí proběhnout před deploymentem aplikace, jinak
endpoint očekává sloupec, který v DB není.

**Co:**
- GitHub Actions workflow, který před nasazením nové verze spustí
  Supabase CLI a aplikuje migrace.
- Použít `supabase db push` proti production projektu.
- Workflow má manuální approval krok (production migrace nesmí být auto).
- Pro staging projekt může být auto.

**Akceptace:**
- Migrace v `supabase/migrations/` se aplikují atomicky před deployem.
- Při selhání migrace se deploy nedokončí.
- Manuální schválení pro production je vynucené.

---

### TASK B3 – Sentry error monitoring

**Kategorie: M**
Důvod: nová závislost, sentry config v Next.js, environment-aware setup,
testovat že erroru opravdu chytá.

**Co:**
- Instalace `@sentry/nextjs`.
- `sentry.client.config.ts` a `sentry.server.config.ts` s environment-aware
  DSN (jen pro production a staging, nikoli local dev).
- Hooks pro Server Actions error capture (Next.js 16 má built-in hook).
- Source maps upload v production buildu.
- Filtrovat PII (email, phone) z error contextu před odesláním.
- Použít `safePostCommit` z A2 jako místo, kde se ne-fatální chyby logují
  do Sentry.

**Akceptace:**
- Test page `/test-sentry-error` (jen v dev) vyhodí chybu, která dorazí
  do Sentry projektu.
- PII v error reportech je vymaskované.
- Source maps jsou nahrané, takže stack traces ukazují originální TS kód.

---

### TASK B4 – Database backup verify

**Kategorie: S**
Důvod: ověření, že Supabase backup strategy funguje, ne implementace
nové infrastruktury.

**Co:**
- Vytvořit testovací staging Supabase projekt s vzorem dat.
- Spustit Supabase point-in-time-recovery na bod o 5 minut zpět.
- Ověřit, že data jsou konzistentní.
- Zdokumentovat postup v `docs/runtime-checklist.md` jako pravidelnou
  čtvrtletní úlohu.

**Akceptace:**
- Restore funguje a postup je v dokumentaci.
- Frekvence ověření je v kalendáři (kvartálně).

---

## 5. FÁZE C – Pre-pilot hardening (před prvním placeným klientem)

### TASK C1 – Uptime monitoring

**Kategorie: S**
Co: Better Uptime nebo Cronitor pinguje `/api/health` každou minutu.
Notifikace e-mail/Slack/SMS při downtime > 2 minuty.

### TASK C2 – Audit log endpoint

**Kategorie: M**
Co: Rozšířit `booking_events` o auth events: login, logout, password change,
tenant settings change, role change. Endpoint pro export GDPR dat klientů.

### TASK C3 – Rate limit fail-closed pro citlivé akce

**Kategorie: S**
Co: Aktuálně rate limit fallback je „povolit, když Upstash spadne“. Pro
login a register změnit na „odmítnout“. Pro public booking ponechat
fail-open (UX první).

### TASK C4 – Security headers audit

**Kategorie: S**
Co: Spustit `securityheaders.com` proti production URL. Doplnit
chybějící hlavičky (CSP nonce, X-XSS-Protection legacy, COEP/COOP pokud
relevantní).

### TASK C5 – Privacy policy + cookies banner

**Kategorie: M**
Co: GDPR-compliant privacy policy generated podle reálných cookies a data
flow. Cookie banner, pokud používáš analytics. Bez analytics zatím není
nutný.

### TASK C6 – Backup restore drill

**Kategorie: S**
Co: Plný restore production DB do separátního Supabase projektu, ověření
business kritických dat (klienti, rezervace, audit log). Dokumentovat
v `runtime-checklist.md`.

---

## 6. CO NEDĚLAT TEĎ

Tyto věci se objevují v 2026 SaaS doporučeních, ale pro tvou fázi jsou
zbytečné:

- **SOC 2 / ISO certifikace** – relevantní u enterprise prodeje, ne
  u salonu.
- **Multi-region database** – jeden region (eu-central) je dost.
- **Custom CDN setup** – Vercel + Cloudflare default stačí.
- **Microservices split** – aplikace má jeden deployovatelný kus, OK.
- **Kafka / event streaming** – `booking_events` v Postgres stačí.
- **Custom auth provider** – Supabase Auth je dostatečné.
- **Redis cache** – Upstash pro rate limit stačí, cache layer není potřeba.
- **APM (Datadog, New Relic)** – Vercel Analytics + Sentry stačí.
- **Penetration testing** – relevantní u enterprise prodeje.
- **Blog / content marketing infra** – až po pilotu, řešeno v jiné konverzaci.

---

## 7. Pořadí pro Codex

Doporučené pořadí v Fázi A (lokální):

1. **Hotovo – A1 (S) – CSP header** ← XSS prevence
2. **Hotovo – A3 (XS) – Health check** ← debug pomoc i lokálně
3. **Hotovo – A2 (S) – Sjednocení error handling** ← příprava půdy pro A6 a Sentry
4. **Hotovo – A4 (XS) – Dependabot** ← bezpečnost balíků se začne řešit pasivně
5. **Hotovo – A5 (XS) – Coverage report** ← viditelné blind spoty
6. **Hotovo – A6 (M) – E2E smoke testy** ← Chromium dependencies nainstalované, 5 smoke testů běží proti produkčnímu webServeru
7. **Hotovo – A6.1 (S) – Admin performance budget** ← ochrana proti návratu pomalých SSR vzorů
8. **A7 (S) – Reálné ceny v ceníku** ← business rozhodnutí + pár řádků kódu

Po každém tasku spustit:

```bash
npm run check
```

Po Fázi A celkový stav: **9.0/10** lokálně. Tohle je strop, který lze
dosáhnout bez deploye, a je to **víc než dost na první pilot**, pokud
projekt zůstane lokálně/staging.

---

## 8. Realistický odhad času

- **Fáze A** (P0 lokální): 1.5–2 dny soustředěné práce s Codexem.
  - A1 + A3 + A4 + A5 = půl dne
  - A2 = půl dne
  - A6 = hotovo; další navazující práce je mutační E2E s izolovaným test tenantem
  - A7 = pár hodin (po business rozhodnutí)

- **Fáze B** (před deployem): 1–2 dny po rozhodnutí deployovat.
- **Fáze C** (před pilotem): 2–3 dny po rozhodnutí brát platby.

Celkem od dnes ke 9.5/10 (ready pro placeného klienta): **5–7 dnů
soustředěné práce**, rozprostřené přes několik týdnů podle reálné poptávky.

---

## 9. Reference

Audit, ze kterého dokument vychází:

- Konverzace `2026-05-02` – kompletní projekt audit (bezpečnost,
  architektura, kód, testy, DevOps, dokumentace).
- Verdikt: 8.4/10, top 5 % indie SaaS projektů.
- Hlavní silné stránky: bezpečnost, architektura, dokumentace.
- Hlavní mezery: monitoring, E2E testy, deploy automation.

Související dokumenty:

- `AGENTS.md` – bezpečnostní pravidla a code standards
- `docs/03-architektura.md` – tech stack a layering
- `docs/16-design-trends-2026-implementation.md` – vizuální vrstva
- `docs/runtime-checklist.md` – runtime ověření po deployi

Externí reference:

- Next.js 16 security best practices (oficiální docs)
- Supabase production checklist (Supabase docs)
- OWASP ASVS 4.0 – application security verification standard
- Vercel deployment best practices

---

## 10. Změny tohoto dokumentu

| Datum | Změna |
|---|---|
| 2026-05-02 | Vytvořeno: třífázový hardening plán A/B/C, P0/P1/P2 tasky |
