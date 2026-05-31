# 14 – Tržní analýza rezervačních systémů

Datum: 2026-05-01  
Produkt: Temaro  
Scope: český trh, uživatelské bolesti, globální benchmark, must-have gapy a diferenciace.

## 0. Shrnutí

Temaro už má silné MVP jádro: registraci podniku, tenant izolaci, služby, zaměstnance, pracovní dobu, výjimky, veřejný booking, admin kalendář, klienty, interní poznámky, flag/no-show, emaily, reminder, self-service přesun/zrušení a základní statistiky.

Na českém trhu ale placený rezervační systém musí postupně nabídnout i SMS, platby/zálohy, Google/Outlook sync, widget, branding/vlastní doménu, custom zprávy, reporting a lepší klientskou správu. Globální hráči přidávají waitlist, memberships, packages, marketplace, reviews, POS/payments, routing forms, deposits, card-on-file a automatizace.

Nejlepší positioning pro Temaro není “mít všechno jako Reservio”. Lepší je:

**Temaro = jednoduchý rezervační systém pro služby, který chrání čas provozovatele před no-show, chaosem a zbytečnou administrativou. Bez marketplace provizí, bez kreditového stresu, s čistým klientským profilem a chytrou provozní rutinou.**

## 1. Český trh

### Reservio

Silné: brand awareness, booking web, klientská databáze, mobilní app, platby, reminders, marketplace/consumer vrstva.

Relevantní zjištění:
- Free plán má limit 40 rezervací za 30 dní a 100 klientů.
- Starter uvádí 200 rezervací, SMS reminders jako add-on, Google/iCal/Outlook sync, statistiky a export.
- Standard přidává custom domain, custom booking messages, staff notifications a design booking website.
- Pro přidává unlimited bookings, multi-level access, permissions, odstranění brandu a API.

Zdroje: https://www.reservio.com/pricing, https://help.reservio.com/en/articles/8480536-is-there-a-free-version-of-reservio, https://help.reservio.com/en/articles/5113678-how-is-the-booking-limit-counted

Implikace:
- Reservio potvrzuje základ trhu: booking stránka, klienti, reminders, attendance/no-show tracking, staff, sync, platby.
- Slabina pro Temaro: limity rezervací, add-on psychologický tlak, obecný one-size-fits-all pocit.

### Reservanto

Silné: český systém, transparentní lokální nabídka, hodně funkcí i v nižších plánech.

Relevantní zjištění:
- Basic zdarma komunikuje neomezeně rezervací, zákazníků a služeb, SMS upomínky, platební bránu a mobilní správu.
- Professional přidává rozšířenou správu zákazníků, zákaznický účet, statistiky, vlastní barvy/logo, permanentky, kredity, vouchery, náhrady a Google Calendar sync.
- Premium přidává více uživatelů, oprávnění, skrytí loga, věrnostní program, import/export a API.

Zdroje: https://reservanto.cz/cenik, https://reservanto.cz/vlastnosti

Implikace:
- “Neomezené rezervace” samo o sobě není unikátní.
- Permanentky, kredity a vouchery jsou pro fitness/salony důležité.
- Temaro musí vyhrát UX, anti-no-show specializací a provozní jednoduchostí.

### Reenio

Silné: univerzální systém pro služby, sportoviště, události, pronájmy a kulturu.

Relevantní zjištění:
- Komunikuje email/SMS upozornění, Google/Outlook sync, online platby, vícejazyčné stránky, vlastní doménu, API, poukazy, vlastní zprávy/emaily, pokladnu a notifikace zaměstnanců.
- Prémiový plán uvádí 20 000 rezervací měsíčně, 150 kreditů měsíčně zdarma, role, vlastní doménu, API a platby převodem.

Zdroje: https://reenio.cz/, https://reenio.cz/cs/Home/Balicky

Implikace:
- Český trh očekává univerzálnost, ale Temaro by se nemělo rozředit do eventů, zámků a vstupenek.
- Převzít jako must-have: SMS, sync, platby, custom zprávy, vlastní doména.

### Bookio

Silné: business-grade systém, restaurace/služby/ubytování, marketing a reputace.

Relevantní zjištění:
- Funkce: rezervační kniha, kalendář, 24/7 rezervace, připomínky, placené rezervace, dárkové poukázky, statistiky, zákaznické informace, zpětná vazba, vzdálený přístup.
- Komunikuje email/SMS potvrzení a připomínky, Google Tag Manager, Google reviews, lepší Google vyhledávání, online platby, kalendáře/dovolené/přestávky, API.

Zdroje: https://www.bookio.com/cs/funkce, https://www.bookio.com/

Implikace:
- SEO/GEO a Google viditelnost jsou pro booking systém reálný prodejní argument.
- Feedback/reviews jsou velká příležitost pro Temaro.

### Menší hráči

Reservine ukazuje poptávku po jednoduchém moderním systému s vlastním booking webem, SMS, online kalendářem, Apple Pay/Google Pay a transparentním ceníkem.  
Zdroj: https://reservine.io/cs, https://reservine.io/cs/pricing/

ReservoBot ukazuje sílu vertikálního focusu pro restaurace/kavárny.  
Zdroj: https://www.reservobot.com/

## 2. Must-have matrice Temara

| Oblast | Stav Temaro | Tržní očekávání | Priorita |
|---|---:|---|---|
| Registrace, role owner/staff | Hotovo | Must-have | Udržovat |
| Služby, ceny, délka, buffer | Hotovo | Must-have | Udržovat |
| Zaměstnanci, pracovní doba, výjimky | Hotovo | Must-have | Udržovat |
| Veřejný booking link | Hotovo | Must-have | Udržovat |
| Mobilní booking flow | Hotovo technicky | Must-have | Ručně ověřit |
| Anti-double-booking | Hotovo | Must-have | Silně komunikovat |
| Admin kalendář den/týden | Hotovo | Must-have | Drag/drop později |
| Klienti, historie, poznámky | Hotovo | Must-have pro služby | Diferenciovat |
| No-show counter / flag | Hotovo | Nadstandard v CZ | Rozšířit |
| Email potvrzení a reminder | Hotovo | Must-have | Custom šablony |
| SMS připomínky | Technický webhook základ | Must-have pro placený provoz | Doplnit providera |
| Online platby / zálohy | Zálohový základ hotový, živá platební brána chybí | Rychle must-have | P0/P1 |
| Self-service přesun/zrušení | Hotovo | Must-have/nadstandard | Komunikovat |
| Google/Outlook sync | iCal read-only export hotový, plný sync chybí | Must-have pro solo profesionály | P1 |
| Widget/embed na web | Jednoduché embed tlačítko hotové, iframe widget chybí | Must-have pro firmy s webem | P1 |
| Vlastní doména / branding | Branding booking stránky hotový, vlastní doména chybí | Očekávané v placených plánech | P1 |
| Vlastní zprávy/emaily | Chybí | Očekávané | P1 |
| Statistiky | Základ | Očekávané | P1 |
| Pokladna / evidence plateb | Interní evidence plateb hotová, plná pokladna chybí | Důležité pro salony, wellness, restaurace | P1/P2 |
| Faktury / účetní doklady | Chybí | Nabízí část konkurence nebo řeší přes export/integrace | P2 |
| Export pro účetní systémy | CSV export plateb hotový, účetní integrace chybí | Praktický požadavek provozoven | P1/P2 |
| Vouchery/permanentky/kredity | Chybí | Silné pro salony/fitness | P2 |
| Waitlist | Chybí | Globální standard u salonů | P1/P2 |
| Reviews/reputace | Chybí | Silný globální směr | P2 |
| Marketplace | Chybí | Globálně silné, ale kontroverzní | Nedělat v MVP |

## 3. Co už máme silné

1. Bezpečnost a tenant izolace od začátku. To je silný základ pro SaaS, i když zákazník to v marketingu tolik neocení.
2. Klientský profil jako provozní paměť: historie, poznámky, no-show a flag. To je pro služby velmi hodnotné.
3. Self-service správa rezervace bez zákaznického účtu. Snižuje telefonáty a administrativu.
4. Atomické booking jádro bez double-bookingu. To je nutné říkat jednoduše: “Dva klienti si nevezmou stejný čas.”
5. Moderní app-first UX po design auditech. Temaro by nemělo sklouznout do tabulkového/legacy vzhledu.

## 4. Největší gapy

### P0 – SMS

SMS je v české konkurenci běžná a pro lokální služby pořád praktická. Email často nestačí.

Doporučení:
- SMS reminder 24 hodin předem.
- Volitelně SMS potvrzení ihned po rezervaci.
- Později SMS potvrzení účasti.

### P0/P1 – zálohy a platby

No-show je zásadní bolest. Globální hráči běžně nabízí deposits, upfront payments nebo payments přes Stripe/PayPal.

Zdroje: https://www.fresha.com/for-business/features, https://calendly.com/features/, https://reservanto.cz/cenik, https://reenio.cz/, https://www.bookio.com/

Doporučení:
- Stripe záloha u vybraných služeb.
- Fixní částka nebo procento.
- Pravidla: záloha propadá při pozdním zrušení/no-show.
- Card-on-file až později.

### P1 – Google/Outlook sync

Solo profesionálové často žijí v Google Calendar. Bez syncu je Temaro další kalendář navíc.

Doporučení:
- iCal export už je hotový jako první read-only vrstva.
- Poté robustní Google Calendar sync.
- Dvousměrný sync až po pilotu.

### P1 – widget/embed

Podniky s vlastním webem chtějí tlačítko nebo widget.

Doporučení:
- Embed button script už je hotový jako první krok.
- Druhý krok: iframe booking widget.
- SEO řešit přes canonical public booking page.

### P1 – branding

Vlastní barva, logo, custom texty a vlastní doména jsou placené argumenty.

Doporučení:
- Tenant accent color pro public booking.
- Logo podniku.
- Vlastní úvodní text.
- Custom domain až po stabilním deployi.

### P1/P2 – pokladna, fakturace a účetnictví

Rezervační systémy typicky nejsou plnohodnotné účetní systémy. Na trhu se ale překrývají se třemi oblastmi:

1. **Pokladna/POS**: přijetí platby na místě, prodej služby nebo produktu, evidence zaplaceno/nezaplaceno.
2. **Fakturace / účetní doklady**: vystavení dokladu/faktury k rezervaci, číselné řady, sazby DPH, historie dokladů.
3. **Export/integrace pro účetní**: CSV/export plateb, API nebo napojení na účetní systém.

Konkurence:
- Reservio komunikuje pokladní systém, prodej služeb/produktů, inventář, faktury a daňové sazby.
- Reenio má funkci Pokladna, evidenci plateb, účetní doklad a export plateb pro další zpracování.
- Reservanto v nápovědě řeší účetní doklady a nastavení systému pro situace, kdy kolegové podnikají na vlastní živnostenský list.
- Bookio komunikuje administrativu, online platby a API pro napojení na interní systémy, ale účetnictví nepůsobí jako hlavní positioning.

Zdroje:
- https://www.reservio.com/cs/pokladni-system
- https://help.reservio.com/cs/collections/8745498-pokladni-system
- https://manual.reenio.cz/cs/napoveda/cenotvorba-a-platby/pokladna
- https://manual.reenio.com/en/help/pricing-and-payments/cash-desk
- https://reservanto.cz/napoveda/nastaveni-systemu
- https://bookio.com/

Doporučení pro Temaro:
- Neimplementovat plné účetnictví. To je samostatný produkt a regulatorně/procesně velká oblast.
- Před placeným pilotem stačí jednoduchá evidence plateb u rezervace: nezaplaceno, zaplaceno hotově, zaplaceno kartou, záloha zaplacena.
- Fáze P1/P2: export plateb a rezervací pro účetní v CSV.
- Fáze P2: základní číselná řada a doklad/faktura jen pokud to bude jasná poptávka pilotních zákazníků.
- Lepší dlouhodobý směr je integrace/export do nástrojů typu Fakturoid/Pohoda/iDoklad, ne stavět účetnictví od nuly.

## 5. Uživatelské bolesti z recenzí/diskusí

### Cena a limity

Čeští uživatelé v diskusích řeší poměr cena/výkon, jednoduchost, češtinu a zvládnutí rezervace i méně technickými klienty.

Zdroj: https://www.reddit.com/r/czech/comments/unuuo8/kter%C3%BD_rezerva%C4%8Dn%C3%AD_syst%C3%A9m/

Produktový závěr:
- Pricing musí být velmi čitelný.
- Nevytvářet kreditový stres.
- Placený plán by měl mít neomezené rezervace nebo velmi jasné limity.

### No-show

Globální diskuse často řeší no-show jako hlavní bolest. Doporučovaná řešení: záloha, booking fee, SMS/email reminders, card-on-file, povinné telefonní číslo, potvrzení účasti.

Zdroje:
- https://www.reddit.com/r/sweatystartup/comments/1rcq5vo/anyone_else_dealing_with_crazy_noshow_rates/
- https://www.reddit.com/r/smallbusiness/comments/1slg3ew/salon_running_smooth_until_peak_season_hits_and/
- https://www.reddit.com/r/smallbusiness/comments/1jmuzfr/calendly_alternative_that_requires_visitors_to/

Produktový závěr:
- Udělat z no-show ochrany hlavní diferenciátor.
- Ne jen “máme no-show counter”, ale “Temaro chrání váš čas”.

### Komplexita

Malé podniky nechtějí enterprise software. Chtějí jasný setup, jednoduchý kalendář a méně telefonování.

Produktový závěr:
- Onboarding do 15 minut je správná metrika.
- Každá nová funkce musí být volitelná a nesmí zhoršit základní booking flow.

### Marketplace vs vlastní klient

Globální salon platformy jako Fresha a Booksy mají marketplace/discovery. To může přinést klienty, ale podnik se může cítit závislý na platformě.

Produktový závěr:
- Temaro může záměrně jít anti-marketplace směrem: “Vaši klienti zůstávají vaši.”
- Discovery neřešit v MVP.

## 6. Globální benchmark

### Calendly

Silné: routing, team scheduling, automations/workflows, payments, integrations, enterprise admin.

Zdroj: https://calendly.com/features/

Co převzít:
- Routing forms později pro více služeb/staff.
- Automatizované workflows.
- Payments.

Co nepřebírat hned:
- Enterprise routing pro sales týmy. Temaro je primárně služby.

### Cal.com

Silné: open-source positioning, routing forms, payments, app store/integrace, self-host/white-label možnosti.

Zdroj: https://cal.com/features, https://cal.com/

Co převzít:
- App/integration mindset.
- API a white-label později.
- Transparentnost a developer-friendly přístup.

### Fresha

Silné: salon/wellness vertikála, marketplace, POS/payments, deposits, memberships, packages, reviews, marketing, inventory, staff performance.

Zdroj: https://www.fresha.com/for-business/features

Co převzít:
- Deposits/no-show ochrana.
- Reviews/reputation loop.
- Packages/memberships pro salony.
- Staff performance a provozní reporting.

Co nepřebírat hned:
- Marketplace a POS/inventory do MVP.

### Booksy

Silné: salon/barber marketplace, reviews, client app, marketing, payments, social/Instagram booking.

Zdroj: https://biz.booksy.com/, https://biz.booksy.com/features/

Co převzít:
- Instagram/social booking.
- Reviews a reputační vrstva.
- Waitlist/last-minute slots.

### SimplyBook.me

Silné: široká funkcionalita, payments, memberships, packages, coupons/gift cards, intake forms, HIPAA/medical variants, custom features.

Zdroj: https://simplybook.me/en/features

Co převzít:
- Intake forms pro obory jako lékaři/terapie/autoservis.
- Memberships/packages/coupons jako fáze 2/3.
- Custom fields u služby.

### Setmore / Acuity / Square Appointments

Společný pattern:
- Booking page, payments, reminders, recurring appointments, classes/group bookings, staff calendars, integrations.

Zdroje:
- https://www.setmore.com/features
- https://acuityscheduling.com/features
- https://squareup.com/us/en/appointments

Co převzít:
- Recurring bookings.
- Classes/group booking až po MVP.
- Payments + POS jen pokud bude jasný segment.

## 7. Doporučené odlišení Temara

### 7.1 Anti-no-show engine

Nejsilnější diferenciátor.

MVP+ funkce:
- SMS reminder.
- Email reminder.
- Self-service přesun/zrušení.
- No-show score u klienta.
- Flag upozornění při rezervaci.

Fáze 2:
- Záloha.
- Potvrzení účasti.
- Pravidla podle klienta: nový klient / opakovaný no-show / VIP.
- Automatická zpráva po no-show.
- Waitlist pro uvolněné termíny.

Marketing:
- “Méně prázdných židlí.”
- “Když klient nepřijde, systém to řeší dřív než vy.”

### 7.2 Client memory

Temaro jako paměť podniku, ne jen kalendář.

Funkce:
- Interní poznámky.
- Preference klienta.
- Historie služeb.
- Oblíbený poskytovatel.
- Fotky/reference později.
- No-show/flag důvody.

Marketing:
- “Víte, kdo přijde, co chtěl minule a na co si dát pozor.”

### 7.3 Jednoduchý český setup

Malé podniky nechtějí složitý enterprise.

Funkce:
- Setup checklist.
- Šablony služeb podle oboru.
- Šablony pracovní doby.
- QR kód do provozovny.
- Instagram bio link.

Marketing:
- “Od registrace k první rezervaci za 15 minut.”

### 7.4 GEO/SEO booking vrstva

Bookio už naznačuje hodnotu Google reviews/vyhledávání. Temaro může cílit na “najditelnost”:

Funkce:
- SEO metadata pro public booking.
- Schema.org LocalBusiness/Service.
- Google review link po dokončené rezervaci.
- UTM tracking.
- Přehled zdrojů rezervací.

Marketing:
- “Rezervace, které fungují i z Googlu a Map.”

### 7.5 Anti-marketplace positioning

Nekonkurovat Fresha/Booksy marketplace hned.

Marketing:
- “Vaši klienti zůstávají vaši.”
- “Bez provizí z každé rezervace.”
- “Booking stránka pod vaším brandem.”

## 8. Doporučená roadmapa

### P0 – před placeným pilotem

1. SMS reminder.
2. Stripe zálohy pro vybrané služby.
3. Tenant branding public booking: logo, barva, intro text.
4. iCal export kalendáře.
5. QR kód a kopírovací booking link.
6. Ruční UX test na mobilu.

### P1 – první placení zákazníci

1. Google Calendar sync.
2. Booking widget/embed.
3. Custom email/SMS texty.
4. Waitlist pro uvolněné termíny.
5. Zákaznické preference.
6. Pokročilejší reporting: obsazenost, no-show rate, tržby podle služby/staff.
7. Review request po dokončené návštěvě.

### P2 – růst

1. Permanentky/kredity/vouchery.
2. Balíčky služeb.
3. Opakované rezervace.
4. Skupinové rezervace/kurzy.
5. Vlastní doména.
6. API.
7. Více poboček.

### Nedělat teď

1. Marketplace.
2. Branded mobilní app.
3. AI funkce bez dat.
4. POS/inventory.
5. Komplexní enterprise permissions nad rámec owner/staff.

## 9. Doporučený pricing směr

Návrh pro pilot:

| Plán | Cena | Obsah |
|---|---:|---|
| Free/Test | 0 Kč | 1 podnik, omezené emaily, bez SMS/plateb, Temaro branding |
| Solo | 299–399 Kč/měs | 1 poskytovatel, neomezené rezervace, emaily, klienti, no-show/flag |
| Team | 599–899 Kč/měs | více poskytovatelů, SMS add-on, základní reporting, branding |
| Pro | 999–1499 Kč/měs | zálohy, Google sync, widget, custom zprávy, pokročilý reporting |

SMS a platby:
- SMS účtovat transparentně jako balíček nebo skutečná cena + marže.
- Stripe poplatky oddělit od měsíční ceny.
- “Neomezené rezervace” držet jako hlavní psychologický benefit placených plánů.

## 10. Produktová teze

Temaro nemá být obecný rezervační formulář. Má být provozní systém pro malé služby, který:

1. Pomůže klientovi rychle zarezervovat.
2. Pomůže provozovateli neztrácet čas.
3. Sníží no-show.
4. Uchová kontext klienta.
5. Nevezme podniku jeho značku ani vztah se zákazníkem.

Nejlepší první segment:
- barbershopy,
- salony,
- masáže/wellness,
- trenéři,
- menší ordinace/terapie.

Nejlepší claim:

**Temaro hlídá rezervace, klienty a prázdná místa v kalendáři. Jednoduše, bez marketplace provizí a bez chaosu.**

## 11. Souvislý soupis konkurenčních funkcí

Tato část je inventář trhu. Nejde o doporučení vše implementovat hned, ale o přehled toho, co konkurenti běžně komunikují jako základní nebo standardní placenou výbavu.

### 11.1 Český a blízký trh

#### Reservio

Základní nabídka:
- online booking website,
- rezervační kalendář,
- klientská databáze,
- email notifikace,
- mobilní aplikace,
- správa služeb a zaměstnanců,
- základní limity rezervací podle plánu,
- placené plány s vyššími limity nebo neomezenými rezervacemi.

Standardní placená výbava:
- SMS reminders jako add-on nebo vyšší výbava,
- Google/iCal/Outlook sync,
- statistiky a export,
- custom booking messages,
- staff notifications,
- custom domain,
- custom design booking website,
- odstranění Reservio brandingu,
- multi-level access a permissions,
- API ve vyšších plánech,
- online platby,
- pokladní systém/POS,
- prodej služeb a produktů,
- inventář,
- fakturace a daňové sazby.

Význam pro Temaro:
- Reservio nastavuje očekávání, že booking systém není jen formulář, ale booking web + klienti + reminders + platby + kalendář + později POS.
- Slabší místo pro odlišení: limity rezervací, add-ony, širší one-size-fits-all positioning.

Zdroje: https://www.reservio.com/pricing, https://help.reservio.com/en/articles/8597072-overview-of-reservio-subscription-plans, https://www.reservio.com/cs/pokladni-system

#### Reservanto

Základní nabídka:
- neomezeně rezervací,
- neomezeně zákazníků,
- neomezeně služeb,
- SMS upomínky,
- platební brána,
- mobilní správa rezervací.

Placené rozšíření:
- emailové zprávy a upomínky,
- opakování událostí,
- základní statistiky,
- pokladní systém Poska,
- rozšířená správa zákazníků,
- zákaznický účet,
- rozšířené statistiky,
- vlastní barvy rezervačního formuláře a logo,
- permanentky,
- kredity,
- vouchery,
- náhrady,
- Google Calendar sync,
- více uživatelů,
- uživatelská oprávnění,
- skrytí loga v rezervačním formuláři,
- věrnostní program,
- importy/exporty,
- API.

Význam pro Temaro:
- Na českém trhu už někdo komunikuje neomezené rezervace i zdarma, takže „neomezeně“ samo o sobě nestačí.
- Reservanto silně pokrývá obchodní modely typu permanentky/kredity/vouchery a POS.

Zdroj: https://reservanto.cz/cenik

#### Reenio

Základní/standardní nabídka:
- online rezervace,
- rezervační stránka,
- email/SMS upozornění,
- online platby,
- Google/Outlook sync,
- vícejazyčné rezervační stránky,
- vlastní doména,
- vlastní zprávy/emaily,
- role a přístupy,
- API,
- poukazy,
- pokladna,
- evidence plateb,
- účetní doklad,
- export plateb pro účetnictví,
- notifikace zaměstnanců.

Význam pro Temaro:
- Reenio potvrzuje, že u univerzálních systémů se očekává široká konfigurovatelnost a integrace.
- Temaro by nemělo hned kopírovat univerzálnost Reenia pro eventy/pronájmy/zámky, ale musí brát vážně SMS, platby, sync, doménu a exporty.

Zdroje: https://reenio.cz/, https://reenio.cz/cs/Home/Balicky, https://manual.reenio.cz/cs/napoveda/cenotvorba-a-platby/pokladna

#### Bookio

Základní/standardní nabídka:
- online rezervace 24/7,
- rezervace z webu, Facebooku, Googlu, Instagramu a dalších kanálů,
- rezervační kniha,
- kalendář,
- SMS/email potvrzení a připomínky,
- automatické potvrzení,
- přizpůsobení rezervačního formuláře,
- informace o zákaznících,
- detailní statistiky,
- zpětná vazba/hodnocení,
- vzdálený přístup,
- exporty,
- Google/iPhone kalendář,
- rezervace přes Facebook,
- databáze emailů.

Pokročilá výbava:
- online platby,
- zálohové platby,
- dárkové poukázky,
- permanentky,
- kupóny/slevy/akce,
- marketingové SMS/emaily,
- Google Tag Manager,
- Google reviews,
- lepší Google vyhledávání,
- waiting list,
- automatická upozornění pro náhradníky,
- opakované rezervace,
- skupinové rezervace,
- správa místností,
- mapa stolů,
- personalizace barev a loga,
- role pracovníků,
- hromadné SMS,
- měřicí kódy,
- VOP/GDPR souhlasy,
- PWA notifikace,
- flexibilní pracovní doby,
- prémiové/VIP termíny,
- vícejazyčný formulář,
- API a integrace,
- napojení na POS/PMS/Google/Facebook/channels.

Význam pro Temaro:
- Bookio je nejširší referenční systém pro „co všechno může booking platforma postupně být“.
- Pro Temaro je důležité nepřebrat šíři hned, ale převzít vrstvy: no-show ochrana, platby/zálohy, reviews, SEO/GEO, exporty a klientský kontext.

Zdroje: https://bookio.com/cs, https://www.bookio.com/cs/funkce

#### Reservine

Základní nabídka:
- online rezervační kalendář,
- nastavitelné ceníky,
- emailová upozornění,
- přehledný kalendář,
- Stripe a Tap to Pay terminály,
- vlastní rezervační stránka,
- online platby kartou,
- platby na místě,
- Apple Pay a Google Pay,
- slevové kódy,
- chat s klienty,
- statistiky a přehledy,
- SMS upozornění jako placený usage prvek,
- u specifických provozů propojení s chytrými zámky a SMS přístupové kódy.

Význam pro Temaro:
- Ukazuje modernější, jednodušší packaging: booking + platby + SMS + vlastní stránka.
- Pro samoobslužné provozy jsou přístupové kódy a chytré zámky specifický vertikální diferenciátor, ale mimo obecné MVP.

Zdroje: https://reservine.io/cs/pricing/, https://reservine.io/

#### ReservoBot

Základní nabídka:
- restaurant-first booking,
- založení podniku a stolů,
- vlastní rezervační stránka,
- neomezený počet rezervací,
- automatické potvrzení a připomínky,
- přehled stolů a obsazenosti,
- přístup pro více uživatelů,
- automatická komunikace emailem nebo SMS,
- statistiky/analýzy,
- flat jeden plán bez balíčků.

Význam pro Temaro:
- Velmi dobrý příklad vertikální jednoduchosti: jeden segment, jasná cena, jasný výsledek.
- Pro Temaro je z toho důležité „méně balíčků, více jasného výsledku“.

Zdroje: https://www.reservobot.com/, https://www.reservobot.cz/

### 11.2 Globální systémy

#### Calendly

Základní nabídka:
- booking link,
- jeden nebo více event typů podle plánu,
- calendar connection,
- confirmation emails,
- website embed,
- mobilní aplikace a browser extension,
- základní integrace.

Placená/team výbava:
- neomezené event typy,
- více napojených kalendářů pro conflict checking,
- workflows/reminders/follow-ups,
- custom emails,
- custom booking page,
- website embed customization,
- Stripe/PayPal payments,
- group events,
- collective events,
- team scheduling,
- round robin,
- routing forms,
- reporting,
- enterprise admin/security/integrace.

Význam pro Temaro:
- Calendly je benchmark jednoduchosti a booking-link UX.
- Pro službový booking je ale slabší v provozních věcech typu klientská historie, no-show score, služby/staff/provozovna.

Zdroj: https://help.calendly.com/hc/en-us/articles/8815568416535-Calendly-s-subscription-plans

#### Cal.com

Základní/standardní nabídka:
- scheduling infrastructure,
- booking links,
- workflows,
- routing,
- integrace přes app store,
- embed/API/developer přístup,
- open-source/self-host positioning,
- týmové routování/round-robin,
- platby přes integrace,
- vysoká customizace.

Význam pro Temaro:
- Cal.com je spíš infrastruktura a developer-friendly platforma než hotový lokální systém pro barber/salon.
- Zajímavé pro pozdější API/white-label/integration strategii, ne pro první MVP.

Zdroje: https://cal.com/about, https://cal.com/smart-routing

#### Fresha

Základní/standardní nabídka:
- salon/wellness booking,
- appointment calendar,
- online booking,
- automated reminders,
- klientské profily,
- forms před návštěvou,
- payments,
- deposits/prepayments,
- POS,
- retail/inventory,
- prodej služeb, produktů, memberships, packages, gift cards a add-ons,
- loyalty/rewards,
- marketing,
- marketplace/discovery,
- reviews,
- reporting,
- staff/performance management.

Význam pro Temaro:
- Fresha je globální benchmark pro beauty/wellness ekosystém.
- Temaro by nemělo hned stavět POS/inventory/marketplace, ale deposits, forms, reviews, memberships/packages a reporting jsou důležité fáze růstu.

Zdroje: https://www.fresha.com/for-business/features, https://www.fresha.com/for-business/features/point-of-sale

#### Booksy

Základní/standardní nabídka:
- booking pro salony/barbery,
- služba s popisem a vizuálními ukázkami,
- klientské reviews,
- klientská aplikace/marketplace,
- business app,
- SMS/email message blasts,
- marketing nástroje,
- online payments,
- gift cards,
- deposits,
- cancellation fees,
- revenue/cash-flow reporting,
- widgety a rychlý přístup na mobilu.

Význam pro Temaro:
- Booksy ukazuje sílu marketplace/reviews/discovery, ale zároveň riziko platformní závislosti a poplatků.
- Temaro může jít opačně: „vlastní klienti, vlastní značka, bez provize z marketplace“.

Zdroj: https://biz.booksy.com/en-us/features

#### SimplyBook.me

Základní/standardní nabídka:
- booking website,
- widget/integrace do vlastního webu,
- Facebook/Instagram/Google booking channels,
- client/admin app,
- WhatsApp/SMS/email notifications,
- payments a deposits přes Stripe/PayPal a další,
- onsite cash/card přes POS,
- custom emails,
- coupons/gift cards,
- tips,
- sale of products,
- memberships,
- classes/events,
- waiting list,
- loyalty system,
- HIPAA/SOAP zdravotnické funkce,
- intake forms,
- file uploader,
- packages,
- Google Reviews,
- tickets,
- API,
- QuickBooks/FreshBooks integrace a Xero exporty.

Význam pro Temaro:
- SimplyBook je důkaz, že „univerzální systém pro služby“ se rychle mění ve velmi široký modulární produkt.
- Temaro musí udržet jednoduchost, ale dlouhodobě potřebuje modulární vrstvy: intake forms, waitlist, packages, payments, reviews, účetní exporty.

Zdroje: https://simplybook.me/, https://simplybook.me/en/booking-system-features-and-integrations, https://simplybook.me/en/pricing/index/ref

#### Setmore

Základní/standardní nabídka:
- booking page,
- service menu,
- availability,
- reviews,
- all-in-one calendar,
- website plugin,
- Facebook/Instagram booking,
- QR codes,
- virtual meetings,
- branded app,
- automatic confirmations,
- email reminders,
- SMS reminders,
- recurring appointments,
- class booking,
- staff logins,
- calendar sync,
- iOS/Android/Desktop apps,
- integrations,
- secure online payments.

Význam pro Temaro:
- Setmore ukazuje, že QR kódy, social booking, website plugin a reminders jsou dnes běžná komunikační výbava, ne luxus.

Zdroj: https://www.setmore.com/features

#### Acuity Scheduling

Základní/standardní nabídka:
- online booking website,
- multi-location calendar management,
- payments, deposits and invoicing,
- automated appointment notifications,
- branded booking link,
- website embed,
- custom appointment types,
- client intake forms,
- email confirmations/updates/reminders,
- SMS reminders ve vyšších plánech,
- terms/cancellation policy acceptance,
- client reschedule/cancel,
- client profiles and notes,
- packages,
- recurring sessions,
- subscriptions,
- gift certificates,
- discount codes,
- add-ons,
- Stripe/Square/PayPal payments,
- card-on-file/deposits,
- cancellation policies,
- POS/tap-to-pay/payment links/card readers,
- tipping,
- Google Pay/Apple Pay,
- receipts,
- invoicing,
- staff management,
- availability controls,
- mobile app,
- class scheduling.

Význam pro Temaro:
- Acuity je velmi dobrý benchmark pro spojení rezervací a fakturace/plateb bez toho, aby produkt byl plné účetnictví.
- Pro Temaro z toho plyne: platby, deposit, cancellation policy, invoice/export až později.

Zdroj: https://acuityscheduling.com/features

#### Square Appointments

Základní/standardní nabídka:
- online booking,
- appointment calendar,
- client management,
- automated reminders,
- payments,
- POS napojený na Square ekosystém,
- staff management,
- retail/products podle Square ekosystému,
- sales/reporting,
- no-show/payment protection podle nastavení plateb.

Význam pro Temaro:
- Square ukazuje, že u globálních hráčů se booking často spojuje s POS, platbami a finančním reportingem.
- V ČR by podobnou vrstvu dávalo smysl řešit spíš integracemi než vlastním POS od začátku.

Zdroj: https://squareup.com/us/en/appointments

### 11.3 Normalizovaný společný základ trhu

Pokud se vezme česká i globální konkurence dohromady, společný baseline není jen „rezervace“. Trh už očekává tyto vrstvy:

1. **Online booking 24/7**: veřejná booking stránka, link, mobilní flow, výběr služby, času a poskytovatele.
2. **Admin kalendář**: den/týden, manuální rezervace, změny stavu, filtrování, přehled vytíženosti.
3. **Služby a kapacita**: délka, cena, pracovní doba, výjimky, buffer, kapacity/stoly/místnosti podle segmentu.
4. **Zaměstnanci a role**: staff profily, vlastní kalendáře, oprávnění, notifikace zaměstnancům.
5. **Klienti/CRM lite**: databáze klientů, historie, poznámky, preference, štítky, flag/no-show.
6. **Notifikace**: email potvrzení, email reminder, SMS reminder, často i SMS/email marketing.
7. **Self-service klienta**: potvrzení, zrušení, přesun, manage link, cancellation policy.
8. **Platby a no-show ochrana**: online platba, záloha, storno poplatek, card-on-file, payment status.
9. **Branding a kanály**: logo, barvy, vlastní booking stránka, vlastní doména, embed/widget, QR, Instagram/Facebook/Google.
10. **Reporting**: obsazenost, tržby, vytíženost služeb/staff, zdroje rezervací, no-show rate.
11. **Exporty a integrace**: CSV/export, Google/Outlook/iCal sync, API, účetní exporty, marketing/tracking integrace.
12. **Obchodní rozšíření**: vouchery, permanentky, kredity, balíčky, memberships, kupóny, slevy.
13. **Reputace a růst**: reviews, Google reviews, feedback po návštěvě, referral/loyalty.
14. **Pokladna/POS**: u části konkurence evidence plateb, prodej produktů, POS, inventář a doklady.
15. **Segmentové moduly**: waitlist, skupinové rezervace, kurzy, místnosti/stoly, intake forms, soubory, zdravotnické formuláře.

### 11.4 Co z toho už Temaro má

Temaro už pokrývá:
- registraci podniku,
- owner/staff role,
- služby,
- zaměstnance,
- pracovní dobu a výjimky,
- veřejný booking link,
- výběr služby, zaměstnance a termínu,
- anti-double-booking jádro,
- admin kalendář,
- manuální rezervace,
- klientskou databázi,
- historii klienta,
- interní poznámky,
- flag/no-show,
- email potvrzení,
- email reminder,
- self-service přesun/zrušení,
- základní dashboard/statistiky,
- bezpečnou tenant izolaci.

Temaro zatím nemá proti baseline trhu:
- SMS reminders,
- online platby,
- zálohy/deposits,
- payment status u rezervace,
- jednoduchou pokladní evidenci,
- fakturu/doklad/export pro účetní,
- Google/Outlook/iCal sync,
- widget/embed,
- QR booking link,
- tenant branding public booking,
- custom doménu,
- custom email/SMS texty,
- waitlist,
- reviews/feedback,
- vouchery/permanentky/kredity,
- packages/memberships,
- skupinové rezervace/kurzy,
- intake/custom formuláře,
- pokročilý reporting,
- marketing/tracking integrace,
- API.

### 11.5 Prioritní závěr pro roadmapu

Z pohledu „co konkurence běžně má“ je nejbližší realistické pořadí:

1. SMS reminders.
2. Payment status u rezervace.
3. Stripe záloha/deposit.
4. Tenant branding public booking.
5. QR booking link a jednoduchý share kit.
6. iCal export, pak Google Calendar sync.
7. Widget/embed.
8. Export rezervací/plateb pro účetní.
9. Waitlist.
10. Reviews/feedback po dokončené návštěvě.

Tohle je minimální cesta, aby Temaro nepůsobilo vedle konkurence jako „jen booking formulář“, ale současně se nerozpadlo na příliš široký enterprise produkt.
