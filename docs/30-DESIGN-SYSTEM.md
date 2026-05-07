# 30 · Design System — colors, type, components

The design system is the brand. Don't invent components ad-hoc. Use what exists.

## Where things live

```
src/lib/tokens.ts             # The source of truth for color, motion, spacing
src/app/globals.css           # @theme bridge: tokens → Tailwind
src/components/index.ts       # Single import surface: every primitive
src/content/mdx-components.tsx  # Mapping: MDX tag → React component
```

Import everything from the barrel:

```tsx
import { NotchedCard, PullQuote, Sidenote, FieldCard, Diagnostic } from "@/components";
```

(Exception: `SiteHeader` — it depends on `next/headers` and is server-only. Import directly: `import { SiteHeader } from "@/components/site-header"`.)

## Colors

All colors come from `src/lib/tokens.ts`. Tailwind classes mirror the token names.

### Backgrounds — the ink scale

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| ink.0 | `#05070A` | `bg-ink-0` | Page background. Almost-black. The dominant surface. |
| ink.1 | `#0A0E14` | `bg-ink-1` | Cards, elevated surfaces. |
| ink.2 | `#11161E` | `bg-ink-2` | Highest elevation: modals, popovers, terminal frames. |

### Text

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| text.bone | `#E8E6E0` | `text-bone` | Primary body text. ~16:1 contrast on `bg-ink-0`. |
| text.mute | `#8A8F98` | `text-mute` | Secondary: deks, captions, meta. |
| text.faint | `#4F5563` | `text-faint` | Tertiary: timestamps, decorative ticks. ⚠️ Below WCAG AA on body — use only on display elements. |

### Borders

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| rule.base | `#1C232E` | `border-rule` | Default borders. Cards, dividers. |
| rule.hi | `#2A3340` | `border-rule-hi` | Hover/active borders. Slightly brighter. |

### Accents

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| accent.cyan | `#00E5FF` | `text-cyan` / `bg-cyan` | Global accent. CTAs, links on hover, cursor, drop caps. |
| accent.ember | `#F59E0B` | `text-ember` | Live status. "In progress." Status dots. |

### Pillar colors

Used **only** as 1px borders, tag chips, and the reading-progress bar. Never fill, never large blocks.

| Pillar | Hex | Tailwind | Used in |
|---|---|---|---|
| build | `#00E5FF` | `text-pillar-build` | Engineering, infrastructure, tooling |
| signal | `#F59E0B` | `text-pillar-signal` | Dispatches, status, retros |
| mind | `#A78BFA` | `text-pillar-mind` | Psychology, philosophy, attention |
| world | `#34D399` | `text-pillar-world` | Industry, market, ecosystem |
| taste | `#F472B6` | `text-pillar-taste` | Aesthetics, art, music, films |
| learning | `#A3E635` | `text-pillar-learning` | Meta-learning, half-lives |
| teach | `#EAB308` | `text-pillar-teach` | Tutorials, how-tos |

To get the right color for a pillar at runtime, use `pillar` from `@/lib/tokens` or the `<PillarTag pillar="build" />` component.

## Type

Two families. Editorial display switched to Geist Mono in P20 — the modern terminal mood.

| Family | Use | Tailwind |
|---|---|---|
| **Geist Sans** | Body text, navigation, UI labels | default |
| **Geist Mono** | All editorial display: H1, H2, drop caps, deks, terminal text, timestamps, tactical strips | `font-mono` |

### Type scale (for editorial)

| Element | Class | Notes |
|---|---|---|
| Display | `<Display>` | 64px+ display H1 — use only once per essay. |
| EditorialDisplay | `<EditorialDisplay>` | The signature display style. Mono. |
| H1 | `<H1>` | Post titles. ~48px desktop, fluid down. |
| H2 | `<H2>` | Section headers. ~32px desktop. |
| H3 | `<H3>` | Subsections. ~24px desktop. |
| Body | `<Body>` | Default reading body. 18px. |
| Lead | `<Lead>` | Slightly larger lead-in paragraph. 20px. |
| Caption | `<Caption>` | Timestamp, attribution, footnote-y. |
| Tactical | `<Tactical>` | Uppercase mono labels. `// ESSAY`, `2026-05-07`, `13 MIN`. |
| Mono | `<Mono>` | Inline `code`-like text in body. |

### Reading column

The body of every essay is constrained to ~66ch (`max-w-[66ch]`) — the proven reading-comfort target. Anything wider than that is uncomfortable; anything narrower is choppy.

## Component reference (essay-relevant)

These are the components an editorial agent will reach for most. Full list in `src/components/index.ts`.

### Editorial primitives

| Component | Purpose | Usage |
|---|---|---|
| `<DropCap letter="T">` | Inline drop cap for first paragraph of an essay. | One per essay. |
| `<Sidenote n="1">…</Sidenote>` | Inline aside that expands. | The default aside. Use freely (max 5 per post). |
| `<MarginNote number={1}>…</MarginNote>` | Floating margin note. | Use when you have heavy technical receipts. |
| `<PullQuote attribution="— title">…</PullQuote>` | Display quote in editorial type. | One every ~700 words. |
| `<FieldCard kind="tool" title="THE FOUR-BUCKET AUDIT">…</FieldCard>` | Sidebar with named principle, tool, counter. `kind` ∈ `tool`, `principle`, `counter`, `pattern`. | Once or twice per essay. |
| `<Diagnostic items={[...]} />` | Reader-applies checklist or rating. | Once near the end of paid essays. |
| `<EssaySignoff />` | The "// END TRANSMISSION" sign-off block. | Auto-rendered by the layout. |

### Diagrams

See [`40-DIAGRAMS.md`](40-DIAGRAMS.md) for the full catalog. Quick reference:

| Component | Purpose |
|---|---|
| `<DiagramHalfLife />` | The half-life decay curve (skill, tool, attention). |
| `<DiagramTasteMoat />` | Possible-artifacts → taste-filter → shipped. |
| `<DiagramAvailabilityCost />` | 24h day showing context-switch shadows. |
| `<DiagramToolHalfLife />` | Geological stratigraphy (surface / production / spine). |
| `<DiagramTasteGate />` | Pre-built taste filter visualization. |
| `<DiagramLearningLoop />` | Learning-by-shipping feedback loop. |
| `<DiagramSystem />` | Generic systems diagram. |
| `<AnimatedDiagram>` | Container for hand-built animated SVG. |

### Tactical primitives (page chrome)

| Component | Purpose |
|---|---|
| `<TacticalStrip>` | Horizontal monospace strip with separators: `// ESSAY · 2026-05-07 · 13 MIN · 3,100 WORDS`. |
| `<NotchedCard>` | Card with chamfered corners + corner ticks. The signature container. |
| `<Reticle>` | Crosshair decorative element for hero areas. |
| `<TerminalPrompt>` | Renders a `$ command` prompt visual. |
| `<PillarTag pillar="build" />` | The pill-tag in the header showing the pillar. |
| `<HeroBroadcast posts={[...]} />` | The rotating 5-variant hero on the home page. Don't reuse on other pages. |

### Layout primitives

| Component | Purpose |
|---|---|
| `<Page>` | Page-level wrapper. Sets the ink-0 background, default font, footer. |
| `<Container>` | Horizontal gutter. Use inside `<Page>`. |
| `<EditorialColumn>` | Constrains body to ~66ch. Wrap the prose. |
| `<Section>` | Vertical rhythm primitive. |

### Read-this-if & related rail

| Component | Purpose |
|---|---|
| `<ReadThisIf items={[...]} />` | A 3-item "read this if X / Y / Z" filter under the dek. |
| `<RelatedRail posts={[...]} />` | Auto-rendered at the bottom of an essay from `frontmatter.related`. |

## Layout / spacing rules

- **Vertical rhythm:** prose paragraphs separated by `0.85em` (Tailwind's prose plugin handles this).
- **Section break:** H2 has 80px top margin, 32px bottom. Visually separates clearly.
- **Pull quote:** centered, 90% column width, 80px vertical margin.
- **Field card:** 80px vertical margin, full column width, brutalist border.
- **Mobile gutter:** 20px (`px-5`).
- **Desktop gutter:** clamps from 24px up to ~3rem at large breakpoints.

## Motion rules

`tokens.motion`:

- **fast** = 120ms — hover states, micro-interactions
- **base** = 200ms — page chrome transitions, opens/closes
- **slow** = 400ms — hero crossfades, page transitions
- **out** easing — entrances
- **inOut** easing — symmetrical animations

**Always reduce-motion safe.** Wrap any non-trivial animation in `useReducedMotion()` or `prefers-reduced-motion`. The site MUST be usable with reduced motion enabled.

## Iconography

Almost no icons. The visual language is *typographic*. When iconography is needed:

- **Reticles and corner ticks** — geometric, hand-drawn (`<Reticle>`).
- **Pillar dots** — colored dots from the pillar palette.
- **Status dots** — `<StatusDot>` (cyan = active, ember = pending, faint = idle).

If you find yourself reaching for Heroicons, Lucide, or another icon library — stop. The answer is almost always typography or a tactical-strip.

## What's *off* the design system

Things that should never appear:

- ❌ Emoji in body copy
- ❌ Card layouts with rounded corners larger than 4px (use NotchedCard)
- ❌ Drop shadows
- ❌ Gradients (except in approved hero variants)
- ❌ Stock photography
- ❌ Avatars (we don't show faces)
- ❌ Animated GIFs (use SVG or the `<AnimatedDiagram>` system)
- ❌ Embedded YouTube players (link out instead)
- ❌ Twitter embeds (paste the quote inline as a `<PullQuote>` and link to source)

## Adding a new component

1. Add the file to `src/components/<name>.tsx`.
2. Build it as a server component if it doesn't need state. Add `"use client"` only if it does.
3. Use design tokens — never hex literals.
4. Export it from `src/components/index.ts`.
5. If it's an MDX component (used inside posts), also wire it into `src/content/mdx-components.tsx`.
6. Run `npm run build` — it must compile clean.
7. Document the component in this file.

— Continue to [`40-DIAGRAMS.md`](40-DIAGRAMS.md).
