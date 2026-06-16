# Staging Supabase Keepalive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a safe daily staging keep-alive check so the free Supabase staging project is less likely to be automatically paused for inactivity.

**Architecture:** Use GitHub Actions scheduled workflow to call the public staging health endpoint. Keep this separate from deploy workflows so it cannot deploy, mutate data, or require secrets.

**Tech Stack:** GitHub Actions, curl, Vitest workflow-content regression test, Markdown docs.

---

### Task 1: Workflow Regression Test

**Files:**
- Modify: `tests/vercel-staging-workflow.test.ts`
- Create later: `.github/workflows/staging-keepalive.yml`

- [x] **Step 1: Write the failing test**

Add a test that reads `.github/workflows/staging-keepalive.yml` and asserts it has a daily schedule, calls only `https://rezervacni-system-dev.vercel.app/api/health`, uses curl failure mode, and contains no production URL or secret references.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/vercel-staging-workflow.test.ts --reporter=dot`
Expected: FAIL because `.github/workflows/staging-keepalive.yml` does not exist yet.

### Task 2: Keepalive Workflow

**Files:**
- Create: `.github/workflows/staging-keepalive.yml`
- Test: `tests/vercel-staging-workflow.test.ts`

- [x] **Step 1: Add minimal workflow**

Create a workflow with `schedule`, `workflow_dispatch`, a single Ubuntu job, and one curl step:

```yaml
name: Staging Supabase Keepalive

on:
  schedule:
    - cron: "17 7 * * *"
  workflow_dispatch:

jobs:
  ping:
    name: Ping staging health endpoint
    runs-on: ubuntu-latest
    timeout-minutes: 2
    steps:
      - name: Call staging health endpoint
        run: curl --fail --silent --show-error --max-time 30 https://rezervacni-system-dev.vercel.app/api/health
```

- [x] **Step 2: Run test to verify it passes**

Run: `npx vitest run tests/vercel-staging-workflow.test.ts --reporter=dot`
Expected: PASS.

### Task 3: Documentation

**Files:**
- Modify: `docs/implementation-progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/runtime-checklist.md`

- [x] **Step 1: Record operational state**

Add a short note dated 2026-06-16 that staging Supabase warned about inactivity, staging health was checked, and daily keep-alive exists. State that keep-alive does not replace Pro for guaranteed non-pausing.

- [x] **Step 2: Run focused verification**

Run:

```bash
npx vitest run tests/vercel-staging-workflow.test.ts --reporter=dot
npm run test -- tests/vercel-staging-workflow.test.ts tests/runtime-env-check.test.ts
git diff --check
```

Expected: all pass and whitespace check clean.
