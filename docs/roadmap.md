# Roadmap

Aktualizováno: 2026-05-08 20:06 CEST

Roadmapa vychází z aktuální implementace, z `docs/14-market-analysis-booking-systems.md`, z hloubkové konkurenční analýzy `docs/20-competitive-analysis-booking-systems-2026.md`, z niche/SEO/GEO/AEO strategie v `docs/17-czech-market-niches-seo-geo-aeo.md`, z expanzního pořadí v `docs/18-vertical-expansion-priorities.md` a z implementačního gap plánu `docs/19-product-differentiation-and-gap-plan.md`.

## Teď

- Udržet stabilní core a rozšířené MVP stavět po vrstvách, ne jako neřízený vendor-lock mix.
- Ručně projít hlavní flow podle `docs/manual-test-plan.md`.
- Ověřit landing, veřejný booking, dashboard, kalendář, klienty, služby, staff a self-service manage.
- Doladit konkrétní UI/UX detaily až podle reálného prokliku a externí analýzy.
- Připravit pilotní scénář pro první reálné provozovny.
- Hotovo: první segmentová landing page pro barbery a pain page `Jak snížit no-show`.
- Pokračovat v lokálním pre-launch hardeningu: Playwright browser dependencies už jsou zprovozněné, další krok je rozšířit E2E na mutační booking/admin flow v izolovaném test tenantovi.
- Udržet marketingový focus na hair/beauty/wellness, ne otevírat současně autoservis/fyzio/ordinace bez segmentového workflow.
- Landing už má komunikovat dva typy účtů: podnikatelský účet pro provoz a zákaznický účet pro vlastní rezervace.
- První katalog `/podniky` je hotový jako základ bez provizí; obory/kategorie, oborový filtr a LocalBusiness/Service schema na veřejném booking profilu jsou hotové, další krok je lepší lokální hledání.
- Produkční pořadí: hair segment jako jeden balík barber + kadeřnictví, potom kosmetika, nehty/pedikúra/řasy/obočí, masáže/wellness solo a soukromá fitka/osobní trenéři v individuálním režimu; tyto segmenty se nejméně liší od aktuálního core.
- Aktivní pre-launch backlog po rozhodnutí rozšířit MVP: produkční SMS, plný sync a push notifikace. Online zálohy/platby, waitlist, review request, zdroje rezervací/UTM, lepší zákaznická správa rezervace, klientské preference/trusted-risk profil, iframe widget, vlastní doména, Google Business Profile CTA, POS minimum, účtenky/doklady, sklad minimum, vouchery, permanentky/kredity/balíčky, memberships, kampaně/Last Minute, referral, empty-slot recovery, partner API/integrace, katalog/discovery, recenze/reputace, mobilní/PWA vrstva, resources, více poboček, skupinové kapacity, reporting tržeb, provize a CSV import klientů/služeb/rezervací jsou hotové jako první vrstvy.

## Vlna 1: anti-no-show a platby

- SMS reminder kanál má webhook základ; před pilotem vybrat konkrétního providera a pricing.
- Online záloha/platba pro služby s vysokým no-show rizikem; základ nastavení záloh u služeb a propsání do rezervace je hotový.
- Evidence plateb, doplatků a CSV export pro účetní jsou první hotová vrstva; plné účetnictví nedělat bez pilotní poptávky.
- Waitlist pro obsazené termíny.
- Review request po dokončené návštěvě přes existující `review_url`.
- Zdroje rezervací/UTM pro web, widget, QR, Instagram, katalog a ruční rezervace.

## Vlna 2: zákazník a integrace

- Google OAuth pro podnikatele a zákazníky je připravený v kódu; runtime aktivaci odložit až před spuštěním na produkční doméně.
- Základní zákaznický `/account` je hotový; pokročilá správa rezervací po přihlášení zůstává pozdější vrstva.
- Instagram booking jako měřitelný link/CTA do veřejné booking stránky; hlubší Meta integrace až podle poptávky.
- Sdílecí kit pro Instagram bio/story a QR kód je hotový v `/booking-page`.
- Branding veřejné booking stránky: logo, barva, vlastní text.
- iCal export je hotový jako rychlé minimum pro externí kalendář.
- Jednoduché embed tlačítko je hotové jako fallback pro web podniku.
- Plný iframe widget je hotový jako sandboxovaný lazy iframe přes `/embed/booking/[slug]`.
- Plný Google/Outlook sync je součást pre-launch scope.
- Vlastní doména booking stránky je hotová jako TXT ověřený host-based booking root.
- Import klientů/služeb/rezervací z CSV je hotový s dry-runem; rezervace se párují přes existující klienty, služby, zaměstnance a `create_booking` RPC.

## Vlna 3: business suite

- POS/pokladna minimum je hotové jako interní checkout rezervací a zápis plateb.
- Účtenky, účetní exporty a provozní doklady jsou hotové jako první vrstva: CSV export plateb a tiskové HTML doklady k jednotlivým platbám.
- Sklad/inventory minimum je hotové jako produkty, nízký stav a audit pohybů přes atomickou DB RPC.
- Vouchery/dárkové poukazy jsou hotové jako hashované kódy a čerpání zůstatku; permanentky, kredity, balíčky a memberships jsou hotové jako první provozní evidence.
- Přesnější reporting: obsazenost, no-show rate, tržby podle služby/staff/zdroje a provize zaměstnanců jsou hotové jako první vrstva; další vrstva je cashflow.

## Vlna 4: growth, discovery a mobilní vrstva

- SEO/GEO/AEO základy: segmentové landing pages, FAQ schema, SoftwareApplication schema, comparison bloky a interní odkazy mezi pain pages.
- Runtime jistota: ověřený `/api/health`, CSP bez blokací, monitoring a až před spuštěním Supabase Pro/leaked password protection.
- Veřejný katalog podniků má obor, město, geokoordináty, vzdálenostní hledání a reputační štítek; další vrstva je lepší mapový embed.
- Custom email/SMS šablony.
- Preference klienta a trusted/risk profil jsou hotové jako první strukturovaná vrstva; další vrstva je automatické skórování podle chování.
- Reviews/reputace, pokud se ukáže jako prodejní páka.
- Empty-slot recovery a Last Minute kampaně mají první evidenční vrstvu; automatické odesílání navázat po výběru SMS/e-mail providera.
- Rozšířit niche stránky podle skutečné aktivace a konverzí, ne podle obecné návštěvnosti.
- Marketingové kampaně přes email/SMS na segmenty klientů mají první draft/plánovací vrstvu.
- Mobilní/PWA vrstva pro provozovatele a zákazníky je hotová jako manifest + service worker; push notifikace zůstávají další kanál.
- Resources/místnosti, pobočky a skupinové lekce jsou hotové jako první provozní evidence.

## Vlna 5: diferenciace, kterou konkurence nemá dobře

- Anti-no-show OS: riziko klienta/služby/času, doporučené zálohy, trusted/risk klienti a report zachráněných hodin.
- Client ownership pledge: export dat, žádná provize z vlastních klientů, žádné přesměrování zákazníka ke konkurenci a značka podniku v popředí.
- Transparentní TCO kalkulačka: tarif, SMS, platby, zaměstnanci, terminál, add-ony, marketplace provize konkurence a ušetřený čas.
- Provozní zkouška v onboardingu: konflikty, nemoc zaměstnance, hromadné storno, refund/propadnutí zálohy, sync konflikt a nedoručená SMS.
- Migrační asistent z konkurence: import klientů/služeb/rezervací, dry-run, checklist přepnutí booking linků, paralelní provoz a rollback.
- Provozní doporučení: systém navrhne zálohu, Last Minute nabídku, potvrzení klienta, kapacitní změnu nebo nejlepší zdroj rezervací podle dat.

## Nedělat před spuštěním

- Provizní marketplace, který bere provizi z vlastních klientů podniku.
- AI funkce bez konkrétního provozního workflow a bezpečnostního návrhu.
- Jakýkoliv rychlý modul, který obejde tenant izolaci, Zod validaci, audit a bezpečné error handling.
