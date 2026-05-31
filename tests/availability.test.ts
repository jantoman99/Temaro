import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAvailabilitySlots } from "@/lib/booking/availability";
import type { Database } from "@/types/database";

type Service = Database["public"]["Tables"]["services"]["Row"];
type StaffHour = Database["public"]["Tables"]["staff_hours"]["Row"];
type StaffException = Database["public"]["Tables"]["staff_exceptions"]["Row"];
type StaffService = Database["public"]["Tables"]["staff_services"]["Row"];
type Booking = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  "ends_at" | "staff_id" | "starts_at" | "status"
>;
type Staff = Database["public"]["Tables"]["staff"]["Row"] & {
  staff_exceptions: StaffException[];
  staff_hours: StaffHour[];
  staff_services: StaffService[];
};

const TENANT_ID = "tenant-1";
const STAFF_ID = "staff-1";
const SERVICE_ID = "service-1";

function createService(overrides: Partial<Service> = {}): Service {
  return {
    id: SERVICE_ID,
    tenant_id: TENANT_ID,
    name: "Strih",
    description: null,
    duration_minutes: 30,
    price: 45000,
    currency: "CZK",
    buffer_minutes: 0,
    deposit_type: "none",
    deposit_value: 0,
    is_active: true,
    position: 0,
    created_at: "2026-04-01T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

function createStaffHour(overrides: Partial<StaffHour> = {}): StaffHour {
  return {
    id: "staff-hour-1",
    tenant_id: TENANT_ID,
    staff_id: STAFF_ID,
    day_of_week: 0,
    start_time: "09:00",
    end_time: "10:00",
    is_working: true,
    ...overrides,
  };
}

function createStaffException(overrides: Partial<StaffException> = {}): StaffException {
  return {
    id: "staff-exception-1",
    tenant_id: TENANT_ID,
    staff_id: STAFF_ID,
    date: "2026-04-27",
    is_working: false,
    start_time: null,
    end_time: null,
    note: null,
    ...overrides,
  };
}

function createStaffService(overrides: Partial<StaffService> = {}): StaffService {
  return {
    tenant_id: TENANT_ID,
    staff_id: STAFF_ID,
    service_id: SERVICE_ID,
    ...overrides,
  };
}

function createStaff(overrides: Partial<Staff> = {}): Staff {
  return {
    id: STAFF_ID,
    tenant_id: TENANT_ID,
    user_id: null,
    name: "Adam",
    bio: null,
    avatar_url: null,
    color: "#2563eb",
    is_active: true,
    created_at: "2026-04-01T00:00:00.000Z",
    deleted_at: null,
    staff_hours: [createStaffHour()],
    staff_exceptions: [],
    staff_services: [createStaffService()],
    ...overrides,
  };
}

function createBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    staff_id: STAFF_ID,
    starts_at: "2026-04-27T07:30:00.000Z",
    ends_at: "2026-04-27T08:00:00.000Z",
    status: "confirmed",
    ...overrides,
  };
}

describe("getAvailabilitySlots", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-27T06:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("vygeneruje volne terminy podle pracovni doby v timezone podniku", () => {
    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      services: [createService()],
      staff: [createStaff()],
      timeZone: "Europe/Prague",
    });

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      "2026-04-27T07:00:00.000Z",
      "2026-04-27T07:15:00.000Z",
      "2026-04-27T07:30:00.000Z",
    ]);
  });

  it("vygeneruje spravne UTC terminy v den prechodu na letni cas", () => {
    vi.setSystemTime(new Date("2026-03-28T23:00:00.000Z"));

    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      services: [createService()],
      staff: [
        createStaff({
          staff_hours: [
            createStaffHour({
              day_of_week: 6,
              start_time: "01:30",
              end_time: "03:30",
            }),
          ],
        }),
      ],
      timeZone: "Europe/Prague",
    });

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      "2026-03-29T00:30:00.000Z",
      "2026-03-29T00:45:00.000Z",
      "2026-03-29T01:00:00.000Z",
    ]);
  });

  it("nespadne na neplatne timezone a pouzije vychozi timezone", () => {
    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      services: [createService()],
      staff: [createStaff()],
      timeZone: "Invalid/Timezone",
    });

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      "2026-04-27T07:00:00.000Z",
      "2026-04-27T07:15:00.000Z",
      "2026-04-27T07:30:00.000Z",
    ]);
  });

  it("nespadne na neplatne locale a pouzije vychozi locale", () => {
    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      locale: "not a locale",
      services: [createService()],
      staff: [createStaff()],
      timeZone: "Europe/Prague",
    });

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      "2026-04-27T07:00:00.000Z",
      "2026-04-27T07:15:00.000Z",
      "2026-04-27T07:30:00.000Z",
    ]);
  });

  it("vynecha termin, ktery koliduje s aktivni rezervaci", () => {
    const slots = getAvailabilitySlots({
      bookings: [createBooking()],
      daysAhead: 1,
      services: [createService()],
      staff: [createStaff()],
      timeZone: "Europe/Prague",
    });

    expect(slots.map((slot) => slot.startsAt)).toEqual(["2026-04-27T07:00:00.000Z"]);
  });

  it("vraci terminy serazene podle casu napric sluzbami", () => {
    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      services: [
        createService({
          id: "service-long",
          duration_minutes: 60,
        }),
        createService({
          id: "service-short",
          duration_minutes: 30,
        }),
      ],
      staff: [
        createStaff({
          staff_services: [
            createStaffService({ service_id: "service-long" }),
            createStaffService({ service_id: "service-short" }),
          ],
        }),
      ],
      timeZone: "Europe/Prague",
    });

    expect(slots.slice(0, 3).map((slot) => slot.startsAt)).toEqual([
      "2026-04-27T07:00:00.000Z",
      "2026-04-27T07:00:00.000Z",
      "2026-04-27T07:15:00.000Z",
    ]);
  });

  it("ignoruje zrusenou rezervaci a termin ponecha volny", () => {
    const slots = getAvailabilitySlots({
      bookings: [createBooking({ status: "cancelled" })],
      daysAhead: 1,
      services: [createService()],
      staff: [createStaff()],
      timeZone: "Europe/Prague",
    });

    expect(slots).toHaveLength(3);
  });

  it("respektuje celodenni vyjimku volna", () => {
    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      services: [createService()],
      staff: [createStaff({ staff_exceptions: [createStaffException()] })],
      timeZone: "Europe/Prague",
    });

    expect(slots).toEqual([]);
  });

  it("pouzije specialni pracovni dobu z vyjimky misto bezne pracovni doby", () => {
    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      services: [createService()],
      staff: [
        createStaff({
          staff_exceptions: [
            createStaffException({
              is_working: true,
              start_time: "11:00",
              end_time: "12:00",
            }),
          ],
        }),
      ],
      timeZone: "Europe/Prague",
    });

    expect(slots.map((slot) => slot.startsAt)).toEqual([
      "2026-04-27T09:00:00.000Z",
      "2026-04-27T09:15:00.000Z",
      "2026-04-27T09:30:00.000Z",
    ]);
  });

  it("nevygeneruje terminy pro zamestnance bez prirazene sluzby", () => {
    const slots = getAvailabilitySlots({
      bookings: [],
      daysAhead: 1,
      services: [createService()],
      staff: [createStaff({ staff_services: [] })],
      timeZone: "Europe/Prague",
    });

    expect(slots).toEqual([]);
  });
});
