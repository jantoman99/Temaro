import { describe, expect, it } from "vitest";

import {
  buildCalendarIcs,
  createCalendarFeedToken,
  getCalendarFeedUrl,
  hashCalendarFeedToken,
} from "@/lib/calendar/ical";

describe("calendar iCal feed", () => {
  it("generuje 64znakovy token a sha256 hash", () => {
    const token = createCalendarFeedToken();

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(hashCalendarFeedToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashCalendarFeedToken(token)).not.toBe(token);
  });

  it("vytvori feed URL bez query tenant id", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.temaro.cz";

    expect(getCalendarFeedUrl("a".repeat(64))).toBe(`https://app.temaro.cz/calendar-feed/${"a".repeat(64)}.ics`);
  });

  it("vytvori validni ICS s escapovanym obsahem", () => {
    const ics = buildCalendarIcs(
      [
        {
          id: "booking-1",
          clients: { full_name: "Jan; Novak" },
          ends_at: "2026-05-05T10:30:00.000Z",
          notes: "Poznámka, test\nnový řádek",
          services: { name: "Střih, vousy" },
          staff: { name: "Eva" },
          starts_at: "2026-05-05T10:00:00.000Z",
          status: "confirmed",
          tenants: { name: "Demo barber", timezone: "Europe/Prague" },
        },
      ],
      new Date("2026-05-03T10:00:00.000Z"),
    );

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:20260505T100000Z");
    expect(ics).toContain("SUMMARY:Střih\\, vousy - Jan\\; Novak");
    expect(ics).toContain("DESCRIPTION:Klient: Jan\\; Novak\\nSlužba: Střih\\, vousy");
    expect(ics).toContain("END:VCALENDAR");
  });
});
