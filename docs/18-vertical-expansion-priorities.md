# Vertical Expansion Priorities

Aktualizováno: 2026-05-03 16:41 CEST

Tento dokument určuje, do kterých typů podniků Temaro rozšiřovat po prvním hair segmentu. Kritérium: co je nejpodobnější barber/kadeřnickému flow, vyžaduje nejméně nové logiky a zároveň má jasnou poptávku po online rezervacích.

## Závěr

Nejjednodušší expanze po hair segmentu:

1. Hair segment: barber + kadeřnictví
2. Kosmetika / beauty salon
3. Nehty, pedikúra, řasy, obočí
4. Masáže / wellness solo provozy
5. Fyzioterapie / rehabilitace solo nebo malé studio
6. Soukromá fitka / osobní trenéři / jóga
7. Psí salon / grooming

Tyto segmenty mají stejný základ jako hair segment:

- služba,
- délka,
- cena,
- jeden nebo více pracovníků,
- pracovní doba,
- veřejný booking,
- klientská historie,
- připomínky,
- no-show/záloha.

## Priorita P0: stejné nebo skoro stejné jako hair segment

### 1. Hair segment: barber + kadeřnictví

Proč:

- Barber a kadeřnictví jsou produktově jeden segment: střih, barvení, styling, vousy, konkrétní zaměstnanec, délka služby.
- Nevyžadují jinou DB logiku ani jiné booking flow.
- Máme hotové samostatné SEO landing pages pro barbery i kadeřnictví, ale produktově se mají řídit jako jeden hair segment.
- Nevyžaduje novou datovou logiku.

Co může chtít navíc později:

- delší služby a kombinace služeb,
- preference stylisty,
- poznámky k barvě/vlasům,
- fotky před/po jako nice-to-have.

### 2. Kosmetika / beauty salon

Proč:

- Stejné flow: služba, specialistka, čas, klient, reminder.
- Dobře sedí na zálohy a no-show prevenci.
- Často potřebuje klientskou historii a poznámky.

Co může chtít navíc později:

- kontraindikace / formulář před návštěvou,
- balíčky ošetření,
- fotky a souhlasy.

### 3. Nehty / pedikúra / řasy / obočí

Proč:

- Velmi jednoduché časové sloty.
- Opakované návštěvy a věrní klienti.
- Malé provozy, často jedna osoba nebo pár specialistů.

Co může chtít navíc později:

- opakovaná rezervace,
- preference designu/barvy,
- fotogalerie.

## Priorita P1: pořád podobné, ale s menšími odlišnostmi

### 4. Masáže / wellness solo

Proč:

- Rezervace podle délky a typu služby je skoro stejná.
- Vysoká hodnota no-show prevence, hlavně u delších termínů.
- iCal/Google sync je důležitý pro solo provozy.

Odlišnosti:

- častější potřeba delších bloků,
- někdy místnost/kapacita,
- u wellness může přijít více zdrojů kapacity.

### 5. Fyzioterapie / rehabilitace solo

Proč:

- Stejný rezervační model jako masáže.
- Silná potřeba klientské historie.
- Dobrý důvod pro připomínky a zákaznický účet.

Odlišnosti:

- zdravotní citlivost dat,
- anamnéza a formuláře,
- vyšší nároky na důvěru a textaci.

### 6. Soukromá fitka / osobní trenéři / jóga

Proč:

- Soukromá fitka a privátní trénink teď dávají obchodně smysl: prodávají čas, kapacitu a osobnější zážitek než velká veřejná fitka.
- Solo trenér je jednoduchý use case a je velmi blízko stávajícímu booking core.
- Funguje veřejný booking, kalendář, klienti, připomínky.

Odlišnosti:

- soukromé fitko může chtít rezervaci místnosti, zóny nebo omezené kapacity,
- skupinové lekce a kapacita nejsou v Temaru hotové,
- permanentky/memberships jsou pozdější vrstva.

Praktický závěr:

- Solo trenér / individuální trénink je vhodný dřív.
- Soukromé fitko s jedním slotem nebo jednou místností je zvládnutelné bez velké změny.
- Soukromé fitko s více zónami, členstvím a skupinovými lekcemi je až pozdější vrstva.

## Priorita P2: zajímavé, ale až po stabilizaci

### 7. Psí salon / grooming

Proč:

- Bookio uvádí psí kadeřnice jako příklad použití rezervačního systému.
- Flow je podobné: služba, čas, pracovník, klient.

Odlišnosti:

- místo klienta je často důležité zvíře,
- potřebuje profil mazlíčka, plemeno, velikost, poznámky.

### 8. Autoservis / pneuservis

Proč:

- Reservio a Termino uvádějí autoservis jako možný segment.
- Rezervace času a služby funguje.

Proč ne hned:

- vozidlo, SPZ/VIN, typ práce, náhradní díly a delší zakázkový proces.
- Může rychle sklouznout do servisního ERP.

### 9. Lékaři / ordinace

Proč:

- Rezervace termínu je podobná.

Proč ne hned:

- vyšší citlivost dat,
- compliance,
- specifické workflow čekárny, dokumentace, zdravotní údaje.

## Co nasazovat v produkci jako další typy

Doporučené pořadí produkční komunikace:

1. Hair segment: barber + kadeřnictví
2. Kosmetické salony
3. Nehty / pedikúra / řasy / obočí
4. Masáže / wellness solo
5. Soukromá fitka / osobní trenéři, pokud začneme individuálními tréninky nebo jednou rezervovatelnou místností
6. Fyzioterapie solo

Nedělat hned:

- restaurace,
- hotely,
- marketplace-heavy consumer app,
- autoservis jako primární segment,
- ordinace s citlivou zdravotní agendou.
- skupinové fitness lekce, permanentky a členství jako první verzi fitka.

## Dopad na produkt

Pro P0 segmenty stačí hlavně:

- přidat obor/kategorii tenantu,
- přidat segmentové copy a šablony,
- rozšířit katalog `/podniky` o filtr oboru,
- doplnit demo data pro další segmenty,
- držet jeden univerzální booking core.

Pro soukromá fitka začít jen nejmenším průnikem:

- individuální trénink,
- rezervace trenéra,
- případně jedna místnost/zóna jako služba,
- bez memberships, permanentek a skupinové kapacity v první verzi.

Není potřeba hned dělat nové moduly.

## Použité zdroje

- Reservez: uvádí kadeřnictví/barber, wellness/masáže, kosmetiku a fitness jako cílové služby; řeší kalendář, klienty, reporty, SMS/e-mail notifikace.
- Reservio: salon software pokrývá kadeřnictví, nehty, pedikúru, barbershopy, spa, wellness/masáže, fitness, zdravotní služby i autoservis.
- NaTermin: uvádí kadeřnictví, kosmetiku, masáže, wellness, manikúru, barber, pedikúru, řasy, fitness, fyzioterapii; komunikuje online rezervace, SMS, platby/zálohy, klienty, tým, služby a reporting.
- Bookio: reference ukazují pedikúru/podologii, fyzioterapii, psí salony, spa/masáže a potřebu týmového přehledu.
- Salona obchodní podmínky: discovery řadí podle placeného plánu, vzdálenosti, relevance služby a hodnocení; potvrzuje důležitost lokality, služby a recenzí v katalogovém modelu.
