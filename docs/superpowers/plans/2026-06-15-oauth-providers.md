# OAuth Providers Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Google, Facebook, and Apple OAuth entrypoints for business registration/login and customer login.

**Architecture:** Replace the one-off Google OAuth helper with a provider whitelist and shared `redirectToOAuth(provider, nextPath)` action helper. Keep the existing `/auth/callback` tenant-creation boundary: business registration requires a pending server cookie; customer login only redirects to `/account`.

**Tech Stack:** Next.js Server Actions, Supabase Auth OAuth providers, TypeScript, Vitest, Playwright smoke.

---

### Task 1: OAuth Provider Actions

**Files:**
- Modify: `app/(auth)/actions.ts`
- Test: `tests/auth-oauth-actions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/auth-oauth-actions.test.ts` with tests that mock `createClient`, `hasSupabaseEnv`, `hasSupabaseAdminEnv`, `getBaseAppUrl`, and `redirect`, then assert these actions call `signInWithOAuth` with correct providers:

```ts
signInWithGoogleAction -> provider "google"
signInWithFacebookAction -> provider "facebook"
signInWithAppleAction -> provider "apple"
signInCustomerWithFacebookAction -> provider "facebook", callback next "/account"
signInCustomerWithAppleAction -> provider "apple", callback next "/account"
registerWithFacebookAction -> provider "facebook", validates businessName/fullName and stores pending cookie
registerWithAppleAction -> provider "apple", validates businessName/fullName and stores pending cookie
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/auth-oauth-actions.test.ts --reporter=dot
```

Expected: fail because Facebook/Apple actions do not exist.

- [ ] **Step 3: Implement minimal action helper**

In `app/(auth)/actions.ts`, define:

```ts
const oauthProviders = ["google", "facebook", "apple"] as const;
type OAuthProvider = (typeof oauthProviders)[number];

async function redirectToOAuth(provider: OAuthProvider, nextPath: string): Promise<void> {
  ...
  await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
}
```

Then add action exports for business login, customer login, and business registration for all three providers.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npx vitest run tests/auth-oauth-actions.test.ts --reporter=dot
```

Expected: pass.

### Task 2: OAuth UI Entrypoints

**Files:**
- Modify: `components/auth/register-form.tsx`
- Modify: `components/auth/login-form.tsx`
- Modify: `app/account/login/page.tsx`
- Test: `tests/e2e/public-smoke.spec.ts`

- [ ] **Step 1: Write failing smoke expectations**

Update the customer account login smoke to expect:

```ts
Pokračovat přes Google
Pokračovat přes Facebook
Pokračovat přes Apple
```

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/landing-polish.test.ts --reporter=dot
```

Expected: no coverage for this UI. Then rely on Playwright smoke after implementation because E2E is the real browser coverage.

- [ ] **Step 3: Implement UI**

Add three OAuth buttons to `/register`, `/login`, and `/account/login`. Keep e-mail/heslo fallback visible for business pages. Avoid visual redesign beyond button labels.

- [ ] **Step 4: Verify UI**

Run:

```bash
npx playwright test tests/e2e/public-smoke.spec.ts --grep "customer account login exposes"
```

Expected: pass locally when the app is running or under Playwright web server.

### Task 3: Final Verification And Docs

**Files:**
- Modify: `docs/implementation-progress.md`
- Modify: `docs/handoff.md`
- Modify: `docs/runtime-checklist.md`
- Modify: `docs/manual-test-plan.md`

- [ ] **Step 1: Run focused tests**

```bash
npx vitest run tests/auth-oauth-actions.test.ts tests/auth-callback-route.test.ts --reporter=dot
```

- [ ] **Step 2: Run full check**

```bash
npm run check
```

- [ ] **Step 3: Update docs**

Record that Google/Facebook/Apple are implemented in code but require provider configuration in Supabase runtime.

- [ ] **Step 4: Commit**

```bash
git add app components tests docs
git commit -m "feat(auth): add facebook and apple oauth"
```
