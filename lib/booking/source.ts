import type { Json } from "@/types/database";

export const BOOKING_SOURCE_VALUES = [
  "manual",
  "online",
  "instagram",
  "qr",
  "widget",
  "catalog",
  "google",
  "referral",
] as const;

export type BookingSource = (typeof BOOKING_SOURCE_VALUES)[number];
export const PUBLIC_BOOKING_SOURCE_VALUES = [
  "online",
  "instagram",
  "qr",
  "widget",
  "catalog",
  "google",
  "referral",
] as const;
export type PublicBookingSource = (typeof PUBLIC_BOOKING_SOURCE_VALUES)[number];

export type BookingSourceTracking = {
  source: BookingSource;
  sourceDetail: string | null;
  metadata: Record<string, string>;
};

const BOOKING_SOURCE_LABELS: Record<BookingSource, string> = {
  catalog: "Katalog",
  google: "Google",
  instagram: "Instagram",
  manual: "Ručně",
  online: "Web",
  qr: "QR",
  referral: "Doporučení",
  widget: "Widget",
};

const TRACKING_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "ref",
] as const;

const SOURCE_ALIASES: Record<string, BookingSource> = {
  catalogue: "catalog",
  direct: "online",
  embed: "widget",
  facebook: "referral",
  fb: "referral",
  ig: "instagram",
  instagram: "instagram",
  katalog: "catalog",
  mapy: "google",
  maps: "google",
  qr: "qr",
  website: "online",
  web: "online",
  widget: "widget",
};

function cleanTrackingValue(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue) {
    return null;
  }

  const normalized = rawValue.trim().replace(/\s+/g, " ");

  return normalized.length > 0 ? normalized.slice(0, 120) : null;
}

export function getBookingSourceLabel(source: string | null | undefined) {
  if (source && BOOKING_SOURCE_VALUES.includes(source as BookingSource)) {
    return BOOKING_SOURCE_LABELS[source as BookingSource];
  }

  return "Neznámý zdroj";
}

export function getBookingSourceDescription({
  source,
  sourceDetail,
}: {
  source: string | null | undefined;
  sourceDetail?: string | null;
}) {
  const label = getBookingSourceLabel(source);

  return sourceDetail ? `${label} · ${sourceDetail}` : label;
}

export function createBookingSourceMetadata(metadata: Record<string, string>): Json {
  return metadata;
}

export function getBookingSourceTracking(searchParams?: Record<string, string | string[] | undefined>): BookingSourceTracking {
  const params = searchParams ?? {};
  const explicitSource = cleanTrackingValue(params.source)?.toLowerCase() ?? null;
  const utmSource = cleanTrackingValue(params.utm_source)?.toLowerCase() ?? null;
  const ref = cleanTrackingValue(params.ref)?.toLowerCase() ?? null;
  const source = SOURCE_ALIASES[explicitSource ?? ""] ?? SOURCE_ALIASES[utmSource ?? ""] ?? SOURCE_ALIASES[ref ?? ""] ?? "online";
  const metadata = TRACKING_KEYS.reduce<Record<string, string>>((values, key) => {
    const value = cleanTrackingValue(params[key]);

    if (value) {
      values[key] = value;
    }

    return values;
  }, {});

  const sourceDetail = cleanTrackingValue(params.source_detail) ?? metadata.utm_campaign ?? metadata.ref ?? null;

  return {
    metadata,
    source,
    sourceDetail,
  };
}
