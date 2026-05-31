import { NextResponse } from "next/server";

import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import packageJson from "@/package.json";

type HealthStatus = "degraded" | "error" | "ok";

export const dynamic = "force-dynamic";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function getMissingEnv() {
  return REQUIRED_ENV.filter((key) => !process.env[key]?.trim());
}

function getPublicEnvCheck(missingEnv: readonly string[]) {
  return {
    ok: missingEnv.length === 0,
    missing: missingEnv.length,
  };
}

function getRateLimitCheck() {
  const hasUrl = Boolean(process.env.UPSTASH_REDIS_REST_URL?.trim());
  const hasToken = Boolean(process.env.UPSTASH_REDIS_REST_TOKEN?.trim());

  return {
    configured: hasUrl && hasToken,
    ok: hasUrl === hasToken,
  };
}

async function checkSupabase() {
  if (!hasSupabaseAdminEnv()) {
    return { ok: false, configured: false, latencyMs: null };
  }

  const startedAt = performance.now();
  const supabase = createAdminClient();
  const { error } = await supabase.from("tenants").select("id").limit(1);

  return {
    ok: !error,
    configured: true,
    latencyMs: Math.round(performance.now() - startedAt),
  };
}

export async function GET() {
  const missingEnv = getMissingEnv();
  const envOk = hasSupabaseEnv() && hasSupabaseAdminEnv();
  const env = getPublicEnvCheck(missingEnv);
  const rateLimit = getRateLimitCheck();

  try {
    const supabase = await checkSupabase();
    const status: HealthStatus = !envOk ? "degraded" : supabase.ok ? "ok" : "error";

    return NextResponse.json(
      {
        status,
        timestamp: new Date().toISOString(),
        checks: {
          env: {
            ok: env.ok,
            missing: env.missing,
          },
          supabase,
          rate_limit: rateLimit,
        },
        version: packageJson.version,
      },
      { status: status === "error" ? 503 : 200 },
    );
  } catch {
    return NextResponse.json(
      {
        status: "error" satisfies HealthStatus,
        timestamp: new Date().toISOString(),
        checks: {
          env: {
            ok: env.ok,
            missing: env.missing,
          },
          supabase: {
            ok: false,
            configured: hasSupabaseAdminEnv(),
            latencyMs: null,
          },
          rate_limit: rateLimit,
        },
        version: packageJson.version,
      },
      { status: 503 },
    );
  }
}
