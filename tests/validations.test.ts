import { describe, expect, it } from "vitest";

import {
  bookingManageTokenSchema,
  cancelBookingSchema,
  createBookingSchema,
  createPublicBookingSchema,
  createWaitlistEntrySchema,
  publicTenantSlugSchema,
  rescheduleManagedBookingSchema,
} from "@/lib/validations/bookings";
import {
  BOOKING_CANCELLATION_REASON_MAX_LENGTH,
  BOOKING_NOTE_MAX_LENGTH,
} from "@/lib/booking-form-limits";
import { CLIENT_FLAG_REASON_MAX_LENGTH, CLIENT_NOTES_MAX_LENGTH } from "@/lib/client-form-limits";
import { TENANT_NAME_MAX_LENGTH } from "@/lib/settings-form-limits";
import { SERVICE_DESCRIPTION_MAX_LENGTH } from "@/lib/service-form-limits";
import { STAFF_BIO_MAX_LENGTH, STAFF_EXCEPTION_NOTE_MAX_LENGTH } from "@/lib/staff-form-limits";
import { createClientSchema, flagClientSchema } from "@/lib/validations/clients";
import { calendarSearchParamsSchema } from "@/lib/validations/calendar";
import { createServiceSchema } from "@/lib/validations/services";
import { tenantBookingBrandingSchema, tenantSettingsSchema } from "@/lib/validations/settings";
import { createStaffSchema, inviteStaffSchema, staffExceptionSchema, updateStaffSchema } from "@/lib/validations/staff";
import { loginSchema, passwordResetRequestSchema, registerSchema, updatePasswordSchema } from "@/lib/validations/auth";
import { recordBookingPaymentSchema } from "@/lib/validations/payments";

const UUID_1 = "11111111-1111-4111-8111-111111111111";
const UUID_2 = "22222222-2222-4222-8222-222222222222";

describe("validation schemas", () => {
  it("prevede cenu sluzby z korun na halere", () => {
    const parsed = createServiceSchema.parse({
      name: "Strih",
      durationMinutes: "45",
      price: "450,50",
      currency: "CZK",
      bufferMinutes: "5",
    });

    expect(parsed.price).toBe(45050);
  });

  it("prevede fixni zalohu sluzby na halere", () => {
    const parsed = createServiceSchema.parse({
      name: "Strih",
      durationMinutes: "45",
      price: "600",
      currency: "CZK",
      bufferMinutes: "5",
      depositType: "fixed",
      depositValue: "100,50",
    });

    expect(parsed.depositType).toBe("fixed");
    expect(parsed.depositValue).toBe(10050);
  });

  it("odmitne fixni zalohu vyssi nez cena sluzby", () => {
    const parsed = createServiceSchema.safeParse({
      name: "Strih",
      durationMinutes: "45",
      price: "600",
      currency: "CZK",
      bufferMinutes: "5",
      depositType: "fixed",
      depositValue: "700",
    });

    expect(parsed.success).toBe(false);
  });

  it("povoli procentni zalohu sluzby v rozsahu 1 az 100", () => {
    const parsed = createServiceSchema.parse({
      name: "Strih",
      durationMinutes: "45",
      price: "600",
      currency: "CZK",
      bufferMinutes: "5",
      depositType: "percent",
      depositValue: "30",
    });

    expect(parsed.depositType).toBe("percent");
    expect(parsed.depositValue).toBe(30);
  });

  it("prevede evidovanou platbu na halere", () => {
    const parsed = recordBookingPaymentSchema.parse({
      amount: "100,50",
      bookingId: UUID_1,
      currency: "CZK",
      method: "cash",
      paymentScope: "deposit",
    });

    expect(parsed.amount).toBe(10050);
  });

  it("odmitne zapornou nebo nulovou evidovanou platbu", () => {
    const parsed = recordBookingPaymentSchema.safeParse({
      amount: "0",
      bookingId: UUID_1,
      currency: "CZK",
      method: "cash",
      paymentScope: "deposit",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne cenu s vice nez dvema desetinnymi misty", () => {
    const parsed = createServiceSchema.safeParse({
      name: "Strih",
      durationMinutes: "45",
      price: "450.999",
      currency: "CZK",
      bufferMinutes: "5",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne exponent v ciselnych polich sluzby", () => {
    const parsed = createServiceSchema.safeParse({
      name: "Strih",
      durationMinutes: "1e2",
      price: "450",
      currency: "CZK",
      bufferMinutes: "1e1",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne vytvoreni sluzby mimo krok 5 minut", () => {
    const created = createServiceSchema.safeParse({
      name: "Strih",
      durationMinutes: "7",
      price: "450",
      currency: "CZK",
      bufferMinutes: "3",
    });

    expect(created.success).toBe(false);
  });

  it("odmitne prilis dlouhou cenu sluzby pred prevodem", () => {
    const parsed = createServiceSchema.safeParse({
      name: "Strih",
      durationMinutes: "45",
      price: "1".repeat(13),
      currency: "CZK",
      bufferMinutes: "5",
    });

    expect(parsed.success).toBe(false);
  });

  it("vycisti prazdny popis sluzby", () => {
    const parsed = createServiceSchema.parse({
      name: "Strih",
      description: "   ",
      durationMinutes: "45",
      price: "450",
      currency: "CZK",
      bufferMinutes: "0",
    });

    expect(parsed.description).toBeUndefined();
  });

  it("odmitne prilis dlouhy popis sluzby", () => {
    const parsed = createServiceSchema.safeParse({
      name: "Strih",
      description: "x".repeat(SERVICE_DESCRIPTION_MAX_LENGTH + 1),
      durationMinutes: "45",
      price: "450",
      currency: "CZK",
      bufferMinutes: "0",
    });

    expect(parsed.success).toBe(false);
  });

  it("normalizuje email a prazdne nepovinne hodnoty u verejne rezervace", () => {
    const parsed = createPublicBookingSchema.parse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      clientName: " Jan Novak ",
      clientPhone: " +420 777 123 456 ",
      clientEmail: " JAN@EXAMPLE.COM ",
      notes: "",
      source: "qr",
      sourceDetail: "Recepce",
      utmCampaign: "Jaro",
    });

    expect(parsed.clientName).toBe("Jan Novak");
    expect(parsed.clientPhone).toBe("+420777123456");
    expect(parsed.clientEmail).toBe("jan@example.com");
    expect(parsed.notes).toBeNull();
    expect(parsed.source).toBe("qr");
    expect(parsed.sourceDetail).toBe("Recepce");
    expect(parsed.utmCampaign).toBe("Jaro");
  });

  it("odmitne neplatny zdroj verejne rezervace", () => {
    const parsed = createPublicBookingSchema.safeParse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      clientName: "Jan Novak",
      source: "external-script",
    });

    expect(parsed.success).toBe(false);
  });

  it("normalizuje kontakt a tracking u cekaci listiny", () => {
    const parsed = createWaitlistEntrySchema.parse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: "",
      clientName: " Jan Novak ",
      clientPhone: " +420 777 123 456 ",
      clientEmail: " JAN@EXAMPLE.COM ",
      notes: "",
      source: "instagram",
      sourceDetail: "Bio",
      utmCampaign: "Jaro",
    });

    expect(parsed.clientName).toBe("Jan Novak");
    expect(parsed.clientPhone).toBe("+420777123456");
    expect(parsed.clientEmail).toBe("jan@example.com");
    expect(parsed.notes).toBeNull();
    expect(parsed.staffId).toBeNull();
    expect(parsed.source).toBe("instagram");
    expect(parsed.sourceDetail).toBe("Bio");
    expect(parsed.utmCampaign).toBe("Jaro");
  });

  it("cekaci listina vyzaduje telefon nebo email", () => {
    const parsed = createWaitlistEntrySchema.safeParse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: "",
      clientName: "Jan Novak",
      clientPhone: "",
      clientEmail: "",
      source: "online",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne prilis dlouhou poznamku u verejne i rucni rezervace", () => {
    const longNote = "x".repeat(BOOKING_NOTE_MAX_LENGTH + 1);

    expect(createPublicBookingSchema.safeParse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      clientName: "Jan Novak",
      clientPhone: "",
      clientEmail: "jan@example.com",
      notes: longNote,
    }).success).toBe(false);
    expect(createBookingSchema.safeParse({
      clientId: "",
      clientEmail: "",
      clientFullName: "",
      clientPhone: "",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      sendNotification: false,
      notes: longNote,
    }).success).toBe(false);
  });

  it("odmitne prilis dlouhy email v kontaktnich formularich", () => {
    const longEmail = `${"a".repeat(245)}@example.com`;

    expect(createPublicBookingSchema.safeParse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      clientName: "Jan Novak",
      clientPhone: "",
      clientEmail: longEmail,
      notes: "",
    }).success).toBe(false);
    expect(createBookingSchema.safeParse({
      clientId: "",
      clientEmail: longEmail,
      clientFullName: "Jan Novak",
      clientPhone: "",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      sendNotification: false,
      notes: "",
    }).success).toBe(false);
    expect(createClientSchema.safeParse({
      fullName: "Jan Novak",
      phone: "",
      email: longEmail,
      notes: "",
      preferredStaffId: "",
    }).success).toBe(false);
    expect(inviteStaffSchema.safeParse({
      fullName: "Jan Novak",
      email: longEmail,
      staffId: UUID_1,
    }).success).toBe(false);
    expect(loginSchema.safeParse({ email: longEmail, password: "supersecret" }).success).toBe(false);
    expect(registerSchema.safeParse({
      businessName: "Demo podnik",
      fullName: "Jan Novak",
      email: longEmail,
      password: "supersecret",
    }).success).toBe(false);
  });

  it("odmitne prilis dlouhe heslo v loginu i registraci", () => {
    const longPassword = "x".repeat(129);

    expect(loginSchema.safeParse({ email: "jan@example.com", password: longPassword }).success).toBe(false);
    expect(registerSchema.safeParse({
      businessName: "Demo podnik",
      fullName: "Jan Novak",
      email: "jan@example.com",
      password: longPassword,
    }).success).toBe(false);
  });

  it("validuje reset hesla bez technickych detailu", () => {
    expect(passwordResetRequestSchema.safeParse({ email: "owner@example.com" }).success).toBe(true);
    expect(passwordResetRequestSchema.safeParse({ email: "neni-email" }).success).toBe(false);
    expect(updatePasswordSchema.safeParse({ password: "newsecret123" }).success).toBe(true);
    expect(updatePasswordSchema.safeParse({ password: "short" }).success).toBe(false);
  });

  it("u verejne rezervace vyzaduje UTC termin ze serverove nabidky", () => {
    const parsed = createPublicBookingSchema.safeParse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T09:00",
      clientName: "Jan Novak",
      clientPhone: "",
      clientEmail: "jan@example.com",
      notes: "",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe("Vyberte platný termín.");
  });

  it("odmitne prilis kratky telefon u verejne rezervace i po odstraneni mezer", () => {
    const parsed = createPublicBookingSchema.safeParse({
      slug: "test-podnik",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      clientName: "Jan Novak",
      clientPhone: "1 2 3 4 5",
      clientEmail: "jan@example.com",
      notes: "",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe("Telefon musí mít 9 až 20 číslic a může začínat znakem +.");
  });

  it("u rucni rezervace vyzaduje jmeno, kdyz se ma vytvorit novy klient", () => {
    const parsed = createBookingSchema.safeParse({
      clientId: "",
      clientEmail: "jan@example.com",
      clientFullName: "",
      clientPhone: "",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      sendNotification: true,
      notes: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("u rucni rezervace povoli walk-in bez noveho klienta", () => {
    const parsed = createBookingSchema.parse({
      clientId: "",
      clientEmail: "",
      clientFullName: "",
      clientPhone: "",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      sendNotification: false,
      notes: "",
    });

    expect(parsed.clientId).toBeNull();
    expect(parsed.clientEmail).toBeNull();
    expect(parsed.clientFullName).toBeNull();
    expect(parsed.clientPhone).toBeNull();
    expect(parsed.notes).toBeNull();
  });

  it("odmitne prilis kratky telefon u rucni rezervace i po odstraneni mezer", () => {
    const parsed = createBookingSchema.safeParse({
      clientId: "",
      clientEmail: "",
      clientFullName: "Jan Novak",
      clientPhone: "1 2 3 4 5",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      sendNotification: false,
      notes: "",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe("Telefon musí mít 9 až 20 číslic a může začínat znakem +.");
  });

  it("spravne pozna vypnuti emailu u rucni rezervace z formularove hodnoty false", () => {
    const parsed = createBookingSchema.parse({
      clientId: "",
      clientEmail: "",
      clientFullName: "",
      clientPhone: "",
      serviceId: UUID_1,
      staffId: UUID_2,
      startsAt: "2026-04-27T07:00:00.000Z",
      sendNotification: "false",
      notes: "",
    });

    expect(parsed.sendNotification).toBe(false);
  });

  it("povoli jen bezpecny slug verejne booking stranky", () => {
    expect(publicTenantSlugSchema.safeParse("demo-barber").success).toBe(true);
    expect(publicTenantSlugSchema.safeParse("../admin").success).toBe(false);
    expect(publicTenantSlugSchema.safeParse("Demo Barber").success).toBe(false);
    expect(publicTenantSlugSchema.safeParse("-demo").success).toBe(false);
    expect(publicTenantSlugSchema.safeParse("demo-").success).toBe(false);
    expect(publicTenantSlugSchema.safeParse("--").success).toBe(false);
  });

  it("vycisti prazdny duvod zruseni a odmitne prilis dlouhy duvod", () => {
    const parsed = cancelBookingSchema.parse({
      bookingId: UUID_1,
      cancellationReason: "  ",
    });
    const tooLong = cancelBookingSchema.safeParse({
      bookingId: UUID_1,
      cancellationReason: "x".repeat(BOOKING_CANCELLATION_REASON_MAX_LENGTH + 1),
    });

    expect(parsed.cancellationReason).toBeNull();
    expect(tooLong.success).toBe(false);
  });

  it("odmitne nepodporovanou timezone a prilis dlouhou storno lhutu", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "Demo podnik",
      timezone: "Invalid/Timezone",
      locale: "cs",
      defaultCurrency: "CZK",
      cancellationNoticeHours: "999",
    });

    expect(parsed.success).toBe(false);
  });

  it("povoli bezne ceske znaky v nazvu podniku v nastaveni", () => {
    const parsed = tenantSettingsSchema.parse({
      name: "Kadeřnictví U Šárky s.r.o.",
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      industry: "hair",
      cancellationNoticeHours: "24",
      publicAddress: "Kobližná 12",
      publicCity: "Brno",
      publicRegion: "Jihomoravský kraj",
      publicPostalCode: "602 00",
      publicCountryCode: "cz",
      publicMapUrl: "",
      reviewUrl: "https://g.page/r/demo/review",
      isPubliclyListed: true,
    });

    expect(parsed.name).toBe("Kadeřnictví U Šárky s.r.o.");
    expect(parsed.industry).toBe("hair");
    expect(parsed.publicCountryCode).toBe("CZ");
    expect(parsed.publicMapUrl).toBeNull();
    expect(parsed.reviewUrl).toBe("https://g.page/r/demo/review");
    expect(parsed.isPubliclyListed).toBe(true);
  });

  it("odmitne neplatny mapovy odkaz v nastaveni podniku", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "Demo podnik",
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      cancellationNoticeHours: "24",
      publicMapUrl: "neni-url",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne neplatny review odkaz v nastaveni podniku", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "Demo podnik",
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      cancellationNoticeHours: "24",
      reviewUrl: "neni-url",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne nepodporovany obor podniku v nastaveni", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "Demo podnik",
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      industry: "autoservis",
      cancellationNoticeHours: "24",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne prilis dlouhy nazev podniku v nastaveni", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "x".repeat(TENANT_NAME_MAX_LENGTH + 1),
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      cancellationNoticeHours: "24",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne ridici znaky v nazvu podniku v nastaveni", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "Demo\u0000podnik",
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      cancellationNoticeHours: "24",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne exponent ve storno lhute", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "Demo podnik",
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      cancellationNoticeHours: "1e2",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne prazdnou storno lhutu v nastaveni", () => {
    const parsed = tenantSettingsSchema.safeParse({
      name: "Demo podnik",
      timezone: "Europe/Prague",
      locale: "cs",
      defaultCurrency: "CZK",
      cancellationNoticeHours: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("validuje vlastni texty booking komunikace", () => {
    const parsed = tenantBookingBrandingSchema.parse({
      publicDescription: "Popis",
      logoUrl: "",
      coverImageUrl: "",
      brandColor: "#635BFF",
      confirmationMessage: "Přijďte prosím 5 minut předem.",
      reminderMessage: "Pokud nestíháte, změňte termín přes odkaz.",
      cancellationMessage: "",
    });

    expect(parsed.confirmationMessage).toBe("Přijďte prosím 5 minut předem.");
    expect(parsed.reminderMessage).toBe("Pokud nestíháte, změňte termín přes odkaz.");
    expect(parsed.cancellationMessage).toBeNull();
  });

  it("odmitne prilis dlouhy vlastni text booking komunikace", () => {
    const parsed = tenantBookingBrandingSchema.safeParse({
      publicDescription: "Popis",
      logoUrl: "",
      coverImageUrl: "",
      brandColor: "#635BFF",
      confirmationMessage: "x".repeat(501),
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne pracovni vyjimku, kde konec neni po zacatku", () => {
    const parsed = staffExceptionSchema.safeParse({
      staffId: UUID_2,
      date: "2026-04-27",
      isWorking: true,
      startTime: "12:00",
      endTime: "11:00",
      note: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("spravne pozna volno z formularove hodnoty false", () => {
    const parsed = staffExceptionSchema.parse({
      staffId: UUID_2,
      date: "2026-04-27",
      isWorking: "false",
      startTime: "",
      endTime: "",
      note: "",
    });

    expect(parsed.isWorking).toBe(false);
    expect(parsed.startTime).toBeNull();
    expect(parsed.endTime).toBeNull();
  });

  it("odstrani duplicitni pracovni dny u zamestnance", () => {
    const created = createStaffSchema.parse({
      name: "Eva Novak",
      bio: "",
      color: "#111827",
      workingDays: ["3", "1", "3", "1"],
      startTime: "09:00",
      endTime: "17:00",
    });
    const updated = updateStaffSchema.parse({
      staffId: UUID_1,
      name: "Eva Novak",
      bio: "",
      color: "#111827",
      workingDays: ["5", "2", "5"],
      startTime: "09:00",
      endTime: "17:00",
    });

    expect(created.workingDays).toEqual([1, 3]);
    expect(updated.workingDays).toEqual([2, 5]);
  });

  it("odmitne exponent v pracovnich dnech zamestnance", () => {
    const parsed = createStaffSchema.safeParse({
      name: "Eva Novak",
      bio: "",
      color: "#111827",
      workingDays: ["1e0"],
      startTime: "09:00",
      endTime: "17:00",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne prilis dlouhe bio zamestnance", () => {
    const parsed = createStaffSchema.safeParse({
      name: "Eva Novak",
      bio: "x".repeat(STAFF_BIO_MAX_LENGTH + 1),
      color: "#111827",
      workingDays: ["1"],
      startTime: "09:00",
      endTime: "17:00",
    });

    expect(parsed.success).toBe(false);
  });

  it("vycisti prazdne bio zamestnance", () => {
    const parsed = createStaffSchema.parse({
      name: "Eva Novak",
      bio: "   ",
      color: "#111827",
      workingDays: ["1"],
      startTime: "09:00",
      endTime: "17:00",
    });

    expect(parsed.bio).toBeUndefined();
  });

  it("odmitne volno, kdyz u nej zustaly vyplnene casy", () => {
    const parsed = staffExceptionSchema.safeParse({
      staffId: UUID_2,
      date: "2026-04-27",
      isWorking: "false",
      startTime: "09:00",
      endTime: "17:00",
      note: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne prilis dlouhou poznamku u vyjimky pracovni doby", () => {
    const parsed = staffExceptionSchema.safeParse({
      staffId: UUID_2,
      date: "2026-04-27",
      isWorking: "true",
      startTime: "09:00",
      endTime: "17:00",
      note: "x".repeat(STAFF_EXCEPTION_NOTE_MAX_LENGTH + 1),
    });

    expect(parsed.success).toBe(false);
  });

  it("odmitne neexistujici datum v kalendari", () => {
    expect(calendarSearchParamsSchema.safeParse({ day: "2026-04-27" }).success).toBe(true);
    expect(calendarSearchParamsSchema.safeParse({ day: "2026-02-31" }).success).toBe(false);
  });

  it("povoli jen platny self-service token pro spravu rezervace", () => {
    expect(bookingManageTokenSchema.safeParse({ token: "a".repeat(64) }).success).toBe(true);
    expect(bookingManageTokenSchema.safeParse({ token: "kratky-token" }).success).toBe(false);
    expect(bookingManageTokenSchema.safeParse({ token: "A".repeat(64) }).success).toBe(false);
  });

  it("odmitne presun rezervace s neplatnym terminem nebo poskytovatelem", () => {
    expect(
      rescheduleManagedBookingSchema.safeParse({
        token: "b".repeat(64),
        staffId: UUID_2,
        startsAt: "2026-04-27T07:00:00.000Z",
      }).success,
    ).toBe(true);

    expect(
      rescheduleManagedBookingSchema.safeParse({
        token: "b".repeat(64),
        staffId: "neplatne-id",
        startsAt: "neni-datum",
      }).success,
    ).toBe(false);
  });

  it("vycisti prazdne nepovinne udaje klienta", () => {
    const parsed = createClientSchema.parse({
      fullName: "  Jan Novak  ",
      phone: " +420 777 123 456 ",
      email: " JAN@EXAMPLE.COM ",
      notes: "  ",
      preferenceNotes: " Chce ranní termíny ",
      preferredContactChannel: "sms",
      preferredStaffId: "",
      preferredTimeOfDay: "morning",
      clientTier: "trusted",
    });

    expect(parsed.fullName).toBe("Jan Novak");
    expect(parsed.phone).toBe("+420777123456");
    expect(parsed.email).toBe("jan@example.com");
    expect(parsed.notes).toBeUndefined();
    expect(parsed.preferenceNotes).toBe("Chce ranní termíny");
    expect(parsed.preferredContactChannel).toBe("sms");
    expect(parsed.preferredStaffId).toBeUndefined();
    expect(parsed.preferredTimeOfDay).toBe("morning");
    expect(parsed.clientTier).toBe("trusted");
  });

  it("odmitne prilis kratky telefon u klienta i po odstraneni mezer", () => {
    const parsed = createClientSchema.safeParse({
      fullName: "Jan Novak",
      phone: "1 2 3 4 5",
      email: "",
      notes: "",
      preferredStaffId: "",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.issues[0]?.message).toBe("Telefon musí mít 9 až 20 číslic a může začínat znakem +.");
  });

  it("odmitne prilis dlouhou interni poznamku klienta", () => {
    const parsed = createClientSchema.safeParse({
      fullName: "Jan Novak",
      phone: "",
      email: "",
      notes: "x".repeat(CLIENT_NOTES_MAX_LENGTH + 1),
      preferredStaffId: "",
    });

    expect(parsed.success).toBe(false);
  });

  it("spravne pozna odebrani flagu z formularove hodnoty false", () => {
    const parsed = flagClientSchema.parse({
      clientId: UUID_1,
      isFlagged: "false",
      flagReason: "Opakovane no-show",
    });

    expect(parsed.isFlagged).toBe(false);
  });

  it("odmitne prilis dlouhy duvod flagu klienta", () => {
    const parsed = flagClientSchema.safeParse({
      clientId: UUID_1,
      isFlagged: "true",
      flagReason: "x".repeat(CLIENT_FLAG_REASON_MAX_LENGTH + 1),
    });

    expect(parsed.success).toBe(false);
  });
});
