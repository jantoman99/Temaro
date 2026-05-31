# 11 – Design Audit (skutečný stav vs. 2026 trendy)

> **Status:** Audit aktuálního stavu po implementaci části `10-design-system-v2.md`. Doplněno 1. 5. 2026 o **vizuální audit** ze screenů.
> **Auditované soubory + screeny:** Landing (`/`), Dashboard (`/dashboard`), Calendar (`/calendar`), Clients (`/clients`), Login (`/login`).
> **Verdikt v jedné větě:** Tokeny jsou ✅ Workbench, layouty jsou ❌ Brutalist 2023 — a vizuálně to bije do oka silněji, než ukázal samotný kód.

---

## 0) TL;DR

Po vidění reálných screenů musím audit **přitvrdit**. Sourcecode mě varoval, že je něco špatně. Screen ukázal, že je to **kategoricky špatně**. Konkrétní šokující momenty:

- **Login page má hero copy `Přihlášení do systému, který drží provoz pohromadě.` v ~5xl font-black tracking‑tight přes 3 řádky.** Tohle je marketing landing copy na auth obrazovce. Žádný produkt 2026 (Stripe, Linear, Notion, Vercel) tohle nedělá. **Auth má být minimal centered card.**
- **Dashboard má hero `Denní brief bez šumu.` v `text-5xl font-black`** (cca 60 px Plus Jakarta Black). To je copywriter‑driven hero, ne dashboard. Na 1440×900 monitoru to znamená, že **stat cards (no‑show count, tržby) jsou pod foldem**. Každé otevření dashboardu = scroll.
- **Clients page má `Klienti a jejich provozní historie` jako masivní H1** + eyebrow „KLIENTSKÉ PROFILY" v primary modré. Je to seznam zákazníků — vypadá to jako Squarespace o nás stránka.
- **Sidebar je naopak dobrý** (světlý!) — kód byl `bg-slate-950`, ale aktuální screen ukazuje světlý sidebar s active item na bílém pozadí. Buď to bylo opraveno, nebo se kód v auditu četl ze starší branche. Poznámka v sekci 6 zůstává relevantní.
- **Landing je plný 2023 SaaS template trápení**: gradient blob backgrounds, floating colored shapes, fake browser chrome s traffic lights, fotky z `/marketing/` v hero mockup.

**Skóre po vizuálním auditu: 4.5/10** (původně jsem dal 6/10 z kódu — screen mě donutil snížit). Po opravě sekce 6 se dostane na 8.5/10.

---

## 1) Co je dobré (zachovat)

### 1.1 `globals.css` je téměř ideální

Tokeny mají správné OKLCH, slate‑blue primary `oklch(0.42 0.08 245)` je neutrální napříč obory, accent je správně **interakční** (ne brand), stavové barvy jsou explicitní. Stínová rampa `xs/sm/md/lg/pop` má correct studený slate undertone. Radius systém 4/6/8/12/16 px je app‑ready.

**Drobnost:** `--radius-3xl: 1rem` duplikuje `--radius-2xl`. Buď vyhodit, nebo posunout výš.
**Drobnost 2:** `--shadow-soft` a `--shadow-card` aliasy „temporary" — vyčistit po refactoringu.

### 1.2 `components/ui/empty-state.tsx`

Tohle je **vzor, jak má vypadat každá komponenta**: `bg-card`, `border-border`, `text-muted-foreground`, `text-base font-semibold tracking-tight`, lucide ikon `stroke-[1.75]`, žádné serify.

### 1.3 `components/calendar/calendar-week.tsx`

Druhá komponenta, která respektuje systém: `bg-card`, `text-muted-foreground`, `tracking-tight`, status pills s centralizovanými class strings z `getBookingStatusClassName`, border‑left stripe se staff barvou. Drobné výhrady: `rounded-[1.5rem]` (24 px) je nad max 16 px, `text-sm font-black text-slate-900 text-slate-600` má duplicate color class (merge artifact).

### 1.4 Sidebar (dle screenshotu, ne kódu)

Na screenech vidím sidebar **světlý** s aktivním itemem na bílém pozadí — tenant switcher decentní, ikon + label, žádný gradient, žádná tmavá oblast. **Tohle je už 2026 dobré.** Pokud byl kód `bg-slate-950`, někdo to mezitím opravil — výborně, drž ten směr.

### 1.5 Plus Jakarta Sans + Geist Mono

Layout používá Plus Jakarta jako sans variable, Geist Mono jako mono. **Správná volba pro 2026.** Plus Jakarta je rounded geometric, modernější než Inter (2018‑2024 era). `tnum` v body feature settings = tabular nums by default. ✓

---

## 2) Vizuální audit — co screen ukázal, co kód schoval

### 2.1 LOGIN STRÁNKA — totální miss

**Screen ukazuje:**
- Levá polovina: `Provozní dashboard` chip → H1 `Přihlášení do systému, který drží provoz pohromadě.` přes 3 řádky v cca **48 px font-black** tracking‑tight → odstavec → **černá karta** „DNES · Studio Magnolia · online" se 3 stat tiles (12 rezervací, 4 klienti dnes, owner role)
- Pravá polovina: login form

**Co je špatně (vše):**

1. **Auth není marketing.** Login se otevírá 50× za den, různými lidmi (owner, staff, často přes mobil). Žádný produkt 2026 nemá split‑screen marketing copy + login. Stripe = centered card. Linear = centered card. Notion = centered card. Vercel = centered card. **Všichni**. Tohle je 2018 Bootstrap admin template estetika.
2. **Hero copy „Přihlášení do systému, který drží provoz pohromadě"** — komu je to určené? Uživatel, který se přihlašuje, **už produkt používá**. Marketing prodal. Tohle ho jen otravuje.
3. **Černá demo karta `Studio Magnolia · 12 rezervací · 4 klienti dnes · owner role`** — proč je to na login screenu? Demo data se mají ukázat **po přihlášení**, ne před. Tohle navíc plete nového uživatele („to jsou moje data? Já se ještě nepřihlásil...").
4. **Eyebrow chip „Provozní dashboard"** v primary modré nahoře — co to dělá nad H1 na login screenu? Eyebrow je marketing pattern, ne auth pattern.
5. **Form je OK** (right side): label nad fieldem, helper text pod, primary CTA „Přihlásit se", secondary „Registrovat podnik". Tohle by se mělo nechat, ale **levou polovinu kompletně zahodit**.

**Fix (priority XS):**
```
[Logo malý 32px]
Přihlášení
Pro správu rezervací

[Email]
[Heslo]
☐ Pamatovat si mě
[Přihlásit se]    ← primary lg, full width
─── nebo ───
[Pokračovat s Google]  ← outline lg, full width
Nemáš účet? Registruj se zdarma
```

Vše centered, max‑width 400 px, viewport height. **Trvá 5 minut.** Viz `10-design-system-v2.md` sekce 7.9 — bylo to tam přesně specifikované, jen se to neimplementovalo.

### 2.2 DASHBOARD — hero copy zabíjí informační hustotu

**Screen ukazuje:**
- Eyebrow „PŘEHLED MĚSÍCE" (modrá uppercase tracking‑wide)
- H1 **Denní brief bez šumu.** v cca **60 px Plus Jakarta Black** tracking‑tighter
- Subhead odstavec
- Velký primary CTA „Otevřít kalendář →" vpravo
- Pod tím: progress card „První kroky" 80 % — 5 setup steps (4 hotovo, 1 chybí)
- Pak 3 stat cards: Rezervace 0, No‑show 0, Tržby 0 Kč
- Pak „Dnešek" sekce a „Rychlé akce"

**Tři kritické problémy:**

1. **Hero strip zabírá ~280 px vertikálního prostoru** (H1 + subhead + CTA + padding). Na 1440×900 monitoru znamená, že stat cards jsou **pod foldem**. Každé otevření dashboardu = scroll. Reservio, Cal.com, Pipedrive — žádný neměl `text-5xl font-black` na dashboard H1. Linear má dashboard H1 v `text-2xl` (24 px).

2. **„Denní brief bez šumu" je copy bez funkce.** Co mi to říká? Že dashboard mám otevřený? Vidím to. Že jsou bez šumu? OK, ale to je copywritter slogan, ne provozní informace. **Tady má být datum a okamžitě data**: „Pátek 1. května · 12 rezervací · 6 volných slotů · 2 čekají na potvrzení". Hutné, akční.

3. **„První kroky" progress card** je výborný onboarding pattern, ale **80 % progress při 4/5 hotových bodech** vypadá honosně, když 4 jsou auto‑splněné při tenant signup (přidat služby = 1 service stačí, přidat staff = sám je staff). Real onboarding signal je „Získat první rezervaci" — to je jediný step, který se nedá ošvindlovat. **Zvaž: progress count jen těch nesplněných.** Plus po splnění všech 5 by měla card zmizet úplně, ne ukazovat 100 %.

**Fix dashboard hero (priority S):**

```tsx
<header className="mb-6">
  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    Pátek 1. května 2026
  </p>
  <h1 className="mt-1 text-2xl font-semibold tracking-tight">
    Přehled
  </h1>
</header>

<div className="grid grid-cols-4 gap-3 mb-6">
  {/* 4 stat tiles, každá rounded-lg, padding 16, value text-2xl semibold */}
  <StatTile label="Dnes" value="12" suffix="rezervací" />
  <StatTile label="Týden" value="68" trend="+12%" />
  <StatTile label="Tržba" value="36 400 Kč" />
  <StatTile label="No-show" value="3,4 %" tone="warning" />
</div>
```

To je **80 px vertikálně**, ne 280. **3.5× efektivnější.**

### 2.3 CALENDAR — typografie miss + layout je špatně

**Screen ukazuje:**
- Eyebrow „REZERVACE" 
- H1 **Kalendář** v cca 48 px font-black
- „Zobrazeno 5 z 5 rezervací" + button „Obnovit kalendář"
- Filter row: „Předchozí týden / Dnes / Další týden" pills, vpravo „Den / Týden" toggle
- Filter bar: HLEDÁNÍ + STAV (Vše / Čeká / Potvrzené / Hotovo / Zrušené / No‑show) + ZDROJ (Vše / Ručně / Z webu)
- Sub‑filter: ZAMĚSTNANEC (Všichni / Kokot)
- **Týdenní pohled karta** s 7 dny PÁ–ČT zobrazenými jako sloupce, každý sloupec má jen číslo (`0`, `+`) a placeholder „Volno"
- Pod tím: „Sobota 25. dubna · 1 rezervací" sekce s reálnou rezervací (19:06 Stříh · Kokot)
- **Pravý sidebar:** „Vyber rezervaci — Klikni na rezervaci v kalendáři..." + „Rychlé vytvoření — Nová rezervace" form (Klient walk‑in dropdown, jméno klienta input, telefon, email, zaměstnanec dropdown, služba dropdown, začátek datetime)

**Pět problémů:**

1. **H1 „Kalendář" v ~48 px font-black** — to je hero, ne page title. Stripe Dashboard, Pipedrive, Cron Calendar — žádný nemá page title větší než `text-2xl` (24 px). Page title je orientace, ne marketing.

2. **„Týdenní pohled" je špatný layout pro booking SaaS.** 7 sloupců = 7 dnů. Sloupec má `+` button a placeholder „Volno". To je **měsíční mini kalendář**, ne týdenní operativní view. **Týdenní view má být:**
   - Sloupce = staff (Kokot, atd. — ale je tam jen jeden, takže fallback na 1 sloupec)
   - Řádky = časové sloty po 15 min od 7:00 do 19:00
   - Booking blocks na pozici začátku, výška dle délky služby
   - Drag‑and‑drop mezi sloty

   Tohle je `10-design-system-v2.md` sekce 7.4, ale ten layout existuje **úplně jinak**. Aktuálně to je den‑grid bez jakéhokoli časového rozměru. **Zubař neuvidí, kdy má rezervaci** — jen ví, že na čtvrtek má 0.

3. **„Vyber rezervaci" prázdný panel** vpravo zabírá ~30 % horizontálního prostoru. Když není rezervace vybraná, je to **ztracený screen real estate**. `10-design-system-v2.md` říká: side panel slide‑in **až po kliknutí na booking**, ne staticky vpravo. Jinak když má majitel 16" notebook, kalendář má 70 % šíře a to je málo.

4. **„Rychlé vytvoření" form vpravo** je sice praktické, ale **dubluje** „Nová rezervace" CTA v topbaru. Když klikne uživatel na „Nová rezervace" v topbaru, otevře se modal/sheet s tím samým formem. Tady je zdvojený. Volba mezi nimi: buď drop sticky form vpravo a nech jen topbar CTA → modal, **nebo** drop topbar CTA a udělej z toho permanent right panel. Není dobré mít obojí.

5. **Filter chips „Zaměstnanec / Všichni / Kokot"** — staff jméno „Kokot" je z dema. Při vidění reálného screenu je to bizarně neprofesionální. Pro screenshoty / demo používej neutrální jména: „Eva Nováková", „Jakub Svoboda". Ne `Kokot`. Ale to je copy issue, ne design.

**Fix calendar priority (M):**
- H1 page title → `text-2xl font-semibold`, žádný eyebrow „REZERVACE"
- Týdenní view = staff sloupce × time rows (sekce 7.4 design systému)
- Pravý panel default skrytý, otevírá se klikem na booking
- Drop „Rychlé vytvoření" sticky form, použij topbar CTA → modal

### 2.4 CLIENTS — opět hero typografie + zbytečně velký right panel

**Screen ukazuje:**
- Eyebrow „KLIENTSKÉ PROFILY" v primary modré
- H1 **Klienti a jejich provozní historie** v cca 40 px font-black tracking‑tighter, na 2 řádky
- Subhead „Interní poznámky a flagy jsou jen pro provozovatele..."
- 3 stat cards: KLIENTI CELKEM 2, FLAGOVANÍ 1, S NO-SHOW HISTORIÍ 0
- Search input + button „Hledat"
- Filter chips: Všichni / Jen flag / Bez flagu / Všechny návštěvy / Jen no‑show / Řazení A‑Z / Nejnovější / Nejvíc no‑show
- Client list: Jan (605745622, hanys.t.7@gmail.com, No‑show: 0) + Pepa (Flagovaný, 393519519, tomanjan64@gmail.com, „Jebat" jako důvod)
- **Pravý panel:** „RYCHLÉ ZALOŽENÍ — Nový klient" form (jméno, telefon, email, interní poznámky, primary CTA „Přidat klienta")

**Čtyři problémy:**

1. **„Klienti a jejich provozní historie" jako H1** = 2 řádky, ~40 px font-black. **Je to seznam zákazníků.** Stripe/Linear/Pipedrive nikdy nemají 2řádkový honosný H1. „Klienti" stačí. Plus eyebrow „KLIENTSKÉ PROFILY" + subtitle „Interní poznámky a flagy..." — komu to říkáš? Uživateli, který otevřel klienty. Ten ví, kdo jsou klienti. **Vyhoď celý hero block** a ušetři 200 px vertikálního prostoru.

2. **Right panel „RYCHLÉ ZALOŽENÍ" ~30 % šířky permanentně.** Stejný problém jako v calendar. Když potřebuju vidět 50 klientů v listu, právě jsem ztratil třetinu šířky pro form, který používám 1× za týden. **Drop right panel, použij modal:** v topbaru přidej button „+ Nový klient" → modal s tím formem.

3. **Client cards jsou v bílých kartách s rounded‑2xl borderem** a každá obsahuje:
   - Jméno (large, font‑black)
   - Email + telefon + no‑show counter pills
   - 2 link buttons („Otevřít detail klienta", „Nová rezervace")
   - Inline flag form (input + button „Flagovat")
   
   To je **moc info per row**. List 100 klientů = nekonečný scroll. 2026 pattern: **table row 44 px** s essentials (jméno, telefon, posl. návštěva, status, no-show count) + click → side sheet s detailem. Toto se v `10-design-system-v2.md` sekce 7.5 popisuje detailně.

4. **Pepa „Flagovaný" → flag reason „Jebat"** — opět demo data, copy issue. Při screenshot demo používej slušné placeholder reasons („Opakovaný no-show", „Nezdvořilé chování").

**Fix clients priority (M):**
- H1 jen „Klienti" v `text-2xl font-semibold`, žádný subtitle, žádný eyebrow
- Stat cards menší, nad list jen 2 (Klienti celkem / Flagovaní), 4kolonka grid s ostatními
- Přesun „Nový klient" do topbar CTA / modal
- Client list jako table, 44 px row, click → Sheet detail

### 2.5 LANDING — 2023 template galerie

**Screen ukazuje:**
- Sticky topbar uprostřed na max‑width 6xl, pill‑shaped s nav (Produkt / Booking / Provoz)
- Levá kolona: chip „✨ Moderní booking SaaS pro služby" → H1 **Rezervace, které vypadají jako profesionální produkt.** v ~7xl font‑black tracking‑tighter (přes 6 řádků!) → subhead → 2 CTAs
- Pravá kolona: black mockup s Mac traffic lights + URL `studio-magnolia.app/provoz` + sidebar (Přehled, Kalendář, Klienti, Připomínky) + provoz dashboard preview
- 3 fotky reálných tenant‑agnostic ploch (žena s vlasy, černobílý barber shot, skateboard skating?)
- 1 issue notification chip vlevo dole (Next.js dev overlay)
- Modré gradient blob za vším

**Pět problémů (kritických):**

1. **H1 „Rezervace, které vypadají jako profesionální produkt." v `text-7xl font-black`** přes celou levou kolonu — to je **2018 brutalist landing**. Plus copy je auto‑aware ironie: „vypadají jako profesionální produkt" — ale produkt vypadá jako template. Ironie nezamýšlená. 2026 hero: **`text-5xl font-semibold`** max, copy je benefit nebo tagline, ne self‑reference.

2. **Hero mockup s fake browser chrome** (traffic lights + URL bar) je **2018 trend**. Vercel z toho vypadl 2022. 2026 = clean rounded mockup bez fake browseru.

3. **Foto carousel se 3 obrázky** (žena, barber, skater) v dashboard preview = stock images sets. Každý tenant uvidí ty samé fotky. Klient na booking page studia Magnolia uvidí, že má fotku stejnou jako 100 jiných salonů. **Drop fotky úplně.** Nebo umožni tenant uploadovat vlastní cover (fáze 2).

4. **Modré gradient blob fixed nahoře** se táhne přes hero a public mockup. Klasický **AI generated landing signal**. 2026 = bílý/světlý čistý background, žádné gradient blobs. Anthropic homepage = bílá. Linear homepage = bílá. Vercel = bílá. Stripe = bílá. **Všichni.**

5. **Nav v topbaru: „Produkt / Booking / Provoz"** — všichni to vedou na anchor scroll na té samé stránce. Ale produkt nemá jiné stránky (cena, FAQ, blog) které dávají smysl jako navigation. Tři anchor linky v topbaru = bloat. **2026 minimal landing nav: jen logo vlevo + „Přihlásit / Začít" vpravo.** Anchor scroll se dá dělat z hero, ne z fixed topbaru.

**Fix landing priority (M):**
- Hero H1 → `text-5xl font-semibold`, copy benefit driven („Online rezervace, které tvůj salon zvládne sám." — funkční, ne self-aware)
- Drop gradient blob backgrounds
- Drop fake browser chrome
- Drop floating colored shapes  
- Drop foto carousel ze hero mockup
- Drop topbar nav anchors, jen logo + auth buttons
- Mockup = clean rounded screenshot reálného dashboardu (po opravě dashboardu)

---

## 3) Co je špatně — kritická vrstva (mechanická oprava)

Tahle sekce zůstává z původního auditu — **stále platí všechno**, jen vidíme reálné dopady na screenech.

### 3.1 Hardcoded `bg-[#f6f8fb]` všude

5 míst minimálně. Token `--background` říká `oklch(0.985 0.002 240)` = `#F7F8FA`-esque. Ale `#f6f8fb` je jiný hex. Plus dark mode totálně nefunguje (hardcoded barva ignoruje `.dark`).

**Fix:** `bg-[#f6f8fb]` → `bg-background`. 90 sekund.

### 3.2 Hardcoded `bg-blue-600`, `text-blue-700`, `bg-blue-50`

Token `--primary` je slate‑blue, hardcoded `bg-blue-600` je marketing‑pop modrá. `10-design-system-v2.md` sekce 1.2 přesně toto zakazoval.

**Fix:**
- `bg-blue-600` → `bg-primary`
- `text-blue-700` → `text-primary`
- `bg-blue-50` → `bg-primary/10`
- `border-blue-200` → `border-primary/20`
- `text-blue-100` → `text-primary-foreground/80`
- `focus:ring-blue-100` → `focus:ring-primary/15`

Plus `text-slate-950` → `text-foreground`, `text-slate-600` → `text-muted-foreground`, `text-slate-500` → `text-muted-foreground`, `border-slate-200` → `border-border`, `bg-slate-50` → `bg-secondary`.

### 3.3 `font-black` (weight 900) jako default weight

V hero copy OK na landing, ale hraje to **i na navigation linkách v topbaru**, **i na statbox číslech**, **i na badges**, **i na CTA buttons**, **i na sidebar item labels**, **i na stat values v dashboardu**, **i na progress card titles**, **i na page titles** napříč všemi screeny.

**2026 jde opačným směrem:** Linear přepnul ze `font-medium` (500) na `font-normal` (400) v body, headings na `font-semibold` (600). Stripe Dashboard má `font-medium` všude. **Heavy weight = 2022 brutalist trend, ne 2026.**

**Fix rule of thumb:**
- Body → `font-normal` (400) — default, nepište to
- Buttons, sidebar items → `font-medium` (500)
- Headings, statbox values, table headers → `font-semibold` (600)
- **`font-black` (900) jen v hero copy na landing page** a nikde jinde

Tohle je vizuálně **nejdůležitější jednoduchý fix.** Změní celý feel produktu z brutalist na profesionální.

### 3.4 Hardcoded letter-spacing magic numbers

`tracking-[-0.07em]`, `tracking-[-0.06em]`, `tracking-[-0.05em]`, `tracking-[-0.04em]`, `tracking-[-0.03em]`, `tracking-[-0.02em]` = 6 různých magic values bez systému.

**Fix:** Tailwind `tracking-tight` (-0.025em) všude pro headings, žádné magic.

### 3.5 `rounded-2xl` (16 px) a `rounded-[1.5rem]` (24 px) na všem

V kódu na **každém kontejneru** — buttons, cards, search input, sidebar tenant switch, CTA, photo containery, stat cards. **2022 trend** „big rounded everything".

Per `10-design-system-v2.md`:
- Buttons → `rounded-md` (6 px)
- Inputs → `rounded-md` (6 px)
- Cards, sidebar items, dropdowns → `rounded-lg` (8 px)
- Modals, sheets → `rounded-xl` (12 px)
- Hero containery → `rounded-2xl` (16 px) max
- Stat tiles → `rounded-lg` (8 px), ne `rounded-[1.5rem]`

### 3.6 `hover:-translate-y-0.5` na všem

Hero CTA na landing OK. Sidebar nav linky, rychlé akce v dashboardu, stat cards, calendar week booking link, setup steps tiles — **špatně**. Když majiteli salonu při scrollu hover triggerne na 5 cards najednou, vypadá to jak roztřesený popcorn. 2026 hover = subtle bg/border darken, **ne shift v space**.

**Fix:** `hover:bg-muted` nebo `hover:border-foreground/15` místo `hover:-translate-y-0.5`. Lift jen na hero CTA na landing.

### 3.7 Hardcoded shadows s rgb()

7 různých shadow values inline, žádný systém. Plus `rgb()` (sRGB) na `oklch()` backgroundu = color space mismatch.

**Fix:** Použij `shadow-sm`, `shadow-md`, `shadow-lg` z tokens. Žádné inline rgb() shadows.

### 3.8 `backdrop-blur-md` v topbaru

2024 trend, 2026 dying. Plus accessibility issue (čte se hůř přes blur). Slow CPU = trhá se.

**Fix:** `bg-background border-b border-border`, žádný blur.

---

## 4) Co je vyloženě 2024 a má jít pryč (kontextualizováno screenem)

### 4.1 Hero „Rezervace, které vypadají jako profesionální produkt." v 7xl

**Screen verdict:** Vidím to a krčím se. To je **přesný Vercel landing 2023** (Geist font era). Anthropic, Linear, Stripe homepage 2026 mají hero `text-5xl font-medium/semibold` max.

### 4.2 Bento grid hero mockup s floating shapes

V kódu jsem viděl `absolute -left-7 top-16 hidden h-28 w-28 rounded-[2rem] bg-blue-600` + `absolute -right-6 bottom-20 hidden h-36 w-36 rounded-full bg-emerald-400`. **Screen ukazuje** modrý square + emerald circle za hero mockup. Floating colored shapes around hero = **2023 v0.dev signature**. Vercel z toho vypadl 2022.

### 4.3 Mac traffic lights + URL bar v hero mockup

`<span className="size-3 rounded-full bg-red-400" />` × 3 + URL `studio-magnolia.app/provoz`. **2018 trend.** 2026 = jen screenshot v rounded frame, žádný fake browser.

### 4.4 Sparkles eyebrow chip „✨ Moderní booking SaaS pro služby"

`<Sparkles className="h-4 w-4" />` + colored pill chip nad H1. **2023 SaaS landing** template (Cal.com, Linear, Resend měli). 2026 prošlo, ale **bez emoji‑ish ikony**.

### 4.5 Photo carousel v hero mockup

3 generic stock photos (žena, barber, skater) v dashboard preview. Tenant‑agnostic image pool. Drop úplně.

---

## 5) 2026 trendy — kam jít

### 5.1 ✅ Plus Jakarta Sans — drž

Modernější než Inter, lepší rounded letterforms.

### 5.2 ✅ OKLCH color space — drž

Tailwind v4 + shadcn nativní.

### 5.3 ✅ Dual-pane apps s slide-in side panel

Per `10-design-system-v2.md` sekce 7.4. **Implementuj** v calendar refactoru — místo permanent right panel, slide z pravé strany při kliknutí na booking.

### 5.4 ✅ Command bar (Cmd+K)

V dashboard layoutu už máš search input s ⌘ K kbd hint. **Ozvuč funkčně** přes `cmdk` knihovnu.

### 5.5 ⚠️ AI features — opatrně

- ✅ Smart scheduling suggestion (agentic, value)
- ✅ No-show prediction (uses no_show_count history)
- ❌ AI hero CTA na landing
- ❌ AI chat widget jako primární UX

### 5.6 ✅ Subtle motion (focus, ne hover)

Hover = bg/border darken. Animace na sheet open/close, drag‑drop FLIP, toast appear.

### 5.7 ✅ Density toggle

Setting v `/settings/preferences`, ukládá per‑user, aplikuje přes `data-density` na `<html>`.

### 5.8 ✅ Tabular nums + monospace pro čísla

V `globals.css` máš `font-feature-settings: "tnum"`. Drž.

### 5.9 ⚠️ Dark mode

Variables jsou (✓), ale stránky používají hardcoded barvy → po fix v 3.1‑3.2 začne fungovat. Standard 2026: explicit toggle s `localStorage` perzistencí, ne `prefers-color-scheme` only.

### 5.10 ❌ Glassmorphism / backdrop-blur

Dying.

### 5.11 ❌ Bento grid layouts

2023 trend, 2026 už ne. Drž jednoduchý layout.

### 5.12 ✅ Editorial moments JEN na landing

V app je to past. `app/page.tsx` může mít editorial momenty, dashboard ne.

### 5.13 ✅ Mobile-first calendar interactions

Gesture-first navigation (swipe pro days). `framer-motion` `useDrag` + spring. Booking SaaS = 80 % mobil.

### 5.14 ❌ 3D / Spline embeds

Dead.

### 5.15 ✅ Variable fonts a optical sizing

Plus Jakarta je variable. `font-variation-settings: "wght" 540` pro custom hodnoty mezi 500‑600. Ale max 3 různé wght.

### 5.16 ✅ Lucide stroke 1.5 / 1.75

`stroke-[1.75]` v sidebaru = optimum.

---

## 6) Konkrétní plán oprav (priority order, **AKTUALIZOVANÝ po screen audit**)

| # | Task | Kategorie | Důvod |
|---|---|---|---|
| 1 | Globální search & replace `bg-[#f6f8fb]` → `bg-background` | **XS** | Jeden token pattern, opravuje dark mode |
| 2 | Globální search & replace `bg-blue-600` → `bg-primary`, `text-blue-700` → `text-primary`, `bg-blue-50` → `bg-primary/10`, `border-blue-200` → `border-primary/20` | **XS** | Brand consistency |
| 3 | Globální search & replace `text-slate-950` → `text-foreground`, `text-slate-600` → `text-muted-foreground`, `text-slate-500` → `text-muted-foreground`, `border-slate-200` → `border-border`, `bg-slate-50` → `bg-secondary` | **S** | Mírně kontextové, hodina práce |
| 4 | **NOVÉ:** Refactor `font-black` → `font-semibold` v ne‑landing kontextech (dashboard, sidebar, badges, statboxy, settings, klienti, služby, tým, **kalendář**, **login**). `font-black` zachovat **jen** v `app/page.tsx` pro hero copy | **S** | **Vizuálně nejdůležitější fix.** Změní feel produktu z brutalist na profesionální |
| 5 | Globální search & replace `tracking-[-0.06em]`, `[-0.05em]`, `[-0.04em]`, `[-0.03em]`, `[-0.02em]` → `tracking-tight` | **XS** | 5 magic → 1 token |
| 6 | **NOVÉ:** Login refactor — drop levou polovinu screenu (eyebrow + H1 + demo card), pravá polovina centered max-w-[400px] | **S** | Auth není marketing, viz sekce 2.1 |
| 7 | **NOVÉ:** Dashboard hero refactor — drop `DashboardHero` komponentu (eyebrow + H1 5xl + subhead + CTA), nahradit minimal `<header>` s datum + H1 `text-2xl font-semibold` | **S** | Šetří 200 px vertikálně, viz sekce 2.2 |
| 8 | **NOVÉ:** Clients hero refactor — drop H1 „Klienti a jejich provozní historie", nahradit jednoduchým „Klienti" v `text-2xl font-semibold`. Drop right panel „Rychlé založení", presunout do topbar CTA → modal | **S** | Viz sekce 2.4 |
| 9 | **NOVÉ:** Calendar hero refactor — H1 „Kalendář" v `text-2xl font-semibold`, drop eyebrow „REZERVACE". Drop right panel „Vyber rezervaci" + „Rychlé vytvoření", side panel jen slide-in po klick. | **M** | Viz sekce 2.3 |
| 10 | **NOVÉ:** Calendar week view rewrite — sloupce = staff, řádky = 15 min sloty, booking blocks position‑absolute dle času + délky | **L** | Per `10-design-system-v2.md` sekce 7.4. Stávající week view je nepoužitelný |
| 11 | Refactor `rounded-2xl` na správné radius hodnoty per `10-design-system-v2.md` (sekce 3.5) | **M** | Per‑komponentu rozhodnutí |
| 12 | Refactor `hover:-translate-y-0.5` → `hover:bg-muted` všude **kromě** landing hero CTA | **S** | Subtle hover |
| 13 | Smazat gradient blob backgrounds v `app/page.tsx` | **XS** | Jeden div ven |
| 14 | Smazat floating colored shapes (`absolute -left-7`, `absolute -right-6`) | **XS** | Dva divy ven |
| 15 | Smazat fake browser chrome (traffic lights + URL bar) v hero mockup | **XS** | Jeden div ven |
| 16 | Smazat photo carousel v hero mockup + photo strip v public booking page | **XS** | Tenant‑agnostic stock |
| 17 | Refactor landing hero — H1 z `text-7xl font-black` na `text-5xl font-semibold`, drop ✨ Sparkles chip, drop topbar nav anchors | **S** | 2026 hero |
| 18 | Smazat `backdrop-blur-md` z topbar a všech hlaviček | **XS** | Performance + 2026 |
| 19 | Refactor stat cards — `text-2xl font-semibold tabular-nums` (z `text-4xl font-black tracking-[-0.06em]`) | **S** | Per `10-design-system-v2.md` sekce 6.5 |
| 20 | Inline shadow refactor: `shadow-[0_14px_30px_rgba(...)]` → `shadow-md`, atd. | **S** | Token usage |
| 21 | Vyčistit `globals.css` — smazat `--shadow-soft` a `--shadow-card` aliasy, smazat duplicate `--radius-3xl: 1rem` | **XS** | Cleanup |
| 22 | `border-l-4` → `border-l-2` v calendar booking blocks | **XS** | 2026 stripe weight |
| 23 | Implementovat dark mode toggle v topbaru (`localStorage` persistence) | **S** | Po opravě 1‑3 začne fungovat |
| 24 | Demo data cleanup — `Kokot` → `Eva Nováková`, `Jebat` → „Opakovaný no-show" | **XS** | Profesionální screenshoty |

**Odhad času:**
- Body 1-5 + 13-16 + 18 + 21-22 + 24 (mostly XS, mechanical): **2‑3 hodiny** Codexu
- Body 6-9 + 12 + 17 + 19-20 + 23 (S, vyžadují judgement): **6-8 hodin**
- Bod 10-11 (M/L, refactor): **8-12 hodin**

**Total: ~16-23 hodin Codexu**, výsledek = produkt, který skutečně vypadá jako 2026 SaaS.

**Doporučené pořadí:** Nejdřív 1‑5 (mechanical, opravuje 80 % problémů), pak 13-16 + 18 (rychlý win na landing), pak 6-9 + 19 (per-page hero refactor), pak 10 (calendar rewrite — největší kus), pak zbytek.

---

## 7) Doplňková doporučení (sekce z původního auditu, nezměněno)

### 7.1 Density utility na `<html>`

```css
[data-density="compact"] { --row-height: 32px; }
[data-density="comfortable"] { --row-height: 44px; }
[data-density="cozy"] { --row-height: 56px; }
```

### 7.2 Eyebrow utility class

```css
@utility eyebrow {
  @apply text-xs font-medium uppercase tracking-wider text-muted-foreground;
}
```

(Notice: **ne primary modrá**, je to muted-foreground. Eyebrow nemá být loud.)

### 7.3 Tenant accent color (multi-tenant white-label) — fáze 2

```tsx
<div style={{ '--brand': tenant.brand_color ?? 'var(--primary)' }}>
```

Validace WCAG AA kontrastu při uploadu.

### 7.4 Honest empty-state copy

„Tady se objeví rezervace, jakmile klient něco zarezervuje." + link „Zkopírovat odkaz pro klienty".

### 7.5 Skeletons místo spinners

`animate-pulse` na placeholder cards.

### 7.6 Global keyboard shortcuts

`docs/12-keyboard-shortcuts.md` se seznamem (Cmd+K = search, N = nová rezervace, T = today). Modal `?` zobrazí seznam (Linear pattern).

---

## 8) Finální verdikt

**Aktuální stav po vidění screenů: 4.5/10.** Tokeny jsou **dobré (9/10)**, dvě komponenty (`empty-state.tsx`, `calendar-week.tsx`) jsou **dobré (8/10)**, ale layouty a klíčové stránky **kategoricky ignorují systém (3/10)**.

**Co zachraňuje skóre:**
- Tokens v `globals.css` jsou solid base, na čem stavět
- Sidebar je už světlý (mezitím opraveno?)
- Plus Jakarta Sans + Geist Mono = správný font stack
- Některé komponenty (calendar-week, empty-state) ukazují, že systém **se dá** dodržet

**Co táhne skóre dolů:**
- Login je marketing landing (nesmysl)
- Hero copy 5xl–7xl font-black všude (brutalist 2023)
- Calendar week view je špatný layout (nemá time rows)
- Right panely permanentně vlevo žerou screen real estate (clients, calendar)
- 2023 SaaS template patterns na landing (gradient blobs, fake browser, floating shapes, photo carousel)
- Demo data jsou neprofesionální (`Kokot`, `Jebat`)

**Po implementaci sekce 6 (priority order): 8.5/10.** To už je 2026 ready.

**Co tomu chybí pro 9.5+:** sekce 5.3, 5.4, 5.7, 5.5 (smart scheduling), 5.13. Fáze 2.

---

## 9) Poznámka pro Codexe

> **Důležité:** Tento audit doplňuje `10-design-system-v2.md`. Pořadí priority:
>
> 1. `10-design-system-v2.md` = **závazný design system** (drž se ho)
> 2. `11-design-audit.md` (tento) = **akční opravy aktuálního stavu** (sekce 6, 24 očíslovaných tasků)
> 3. `09-design-system.md` = **historie / reference** (NE následuj)
>
> **Postup:** Začni body 1‑5 (mechanical replace, otevírá další kroky). Po každém bodě `npm run check` + zápis do `docs/implementation-progress.md`. Bod 10 (calendar rewrite) **až jako poslední** — vyžaduje stable design system pod sebou.
