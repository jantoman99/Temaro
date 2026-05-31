import { describe, expect, it } from "vitest";

import { formatPercent, getNoShowRate, getOccupancyRate } from "@/lib/dashboard/metrics";

describe("dashboard metrics", () => {
  it("spocita no-show rate z mesicnich rezervaci", () => {
    expect(getNoShowRate({ noShowBookings: 2, totalBookings: 20 })).toBe(10);
  });

  it("vrati 0 pro no-show rate bez rezervaci", () => {
    expect(getNoShowRate({ noShowBookings: 1, totalBookings: 0 })).toBe(0);
  });

  it("spocita obsazenost z rezervovanych a volnych slotu", () => {
    expect(getOccupancyRate({ bookedSlots: 6, freeSlots: 2 })).toBe(75);
  });

  it("formatuje procenta v bezpecnem rozsahu", () => {
    expect(formatPercent(75.4)).toBe("75 %");
    expect(formatPercent(130)).toBe("100 %");
    expect(formatPercent(-10)).toBe("0 %");
  });
});
