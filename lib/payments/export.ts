import { getSafeCurrency } from "@/lib/currency";
import { getSafeDateLocale } from "@/lib/date-format";
import { getSafeTimeZone } from "@/lib/time-zone";

export type PaymentExportBooking = {
  starts_at: string | null;
  clients: {
    email: string | null;
    full_name: string | null;
    phone: string | null;
  } | null;
  services: {
    name: string | null;
  } | null;
  staff: {
    name: string | null;
  } | null;
} | null;

export type PaymentExportRow = {
  id: string;
  amount: number;
  currency: string | null;
  method: string;
  note: string | null;
  paid_at: string | null;
  payment_scope: string;
  status: string;
  created_at: string;
  bookings: PaymentExportBooking;
};

const PAYMENT_SCOPE_LABELS: Record<string, string> = {
  deposit: "Záloha",
  remaining: "Doplatek",
  full: "Celá platba",
  other: "Jiná platba",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Bankovní převod",
  card_terminal: "Karta na místě",
  cash: "Hotově",
  online_card: "Online karta",
  other: "Jiné",
  voucher: "Voucher",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  failed: "Selhalo",
  paid: "Zaplaceno",
  pending: "Čeká",
  refunded: "Vráceno",
};

const CSV_HEADERS = [
  "Datum platby",
  "Stav",
  "Typ platby",
  "Metoda",
  "Částka",
  "Měna",
  "Termín rezervace",
  "Klient",
  "Email",
  "Telefon",
  "Služba",
  "Zaměstnanec",
  "Poznámka",
  "ID platby",
];

function getLabel(labels: Record<string, string>, value: string) {
  return labels[value] ?? value;
}

export function formatPaymentAmountForCsv(amount: number) {
  return (amount / 100).toFixed(2).replace(".", ",");
}

export function escapeCsvCell(value: string | number | null | undefined) {
  const normalized = value === null || value === undefined ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
}

function formatCsvDate(value: string | null | undefined, timeZone: string, locale: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(getSafeDateLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}

export function buildPaymentsCsv(rows: PaymentExportRow[], timeZone = "Europe/Prague", locale = "cs-CZ") {
  const csvRows = rows.map((row) => [
    formatCsvDate(row.paid_at ?? row.created_at, timeZone, locale),
    getLabel(PAYMENT_STATUS_LABELS, row.status),
    getLabel(PAYMENT_SCOPE_LABELS, row.payment_scope),
    getLabel(PAYMENT_METHOD_LABELS, row.method),
    formatPaymentAmountForCsv(row.amount),
    getSafeCurrency(row.currency),
    formatCsvDate(row.bookings?.starts_at, timeZone, locale),
    row.bookings?.clients?.full_name ?? "",
    row.bookings?.clients?.email ?? "",
    row.bookings?.clients?.phone ?? "",
    row.bookings?.services?.name ?? "",
    row.bookings?.staff?.name ?? "",
    row.note ?? "",
    row.id,
  ]);

  return `\uFEFF${[CSV_HEADERS, ...csvRows]
    .map((row) => row.map(escapeCsvCell).join(";"))
    .join("\n")}\n`;
}

export function getPaymentsExportFilename(date = new Date()) {
  const stamp = new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

  return `temaro-platby-${stamp}.csv`;
}
