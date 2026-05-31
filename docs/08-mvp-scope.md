# MVP Scope – Pre-launch produkt

## Filozofie MVP

"Fungující, bezpečný, kompletní pro silný vstup na trh."

Cíl: Temaro nemá být jen technické demo bookingu. Před spuštěním má mít kompletní sadu funkcí,
kterou zákazník očekává od moderního rezervačního systému, plus jasnou diferenciaci proti
Salona/Reservio/Booksy/Fresha/Notino typu konkurence.

---

## CO JE V MVP ✅

Poznámka 2026-05-08: Po hloubkové analýze Salony a konkurence je MVP rozšířené na pre-launch scope. Vše níže je součást produktu před spuštěním, ale implementuje se postupně podle závislostí: nejdřív core a anti-no-show, potom platby/SMS/waitlist, potom business suite, potom growth/discovery a mobilní vrstva.

### 1. Auth & Onboarding
- [x] Registrace podniku (email + heslo)
- [x] Registrace podniku přes Google OAuth
- [x] Přihlášení / odhlášení
- [x] Přihlášení přes Google OAuth pro podnikové účty
- [x] Základní nastavení podniku (název, timezone, měna)
- [x] Invite zaměstnance přes email (role: owner / staff)

### 2. Správa služeb
- [x] Přidat / upravit / skrýt službu
- [x] Název, popis, délka v minutách, cena
- [x] Volitelné nastavení zálohy: bez zálohy / fixní částka / procento
- [x] Přiřadit službu ke konkrétnímu zaměstnanci

### 3. Správa zaměstnanců (staff)
- [x] Přidat zaměstnance (jméno, foto zatím mimo MVP)
- [x] Nastavit pracovní hodiny (každý den zvlášť)
- [x] Přidat výjimku (volno, dovolená)

### 4. Booking stránka pro klienty
- [x] Veřejná URL (`/[slug]`)
- [x] Výběr služby → poskytovatele → termínu → kontakt → potvrzení
- [x] Real-time dostupnost (bez double-bookingu)
- [x] Funguje na mobilu (responsive)

### 5. Klientský profil (základní)
- [x] Automatické vytvoření při první rezervaci
- [x] Jméno, telefon, email
- [x] Historie rezervací
- [x] Interní poznámky (provozovatel píše, klient nevidí)
- [x] No-show counter (manuální označení)
- [x] Flagování klienta ⚠️ (varování při rezervaci)

### 6. Kalendář v admin panelu
- [x] Denní pohled
- [x] Týdenní pohled
- [x] Barevné rozlišení zaměstnanců
- [x] Kliknutí na rezervaci → detail
- [x] Manuální přidání rezervace
- [x] Označení stavu: dokončeno / zrušeno / no-show

### 7. Notifikace
- [x] Email potvrzení klientovi po rezervaci
- [x] Email připomínka 24h před termínem
- [x] Email provozovateli při nové rezervaci
- [x] Email klientovi při zrušení

### 8. Správa rezervací
- [x] Zrušení rezervace (provozovatel)
- [x] Zrušení rezervace (klient přes odkaz v emailu)
- [x] Přesunutí rezervace (provozovatel)
- [x] Storno podmínky (počet hodin před = žádné zrušení)

### 9. Základní statistiky
- [x] Počet rezervací tento měsíc
- [x] Počet no-show
- [x] Tržby (součet cen dokončených rezervací)

### 10. Zálohy a interní platby
- [x] Nastavení zálohy u služby
- [x] Uložení požadované zálohy do rezervace
- [x] Evidence plateb u rezervace bez živé platební brány
- [x] CSV export plateb pro účetní

### 11. SMS reminder základ
- [x] Volitelné plánování SMS reminderu do `notifications`
- [x] Cron endpoint `/api/cron/sms-reminders`
- [x] Generický SMS webhook sender bez vendor locku

### 12. iCal export
- [x] Owner-only vytvoření odvolatelného calendar feed tokenu
- [x] Read-only `.ics` endpoint pro aktivní rezervace
- [x] Ukládání pouze hashe feed tokenu

### 13. Booking embed minimum
- [x] Vložitelný button script pro web podniku
- [x] Bez cookies a bez tenant ID v query stringu
- [x] Vygenerovaný snippet v sekci `Booking stránka`
- [x] Instagram bio/story texty a QR kód pro veřejný booking odkaz

### 14. Zákaznický účet minimum
- [x] Google přihlášení zákazníka bez tenant role
- [x] Přehled rezervací podle ověřeného e-mailu
- [x] Bez přístupu do admin dashboardu
- [x] Landing komunikace dvou typů účtů: podnikatel a zákazník

### 15. Povinné pre-launch rozšíření: anti-no-show a platby
- [ ] Konkrétní SMS provider a produkční SMS reminder
- [x] Online zálohy/platby kartou přes Stripe Checkout pro self-service manage odkaz
- [x] Storno pravidla navázaná na zálohu a čas do termínu v self-service manage flow
- [ ] Card-on-file / uložená karta jako pozdější vrstva stejného platebního modulu
- [x] Waitlist pro obsazené termíny
- [x] Empty-slot recovery: nabídka uvolněného termínu vybraným klientům
- [x] Trusted/VIP klienti a rizikoví klienti podle no-show historie

### 16. Povinné pre-launch rozšíření: zákaznický účet
- [x] Detail rezervace v `/account`
- [x] Zrušení rezervace po přihlášení podle ověřeného e-mailu a storno pravidel
- [x] Změna/přesun rezervace po přihlášení podle ověřeného e-mailu a storno pravidel
- [x] Historie návštěv pro zákazníka
- [x] Základní profilové údaje zákazníka podle ověřeného e-mailu
- [x] Preference klienta
- [x] Review request po dokončené návštěvě

### 17. Povinné pre-launch rozšíření: integrace a widgety
- [ ] Plný Google Calendar sync
- [ ] Outlook Calendar sync
- [x] Plný iframe booking widget
- [x] Vlastní doména booking stránky
- [x] Google Business Profile / měřitelný booking CTA směr
- [x] Měření zdroje rezervace: web, widget, QR, Instagram, katalog, ruční rezervace, UTM

### 18. Povinné pre-launch rozšíření: business suite
- [x] POS/pokladna minimum
- [x] Účtenky a účetní exporty
- [x] Základní sklad/inventory pro produkty a spotřebu
- [x] Vouchery / dárkové poukazy
- [x] Permanentky, kredity a balíčky
- [x] Memberships / opakovaná členství
- [x] Tržby podle služby, zaměstnance, období a zdroje rezervace
- [x] Provize zaměstnanců a výkon týmu

### 19. Povinné pre-launch rozšíření: discovery a marketing
- [x] Pokročilejší katalog podniků podle oboru, města, vzdálenosti a mapy
- [x] Recenze/reputace a napojení na Google review link
- [x] Marketingové kampaně: email/SMS blast vybraným segmentům klientů
- [x] Last Minute nabídky volných slotů
- [x] Referral/doporučení
- [x] Import klientů, služeb a rezervací z CSV nebo starého systému
  - [x] CSV import klientů a služeb s dry-run validací
  - [x] CSV import rezervací s párováním klient/služba/zaměstnanec/termín

### 20. Povinné pre-launch rozšíření: mobilní a provozní vrstva
- [x] Mobilní admin/PWA použitelná jako appka
- [x] Zákaznická mobilní/PWA vrstva pro rezervace
- [ ] Push notifikace jako další kanál po e-mail/SMS
- [x] Více poboček / multi-location
- [x] Místnosti/resources
- [x] Skupinové lekce a kapacity
- [x] API a základní integrace pro budoucí partnery

---

## CO NENÍ V PRE-LAUNCH MVP ❌

Po rozhodnutí 2026-05-08 se žádná konkurenčně důležitá funkce výše nevyhazuje ze scope. Pokud se něco nestihne do prvního interního testu, stále zůstává před veřejným spuštěním.

Záměrně mimo pre-launch MVP zůstává jen:

- ❌ Funkce bez jasného produktu a monetizace.
- ❌ Funkce, které by obešly tenant izolaci, bezpečnost, Zod validaci nebo auditovatelnost.
- ❌ AI funkce bez konkrétního provozního workflow a datové bezpečnosti.
- ❌ Provizní marketplace, který bere provizi z vlastních klientů podniku. Katalog/discovery ano, marketplace daň ne.

---

## Průběžná bezpečnost – není fáze, je to podmínka

Bezpečnost NENÍ položka v backlogu.
Je to podmínka každého řádku kódu.
Po rozšíření pre-launch MVP to platí ještě silněji: platby, SMS, POS, importy, mobilní/PWA, více poboček a integrace nesmí vznikat jako rychlé moduly bez bezpečnostního rámce.

### Pravidla která platí od prvního commitu

#### Architektura
- [x] tenant_id na každé tabulce s daty
- [x] RLS policies v Supabase od začátku
- [x] tenant_id se bere VŽDY z JWT tokenu (nikdy z body/params)
- [x] Každá admin server action má auth check jako první bezpečnostní krok

#### Kód
- [x] Zod validace všech vstupů (frontend i backend)
- [x] Žádné API klíče v kódu (env proměnné)
- [x] Error response nikdy nevrací stack trace
- [x] Žádné citlivé údaje v console.log / logách

#### Infrastruktura
- [ ] HTTPS všude (Cloudflare + Vercel) - čeká na deploy
- [x] Rate limiting na auth endpointech od začátku
- [ ] Cloudflare WAF zapnut od prvního deploye

#### Průběžné kontroly
Po každých 5 nových endpointech:
→ Zkontroluj tenant izolaci
→ Zkontroluj validaci vstupů
→ Zkontroluj error handling

Před každým deployem na produkci:
→ npm audit (žádné critical vulnerabilities)
→ Zkontroluj env proměnné (nejsou v kódu?)

Jednou za 2 týdny:
→ Projdi nové endpointy s bezpečnostním skill promptem

### Povinný bezpečnostní checklist pro každou novou pre-launch funkci

- [ ] Definovat, jaká data funkce čte a zapisuje.
- [ ] Ověřit, že `tenant_id` nikdy nepřichází z URL/body/query, ale z auth/JWT kontextu nebo z interně ověřeného veřejného tenantu.
- [ ] Přidat Zod validaci všech vstupů včetně query parametrů, CSV importů, webhooků a callbacků.
- [ ] Přidat DB constrainty pro enumy, délky textů, částky, JSON metadata a stavové přechody.
- [ ] Přidat RLS policy nebo explicitně zdokumentovat, proč jde o service-role veřejný flow.
- [ ] U service-role flow držet allowlist vstupů a nikdy nevracet interní chybu uživateli.
- [ ] Přidat audit event nebo provozní log pro mutaci kritických dat.
- [ ] Přidat testy pro happy path, neplatný vstup, cizí tenant, chybějící oprávnění a bezpečné 500/DB error chování.
- [ ] U plateb/SMS/importů/webhooků přidat idempotenci nebo ochranu proti duplicitnímu zpracování.
- [ ] U osobních dat zajistit export/mazání/omezení viditelnosti podle role.

### Specifická bezpečnost podle modulů

- Platby: částky v haléřích, server-side výpočet zálohy, webhook podpisy, idempotency key, žádné ukládání karetních dat.
- SMS: rate limit, opt-in/legitimate interest evidence, bezpečný provider webhook secret, žádný únik telefonů v logách.
- Import dat: dry-run, limit velikosti souboru, validace sloupců, tenant-only zápis, import audit a rollback plán.
- POS/sklad: owner-only mutace, audit změn tržeb/skladu, žádné záporné částky bez explicitního typu korekce.
- Více poboček: každá query musí filtrovat tenant i povolenou pobočku, pokud bude zaveden branch scope.
- Mobilní/PWA: stejné server-side auth kontroly jako web, žádná důvěra v klientský stav.
- Integrace/sync: uložené tokeny pouze šifrovaně nebo přes bezpečný provider mechanismus, minimální scopes, možnost revokace.

---

## Definice "hotovo" pro MVP

MVP je hotové když:

1. ✅ Podnik se může zaregistrovat a nastavit v < 15 minutách
2. ✅ Klient může rezervovat online bez nutnosti stahovat app
3. ✅ Provozovatel vidí všechny rezervace v kalendáři
4. ✅ Potvrzovací email přijde do 60 sekund
5. ✅ Připomínkový email přijde 24h před termínem
6. ✅ Double-booking není možný
7. ✅ Data jednoho podniku nejsou viditelná jinému podniku
8. ✅ Funguje na mobilu i desktopu
9. ✅ Produkční SMS, online zálohy, waitlist, review request a zdroje rezervací jsou hotové
10. ✅ Google/Outlook sync, iframe widget a pokročilejší zákaznický účet jsou hotové
11. ✅ POS minimum, vouchery/permanentky, reporting tržeb a import dat jsou hotové
12. ✅ Katalog/discovery, marketingové kampaně, Last Minute a mobilní/PWA vrstva jsou hotové

---

## Odhadovaný rozsah MVP

| Oblast | Počet endpointů / komponent | Odhad complexity |
|---|---|---|
| Auth + onboarding | ~6 | M |
| Správa služeb | ~5 | S |
| Správa staffu + hodin | ~8 | M |
| Booking flow (public) | ~4 | L (race conditions) |
| Klientský profil | ~6 | M |
| Kalendář | ~3 komponenty | L (UI složitost) |
| Notifikace | ~4 | M |
| Správa rezervací | ~6 | M |
| Statistiky | ~2 | S |
| **Celkem** | **~44** | **~6–10 týdnů solo** |

S vibecodingem (Codex CLI): **3–5 týdnů** při denní práci.

---

## Pořadí vývoje (doporučené)

```
Vlna 1: Stabilní core
  → Supabase setup + DB migrace
  → Auth (registrace, přihlášení, tenant vytvoření)
  → Nastavení podniku, staff, služby
  → Veřejná booking stránka
  → Real-time dostupnost
  → Potvrzení rezervace
  → Email notifikace

Vlna 2: Provoz a anti-no-show
  → Kalendář (denní + týdenní)
  → Správa rezervací
  → Klientské profily + poznámky
  → SMS provider
  → Online zálohy
  → Waitlist
  → Review request
  → Zdroje rezervací

Vlna 3: Integrace a zákazník
  → Plný zákaznický účet
  → Google/Outlook sync
  → Iframe widget
  → Vlastní doména
  → Import dat

Vlna 4: Business suite
  → POS minimum
  → Účtenky/exporty
  → Sklad minimum
  → Vouchery/permanentky/balíčky
  → Tržby/staff/služby/provize

Vlna 5: Growth a mobilní vrstva
  → Katalog/discovery s mapou
  → Recenze/reputace
  → Kampaně a Last Minute
  → Mobilní/PWA vrstva
  → Více poboček a resources podle potřeby

Průběžně
  → Kompletní bezpečnostní audit
  → Edge cases a error handling
  → Mobilní responzivita
  → Testování s reálným uživatelem
```
