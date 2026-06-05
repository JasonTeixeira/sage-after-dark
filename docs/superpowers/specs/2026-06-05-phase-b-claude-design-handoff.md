# Sage After Dark — Terminal AI Redesign · Claude Design Handoff

> **This is the master handoff. Paste the sections below into a Claude (claude.ai) design/artifact chat.** It supersedes the interaction model in the earlier `…-claude-design-brief.md` (brand tokens + guardrails there still apply). Design ONE surface at a time, in the listed order, and bring each artifact (React/TSX + CSS) back into the Claude Code session for integration.

---

## 0 · How to use this handoff

1. The repository is **public**: `https://github.com/JasonTeixeira/sage-after-dark`. Browse it for ground truth:
   - Content/voice: `src/content/posts/*.mdx`, `docs/00-OVERVIEW.md`, `docs/10-VOICE.md`, `docs/30-DESIGN-SYSTEM.md`
   - Existing terminal primitives to evolve (don't start cold): `src/components/terminal-palette.tsx`, `command-palette.tsx`, `decoder-ring.tsx`, `cipher.tsx`, `hero-broadcast.tsx`
   - Design tokens (source of truth): `src/lib/tokens.ts`
   - Cipher logic the puzzle wires to: `src/lib/cipher.ts`
2. Target stack: **Next.js 16 + React 19 + Tailwind v4**. Deliver self-contained React/TSX with Tailwind utility classes + small CSS/keyframes. No external UI or animation libraries.
3. Design each surface with all its states. Bring back: the component code, a note on states/assumptions, and a screenshot if possible.

---

## 1 · What we're building (the vision)

A **high-intelligence "Terminal AI"** that a visitor *interacts with by typing* — not a website with lots of panels and sections. The default state is a single, calm, exquisitely clean terminal. You type; an articulate AI responds; content materializes in place. A small, always-present context affordance tells newcomers exactly what to type to begin.

It should feel like sitting down at the private REPL of a very smart system — professional, confident, a little mysterious. Pretty, disciplined color on deep ink. Tasteful motion (a living cursor, text that types in, a soft glow), never busy or gimmicky.

Behind the calm surface is **a maze / puzzle / labyrinth** that guards a hidden "after dark" vault of deep-cut content. The public essays are always reachable by simple typed commands (and render as clean, crawlable HTML underneath for SEO + deep links). The *challenge* is the path into the vault.

**Tone of the AI:** mirror the publication's voice — terse, specific, dry wit, tactical, never corporate or bubbly. Read `docs/10-VOICE.md`. It is intelligent and a touch enigmatic; it guides without hand-holding; it drops cryptic breadcrumbs about what's hidden. It is NOT a cheerful chatbot.

---

## 2 · The interaction model (the heart of it)

**On load:** a clean terminal boots with a short, intelligent greeting and a single, unmissable hint for what to type. A blinking cursor. A small persistent **context strip** (or `?` affordance) that always shows the core commands so no one is lost.

**Core command grammar (design the responses + the help for these):**
- `help` / `?` — list what you can do (this is the newcomer's lifeline; make it elegant, not a wall of text).
- `ls` — list the essays as a clean, scannable index (title · pillar · read-time). Typing-in/materialize animation.
- `open <name>` (alias `read <name>`) — render that essay in a clean reading pane (see §4).
- `search <term>` — filtered results materializing in place.
- `pillars` — the 7 pillars as a navigable menu (build · signal · mind · world · taste · learning · teach).
- `about` / `whoami` — the AI introduces the publication / the author, in voice.
- `clear` — reset the screen.
- A hint that **something is hidden** — e.g. an unknown command yields a cryptic, intelligent deflection; a `?`-tier command (`decode`, `vault`, `cd …`) is teased but locked until discovered.

**Materialization:** when a command runs, the AI "thinks" briefly then content types/fades in (compositor-friendly). The screen is a scrolling transcript of the interaction — like a real terminal session — but always legible and beautiful.

**Accessibility / escape hatch:** a visitor who can't or won't type must still reach everything. Provide a visible, keyboard-first way to run commands without memorizing them (e.g. clickable command chips, an autocomplete menu, arrow-key history) AND assume the same content exists as plain crawlable HTML beneath the experience (engineering handles the SSR substrate — you design the clickable/keyboard affordances so it's not "type or leave").

---

## 3 · The maze + vault (the mystery)

- **Discovery:** through interaction — a cryptic AI response, a glyph, an `access denied`, a `decode` prompt — the curious realize there's a hidden layer.
- **The labyrinth:** a short, navigable journey — e.g. `cd` into a small set of "rooms"/paths where the AI poses intelligent riddles/breadcrumbs, culminating in the cipher gate. Keep it solvable and rewarding, not punishing. Design the room/transition treatment + the AI's guiding/taunting copy.
- **The cipher gate:** the centerpiece puzzle. A monthly **Caesar cipher** (already implemented in `cipher.ts`: `liveCiphertext()`, `currentShift()`, answer = `the answer was always postgres`). Include: the ciphertext displayed; an interactive **decoder ring** the user rotates (live-decoded preview); a progressive **3-step hint ladder**; an answer prompt; distinct fail (subtle, "try again") and success states.
- **The reveal:** on success, a dramatic decrypt/resolve animation (reduced-motion = instant) → the **vault** opens.
- **The vault interior:** an intimate "you're inside" treatment, distinct from the public terminal (more ember accent, a persistent `DECODED` status chip), listing the hidden "after dark" content — deep-cut essays, director's-cut annotations, lore.

---

## 4 · Reading (must stay clean)

When a visitor opens an essay, the prose renders **clean, calm, and highly readable** — 66ch measure, generous line height. Do NOT terminal-ify the body text. Apply terminal flavor only to the *chrome*: a `~ $ open <slug>` breadcrumb, a tactical byline strip, footnotes/margin-notes, a scroll/progress indicator, share affordances, and a clear way back to the prompt. This reading pane doubles as the crawlable HTML view. Show top-of-article + an in-body section.

---

## 5 · Brand tokens (use exactly)

```
Backgrounds:  ink-0 #05070A (page) · ink-1 #0A0E14 (surface) · ink-2 #11161E (elevated)
Borders:      rule #1C232E · rule-hi #2A3340
Text:         bone #E8E6E0 (primary) · mute #8A8F98 (secondary) · faint #4F5563 (tertiary)
Accents:      cyan #00E5FF (primary / cursor / CTAs) · ember #F59E0B (live / in-progress / vault)
Pillar hues:  build #00E5FF · signal #F59E0B · mind #A78BFA · world #34D399 · taste #F472B6 · learning #A3E635 · teach #EAB308
Fonts:        Geist Sans (reading/headings) · Geist Mono (terminal/labels/code)
Motion:       fast 120ms · base 200ms · slow 400ms · ease-out cubic-bezier(0.22,1,0.36,1) · ease-inout cubic-bezier(0.65,0,0.35,1)
Reading:      66ch measure · gutter clamp(1rem,4vw,3rem)
```
"Pretty colors": use the pillar hues as semantic accents (each pillar/essay carries its color), cyan as the primary interaction color, ember reserved for "live" and the vault. Disciplined — color earns its place; the base is deep, quiet ink.

---

## 6 · The content (ground the design in this)

7 pillars: **build** (engineering/tactical) · **signal** (status/dispatches) · **mind** (essays/thinking) · **world** (industry) · **taste** (art/craft) · **learning** · **teach** (tutorials). The voice is the moat — terse, specific, receipts over abstractions.

Real essays the terminal will list (title — pillar):
- Taste is the last moat — taste · Taste as a deploy gate — taste
- Latency is a worldview — build · The half-life of a good tool — build · Shipping a killable feature — build · The five-line spec — build
- Why we refuse to ship anything that can't be rolled back in 30 seconds — mind · The cost of being available — mind · The second-brain trap — mind · Annual: 2025 — mind
- The half-life of a skill — learning · Learning by shipping — learning
- The 30-second rollback rule — signal · Field notes (Jan–May) — signal
- The system I actually use — teach · How to ship a rollback in under 30 seconds — teach
- When to quit a tool — world · EP 01 · The decision to build in public — build (arc)

Use these real titles/pillars in `ls`, `search`, and listing mockups — not lorem ipsum.

---

## 7 · Guardrails (non-negotiable — protects SEO + a11y)

- **Crawlable substrate:** assume every essay also exists as server-rendered semantic HTML (bots, no-JS, deep links get full content). The terminal is the human layer ON TOP — design accordingly; never assume content only exists inside the typed flow.
- **No type-or-leave:** clickable command chips + keyboard menu so non-typers reach everything.
- **Motion:** animate only `transform`/`opacity`/`clip-path`/`filter`; zero layout shift; full `prefers-reduced-motion` variants (instant, no theater).
- **Keyboard + a11y:** focus management, visible focus rings, ESC to exit overlays, ARIA live-region for the AI responses, WCAG AA contrast on the dark palette.
- **Performance:** the experience is dynamically loaded; reading stays fast. No heavy deps.
- **Vault content is `noindex`** (bonus); public essays stay indexed.

---

## 8 · Surfaces to design (ONE at a time, in this order)

1. **Terminal shell + boot/greeting + persistent help affordance** — the core canvas. States: boot, idle prompt, mid-session transcript. Include the context strip / `?`.
2. **Command responses & essay index** — `help`, `ls`, `pillars`, `search` results materializing. Include the clickable command chips / autocomplete (the non-typer path).
3. **Reading pane** (`open <essay>`) — clean readable essay inside terminal chrome. Top + in-body.
4. **Labyrinth navigation** — the room/`cd` journey + the AI's cryptic guidance copy + transitions.
5. **Cipher gate** — ciphertext + interactive decoder ring + 3-hint ladder + answer prompt + fail/success.
6. **Vault reveal + interior** — decrypt animation + the "after dark" index with the `DECODED` treatment.
7. **Homepage framing** (if distinct from #1) — the very first impression: how the AI introduces itself and invites interaction.

## 9 · Bring back for each surface
- Self-contained React/TSX + CSS/keyframes.
- The AI's response/copy for that surface (in-voice).
- States included + assumptions.
- Screenshot if available.

In the Claude Code session I will: adapt each design into the Next.js codebase, wire the gate to the tested `cipher.ts`, build the crawlable SSR substrate beneath the terminal, enforce these guardrails, and ship it via the subagent-driven build flow.
