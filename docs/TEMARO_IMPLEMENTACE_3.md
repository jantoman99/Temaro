# TEMARO — Implementační zadání #3 (pro Codex)

> Seznam úkolů k implementaci. Pracuj v pořadí úkolů (Ú1 je nejvyšší priorita). Po dokončení projdi Definition of Done na konci.

---

## Ú1 — Hero widget: kolizní engine pro rezervace (KRITICKÉ)
**Soubor:** `components/marketing/business-discovery-hero.tsx`

**Problém:** Defaultní vybraný slot koliduje s existující rezervací ve všech 4 oborech (Kosmetika 15:30 a Trenér 17:30 = 100% překryv karty přes existující; Barber 14:00 překryv ~7 % osy; Kadeřnictví 15:30 překryv ~2 %). Karty pozdních termínů (17:00, 17:30) přetékají pravý okraj gridu (left+width až 107 %). Lane 2 přesahuje spodní hranu kontejneru `sm:h-[360px]` o ~15 px.

**Implementuj:**

1. **Detekce obsazenosti slotů:**
```ts
function overlaps(aStart: number, aWidth: number, bStart: number, bWidth: number) {
  return Math.max(aStart, bStart) < Math.min(aStart + aWidth, bStart + bWidth);
}

function isSlotFree(time: string, reservations: DemoReservation[]) {
  const L = toPct(time), W = durationToPct(45);
  return !reservations.some(
    (r) => overlaps(L, W, toPct(r.time), durationToPct(r.durationMin)),
  );
}
```
2. **Obsazené chipy renderuj jako obsazené:** `--ink` pozadí, porcelán text, `disabled` + `aria-disabled`, bez hover efektu. Volné chipy zůstávají jak jsou. (Demo tím začne říkat produktovou pravdu: klient vidí jen volná okna.)
3. **Default `selectedSlot` = první volný slot** pro daný obor (nahraď logiku `timeSlots[Math.min(index + 1, ...)]`).
4. **Clamp šířky karty na okraji osy:** `width = Math.min(W, 100 - L)`. Žádná karta nesmí mít left+width > 100 %.
5. **Vertikální geometrie:** zvyš kontejner na `sm:h-[392px]` a uprav lanes tak, aby spodek poslední karty byl ≥ 12 px nad spodním borderem gridu (např. top karet `3.5rem` + lanes `[44, 140, 236]` s kompaktnější kartou — čas + název na jednom řádku, klient pod tím).
6. **Jeden zdroj pravdy pro lane:** smaž `lane` z dat rezervací, počítej vždy přes `laneForSlot()`. Hranice uprav na `< 33.3` / `< 66.6`.

---

## Ú2 — Smazat sekci „Scénáře" (duplicita s „Časový engine")
**Soubor:** `app/page.tsx`

Sekce `#scenare` (3 fotokarty Barber/Beauty/Trénink) dubluje engine sekci (3 fotky Salon/Beauty/Trénink) — stejné vertikály, stejný formát, dvakrát na stránce.

1. Smaž celou sekci `#scenare` včetně `scenarioCards` dat a nepoužitých importů.
2. Texty ze scénářů přesuň jako popisky do engine fotokaret (`visualProofImages`): pod `title` přidej `text` řádek, např. „Rychlé přeobjednání, oblíbený člověk a jasný denní rytmus pro tým." (Instrument Sans, `text-sm font-normal text-white/80`, max-w-md).
3. V produktovém demu změň druhé „12 rezervací" na jiný údaj (např. „3 volná okna"), ať se stejné číslo neopakuje dvakrát na stránce.
4. Zkontroluj, že fotky `barber-studio-ai.webp`, `salon-interior-ai.webp`, `training-studio-ai.webp` už nikde nejsou odkazované (na podstránkách můžou zůstat).

---

## Ú3 — Opravit rozbité `position: sticky` v engine sekci
**Soubory:** `components/motion/reveal.tsx`, `app/page.tsx`

Sticky levý sloupec engine sekce (`sticky top-28`) nefunguje ze dvou důvodů:

1. **`Reveal` nastavuje `will-change: opacity, transform` trvale** → vytváří containing block. Oprav na dynamické: `willChange: active && !reduce ? "transform" : "auto"`.
2. **`<main>` má `overflow-hidden`** → sticky uvnitř nefunguje. Nahraď na main `overflow-hidden` → `overflow-x: clip` (`[overflow-x:clip]`), případně přesuň overflow jen na sekce s dekoračními gradienty (hero, engine).
3. Ověř, že po opravě sticky funguje; pokud by dál dělal problémy, sticky odstraň úplně — rozbitý sticky je horší než žádný.

---

## Ú4 — Engine slot „Riziko no-show": kontrast + role červené
**Soubory:** `app/page.tsx`, `app/globals.css`

Bílý text na `--signal-red` má 3,91:1 (pod AA 4,5:1 pro 14px bold).

1. Slot „Riziko no-show" předělat: pozadí `--apricot-tint`, text `--ink`, vlevo ikona `AlertTriangle` v barvě `--signal-red`. Význam zůstane, kontrast bude 10+:1.
2. Z pozadí sekce `#casovy-engine` odstraň dekorativní červený radial `rgba(229,72,77,0.10)` — `--signal-red` je výhradně funkční barva, ne dekor. Cobaltový radial nech.

---

## Ú5 — Zkrotit nekonečné animace engine sekce
**Soubory:** `app/page.tsx`, `app/globals.css`

`engine-message` (3,6 s), `engine-slot` (3,8 s) a `engine-scan` (4,8 s) běží infinite, současně, i mimo viewport, i na mobilu.

1. Animace spouštěj až když je sekce ve viewportu — použij existující `useInView` hook, animační třídy přidávej podmíněně (malý client wrapper kolem engine panelu).
2. Omez počet cyklů: `animation-iteration-count: 3` pro `engine-message` a `engine-slot`.
3. `engine-scan` vypni na mobilu: do `@media (max-width: 640px)` přidej `.time-engine-flow::after { animation: none; opacity: 0; }`.
4. Stávající `prefers-reduced-motion` blok zůstává.

---

## Ú6 — Mobilní seznam rezervací: řazení podle času
**Soubor:** `components/marketing/business-discovery-hero.tsx`

Nová rezervace se appenduje na konec → mobilní list zobrazuje 09:30, 12:00, 16:30, 10:30.

1. Mobilní list renderuj ze seřazené kopie: `[...reservations].sort((a, b) => toPct(a.time) - toPct(b.time))`.
2. Nově přidanou kartu (client === "Nová online rezervace") zvýrazni: `ring-2 ring-[var(--cobalt)]` + malý mono badge `nové` v `--cobalt-tint`, ať je v setříděném seznamu k nalezení.

---

## Ú7 — Šířky karet na timeline míň lžou
**Soubor:** `components/marketing/business-discovery-hero.tsx`

`durationToPct` má minimum 12 % (= 72 min na 10h ose), takže 45min služba vypadá jako hodina a čtvrt.

1. Sniž minimum na 8 %.
2. Pro úzké karty (width < 11 %) skryj řádek se jménem klienta (nech čas + název), ať se obsah vejde.

---

## Ú8 — Fake progress bar ve photo-proof kartách
**Soubor:** `app/page.tsx`

Bar `w-2/3 → w-full` na hover nenese žádný význam.

Nahraď řádkem 3 mini time-chipů ve stylu widgetu: dva obsazené (ink) + jeden volný (mint) s časy v mono — koresponduje se `signal` labelem karty. Případně baru dej mono label `obsazenost dne 67 %`, pokud chipy nebudou vypadat dobře v malém prostoru.

---

## Ú9 — Drobné opravy
1. **Env:** nastav `NEXT_PUBLIC_APP_URL=https://rezervacni-system-dev.vercel.app` na Vercel dev projektu (a produkční doménu v prod) — canonical a OG tagy teď hlásí `localhost:3000`. Toto je nastavení na Vercelu, ne v kódu; pokud nemáš přístup, vypiš to do poznámky pro vlastníka.
2. **`laneForSlot` hranice** na `< 33.3` / `< 66.6` (součást Ú1.6).
3. Smaž třídu `business-discovery-page` z `<main>`, pokud už nic nedefinuje.
4. Po Ú1 (vyšší grid panel) zkontroluj `min-h-[680px] sm:min-h-[790px]` hero — CTA řádek nesmí končit pod foldem na 768px výškách; případně uprav.
5. Engine fotky: přidej `quality={70}` na `next/image` v engine sekci a ověř `images.formats: ['image/avif', 'image/webp']` v `next.config.ts`.
6. Footer odkaz „Produkt" (`#produkt`) přesměruj na `#jak-to-funguje`, anchor `#produkt` nech jen pro skip-link/hero.

---

## Definition of Done
- [ ] 4 obory × 5 slotů proklikáno: žádný překryv karet, žádná karta přes okraj gridu (vpravo ani dole), obsazené sloty disabled v ink stavu
- [ ] Default slot je v každém oboru volný
- [ ] Sekce Scénáře neexistuje, engine fotky mají popisky, „12 rezervací" je na stránce jen jednou
- [ ] Sticky v engine sekci funguje (nebo je odstraněný), `overflow-x: clip` nerozbil nic jiného
- [ ] Žádný text na stránce pod 4,5:1 kontrastem; červená jen jako ikona/signál, ne plocha ani pozadí
- [ ] Engine animace startují ve viewportu, doběhnou po ~3 cyklech, scan na mobilu neběží
- [ ] Mobil 375 px: list rezervací chronologicky, nová karta zvýrazněná
- [ ] Reduced motion: vše statické a čitelné
- [ ] `localStorage temaro-theme=dark` → landing plně světlý (regrese check)
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95
- [ ] Build prochází, ESLint bez nepoužitých importů
