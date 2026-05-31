import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      process.env[key] ??= value;
    }
  } catch {
    // Missing .env.local is valid for pure demo mode.
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Chybí NEXT_PUBLIC_SUPABASE_URL nebo SUPABASE_SERVICE_ROLE_KEY v .env.local.");
  console.error("Bez service role klíče nelze bezpečně seedovat tenant data mimo RLS.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
});

function localDateAt(dayOffset, hour, minute = 0) {
  const value = new Date();
  value.setDate(value.getDate() + dayOffset);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

function localDateKey(dayOffset) {
  return localDateAt(dayOffset, 12).slice(0, 10);
}

function addMinutes(isoValue, minutes) {
  return new Date(new Date(isoValue).getTime() + minutes * 60_000).toISOString();
}

async function requireNoError(result, label) {
  const resolvedResult = await result;

  if (resolvedResult.error) {
    console.error(`${label}: ${resolvedResult.error.message}`);
    process.exit(1);
  }

  return resolvedResult.data;
}

async function warnOnError(result, label) {
  const resolvedResult = await result;

  if (resolvedResult.error) {
    console.warn(`${label}: ${resolvedResult.error.message}`);
    return null;
  }

  return resolvedResult.data;
}

function createTenantIds(tenantId) {
  function uuidFor(key) {
    const hex = createHash("sha1").update(`temaro-demo-seed:${tenantId}:${key}`).digest("hex").slice(0, 32);
    const variant = ((Number.parseInt(hex.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0");

    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      `4${hex.slice(13, 16)}`,
      `${variant}${hex.slice(18, 20)}`,
      hex.slice(20, 32),
    ].join("-");
  }

  return {
    services: {
      haircut: uuidFor("service:haircut"),
      beard: uuidFor("service:beard"),
      color: uuidFor("service:color"),
      kids: uuidFor("service:kids"),
      consultation: uuidFor("service:consultation"),
    },
    staff: {
      jan: uuidFor("staff:jan"),
      eva: uuidFor("staff:eva"),
      tomas: uuidFor("staff:tomas"),
    },
    clients: {
      petr: uuidFor("client:petr"),
      lucie: uuidFor("client:lucie"),
      martin: uuidFor("client:martin"),
      anna: uuidFor("client:anna"),
      tereza: uuidFor("client:tereza"),
      jakub: uuidFor("client:jakub"),
      marek: uuidFor("client:marek"),
    },
    hours: (staffKey, day) => uuidFor(`staff-hour:${staffKey}:${day}`),
    exceptions: {
      janTraining: uuidFor("staff-exception:jan-training"),
      evaEvent: uuidFor("staff-exception:eva-event"),
    },
    bookings: (index) => uuidFor(`booking:${index}`),
    bookingEvents: (index, eventType) => uuidFor(`booking-event:${index}:${eventType}`),
  };
}

async function resolveTenantIds() {
  if (process.env.SEED_TENANT_ID) {
    return [process.env.SEED_TENANT_ID];
  }

  const tenants = await requireNoError(
    supabase.from("tenants").select("id, name, slug").is("deleted_at", null),
    "Nepodařilo se načíst tenanty",
  );

  if (tenants.length === 0) {
    console.error("V databázi není žádný tenant. Nejdřív v aplikaci registruj podnik.");
    process.exit(1);
  }

  if (tenants.length > 1) {
    console.log(`Nalezeno ${tenants.length} tenantů. Seed poběží pro všechny aktivní tenanty.`);
    console.log("Pro jeden konkrétní tenant použij: SEED_TENANT_ID=<tenant_uuid> npm run seed:demo");
  }

  return tenants.map((tenant) => tenant.id);
}

function makeRows(tenantId) {
  const ids = createTenantIds(tenantId);
  const now = new Date().toISOString();
  const services = [
    {
      id: ids.services.haircut,
      tenant_id: tenantId,
      name: "Pánský střih",
      description: "Konzultace, mytí, střih a finální styling.",
      duration_minutes: 45,
      price: 59000,
      currency: "CZK",
      buffer_minutes: 5,
      is_active: true,
      position: 1,
      deleted_at: null,
    },
    {
      id: ids.services.beard,
      tenant_id: tenantId,
      name: "Vousy a kontury",
      description: "Úprava vousů, kontury břitvou a zklidňující péče.",
      duration_minutes: 30,
      price: 39000,
      currency: "CZK",
      buffer_minutes: 5,
      is_active: true,
      position: 2,
      deleted_at: null,
    },
    {
      id: ids.services.color,
      tenant_id: tenantId,
      name: "Střih + barvení",
      description: "Delší návštěva pro výraznější změnu účesu.",
      duration_minutes: 90,
      price: 149000,
      currency: "CZK",
      buffer_minutes: 10,
      is_active: true,
      position: 3,
      deleted_at: null,
    },
    {
      id: ids.services.kids,
      tenant_id: tenantId,
      name: "Dětský střih",
      description: "Rychlý střih pro děti do 12 let.",
      duration_minutes: 30,
      price: 35000,
      currency: "CZK",
      buffer_minutes: 5,
      is_active: true,
      position: 4,
      deleted_at: null,
    },
    {
      id: ids.services.consultation,
      tenant_id: tenantId,
      name: "Konzultace změny stylu",
      description: "Krátká konzultace před větší změnou nebo focením.",
      duration_minutes: 20,
      price: 25000,
      currency: "CZK",
      buffer_minutes: 0,
      is_active: true,
      position: 5,
      deleted_at: null,
    },
  ];

  const staff = [
    {
      id: ids.staff.jan,
      tenant_id: tenantId,
      user_id: null,
      name: "Jan Novák",
      bio: "Klasické střihy, precizní kontury a práce s vousy.",
      avatar_url: null,
      color: "#111827",
      is_active: true,
      deleted_at: null,
    },
    {
      id: ids.staff.eva,
      tenant_id: tenantId,
      user_id: null,
      name: "Eva Králová",
      bio: "Rychlé střihy, styling a barevné úpravy.",
      avatar_url: null,
      color: "#0f766e",
      is_active: true,
      deleted_at: null,
    },
    {
      id: ids.staff.tomas,
      tenant_id: tenantId,
      user_id: null,
      name: "Tomáš Dvořák",
      bio: "Vousy, kontury a kratší technické střihy.",
      avatar_url: null,
      color: "#b45309",
      is_active: true,
      deleted_at: null,
    },
  ];

  const staffHours = [
    ...[0, 1, 2, 3, 4].map((day) => ({
      id: ids.hours("jan", day),
      staff_id: ids.staff.jan,
      tenant_id: tenantId,
      day_of_week: day,
      start_time: "09:00:00",
      end_time: "17:00:00",
      is_working: true,
    })),
    ...[1, 2, 3, 4, 5].map((day) => ({
      id: ids.hours("eva", day),
      staff_id: ids.staff.eva,
      tenant_id: tenantId,
      day_of_week: day,
      start_time: "10:00:00",
      end_time: "18:00:00",
      is_working: true,
    })),
    ...[0, 2, 3, 4, 5].map((day) => ({
      id: ids.hours("tomas", day),
      staff_id: ids.staff.tomas,
      tenant_id: tenantId,
      day_of_week: day,
      start_time: "08:00:00",
      end_time: "15:00:00",
      is_working: true,
    })),
  ];

  const staffExceptions = [
    {
      id: ids.exceptions.janTraining,
      staff_id: ids.staff.jan,
      tenant_id: tenantId,
      date: localDateKey(2),
      is_working: false,
      start_time: null,
      end_time: null,
      note: "Školení mimo provozovnu",
    },
    {
      id: ids.exceptions.evaEvent,
      staff_id: ids.staff.eva,
      tenant_id: tenantId,
      date: localDateKey(5),
      is_working: true,
      start_time: "12:00:00",
      end_time: "20:00:00",
      note: "Prodloužená směna kvůli eventu",
    },
  ];

  const staffServices = [
    [ids.staff.jan, ids.services.haircut],
    [ids.staff.jan, ids.services.beard],
    [ids.staff.jan, ids.services.kids],
    [ids.staff.eva, ids.services.haircut],
    [ids.staff.eva, ids.services.color],
    [ids.staff.eva, ids.services.consultation],
    [ids.staff.tomas, ids.services.haircut],
    [ids.staff.tomas, ids.services.beard],
    [ids.staff.tomas, ids.services.consultation],
  ].map(([staff_id, service_id]) => ({ tenant_id: tenantId, staff_id, service_id }));

  const clients = [
    {
      id: ids.clients.petr,
      tenant_id: tenantId,
      full_name: "Petr Svoboda",
      phone: "+420 777 123 456",
      email: "petr@example.com",
      notes: "Má rád kratší boky. Nabídnout ranní termíny.",
      no_show_count: 1,
      is_flagged: true,
      flag_reason: "Jednou nedorazil bez včasné omluvy.",
      is_blacklisted: false,
      preferred_staff_id: ids.staff.jan,
      deleted_at: null,
    },
    {
      id: ids.clients.lucie,
      tenant_id: tenantId,
      full_name: "Lucie Horáková",
      phone: "+420 608 222 900",
      email: "lucie@example.com",
      notes: "Preferuje Evu a delší konzultaci před barvením.",
      no_show_count: 0,
      is_flagged: false,
      flag_reason: null,
      is_blacklisted: false,
      preferred_staff_id: ids.staff.eva,
      deleted_at: null,
    },
    {
      id: ids.clients.martin,
      tenant_id: tenantId,
      full_name: "Martin Černý",
      phone: "+420 721 555 010",
      email: "martin@example.com",
      notes: "Chodí pravidelně po obědě, rychlá komunikace po telefonu.",
      no_show_count: 0,
      is_flagged: false,
      flag_reason: null,
      is_blacklisted: false,
      preferred_staff_id: ids.staff.tomas,
      deleted_at: null,
    },
    {
      id: ids.clients.anna,
      tenant_id: tenantId,
      full_name: "Anna Procházková",
      phone: "+420 739 456 111",
      email: "anna@example.com",
      notes: "Nosí vlastní fotku inspirace, chce tichý termín bez spěchu.",
      no_show_count: 0,
      is_flagged: false,
      flag_reason: null,
      is_blacklisted: false,
      preferred_staff_id: ids.staff.eva,
      deleted_at: null,
    },
    {
      id: ids.clients.tereza,
      tenant_id: tenantId,
      full_name: "Tereza Malá",
      phone: "+420 604 101 202",
      email: "tereza@example.com",
      notes: "Dětský střih pro syna, krátké termíny ideálně dopoledne.",
      no_show_count: 0,
      is_flagged: false,
      flag_reason: null,
      is_blacklisted: false,
      preferred_staff_id: ids.staff.jan,
      deleted_at: null,
    },
    {
      id: ids.clients.jakub,
      tenant_id: tenantId,
      full_name: "Jakub Vávra",
      phone: "+420 775 300 400",
      email: "jakub@example.com",
      notes: "Vousy co 3 týdny, chce připomenout domácí péči.",
      no_show_count: 2,
      is_flagged: true,
      flag_reason: "Dvakrát přesun na poslední chvíli.",
      is_blacklisted: false,
      preferred_staff_id: ids.staff.tomas,
      deleted_at: null,
    },
    {
      id: ids.clients.marek,
      tenant_id: tenantId,
      full_name: "Marek Bartoš",
      phone: "+420 777 889 900",
      email: "marek@example.com",
      notes: "Nový klient z Instagramu, chce konzultaci stylu.",
      no_show_count: 0,
      is_flagged: false,
      flag_reason: null,
      is_blacklisted: false,
      preferred_staff_id: null,
      deleted_at: null,
    },
  ];

  const bookingInput = [
    [ids.bookings(1), ids.clients.martin, ids.staff.tomas, ids.services.haircut, -6, 9, "completed", "manual", "Dokončeno, klient koupil stylingovou pastu."],
    [ids.bookings(2), ids.clients.jakub, ids.staff.tomas, ids.services.beard, -3, 13, "no_show", "online", "Klient nedorazil, volat před další rezervací."],
    [ids.bookings(3), ids.clients.lucie, ids.staff.eva, ids.services.color, -1, 11, "completed", "online", "Barva sedla, další návštěva za 6 týdnů."],
    [ids.bookings(4), ids.clients.petr, ids.staff.jan, ids.services.haircut, 0, 9, "confirmed", "online", "Dnes z webu, klient je flagovaný."],
    [ids.bookings(5), ids.clients.anna, ids.staff.eva, ids.services.consultation, 0, 10, "pending", "instagram", "Čeká na potvrzení po konzultaci stylu."],
    [ids.bookings(13), ids.clients.martin, ids.staff.tomas, ids.services.beard, 0, 10, "confirmed", "manual", "Překryv s Evou pro ukázku více zaměstnanců v jednom čase.", 5],
    [ids.bookings(14), ids.clients.lucie, ids.staff.jan, ids.services.consultation, 0, 10, "confirmed", "online", "Krátká služba ve stejném časovém okně jako další zaměstnanci.", 10],
    [ids.bookings(6), ids.clients.tereza, ids.staff.jan, ids.services.kids, 0, 13, "confirmed", "manual", "Dětský střih, přijde s doprovodem."],
    [ids.bookings(7), ids.clients.marek, ids.staff.tomas, ids.services.beard, 0, 14, "confirmed", "instagram", "Nový klient, přišel z profilu na Instagramu."],
    [ids.bookings(8), null, ids.staff.eva, ids.services.haircut, 1, 12, "confirmed", "manual", "Walk-in rezervace vytvořená telefonicky."],
    [ids.bookings(15), ids.clients.jakub, ids.staff.tomas, ids.services.haircut, 1, 12, "pending", "online", "Ukázka překryvu přes polední slot s jiným zaměstnancem.", 15],
    [ids.bookings(16), ids.clients.petr, ids.staff.jan, ids.services.beard, 1, 12, "confirmed", "manual", "Třetí překryv pro kontrolu vrstvení barevných eventů.", 30],
    [ids.bookings(9), ids.clients.lucie, ids.staff.eva, ids.services.color, 2, 15, "pending", "online", "Potvrdit dostupnost delšího slotu."],
    [ids.bookings(10), ids.clients.martin, ids.staff.tomas, ids.services.haircut, 3, 8, "confirmed", "online", "Ranní termín před prací."],
    [ids.bookings(11), ids.clients.petr, ids.staff.jan, ids.services.beard, 4, 16, "cancelled", "online", "Zrušeno přes self-service odkaz."],
    [ids.bookings(12), ids.clients.anna, ids.staff.eva, ids.services.haircut, 6, 17, "confirmed", "online", "Večerní termín po práci."],
  ];

  const servicesById = new Map(services.map((service) => [service.id, service]));
  const bookings = bookingInput.map(([id, client_id, staff_id, service_id, dayOffset, hour, status, source, notes, minute = 0]) => {
    const starts_at = localDateAt(dayOffset, hour, minute);
    const service = servicesById.get(service_id);
    const ends_at = addMinutes(starts_at, (service?.duration_minutes ?? 30) + (service?.buffer_minutes ?? 0));
    const isCancelled = status === "cancelled";

    return {
      id,
      tenant_id: tenantId,
      client_id,
      staff_id,
      service_id,
      starts_at,
      ends_at,
      status,
      deposit_amount: 0,
      deposit_paid: false,
      deposit_paid_at: null,
      notes,
      source,
      cancellation_reason: isCancelled ? "Klient přesunul termín kvůli práci." : null,
      cancelled_at: isCancelled ? localDateAt(dayOffset - 1, 16, 30) : null,
      cancelled_by: null,
      updated_at: now,
    };
  });

  const bookingEvents = bookings.flatMap((booking, index) => {
    const createdEvent = {
      id: ids.bookingEvents(index + 1, "created"),
      tenant_id: tenantId,
      booking_id: booking.id,
      actor_user_id: null,
      actor_type: booking.source === "manual" ? "owner" : "client",
      event_type: "created",
      metadata: { source: booking.source, seed: "demo" },
      created_at: booking.created_at ?? now,
    };

    if (booking.status === "pending") {
      return [createdEvent];
    }

    const statusEvent = {
      id: ids.bookingEvents(index + 1, booking.status),
      tenant_id: tenantId,
      booking_id: booking.id,
      actor_user_id: null,
      actor_type: booking.status === "cancelled" ? "client" : "owner",
      event_type: booking.status,
      metadata: { seed: "demo" },
      created_at: booking.updated_at,
    };

    return [createdEvent, statusEvent];
  });

  return {
    bookings,
    bookingEvents,
    clients,
    services,
    staff,
    staffExceptions,
    staffHours,
    staffServices,
  };
}

async function main() {
  const tenantIds = await resolveTenantIds();

  for (const tenantId of tenantIds) {
    const rows = makeRows(tenantId);

    await requireNoError(supabase.from("services").upsert(rows.services, { onConflict: "id" }), "Seed služeb selhal");
    await requireNoError(supabase.from("staff").upsert(rows.staff, { onConflict: "id" }), "Seed týmu selhal");
    await requireNoError(supabase.from("staff_hours").upsert(rows.staffHours, { onConflict: "id" }), "Seed pracovní doby selhal");
    await requireNoError(supabase.from("staff_exceptions").upsert(rows.staffExceptions, { onConflict: "id" }), "Seed výjimek selhal");
    await requireNoError(supabase.from("staff_services").upsert(rows.staffServices, { onConflict: "staff_id,service_id" }), "Seed vazeb služeb selhal");
    await requireNoError(supabase.from("clients").upsert(rows.clients, { onConflict: "id" }), "Seed klientů selhal");
    await requireNoError(supabase.from("bookings").upsert(rows.bookings, { onConflict: "id" }), "Seed rezervací selhal");
    await warnOnError(supabase.from("booking_events").upsert(rows.bookingEvents, { onConflict: "id" }), "Seed audit historie byl přeskočen");

    console.log(`Demo data byla nahrána do tenantu ${tenantId}.`);
    console.log(`Služby: ${rows.services.length}, tým: ${rows.staff.length}, klienti: ${rows.clients.length}, rezervace: ${rows.bookings.length}.`);
  }
}

await main();
