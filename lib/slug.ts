export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64)
    .replace(/^-+|-+$/g, "");
}

export function createSlugWithSuffix(baseSlug: string, suffix: number) {
  const safeBaseSlug = baseSlug || "podnik";
  const suffixText = `-${suffix}`;
  const prefix = safeBaseSlug.slice(0, 64 - suffixText.length).replace(/-+$/g, "") || "podnik";

  return `${prefix}${suffixText}`;
}
