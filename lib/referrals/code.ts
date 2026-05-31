import { createHash, randomBytes } from "node:crypto";

const REFERRAL_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeReferralCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatReferralCode(code: string) {
  return normalizeReferralCode(code).replace(/(.{4})/g, "$1-").replace(/-$/, "");
}

export function getReferralCodeLast4(code: string) {
  return normalizeReferralCode(code).slice(-4);
}

export function hashReferralCode(code: string) {
  return createHash("sha256").update(normalizeReferralCode(code)).digest("hex");
}

export function generateReferralCode() {
  const bytes = randomBytes(10);
  let code = "";

  for (const byte of bytes) {
    code += REFERRAL_CODE_ALPHABET[byte % REFERRAL_CODE_ALPHABET.length];
  }

  return formatReferralCode(code);
}
