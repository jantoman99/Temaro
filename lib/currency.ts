const DEFAULT_CURRENCY = "CZK";
const SUPPORTED_CURRENCIES = new Set(["CZK", "EUR"]);

export function getSafeCurrency(value: string | null | undefined) {
  const normalized = value?.trim().toUpperCase();

  return normalized && SUPPORTED_CURRENCIES.has(normalized) ? normalized : DEFAULT_CURRENCY;
}

export function formatCurrencyForDisplay(value: number, currency: string | null | undefined, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("cs-CZ", {
    style: "currency",
    currency: getSafeCurrency(currency),
    maximumFractionDigits,
  }).format(value / 100);
}
