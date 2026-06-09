# Staging Deploy Design

Date: 2026-06-09
Status: Approved for implementation

## Context

Temaro currently deploys production from `main` through `.github/workflows/vercel-production.yml` and manual Vercel production deploys. Production is used as the public demo URL at `https://rezervacni-system-xi.vercel.app`.

Further UI, runtime and pilot work needs a safe place to test changes before they are promoted to production.

## Decision

Add a separate staging deploy path from a `dev` branch. Staging must not touch the production alias and must use its own Vercel preview deployment URL.

The first implementation will add a new GitHub Actions workflow next to the existing production workflow. It will:

- run on pushes to `dev`,
- require `VERCEL_TOKEN`,
- use the existing Vercel project link,
- build and deploy without `--prod`,
- alias the preview deployment to `https://rezervacni-system-dev.vercel.app`,
- pass explicit staging runtime env values from GitHub Actions secrets,
- refuse to deploy if required staging secrets are missing.

## Plain-English Summary

Production stays stable. New work can be pushed to `dev`, checked on a live Vercel URL, and only then merged or copied to `main` for production.

This reduces the risk of shipping a broken homepage, degraded environment, or risky runtime change directly to the public demo.

## Environment Model

Required GitHub Actions secrets for staging:

- `VERCEL_TOKEN`
- `STAGING_NEXT_PUBLIC_SUPABASE_URL`
- `STAGING_NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STAGING_SUPABASE_SERVICE_ROLE_KEY`

Fixed staging app URL:

- `https://rezervacni-system-dev.vercel.app`

Optional later staging secrets:

- `STAGING_RESEND_API_KEY`
- `STAGING_RESEND_FROM_EMAIL`
- `STAGING_UPSTASH_REDIS_REST_URL`
- `STAGING_UPSTASH_REDIS_REST_TOKEN`
- `STAGING_CRON_SECRET`
- `STAGING_STRIPE_SECRET_KEY`
- `STAGING_STRIPE_WEBHOOK_SECRET`

The initial workflow will pass only the required core runtime secrets. Payment, e-mail, SMS and cron staging can be added when those providers are configured.

## Alternatives Considered

- Use only Vercel automatic preview deployments: simpler, but the current Vercel GitHub app connection has been unreliable and does not enforce our "no degraded deploy" checks.
- Use production for testing: fastest, but risky because public demo and recruiter/pilot impressions can break.
- Create a completely separate Vercel project immediately: safest isolation, but more setup overhead. A branch-based staging workflow is enough for the next step.

## Consequences

- Good: safer promotion path from `dev` to `main`.
- Good: production workflow remains unchanged.
- Good: staging points at a separate Supabase project.
- Tradeoff: staging depends on GitHub Actions secrets and Vercel aliasing.

## Testing

Implementation should be verified by:

- workflow YAML syntax review,
- `npm run check`,
- pushing or manually running the `dev` workflow,
- opening the staging URL and checking `/api/health`,
- running public smoke against the staging URL:

```bash
PLAYWRIGHT_BASE_URL=<staging-url> npx playwright test tests/e2e/public-smoke.spec.ts
```

## Revisit Trigger

Revisit this decision when:

- the first real pilot uses staging for runtime testing,
- a separate staging Supabase project is created,
- Vercel GitHub app auto-preview deployments become reliable enough to replace the custom workflow.
