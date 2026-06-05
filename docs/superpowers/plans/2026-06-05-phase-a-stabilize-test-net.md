# Phase A — Stabilize / Test Net Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up an enforced regression net (Vitest unit/integration + Playwright E2E + CI) around the payment, auth, and paywall code of Sage After Dark without altering production behavior.

**Architecture:** Pure-logic units run secret-free everywhere. Integration + E2E read real Stripe **test-mode** keys and a Supabase **preview branch** from env, and are skipped (locally) / failed (in CI) by a shared env guard when secrets are absent. One small pure-function extraction (`computeMetrics`) makes `getPublicMetrics` testable. CI runs typecheck + unit always; credentialed jobs run when repo secrets exist.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript 5, Vitest 3, @vitest/coverage-v8, @playwright/test, Node 22, GitHub Actions.

**Branch:** `phase-a/stabilize-test-net` (already created; spec at `docs/superpowers/specs/2026-06-05-sage-after-dark-roadmap-and-phase-a-design.md`).

**Commit author (required by repo CLAUDE.md):**
```bash
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "<msg>"
```

---

## File Structure

**Create:**
- `vitest.config.ts` — Vitest config: node env, `@/*` alias, coverage on `src/lib/**` + `src/app/api/**`.
- `playwright.config.ts` — Playwright config: webServer = `next dev`, baseURL localhost.
- `tests/helpers/env.ts` — credential guard (`describeWithStripe`, `describeWithSupabase`, `it.skipIf` helpers).
- `tests/helpers/stripe-sig.ts` — generate a valid `Stripe-Signature` header for a payload (test-only).
- `src/lib/auth.test.ts` — session token unit tests.
- `src/lib/passwords.test.ts` — password/hash/token unit tests.
- `src/lib/cipher.test.ts` — Caesar cipher / puzzle unit tests.
- `src/lib/stripe.test.ts` — signature verification + `computeMetrics` unit tests.
- `tests/integration/stripe-webhook.test.ts` — webhook handler integration (creds-gated).
- `tests/integration/auth-routes.test.ts` — auth route handlers integration (creds-gated).
- `tests/e2e/paywall.spec.ts` — paywall + admin-bypass E2E (creds-gated).
- `tests/e2e/smoke.spec.ts` — route smoke + signup→checkout E2E.
- `.github/workflows/ci.yml` — typecheck + unit + (gated) integration/e2e.
- `docs/audit/2026-06-05-systems-audit.md` — audit baseline report.
- `.env.test.example` — documents the test env vars the owner must provision.

**Modify:**
- `package.json` — add devDeps + `test`, `test:unit`, `test:integration`, `test:e2e`, `typecheck` scripts.
- `src/lib/stripe.ts` — extract pure `computeMetrics(...)` from `getPublicMetrics` (test seam; behavior preserved).

---

## Task 0: Tooling & configuration

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `playwright.config.ts`, `tests/helpers/env.ts`, `tests/helpers/stripe-sig.ts`, `.env.test.example`

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
cd ~/code/active/sage-after-dark
npm install -D vitest@^3 @vitest/coverage-v8@^3 @playwright/test@^1.49
npx playwright install chromium
```
Expected: deps added to `package.json` devDependencies; Chromium downloaded.

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` block, add these keys (keep existing `dev`/`build`/`start`/`lint`/`prebuild`):
```json
"typecheck": "tsc --noEmit",
"test": "vitest run",
"test:unit": "vitest run src/lib",
"test:watch": "vitest",
"test:integration": "vitest run tests/integration",
"test:e2e": "playwright test",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    setupFiles: [],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/app/api/**"],
      reporter: ["text", "html"],
    },
  },
});
```

- [ ] **Step 4: Create `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

const PORT = 3100;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 5: Create `tests/helpers/env.ts`** (credential guard)

```ts
import { describe } from "vitest";

const isCI = process.env.CI === "true" || process.env.CI === "1";

export const STRIPE_SECRET = process.env.STRIPE_TEST_SECRET_KEY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_TEST_WEBHOOK_SECRET ?? "";
export const SUPABASE_URL = process.env.SUPABASE_TEST_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY ?? "";
export const SUPABASE_WEBHOOK_SECRET = process.env.SUPABASE_TEST_WEBHOOK_SECRET ?? "";
export const SESSION_SECRET = process.env.SESSION_SECRET ?? "test-session-secret-please-change";

export const hasStripe = Boolean(STRIPE_SECRET && STRIPE_WEBHOOK_SECRET);
export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_WEBHOOK_SECRET);

/** Skip locally when creds absent; fail loudly in CI so unconfigured suites never green-pass. */
function gate(label: string, ok: boolean): boolean {
  if (ok) return true;
  if (isCI) {
    throw new Error(`[tests] ${label} credentials missing in CI — provision repo secrets.`);
  }
  return false;
}

export const describeWithStripe: typeof describe.skip = (gate("stripe", hasStripe)
  ? describe
  : describe.skip) as typeof describe.skip;

export const describeWithSupabase: typeof describe.skip = (gate("supabase", hasSupabase)
  ? describe
  : describe.skip) as typeof describe.skip;
```

- [ ] **Step 6: Create `tests/helpers/stripe-sig.ts`** (forge a valid signature header for tests)

```ts
import { createHmac } from "node:crypto";

/** Build a "t=...,v1=..." Stripe-Signature header for a raw payload. */
export function signStripePayload(
  payload: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000),
): string {
  const v1 = createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  return `t=${timestamp},v1=${v1}`;
}
```

- [ ] **Step 7: Create `.env.test.example`** (documents required test secrets)

```bash
# Copy to .env.test (git-ignored) and fill with Stripe TEST-mode + a Supabase PREVIEW BRANCH.
# Unit tests run without any of these. Integration/E2E skip locally if absent, fail in CI if absent.
SESSION_SECRET=at-least-sixteen-characters-long
STRIPE_TEST_SECRET_KEY=sk_test_xxx
STRIPE_TEST_WEBHOOK_SECRET=whsec_xxx
SUPABASE_TEST_URL=https://<preview-branch-ref>.supabase.co
SUPABASE_TEST_ANON_KEY=eyJxxx
SUPABASE_TEST_WEBHOOK_SECRET=must-match-the-RPC-p_secret-on-the-branch
ADMIN_EMAIL=sage@sageideas.org
```

- [ ] **Step 8: Verify tooling boots**

Run: `npx vitest run --reporter=dot` (no test files match yet is OK) and `npm run typecheck`.
Expected: vitest exits 0 ("no test files" or runs nothing); typecheck exits 0.

- [ ] **Step 9: Ensure `.env.test` is git-ignored**

Run: `grep -q '.env.test' .gitignore || printf '\n.env.test\n' >> .gitignore`
Expected: `.env.test` present in `.gitignore` (`.env.test.example` stays tracked).

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json vitest.config.ts playwright.config.ts tests/helpers .env.test.example .gitignore
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test: add vitest + playwright tooling and credential guard"
```

---

## Task 1: Unit tests — `src/lib/passwords.ts`

**Files:**
- Test: `src/lib/passwords.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  randomToken,
  sha256Hex,
  passwordStrength,
} from "@/lib/passwords";

describe("passwords", () => {
  it("hashes and verifies a valid password roundtrip", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^\$2[aby]\$/); // bcrypt prefix
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });

  it("rejects passwords that are too short or too long", async () => {
    await expect(hashPassword("short")).rejects.toThrow("password_too_short");
    await expect(hashPassword("x".repeat(201))).rejects.toThrow("password_too_long");
  });

  it("verifyPassword returns false on empty input instead of throwing", async () => {
    expect(await verifyPassword("", "")).toBe(false);
    expect(await verifyPassword("pw", "not-a-hash")).toBe(false);
  });

  it("randomToken returns hex of the requested byte length and is unique", () => {
    const a = randomToken(32);
    const b = randomToken(32);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toBe(b);
  });

  it("sha256Hex matches a known vector", async () => {
    // sha256("abc")
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("passwordStrength scores and gates correctly", () => {
    expect(passwordStrength("short").ok).toBe(false);
    expect(passwordStrength("short").reasons.length).toBeGreaterThan(0);
    const strong = passwordStrength("Abcd1234efgh");
    expect(strong.ok).toBe(true);
    expect(strong.score).toBeGreaterThanOrEqual(2);
    expect(strong.score).toBeLessThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run test to verify it passes** (implementation already exists; this locks behavior)

Run: `npx vitest run src/lib/passwords.test.ts`
Expected: PASS (5–6 tests). If `sha256Hex` vector fails, the function is broken — investigate before proceeding.

- [ ] **Step 3: Commit**

```bash
git add src/lib/passwords.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(passwords): hashing, tokens, sha256, strength"
```

---

## Task 2: Unit tests — `src/lib/auth.ts`

**Files:**
- Test: `src/lib/auth.test.ts`

- [ ] **Step 1: Write the failing test**

`auth.ts` imports `cookies` from `next/headers` at module top; mock it so the import resolves in the node test env. The functions under test (`signSessionToken`/`verifySessionToken`) do not call `cookies()`.

```ts
import { describe, it, expect, beforeAll, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}));

beforeAll(() => {
  process.env.SESSION_SECRET = "test-session-secret-please-change";
});

const { signSessionToken, verifySessionToken } = await import("@/lib/auth");

describe("session tokens", () => {
  it("signs and verifies a token roundtrip (case-normalized email)", async () => {
    const token = await signSessionToken("Member@Example.com");
    expect(token).toContain(".");
    expect(await verifySessionToken(token)).toBe("member@example.com");
  });

  it("rejects a tampered signature", async () => {
    const token = await signSessionToken("a@b.com");
    const [payload] = token.split(".");
    const forged = `${payload}.deadbeef`;
    expect(await verifySessionToken(forged)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await signSessionToken("a@b.com");
    const sig = token.split(".")[1];
    const evilPayload = Buffer.from(JSON.stringify({ email: "admin@b.com", exp: 9999999999 }))
      .toString("base64url");
    expect(await verifySessionToken(`${evilPayload}.${sig}`)).toBeNull();
  });

  it("rejects malformed tokens", async () => {
    expect(await verifySessionToken("nodot")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });

  it("rejects an expired token", async () => {
    // Hand-build an expired token using the same secret + scheme.
    const { createHmac } = await import("node:crypto");
    const payload = Buffer.from(JSON.stringify({ email: "a@b.com", exp: 1 })).toString("base64url");
    const sig = createHmac("sha256", process.env.SESSION_SECRET!)
      .update(payload)
      .digest("base64url");
    expect(await verifySessionToken(`${payload}.${sig}`)).toBeNull();
  });

  it("throws when SESSION_SECRET is missing or too short", async () => {
    const prev = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "tooshort";
    await expect(signSessionToken("a@b.com")).rejects.toThrow("session_secret_missing");
    process.env.SESSION_SECRET = prev;
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/lib/auth.test.ts`
Expected: PASS. Note: `auth.ts` uses `btoa`/`atob` + base64url; the test's `Buffer.toString("base64url")` is byte-compatible for the payloads used. If the expired-token test fails on encoding, switch the test helper to `b64urlEncode` semantics (strip `=`, `+`→`-`, `/`→`_`).

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(auth): session token sign/verify/expiry/tamper"
```

---

## Task 3: Unit tests — `src/lib/cipher.ts`

**Files:**
- Test: `src/lib/cipher.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import {
  encryptCaesar,
  decryptCaesar,
  currentShift,
  normaliseGuess,
  liveCiphertext,
  MONTHLY_SHIFTS,
  LIVE_PLAINTEXT,
} from "@/lib/cipher";

describe("cipher", () => {
  it("encrypt/decrypt is a roundtrip for any shift", () => {
    for (const shift of [0, 1, 5, 13, 25, 26]) {
      expect(decryptCaesar(encryptCaesar(LIVE_PLAINTEXT, shift), shift)).toBe(LIVE_PLAINTEXT);
    }
  });

  it("shifts letters and preserves non-letters", () => {
    expect(encryptCaesar("abc XYZ!", 1)).toBe("bcd YZA!");
  });

  it("currentShift returns the month's configured shift (UTC)", () => {
    expect(currentShift(new Date("2026-01-15T00:00:00Z"))).toBe(MONTHLY_SHIFTS[0]);
    expect(currentShift(new Date("2026-12-15T00:00:00Z"))).toBe(MONTHLY_SHIFTS[11]);
  });

  it("normaliseGuess lowercases, trims, and collapses whitespace", () => {
    expect(normaliseGuess("  The   ANSWER  ")).toBe("the answer");
  });

  it("liveCiphertext decrypts back to the live plaintext with the current shift", () => {
    expect(decryptCaesar(liveCiphertext(), currentShift())).toBe(LIVE_PLAINTEXT);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/lib/cipher.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 3: Commit**

```bash
git add src/lib/cipher.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(cipher): caesar roundtrip, monthly shift, guess normalization"
```

---

## Task 4: Unit tests — `src/lib/stripe.ts` signature verification

**Files:**
- Test: `src/lib/stripe.test.ts` (signature section; metrics added in Task 5)

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { verifyStripeSignature } from "@/lib/stripe";
import { signStripePayload } from "../../tests/helpers/stripe-sig";

const SECRET = "whsec_test_secret";
const PAYLOAD = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });

describe("verifyStripeSignature", () => {
  it("accepts a correctly signed recent payload", async () => {
    const header = signStripePayload(PAYLOAD, SECRET);
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET)).toBe(true);
  });

  it("rejects a wrong signature", async () => {
    const header = signStripePayload(PAYLOAD, "wrong_secret");
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET)).toBe(false);
  });

  it("rejects a payload tampered after signing", async () => {
    const header = signStripePayload(PAYLOAD, SECRET);
    expect(await verifyStripeSignature(PAYLOAD + "x", header, SECRET)).toBe(false);
  });

  it("rejects timestamps outside the tolerance window", async () => {
    const stale = Math.floor(Date.now() / 1000) - 10_000;
    const header = signStripePayload(PAYLOAD, SECRET, stale);
    expect(await verifyStripeSignature(PAYLOAD, header, SECRET, 300)).toBe(false);
  });

  it("rejects a null or malformed header", async () => {
    expect(await verifyStripeSignature(PAYLOAD, null, SECRET)).toBe(false);
    expect(await verifyStripeSignature(PAYLOAD, "garbage", SECRET)).toBe(false);
    expect(await verifyStripeSignature(PAYLOAD, "t=abc,v1=def", SECRET)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx vitest run src/lib/stripe.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 3: Commit**

```bash
git add src/lib/stripe.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(stripe): webhook signature verification"
```

---

## Task 5: Test seam — extract `computeMetrics`, then unit test it

**Files:**
- Modify: `src/lib/stripe.ts` (extract pure function; `getPublicMetrics` delegates to it)
- Test: `src/lib/stripe.test.ts` (append metrics suite)

- [ ] **Step 1: Write the failing test (append to `src/lib/stripe.test.ts`)**

```ts
import { computeMetrics } from "@/lib/stripe";

describe("computeMetrics", () => {
  const NOW = Math.floor(new Date("2026-06-05T00:00:00Z").getTime() / 1000);
  const DAY = 86_400;

  const monthly = (created: number, status = "active", canceled_at: number | null = null) => ({
    id: `sub_${created}`,
    status,
    canceled_at,
    created,
    items: { data: [{ price: { id: "p_m", unit_amount: 500, recurring: { interval: "month" } } }] },
  });
  const annual = (created: number) => ({
    id: `sub_y_${created}`,
    status: "active",
    canceled_at: null,
    created,
    items: { data: [{ price: { id: "p_y", unit_amount: 5000, recurring: { interval: "year" } } }] },
  });

  it("normalizes annual price to monthly in MRR and rounds to $5", () => {
    const subs = [monthly(NOW - 60 * DAY), annual(NOW - 60 * DAY)];
    const m = computeMetrics(subs, [], NOW);
    // monthly $5 + annual $50/12≈$4.17 → ~$9.17 → rounds to $10
    expect(m.activeSubs).toBe(2);
    expect(m.mrrUsd).toBe(10);
  });

  it("returns null churn when the denominator is below 5", () => {
    const subs = [monthly(NOW - 60 * DAY), monthly(NOW - 2 * DAY)];
    expect(computeMetrics(subs, [], NOW).churn30d).toBeNull();
  });

  it("counts new and canceled subs within the 30-day window", () => {
    const subs = [
      monthly(NOW - 2 * DAY),
      monthly(NOW - 40 * DAY),
      monthly(NOW - 40 * DAY, "canceled", NOW - 1 * DAY),
    ];
    const m = computeMetrics(subs, [], NOW);
    expect(m.newSubs30d).toBe(1);
    expect(m.canceledSubs30d).toBe(1);
  });

  it("sums lifetime revenue from paid invoices and rounds to $10", () => {
    const m = computeMetrics([], [{ amount_paid: 1234, status: "paid" }, { amount_paid: 8800, status: "paid" }], NOW);
    expect(m.lifetimeUsd).toBe(100); // (12.34 + 88.00)=100.34 → 100
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/stripe.test.ts -t computeMetrics`
Expected: FAIL — `computeMetrics` is not exported.

- [ ] **Step 3: Refactor `src/lib/stripe.ts` — extract the pure computation**

In `src/lib/stripe.ts`, add the exported types/function below (place above `getPublicMetrics`). Use the exact `StripeSubscription` type already defined in the file.

```ts
export type StripeInvoiceLite = { amount_paid: number; status: string };

/** Pure metrics computation — no network. `now` is unix seconds. */
export function computeMetrics(
  subs: StripeSubscription[],
  invoices: StripeInvoiceLite[],
  now: number,
): PublicMetrics {
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
  const active = subs.filter((s) => s.status === "active" || s.status === "trialing");

  let mrrCents = 0;
  for (const s of active) {
    for (const item of s.items.data) {
      const amt = item.price.unit_amount ?? 0;
      const interval = item.price.recurring?.interval;
      if (interval === "month") mrrCents += amt;
      else if (interval === "year") mrrCents += Math.round(amt / 12);
    }
  }

  const newSubs30d = subs.filter((s) => s.created >= thirtyDaysAgo).length;
  const canceledSubs30d = subs.filter(
    (s) => s.canceled_at && s.canceled_at >= thirtyDaysAgo,
  ).length;
  const startActive = active.filter((s) => s.created < thirtyDaysAgo).length + canceledSubs30d;
  const churn30d = startActive >= 5 ? canceledSubs30d / startActive : null;

  let lifetimeCents = 0;
  for (const inv of invoices) lifetimeCents += inv.amount_paid ?? 0;

  return {
    mrrUsd: roundTo(mrrCents / 100, 5),
    activeSubs: active.length,
    newSubs30d,
    canceledSubs30d,
    churn30d,
    lifetimeUsd: roundTo(lifetimeCents / 100, 10),
    asOf: new Date(now * 1000).toISOString(),
  };
}
```

Then replace the body of `getPublicMetrics` so it fetches and delegates (preserving the existing try/catch around invoices):

```ts
export async function getPublicMetrics(): Promise<PublicMetrics> {
  const subs = await listAll<StripeSubscription>("/subscriptions", { status: "all" });
  let invoices: StripeInvoiceLite[] = [];
  try {
    invoices = await listAll<StripeInvoiceLite>("/invoices", { status: "paid" });
  } catch {
    // non-fatal — leave lifetime at 0 if invoice list fails
  }
  return computeMetrics(subs, invoices, Math.floor(Date.now() / 1000));
}
```

- [ ] **Step 4: Run test + typecheck to verify pass**

Run: `npx vitest run src/lib/stripe.test.ts && npm run typecheck`
Expected: all stripe tests PASS; typecheck exits 0.

- [ ] **Step 5: Verify production build still green (behavior preserved)**

Run: `npm run build`
Expected: build exits 0.

- [ ] **Step 6: Commit**

```bash
git add src/lib/stripe.ts src/lib/stripe.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "refactor(stripe): extract pure computeMetrics seam + tests"
```

---

## Task 6: Integration — Stripe webhook (creds-gated)

**Files:**
- Test: `tests/integration/stripe-webhook.test.ts`

Runs against Stripe test-mode + a Supabase preview branch with the `sage_after_dark_upsert_member` and `sage_after_dark_stripe_event_record` RPCs migrated and `SUPABASE_TEST_WEBHOOK_SECRET` matching the RPC's `p_secret`.

- [ ] **Step 1: Write the test**

```ts
import { it, expect, beforeAll } from "vitest";
import {
  describeWithSupabase,
  STRIPE_WEBHOOK_SECRET,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_WEBHOOK_SECRET,
} from "../helpers/env";
import { signStripePayload } from "../helpers/stripe-sig";

beforeAll(() => {
  process.env.STRIPE_WEBHOOK_SECRET = STRIPE_WEBHOOK_SECRET;
  process.env.SUPABASE_WEBHOOK_SECRET = SUPABASE_WEBHOOK_SECRET;
  process.env.SUPABASE_URL = SUPABASE_URL;
  process.env.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
});

async function post(raw: string, header: string | null) {
  const { POST } = await import("@/app/api/stripe/webhook/route");
  const req = new Request("http://localhost/api/stripe/webhook", {
    method: "POST",
    headers: header ? { "stripe-signature": header } : {},
    body: raw,
  });
  return POST(req);
}

async function memberStatusByEmail(email: string): Promise<string | null> {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/sage_after_dark_members?email=eq.${encodeURIComponent(email)}&select=status`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } },
  );
  const rows = (await r.json()) as Array<{ status: string }>;
  return rows[0]?.status ?? null;
}

describeWithSupabase("stripe webhook integration", () => {
  it("rejects a request with no/invalid signature (400)", async () => {
    const raw = JSON.stringify({ id: "evt_nosig", type: "checkout.session.completed", data: { object: {} } });
    expect((await post(raw, null)).status).toBe(400);
    expect((await post(raw, "t=1,v1=bad")).status).toBe(400);
  });

  it("activates a member on checkout.session.completed and is idempotent", async () => {
    const email = `wtest_${Date.now()}@example.com`;
    const evt = {
      id: `evt_${Date.now()}`,
      type: "checkout.session.completed",
      data: { object: { customer_email: email, customer: `cus_${Date.now()}`, subscription: "sub_x", metadata: { plan: "monthly" } } },
    };
    const raw = JSON.stringify(evt);
    const header = signStripePayload(raw, STRIPE_WEBHOOK_SECRET);

    const first = await post(raw, header);
    expect(first.status).toBe(200);
    expect(await memberStatusByEmail(email)).toBe("active");

    // Replaying the SAME event id must be treated as a duplicate (200, no double-process).
    const second = await post(raw, signStripePayload(raw, STRIPE_WEBHOOK_SECRET));
    expect(second.status).toBe(200);
    expect(await second.text()).toBe("duplicate");
  });

  it("downgrades to canceled on customer.subscription.deleted", async () => {
    // Seed a member via checkout first.
    const email = `wcancel_${Date.now()}@example.com`;
    const customer = `cus_cancel_${Date.now()}`;
    const checkout = JSON.stringify({
      id: `evt_seed_${Date.now()}`,
      type: "checkout.session.completed",
      data: { object: { customer_email: email, customer, subscription: "sub_c", metadata: { plan: "monthly" } } },
    });
    await post(checkout, signStripePayload(checkout, STRIPE_WEBHOOK_SECRET));

    const del = JSON.stringify({
      id: `evt_del_${Date.now()}`,
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_c", customer, status: "canceled", items: { data: [] } } },
    });
    const res = await post(del, signStripePayload(del, STRIPE_WEBHOOK_SECRET));
    expect(res.status).toBe(200);
    expect(await memberStatusByEmail(email)).toBe("canceled");
  });
});
```

- [ ] **Step 2: Run the test**

Run (locally, with `.env.test` loaded): `npx vitest run tests/integration/stripe-webhook.test.ts`
Expected (no creds): suite SKIPPED with a clear line. Expected (creds present): 3 tests PASS.
Local env load tip: `node --env-file=.env.test ./node_modules/.bin/vitest run tests/integration/stripe-webhook.test.ts`.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/stripe-webhook.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(stripe-webhook): idempotency, signature, upsert, downgrade (gated)"
```

---

## Task 7: Integration — auth routes (creds-gated)

**Files:**
- Test: `tests/integration/auth-routes.test.ts`

- [ ] **Step 1: Write the test**

`setSessionCookie` calls `cookies()` (request scope). Mock `next/headers` so route handlers can set cookies in the node test env.

```ts
import { it, expect, beforeAll, vi } from "vitest";
import {
  describeWithSupabase,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SESSION_SECRET,
} from "../helpers/env";

vi.mock("next/headers", () => {
  const store = new Map<string, string>();
  return {
    cookies: async () => ({
      get: (k: string) => (store.has(k) ? { value: store.get(k) } : undefined),
      set: (k: string, v: string) => store.set(k, v),
      delete: (k: string) => store.delete(k),
    }),
  };
});

beforeAll(() => {
  process.env.SESSION_SECRET = SESSION_SECRET;
  process.env.SUPABASE_URL = SUPABASE_URL;
  process.env.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
});

function jsonReq(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describeWithSupabase("auth routes integration", () => {
  it("signup rejects an invalid email (400)", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(jsonReq("/api/auth/signup", { email: "nope", password: "Abcd1234efgh" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_email");
  });

  it("signup rejects a weak password (400)", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(jsonReq("/api/auth/signup", { email: `s_${Date.now()}@example.com`, password: "short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("weak_password");
  });

  it("signup then login succeeds; wrong password is 401", async () => {
    const email = `login_${Date.now()}@example.com`;
    const password = "Abcd1234efgh";
    const signup = await import("@/app/api/auth/signup/route");
    const su = await signup.POST(jsonReq("/api/auth/signup", { email, password }));
    expect(su.status).toBe(200);
    expect((await su.json()).ok).toBe(true);

    const login = await import("@/app/api/auth/login/route");
    const good = await login.POST(jsonReq("/api/auth/login", { email, password }));
    expect(good.status).toBe(200);

    const bad = await login.POST(jsonReq("/api/auth/login", { email, password: "WrongPass123!" }));
    expect(bad.status).toBe(401);
    expect((await bad.json()).error).toBe("invalid");
  });

  it("forgot always returns ok and does not disclose existence", async () => {
    const { POST } = await import("@/app/api/auth/forgot/route");
    const res = await POST(jsonReq("/api/auth/forgot", { email: `missing_${Date.now()}@example.com` }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });

  it("reset rejects a malformed token (400)", async () => {
    const { POST } = await import("@/app/api/auth/reset/route");
    const res = await POST(jsonReq("/api/auth/reset", { token: "tooshort", password: "Abcd1234efgh" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_token");
  });

  it("reset rejects an unknown (expired) token (400)", async () => {
    const { POST } = await import("@/app/api/auth/reset/route");
    const fakeHexToken = "a".repeat(64);
    const res = await POST(jsonReq("/api/auth/reset", { token: fakeHexToken, password: "Abcd1234efgh" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("expired");
  });
});
```

- [ ] **Step 2: Run the test**

Run: `node --env-file=.env.test ./node_modules/.bin/vitest run tests/integration/auth-routes.test.ts`
Expected (no creds): SKIPPED. (creds present): all PASS. Created rows use unique timestamped emails; they're harmless test residue on the preview branch.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/auth-routes.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(auth-routes): signup/login/forgot/reset happy + failure paths (gated)"
```

---

## Task 8: E2E — paywall correctness + admin bypass (creds-gated)

**Files:**
- Test: `tests/e2e/paywall.spec.ts`

Requires the dev server running with a configured session secret + admin email. The admin-bypass test sets a valid `sad_session` cookie for `ADMIN_EMAIL`.

- [ ] **Step 1: Identify fixtures (no code change — read-only)**

Run:
```bash
cd ~/code/active/sage-after-dark
grep -rl "members_only: true" src/content/posts | head -1
grep -rL "members_only: true" src/content/posts | head -1
```
Record one members-only post path and one public post path (their `pillar` + `slug` frontmatter form the URL `/{pillar}/{slug}`). Use these two URLs in Step 2.

- [ ] **Step 2: Write the spec** (replace `MEMBERS_URL` / `PUBLIC_URL` with the two routes from Step 1)

```ts
import { test, expect } from "@playwright/test";
import { createHmac } from "node:crypto";

const MEMBERS_URL = "/teach/<members-only-slug>"; // from Step 1
const PUBLIC_URL = "/build/<public-slug>"; // from Step 1
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "sage@sageideas.org";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "test-session-secret-please-change";

function adminSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ email: ADMIN_EMAIL.toLowerCase(), exp: Math.floor(Date.now() / 1000) + 3600 }),
  ).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

test("anonymous visitor sees the paywall on a members-only post", async ({ page }) => {
  await page.goto(MEMBERS_URL);
  await expect(page.getByText(/members only/i)).toBeVisible();
  await expect(page.getByRole("link", { name: /become a member/i })).toBeVisible();
});

test("a public post renders fully with no paywall", async ({ page }) => {
  await page.goto(PUBLIC_URL);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText(/the rest of this is for members/i)).toHaveCount(0);
});

test("admin bypasses the paywall on a members-only post", async ({ page, context }) => {
  await context.addCookies([
    { name: "sad_session", value: adminSessionToken(), url: "http://localhost:3100" },
  ]);
  await page.goto(MEMBERS_URL);
  await expect(page.getByText(/the rest of this is for members/i)).toHaveCount(0);
  await expect(page.locator("h1")).toBeVisible();
});
```

- [ ] **Step 3: Run the spec**

Run: `SESSION_SECRET=test-session-secret-please-change ADMIN_EMAIL=sage@sageideas.org npx playwright test tests/e2e/paywall.spec.ts`
Expected: 3 PASS. (The dev server must boot with the same `SESSION_SECRET`/`ADMIN_EMAIL`; set them in the shell or `.env.local` before running.)

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/paywall.spec.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(e2e): paywall gate + admin bypass"
```

---

## Task 9: E2E — smoke + signup→checkout

**Files:**
- Test: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Write the spec**

```ts
import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/archive", "/about"];

for (const route of ROUTES) {
  test(`${route} loads with a visible h1 and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(errors, `console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}

test("signup page exposes the membership/checkout entry", async ({ page }) => {
  await page.goto("/membership");
  await expect(page.getByRole("link", { name: /member|join|subscribe/i }).first()).toBeVisible();
});
```

- [ ] **Step 2: Run the spec**

Run: `npx playwright test tests/e2e/smoke.spec.ts`
Expected: all PASS. If a route legitimately logs a third-party console error (e.g., Cusdis when unconfigured), narrow the filter to ignore that specific known message and note it inline.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/smoke.spec.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(e2e): route smoke + membership entry"
```

---

## Task 10: CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI
on:
  push:
    branches: ["**"]
  pull_request:

jobs:
  typecheck-and-unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test:unit

  integration:
    runs-on: ubuntu-latest
    needs: typecheck-and-unit
    env:
      CI: "true"
      SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
      STRIPE_TEST_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
      STRIPE_TEST_WEBHOOK_SECRET: ${{ secrets.STRIPE_TEST_WEBHOOK_SECRET }}
      SUPABASE_TEST_URL: ${{ secrets.SUPABASE_TEST_URL }}
      SUPABASE_TEST_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
      SUPABASE_TEST_WEBHOOK_SECRET: ${{ secrets.SUPABASE_TEST_WEBHOOK_SECRET }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      # Skips itself cleanly if the secrets above are unset (env guard treats empty as absent,
      # but CI=true forces a hard failure only when a secret is missing — provision all or none).
      - run: npm run test:integration

  e2e:
    runs-on: ubuntu-latest
    needs: typecheck-and-unit
    env:
      SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
      ADMIN_EMAIL: ${{ secrets.ADMIN_EMAIL }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 2: Validate YAML locally**

Run: `node -e "require('fs').readFileSync('.github/workflows/ci.yml','utf8')" && echo OK` (sanity read) and confirm indentation by eye.
Expected: OK printed; no parse errors when pushed.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "ci: typecheck + unit always, integration/e2e gated on secrets"
```

---

## Task 11: Audit report + final verification

**Files:**
- Create: `docs/audit/2026-06-05-systems-audit.md`

- [ ] **Step 1: Write the audit report**

```markdown
# Sage After Dark — Systems Audit (2026-06-05)

## Scope
Full front-end + back-end audit prior to the Phase B redesign. Read-only build/type/lint
gates plus a manual review of the payment, auth, and paywall surfaces.

## Results
| Gate | Result |
|------|--------|
| Production build (`npm run build`) | PASS — all routes compile |
| TypeScript (`tsc --noEmit`) | PASS — 0 errors |
| ESLint | 218 errors / 6 warnings, ~89% cosmetic rule-drift (Next 16 / React 19 flat-config) |
| Tests (before Phase A) | None existed |
| Lighthouse (last recorded) | 94–96 Perf / 100 SEO / 100 A11y |

## Lint breakdown
- 128 `jsx-no-comment-textnodes`, 46 `no-html-link-for-pages`, 19 `no-unescaped-entities` — cosmetic.
- 18 `set-state-in-effect`, 5 `purity`, 1 `immutability` — react-hooks opinions; no confirmed runtime bugs; most in interactive components slated for the Phase B rebuild.
- 6 trivial (unused vars, one `any`).

## Runtime bugs found
None. The auth (HMAC session), Stripe (constant-time signature compare), and password (bcrypt
rounds 12) code is correct. Paywall fails closed and admin-bypass is intentional and tested.

## Action taken (Phase A)
- Added Vitest unit tests for `auth`, `passwords`, `cipher`, and `stripe` (signature + metrics).
- Extracted a pure `computeMetrics` seam from `getPublicMetrics` (behavior preserved).
- Added gated integration tests for the Stripe webhook (idempotency/signature/upsert/downgrade)
  and the auth routes.
- Added Playwright E2E for paywall correctness, admin bypass, and route smoke.
- Added CI (typecheck + unit always; integration/e2e gated on provisioned secrets).

## Deferred (by decision)
- 193 cosmetic lint flags — left as-is; many resolve when Phase B rebuilds components.
- No change to Stripe webhook logic / `upsertMember` / subscribe behavior.
```

- [ ] **Step 2: Full local verification sweep**

Run:
```bash
npm run typecheck && npm run test:unit && npm run build
```
Expected: all three exit 0. Unit suite green with no secrets present.

- [ ] **Step 3: Commit**

```bash
git add docs/audit/2026-06-05-systems-audit.md
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "docs(audit): 2026-06-05 systems audit baseline"
```

- [ ] **Step 4: Push branch (only when the owner approves pushing)**

```bash
git push -u origin phase-a/stabilize-test-net
```
Expected: branch published; CI `typecheck-and-unit` job goes green. Integration/e2e jobs require the owner to add repo secrets first.

---

## Self-Review

**Spec coverage:**
- Vitest + Playwright + CI → Tasks 0, 10. ✓
- Real Stripe test-mode + Supabase preview branch + graceful skip → Task 0 (`env.ts`), Tasks 6–8. ✓
- Unit targets auth/stripe/passwords/cipher → Tasks 1–5. ✓
- `getPublicMetrics` pure-seam extraction → Task 5. ✓
- Integration: webhook idempotency/signature/upsert/downgrade + auth routes → Tasks 6–7. ✓
- E2E: paywall + admin bypass + smoke → Tasks 8–9. ✓
- Critical-path coverage config (not blanket 80%) → Task 0 `vitest.config.ts` coverage.include. ✓
- Audit report deliverable → Task 11. ✓
- "Don't touch webhook/upsertMember/subscribe logic" → only `computeMetrics` extraction (pure, behavior-preserved) touches `stripe.ts`; webhook handler untouched. ✓

**Placeholder scan:** Fixtures in Task 8 (`MEMBERS_URL`/`PUBLIC_URL`, members-only slug) are resolved by the Step-1 grep, not left vague. No TBD/TODO steps.

**Type consistency:** `computeMetrics` uses the existing `StripeSubscription` + `PublicMetrics` types and new `StripeInvoiceLite`; `getPublicMetrics` delegates with matching signatures. `signStripePayload` header format matches `verifyStripeSignature`'s parser. `adminSessionToken` (E2E) mirrors `auth.ts` payload scheme (`{email, exp}`, base64url, HMAC-SHA256).
