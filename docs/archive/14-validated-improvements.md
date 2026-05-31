# 14 – Validated Improvements (po reálné rešerši top SaaS 2026)

> **Status:** Akční dokument pro Codex, založený na reálné rešerši top SaaS designu v 2026 (Stripe, Linear, Vercel, Figma, Notion, Cal.com, Resend a další).
> **Datum:** 1. 5. 2026.
> **Co se změnilo proti předchozím auditům:** Tento dokument **NEPROŠLE** některé absolutní zákazy z `11-design-audit.md` a `13-landing-and-typography.md`, protože rešerše ukázala, že některé z nich byly mé hypothesis, ne 2026 konsenzus.

---

## 0) Klíčové revize předchozích auditů

Po web rešerši z konce dubna 2026 musím revidovat:

- ❌ **„Editorial serif accent v aplikaci je past"** — bylo absolutní pravidlo, ne data. Reálně: bold typography v dark mode app je 2026 trend pro design-aware audience.
- ❌ **„`text-7xl font-black` je 2023 trend"** — částečně. 2026 trend je **shorter copy + larger font**. `text-7xl` je OK, pokud copy ≤ 8 slov.
- ❌ **„Workbench filosofie — neutrální napříč obory"** — moje hypothesis. Reálně: design choices musí mapovat na audience expectations, mid-cesta vede k perception gap.
- ✅ **Dark sidebar + violet primary** — je správně. Stripe používá purple jako brand podpis, Linear má electric violet. Drž.
- ✅ **Plus Jakarta + Geist Mono + Instrument Serif** font stack — modern 2026.
- ✅ **OKLCH napříč** — base 2026.

---

## 1) Co rešerše konsenzu top SaaS 2026 říká

**Klíčové principy z analýzy 200+ top SaaS sites (Stripe, Linear, Vercel, Figma, Notion, Cal.com):**

### 1.1 Clarity above the fold (Stanford research: 0,05 s první dojem)

**Hero musí v < 5 sekundách říct:**
1. **Co produkt dělá** (kategorie, ne benefit)
2. **Pro koho je** (industry/role)
3. **Proč to má smysl** (outcome)

> „Best-performing SaaS sites in 2026 say one thing clearly and loudly. One message → one CTA → one next step. No poetry."

### 1.2 Single primary CTA verb opakovaný napříč

> „Every high-performing SaaS site uses one primary CTA verb — Start, Try, Get started, Book — repeated at intervals through the page. Secondary actions exist but are visually subordinate."

### 1.3 Proof above the fold

> „Logos, numbers, metrics, screenshots, case-study stats — right at the top. Not buried somewhere near the footer. Show the win first, then explain the how."

### 1.4 Product-as-proof (#1 trend 2026)

> „The dominant SaaS website design trend in 2026 is product-as-proof. Rather than illustrating what software does with icons and animations, the leading SaaS sites embed real, interactive product moments directly into the marketing page."

### 1.5 Headline ≤ 12 slov

> „Across the top 20, not one uses a headline longer than 12 words. Compression signals confidence."

### 1.6 Dashboard pattern: 240–280 px sidebar + 4–6 KPI cards above-fold

> „The strongest dashboard pattern in 2026 combines sidebar navigation (240-280px), a card-based metric strip (4-6 KPIs), and a flexible content grid using CSS Grid with auto-fill."

### 1.7 Skeletony, ne spinners

> „Skeleton screens. Not spinners. Stripe, Linear, and Notion all use content-shaped placeholders that pulse with a shimmer animation. This technique reduces perceived load time by 20-30%."

### 1.8 Performance je trust signal

> „Speed = trust. 6-second loading animations = lost revenue. Google's Core Web Vitals data shows US mobile users abandon pages that take over 3 seconds to load at a rate of 53%."

### 1.9 Dark mode jako primary surface (ne afterthought inversion)

> „Apps like Arc Browser, Linear, Warp, and Raycast all launched dark-first. Their light modes exist but feel secondary. The dark interface is the 'real' version."

### 1.10 Near-blacks, ne pure black

> „Never use pure `#000000`. Use `#050505` (deepest), `#0d0d0d` (cards), `#141414` (floating)."

### 1.11 Elevation v dark mode = lighter bg, ne shadows

> „In dark mode, elevation = lighter bg (not heavier shadow). Card layers: bg-0 #050505, bg-1 #0d0d0d, bg-2 #141414, bg-3 #1a1a1a."

---

## 2) Konkrétní akční body pro Codex

### 2.1 Hero — zdůraznit „CO produkt JE" před benefit

**Aktuální stav (`app/page.tsx`):**

```tsx
<div className="motion-reveal inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
  <span className="signal-pulse size-2 rounded-full bg-primary shadow-[...]" />
  Signal OS pro služby
</div>

<h1 className="motion-reveal mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
  Méně telefonátů.
  <br />
  <span className="font-serif-accent text-primary">Plnější</span> kalendář.
</h1>
<p className="motion-reveal mt-6 max-w-xl text-lg font-medium leading-[1.6] text-muted-foreground sm:text-xl">
  Rezervační systém pro služby, který ukáže dnešní termíny, rizika i klientský kontext v jednom přehledu. Klient rezervuje online, provoz má klid.
</p>
```

**Problém:** Eyebrow říká „Signal OS pro služby" — to je positioning, ne kategorie produktu. Klient zubař v 5 sekundách neví, jestli je to CRM, kalendář, fakturace, nebo „operating system" (cokoli to znamená).

**Fix:** Eyebrow musí být **kategorie + audience**, ne brand metafora. Hero copy zachovat, ale subhead posunout výš v hierarchii.

```tsx
<div className="motion-reveal inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/75 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur">
  <span className="signal-pulse size-2 rounded-full bg-primary shadow-[0_0_0_4px_oklch(0.55_0.19_282/0.14)]" />
  Rezervační systém pro služby
</div>

<h1 className="motion-reveal mt-7 max-w-4xl text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.045em] text-foreground sm:text-6xl lg:text-7xl">
  Méně telefonátů.
  <br />
  <span className="font-serif-accent text-primary">Klidnější</span> provoz.
</h1>
<p className="motion-reveal mt-6 max-w-xl text-lg font-medium leading-[1.6] text-muted-foreground sm:text-xl">
  Pro salony, ordinace, trenéry a autoservisy. Klient si zarezervuje online, vy vidíte dnešní termíny, rizika a klientský kontext v jednom přehledu.
</p>
```

**Klíčové změny:**

1. **Eyebrow „Signal OS pro služby" → „Rezervační systém pro služby"**
   - „Signal OS" jako brand vocabulary drž v copy uvnitř (Signal Map sekce, Command Surface), **ne v hero eyebrow**. Eyebrow musí říct kategorii.
   - `font-bold` → `font-semibold` (eyebrow nemá být chunky 900-equivalent, jak řekla rešerše)

2. **Hero copy: „Plnější kalendář" → „Klidnější provoz"**
   - „Plnější kalendář" zní jako prodejní claim („chceš víc rezervací"). Přetížený zubař/lékař to nechce slyšet.
   - „Klidnější provoz" se dotýká bolavého místa (chaos), ne ambice (růst). Funguje napříč obory.

3. **Subhead: přidat „Pro salony, ordinace, trenéry a autoservisy"** první větu
   - Audience clarity v < 5 s podle Stanford 0.05 s research. Klient v první větě ví, jestli je to pro něj.

### 2.2 Single primary CTA verb — sjednotit napříč

**Aktuální stav:** Landing má 4 různá CTA:
- „Vytvořit podnik" (hero + ceník)
- „Zařadit se do pilotu" (ceník bottom)
- „Projít booking" (hero secondary)
- „Začít" (topbar)

**Problém:** Top SaaS 2026 používají **JEDEN primary CTA verb opakovaný napříč** (Start / Try / Get started / Book). 4 různé verby → cognitive load + diluovaná konverze.

**Fix:**

| Pozice | Před | Po |
|---|---|---|
| Topbar | Začít | **Začít zdarma** |
| Hero primary | Vytvořit podnik | **Začít zdarma** |
| Hero secondary | Projít booking | Projít booking ✓ (secondary, drž) |
| Pricing CTA | Zařadit se do pilotu | **Začít zdarma** |

Sekundární akce („Projít booking", „Přihlášení") mohou mít vlastní text — pravidlo se týká **primary action**.

### 2.3 Proof bar pod hero (přesunout `proofMetrics` výš)

**Aktuální stav:** `proofMetrics` (337 testů, 0 % provize, 24 h reminder) je **až dole na stránce**, sekce „Důkaz připravenosti".

**Problém:** Rešerše říká: „Show the win first, then explain the how. Logos, numbers, metrics — right at the top, not buried near the footer."

**Fix:** Přesunout proof bar **přímo pod hero CTA buttons**, **před** `InteractiveProductDemo`. Současně **smazat** sekci „Důkaz připravenosti" dole (replace, ne duplicate).

```tsx
{/* po hero CTAs, ještě v levé koloně, před uzavřením <section> */}
<div className="motion-reveal mt-12 grid gap-3 sm:grid-cols-3">
  {[
    ["337", "automatických testů chrání core flow"],
    ["0 %", "marketplace provize z vlastních klientů"],
    ["24 h", "reminder vrstva připravená pro provoz"],
  ].map(([value, label]) => (
    <div key={label} className="rounded-xl border border-border/80 bg-card/78 p-4 shadow-sm backdrop-blur">
      <p className="nums-tabular text-3xl font-semibold tracking-tight text-primary">{value}</p>
      <p className="mt-2 text-sm font-medium leading-5 text-muted-foreground">{label}</p>
    </div>
  ))}
</div>
```

**Současně:** sekci `signals` (24 h / 0× / 1 link) buď **smazat** (duplikuje proofMetrics), **nebo** přejmenovat na konkrétní benefit signals (ne metrics) a přesunout dolů. Mít dvě číselné triády za sebou je vizuálně matoucí.

**Doporučuju:** smazat `signals` triádu, ponechat jen `proofMetrics` výš. Už máš v hero copy „bez telefonátu" — `signals[0]` „24 h reminder odejde dřív, než klient zapomene" není over-the-top hodnota, je to detail.

### 2.4 `font-black` regrese — opravit

**Aktuální stav:** `font-black` (weight 900) se vrátilo na několika místech v `app/page.tsx`:

- `Signal Map` čísla 1–5: `text-xs font-black text-primary`
- Flow steps čísla: `text-sm font-black text-primary-foreground`
- Hero floating Temaro core: `text-sm font-black text-primary-foreground`

**Problém:** Rešerše: „SaaS brands are using oversized, assertive fonts" — assertive ≠ heaviest available weight. 2026 cap je `font-bold` (700) max, headings na 600. `font-black` (900) je 2022 brutalist trend.

**Fix:** Globální search & replace v `app/page.tsx`:
- `font-black text-primary` → `font-bold text-primary`
- `font-black text-primary-foreground` → `font-semibold text-primary-foreground`

Aplikuje se na ~6 míst v landing.

### 2.5 Serif accent — redukovat z 6 na max 3 výskyty

**Aktuální stav landingu má `font-serif-accent` na 6 místech:**
1. „*Plnější* kalendář" (hero)
2. „*klid* v provozu" (provozní realita)
3. „*SaaS karta*" (signal map)
4. „*čas*" (pro koho)
5. „*pevná*" (bezpečnost)
6. „*základy*" (důkaz připravenosti)

**Problém:** Linear / Resend / Vercel mají serif accent na **1–2 místech** celé landing. Po čtvrtém výskytu ztrácí význam — z editorial moment se stává tic. Rešerše: „Compression signals confidence" — to platí i na typografické moments.

**Fix:** Zachovat serif accent pouze na **max 3 místech** s největší hierarchií:
1. ✅ Hero H1 — `Klidnější` (po fixu z 2.1)
2. ✅ „Pro koho" — `čas` (kategorie‑defining moment)
3. ✅ Bezpečnost H2 — `pevná` (kontrast „jednoduché vs pevné")

**Smazat z:** „klid v provozu", „SaaS karta", „základy" — nahradit běžným `text-primary` nebo nechat regular.

### 2.6 Hardcoded primary glow shadow → token

**Aktuální stav:** Inline shadow `shadow-[0_10px_30px_oklch(0.55_0.19_282/0.22)]` je opakováno na **~5 místech** v `app/page.tsx` a `interactive-product-demo.tsx`.

**Fix:** Přidat token do `globals.css`:

```css
@theme inline {
  /* ... */
  --shadow-primary-glow: 0 10px 30px oklch(0.55 0.19 282 / 0.22);
  --shadow-primary-glow-lg: 0 20px 60px oklch(0.55 0.19 282 / 0.22);
  --shadow-command: 0 30px 80px oklch(0.18 0.025 222 / 0.16);
}
```

V kódu nahradit:
- `shadow-[0_10px_30px_oklch(0.55_0.19_282/0.22)]` → `shadow-[var(--shadow-primary-glow)]`
- `shadow-[0_30px_80px_oklch(0.18_0.025_222/0.16)]` → `shadow-[var(--shadow-command)]`
- `shadow-[0_22px_60px_oklch(0.55_0.19_282/0.30)]` → `shadow-[var(--shadow-primary-glow-lg)]`

Cleanup pro maintainability.

### 2.7 Performance audit (CRITICAL)

**Aktuální stav:** Landing má:
- 9 plných sekcí
- `signal-grid` background pattern (2 linear-gradients tile)
- `signal-hero` (2 radial gradients + linear gradient)
- `signal-map` (1 radial + 2 linear gradients + bg)
- `interactive-demo-shell::before` (radial dot pattern + mask)
- 3 keyframe animations (`motion-reveal`, `signal-flow`, `signal-pulse`)
- `backdrop-blur-xl` na topbaru a interactive demo
- Plus Jakarta + Geist Mono + Instrument Serif (3 font families)
- `signal-flow` lines v Signal Map (2 absolute lines s animací)

**Problém:** Rešerše: „Google's Core Web Vitals data shows US mobile users abandon pages that take over 3 seconds to load at a rate of 53%. Speed = trust."

**Fix priorita:**

1. **Spustit Lighthouse audit** na `localhost:3000/`
   ```bash
   npx lighthouse http://localhost:3000 --view --preset=desktop
   npx lighthouse http://localhost:3000 --view --preset=mobile
   ```
   Cílit: **LCP < 2.5 s, CLS < 0.1, FID/INP < 100ms** (Core Web Vitals 2026).

2. **Pokud LCP > 2.5 s na mobilu:**
   - Lazy-load `InteractiveProductDemo` (je `"use client"`, ale renderuje se okamžitě v hero) → `next/dynamic` s `ssr: false` a placeholder skeleton
   - Lazy-load Signal Map sekce (je hluboko ve scrollu) → `loading="lazy"` ekvivalent
   - Smazat `signal-grid` na hero pokud není critical (background overhead)
   - `Instrument Serif` pouze pokud se vyskytuje na fold — `display: "optional"` místo `"swap"`

3. **Mobile-specific fix:**
   - `backdrop-blur-xl` na slabém telefonu (Galaxy A14, iPhone SE) trhá frame rate. Zvážit `backdrop-blur-md` nebo `media (prefers-reduced-motion)` fallback bez blur.
   - 9 sekcí na mobilu = nekonečný scroll. Zvážit kondenzaci (sloučit „Signal Map" + „Rezervační tok" do jedné, sloučit „Před / S / Další krok" s jiným contextem).

### 2.8 Hero mockup → reálný screenshot dashboardu (fáze 2)

**Aktuální stav:** `InteractiveProductDemo` je stále **stylized HTML mockup** s vymyšlenými klienty.

**Doporučení (fáze 2, ne teď):** Po dotažení dashboardu:
1. Spustit `npm run dev`, otevřít `/dashboard` v 1280×800
2. Vyfotit jako `/public/marketing/dashboard-hero-2026.png`
3. Vedle interactive demo přidat varianta s reálným screenshotem (toggle „Live preview / Real screenshot")

Rešerše: „Figma's landing page embeds a live collaboration demo that users can manipulate without signing up." → ideál: read-only Supabase demo tenant. To je ale velký kus práce, **NE pro toto kolo**.

### 2.9 Demo data cleanup (zbývající z předchozích auditů)

**Aktuální stav:** `lib/demo/data.ts` pravděpodobně stále obsahuje `Kokot` jako jméno staffu, `Jebat` jako flag reason (z předchozích screenshotů).

**Fix:** Cleanup pro screenshoty / klientské demo:
- `Kokot` → `Eva Nováková` (nebo `Jakub Svoboda`)
- `Jebat` → `Opakovaný no-show` (nebo `Nereaguje na zprávy`)
- Ověřit ostatní strings (search „kokot", „jeba", a další) v `lib/demo/data.ts`, `lib/demo/clients.ts`, etc.

### 2.10 Single source of truth pro CTA href

**Aktuální stav:** Hero CTA `/register`, secondary `/demo-barber`, ale topbar má taky `/register` a Pricing taky `/register`. Pokud se cíl změní, je to grep & replace na 4 místech.

**Fix (volitelné, ale doporučené):**

```tsx
// app/page.tsx
const CTA = {
  primary: { href: "/register", label: "Začít zdarma" },
  secondary: { href: "/demo-barber", label: "Projít booking" },
} as const;
```

Použít `CTA.primary.href` napříč. Maintainability.

---

## 3) Pořadí implementace

Sjednoceno podle priority impactu × času:

| # | Task | Kategorie | Čas |
|---|---|---|---|
| 1 | Hero eyebrow „Signal OS pro služby" → „Rezervační systém pro služby" | **XS** | 2 min |
| 2 | Hero H1 „Plnější" → „Klidnější", subhead přidat „Pro salony, ordinace, trenéry…" | **XS** | 5 min |
| 3 | Sjednotit primary CTA na „Začít zdarma" napříč (topbar, hero, pricing) | **XS** | 5 min |
| 4 | `font-black` → `font-bold/semibold` regrese fix (search & replace) | **XS** | 5 min |
| 5 | Smazat `signals` triádu, přesunout `proofMetrics` pod hero CTAs | **S** | 20 min |
| 6 | Smazat sekci „Důkaz připravenosti" (po přesunu metrics ji už nepotřebuješ) | **XS** | 2 min |
| 7 | Redukovat `font-serif-accent` z 6 na 3 výskyty | **XS** | 5 min |
| 8 | Přidat shadow tokens do `globals.css`, nahradit hardcoded inline shadows | **S** | 15 min |
| 9 | Spustit Lighthouse audit, dokumentovat výsledky do `docs/15-performance-audit.md` | **S** | 15 min |
| 10 | Pokud Lighthouse LCP > 2.5 s: lazy-load `InteractiveProductDemo` + Signal Map | **M** | 30 min |
| 11 | Demo data cleanup `Kokot/Jebat` → profesionální | **XS** | 10 min |
| 12 | (Volitelné) CTA constants single source of truth | **XS** | 5 min |

**Total:** ~2 hodiny Codexu pro všechny mechanické fixy (1–8, 11, 12).
**+30 min** pokud Lighthouse vyžaduje lazy-loading (10).

---

## 4) Co výslovně NEMĚNIT (rešerše potvrdila že je to správně)

Aby se Codex nesvedl k undoing práce, která je správná:

- ✅ **Tmavý sidebar** — Linear/Stripe/Vercel pattern. **Drž**.
- ✅ **Violet primary `oklch(0.55 0.19 282)`** — Stripe používá purple jako brand podpis, Linear má electric violet. **Drž**.
- ✅ **Plus Jakarta + Geist Mono + Instrument Serif** font stack — solid 2026.
- ✅ **OKLCH napříč tokens** — modern.
- ✅ **`InteractiveProductDemo` s tabs** — product-as-proof přístup, top 2026 trend.
- ✅ **Pricing tier struktura** (Pilot / Solo / Tým) — clear differentiation.
- ✅ **Honest copy „Nejsou tu falešné reference. Jsou tu ověřené základy."** — anti-marketing 2026.
- ✅ **Footer s 4-column grid + coffee signoff** — Resend/Vercel pattern.
- ✅ **`PageHeader` komponenta** s `bg-card/88 backdrop-blur` — drží konzistenci s rebrand identitou.
- ✅ **`signal-grid`, `signal-hero`, `command-surface`, `signal-pulse` utility classes** — autorská brand vrstva.
- ✅ **„Signal OS" / „Signal Map" copy uvnitř landing** — drží brand identity (jen ne v hero eyebrow).
- ✅ **Dynamický `getDashboardTagline`** — funkční personality v dashboard.

---

## 5) Otevřené otázky pro tebe (kapitán rozhoduje)

**Než Codex začne, vyřešit:**

1. **Hero copy:** „Klidnější provoz" vs „Plnější kalendář" vs „Více hotových termínů"?
   - „Klidnější provoz" — bezpečné napříč obory, dotyká bolesti
   - „Plnější kalendář" — current, ale prodejní, někdo to nechce
   - „Více hotových termínů" — completion language, neutrální

2. **Eyebrow:** „Rezervační systém pro služby" vs „Booking systém pro služby" vs „Online rezervace pro služby"?
   - „Rezervační systém" — klasické české znění, dobré pro Google search
   - „Booking systém" — moderní, ale anglicismus
   - „Online rezervace" — taky funguje

3. **Audience pivot v subhead:** „Pro salony, ordinace, trenéry a autoservisy" — je 4 vertikál ok, nebo by mělo být víc/míň?
   - Současné `audienceSegments` má salony / trenéři / ordinace / autoservisy → 4
   - Subhead by měl matchnout přesně, jinak cognitive dissonance

4. **Primary CTA verb:** „Začít zdarma" vs „Vytvořit podnik" vs „Spustit pilot"?
   - „Začít zdarma" — value proposition + action verb (best practice)
   - „Vytvořit podnik" — current, descriptive
   - „Spustit pilot" — matchne s „Pilot" plánem v ceníku

**Bez odpovědí udělá Codex defaults z dokumentu (Klidnější / Rezervační systém / 4 vertikály / Začít zdarma).**

---

## 6) Poznámka pro Codex

> **Důležité:** Tento dokument **doplňuje** předchozí audity, **nenahrazuje** je. Pořadí dokumentů:
>
> 1. `10-design-system-v2.md` = závazný design system (Workbench filosofie)
> 2. `13-landing-and-typography.md` = editorial direction pro landing/public/empty states + typografický systém
> 3. `14-validated-improvements.md` (tento) = **akční fixy po reálné rešerši top SaaS 2026**
> 4. `12-design-audit-round-2.md` = předchozí dodělky (částečně zastaralý)
> 5. `11-design-audit.md`, `09-design-system.md` = archiv
>
> **Postup:** Začni body 1–4 (mechanické XS fixy, ~20 min), pak 5–8 (~50 min), pak 9–10 (Lighthouse + lazy-load podle výsledků), nakonec 11–12 (demo data + CTA constants).
>
> **Validace:** Po každém bodě `npm run check`, po body 9 navíc `npx lighthouse` a zápis do nového `docs/15-performance-audit.md` s LCP/CLS/INP hodnotami before/after.
>
> **Co výslovně NEMĚNIT:** sekce 4 tohoto dokumentu — zachovat tmavý sidebar, violet primary, font stack, interactive demo, pricing struktura, signal vocabulary.
