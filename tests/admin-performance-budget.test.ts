import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function source(path: string) {
  return readFileSync(join(rootDir, path), "utf8");
}

describe("admin performance budgets", () => {
  it("keeps dashboard future bookings query bounded to the dashboard horizon", () => {
    const page = source("app/(dashboard)/dashboard/page.tsx");

    expect(page).toContain("const dashboardHorizonEnd = addDays(now, 8).toISOString();");
    expect(page).toMatch(/futureBookingsQuery[\s\S]*?\.gte\("starts_at", nowIso\)[\s\S]*?\.lte\("starts_at", dashboardHorizonEnd\)/);
  });

  it("keeps admin entity pages paginated in the database", () => {
    for (const path of [
      "app/(dashboard)/clients/page.tsx",
      "app/(dashboard)/services/page.tsx",
      "app/(dashboard)/staff/page.tsx",
    ]) {
      const page = source(path);

      expect(page, path).toContain('count: "exact"');
      expect(page, path).toContain("const from = (page - 1) * pageSize;");
      expect(page, path).toContain(".range(from, to)");
      expect(page, path).not.toContain("SERVER_ENTITY_ROW_LIMIT");
    }
  });

  it("uses staff directory metrics for precise server-side staff sorting", () => {
    const page = source("app/(dashboard)/staff/page.tsx");
    const migration = source("supabase/migrations/20260502223000_create_staff_directory_metrics_view.sql");

    expect(page).toContain('from("staff_directory_metrics")');
    expect(page).toContain('sort === "exceptions"');
    expect(page).toContain('"exception_count"');
    expect(page).toContain('sort === "hours"');
    expect(page).toContain('"working_days_count"');
    expect(page).toContain('sort === "services"');
    expect(page).toContain('"service_count"');
    expect(migration).toContain("create or replace view public.staff_directory_metrics");
    expect(migration).toContain("with (security_invoker = true)");
  });

  it("keeps independent dashboard page queries parallelized", () => {
    for (const path of [
      "app/(dashboard)/dashboard/page.tsx",
      "app/(dashboard)/calendar/page.tsx",
      "app/(dashboard)/services/page.tsx",
      "app/(dashboard)/staff/page.tsx",
    ]) {
      expect(source(path), path).toContain("Promise.all");
    }
  });

  it("keeps local performance smoke stable around Turbopack cold builds", () => {
    const script = source("scripts/performance-smoke.mjs");

    expect(script).toContain("PERF_RETRIES");
    expect(script).toContain("PERF_CONCURRENCY");
    expect(script).toContain('process.env.CI ? "0" : "1"');
    expect(script).toContain('process.env.CI ? "6" : "1"');
    expect(script).toContain("async function measureAll");
    expect(script).toContain("ERR");
    expect(script).toContain("errorCode");
  });
});
