# TEMARO — Design Review & Update #2
## Audit implementace redesignu + zadání oprav (pro Codex)

> **Stav:** Audit provedený nad lokálním kódem (`app/page.tsx`, `components/marketing/*`, `components/motion/*`, `app/globals.css`, `app/layout.tsx`) k 10. 6. 2026.
> **Pozor:** Nasazená verze na `rezervacni-system-dev.vercel.app` je STARÁ — redesign na dev URL ještě neběží. První krok je deploy, jinak se ladí naslepo.
>
> **Celkové hodnocení implementace: 8/10.** Tokeny, fonty (latin-ext ✓), time-chip, day-grid, interaktivní hero, Reveal s reduced-motion, snap-scroll — vše věrně podle zadání. Tento dokument řeší to, co zbývá: 2 kritické bugy, 1 obsahovou regresi, typografickou váhu a sadu menších oprav. Vše seřazeno podle priority — P0 blokuje release, P1 do release, P2 nice-to-have.

---

# P0 — Kritické (blokuje release)

## P0.1 — Dark mode rozbíjí celý marketing web
**Problém:** `MarketingHeader` obsahuje `<ThemeToggle>` a `layout.tsx` má `themeScript`, který přidá `.dark` na `<html>`. Jenže:
- `.dark` v `globals.css` přepisuje pouze shadcn tokeny (`--background`, `--card`…), ale **NE** marketingové tokeny (`--porcelain`, `--ink`, `--cobalt`, `--paper-line`…).
- Marketing sekce mají natvrdo `bg-white`, `bg-white/58`, `text-[var(--ink)]`.

**Důsledek:** Uživatel, který si v dashboardu zapnul dark mode (nebo klikne na toggle v headeru), dostane landing v rozbitém polo-dark stavu: tmavé `--background` pod světlými `bg-white` kartami, inkoustový text na inkoustových plochách v komponentách, které čtou shadcn tokeny.

**Fix (zvolená varianta — marketing je light-only, dle původního zadání kap. 2.2):**
1. Odstranit `<ThemeToggle>` z `MarketingHeader` (toggle patří do dashboardu, ne na landing).
2. Na marketingových routách `.dark` neutralizovat — nejjednodušší je obalit marketing layout třídou, která tokeny vrací:
```css
/* globals.css */
.temaro-time-page {
  /* stávající pravidla… + přidat: */
  --background: var(--porcelain);
  --foreground: var(--ink);
  --card: var(--surface-card);
  --card-foreground: var(--ink);
  --border: var(--paper-line);
  --primary: var(--cobalt);
  --primary-foreground: #fff;
  color-scheme: light;
}
```
3. Stejnou třídu (`temaro-time-page`) mít i na marketingových podstránkách (pro-barbery atd.) a na `/ukazka`, pokud sdílí marketing look.

**QA:** localStorage `temaro-theme=dark` → otevřít `/` → stránka musí být plně světlá a konzistentní.

## P0.2 — Hero widget: nová rezervace se ořízne (overflow)
**Problém:** V `business-discovery-hero.tsx` jsou karty pozicované `top-[4.2rem]` + `translateY(index * 66px)` v kontejneru `h-[330px] overflow-hidden`. Po kliknutí na "Rezervovat" se přidá 4. karta: index 3 → 67 + 198 = 265 px od vrchu + výška karty ~88 px = **~353 px > 330 px** → spodek nové karty (jméno klienta) je uříznutý. Zrovna ta karta, která je pointou celé interakce.

**Fix — předělat vertikální logiku na "lanes" (a zároveň vyřešit P1.1):**
- Kontejner rozdělit na 3 fixní lajny (řádky) à ~80 px; každá výchozí rezervace má svoji lajnu.
- Nová rezervace se umístí do lajny podle toho, kde nekoliduje horizontálně (nebo vždy do lajny s nejbližším časem), ne na konec seznamu.
- Alternativní rychlofix, pokud lanes nestíháte: zmenšit krok na 56 px, kartu zkompaktnit (čas + název na jeden řádek) a kontejner zvýšit na 360 px. Lanes jsou ale správné řešení.

## P0.3 — Pozice karet v timeline neodpovídají časům
**Problém:** Osa je popsaná `08:00–18:00`, ale `left` je ručně nastřelené procento, které časům nesedí. Příklady: Barber "10:00" má `left: 12%` (správně 20 %), Kosmetika "08:30" má `left: 4%` (správně 5 % — skoro ok), "17:00" má `left: 72%` (správně 90 %). U nové rezervace totéž: `15:30 → left 62%` (správně 75 %).

Brand stojí na přesnosti času (mono fonty, tabular nums, mřížka) — a pak hlavní vizuál času lže. Tohle návštěvník, který provozuje salon a čte kalendáře denně, podvědomě pozná.

**Fix:** Počítat left i width z dat, smazat hardcoded hodnoty:
```ts
const DAY_START = 8;   // 08:00
const DAY_END = 18;    // 18:00
const toPct = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return ((h + m / 60 - DAY_START) / (DAY_END - DAY_START)) * 100;
};
// left = toPct(reservation.time) %, width = (durationMin / 600) * 100 %
```
Do dat přidat `durationMin` (45–90) místo `width`/`left`. Mřížka `temaro-day-grid` má `background-size: 16.666%` = 6 sloupců pro 6 popisků — sedí, zachovat.

---

# P1 — Důležité (do release)

## P1.1 — Obsahová regrese v bento: zmizely nejsilnější argumenty
**Problém:** Původní sekce "Proč Temaro" měla **No-show pod kontrolou** a **Paměť podniku (klientská historie)** — dva největší diferenciátory proti konkurenci. V novém bento je nahradily 4 karty o kanálech (Vlastní web / Instagram / Google / QR), takže 4 z 6 karet říkají tu samou věc: "máte odkaz". Kanály jsou feature, no-show a historie jsou peníze.

**Fix — nové složení bento (7 karet, 4 sloupce):**
```
┌──────────────┬──────────┬──────────┐
│ A Méně       │ B No-show│ C Paměť  │
│ telefonátů   │ pod      │ podniku  │
│ (cobalt,2×2) │ kontrolou│ (mint)   │
│              ├──────────┴──────────┤
│              │ D Jeden odkaz, vše- │
│              │ chny kanály (2×1)   │
├──────┬───────┴──┬─────────┬────────┤
│ E Bez│ F Zálohy │ G SMS / │ H Tým  │
│ prov.│ a platby │ e-mail  │ a role │
└──────┴──────────┴─────────┴────────┘
```
- **B No-show:** uvnitř malý apricot-tint chip `[!] riziková rezervace · 2× nedorazil` — ukázat, ne tvrdit.
- **C Paměť podniku:** 3 mono řádky historie (`12. 03. Střih · Tereza`…).
- **D Kanály:** jedna široká karta s řadou ikon web · IG · Google · QR — kondenzuje 4 současné karty do jedné.
- Texty B a C převzít z původní (staré) verze webu — byly dobré.
- Barevnost: cobalt plocha jen A; ink plocha jen D nebo H (viz P1.5).

## P1.2 — Typografická váha: všechno je bold, takže nic není bold
**Problém:** Prakticky každý odstavec má `font-semibold` nebo `font-bold` (leady, popisy karet, footer, popisky). Stránka tím křičí na jedné hlasitosti, ztrácí hierarchii a působí těžce — opak "klidného provozu".

**Fix (globální pravidlo):**
- Běžný text a popisy karet: `font-normal` (400), barva `--ink-soft` zůstává.
- Leady pod H2: `font-normal`, max `font-medium` (500).
- Bold (600–700) smí mít jen: nadpisy, jména/labely v demo kartách, CTA, položky ceníku, navigace.
- Konkrétně projít: `workflowSteps` texty, `bentoCards` texty, `scenarioCards` texty, lead v hero (`text-xl font-semibold` → `font-normal`), footer popis, security texty, pricing description.

## P1.3 — Kontrast: `--ink-faint` na porcelánu padá pod AA
**Problém:** `#8B8E96` na `#F6F4EF` ≈ **3,1:1** — nestačí pro malý text (AA vyžaduje 4,5:1). Používá se na: footer copyright (`text-xs`), pricing note, klient v hero kartě (`text-xs`), eyebrow v trust baru.

**Fix:**
- Veškerý text < 18 px v `--ink-faint` → přepnout na `--ink-soft` (4A4E58 ≈ 8,3:1 ✓).
- `--ink-faint` ponechat jen pro dekorativní prvky (mřížky, dividery) a velký text.
- Dále: popisky hodin v day-gridu `text-white/46` → zvednout na `text-white/70` (čitelnost na ink). Text na cobalt bento kartě `opacity-78` → plný `text-white/92`.

## P1.4 — Mobilní konverze: chybí sticky CTA bar
**Problém:** Hero CTA jsou `hidden sm:flex` — na mobilu je první CTA až POD celým hero widgetem (statický button `mx-4 mb-8`), a pak už jen v headeru. Sekundární "Spustit ukázku" na mobilu zmizelo úplně. Při ~83 % mobilního trafficu je to největší konverzní díra.

**Fix:** Sticky bottom bar (client komponenta):
- Fixed bottom, `padding-bottom: env(safe-area-inset-bottom)`, porcelán 90 % + blur, top border paper-line.
- Obsah: primary CTA "Začít zdarma" (plná šířka minus 16px okraje) + mono mikrotext `0 Kč · bez karty` nad ním.
- Objeví se po opuštění hero (IntersectionObserver na hero sekci), skryje se u footeru.
- Stávající statický mobilní button pod hero potom smazat.

## P1.5 — Příliš mnoho saturovaných ploch v dolní polovině
**Problém:** Cobalt velké plochy jsou teď dvě (bento karta A + manifest), ink plochy taky dvě (produktové demo + QR karta), plus cobalt CTA všude. Poměr ze zadání (70/20/8/2) se rozpadá a manifest s bento kartou si vizuálně konkurují.

**Fix:** Manifest přepnout na `--ink` pozadí (jak bylo v zadání) — bude to jediný velký tmavý "nádech" mimo produktové demo a cobalt zůstane vyhrazený akci (CTA + jedna bento karta). QR bento kartu přebarvit z ink na bílou (v novém bento layoutu P1.1 už ink karta na malé pozici není potřeba).

## P1.6 — Cena "připravujeme" v 3rem display fontu
**Problém:** `plan.price` se renderuje vždy jako `font-display text-5xl` — u Solo/Tým tam sedí dlouhé slovo "připravujeme" ve 48 px, což vypadá jako chyba layoutu a na užších kartách přetéká.

**Fix:** Rozlišit v datech `price` vs `status`. Pokud `status === "pripravujeme"`: místo ceny zobrazit mono chip `připravujeme` (apricot-tint pozadí, jako v zadání kap. 7.9) a kartu mírně ztlumit (`opacity-90`), cenu nerenderovat. `BadgeEuro` ikonu odstranit ze všech karet — eurová ikona u ceníku v Kč mate (viz P2.4).

## P1.7 — Marquee: chybí reduced-motion, a11y a seamless loop nesedí
**Problémy v trust baru:**
1. `.trust-marquee` animace běží i při `prefers-reduced-motion: reduce`.
2. Duplikovaný obsah (`[...items, ...items]`) čtou screen readery dvakrát.
3. `translateX(-50%)` s flex `gap-3` neudělá bezešvý loop — při přechodu skočí o polovinu gapu.

**Fix:**
```css
@media (prefers-reduced-motion: reduce) { .trust-marquee { animation: none; } }
.trust-marquee:hover { animation-play-state: paused; }
```
- Duplikát obalit `aria-hidden="true"` a přidat sr-only větu se seznamem měst/oborů.
- Seamless: gap řešit přes `padding-right` na položkách (ne flex gap), nebo obalit každou polovinu do vlastního flex kontejneru a animovat `-100%` prvního.

## P1.8 — Mobilní menu: přetečení a zavírání
**Problémy:** Panel `fixed inset-x-3 top-20` nemá `max-height` — na malých výškách (SE, landscape) spodní položky přetečou mimo viewport bez scrollu. Klik mimo panel menu nezavře (zavírá se jen výběrem položky nebo křížkem). Položky v `font-display text-3xl` u 6 odkazů s popisky = zbytečně dlouhé.

**Fix:** `max-h-[calc(100dvh-6rem)] overflow-y-auto`; backdrop overlay (`bg-ink/20`) s onClick close + Escape handler; popisky (`description`) v mobilním menu vynechat — stačí labely, menu se zkrátí na polovinu.

## P1.9 — Heading/eyebrow disciplína
1. Eyebrow v hero je celá věta ("Rezervační systém, kde čas konečně drží tvar") — eyebrow má být label 2–4 slova. Větu přesunout jako honest tagline jinam, nebo zkrátit na `Rezervační systém pro služby`.
2. `h1` má `leading-[0.9]` — s českými háčky nad verzálkami (Č, Ž) na dvouřádkovém H1 hrozí kolize diakritiky s horním řádkem. Zvednout na `leading-[0.96]`.
3. Eyebrow systém ze zadání měl kobaltovou tečku `●` před textem — drobnost, ale sjednocuje sekce; přidat do `.section-eyebrow::before`.

---

# P2 — Vylepšení (po release)

## P2.1 — Hero interakce: chybí "payoff" moment
Po kliknutí na "Rezervovat 15:30" karta tiše přibude (a viz P0.2 se ořízne). Přidat potvrzení, které interakci uzavře a prodá:
- Toast uvnitř widgetu (confirm-toast-in keyframe už v CSS existuje!): `✓ Rezervace přijata — takhle ji uvidí váš tým` + ghost odkaz "Projít celou ukázku →" na /ukazka.
- Tlačítko po kliknutí na 1,5 s do stavu `✓ Rezervováno` (mint), pak zpět.

## P2.2 — Falešné progress bary v produktovém demu
`width: 48 + index * 16 %` — bary nic neznamenají a působí jako výplň. Buď jim dát význam (popisek `vytížení dne 48 %` mono fontem), nebo odstranit a nahradit řádkem time-chipů. Datový vizuál bez dat je proti brandu přesnosti.

## P2.3 — Číslování scénářů nenese informaci
Badge `01/02/03` na fotkách scénářů není sekvence (obory nemají pořadí). Nahradit oborovým mono tagem: `BARBER` / `BEAUTY` / `TRÉNINK` — víc informace, stejný vizuální jazyk.

## P2.4 — Drobnosti
1. **`ThemeToggle` editorial tone** má hardcoded olivovou paletu (`#606C38`, `#f7eddc`, `#E8DCC7`) — cizí barvy mimo design systém. Po odebrání z marketing headeru (P0.1) přebarvit i pro dashboard použití na tokeny.
2. **Skip-link** chybí: `<a href="#produkt" class="sr-only focus:not-sr-only …">Přeskočit na obsah</a>` jako první prvek.
3. **Footer odkaz "Funkce" → `#produkt`** vede na hero — buď přejmenovat na "Produkt", nebo cílit na `#jak-to-funguje`.
4. **`time-chip:hover` = stejný styl jako `data-active`** — hover vypadá jako vybraný stav. Hover má být mezistav: `background: var(--cobalt-tint); color: var(--cobalt-deep);` a plný cobalt nechat jen pro active.
5. **Metadata encoding:** v `app/page.tsx` se při čtení souboru objevily replacement znaky (`rezerva��ní`) v `description`. Ověřit, že soubor je čistý UTF-8 bez BOM artefaktů (otevřít hex/VS Code "Reopen with encoding"); případně string přepsat.
6. **Nepoužité importy** v `page.tsx` zkontrolovat (`Image`?, `MonitorPlay` se používá, ale projít ESLint).
7. **`app/design-preview`** — pokud je to interní playground, vyřadit z produkce (robots/noindex nebo smazat).
8. **Hero `min-h-[790px]`** — na šířce 1024–1180 s velkým H1 může být těsné; ověřit, případně `min-h-0 lg:min-h-[790px]`.
9. **Canonical:** live web hlásí `canonical: http://localhost:3000` — `getBaseAppUrl()` na Vercelu zřejmě nemá `NEXT_PUBLIC_APP_URL`. Nastavit env na dev i prod projektu.

---

# Co je naopak výborně (neměnit)

1. **Tokeny 1:1 dle zadání** — paleta, radiusy, stíny, vše sedí, včetně `color-mix` pro odvozené odstíny.
2. **Fonty** přes `next/font` s `latin-ext`, display swap, mono s tabular nums — přesně dle specu.
3. **`Reveal`** — drží obsah viditelný (jen transform, opacity 1), respektuje reduced-motion, `once` logika čistá. Lepší než spec.
4. **Interaktivní hero koncept** — přepínání oborů mění demo data, chipy jsou skutečné `<button>`, `aria-live="off"`, reduced-motion hook. Po opravě P0.2/P0.3 to bude přesně ten signature element.
5. **`temaro-day-grid`** mřížka, `time-chip` utilita, `temaro-focus-ring` — systémové, znovupoužitelné.
6. **Snap-scroll** ceníku a scénářů na mobilu bez JS — přesně dle zadání.
7. **Desktop dropdown navigace** — pointerdown-outside + Escape zavírání, aria-expanded/controls. Solidní.

---

# Pořadí prací pro Codex

1. P0.1 dark mode guard (30 min) → P0.2 + P0.3 lanes & výpočet pozic (společný refactor widgetu, 2–3 h)
2. P1.2 typografická váha (plošný průchod) + P1.3 kontrasty (1 h)
3. P1.1 nové bento (1–2 h) + P1.5 manifest na ink (15 min)
4. P1.4 sticky mobile CTA (1 h) + P1.8 mobilní menu (45 min)
5. P1.6 ceník chip (30 min) + P1.7 marquee (30 min) + P1.9 headings (30 min)
6. P2 položky dle času
7. **Deploy na Vercel dev + smoke test:** dark localStorage test (P0.1), klik "Rezervovat" ve všech 4 oborech (P0.2), Lighthouse mobile ≥ 90 / a11y ≥ 95, kontrola na 375 px a 1024 px šířce.

# QA checklist po opravách
- [ ] `temaro-theme=dark` v localStorage → landing plně světlý a konzistentní
- [ ] Hero: rezervace na 10:30 / 11:00 / 14:00 / 15:30 / 17:30 sedí na osu a žádná karta se neořezává, ve všech 4 oborech
- [ ] Žádný text < 18 px v `--ink-faint` na světlém pozadí
- [ ] Odstavce ve výchozí váze 400, bold jen nadpisy/labely/CTA
- [ ] Mobil: sticky CTA bar se objeví po hero, mizí u footeru, safe-area ok
- [ ] Marquee: pauza na hover, stojí při reduced-motion, čtečka čte obsah jen jednou
- [ ] Ceník: "připravujeme" jako chip, žádná Euro ikona
- [ ] Bento obsahuje No-show i Paměť podniku
- [ ] Skip-link funguje, Tab pořadí logické, focus ring viditelný všude
