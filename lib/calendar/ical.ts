import { createHash, randomBytes } from "node:crypto";

import { getBaseAppUrl } from "@/lib/app-url";

export type IcalBooking = {
  id: string;
  starts_at: string;
  ends_at: string;
  notes: string | null;
  status: string;
  clients: { full_name: string | null } | null;
  services: { name: string | null } | null;
  staff: { name: string | null } | null;
  tenants: { name: string | null; timezone: string | null } | null;
};

export function createCalendarFeedToken() {
  return randomBytes(32).toString("hex");
}

export function hashCalendarFeedToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getCalendarFeedUrl(token: string) {
  return `${getBaseAppUrl()}/calendar-feed/${token}.ics`;
}

function escapeIcalText(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll(/\r?\n/g, "\\n");
}

function formatIcalDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "19700101T000000Z";
  }

  return date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
}

function foldIcalLine(line: string) {
  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > 75) {
    chunks.push(remaining.slice(0, 75));
    remaining = ` ${remaining.slice(75)}`;
  }

  chunks.push(remaining);
  return chunks.join("\r\n");
}

function createBookingEvent(booking: IcalBooking, generatedAt: Date) {
  const serviceName = booking.services?.name ?? "Rezervace";
  const clientName = booking.clients?.full_name ?? "Klient";
  const staffName = booking.staff?.name ?? "Poskytovatel";
  const summary = `${serviceName} - ${clientName}`;
  const description = [
    `Klient: ${clientName}`,
    `Služba: ${serviceName}`,
    `Poskytovatel: ${staffName}`,
    `Stav: ${booking.status}`,
    booking.notes ? `Poznámka: ${booking.notes}` : null,
  ].filter(Boolean).join("\n");

  return [
    "BEGIN:VEVENT",
    `UID:temaro-${booking.id}@${new URL(getBaseAppUrl()).host}`,
    `DTSTAMP:${formatIcalDate(generatedAt)}`,
    `DTSTART:${formatIcalDate(booking.starts_at)}`,
    `DTEND:${formatIcalDate(booking.ends_at)}`,
    `SUMMARY:${escapeIcalText(summary)}`,
    `DESCRIPTION:${escapeIcalText(description)}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
  ].map(foldIcalLine);
}

export function buildCalendarIcs(bookings: IcalBooking[], generatedAt = new Date()) {
  const tenantName = bookings[0]?.tenants?.name ?? "Temaro";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Temaro//Calendar Feed//CS",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcalText(`${tenantName} - rezervace`)}`,
    `X-WR-TIMEZONE:${escapeIcalText(bookings[0]?.tenants?.timezone ?? "Europe/Prague")}`,
    ...bookings.flatMap((booking) => createBookingEvent(booking, generatedAt)),
    "END:VCALENDAR",
  ];

  return `${lines.join("\r\n")}\r\n`;
}
