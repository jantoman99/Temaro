import { describe, expect, it } from "vitest";

import { buildRevenueReport, getRevenueReportPeriod, type RevenueReportPaymentRow } from "@/lib/reports/revenue";

const rows: RevenueReportPaymentRow[] = [
  {
    amount: 120000,
    bookings: {
      services: { name: "Barvení" },
      source: "widget",
      staff: { name: "Anna" },
    },
    currency: "CZK",
    paid_at: "2026-05-05T10:00:00.000Z",
    status: "paid",
  },
  {
    amount: 80000,
    bookings: {
      services: { name: "Střih" },
      source: "instagram",
      staff: { name: "Anna" },
    },
    currency: "CZK",
    paid_at: "2026-05-06T10:00:00.000Z",
    status: "paid",
  },
  {
    amount: 40000,
    bookings: {
      services: { name: "Střih" },
      source: "manual",
      staff: { name: "Petr" },
    },
    currency: "CZK",
    paid_at: "2026-05-07T10:00:00.000Z",
    status: "pending",
  },
];

describe("revenue report", () => {
  it("pocita trzby jen ze zaplacenych plateb a radi rozpady podle castky", () => {
    const report = buildRevenueReport(rows);

    expect(report.totalRevenue).toBe(200000);
    expect(report.paidBookingCount).toBe(2);
    expect(report.averagePaymentAmount).toBe(100000);
    expect(report.serviceBreakdown).toEqual([
      { amount: 120000, bookingCount: 1, label: "Barvení", percentage: 60 },
      { amount: 80000, bookingCount: 1, label: "Střih", percentage: 40 },
    ]);
    expect(report.staffBreakdown).toEqual([
      { amount: 200000, bookingCount: 2, label: "Anna", percentage: 100 },
    ]);
  });

  it("pouziva citelne popisky zdroju rezervaci", () => {
    const report = buildRevenueReport(rows);

    expect(report.sourceBreakdown).toEqual([
      { amount: 120000, bookingCount: 1, label: "Widget", percentage: 60 },
      { amount: 80000, bookingCount: 1, label: "Instagram", percentage: 40 },
    ]);
  });

  it("vrati nulovy report bez plateb", () => {
    const report = buildRevenueReport([]);

    expect(report.totalRevenue).toBe(0);
    expect(report.currency).toBe("CZK");
    expect(report.serviceBreakdown).toEqual([]);
  });

  it("vrati hranice reportovaciho obdobi", () => {
    const period = getRevenueReportPeriod("30d", new Date("2026-05-08T12:00:00.000Z"));

    expect(period.label).toBe("Posledních 30 dní");
    expect(period.startIso).toBe("2026-04-08T12:00:00.000Z");
    expect(period.endIso).toBe("2026-05-08T12:00:00.000Z");
  });
});
