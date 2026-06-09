import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workflowPath = path.join(rootDir, ".github/workflows/vercel-staging.yml");

async function readWorkflow() {
  return readFile(workflowPath, "utf8");
}

describe("Vercel staging workflow", () => {
  it("deployuje jen z dev branche a nepouziva produkcni deploy flag", async () => {
    const workflow = await readWorkflow();

    expect(workflow).toContain("branches:");
    expect(workflow).toContain("- dev");
    expect(workflow).toContain("npx vercel build --token");
    expect(workflow).toContain("npx vercel deploy --prebuilt --token");
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
});
