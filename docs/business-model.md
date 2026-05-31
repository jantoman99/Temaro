# Business model

Aktualizováno: 2026-05-08

## Produkt

**Temaro** je SaaS rezervační systém pro lokální služby řízené časem.

Primární zákazníci:

- salony,
- barber shopy,
- trenéři,
- wellness a masáže,
- menší ordinace,
- autoservisy a další služby s termíny.

Marketingový focus pro první akvizici je užší než produktový scope. Aktivní niche/SEO/GEO/AEO strategie je v `docs/17-czech-market-niches-seo-geo-aeo.md`.

První marketingové segmenty:

1. barber shopy,
2. kadeřnictví a beauty salony,
3. masáže a wellness.

Autoservis, fyzio a ordinace zůstávají validní budoucí vertikály, ale nemají být první acquisition focus bez doplnění segmentových workflow.

## Positioning

**Méně telefonátů. Klidnější provoz.**

Temaro prodává hlavně jistotu provozu a kompletní provozní nástroj před spuštěním:

- klient si rezervuje sám,
- podnik vidí jasný kalendář,
- systém hlídá double-booking,
- klienti mají historii a poznámky,
- no-show se dá snižovat přes reminders, self-service změny, zálohy, produkční SMS, online platby, waitlist, review follow-up a segmentaci klientů.

## Cenový směr

Finální ceny nejsou uzavřené. Po rozšíření pre-launch scope nebude Temaro prodávané jako minimalistický booking nástroj, ale jako kompletní provozní suite.

| Plán | Směr | Poznámka |
|---|---|---|
| Pilot | 0 Kč nebo zvýhodněně | Pro první validaci produktu, bez garance kompletní výbavy |
| Solo | vyšší než původních 299-399 Kč/měs | Jeden poskytovatel, booking, klienti, SMS/platby podle usage, základní reporting |
| Tým | vyšší než původních 599-899 Kč/měs | Více poskytovatelů, platby, waitlist, reporting, widget, sync, POS minimum |
| Provoz | individuálně nebo vyšší tarif | POS/sklad minimum, vouchery/permanentky, více poboček, pokročilé kampaně |

Zásady:

- Neúčtovat marketplace provizi z vlastních klientů.
- Neprodávat “zdarma” model se skrytými náklady.
- SMS a platby účtovat transparentně jako nákladovou/usage položku; transakční poplatky brány má ideálně nést podnik podle vlastní smlouvy s bránou.
- Online zálohy prodávat jako vyšší tarif nebo add-on, ne jako skrytou marketplace provizi.
- “Neomezené rezervace” držet jako silný psychologický benefit placeného plánu, pokud to ekonomika dovolí.

## Go-to-market

1. Najít 3-5 pilotních provozoven, ideálně různých segmentů.
2. Ověřit hlavní flow: nastavení služeb, booking, kalendář, reminder, self-service změna.
3. Implementovat pre-launch scope po vlnách: SMS/platby/waitlist, zákaznický účet/sync/widget/import, business suite, growth/discovery, mobilní/PWA vrstva.
4. Upravit landing copy podle reálných slov pilotních zákazníků.
5. Teprve potom zamknout pricing.

První SEO/GEO/AEO go-to-market vlna:

- segmentová landing page pro barbery,
- segmentová landing page pro kadeřnictví/beauty,
- segmentová landing page pro masáže/wellness,
- answer page `Jak snížit no-show`,
- answer page `SMS připomínky rezervací`,
- férová comparison page `Alternativa k Reservio`,
- answer/comparison obsah okolo `bez marketplace provizí`, SMS připomínek a záloh.

## Co nestavět před spuštěním

- Provizní marketplace, který bere provizi z vlastních klientů podniku.
- AI funkce bez konkrétního provozního workflow a bezpečnostního návrhu.
- Jakýkoliv modul, který obejde tenant izolaci, validaci, audit nebo bezpečné error handling.

Účetnictví řešit postupně: evidence plateb, záloh, doplatků, účtenky a export pro účetní jsou pre-launch scope; plná účetní integrace typu Pohoda/Fakturoid/iDoklad až jako navazující integrační vrstva.
