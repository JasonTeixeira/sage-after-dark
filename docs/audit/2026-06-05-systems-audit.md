# Sage After Dark — Systems Audit + De-bill (2026-06-05)

## Audit baseline (before changes)
| Gate | Result |
|------|--------|
| Production build | PASS — all routes compile |
| TypeScript (tsc --noEmit) | PASS — 0 errors |
| ESLint | 218 errors / 6 warnings, ~89% cosmetic flat-config rule-drift; no runtime bugs |
| Tests | none existed |
| Lighthouse (last recorded) | 94–96 Perf / 100 SEO / 100 A11y |

Runtime bugs found: none. Auth (HMAC session), password (bcrypt rounds 12), and the
former Stripe signature code were all correct.

## Decision: the site is now free
Stripe billing + the members-only paywall were removed. Free accounts/login + newsletter kept.
Existing subscriptions are cancelled in Stripe by the owner via
`scripts/ops/cancel-all-subscriptions.mjs` (dry-run by default; --confirm to execute). Removing
code does NOT stop charges — that script does.

## De-bill summary
- Deleted: `lib/stripe.ts`, `components/paywall.tsx`, `/api/checkout`, `/api/portal`,
  `/api/stripe/webhook`, `/api/cron/refresh-numbers`, `/membership`, `/members`, the Vercel cron.
- Edited: post page (gate removed), `/best` (tiers merged, no essays hidden), `/numbers`
  (money block removed), `/admin`(+members) (billing stats removed), `/account` (billing UI +
  stale paid copy removed), `site-header` (member badge removed), `start` (CTAs repointed),
  auth-flow pages + transactional email (dead "see membership" CTAs removed),
  `lib/supabase.ts` (memberStatus/upsertMember/recordStripeEvent removed),
  `lib/email.ts` (memberWelcomeEmail removed), `lib/living.ts` (stripe_customer_id removed).
- Redirects: `/membership` + `/members` → `/account` (permanent).
- Kept untouched: all auth, accounts, newsletter, and content.

## Test net added (unit only)
- Vitest harness + unit suites: `auth` (session sign/verify/expiry/tamper), `passwords`
  (hash/verify/strength/tokens/sha256), `cipher` (caesar roundtrip + monthly shift — also
  de-risks the planned Phase B vault puzzle). 17 tests passing.
- CI: GitHub Actions runs typecheck + unit on push/PR.

## Deferred (by decision)
- Supabase-branch integration tests + Playwright E2E — payment code (the original high-risk
  surface) was deleted, lowering the value; can be added later if auth/vault logic grows.
- 193 cosmetic lint flags — resolve naturally when Phase B rebuilds components.
