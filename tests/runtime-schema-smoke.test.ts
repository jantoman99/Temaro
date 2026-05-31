import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("runtime schema smoke script", () => {
  const script = readFileSync(join(process.cwd(), "scripts/runtime-schema-smoke.mjs"), "utf8");

  it("overuje posledni runtime migrace bez DDL operaci", () => {
    expect(script).toContain("20260503113000_add_service_deposit_policy.sql");
    expect(script).toContain("20260503115000_create_booking_payments.sql");
    expect(script).toContain("20260503123000_create_calendar_feed_tokens.sql");
    expect(script).toContain("20260502223000_create_staff_directory_metrics_view.sql");
    expect(script).not.toMatch(/\b(insert|update|delete|upsert|rpc)\s*\(/i);
  });

  it("nevypisuje secret hodnoty do konzole", () => {
    expect(script).toContain("NEXT_PUBLIC_SUPABASE_URL");
    expect(script).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(script).toContain("Vypis neobsahuje zadne citlive env hodnoty");
    expect(script).not.toContain("${serviceRoleKey}");
    expect(script).not.toContain("${supabaseUrl}");
  });
});
