import { createHash, randomBytes } from "node:crypto";

const VOUCHER_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeVoucherCode(code: string) {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatVoucherCode(code: string) {
  return normalizeVoucherCode(code).replace(/(.{4})/g, "$1-").replace(/-$/, "");
}

export function getVoucherCodeLast4(code: string) {
  return normalizeVoucherCode(code).slice(-4);
}

export function hashVoucherCode(code: string) {
  return createHash("sha256").update(normalizeVoucherCode(code)).digest("hex");
}

export function generateVoucherCode() {
  const bytes = randomBytes(12);
  let code = "";

  for (const byte of bytes) {
    code += VOUCHER_CODE_ALPHABET[byte % VOUCHER_CODE_ALPHABET.length];
  }

  return formatVoucherCode(code);
}
