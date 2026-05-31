import { getSafeTimeZone } from "@/lib/time-zone";

const DEFAULT_DATE_LOCALE = "cs-CZ";

function getSafeDate(value: Date, fallback = new Date()) {
  if (!Number.isNaN(value.getTime())) {
    return value;
  }

  return Number.isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

export function getSafeDateLocale(locale: string | null | undefined) {
  if (!locale) {
    return DEFAULT_DATE_LOCALE;
  }

  try {
    new Intl.DateTimeFormat(locale).format(new Date());
    return locale;
  } catch {
    return DEFAULT_DATE_LOCALE;
  }
}

export function getValidTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const timestamp = date.getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

export function formatDateForDisplay(value: string, locale = "cs-CZ") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Neplatné datum";
  }

  return new Intl.DateTimeFormat(getSafeDateLocale(locale), {
    dateStyle: "medium",
  }).format(date);
}

export function formatDateTimeForDisplay(
  value: string,
  timeZone?: string | null,
  locale = "cs-CZ",
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Neplatný termín";
  }

  return new Intl.DateTimeFormat(getSafeDateLocale(locale), {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}

export function formatTimeForDisplay(
  value: string,
  timeZone?: string | null,
  locale = "cs-CZ",
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Neplatný termín";
  }

  return new Intl.DateTimeFormat(getSafeDateLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: getSafeTimeZone(timeZone),
  }).format(date);
}

export function getDateKeyForCalendar(
  value: Date | string,
  timeZone?: string | null,
  fallback = new Date(),
) {
  const date = value instanceof Date ? value : new Date(value);
  const safeDate = getSafeDate(date, fallback);

  return new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: getSafeTimeZone(timeZone),
    year: "numeric",
  }).format(safeDate);
}
