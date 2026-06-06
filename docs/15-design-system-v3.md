# 15 – Design system v3: Temaro visual system

Datum: 2026-06-06
Stav: aktuální zdroj pravdy pro vizuální směr
Navazuje na historické audity v `docs/archive/`

## 0. Stav po rozhodnutí 2026-06-06

Veřejný marketing web se posouvá pryč od tmavé Linear/Signal hero estetiky. Cílem je čistší český SaaS směr: světlé plochy, konkrétní copy, jasný produktový screenshot/mockup, telefonní rezervační preview a méně abstraktního „command“ jazyka.

Signal OS zůstává užitečný pro přihlášenou provozní aplikaci: dashboard, kalendář, entity, stavové signály a hustší pracovní plochy. Pro landing je ale hlavní důvěra, čitelnost a rychlé pochopení produktu.

## 1. Rešeršní závěr 2026

Z aktuálních SaaS design auditů, trend reportů a uživatelských diskusí vychází několik opakovaných závěrů:

- Čistá bílá SaaS estetika už nestačí. Uživatelé ji vnímají jako generickou.
- Landing musí rychle ukázat konkrétní výsledek, ne jen „features“.
- Reálný nebo realisticky poskládaný produktový UI mockup prodává lépe než abstraktní dekorace.
- Bento a card gridy fungují jen tehdy, když mají jasnou hierarchii; stejné karty vedle sebe splývají.
- Nejlepší B2B SaaS UI v roce 2026 buduje důvěru: jasné stavy, vysvětlené akce, méně vizuálního šumu.
- Admin UI se posouvá od prázdného minimalismu k hustším, strukturovaným pracovním plochám.
- Reddit kritika se opakuje: generické gradienty, abstraktní bloby a vágní copy snižují důvěru.

Použité zdroje:

- https://procreator.design/blog/saas-landing-page-best-ui-design-practices/
- https://www.saasui.design/blog/7-saas-ui-design-trends-2026
- https://framiq.app/blog/best-saas-landing-pages-2026
- https://landdding.com/state-of-landing-pages-2026
- https://www.stan.vision/journal/saas-website-design
- https://www.saasframe.io/blog/10-saas-landing-page-trends-2026-with-real-examples
- https://www.reddit.com/r/SaaS/comments/1rqpgld/i_roasted_30_ai_saas_landing_pages_people_posted/
- https://www.reddit.com/r/content_marketing/comments/1srgtga/most_saas_landing_pages_dont_fail_because_of/

## 2. Problém aktuálního Temara

Aktuální UI je čisté a použitelné, ale nemá dost vlastní identitu.

Hlavní problém:

**Všechno je karta. Všechno má podobný border, radius, shadow a váhu. Výsledek je klidný, ale zaměnitelný.**

Konkrétní slabiny:

- Primární modrá působí jako běžný B2B SaaS default.
- Logo je použitelné, ale ne dost zapamatovatelné.
- Landing prodává systém, ale vizuálně neukazuje „provoz pod kontrolou“.
- Veřejný booking je funkční formulář, ne prémiový appointment checkout.
- Dashboard nemá dost silnou provozní hierarchii.
- Statusy rezervací nejsou dost vlastním vizuálním jazykem produktu.

## 2.1 Dodatečná analýza vůči Notion / Linear / Vercel / Ramp

Z dodatečného researchu vychází, že nejlepší SaaS produkty nepoužívají barvy jako dekoraci:

- **Notion** staví produkt na téměř absenci barvy. Černá/bílá/teplá šedá drží workspace klidný a barva patří hlavně obsahu nebo předem omezenému systému. Důležité je, že uživatel nemá řešit vizuální chaos.
- **Vercel** působí draze díky extrémní redukci: černá, bílá, gray ramp a minimální funkční accent. Premium dojem vzniká tím, co systém nedělá.
- **Linear** používá dark/neutral základ a malé barevné signály pro statusy. Primární brand barva je zdrženlivá, ne plošná dekorace.
- **Ramp** ukazuje, že jedna hluboká brand barva může fungovat, pokud je konzistentně spojená s produktem a business důvěrou.
- Design-system diskuse opakují důležité pravidlo: brand barvy a feedback/status barvy mají být oddělené. Pokud všechno používá brand akcent, UI se unaví a statusy ztratí význam.

Praktický závěr pro Temaro:

1. Paleta C může zůstat, ale nesmí se používat jako dekorativní fialovo-modrá všude.
2. Brand primary patří do loga, hlavního CTA, aktivní navigace a klíčových command surfaces.
3. Status barvy patří jen do stavů rezervací: confirmed, pending, risk, info/free slot.
4. Logo nemá používat success/status barvy; jinak se míchá brand a feedback systém.
5. Landing a booking mají mít víc neutral ploch, méně barevných glow efektů.

Použité zdroje:

- https://colorfyi.com/blog/notion-brand-colors/
- https://vercel.com/geist/colors
- https://seedflip.co/blog/vercel-design-system
- https://linear.app/brand
- https://logotyp.us/logo/ramp/
- https://www.reddit.com/r/DesignSystems/comments/1rqu8a4/would_you_use_the_same_colors_from_the_branding/
- https://www.reddit.com/r/Notion/comments/1qzz9fl/we_need_more_colors_on_notion_dont_you/

## 2.2 Landing IA audit vůči rezervačním SaaS

Dodatečný research konkurenčních rezervačních webů ukazuje, že top navigace nemá být jen estetický prvek. Uživatel při výběru rezervačního systému typicky hledá tyto bloky:

- **Produkt / funkce**: kalendář, online booking, klienti, reminders, tým.
- **Pro koho / odvětví**: salon, barber, wellness, ordinace, trenér, lokální služby.
- **Ceník**: jasné tarify, limity, add-ony, skryté náklady.
- **Demo / booking ukázka**: rychlé ověření, jak rezervace vypadá z pohledu klienta.
- **Důvěra / bezpečnost / podpora**: data, provozní jistota, kontakt, pomoc.

Konkurence a benchmark:

- **Reservio** má výrazný ceník, mobilní aplikaci a booking website positioning.
- **SimplyBook.me** silně komunikuje booking web, widget, Facebook/Instagram booking, directory listing, admin app a pricing podle bookingů/custom features.
- **Fresha** prodává pricing, online bookings, payments, marketplace, reminders, marketing tools, team scheduling a business app; zároveň uživatelé často řeší add-ony, provize a transparentnost ceny.
- **Calendly** strukturuje web přes produkt, řešení podle rolí/odvětví, pricing a resources.

Praktický závěr pro Temaro:

1. Top bar musí mít minimálně: `Produkt`, `Pro koho`, `Ceník`, `Bezpečnost`, `Demo`.
2. `Ceník` musí existovat už před finálním pricingem jako transparentní principy: bez provize z vlastních klientů, jednoduchý tarif, pilotní režim.
3. `Pro koho` nesmí být generické; musí jasně říct, že systém není jen pro salon, ale pro služby řízené časem.
4. `Bezpečnost` má být samostatný důvěryhodnostní blok, protože systém drží klientská a provozní data.
5. Landing nesmí skončit po hero mockupu; potřebuje obchodní důkazovou strukturu.
6. Dokud nejsou reálné reference, social proof nesmí být falešný. Místo toho komunikovat ověřitelné základy: testy, architekturu, pilotní režim a jasné cenové principy.
7. Mobilní landing navigace nesmí zmizet. Pokud zatím není plný hamburger/menu systém, top bar musí mít alespoň horizontálně posuvné odkazy.

Aplikované změny:

- Top bar je dostupný i na mobilu jako horizontálně posuvná navigace.
- Hero product mockup po změně 2026-06-06 používá statickou PC + telefon ukázku, aby landing rychle vysvětlil produkt bez rizika rozbité interaktivní hero plochy. Interaktivní průchod zůstává odděleně na `/ukazka`.
- Sekce `Pro koho` obsahuje konkrétní use-case signály pro salony, trenéry, ordinace a lokální služby.
- Sekce `Ceník` má tři pricing karty: Pilot, Solo a Tým. Finální ceny nejsou vymyšlené, dokud nejsou schválené.
- Proof metriky jsou přesunuté nad hero mockup, aby nahrazovaly falešné reference ověřitelnými projektovými fakty.
- Navazná polish vrstva přepsala analytické texty na prodejnější copy, přidala tmavou `Rezervační tok` sekci pro rozbití monotónnosti landing rytmu a sjednotila app headery/stat karty se Signal OS stylem.
- Veřejný booking má nově horní progress rámec, který z checkoutu dělá jasnější tříkrokový proces.
- Dashboard shell má na mobilu horizontální app navigaci, protože desktop sidebar je skrytý a hlavní sekce musí zůstat dostupné.
- App kalendář má nově `CalendarSignalStrip`, aby hlavní pracovní plocha nezačínala jen filtrováním, ale rychlými provozními signály.
- Public booking header ukazuje průběžný výběr služby a termínu, aby klient neztratil kontext během checkoutu.
- Kalendářové týdenní/denní/list komponenty mají výraznější Signal OS hlavičky, sjednocené radiusy, jemnější produktové povrchy a hover stavy.
- Admin stránky `clients`, `services` a `staff` mají sjednocený Signal OS framing pro filtry, statistiky a search bloky bez duplicitního rámování existujících formulářových karet.
- Claude validace z archivovaného `docs/archive/14-validated-improvements.md` je aplikovaná a navazující homepage iterace 2026-06-06 používá claim `Méně telefonátů. Více rezervací.`, primary CTA `Začít zdarma` a ověřitelné proof metriky hned pod hero CTA.
- Duplicitní spodní blok `Důkaz připravenosti` byl odstraněný, protože stejné metriky jsou nyní above-the-fold.
- Landing má redukovaný serif accent na tři významová místa, odstraněné `font-black` regrese a glow/command shadow hodnoty jsou přesunuté do tokenů v `app/globals.css`.
- Navazující vizuální rytmus 2026-06-06 znovu používá existující tokeny `signal-hero` a `command-surface`: hero je světlý gradient, produktový mock je samostatná tmavá full-bleed sekce a jeden editorialní statement přes šířku rozbíjí monotónní šedý tok. Serif accent je v této iteraci redukovaný na jeden hrdinský moment.
- Mobilní landing má lehčí kritickou vrstvu: bez hero grid patternu, bez dekorativního dot patternu v demo shellu a bez `motion-reveal` animací na šířkách do 640 px.
- Performance audit je zapsaný v `docs/15-performance-audit.md`: desktop Lighthouse 100/100, mobile 93/100; zbytkový mobile LCP 3.1 s je známý bod pro pozdější ruční mobilní ověření.

## 2.4 Cíl pro 10/10 wow efekt

Temaro se nesmí spokojit s tím, že vypadá jako dobrý Linear-like SaaS. Aby působilo 10/10, musí mít:

1. **Signature motiv**: `Signal Map` jako rozpoznatelný motiv značky napříč landingem, bookingem i app UI.
2. **Produktový příběh místo screenshotu**: hero demo má ukazovat tok klient -> kalendář -> riziko -> historie.
3. **Motion s významem**: animace má zvýrazňovat signály a postup rezervace, ne jen dekorovat stránku.
4. **Premium checkout**: veřejný booking musí působit stejně důvěryhodně jako platební checkout.
5. **App-first polish**: dashboard, kalendář a seznamy musí mít stejnou přesnost jako landing.
6. **Pravdivý proof**: po prvních pilotech nahradit projektové metriky reálnou případovou studií.

Použité zdroje:

- https://www.reservio.com/pricing
- https://simplybook.me/en/pricing/index/ref
- https://simplybook.me/en/
- https://www.fresha.com/pricing
- https://www.fresha.com/for-business/features
- https://calendly.com/solutions
- https://www.reddit.com/r/smallbusiness/comments/1p5gjpy/do_you_recommend_using_fresha_for_a_booking_site/
- https://www.reddit.com/r/startups_promotion/comments/1pn5jfb/i_built_a_lightweight_booking_payments_tool_for/

## 3. Nový směr

Název směru:

**Temaro Signal OS**

Positioning:

**Rezervační systém, který dělá z chaosu v provozu čitelné signály.**

Vizuální metafora:

- kalendář jako provozní mapa,
- rezervace jako sloty,
- rizika jako signály,
- klient jako kontext,
- podnik jako řídicí plocha.

Design má působit:

- přesně,
- provozně,
- klidně,
- důvěryhodně,
- ne genericky modře,
- ne jako enterprise tabulka,
- ne jako lifestyle salon šablona.

## 4. Paleta

Aktuálně aplikovaná paleta je **C – Linear-like Focus**: světlý neutral základ, tmavý command/sidebar základ, fialovo-modrá primary a modrý informační akcent.

Po dodatečném srovnání s Notion/Vercel/Linear/Ramp platí doplňující pravidlo: primary barva není dekorace. Používá se na logo, hlavní CTA, aktivní navigaci a vybrané produktové prvky. Success/warning/risk barvy se používají jen pro stav rezervace nebo systémovou zpětnou vazbu.

### 4.1 Kandidátní palety k výběru

Níže jsou palety vygenerované podle přístupů populárních SaaS produktů:

- Linear: neutral/dark systém, minimum barev, statusy jako malé signály.
- Notion/Vercel: velmi omezená neutral paleta, barva je funkční, ne dekorativní.
- Ramp: hluboký teal jako business/důvěryhodný brand.
- Slack/Figma: vícebarevnost funguje pro kreativní/komunikační produkty, pro Temaro spíš ne.

Statické HTML náhledy palet byly po výběru palety C přesunuté do archivu:

- `docs/archive/design-palettes/index.html`
- `docs/archive/design-palettes/palette-a-premium-neutral.html`
- `docs/archive/design-palettes/palette-b-deep-teal-business.html`
- `docs/archive/design-palettes/palette-c-linear-focus.html`
- `docs/archive/design-palettes/palette-d-warm-professional.html`
- `docs/archive/design-palettes/palette-e-blue-trust.html`

#### Paleta A – Premium Neutral

Nejbezpečnější a nejvíc „premium SaaS“.

| Role | HEX | Použití |
|---|---|---|
| Background | `#F7F7F5` | hlavní pozadí |
| Surface | `#FFFFFF` | karty, formuláře |
| Muted surface | `#EFEFED` | sekundární panely |
| Text | `#171717` | hlavní text |
| Muted text | `#6B6B66` | popisky |
| Primary | `#202124` | hlavní CTA, logo, sidebar |
| Accent blue | `#4F7DF3` | aktivní prvky, odkazy |
| Success | `#2F9E6D` | potvrzeno |
| Warning | `#C9862B` | čeká/attention |
| Risk | `#D14B4B` | no-show/riziko |

Pocit:

- velmi čisté,
- dospělé,
- méně barevné,
- blízko Vercel/Notion logice.

Riziko:

- může působit až moc neutrálně, pokud nebude silná typografie a produktový mockup.

#### Paleta B – Deep Teal Business

Moje doporučení pro Temaro.

| Role | HEX | Použití |
|---|---|---|
| Background | `#F8F7F2` | hlavní pozadí |
| Surface | `#FFFFFF` | karty, formuláře |
| Muted surface | `#EEF2EC` | sekundární panely |
| Text | `#17211F` | hlavní text |
| Muted text | `#65706B` | popisky |
| Primary | `#17463F` | logo, sidebar, hlavní CTA |
| Accent mint | `#42B883` | aktivní signál |
| Info blue | `#4D7CFE` | volná okna/info |
| Warning sand | `#D89C45` | čeká/attention |
| Risk coral | `#D95F59` | no-show/riziko |

Pocit:

- důvěryhodné,
- vhodné pro služby, salony, ordinace i trenéry,
- méně generické než modrá,
- pořád moderní bez křiklavosti.

Riziko:

- pokud se použije moc sand/amber, může to sklouznout do „pokladna/restaurace“. Musí platit pravidlo 90/7/3.

#### Paleta C – Linear-like Focus

Moderní dark/neutral produktový SaaS směr.

| Role | HEX | Použití |
|---|---|---|
| Background | `#F7F8FA` | marketing/app background |
| Surface | `#FFFFFF` | karty |
| App dark | `#111318` | sidebar, command surface |
| Dark surface | `#1A1C1F` | tmavé panely |
| Text | `#111318` | hlavní text |
| Muted text | `#737780` | popisky |
| Primary | `#5E6AD2` | CTA, active |
| Accent blue | `#4EA7FC` | info/links |
| Success | `#4CB782` | potvrzeno |
| Risk | `#EB5757` | riziko |

Pocit:

- nejvíce moderní SaaS,
- rychlé, ostré, technologické.

Riziko:

- může připomínat Linear a být méně vlastní.
- pro běžné služby může působit trochu moc developer-tool.

#### Paleta D – Warm Professional

Měkčí varianta pro služby, méně technologická.

| Role | HEX | Použití |
|---|---|---|
| Background | `#FAF6EF` | hlavní pozadí |
| Surface | `#FFFFFF` | karty |
| Muted surface | `#F0E8DC` | sekundární panely |
| Text | `#211A14` | hlavní text |
| Muted text | `#746A5F` | popisky |
| Primary | `#2F5148` | CTA/sidebar |
| Accent sage | `#7AA891` | aktivní prvky |
| Info | `#5277A8` | info |
| Warning | `#C9853C` | čeká |
| Risk | `#C95D52` | riziko |

Pocit:

- přívětivé,
- salon/wellness friendly,
- méně „enterprise“.

Riziko:

- může být moc lifestyle a méně univerzální pro ordinace/autoservis.

#### Paleta E – Blue Trust

Konzervativní SaaS/business varianta.

| Role | HEX | Použití |
|---|---|---|
| Background | `#F6F8FB` | hlavní pozadí |
| Surface | `#FFFFFF` | karty |
| Muted surface | `#EEF3F8` | sekundární panely |
| Text | `#142033` | hlavní text |
| Muted text | `#617087` | popisky |
| Primary | `#1F4E79` | CTA/sidebar |
| Accent cyan | `#2AA8C7` | aktivní signál |
| Success | `#2FA66A` | potvrzeno |
| Warning | `#D49A38` | čeká |
| Risk | `#D85A5A` | riziko |

Pocit:

- bezpečné,
- důvěryhodné,
- srozumitelné pro B2B.

Riziko:

- nejvíc generické; hodně rezervačních/B2B systémů používá modrou.

### 4.2 Moje pořadí

Vybraná paleta po uživatelském rozhodnutí: **C – Linear-like Focus**.

Původní doporučení bylo:

1. **B – Deep Teal Business**: nejlepší poměr důvěry, originality a univerzálnosti.
2. **A – Premium Neutral**: nejčistší a nejdražší pocit, ale potřebuje silný layout.
3. **C – Linear-like Focus**: moderní, ale hrozí napodobení Linear.
4. **E – Blue Trust**: bezpečné, ale generické.
5. **D – Warm Professional**: hezké pro salony/wellness, slabší pro univerzální SaaS.

### 4.3 Doporučené pravidlo použití

Bez ohledu na zvolenou paletu:

- 90 % UI má být neutral: background, surface, text, border.
- 7 % má být brand primary: CTA, logo, sidebar, aktivní navigace.
- 3 % mají být status barvy: confirmed, pending, risk, info.

Barvy nesmí být dekorace. Barvy musí nést význam.

### 4.4 Původní pracovní základ

- `Navy Ink`: hluboký navy tón pro důvěru a značku.
- `Paper`: velmi světlá studená plocha, aby UI nepůsobilo žlutě.
- `Mist`: světle modrošedá pracovní plocha.
- `Signal Cyan`: aktivní provozní signál, čekající stav, CTA akcent.
- `Slot Blue`: volná okna a informační stavy.
- `Confirm Green`: potvrzeno.
- `Risk Coral`: no-show, zrušení, riziko.

Princip:

- Primární barva není jasná SaaS modrá.
- Akcenty se používají významově, ne dekorativně.
- Cyan/blue signál nahrazuje původní amber variantu, protože působí moderněji a méně jako pokladna/restaurace.

## 5. Povrchy

Místo jedné karty pro všechno:

1. `Command surface`
   - hlavní provozní plocha,
   - vyšší kontrast,
   - používá se pro hero mockup, dnešní provoz, booking summary.

2. `Signal card`
   - karta s levým/vrchním barevným signálem,
   - rezervace, alerty, volná okna, stav klienta.

3. `Quiet panel`
   - sekundární kontext bez silného shadow,
   - méně důležité informace.

4. `Checkout card`
   - veřejný booking,
   - výrazný vybraný stav,
   - sticky summary.

## 6. Typografie

Zachovat `Plus Jakarta Sans`, ale používat ji ostřeji:

- H1 marketing: velký, krátký, silný, bez přehnaně dlouhých řádků.
- Serif accent jen pro jedno slovo nebo krátkou frázi.
- App nadpisy držet menší a praktičtější.
- Čísla vždy tabular.
- Eyebrow nepoužívat všude; jinak ztrácí význam.

## 7. Logo

Nový logomark má být:

- čitelný v malé velikosti,
- symbolizovat `T + časový slot + potvrzení`,
- méně blobový,
- ostřejší a provoznější.

Princip:

- Tvar slotu/checkmarku je hlavní motiv.
- Modro-zelený gradient nahradit ink/amber signálem.
- Logo musí fungovat i bez textu.

## 8. Landing page

Nová struktura:

1. Sticky public nav
   - logo,
   - krátká navigace,
   - CTA.

2. Hero
   - claim: „Méně telefonátů. Více rezervací.“
   - podclaim: vlastní rezervační stránka, týmový kalendář a přehled klientů.
   - velký produktový mockup s dashboardem a telefonním booking preview.

3. Proof strip
   - 24h reminder,
   - no double-booking,
   - self-service přesun,
   - klientský kontext.

4. Before/after provoz
   - před: telefon, papír, nejasné termíny,
   - po: signály, potvrzení, volná okna.

5. Feature systém
   - ne obecné karty,
   - konkrétní provozní situace.

## 9. Veřejný booking

Booking musí být nejhezčí a nejdůvěryhodnější část produktu.

Nový pattern:

- větší šířka než 480 px na desktopu,
- levý brand/context panel,
- pravý appointment checkout,
- nahoře signál důvěry,
- služby jako produktové položky,
- časové sloty jako výrazné slot chips,
- summary jako checkout receipt,
- potvrzení jako jasný finální stav.

## 10. Dashboard

Dashboard má být „provozní konzole“:

- sidebar může být ink-toned, ale ne plně černý,
- hlavní plocha teplá/mist,
- topbar jako command strip,
- hlavní dnešní přehled výraznější než sekundární karty,
- statusy jako signální proužky/notche,
- méně identických white cards.

## 11. Status jazyk

Temaro musí mít vlastní status systém:

- `confirmed`: zelený tenký signál,
- `pending`: amber signál,
- `new`: slot blue,
- `no-show/risk`: coral notch,
- `free window`: blue/teal slot,
- `outside hours`: šrafovaný/muted povrch.

Status se nemá spoléhat jen na badge. Má být vidět i jako linka, notch nebo rail.

## 12. Implementační priority

P0:

1. Tokeny/paleta.
2. Logo.
3. Landing hero a produktový mockup.
4. Veřejný booking checkout.
5. Dashboard shell.

P1:

1. Status komponenty.
2. Kalendářové sloty.
3. Klientský detail jako „client memory“.
4. Empty states bez generického card vzhledu.
5. Form input sjednocení.

P2:

1. Motion.
2. Illustrace/provozní diagramy.
3. Segmentové landing variants pro barber/salon/ordinace.

## 13. Kritérium 10/10

Design bude výrazně lepší, až půjde podle screenshotu poznat, že je to Temaro, i bez loga.

To znamená:

- vlastní barvy,
- vlastní status signály,
- vlastní booking checkout,
- vlastní provozní mockup,
- méně generických karet,
- jasná produktová věta,
- důvěryhodná app plocha.
