# Phase B — "Intrusion" Experience Spec (the master design)

> **Status:** Approved direction 2026-06-05. This is the full 100/100 vision; it extends & supersedes the interaction model in `2026-06-05-phase-b-terminal-vault-design.md` (that doc's tokens, vault, and SEO guardrails still hold). Validated by two working prototypes in `docs/mockups/` (terminal + cold-open).
> **Next:** writing-plans → subagent-driven build, on a `phase-b/intrusion` branch cut from the merged Phase A.

## 1 · Concept
Sage After Dark's front end is an **intrusion**: every visitor breaks into a system to reach the writing. A convincing decoy front, a hidden bypass, a wall that peels away, and **The Operator** — a character who lives in the backend and remembers you. The *way in rotates*, so every visit is a new hunt. The payoff is the blog: clean, gorgeous reading, plus a hidden "after dark" vault for those who go deeper.

The 100/100 bar = **visceral** (sound + craft), **replayable** (rotation + ARG + memory), **inclusive** (mobile + a11y + never-stuck), and **discoverable** (crawlable substrate → real SEO/readers). The hack is the signature and the vault key — never a wall on everything.

## 2 · Core principle: two layers
- **Crawlable substrate (for bots, no-JS, deep links, SEO):** every essay is a normal SSR route (`/[pillar]/[slug]`) rendering full semantic HTML — today's site, essentially untouched. This is the 100k-readers engine.
- **Intrusion layer (for humans with JS):** a dynamically-imported client experience mounted over the homepage/root. It never removes SSR content; it's pure progressive enhancement. Commands like `open <essay>` navigate to the real routes. There is always a quiet **"just read →"** exit to the plain site.

## 3 · The experience arc
1. **Decoy front** — a believable dead end (e.g. `403 ACCESS RESTRICTED`, fake login, "site parked", glitched page). A **honeypot** (obvious "leave"/"enter" button → fun fail). A **faint bypass seam** at the edge, with a "tell" that brightens after inactivity or a honeypot poke (never-stuck).
2. **Break-in** — the visitor triggers the bypass (this month's mechanic) → **glitch + peel** reveal (sound: thunk/whoosh).
3. **The Operator** — greets you in-voice; first visit asks your **handle** (stored); return visits greet you by name, count the intrusion, and rank you.
4. **Inside** — the backend terminal. Type to reach content: `help`, `ls`, `open <essay>` (→ real reading), `search`, `pillars`, `about`, `profile`, plus hidden commands. Clickable chips/keyboard for non-typers.
5. **Reading** — essays render clean and highly readable (66ch, terminal chrome only on the frame). This is also the crawlable view.
6. **The vault** — a deeper puzzle (cipher gate + decoder ring + hint ladder) unlocks the hidden "after dark" layer (deep cuts, annotations, lore); `noindex`.

## 4 · The rotation engine (replayability)
- A **deck of scenarios**; each = `{ decoyFront, bypassMechanic, operatorFraming }`.
- **Selection:** deterministic by month (tie to existing `cipher.ts` monthly shift) for the "season," with light per-visit variety so returning the same day still surprises. Deterministic so it's shareable ("did you find this month's way in?").
- **Season ARG:** each successful break-in drops a **story fragment**; a season completes only across multiple visits. Persistent in localStorage (+ optional account sync later).

## 5 · Break-in deck (build #1–3 first, rest fast-follow)
1. **Cipher gate** ✓ prototyped — decode the monthly Caesar phrase via decoder ring.
2. **Bypass seam** ✓ prototyped — find the hidden input on the decoy, type a trigger.
3. **Port-knock** — enter commands in a secret sequence; wrong order silently resets.
4. **Packet-sniffer** — a traffic stream scrolls; click the anomalous packet holding the key.
5. **Memory dump** — a wall of hex; one readable ASCII string buried in it.
6. **Trace-route maze** — `cd` through nodes; tripwires + doors (the labyrinth).
7. **Cross-content key** — the code is hinted *inside an essay* (reading = the cheat).
8. **Morse cursor** — the caret blinks a passphrase.
9. **Steganography** — key hidden in ASCII art; toggle a filter to reveal.
10. **Dead-man countdown** — get in before zero; resets each visit.
11. **Reverse shell** — chain commands to "gain root"; the system reacts.
12. **Social-engineer The Operator** — can't brute-force; must ask the right thing.

## 6 · The Operator (the soul)
- A persistent character (curated/scripted in v1, not a live LLM). Terse, dry, a little ominous-friendly; voice mirrors `docs/10-VOICE.md`.
- **Memory model (localStorage):** `handle`, `intrusions`, `rank` (script kiddie → operator → ghost), `season fragments`, `lastSeen`. Dialogue parameterized by these + **time-of-day** ("back at 3am again") + scenario.
- **Moods & events:** occasional lore drops, rare "events," reactions to fails/returns. Branching micro-dialogue, not a wall of text.

## 7 · Retention / profile
- `profile`: handle · intrusions · rank · season progress.
- Ranks/titles that climb with intrusions and puzzle variety solved.
- Monthly-resetting puzzle = built-in reason to return. (Optional later: a "wall of the broken-in.")

## 8 · Sound design (the biggest wow lever)
- WebAudio-synthesized (no heavy/licensed assets): keystroke ticks, modem-handshake on connect, **thunk + whoosh** on peel, ambient server-room hum (very low), glitch-zap on fail, warm tone on entry.
- **Autoplay-safe:** initializes on first user gesture. **Persistent mute** (default: prompt/soft-on, respect prior choice). Never essential to comprehension.

## 9 · Mobile / touch
- Typing-heavy break-ins must have **touch-native variants**: tap-sequence (port-knock), swipe/drag decoder dial (cipher), tap-the-anomalous-packet, draggable nodes (maze). Same fantasy, thumb-first. The terminal input uses the native keyboard with prominent command chips.

## 10 · Accessibility & "never stuck"
- Full `prefers-reduced-motion` paths (instant, no theater). Keyboard-playable everything; visible focus; ESC exits; ARIA live-region narrates Operator output.
- **Never-stuck discoverability:** the "tell" system (seam brightens on inactivity/honeypot), escalating hints, and the always-present **"just read →"** door to the plain crawlable site.
- WCAG AA contrast on the dark palette.

## 11 · SEO architecture (protects the 100k)
- Essays = SSR routes with full content, metadata, JSON-LD, sitemap, RSS — unchanged from today (already 100 SEO).
- Intrusion overlay is **client-only**; it never `display:none`s server content or blocks crawlers. Bots get clean HTML; humans get the experience.
- `open <essay>` performs real client navigation to the canonical route (shareable, indexable URLs).
- Vault content lives at `src/content/vault/` and is `noindex` (bonus, not the engine).

## 12 · Performance budget
- Intrusion layer dynamically imported; reading pages stay within landing JS < 150kb gz. Animate only compositor-friendly props; zero CLS. Synthesized audio (tiny). Lighthouse target: 95+ Perf, 100 SEO, 100 A11y.

## 13 · Tech architecture (Next.js 16)
- `src/components/intrusion/` — the client experience: `IntrusionRoot` (mounts overlay), `Decoy` (per-scenario), `BreakIn` mechanics (one module each), `Operator` (dialogue + memory), `Terminal` (command loop), `VaultGate`, `Vault`.
- `src/lib/intrusion/` — `scenarios.ts` (the deck + monthly selector), `operator.ts` (voice/memory), `sound.ts` (WebAudio), `progress.ts` (localStorage profile/ARG). Reuse tested `src/lib/cipher.ts`.
- Content via existing loader; vault via new `src/content/vault/`. Measure with existing privacy-first tracker (+ GA4 in Phase D).

## 14 · Build phases
- **v1 (productionize the demos + the levers):** one decoy + bypass + The Operator (handle/count/rank memory) + terminal command loop wired to **real essays** + cipher vault gate + vault + **sound** + reduced-motion/keyboard/SSR substrate + acceptable mobile. Ship-quality version of what's prototyped.
- **v2 (fast-follow):** rotation engine with 2–3 scenarios + 1–2 new break-in mechanics + ARG fragments + deeper Operator + touch-native mechanics.
- **v3:** full deck, season ARG, leaderboard, account sync.

## 15 · Sequencing & open items
- Built on top of Phase A (de-bill). **Prereq:** owner cancels Stripe subs → push/merge Phase A → branch `phase-b/intrusion` from there.
- Open: exact v1 decoy/mechanic choice; default sound on/off; how aggressive the monthly reset is. Resolve at plan time.
- Risk: scope. Mitigation: ship v1 (one great intrusion) before the rotation engine; the deck is fast-follow, not a v1 blocker.
