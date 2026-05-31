import { getBookingSourceLabel, type BookingSource } from "@/lib/booking/source";

export type RevenueReportPeriodKey = "30d" | "90d" | "year";

export type RevenueReportPaymentRow = {
  amount: number;
  currency: string | null;
  paid_at: string | null;
  status: string;
  bookings: {
    source: BookingSource | null;
    services: {
      name: string | null;
    } | null;
    staff: {
      name: string | null;
    } | null;
  } | null;
};

export type RevenueBreakdownRow = {
  amount: number;
  bookingCount: number;
  label: string;
  percentage: number;
};

export type RevenueReport = {
  averagePaymentAmount: number;
  currency: string;
  paidBookingCount: number;
  serviceBreakdown: RevenueBreakdownRow[];
  sourceBreakdown: RevenueBreakdownRow[];
  staffBreakdown: RevenueBreakdownRow[];
  totalRevenue: number;
};

const PERIOD_LABELS: Record<RevenueReportPeriodKey, string> = {
  "30d": "Posledních 30 dní",
  "90d": "Posledních 90 dní",
  year: "Tento rok",
};

function addDays(date: Date, days: number) {
  const value = new Date(date);
  value.setDate(value.getDate() + days);
  return value;
}

function startOfYear(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0));
}

export function getRevenueReportPeriod(period: RevenueReportPeriodKey, now = new Date()) {
  const end = new Date(now);
  const start = period === "year"
    ? startOfYear(end)
    : addDays(end, period === "90d" ? -90 : -30);

  return {
    end,
    endIso: end.toISOString(),
    key: period,
    label: PERIOD_LABELS[period],
    start,
    startIso: start.toISOString(),
  };
}

function incrementBreakdown(
  map: Map<string, { amount: number; bookingCount: number }>,
  label: string,
  amount: number,
) {
  const current = map.get(label) ?? { amount: 0, bookingCount: 0 };

  map.set(label, {
    amount: current.amount + amount,
    bookingCount: current.bookingCount + 1,
  });
}

function toBreakdownRows(map: Map<string, { amount: number; bookingCount: number }>, totalRevenue: number) {
  return [...map.entries()]
    .map(([label, value]) => ({
      amount: value.amount,
      bookingCount: value.bookingCount,
      label,
      percentage: totalRevenue > 0 ? Math.round((value.amount / totalRevenue) * 100) : 0,
    }))
    .sort((left, right) => right.amount - left.amount || left.label.localeCompare(right.label, "cs"));
}

export function buildRevenueReport(rows: RevenueReportPaymentRow[]): RevenueReport {
  const paidRows = rows.filter((row) => row.status === "paid" && row.amount > 0);
  const totalRevenue = paidRows.reduce((sum, row) => sum + row.amount, 0);
  const currency = paidRows.find((row) => row.currency)?.currency ?? "CZK";
  const serviceMap = new Map<string, { amount: number; bookingCount: number }>();
  const staffMap = new Map<string, { amount: number; bookingCount: number }>();
  const sourceMap = new Map<string, { amount: number; bookingCount: number }>();

  for (const row of paidRows) {
    incrementBreakdown(serviceMap, row.bookings?.services?.name ?? "Bez služby", row.amount);
    incrementBreakdown(staffMap, row.bookings?.staff?.name ?? "Bez zaměstnance", row.amount);
    incrementBreakdown(sourceMap, getBookingSourceLabel(row.bookings?.source ?? "manual"), row.amount);
  }

  return {
    averagePaymentAmount: paidRows.length > 0 ? Math.round(totalRevenue / paidRows.length) : 0,
    currency,
    paidBookingCount: paidRows.length,
    serviceBreakdown: toBreakdownRows(serviceMap, totalRevenue),
    sourceBreakdown: toBreakdownRows(sourceMap, totalRevenue),
    staffBreakdown: toBreakdownRows(staffMap, totalRevenue),
    totalRevenue,
  };
}
