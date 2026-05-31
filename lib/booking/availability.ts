import type { Database } from "@/types/database";
import { getSafeTimeZone, localDatetimeToUtcIso } from "@/lib/time-zone";

type Booking = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  "ends_at" | "staff_id" | "starts_at" | "status"
>;
type Service = Database["public"]["Tables"]["services"]["Row"];
type StaffHour = Database["public"]["Tables"]["staff_hours"]["Row"];
type StaffException = Database["public"]["Tables"]["staff_exceptions"]["Row"];
type StaffService = Database["public"]["Tables"]["staff_services"]["Row"];
type Staff = Database["public"]["Tables"]["staff"]["Row"] & {
  staff_exceptions: StaffException[];
  staff_hours: StaffHour[];
  staff_services: StaffService[];
};

export type AvailabilitySlot = {
  id: string;
  serviceId: string;
  staffId: string;
  startsAt: string;
  label: string;
};

const SLOT_STEP_MINUTES = 15;
const DEFAULT_LOCALE = "cs-CZ";
const DEFAULT_TIME_ZONE = "Europe/Prague";

function getSafeLocale(value: string) {
  try {
    new Intl.DateTimeFormat(value).format(new Date());

    return value;
  } catch {
    return DEFAULT_LOCALE;
  }
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function getZonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);

  return {
    day: Number(parts.find((part) => part.type === "day")?.value ?? "1"),
    month: Number(parts.find((part) => part.type === "month")?.value ?? "1"),
    year: Number(parts.find((part) => part.type === "year")?.value ?? "1970"),
  };
}

function toDateKey({ day, month, year }: { day: number; month: number; year: number }) {
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function addDaysToParts({ day, month, year }: { day: number; month: number; year: number }, days: number) {
  const date = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));

  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

function dayOfWeek({ day, month, year }: { day: number; month: number; year: number }) {
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return (date.getUTCDay() + 6) % 7;
}

function zonedTimeToUtc({
  dateParts,
  time,
  timeZone,
}: {
  dateParts: { day: number; month: number; year: number };
  time: string;
  timeZone: string;
}) {
  const utcIso = localDatetimeToUtcIso(`${toDateKey(dateParts)}T${time}`, timeZone);
  const utcDate = new Date(utcIso);

  return Number.isNaN(utcDate.getTime()) ? null : utcDate;
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA;
}

function formatSlotLabel(date: Date, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
}

export function getAvailabilitySlots({
  bookings,
  daysAhead = 14,
  locale = DEFAULT_LOCALE,
  services,
  staff,
  timeZone = DEFAULT_TIME_ZONE,
}: {
  bookings: Booking[];
  daysAhead?: number;
  locale?: string;
  services: Service[];
  staff: Staff[];
  timeZone?: string;
}) {
  const safeLocale = getSafeLocale(locale);
  const safeTimeZone = getSafeTimeZone(timeZone, DEFAULT_TIME_ZONE);
  const now = new Date();
  const todayParts = getZonedDateParts(now, safeTimeZone);
  const slots: AvailabilitySlot[] = [];
  const activeBookings = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed");

  for (const service of services) {
    const durationMinutes = service.duration_minutes + service.buffer_minutes;

    for (const member of staff) {
      const canProvideService = member.staff_services.some((item) => item.service_id === service.id);

      if (!canProvideService) {
        continue;
      }

      for (let dayOffset = 0; dayOffset < daysAhead; dayOffset += 1) {
        const dayParts = addDaysToParts(todayParts, dayOffset);
        const currentDateKey = toDateKey(dayParts);

        const exception = member.staff_exceptions.find((item) => item.date === currentDateKey);
        const regularHours = member.staff_hours.find((item) => item.day_of_week === dayOfWeek(dayParts) && item.is_working);

        if (exception && !exception.is_working) {
          continue;
        }

        const startTime = exception?.start_time ?? regularHours?.start_time;
        const endTime = exception?.end_time ?? regularHours?.end_time;

        if (!startTime || !endTime) {
          continue;
        }

        const dayStart = zonedTimeToUtc({ dateParts: dayParts, time: startTime, timeZone: safeTimeZone });
        const dayEnd = zonedTimeToUtc({ dateParts: dayParts, time: endTime, timeZone: safeTimeZone });

        if (!dayStart || !dayEnd) {
          continue;
        }

        for (let slotStart = dayStart; addMinutes(slotStart, durationMinutes) <= dayEnd; slotStart = addMinutes(slotStart, SLOT_STEP_MINUTES)) {
          const slotEnd = addMinutes(slotStart, durationMinutes);

          if (slotStart <= now) {
            continue;
          }

          const hasConflict = activeBookings.some((booking) => {
            if (booking.staff_id !== member.id) {
              return false;
            }

            return overlaps(slotStart, slotEnd, new Date(booking.starts_at), new Date(booking.ends_at));
          });

          if (hasConflict) {
            continue;
          }

          slots.push({
            id: `${service.id}:${member.id}:${slotStart.toISOString()}`,
            serviceId: service.id,
            staffId: member.id,
            startsAt: slotStart.toISOString(),
            label: formatSlotLabel(slotStart, safeLocale, safeTimeZone),
          });
        }
      }
    }
  }

  return slots
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
    .slice(0, 240);
}
