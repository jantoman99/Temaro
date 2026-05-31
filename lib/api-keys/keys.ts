import { createHash, randomBytes } from "node:crypto";

const API_KEY_PREFIX = "tmro";

export function generateTenantApiKey() {
  return `${API_KEY_PREFIX}_${randomBytes(24).toString("base64url")}`;
}

export function hashTenantApiKey(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function getTenantApiKeyPrefix(token: string) {
  return token.slice(0, 13);
}

export function getTenantApiKeyLast4(token: string) {
  return token.slice(-4);
}

export function isTenantApiKeyFormat(token: string) {
  return /^tmro_[A-Za-z0-9_-]{32}$/.test(token);
}
