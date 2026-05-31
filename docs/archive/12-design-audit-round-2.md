# 12 – Design Audit Round 2 (po aplikaci 11-design-audit)

> **Status:** Audit po implementaci `11-design-audit.md`. Datum: 1. 5. 2026.
> **Auditované soubory:** `app/globals.css`, `app/page.tsx`, `app/layout.tsx`, `app/(dashboard)/layout.tsx`, `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/clients/page.tsx`, `app/(dashboard)/services/page.tsx`, `app/(dashboard)/settings/page.tsx`, `app/(dashboard)/calendar/page.tsx`, `app/(auth)/login/page.tsx`, `app/(booking)/[slug]/page.tsx`, `components/calendar/calendar-week.tsx`, `components/ui/button.tsx`.
> **Verdikt v jedné větě:** Codex odvedl **velkou práci** — 80 % auditu je hotových, produkt vyskočil z 4.5/10 na **8/10**. Zbývající nedodělky jsou menší a v sekci 3 je seznam.

---

## 0) TL;DR

Codex aplikoval drtivou většinu sekce 6 z `11-design-audit.md` a produkt vyskočil dramaticky. Konkrétní úspěchy:

- ✅ **Login je opravený** — jeden centered `max-w-[400px]` card, eyebrow „Přihlášení" + H1 „Vítejte zpět" v `text-2xl font-semibold`. Žádný marketing split. Žádná černá demo karta. Přesně podle bodu 6 auditu.
- ✅ **Dashboard hero je redukovaný** — `DashboardHeader` komponenta s eyebrow datumem + H1 „Přehled" v `text-2xl`, vpravo CTA „Otevřít kalendář". Šetří ~200 px vertikálního prostoru. Bod 7 auditu hotov.
- ✅ **Clients/Services/Settings/Staff** mají všechny **konzistentní `text-2xl font-semibold` H1** s minimálním eyebrow. Žádné `text-5xl font-black tracking-[-0.06em]` 2řádkové marketing copy. Bod 8 auditu hotov pro všechny ostatní stránky taky.
- ✅ **Sidebar je světlý** (`bg-sidebar text-sidebar-foreground`), používá tokeny, aktivní item v `bg-card shadow-sm`. Žádný `bg-slate-950`. MVP banner v sidebar bottom je clean. Bod 11 hotov.
- ✅ **Landing page** je dramaticky lepší — `text-4xl/5xl/6xl font-semibold` (NE 7xl `font-black`), copy je honest („Online rezervace, které zvládnou běžný provoz" — ne self-aware ironie), žádný gradient blob, žádné floating shapes, žádné fake browser chrome, žádný photo carousel. Body 13–17 hotové.
- ✅ **Calendar week view byl rewritnutý** — `HOUR_HEIGHT = 64`, `DAY_START_HOUR = 7`, `DAY_END_HOUR = 20`, `PositionedBooking` s top/height/left/width. **Staff sloupce × time rows.** To je největší kus práce z auditu, a je hotový. Bod 10 (L task) hotov.
- ✅ **Booking page** je clean — `max-w-[560px]` (mírně širší než doporučených 480, ale OK), `text-3xl font-semibold` H1, photo strip pryč. Bod 13 hotov.
- ✅ **Globální token usage** — `bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary` napříč vším. Body 1‑3 hotové.
- ✅ **Tabular nums** přes `nums-tabular` utility class v stat values, časech, rezervací counts. Sekce 5.8 design systému respektovaná.
- ✅ **Lucide stroke `1.75`** v sidebaru a topbaru ikonách.

**Co NENÍ hotové (menší pop):**
- ⚠️ **`Button` komponenta** je stále napůl ve starém stavu — `font-black` jako default, `bg-blue-600`, hardcoded shadow `[0_14px_30px_rgba(37,99,235,0.22)]`, `hover:-translate-y-0.5`. To je **jediná velká zbylá miss** z auditu.
- ⚠️ Některé staré `text-3xl font-semibold` (Dashboard `Today's stat tiles`) by mohly jít na `text-2xl` per `11-design-audit.md` bod 19.
- ⚠️ Drobné zbytky: `text-slate-600` na pár místech (dashboard fallback error, „Kdo přijde do hodiny" sekce), `rounded-2xl` na error/notice cardech, `border-l-4` se nikde nezachoval — bod 22 hotov.
- ⚠️ Demo data (`Kokot`, `Jebat`) — nezkontrolováno z kódu, ale screenshot ukazoval. Bod 24 nutno potvrdit.

---

## 1) Co je v topkondici (zachovat / replikovat)

### 1.1 `globals.css` — beze změn, stále perfect

Slate‑blue primary, OKLCH, shadow rampa s correct undertone, radius systém 4/6/8/12/16 px, stavové barvy explicitní. **Drobnost přetrvává:** `--radius-3xl: 1rem` stále duplikuje `--radius-2xl`. Bod 21 auditu částečně neudělán. Drobnost.

### 1.2 Login (`app/(auth)/login/page.tsx`)

Tohle je teď **vzor, jak má vypadat auth obrazovka**. Stripe/Linear/Notion mají téměř identický pattern. Zachovat as is.

```tsx
<main className="grid min-h-screen place-items-center bg-background ...">
  <section className="w-full max-w-[400px]">
    <TemaroLogo className="justify-center" />
    <div className="mt-8 rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Přihlášení</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Vítejte zpět</h1>
      ...
```

**Žádné připomínky.**

### 1.3 Dashboard `DashboardHeader` komponenta

Eyebrow + H1 + CTA pattern, používá tokens, žádný hero strip. **Tento pattern by se měl extractnout** do `components/layouts/page-header.tsx` a používat napříč všemi dashboard stránkami. Aktuálně je copy‑pasted v Dashboard, Clients, Services, Settings, Staff, Calendar header sections — refactor na jednu komponentu by zlepšil maintainability.

### 1.4 Sidebar layout

Light theme respect: `bg-sidebar`, `text-sidebar-foreground`, hover `bg-sidebar-accent`, aktivní item `bg-card shadow-sm`. **Drobnost:** chybí **2 px primary stripe** na aktivním itemu, kterou doporučoval `10-design-system-v2.md` sekce 6.6 jako Linear/Pipedrive pattern. Aktivní item teď vypadá jen jako card, nedrží Linear feel. **Drobný add:**

```tsx
<Link
  className="relative flex h-10 items-center gap-3 rounded-lg bg-card pl-3 ..."
>
  <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-primary" />
  ...
</Link>
```

To by přidalo „toto je aktivní view" subliminal cue.

### 1.5 Calendar week view

`HOUR_HEIGHT = 64` × 13 hodin (7‑20) = 832 px tall, `MIN_BOOKING_HEIGHT = 24` (= jeden 15min slot vizuálně), absolute positioning podle minutes from `DAY_START_HOUR`. **Korektní implementace** sekce 7.4 z design systému. 

**Možnost upgradu** (nepovinné, fáze 2): drag‑and‑drop přes `@dnd-kit/core` pro přesun bookingů mezi sloty/staffy bez modal. Aktuálně klik → query string `?booking=id` → side panel. To je solid baseline.

### 1.6 Landing page

H1 v `text-4xl sm:text-5xl lg:text-6xl font-semibold` — **přesně 2026 levels** (Linear/Anthropic/Stripe homepage range). Copy „Online rezervace, které zvládnou běžný provoz" je benefit‑driven, ne self-referential. Hero mockup je **sice stále HTML** (ne reálný screenshot), ale je čistý: žádný traffic light fake browser, žádné floating shapes, žádný gradient blob za vším.

**Drobnost:** v hero mockup je sidebar **`bg-slate-950 text-white`** — tedy tmavý sidebar mockupu, zatímco reálný sidebar v aplikaci je světlý. **Mockup neodpovídá realitě.** Codex by měl mockup buď přepsat na reálný sidebar (světlý), **nebo ideálně nahradit `<img src="/marketing/dashboard-screenshot.png" />`** pořízeným screenshotem reálného dashboardu. Detail, ale když je ten landing live, klient klikne „Přihlásit", uvidí jiný sidebar a má kognitivní disonanci.

---

## 2) Co je špatně — kritická vrstva (zbytky)

### 2.1 ⚠️ `components/ui/button.tsx` — největší zbylá miss

Toto je **jediný kritický nedodělek** z celého auditu.

```tsx
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center ... rounded-xl border ... text-sm font-black ...",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] hover:-translate-y-0.5 hover:bg-blue-700",
        outline:
          "border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 ...",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:bg-white ...",
        ghost:
          "bg-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-950 ...",
        ...
```

**Pět problémů v jedné komponentě:**

1. **`font-black`** jako default text weight pro všechny buttons. **2026 = `font-medium`** (500), max `font-semibold` (600) pro primary CTA. `font-black` = brutalist 2022. Bod 4 auditu nedodělaný pro buttons.

2. **`bg-blue-600`** v `default` variantě místo `bg-primary`. **Plný 1:1 problém**, který audit identifikoval. Bod 2 auditu nedodělaný pro buttons.

3. **`shadow-[0_14px_30px_rgba(37,99,235,0.22)]`** = inline hardcoded shadow s `rgb()`. Plus colored shadow (modré stínování pod buttonem) je 2023 trend, ne 2026. Bod 20 auditu nedodělaný.

4. **`hover:-translate-y-0.5`** na **všech variantách** (default, outline, secondary). To je lift hover, který audit explicitně zakazoval kromě landing hero CTA. Bod 12 auditu nedodělaný pro buttons.

5. **`text-slate-200`, `text-slate-300`, `text-slate-700`, `text-slate-800`, `text-slate-900`, `text-slate-950`** v outline/secondary/ghost variantách. Hardcoded colors místo tokenů. Bod 3 auditu nedodělaný pro buttons.

**Důsledek:** Button je centrální komponenta, použitá v každém formu, v každém topbaru, v každé akci. **Pokud má button stále `font-black bg-blue-600 hover:-translate-y-0.5`, pak:**

- CTA „Nová rezervace" v topbaru má ten styl
- „Přihlásit se" na login má ten styl
- „Otevřít kalendář" v dashboard hero má ten styl  
- Všechny submit buttons ve formech mají ten styl
- „Začít" na landing má ten styl

Naštěstí **ostatní stránky často používají vlastní button class strings** místo `<Button>` komponenty (např. login form má Submit jako vlastní `<button>` styled inline), ale **kde se `<Button>` použije, problém přetrvává.**

**Fix priority XS (5 minut):**

```tsx
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent text-sm font-medium whitespace-nowrap transition outline-none select-none focus-visible:ring-4 focus-visible:ring-primary/15 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90",
        outline:
          "border-border bg-card text-foreground shadow-sm hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "bg-transparent text-foreground hover:bg-muted",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 gap-2 px-4",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs",
        sm: "h-8 gap-1.5 px-3 text-[0.8125rem]",
        lg: "h-12 gap-2 px-5 text-base",
        xl: "h-14 gap-2.5 px-6 text-base font-semibold",
        icon: "size-10",
        "icon-xs": "size-6 rounded-sm",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    ...
  }
)
```

Změny:
- `rounded-xl` → `rounded-md` (12 → 6 px, app standard)
- `font-black` → `font-medium` default; `font-semibold` jen pro `default` (primary) variantu a `xl` size
- `bg-blue-600` → `bg-primary`; `hover:bg-blue-700` → `hover:bg-primary/90`
- `shadow-[hardcoded]` → `shadow-sm`
- `hover:-translate-y-0.5` → odstraněno (jen hover bg darken)
- `border-slate-*`, `bg-slate-*`, `text-slate-*` → tokeny
- `focus-visible:ring-ring/20` → `ring-primary/15` (jednotnější)
- `active:not-aria-...:translate-y-px` → `active:translate-y-px` (jednodušší)

### 2.2 ⚠️ Drobnost: zbytek `text-slate-600` na 3 místech v dashboard

V `app/(dashboard)/dashboard/page.tsx` jsem zachytil:

```tsx
// fallback error state
<p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-600">
  Přehled měsíce
</p>

// Kdo přijde do hodiny sekce
<p className="mt-1 text-sm text-slate-600">

// Empty state
<p className="text-sm text-slate-600">Do hodiny nikdo nepřijde.</p>

// Tracking magic
tracking-[0.2em]
```

Plus zbylé `rounded-2xl` na 1‑2 místech (error fallback, arriving soon booking item). Body 3, 5, 11 auditu částečně nedodělané pro dashboard fallbacky.

**Fix priority XS:** Globální search & replace `text-slate-600` → `text-muted-foreground`, `rounded-2xl border-slate-200 bg-slate-50` → `rounded-lg border-border bg-muted`, `tracking-[0.2em]` → `tracking-wider`.

### 2.3 ⚠️ Stat tiles dashboard — `text-3xl font-semibold` v „Dnešek" sekci

Per `11-design-audit.md` bod 19 měly stat values jít na `text-2xl font-semibold tabular-nums`. Aktuálně:

```tsx
<p className="nums-tabular mt-2 text-3xl font-semibold tracking-tight">{todayBookingsCount ?? 0}</p>
```

`text-3xl` je 30 px Plus Jakarta Semibold — pořád velké, ale ne brutalist. Linear má statboxy v `text-2xl` (24 px). Drobnost.

**Fix priority XS:** `text-3xl` → `text-2xl` v `Dnešek` sekci grid.

### 2.4 ⚠️ Booking page width 560 px místo 480

```tsx
<div className="mx-auto w-full max-w-[560px]">
```

`10-design-system-v2.md` sekce 7.2 doporučovalo 480 px. 560 je o 17 % širší — na desktopu vypadá víc jako webový form, méně jako mobile-first centered. **Drobnost**, ale single-page mobile-first feel se zlepší při 480.

### 2.5 ⚠️ DashboardHeader copy‑pasted

`DashboardHeader`, `ClientsHeader`, `ServicesHeader`, `SettingsHeader` — všechny mají téměř identický markup (`<header>` s eyebrow + H1, optional CTA vpravo). Refactor do jediné komponenty `<PageHeader />` v `components/layouts/page-header.tsx`:

```tsx
type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string; icon?: LucideIcon };
};

export function PageHeader({ eyebrow, title, action }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          {action.label}
          {action.icon ? <action.icon className="h-4 w-4" /> : null}
        </Link>
      ) : null}
    </header>
  );
}
```

Použití:

```tsx
<PageHeader eyebrow="Adresář" title="Klienti" action={{ href: "#novy-klient", label: "Nový klient" }} />
```

Trvá 15 minut, ušetří ~50 řádků copy-paste a sjednotí styl pro budoucí page additions.

### 2.6 ⚠️ Demo data v reálných screenshotech

Bod 24 auditu (rename `Kokot` → `Eva Nováková`, `Jebat` → „Opakovaný no-show"). Z kódu nezkontrolováno, ale je to v `lib/demo/data.ts`. Pro pohodlí Codexe doporučuju ten soubor projít a sjednotit demo data na profesionální úroveň pro screenshoty.

### 2.7 ⚠️ Hero mockup v `app/page.tsx` má tmavý sidebar

Mockup zobrazuje `bg-slate-950 text-white` sidebar, zatímco reálný sidebar je teď světlý. **Visual mismatch** mezi marketingovým slibem a reálným produktem. Buď upravit mockup na světlý sidebar, **nebo** (lepší) nahradit HTML mockup reálným screenshotem `<img src="/marketing/dashboard-screenshot.png" />` po vyfocení dashboardu.

### 2.8 ⚠️ Sidebar bez 2 px primary stripe na aktivním itemu

Aktivní sidebar item je teď `bg-card shadow-sm` — vypadá jak nadnesená karta. Solid baseline, ale **chybí Linear/Pipedrive pattern** s 2 px stripe vlevo. Subliminal cue „toto je aktivní view". Detail, ale add by zlepšil. Viz sekce 1.4.

### 2.9 ⚠️ Drobnost: `--radius-3xl: 1rem` duplicitní v `globals.css`

Bod 21 auditu částečně. Jeden řádek smazat.

---

## 3) Konkrétní plán dodělků (priority order)

| # | Task | Kategorie | Důvod |
|---|---|---|---|
| 1 | **Refactor `components/ui/button.tsx`** — `font-black` → `font-medium`/`font-semibold`, `bg-blue-600` → `bg-primary`, hardcoded shadow → `shadow-sm`, `hover:-translate-y-0.5` → odstranit, `text-slate-*` → tokeny, `rounded-xl` → `rounded-md` | **S** | **Centrální komponenta**, ovlivňuje každý form, dashboard CTA, login, register, settings save buttons. Nejdůležitější zbylý fix |
| 2 | Search & replace zbylé `text-slate-600` → `text-muted-foreground`, `rounded-2xl border-slate-200 bg-slate-50` → `rounded-lg border-border bg-muted`, `tracking-[0.2em]` → `tracking-wider` v `app/(dashboard)/dashboard/page.tsx` (fallback error + arriving soon empty state) | **XS** | Cleanup zbytků |
| 3 | `text-3xl font-semibold` → `text-2xl font-semibold` v Dashboard "Dnešek" stat tiles | **XS** | Bod 19 z původního auditu |
| 4 | `max-w-[560px]` → `max-w-[480px]` v `app/(booking)/[slug]/page.tsx` | **XS** | Mobile-first feel |
| 5 | Extract `<PageHeader />` komponentu do `components/layouts/page-header.tsx`, použít v Dashboard/Clients/Services/Settings/Staff/Calendar | **S** | Refactor pro maintainability, ne pro vizuální fix. Po dokončení už PageHeader bude reusable pro budoucí stránky |
| 6 | Smazat duplicitní `--radius-3xl: 1rem` v `app/globals.css`, smazat aliasy `--shadow-soft` a `--shadow-card` (po refactoru ui/button.tsx už nebudou potřeba) | **XS** | Cleanup |
| 7 | Sidebar active item — přidat 2 px primary stripe vlevo přes `<span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r-full bg-primary" />` | **XS** | Linear/Pipedrive pattern, subliminal active cue |
| 8 | Cleanup `lib/demo/data.ts` — staff jméno `Kokot` → `Eva Nováková`, flag reasons ze slangových termínů na profesionální | **XS** | Pro screenshoty / marketing screenshots / klientské demo |
| 9 | (Volitelně) Hero mockup v `app/page.tsx` — buď přepsat sidebar v mockup na světlý, nebo nahradit HTML mockup reálným screenshotem `/marketing/dashboard-screenshot.png` | **S** | Po dokončení Codex screenshotne reálný dashboard a vloží jako img |

**Odhad času:**
- Body 1‑4 + 6 (XS/S, ~80 % impact): **2 hodiny** Codexu
- Body 5 + 7 + 8 (S/XS, code quality + UX nuance): **2 hodiny**
- Bod 9 (S, marketing polish): **1 hodina** + 5 minut na screenshot

**Total: ~5 hodin Codexu** k dosažení 9.5/10.

---

## 4) Co stojí za to dodělat z `10-design-system-v2.md` (fáze 2)

Tohle nejsou opravy aktuálního stavu, ale **budoucí featury**, které posunou produkt nad 9.5/10:

### 4.1 Cmd+K command bar funkční

Topbar má `<kbd>⌘ K</kbd>` hint, ale **input je obyčejný `<input>`**. Implementace přes `cmdk` knihovnu (od Pacovicha): fuzzy search napříč klienty / službami / staff / rezervacemi + global keyboard shortcut handler. **2026 must-have.**

### 4.2 Slide-in side panel pro detail rezervace

Aktuálně klik na booking → query string `?booking=id` → renderuje BookingDetail. Funkční, ale není to slide-in. `10-design-system-v2.md` sekce 6.9 doporučuje Sheet komponentu z pravé strany. Implementace přes shadcn `Sheet` + Radix. UX feel daleko hladší.

### 4.3 Drag-and-drop v calendar week view

Calendar má positioned bookings, ale **není drag**. Přes `@dnd-kit/core` přidání drag handlers + drop zone highlight. Sekce 7.4 design systému. **Killer feature pro power users.**

### 4.4 Density toggle (compact / comfortable)

V `/settings/preferences` přidat density preference, aplikovat přes `data-density` na `<html>`, override row heights v tabulkách. Sekce 5.7 z `11-design-audit.md`.

### 4.5 Dark mode toggle v topbaru

Variables jsou v `globals.css`, dark mode by měl fungovat (potřeba ověřit po refactoru button.tsx). Toggle v topbaru přes `localStorage` perzistenci.

### 4.6 Tenant accent color (multi-tenant white-label)

Tenant si nastaví vlastní brand barvu pro public booking page (NE pro admin). `--brand` CSS variable per tenant. Validace WCAG AA kontrastu. Sekce 7.3 z `11-design-audit.md`.

---

## 5) Finální verdikt

**Aktuální stav: 8/10.** Velký skok z 4.5/10 v `11-design-audit.md`.

**Co zachraňuje skóre na 8 (a ne 9+):**
- Button komponenta nedodělaná (ovlivňuje 30+ míst v aplikaci)
- Drobné zbytky `text-slate-600` v dashboardu
- Mockup v landing page má tmavý sidebar (visual mismatch s realitou)

**Po dokončení sekce 3 (5 hodin Codexu): 9.5/10.** To už je špička 2026 SaaS.

**Co tomu chybí pro 10/10:** sekce 4 (cmd+K, slide-in panel, drag-drop, density toggle, dark mode toggle, tenant accent color). To je **fáze 2**, ne MVP polish.

**Pochvala Codexu:** Calendar week rewrite (bod 10 z `11-design-audit.md`, kategorizace L) byl největší kus práce a je hotový a správně. To je **architektonická win**, ne kosmetická. PositionedBooking pattern, HOUR_HEIGHT konstanta, staff sloupce s overlap detection — všechno správně.

---

## 6) Poznámka pro Codexe

> **Důležité:** Tento audit doplňuje `11-design-audit.md`, **nenahrazuje** ho. Pořadí dokumentů:
>
> 1. `10-design-system-v2.md` = **závazný design system**
> 2. `11-design-audit.md` = **audit před implementací** (~80 % aplikováno, archivační hodnota)
> 3. `12-design-audit-round-2.md` (tento) = **akční dodělky aktuálního stavu** (sekce 3, 9 očíslovaných tasků, ~5 hodin)
> 4. `09-design-system.md` = **historie / reference** (NE následuj)
>
> **Postup:** Začni bodem 1 (Button refactor) — má největší impact. Pak body 2‑4 (mechanical XS cleanup, ~30 minut). Pak bod 5 (PageHeader extract, refactor pro maintainability). Pak body 6‑8 (drobné cleanup). Bod 9 jako poslední.
>
> Po každém bodě `npm run check` + zápis do `docs/implementation-progress.md`.
