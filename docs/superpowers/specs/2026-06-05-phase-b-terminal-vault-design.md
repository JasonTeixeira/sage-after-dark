# Phase B — The Terminal Vault (Design Spec)

> **Status:** Approved 2026-06-05. Workflow twist: the owner will produce the *visual* design in Claude (claude.ai design/artifacts) using the companion brief, then bring the artifacts back here for integration. Implementation plan (writing-plans) is authored AFTER the visual designs return.
> **Branch:** continues from `phase-a/stabilize-test-net` (Phase A complete). A `phase-b/terminal-vault` branch will be cut when build starts.
> **Companion brief:** `docs/superpowers/specs/2026-06-05-phase-b-claude-design-brief.md`

## Goal
Redesign the front end of the (now free) publication into an interactive "modern terminal" experience with a cipher puzzle that unlocks a hidden "after dark" content vault — WITHOUT sacrificing the near-perfect SEO/performance that the 100k-readers/month goal depends on.

## Resolved decisions
| Decision | Choice |
|----------|--------|
| Interface model | **Terminal as an enhancement LAYER over a fast, crawlable site.** Content is server-rendered in the initial HTML; the terminal/boot/vault are progressive-enhancement on top. |
| The vault payoff | **Hidden "after dark" content layer** — deep-cut essays, director's-cut annotations, lore. Seeded with 3–5 pieces at launch (repurpose `_drafts/` + annotations). Intentionally `noindex` (bonus, not the traffic engine). |
| Aesthetic | **Hybrid:** essays render clean/fast/readable; the cinematic terminal/CRT/glitch theater is concentrated in the interactive moments (boot, command palette, decode, vault reveal). |
| Puzzle difficulty | Medium with generous hints (DecoderRing assist). |
| Unlock persistence | localStorage-only (no account required). |
| SEO posture | All posts in initial HTML; enhancement never blocks/hides indexed content; vault is `noindex`. |

## The experience arc
1. **Boot** — first visit plays a short, skippable cinematic boot sequence on the homepage. Content is already in the DOM behind it (SEO-safe). Honors `prefers-reduced-motion` (skips to content). Persists "seen" in localStorage so returning visitors skip it.
2. **Browse** — site reads as a refined modern terminal; essays stay clean. A persistent command spine (`⌘K` / `~`) is the nav identity — jump to essays, pillars, search. Upgrades existing `CommandPalette`/`TerminalPalette`.
3. **The hook** — subtle breadcrumbs hint at a hidden layer: a glyph in the footer, a ciphertext fragment on 404/colophon, a prompt that responds to the curious.
4. **Crack it** — an interactive terminal presents the month's cipher (`cipher.ts` rotates a monthly Caesar shift; `liveCiphertext()` / `LIVE_PLAINTEXT`). A `DecoderRing` aid + progressive hints let the reader decode and submit the answer (`normaliseGuess` vs `LIVE_PLAINTEXT`).
5. **Vault** — correct answer → reveal animation → hidden "after dark" section unlocks (deep-cut essays, annotations, lore). Unlock persists in localStorage.

## Architecture (progressive enhancement)
- **Server (crawlable, no-JS-safe):** all pages and posts render full semantic HTML server-side exactly as today. The vault index + vault content render server-side too but are marked `noindex` and visually gated client-side.
- **Client enhancement (lazy-loaded):** `BootSequence`, terminal command spine, `VaultGate` (puzzle), unlock state, reveal/boot animations. None of this is required to read any public post.
- **Unlock state:** a small client store (`useVaultUnlock`) backed by localStorage key (e.g. `sad:vault`); SSR renders the locked state; client hydrates and reveals if unlocked. `suppressHydrationWarning` where the boot/unlock state legitimately differs SSR vs client (per repo gotcha).

## Components
**Reuse:** `cipher.ts` (tested ✓), `TerminalPalette`, `CommandPalette`, `DecoderRing`, `Konami`, design tokens (`tokens.ts`), `NotchedCard`, typography primitives.
**Build new:**
- `BootSequence` — skippable cinematic intro (reduced-motion + first-visit aware).
- Terminal command spine — upgrade of the palette into the site's nav identity.
- `VaultGate` — the puzzle UI (ciphertext display, DecoderRing assist, hint ladder, answer input, fail/success states).
- `useVaultUnlock` — localStorage-backed unlock hook.
- `VaultIndex` + vault content rendering — the hidden "after dark" listing + reveal.
- Reading-surface polish — terminal-flavored chrome around the (unchanged, clean) essay body.

## v1 scope
**In:** boot, terminal command spine, puzzle + vault reveal, seeded hidden content (3–5), reading polish, guardrails.
**Deferred (fast-follow):** archive-as-filesystem browser, multi-step ARG puzzle chains, at-scale per-post annotation system, badges/sound.

## Guardrails (non-negotiable)
- All post content server-rendered in initial HTML; enhancement never blocks/hides indexed content.
- `prefers-reduced-motion` respected everywhere (boot + animations skip).
- Fully keyboard-accessible; focus management on the terminal/gate; visible focus rings.
- Zero CLS from the boot sequence; reserve layout, animate compositor-friendly props only (`transform`/`opacity`/`clip-path`).
- Heavy terminal JS dynamically imported; reading pages stay within the existing perf budget (landing JS < 150kb gz).
- Vault content `noindex`; public content stays indexed with current SEO intact.
- WCAG AA contrast maintained against the dark palette.

## Content seeding (so the vault isn't empty)
Repurpose existing material as the initial 3–5 vault items: relevant `_drafts/` pieces, plus director's-cut annotations on 2–3 published essays, plus a short "lore" page. Owner adds more over time. Vault MDX lives in a separate, unlisted content path (e.g. `src/content/vault/`) with `noindex`.

## Workflow / handoff
1. Owner takes `docs/superpowers/specs/2026-06-05-phase-b-claude-design-brief.md` to Claude (claude.ai design/artifacts) and produces visual designs for the key surfaces.
2. Owner brings the artifacts (component code / mockups) back into this session.
3. We then run writing-plans → subagent-driven build, adapting the returned designs into the Next.js 16 + Tailwind v4 codebase and wiring them to real content + `cipher.ts`.

## Out of scope for Phase B
SEO/content growth push (Phase C/own cycle), Google Analytics (Phase D), engagement extras beyond the vault (Phase E).
