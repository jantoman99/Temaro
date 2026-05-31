# Funkce a diferenciace

Aktualizováno: 2026-05-08 11:32 CEST

Tento dokument je stručný aktivní feature přehled. Detailní tržní analýza a must-have gapy jsou v `docs/14-market-analysis-booking-systems.md` a `docs/20-competitive-analysis-booking-systems-2026.md`.

## Positioning

**Temaro = jednoduchý rezervační systém pro služby, který chrání čas provozovatele před no-show, chaosem a zbytečnou administrativou.**

Temaro má být kompletní provozní systém pro podniky řízené časem: salony, barber shopy, ordinace, trenéři, wellness, autoservisy a podobné lokální služby. Scope před spuštěním zahrnuje booking core, anti-no-show vrstvu, platby, business suite, discovery, marketing a mobilní/PWA vrstvu.

## Hlavní diferenciace

| Oblast | Směr Temara |
|---|---|
| Anti-no-show | Připomínky, self-service změny, no-show historie, zálohy, produkční SMS, online platby, waitlist, trusted/risk klienti |
| Klientská paměť | Historie, poznámky, flag/no-show, preference, štítky, review follow-up a segmentace |
| Provozní jednoduchost | Kompletní suite, ale postupně odkrývaný podle role a vyspělosti podniku |
| Transparentní cena | Bez marketplace provizí z vlastních klientů a bez kreditového stresu |
| Lokální důvěra | Český produktový kontext, jednoduchý onboarding, bezpečná tenant izolace |
| Dva typy účtů | Podnikatel spravuje provoz, zákazník se přihlásí pro vlastní rezervace bez přístupu do adminu |
| Discovery bez provizí | Později vyhledání podniků podle města/lokality/oboru a mapa, ale bez provize z vlastních klientů |
| Anti-no-show OS | Riziko klienta, doporučená záloha, waitlist, trusted klienti a report zachráněných hodin |
| Client ownership pledge | Export dat, žádná provize z vlastních klientů, žádné přesměrování ke konkurenci |
| Transparentní TCO | Kalkulačka skutečné ceny včetně SMS, plateb, provizí konkurence a ušetřeného času |
| Provozní zkouška | Onboarding testuje konflikty, nemoc zaměstnance, storna, sync a notifikace před spuštěním |
| Migrační asistent | Import a checklist přechodu z konkurence bez ručního chaosu |
| Provozní doporučení | Systém doporučí zálohy, Last Minute, potvrzení klienta nebo změnu kapacity podle dat |

## Hotové v MVP

- Registrace podniku, login, logout a auth callback pro pozvánky.
- Google OAuth login a podnikatelská registrace přes Google.
- Zákaznický účet `/account` s Google přihlášením a přehledem rezervací podle ověřeného e-mailu.
- Landing page explicitně komunikuje dva typy účtů: podnikatelský účet a zákaznický účet.
- První katalog/discovery základ `/podniky`: veřejně zalistované podniky, filtrování podle textu/města, booking CTA a mapový odkaz.
- Tenant izolace přes `tenant_id`, Supabase RLS a auth kontext z `app_metadata`.
- Role owner/staff a omezení staff účtu na vlastní rezervace.
- Služby: vytvoření, úprava, skrytí, cena, délka, buffer, nastavení zálohy a přiřazení zaměstnancům.
- Zaměstnanci: profily, služby, běžná pracovní doba a výjimky.
- Veřejný booking: služba, zaměstnanec nebo kdokoliv, termín, kontakt, potvrzení a zobrazení požadované zálohy.
- Evidence plateb u rezervace: hotovost, karta na místě, převod, online karta, voucher; zatím interní evidence bez živé platební brány.
- Chráněná sekce `Platby` a CSV export plateb pro účetní.
- Anti-double-booking přes databázovou/RPC logiku.
- Admin kalendář: denní, týdenní a list pohled, filtry, detail, ruční rezervace.
- Klienti: databáze, historie, poznámky, oblíbený zaměstnanec, flag, no-show.
- Self-service manage odkaz pro přesun nebo zrušení rezervace.
- Email potvrzení, změny, zrušení, owner notifikace a 24h reminder.
- SMS reminder základ přes generický webhook: plánování, cron a statusy; reálný provoz vyžaduje SMS providera.
- Read-only iCal export aktivních rezervací přes odvolatelný feed token.
- Booking button embed skript pro vložení rezervačního CTA na web podniku.
- Sdílecí kit pro Instagram bio/story a QR kód veřejné booking stránky.
- Základní statistiky a provozní signály v dashboardu.
- Aktuální landing/design směr Temaro Signal OS.

## Chybí před spuštěním

- Konkrétní SMS provider, pricing a provozní konfigurace.
- Online platby pro vybrané služby; Stripe Checkout pro online zálohy, interní evidence plateb a CSV export jsou hotové.
- Empty-slot recovery automatizace; waitlist, Last Minute evidence a owner-only recovery nabídky vybraným klientům jsou hotové jako první vrstva.
- Partner API/integrace; owner-only správa hashovaných read-only API klíčů a endpoint pro rezervace jsou hotové jako první bezpečná vrstva.
- Google Business Profile CTA; booking share kit generuje měřitelný odkaz s `google` zdrojem a UTM parametry.
- Vlastní doména booking stránky; plný iframe widget i jednoduché embed tlačítko jsou hotové.
- Google/Outlook plný sync; iCal read-only export je hotový jako první integrační minimum.
- Pokročilejší automatizované review API; `/podniky` už má ruční reputační souhrn, obor, město, veřejnou adresu, souřadnice, radius a vzdálenostní řazení.
- Vlastní email/SMS šablony včetně podmíněných zpráv.
- Reporting provizí a cashflow; obsazenost, no-show rate, zdroje rezervací a tržby podle služby/staff/zdroje jsou hotové jako první reporting vrstva.
- Pokročilý zákaznický portál se změnou rezervací po přihlášení; základní `/account` přehled rezervací už je hotový.
- Účtenky a účetní doklady; POS/pokladna minimum a sklad minimum jsou hotové jako první business suite vrstvy.
- Pokročilý automatizovaný billing členství; memberships/opakovaná členství jsou hotové jako provozní evidence bez automatického strhávání.
- Import klientů, služeb a rezervací z CSV je hotový s dry-runem; další vrstva je migrační checklist z konkrétních konkurenčních exportů.
- Push notifikace a hlubší mobilní offline flow; základní PWA instalace je hotová.
- Více poboček, resources/místnosti a skupinové lekce jsou hotové jako první evidence.

## Záměrně mimo pre-launch MVP

- Provizní marketplace, který bere provizi z vlastních klientů podniku.
- AI funkce bez konkrétního provozního workflow.
- Cokoliv, co obchází tenant izolaci, validaci, audit a bezpečné error handling.

## Priorita dalšího produktu

1. Produkční SMS, online zálohy, waitlist, review request a zdroje rezervací.
2. Plný zákaznický účet, Google/Outlook sync, iframe widget, vlastní doména a import dat.
3. Účtenky/exporty, automatizovaný billing členství a rozšířený reporting; POS minimum, sklad minimum, vouchery, permanentky/balíčky, memberships evidence a základ tržeb jsou hotové.
4. Referral a hlubší automatizace recenzí; katalog/discovery, recenze/reputace a kampaně/Last Minute jsou hotové jako první vrstva.
5. Push notifikace; PWA základ, resources evidence, pobočky a skupinové kapacity jsou hotové.
6. Diferenciační vrstva: anti-no-show OS, client ownership pledge, TCO kalkulačka, provozní zkouška, migrační asistent a provozní doporučení.
