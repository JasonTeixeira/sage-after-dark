# Intrusion v1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Productionize the two working prototypes (`docs/mockups/terminal/` + `docs/mockups/intrusion/`) into the real Next.js site as a client "intrusion" experience layer — decoy front → bypass → The Operator (with memory) → terminal wired to real essays → cipher vault gate → vault — plus WebAudio sound, full a11y/reduced-motion/mobile, all over an untouched crawlable SSR substrate.

**Architecture:** `IntrusionRoot` is a **client-only** overlay mounted in `layout.tsx` after `{children}`. The SSR pages (homepage, essays) render full semantic HTML as today and stay in the DOM — crawlers, no-JS, and deep links get everything; the overlay is progressive enhancement for humans with JS. `open <essay>` does real client navigation to canonical routes. An always-present "just read →" door dismisses the overlay. Unlock/handle/intrusion state lives in localStorage. Sound is WebAudio-synthesized, muteable, autoplay-safe. Pure logic (progress/rank, scenario selector, operator memory) is unit-tested with Vitest; `cipher.ts` is already tested.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, TypeScript, Vitest, WebAudio, existing `src/lib/cipher.ts` + `src/lib/tokens.ts` + `src/content/loader.ts`.

**Branch:** `phase-b/intrusion` cut from `phase-a/stabilize-test-net`.

**Scope decisions resolved for v1:** single scenario (403 decoy + bypass seam, both prototyped); cipher gate guards the vault; sound defaults soft-on with persistent mute; the rotation engine + extra break-in mechanics are v2 (but `scenarios.ts` is structured to accept them). Source of truth for markup/CSS/interaction = the committed prototype files; tasks PORT them into React + Tailwind and wire to real data.

**Commit author:** `git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "..."`

---

## File structure
**Create:**
- `src/lib/intrusion/progress.ts` — localStorage profile (handle, intrusions, rank, ARG) + pure helpers.
- `src/lib/intrusion/scenarios.ts` — scenario deck + monthly selector (v1: one scenario).
- `src/lib/intrusion/operator.ts` — Operator dialogue lines parameterized by memory + time-of-day.
- `src/lib/intrusion/sound.ts` — WebAudio synth (keystroke, handshake, peel, hum, fail, enter) + mute.
- `src/lib/intrusion/*.test.ts` — unit tests for progress, scenarios, operator (pure parts).
- `src/components/intrusion/IntrusionRoot.tsx` — `"use client"` overlay controller + mount.
- `src/components/intrusion/Decoy.tsx` — the 403 decoy + honeypot + bypass seam (port of mockup).
- `src/components/intrusion/Operator.tsx` — typed dialogue + handle capture.
- `src/components/intrusion/Terminal.tsx` — command loop wired to the essay index.
- `src/components/intrusion/VaultGate.tsx` — cipher gate + decoder ring (port) wired to `cipher.ts`.
- `src/components/intrusion/Vault.tsx` — vault index (reads `src/content/vault/`).
- `src/components/intrusion/intrusion.css` (or Tailwind) — ported styles.
- `src/content/vault/*.mdx` — 3 seeded `noindex` deep cuts.
- `tests/e2e/intrusion.spec.ts` — Playwright: break-in flow + SSR-content-present assertion.
**Modify:**
- `src/app/layout.tsx` — mount `<IntrusionRoot essays={index} />` after `{children}`; pass a server-built lightweight essay index.
- `src/app/sitemap.ts` / robots — ensure `src/content/vault/` excluded (noindex).

---

## Task 1: Progress/profile lib + tests
**Files:** Create `src/lib/intrusion/progress.ts`, `src/lib/intrusion/progress.test.ts`

- [ ] **Step 1: Write failing tests**
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { rankOf, nextProfile, type Profile } from "@/lib/intrusion/progress";

describe("intrusion progress", () => {
  it("ranks by intrusion count", () => {
    expect(rankOf(0)).toBe("script kiddie");
    expect(rankOf(3)).toBe("operator");
    expect(rankOf(7)).toBe("ghost");
  });
  it("nextProfile increments intrusions and preserves handle", () => {
    const p: Profile = { handle: "neo", intrusions: 2, fragments: [], lastSeen: 0 };
    const n = nextProfile(p, 1000);
    expect(n.intrusions).toBe(3);
    expect(n.handle).toBe("neo");
    expect(n.lastSeen).toBe(1000);
    expect(p.intrusions).toBe(2); // immutable
  });
});
```
- [ ] **Step 2: Run → fail.** `npx vitest run src/lib/intrusion/progress.test.ts` → FAIL (module missing).
- [ ] **Step 3: Implement `progress.ts`** (pure helpers + a thin localStorage read/write; tests only touch the pure parts)
```ts
export type Profile = { handle: string; intrusions: number; fragments: string[]; lastSeen: number };
export type Rank = "script kiddie" | "operator" | "ghost";

export const rankOf = (n: number): Rank => (n >= 7 ? "ghost" : n >= 3 ? "operator" : "script kiddie");

export function nextProfile(p: Profile, now: number): Profile {
  return { ...p, intrusions: p.intrusions + 1, lastSeen: now };
}

const KEY = "sad:intrusion";
const EMPTY: Profile = { handle: "", intrusions: 0, fragments: [], lastSeen: 0 };

export function loadProfile(): Profile {
  if (typeof localStorage === "undefined") return EMPTY;
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return EMPTY; }
}
export function saveProfile(p: Profile): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(p));
}
export function forgetProfile(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(KEY);
}
```
- [ ] **Step 4: Run → pass.** `npx vitest run src/lib/intrusion/progress.test.ts` → PASS.
- [ ] **Step 5: Commit** `test(intrusion): progress profile + ranks`.

## Task 2: Scenario selector + tests
**Files:** Create `src/lib/intrusion/scenarios.ts`, `scenarios.test.ts`
- [ ] **Step 1: Failing test** — selecting a scenario for a given month is deterministic; v1 deck has ≥1 scenario; selection is stable for the same month.
```ts
import { describe, it, expect } from "vitest";
import { scenarioForMonth, SCENARIOS } from "@/lib/intrusion/scenarios";
describe("scenarios", () => {
  it("has at least one scenario", () => { expect(SCENARIOS.length).toBeGreaterThan(0); });
  it("is deterministic per month", () => {
    expect(scenarioForMonth(5).id).toBe(scenarioForMonth(5).id);
  });
});
```
- [ ] **Step 2-4:** Implement `scenarios.ts` (a `Scenario = { id, decoy: "403", bypass: "seam" }` deck with one entry; `scenarioForMonth(m) = SCENARIOS[m % SCENARIOS.length]`), run, pass.
- [ ] **Step 5: Commit** `feat(intrusion): scenario deck + monthly selector`.

## Task 3: Operator dialogue + tests
**Files:** Create `src/lib/intrusion/operator.ts`, `operator.test.ts`
- [ ] **Step 1: Failing test** — `firstVisitLines()` is non-empty and asks for a handle; `returnLines(profile, hour)` includes the handle and intrusion count; a 3am hour yields the late-night variant.
- [ ] **Step 2-4:** Implement (port the prototype's Operator copy from `docs/mockups/intrusion/app.js` into pure functions returning string[]; parameterize by handle/count/rank/hour). Keep voice from `docs/10-VOICE.md`. Run, pass.
- [ ] **Step 5: Commit** `feat(intrusion): operator voice + memory-parameterized lines`.

## Task 4: Sound engine
**Files:** Create `src/lib/intrusion/sound.ts`
- [ ] **Step 1: Implement** a WebAudio module: lazy `AudioContext` created on first user gesture; functions `key()`, `handshake()`, `peel()`, `hum(on)`, `fail()`, `enter()`; a `muted` flag persisted to `localStorage` (`sad:mute`); all no-op when muted or no context. Synthesize with oscillators/noise buffers (no asset files). Export `initOnGesture()` and `setMuted()`.
- [ ] **Step 2: Verify** `npx tsc --noEmit` exits 0. (Audio is hard to unit-test; covered by manual + e2e smoke.)
- [ ] **Step 3: Commit** `feat(intrusion): webaudio sound engine (muteable, autoplay-safe)`.

## Task 5: Port the Decoy (403 + honeypot + bypass seam)
**Files:** Create `src/components/intrusion/Decoy.tsx`, `intrusion.css`
- [ ] **Step 1:** Port the decoy markup + styles from `docs/mockups/intrusion/index.html` + `styles.css` into a React client component `Decoy({ onBypass })`. Keep: 403 layout, honeypot "return to safety" (shake + "the door is locked." + reveal the seam tell), the faint bypass seam with the input, the trigger word list, the "tell" after inactivity. Call `onBypass()` on a valid trigger. Use the design tokens (already in `src/lib/tokens.ts` / globals). Wire `sound.fail()` on bad trigger, `sound.key()` on keystroke.
- [ ] **Step 2:** `npx tsc --noEmit` + `npm run build` green.
- [ ] **Step 3: Commit** `feat(intrusion): decoy front + bypass seam component`.

## Task 6: Peel transition + IntrusionRoot shell + crawlable mount
**Files:** Create `src/components/intrusion/IntrusionRoot.tsx`; Modify `src/app/layout.tsx`
- [ ] **Step 1:** `IntrusionRoot({ essays })` `"use client"`: renders a `position:fixed` overlay (`z-index` above content) containing `<Decoy>` initially. State machine: `decoy → (bypass) → peel → operator → terminal`. On bypass: play `sound.peel()`, run the glitch+peel CSS (reduced-motion = instant), then mount `<Operator>`. Returning unlocked users (profile.intrusions>0 AND a session flag) may skip straight to terminal. Include the persistent **"just read →"** button that hides the whole overlay (sets a session flag) revealing the SSR page beneath.
- [ ] **Step 2:** In `layout.tsx`, build a lightweight essay index server-side: `const essays = (await getAllPosts()).map(p => ({ slug:p.frontmatter.slug, title:p.frontmatter.title, pillar:p.frontmatter.pillar, mins:p.reading_minutes, dek:p.frontmatter.dek ?? "" }))` and render `<IntrusionRoot essays={essays} />` AFTER `<div id="main">{children}</div>`. CRITICAL: do not gate or `display:none` `{children}` server-side — the overlay is client-only so crawlers keep the content.
- [ ] **Step 3:** `npm run build` green; confirm essay routes still SSR (the overlay must not be in the server HTML in a way that hides content — verify `view-source` of `/` still contains essay text). 
- [ ] **Step 4: Commit** `feat(intrusion): root overlay + peel + crawlable mount + just-read door`.

## Task 7: The Operator component (typed dialogue + handle capture)
**Files:** Create `src/components/intrusion/Operator.tsx`
- [ ] **Step 1:** Port the Operator typing sequence from the prototype into React: types lines via a typewriter (reduced-motion = instant; renders markup after typing — mirror the `op()` fix in the prototype). First visit: capture handle → `saveProfile`. Return visit: greet via `operator.returnLines(profile, new Date().getHours())`. Increment intrusions via `nextProfile`. Play `sound.handshake()` on connect, `sound.enter()` after handle. On complete, call `onEnter(handle)`.
- [ ] **Step 2:** tsc + build green.
- [ ] **Step 3: Commit** `feat(intrusion): operator dialogue + handle/memory`.

## Task 8: Terminal command loop wired to real essays
**Files:** Create `src/components/intrusion/Terminal.tsx`
- [ ] **Step 1:** Port the terminal from `docs/mockups/terminal/app.js` into React, but data-driven from the `essays` prop. Commands: `help`, `ls` (real index; click/Enter → `router.push('/'+pillar+'/'+slug)` real navigation), `open <name>`/`read` (fuzzy match → navigate), `search`, `pillars`, `about`, `profile` (handle/intrusions/rank), `clear`, `forget`, `exit`, and `decode`/`vault` → open `<VaultGate>`. History (↑↓), tab-complete, chips for non-typers, ESC handling. Keystroke `sound.key()`.
- [ ] **Step 2:** tsc + build green; manual: `ls` then click an essay navigates to the real SSR route.
- [ ] **Step 3: Commit** `feat(intrusion): terminal command loop on real essay index`.

## Task 9: Vault gate (cipher) wired to cipher.ts
**Files:** Create `src/components/intrusion/VaultGate.tsx`
- [ ] **Step 1:** Port the cipher gate (ciphertext, decoder-ring `<input range>`, live decode, 3-hint ladder, fail shake, success) into React, importing `encryptCaesar`/`decryptCaesar`/`currentShift`/`normaliseGuess`/`LIVE_PLAINTEXT` from `@/lib/cipher` (NO new cipher logic). On solve: `sound.enter()`, set unlocked in profile, open `<Vault>`. Fail: `sound.fail()` + shake.
- [ ] **Step 2:** tsc + build green; manual: ring to this month's key turns the line green → unlock works.
- [ ] **Step 3: Commit** `feat(intrusion): cipher vault gate on tested cipher.ts`.

## Task 10: Vault content + Vault component (noindex)
**Files:** Create `src/components/intrusion/Vault.tsx`, `src/content/vault/*.mdx` (3 seed pieces); Modify sitemap/robots
- [ ] **Step 1:** Add 3 seed `noindex` MDX deep cuts under `src/content/vault/` (repurpose `_drafts/` material; clearly mark as after-dark). Render `<Vault>` (decrypt-scramble reveal → list → click reads). Ensure these are NOT in `sitemap.ts` and are excluded from the public loader/index (separate path).
- [ ] **Step 2:** tsc + build green; confirm `/sitemap.xml` does not list vault items.
- [ ] **Step 3: Commit** `feat(intrusion): seeded after-dark vault (noindex)`.

## Task 11: A11y, reduced-motion, mobile, sound mute UI
**Files:** Modify intrusion components
- [ ] **Step 1:** Add: full `prefers-reduced-motion` instant paths; keyboard nav + visible focus + ESC everywhere; ARIA live-region narrating Operator/AI output; a visible **mute** toggle (persisted); mobile command chips always visible + decoder ring usable by drag/touch; ensure no horizontal overflow at 320/375/768.
- [ ] **Step 2:** tsc + build green.
- [ ] **Step 3: Commit** `feat(intrusion): a11y, reduced-motion, mobile, mute`.

## Task 12: E2E smoke + SEO-substrate assertion
**Files:** Create `tests/e2e/intrusion.spec.ts`
- [ ] **Step 1:** Playwright: (a) the homepage SSR HTML contains real essay text even with the overlay (fetch `/` and assert content present, simulating no-JS/crawler); (b) with JS, the decoy shows, the bypass reveals input, a valid trigger peels to the Operator; (c) "just read →" dismisses the overlay; (d) no console errors on `/` and one essay route.
- [ ] **Step 2:** `npx playwright test tests/e2e/intrusion.spec.ts` (install chromium if needed) → pass.
- [ ] **Step 3: Commit** `test(e2e): intrusion break-in + crawlable substrate`.

## Task 13: Full verification + Lighthouse check
- [ ] **Step 1:** `npm run typecheck && npm run test:unit && npm run build` all green.
- [ ] **Step 2:** Run Lighthouse (or note target) on `/` and an essay route; record Perf/SEO/A11y. Target 95+/100/100. File any regressions as follow-ups (do not block v1 on Perf if ≥90, but SEO + A11y must be 100).
- [ ] **Step 3: Commit** `chore(intrusion): v1 verification record`.

---

## Self-Review
**Spec coverage:** decoy+bypass (T5), peel+crawlable mount+just-read (T6), Operator+memory (T3,T7), terminal on real essays (T8), cipher vault (T9), vault noindex (T10), sound (T4), a11y/reduced-motion/mobile (T11), SEO substrate + e2e (T6,T12), scenario engine seed for v2 (T2). ✓
**Placeholder scan:** lib tasks carry real code; UI tasks port the committed prototype files (concrete in-repo source) with explicit adaptation + wiring instructions + build/tsc/e2e gates. No TBD steps.
**Type consistency:** `Profile`/`rankOf`/`nextProfile` (T1) used in T7/T8; `scenarioForMonth` (T2); cipher imports match `src/lib/cipher.ts` exports; essay index shape `{slug,title,pillar,mins,dek}` defined in T6 and consumed in T8.
**Deferred to v2:** rotation engine with multiple scenarios, extra break-in mechanics (port-knock/packet-sniffer/etc.), ARG fragments, leaderboard, account sync.
