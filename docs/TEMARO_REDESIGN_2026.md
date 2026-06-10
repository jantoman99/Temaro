# TEMARO — Kompletní redesign 2026
## Design brief pro implementaci (určeno pro Codex)

> **Co je tento dokument:** Kompletní, závazný designový systém + redesign marketingového webu rezervačního systému Temaro (https://rezervacni-system-dev.vercel.app/). Pokrývá brand foundation, design tokeny, typografii, motion, komponenty, sekci po sekci celou homepage, art direction fotek, responsivitu, přístupnost i výkon. Vše je napsáno tak, aby se dalo implementovat bez dalších dotazů.
>
> **Stack předpoklad:** Next.js + Tailwind CSS (web už běží na Next.js / Vercel). Pokud projekt používá jinou CSS vrstvu, tokeny níže přemapuj 1:1 na CSS custom properties — jsou tak i napsané.

---

# 0. Shrnutí v pěti větách

1. Temaro dostane vlastní vizuální jazyk postavený na **čase** — kalendářní mřížka, časové chipy a "živá časová osa dne" se stanou poznávacím znamením značky, ne dekorací.
2. Paleta: **teplý porcelán + inkoustová modročerná + elektrická kobaltová** s meruňkovým sekundárem — moderní, sebevědomá, a záměrně se vyhýbá generickým AI-look kombinacím (krémová+terakota, černá+acid green).
3. Typografie: expresivní variable display font (**Bricolage Grotesque**) + čistý geometrický body font (**Instrument Sans**) + **mono font pro všechny časy a data** (IBM Plex Mono) — mono časy jsou druhý podpis značky.
4. Layout: **bento grid** pro funkce, editoriální hero s živým produktem místo statického screenshotu, velkorysý whitespace, mobile-first (≈83 % traffic landing pages je dnes mobil).
5. Motion: málo, ale dokonale — jedna orchestrovaná sekvence v hero, scroll-reveal sekcí, mikrointerakce na CTA; vše respektuje `prefers-reduced-motion`.

---

# 1. Kontext a cíle redesignu

## 1.1 Co Temaro je
Český rezervační systém pro salony, barbery, ordinace, trenéry a lokální služby. Klíčové hodnoty ze současného copy, které **zachováváme** (copy je dobré, problém je vizuál):
- "Získejte rezervace. Bez volání."
- Žádná provize z vlastních klientů (anti-marketplace pozice)
- Vlastní booking odkaz (web, Instagram, Google profil, QR)
- Týmový kalendář, klientská historie, no-show pod kontrolou
- "Neprodáváme formulář. Prodáváme klidný provoz."

## 1.2 Cílová persona
Majitel/ka barbershopu, kadeřnictví, kosmetiky, trenér, fyzioterapeut. 25–45 let, žije na Instagramu, vizuálně náročný (jeho/její vlastní podnik je o estetice!), ale technicky nenáročný. Web musí vypadat tak, aby si řekl/a: *"Když takhle vypadá jejich web, takhle bude vypadat i moje rezervační stránka."* **Web je demo produktu.** To je nejdůležitější věta tohoto dokumentu.

## 1.3 Cíle
1. **Důvěra na první pohled** — web nesmí vypadat jako šablona; persona porovnává s Fresha/Booksy/Reservio.
2. **Konverze na registraci** — jediný primární cíl stránky je "Začít zdarma". Vše ostatní je podpora.
3. **Produkt vidět do 3 sekund** — hero musí ukázat, jak rezervace vzniká, ne to popisovat.
4. **Vizuální podpis** — po zavření tabu si návštěvník pamatuje "ten web s živým kalendářem a kobaltovou".

## 1.4 Co se NEMĚNÍ
- Informační architektura stránky (pořadí sekcí je logické a zůstává, jen sekce "Booking kanály" a "Pro koho" se slučují s bento gridem — viz kap. 7).
- Texty/copy (drobné úpravy povolené, kde to layout vyžaduje — označeno).
- URL struktura, SEO stránky (/rezervacni-system-pro-barbery atd.) — dostanou stejný design systém.

---

# 2. Analýza trendů 2026 — co přebíráme a co vědomě ignorujeme

Rešerše napříč aktuálními trend reporty (Wix, Figma, Elementor, GoDaddy, Fireart, SaaSFrame, Unbounce data) ukazuje pro 2026 tyto dominantní směry:

## 2.1 Trendy, které PŘEBÍRÁME

| Trend | Proč pro Temaro | Kde v návrhu |
|---|---|---|
| **Typografie jako hlavní architektura** — oversized headliny, variable fonty, viewport-škálovaný text | Levné na výkon, drahé na dojem. Persona reaguje na "magazínový" look | Hero H1 ve `clamp(3rem, 8vw, 7.5rem)`, kap. 4.2 |
| **Bento grid** — modulární karty různých velikostí | Ideální pro mix funkcí + mini-demo + statistika; lépe skenovatelné než dlouhé sekce | Sekce "Proč Temaro" kompletně jako bento, kap. 7.4 |
| **Product-led hero** — živý produkt místo ilustrace, hodnota viditelná do 3–5 s | Web JE demo produktu (1.2). Interaktivní booking widget přímo v hero | Kap. 7.2 |
| **Dopaminové akcenty na klidném základu** — saturovaná barva jako energie, ne jako tapeta | Kobaltová dává energii, porcelánový základ drží prémiovost | Paleta, kap. 4.1 |
| **Teplé, hmatatelné neutrály** ("nature distilled") — papír, len, dřevo místo sterilní bílé | Salony a beauty = fyzický, smyslový svět. Sterilní SaaS šedá by lhala | Porcelánové pozadí, zrnité textury fotek |
| **Mikrointerakce s významem** — hover, form feedback, scroll-reveal; žádný cirkus | Buduje pocit "živého" produktu | Kap. 5 |
| **Minimal nav jako součást funnelu** — méně odkazů, sticky CTA | Median konverze SaaS landing pages je ~3,8 %; stránky s jedním cílem konvertují výrazně lépe | Kap. 7.1 |
| **Mobile-first skutečně** — ~83 % návštěv landing pages je z mobilu | Persona scrolluje z mobilu mezi klienty | Kap. 9 |
| **Sociální důkaz blízko akce** | Důvěra je u CZ malých podniků všechno | Trust bar pod hero, kap. 7.3 |

## 2.2 Trendy, které vědomě IGNORUJEME (a proč)

| Trend | Proč ne |
|---|---|
| **3D / WebGL scény** | Drahé na výkon a údržbu, mobil trpí, personě nic neříká. Hloubku uděláme vrstvením a stíny. |
| **Maximalismus / Y2K retro** | Nesedí k hodnotě "klidný provoz". Temaro prodává klid, ne chaos. |
| **Tactile brutalism** | Funguje pro design agentury, ne pro nástroj, kterému svěříš kalendář ordinace. |
| **Plný dark mode jako default** | Beauty/wellness svět je světlý a teplý. Dark používáme jen jako *inverzní sekce* pro rytmus (kap. 7.8). |
| **AI chatbot widget na landingu** | Rozbíjí fokus na jediné CTA. |

## 2.3 Anti-pattern guard (DŮLEŽITÉ pro implementaci)
Generované weby v 2026 konvergují ke třem default lookům. **Žádný z nich nesmí vzniknout:**
1. ❌ Krémové pozadí + kontrastní serif + terakotový akcent
2. ❌ Téměř černé pozadí + jediný acid-green/vermilion akcent
3. ❌ "Novinový" layout s hairline linkami a nulovým border-radius

Náš look je definovaný v kap. 4 a je od všech tří záměrně odlišný: teplý porcelán, ale s **groteskem** (ne serifem) a **kobaltovou** (ne terakotou); zaoblení 12–24 px; mono akcenty pouze pro časy.

---

# 3. Designová strategie: "Čas jako materiál"

## 3.1 Koncept
Temaro obchoduje s časem — volná okna, termíny, kapacita dne. Celý vizuální jazyk proto staví na **grafice času**:

- **Časový chip** `[ 14:30 ]` — mono font, pill tvar, mint pozadí pro volno / inkoust pro obsazeno. Objevuje se v hero, v kartách, v ceníku ("0 Kč" je taky chip), v patičce. Je to opakující se "razítko" značky.
- **Mřížka dne** — jemná vertikální linka + hodinové zarážky jako dekorativní podklad sekcí (místo generických blobů a gradientových koulí).
- **Živá časová osa** (signature element, kap. 7.2) — v hero běží den salonu: rezervace přijíždějí do timeline v reálném čase.

## 3.2 Tón vizuálu třemi slovy
**Klidný · Přesný · Teplý.**
Klidný = whitespace, málo barev najednou. Přesný = mono časy, mřížky, zarovnání. Teplý = porcelán, meruňka, fotky lidí s přirozeným světlem.

## 3.3 Pravidlo jedné odvahy
Odvaha je soustředěná do hero (živá osa + obří typografie + kobalt). Zbytek stránky je disciplinovaný a tichý, aby hero dýchalo. Když si u kterékoli další sekce nebudeš jistý, jestli přidat efekt — nepřidávej.

---

# 4. Brand foundation — design tokeny

## 4.1 Barvy

### Základní paleta (pojmenování používej i v kódu)

| Token | Hex | Použití |
|---|---|---|
| `--porcelain` | `#F6F4EF` | Hlavní pozadí stránky. Teplý, papírový, ne krémově žlutý. |
| `--porcelain-deep` | `#EDEAE2` | Sekundární plochy, pozadí karet na porcelánu, hover stavů |
| `--ink` | `#171A21` | Primární text, inverzní sekce, obsazené sloty. Modročerná, NE čistá černá |
| `--ink-soft` | `#4A4E58` | Sekundární text, popisky |
| `--ink-faint` | `#8B8E96` | Terciární text, placeholdery, mřížky času |
| `--cobalt` | `#2B3FF2` | Primární akcent: CTA, odkazy, aktivní stavy, podtržení. Elektrická, ale ne neonová |
| `--cobalt-deep` | `#1F2FC4` | Hover/pressed stav CTA |
| `--cobalt-tint` | `#E4E7FE` | Pozadí badge, selected stavy, jemné zvýraznění |
| `--apricot` | `#FFB98A` | Sekundární akcent: lidské/teplé momenty, ilustrační plochy, hover detail |
| `--apricot-tint` | `#FFE9DA` | Pozadí teplých karet (testimonialy, scénáře) |
| `--mint` | `#BFEAD4` | VOLNÝ termín, success, dostupnost. Jen pro význam "volno/ok", nikdy dekorativně |
| `--signal-red` | `#E5484D` | Chyby, no-show indikace. Jen funkčně |
| `--paper-line` | `#DDD9CF` | Bordery, dělící linky, mřížka dne |

### Pravidla použití
1. **Poměr 70/20/8/2:** 70 % porcelán+bílá, 20 % inkoust (text, inverzní bloky), 8 % kobalt, 2 % meruňka+mint. Kobalt nikdy jako pozadí celé sekce — ztratil by energii.
2. Mint **výhradně** pro význam dostupnosti/úspěchu. Uživatel se za 10 sekund naučí "mint = volno" a to je UX hodnota, kterou dekorativní použití zničí.
3. Na `--ink` pozadí se text píše `#F6F4EF` (porcelán), ne čistou bílou — drží to teplotu.
4. Gradienty: povolen jediný — velmi jemný radiální `cobalt-tint → transparent` jako "světlo" za hero widgetem. Žádné duhové/mesh gradienty.

### CSS custom properties (vlož do globals.css)
```css
:root {
  /* surfaces */
  --porcelain: #F6F4EF;
  --porcelain-deep: #EDEAE2;
  --surface-card: #FFFFFF;
  /* ink */
  --ink: #171A21;
  --ink-soft: #4A4E58;
  --ink-faint: #8B8E96;
  /* accent */
  --cobalt: #2B3FF2;
  --cobalt-deep: #1F2FC4;
  --cobalt-tint: #E4E7FE;
  --apricot: #FFB98A;
  --apricot-tint: #FFE9DA;
  --mint: #BFEAD4;
  --mint-ink: #0F5132;
  --signal-red: #E5484D;
  --paper-line: #DDD9CF;
  /* radii */
  --r-chip: 999px;
  --r-input: 12px;
  --r-card: 20px;
  --r-hero: 28px;
  /* shadow */
  --shadow-card: 0 1px 2px rgb(23 26 33 / 0.04), 0 8px 24px rgb(23 26 33 / 0.06);
  --shadow-float: 0 2px 4px rgb(23 26 33 / 0.06), 0 16px 48px rgb(23 26 33 / 0.12);
  --shadow-cta: 0 8px 24px rgb(43 63 242 / 0.28);
}
```

## 4.2 Typografie

### Fonty (všechny zdarma, variable, plná čeština)
| Role | Font | Fallback | Načtení |
|---|---|---|---|
| **Display** (H1–H2, velká čísla) | **Bricolage Grotesque** (variable: weight + width + optical size) | `system-ui` | `next/font/google`, subsets: `latin-ext` |
| **Body + UI** (vše ostatní) | **Instrument Sans** (variable) | `system-ui` | `next/font/google`, subsets: `latin-ext` |
| **Mono — časy, data, ceny, kódové akcenty** | **IBM Plex Mono** (500) | `ui-monospace` | `next/font/google`, subsets: `latin-ext` |

> `latin-ext` je povinný — bez něj se rozbijí ř, ě, ů.

### Typografická škála
```css
/* Display — Bricolage Grotesque */
--text-hero:    clamp(2.75rem, 7.5vw, 7rem);   /* H1, weight 700→800, width 90, letter-spacing -0.03em, line-height 0.98 */
--text-h2:      clamp(2rem, 4vw, 3.25rem);     /* nadpisy sekcí, weight 700, ls -0.02em, lh 1.05 */
--text-h3:      clamp(1.25rem, 2vw, 1.5rem);   /* karty, weight 650, lh 1.2 */
/* Body — Instrument Sans */
--text-lead:    clamp(1.125rem, 1.6vw, 1.375rem); /* perex pod nadpisy, weight 400, lh 1.55, barva --ink-soft */
--text-body:    1.0625rem;                      /* 17px, lh 1.6 */
--text-small:   0.9375rem;                      /* 15px */
/* Mono — IBM Plex Mono */
--text-chip:    0.875rem;                       /* časové chipy, weight 500, ls 0.02em */
--text-eyebrow: 0.8125rem;                      /* sekční eyebrow, UPPERCASE, ls 0.12em */
```

### Pravidla
1. **H1 a H2 vždy Bricolage.** Využij variable width: H1 mírně kondenzovaný (width 90) — dává editoriální, "plakátový" charakter. Nikde jinde width neměň.
2. **Eyebrow nad každou sekcí** v mono uppercase s kobaltovou tečkou: `● PROČ TEMARO`. Mono eyebrow je součást podpisu (čas/přesnost), nahrazuje současné nevýrazné labely.
3. **Každý čas, datum, cena a číslo statistiky je v IBM Plex Mono.** Bez výjimky. `14:30`, `0 Kč`, `12 rezervací`, `© 2026`. Tohle je detail, který udělá 30 % charakteru webu.
4. Zvýraznění uvnitř H1/H2: jedno slovo může mít kobaltovou barvu NEBO podtržení tahem (SVG stroke, viz 5.4) — nikdy obojí, nikdy víc slov.
5. Max šířka body textu: `65ch`. Lead: `52ch`.
6. Žádný `font-style: italic` nikde (Bricolage ani Instrument v kurzívě nevypadají dobře u diakritiky).

## 4.3 Spacing, mřížka, tvary

- **Grid:** 12 sloupců, max-width kontejneru `1200px`, gutter 24 px (mobil 16 px). Hero a fotopásy můžou utéct do `1320px` ("breakout" šířka).
- **Vertikální rytmus sekcí:** `clamp(96px, 12vw, 160px)` mezi sekcemi. Velkoryse. Whitespace je v 2026 luxusní signál.
- **Radius systém:** chip `999px` · input/button `12px` · karta `20px` · hero panel a fotky `28px`. Nikdy nemíchat jiné hodnoty.
- **Border:** `1px solid var(--paper-line)` na bílých kartách. Karty na porcelánu = bílé s borderem + `--shadow-card`. Žádné karty bez ohraničení "plovoucí" v prostoru.
- **Mřížka dne (dekor):** background pattern jemných vertikálních linek po 80 px (`--paper-line` v 40% opacitě) s mono popisky `09 — 10 — 11 — 12` lze použít max ve 2 sekcích (hero pozadí, sekce Jak to funguje).

## 4.4 Ikonografie
- Sada: **Lucide** (konzistentní s Next ekosystémem), stroke `1.75px`, velikost 20/24 px, barva `--ink-soft`, aktivní `--cobalt`.
- Žádné emoji v UI. Žádné ilustrované 3D ikony.
- Funkční ikony (kanály: web, IG, Google, QR) dostanou kruhový podklad `--porcelain-deep` 44 px.

---

# 5. Motion design systém

## 5.1 Filozofie
Motion má tři povolené úlohy: (a) ukázat, že produkt žije, (b) potvrdit akci, (c) vést oko. Cokoliv jiného smaž. Cílový dojem: "přesné hodinky", ne "veletrh".

## 5.2 Globální parametry
```css
--ease-out:   cubic-bezier(0.16, 1, 0.3, 1);   /* "expo-out" — vše co přijíždí */
--ease-soft:  cubic-bezier(0.4, 0, 0.2, 1);     /* hover, drobnosti */
--dur-fast:   150ms;   /* hover, focus */
--dur-base:   300ms;   /* reveal prvků */
--dur-slow:   600ms;   /* hero orchestrace, velké panely */
```
- Vše animuj pouze přes `transform` a `opacity` (compositor-only, žádný layout thrash).
- `@media (prefers-reduced-motion: reduce)` → všechny animace na `transition: none`, hero osa zobrazí finální statický stav. POVINNÉ.

## 5.3 Inventář animací (kompletní, nic dalšího nepřidávat)

| # | Kde | Co | Parametry |
|---|---|---|---|
| M1 | Hero load | Orchestrovaná sekvence: H1 (slova po 60ms stagger, translateY 24px→0 + fade) → lead → CTA → hero widget (scale 0.97→1 + fade) | celkem ~900ms, `--ease-out` |
| M2 | Hero widget "živý den" | Každých 6 s přijede nová rezervační karta do timeline: slide z pravé strany + mint chip pulse (1×). Max 3 cykly, pak loop od začátku | 600ms vstup |
| M3 | Scroll reveal sekcí | `IntersectionObserver`, threshold 0.15: translateY 20px→0 + fade, děti karet stagger 80ms | 400ms, jednou (žádné re-trigger) |
| M4 | CTA hover | translateY -2px + `--shadow-cta` zesílí; šipka uvnitř posun 3px doprava | 150ms |
| M5 | Karta hover (bento, scénáře) | border přebarví na `--cobalt` 40%, translateY -3px | 200ms |
| M6 | Časový chip hover (v demo widgetu) | scale 1.05 + pozadí mint→cobalt-tint | 150ms |
| M7 | Sticky nav | Po scrollu >80px: pozadí porcelán 85% + `backdrop-filter: blur(12px)`, border-bottom paper-line, výška 72→60px | 250ms |
| M8 | Číselné statistiky | Count-up při vstupu do viewportu (0→hodnota, 1s, ease-out), mono font | jednou |
| M9 | Marquee log/měst | Pomalý nekonečný horizontální posun trust baru (30s/loop), pauza na hover | lineární |
| M10 | Podtržení v H1 | SVG path "tahem štětce" pod zvýrazněným slovem, stroke-dashoffset animace po M1 | 500ms |

## 5.4 Implementační poznámky
- Hero orchestraci a scroll-reveal řeš přes lehkou vlastní utilitu nebo Motion (dříve Framer Motion) — ale jen `LazyMotion` s `domAnimation` featurami, ať bundle neroste.
- M2 (živý den) je čistý CSS keyframes + React state cyklus, žádná knihovna.
- SVG podtržení (M10): path s `vector-effect="non-scaling-stroke"`, stroke `--cobalt`, width 6px, mírně nepravidelná křivka (ručně kreslený pocit, ale jen JEDNOU na stránce — v H1).

---

# 6. Komponentová knihovna

## 6.1 Tlačítka
| Varianta | Vzhled | Použití |
|---|---|---|
| **Primary** | Pozadí `--cobalt`, text porcelán, radius 12px, padding 16×28, weight 600, `--shadow-cta`, uvnitř vpravo šipka → | "Začít zdarma" — max 1× viditelné na viewport (nav + hero se nepočítá dvakrát, nav CTA se objeví až po scrollu) |
| **Secondary** | Transparent, border 1.5px `--ink`, text `--ink`; hover: pozadí `--ink`, text porcelán | "Spustit ukázku" |
| **Ghost** | Jen text `--ink-soft` + podtržení na hover kobaltovou | terciární odkazy v sekcích |
| **Chip-CTA** | Mono font, pill, mint pozadí, text `--mint-ink` | výběr času v demo widgetech |

Všechny: `:focus-visible` ring 2px `--cobalt` s 2px offsetem. Min. touch target 44×44 px.

## 6.2 Časový chip (signature komponenta)
```
[ 14:30 ]   ← IBM Plex Mono 500, 14px, pill
```
Stavy: **volný** (mint bg, mint-ink text) · **obsazený** (ink bg, porcelán text) · **vybraný** (cobalt bg, porcelán text) · **nový** (cobalt-tint bg + pulzující tečka). Používá se v hero widgetu, bento kartách, sekci Jak to funguje, ceníku.

## 6.3 Karta
Bílé pozadí, border paper-line, radius 20px, padding 28px, `--shadow-card`. Uvnitř: ikona/chip nahoře → H3 → text `--ink-soft`. Hover M5.

## 6.4 Eyebrow sekce
`● PROČ TEMARO` — kobaltová tečka 8px, mono uppercase 13px, ls 0.12em, barva `--ink-soft`, margin-bottom 16px. Nad KAŽDOU sekcí, jednotně.

## 6.5 Navigace
- Výška 72px, pozadí transparent → sticky stav M7.
- Vlevo logotyp **Temaro** (Bricolage 700, 24px; tečka za názvem v kobaltové: **Temaro.**) — pokud existuje logo, použij ho, jinak je tento wordmark oficiální řešení.
- Střed: Produkt · Ceník · Ukázka · Návody (dropdown). **Zredukováno ze 7 položek na 4** — nav je součást funnelu.
- Vpravo: Přihlášení (ghost) + **Začít zdarma** (primary, objeví se s fade až po 80px scrollu, ať nekonkuruje hero CTA).
- Mobil: hamburger → fullscreen overlay (porcelán), položky Bricolage 32px, stagger reveal, CTA dole sticky.

## 6.6 Formulářové prvky (login/registrace + selecty v hero)
Input: bílé pozadí, border paper-line, radius 12px, výška 52px, focus border `--cobalt` + ring. Label nad polem (žádné floating labels). Chybový stav: border `--signal-red` + text pod polem, věcně: "E-mail nemá správný formát." Selecty v hero (Obor podnikání / Co chcete vyřešit) předělat na **pill segmented control** — vizuálně lehčí a hratelnější než nativní select.

## 6.7 Patička
Inverzní: pozadí `--ink`, text porcelán. Nahoře velký řádek: "Klidný provoz začíná jedním odkazem." (Bricolage, ~40px) + primary CTA. Pod tím 4 sloupce odkazů (současná struktura), dole mono řádek: `© 2026 Temaro — Vyrobeno v Česku ● Online rezervace pro služby`. Horní hrana patičky má radius 28px do porcelánu (panel "vyjíždí" zespodu).

---

# 7. Homepage — sekce po sekci

Pořadí sekcí (finální):
```
[Nav]
1. HERO — živá časová osa + booking widget
2. TRUST BAR — důkaz (marquee)
3. JAK TO FUNGUJE — 4 kroky na časové ose
4. BENTO GRID — "Proč Temaro" (funkce + kanály sloučeno)
5. PRODUKTOVÁ UKÁZKA — velký screenshot-panel s anotacemi
6. SCÉNÁŘE — 3 fotokarty (barber / beauty / trenér)
7. INVERZNÍ MANIFEST — "Neprodáváme formulář." (dark blok)
8. CENÍK — 3 karty
9. DŮVĚRA & BEZPEČNOST — kompakt
10. ZÁVĚREČNÉ CTA + patička
```
Sekce "Pro koho" (4 obory) se ruší jako samostatná — obsah se vstřebá do 4 (bento) a 6 (scénáře). Sekce "Praktické návody" se přesouvá do patičky + dropdownu (na homepage brzdila konverzi). Tím se stránka zkrátí cca o 25 % a každá sekce má jeden jasný úkol.

## 7.1 Navigace
Viz 6.5.

## 7.2 HERO — srdce redesignu

### Layout (desktop, breakout 1320px)
```
┌──────────────────────────────────────────────────────────────┐
│  ● REZERVAČNÍ SYSTÉM PRO SALONY A SLUŽBY          (eyebrow)   │
│                                                                │
│  Získejte rezervace.            ┌───────────────────────────┐ │
│  Bez ~~~volání~~~.              │  DNES · STŘEDA            │ │
│   (H1, Bricolage 700,           │  ── 09 ─ 10 ─ 11 ─ 12 ──  │ │
│    "volání" podtrženo M10)      │  [10:30] Marek · Střih    │ │
│                                 │  [14:30] Adéla · Foukaná  │ │
│  Vlastní booking odkaz pro      │  [15:00] ● Nová rezervace │ │
│  web, Instagram i QR kód.       │     z bookingu — právě teď│ │
│  Žádná provize z vašich         │  ───────────────────────  │ │
│  klientů.   (lead)              │  Klient vybírá čas:       │ │
│                                 │  [10:30][13:30][15:00]    │ │
│  [Začít zdarma →] [Ukázka]      │  [ Rezervovat ]           │ │
│                                 └───────────────────────────┘ │
│  ✓ Bez karty  ✓ Bez provize  ✓ Hotovo za 10 minut  (mono)     │
└──────────────────────────────────────────────────────────────┘
```
Poměr sloupců 55/45. Pozadí: porcelán + velmi jemná mřížka dne (4.3) + radiální cobalt-tint světlo za widgetem.

### Hero widget — "živá časová osa" (SIGNATURE)
Jeden bílý panel (radius 28px, `--shadow-float`), uvnitř DVA propojené pohledy:
1. **Horní: provoz salonu** — mini timeline dne s mono hodinovou osou a 2–3 rezervačními kartami (jméno · služba · zdrojový badge `web`/`IG`). Animace M2: nová karta pravidelně "přijíždí" se zdrojem `booking odkaz` a mint pulsem.
2. **Dolní: pohled klienta** — řádek tří časových chipů + tlačítko Rezervovat. Chipy jsou skutečně klikací (M6); klik na chip → karta se přidá do horní timeline. **Tohle je celý produkt v jedné interakci**: klient klikl, salonu přibyla rezervace. Návštěvník to může zkusit sám, bez registrace, přímo v hero.

Selecty "Obor podnikání / Co chcete vyřešit" ze současného hero: předělat na segmented pills NAD widgetem (Kadeřnictví · Barber · Kosmetika · Trenér) — přepínají jména/služby v demo datech widgetu. Personalizace = engagement.

### Mobil
H1 → widget → CTA (widget je hodnota, musí být do prvního scrollu). Žádné video, žádný autoplay — jen CSS animovaný widget (váží kilobajty).

## 7.3 TRUST BAR
Hned pod hero, výška ~96px, horní+dolní border paper-line. Marquee (M9) s mono textem prokládaným kobaltovými tečkami:
`12 000+ rezervací v pilotu ● Salony v Praze, Brně i Ostravě ● 0 % provize ● GDPR / EU data ●` *(čísla nahraď reálnými; pokud reálná čísla nejsou, použij místo statistik 4–6 log pilotních podniků nebo měst — nikdy si čísla nevymýšlej do produkce)*.

## 7.4 JAK TO FUNGUJE — kroky na ose
Eyebrow `● JAK TO FUNGUJE`, H2: "Od prázdného kalendáře k první online rezervaci."
Čtyři kroky položené NA horizontální časové ose (deska s mřížkou dne): každý krok = karta s mono pořadovým chipem `[01]`…`[04]` (čísla zde dávají smysl — je to skutečná sekvence), H3 a 1 větou. Na mobilu osa vertikální (linka vlevo, karty napravo). Scroll-reveal stagger M3. Texty převzít stávající (jsou dobré).

## 7.5 BENTO GRID — "Proč Temaro"
Eyebrow `● PROČ TEMARO`, H2: "Postaveno pro provozy, ne pro marketplace."
Mřížka 4 sloupce × 2 řádky (desktop), karty různých velikostí:

```
┌────────────┬──────┬──────┐
│ A (2×2)    │ B    │ C    │
│ Kalendář   ├──────┴──────┤
│ live demo  │ D (2×1)     │
├──────┬─────┴┬─────┬──────┤
│ E    │ F    │ G   │ H    │
└──────┴──────┴─────┴──────┘
```
- **A (velká, 2×2):** "Méně telefonátů" — uvnitř ŽIVÝ mini kalendář týdne (statický HTML/CSS, ne obrázek) s barevnými bloky rezervací a jedním mint slotem. Jediná karta s interaktivním obsahem.
- **B:** "No-show pod kontrolou" — chip `[!] riziková rezervace` v apricot-tint.
- **C:** "Paměť podniku" — mini řádek klientské historie (3 mono data).
- **D (široká):** "Jeden odkaz, všechny kanály" — řada ikon web · IG · Google · QR · e-mail (slučuje bývalou sekci Booking kanály).
- **E–H (malé):** Zálohy a platby · SMS/e-mail připomínky · Role a tým · Přehledy zdrojů. Jen ikona + H3 + věta.

Karty dle 6.3, hover M5. Na mobilu: A plná šířka, pak 2 sloupce, E–H 1 sloupec.

## 7.6 PRODUKTOVÁ UKÁZKA
Eyebrow `● UKÁZKA`, H2: "Místo vysvětlování — projděte si to."
Velký panel (breakout šířka, radius 28px, shadow-float): **skutečný screenshot aplikace** (kalendář týdne) v light podobě, přes který jsou 3 anotační štítky (mono chip + čára k místu v UI): "Týmový kalendář" · "Zdroj rezervace" · "Klientská historie". Pod panelem secondary CTA "Spustit interaktivní ukázku" → /ukazka.
Pokud screenshot z aplikace zatím není reprezentativní, postav panel jako HTML/CSS mock ve stejném design systému (porcelán/kobalt/mono) — NIKDY rozmazaný nebo zastaralý screenshot.

## 7.7 SCÉNÁŘE — fotokarty
Eyebrow `● PRO KOHO`, H2: "Vypadá jako systém pro služby, ne jako šablona."
3 karty vedle sebe (mobil: horizontální snap-scroll carousel). Každá karta = fotka na výšku (poměr 4:5) + překryv: dole gradient ink 70%→0, na něm H3 + 1 věta + 3 mono tagy (`oblíbený člověk` `historie` `přeobjednání`). Art direction fotek viz kap. 8. Čtvrtý obor (ordinace/autoservis) řeš textovým řádkem pod kartami: "…a taky ordinace, autoservisy a další služby, kde rozhoduje čas." s ghost odkazem.

## 7.8 INVERZNÍ MANIFEST (rytmický zlom)
Jediný dark blok stránky. Pozadí `--ink`, radius 28px, uvnitř vycentrovaný výrok (Bricolage, clamp 2–3.5rem):
"Neprodáváme formulář. **Prodáváme klidný provoz.**" (druhá věta kobaltově) + věta o provizi + mono řádek `0 % provize z vašich rezervací`. Žádné CTA — tahle sekce je nádech.

## 7.9 CENÍK
Eyebrow `● CENÍK`, H2: "Transparentní cena bez provizních překvapení."
3 karty: Pilot / Solo / Tým. **Pilot zvýrazněn** (border cobalt 1.5px + badge chip `pro první podniky`), cena `0 Kč` v IBM Plex Mono 48px. U "připravujeme" tarifů: mono chip `připravujeme` v apricot-tint, obsah lehce ztlumený (opacity 0.75), ALE karta zůstává čitelná. Checklist položky s mint odrážkou ✓. Pod kartami jedna věta: "Pilot je zdarma celý — žádná karta, žádný úvazek." + primary CTA.

## 7.10 DŮVĚRA & BEZPEČNOST
Kompaktní 3 sloupce (ikona štítu/zámku/EU + H3 + věta), porcelain-deep pozadí pásu. Texty stávající. Žádné dramatické "security theatre" — věcnost buduje důvěru víc.

## 7.11 ZÁVĚREČNÉ CTA + PATIČKA
Viz 6.7 — CTA je integrované do hlavy patičky, ne samostatná sekce (kratší stránka, jeden silný závěr).

---

# 8. Fotografie a art direction

## 8.1 Kde fotky JSOU a kde NEJSOU
| Místo | Fotka? | Poznámka |
|---|---|---|
| Hero | ❌ | Hero patří živému widgetu. Fotka by konkurovala produktu. |
| Scénáře (7.7) | ✅ 3 ks | Jediné velké fotky na homepage. O to víc musí být perfektní. |
| Manifest, ceník, bezpečnost | ❌ | Klid. |
| SEO podstránky (pro-barbery…) | ✅ 1 ks/stránka | Hero podstránky: fotka 21:9 nahoře, stejný treatment. |

Méně fotek = každá má váhu + rychlejší LCP.

## 8.2 Styl fotografií (zadání pro výběr/generování)
- **Námět:** skutečný moment práce — ruce barbera s břitvou u vousů, kosmetička při lash liftingu, trenér při korekci dřepu. Vždy ČINNOST, nikdy pózování do kamery. Detail/polodetail, ne celý interiér.
- **Světlo:** přirozené, teplé, měkké (okno, golden hour interiér). Žádné studiové bílé světlo, žádný HDR look.
- **Barevný grading:** teplé tóny posunuté k porcelánu/meruňce, černé do `--ink` (modročerné stíny), lehce zvednuté černé (filmový, "papírový" feel). Saturace -10 %. Jemné zrno (grain overlay 3–4 % opacity) — sjednotí AI/stock zdroje a dodá hmatatelnost.
- **Kompozice:** subjekt v levé nebo pravé třetině, volný prostor pro text-overlay. Hloubka ostrosti mělká (f/2 look).
- **Lidé:** reální, různorodí, 25–45, středoevropský kontext. Žádné americké stock úsměvy.
- **Zákaz:** fialovo-modré "tech" osvětlení, neonové barbershop klišé, sterilní klinické bílé pozadí, viditelné značky produktů.

## 8.3 Technické parametry
- Formát: AVIF s WebP fallbackem (next/image to řeší přes `formats: ['image/avif','image/webp']`).
- Rozměry zdrojů: scénáře 1200×1500 (4:5), podstránkové hero 2520×1080 (21:9). `sizes` atribut povinný.
- Všechny fotky `loading="lazy"` kromě podstránkového hero (`priority`).
- Radius 28px, na hover jemný zoom 1.03 (M5 doplněk, 400ms) — JEN u scénářových karet.
- Alt texty česky, popisné (už teď jsou dobré — zachovat praxi).

---

# 9. Responsivita — mobile-first

## 9.1 Breakpointy
```
base   0–639     1 sloupec, vše stacked
sm     640+      2 sloupce u malých karet
md     768+      kroky 2×2, ceník stále 1 sloupec scroll
lg     1024+     plný grid (bento 4 sl., hero 2 sl.)
xl     1280+     breakout šířky 1320px
```

## 9.2 Mobilní pravidla (priorita — ~83 % návštěv)
1. Hero: H1 (clamp dolní mez 2.75rem) → widget → CTA. CTA "Začít zdarma" plná šířka, 56px výška.
2. **Sticky bottom CTA bar** na mobilu: po scrollu za hero se zespodu vysune lišta (porcelán blur, safe-area-inset) s primary CTA + mono textem `0 Kč · bez karty`. Zmizí u patičky. Tohle je nejdůležitější mobilní konverzní prvek.
3. Scénáře + ceník: horizontální snap-scroll (scroll-snap-type: x mandatory), viditelný "peek" další karty 24px, žádné JS carousely.
4. Touch targets min 44px, časové chipy na mobilu 48px výšky.
5. Marquee trust bar běží i na mobilu (lehký, CSS-only).
6. Fonty: hero H1 na mobilu width 100 (ne kondenzovaný — čitelnost).

---

# 10. Přístupnost (nepodkročitelné minimum)

1. Kontrast: ink na porcelánu 13,8:1 ✓; cobalt na porcelánu 6,9:1 ✓ (AA i pro malý text); porcelán na cobalt CTA ✓; mint-ink na mint ✓. NIKDY apricot jako barva textu na světlém pozadí.
2. Fokus: `:focus-visible` ring všude (6.1). Skip-link "Přeskočit na obsah".
3. Sémantika: jedna `<h1>`, sekce `<section aria-labelledby>`, nav `<nav>`, marquee `aria-hidden="true"` + sr-only statický text.
4. Hero widget: interaktivní chipy = `<button>`, živá timeline `aria-live="off"` (dekorativní), celá animace má `prefers-reduced-motion` fallback (statický stav s již "přijetou" rezervací).
5. Formuláře: label vždy, chyby přes `aria-describedby`.
6. Jazyk: `<html lang="cs">`.

---

# 11. Výkon (rozpočet)

| Metrika | Cíl |
|---|---|
| LCP | < 1,8 s (4G) — hero je text+CSS widget, žádný hero obrázek → snadné |
| CLS | < 0,05 — fonty `next/font` (self-host, size-adjust), rezervované rozměry obrázků |
| INP | < 200 ms |
| JS bundle homepage | < 120 kB gz — Motion jen LazyMotion, widget vanilla |
| Fonty | 3 rodiny × variable = ~140 kB woff2 celkem, `display: swap` |

Stránky pod 3 s load mají ~32% vyšší konverzi — výkon je konverzní feature, ne technický detail.

---

# 12. Tailwind konfigurace (výchozí bod)

```js
// tailwind.config.js — extend
extend: {
  colors: {
    porcelain: { DEFAULT: '#F6F4EF', deep: '#EDEAE2' },
    ink: { DEFAULT: '#171A21', soft: '#4A4E58', faint: '#8B8E96' },
    cobalt: { DEFAULT: '#2B3FF2', deep: '#1F2FC4', tint: '#E4E7FE' },
    apricot: { DEFAULT: '#FFB98A', tint: '#FFE9DA' },
    mint: { DEFAULT: '#BFEAD4', ink: '#0F5132' },
    signal: '#E5484D',
    line: '#DDD9CF',
  },
  fontFamily: {
    display: ['var(--font-bricolage)'],
    sans: ['var(--font-instrument)'],
    mono: ['var(--font-plex-mono)'],
  },
  borderRadius: { chip: '999px', input: '12px', card: '20px', hero: '28px' },
  boxShadow: {
    card: '0 1px 2px rgb(23 26 33 / 0.04), 0 8px 24px rgb(23 26 33 / 0.06)',
    float: '0 2px 4px rgb(23 26 33 / 0.06), 0 16px 48px rgb(23 26 33 / 0.12)',
    cta: '0 8px 24px rgb(43 63 242 / 0.28)',
  },
  transitionTimingFunction: { out: 'cubic-bezier(0.16,1,0.3,1)' },
}
```

```ts
// fonts.ts
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from 'next/font/google';
export const bricolage = Bricolage_Grotesque({ subsets: ['latin-ext'], variable: '--font-bricolage', axes: ['wdth', 'opsz'] });
export const instrument = Instrument_Sans({ subsets: ['latin-ext'], variable: '--font-instrument' });
export const plexMono = IBM_Plex_Mono({ subsets: ['latin-ext'], weight: ['500'], variable: '--font-plex-mono' });
```

---

# 13. Aplikace systému na podstránky (stručně)

- **/ukazka, /demo-barber:** stejné tokeny; rezervační flow klienta = bílé karty na porcelánu, časové chipy 6.2 jako hlavní interakce výběru termínu. Tady se design systém potkává s produktem — chipy musí vypadat identicky jako v hero. Kruh se uzavře.
- **SEO podstránky (pro-barbery, pro-kadernictvi…):** šablona = hero 21:9 fotka s ink overlay + H1 → 3 bento karty s obory bolesti → produktový panel → ceník odkaz → CTA. Eyebrow systém všude.
- **/login, /register:** porcelán, jedna bílá karta 440px uprostřed, logotyp nahoře, formuláře 6.6. Register: pravá polovina obrazovky (lg+) = ink panel s rotujícími mono "fakty" (`Salon Karlín přijal 14 rezervací tento týden`).
- **404:** Bricolage obří `[ 404 ]` jako časový chip + "Tenhle termín neexistuje." + CTA domů. Jediný vtip na webu, zaslouží si ho.

---

# 14. Checklist hotovosti (Definition of Done)

**Foundation**
- [ ] CSS proměnné z 4.1 v globals, Tailwind config z 12
- [ ] 3 fonty přes next/font, latin-ext, žádný FOUT layout shift
- [ ] Všechny časy/data/ceny/čísla na webu v IBM Plex Mono

**Hero**
- [ ] Živý widget: timeline + klikací chipy, klik přidá rezervaci
- [ ] Orchestrace M1, podtržení M10, reduced-motion fallback
- [ ] Segmented pills přepínají demo data oborů

**Stránka**
- [ ] Pořadí sekcí dle kap. 7, sekce Pro koho a Návody odstraněny z těla homepage
- [ ] Bento grid 7.5 s živou kalendářovou kartou A
- [ ] Inverzní manifest, ceník s mono cenami, patička s integrovaným CTA
- [ ] Eyebrow `● NÁZEV` nad každou sekcí

**Mobil**
- [ ] Sticky bottom CTA bar se safe-area
- [ ] Snap-scroll scénáře + ceník, peek 24px
- [ ] Lighthouse mobile: Performance ≥ 90, A11y ≥ 95

**Kvalita**
- [ ] Kontrasty dle kap. 10 ověřené
- [ ] prefers-reduced-motion kompletně
- [ ] Žádný z anti-patternů 2.3 (zkontroluj výsledek proti tabulce!)
- [ ] Fotky AVIF, grain overlay, jednotný grading dle 8.2

---

# 15. Poznámka na závěr (pro člověka, ne pro Codex)

Tento návrh sází na jednu velkou věc: **web se chová jako produkt**. Živá osa v hero, klikací chipy, mono časy všude — návštěvník si Temaro "osahá" dřív, než klikne na registraci. Všechno ostatní (porcelán, kobalt, Bricolage) je kulisa, která tomu dává prémiový rám a odlišuje vás od Reservio/Booksy šablonové estetiky. Pokud budete cokoliv škrtat, škrtejte dekoraci — nikdy interakci v hero.
