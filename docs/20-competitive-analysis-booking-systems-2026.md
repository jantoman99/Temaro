# 20 – Hloubková konkurenční analýza rezervačních systémů

Datum: 2026-05-08  
Produkt: Temaro  
Scope: Salona detailně, české a globální rezervační systémy pro služby, beauty, wellness a malé lokální provozy.
Rozhodnutí 2026-05-08: všechny významné konkurenční funkce jsou zařazené do pre-launch MVP scope. Rozdíl proti předchozímu doporučení je v pořadí, ne ve vyřazení.

## 0. Metodika a omezení

Analýza vychází z veřejně dostupných webů, ceníků, nápověd a obchodních podmínek konkurence. Nejde o hands-on audit interních administrací, takže některé funkce jsou brané jako `deklarované`, ne prakticky ověřené. U systémů typu Olma/Salonio je potřeba být opatrnější: některé claimy působí jako early-stage marketing nebo beta landing, ne jako prokazatelně masově ověřený produkt.

Záměr není slepě přidat všechno najednou. Cíl je rozhodnout, které funkce stavět dřív a které později tak, aby Temaro mělo před spuštěním kompletní konkurenční výbavu bez rozbití bezpečnosti, jednoduchosti a architektury.

## 1. Exekutivní závěr

Trh se dělí do čtyř vrstev:

1. **Booking core**: online rezervace, kalendář, služby, tým, pracovní doba, klienti, email/SMS připomínky. To mají prakticky všichni relevantní hráči.
2. **Salon business suite**: POS/pokladna, platby, zálohy, účtenky, sklad, tržby, směny, provize, reporty. Tady je Salona, Reservanto, Fresha, Booksy a částečně myFox výrazně dál než Temaro.
3. **Growth/discovery vrstva**: marketplace, recenze, Google booking, katalog, SEO profil, referral, kampaně, Last Minute nabídky. Tady jsou silní Notino Partner, Booksy, Fresha, Salona, Bookio, Olma/Salonio claimy.
4. **Retention/no-show vrstva**: SMS, zálohy, card-on-file, cancellation fees, waitlist, trusted clients, follow-upy, věrnost, vouchery. Tady je největší produktová příležitost pro Temaro.

Temaro už má slušné MVP jádro a oproti části trhu silný technický základ: tenant izolace, bezpečné server actions, auditní přístup, veřejný booking, klientská historie, interní poznámky, no-show/flag, self-service manage link, iCal, zálohový základ, evidence plateb, CSV export, custom texty a onboarding podle oboru.

Největší praktické gapy před placeným pilotem:

- reálný SMS provider,
- živé online zálohy/platby,
- waitlist,
- lepší zákaznický účet se změnou/zrušením rezervace,
- plný Google sync,
- iframe/widget,
- review request,
- tržby podle služby/staff,
- zdroje rezervací a UTM,
- výraznější import/migrace dat.

Největší strategická příležitost:

**Temaro nemá být “další Reservio”. Má být anti-no-show a client-memory systém pro malé lokální služby, který chrání čas a vlastní klientelu podniku bez marketplace závislosti.**

## 2. Detailní analýza: Salona

Zdroj: [salona.cz/business/features](https://salona.cz/business/features), [salona.cz/business/pricing](https://salona.cz/business/pricing), [Salona obchodní podmínky PDF](https://salona.cz/documents/Salona-Obchodni_podminky.pdf), [Salona připomínky](https://salona.cz/business/features/reminders), [Salona klienti](https://salona.cz/business/features/clients), oborové stránky Salony pro kadeřnictví, barbershopy, kosmetiku a masáže.

### Positioning

Salona se staví jako levný, moderní rezervační systém pro salony. Nesnaží se být univerzální pro všechny obory jako Reenio nebo Bookio. Komunikuje hlavně:

- jednoduchost,
- cenu,
- salony/beauty segment,
- SMS připomínky,
- mobilní aplikaci,
- tým/provoz,
- pokladnu a tržby,
- přivedení nových zákazníků.

Silný claim: `nejlevnější řešení pro váš salon`, `měsíc zdarma`, `neomezené rezervace`, `SMS zdarma` nebo levné SMS podle konkrétní stránky.

### Ceník a cenová logika

Veřejná pricing page uvádí:

- Salona Pro při roční platbě: 247 Kč / měsíc,
- další člen týmu: 82 Kč / měsíc,
- neomezený počet rezervací,
- databáze zákazníků,
- správa rezervací a týmu,
- osobní podpora 24/7,
- první měsíc zdarma,
- platební karta není vyžadována.

Obchodní podmínky v příloze ceníku uvádí:

- webový profil salonu zdarma,
- Salona Pro měsíčně 329 Kč / měsíc pro jednu osobu,
- Salona Pro ročně 247 Kč / měsíc při jednorázové platbě,
- další profesionál 82 Kč / měsíc,
- SMS připomínky zdarma,
- zprostředkování rezervace zdarma,
- nafocení salonu zdarma k ročnímu plánu,
- individuální školení/onboarding zdarma k Salona Pro Team,
- referral program: doporučitel 1 000 Kč, doporučený salon 3 měsíce Salona Pro zdarma.

Pozor: různé stránky Salony uvádějí rozdílné SMS informace. Pricing page komunikuje SMS zdarma, některé oborové stránky ukazují `SMS služby: 0,99 Kč / SMS` a srovnávací tabulky uvádějí cenu SMS v neomezeném množství. Pro Temaro je to důležité: konkurent má silnou SMS komunikaci, ale cenové vnímání může být nejasné.

### Funkce Salony podle veřejných zdrojů

Booking a kalendář:

- online rezervace,
- přehledný rezervační kalendář,
- flexibilní zobrazení,
- týmový rozvrh,
- blokace volna a pauzy,
- rychlé akce,
- duplikace,
- Google Kalendář,
- drag & drop,
- hromadné rušení rezervací,
- delší termíny pro tattoo/fyzio podle oborové komunikace.

Tým:

- plánování směn,
- individuální směny,
- role a oprávnění,
- profil profesionála,
- výkon týmu,
- osobní i celkový přehled,
- otevírací doba salonu,
- různé ceny a délky služeb podle člena týmu.

Klienti:

- databáze zákazníků,
- karta zákazníka,
- historie návštěv,
- preference,
- důležité osobní poznámky,
- poznámky k rezervaci,
- informace o nedostavení,
- import zákazníků při přechodu.

SMS/email:

- automatická SMS 24 hodin předem,
- potvrzení rezervace e-mailem,
- personalizace textu SMS,
- oznámení o změně termínu,
- oznámení o rušení termínu včetně důvodu,
- notifikace nové rezervace v aplikaci / na chytrých hodinkách,
- digitální účtenka e-mailem.

Pokladna/POS:

- chytrá pokladna,
- skladové zásoby,
- různé metody platby,
- účtenky a tržby,
- fakturační subjekty a IČO,
- platební terminály,
- propojení se SumUp,
- platby hotově/kartou/voucherem a podle oborové stránky “brzy QR kódem”,
- spropitné,
- účetní podklady.

Reporting:

- výkon týmu,
- přehled tržeb,
- výdělky jednotlivců i týmu,
- vývoj a růst zákazníků,
- kompletní výkon celého týmu.

Growth:

- veřejné vyhledání salonu,
- uživatelské účty pro zákazníky,
- sociální login zákazníka Google/Facebook/Apple,
- oborové landing pages pro kadeřnictví, barbershopy, kosmetiku, nehty, masáže, fyzio, jógu, tattoo,
- referral program,
- Salona Jobs v obchodních podmínkách.

### Salona proti Temaru

Salona je silnější v:

- reálné mobilní aplikaci,
- SMS positioning a automatické SMS,
- pokladně/POS,
- účtenkách a účetních podkladech,
- skladových zásobách,
- platebních terminálech,
- spropitném,
- týmových směnách a výkonu,
- referral programu,
- zákaznické registraci přes více sociálních providerů,
- veřejném marketplace/discovery,
- oborových landing pages šířkou.

Temaro je silnější nebo může být silnější v:

- bezpečnostním návrhu a tenant izolaci od začátku,
- čistém anti-marketplace positioningu,
- self-service manage linku bez nutnosti zákaznického účtu,
- jasné auditovatelnosti DB migrací a RLS,
- no-show/client-memory směru,
- modernějším vlastním booking brandingu bez marketplace závislosti,
- možnosti rychleji iterovat přes úzký český hair/beauty/wellness segment.

Co Salona podle veřejného webu nekomunikuje dostatečně:

- detailní pravidla pro online zálohy/deposits a cancellation fees jako Booksy/Fresha,
- waitlist,
- prediktivní no-show risk,
- přímé ownership/data portability positioning,
- transparentní TCO kalkulačku včetně SMS/plateb/terminálu/týmu,
- kvalitní product trust audit typu “otestujte konflikty a sync před podpisem”.

## 3. Přehled dalších systémů

### Notino Partner

Zdroj: [partner.notino.cz](https://partner.notino.cz/)

Silné body:

- zdarma pro salony,
- Notino marketplace/app/web viditelnost,
- chytrý kalendář,
- služby, pauzy a tým,
- správa klientů,
- poznámky, historie návštěv a fotografie,
- věrnostní program,
- mobilní aplikace,
- automatické připomínky e-mail/SMS/push,
- waitlist/čekárna,
- recenze a fotografie práce,
- 8 000+ salonů, 380 000+ klientů, 1,5M+ rezervací podle webu,
- import z předchozího systému,
- Google/Outlook sync,
- Blacklist,
- profi focení, komunita, odměny, 5% provize z nákupů.

Interpretace:

Notino Partner je nejnebezpečnější hráč v discovery. Umí nabídnout “zdarma” díky širšímu ekosystému Notina. Temaro nemůže soutěžit cenou nula proti Notinu, musí soutěžit vlastnictvím klienta, jednoduchostí, bez platformové závislosti a provozní specializací.

### Reservio

Zdroj: [reservio.com/pricing](https://www.reservio.com/pricing)

Silné body:

- známý brand,
- free plán,
- booking website,
- web/iOS/Android app,
- email booking messages,
- attendance tracking,
- SMS reminders add-on,
- Google/iCal/Outlook sync,
- statistiky,
- print/export,
- custom domain,
- custom booking messages,
- staff notifications,
- booking website design,
- credit pass, visit pass, membership,
- unlimited bookings v Pro,
- multi-level access a permissions,
- odstranění brandu,
- API,
- online payments a payment fees.

Slabiny jako příležitost:

- limity rezervací u nižších plánů,
- SMS jako add-on/kredity,
- může působit obecně a méně segmentově,
- pricing psychologicky komplexnější.

### Reservanto

Zdroj: [reservanto.cz/cenik](https://reservanto.cz/cenik), [reservanto.cz/vlastnosti](https://reservanto.cz/vlastnosti)

Silné body:

- český lokální systém,
- SMS připomínky,
- podmíněné zprávy,
- přání k narozeninám,
- VIP automatizace,
- oslovení klientů, kteří dlouho nepřišli,
- kompletní historie a reporty,
- dotazníky spokojenosti,
- vouchery přes e-shop,
- kredity/permanentky,
- sklad,
- POS Poska,
- QR odbavení,
- platební terminál,
- online platby,
- editor šablon e-mail/SMS s podmínkami,
- vlastní údaje u zákazníka i rezervace,
- API,
- pluginové úpravy,
- Google kalendář obousměrně podle ceníku.

Interpretace:

Reservanto je výrazně dál v provozní hloubce. Pro Temaro je vhodné převzít ne celý POS/sklad svět, ale hlavně:

- podmíněné zprávy,
- VIP/no-show segmentaci,
- review/dotazníky,
- vouchery až později,
- jednoduché účetní exporty.

### Reenio

Zdroj: [reenio.cz balíčky](https://reenio.cz/cs/Home/Balicky), veřejné manuály Reenio.

Silné body:

- univerzální rezervace pro služby, sport, události, pronájmy, kulturu,
- email/SMS,
- Google/Outlook sync,
- online platby,
- vícejazyčné rezervační stránky,
- vlastní doména,
- API,
- poukazy,
- vlastní zprávy/e-maily,
- pokladna,
- QR/čárové kódy,
- mobilní aplikace,
- GoPay integrace,
- role,
- vysoké limity rezervací v prémiových plánech.

Interpretace:

Reenio je široké. Temaro se nemá rozředit do událostí, zámků a vstupenek, ale některé provozní prvky jsou validní: vlastní doména, custom zprávy, platby, sync, QR check-in až později.

### Bookio

Zdroj: [bookio.com/cs](https://www.bookio.com/cs), [Bookio Booking via Google](https://bookio.com/en/functions/reservation-via-google), [services.bookio.com/features](https://services.bookio.com/features?lang=cs)

Silné body:

- rezervační kniha,
- kalendář/scheduler,
- 24/7 rezervace,
- komentáře,
- special events,
- placené rezervace,
- dárkové poukazy,
- reporty,
- klientské informace,
- feedback,
- remote access,
- bezpečná archivace,
- room management,
- group bookings,
- Google/iPhone Calendar,
- SMS/e-mail připomínky,
- Google Tag Manager,
- Google reviews,
- Booking přes Google Maps/Search/Assistant,
- API,
- široké obory včetně beauty, zdravotnictví, gastro, sport, auto, vzdělávání.

Interpretace:

Bookio je silné v Google/discovery a v univerzálnosti. Temaro by mělo vzít:

- Google review request,
- zdroje rezervací/UTM,
- Google Business Profile / booking CTA směr,
- group bookings jen pokud půjdeme do jógy/fitness.

### Booqme

Zdroj: [booqme.cz/cs/cenik](https://booqme.cz/cs/cenik)

Silné body:

- cenové plány od Lite/Business/Ultimate,
- neomezení uživatelé a zákazníci ve vyšších plánech,
- vlastní logo/styl formuláře,
- email upozornění,
- hodnocení zákazníků,
- databáze zákazníků,
- štítkování,
- fotografie ke službám,
- white/black list,
- statistiky,
- vlastní styl e-mailů,
- čekací listina,
- API,
- SMS upozornění a vlastní texty SMS,
- vlastní pole ve formuláři,
- import/export zákazníků,
- předplacený kredit,
- skupinové služby,
- podkategorie,
- párové služby,
- historie rezervací,
- opakované blokace/rezervace,
- místnosti,
- Google/Apple/Outlook sync,
- Google recenze,
- Google Tag Manager,
- platby a zálohy,
- dárkové poukazy.

Interpretace:

Booqme ukazuje, že i menší středoevropský hráč má waitlist, API, custom fields, blacklist, credits, recurring bookings, rooms, reviews a deposits. To posouvá očekávání trhu nad prostý booking kalendář.

### Fresha

Zdroj: [fresha.com/for-business/features](https://www.fresha.com/for-business/features), [fresha.com/pricing](https://www.fresha.com/pricing)

Silné body:

- scheduling/calendar,
- team/resources,
- online bookings,
- client booking app,
- direct links,
- Facebook/Instagram/Google bookings,
- Fresha marketplace,
- payments online i in-store,
- deposits/upfront payments,
- cancellation policies,
- saved cards,
- payment terminals,
- POS,
- products, memberships, packages, gift cards, add-ons,
- tips, split payments, partial payments,
- refunds,
- inventory,
- marketing campaigns,
- client ratings/reviews,
- Google Rating Boost,
- data connector/reporting,
- marketplace new-client fee 20 % podle pricing page,
- SMS/e-mail reminders allowance a pay-as-you-go nad limit.

Interpretace:

Fresha je kompletní business suite. Temaro by se nemělo pokoušet Fresha kopírovat před spuštěním. Nejvíce relevantní jsou:

- deposits a cancellation policy,
- reviews/Google Rating Boost,
- saved cards/card-on-file až později,
- direct social booking links,
- reporting,
- jasná komunikace bez marketplace provize.

### Booksy

Zdroj: [Booksy features](https://biz.booksy.com/en-us/features), [Booksy no-show protection](https://biz.booksy.com/en-us/features/no-show-protection), [Booksy deposits help](https://support.booksy.com/hc/en-us/articles/16487324704658-How-can-I-accept-deposits-for-appointments-booked-by-my-clients)

Silné body:

- Booksy Profile,
- marketplace,
- team management,
- online booking,
- customer app,
- marketing tools,
- calendar/scheduling,
- client management,
- no-show protection,
- payments,
- tap to pay,
- card reader,
- Boost,
- stats/reports,
- loyalty cards,
- service listings + photos,
- client reviews,
- portfolio,
- mobile payments,
- gift cards,
- memberships,
- packages,
- loyalty stamp cards,
- permissions,
- staff profiles,
- shifts/time off,
- commissions,
- resources,
- inventory,
- shared location,
- client app,
- deposits and cancellation fees,
- card-on-file,
- trusted clients,
- waitlists,
- message blasts.

Interpretace:

Booksy má nejvyspělejší no-show marketing z analyzovaných systémů. Temaro by mělo převzít principy:

- deposit rules per service,
- cancellation policy per service/tenant,
- trusted clients,
- waitlist,
- message blast na uvolněný termín,
- automatické/no-manual-chasing payment collection.

### Salonio

Zdroj: [salonio.cz](https://salonio.cz/)

Silné body podle webu:

- online rezervace,
- klienti, kalendář a marketing,
- sklad,
- Last Minute algoritmus,
- detekce volného času,
- nabídka klientům přes SMS/e-mail se slevou,
- síť salonů a doporučení partnera v okolí,
- provize za doporučení,
- data klientů vlastní salon,
- šifrování a denní zálohy,
- GDPR,
- setup + měsíční tarify,
- web/landing page a Gmail ve vyšších tarifech,
- marketingová vrstva,
- městská exkluzivita / top místa.

Interpretace:

Salonio je zajímavé hlavně positioningem: “digitální provozní ředitel”, Last Minute zaplňování, síť salonů a vlastnictví klientů. Některé claimy je nutné brát s rezervou, ale směr je produktově silný.

Temaro může převzít:

- Empty slot recovery,
- Last Minute kampaně,
- “klienti patří salonu” messaging,
- měření vytížení kapacity.

### Olma

Zdroj: [system-olma.app](https://www.system-olma.app/)

Silné body podle webu:

- chytrý kalendář,
- drag & drop,
- detekce kolizí,
- opakované rezervace,
- realtime sync mezi zařízeními,
- klienti s historií, preferencemi a GDPR souhlasy,
- věrnostní program,
- marketplace s geolokací,
- recenze,
- analytika,
- CSV export,
- Google/Apple Calendar sync,
- iCal export,
- SMS, push, WhatsApp Business,
- automatické follow-upy,
- waitlist,
- vouchery/dárkové karty,
- offline režim,
- web na míru,
- widget,
- 0 % provize.

Interpretace:

Olma přesně ukazuje, jak může vypadat “Temaro s rozšířeným scope” v marketingu. Potřeba opatrnosti: claimy jsou velmi široké a beta/apk/TestFlight komunikace značí early-stage. Nicméně jako benchmark seznamu funkcí je užitečná.

### myFox

Zdroj: [myfox.one/cs/funkce-rezervacniho-systemu-10-tipu](https://www.myfox.one/cs/funkce-rezervacniho-systemu-10-tipu/), [myfox.one/cs](https://www.myfox.one/cs/)

Silné body:

- přesun rezervace bez rušení,
- automatická kontrola překryvů,
- nepřítomnost automaticky zruší rezervace,
- email/SMS omluva,
- automatické vrácení kaucí,
- individuální pracovní doby včetně lichých/sudých týdnů,
- sync s Google/iPhone kalendářem,
- vlastní poznámky v e-mailech podle kategorie/služby,
- povinná poznámka v online rezervaci,
- více provozoven,
- kauce v pokladně,
- mobilní aplikace,
- tisk účtenek,
- web s vlastním menu,
- statistiky, sklad, pokladna, web.

Interpretace:

myFox má velmi praktické provozní detaily. Temaro by mělo převzít:

- povinné doplňující otázky/poznámky podle služby,
- nepřítomnost → hromadné zrušení/přesun + zprávy,
- lepší zálohový ledger,
- liché/sudé týdny a složitější směny až podle pilotů.

### SimplyBook.me

Zdroj: [SimplyBook.me features](https://simplybook.me/booking-system-features), [SimplyBook.me pricing](https://simplybook.me/en/pricing/index/ref)

Silné body:

- obecný booking pro služby,
- booking website,
- services/categories,
- providers,
- classes/events,
- group bookings,
- membership,
- products for sale,
- on-site payments/POS,
- deposits,
- gift cards,
- packages,
- loyalty,
- waiting list,
- intake forms/file upload/SOAP/HIPAA podle širší nabídky,
- invoices,
- custom emails,
- client login,
- recurring services,
- Stripe payments,
- Google Reviews,
- custom features model.

Interpretace:

SimplyBook.me je extrémně široký modulární benchmark. Pro Temaro je důležitý hlavně princip opt-in modulů: core zůstane jednoduchý, pokročilé funkce se zapínají podle potřeby.

## 4. Funkční matrice

Legenda:

- `H` = Temaro hotovo nebo funkční základ.
- `Z` = základ hotový, ale produkční vrstva chybí.
- `G` = gap vůči trhu.
- `P` = plánovat / priorita.

| Oblast | Salona | Notino | Reservio | Reservanto | Booksy/Fresha | Temaro |
|---|---|---|---|---|---|---|
| Online booking 24/7 | Ano | Ano | Ano | Ano | Ano | H |
| Booking link/profil | Ano | Ano | Ano | Ano | Ano | H |
| Vlastní branding | Částečně | Marketplace styl | Ano ve vyšších | Ano | Ano | H |
| Vlastní doména | Nejasné | Ne | Standard Reservio | Ano u některých | Ne primárně | G/P1 |
| Kalendář den/týden | Ano | Ano | Ano | Ano | Ano | H |
| Drag/drop | Ano | Nejasné | Ano/pravděpodobně | Nejasné | Ano | H pro create, přesun později |
| Tým/staff | Ano | Ano | Ano | Ano | Ano | H |
| Směny | Ano | Ano | Ano | Ano | Ano | Z |
| Role/oprávnění | Ano | Ano | Pro/enterprise | Ano | Ano | H základ, P1 granularita |
| Služby/ceny/délky | Ano | Ano | Ano | Ano | Ano | H |
| Cena/délka podle člena týmu | Ano | Nejasné | Nejasné | Ano | Ano | G/P1 |
| Buffer | Pravděpodobně | Nejasné | Ano | Ano | Ano | H |
| Klienti/databáze | Ano | Ano | Ano | Ano | Ano | H |
| Klientská historie | Ano | Ano | Ano | Ano | Ano | H |
| Poznámky/preference | Ano | Ano + fotky | Ano | Ano | Ano | H základ, P1 preference |
| Fotky/portfolio klienta | Nejasné | Ano | Nejasné | Nejasné | Ano | G/P2 |
| No-show tracking | Ano | Nejasné | Attendance | Nejasné | Ano | H |
| SMS reminders | Ano | Ano | Add-on | Ano | Ano | Z, provider chybí |
| Email reminders | Ano | Ano | Ano | Ano | Ano | H |
| Custom SMS/email | Ano SMS | Nejasné | Ano vyšší | Ano pokročilé | Ano | H custom texty, P1 podmíněné |
| Push notifikace | Ano app | Ano | Ano app | Nejasné | Ano | G/P2 |
| Online platby | Terminál/POS | Nejasné | Ano | Ano | Ano | G/P0/P1 |
| Zálohy/deposits | Nejasné | Nejasné | Ano/platby | Ano | Ano silně | Z, živá platba chybí |
| Cancellation fees/card-on-file | Nejasné | Nejasné | Nejasné | Nejasné | Ano | G/P1 |
| Pokladna/POS | Ano | Nejasné | Ano | Ano Poska | Ano | Z evidence, P1/P2 POS ne |
| Účtenky | Ano | Nejasné | Ano | Ano | Ano | G/P1/P2 |
| Faktury/účetní podklady | Ano | Nejasné | Ano | Ano | Částečně | Z CSV, P2 doklady |
| Sklad/inventory | Ano | Nejasné | Ano | Ano | Ano | G/P2 |
| Spropitné | Ano | Nejasné | Nejasné | Nejasné | Ano | G/P2 |
| Reporty/tržby | Ano | Ano | Ano | Ano | Ano | Z |
| Výkon zaměstnanců/provize | Ano | Nejasné | Ano | Ano | Ano | G/P1 |
| Waitlist | Nejasné | Ano | Nejasné | Nejasné | Ano | G/P0/P1 |
| Message blasts / Last Minute | Nejasné | Nejasné | Marketing | Ano | Ano | G/P1 |
| Vouchery | Nejasné | Nejasné | Passes | Ano | Ano | G/P2 |
| Permanentky/kredity/memberships | Nejasné | Nejasné | Ano | Ano | Ano | G/P2 |
| Loyalty | Nejasné | Ano | Ano | Ano | Ano | G/P2 |
| Reviews | Nejasné | Ano | Nejasné | Dotazníky | Ano | Z review URL, P1 request |
| Marketplace/katalog | Ano | Ano silně | Ano | Ne primárně | Ano | Z první katalog |
| Geolokace/vzdálenost | Nejasné | Ano marketplace | Ano marketplace | Nejasné | Ano | G/P1/P2 |
| Google booking | Nejasné | Notino app/web | Nejasné | Nejasné | Fresha ano | G/P2 |
| Google review boost/request | Nejasné | Recenze | Nejasné | Dotazníky | Fresha/Bookio | Z review URL, P1 automation |
| Widget/iframe | Web/link | Notino | Ano | Ano | Ano | Z button, P1 iframe |
| Mobilní app admin | Ano | Ano | Ano | Nejasné | Ano | G/P2 |
| Zákaznická app | Ano | Ano | Ano | Ano | Ano | Z `/account` web |
| Import dat | Ano klienti | Ano | Ano | Nejasné | Ano | G/P0/P1 |
| API | Nejasné | Nejasné | Pro | Ano | Nejasné | G/P2 |
| Více poboček | Nejasné | Síť | Pro/enterprise | Ano | Ano | G/pre-launch |

## 5. Co nabízí skoro všichni

Toto je tržní minimum. Bez těchto věcí produkt nepůsobí jako plnohodnotný rezervační systém:

- online rezervace 24/7,
- veřejný booking link/profil,
- služby, ceny, délky,
- zaměstnanci/poskytovatelé,
- pracovní doba a blokace,
- kalendář,
- ruční vytvoření rezervace,
- klientská databáze,
- historie rezervací,
- email potvrzení,
- připomínky termínu,
- mobilně použitelný booking,
- základní reporting,
- zrušení/přesun rezervace,
- nějaká forma brandingu,
- bezpečné ukládání kontaktů klienta,
- stránka/profil, který lze sdílet na webu, Instagramu a Google profilu.

Temaro většinu core minima má. Největší chybějící minimum pro placený pilot je reálná SMS a živé platby/zálohy.

## 6. Co mají jen někteří a je to prodejně silné

### Anti-no-show a závazek klienta

Mají silně: Booksy, Fresha, Booqme, částečně Reservio/Reservanto.  
Temaro stav: no-show counter, flag, reminder, self-service, zálohový základ, evidence plateb.

Chybí:

- online platba zálohy,
- card-on-file,
- cancellation fee,
- trusted client výjimka,
- pravidla podle služby/klienta,
- reconfirmation flow,
- waitlist na uvolněné termíny.

### Waitlist / čekací listina

Mají: Notino, Booksy, Booqme, Fresha/Olma claim.  
Temaro: chybí.

Tohle je P0/P1, protože přímo řeší prázdné termíny a no-show recovery.

### POS/pokladna/sklad/účtenky

Mají: Salona, Reservanto, Fresha, Booksy, myFox, Reservio.  
Temaro: evidence plateb a CSV export, ne POS.

Nedělat celé POS před pilotem. Stačí:

- stav zaplaceno/nezaplaceno,
- záloha/doplatek,
- export,
- jednoduché “tržby podle služby/staff”.

### Marketplace/discovery

Mají: Notino, Booksy, Fresha, Salona, Reservio, Olma claim.  
Temaro: první `/podniky`.

Tady je strategická otázka. Marketplace umí přivést klienty, ale může vytvořit platformovou závislost. Temaro by mělo jít cestou:

- katalog bez provize,
- profil bez uzamčení klienta,
- SEO/GEO/AEO,
- mapový a lokální discovery základ,
- “vlastní klienti, vlastní značka”.

### Reviews/reputace

Mají: Notino, Booksy, Fresha, Bookio, Booqme, Reservanto dotazníky.  
Temaro: review URL pole.

Další krok:

- po dokončení návštěvy poslat review request,
- Google review link,
- interní satisfaction pulse,
- ne veřejné review wall hned.

### Zprávy a marketing

Mají: Reservanto, Booksy, Fresha, Salonio claim, Olma claim.  
Temaro: custom texty potvrzení/reminder/zrušení.

Další krok:

- podmíněné zprávy podle služby,
- message blast na uvolněný termín,
- segment klientů “dlouho nepřišel”,
- narozeniny až později.

### Import/migrace

Mají: Salona klientský import, Notino import, Fresha data migration.  
Temaro: chybí produktově.

Pro pilot je to důležité. Ruční přepis klientů a služeb je friction.

## 7. Co podle analýzy neřeší nikdo dost dobře

Toto jsou strategické diferenciace Temara. Po rozhodnutí 2026-05-08 nejsou jen inspirace; mají být zapsané ve scope jako produktový směr, i když se implementují postupně po vlnách.

### 1. Transparentní no-show operating system

Konkurence má reminders, deposits, cancellation fees, waitlist. Nikdo to ale nekomunikuje jako ucelený systém:

- riziko klienta,
- doporučená politika podle služby,
- progresivní pravidla pro nové/opakované no-show klienty,
- trusted/VIP výjimky,
- reconfirmation,
- automatická náhrada termínu z waitlistu,
- přehled “zachráněné hodiny / zachráněné peníze”.

Temaro příležitost:

**Anti-no-show engine** jako hlavní produktový modul.

### 2. Skutečný “client ownership” bez marketplace daně

Marketplace hráči přivedou klienta, ale často drží vztah v appce/platformě. Někteří komunikují “klienti patří salonu”, ale málokdo to dokazuje funkcemi:

- export klientů jedním klikem,
- jasný datový ownership pledge,
- žádná provize z vlastních klientů,
- žádné přesměrování zákazníka ke konkurenci,
- vlastní značka v popředí,
- přenositelná reputace/review strategie.

Temaro příležitost:

**Vaši klienti zůstávají vaši. Temaro jen chrání provoz.**

### 3. Failure-case onboarding před podpisem

Všichni ukazují hezký kalendář. Nikdo nenutí nový salon projít stresové situace:

- dva klienti ve stejný čas,
- nemoc zaměstnance,
- zrušení 10 rezervací,
- klient chce změnit termín,
- záloha se má vrátit/propadnout,
- Google sync konflikt,
- SMS nedorazila,
- zaměstnanec odešel a klienti zůstávají salonu.

Temaro příležitost:

Interaktivní “provozní zkouška” v onboarding checklistu.

### 4. Cena vlastnictví bez mlhy

Ceníky konkurence jsou často rozpadlé na měsíční plán, SMS, platební poplatky, marketplace provize, další zaměstnance, terminály, setup, web, add-ony.

Temaro příležitost:

Transparentní TCO kalkulačka:

- počet zaměstnanců,
- počet SMS,
- počet online záloh,
- očekávané no-show,
- marketplace provize konkurence,
- ušetřené telefonáty,
- výsledná cena za měsíc.

### 5. Empty-slot recovery bez marketplace přetahování klientů

Salonio/Booksy částečně řeší Last Minute / message blasts / waitlist. Nikdo ale neukazuje jednoduchý vlastní kanál:

- klienti, kteří chtěli dřívější termín,
- klienti, kteří dlouho nepřišli,
- VIP klienti,
- Instagram story text jedním klikem,
- SMS jen vybrané skupině,
- měření obsazení uvolněných slotů.

Temaro příležitost:

“Zrušil se termín? Temaro ho zkusí zaplnit z vašich klientů, ne z cizího marketplace.”

### 6. Důvěryhodná migrace z konkurence

Salona/Notino/Fresha komunikují import, ale málokdo má veřejný checklist:

- import služeb,
- import klientů,
- import poznámek,
- import budoucích rezervací,
- test booking flow,
- paralelní provoz,
- přepnutí linků,
- rollback.

Temaro příležitost:

“Přechod za jeden večer” jako produktový flow.

### 7. Provozní doporučení, ne jen pasivní reporting

Konkurence často ukazuje statistiky, ale méně často říká, co má podnik udělat dál.

Temaro příležitost:

- “tato služba má vysoké no-show, zapni zálohu”,
- “tento čas bývá prázdný, nabídni Last Minute”,
- “tento klient často ruší, vyžaduj potvrzení”,
- “tento zaměstnanec má nízkou obsazenost v úterý”,
- “tento zdroj rezervací má nejlepší konverzi”.

### 8. Segmentový setup celého podnikání

Konkurence často umí kategorie služeb, ale méně často pomáhá nastavit celý provoz podle segmentu.

Temaro příležitost:

- hair/barber setup,
- beauty/kosmetika setup,
- nails/lashes/brows setup,
- masáže/wellness setup,
- private fitness/fyzio setup,
- doporučené služby, délky, zálohy, storno pravidla, otázky před návštěvou, texty zpráv a reporting metriky.

### 9. Trust audit jako prodejní argument

Malé podniky často nevědí, jestli systém opravdu ochrání data a provoz. Konkurence běžně ukazuje GDPR claimy, ale ne praktický auditový průchod.

Temaro příležitost:

- veřejný bezpečnostní checklist,
- tenant izolace vysvětlená lidsky,
- export dat kdykoliv,
- žádné sdílení vlastních klientů s marketplace,
- test konfliktů v kalendáři,
- test notifikací,
- test plateb a storna před spuštěním.

### 7. Segmentové provozní šablony hlubší než seznam služeb

Konkurence má oborové landing pages. Málokdo nastaví celý provoz:

- hair: střih/vousy/barvení, buffer, délky, no-show pravidla,
- nehty: doplnění, nové nehty, storno politika,
- masáže: delší bloky, tichý režim, no-show záloha,
- fitness: individuální tréninky vs pronájem zóny,
- fyzio: opakované návštěvy, formulář před návštěvou.

Temaro už začalo šablonami služeb. Další krok je segmentový setup wizard.

## 8. Doporučené rozšíření Temaro scope

### P0 – před pilotem, rozšířit MVP

Tyto věci mají nejvyšší poměr dopad/složitost:

1. **SMS provider a produkční SMS reminder**
   - Vybrat provider.
   - 24h SMS reminder.
   - Nastavení zapnuto/vypnuto per tenant.
   - Cena a limit jasně komunikovat.

2. **Online záloha přes Stripe**
   - Jen pro služby, kde je nastavena záloha.
   - Fixní částka / procento už Temaro umí.
   - Payment intent, stav zálohy, receipt.
   - Bez plného POS.

3. **Waitlist**
   - Klient se zapíše na dřívější termín.
   - Při zrušení termínu owner vidí kandidáty.
   - První verze může být manuální: “poslat nabídku”.

4. **Review request**
   - Po dokončené rezervaci poslat e-mail s review URL.
   - Jen pokud tenant vyplnil review URL.
   - Neřešit vlastní veřejné recenze hned.

5. **Import CSV**
   - Klienti.
   - Služby.
   - Volitelně staff.
   - Pilotní migrace bez toho bude bolet.

6. **Zdroje rezervací**
   - Booking source: direct, instagram, qr, widget, manual, katalog.
   - UTM parametry pro veřejný booking.
   - Dashboard “odkud chodí rezervace”.

7. **Tržby podle služby/staff**
   - Z existující evidence plateb.
   - Ne POS, jen reporting.

### P1 – první placení zákazníci

1. **Plný Google Calendar sync**
   - iCal export už je minimum.
   - Dvousměrný sync až po pilotu nebo jako explicitní beta.

2. **Iframe booking widget**
   - Embed button už je hotový.
   - Iframe widget pro weby podniků.

3. **Pokročilý zákaznický účet**
   - detail rezervace,
   - změna/zrušení po přihlášení,
   - historie,
   - preference.

4. **Podmíněné zprávy**
   - podle služby,
   - podle statusu,
   - podle segmentu.

5. **Trusted/VIP klient**
   - může obejít zálohu,
   - dostane dřívější nabídku z waitlistu,
   - nižší friction pro stálé klienty.

6. **Empty-slot recovery**
   - nabídka uvolněného slotu vybraným klientům,
   - SMS/email,
   - interní měření úspěšnosti.

### Vlna 4/5 – růst a provozní rozšíření před veřejným spuštěním

1. Permanentky, kredity, vouchery.
2. Memberships/packages.
3. POS/pokladna.
4. Sklad.
5. Mobilní aplikace.
6. Více poboček.
7. API.
8. Google booking / Reserve with Google.
9. Pokročilý marketplace s recenzemi a vzdáleností.

## 9. Upravený MVP scope po analýze

Původní MVP byl správně úzký pro rychlé ověření core. Po rozhodnutí 2026-05-08 se ale pre-launch MVP rozšiřuje na kompletní konkurenční scope. Cíl: před veřejným spuštěním mít všechno zásadní, co zákazník očekává od silného booking systému.

### Povinné pre-launch MVP funkce

- SMS reminder přes konkrétního providera.
- Online zálohy/platby.
- Waitlist.
- Review request po návštěvě.
- Import klientů a služeb.
- Zdroje rezervací/UTM.
- Tržby podle služby/staff.
- Plný Google/Outlook sync.
- Plný iframe widget je v Temaru hotový jako první verze; před spuštěním zbývá runtime embed test u konkrétního tenantu.
- Vlastní doména booking stránky.
- POS/pokladna minimum.
- Účtenky a účetní exporty.
- Sklad/inventory minimum.
- Vouchery, permanentky, kredity, balíčky a memberships.
- Marketingové kampaně.
- Last Minute / empty-slot recovery.
- Pokročilejší katalog/discovery s mapou, vzdáleností a obory.
- Recenze/reputace.
- Mobilní/PWA vrstva.
- Více poboček a resources/místnosti.
- Skupinové lekce/kapacity.
- API a integrace.

### Jediné věci mimo pre-launch MVP

- Provizní marketplace, který bere provizi z vlastních klientů podniku.
- AI bez konkrétního provozního workflow a bezpečnostního návrhu.
- Funkce, které by obešly tenant izolaci, validaci, audit nebo bezpečné error handling.

### Logické pořadí

1. Anti-no-show a platby: SMS, online zálohy, storno pravidla, waitlist, review request, zdroje rezervací.
2. Zákazník a integrace: Google/Outlook sync, vlastní doména, import a runtime ověření hotového iframe widgetu.
3. Business suite: POS minimum, účtenky/exporty, sklad minimum, vouchery/permanentky/balíčky, reporting a provize.
4. Growth a discovery: katalog/mapa, recenze, kampaně, Last Minute, referral.
5. Mobilní a provozní rozšíření: PWA/app vrstva, více poboček, resources, skupinové kapacity, API.

## 10. Doporučený positioning po analýze

Hlavní claim:

**Rezervační systém, který chrání čas salonu. Bez no-show chaosu, bez marketplace provizí, s vlastními klienty pod vaší značkou.**

Podpůrné pilíře:

1. **Méně telefonátů**: online booking, self-service změna/zrušení, reminders.
2. **Méně no-show**: SMS, záloha, storno pravidla, waitlist, review následná péče.
3. **Vlastní klienti**: žádná provize z vlastních klientů, vlastní booking link, QR, Instagram, katalog bez marketplace daně.
4. **Paměť podniku**: historie, poznámky, preference, riziko/no-show, oblíbený zaměstnanec.
5. **Jednoduchý český setup**: oborové šablony, onboarding do 15 minut, bez enterprise chaosu.

## 11. Prioritní implementační backlog z této analýzy

### Sprint A: SMS a zdroje rezervací

- Vybrat SMS provider.
- Doplnit env a runtime checklist.
- Zapnout SMS reminder v produkčním režimu.
- Přidat `booking_source` / `source_detail` / UTM metadata.
- Report zdrojů rezervací.

### Sprint B: online zálohy

- Stripe Payment Intent pro veřejný booking.
- Napojit na existující `deposit_type`, `deposit_value`, `deposit_amount`.
- Stav záloha zaplacena/nezaplacena.
- Zrušení/storno policy bez automatického refundu v první verzi.
- E-mail receipt.

### Sprint C: waitlist

- Tabulka `waitlist_entries`.
- Veřejný zápis “chci dřívější termín”.
- Owner panel kandidátů.
- Manuální nabídka slotu.
- Později automatizace.

### Sprint D: review request a import

- Review request po `completed`.
- CSV import klientů.
- CSV import služeb.
- Import audit a dry-run.

### Sprint E: reporting

- Tržby podle služby.
- Tržby podle staff.
- No-show ztráta odhad.
- Zachráněné termíny z waitlistu.

## 12. Zdrojové odkazy

Salona:

- https://salona.cz/business/features
- https://salona.cz/business/pricing
- https://salona.cz/business/features/reminders
- https://salona.cz/business/features/clients
- https://salona.cz/documents/Salona-Obchodni_podminky.pdf
- https://salona.cz/business/rezervacni-system-pro-kadernictvi
- https://salona.cz/business/rezervacni-system-pro-barbershopy
- https://salona.cz/business/rezervacni-system-pro-kosmeticke-salony
- https://salona.cz/business/rezervacni-system-pro-masaze

Česko/střední Evropa:

- https://partner.notino.cz/
- https://www.reservio.com/pricing
- https://reservanto.cz/cenik
- https://reservanto.cz/vlastnosti
- https://reenio.cz/cs/Home/Balicky
- https://www.bookio.com/cs
- https://bookio.com/en/functions/reservation-via-google
- https://services.bookio.com/features?lang=cs
- https://booqme.cz/cs/cenik
- https://salonio.cz/
- https://www.system-olma.app/
- https://www.myfox.one/cs/
- https://www.myfox.one/cs/funkce-rezervacniho-systemu-10-tipu/

Globální:

- https://www.fresha.com/for-business/features
- https://www.fresha.com/pricing
- https://biz.booksy.com/en-us/features
- https://biz.booksy.com/en-us/features/no-show-protection
- https://support.booksy.com/hc/en-us/articles/16487324704658-How-can-I-accept-deposits-for-appointments-booked-by-my-clients
- https://simplybook.me/booking-system-features
- https://simplybook.me/en/pricing/index/ref
