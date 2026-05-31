import { cache } from "react";

import { getActiveAuthContextError } from "@/lib/auth/active-context";
import { getAuthContextError } from "@/lib/auth/session-context";
import { createClient } from "@/lib/supabase/server";

type DashboardContextError = "Unauthorized" | "missing_tenant" | "missing_role" | "missing_staff";

export const requireDashboardContext = cache(async function requireDashboardContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    return { error: "Unauthorized" as const };
  }

  const authContextError = getAuthContextError(user);

  if (authContextError) {
    return { error: authContextError };
  }

  const activeContextError = await getActiveAuthContextError(supabase, user);

  if (activeContextError) {
    return { error: activeContextError };
  }

  const role = user.app_metadata.role;
  const tenantId = user.app_metadata.tenant_id.trim();
  const staffId = role === "staff" ? user.app_metadata.staff_id.trim() : null;

  return {
    isOwner: role === "owner",
    role,
    staffId,
    supabase,
    tenantId,
    user,
  };
});

export function getDashboardContextRedirect(error: DashboardContextError | undefined) {
  if (error === "Unauthorized") {
    return "/login";
  }

  if (!error) {
    return "/login";
  }

  return `/login?error=${error}`;
}
