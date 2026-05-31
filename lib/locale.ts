const DEFAULT_APP_LOCALE = "cs";
const SUPPORTED_APP_LOCALES = new Set(["cs", "sk", "en"]);

export type AppLocale = "cs" | "sk" | "en";

export function getSafeAppLocale(value: string | null | undefined): AppLocale {
  const normalized = value?.trim().toLowerCase();

  return normalized && SUPPORTED_APP_LOCALES.has(normalized) ? (normalized as AppLocale) : DEFAULT_APP_LOCALE;
}
