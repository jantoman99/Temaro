import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function runMigrationList(migrationsDir: string) {
  return new Promise<{ code: number | null; stderr: string; stdout: string }>((resolve) => {
    const child = spawn("node", ["scripts/list-migrations.mjs"], {
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

describe("migration list", () => {
  it("vypise SQL migrace ve vzestupnem poradi", async () => {
    const migrationsDir = await mkdtemp(path.join(tmpdir(), "migrations-list-"));

    try {
      await writeFile(path.join(migrationsDir, "20260429000200_second.sql"), "begin;\ncommit;\n");
      await writeFile(path.join(migrationsDir, "20260429000100_first.sql"), "begin;\ncommit;\n");
      await writeFile(path.join(migrationsDir, "notes.txt"), "neni migrace");

      const result = await runMigrationList(migrationsDir);

      expect(result.code).toBe(0);
      expect(result.stderr).toBe("");
      expect(result.stdout).toContain("Migrace aplikuj v tomto poradi:");
      expect(result.stdout).toContain(`${migrationsDir}/20260429000100_first.sql`);
      expect(result.stdout).toContain(`${migrationsDir}/20260429000200_second.sql`);
      expect(result.stdout).not.toContain("notes.txt");
      expect(result.stdout.indexOf("20260429000100_first.sql")).toBeLessThan(
        result.stdout.indexOf("20260429000200_second.sql"),
      );
    } finally {
      await rm(migrationsDir, { force: true, recursive: true });
    }
  });

  it("odmitne prazdnou slozku migraci", async () => {
    const migrationsDir = await mkdtemp(path.join(tmpdir(), "migrations-list-empty-"));

    try {
      const result = await runMigrationList(migrationsDir);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("Nebyla nalezena zadna SQL migrace.");
    } finally {
      await rm(migrationsDir, { force: true, recursive: true });
    }
  });

  it("odmitne chybejici slozku migraci", async () => {
    const missingMigrationsDir = path.join(tmpdir(), `missing-migrations-${randomUUID()}`);

    const result = await runMigrationList(missingMigrationsDir);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain(`Slozka ${missingMigrationsDir} neexistuje.`);
  });
});
