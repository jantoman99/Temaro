# Databázový model – Rezervační systém

## Filozofie

- Multi-tenancy: Shared DB + tenant_id na každém řádku
- Row Level Security (RLS) v Supabase jako pojistka
- PostgreSQL – relační integrita + JSONB flexibilita
- Soft delete (deleted_at) místo fyzického mazání
- Tento dokument popisuje aktualni stav podle `supabase/migrations`

## Poznamka ke scope

- Nize jsou vypsane tabulky, ktere jsou aktualne skutecne v migracich.
- Veci planovane na pozdeji, ale zatim nerealizovane:
  - `client_preferences`
  - `client_photos`
  - `client_notes`
  - `subscriptions`

---

## Schéma

### tenants
Každý podnik (barbershop, salon) = jeden tenant.

```sql
CREATE TABLE tenants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,              -- "Karel's Barbershop"
  slug            TEXT NOT NULL,              -- "karels-barbershop" (pro URL)
  plan            TEXT DEFAULT 'free',        -- free | pro | team
  plan_expires_at TIMESTAMPTZ,
  timezone        TEXT DEFAULT 'Europe/Prague',
  locale          TEXT DEFAULT 'cs',
  default_currency TEXT DEFAULT 'CZK',
  cancellation_notice_hours SMALLINT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ                 -- soft delete
);

-- slug je v DB unikatni case-insensitive jen pro aktivni tenanty:
-- UNIQUE INDEX ON lower(slug) WHERE deleted_at IS NULL
-- timezone je DB checkem omezena na Europe/Prague, Europe/Bratislava nebo UTC
-- locale je DB checkem omezene na cs, sk nebo en
-- default_currency je DB checkem omezena na CZK nebo EUR
```

---

### users
Provozovatelé a zaměstnanci. Jeden user může být ve více tenantech.

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY REFERENCES auth.users(id),
  email           TEXT UNIQUE NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Propojení user ↔ tenant s rolí
CREATE TABLE tenant_users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  role            TEXT NOT NULL DEFAULT 'staff', -- owner | staff
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);
```

---

### staff
Zaměstnanci / barbeři s pracovní dobou.

```sql
CREATE TABLE staff (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  user_id         UUID REFERENCES users(id),  -- může být null (externí barber)
  name            TEXT NOT NULL,
  bio             TEXT,
  avatar_url      TEXT,
  color           TEXT,                        -- barva v kalendáři (#FF5733)
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Pracovní hodiny každého barberem
CREATE TABLE staff_hours (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  day_of_week     SMALLINT NOT NULL,           -- 0=pondělí, 6=neděle
  start_time      TIME NOT NULL,               -- "09:00"
  end_time        TIME NOT NULL,               -- "18:00"
  is_working      BOOLEAN DEFAULT true
);

-- Výjimky (dovolená, nemoc, speciální hodiny)
CREATE TABLE staff_exceptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id        UUID NOT NULL REFERENCES staff(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  date            DATE NOT NULL,
  is_working      BOOLEAN DEFAULT false,       -- false = volno
  start_time      TIME,                        -- přepis hodin pro daný den
  end_time        TIME,
  note            TEXT
);
```

Poznamka:
- Kdyz `is_working = false`, databaze vyzaduje prazdne `start_time` i `end_time`.
- Kdyz `is_working = true`, databaze vyzaduje vyplnene casy a `start_time < end_time`.

---

### services
Služby které barber nabízí.

```sql
CREATE TABLE services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            TEXT NOT NULL,               -- "Střih + úprava vousu"
  description     TEXT,
  duration_minutes SMALLINT NOT NULL,          -- 45
  price           INTEGER NOT NULL,            -- v haléřích (4500 = 45 Kč)
  currency        TEXT DEFAULT 'CZK',
  buffer_minutes  SMALLINT DEFAULT 0,          -- čas po službě (úklid)
  is_active       BOOLEAN DEFAULT true,
  position        SMALLINT DEFAULT 0,          -- pořadí v seznamu
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

-- Které služby může dělat který barber
CREATE TABLE staff_services (
  staff_id        UUID NOT NULL REFERENCES staff(id),
  service_id      UUID NOT NULL REFERENCES services(id),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  PRIMARY KEY (staff_id, service_id)
);
```

---

### clients
Zakaznici – klicova tabulka s poznamkami a flagem.

```sql
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  full_name       TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  notes           TEXT,                        -- INTERNÍ poznámky (jen barber vidí)
  no_show_count   SMALLINT DEFAULT 0,          -- počítadlo nedorazení
  is_flagged      BOOLEAN DEFAULT false,       -- ⚠️ varování při rezervaci
  flag_reason     TEXT,                        -- důvod varování/blacklistu
  is_blacklisted  BOOLEAN DEFAULT false,       -- ❌ blokace rezervace
  preferred_staff_id UUID REFERENCES staff(id), -- oblíbený barber
  created_at      TIMESTAMPTZ DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);
```

Poznamka:
- `client_preferences`, `client_photos` a `client_notes` zatim nejsou v migracich.
- Jsou to pozdejsi rozsireni mimo aktualni MVP.

---

### bookings
Rezervace – srdce systému.

```sql
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  client_id       UUID REFERENCES clients(id), -- null = walk-in
  staff_id        UUID NOT NULL REFERENCES staff(id),
  service_id      UUID NOT NULL REFERENCES services(id),

  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,

  status          TEXT NOT NULL DEFAULT 'confirmed',
  -- pending | confirmed | completed | cancelled | no_show

  -- Záloha
  deposit_amount  INTEGER DEFAULT 0,           -- v haléřích
  deposit_paid    BOOLEAN DEFAULT false,
  deposit_paid_at TIMESTAMPTZ,

  -- Metadata
  notes           TEXT,                        -- poznámka k rezervaci
  source          TEXT DEFAULT 'manual',
  -- manual | online | instagram | qr | widget | catalog | google | referral
  source_detail   TEXT,                        -- např. název kampaně nebo umístění QR
  source_metadata JSONB DEFAULT '{}',          -- omezené UTM/ref metadata
  cancellation_reason TEXT,
  cancelled_at    TIMESTAMPTZ,
  cancelled_by    UUID REFERENCES users(id),

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Index pro rychlé vyhledávání podle data
CREATE INDEX bookings_starts_at_idx ON bookings(tenant_id, starts_at);
CREATE INDEX bookings_staff_idx ON bookings(tenant_id, staff_id, starts_at);
CREATE INDEX bookings_source_idx ON bookings(tenant_id, source, starts_at);

-- V DB je navic tvrda ochrana proti prekryvu rezervaci jednoho clena staffu:
-- EXCLUDE USING gist (tenant_id, staff_id, tstzrange(starts_at, ends_at, '[)'))
-- jen pro stavy pending a confirmed
```

Poznamka:
- Verejny booking a self-service presun navic pouzivaji DB helper `is_staff_available_for_booking`.
- Ten hlida, ze termin spada do bezne pracovni doby nebo do specialni pracovni vyjimky zamestnance.
- Rucni admin rezervace zustava flexibilni, ale double-booking stale blokuje DB constraint.
- `source_metadata` musi byt JSON object do 2000 znaku; `source_detail` je omezeny na 120 znaku.
- Verejny booking nesmi posilat `manual` jako zdroj; ten zustava jen pro admin/manual flow.

### waitlist_entries
Čekací listina pro obsazené služby a poptávku bez volného termínu.

```sql
CREATE TABLE waitlist_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  client_id       UUID REFERENCES clients(id),
  service_id      UUID NOT NULL,
  staff_id        UUID,

  preferred_from  TIMESTAMPTZ,
  preferred_to    TIMESTAMPTZ,

  client_name     TEXT NOT NULL,
  client_phone    TEXT,
  client_email    TEXT,
  notes           TEXT,

  source          TEXT DEFAULT 'online',
  -- online | instagram | qr | widget | catalog | google | referral
  source_detail   TEXT,
  source_metadata JSONB DEFAULT '{}',

  status          TEXT DEFAULT 'active',
  -- active | offered | booked | cancelled | expired

  offered_booking_id UUID REFERENCES bookings(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
```

Poznamka:
- Tabulka je tenant izolovana pres composite FK na `services`, `staff` a `bookings`.
- RLS je owner-only pro dashboard; verejny zapis jde pouze pres `create_waitlist_entry` dostupne jen `service_role`.
- Verejny zapis validuje aktivni tenant, sluzbu, volitelneho zamestnance, kontakt, blacklist klienta, allowlist zdroje a velikost tracking metadat.
- Aktivni duplicitni zaznam pro stejnou sluzbu/staff/kontakt se aktualizuje misto vytvoreni dalsiho radku.

### booking_events
Auditni historie zmen rezervace.

```sql
CREATE TABLE booking_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  actor_user_id   UUID REFERENCES users(id),
  actor_type      TEXT NOT NULL,               -- owner | staff | client | system
  event_type      TEXT NOT NULL,               -- created | confirmed | rejected | rescheduled | cancelled | completed | no_show
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

### booking_payments
Tenant izolovana evidence plateb k rezervacim.

```sql
CREATE TABLE booking_payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id),
  booking_id          UUID NOT NULL REFERENCES bookings(id),
  amount              INTEGER NOT NULL,        -- v halerich/centech
  currency            TEXT NOT NULL DEFAULT 'CZK',
  payment_scope       TEXT NOT NULL,           -- deposit | balance | full | other
  method              TEXT NOT NULL,           -- cash | card_present | bank_transfer | online_card | voucher | other
  status              TEXT NOT NULL DEFAULT 'paid',
  provider            TEXT,                    -- napr. stripe
  provider_payment_id TEXT,                    -- pro Stripe Checkout session id
  note                TEXT,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT now()
);
```

Poznamka:
- Manualni platby zapisuje owner z detailu rezervace.
- Online zaloha pres Stripe pouziva `provider = 'stripe'`, `method = 'online_card'`, `payment_scope = 'deposit'` a `provider_payment_id` jako Checkout session id.
- Webhook po zaplaceni nastavuje odpovidajici platbu na `paid`, aktualizuje `bookings.deposit_paid` a uklada `booking_events.payment_recorded`.
- Karetní data se v databazi Temara nikdy neukladaji.

---

### notifications
Plánované a odeslané notifikace.

```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  booking_id      UUID REFERENCES bookings(id),
  client_id       UUID REFERENCES clients(id),

  type            TEXT NOT NULL,               -- confirmation | reminder | cancellation | no_show_followup | owner_booking_created | reschedule
  channel         TEXT NOT NULL,               -- email | sms
  recipient       TEXT NOT NULL,               -- email nebo tel. číslo
  status          TEXT DEFAULT 'pending',      -- pending | processing | sent | failed | skipped
  scheduled_at    TIMESTAMPTZ NOT NULL,
  processing_started_at TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  error           TEXT,

  created_at      TIMESTAMPTZ DEFAULT now()
);
```

---

### booking_self_service_tokens
Hashovane tokeny pro verejnou spravu jedne rezervace bez prihlaseni.

```sql
CREATE TABLE booking_self_service_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  token_hash      TEXT NOT NULL UNIQUE,
  purpose         TEXT NOT NULL DEFAULT 'manage_booking',
  expires_at      TIMESTAMPTZ NOT NULL,
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

Poznamka:
- `subscriptions` tabulka zatim v migracich neni.
- Predplatne Temara je az pozdejsi faze; platby rezervaci jsou v `booking_payments`.

---

## RLS Policies (Supabase)

```sql
-- Příklad: barber vidí jen rezervace svého tenanta
CREATE POLICY "tenant_isolation" ON bookings
  FOR ALL
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

-- Stejně pro všechny tabulky s tenant_id
-- clients, services, staff, notifications...
```

---

## Vztahy (ERD přehled)

```
tenants
  ├── tenant_users → users
  ├── staff
  │     ├── staff_hours
  │     ├── staff_exceptions
  │     └── staff_services → services
  ├── clients
  ├── bookings
  │     ├── booking_payments
  │     ├── notifications
  │     ├── booking_events
  │     └── booking_self_service_tokens
```

---

## Cenové hodnoty

Ceny ukládáme vždy jako INTEGER v haléřích/centech:
- 4500 = 45,00 Kč
- Zabraňuje problémům s plovoucí desetinnou čárkou při platbách

---

## Co řešíme v dalších vrstvách

- `tenant_locations` – více poboček je založené jako evidence; další vrstva je napojení pobočky na služby, staff, booking dostupnost a reporting
- `group_classes` / `group_class_attendees` – skupinové lekce jsou založené jako evidence s atomickou kapacitou; další vrstva je veřejné přihlášení klientů
- `inventory_products` – produkty/sklad jsou založené jako evidence a pohyby; další vrstva je prodej produktů přímo přes POS
- `loyalty_points` – věrnostní program
- `vouchers` – dárkové poukazy jsou založené; další vrstva je jejich napojení do klientského checkoutu
- `clients.preferred_contact_channel`, `preferred_time_of_day`, `preference_notes`, `client_tier` – klientské preference a trusted/risk profil jsou první strukturovaná vrstva nad poznámkami
- `referral_programs` / `referral_codes` – doporučovací programy a hashované referral kódy; další vrstva je veřejné uplatnění kódu při bookingu
- `staff_commission_rules` – provizní pravidla týmu; další vrstva je uzávěrka payroll/cashflow podle pilotní potřeby
