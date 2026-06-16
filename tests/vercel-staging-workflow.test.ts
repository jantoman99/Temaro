import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowPath = path.join(rootDir, ".github/workflows/vercel-staging.yml");
const keepaliveWorkflowPath = path.join(rootDir, ".github/workflows/staging-keepalive.yml");

async function readWorkflow() {
  return readFile(workflowPath, "utf8");
}

async function readKeepaliveWorkflow() {
  return readFile(keepaliveWorkflowPath, "utf8");
}

describe("Vercel staging workflow", () => {
  it("deployuje jen z dev branche a nepouziva produkcni deploy flag", async () => {
    const workflow = await readWorkflow();

    expect(workflow).toContain("branches:");
    expect(workflow).toContain("- dev");
    expect(workflow).toContain("npx vercel build --token");
    expect(workflow).toContain("npx vercel deploy --prebuilt --yes --format json --token");
    expect(workflow).toContain("JSON.parse");
    expect(workflow).toContain("payload.url || payload.deployment?.url");
    expect(workflow).not.toContain("--prod");
  });

  it("vyzaduje staging secret hodnoty misto produkcnich runtime hodnot", async () => {
    const workflow = await readWorkflow();

    expect(workflow).toContain("https://rezervacni-system-dev.vercel.app");
    expect(workflow).toContain("STAGING_NEXT_PUBLIC_SUPABASE_URL");
    expect(workflow).toContain("STAGING_NEXT_PUBLIC_SUPABASE_ANON_KEY");
    expect(workflow).toContain("STAGING_SUPABASE_SERVICE_ROLE_KEY");
    expect(workflow).toContain("npx vercel alias set");
    expect(workflow).toContain("refusing to deploy degraded staging");
    expect(workflow).not.toContain("https://rezervacni-system-xi.vercel.app");
    expect(workflow).not.toContain("sb_publishable__uR26T1MisHeSlPrnz6AZQ_kkptmUOb");
  });

  it("ma samostatny denni keep-alive pro staging Supabase bez produkcnich hodnot", async () => {
    const workflow = await readKeepaliveWorkflow();

    expect(workflow).toContain("name: Staging Supabase Keepalive");
    expect(workflow).toContain("schedule:");
    expect(workflow).toContain('cron: "17 7 * * *"');
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain(
      "curl --fail --silent --show-error --max-time 30 https://rezervacni-system-dev.vercel.app/api/health",
    );
    expect(workflow).not.toContain("https://rezervacni-system-xi.vercel.app");
    expect(workflow).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(workflow).not.toContain("STAGING_SUPABASE_SERVICE_ROLE_KEY");
    expect(workflow).not.toContain("VERCEL_TOKEN");
  });
});
