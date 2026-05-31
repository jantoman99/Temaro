# 16 – Design trends 2026: audit a implementační plán

Datum: 2026-05-02
Stav: aktivní implementační plán pro Codex
Navazuje na: `docs/15-design-system-v3.md` (zdroj pravdy pro vizuální směr)
Doplňuje: `docs/15-performance-audit.md` (Lighthouse výsledky)

---

## 0. Účel dokumentu

Tento dokument je **implementační plán pro Codex**, ne další design audit.

Cíl:

1. Zafixovat verdikt o tom, kde Temaro v 2026 SaaS realitě stojí.
2. Rozhodnout, co se mění a co se NEmění.
3. Rozbít změny na konkrétní tasky s kategoriemi (XS/S/M/L).
4. Dát Codexovi přesný kontext, aby implementoval bez nutnosti dalšího researche.

Tento dokument NENÍ:

- nový design system (ten je v `15-design-system-v3.md`)
- nová paleta (paleta C zůstává)
- audit kódu (jen vizuální/UX vrstva)

---

## 1. Realita 2026 vs. Temaro – verdikt

Po porovnání s reálnými 2026 SaaS daty (Linear, Stripe, Vercel, Notion, Mercury,
plus aktuální trend reporty z early 2026):

**Současný stav: 7.4/10**

Temaro splňuje 8 z 11 klíčových 2026 SaaS trendů:

| Trend 2026 | Temaro stav |
|---|---|
| Interaktivní hero demo místo screenshotů | ✅ máme (`InteractiveProductDemo`) |
| Krátké bold headliny (max 12 slov) | ✅ máme („Méně telefonátů. Klidnější provoz.“) |
| Sidebar 240–280px navigation | ✅ máme (260px) |
| OKLCH color space | ✅ máme |
| Premium typografie (Plus Jakarta Sans + serif accent) | ✅ máme |
| Status colors oddělené od brand colors | ✅ máme |
| Tabular nums u všech čísel | ✅ máme |
| Glow / pulse efekty (disciplinovaně) | ⚠️ máme, ale použité dekorativně |
| Bento grid layout | ❌ chybí |
| Dark mode | ❌ chybí |
| Information density v adminu | ⚠️ slabší |

Hlavní mezery, které brání skoku na 9/10:

1. Žádný bento grid → landing scroll je lineární a monotónní.
2. Žádný dark mode → 2026 standard.
3. Admin dashboard je moc vzdušný → power users chtějí density, ne whitespace.
4. Glow / shadow inflace → 9 shadow variant, 5+ použití primary glow.
5. Booking confirmation moment je promarněná emocionální příležitost.

---

## 2. Co se NEMĚNÍ

Tyto věci jsou v 2026 v trendu, fungují a nesahá se na ně:

- **Paleta C – Linear-like Focus** zůstává. Elektrická fialovo-modrá je 2026 OK.
- **Plus Jakarta Sans** a serif accent zůstávají.
- **InteractiveProductDemo** se 3 módy zůstává.
- **Hero copy** „Méně telefonátů. Klidnější provoz.“ zůstává.
- **Proof metriky** (348 testů, 0 % provize, 24h reminder) zůstávají.
- **Sidebar 260px** zůstává.
- **Status barvy** (pending/confirmed/completed/cancelled/no_show) zůstávají.
- **Signal Map** sekce zůstává jako brand motiv.
- **Glow/pulse efekty samy o sobě** zůstávají, jen se zdisciplinují (viz P1).

---

## 3. Implementační plán – priorita podle ROI

Pořadí je sestavené podle:

- viditelný dopad na uživatele,
- časová náročnost,
- riziko regrese,
- soulad s 2026 trendem.

### P0 – Nejvyšší ROI (dělat první)

1. Bento grid sekce na landing page – L
2. Density-first dashboard – M
3. Dark mode token vrstva + toggle – M
4. Disciplína primary color a shadow systému – S
5. Premium booking confirmation moment – M

### P1 – Po P0 (dolaďování)

6. Sjednocení radius tokenů – XS
7. Skeleton loading states v adminu – S
8. Sparklines u dashboard KPI karet – S
9. Empty states bez generického card vzhledu – S

### P2 – Až po pilotech

10. Bottom tab bar pro mobile dashboard – M
11. Kinetic typography v hero – S
12. Oborové landing variants (barber/salon/ordinace) – L

---

## 4. Detailní zadání tasků pro Codex

### TASK 1 – Bento grid sekce na landing page

**Kategorie: L (komplexní změna)**
Důvod kategorie: nová sekce s 6+ moduly různých velikostí, propojuje obsah z více
existujících sekcí, ovlivňuje rytmus celého landing scrollu, vyžaduje responzivní
chování od mobile po wide desktop.

**Proč:**
2026 SaaS landing pages (Apple, Linear, Vercel, Notion) používají bento grid
jako antidotum proti monotónnímu lineárnímu scrollování. Každý modul je
self-contained příběh – stat, feature, citát, screenshot. Aktuálně je landing
sled identických card sekcí, kde všechno splývá.

**Kde:**
`app/page.tsx` – nová sekce mezi „Provozní realita“ a „Pro koho“.
Pozice: po `id="provoz"` sekci, před `id="pro-koho"`.

**Co:**
Vytvořit sekci `id="bento"` s CSS Grid layoutem auto-fill, kde se kombinují
různě velké bloky:

- 1× velký blok (col-span-2 row-span-2): hlavní feature s mini animací
  (no-show prevention nebo client memory)
- 2× střední blok (col-span-2 row-span-1): kalendář preview, klientský kontext
- 2× malý blok (col-span-1 row-span-1): jednotlivé proof metriky
- 1× horizontální blok (col-span-3 row-span-1): integrations / „Pro koho“ chips

Mobile: collapse na single column, ale s **různými výškami bloků**, aby vizuální
rytmus nezmizel.

**Pravidla:**
- Použít existující design tokeny z `globals.css` (žádné nové barvy).
- Každý blok má jiný typ obsahu – nesmí to být 6 stejných karet.
- Reuse existující komponenty (`signal-card`, `command-surface`).
- Animace: lehký scroll-reveal (využít existující `motion-reveal` třídu).
- Žádné nové dependencies.

**Akceptace:**
- Sekce viditelně rozbíjí monotónnost landing scrollu.
- Mobile layout zůstává čitelný a logicky uspořádaný.
- Lighthouse Performance neklesne pod 90 mobile / 95 desktop.
- Existující sekce zůstávají nedotčené.

---

### TASK 2 – Density-first dashboard hero strip

**Kategorie: M (středně složitá změna)**
Důvod kategorie: úprava primárního pohledu adminu, nová komponenta KPI strip
se sparkline daty, propojuje kalendář + booking + risk data, propisuje se
do více míst dashboardu.

**Proč:**
2026 dashboard pattern (Stripe, Linear, Vercel) má v top 80–120px content area
4–6 nejakčnějších KPIs, ne welcome message. Aktuální Temaro dashboard má
nahoře `PageHeader` s tagline „Začínáme klidně.“, což je promarněný prime
real estate.

Salon manager nepřichází do dashboardu meditovat, přichází zjistit:

- Kolik mám dnes booking?
- Kolik je risk klientů?
- Kolik volných oken?
- Jak jsem na tom finančně dnes/týden?

**Kde:**
`app/(dashboard)/dashboard/page.tsx`

**Co:**

1. Nahradit současný `DashboardHeader` (s tagline) novým `DashboardKpiStrip`.
2. `DashboardKpiStrip` ukazuje 4 KPI karty v gridu:
   - **Dnešní rezervace**: počet + trend vs. včera (sparkline 7 dní)
   - **Tržba dnes**: částka + trend vs. minulý týden
   - **Volná okna**: počet + barevný indikátor (zelená pokud >2, amber pokud 0–2)
   - **Riziko**: počet pending starší 24h + počet rizikových klientů dnes
3. Každá karta má:
   - velké tabular číslo (text-3xl font-semibold)
   - jméno metriky (text-xs uppercase)
   - trend indikátor (šipka up/down + procenta)
   - tenkou sparkline (SVG, 7 datapointů, height 24px)
4. Tagline (`getDashboardTagline`) přesunout do tooltip nebo zrušit.

**Pravidla:**
- Sparkline jako inline SVG, žádné chart libraries.
- KPI karty nesmí mít stejný `bg-card` border – každá musí mít subtilní
  vlastní akcent podle role (info/success/warning/risk).
- V demo režimu dopočítat hodnoty z `demoBookings` + `demoServices`.
- V live režimu data ze Supabase přes existující query patterns.
- Funkce `getStatusCounts` zůstává, jen se přesune pod KPI strip jako
  detailní breakdown.

**Akceptace:**
- První pohled na `/dashboard` ukazuje 4 akční KPIs, ne tagline.
- Sparklines fungují s reálnými i demo daty.
- Mobile: KPI karty se collapse do 2× 2 grid, ne do single column scrollu.
- Existující stat cards a charts pod KPI stripem zůstávají.

---

### TASK 3 – Dark mode token vrstva + toggle

**Kategorie: M (středně složitá změna)**
Důvod kategorie: zasahuje globální token vrstvu, přidává toggle komponentu
s persistencí, propisuje se do všech komponent přes CSS variables, vyžaduje
ověření kontrastu napříč celým UI.

**Proč:**
Dark mode už v 2026 není feature, je to standardní očekávání. `globals.css`
už má `@custom-variant dark (&:is(.dark *));` – struktura je tam, chybí jen
hodnoty a toggle. Bez dark mode působí Temaro v 2026 SaaS prostředí
podstandardně, zejména pro tech-savvy zákazníky (trenéři, IT konzultanti).

**Kde:**
- `app/globals.css` – přidat `.dark` token hodnoty
- `components/ui/theme-toggle.tsx` – nová komponenta
- `app/layout.tsx` – inicializace theme z localStorage / system preference
- `app/(dashboard)/layout.tsx` – toggle v headeru
- `app/page.tsx` – toggle v sticky command bar

**Co:**

1. V `globals.css` doplnit `.dark` blok se všemi token hodnotami:
   - `--background`: tmavá neutral (oklch ~0.16 0.018 255)
   - `--foreground`: světlý text (oklch ~0.96 0.006 255)
   - `--card`: lehce tmavší než background
   - `--border`: subtilní hranice (oklch ~0.25 0.015 255)
   - `--primary` zůstává stejná, jen se ujistit o kontrastu
   - Status barvy se mírně desaturují pro dark mode

2. Vytvořit `ThemeToggle` komponentu:
   - Tři stavy: light / dark / system
   - Persistence v localStorage (key: `temaro-theme`)
   - Při system: poslouchá `prefers-color-scheme`
   - Aplikuje class `dark` na `<html>`

3. V `layout.tsx` přidat inline script (před hydratací) pro nastavení
   theme bez flash of unstyled content:
   ```js
   (function() {
     const t = localStorage.getItem('temaro-theme') || 'system';
     const isDark = t === 'dark' || (t === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
     if (isDark) document.documentElement.classList.add('dark');
   })()
   ```

4. Toggle umístit:
   - Landing: v sticky command bar vedle „Přihlášení“
   - Dashboard: v header vedle bell ikony
   - Booking: NE (klient nemá řešit theme, použije se system)

**Pravidla:**
- Žádné nové dependencies. Lucide ikony Sun/Moon/Monitor jsou už dostupné.
- Žádné komponenty se nesmí rozbít. Každý hardcoded `bg-white`, `text-black`,
  `border-gray-X` se musí refaktorovat na token.
- Veřejný booking používá system preference automaticky, bez toggle.
- Email notifikace nikdy nejsou dark – Resend templates zůstávají light only.

**Akceptace:**
- Toggle funguje na landing, dashboardu a všech app stránkách.
- Žádný flash of light theme při načtení v dark mode.
- Lighthouse accessibility zůstává 96+ v obou módech.
- `signal-map`, `command-surface`, `interactive-demo-shell` fungují v obou módech.
- Status colors (confirmed/pending/risk) jsou rozeznatelné v obou módech.

---

### TASK 4 – Disciplína primary color a shadow systému

**Kategorie: S (jednoduchá změna)**
Důvod kategorie: čistka existujících tokenů a tříd, jeden scope (vizuální
disciplína), žádná nová logika, ověření pohledem.

**Proč:**
Aktuálně používáme primary color v 10+ kontextech (CTA, gradient lines,
blob blurs, halo, glow, pulse, hover, border, background tints). Tvůj vlastní
design dokument říká „7 % brand primary“. Reálný stav je ~25 %. 2026 trend
(Linear, Vercel) je discipline – primary jen na CTA, aktivní stav, logo.

Současně máme 9 shadow variant. Linear/Vercel mají 3–4. Hierarchie shadow
ztrácí význam, když je jich tolik.

**Kde:**
- `app/globals.css` – cleanup shadow tokenů
- `app/page.tsx` – odstranit dekorativní blob/glow elementy
- `components/marketing/interactive-product-demo.tsx` – cleanup blob blurs
- Případné další komponenty s `shadow-primary-*` třídami

**Co:**

1. **Shadow cleanup v `globals.css`:**
   Zachovat jen 4 shadows:
   - `--shadow-sm` (karty default)
   - `--shadow-md` (hover, aktivní)
   - `--shadow-lg` (popovers, dropdowns)
   - `--shadow-command` (hero/booking/premium surfaces)

   Smazat:
   - `--shadow-xs`
   - `--shadow-pop`
   - `--shadow-primary-pulse`
   - `--shadow-primary-halo`
   - `--shadow-primary-glow-lg`

   Zachovat:
   - `--shadow-primary-glow` (jen pro hero CTA, používat sporadicky)

2. **Blob cleanup:**
   V `interactive-product-demo.tsx` smazat:
   ```tsx
   <div className="absolute -left-4 top-14 hidden h-28 w-28 rounded-full bg-primary/20 blur-2xl lg:block" />
   <div className="absolute -bottom-8 right-8 hidden h-36 w-36 rounded-full bg-info/15 blur-3xl lg:block" />
   ```

3. **Primary discipline:**
   Projít `app/page.tsx` a omezit `text-primary` jen na:
   - Hero serif accent (Klidnější)
   - Eyebrow textů sekcí
   - Aktivní CTA stavy
   - Klíčová čísla v proof metrics

   Smazat ostatní `text-primary` na nekritických místech (např. drobná čísla
   v segmentech).

4. **Halo discipline:**
   `signal-pulse` třída zůstává JEN u skutečně „live“ indikátorů (eyebrow
   badge v hero, „live“ tečka v command demo). Smazat z dekorativních míst.

**Pravidla:**
- Žádná nová třída se nepřidává. Jen se smazávají nebo přesouvají.
- Po cleanup ověřit v UI, že vizuální hierarchie nezeslábla – primary se
  má víc pociťovat tam, kde zůstal.
- Pokud se shadow používá inline (`shadow-[var(--shadow-pop)]`), refactor
  na `shadow-lg` nebo `shadow-md`.

**Akceptace:**
- Landing vypadá klidnější, ne chudší.
- Primary CTA „Začít zdarma“ vystupuje výrazněji než předtím.
- Žádné dekorativní blob blury na landing/booking.
- Shadow systém v `globals.css` má max 5 hodnot.

---

### TASK 5 – Premium booking confirmation moment

**Kategorie: M (středně složitá změna)**
Důvod kategorie: nová komponenta s mikro-animací, mění emocionální vrchol
flow, propisuje se do success state, vyžaduje testy success scénáře.

**Proč:**
Moment po-rezervaci je nejvyšší emoční moment v celém produktu. Klient právě
provedl akci a čeká na potvrzení, že vše proběhlo správně. Aktuální success
state je `<Check />` ikona + text + box se shrnutím. To je 2018 booking
estetika. 2026 (Stripe Checkout, Calendly v3, OpenTable Pro) má premium
receipt-style animaci.

**Kde:**
`components/booking/public-booking-form.tsx` – `if (state.success)` blok.

**Co:**

1. Nahradit současný success block novou komponentou `BookingReceipt`:
   - Animovaný checkmark (SVG stroke-dashoffset animace, 600ms)
   - Receipt-style layout (jako účtenka):
     - Top: jméno podniku + datum a čas vystavení
     - Middle: služba + termín + osoba + cena (pokud je)
     - Bottom: kontakt klienta + status („Čeká na potvrzení podniku“)
   - Subtle pattern background (radial gradient ze success barvy)
   - Tlačítko „Přidat do kalendáře“ (.ics download)
   - Tlačítko „Sdílet odkaz na rezervaci“ (manage link)

2. Animace sekvence (v tomto pořadí, celkem ~1.4s):
   - 0–400ms: receipt slide up + fade in
   - 200–800ms: checkmark draw
   - 600–1000ms: receipt obsah fade in po sekcích
   - 1000–1400ms: tlačítka fade in

3. Pro accessibility: respektovat `prefers-reduced-motion`. Při reduced motion
   všechno zobrazit okamžitě, jen s opacity transition.

**Pravidla:**
- Animace pomocí CSS / Tailwind keyframes, žádné nové animation libraries.
- `.ics` download generovat client-side (jednoduchý template s
  start/end/summary/description).
- Receipt musí být screenshot-friendly – klient si rád udělá screenshot
  pro potvrzení.
- Žádný marketing copy v receiptu („Děkujeme za rezervaci v Temaru!“ ne).
  Receipt patří podniku, ne nám.

**Akceptace:**
- Po úspěšné rezervaci se objeví animovaný receipt s časováním ~1.4s.
- Reduced motion uživatelé vidí receipt okamžitě bez animace.
- `.ics` download funguje a obsahuje správné údaje.
- Existující manage link (přes magic token) zůstává funkční.
- Test scénář v `manual-test-plan.md` se aktualizuje o nový success state.

---

### TASK 6 – Sjednocení radius tokenů

**Kategorie: XS (minimální změna)**
Důvod kategorie: přejmenování tokenů a jejich konsolidace, change na jednom
místě v `globals.css`, vidí se okamžitě.

**Proč:**
Aktuálně máme `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`,
`rounded-[1.35rem]` (custom!), `rounded-full`. Linear/Vercel mají 3–4 hodnoty.
Custom value `1.35rem` je smell – znamená, že systém nemá pro daný use case
správnou hodnotu.

**Kde:**
`app/globals.css` + grep `rounded-[` napříč repo.

**Co:**

1. V `globals.css` definovat finální radius systém:
   - `--radius-sm: 0.25rem` (badges, malé chips)
   - `--radius-md: 0.5rem` (inputs, buttons)
   - `--radius-lg: 0.75rem` (cards default)
   - `--radius-xl: 1.25rem` (hero surfaces, command surface) ← nahrazuje custom 1.35rem
   - `--radius-full` zůstává

2. Najít všechny `rounded-[1.35rem]` a nahradit za `rounded-xl` (po update tokenu).

3. Smazat token `--radius-2xl: 1rem` (mezi-velikost, kterou nepotřebujeme).

**Akceptace:**
- Žádné `rounded-[Xrem]` arbitrary values v repo (kromě případů, kde je to
  opravdu nutné, např. fancy shape).
- Hero command surface, booking checkout a velké karty mají stejný radius.
- Vizuálně se nic dramatického nemění (rozdíl mezi 1.35 a 1.25 je marginální).

---

## 5. Co dělat až po pilotech (P2)

Tyto věci nemají smysl, dokud nemáme reálné klienty:

- **Bottom tab bar pro mobile dashboard (M)** – chce skutečné mobile usage data
- **Kinetic typography v hero (S)** – riziko gimmicku, nutná validace
- **Oborové landing variants (L)** – potřebují validovat use case oboru
- **AI personalizace landing (L)** – předčasná optimalizace
- **Marketplace integrations panel (L)** – až bude co integrovat

---

## 6. Výsledek po implementaci P0 + P1

Očekávané posuny:

| Aspekt | Před | Po P0 | Po P0+P1 |
|---|---:|---:|---:|
| Soulad s 2026 trendy | 8/11 | 11/11 | 11/11 |
| Landing wow efekt | 7.5/10 | 8.5/10 | 9/10 |
| Dashboard density | 6/10 | 8/10 | 8.5/10 |
| Booking premium feel | 6.5/10 | 8/10 | 8.5/10 |
| Vlastní identita | 5/10 | 7/10 | 7.5/10 |
| **Celkové skóre** | **7.4/10** | **8.5/10** | **9/10** |

Realistický odhad práce:

- P0: 5 tasků, 1× L + 3× M + 1× S = ~3 dny soustředěné práce
- P1: 4 tasky, 1× XS + 3× S = ~1 den

Po P0+P1 se Temaro dostává na úroveň, kde se dá srovnávat s Linear/Mercury
v segmentu menších SaaS, ne jen s rezervačními konkurenty.

---

## 7. Pořadí implementace pro Codex

Doporučené pořadí, ve kterém nasazovat:

1. **Task 4 (S) – Disciplína primary/shadow** ← začít tímto, je to úklid
   před většími změnami a zlepší to základ pro vše ostatní.
2. **Task 6 (XS) – Sjednocení radius** ← rychlá výhra, navazuje na úklid.
3. **Task 3 (M) – Dark mode** ← dělat před bento gridem, aby bento bylo
   navržené dark-mode-aware.
4. **Task 1 (L) – Bento grid** ← největší vizuální dopad na landing.
5. **Task 2 (M) – Density-first dashboard** ← pro existující admin uživatele.
6. **Task 5 (M) – Premium booking confirmation** ← emocionální dotek na konec.

Po každém tasku spustit:

```bash
npm run check
```

a ověřit Lighthouse na landing + dashboardu, aby žádný posun nezpůsobil
regresi výkonu.

---

## 8. Reference – z čeho dokument vychází

Web research z 2026-05-02:

- saasui.design – „7 SaaS UI Design Trends in 2026“
- saasframe.io – „10 SaaS Landing Page Trends 2026“
- moburst.com – „Best Landing Page Design Trends 2026“
- line25.com – „Web Design Trends 2026: The Definitive Guide“
- arieldigitalmarketing.com – „Top Web Design Trends for 2026“
- artofstyleframe.com – „Dashboard Design Patterns for Modern Web Apps 2026“
- pixeto.co – „17 Best SaaS Website Design Examples 2026“
- sanjaydey.com – „20 Best SaaS Website Design Examples in 2026“

Reálné produkty použité jako benchmark:

- Linear (sidebar, density, status signals)
- Stripe (KPI strip, gradient mesh, receipt feel)
- Vercel (dark mode, terminal aesthetic, performance metrics)
- Notion (calm density, neutral palette discipline)
- Mercury (dark surfaces, premium feel, financial trust)
- Calendly (booking flow, calm interface)

Interní dokumenty:

- `docs/15-design-system-v3.md` – Signal OS design směr (zůstává v platnosti)
- `docs/15-performance-audit.md` – Lighthouse baseline před změnami
- `docs/14-market-analysis-booking-systems.md` – competitive context

---

## 9. Změny tohoto dokumentu

| Datum | Změna |
|---|---|
| 2026-05-02 | Vytvořeno: kompletní audit 2026 trendů + implementační plán P0/P1/P2 |
