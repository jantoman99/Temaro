# Frontend + auth analýza konkurence

Aktualizováno: 2026-06-08

## Shrnutí

Temaro má funkční produktový základ, ale veřejný web zatím působí menší, prázdnější a víc jako čistý SaaS landing než jako rezervační systém pro služby. Konkurenti prodávají hlavně přes konkrétní provozní situace: kalendář, booking stránku, mobil, platby, připomínky, marketing, marketplace/kanály a oborové stránky. V horní navigaci také skoro vždy používají rozbalovací menu, ne jen kotvy níž na stránku.

Největší frontend gap není jedna barva nebo jeden styl. Je to chybějící informační architektura: návštěvník má hned vidět `Produkt`, `Řešení podle oboru`, `Zdroje/ukázky`, `Ceník` a jasné CTA. Dnešní Temaro navigace je příliš jednoproudá a odkazy jako `Obory` nebo `Ceník` jen sjíždí níž. To je v pořádku pro jednoduchý one-page web, ale slabé pro produkt, který chce působit jako seriózní rezervační platforma.

## Co opakují konkurenti

### 1. Rozbalovací navigace

Booksy má v navigaci členění na feature skupiny: `Set up shop`, `Wow your clients`, `Run your business`, `Get paid`, `Keep growing`, a vedle toho samostatné `Solutions by Industry` pro barber, hair salon, nail salon, spa a další obory.

SimplyBook.me má v menu `Features`, `Enterprise`, `Business Types`, `Development & API`, `Security`, `About`, `Help` a pod tím další hluboké odkazy na integrace, video tutoriály, case studies a learning hub.

Setmore ukazuje podobný pattern: `Integrations`, `Features`, `Industries`, `Pricing`, přičemž features dělí na core, sharing, booking channels, confirmations/reminders, staff scheduling a calendar sync.

Acuity má dropdowny `Solutions`, `Product` a `Resources`; v `Product` dělí věci na client experience, payments & invoicing a business management.

Calendly, i když není salon-first, ukazuje silnou enterprise IA: `Product`, `Solutions`, `Resources`, `Pricing`; v dropdownu má scheduling, contacts, payments, integrations, mobile app, admin controls, security, by industry a support.

**Dopad pro Temaro:** anchor-only menu dělá dojem menšího produktu. Pro pre-launch stačí jeden nový marketing nav model, ne deset nových stránek najednou.

## Frontend rozdíly proti Temaru

### Temaro dnes

- Homepage je čistá, světlá, s claimem `Méně telefonátů. Více rezervací.`
- V heru je CTA, trust pill prvky a `LiveProductShowcase`.
- Navigace je krátká a převážně scrollovací: `Pro podniky`, `Pro zákazníky`, `Obory`, `Ceník`, `Ukázka`.
- Vizuál je pořád blízko čistému B2B SaaS/Linear směru: hodně textu, karty, gradient, produktový mock.
- Chybí produktové video nebo krátké loopované ukázky na konkrétní flow.
- Chybí výraznější oborové vstupy v top navigaci.
- Chybí social proof, reálné logo/reference nebo veřejně přiznaný stav `pilot/pre-launch`.

### Konkurence typicky ukazuje

- Velké produktové nebo mobilní vizuály hned nad foldem.
- Krátké video/demo nebo video tutorials jako samostatný obsahový kanál.
- Konkrétní screenshoty/obrázky booking stránky, admin panelu a mobilní appky.
- Oborové landingy dostupné přímo z menu.
- Feature stránky, které nejsou schované jen jako sekce na homepage.
- Větší důraz na booking kanály: web, Facebook, Instagram, Google, QR, marketplace/profil.
- Opakované CTA `start free`, `get demo`, `get started`.
- FAQ a trust prvky na homepage.

## Auth a registrace

### Co je u Temara dnes

- Podnikatelská registrace: e-mail/heslo nebo Google OAuth.
- Podnikatelský login: e-mail/heslo nebo Google OAuth.
- Zákaznický účet: Google OAuth.
- OAuth runtime aktivace je odložená na produkční doménu a finální Supabase/Google nastavení.

### Co mají konkurenti

- Reservio při registraci firemního účtu uvádí e-mail/heslo a pokračování přes Google, Apple nebo Facebook.
- Reservio u klientských rezervací umožňuje dokončit rezervaci bez registrace, případně se přihlásit přes Facebook, Apple nebo Google.
- Fresha business onboarding podporuje Facebook, Google nebo Apple a po social loginu doplňuje mobilní číslo a business setup.
- SimplyBook.me login stránka má Google a Facebook login.
- Booksy zákaznický účet podle help centra začíná e-mailem a následným SMS ověřovacím kódem.

## Doporučení k auth

Nepřidávat Facebook login jako první. Je vidět u konkurence, ale pro Temaro není nejlepší první volba:

- Facebook auth může být užitečný pro koncové zákazníky, ale u podnikatelského účtu nepřináší tolik hodnoty jako Google/Microsoft/Apple.
- Facebook/Instagram dává větší smysl jako booking kanál a měřitelný CTA link než jako primární auth metoda.
- Meta integrace bývají provozně křehčí a mají vyšší údržbu.

Priorita auth:

1. **Google**: ponechat jako hlavní a opravdu zprovoznit po produkční doméně.
2. **Apple**: přidat později hlavně pro zákaznický účet, protože mobilní zákazníci a iOS uživatelé to očekávají.
3. **Microsoft**: zvážit pro podnikatelský login až společně s Outlook/Office calendar sync.
4. **SMS nebo e-mail magic code pro zákazníky**: pro běžné klienty salonu může být praktičtější než heslo i social login.
5. **Facebook**: odložit; prioritně řešit Facebook/Instagram booking odkazy, ne přihlášení.

## Doporučený nový top nav

Minimální verze pro další iteraci:

- `Produkt`
- `Řešení`
- `Ukázka`
- `Ceník`
- `Návody`

Dropdown `Produkt`:

- Online rezervace
- Týmový kalendář
- Klienti a historie
- Připomínky a no-show
- Platby a zálohy
- Booking widget

Dropdown `Řešení`:

- Barber shopy
- Kadeřnictví
- Kosmetické salony
- Masáže a wellness
- Trenéři
- Lokální služby

Dropdown `Návody`:

- Jak snížit no-show
- SMS připomínky
- Rezervační systém bez provizí
- Přechod z papírového diáře
- Jak sdílet booking odkaz

CTA:

- Primární: `Začít zdarma`
- Sekundární: `Spustit ukázku` nebo `Zobrazit demo barberu`

## Doporučený vizuální směr

Temaro by se nemělo jen více přiblížit Reserviu/Booksy. Musí zůstat modernější, ale méně prázdné.

Směr: **český service-business SaaS, ne startup dashboard pro vývojáře**.

Konkrétní změny:

- Přidat v heru nebo hned pod hero krátké produktové video/loop: klient rezervuje -> owner vidí kalendář -> přijde potvrzení.
- Rozbít dlouhé textové sekce konkrétními UI panely: booking stránka, kalendář, SMS připomínka, klientská karta.
- Přidat oborový pás s reálnějšími vizuály: barber, beauty, wellness, fitness.
- Přidat sekci `Jak to funguje` ve 3 krocích podobně jako konkurence: nastavíte služby -> sdílíte odkaz -> klienti se rezervují sami.
- Přidat `booking channels` blok: vlastní web, Instagram bio, Google Business Profile, QR kód, iframe widget.
- Přidat demo/video CTA do navigace, nejen odkaz na `/ukazka`.
- Zachovat čistotu a rychlost, ale snížit pocit prázdnoty přes konkrétní produktové momenty.

## Funkční gapy proti konkurenci

Nejviditelnější chybějící nebo nedotažené věci:

- Produkční Google OAuth aktivace.
- Apple login pro zákazníky.
- Microsoft login až s Outlook sync.
- Plný Google/Outlook calendar sync; iCal feed je dobrý základ, ale trh čeká obousměrné nebo alespoň robustní propojení.
- Produkční SMS provider.
- Booking přes Instagram/Facebook/Google jako měřitelné kanály.
- Krátké produktové video nebo nativní produktový tour v landing page.
- Trust/social proof bez fake dat: pilotní badge, veřejný changelog, live demo, GitHub, nebo první reference až po reálném pilotu.
- Výraznější oborové landingy propojené z top nav.

## Prioritní backlog

### P0: marketing IA a první dojem

1. Přestavět top navigaci na dropdown model.
2. Doplnit homepage sekci `Jak to funguje`.
3. Doplnit homepage sekci `Booking kanály`.
4. Udělat krátkou produktovou ukázku/video loop nebo minimálně klikací `watch demo` modal z existující `/ukazka`.
5. Upravit hero a navazující sekce tak, aby působily konkrétněji a méně prázdně.

### P1: auth a kanály

1. Zprovoznit Google OAuth runtime na finální doméně.
2. Připravit Apple login pro zákaznický účet.
3. Připravit Microsoft login jen pokud se začne dělat Outlook sync.
4. Nepřidávat Facebook login bez důvodu; místo toho posílit Facebook/Instagram booking linky a měření zdroje.

### P2: konkurenční produktové mezery

1. Plný Google/Outlook calendar sync.
2. Produkční SMS provider.
3. Video/tutorial obsah.
4. Lepší veřejné demo flow pro recruiter/pilotního zákazníka.
5. Pilotní reference a reálné screenshoty po prvním provozu.

## Zdroje

- Reservio homepage a feature claimy: https://www.reservio.com/cs/
- Reservio registrace: https://help.reservio.com/cs/articles/5094049-jak-si-zalozit-ucet
- Reservio klientská rezervace a social login: https://help.reservio.com/cs/articles/5139886-pokud-si-chci-vytvorit-rezervaci-musim-se-nejprve-zaregistrovat
- Fresha business account/social login: https://www.fresha.com/help-center/knowledge-base/personal-account/32-create-a-fresha-account-as-a-business-owner
- SimplyBook.me homepage/features: https://simplybook.me/en/
- SimplyBook.me login: https://simplybook.me/en/login-page
- Booksy business homepage/nav/features: https://biz.booksy.com/en-us
- Booksy customer account setup: https://help.booksy.com/hc/en-us/articles/21595664947474-How-do-I-create-a-Booksy-account
- Setmore homepage/nav/features: https://www.setmore.com/
- Calendly homepage/nav/product structure: https://calendly.com/
- Acuity homepage/nav/product structure: https://acuityscheduling.com/
