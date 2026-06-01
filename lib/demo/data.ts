import type { Database } from "@/types/database";

type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
type Service = Database["public"]["Tables"]["services"]["Row"];
type Staff = Database["public"]["Tables"]["staff"]["Row"] & {
  staff_exceptions: Database["public"]["Tables"]["staff_exceptions"]["Row"][];
  staff_hours: Database["public"]["Tables"]["staff_hours"]["Row"][];
  staff_services: Database["public"]["Tables"]["staff_services"]["Row"][];
};
type Client = Database["public"]["Tables"]["clients"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"] & {
  clients:
    | Pick<Client, "email" | "flag_reason" | "full_name" | "is_flagged" | "no_show_count" | "phone">
    | null;
  services: Pick<Service, "currency" | "duration_minutes" | "name" | "price"> | null;
  staff: Pick<Staff, "color" | "name"> | null;
};

const tenantId = "00000000-0000-4000-8000-000000000001";

const serviceHaircutId = "00000000-0000-4000-8000-000000000101";
const serviceBeardId = "00000000-0000-4000-8000-000000000102";
const serviceColorId = "00000000-0000-4000-8000-000000000103";
const serviceKidsId = "00000000-0000-4000-8000-000000000104";
const serviceConsultationId = "00000000-0000-4000-8000-000000000105";

const staffJanId = "00000000-0000-4000-8000-000000000201";
const staffEvaId = "00000000-0000-4000-8000-000000000202";
const staffTomasId = "00000000-0000-4000-8000-000000000203";

const clientPetrId = "00000000-0000-4000-8000-000000000301";
const clientLucieId = "00000000-0000-4000-8000-000000000302";
const clientMartinId = "00000000-0000-4000-8000-000000000303";
const clientAnnaId = "00000000-0000-4000-8000-000000000304";
const clientTerezaId = "00000000-0000-4000-8000-000000000305";
const clientJakubId = "00000000-0000-4000-8000-000000000306";
const clientMarekId = "00000000-0000-4000-8000-000000000307";

const createdAt = new Date().toISOString();

function localDateAt(dayOffset: number, hour: number, minute = 0) {
  const value = new Date();
  value.setDate(value.getDate() + dayOffset);
  value.setHours(hour, minute, 0, 0);
  return value.toISOString();
}

function localDateKey(dayOffset: number) {
  return localDateAt(dayOffset, 12).slice(0, 10);
}

function serviceMeta(serviceId: string) {
  const service = demoServices.find((item) => item.id === serviceId);

  if (!service) {
    return null;
  }

  return {
    currency: service.currency,
    duration_minutes: service.duration_minutes,
    name: service.name,
    price: service.price,
  };
}

function staffMeta(staffId: string) {
  const staff = demoStaff.find((item) => item.id === staffId);

  if (!staff) {
    return null;
  }

  return {
    color: staff.color,
    name: staff.name,
  };
}

function clientMeta(clientId: string | null) {
  const client = demoClients.find((item) => item.id === clientId);

  if (!client) {
    return null;
  }

  return {
    email: client.email,
    flag_reason: client.flag_reason,
    full_name: client.full_name,
    is_flagged: client.is_flagged,
    no_show_count: client.no_show_count,
    phone: client.phone,
  };
}

function makeBooking({
  cancellationReason = null,
  clientId,
  dayOffset,
  endHour,
  endMinute = 0,
  hour,
  id,
  minute = 0,
  notes,
  serviceId,
  source,
  staffId,
  status,
}: {
  cancellationReason?: string | null;
  clientId: string | null;
  dayOffset: number;
  endHour: number;
  endMinute?: number;
  hour: number;
  id: string;
  minute?: number;
  notes: string | null;
  serviceId: string;
  source: Booking["source"];
  staffId: string;
  status: Booking["status"];
}): Booking {
  const cancelledAt = status === "cancelled" ? localDateAt(dayOffset - 1, 16, 30) : null;

  return {
    id,
    tenant_id: tenantId,
    client_id: clientId,
    staff_id: staffId,
    service_id: serviceId,
    starts_at: localDateAt(dayOffset, hour, minute),
    ends_at: localDateAt(dayOffset, endHour, endMinute),
    status,
    deposit_amount: 0,
    deposit_paid: false,
    deposit_paid_at: null,
    notes,
    source,
    source_detail: null,
    source_metadata: {},
    cancellation_reason: cancellationReason,
    cancelled_at: cancelledAt,
    cancelled_by: null,
    created_at: createdAt,
    updated_at: createdAt,
    clients: clientMeta(clientId),
    services: serviceMeta(serviceId),
    staff: staffMeta(staffId),
  };
}

export const demoTenant: Tenant = {
  id: tenantId,
  name: "Temaro Demo Studio",
  slug: "demo-barber",
  plan: "pro",
  plan_expires_at: null,
  timezone: "Europe/Prague",
  locale: "cs",
  default_currency: "CZK",
  industry: "hair",
  cancellation_notice_hours: 24,
  cancellation_message: null,
  confirmation_message: null,
  public_description: "Moderní demo provozovna pro střihy, vousy a konzultace. Vyberte službu, člověka a čas bez telefonování.",
  logo_url: null,
  cover_image_url: null,
  custom_domain: null,
  custom_domain_status: "none",
  custom_domain_verification_token: null,
  custom_domain_verified_at: null,
  brand_color: "#635BFF",
  public_address: "Kobližná 12",
  public_city: "Brno",
  public_region: "Jihomoravský kraj",
  public_postal_code: "602 00",
  public_country_code: "CZ",
  public_latitude: 49.1951,
  public_longitude: 16.6068,
  public_map_url: null,
  review_url: null,
  review_rating: 4.8,
  review_count: 128,
  review_source_label: "Google",
  public_gallery_image_urls: [
    "/marketing/barber-ai.webp",
    "/marketing/beauty-ai.webp",
    "/marketing/fitness-ai.webp",
  ],
  public_amenities: ["Káva zdarma", "Wi-Fi", "Platba kartou", "Bez čekání"],
  social_instagram_url: "https://www.instagram.com/",
  social_facebook_url: "https://www.facebook.com/",
  social_tiktok_url: "https://www.tiktok.com/",
  social_website_url: null,
  reminder_message: null,
  is_publicly_listed: true,
  created_at: createdAt,
  deleted_at: null,
};

export const demoServices: Service[] = [
  {
    id: serviceHaircutId,
    tenant_id: tenantId,
    name: "Pánský střih",
    description: "Konzultace, mytí, střih a finální styling.",
    duration_minutes: 45,
    price: 59000,
    currency: "CZK",
    buffer_minutes: 5,
    deposit_type: "fixed",
    deposit_value: 10000,
    is_active: true,
    position: 1,
    created_at: createdAt,
    deleted_at: null,
  },
  {
    id: serviceBeardId,
    tenant_id: tenantId,
    name: "Vousy a kontury",
    description: "Úprava vousů, kontury břitvou a zklidňující péče.",
    duration_minutes: 30,
    price: 39000,
    currency: "CZK",
    buffer_minutes: 5,
    deposit_type: "none",
    deposit_value: 0,
    is_active: true,
    position: 2,
    created_at: createdAt,
    deleted_at: null,
  },
  {
    id: serviceColorId,
    tenant_id: tenantId,
    name: "Střih + barvení",
    description: "Delší návštěva pro výraznější změnu účesu.",
    duration_minutes: 90,
    price: 149000,
    currency: "CZK",
    buffer_minutes: 10,
    deposit_type: "percent",
    deposit_value: 30,
    is_active: true,
    position: 3,
    created_at: createdAt,
    deleted_at: null,
  },
  {
    id: serviceKidsId,
    tenant_id: tenantId,
    name: "Dětský střih",
    description: "Rychlý střih pro děti do 12 let.",
    duration_minutes: 30,
    price: 35000,
    currency: "CZK",
    buffer_minutes: 5,
    deposit_type: "none",
    deposit_value: 0,
    is_active: true,
    position: 4,
    created_at: createdAt,
    deleted_at: null,
  },
  {
    id: serviceConsultationId,
    tenant_id: tenantId,
    name: "Konzultace změny stylu",
    description: "Krátká konzultace před větší změnou nebo focením.",
    duration_minutes: 20,
    price: 25000,
    currency: "CZK",
    buffer_minutes: 0,
    deposit_type: "none",
    deposit_value: 0,
    is_active: true,
    position: 5,
    created_at: createdAt,
    deleted_at: null,
  },
];

export const demoStaff: Staff[] = [
  {
    id: staffJanId,
    tenant_id: tenantId,
    user_id: null,
    name: "Jan Novák",
    bio: "Klasické střihy, precizní kontury a práce s vousy.",
    avatar_url: null,
    color: "#111827",
    is_active: true,
    created_at: createdAt,
    deleted_at: null,
    staff_hours: [0, 1, 2, 3, 4].map((day) => ({
      id: `00000000-0000-4000-8000-0000000005${day}1`,
      staff_id: staffJanId,
      tenant_id: tenantId,
      day_of_week: day,
      start_time: "09:00:00",
      end_time: "17:00:00",
      is_working: true,
    })),
    staff_exceptions: [
      {
        id: "00000000-0000-4000-8000-000000000611",
        staff_id: staffJanId,
        tenant_id: tenantId,
        date: localDateKey(2),
        is_working: false,
        start_time: null,
        end_time: null,
        note: "Školení mimo provozovnu",
      },
    ],
    staff_services: [
      { tenant_id: tenantId, staff_id: staffJanId, service_id: serviceHaircutId },
      { tenant_id: tenantId, staff_id: staffJanId, service_id: serviceBeardId },
      { tenant_id: tenantId, staff_id: staffJanId, service_id: serviceKidsId },
    ],
  },
  {
    id: staffEvaId,
    tenant_id: tenantId,
    user_id: null,
    name: "Eva Králová",
    bio: "Rychlé střihy, styling a barevné úpravy.",
    avatar_url: null,
    color: "#0f766e",
    is_active: true,
    created_at: createdAt,
    deleted_at: null,
    staff_hours: [1, 2, 3, 4, 5].map((day) => ({
      id: `00000000-0000-4000-8000-0000000005${day}2`,
      staff_id: staffEvaId,
      tenant_id: tenantId,
      day_of_week: day,
      start_time: "10:00:00",
      end_time: "18:00:00",
      is_working: true,
    })),
    staff_exceptions: [
      {
        id: "00000000-0000-4000-8000-000000000612",
        staff_id: staffEvaId,
        tenant_id: tenantId,
        date: localDateKey(5),
        is_working: true,
        start_time: "12:00:00",
        end_time: "20:00:00",
        note: "Prodloužená směna kvůli eventu",
      },
    ],
    staff_services: [
      { tenant_id: tenantId, staff_id: staffEvaId, service_id: serviceHaircutId },
      { tenant_id: tenantId, staff_id: staffEvaId, service_id: serviceColorId },
      { tenant_id: tenantId, staff_id: staffEvaId, service_id: serviceConsultationId },
    ],
  },
  {
    id: staffTomasId,
    tenant_id: tenantId,
    user_id: null,
    name: "Tomáš Dvořák",
    bio: "Vousy, kontury a kratší technické střihy.",
    avatar_url: null,
    color: "#b45309",
    is_active: true,
    created_at: createdAt,
    deleted_at: null,
    staff_hours: [0, 2, 3, 4, 5].map((day) => ({
      id: `00000000-0000-4000-8000-0000000005${day}3`,
      staff_id: staffTomasId,
      tenant_id: tenantId,
      day_of_week: day,
      start_time: "08:00:00",
      end_time: "15:00:00",
      is_working: true,
    })),
    staff_exceptions: [],
    staff_services: [
      { tenant_id: tenantId, staff_id: staffTomasId, service_id: serviceHaircutId },
      { tenant_id: tenantId, staff_id: staffTomasId, service_id: serviceBeardId },
      { tenant_id: tenantId, staff_id: staffTomasId, service_id: serviceConsultationId },
    ],
  },
];

export const demoClients: Client[] = [
  {
    id: clientPetrId,
    tenant_id: tenantId,
    full_name: "Petr Svoboda",
    phone: "+420 777 123 456",
    email: "petr@example.com",
    notes: "Má rád kratší boky. Nabídnout ranní termíny.",
    no_show_count: 1,
    is_flagged: true,
    flag_reason: "Jednou nedorazil bez včasné omluvy.",
    is_blacklisted: false,
    preferred_staff_id: staffJanId,
    preferred_contact_channel: "sms",
    preferred_time_of_day: "morning",
    preference_notes: "Preferuje ranní termíny a stručné SMS.",
    client_tier: "risk",
    created_at: localDateAt(-40, 10),
    deleted_at: null,
  },
  {
    id: clientLucieId,
    tenant_id: tenantId,
    full_name: "Lucie Horáková",
    phone: "+420 608 222 900",
    email: "lucie@example.com",
    notes: "Preferuje Evu a delší konzultaci před barvením.",
    no_show_count: 0,
    is_flagged: false,
    flag_reason: null,
    is_blacklisted: false,
    preferred_staff_id: staffEvaId,
    preferred_contact_channel: "email",
    preferred_time_of_day: "afternoon",
    preference_notes: "Před barvením chce delší konzultaci.",
    client_tier: "trusted",
    created_at: localDateAt(-32, 11),
    deleted_at: null,
  },
  {
    id: clientMartinId,
    tenant_id: tenantId,
    full_name: "Martin Černý",
    phone: "+420 721 555 010",
    email: "martin@example.com",
    notes: "Chodí pravidelně po obědě, rychlá komunikace po telefonu.",
    no_show_count: 0,
    is_flagged: false,
    flag_reason: null,
    is_blacklisted: false,
    preferred_staff_id: staffTomasId,
    preferred_contact_channel: "phone",
    preferred_time_of_day: "afternoon",
    preference_notes: "Nejlépe reaguje na telefon po obědě.",
    client_tier: "trusted",
    created_at: localDateAt(-20, 14),
    deleted_at: null,
  },
  {
    id: clientAnnaId,
    tenant_id: tenantId,
    full_name: "Anna Procházková",
    phone: "+420 739 456 111",
    email: "anna@example.com",
    notes: "Nosí vlastní fotku inspirace, chce tichý termín bez spěchu.",
    no_show_count: 0,
    is_flagged: false,
    flag_reason: null,
    is_blacklisted: false,
    preferred_staff_id: staffEvaId,
    preferred_contact_channel: "any",
    preferred_time_of_day: "evening",
    preference_notes: "Chce klidnější termín bez spěchu.",
    client_tier: "standard",
    created_at: localDateAt(-14, 16),
    deleted_at: null,
  },
  {
    id: clientTerezaId,
    tenant_id: tenantId,
    full_name: "Tereza Malá",
    phone: "+420 604 101 202",
    email: "tereza@example.com",
    notes: "Dětský střih pro syna, krátké termíny ideálně dopoledne.",
    no_show_count: 0,
    is_flagged: false,
    flag_reason: null,
    is_blacklisted: false,
    preferred_staff_id: staffJanId,
    preferred_contact_channel: "sms",
    preferred_time_of_day: "morning",
    preference_notes: "Krátké dopolední termíny kvůli dítěti.",
    client_tier: "standard",
    created_at: localDateAt(-9, 9),
    deleted_at: null,
  },
  {
    id: clientJakubId,
    tenant_id: tenantId,
    full_name: "Jakub Vávra",
    phone: "+420 775 300 400",
    email: "jakub@example.com",
    notes: "Vousy co 3 týdny, chce připomenout domácí péči.",
    no_show_count: 2,
    is_flagged: true,
    flag_reason: "Dvakrát přesun na poslední chvíli.",
    is_blacklisted: false,
    preferred_staff_id: staffTomasId,
    preferred_contact_channel: "sms",
    preferred_time_of_day: "any",
    preference_notes: "Připomínat domácí péči o vousy.",
    client_tier: "risk",
    created_at: localDateAt(-6, 12),
    deleted_at: null,
  },
  {
    id: clientMarekId,
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
    preferred_contact_channel: "any",
    preferred_time_of_day: "any",
    preference_notes: null,
    client_tier: "standard",
    created_at: localDateAt(-2, 17),
    deleted_at: null,
  },
];

export const demoBookings: Booking[] = [
  makeBooking({
    id: "00000000-0000-4000-8000-000000000401",
    clientId: clientMartinId,
    staffId: staffTomasId,
    serviceId: serviceHaircutId,
    dayOffset: -6,
    hour: 9,
    endHour: 9,
    endMinute: 50,
    status: "completed",
    source: "manual",
    notes: "Dokončeno, klient koupil stylingovou pastu.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000402",
    clientId: clientJakubId,
    staffId: staffTomasId,
    serviceId: serviceBeardId,
    dayOffset: -3,
    hour: 13,
    endHour: 13,
    endMinute: 35,
    status: "no_show",
    source: "online",
    notes: "Klient nedorazil, volat před další rezervací.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000403",
    clientId: clientLucieId,
    staffId: staffEvaId,
    serviceId: serviceColorId,
    dayOffset: -1,
    hour: 11,
    endHour: 12,
    endMinute: 40,
    status: "completed",
    source: "online",
    notes: "Barva sedla, další návštěva za 6 týdnů.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000404",
    clientId: clientPetrId,
    staffId: staffJanId,
    serviceId: serviceHaircutId,
    dayOffset: 0,
    hour: 9,
    endHour: 9,
    endMinute: 50,
    status: "confirmed",
    source: "online",
    notes: "Dnes z webu, klient je flagovaný.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000405",
    clientId: clientAnnaId,
    staffId: staffEvaId,
    serviceId: serviceConsultationId,
    dayOffset: 0,
    hour: 10,
    endHour: 10,
    endMinute: 20,
    status: "pending",
    source: "instagram",
    notes: "Čeká na potvrzení po konzultaci stylu.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000413",
    clientId: clientMartinId,
    staffId: staffTomasId,
    serviceId: serviceBeardId,
    dayOffset: 0,
    hour: 10,
    minute: 5,
    endHour: 10,
    endMinute: 40,
    status: "confirmed",
    source: "manual",
    notes: "Překryv s Evou pro ukázku více zaměstnanců v jednom čase.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000414",
    clientId: clientLucieId,
    staffId: staffJanId,
    serviceId: serviceConsultationId,
    dayOffset: 0,
    hour: 10,
    minute: 10,
    endHour: 10,
    endMinute: 30,
    status: "confirmed",
    source: "online",
    notes: "Krátká služba ve stejném časovém okně jako další zaměstnanci.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000406",
    clientId: clientTerezaId,
    staffId: staffJanId,
    serviceId: serviceKidsId,
    dayOffset: 0,
    hour: 13,
    endHour: 13,
    endMinute: 35,
    status: "confirmed",
    source: "manual",
    notes: "Dětský střih, přijde s doprovodem.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000407",
    clientId: clientMarekId,
    staffId: staffTomasId,
    serviceId: serviceBeardId,
    dayOffset: 0,
    hour: 14,
    endHour: 14,
    endMinute: 35,
    status: "confirmed",
    source: "instagram",
    notes: "Nový klient, přišel z profilu na Instagramu.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000408",
    clientId: null,
    staffId: staffEvaId,
    serviceId: serviceHaircutId,
    dayOffset: 1,
    hour: 12,
    endHour: 12,
    endMinute: 50,
    status: "confirmed",
    source: "manual",
    notes: "Walk-in rezervace vytvořená telefonicky.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000415",
    clientId: clientJakubId,
    staffId: staffTomasId,
    serviceId: serviceHaircutId,
    dayOffset: 1,
    hour: 12,
    minute: 15,
    endHour: 13,
    endMinute: 5,
    status: "pending",
    source: "online",
    notes: "Ukázka překryvu přes polední slot s jiným zaměstnancem.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000416",
    clientId: clientPetrId,
    staffId: staffJanId,
    serviceId: serviceBeardId,
    dayOffset: 1,
    hour: 12,
    minute: 30,
    endHour: 13,
    endMinute: 5,
    status: "confirmed",
    source: "manual",
    notes: "Třetí překryv pro kontrolu vrstvení barevných eventů.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000409",
    clientId: clientLucieId,
    staffId: staffEvaId,
    serviceId: serviceColorId,
    dayOffset: 2,
    hour: 15,
    endHour: 16,
    endMinute: 40,
    status: "pending",
    source: "online",
    notes: "Potvrdit dostupnost delšího slotu.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000410",
    clientId: clientMartinId,
    staffId: staffTomasId,
    serviceId: serviceHaircutId,
    dayOffset: 3,
    hour: 8,
    endHour: 8,
    endMinute: 50,
    status: "confirmed",
    source: "online",
    notes: "Ranní termín před prací.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000411",
    clientId: clientPetrId,
    staffId: staffJanId,
    serviceId: serviceBeardId,
    dayOffset: 4,
    hour: 16,
    endHour: 16,
    endMinute: 35,
    status: "cancelled",
    source: "online",
    cancellationReason: "Klient přesunul termín kvůli práci.",
    notes: "Zrušeno přes self-service odkaz.",
  }),
  makeBooking({
    id: "00000000-0000-4000-8000-000000000412",
    clientId: clientAnnaId,
    staffId: staffEvaId,
    serviceId: serviceHaircutId,
    dayOffset: 6,
    hour: 17,
    endHour: 17,
    endMinute: 50,
    status: "confirmed",
    source: "online",
    notes: "Večerní termín po práci.",
  }),
];
