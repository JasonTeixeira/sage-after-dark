# Phase A — De-bill & Stabilize Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Sage After Dark fully free by surgically removing Stripe billing + the members-only paywall (keeping free accounts/login + newsletter), then put a regression net (Vitest + Playwright + CI) around the code that remains.

**Architecture:** Two parts. **Part 1 (De-bill)** deletes pure-billing files and strips billing blocks from consumer pages, verifying `build` + `typecheck` green after each task so a dangling reference can never slip through. **Part 2 (Test net)** covers the code that stays: `auth`, `passwords`, `cipher` (unit), the kept auth routes (integration, Supabase-branch-gated), and E2E proving every post is now free + smoke. **Part 3** adds CI and the audit report.

**Tech Stack:** Next.js 16.2.4, React 19.2.4, TypeScript 5, Vitest 3, @vitest/coverage-v8, @playwright/test, Node 22, GitHub Actions.

**Branch:** `phase-a/stabilize-test-net`.

**Billing wind-down (owner-run, prerequisite to deploy):** `scripts/ops/cancel-all-subscriptions.mjs` (already committed) cancels active Stripe subscriptions. The owner runs it with their live key; deleting code does NOT stop charges.

**Commit author (required by repo CLAUDE.md):**
```bash
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "<msg>"
```

**Default decisions baked in (override if wrong):**
- `/numbers` — KEEP the page, remove only the Stripe money block (corpus/audience stats stay).
- `/membership`, `/members` — DELETE; redirect both to `/account` via `next.config` redirects so old links/SEO don't 404.
- `/account` — KEEP; remove member-status cards + "manage billing" button.
- `members_only` frontmatter field — KEEP in schema (back-comat) but it no longer gates anything.

---

# PART 1 — DE-BILL

## Task D1: Remove the members-only gate from the post page

**Files:**
- Modify: `src/app/[pillar]/[slug]/page.tsx`

- [ ] **Step 1: Remove the gate logic and paywall render**

In `src/app/[pillar]/[slug]/page.tsx`:
- Delete the import on line 16: `import { Paywall } from "@/components/paywall";`
- Delete the import of `memberStatus` (line ~26) — but KEEP `isAdminEmail`/`getSessionEmail` imports only if still used elsewhere in the file; if they become unused, delete them too.
- Delete the entire members-only gate block (lines ~94–115: the `let isMember/signedIn/isAdmin` ... `const showPaywall = ...`).
- Replace the conditional render (lines ~144–145) so the MDX body always renders — remove the `showPaywall ? <Paywall .../> : <body>` branch, keep only the body.

- [ ] **Step 2: Verify build + typecheck**

Run: `npm run typecheck && npm run build`
Expected: both exit 0. Typecheck will flag any now-unused import — remove it and re-run.

- [ ] **Step 3: Commit**

```bash
git add src/app/'[pillar]'/'[slug]'/page.tsx
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "feat(content): all posts are free — remove members-only gate"
```

---

## Task D2: Remove paywall component + members_only UI affordances

**Files:**
- Delete: `src/components/paywall.tsx`
- Modify: `src/components/layouts/shared.tsx`, `src/app/best/page.tsx`

- [ ] **Step 1: Delete the paywall component**

Run: `git rm src/components/paywall.tsx`
Also remove any export of `Paywall` from `src/components/index.ts` if present (grep first: `grep -n Paywall src/components/index.ts`).

- [ ] **Step 2: Remove the members-only badge on post cards**

In `src/components/layouts/shared.tsx` (~line 78): delete the `{fm.members_only && (...)}` block that renders the members-only tag.

- [ ] **Step 3: Collapse the members_only tiering on /best**

In `src/app/best/page.tsx` (~lines 34–45): remove the `members_only` filtering/tiering so all curated essays appear in one list regardless of the (now-meaningless) flag.

- [ ] **Step 4: Verify build + typecheck**

Run: `npm run typecheck && npm run build`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "refactor(ui): drop paywall component + members-only badges/tiering"
```

---

## Task D3: Delete pure-billing routes & pages + cron + redirects

**Files:**
- Delete: `src/app/api/checkout/route.ts`, `src/app/api/portal/route.ts`, `src/app/api/stripe/webhook/route.ts`, `src/app/api/cron/refresh-numbers/route.ts`, `src/app/membership/page.tsx`, `src/app/members/page.tsx`
- Modify: `vercel.json`, `next.config.ts`

- [ ] **Step 1: Delete the billing routes/pages**

```bash
git rm src/app/api/checkout/route.ts src/app/api/portal/route.ts \
       src/app/api/stripe/webhook/route.ts src/app/api/cron/refresh-numbers/route.ts \
       src/app/membership/page.tsx src/app/members/page.tsx
git rm -r src/app/api/stripe 2>/dev/null || true
```

- [ ] **Step 2: Remove the cron from `vercel.json`**

Delete the entire `"crons"` array (the `/api/cron/refresh-numbers` entry). If `crons` was the only key, leave `{}`.

- [ ] **Step 3: Add redirects so old links don't 404**

In `next.config.ts`, add an async `redirects()` returning permanent redirects:
```ts
async redirects() {
  return [
    { source: "/membership", destination: "/account", permanent: true },
    { source: "/members", destination: "/account", permanent: true },
  ];
},
```

- [ ] **Step 4: Verify build + typecheck**

Run: `npm run typecheck && npm run build`
Expected: both exit 0. (Pages importing the now-deleted routes are handled in D5; if build fails here on a dangling import, it's a D5 file — note it and continue to D5, or do D5 first. Ordering note: if build fails, proceed to D4+D5 then re-verify.)

- [ ] **Step 5: Commit**

```bash
git add -A
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "feat: remove Stripe checkout/portal/webhook routes, membership/members pages, cron"
```

---

## Task D4: Delete `lib/stripe.ts` + strip billing functions from libs

**Files:**
- Delete: `src/lib/stripe.ts`
- Modify: `src/lib/supabase.ts`, `src/lib/email.ts`, `src/lib/living.ts`

- [ ] **Step 1: Delete the Stripe lib**

Run: `git rm src/lib/stripe.ts`

- [ ] **Step 2: Remove billing RPC helpers from `src/lib/supabase.ts`**

Delete these exported functions (confirmed at these line ranges; re-grep to confirm): `memberStatus` (~52–61), `upsertMember` (~63–81), `recordStripeEvent` (~195–215). KEEP all auth/newsletter functions: `subscribeEmail`, `createMagicLink`, `getPasswordRow`, `registerMember`, `recordLogin`, `setMemberPassword`, `consumePasswordReset`, `createPasswordReset`, `whoami`, etc.

- [ ] **Step 3: Remove `memberWelcomeEmail` from `src/lib/email.ts`**

Delete the `memberWelcomeEmail(...)` function (~line 225). KEEP `sendEmail`, `addToAudience`, `welcomeEmail`, `magicLinkEmail`, `passwordResetEmail`, `setPasswordEmail`.

- [ ] **Step 4: Remove the Stripe customer field from `src/lib/living.ts`**

At ~line 194, remove `stripe_customer_id: string | null;` from the member type/query if present and any select that references it.

- [ ] **Step 5: Verify typecheck (expect failures pointing at consumer pages)**

Run: `npm run typecheck`
Expected: FAILS with references in `/numbers`, `/admin`, `/admin/members`, `/account`, `site-header` — those are fixed in D5. This confirms the map. Do NOT commit yet.

- [ ] **Step 6: Commit (after D5 makes typecheck green — see D5 Step 6)**

(Commit happens at the end of D5 so the tree is never left non-building.)

---

## Task D5: Update consumer pages that referenced billing

**Files:**
- Modify: `src/app/numbers/page.tsx`, `src/app/admin/page.tsx`, `src/app/admin/members/page.tsx`, `src/app/account/page.tsx`, `src/components/site-header.tsx`, `src/app/start/page.tsx`

- [ ] **Step 1: `/numbers` — remove the money block**

In `src/app/numbers/page.tsx`: delete `import { getPublicMetrics, type PublicMetrics } from "@/lib/stripe"` (line ~31), the `getPublicMetrics()` call (~49–54), and the JSX section rendering MRR/active subs/churn/lifetime (~112–157). KEEP corpus stats (posts/words) and audience stats (Resend subscriber count via `live-counts.ts`).

- [ ] **Step 2: `/admin` + `/admin/members` — remove metrics**

In both files: delete the `getPublicMetrics` import and its `safe(getPublicMetrics, null)` call in the `Promise.all`, and the JSX showing active-member count + MRR. For `/admin/members`, keep the members table but source it from the existing members RPC/`whoami`-style read (registered accounts), or if it only existed for billing, replace the metrics header with a simple count of registered accounts.

- [ ] **Step 3: `/account` — remove billing UI**

In `src/app/account/page.tsx`: delete `import { memberStatus } from "@/lib/supabase"` (line ~24), the `memberStatus(email)` call (~98) and derived `isActive/planLabel/renews` (~104–106), and the billing JSX (~186–202: status cards + the "manage billing" form POST to `/api/portal` + the "start membership" CTA). KEEP the account identity (email, logout, password change if present).

- [ ] **Step 4: `site-header` — remove the member badge**

In `src/components/site-header.tsx`: delete `import { memberStatus }` (line ~14), the `memberStatus` fetch/`isMember` flag (~29–36), and the `isMember ? <MemberBadge/>` branch (~66). KEEP the admin badge (`isAdmin`).

- [ ] **Step 5: `start` page — drop the membership CTA**

In `src/app/start/page.tsx` (~lines 103, 319): remove or repoint any `/membership` links/CTAs (point to `/account` or remove).

- [ ] **Step 6: Verify typecheck + build green, then commit D4 + D5 together**

Run: `npm run typecheck && npm run build`
Expected: both exit 0. Grep to confirm nothing dangles: `grep -rn "@/lib/stripe\|memberStatus\|getPublicMetrics\|memberWelcomeEmail\|Paywall\|/api/portal\|/api/checkout" src` returns nothing.
```bash
git add -A
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "refactor: strip billing from numbers/admin/account/header/start; remove lib/stripe"
```

---

## Task D6: Docs + env cleanup

**Files:**
- Modify: `docs/70-INFRASTRUCTURE.md`, `src/content/site-data.ts`, any `.env.example`

- [ ] **Step 1: Update infrastructure docs**

In `docs/70-INFRASTRUCTURE.md`: remove the Stripe/payments section, the `sage_after_dark_members` billing-field + `stripe_event_log` descriptions, the price IDs, and the webhook section. Add a one-line note: "Billing removed 2026-06-05 — site is free; accounts + newsletter only."

- [ ] **Step 2: Remove stale changelog/feature line**

In `src/content/site-data.ts` (~line 17): remove the `"Ship Trayd v2 paywall + checkout flow"` line (or move under a "retired" list).

- [ ] **Step 3: Remove Stripe env vars from any example file**

Grep: `grep -rn "STRIPE" .env.example 2>/dev/null`. Remove `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `STRIPE_PRODUCT_ID`, `NEXT_PUBLIC_STRIPE_*` lines if present. (Do NOT edit the real `.env.local`; that's owner-managed in Vercel.)

- [ ] **Step 4: Verify build + commit**

Run: `npm run build`
```bash
git add -A
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "docs: remove Stripe/billing references after de-bill"
```

---

# PART 2 — TEST NET (on remaining code)

## Task T1: Tooling & configuration

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`, `playwright.config.ts`, `tests/helpers/env.ts`, `.env.test.example`

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest@^3 @vitest/coverage-v8@^3 @playwright/test@^1.49
npx playwright install chromium
```

- [ ] **Step 2: Add scripts to `package.json`** (keep existing)

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
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
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
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry", screenshot: "only-on-failure" },
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 5: Create `tests/helpers/env.ts`** (Supabase-branch guard for auth integration)

```ts
import { describe } from "vitest";

const isCI = process.env.CI === "true" || process.env.CI === "1";

export const SUPABASE_URL = process.env.SUPABASE_TEST_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.SUPABASE_TEST_ANON_KEY ?? "";
export const SESSION_SECRET = process.env.SESSION_SECRET ?? "test-session-secret-please-change";

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function gate(label: string, ok: boolean): boolean {
  if (ok) return true;
  if (isCI) throw new Error(`[tests] ${label} credentials missing in CI — provision repo secrets.`);
  return false;
}

export const describeWithSupabase: typeof describe.skip = (gate("supabase", hasSupabase)
  ? describe
  : describe.skip) as typeof describe.skip;
```

- [ ] **Step 6: Create `.env.test.example`**

```bash
# Copy to .env.test (git-ignored). Unit tests need none of these.
# Auth integration tests skip locally if absent, fail in CI if absent.
SESSION_SECRET=at-least-sixteen-characters-long
SUPABASE_TEST_URL=https://<preview-branch-ref>.supabase.co
SUPABASE_TEST_ANON_KEY=eyJxxx
ADMIN_EMAIL=sage@sageideas.org
```

- [ ] **Step 7: Ignore `.env.test`, verify tooling boots, commit**

```bash
grep -q '.env.test' .gitignore || printf '\n.env.test\n' >> .gitignore
npx vitest run --reporter=dot   # "no test files" is OK
npm run typecheck
git add package.json package-lock.json vitest.config.ts playwright.config.ts tests/helpers .env.test.example .gitignore
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test: add vitest + playwright tooling and supabase guard"
```

---

## Task T2: Unit — `src/lib/passwords.ts`

**Files:** Test: `src/lib/passwords.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, randomToken, sha256Hex, passwordStrength } from "@/lib/passwords";

describe("passwords", () => {
  it("hashes and verifies a valid password roundtrip", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });
  it("rejects passwords too short or too long", async () => {
    await expect(hashPassword("short")).rejects.toThrow("password_too_short");
    await expect(hashPassword("x".repeat(201))).rejects.toThrow("password_too_long");
  });
  it("verifyPassword returns false on empty/garbage input", async () => {
    expect(await verifyPassword("", "")).toBe(false);
    expect(await verifyPassword("pw", "not-a-hash")).toBe(false);
  });
  it("randomToken returns unique hex of requested length", () => {
    const a = randomToken(32), b = randomToken(32);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toBe(b);
  });
  it("sha256Hex matches the known vector for 'abc'", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("passwordStrength gates correctly", () => {
    expect(passwordStrength("short").ok).toBe(false);
    const s = passwordStrength("Abcd1234efgh");
    expect(s.ok).toBe(true);
    expect(s.score).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run + commit**

```bash
npx vitest run src/lib/passwords.test.ts   # expect PASS
git add src/lib/passwords.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(passwords): hashing, tokens, sha256, strength"
```

---

## Task T3: Unit — `src/lib/auth.ts`

**Files:** Test: `src/lib/auth.test.ts`

- [ ] **Step 1: Write the test** (mock `next/headers` so the module import resolves in node)

```ts
import { describe, it, expect, beforeAll, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}));

beforeAll(() => { process.env.SESSION_SECRET = "test-session-secret-please-change"; });

const { signSessionToken, verifySessionToken } = await import("@/lib/auth");

describe("session tokens", () => {
  it("signs and verifies a token roundtrip (case-normalized email)", async () => {
    const token = await signSessionToken("Member@Example.com");
    expect(token).toContain(".");
    expect(await verifySessionToken(token)).toBe("member@example.com");
  });
  it("rejects a tampered signature", async () => {
    const token = await signSessionToken("a@b.com");
    expect(await verifySessionToken(`${token.split(".")[0]}.deadbeef`)).toBeNull();
  });
  it("rejects a tampered payload", async () => {
    const token = await signSessionToken("a@b.com");
    const sig = token.split(".")[1];
    const evil = Buffer.from(JSON.stringify({ email: "admin@b.com", exp: 9999999999 })).toString("base64url");
    expect(await verifySessionToken(`${evil}.${sig}`)).toBeNull();
  });
  it("rejects malformed tokens", async () => {
    expect(await verifySessionToken("nodot")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });
  it("rejects an expired token", async () => {
    const { createHmac } = await import("node:crypto");
    const payload = Buffer.from(JSON.stringify({ email: "a@b.com", exp: 1 })).toString("base64url");
    const sig = createHmac("sha256", process.env.SESSION_SECRET!).update(payload).digest("base64url");
    expect(await verifySessionToken(`${payload}.${sig}`)).toBeNull();
  });
  it("throws when SESSION_SECRET is missing/short", async () => {
    const prev = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "tooshort";
    await expect(signSessionToken("a@b.com")).rejects.toThrow("session_secret_missing");
    process.env.SESSION_SECRET = prev;
  });
});
```

- [ ] **Step 2: Run + commit**

```bash
npx vitest run src/lib/auth.test.ts   # expect PASS; if base64url encoding differs, mirror b64url semantics
git add src/lib/auth.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(auth): session token sign/verify/expiry/tamper"
```

---

## Task T4: Unit — `src/lib/cipher.ts`

**Files:** Test: `src/lib/cipher.test.ts`

- [ ] **Step 1: Write the test**

```ts
import { describe, it, expect } from "vitest";
import { encryptCaesar, decryptCaesar, currentShift, normaliseGuess, liveCiphertext, MONTHLY_SHIFTS, LIVE_PLAINTEXT } from "@/lib/cipher";

describe("cipher", () => {
  it("encrypt/decrypt roundtrips for any shift", () => {
    for (const s of [0, 1, 5, 13, 25, 26]) expect(decryptCaesar(encryptCaesar(LIVE_PLAINTEXT, s), s)).toBe(LIVE_PLAINTEXT);
  });
  it("shifts letters, preserves non-letters", () => {
    expect(encryptCaesar("abc XYZ!", 1)).toBe("bcd YZA!");
  });
  it("currentShift uses the month's configured shift (UTC)", () => {
    expect(currentShift(new Date("2026-01-15T00:00:00Z"))).toBe(MONTHLY_SHIFTS[0]);
    expect(currentShift(new Date("2026-12-15T00:00:00Z"))).toBe(MONTHLY_SHIFTS[11]);
  });
  it("normaliseGuess lowercases, trims, collapses whitespace", () => {
    expect(normaliseGuess("  The   ANSWER  ")).toBe("the answer");
  });
  it("liveCiphertext decrypts back to plaintext at current shift", () => {
    expect(decryptCaesar(liveCiphertext(), currentShift())).toBe(LIVE_PLAINTEXT);
  });
});
```

- [ ] **Step 2: Run + commit**

```bash
npx vitest run src/lib/cipher.test.ts   # expect PASS
git add src/lib/cipher.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(cipher): caesar roundtrip + monthly shift (de-risks Phase B vault puzzle)"
```

---

## Task T5: Integration — auth routes (Supabase-branch gated)

**Files:** Test: `tests/integration/auth-routes.test.ts`

- [ ] **Step 1: Write the test** (mock `next/headers` cookie store)

```ts
import { it, expect, beforeAll, vi } from "vitest";
import { describeWithSupabase, SUPABASE_URL, SUPABASE_ANON_KEY, SESSION_SECRET } from "../helpers/env";

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
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

describeWithSupabase("auth routes integration", () => {
  it("signup rejects invalid email (400)", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(jsonReq("/api/auth/signup", { email: "nope", password: "Abcd1234efgh" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid_email");
  });
  it("signup rejects weak password (400)", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const res = await POST(jsonReq("/api/auth/signup", { email: `s_${Date.now()}@example.com`, password: "short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("weak_password");
  });
  it("signup then login works; wrong password is 401", async () => {
    const email = `login_${Date.now()}@example.com`, password = "Abcd1234efgh";
    const signup = await import("@/app/api/auth/signup/route");
    expect((await signup.POST(jsonReq("/api/auth/signup", { email, password }))).status).toBe(200);
    const login = await import("@/app/api/auth/login/route");
    expect((await login.POST(jsonReq("/api/auth/login", { email, password }))).status).toBe(200);
    const bad = await login.POST(jsonReq("/api/auth/login", { email, password: "WrongPass123!" }));
    expect(bad.status).toBe(401);
  });
  it("forgot always returns ok (no existence disclosure)", async () => {
    const { POST } = await import("@/app/api/auth/forgot/route");
    const res = await POST(jsonReq("/api/auth/forgot", { email: `missing_${Date.now()}@example.com` }));
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
  });
  it("reset rejects malformed and unknown tokens (400)", async () => {
    const { POST } = await import("@/app/api/auth/reset/route");
    expect((await POST(jsonReq("/api/auth/reset", { token: "tooshort", password: "Abcd1234efgh" }))).status).toBe(400);
    const unknown = await POST(jsonReq("/api/auth/reset", { token: "a".repeat(64), password: "Abcd1234efgh" }));
    expect(unknown.status).toBe(400);
    expect((await unknown.json()).error).toBe("expired");
  });
});
```

- [ ] **Step 2: Run + commit**

```bash
node --env-file=.env.test ./node_modules/.bin/vitest run tests/integration/auth-routes.test.ts   # SKIPPED w/o creds; PASS w/ branch
git add tests/integration/auth-routes.test.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(auth-routes): signup/login/forgot/reset (gated on supabase branch)"
```

---

## Task T6: E2E — free content + smoke

**Files:** Test: `tests/e2e/free-content.spec.ts`, `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Identify a formerly-members-only post (read-only)**

Run: `grep -rl "members_only: true" src/content/posts | head -1` and read its `pillar` + `slug` frontmatter → URL `/{pillar}/{slug}`. Use as `FORMERLY_GATED_URL` below.

- [ ] **Step 2: Write `tests/e2e/free-content.spec.ts`** (replace the URL)

```ts
import { test, expect } from "@playwright/test";

const FORMERLY_GATED_URL = "/teach/<slug-from-step-1>";

test("a formerly members-only post now renders fully with no paywall", async ({ page }) => {
  await page.goto(FORMERLY_GATED_URL);
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText(/the rest of this is for members/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /become a member/i })).toHaveCount(0);
});

test("there is no /membership checkout page (redirects to account)", async ({ page }) => {
  const res = await page.goto("/membership");
  expect(page.url()).toContain("/account");
  expect(res?.status()).toBeLessThan(400);
});
```

- [ ] **Step 3: Write `tests/e2e/smoke.spec.ts`**

```ts
import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/archive", "/about", "/numbers"];

for (const route of ROUTES) {
  test(`${route} loads with a visible h1 and no console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(errors, `console errors on ${route}:\n${errors.join("\n")}`).toEqual([]);
  });
}
```

- [ ] **Step 4: Run + commit**

```bash
npx playwright test   # expect PASS; if a route logs a known third-party error (e.g. Cusdis unconfigured), narrow the filter and note inline
git add tests/e2e/free-content.spec.ts tests/e2e/smoke.spec.ts
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "test(e2e): posts are free + route smoke"
```

---

# PART 3 — CI + AUDIT

## Task C1: CI workflow

**Files:** Create: `.github/workflows/ci.yml`

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
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run test:unit

  integration:
    runs-on: ubuntu-latest
    needs: typecheck-and-unit
    env:
      CI: "true"
      SESSION_SECRET: ${{ secrets.SESSION_SECRET }}
      SUPABASE_TEST_URL: ${{ secrets.SUPABASE_TEST_URL }}
      SUPABASE_TEST_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
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
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "ci: typecheck + unit always, integration/e2e gated on secrets"
```

---

## Task A1: Audit report + final verification

**Files:** Create: `docs/audit/2026-06-05-systems-audit.md`

- [ ] **Step 1: Write the audit report**

```markdown
# Sage After Dark — Systems Audit + De-bill (2026-06-05)

## Audit baseline (before changes)
| Gate | Result |
|------|--------|
| Production build | PASS — all routes compile |
| TypeScript (tsc --noEmit) | PASS — 0 errors |
| ESLint | 218 errors / 6 warnings, ~89% cosmetic flat-config rule-drift |
| Tests | none existed |
| Lighthouse (last recorded) | 94–96 Perf / 100 SEO / 100 A11y |

Runtime bugs found: **none**. Auth/Stripe/password code was correct.

## Decision: site goes free
Stripe billing + the members-only paywall were removed; free accounts/login + newsletter kept.
Existing subscriptions cancelled in Stripe via `scripts/ops/cancel-all-subscriptions.mjs` (owner-run).

## De-bill summary
- Deleted: `lib/stripe.ts`, `components/paywall.tsx`, `/api/checkout`, `/api/portal`,
  `/api/stripe/webhook`, `/api/cron/refresh-numbers`, `/membership`, `/members`, the vercel cron.
- Edited: post page (gate removed), `/numbers` (money block removed), `/admin`(+members),
  `/account` (billing UI removed), `site-header` (member badge removed), `start` (CTA removed),
  `lib/supabase.ts` (billing RPCs removed), `lib/email.ts` (`memberWelcomeEmail` removed).
- Redirects: `/membership` + `/members` → `/account` (permanent).
- Kept: all auth, accounts, newsletter, and content.

## Test net added
- Unit: `auth`, `passwords`, `cipher`.
- Integration (Supabase-branch gated): auth routes signup/login/forgot/reset.
- E2E: formerly-gated post renders free; `/membership` redirects; route smoke.
- CI: typecheck + unit always; integration/e2e gated on provisioned secrets.

## Deferred (by decision)
- 193 cosmetic lint flags — resolved naturally when Phase B rebuilds components.
```

- [ ] **Step 2: Full verification sweep**

```bash
npm run typecheck && npm run test:unit && npm run build
grep -rn "@/lib/stripe\|memberStatus\|getPublicMetrics\|Paywall\|/api/portal\|/api/checkout\|members_only" src
```
Expected: first command all green; grep returns only the harmless `members_only` schema field definition (Task D1–D5 removed all gate usages).

- [ ] **Step 3: Commit**

```bash
git add docs/audit/2026-06-05-systems-audit.md
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "docs(audit): 2026-06-05 audit + de-bill record"
```

- [ ] **Step 4: Push (only on owner approval, AND after the owner has cancelled subscriptions in Stripe)**

```bash
git push -u origin phase-a/stabilize-test-net
```

---

## Self-Review

**Spec coverage:**
- Remove Stripe/paywall, keep accounts/newsletter → Tasks D1–D6. ✓
- Cancel existing subs → `scripts/ops/cancel-all-subscriptions.mjs` (owner-run), referenced in header + A1. ✓
- Test net on remaining code (auth, cipher, auth routes, free-content, smoke) → T2–T6. ✓
- Supabase-branch-gated integration; no Stripe test-mode (billing gone) → T1 `env.ts`, T5. ✓
- CI typecheck+unit always, gated integration/e2e → C1. ✓
- Audit report → A1. ✓
- Build/typecheck green after every de-bill task → verify step in D1,D2,D3,D5,D6. ✓

**Placeholder scan:** Test code is complete. De-bill steps name exact files + edit regions; the `build`/`typecheck`/`grep` gates catch any missed reference. E2E URLs resolved via Step-1 greps, not left vague.

**Type consistency:** `describeWithSupabase` defined in T1, used in T5. `next/headers` cookie mock shape consistent across T3/T5. Removed-symbol grep in D5/A1 uses the same names deleted in D1–D5 (`memberStatus`, `getPublicMetrics`, `Paywall`, `memberWelcomeEmail`).

**Ordering note:** D4 intentionally leaves typecheck red until D5; they commit together (D5 Step 6) so the tree never lands in a non-building committed state.
