import "server-only";

import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { getClientIp } from "@/lib/rate-limit/client-ip";
import { createRateLimitKey } from "@/lib/rate-limit/key";

let loginRateLimit: Ratelimit | null = null;
let registerRateLimit: Ratelimit | null = null;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

function getLoginRateLimit() {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  loginRateLimit ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    analytics: true,
    prefix: "ratelimit:auth-login",
  });

  return loginRateLimit;
}

function getRegisterRateLimit() {
  const redis = getRedis();

  if (!redis) {
    return null;
  }

  registerRateLimit ??= new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "30 m"),
    analytics: true,
    prefix: "ratelimit:auth-register",
  });

  return registerRateLimit;
}

async function getAuthRateLimitKey(email: string) {
  const headerStore = await headers();
  const ip = getClientIp(headerStore);

  return createRateLimitKey(["auth", ip, email]);
}

export async function limitLogin(email: string) {
  const rateLimit = getLoginRateLimit();

  if (!rateLimit) {
    return { success: true, skipped: true };
  }

  return rateLimit.limit(await getAuthRateLimitKey(email));
}

export async function limitRegister(email: string) {
  const rateLimit = getRegisterRateLimit();

  if (!rateLimit) {
    return { success: true, skipped: true };
  }

  return rateLimit.limit(await getAuthRateLimitKey(email));
}
