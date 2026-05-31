import { normalizePhoneInput } from "@/lib/phone";
import { escapeSupabaseLike } from "@/lib/utils/normalize-search";

export function buildClientSearchFilter(query: string) {
  const escapedQuery = escapeSupabaseLike(query);
  const filters = [
    `full_name.ilike.%${escapedQuery}%`,
    `phone.ilike.%${escapedQuery}%`,
    `email.ilike.%${escapedQuery}%`,
    `notes.ilike.%${escapedQuery}%`,
    `flag_reason.ilike.%${escapedQuery}%`,
  ];
  const normalizedPhoneQuery = normalizePhoneInput(query);

  if (normalizedPhoneQuery !== query && /\d/.test(normalizedPhoneQuery)) {
    filters.push(`phone.ilike.%${escapeSupabaseLike(normalizedPhoneQuery)}%`);
  }

  return filters.join(",");
}
