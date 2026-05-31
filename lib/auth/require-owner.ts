import { cache } from "react";

import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { getAuthContextError } from "@/lib/auth/session-context";
import { createClient } from "@/lib/supabase/server";

export const requireOwner = cache(async function requireOwner() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return { error: "Unauthorized" as const };
  }

  const authContextError = getAuthContextError(user);

  if (authContextError || user.app_metadata.role !== "owner") {
    return { error: "Forbidden" as const };
  }

  const activeContextError = await getActiveAuthContextError(supabase, user);

  if (activeContextError) {
    return { error: "Forbidden" as const };
  }

  const tenantId = user.app_metadata.tenant_id.trim();

  return { supabase, tenantId, user };
});
