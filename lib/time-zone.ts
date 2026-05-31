const DATETIME_LOCAL_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const DEFAULT_TIME_ZONE = "Europe/Prague";

function isSupportedTimeZone(value: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

function getSafeDate(value: Date, fallback = new Date()) {
  if (!Number.isNaN(value.getTime())) {
    return value;
  }

  return Number.isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

export function getSafeTimeZone(value: string | null | undefined, fallback = DEFAULT_TIME_ZONE) {
  const safeFallback = isSupportedTimeZone(fallback) ? fallback : DEFAULT_TIME_ZONE;

  if (!value) {
    return safeFallback;
  }

  return isSupportedTimeZone(value) ? value : safeFallback;
}

export function getDateKeyInTimeZone(value: Date | string, timeZone: string, fallback = new Date()) {
  const date = typeof value === "string" ? new Date(value) : value;
  const safeDate = getSafeDate(date, fallback);
  const safeTimeZone = getSafeTimeZone(timeZone);

  return new Intl.DateTimeFormat("sv-SE", {
    day: "2-digit",
    month: "2-digit",
    timeZone: safeTimeZone,
    year: "numeric",
  }).format(safeDate);
}

function addDaysToDateKey(dayKey: string, days: number) {
  const [year = "1970", month = "01", day = "01"] = dayKey.split("-");
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day) + days, 12, 0, 0));

  return date.toISOString().slice(0, 10);
}

function isValidLocalDateTime({
  day,
  hour,
  minute,
  month,
  year,
}: {
  day: number;
  hour: number;
  minute: number;
  month: number;
  year: number;
}) {
  if (month < 1 || month > 12 || day < 1 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function getUtcDayRangeForTimeZone(value: Date | string, timeZone: string) {
  const dayKey = getDateKeyInTimeZone(value, timeZone);
  const nextDayKey = addDaysToDateKey(dayKey, 1);

  return {
    end: localDatetimeToUtcIso(`${nextDayKey}T00:00`, timeZone),
    start: localDatetimeToUtcIso(`${dayKey}T00:00`, timeZone),
  };
}

export function getUtcMonthStartForTimeZone(value: Date | string, timeZone: string) {
  const dayKey = getDateKeyInTimeZone(value, timeZone);
  const monthKey = `${dayKey.slice(0, 7)}-01`;

  return localDatetimeToUtcIso(`${monthKey}T00:00`, timeZone);
}

function getLocalDateTimeParts(date: Date, timeZone: string) {
  const safeTimeZone = getSafeTimeZone(timeZone);
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: safeTimeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    month: Number(values.month),
    year: Number(values.year),
  };
}

export function localDatetimeToUtcIso(value: string, timeZone: string) {
  const safeTimeZone = getSafeTimeZone(timeZone);
  const localMatch = DATETIME_LOCAL_PATTERN.exec(value);

  if (!localMatch) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toISOString();
  }

  const [, year = "1970", month = "01", day = "01", hour = "00", minute = "00"] = localMatch;
  const localDateTime = {
    day: Number(day),
    hour: Number(hour),
    minute: Number(minute),
    month: Number(month),
    year: Number(year),
  };

  if (!isValidLocalDateTime(localDateTime)) {
    return value;
  }

  const localAsUtcMs = Date.UTC(
    localDateTime.year,
    localDateTime.month - 1,
    localDateTime.day,
    localDateTime.hour,
    localDateTime.minute,
    0,
  );
  const candidates: Date[] = [];

  // Search possible zone offsets. This avoids wrong conversions around DST gaps/overlaps.
  for (let offsetMinutes = -14 * 60; offsetMinutes <= 14 * 60; offsetMinutes += 15) {
    const candidate = new Date(localAsUtcMs - offsetMinutes * 60 * 1000);
    const candidateLocal = getLocalDateTimeParts(candidate, safeTimeZone);

    if (
      candidateLocal.year === localDateTime.year &&
      candidateLocal.month === localDateTime.month &&
      candidateLocal.day === localDateTime.day &&
      candidateLocal.hour === localDateTime.hour &&
      candidateLocal.minute === localDateTime.minute
    ) {
      candidates.push(candidate);
    }
  }

  if (candidates.length === 0) {
    return value;
  }

  candidates.sort((a, b) => a.getTime() - b.getTime());

  return candidates[0]?.toISOString() ?? value;
}

export function utcIsoToLocalDatetimeValue(value: string, timeZone: string) {
  const safeTimeZone = getSafeTimeZone(timeZone);
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    timeZone: safeTimeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}
