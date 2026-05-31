function getAppMetadata(user: unknown) {
  if (!user || typeof user !== "object" || !("app_metadata" in user)) {
    return null;
  }

  const metadata = user.app_metadata;

  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  return metadata as Record<string, unknown>;
}

export function getAuthContextError(user: unknown) {
  const metadata = getAppMetadata(user);
  const tenantId = metadata?.tenant_id;

  if (typeof tenantId !== "string" || !tenantId.trim()) {
    return "missing_tenant" as const;
  }

  const role = metadata?.role;
  const staffId = metadata?.staff_id;

  if (role !== "owner" && role !== "staff") {
    return "missing_role" as const;
  }

  if (role === "staff" && (typeof staffId !== "string" || !staffId.trim())) {
    return "missing_staff" as const;
  }

  return null;
}
