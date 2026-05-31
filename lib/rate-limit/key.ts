import { createHash } from "node:crypto";

export function createRateLimitKey(parts: string[]) {
  const normalizedParts = parts.map((part) => part.trim().toLowerCase());

  return createHash("sha256")
    .update(normalizedParts.join("\0"))
    .digest("hex");
}
