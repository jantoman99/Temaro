export type TableParamValue = number | string | null | undefined;

export function buildTableSearchParams(currentSearch: string, updates: Record<string, TableParamValue>) {
  const nextParams = new URLSearchParams(currentSearch);

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
  }

  return nextParams.toString();
}
