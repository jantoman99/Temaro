export function normalizePhoneInput(value: string) {
  return value.trim().replace(/[\s()./-]+/g, "");
}
