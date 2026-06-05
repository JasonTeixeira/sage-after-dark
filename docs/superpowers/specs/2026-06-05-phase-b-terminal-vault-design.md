# Phase B — The Terminal Vault (Design Spec)

> **Status:** Approved 2026-06-05. Workflow twist: the owner will produce the *visual* design in Claude (claude.ai design/artifacts) using the companion brief, then bring the artifacts back here for integration. Implementation plan (writing-plans) is authored AFTER the visual designs return.
> **Branch:** continues from `phase-a/stabilize-test-net` (Phase A complete). A `phase-b/terminal-vault` branch will be cut when build starts.
> **Companion brief:** `docs/superpowers/specs/2026-06-05-phase-b-claude-design-brief.md`

## Goal
Redesign the front end of the (now free) publication into an interactive "modern terminal" experience with a cipher puzzle that unlocks a hidden "after dark" content vault — WITHOUT sacrificing the near-perfect SEO/performance that the 100k-readers/month goal depends on.

## Resolved decisions
| Decision | Choice |
|----------|--------|
| Interface model (EVOLVED 2026-06-05) | **Terminal-FIRST experience for humans, crawlable substrate underneath.** The primary surface is a clean, high-intelligence "Terminal AI" you interact with by typing — commands run, the AI responds in-voice, content materializes in place. Every essay ALSO renders as server-side semantic HTML (bots/no-JS/deep links). Not a multi-panel website — one calm, professional terminal. |
| Maze depth | **Maze guards the vault only.** Public essays are reachable by simple typed commands (`ls`/`open`/`search`) + clickable command chips (no "type-or-leave"), and are crawlable → SEO/100k intact. The maze + puzzle + labyrinth gate the hidden vault. |
| AI persona | Articulate, terse, dry-witted, a touch enigmatic — mirrors `docs/10-VOICE.md`. Drops cryptic breadcrumbs about the hidden layer. Curated/scripted responses that feel intelligent (not a live LLM in v1). A `help`/`?` affordance always tells newcomers what to type. |
| The vault payoff | **Hidden "after dark" content layer** — deep-cut essays, director's-cut annotations, lore. Seeded with 3–5 pieces at launch (repurpose `_drafts/` + annotations). Intentionally `noindex` (bonus, not the traffic engine). |
| Aesthetic | **Hybrid:** essays render clean/fast/readable; the cinematic terminal/CRT/glitch theater is concentrated in the interactive moments (boot, command palette, decode, vault reveal). |
| Puzzle difficulty | Medium with generous hints (DecoderRing assist). |
| Unlock persistence | localStorage-only (no account required). |
| SEO posture | All posts in initial HTML; enhancement never blocks/hides indexed content; vault is `noindex`. |

## The experience arc (terminal-first)
1. **Arrive** — a clean terminal boots with a short, in-voice greeting from the AI and an unmissable hint for what to type. A living cursor; a persistent `help`/`?` context affordance so no one is lost. Calm, professional, one focused surface (not a panel-heavy site).
2. **Interact** — the visitor types; the AI "thinks" then responds in-voice and content materializes in the scrolling transcript. Core grammar: `help`/`?`, `ls`, `open <name>`/`read`, `search`, `pillars`, `about`/`whoami`, `clear`. Clickable command chips + arrow-key history + autocomplete give non-typers the same reach (no "type-or-leave").
3. **Read** — `open <essay>` renders the essay clean and highly readable (66ch, terminal chrome only around it). This pane is also the crawlable SSR view.
4. **Sense the mystery** — unknown commands and cryptic AI deflections hint at a hidden layer; `decode`/`vault`/`cd` are teased but locked.
5. **The labyrinth** — the curious navigate a short maze (rooms/`cd`, riddles, breadcrumbs) to the cipher gate. Solvable and rewarding, not punishing.
6. **Crack it** — the month's Caesar cipher (`cipher.ts`: `liveCiphertext()`/`currentShift()`, answer `the answer was always postgres`) with a `DecoderRing` aid + 3-hint ladder + fail/success states.
7. **Vault** — correct answer → decrypt/reveal animation → the hidden "after dark" vault opens (deep cuts, annotations, lore), with a `DECODED` treatment. Unlock persists in localStorage; vault content is `noindex`.

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
