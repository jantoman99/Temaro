export function escapeSupabaseLike(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("%", "\\%")
    .replaceAll("_", "\\_")
    .replaceAll(",", "\\,");
}

export function normalizeForCompare(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}
