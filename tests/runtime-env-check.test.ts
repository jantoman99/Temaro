import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function runEnvCheck(env: NodeJS.ProcessEnv) {
  return new Promise<{ code: number | null; stderr: string; stdout: string }>((resolve) => {
    const child = spawn("node", ["scripts/check-runtime-env.mjs"], {
      cwd: rootDir,
      env,
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

describe("runtime env checker", () => {
  it("bere hodnoty slozene jen z mezer jako chybejici", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        CRON_SECRET: " ",
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: " ",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: " ",
        NEXT_PUBLIC_SUPABASE_URL: " ",
        RESEND_API_KEY: " ",
        RESEND_FROM_EMAIL: " ",
        SUPABASE_SERVICE_ROLE_KEY: " ",
        UPSTASH_REDIS_REST_TOKEN: " ",
        UPSTASH_REDIS_REST_URL: " ",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(result.stderr).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
      expect(result.stderr).toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(result.stderr).toContain("NEXT_PUBLIC_APP_URL");
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("bere uvozovkami obalene mezery v env souboru jako chybejici", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-file-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(
        envPath,
        [
          'NEXT_PUBLIC_SUPABASE_URL="   "',
          'NEXT_PUBLIC_SUPABASE_ANON_KEY="   "',
          'SUPABASE_SERVICE_ROLE_KEY="   "',
          'NEXT_PUBLIC_APP_URL="   "',
        ].join("\n"),
      );

      const env: NodeJS.ProcessEnv = { ...process.env, ENV_FILE_PATH: envPath };
      delete env.NEXT_PUBLIC_APP_URL;
      delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      delete env.NEXT_PUBLIC_SUPABASE_URL;
      delete env.SUPABASE_SERVICE_ROLE_KEY;

      const result = await runEnvCheck(env);

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(result.stderr).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
      expect(result.stderr).toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(result.stderr).toContain("NEXT_PUBLIC_APP_URL");
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne cron secret s whitespace znakem", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-cron-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        CRON_SECRET: `abc ${"d".repeat(24)}`,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("CRON_SECRET nesmi obsahovat mezery ani jine whitespace znaky.");
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne castecne vyplnenou Resend konfiguraci", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-resend-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        RESEND_API_KEY: "re_test",
        RESEND_FROM_EMAIL: "",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain(
        "RESEND_FROM_EMAIL musi byt vyplneny, kdyz je vyplneny RESEND_API_KEY.",
      );
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne Resend odesilaci email bez API klice", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-resend-email-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        RESEND_API_KEY: "",
        RESEND_FROM_EMAIL: "rezervace@example.com",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain(
        "RESEND_API_KEY musi byt vyplneny, kdyz je vyplneny RESEND_FROM_EMAIL.",
      );
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne castecne vyplnenou Upstash konfiguraci", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-upstash-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        UPSTASH_REDIS_REST_TOKEN: "token",
        UPSTASH_REDIS_REST_URL: "",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain(
        "UPSTASH_REDIS_REST_URL musi byt vyplnena, kdyz je vyplneny UPSTASH_REDIS_REST_TOKEN.",
      );
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne Upstash URL bez tokenu", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-upstash-url-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
        UPSTASH_REDIS_REST_TOKEN: "",
        UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain(
        "UPSTASH_REDIS_REST_TOKEN musi byt vyplneny, kdyz je vyplneny UPSTASH_REDIS_REST_URL.",
      );
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne zapnute SMS reminders bez webhook URL", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-sms-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        SMS_REMINDERS_ENABLED: "true",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("SMS_WEBHOOK_URL musi byt vyplnena, kdyz je SMS_REMINDERS_ENABLED=true.");
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne neplatnou SMS webhook URL", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-sms-url-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        SMS_WEBHOOK_URL: "notaurl",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("SMS_WEBHOOK_URL musi byt platna http/https URL.");
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne castecne vyplnenou Stripe konfiguraci", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-stripe-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        STRIPE_SECRET_KEY: "sk_test_123",
        STRIPE_WEBHOOK_SECRET: "",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain(
        "STRIPE_WEBHOOK_SECRET musi byt vyplneny, kdyz je vyplneny STRIPE_SECRET_KEY.",
      );
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });

  it("odmitne Stripe secret se spatnym prefixem", async () => {
    const envDir = await mkdtemp(path.join(tmpdir(), "env-check-stripe-prefix-"));
    const envPath = path.join(envDir, ".env.local");

    try {
      await writeFile(envPath, "");

      const result = await runEnvCheck({
        ...process.env,
        ENV_FILE_PATH: envPath,
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
        NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
        STRIPE_SECRET_KEY: "not-a-key",
        STRIPE_WEBHOOK_SECRET: "whsec_123",
        SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
      });

      expect(result.code).toBe(1);
      expect(result.stderr).toContain("STRIPE_SECRET_KEY musi zacinat na sk_.");
    } finally {
      await rm(envDir, { force: true, recursive: true });
    }
  });
});
