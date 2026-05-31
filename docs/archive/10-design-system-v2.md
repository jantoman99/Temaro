# 10 – Design System v2 „Workbench"

> **Status:** Nahrazuje `09-design-system.md` (Sunrise Studio).
> **Audience:** Codex CLI a vývojáři projektu, sekundárně Figma designer.
> **Cíl:** Praktický app‑first SaaS design pro multi‑tenant rezervační systém. Reálný produkt, ne landing page.
>
> **Kritická poznámka k v1:** Předchozí směr „Sunrise Studio" tlačil produkt do boutique/editorial polohy. Pro booking SaaS to nefunguje — viz sekce 1.

---

## 1) Kritická analýza — proč Sunrise Studio v1 nefunguje

Být upřímný: **navrhli jsme Squarespace web, ne Reservio konkurenta.** Konkrétní problémy:

### 1.1 Serif kurzíva v hero copy je špatně

„Dobré ráno, Eva — *máš plný den.*" v Instrument Serif italic vypadá na Substack newsletteru. **Booking SaaS otevírá majitel salonu 6× denně.** Při šestém otevření tě editorial moment irituje — chceš vidět **počty, ne emocionální copy**. Linear, Stripe Dashboard, Notion ani Cal.com nikde editorial serif v aplikaci nemají. Mají ho na **landing page**, a i tam střídmě.

**Náprava:** Serif jenom na landing page, na success screenu po rezervaci, a **nikde jinde**. V aplikaci čistě sans‑serif.

### 1.2 Coral akcent + indigo primary = boutique salon, ne univerzální SaaS

Kombinace warm coral + indigo violet je krásná, ale **signalizuje beauty/wellness vertikálu**. Cílovka jsou **i lékaři, autoservisy, právníci, trenéři** — zubař v indigo+coral SaaS bude mít pocit, že to není pro něj. Reservio je nudné, ale **kategoricky neutrální**, a to je správně.

**Náprava:** Primary do **klidného teal/blue** rozsahu (důvěryhodný, neutrální napříč obory), accent rezervovat **jen pro stavové barvy** (success/warning/destructive), žádný coral jako brand barva.

### 1.3 Off‑white background s teplým tónem `oklch(0.99 0.004 90)` je k ničemu

Rozdíl mezi `#FFFFFF` a `oklch(0.99 0.004 90)` je vidět **jen na 4K monitoru kolibříka** za úsvitu. Praktický efekt: nula. Nevýhoda: na cheap LCD office monitoru salonu to vypadá špinavě nebo žlutě.

**Náprava:** Čistá běl `#FFFFFF` na karty, **chladný very‑light gray** `oklch(0.985 0.002 240)` na app background. Žádné teplé tóny.

### 1.4 Gradient buttons (Stripe‑style inset highlight)

Vypadá to skvěle v Dribbble shotu. V reálu **na Windows v Chromu na 1080p** se subpixely roztrhají a tlačítko vypadá divně. Linear přešel na **flat solid** v 2024. Vercel taky.

**Náprava:** Solid color buttons. Hover = `bg darken 4%`, ne shift gradientu. Žádný inset highlight.

### 1.5 Service color systém (6 barev) je over‑engineered

Tenant si vybírá z 6 pastel barev pro služby. **MVP ale má 5–10 služeb.** Dáš barber salonu 6 barev a on dá „Střih = mint, Holení = lilac, Komplet = sand". Výsledek: kalendář vypadá jak Pixar. Kaňárek místo přehlednosti.

**Náprava:** **Maximálně 4 utility colors** pro tagging (blue/green/amber/violet). Default = monochrome — barber má všechny rezervace v jedné barvě, rozlišuje jen staffem (sloupce). Color tagging je opt‑in pro pokročilé tenant.

### 1.6 Hero greeting strip s gradient pozadím

„Dobré ráno, Eva ☀️" + gradient strip = **plýtvání 120 px vertikálního prostoru**. Když má majitel 14" notebook a kalendář potřebuje vidět celý den, prvních 120 px je „dekorativní pozdrav". Reservio tohle nemá. Cal.com nemá. Calendly nemá. **Pozdravy patří do mobilní app, ne do dashboardu, který se používá 8 hodin denně.**

**Náprava:** Žádný hero. Topbar 56 px obsahuje tenant switcher, search, primary CTA. Pod tím **rovnou data**.

### 1.7 Prompt pro Codex měl AI landing page DNA

Frází jako „Dobré ráno, máš plný den" + gradient avatary + serif accent + warm coral = **přesně ten AI generated SaaS lookalike**, kterého se Codex právem bojí. Vypadá to jako každý druhý v0.dev outpost.

**Náprava:** Cíl vizuálu = **„nebudí pozornost, neukáže se v Dribble, ale 8 hodin denně se v něm pracuje pohodlně."** Linear, Stripe Dashboard, Pipedrive, HubSpot CRM — to je referenční koridor. Ne Vercel landing, ne Stripe homepage, ne Cal.com booking demo.

### 1.8 `--radius: 0.75rem` (12 px) všude

Booking form s 12px radius na všech inputech vypadá jako **hra na iPhone**, ne profesionální nástroj. Lékař nebo právník to nebude brát vážně.

**Náprava:** **Radius 6 px na inputs/buttons, 8 px na karty, 12 px max na modals.** Vrátit se k systémovým hodnotám.

### Souhrn — co měníme

| v1 (Sunrise Studio) | v2 (Workbench) |
|---|---|
| Warm off‑white + indigo + coral | Cool white + slate‑blue primary |
| Instrument Serif italic accent | Žádný serif |
| Gradient buttons | Solid flat |
| 6 service colors | 4 utility colors, opt‑in |
| Hero greeting strip | Žádný greeting, hned data |
| Editorial copy | Funkční copy |
| Radius 12 px default | Radius 6/8/12 px |
| „Dobré ráno, máš plný den" | „Dnes · 12 rezervací" |

---

## 2) Nový směr — „Workbench"

**Filosofie ve dvou větách:** Tohle není landing page. Tohle je nářadí, ve kterém majitel salonu/ordinace/dílny stráví **víc času než ve Spotify**. Musí to být přehledné, husté informacemi, rychlé a důvěryhodné napříč obory.

**Referenční koridor (čím se inspirujeme, do jaké míry):**

| Zdroj | Co bereme | Co nebereme |
|---|---|---|
| **Linear app** | Sidebar, density, tabular nums, command bar | Dark theme jako default |
| **Stripe Dashboard** | Klid, neutralita, button styling, chart styly | Proprietary fonty |
| **Pipedrive** | App‑first DNA, kalendář layout | Ostře korporátní modré CTA |
| **Notion Calendar (Cron)** | Týdenní view, slide‑in panel, drag‑drop | Editorial typografie |
| **Cal.com booking** | Veřejná booking stránka — single page, mobile centered | Brand barvy v aplikaci |
| **Reservio** | Information density v kalendáři, neutralita oboru | Vizuální zastaralost, bloat |

**Co výslovně nedělat:**

- ❌ Glassmorphism, neon, dark‑first
- ❌ Editorial serif kdekoli v aplikaci
- ❌ Gradient buttons / cards / pozadí
- ❌ AI generated ilustrace, 3D Notion stickers
- ❌ Material 3 patterny
- ❌ Hero greetings, „Dobré ráno", dekorativní strips
- ❌ Pastel‑color tagy všude
- ❌ Round‑full na všem kromě avatarů a badge

---

## 3) Design tokens — `app/globals.css`

Kompletní nahrazení `globals.css`. Drží se shadcn struktury, base‑nova stylu, a **všech token names**, takže žádná shadcn komponenta se nerozbije:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);

  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);

  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);

  /* 4 utility tag colors – jen pro pokročilé tagování, default = monochrome */
  --color-tag-blue: var(--tag-blue);
  --color-tag-green: var(--tag-green);
  --color-tag-amber: var(--tag-amber);
  --color-tag-violet: var(--tag-violet);

  --radius-sm: 0.25rem;   /* 4px – badges */
  --radius-md: 0.375rem;  /* 6px – inputs, buttons */
  --radius-lg: 0.5rem;    /* 8px – cards, dropdowns */
  --radius-xl: 0.75rem;   /* 12px – modals, sheets */
  --radius-2xl: 1rem;     /* 16px – jen pro avatar containery */

  --shadow-xs:   0 1px 0 oklch(0.20 0.015 250 / 0.04);
  --shadow-sm:   0 1px 2px oklch(0.20 0.015 250 / 0.06);
  --shadow-md:   0 2px 4px oklch(0.20 0.015 250 / 0.06), 0 4px 8px oklch(0.20 0.015 250 / 0.04);
  --shadow-lg:   0 4px 8px oklch(0.20 0.015 250 / 0.08), 0 12px 24px oklch(0.20 0.015 250 / 0.08);
  --shadow-pop:  0 8px 16px oklch(0.20 0.015 250 / 0.10), 0 24px 48px oklch(0.20 0.015 250 / 0.12);
}

:root {
  /* Cool white app background, čistá běl pro karty */
  --background: oklch(0.985 0.002 240);
  --foreground: oklch(0.20 0.015 250);

  --card: oklch(1 0 0);
  --card-foreground: oklch(0.20 0.015 250);

  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.20 0.015 250);

  /* Primary – slate-blue, neutrální napříč obory */
  --primary: oklch(0.42 0.08 245);
  --primary-foreground: oklch(0.99 0 0);

  --secondary: oklch(0.965 0.004 240);
  --secondary-foreground: oklch(0.30 0.02 250);

  --muted: oklch(0.965 0.004 240);
  --muted-foreground: oklch(0.50 0.015 250);

  /* Accent – jemný hover/highlight, ne brand barva */
  --accent: oklch(0.95 0.008 240);
  --accent-foreground: oklch(0.25 0.02 250);

  /* Stavové barvy – jen pro stavy, ne pro dekoraci */
  --destructive: oklch(0.55 0.22 27);
  --success:    oklch(0.58 0.13 155);
  --warning:    oklch(0.72 0.15 75);
  --info:       oklch(0.55 0.13 235);

  --border: oklch(0.92 0.006 240);
  --input: oklch(0.92 0.006 240);
  --ring: oklch(0.42 0.08 245);

  /* Utility tags – jen pro opt-in service color tagging */
  --tag-blue:   oklch(0.55 0.13 235);
  --tag-green:  oklch(0.58 0.13 155);
  --tag-amber:  oklch(0.72 0.15 75);
  --tag-violet: oklch(0.55 0.15 295);

  /* Charty – odstupňovaná slate-blue škála + utility ramp */
  --chart-1: oklch(0.42 0.08 245);
  --chart-2: oklch(0.55 0.13 235);
  --chart-3: oklch(0.65 0.10 215);
  --chart-4: oklch(0.75 0.06 200);
  --chart-5: oklch(0.85 0.04 220);

  --radius: 0.5rem; /* 8 px default – cards */

  --sidebar: oklch(0.975 0.003 240);
  --sidebar-foreground: oklch(0.30 0.02 250);
  --sidebar-primary: oklch(0.42 0.08 245);
  --sidebar-primary-foreground: oklch(0.99 0 0);
  --sidebar-accent: oklch(0.94 0.008 240);
  --sidebar-accent-foreground: oklch(0.20 0.015 250);
  --sidebar-border: oklch(0.92 0.006 240);
  --sidebar-ring: oklch(0.42 0.08 245);
}

.dark {
  --background: oklch(0.16 0.012 250);
  --foreground: oklch(0.95 0.005 240);

  --card: oklch(0.20 0.014 250);
  --card-foreground: oklch(0.95 0.005 240);

  --popover: oklch(0.20 0.014 250);
  --popover-foreground: oklch(0.95 0.005 240);

  --primary: oklch(0.72 0.10 235);
  --primary-foreground: oklch(0.16 0.012 250);

  --secondary: oklch(0.24 0.014 250);
  --secondary-foreground: oklch(0.95 0.005 240);

  --muted: oklch(0.24 0.014 250);
  --muted-foreground: oklch(0.68 0.015 240);

  --accent: oklch(0.26 0.016 250);
  --accent-foreground: oklch(0.95 0.005 240);

  --destructive: oklch(0.65 0.20 27);
  --success:    oklch(0.68 0.12 155);
  --warning:    oklch(0.78 0.13 75);
  --info:       oklch(0.68 0.12 235);

  --border: oklch(1 0 0 / 0.08);
  --input: oklch(1 0 0 / 0.10);
  --ring: oklch(0.72 0.10 235);

  --tag-blue:   oklch(0.68 0.12 235);
  --tag-green:  oklch(0.68 0.12 155);
  --tag-amber:  oklch(0.78 0.13 75);
  --tag-violet: oklch(0.68 0.13 295);

  --chart-1: oklch(0.72 0.10 235);
  --chart-2: oklch(0.65 0.10 215);
  --chart-3: oklch(0.55 0.10 245);
  --chart-4: oklch(0.45 0.08 235);
  --chart-5: oklch(0.35 0.06 240);

  --sidebar: oklch(0.18 0.013 250);
  --sidebar-foreground: oklch(0.92 0.006 240);
  --sidebar-primary: oklch(0.72 0.10 235);
  --sidebar-primary-foreground: oklch(0.16 0.012 250);
  --sidebar-accent: oklch(0.24 0.014 250);
  --sidebar-accent-foreground: oklch(0.95 0.005 240);
  --sidebar-border: oklch(1 0 0 / 0.08);
  --sidebar-ring: oklch(0.72 0.10 235);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body {
    @apply bg-background text-foreground antialiased;
    font-feature-settings: "ss01", "cv11";
  }
  html { @apply font-sans; }
  h1, h2, h3, h4 { letter-spacing: -0.011em; font-weight: 600; }
  .nums-tabular { font-variant-numeric: tabular-nums; }
}
```

**Klíčové změny vůči v1:**

- `--background` je **chladný light gray**, ne teplý off‑white
- `--primary` je **slate‑blue** (neutrální), ne indigo‑violet
- `--accent` je teď **jen interakční barva** (hover bg), ne brand
- Stavové barvy jsou **explicitní** (`success`, `warning`, `info`, `destructive`)
- Radius default je **8 px** místo 12 px
- Stíny mají **studený slate undertone**, ne fialový

---

## 4) Typografie

**Stack:** Geist Sans + Geist Mono (už máš v projektu).

| Token | Velikost | Line height | Weight | Použití |
|---|---|---|---|---|
| `text-h1` | 1.5 rem (24 px) | 1.25 | 600 | Hlavička stránky dashboardu |
| `text-h2` | 1.125 rem (18 px) | 1.3 | 600 | Sekce, modal titles |
| `text-h3` | 1 rem (16 px) | 1.4 | 600 | Karty, list group headers |
| `text-body` | 0.875 rem (14 px) | 1.5 | 400 | **Default body — 14 px je app standard** |
| `text-sm` | 0.8125 rem (13 px) | 1.4 | 400 | Sekundární text |
| `text-xs` | 0.75 rem (12 px) | 1.3 | 500 | Labels, popisky, badges, table headers |
| `text-mono-sm` | 0.8125 rem (13 px) | 1.4 | 500 | Časy v kalendáři, ID |
| `text-mono-md` | 0.9375 rem (15 px) | 1.4 | 600 | Ceny, počty, statistiky |

**Důležité revizí:**

- **Body je 14 px**, ne 15. Linear/Stripe/Notion mají 14. 15 vypadá jako spotřební app, 14 je profi standard.
- **H1 je jen 24 px**, ne 32. Dashboard je hustý informacemi, headings nesmí dominovat.
- **Žádný display size, žádný serif.**
- **Tabular nums** všude tam, kde je číslo: časy, ceny, počty rezervací, no‑show counter.

**Letter‑spacing:**

- Headings: `-0.011em` (lehce stažené, profi feel)
- Body: `0`
- Caps labels (UPPERCASE 11 px): `0.04em`

---

## 5) Spacing & layout

**Base unit:** 4 px. Tailwind defaults.

**Layout containery:**

```
--container-sm: 640px   – auth forms, modals
--container-md: 768px   – settings detail pages
--container-lg: 1024px  – default content
--container-xl: 1280px  – dashboard wide views
--container-full: 100% – kalendář, full‑width tabulky
```

**Density (zásadní pro daily‑use SaaS):**

| Použití | Row height | Padding |
|---|---|---|
| Dashboard widget cards | 16 px padding | — |
| Tabulky (klienti, rezervace, služby) | **44 px row** | 12 px horizontal |
| Sidebar nav items | 32 px row | 8 px horizontal |
| Calendar 15‑min slot | 24 px height | — |
| Mobile touch targets | min 44 px | — |

**Reservio má řádek 56 px = bloat. Linear má 32 px = moc compact pro 50‑letého zubaře. 44 px je sweet spot pro SaaS, který používají různě technicky zdatní lidé.**

**Radius systém:**

```
sm  4 px   → badges, mini chips
md  6 px   → inputs, buttons (default)
lg  8 px   → cards, dropdowns, popovers
xl  12 px  → modals, sheets
2xl 16 px  → max — jen pro některé hero containery na booking page
```

**Stíny — pravidla použití:**

- `shadow-xs` → table row hover, sticky elements
- `shadow-sm` → cards, statbox tiles (default)
- `shadow-md` → dropdown, popover, hover states
- `shadow-lg` → modal, side sheet
- `shadow-pop` → command bar, important overlays

---

## 6) Komponenty — design system

### 6.1 Button

5 variant: `primary`, `secondary`, `outline`, `ghost`, `destructive`.

```tsx
// primary  – bg-primary text-primary-foreground, hover bg darken 6%
// secondary – bg-card border-border text-foreground, hover bg-accent
// outline  – bg-transparent border-border text-foreground, hover bg-accent
// ghost    – bg-transparent text-foreground, hover bg-accent
// destructive – bg-destructive text-destructive-foreground

// Sizes: xs 24px / sm 32px / md 36px / lg 40px / xl 48px (jen pro booking)
```

**Žádný gradient. Žádný inset highlight. Solid color, hover = darken.**

### 6.2 Input

- Height 36 px (default), 32 px (compact v tabulkách), 44 px (booking flow)
- Border 1 px solid `--border`
- Focus: `2px ring var(--ring) / 30%` + `border-color: var(--ring)`
- Error: `border-color: var(--destructive)` + `ring var(--destructive) / 25%`
- Padding horizontal 12 px (default), 10 px (compact), 16 px (booking)
- Inside‑radius `--radius-md` (6 px)

### 6.3 Card

```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg); /* 8 px */
  box-shadow: var(--shadow-sm);
  padding: 16px; /* default */
}
```

**Žádný gradient pozadí. Žádný 2px border. Žádný hover lift jako default.**

### 6.4 Badge

3 styly: `solid`, `soft`, `outline`. Velikost 20 px height, padding 6 px horizontal, 11 px text uppercase.

```css
/* soft (default) */
.badge--soft-success {
  background: color-mix(in oklch, var(--success) 12%, transparent);
  color: color-mix(in oklch, var(--success) 80%, var(--foreground));
}
```

Stejně pro `info`, `warning`, `destructive`. Tag colors používej **jen pro opt‑in service tagging** v kalendáři.

### 6.5 Table

- Header row: `bg-muted/50`, `text-xs uppercase tracking-wide`, height 36 px
- Body rows: 44 px height, hover `bg-muted/30`
- Cell padding: 12 px horizontal, 10 px vertical
- Border between rows: `1px solid var(--border)`
- Žádný `border-collapse: separate`, žádné rounded corners na rows
- Active sort indicator: arrow ikon vpravo od header textu

### 6.6 Sidebar

- Width 240 px (default), 64 px (collapsed)
- Background `var(--sidebar)`
- Items: 32 px height, 12 px horizontal padding, radius 6 px
- Active item: `bg-sidebar-accent` + `text-sidebar-accent-foreground` + **left 2px primary stripe** (vrací app‑feel z Linear/Pipedrive)
- Žádné gradient avatars, žádné shadow‑lift na items

### 6.7 Empty state

```tsx
<EmptyState
  icon={<CalendarOff />}      // outline lucide ikon, 32px
  title="Zatím žádné rezervace"
  description="Až klienti začnou rezervovat, uvidíš je tady."
  action={<Button>Sdílet booking odkaz</Button>}
/>
```

- Padding 48 px vertical, 24 px horizontal
- Ikon 32 px lucide `stroke-width 1.5` v `text-muted-foreground`
- Title 16 px `font-semibold`
- Description 14 px `text-muted-foreground` max‑width 360 px centered
- **Žádný serif. Žádné ilustrace. Žádné stickers.**

### 6.8 Toast

- Bottom right, 320 px width, padding 12 px
- Soft background s left 3 px stripe v stavové barvě
- Dismissible po 5 sekundách
- Stack: nejnovější nahoře, max 3 viditelné

### 6.9 Slide‑in Sheet (boční panel)

- Width 400 px (default), 480 px (detail rezervace)
- Slide z pravé strany, 200 ms ease‑out
- Backdrop `bg-foreground/20` s blur 4 px
- Header s title + close button, body scrollable, footer sticky s actions

### 6.10 Modal

- Centered, max‑width 480 px (default), 640 px (lg)
- Backdrop `bg-foreground/40` s blur 6 px
- Radius 12 px
- **Pro detail rezervace NEPOUŽÍVAT modal — použít Sheet.** Modal jen pro confirms („Opravdu zrušit?") a quick forms.

### 6.11 Avatar

- Sizes: xs 20px / sm 24px / md 32px / lg 40px / xl 56px
- Foto > iniciály > ikon person
- **Žádné gradient orby.** Background pro iniciály = deterministic z user.id pomocí HSL hash → ale s saturací max 30 % a lightness 65 % (decentní)
- Border 1 px white na `bg-card` pro layered situace (overlapping group)

### 6.12 Stavy komponent

Každá interaktivní komponenta musí mít definované:

| Stav | Visual |
|---|---|
| `default` | base |
| `hover` | bg/border darken 4–8 % |
| `active` (pressed) | bg darken 8–12 %, scale 0.98 |
| `focus-visible` | 2 px ring `--ring/30` |
| `disabled` | `opacity-50 cursor-not-allowed`, no hover |
| `loading` | Skeleton (cards) nebo Spinner (buttons), preserve layout |
| `error` | `border-destructive`, error message under |
| `empty` | EmptyState component |

---

## 7) Per‑page directives

### 7.1 Landing page (`/`)

**Účel:** přesvědčit majitele podniku, aby zaregistroval. Tady **a jenom tady** může být brand expression.

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  [Logo]  Funkce  Cena  Demo        [Přihlásit] [Zkusit zdarma]
├─────────────────────────────────────────────────┤
│                                                 │
│   Rezervační systém pro tvůj podnik             │
│   Bez kreditových limitů. Bez zbytečností.      │
│                                                 │
│   [Vyzkoušet zdarma →] [Vidět demo]             │
│                                                 │
│   ┌──────── Live mockup dashboard ─────────┐   │
│   │ (statický screenshot kalendáře)         │   │
│   └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│   "Pro koho":                                   │
│   [Salony] [Lékaři] [Trenéři] [Autoservisy]     │
│   horizontal scroll cards                       │
├─────────────────────────────────────────────────┤
│   3 klíčové features (každý 1 odstavec + ikon) │
│   - Žádné kreditové limity                      │
│   - Klientské poznámky                          │
│   - Funguje na každém telefonu                  │
├─────────────────────────────────────────────────┤
│   Cena – 3 plány (Free / Pro / Team)            │
│   Tabulka s features                            │
├─────────────────────────────────────────────────┤
│   FAQ (10 otázek, accordion)                    │
├─────────────────────────────────────────────────┤
│   Final CTA                                     │
│   Footer                                        │
└─────────────────────────────────────────────────┘
```

**Vizuální klíče:**
- Hero copy 36 px (NE 64 px), `font-semibold`, `tracking-tight`
- Subhead 18 px `text-muted-foreground`
- Buttons hero: `lg` velikost (40 px height), `primary` + `outline`
- **Live mockup dashboardu** jako hero image — screenshot reálného produktu, ne 3D rendery
- Industry chips: outline buttons s ikon, žádné kategoriální barvy
- Pricing tabulka: tři karty side by side, prostřední Pro = `border-primary border-2` highlight
- Footer: 4 sloupce (Produkt / Pro koho / Firma / Právní), monochromě

**Co NEDĚLAT:**
- ❌ Auto‑playing video v hero
- ❌ Animované gradienty
- ❌ 3D ilustrace
- ❌ Floating particles / parallax
- ❌ Testimonials s fotkami AI lidí

### 7.2 Veřejná booking stránka (`/[slug]`)

Cíl: **klient zarezervuje za < 30 sekund.** Single page, tři sekce sub sebou, mobile‑first 480 px container.

**Layout:**

```
┌──────────────────────────────────┐  max-w-[480px]
│ [Logo podniku 48×48]             │
│ Eva Nováková                     │  20px font-semibold
│ Barbershop · Brno, Lidická 12    │  13px muted
│ ★ 4.9  · otevřeno do 18:00       │  13px
├──────────────────────────────────┤
│ 1. Vyber službu                  │  16px font-semibold
│ ┌──────────────────────────────┐ │
│ │ ✂️ Pánský střih    30 min  450 Kč │
│ │ ─ vybráno (2px primary border) │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 🪒 Holení          20 min  250 Kč │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ 2. Vyber poskytovatele           │
│ [Komukoliv] [Eva] [Jakub]        │  pill toggles
├──────────────────────────────────┤
│ 3. Vyber termín                  │
│ ◀ Pá 1 │ So 2 │ Ne 3 │ Po 4 ▶   │  date scroller
│ ┌─────────────────────────────┐  │
│ │  9:00  9:30  10:30  11:00   │  │  4-col time grid
│ │ 11:30 14:00  14:30  15:00   │  │
│ └─────────────────────────────┘  │
├──────────────────────────────────┤
│ 4. Tvoje údaje                   │
│ [Jméno a příjmení          ]     │
│ [Telefon] [E-mail]               │
│ [Poznámka (volitelné)        ]   │
├──────────────────────────────────┤
│ Sticky bottom summary bar        │
│ Pánský střih · So 2.5. · 11:00   │
│ 450 Kč        [Potvrdit →]       │
└──────────────────────────────────┘
```

**Klíčové detaily:**
- **Žádný step indicator.** Sekce jsou očíslované 1/2/3/4 inline.
- Hero **bez serif kurzívy**. Standard sans‑serif.
- Service card layout: ikon + name + meta + price horizontal flex, NE žádný emoji decoration nadbytečný
- Date scroller: horizontal snap scroll, 6–7 dnů viditelných, 64×64 px tile
- Time slots: 44 px height pro touch, 4 sloupce na mobil, **6 sloupců na desktop**
- Time slot states: `default` outline / `selected` primary fill / `unavailable` muted s line‑through / `loading` skeleton
- **Sticky bottom bar** se zobrazí, jakmile je vybrána služba
- Inputs 44 px height (touch), placeholder text 14 px
- CTA `Potvrdit →` v sticky baru = `primary lg`, full width na mobilu
- **Confirmation page** je **separátní route** `/[slug]/confirmed/[id]`, ne modal:
  - Velký checkmark ikon (48 px) v `success` barvě
  - „Hotovo, Eva ti pošle potvrzení e-mailem"
  - Summary card s detaily rezervace
  - Buttons: `Přidat do kalendáře (.ics)` / `Sdílet` / `Zrušit rezervaci`

**Branding podniku (multi‑tenant):**
- Tenant si může nastavit **jednu primary barvu** (s validací kontrastu vůči `--background`)
- Tenant logo nahrazuje placeholder
- **Žádný custom font, žádné custom backgrounds.** Pevná struktura, jen accent color.
- Tohle drží **konzistentní zážitek** napříč podniky a ochrání klienta před hroznými „custom designy" tenantů.

### 7.3 Admin Dashboard (`/dashboard`)

**Účel:** přehled na 5 sekund. Co se dnes děje, co řeší pozornost.

**Layout:**

```
┌─Sidebar 240px─┬─ Topbar 56px ──────────────────┐
│ Tenant switch │ [Search Cmd+K]    [+ Rezervace]│
│               ├─────────────────────────────────┤
│ ▸ Přehled    │  H1: Přehled                   │
│   Kalendář   │  ─ Friday 1 May, 2026          │
│   Klienti    │                                 │
│   Služby     │  ┌── 4 stat tiles row ──┐      │
│   Tým        │  │ Dnes  Týden  Tržba   │      │
│              │  │  12     68    36k    │      │
│   Marketing  │  └──────────────────────┘      │
│   Statistiky │                                 │
│              │  ┌── Dnešní rozvrh ──────┐     │
│              │  │ Timeline rows = staff │     │
│              │  │ cols = hours          │     │
│ ─────────    │  │ 3 řádky, 320 px tall  │     │
│ Plán: Free   │  └────────────────────────┘     │
│ 8/30 reserv. │                                 │
│ [Upgrade]    │  ┌──────┬───────────────┐      │
│              │  │ Akce │ Aktivita feed │      │
│              │  │      │               │      │
└──────────────┴──────────────────────────────────┘
```

**Pravidla:**
- **ŽÁDNÝ greeting strip.** Žádné „Dobré ráno". H1 je „Přehled" + datum subtitle.
- 4 statbox tiles, ne 3. Layout: `Dnes / Tento týden / Tržba měsíc / No-show rate`
- Dnešní rozvrh = horizontal timeline, **ale jen 3 staff řádky max** (pokud víc, scroll vertikálně)
- **Akce panel** vlevo dole = quick actions: „Označit no‑show za Annu B." (pokud čas uplynul), „Potvrdit přesun u Karla" (pokud čeká)
- Activity feed vpravo: poslední 5 událostí s timestampy
- **Sidebar bottom card** s plan usage = **jediný gradient v aplikaci**, a to je OK protože je informativní

### 7.4 Kalendář (`/calendar`)

**Toto je nejdůležitější obrazovka v produktu.**

**View modes:** Den / 3 dny / Týden / Měsíc

**Default = Týden, sloupce = staff** (NE dny — to je esenciální rozdíl od Reservio).

**Layout (týdenní view):**

```
┌─────────────────────────────────────────────────────┐
│ ◀ Tento týden ▶  | Den 3 dny [Týden] Měsíc | ⚙️    │  toolbar 48px
├──┬──────────┬──────────┬──────────┬──────────┬─────┤
│  │ Eva 65%  │ Jakub 40%│ Mart. 80%│ Petr 30% │     │  staff header
├──┼──────────┼──────────┼──────────┼──────────┼─────┤
│08│          │          │          │          │     │
│  │ Anna B   │          │ Eva H    │          │     │
│09│ Střih    │          │ Konzul.  │          │     │
│  │          │ Lucie M  │          │ ─ now ─  │     │
│10│ Petr K   │ Barva    │          │          │     │
│  │ Holení   │          │          │ Tom R    │     │
│11│          │          │          │ Střih    │     │
│  │ Karel S  │ Pauza    │          │          │     │
│12│ Komplet  │          │          │          │     │
│..│          │          │          │          │     │
└──┴──────────┴──────────┴──────────┴──────────┴─────┘
```

**Detaily:**
- Time column 48 px wide, hours v `text-mono-sm`
- Staff header: avatar 24 px + jméno + dnešní vytížení v % `text-xs`
- 15‑min grid líny v `border` color, hodinové líny v `border` 2× tmavší
- **Booking blocks:**
  - Default: `bg-card border` + 3 px left stripe v `--primary`
  - Tag colored: `bg-tag-{color}/10` + 3 px left stripe v tag color (jen opt‑in)
  - Status `cancelled`: line‑through + `opacity-40`
  - Status `noshow`: `bg-destructive/8` + `border-destructive/30`
  - Status `completed`: `bg-success/6`
- Block content (kompaktní):
  - 9:00 (mono‑sm font)
  - **Anna Boháčová** (font‑medium, truncate)
  - Pánský střih (text‑xs muted, truncate)
- Mimo working hours: `bg-muted/30` se subtle stripes pattern
- Now indicator: 2 px solid line v `info` color s tečkou vlevo
- **Drag & drop**: cursor `grab`, drag preview = duplicate s `opacity-70 shadow-pop`, drop zones highlight `ring-primary/40`
- **Multi‑select**: Shift+click pro range, drag‑select rectangle pro multiple slots
- Click na block → **Sheet z pravé strany**, ne modal
- Empty 15‑min slot click → mini popover s quick‑book formem (klient autocomplete + služba + Save)

**Toolbar above calendar:**
- Vlevo: arrow nav + „Tento týden" / aktuální range
- Střed: view mode toggle group
- Vpravo: filter (staff multi‑select), settings ikon, „+ Rezervace" CTA

**Mobil:**
- Default view = Den (ne týden — týden se nevejde)
- Staff sloupce ale stále používáme — horizontal scroll pokud 3+ staffů
- Block tap → bottom sheet (ne side sheet)

### 7.5 Klienti (`/clients`)

Layout: standardní table page.

```
┌─────────────────────────────────────────────────────┐
│ H1: Klienti                          [+ Nový klient]│
│ ─ 247 klientů celkem                                │
├─────────────────────────────────────────────────────┤
│ [Search] [Filter: Status ▾] [Sort ▾]               │  44px filter bar
├─────────────────────────────────────────────────────┤
│ ☐ │Jméno     │Telefon    │Posl. návšt│Stav │No‑show│
├───┼──────────┼───────────┼───────────┼─────┼───────┤
│ ☐ │Anna Boh… │+420 605…  │před 3 dny │ ✓   │  0    │
│ ☐ │Karel Sm… │+420 728…  │před 2 týd │ ⚠️  │  2    │  flag warning
│ ☐ │Petr Klo… │+420 605…  │před 5 měs │ ✓   │  0    │
│ ☐ │Tom Race… │+420 728…  │nikdy      │ ✓   │  0    │  walk-in
└─────────────────────────────────────────────────────┘
```

- Table 44 px rows, hover `bg-muted/30`
- Klik na řádek → otevřít **Sheet** s detail klienta
- Bulk actions po selection: Export / Označit flag / Odeslat email
- Status sloupec: Badge `soft-success` (OK) / `soft-warning` (flag) / `soft-destructive` (blacklist v fáze 2)
- No‑show count: monospace zarovnán doprava, `text-warning` pokud ≥ 2

**Detail klienta (Sheet, 480 px width):**
- Header: avatar 56 px + jméno + telefon/email
- Action row: `Edit` / `Nová rezervace` / `Označit flag ⚠️` / overflow menu
- Tabs: `Historie` / `Poznámky` / `Preference` / `Soubory` (fáze 2)
- Historie: timeline rezervací, každá řádka 40 px s service ikonou + datum + staff + cena
- Poznámky: textarea + list předchozích poznámek s timestamps a authorem

### 7.6 Služby (`/services`)

Cards grid 3 sloupce desktop, 2 tablet, 1 mobil. Každá card:

```
┌────────────────────────────┐
│ ✂️  Pánský střih           │  služba ikon (volitelná)
│ ─ aktivní                  │  status badge (soft-success)
├────────────────────────────┤
│ 30 min · 450 Kč            │  meta line, mono nums
│ Eva, Jakub                 │  staff list, text-xs
├────────────────────────────┤
│ [Upravit]    [⋯ menu]      │  card footer
└────────────────────────────┘
```

- Card 8 px radius, `shadow-sm`, hover `shadow-md`
- Toggle „Skryté/Aktivní" inline switch
- „+ Přidat službu" jako primary card‑shaped tlačítko na konci gridu (dashed border, centered icon)

### 7.7 Tým / Zaměstnanci (`/staff`)

**Hybrid view:** Cards na desktopu (3 col grid), List na mobilu.

Card per staff:
```
┌────────────────────────────────┐
│  [Avatar 56px]  Eva Nováková  │
│                 Senior barber │
├────────────────────────────────┤
│ Pracovní hodiny: Po-Pá 9-17   │
│ Služby: 5                     │
│ Aktivních rezervací: 12 dnes  │
├────────────────────────────────┤
│ [Detail]    [⋯]                │
└────────────────────────────────┘
```

Detail staff (route `/staff/[id]`):
- Sekce: Profile / Pracovní hodiny / Služby / Výjimky / Statistiky
- **Pracovní hodiny editor:** týdenní grid Po‑Ne, každý den toggle + start/end time picker, copy‑to‑all‑days button
- Výjimky (dovolená): list s datumy, „+ Přidat výjimku" modal

### 7.8 Nastavení (`/settings`)

Sidebar nav v rámci settings stránky:

```
┌─Settings nav 200px─┬─ Content max 720px ─┐
│ Podnik             │  Aktivní sekce       │
│ Booking stránka    │  forms vertical      │
│ Notifikace         │  group label + field │
│ Storno podmínky    │  group label + field │
│ Účet & billing     │                      │
│ Tým a role         │                      │
│ Bezpečnost         │                      │
└────────────────────┴──────────────────────┘
```

- Forms vertical layout, label nad inputem (NE inline)
- Save button **sticky bottom** na sekci, disabled dokud není dirty
- Toast při save success
- Destruktivní akce (Smazat podnik) v separátní sekci s `destructive` border + dvojí potvrzení

### 7.9 Auth — Přihlášení / Registrace

**Layout:** centered single column, max‑width 400 px, full viewport height, `bg-muted/50`.

```
┌─────────────────────────────┐
│   [Logo 32px]               │
│                             │
│   Přihlášení do systému     │  18px font-semibold
│   Pro správu rezervací      │  14px muted
│                             │
│   [Email                  ] │
│   [Heslo                  ] │
│   [ ] Pamatovat si mě       │
│                             │
│   [   Přihlásit se   ]      │  primary lg full
│                             │
│   ─── nebo ───              │
│                             │
│   [Pokračovat s Google]     │  outline lg full
│                             │
│   Nemáš účet? Zaregistruj   │
│   se zdarma                 │
└─────────────────────────────┘
```

- **Žádné dvouposloupcové layouty s testimonials.** Plytvání místa.
- Logo 32 px tenant nebo product, NE custom hero ilustrace
- Error státy: inline pod fieldem, `text-destructive text-xs`
- Forgot password = secondary link pod heslem
- Registrace = stejný layout, jen víc fieldů (jméno, email, heslo, název podniku)
- Po registraci → onboarding wizard (`/setup`)

### 7.10 Self‑service rezervace klienta (`/booking/[token]`)

Klient klikne na link v potvrzovacím e‑mailu, vidí svou rezervaci.

```
┌────────────────────────────────────┐  max-w-[480px]
│  [Logo podniku]                    │
│  Tvoje rezervace                   │
├────────────────────────────────────┤
│  ✓ Potvrzeno                       │
│                                    │
│  Pánský střih                      │  20px semibold
│  Sobota 2. května · 11:00–11:30    │
│  s Evou Novákovou                  │
│                                    │
│  ─────────────────                 │
│  Eva Nováková (barbershop)         │
│  Brno, Lidická 12                  │
│  +420 605 123 456                  │
│  [Zobrazit na mapě]                │
├────────────────────────────────────┤
│  [Přidat do kalendáře (.ics)]      │
│  [Změnit termín]                   │
│  [Zrušit rezervaci]                │  ghost-destructive
└────────────────────────────────────┘
```

- **Zrušit rezervaci** = ghost button v destructive barvě, klik → modal s potvrzením + storno podmínky info
- **Změnit termín** = redirect zpátky do bookingu s prefill
- Žádný login nutný — token v URL (HMAC signed)

---

## 8) Použití fotek podniků

**Pravidla:**

- **Avatar/logo podniku:** povinné v booking page hero. Pokud chybí → generated initial avatar (decentní HSL hash background, 30 % saturation max)
- **Cover image podniku:** **opt‑in v fáze 2.** V MVP NE — nutí to každého tenant na fotku, většina jich nemá kvalitní = vypadá to mizerně
- **Fotky služeb:** zatím NE. Service cards zůstávají monochromní s ikon (lucide).
- **Fotky staffu:** opt‑in. Pokud staff nahraje, používá se v calendaru staff header a v detail sheet. Fallback = generated initials avatar
- **Žádné stock fotky** v aplikaci ani v emailech.

V landing page lze použít fotky reálných tenantů (s permission), ale v aplikaci musí být fotky **uživatelské**, ne stock.

---

## 9) Styl formulářů

- **Label nad fieldem**, ne inline (lepší pro přístupnost a mobile)
- Label 12 px `font-medium`, mb-1.5
- Required marker: `*` po label v `text-destructive`
- Helper text 11 px `text-muted-foreground` pod fieldem
- Error message 11 px `text-destructive` pod fieldem (replace helper text)
- Field group spacing: 16 px vertical
- Section spacing: 32 px vertical s optional `<hr class="border-border" />`
- **Submit button:** sticky bottom v dlouhých formech, vždy primary lg
- Cancel button: ghost variant vlevo od submit
- **Žádné inline validation, dokud user nesubmitne** (kromě silných signálů jako špatný email format po blur)

**Specifické input typy:**

- **Time picker:** native `<input type="time" step="900">` na mobile, custom Combobox na desktopu (15‑min steps, scroll list)
- **Date picker:** popover s calendar, lucide chevrons, today highlighted
- **Phone input:** s auto‑format `+420 605 123 456` ale store as raw digits
- **Money input:** suffix „Kč" jako `<span>` v inputu vpravo, hodnota v haléřích interně

---

## 10) Styl kalendáře — explicitně

Detail navíc nad rámec sekce 7.4:

**Color encoding hierarchie (priority):**

1. **Status overrides everything**: cancelled/noshow/completed
2. Pokud `status === 'confirmed'` a tag color je nastavený → tag color stripe
3. Default → `--primary` stripe

**Booking block sizing:**

- Min height 24 px (jeden 15‑min slot) — i kratší service zabírá 1 slot vizuálně
- Width: 100 % staff sloupce minus 4 px padding (1 px na každé straně + 2 px gap)
- Když 2+ rezervace stejný čas (overlap, např. doublebook fix) → side‑by‑side split

**Hover & interactions:**

- Block hover: `shadow-md` + `border-foreground/15`
- Block selected: 2 px primary ring
- Slot hover (empty): `bg-primary/5`
- Working hours background: `--card`
- Mimo working hours: `bg-muted/30` + diagonální stripe pattern (subtle, 10% opacity)

**Drag preview:**
- Original block stays at 30% opacity
- Drag clone follows cursor with `shadow-lg`
- Drop zone (slot under cursor): `bg-primary/10 ring-primary/40 ring-2`
- Snap to 15‑min grid

---

## 11) Responsive chování

| Breakpoint | Tailwind | Pravidla |
|---|---|---|
| Mobile | `< 640px` | Sidebar collapsed → bottom tab bar (5 ikon: Přehled / Kalendář / Klienti / Služby / Víc), full‑width content, modals → bottom sheets |
| Tablet | `640–1024px` | Sidebar collapsed → ikon-only 64 px, content max-width none, sheets remain side |
| Desktop | `1024–1440px` | Sidebar full 240 px, content max-width 1280 px |
| Wide | `> 1440px` | Same as desktop, content centered with margins |

**Kritická mobile rozhodnutí:**

- **Bottom tab bar** místo hamburger menu (rychlejší dosah palcem)
- **FAB pro „+ Rezervace"** v pravém dolním rohu, 56 px, `shadow-lg`
- **Calendar default = denní view**, swipe pro next/prev day
- **Tabulky → cards** na mobile (každý řádek = card s key info)
- **Forms → full‑screen modal** na mobile, ne inline
- Touch targets min **44 × 44 px** všude

---

## 12) Implementační pořadí (s `kategriaTasku`)

Opět rozbito tak, aby Codex mohl jet step‑by‑step. **Tohle nahrazuje pořadí z `09-design-system.md`.**

| # | Krok | Kategorie | Důvod |
|---|---|---|---|
| 1 | Přepsat `globals.css` dle sekce 3 | **XS** | Změna design tokens, jeden soubor, vidíš okamžitě napříč všemi shadcn komponentami |
| 2 | Override `Button` komponentu — solid varianty bez gradientu, 5 variant + 5 sizes | **S** | Jedna komponenta, jeden scénář, propojuje se v celé app |
| 3 | Override `Input` komponentu s helper/error text patternem | **S** | Jedna komponenta, používá se v každém formu |
| 4 | Vytvořit `EmptyState` komponentu (sekce 6.7) | **S** | Atom použitelný na 5+ místech (klienti, služby, kalendář, statistiky, historie) |
| 5 | Vytvořit `StatBox` tile komponentu pro dashboard | **S** | Jeden vzor, použije se 4× v dashboardu |
| 6 | Postavit Sidebar s active stripe pattern + tenant switcher | **M** | Propojuje navigaci, multi‑tenant logiku, plan card |
| 7 | Postavit Topbar s Cmd+K search a primary CTA | **M** | Search Combobox + global keyboard shortcut + tenant context |
| 8 | Implementovat Dashboard page (`/dashboard`) podle sekce 7.3 | **M** | Propojuje data fetching, sidebar, topbar, statboxy, timeline preview |
| 9 | Implementovat Settings page se sub‑navigací | **M** | Form patterns, sticky save, validation, success toast |
| 10 | Implementovat Klienti list + Sheet detail | **M** | Table component + Sheet pattern, search, filters |
| 11 | Implementovat Služby grid + edit modal | **M** | Card grid pattern, modal pattern, validation |
| 12 | Implementovat Tým list + Pracovní hodiny editor | **M** | Komplikovaná working hours editor logika |
| 13 | Implementovat Veřejnou booking page (`/[slug]`) podle sekce 7.2 | **M** | Single page se 4 sekcemi, state management, validation, sticky bar |
| 14 | Implementovat Kalendář week view podle sekce 7.4 a 10 | **L** | 4+ míst v systému, drag‑drop, multi‑select, status colors, sheet integration |
| 15 | Implementovat Self‑service booking management (`/booking/[token]`) | **S** | Display + 3 actions, žádný state |
| 16 | Implementovat Auth pages (login + register) | **S** | Centered layout, 2 forms, error handling |
| 17 | Implementovat Landing page (`/`) | **M** | Marketing, hero, features, pricing, FAQ, footer |
| 18 | Implementovat mobile responsive → bottom tab bar + FAB | **M** | Layout switch, touch targets, mobile sheet patterns |
| 19 | Smazat `09-design-system.md` (nahrazeno tímto) | **XS** | Cleanup |

Po každém kroku spustit `npm run check` a zapsat do `docs/implementation-progress.md`.

---

## 13) Figma frame plan (pro designera, pokud budou)

Pokud bude potřeba designer ve Figmě, **přesné pořadí frame screenů**:

**Page 1 – Foundation (token reference)**
- Frame: Color tokens (palety jako swatche)
- Frame: Typography scale (text-h1 až text-xs)
- Frame: Spacing scale (4px base)
- Frame: Radius & Shadow

**Page 2 – Components**
- Frame: Buttons (5 variants × 5 sizes × 4 states grid)
- Frame: Inputs (default, focus, error, disabled, with helper, with error)
- Frame: Cards (default, hover, with footer, statbox tile)
- Frame: Badges (3 styles × 4 colors)
- Frame: Table (header, rows, hover, selected, empty)
- Frame: Sidebar nav (default, active, with badge, collapsed)
- Frame: Avatar (sizes × variants)
- Frame: Empty states (3 examples)

**Page 3 – Landing**
- Frame: Hero (1440px desktop)
- Frame: Industries section
- Frame: Features section
- Frame: Pricing section
- Frame: FAQ section
- Frame: Footer

**Page 4 – Public Booking**
- Frame: 480px container (state 1: no service selected)
- Frame: 480px container (state 2: service selected, picking time)
- Frame: 480px container (state 3: filling form, sticky bar visible)
- Frame: Confirmation page
- Frame: Self-service rezervace

**Page 5 – Auth**
- Frame: Login (desktop + mobile)
- Frame: Register (desktop + mobile)
- Frame: Forgot password
- Frame: Onboarding wizard (5 kroků)

**Page 6 – Admin Dashboard**
- Frame: Dashboard overview (1440px)
- Frame: Dashboard with empty states (new tenant)
- Frame: Mobile dashboard (375px)

**Page 7 – Calendar**
- Frame: Week view (default, all states v jednom: confirmed, cancelled, noshow, completed, current)
- Frame: Day view
- Frame: Month view
- Frame: Booking block detail (Sheet 480px)
- Frame: Quick book popover
- Frame: Mobile day view
- Frame: Drag state preview

**Page 8 – Klienti**
- Frame: List (default + filters open)
- Frame: Empty state
- Frame: Detail Sheet (Historie tab)
- Frame: Detail Sheet (Poznámky tab)
- Frame: Mobile list (cards)

**Page 9 – Služby & Tým**
- Frame: Služby grid
- Frame: Služba edit modal
- Frame: Tým grid
- Frame: Tým detail (working hours editor)

**Page 10 – Nastavení**
- Frame: Podnik
- Frame: Booking stránka (s preview)
- Frame: Notifikace
- Frame: Storno podmínky
- Frame: Účet & billing
- Frame: Tým a role
- Frame: Bezpečnost

**Total cca 60 frames.** Pořadí dělej **Foundation → Components → Auth → Public Booking → Dashboard → Calendar → ostatní**, protože:
- Foundation a Components jsou základ, sdílí se všude
- Auth je nejmenší, dobrý warm‑up
- Public Booking je nejjasnější flow s konkrétním user goalem
- Dashboard a Calendar jsou nejtěžší, dělej je až s zaběhlým systémem komponent

---

## 14) Co Codex implementuje BEZ ptaní (defaults)

Pokud něco není explicitně řečené v této dokumentaci, použij tyto defaults:

- **Animace:** 200 ms ease‑out pro většinu, 150 ms pro hover, 300 ms pro modal open
- **Focus ring:** vždy 2 px `--ring/30` outset
- **Loading:** skeleton pro >300 ms async, spinner jen v buttonech
- **Error boundary:** card s ikon + message + retry button
- **Czech datum format:** `1. 5. 2026` short, `pátek 1. května 2026` long
- **Czech time format:** `14:30` (24h, NE AM/PM)
- **Czech currency:** `1 234 Kč` (mezera jako thousands sep, suffix Kč)
- **Czech phone:** `+420 605 123 456` display, `+420605123456` storage
- **Empty list lengths:** 0 → EmptyState, 1‑5 → no pagination, 6+ → infinite scroll nebo pagination 25/page
- **Date picker first day of week:** Pondělí (CZ standard)

---

## 15) Migrace z `09-design-system.md`

**Pokud jsi již implementoval kroky z 09:**

- Krok 1 (přepis globals.css na Sunrise tokens) → **přepsat znovu** podle sekce 3 tohoto dokumentu
- Krok 2 (Instrument Serif font) → **odstranit z `app/layout.tsx`**, není potřeba
- Krok 3 (`empty-state.tsx` se serifovým akcentem) → **přepsat** podle sekce 6.7 (bez serifu)
- Krok 4 (Button gradient override) → **přepsat na solid** podle sekce 6.1
- Kroky 5–7 (dashboard / booking / kalendář) → **přepsat layouty** podle sekcí 7.3, 7.2, 7.4
- Smazat `--font-serif` references všude
- Smazat `--tag-{indigo,coral,mint,sand,lilac,slate}` z CSS, nahradit `--tag-{blue,green,amber,violet}`

---

## 16) Reference

**Co studovat (otevři, prozkoumej, vrať se sem):**

- **app.linear.app** — sidebar pattern, command bar, tabular nums, slide‑in panely
- **dashboard.stripe.com** — tabulky, statboxy, neutral typography, card patterns
- **app.cron.com / Notion Calendar** — týdenní view layout, drag‑drop, slide‑in event detail
- **cal.com/booking** — single‑page booking flow, mobile centered design
- **app.pipedrive.com** — kalendář s lidmi v sloupcích, color coding rezervovan jen pro stavy
- **app.vercel.com** — settings layout patterns, projektové cards

**Co NEstudovat:**

- Vercel marketing landing
- Stripe marketing landing
- Cal.com marketing landing
- Linear marketing landing
- Jakékoli „SaaS landing template" sites
- Dribbble „dashboard ui" tagy
- v0.dev / Lovable example outputs

(První skupina je marketing — krásná, ale pro app je to past. Druhá skupina je co majitel dílny otevírá 8× denně.)

---

> **Poznámka pro Codex:** Tento dokument **nahrazuje** `09-design-system.md`. Pokud jsi začal implementovat podle 09, přečti sekci 15 a postupuj dle ní. Při nejasnostech se zeptej PŘED implementací, ne po.
