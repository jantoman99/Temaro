import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: mocks.createAdminClient,
}));

import nextConfig from "@/next.config";
import { GET } from "@/app/api/health/route";
import { safePostCommit } from "@/lib/utils/post-commit";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("security headers", () => {
  it("nastavuje Content Security Policy pro vsechny routy", async () => {
    const headers = await nextConfig.headers?.();

    const globalHeaders = headers?.find((entry) => entry.source === "/((?!embed/booking/).*)")?.headers ?? [];
    const csp = globalHeaders.find((header) => header.key === "Content-Security-Policy")?.value;

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("https://*.supabase.co");
    expect(csp).toContain("https://chart.googleapis.com");
    expect(csp).toContain("https://*.upstash.io");
  });

  it("povoluje framovani pouze pro verejny booking widget", async () => {
    const headers = await nextConfig.headers?.();

    const widgetHeaders = headers?.find((entry) => entry.source === "/embed/booking/:slug")?.headers ?? [];
    const widgetCsp = widgetHeaders.find((header) => header.key === "Content-Security-Policy")?.value;
    const widgetXFrameOptions = widgetHeaders.find((header) => header.key === "X-Frame-Options")?.value;

    expect(widgetCsp).toContain("default-src 'self'");
    expect(widgetCsp).toContain("frame-ancestors *");
    expect(widgetXFrameOptions).toBeUndefined();
  });
});

describe("GET /api/health", () => {
  it("vraci degraded bez Supabase env a neprozrazuje hodnoty promennych", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("degraded");
    expect(body.checks.env.missing).toEqual([
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ]);
    expect(JSON.stringify(body)).not.toContain("service-role-secret");
    expect(mocks.createAdminClient).not.toHaveBeenCalled();
  });

  it("vraci ok pri dostupne Supabase databazi", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret";
    process.env.UPSTASH_REDIS_REST_URL = "https://upstash.example";
    process.env.UPSTASH_REDIS_REST_TOKEN = "upstash-token";

    mocks.createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: [], error: null })),
        })),
      })),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.env.ok).toBe(true);
    expect(body.checks.supabase.ok).toBe(true);
    expect(body.checks.rate_limit.configured).toBe(true);
    expect(JSON.stringify(body)).not.toContain("service-role-secret");
  });

  it("vraci 503 pri nakonfigurovane, ale nedostupne Supabase databazi", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-secret";

    mocks.createAdminClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(async () => ({ data: null, error: { message: "connection failed" } })),
        })),
      })),
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.status).toBe("error");
    expect(body.checks.supabase.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain("connection failed");
  });
});

describe("safePostCommit", () => {
  it("nepropaguje chybu navazujiciho kroku a v developmentu ji zaloguje", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      safePostCommit(async () => {
        throw new Error("email failed");
      }, "test email"),
    ).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledWith(
      "Post-commit step failed: test email",
      expect.any(Error),
    );
  });
});
