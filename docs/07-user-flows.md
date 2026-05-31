# User Flows – Rezervační systém

## Principy

Systém musí fungovat univerzálně pro:
- Barbershopy a salony
- Dentisty a lékaře
- Masáže a wellness
- Osobní trenéry
- Autoservisy
- Právníky a konzultanty
- Fotografy
- Cokoliv kde se rezervuje čas

Žádný flow nesmí předpokládat konkrétní odvětví.
"Barber" → "Poskytovatel služby"
"Střih" → "Služba"
"Zákazník" → "Klient"

---

## POHLED KLIENTA (zákazník rezervující)

### Flow 1 – Online rezervace (hlavní flow)

```
[1] Vstupní bod
    │
    ├── Odkaz v Instagram biu → source=instagram
    ├── Tlačítko/widget na webu podniku → source=widget
    ├── QR kód v provozovně → source=qr
    ├── Katalog Temaro → source=catalog
    ├── Google profil / mapy → source=google
    └── Přímý URL (podnik.nasesystem.cz) → source=online
    │
    ▼
[2] Výběr služby
    │  - Seznam dostupných služeb
    │  - Název, popis, délka, cena
    │  - Filtr pokud je služeb mnoho
    │
    ▼
[3] Výběr poskytovatele (volitelné)
    │  - "Komukoliv" (první volný)
    │  - Konkrétní osoba (barber, doktor...)
    │  - Zobrazení jen pokud je více poskytovatelů
    │
    ▼
[4] Výběr termínu
    │  - Kalendář s volnými sloty
    │  - Pouze skutečně volné časy
    │  - Zobrazení po dnech (nejbližší dostupné)
    │
    ▼
[5] Zadání kontaktních údajů
    │  - Jméno, telefon, email
    │  - Volitelná poznámka ke službě
    │  - Souhlas s podmínkami
    │
    ▼
[6] Záloha (pokud nastavena provozovatelem)
    │  - Zobrazení výše zálohy
    │  - Platba kartou (Stripe)
    │  - Bez zálohy → přeskočit
    │
    ▼
[7] Potvrzení
    │  - Shrnutí rezervace
    │  - Email s potvrzením + možností zrušit
    │  - SMS připomínka (24h před)
    │  - Uložení zdroje rezervace a UTM/ref metadat pro reporting
    │
    ▼
[8] Správa vlastní rezervace (bez přihlášení)
       - Odkaz v emailu → zobrazení rezervace
       - Možnost zrušit (pokud v rámci storno podmínek)
       - Možnost přesunout (pokud povoleno)
```

---

### Flow 2 – Opakovaný klient

```
[1] Vstupní bod (stejný jako Flow 1)
    │
    ▼
[2] Zadání telefonu nebo emailu
    │  - Systém rozpozná existujícího klienta
    │  - Předvyplní údaje
    │
    ▼
[3] Zobrazení preferovaného poskytovatele
    │  - "Naposledy jsi byl u [Jana], chceš znovu k němu?"
    │
    ▼
[4] Výběr služby → termínu → potvrzení
       (stejné jako Flow 1, ale rychlejší díky předvyplnění)
```

---

### Flow 3 – Walk-in (přímá návštěva bez rezervace)

```
Provozovatel manuálně přidá rezervaci z admin panelu
→ Klient nedělá nic online
→ Systém zaznamená návštěvu do historie klienta
```

---

## POHLED PROVOZOVATELE (admin panel)

### Flow 4 – Správa kalendáře (denní rutina)

```
[1] Přihlášení do admin panelu
    │
    ▼
[2] Dashboard – přehled dne
    │  - Dnešní rezervace (seřazené časově)
    │  - Kdo přichází za hodinu
    │  - Počet volných slotů dnes
    │  - Upozornění: flagovaný klient v kalendáři ⚠️
    │
    ▼
[3] Kalendářový pohled
    │  - Denní / týdenní přepínač
    │  - Barevné rozlišení poskytovatelů
    │  - Drag & drop přesunutí rezervace
    │  - Kliknutí na rezervaci → detail
    │
    ▼
[4] Detail rezervace
       - Jméno klienta + historie + poznámky
       - Možnosti: Dokončit | Zrušit | No-show | Přesunout
       - Pokud "No-show" → no_show_count++ automaticky
```

---

### Flow 5 – Správa klienta

```
[1] Vyhledání klienta (jméno / telefon / email)
    │
    ▼
[2] Profil klienta
    │  - Základní info
    │  - Historie rezervací
    │  - No-show počítadlo
    │  - Interní poznámky (jen provozovatel vidí)
    │  - Preference (fade číslo, styl, alergie...)
    │  - Fotky (před/po, referenční fotky)
    │  - Status: ✅ normální | ⚠️ varování | ❌ blacklist
    │
    ▼
[3] Akce
       - Přidat poznámku
       - Přidat fotku
       - Označit jako flagovaný + důvod
       - Zablokovat (blacklist)
       - Ruční rezervace pro tohoto klienta
```

---

### Flow 6 – Manuální přidání rezervace

```
[1] Kliknutí na volný slot v kalendáři
    │  NEBO tlačítko "Nová rezervace"
    │
    ▼
[2] Výběr nebo vytvoření klienta
    │  - Vyhledání existujícího
    │  - Nebo rychlé vytvoření (jméno + telefon)
    │  - Nebo "walk-in" (bez klienta)
    │
    ▼
[3] Výběr služby + poskytovatele + času
    │
    ▼
[4] Uložení
       - Notifikace klientovi? (ano/ne přepínač)
       - Rezervace se zobrazí v kalendáři
```

---

### Flow 7 – Nastavení podniku (onboarding)

```
[1] Registrace / přihlášení
    │
    ▼
[2] Základní nastavení podniku
    │  - Název, adresa, telefon
    │  - Timezone, jazyk, měna
    │  - Logo
    │
    ▼
[3] Přidání poskytovatelů (staff)
    │  - Jméno, foto, barva v kalendáři
    │  - Pracovní hodiny (každý den zvlášť)
    │
    ▼
[4] Přidání služeb
    │  - Název, popis, délka, cena
    │  - Kdo ze staffu tuto službu dělá
    │
    ▼
[5] Nastavení booking stránky
    │  - URL podniku (podnik.nasesystem.cz)
    │  - Barvy a branding
    │  - Storno podmínky
    │  - Záloha (ano/ne, kolik %)
    │
    ▼
[6] Hotovo – získání odkazu pro sdílení
       - Instagram bio odkaz
       - Widget kód pro vlastní web
       - QR kód ke stažení
```

---

### Flow 8 – No-show handling

```
Klient nedorazí
    │
    ▼
Provozovatel označí jako "No-show" v kalendáři
    │
    ▼
Automaticky:
    ├── no_show_count++ na profilu klienta
    ├── Záznam do historie
    └── (volitelně) Automatický SMS/email klientovi
        "Dnes jste nedorazili na termín. 
         Pro novou rezervaci záloha povinná."

Pokud no_show_count >= 3:
    └── Upozornění provozovateli
        "Tento klient nedorazil 3x. 
         Doporučujeme označit jako flagovaný."
```

---

### Flow 9 – Blacklist flow

```
Provozovatel označí klienta jako blacklisted
    │
    ▼
Klient se pokusí rezervovat online
    │
    ▼
Systém odmítne rezervaci
    └── Zobrazí zprávu:
        "Bohužel nemůžeme přijmout vaši rezervaci.
         Kontaktujte nás přímo." 
        (bez vysvětlení proč – GDPR friendly)
```

---

## POHLED ZAMĚSTNANCE (staff bez admin práv)

### Flow 10 – Omezený přístup staffu

```
Zaměstnanec se přihlásí
    │
    ▼
Vidí POUZE:
    ├── Svůj vlastní kalendář
    ├── Své dnešní rezervace
    ├── Profily klientů (číst)
    └── Možnost označit no-show / dokončit

Nevidí:
    ├── Ostatní zaměstnance (pokud owner nezapne)
    ├── Finanční statistiky
    ├── Nastavení podniku
    └── Billing / předplatné
```

---

## NOTIFIKAČNÍ FLOW

### Automatické notifikace

```
Po rezervaci:
  → Email klientovi: potvrzení + odkaz na zrušení

24 hodin před:
  → SMS klientovi: připomínka termínu
  → Email klientovi: připomínka termínu

2 hodiny před:
  → (volitelně) SMS připomínka

Po dokončení:
  → (volitelně) Email: "Jak se vám líbilo? Ohodnoťte nás"

Po no-show:
  → (volitelně) SMS/email: "Nestihli jste termín?"

Po zrušení klientem:
  → Email provozovateli: klient zrušil rezervaci
  → (volitelně) Nabídka náhradního termínu
```

---

## EDGE CASES – co musí systém řešit

### Rezervace
- Dva klienti reservují stejný slot ve stejnou chvíli → transakce v DB, druhý dostane chybu
- Klient rezervuje v minulosti → validace na frontendu i backendu
- Klient rezervuje mimo pracovní hodiny → systém nezobrazí tyto sloty
- Poskytovatel má výjimku (dovolená) → sloty automaticky nedostupné

### Klienti
- Blacklistovaný klient zkusí rezervovat → odmítnuto, ale zdvořilá zpráva
- Klient změní email → zachovat historii pod starým emailem
- Dva klienti se stejným jménem → rozlišení podle telefonu/emailu

### Notifikace
- Email se neodešle → retry logika, log chyby
- SMS selže → fallback na email, log chyby
- Klient nemá email ani telefon → přeskočit notifikaci, varování v admin

### Záloha
- Platba se nepovede → rezervace se neuloží
- Klient zruší po storno lhůtě → záloha propadá (Stripe hold)
- Stripe webhook selže → idempotency key zabrání double charge
