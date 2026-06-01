import { describe, expect, it } from "vitest";

import { getBookingPageReadiness } from "@/lib/onboarding/booking-page-readiness";

describe("booking page readiness", () => {
  it("ukaze hotovou stranku az kdyz ma sluzby, tym, pracovni dobu a vazbu sluzby", () => {
    expect(getBookingPageReadiness({
      serviceAssignmentsCount: 1,
      servicesCount: 1,
      staffCount: 1,
      workingHoursCount: 1,
    })).toMatchObject({
      canReceiveBookings: true,
      headline: "Klient už může rezervovat",
      nextHref: "/staff",
    });
  });

  it("vede podnik na prvni chybejici krok", () => {
    expect(getBookingPageReadiness({
      serviceAssignmentsCount: 0,
      servicesCount: 0,
      staffCount: 0,
      workingHoursCount: 0,
    })).toMatchObject({
      canReceiveBookings: false,
      headline: "Chybí první služba",
      nextHref: "/services",
    });

    expect(getBookingPageReadiness({
      serviceAssignmentsCount: 0,
      servicesCount: 1,
      staffCount: 1,
      workingHoursCount: 1,
    })).toMatchObject({
      headline: "Chybí propojení služby s týmem",
      nextHref: "/staff",
    });
  });
});
