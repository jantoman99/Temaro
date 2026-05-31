function normalizeIpHeader(value: string | null) {
  const normalized = value?.trim();

  if (!normalized || normalized.toLowerCase() === "unknown") {
    return null;
  }

  return normalized;
}

export function getClientIp(headerStore: Headers) {
  const forwardedFor = normalizeIpHeader(headerStore.get("x-forwarded-for")?.split(",")[0] ?? null);
  const cloudflareIp = normalizeIpHeader(headerStore.get("cf-connecting-ip"));
  const realIp = normalizeIpHeader(headerStore.get("x-real-ip"));

  return (
    forwardedFor ||
    cloudflareIp ||
    realIp ||
    "unknown"
  );
}
