const CUSTOM_DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

export function normalizeCustomDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .replace(/^www\./, "");
}

export function isSafeCustomDomain(value: string) {
  const domain = normalizeCustomDomain(value);

  return domain.length <= 253 && CUSTOM_DOMAIN_PATTERN.test(domain) && !domain.endsWith(".localhost");
}

function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createCustomDomainVerificationToken(bytes?: Uint8Array) {
  const tokenBytes = bytes ?? new Uint8Array(16);

  if (!bytes) {
    globalThis.crypto.getRandomValues(tokenBytes);
  }

  return `temaro-domain-verification=${bytesToHex(tokenBytes)}`;
}

export function getCustomDomainTxtName(domain: string) {
  return `_temaro.${normalizeCustomDomain(domain)}`;
}

export function normalizeRequestHost(value: string | null) {
  if (!value) {
    return "";
  }

  return value.trim().toLowerCase().replace(/:\d+$/, "");
}

export function isLikelyPlatformHost(host: string, appUrl: string | undefined) {
  const normalizedHost = normalizeRequestHost(host);

  if (!normalizedHost || normalizedHost === "localhost" || normalizedHost === "127.0.0.1") {
    return true;
  }

  if (normalizedHost.endsWith(".vercel.app")) {
    return true;
  }

  if (!appUrl) {
    return false;
  }

  try {
    return normalizedHost === normalizeRequestHost(new URL(appUrl).host);
  } catch {
    return false;
  }
}
