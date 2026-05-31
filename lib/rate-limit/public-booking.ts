import "server-only";

import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { getClientIp } from "@/lib/rate-limit/client-ip";
import { createRateLimitKey } from "@/lib/rate-limit/key";

let bookingRateLimit: Ratelimit | null = null;

function getRateLimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  bookingRateLimit ??= new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true,
    prefix: "ratelimit:public-booking",
  });

  return bookingRateLimit;
}

export async function limitPublicBooking(slug: string) {
  const rateLimit = getRateLimit();

  if (!rateLimit) {
    return { success: true, skipped: true };
  }

  const headerStore = await headers();
  const ip = getClientIp(headerStore);

  return rateLimit.limit(createRateLimitKey(["public-booking", slug, ip]));
}
