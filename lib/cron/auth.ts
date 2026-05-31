import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function isAuthorizedCronRequest(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || cronSecret.length < 24) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${cronSecret}`;

  if (!authHeader || authHeader.length !== expected.length) {
    return false;
  }

  const authHeaderBuffer = Buffer.from(authHeader);
  const expectedBuffer = Buffer.from(expected);

  if (authHeaderBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(authHeaderBuffer, expectedBuffer);
}
