# Product Differentiation and Gap Plan

Aktualizováno: 2026-05-08 11:32 CEST

Tento dokument je aktivní implementační podklad pro další rozvoj Temara. Shrnuje, co Temaro už umí, co trhu chybí, co má konkurence a kde se můžeme odlišit. Navazuje na hloubkovou analýzu `docs/20-competitive-analysis-booking-systems-2026.md`. Cíl: postupně vybudovat silný produkt pro lokální služby bez marketplace provizí.

## Produktová teze

**Temaro je rezervační systém pro malé lokální služby, který chrání čas, klienty a značku podniku. Bez marketplace provizí, bez chaosu, s no-show ochranou a vlastním booking kanálem.**

Temaro má mít plnou konkurenční výbavu před spuštěním, ale vyhrát nemá jen počtem modulů. Má vyhrát tím, že budou moduly poskládané do jednoduššího, cílenějšího a provozně užitečnějšího systému pro malé podniky řízené časem.

## Co Temaro už umí silně

- Multi-tenant SaaS základ: auth, tenant izolace, RLS, role owner/staff.
- Služby, ceny, délka, buffer, zálohový základ a přiřazení zaměstnancům.
- Staff, pracovní hodiny, výjimky, barvy v kalendáři.
- Veřejný booking: služba, zaměstnanec, termín, kontakt, potvrzení.
- Anti-double-booking přes DB/RPC logiku.
- Admin kalendář: den/týden, drag-to-create, popup detail, ruční rezervace.
- Klienti: historie, interní poznámky, oblíbený zaměstnanec, flag, no-show.
- Self-service manage odkaz pro změnu nebo zrušení rezervace bez účtu.
- Email potvrzení, změny, zrušení, owner notifikace a 24h reminder.
- SMS reminder technický základ bez vendor locku.
- Záloha u služby a interní evidence plateb u rezervace.
- Sekce `Platby` a owner-only CSV export pro účetní.
- iCal read-only export přes odvolatelný token.
- Booking button embed pro web podniku.
- Booking share kit: Instagram bio/story texty a QR kód.
- Tenant branding: veřejný popis, logo, cover image, brand color.
- Zákaznický účet minimum: Google login a přehled rezervací podle ověřeného e-mailu.
- Landing komunikace dvou typů účtů: podnikatel a zákazník.
- První veřejný katalog `/podniky` s městem, adresou, mapovým odkazem a booking CTA.
- Lokální SEO/GEO/AEO stránky pro první segmenty a pain pages.
- Bezpečnostní a testovací základ: CSP, health endpoint, audit, Playwright scaffold, coverage, performance smoke, Supabase hardening.

## Co konkurence běžně má a Temaru ještě chybí před spuštěním

- Živá online platební brána a skutečné platby předem.
- Konkrétní SMS provider a reálné produkční SMS odesílání.
- Plný Google/Outlook Calendar sync.
- Vlastní doména booking stránky; plný iframe widget i booking button fallback už jsou hotové.
- Vlastní doména booking stránky.
- Custom email/SMS šablony.
- Waitlist pro uvolněné termíny.
- Reviews/reputace a review request po návštěvě.
- Balíčky, permanentky, kredity, vouchery.
- Pokladna/POS, fakturace, sklad, inventory.
- Mobilní appka.
- Pokročilý katalog/discovery bez provize z vlastních klientů, s recenzemi, vzdáleností a kategoriemi.
- Skupinové lekce a kapacita pro fitness/jógu.

## Co lidé od rezervačních systémů chtějí

- Online rezervace 24/7 bez telefonátu.
- Jednoduchý booking link použitelný na webu, Instagramu, Google profilu a QR kódu.
- Přehledný kalendář bez double-bookingu.
- Připomínky přes email/SMS.
- Jednoduchý přesun nebo zrušení termínu.
- Klientskou historii a poznámky.
- Přehled služeb, cen, délek, pracovníků a pracovní doby.
- Mobilní použitelnost pro klienta i provozovatele.
- Jasnou cenu bez skrytých kreditů, limitů a provizí.
- Možnost chránit se před no-show přes zálohy, storno pravidla a reminders.

## Co lidem nejvíc vadí

- No-show a pozdní rušení.
- Telefonáty a zprávy rozházené po Instagramu/Messengeru.
- Nepřehledný kalendář u více lidí.
- Složité nastavení a enterprise chaos.
- Limity rezervací, kreditový stres a add-on pocit.
- Marketplace závislost: platforma drží klienty, recenze nebo bere provize.
- Špatná důvěra u plateb/payoutů u marketplace systémů.
- Slabá customizace zpráv podle služby nebo provozu.
- Chybějící lokální najditelnost přes Google/Mapy.

## Nejsilnější diferenciace Temara

### 1. Anti-no-show engine

Temaro má být systém, který chrání čas provozovatele.

Hotové vrstvy:

- no-show counter,
- flag klienta,
- email reminder,
- self-service změna/zrušení,
- zálohový základ,
- interní evidence zaplacení.

Další vrstvy:

- SMS reminder přes konkrétního providera,
- online záloha/platba,
- potvrzení účasti,
- pravidla podle typu klienta: nový klient, opakovaný no-show, VIP,
- automatická zpráva po no-show,
- waitlist pro uvolněný termín.

### 2. Client memory

Temaro má být paměť podniku, ne jen seznam termínů.

Hotové vrstvy:

- historie rezervací,
- interní poznámky,
- oblíbený zaměstnanec,
- no-show a flag.

Další vrstvy:

- preference klienta,
- štítky,
- fotky/reference podle segmentu,
- poznámky podle služby,
- jednoduché formuláře před návštěvou.

### 3. Vlastní klienti, vlastní značka

Temaro má jít anti-marketplace směrem.

Hotové vrstvy:

- booking stránka pod značkou podniku,
- logo/cover/barva/popisek,
- share kit,
- QR kód,
- katalog `/podniky` jako první lokální discovery bez provizí.

Další vrstvy:

- oborové kategorie v katalogu,
- geokoordináty a vzdálenostní hledání,
- mapový embed,
- SEO/LocalBusiness schema pro veřejný profil,
- Google review link po dokončené návštěvě.

### 4. Jednoduchý český setup

Malý podnik nechce enterprise software.

Směr:

- onboarding do 15 minut,
- šablony služeb podle segmentu,
- šablony pracovní doby,
- jednoduchý provozní dashboard,
- každá pokročilá funkce opt-in.

### 5. Segmentový core bez rozbití produktu

První produkční segmenty:

1. Hair segment: barber + kadeřnictví
2. Kosmetika / beauty
3. Nehty / pedikúra / řasy / obočí
4. Masáže / wellness solo
5. Soukromá fitka / osobní trenéři v individuálním režimu
6. Fyzio solo

Nevytvářet pro každý segment nový produkt. Držet jeden booking core a měnit hlavně:

- copy,
- šablony služeb,
- onboarding,
- katalogovou kategorii,
- doporučené nastavení.

### 6. Anti-no-show OS, ne jen reminder

Konkurence má jednotlivé díly: SMS, zálohy, waitlist nebo cancellation fees. Temaro má tyto díly spojit do jednoho provozního systému.

Směr:

- riziko no-show podle klienta, služby, času a historie,
- doporučená záloha nebo storno pravidlo podle služby,
- trusted/VIP klienti s menší friction,
- rizikoví klienti s povinnou zálohou,
- automatická náhrada termínu z waitlistu,
- report zachráněných hodin a peněz.

### 7. Client ownership pledge

Temaro má veřejně slíbit a produktově dokazovat, že klienti patří podniku.

Směr:

- export klientů jedním klikem,
- žádná provize z vlastních klientů,
- žádné přesměrování zákazníka ke konkurenci,
- vlastní značka podniku v popředí,
- přenositelná reputace/review strategie,
- jasná datová politika pro klientské vztahy.

### 8. Transparentní TCO kalkulačka

Konkurence často rozpadá cenu na tarif, SMS, platební poplatky, další zaměstnance, terminál, add-ony a marketplace provize. Temaro má ukazovat skutečnou měsíční cenu.

Směr:

- počet zaměstnanců,
- počet rezervací,
- počet SMS,
- objem online záloh,
- platební poplatky,
- marketplace provize konkurence,
- ušetřené telefonáty,
- zachráněné no-show hodiny.

### 9. Provozní zkouška před spuštěním

Všichni ukazují hezký kalendář. Temaro má v onboarding checklistu ověřit reálné stresové situace.

Směr:

- dva klienti chtějí stejný čas,
- zaměstnanec onemocní,
- ruší se více rezervací najednou,
- klient chce přesun,
- záloha se má vrátit nebo propadnout,
- sync konflikt,
- SMS nedorazila,
- zaměstnanec odešel a klienti zůstávají podniku.

### 10. Migrační asistent z konkurence

Přechod z jiného systému nesmí být ruční chaos. Temaro má mít produktový flow “přechod za jeden večer”.

Směr:

- import klientů,
- import služeb,
- import budoucích rezervací,
- import poznámek, pokud je zdroj dovolí,
- dry-run import,
- checklist přepnutí booking linků,
- paralelní provoz,
- rollback plán.

### 11. Provozní doporučení

Temaro má aktivně doporučovat nastavení, ne jen pasivně držet data.

Směr:

- “tato služba má vysoké no-show, zapni zálohu”,
- “tento čas bývá prázdný, nabídni Last Minute”,
- “tento klient často ruší, vyžaduj potvrzení”,
- “tento zaměstnanec má nízkou obsazenost v úterý”,
- “tento zdroj rezervací má nejlepší konverzi”.

## Implementační backlog podle priority

### Hotovo: posílený core

1. Hotovo: přidat obor/kategorii tenantu.
2. Hotovo: rozšířit katalog `/podniky` o filtr oboru.
3. Hotovo: přidat oborové šablony služeb pro hair, beauty, nehty, masáže a soukromé fitko.
4. Hotovo: přidat onboarding volbu oboru v `/start`.
5. Hotovo: doplnit veřejný booking profil o LocalBusiness/Service schema.
6. Hotovo: přidat review link pole do nastavení podniku bez automatického odesílání.
7. Hotovo: rozšířit dashboard reporting o no-show rate a obsazenost.

### Vlna 1: anti-no-show a platby

1. Vybrat konkrétní SMS provider a zapnout produkční SMS reminders.
2. Implementovat živé online zálohy/platby.
3. Hotovo: přidat custom texty potvrzení, reminderu a zrušení.
4. Přidat waitlist pro uvolněné termíny.
5. Přidat review request po dokončené návštěvě přes existující `review_url`.
6. Začít měřit zdroj rezervace: booking stránka, QR, Instagram, katalog, ruční rezervace a UTM.
7. Přidat trusted/risk segmentaci klientů podle no-show a platební historie.
8. Přidat empty-slot recovery pro uvolněné termíny.

### Vlna 2: zákazník a integrace

1. Zlepšit zákaznický účet: detail rezervace a změna/zrušení po přihlášení.
2. Plný Google Calendar sync.
3. Outlook Calendar sync.
4. Ověřit plný iframe widget v reálném externím HTML prostředí a doladit výšku/branding podle browser testu.
5. Vlastní doména booking stránky.
6. Doplnit migrační checklist z konkurence; import klientů/služeb/rezervací z CSV už má první dry-run vrstvu.

### Vlna 3: business suite

1. POS/pokladna minimum.
2. Účtenky a účetní exporty.
3. Sklad/inventory minimum. ✅ Hotovo jako první produktová a pohybová evidence.
4. Permanentky, kredity, vouchery. ✅ Vouchery a permanentky/kredity hotové jako první zůstatkové vrstvy.
5. Balíčky služeb a memberships. ✅ Balíčky služeb i memberships hotové jako první provozní evidence bez automatického billing providera.
6. Pokročilejší reporting: provize, cashflow a navazující doporučení; tržby podle služby/staff/zdroje, obsazenost a no-show rate jsou hotové jako první vrstva.
7. Opakované rezervace.

### Vlna 4: growth, discovery a mobilní vrstva

1. Geokoordináty, vzdálenostní hledání a mapový embed v katalogu.
2. Recenze/reputace a viditelnost recenzí.
3. Marketingové kampaně: email/SMS blast podle segmentu klientů. ✅ Hotové jako draft/plánovací evidence před provider odesíláním.
4. Last Minute nabídky volných slotů. ✅ Hotové jako evidence slotů pro následný blast/zvýraznění.
5. Mobilní/PWA provozní vrstva.
6. Více poboček.
7. Skupinové lekce/kapacity a resources/místnosti.
8. API a integrace.
9. Účetní integrace typu Fakturoid/Pohoda/iDoklad.

## Co nedělat před spuštěním

- Plný marketplace s provizemi z vlastních klientů.
- AI funkce bez konkrétního provozního workflow.
- Rychlé moduly, které obejdou bezpečnost, validaci, audit nebo tenant izolaci.
- Ordinace se zdravotní agendou jako první segment.

## Poznámka k tempu

Projekt vzniká rychle, ale každá nová funkce musí dál splnit:

- tenant izolaci,
- Zod validaci,
- bezpečné error handling,
- testy pro kritickou logiku,
- dokumentaci,
- žádné citlivé hodnoty v kódu.

Rychlost vývoje nesmí být důvod obejít bezpečnost.

## Použité zdroje a interní podklady

- `docs/14-market-analysis-booking-systems.md`
- `docs/20-competitive-analysis-booking-systems-2026.md`
- `docs/02-funkce-a-diferenciace.md`
- `docs/18-vertical-expansion-priorities.md`
- Reservio features: https://www.reservio.com/features
- Fresha features: https://www.fresha.com/for-business/features
- Booksy features: https://biz.booksy.com/en-us/features
- Calendly features: https://calendly.com/features/
- Calendly payments: https://calendly.com/features/payments/
- Salona obchodní podmínky: https://salona.cz/documents/Salona-Obchodni_podminky.pdf
