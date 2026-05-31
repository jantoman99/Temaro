import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { normalizeForCompare } from "@/lib/utils/normalize-search";

type TypedSupabase = SupabaseClient<Database>;

export async function findMatchingStaff(
  supabase: TypedSupabase,
  tenantId: string,
  name: string,
) {
  const normalizedName = normalizeForCompare(name);

  const { data, error } = await supabase
    .from("staff")
    .select("*")
    .eq("tenant_id", tenantId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("Failed to find matching staff.");
  }

  return (data ?? []).find((member) => normalizeForCompare(member.name) === normalizedName) ?? null;
}
