const SAFE_REDIRECT_PREFIXES = [
  "/account",
  "/calendar",
  "/clients",
  "/dashboard",
  "/payments",
  "/services",
  "/settings",
  "/staff",
  "/start",
  "/register/complete",
  "/reset-password",
];

export function getSafeRedirectPath(value: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  const isAllowedPath = SAFE_REDIRECT_PREFIXES.some(
    (path) => value === path || value.startsWith(`${path}/`) || value.startsWith(`${path}?`),
  );

  return isAllowedPath ? value : "/dashboard";
}
