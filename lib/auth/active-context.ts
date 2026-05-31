import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

type AuthUserWithMetadata = {
  app_metadata?: Record<string, unknown>;
};

type ActiveAuthContextError = "missing_tenant" | "missing_staff";

export async function getActiveAuthContextError(
  supabase: SupabaseClient<Database>,
  user: AuthUserWithMetadata,
): Promise<ActiveAuthContextError | null> {
  const tenantId = typeof user.app_metadata?.tenant_id === "string" ? user.app_metadata.tenant_id.trim() : "";
  const role = user.app_metadata?.role;

  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id")
    .eq("id", tenantId)
    .is("deleted_at", null)
    .maybeSingle();

  if (tenantError || !tenant) {
    return "missing_tenant";
  }

  if (role === "staff") {
    const staffId = typeof user.app_metadata?.staff_id === "string" ? user.app_metadata.staff_id.trim() : "";
    const { data: staff, error: staffError } = await supabase
      .from("staff")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("id", staffId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .maybeSingle();

    if (staffError || !staff) {
      return "missing_staff";
    }
  }

  return null;
}
