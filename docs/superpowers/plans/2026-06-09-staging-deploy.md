# Staging Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe staging deploy path from the `dev` branch to a Vercel preview deployment without touching production.

**Architecture:** Keep production deployment isolated in `.github/workflows/vercel-production.yml`. Add a new staging workflow that runs on `dev`, validates staging secrets, builds with Vercel preview mode, deploys without `--prod`, and exposes the generated preview URL in workflow output. Add a Vitest guard that checks the workflow does not contain production-only flags or production env names.

**Tech Stack:** GitHub Actions, Vercel CLI, Next.js, Vitest, Markdown docs.

---

### Task 1: Add Staging Workflow Guard Test

**Files:**
- Create: `tests/vercel-staging-workflow.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/vercel-staging-workflow.test.ts`:

```typescript
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
    expect(workflow).toContain("refusing to deploy degraded staging");
    expect(workflow).not.toContain("https://rezervacni-system-xi.vercel.app");
    expect(workflow).not.toContain("sb_publishable__uR26T1MisHeSlPrnz6AZQ_kkptmUOb");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- tests/vercel-staging-workflow.test.ts
```

Expected: FAIL because `.github/workflows/vercel-staging.yml` does not exist.

### Task 2: Add Staging Workflow

**Files:**
- Create: `.github/workflows/vercel-staging.yml`

- [ ] **Step 1: Write minimal implementation**

Create `.github/workflows/vercel-staging.yml`:

```yaml
name: Vercel Staging Deploy

on:
  push:
    branches:
      - dev
  workflow_dispatch:

concurrency:
  group: vercel-staging
  cancel-in-progress: true

jobs:
  deploy:
    name: Deploy to Vercel staging
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_APP_URL: https://rezervacni-system-dev.vercel.app
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.STAGING_NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.STAGING_NEXT_PUBLIC_SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.STAGING_SUPABASE_SERVICE_ROLE_KEY }}
      VERCEL_ORG_ID: team_mTjH4uHwLawj5n8HdJ7hHuIJ
      VERCEL_PROJECT_ID: prj_SsVeTuolEbEJHPQOWCMZwhkUh5YM
      VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}

    steps:
      - name: Check required secrets
        id: secrets
        shell: bash
        run: |
          if [ -n "$VERCEL_TOKEN" ] \
            && [ -n "$NEXT_PUBLIC_APP_URL" ] \
            && [ -n "$NEXT_PUBLIC_SUPABASE_URL" ] \
            && [ -n "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] \
            && [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
            echo "present=true" >> "$GITHUB_OUTPUT"
          else
            echo "::error::VERCEL_TOKEN or staging Supabase/App URL secrets are not set; refusing to deploy degraded staging."
            exit 1
          fi

      - name: Checkout
        if: steps.secrets.outputs.present == 'true'
        uses: actions/checkout@v4

      - name: Setup Node
        if: steps.secrets.outputs.present == 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm

      - name: Install dependencies
        if: steps.secrets.outputs.present == 'true'
        run: npm ci

      - name: Link Vercel project
        if: steps.secrets.outputs.present == 'true'
        shell: bash
        run: |
          mkdir -p .vercel
          printf '{"projectId":"%s","orgId":"%s"}\n' "$VERCEL_PROJECT_ID" "$VERCEL_ORG_ID" > .vercel/project.json

      - name: Pull Vercel preview environment
        if: steps.secrets.outputs.present == 'true'
        run: npx vercel pull --yes --environment=preview --token="$VERCEL_TOKEN"

      - name: Write staging build environment
        if: steps.secrets.outputs.present == 'true'
        shell: bash
        run: |
          cat > .vercel/.env.preview.local <<EOF
          NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"
          NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY"
          NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL"
          SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
          EOF

      - name: Build staging bundle
        if: steps.secrets.outputs.present == 'true'
        run: npx vercel build --token="$VERCEL_TOKEN"

      - name: Deploy staging bundle
        if: steps.secrets.outputs.present == 'true'
        id: deploy
        shell: bash
        run: |
          deployment_url="$(
            npx vercel deploy --prebuilt --token="$VERCEL_TOKEN" \
              --env NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
              --env NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
              --env NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
              --env SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
          )"
          echo "url=$deployment_url" >> "$GITHUB_OUTPUT"
          echo "Staging deployment: $deployment_url"

      - name: Alias staging deployment
        if: steps.secrets.outputs.present == 'true'
        shell: bash
        run: |
          npx vercel alias set "${{ steps.deploy.outputs.url }}" "${NEXT_PUBLIC_APP_URL#https://}" --token="$VERCEL_TOKEN"
```

- [ ] **Step 2: Run staging workflow test**

Run:

```bash
npm run test -- tests/vercel-staging-workflow.test.ts
```

Expected: PASS.

### Task 3: Update Active Docs

**Files:**
- Modify: `docs/runtime-checklist.md`
- Modify: `docs/handoff.md`
- Modify: `docs/implementation-progress.md`

- [ ] **Step 1: Add a short staging note**

Add a short current-state bullet near the top of each active doc:

```markdown
- Staging deploy je připravený přes GitHub Actions workflow `.github/workflows/vercel-staging.yml`: push do branche `dev` vytvoří Vercel preview deploy bez zásahu do production aliasu. workflow nastaví alias `https://rezervacni-system-dev.vercel.app`; potřebné GitHub Actions secrets jsou `STAGING_NEXT_PUBLIC_SUPABASE_URL`, `STAGING_NEXT_PUBLIC_SUPABASE_ANON_KEY`, `STAGING_SUPABASE_SERVICE_ROLE_KEY` a `VERCEL_TOKEN`.
```

- [ ] **Step 2: Run focused docs/workflow tests**

Run:

```bash
npm run test -- tests/vercel-staging-workflow.test.ts
```

Expected: PASS.

### Task 4: Full Verification

**Files:**
- Existing project files only.

- [ ] **Step 1: Run full check**

Run:

```bash
npm run check
```

Expected: Vitest suite, migrations check, type-check, lint and production build all pass.

- [ ] **Step 2: Inspect git diff**

Run:

```bash
git diff --check
git status --short
```

Expected: no whitespace errors; only staging workflow, workflow test, and docs changed.

- [ ] **Step 3: Commit**

Run:

```bash
git add .github/workflows/vercel-staging.yml tests/vercel-staging-workflow.test.ts docs/runtime-checklist.md docs/handoff.md docs/implementation-progress.md docs/superpowers/plans/2026-06-09-staging-deploy.md
git commit -m "ci: add staging deploy workflow"
```
