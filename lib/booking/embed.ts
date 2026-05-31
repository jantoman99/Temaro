const SAFE_BOOKING_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function isSafeBookingSlug(slug: string) {
  return SAFE_BOOKING_SLUG_PATTERN.test(slug);
}

export function getBookingButtonEmbedCode({
  appUrl,
  brandColor,
  label = "Rezervovat termín",
  slug,
}: {
  appUrl: string;
  brandColor?: string | null;
  label?: string;
  slug: string;
}) {
  if (!isSafeBookingSlug(slug)) {
    throw new Error("Invalid booking slug");
  }

  const origin = new URL(appUrl).origin;
  const colorAttribute = brandColor ? ` data-color="${escapeHtmlAttribute(brandColor)}"` : "";

  return `<script async src="${origin}/embed/booking-button.js" data-slug="${escapeHtmlAttribute(slug)}" data-label="${escapeHtmlAttribute(label)}"${colorAttribute}></script>`;
}

export function getBookingIframeEmbedCode({
  appUrl,
  height = 760,
  slug,
  title = "Online rezervace",
}: {
  appUrl: string;
  height?: number;
  slug: string;
  title?: string;
}) {
  if (!isSafeBookingSlug(slug)) {
    throw new Error("Invalid booking slug");
  }

  const origin = new URL(appUrl).origin;
  const safeHeight = Number.isFinite(height) && height >= 480 && height <= 1200 ? Math.round(height) : 760;

  return `<script async src="${origin}/embed/booking-widget.js" data-slug="${escapeHtmlAttribute(slug)}" data-title="${escapeHtmlAttribute(title)}" data-height="${safeHeight}"></script>`;
}
