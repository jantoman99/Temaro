import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function runMigrationCheck(migrationsDir: string) {
  return new Promise<{ code: number | null; stderr: string; stdout: string }>((resolve) => {
    const child = spawn("node", ["scripts/check-migrations.mjs"], {
      cwd: rootDir,
      env: {
        ...process.env,
        MIGRATIONS_DIR: migrationsDir,
      },
    });
    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (code) => {
      resolve({ code, stderr, stdout });
    });
  });
}

describe("migration checker", () => {
  it("odmitne prazdnou slozku migraci", async () => {
    const migrationsDir = await mkdtemp(path.join(tmpdir(), "migrations-check-empty-"));

    try {
      const result = await runMigrationCheck(migrationsDir);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Nebyla nalezena zadna SQL migrace.");
    } finally {
      await rm(migrationsDir, { force: true, recursive: true });
    }
  });

  it("odmitne chybejici slozku migraci citelnou chybou", async () => {
    const missingMigrationsDir = path.join(tmpdir(), `missing-migrations-${randomUUID()}`);

    const result = await runMigrationCheck(missingMigrationsDir);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`Slozka ${missingMigrationsDir} neexistuje.`);
  });

  it("odmitne podezrely duplicitni PL/pgSQL if radek", async () => {
    const migrationsDir = await mkdtemp(path.join(tmpdir(), "migrations-"));

    try {
      await writeFile(
        path.join(migrationsDir, "20260429000100_duplicate_if.sql"),
        `begin;

create or replace function public.bad()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if true then
  if true then
    return;
  end if;
end;
$$;

commit;
`,
      );

      const result = await runMigrationCheck(migrationsDir);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("podezrely duplicitni PL/pgSQL if radek");
    } finally {
      await rm(migrationsDir, { force: true, recursive: true });
    }
  });
});
