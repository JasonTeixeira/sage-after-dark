# Sage After Dark — Program Roadmap + Phase A Design

> **Status:** Phase A approved for spec → plan. Phases B–E are roadmap-level; each gets its own spec when reached.
> **Date:** 2026-06-05
> **Branch:** `phase-a/stabilize-test-net`

## Context

Sage After Dark is a **live production** tactical-editorial publication (Next.js 16, React 19,
Tailwind v4, MDX, Supabase, Stripe) with real paying members and revenue at www.sageafterdark.com.
The owner wants to: (1) audit and stabilize the system, (2) redesign the front end into an
interactive "modern terminal" with a puzzle/encryption gateway into a members-only "vault",
(3) make it an SEO machine targeting 100k monthly readers, (4) wire Google Analytics, and
(5) make the experience "infinitely more interesting."

### Audit baseline (verified 2026-06-05)

- **Production build:** passes clean (all routes compile).
- **TypeScript `tsc --noEmit`:** zero errors.
- **ESLint:** 218 errors / 6 warnings, but ~89% are cosmetic rule-drift from the stricter
  Next 16 / React 19 flat-config (`jsx-no-comment-textnodes` ×128, `no-html-link-for-pages` ×46,
  `no-unescaped-entities` ×19). ~24 are `react-hooks` opinions (`set-state-in-effect` ×18,
  `purity` ×5, `immutability` ×1) — **none are confirmed runtime bugs**, and most live in the
  interactive components Phase B will rebuild.
- **Tests:** none exist. **This is the only material gap** on payment/auth/paywall code.
- **Lighthouse (last recorded):** 94–96 Perf / 100 SEO / 100 A11y.

**Verdict: nothing is broken.** The risk surface is the absence of a regression net around money
and auth, not bugs.

## Resolved foundational decisions

| Decision | Choice |
|----------|--------|
| **Billing (REVISED 2026-06-05)** | **Removed.** The site goes fully free. Stripe (checkout/portal/webhook/metrics) and the members-only paywall are deleted; free accounts/login + newsletter are kept. Existing paying subscriptions are cancelled in Stripe via an ops script the owner runs (no refunds). |
| Vault vs SEO (REVISED) | **No paywall.** All content is free and indexed. The Phase B terminal puzzle/encryption becomes a *delight gate / easter-egg* layered over free content — not a paid wall. |
| Google Analytics | **GA4 behind a consent gate**, alongside (not replacing) the existing privacy-first tracker. |
| Sequencing | **Stabilize → Build → Grow.** |
| Phase A scope (REVISED) | **De-bill + stabilize.** Surgically remove Stripe/paywall keeping accounts; add a test net over the code that *remains* (auth, cipher, free-content rendering) + smoke. Do not chase the 193 cosmetic lint flags. |
| CI | **Yes** — GitHub Actions runs typecheck + tests on push/PR. |
| Test isolation | **Supabase preview branch** for auth integration fidelity; pure unit tests run secret-free. (Stripe test-mode no longer needed — billing removed.) |

## Program roadmap

| Phase | Workstream | Core deliverable | Spec status |
|------|-----------|-----------------|-------------|
| **A — Stabilize** | Audit + test net | Vitest unit/integration + Playwright E2E around payments/auth/paywall; CI; audit report | **This doc** |
| **B — Terminal Vault** | Frontend redesign | Interactive terminal shell + decoder/cipher puzzle as the gateway into the members-only vault; mystery + delight; public pages remain open and crawlable | TBD |
| **C — SEO Machine** | Growth foundation | Technical + content SEO toward 100k/mo on the open layer: internal linking, schema depth, content velocity, indexability | TBD |
| **D — Analytics** | Measurement | GA4 + consent banner alongside the privacy-first tracker | TBD |
| **E — Engagement** | "Infinitely more interesting" | Interactive/puzzle/easter-egg layer, retention mechanics | TBD |

Hard constraint across all phases (from repo `CLAUDE.md`): voice is sacred, the design system is
the brand, and the Stripe webhook / `upsertMember` / subscribe pipeline must not be altered without
full E2E understanding. Phase A only *wraps* that pipeline in tests; it does not change its logic.

---

## Phase A — Design

### Goal

Establish an enforced regression net over the revenue- and auth-critical code so that every
subsequent phase (especially the Phase B redesign) can move fast without risking members or money.
Add the test net; fix only genuine bugs surfaced while writing tests; do not refactor for lint.

### Test stack

- **Vitest** — unit + integration. Native ESM/TS, fast, first-class with Next 16. Config:
  `vitest.config.ts` with the `@/*` path alias mirrored from `tsconfig.json`.
- **Playwright** — E2E for critical browser flows. Config: `playwright.config.ts` targeting the
  Next dev/preview server.
- Test file convention: co-located `*.test.ts` for unit, `tests/integration/*.test.ts` for route
  handlers, `tests/e2e/*.spec.ts` for Playwright.

### Test isolation strategy

- **Unit tests:** pure functions, zero I/O, no secrets. Always run everywhere.
- **Integration + E2E:** use real Stripe **test-mode** keys and a Supabase **preview branch**.
  Read credentials from env (`STRIPE_TEST_SECRET_KEY`, `STRIPE_TEST_WEBHOOK_SECRET`,
  `SUPABASE_TEST_URL`, `SUPABASE_TEST_SERVICE_ROLE_KEY`, `SESSION_SECRET`).
  A shared `tests/helpers/env.ts` guard **skips** credentialed suites with a clear message when the
  vars are absent (keeps local dev frictionless) and **fails** when `CI=true` but creds are missing
  (so CI never silently green-passes an unconfigured suite).

### Unit test targets (pure logic)

- **`src/lib/auth.ts`** — `signSessionToken`/`verifySessionToken` roundtrip; tampered signature
  rejected; expired `exp` rejected; malformed token returns null; missing/short `SESSION_SECRET`
  throws.
- **`src/lib/stripe.ts`** — `verifyStripeSignature`: valid signature passes; bad signature fails;
  timestamp beyond tolerance fails; malformed header fails; missing header fails. `getPublicMetrics`
  math via injected fixture data: annual→monthly MRR normalization, churn denominator guard
  (`< 5` ⇒ null), `roundTo` rounding behavior.
- **`src/lib/passwords.ts`** — `hashPassword`/`verifyPassword` roundtrip; length bounds throw
  (`< 8`, `> 200`); `verifyPassword` returns false on bad input; `passwordStrength` scoring across
  representative inputs; `randomToken` length + uniqueness; `sha256Hex` against a known vector.
- **`src/lib/cipher.ts`** — the puzzle/cipher transform logic (also de-risks Phase B, which builds
  the vault gateway on top of it). Test encode/decode roundtrip and known-answer vectors.
- **`src/lib/tokens.ts`** — any pure token/encoding helpers.

> `getPublicMetrics` currently calls `listAll` (network) internally. If it is not already injectable,
> Phase A will extract the pure computation (subs/invoices → metrics) into a separately exported,
> network-free function and test that. This is a test-seam extraction, not a behavior change.

### Integration test targets (route handlers, real test-mode services)

- **`/api/stripe/webhook`** — **idempotency** (replaying the same `event.id` does not double-process
  / is recorded once in `stripe_event_log`); signature rejection (bad/absent signature ⇒ 400);
  member upsert on `checkout.session.completed`; status downgrade on
  `customer.subscription.deleted`; status update on `customer.subscription.updated`.
- **`/api/auth/signup`**, **`/api/auth/login`**, **`/api/auth/forgot`**, **`/api/auth/reset`** —
  happy path + failure paths (duplicate email, wrong password, expired/used reset token,
  malformed input).

These run against the Supabase preview branch (real RPCs, RLS active, service-role key) and Stripe
test-mode, then clean up created rows in teardown.

### E2E test targets (Playwright)

- **Paywall correctness:** anonymous visitor sees the gate on a `members_only` post; a public post
  renders fully; an **admin** (allowlisted) bypasses the gate. (Directly covers the documented
  past bug "admin always bypasses members-only gate.")
- **Signup → checkout:** signup flow reaches the Stripe (test-mode) checkout redirect.
- **Smoke:** key routes (`/`, `/archive`, a public post, `/about`) load with **zero console
  errors** and a visible `h1`.

### CI

- `.github/workflows/ci.yml`: on push + PR, run `tsc --noEmit`, `vitest run` (unit always;
  integration when secrets present), and a Playwright smoke job. Node 22, `npm ci`, dependency cache.
- Credentialed jobs read GitHub repository secrets that **the owner must provision**
  (`STRIPE_TEST_SECRET_KEY`, `STRIPE_TEST_WEBHOOK_SECRET`, `SUPABASE_TEST_URL`,
  `SUPABASE_TEST_SERVICE_ROLE_KEY`, `SESSION_SECRET`). Until then, the credentialed jobs are
  wired but expected to no-op/skip with a clear log line; the unit job is fully green standalone.

### Coverage target

High coverage on the critical surface — `src/lib/*` (auth, stripe, passwords, cipher, tokens) and
the API/paywall handlers — rather than a blanket global percentage. UI-component coverage is
deferred to Playwright now and Phase B visual regression later. The honest reported metric will be
"critical-path coverage," not a misleading global number.

### Explicitly out of scope for Phase A

- The 193 cosmetic lint flags (left as-is; many vanish when Phase B rebuilds components).
- Any change to Stripe webhook logic, `upsertMember`, or subscribe behavior (wrap, don't rewrite).
- The terminal redesign, SEO work, GA, and engagement layer (Phases B–E).

### Risks & mitigations

- **Provisioning gap:** integration/E2E need owner-provisioned test secrets. *Mitigation:* unit
  layer stands alone; credentialed suites skip gracefully until secrets exist.
- **Test seam extraction in `getPublicMetrics`:** small refactor risk. *Mitigation:* pure-function
  extraction only, behavior preserved, covered by its own test.
- **Supabase preview branch RLS drift vs production:** *Mitigation:* branch is created from the
  production schema/migrations so RLS matches.

### Success criteria

- `tsc --noEmit` green, unit suite green locally with no secrets.
- Integration + E2E green when test secrets/branch are provisioned.
- CI workflow committed and passing the unit job.
- A short `docs/audit/2026-06-05-systems-audit.md` capturing the baseline findings above.
