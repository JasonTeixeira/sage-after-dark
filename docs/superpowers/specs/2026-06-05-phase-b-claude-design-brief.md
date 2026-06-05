# Phase B — Claude Design Brief (paste this into Claude / claude.ai design)

> **How to use:** Paste the "BRIEF" block below into a Claude design/artifact chat. Ask for ONE surface at a time (they're listed in priority order). Bring the generated artifacts back into the Claude Code session for integration. Build with React + Tailwind utility classes (the target repo is Next.js 16 + React 19 + Tailwind v4) so the code drops in with minimal rework. Self-contained components, no external UI libraries.

---

## BRIEF

You are designing surfaces for **Sage After Dark**, a tactical-editorial publication being redesigned into an **interactive "modern terminal"** experience. The site is fully free. Reading must stay clean, fast, and accessible; the "terminal theater" (boot, command palette, decode, vault reveal) is where the drama lives.

**Aesthetic:** Hybrid — clean readable essays + cinematic terminal moments. Modern dev-terminal feel (think a beautiful Warp/VS Code terminal), NOT a cheesy green-CRT unless used as a deliberate accent in the puzzle moment. Mysterious, intentional, "a certified developer built this." Dark, with disciplined color and real depth (layering, subtle motion).

**Brand tokens (use these exactly):**
```
Backgrounds:  ink-0 #05070A (page) · ink-1 #0A0E14 (surface) · ink-2 #11161E (elevated)
Borders:      rule #1C232E · rule-hi #2A3340
Text:         bone #E8E6E0 (primary) · mute #8A8F98 (secondary) · faint #4F5563 (tertiary)
Accents:      cyan #00E5FF (primary/CTAs/cursor) · ember #F59E0B (live/in-progress only)
Pillar hues:  build #00E5FF · signal #F59E0B · mind #A78BFA · world #34D399 · taste #F472B6 · learning #A3E635 · teach #EAB308
Fonts:        Geist Sans (UI/headings) · Geist Mono (terminal/labels/code)
Motion:       fast 120ms · base 200ms · slow 400ms · ease-out cubic-bezier(0.22,1,0.36,1) · ease-inout cubic-bezier(0.65,0,0.35,1)
Reading measure: 66ch max · gutter clamp(1rem,4vw,3rem)
```

**Hard constraints (every surface must respect):**
- Animate only `transform`/`opacity`/`clip-path`/`filter`. Never animate layout props. No layout shift.
- Honor `prefers-reduced-motion: reduce` — provide the static/instant variant.
- Full keyboard accessibility: focus management, visible focus rings, ESC to close overlays, ARIA where needed.
- WCAG AA contrast on the dark palette.
- Mobile-first; no horizontal overflow at 320/375/768/1024/1440.
- Self-contained React + Tailwind classes; no external UI/animation libraries (CSS + small bits of JS only; if motion needs JS, keep it vanilla/rAF).

**Surfaces to design (ask for ONE at a time, in this order):**

1. **Boot sequence** — a short (≈1.5–2.5s), SKIPPABLE cinematic intro shown on first homepage visit. Terminal boot vibe (status lines typing in, a cursor, a glitch/scanline flourish, then it dissolves to reveal the homepage). Must have: a visible "skip" affordance, reduced-motion = instant skip, and it must NOT hide content from crawlers (assume content is already in the DOM beneath it). Deliver the component + the reduced-motion variant.

2. **Terminal command spine (command palette)** — the site's nav identity. Opens on `⌘K` / `~`. A modern command bar: type to fuzzy-jump to essays, pillars, search; show recent/suggested commands; a blinking cursor; keyboard nav (↑↓ + Enter, ESC to close). Resting state: a subtle persistent hint (e.g. a small `~ $` chip). Deliver open + closed states.

3. **Reading surface polish** — the essay page. Body text stays CLEAN and highly readable (66ch measure, generous line height) — do NOT terminal-ify the prose. Apply terminal flavor to the CHROME only: header/byline as a tactical strip, a `~ $ open <slug>` breadcrumb, footnotes/margin-notes, a progress/scroll indicator, share affordances. Show the top-of-article + an in-body section.

4. **Vault gate (the puzzle)** — the centerpiece. A terminal modal/room where the reader cracks a monthly Caesar cipher. Must include: the ciphertext displayed prominently; an interactive DECODER RING the user can rotate (shows the shifted alphabet / live-decoded preview); a progressive HINT ladder (3 hints, increasingly explicit); an answer input with a `~ $` prompt; distinct FAIL (subtle shake/red-ish, try again) and SUCCESS states; and an entry point/teaser that hints the vault exists. Deliver the gate with its locked, hint-revealed, fail, and success states.

5. **Vault reveal + index** — what unlocks after a correct answer. A dramatic reveal (decrypt/glitch-resolve, reduced-motion = instant), then the "after dark" index: a listing of hidden deep-cut essays / annotations / lore with a distinct "you're inside" treatment (different from the public site — more intimate, more ember accent, a persistent "DECODED" status chip). Deliver the reveal animation + the index listing.

6. **Homepage hero (terminal-flavored)** — the landing after boot. A strong hero that announces the publication with terminal identity (prompt, monospace tactical labels, the latest essays as a `ls`-style listing), the cyan accent, real hierarchy and depth. Newsletter signup present (the growth mechanism). Must look believable in a real product screenshot.

**What to bring back to the Claude Code session for each surface:**
- The self-contained React component code (TSX) + any CSS/keyframes.
- A note on the states included and any assumptions.
- (Optional) a screenshot/preview of the artifact.

I'll adapt each returned design into the Next.js codebase, wire it to the real content + the existing tested `cipher.ts` (monthly Caesar shift, answer `the answer was always postgres`), and enforce the SSR/SEO/perf guardrails.

---

## Notes for integration (for the Claude Code session, not for the design tool)
- `cipher.ts` already exports `encryptCaesar`, `decryptCaesar`, `currentShift(now)`, `normaliseGuess`, `liveCiphertext()`, `LIVE_PLAINTEXT` ("the answer was always postgres"), `MONTHLY_SHIFTS`. The DecoderRing should be wired to these — no new cipher logic needed.
- Existing components to fold designs into / replace: `TerminalPalette`, `CommandPalette`, `DecoderRing`, `Cipher`, `HeroBroadcast`.
- Unlock persistence: localStorage key `sad:vault`; SSR renders locked, client reveals if unlocked.
- Vault content path: `src/content/vault/` (new), rendered `noindex`.
