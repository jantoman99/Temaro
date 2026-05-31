# 13 – Landing & Typography Direction (návrat charakteru)

> **Status:** Reakce na uživatelův feedback po aplikaci `11-design-audit.md`. „Líbilo se mi to víc předtím."
> **Datum:** 1. 5. 2026.
> **Cíl:** Vrátit landing page silný hlas + zavést typografický systém, který drží charakter na landing **a** zůstává funkční v aplikaci.
> **Filosofie:** Linear app DNA + editorial landing. Striktně oddělit dvě světy.

---

## 0) Co se stalo a proč

Audit `11-design-audit.md` byl agresivní — sundal `text-7xl font-black`, `Sparkles ✨ chip`, `gradient blob backgrounds`, `floating colored shapes`, `fake browser chrome`, `photo carousel` a všechny **2023 SaaS template patterns**. To bylo **správně**, protože tyhle patterny jsou unfunny už dva roky.

**Ale audit přestřelil v jednom směru:** zaměnil „odstranit template patterns" za „odstranit charakter". Výsledek: produkt teď vypadá generický. Stripe Dashboard mash-up. **Žádné identifikovatelné DNA.**

Tento dokument **vrací charakter na strategická místa** (landing hero, public booking, success screens, empty states) a zavádí **explicitní typografický systém**, aby Codex věděl, kde má být energy a kde klid.

---

## 1) Typografický systém — kompletní

### 1.1 Font stack (zachovat, máš správně)

```
--font-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif;
--font-mono: 'Geist Mono', ui-monospace, monospace;
```

Plus Jakarta je **2026 trend** (rounded geometric, lepší než Inter), Geist Mono jako sourozenec pro čísla.

### 1.2 Přidat: serif accent font

```css
/* app/layout.tsx */
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

// na <html> přidat: ${instrumentSerif.variable}
```

```css
/* globals.css */
:root {
  --font-serif: 'Instrument Serif', 'Source Serif Pro', Georgia, serif;
}

@layer utilities {
  .font-serif-accent {
    font-family: var(--font-serif);
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.012em;
  }
}
```

**Použití:** výhradně na **3 místa** v celém produktu:
1. Landing hero — 2‑3 slova v H1 jako emphasis
2. Public booking page success screen — „Hotovo, *uvidíme se v sobotu*"
3. Empty states — „Až klienti začnou rezervovat, *uvidíš je tady*"

**Nikde jinde.** Žádný dashboard, žádné settings, žádný calendar. To je co odlišuje 2026 SaaS s charakterem (Resend, Cron, Linear blog) od template SaaS.

### 1.3 Type scale — explicitní pravidla

**App side (dashboard, settings, calendar, klienti, služby, tým, login):**

| Token | Velikost | Weight | Tracking | Použití |
|---|---|---|---|---|
| `text-h1-app` | `text-2xl` (24 px) | 600 | `tracking-tight` | Page title (Klienti, Služby, Kalendář, Přehled, Vítejte zpět) |
| `text-h2-app` | `text-lg` (18 px) | 600 | `tracking-tight` | Sekce v stránce (První kroky, Dnešek, Pozor dnes a brzy) |
| `text-h3-app` | `text-base` (16 px) | 600 | `tracking-tight` | Karty, modals |
| `text-stat-value` | `text-2xl` (24 px) | 600 | `tracking-tight` `nums-tabular` | Stat tile values (12, 36 400 Kč, 3,4 %) |
| `text-body` | `text-sm` (14 px) | 400 | `0` | Default body |
| `text-meta` | `text-xs` (12 px) | 500 | `tracking-wider` (0.025em) | Eyebrow labels uppercase, meta text |
| `text-mono` | `text-sm` (14 px) | 500 | `0` `nums-tabular` | Časy, ID |

**App pravidla:**
- **Žádný `font-black`.** Max `font-semibold` (600).
- **Žádný `text-3xl` a víc** v aplikaci. Hierarchie končí na 24 px.
- **Žádný serif.**
- **Žádný `tracking-[-0.06em]` magic.** Jen Tailwind tokens.

**Landing & Public booking & Success/Empty state side:**

| Token | Velikost | Weight | Tracking | Použití |
|---|---|---|---|---|
| `text-display-xl` | `text-5xl/6xl/7xl` responsive (48/60/72 px) | 700 | `tracking-[-0.03em]` `leading-[1.02]` | Landing hero H1 |
| `text-display-lg` | `text-4xl/5xl` (36/48 px) | 600 | `tracking-tight` `leading-[1.1]` | Landing section H2, public booking H1 |
| `text-display-md` | `text-3xl` (30 px) | 600 | `tracking-tight` | Success page title, feature card title |
| `text-eyebrow-marketing` | `text-xs` (12 px) | 500 | `tracking-[0.14em]` uppercase | Landing eyebrow chips ("Temaro Booking pro služby") |
| `text-serif-accent` | inherit (uses parent size) | 400 italic | `-0.012em` | Editorial accent slovo v hero/success |

**Landing pravidla:**
- **`font-bold` (700) jen pro `text-display-xl`.** 2026 trend je **nesahat na font-black** ani na landing — Linear/Anthropic/Vercel mají hero ve 600/700, ne 900.
- **`font-semibold` (600)** pro vše ostatní.
- **Serif accent dovolen** — výhradně přes `.font-serif-accent` utility.
- **Tracking magic povolen jen u `text-display-xl`** (`-0.03em`).

### 1.4 Vizualizace hierarchie

```
LANDING HERO (text-display-xl, 72px bold tight)
  ├─ Sparkles eyebrow chip (12px medium uppercase 0.14em)
  └─ Subhead (18-20px regular 1.6 leading)

LANDING SECTION (text-display-lg, 48px semibold tight)
  └─ Feature description (15-16px medium 1.6 leading muted)

PUBLIC BOOKING H1 (text-display-lg, 48px semibold)
  ├─ Eyebrow (12px medium uppercase 0.14em muted)
  └─ Subtitle (14-15px regular muted)

SUCCESS SCREEN (text-display-md, 30px semibold)
  └─ "Hotovo, uvidíme se v sobotu" — sobotu in serif italic

═════════════════════════════════════ THE LINE ═════════════════════════════════════

APP PAGE TITLE (text-h1-app, 24px semibold tight)
  ├─ Eyebrow (12px medium uppercase wider muted)
  └─ Body (14px regular muted)

APP SECTION (text-h2-app, 18px semibold tight)

STAT VALUE (text-stat-value, 24px semibold tabular-nums tight)
  └─ Stat label (12px medium uppercase wider muted)
```

Ta čára uprostřed je **filosofická hranice**. Nahoře editorial. Dole funkce.

---

## 2) Landing page — návrh

Aktuální `app/page.tsx` má dobrý základ (clean tokens, no gradient blob, no fake browser), ale **chybí mu hlas**. Pojď ho vrátit.

### 2.1 Hero — současný stav vs. návrh

**Současný stav (post-audit):**

```tsx
<h1 className="mt-7 text-balance text-4xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
  Online rezervace, které zvládnou běžný provoz.
</h1>
<p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
  Temaro spojí online booking pro klienta a provozní dashboard pro podnik. Bez tabulkového chaosu, bez
  telefonování a bez pocitu, že systém vznikl před deseti lety.
</p>
```

**Problém:** Copy je sice honest, ale **nudná**. „Online rezervace, které zvládnou běžný provoz" zní jako manuál. Žádný hook.

**Návrh:**

```tsx
<h1 className="mt-7 text-balance text-5xl font-bold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-7xl">
  Rezervační systém,
  <br />
  který <span className="font-serif-accent text-primary">myslí</span> za tebe.
</h1>
<p className="mt-6 max-w-xl text-lg leading-[1.55] text-muted-foreground sm:text-xl">
  Online booking pro klienty a provozní dashboard pro podnik.
  Bez tabulkového chaosu, bez telefonování, bez pocitu, že systém vznikl v roce 2014.
</p>
```

**Co se mění:**

1. **`text-7xl font-bold`** místo `text-6xl font-semibold` — 72 px Bold místo 60 px Semibold. **Ne `font-black`** (900) — Bold (700) je sweet spot 2026. Stripe homepage má hero v 700, Linear taky.
2. **`tracking-[-0.03em]`** místo `tracking-tight` (-0.025em) — jemně agresivnější, drží na 7xl size.
3. **Serif accent slovo** — `myslí` v Instrument Serif italic v primary barvě. To je **ten editorial moment**, který chyběl. Linear blog post titles to dělají, Resend hero copy to dělá.
4. **Copy s charakterem** — „Rezervační systém, který myslí za tebe" je benefit + osobnost. „Online rezervace, které zvládnou běžný provoz" je manuál.
5. **Subhead `text-xl`** (20 px) na desktopu místo `text-lg` (18) — robust feel.
6. **„v roce 2014"** místo „před deseti lety" — konkrétní rok je vtipnější a zařadí to do času (2026 minus 12 let).

### 2.2 Eyebrow chip nad H1

**Současný stav:**

```tsx
<div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
  <Sparkles className="h-4 w-4" />
  Temaro Booking pro služby
</div>
```

**Problém:** `Sparkles ✨` ikon je **2023 SaaS template trap**. Plus „Temaro Booking pro služby" je redundantní s logem (Temaro) a obsahem stránky.

**Návrh:**

```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
  <span className="size-1.5 rounded-full bg-success" />
  Online · MVP připraveno k testu
</div>
```

**Co se mění:**

1. **`Sparkles` pryč.** Místo toho **green dot** (`bg-success`) — signalizuje „live status", což je **2026 pattern** (Linear, Resend, Cal.com všichni mají takový status indicator).
2. **`text-xs uppercase tracking-[0.14em]`** — eyebrow má být **subtle**, ne loud chip. `tracking-[0.14em]` je editorial detail, který odlišuje od běžných chipů.
3. **Copy je status, ne self-promotion.** „Online · MVP připraveno k testu" — řekne návštěvníkovi něco hodnotného (produkt je live, ale ve fázi testu — nastavuje očekávání).
4. **`rounded-full`** zpět — pill chip je správný tvar pro status indicator. `rounded-md` na chipu vypadá jako button.

### 2.3 CTA buttons

**Současný stav:**

```tsx
<Link href="/register" className="... rounded-md bg-primary px-6 ... shadow-md ...">
  Vytvořit podnik
</Link>
<Link href="/demo-barber" className="... rounded-md border ... bg-card px-6 ... shadow-sm ...">
  Ukázat veřejný booking
</Link>
```

**Problém:** OK, ale fade do generic. Buttons mají být na landing **trochu vyšší** (h-12 už je) a primary CTA má mít **jemný gradient** pro fyzický feel — Stripe to dělá, Linear taky.

**Návrh:**

```tsx
<Link
  href="/register"
  className="group/cta inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[oklch(0.46_0.09_245)] to-primary px-6 text-base font-semibold text-primary-foreground shadow-[0_1px_0_oklch(1_0_0/0.15)_inset,0_4px_12px_oklch(0.42_0.08_245/0.25)] transition hover:from-primary hover:to-[oklch(0.38_0.07_245)]"
>
  Vytvořit podnik
  <ArrowRight className="h-5 w-5 transition group-hover/cta:translate-x-0.5" />
</Link>
<Link
  href="/demo-barber"
  className="inline-flex h-12 items-center justify-center rounded-lg border border-border bg-card px-6 text-base font-semibold text-foreground shadow-sm transition hover:bg-muted"
>
  Ukázat veřejný booking
</Link>
```

**Co se mění:**

1. **`rounded-lg`** (8 px) místo `rounded-md` (6 px) — landing CTA je vyšší (h-12), 8 px lépe ladí.
2. **Primary CTA má gradient `oklch(0.46) → oklch(0.42)`** — **2 px tmavší shift dolů**. Spolu s `inset shadow 1px 0 white/15%` to dává **„fyzický button" feel** (Stripe pattern). Hover prohodí gradient. Tohle je **jediné místo v aplikaci**, kde gradient button má smysl.
3. **`shadow-[1px_0_inset, 0_4px_12px_primary/25]`** — colored primary shadow je 2026 acceptable jen na hero CTA (jeden moment, ne všude).
4. **`group-hover translate-x-0.5` na arrow** — micro-interaction, kdy se šipka pohne při hoveru o 2 px doprava. Linear pattern, **delightful detail**.

### 2.4 Hero mockup — největší jednotlivý fix

Tohle je **kritická miss** v aktuálním stavu. Mockup v hero má:
- Tmavý sidebar `bg-slate-950` — **ale reálný sidebar je teď světlý**
- Generický „Studio Magnolia · Dnes 12 rezervací" content
- Sidebar v mockup vypadá jak admin panel, dashboard side jak fragment

**Vizuální mismatch s realitou.** Klient klikne „Začít", uvidí jiný sidebar a má kognitivní disonanci.

**Tři možné cesty:**

**A) Aktualizovat HTML mockup tak, aby odpovídal realitě (XS, ~30 min Codexu):**
- Sidebar přepsat na `bg-sidebar text-sidebar-foreground` light variantu
- Active item na `bg-card shadow-sm` s 2 px primary stripe
- Tenant switcher na `bg-card border-border`
- Stat cards uvnitř mockup na `bg-card border-border` (žádný `bg-secondary` overlay)

**B) Nahradit HTML mockup reálným screenshotem dashboardu (S, ~1 hodina):**
- Codex spustí `npm run dev`
- Vyfotí dashboard ve viewport 1280×800
- Uloží jako `/public/marketing/dashboard-hero.png`
- V `app/page.tsx` nahradí celý mockup div za:
```tsx
<div className="rounded-2xl border border-border bg-card p-2 shadow-lg">
  <Image
    src="/marketing/dashboard-hero.png"
    alt="Temaro dashboard"
    width={1280}
    height={800}
    className="rounded-xl"
    priority
  />
</Image>
</div>
```

**C) Kombinace — HTML mockup teď + screenshot v fáze 2 (doporučeno):**
- Teď udělej **A** (rychle vrátí konzistenci)
- V fáze 2 udělej **B** (po dokončení dashboardu refactoringu — bod 1 ze sekce 3 dokumentu `12-design-audit-round-2.md`)

**Doporučuji A teď.**

### 2.5 Sekce „Features" — vrátit charakter

**Současný stav:**

```tsx
<section id="provoz" className="...grid gap-4...">
  {featureCards.map((feature) => (
    <article key={feature.title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <feature.icon className="h-6 w-6" />
      </div>
      <h3 className="mt-6 text-xl font-semibold tracking-tight">{feature.title}</h3>
      <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{feature.description}</p>
      <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-700">
        <span className="grid size-5 place-items-center rounded-full bg-emerald-100">
          <Check className="h-3.5 w-3.5" />
        </span>
        Připraveno pro MVP
      </div>
    </article>
  ))}
</section>
```

**Problémy:**

1. **Žádný section header.** Sekce začíná rovnou kartami. Návštěvník neví, co tahle sekce je.
2. **„Připraveno pro MVP"** stejný text na všech 3 kartách = nesignální noise. Vyhodit.
3. **Karty jsou bezbarvé** — 3 stejné `bg-card` cards. Žádná hierarchie.

**Návrh:**

```tsx
<section id="provoz" className="mx-auto w-full max-w-[1180px] px-4 pb-20 sm:px-6 lg:px-8">
  <header className="mb-12 max-w-2xl">
    <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      Provoz
    </p>
    <h2 className="mt-2 text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
      Tři věci, na kterých <span className="font-serif-accent text-primary">stojí</span> každý den.
    </h2>
  </header>

  <div className="grid gap-4 lg:grid-cols-3">
    {featureCards.map((feature, idx) => (
      <article
        key={feature.title}
        className="relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
      >
        <div
          className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary"
          aria-hidden
        >
          <feature.icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <p className="mt-5 font-mono text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          0{idx + 1}
        </p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
          {feature.title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {feature.description}
        </p>
      </article>
    ))}
  </div>
</section>
```

**Co se mění:**

1. **Section header** — eyebrow „Provoz" + H2 „Tři věci, na kterých *stojí* každý den" se serif accent na `stojí`. **Vrátí narativ.**
2. **Číslo kartu (`01`, `02`, `03`)** v Geist Mono — **2026 editorial pattern** (Resend, Vercel landing, Cron). Nečíslovaný seznam vs. číslovaný = jiné vnímání, číslování říká „toto je systém, ne náhoda".
3. **„Připraveno pro MVP"** pryč. Místo toho je číslo `01/02/03` jako visual anchor.
4. **Lehký `hover:shadow-md`** místo žádné interakce — karty žijí.
5. **`size-5` ikon `strokeWidth={1.75}`** místo `size-6` se stroke 2 — 2026 stroke standard.

### 2.6 Stat strip pod CTA

**Současný stav:**

```tsx
<div className="mt-10 grid gap-3 sm:grid-cols-3">
  {[
    ["24 h", "automatická připomínka"],
    ["0x", "double-booking"],
    ["1", "provozní dashboard"],
  ].map(...)}
</div>
```

**Problém:** „1 provozní dashboard" je **slabá metrika**. Říká „máme jeden dashboard". To je tautologie. Plus celý stat strip vypadá jak filler.

**Návrh:**

```tsx
<div className="mt-12 grid gap-x-8 gap-y-4 border-t border-border pt-8 sm:grid-cols-3">
  {[
    ["24 h", "Automatická připomínka před každou rezervací"],
    ["0", "Double-booking díky atomic conflict checks"],
    ["< 30 s", "Klient zarezervuje od kliknutí po potvrzení"],
  ].map(([value, label]) => (
    <div key={label}>
      <p className="nums-tabular text-3xl font-semibold tracking-tight text-foreground">
        {value}
      </p>
      <p className="mt-1.5 text-sm leading-5 text-muted-foreground">{label}</p>
    </div>
  ))}
</div>
```

**Co se mění:**

1. **`border-t pt-8`** — separator od CTA, dává to vizuálně jako footer mini-stats, ne jako další blok.
2. **`text-3xl`** values (Plus Jakarta Semibold 30 px) — větší než předtím, ale ne card. Inline na pozadí stránky, **lehce editorial** (Linear homepage pattern).
3. **Žádné karty** — stats sedí přímo na pozadí. **2026 trend.**
4. **Konkrétnější metriky** — „Double-booking díky atomic conflict checks" je technický flex (zubař to ocení), „< 30 s" je dimenzovaná konverze hodnota.

### 2.7 Topbar — doladit

**Současný stav:**

```tsx
<header className="sticky top-0 z-30 mx-auto flex h-16 w-full max-w-6xl items-center justify-between border-b border-border bg-background px-1">
  <Link href="/"><TemaroLogo /></Link>
  <div className="flex items-center gap-2">
    <Link href="/login" className="...border-border bg-card...">Přihlášení</Link>
    <Link href="/register" className="...bg-primary...">Začít <ArrowRight /></Link>
  </div>
</header>
```

**Funkční, ale 2 drobnosti:**

1. **`bg-background`** na sticky topbaru = same color as page = **chybí kontrast při scrollu**. Když scrolluješ, topbar splyne s pozadím.
2. **Žádné nav linky** — to je teď OK (audit doporučil pryč anchor scroll), ale chybí **„Funkce" / „Cena"** anchor odkazy, které by **dávaly orientaci**.

**Návrh:**

```tsx
<header className="sticky top-0 z-30 -mx-1 mt-1 flex h-16 items-center justify-between rounded-2xl border border-border bg-background/85 px-4 backdrop-blur-sm">
  <Link href="/" className="flex items-center gap-3">
    <TemaroLogo />
  </Link>

  <nav className="hidden items-center gap-1 md:flex">
    {[
      ["#produkt", "Produkt"],
      ["#provoz", "Provoz"],
      ["#booking", "Booking"],
    ].map(([href, label]) => (
      <Link
        key={href}
        href={href}
        className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        {label}
      </Link>
    ))}
  </nav>

  <div className="flex items-center gap-2">
    <Link href="/login" className="...border-border bg-card...">Přihlášení</Link>
    <Link href="/register" className="...bg-primary...">Začít</Link>
  </div>
</header>
```

**Co se mění:**

1. **`rounded-2xl border bg-background/85 backdrop-blur-sm`** — floating pill topbar. Linear, Vercel, Anthropic homepage pattern 2026. **Mírný blur je OK na landing** (audit ho zakázal v app, ne v marketing).
2. **Nav linky `Produkt / Provoz / Booking`** — anchor scrolly k existujícím sekcím. **Orientace pro návštěvníka.**

### 2.8 Footer — chybí, přidej

Současný `app/page.tsx` **nemá footer**. To je 2026 anti-pattern — návštěvník nevidí kontakt, social, právní info, FAQ link. Aspoň minimal:

```tsx
<footer className="mt-20 border-t border-border bg-card">
  <div className="mx-auto grid w-full max-w-[1180px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
    <div className="lg:col-span-2">
      <TemaroLogo />
      <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
        Rezervační systém pro salony, ordinace, trenéry a další služby.
        Vyrobeno v Česku, hostováno v EU.
      </p>
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Produkt
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        <li><Link href="#produkt" className="text-foreground hover:underline">Funkce</Link></li>
        <li><Link href="#provoz" className="text-foreground hover:underline">Provoz</Link></li>
        <li><Link href="/demo-barber" className="text-foreground hover:underline">Demo</Link></li>
      </ul>
    </div>
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Firma
      </p>
      <ul className="mt-4 space-y-2 text-sm">
        <li><Link href="/legal/privacy" className="text-foreground hover:underline">Soukromí</Link></li>
        <li><Link href="/legal/terms" className="text-foreground hover:underline">Podmínky</Link></li>
        <li><a href="mailto:hello@temaro.cz" className="text-foreground hover:underline">Kontakt</a></li>
      </ul>
    </div>
  </div>
  <div className="border-t border-border">
    <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <p className="text-xs text-muted-foreground">© 2026 Temaro · Verze 0.1 (MVP)</p>
      <p className="font-mono text-xs text-muted-foreground">made with ☕ in Brno</p>
    </div>
  </div>
</footer>
```

**Klíčové detaily:**
- **`bg-card`** pozadí footeru — jemný separátor od main content.
- **`tracking-[0.14em] uppercase`** column titles — editorial detail.
- **`font-mono` na „made with ☕ in Brno"** — Resend, Vercel mají podobné mono signoffs. **Dává osobnost.** Nepovinné, ale doporučuju.

---

## 3) Public booking page — vrátit editorial moment

Současná `app/(booking)/[slug]/page.tsx` má `text-3xl font-semibold` na jméno podniku. **Tady má smysl mít víc** — booking page je **jediný touchpoint klienta**, jeho první dojem.

### 3.1 BookingHeader

**Současný stav:**

```tsx
<header className="mb-8 text-center">
  <div className="mx-auto mb-4 grid size-12 place-items-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
    {name.slice(0, 2).toUpperCase()}
  </div>
  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
  <h1 className="text-3xl font-semibold tracking-tight text-foreground">{name}</h1>
  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
  ...
</header>
```

**Návrh:**

```tsx
<header className="mb-10 text-center">
  <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[oklch(0.50_0.10_265)] text-base font-semibold text-primary-foreground shadow-md">
    {name.slice(0, 2).toUpperCase()}
  </div>
  <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
    {eyebrow}
  </p>
  <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
    Rezervovat se k <span className="font-serif-accent text-primary">{name}</span>
  </h1>
  <p className="mx-auto mt-4 max-w-md text-base leading-6 text-muted-foreground">
    {description}
  </p>
  ...
</header>
```

**Co se mění:**

1. **Logo `size-14 rounded-2xl` s gradientem** primary → fialově odstínovaný — víc visual weight. Plus mírný `shadow-md` ho **odlepí od pozadí**.
2. **`text-eyebrow-marketing` styl** (uppercase tracking 0.14em) — editorial detail.
3. **H1 „Rezervovat se k *Studio Magnolia*"** — **`Studio Magnolia` v Instrument Serif italic v primary**. To je **ten editorial moment**, který odlišuje od Reservio/Cal.com. Klient otevře link a vidí: „Tohle je profesionální, ne template."
4. **`text-4xl/5xl`** místo `text-3xl` — H1 je hlavní v public touchpointu.

### 3.2 Container width

**Současný stav:** `max-w-[560px]`.
**Návrh:** `max-w-[480px]` per `10-design-system-v2.md` sekce 7.2. Mobile-first feel i na desktop.

### 3.3 Success screen po rezervaci

Tohle ještě není implementované, ale když bude — **silný editorial moment:**

```tsx
<main className="grid min-h-screen place-items-center bg-background px-4 py-12">
  <section className="w-full max-w-[480px] text-center">
    <div className="mx-auto mb-6 grid size-16 place-items-center rounded-full bg-success/15 text-success">
      <Check className="h-8 w-8" strokeWidth={2.5} />
    </div>
    <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl">
      Hotovo, <span className="font-serif-accent text-primary">uvidíme se</span>
      <br />
      v sobotu.
    </h1>
    <p className="mx-auto mt-4 max-w-sm text-base leading-6 text-muted-foreground">
      Potvrzení jsme poslali na <strong className="text-foreground">tvuj@email.cz</strong>.
      Přijde i připomínka 24 hodin před termínem.
    </p>
    {/* summary card + actions */}
  </section>
</main>
```

**„Hotovo, *uvidíme se* v sobotu"** se serif italic na `uvidíme se` — **personality moment**. Klient odchází s pocitem „toto je dobře designovaný produkt", ne „zarezervoval jsem se přes formulář".

---

## 4) Empty states — vrátit editorial moment

`components/ui/empty-state.tsx` je teď čistý funkční. **Přidat serif accent** vrátí charakter:

```tsx
<EmptyState
  icon={CalendarOff}
  title={
    <>
      Zatím <span className="font-serif-accent text-primary">žádné</span> rezervace
    </>
  }
  description="Až klienti začnou rezervovat, uvidíš je tady. Začni sdílením booking odkazu."
  action={{ label: "Zkopírovat odkaz", onClick: copyBookingUrl }}
/>
```

Title přijímá `string | ReactNode`. Když je to string, default plain. Když ReactNode, dovoluje serif accent.

**5 míst, kde to dává smysl:**
- Klienti list — „Zatím *žádné* klienti"
- Služby list — „Žádné *aktivní* služby"
- Kalendář prázdný den — „Volný *den*"
- Statistiky — „Ještě *nemám* data"
- Calendar arriving soon — „Do hodiny *nikdo* nepřijde"

---

## 5) Dashboard — co (ne)měnit

**Nech klid.** `Přehled` jako H1 je správně. Dashboard je **denní pracovní nástroj**, ne marketing. Linear/Stripe Dashboard mají také generické page titles. Tady se charakter projevuje **jinak** — typografií, spacing, density, color choice. Ne marketing copy.

**Jediná drobnost, která vrátí 2 % charakteru:**

V `DashboardHeader` přidej pod page title **subtle one-liner kontextu**, který se mění podle dne:

```tsx
function getDashboardTagline(timeZone: string) {
  const hour = new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone });
  const h = parseInt(hour, 10);
  if (h < 6) return "Noční směna nebo brzké vstávání.";
  if (h < 10) return "Začínáme klidně.";
  if (h < 14) return "Hlavní špička dne.";
  if (h < 18) return "Poslední hodiny rozhodují.";
  return "Den se chýlí ke konci.";
}
```

```tsx
<header>
  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    {dateLabel}
  </p>
  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Přehled</h1>
  <p className="mt-1 text-sm text-muted-foreground">{getDashboardTagline(timeZone)}</p>
</header>
```

**Funkční charakter** — info, které se mění s časem dne. **Žádný editorial fluff**, ale dává to dashboardu **drobnou personality bez bloat**.

---

## 6) App pages (Klienti, Služby, Tým, Settings) — co (ne)měnit

**Nech klid.** `Klienti` jako H1 je správně. **Subtitle volitelně přidat** pro orientaci:

```tsx
<header>
  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
    Adresář
  </p>
  <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Klienti</h1>
  <p className="mt-1 text-sm text-muted-foreground">
    Historie, poznámky a flagy. Veřejný booking nikdy nezobrazuje interní data.
  </p>
</header>
```

Subtitle je **funkční** (vysvětlí, co tu je), nikoli marketing. Linear `Triage` page má taky subtitle „Issues that need attention". Tohle je **správný charakter pro app**.

---

## 7) Konkrétní akční plán pro Codex

| # | Task | Kategorie | Důvod |
|---|---|---|---|
| 1 | Přidat Instrument Serif font do `app/layout.tsx` jako `--font-serif` CSS variable + utility class `.font-serif-accent` v `globals.css` | **XS** | Foundation, otevírá další body |
| 2 | Landing hero — H1 přepsat na `text-5xl/6xl/7xl font-bold tracking-[-0.03em]` s copy „Rezervační systém, který *myslí* za tebe" + serif accent | **S** | Vrací landing charakter |
| 3 | Landing eyebrow chip — Sparkles pryč, místo toho status dot + „Online · MVP připraveno k testu" | **XS** | 2026 pattern |
| 4 | Landing CTA primary — gradient `oklch(0.46) → oklch(0.42)` + inset shadow + colored shadow | **XS** | Fyzický feel, jen primary CTA, jinde nic |
| 5 | Landing topbar — pill `rounded-2xl border bg-background/85 backdrop-blur-sm` + nav linky Produkt/Provoz/Booking | **XS** | Floating pill 2026 |
| 6 | Landing features sekce — header s eyebrow „Provoz" + H2 „Tři věci, na kterých *stojí* každý den" + číslované karty (01/02/03 v Geist Mono) | **S** | Vrací sekci charakter |
| 7 | Landing stats — přepsat na inline grid s `border-t pt-8`, `text-3xl font-semibold` values, konkrétnější metriky | **XS** | 2026 trend |
| 8 | Landing — přidat footer s 4-column grid + signoff line | **S** | Standardní 2026 footer |
| 9 | Hero mockup — sidebar přepsat na **light** variantu (`bg-sidebar text-sidebar-foreground`), aby odpovídal realitě | **XS** | Visual mismatch fix |
| 10 | Public booking — `BookingHeader` H1 přepsat na „Rezervovat se k *{name}*" se serif accent na jméno, `text-4xl/5xl` | **XS** | Editorial moment v klientském touchpointu |
| 11 | Public booking — `max-w-[560px]` → `max-w-[480px]` | **XS** | Mobile-first feel |
| 12 | `EmptyState` komponenta — `title` prop přijímá `string \| ReactNode`, použít serif accent na 5 místech (klienti, služby, kalendář, statistiky, arriving soon) | **S** | Vrací charakter na okraje produktu |
| 13 | `DashboardHeader` — přidat dynamický tagline podle hodiny (`getDashboardTagline`) | **XS** | Funkční personality v app |
| 14 | Klienti / Služby / Tým / Settings — přidat krátký subtitle pod H1 jako funkční orientaci | **XS** | Charakter pro app, ne marketing |

**Odhad času:** ~6 hodin Codexu pro všech 14 bodů.

**Doporučené pořadí:** 1 první (foundation), pak 2‑5 (landing hero), pak 6‑8 (zbytek landing), pak 9 (mockup fix), pak 10‑11 (booking), pak 12 (empty states), pak 13‑14 (app polish).

---

## 8) Co výslovně NEDĚLAT

Aby se Codex nesvedl k tomu, co by zničilo to, co audit `11-design-audit.md` opravil:

- ❌ **Nevracej `font-black`** ani na landing. `font-bold` (700) je sweet spot 2026.
- ❌ **Nevracej gradient blob backgrounds** (`bg-[radial-gradient(circle_at_20%_10%,rgba(...))]`).
- ❌ **Nevracej floating colored shapes** (`absolute -left-7` modré quad + `absolute -right-6` emerald circle).
- ❌ **Nevracej fake browser chrome** s traffic lights v hero mockup.
- ❌ **Nevracej Sparkles ✨ ikon** v eyebrow chipu.
- ❌ **Nevracej photo carousel** v hero mockup.
- ❌ **Nevracej `text-7xl font-black tracking-[-0.07em]`** copy.
- ❌ **Neapliuj serif accent v dashboardu, settings, calendar, kalendáři, klientech, službách, týmu, login.** Ten je **JEN** na landing hero, public booking H1, success screen, empty states.
- ❌ **Neapliuj gradient buttons v aplikaci.** Jen primary CTA na landing hero. Jinde solid `bg-primary hover:bg-primary/90`.
- ❌ **Neapliuj editorial copy v dashboard.** „Denní brief bez šumu" zůstává out. Linear app DNA.

---

## 9) Filosofie shrnutí

**Linear app + editorial landing.** Dvě světy, ostře oddělené:

| Svět | Charakter | Příklad |
|---|---|---|
| **Editorial** (landing, public booking, success, empty states) | Bold typografie, serif italic accent, gradient CTAs, narrative copy | „Rezervační systém, který *myslí* za tebe." |
| **App** (dashboard, calendar, klienti, služby, tým, settings, login) | Striktní 2xl page titles, sans-only, solid buttons, funkční copy | „Přehled", „Hlavní špička dne." |

**Kde je hranice:** mezi `app/page.tsx` (editorial) a `app/(dashboard)/*` (app). Mezi `app/(booking)/[slug]/page.tsx` (editorial) a `app/(dashboard)/calendar/page.tsx` (app). Mezi success screen po rezervaci (editorial) a confirmation listing v dashboardu (app).

Tato hranice **drží profi DNA v každodenní práci** a **dává charakter v marketingu a klientském touchpointu**. To je co dělá Linear (Linear app sterile, Linear blog/marketing výrazné). To je co dělá Resend. To je co dělá Vercel.

**A to je to, co tvůj instinkt říkal — že předtím to mělo charakter, teď je to generic.** Měl jsi pravdu. Tento dokument vrací charakter na strategická místa **bez** vracení 2023 template patterns, které byly skutečné problémy.

---

## 10) Poznámka pro Codexe

> **Důležité:** Tento dokument **nahrazuje** parts sekce 6 v `11-design-audit.md` a sekce 3 v `12-design-audit-round-2.md` co se týče landing page a empty states. Pořadí dokumentů:
>
> 1. `10-design-system-v2.md` = **závazný design system** (Workbench filosofie pro app)
> 2. `13-landing-and-typography.md` (tento) = **editorial direction pro landing/public/empty states + typografický systém**
> 3. `12-design-audit-round-2.md` = **akční dodělky aplikace** (sekce 3, body 1‑8 stále platí — Button refactor je nejdůležitější)
> 4. `11-design-audit.md` = **archivální audit** (~80 % aplikováno)
> 5. `09-design-system.md` = **historie / reference**
>
> **Postup:** Začni bodem 1 (Instrument Serif foundation). Pak landing (2‑8). Paralelně dělej dodělky z `12-design-audit-round-2.md` sekce 3 (Button refactor je největší dopad). Pak booking + empty states (10‑12). App polish (13‑14) jako poslední.
>
> Po každém bodě `npm run check` + zápis do `docs/implementation-progress.md`.
