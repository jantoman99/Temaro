const DEFAULT_APP_URL = "http://localhost:3000";

export function getBaseAppUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_APP_URL;

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_APP_URL;
    }

    return url.origin;
  } catch {
    return DEFAULT_APP_URL;
  }
}
