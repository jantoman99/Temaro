import type { SupabaseClient } from "@supabase/supabase-js";

import { normalizePhoneInput } from "@/lib/phone";
import type { Database } from "@/types/database";

type TypedSupabase = SupabaseClient<Database>;

export async function findMatchingClient(
  supabase: TypedSupabase,
  tenantId: string,
  {
    email,
    phone,
  }: {
    email?: string | null;
    phone?: string | null;
  },
) {
  const normalizedEmail = email?.trim().toLowerCase() || null;
  const trimmedPhone = phone?.trim() || null;
  const normalizedPhone = trimmedPhone ? normalizePhoneInput(trimmedPhone) : null;

  if (!normalizedEmail && !normalizedPhone && !trimmedPhone) {
    return null;
  }

  const filters: string[] = [];

  if (normalizedEmail) {
    filters.push(`email.eq.${normalizedEmail.replaceAll(",", "\\,")}`);
  }

  if (normalizedPhone) {
    filters.push(`phone.eq.${normalizedPhone.replaceAll(",", "\\,")}`);
  }

  if (trimmedPhone && trimmedPhone !== normalizedPhone) {
    filters.push(`phone.eq.${trimmedPhone.replaceAll(",", "\\,")}`);
  }

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .or(filters.join(","))
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("Failed to find matching client.");
  }

  return data ?? null;
}
