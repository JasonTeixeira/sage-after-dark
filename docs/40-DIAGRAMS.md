# 40 · Diagrams — the visual language

Every paid essay gets one **signature diagram**. The diagram tells the story in a single image and is the post's most shareable artifact.

Diagrams are **never** decorative. They earn their place by being the *fastest path* to the post's core idea — faster than reading the prose.

## The shipped catalog

All diagrams are in `src/components/diagrams.tsx`, `src/components/diagrams-strategy.tsx`, and `src/components/curriculum-diagrams.tsx`. Imports come through `@/components`.

| Component | Used in | What it shows |
|---|---|---|
| `<DiagramHalfLife />` | The half-life of a skill | Decay curve over time vs. plateau curve |
| `<DiagramTasteMoat />` | Taste is the last moat | Possible artifacts → taste filter → shipped cluster inside a moat |
| `<DiagramAvailabilityCost />` | The cost of being available | 24h timeline with the 23-min recovery shadow after each interrupt |
| `<DiagramToolHalfLife />` | The half-life of a good tool | Geological stratigraphy: surface / production / spine layers |
| `<DiagramTasteGate />` | Older taste essays | Pre-built taste-as-deploy-gate visual |
| `<DiagramLearningLoop />` | Learning by shipping | Closed feedback loop: ship → observe → adjust |
| `<DiagramSystem />` | The system I actually use | Daily/weekly/monthly cadence wheels |
| `<DiagramNoiseVsSignal />` | Strategy posts | Signal vs. noise frequency diagram |
| `<DiagramFivePillars />` | About / strategy | Five pillars as architectural columns |
| `<DiagramArcTimeline />` | Strategy / arcs | Multi-arc timeline grid |

## Visual grammar — the rules every diagram obeys

These are the constraints that make the diagrams feel like a system instead of unrelated illustrations.

### Geometry
- **All shapes are SVG**, hand-coded. No imported chart libraries.
- **Stroke widths:** `1` for grid/structure, `1.5` for primary lines, `2` for accent. No 3+ unless deliberate.
- **Corners:** mostly square. Where rounding is needed, use `r=2` or `r=4`.
- **Right angles preferred.** Curves are reserved for half-life decay and similar mathematical shapes.

### Color
- **Background:** transparent (the ink panel of the surrounding card shows through), or `#0A0E14` (`ink-1`).
- **Grid:** `#1C232E` (`rule-base`) — barely visible, one stroke.
- **Primary line / shape:** `#00E5FF` (`cyan`) for the main idea — what the reader's eye should land on.
- **Secondary line / shape:** `#E8E6E0` (`bone`) at 50–80% opacity — the contrasting curve or supporting structure.
- **Threshold / annotation:** dashed line, `stroke-dasharray="3 3"`, in `mute` (#8A8F98).
- **Accent / highlight:** `#F59E0B` (`ember`) — used sparingly, at most once per diagram.
- **Pillar tint:** the post's pillar color, used only as a tag chip in the diagram corner — never as a fill.

### Typography in diagrams
- **All labels mono.** Use `font-family="ui-monospace, SFMono-Regular, Menlo, monospace"` directly in SVG, or a `tspan` that inherits.
- **Label sizes:** 10–11px for grid labels, 12–14px for axis labels, 14–18px for callouts.
- **Uppercase tactical labels** — `// SIGNATURE`, `THRESHOLD`, `LATEST`, `+10Y` — always uppercase mono.
- **Callout connector lines** — 1px, same as grid, with a small dot at the anchor.

### Composition
- **Aspect ratio 16:9 or 4:3** for the SVG viewBox. Most are 16:9.
- **Padding inside SVG:** at least 16px on each side so labels don't kiss the edge.
- **Title block top-left:** `// DIAGRAM-NAME · OPTIONAL-SUBHEAD`.
- **Status indicator top-right:** something dynamic-feeling like `LATEST`, `LIVE`, `+10Y`, `+24H`.

## When to design a new diagram

Most paid essays need one. Free essays usually don't.

You're ready to design a diagram when you can answer all three:

1. **What is the one frame the post offers?** (Often the pull quote.)
2. **What two or three quantities are being contrasted?** (Time vs. value. Possible vs. shipped. Surface vs. spine. Available vs. effective.)
3. **Where is the inflection?** (The threshold, the cliff, the plateau, the cluster.)

If you can't name those three, the diagram isn't ready — keep writing.

## How to design one (process)

1. **Sketch on paper first.** A diagram that doesn't work as a 5-second pencil sketch won't work as SVG either.
2. **Pick the geometry.** Most diagrams in the corpus are one of these archetypes:
   - **Decay curve** (half-life) — exponential drop vs. plateau
   - **Stratigraphy** (layered horizontal strata)
   - **Filter funnel** (input cluster → constraint → output cluster)
   - **24h radial** (clock with overlaid usage / interrupts)
   - **Network graph** (nodes + edges, latest highlighted)
   - **Quadrant** (2x2 with the post's framework)
3. **Build the static SVG** in `src/components/curriculum-diagrams.tsx` (for paid essays) or `src/components/diagrams.tsx` (for general use).
4. **Wire it into `src/content/mdx-components.tsx`** so it's available as `<DiagramYourName />` in MDX.
5. **Test on the post** — does the diagram still make sense if you remove all the prose?
6. **Test on mobile (375px)** — labels must remain readable.
7. **Check reduced-motion** — if the diagram has any animation, ensure it stops or simplifies under `prefers-reduced-motion`.

## Animation rules

Most diagrams are **static**. Animation is reserved for:

- **Reveal on scroll** — fade in once, no looping.
- **Settling animations** — nodes that drift to position once, on mount.
- **Live indicators** — the cyan dot pulse on a hero variant, the LIVE marker.

Never:
- Loop indefinitely (it pulls the eye and breaks reading).
- Animate the data itself in a way that suggests time-series motion (unless the post is *about* time-series).
- Auto-play sound. Ever. (We don't have sound. Reminder.)

The `<AnimatedDiagram>` wrapper handles `prefers-reduced-motion` for you. Use it.

## Title patterns

The text label in the top-left corner of the diagram. Pick from these patterns:

```
// SIGNATURE · HALF-LIFE
// CONSTELLATION · 18 POSTS
// OBSERVATORY
// CARRIER · 102.7 SAGE
// FOUR-BUCKET AUDIT
// THE DEEP STRATUM
```

Always start with `//`. Always uppercase. Mono font. Color `mute` or `cyan` depending on emphasis.

## Anti-patterns

- ❌ **Stock chart from a library** — Recharts, D3, anything. We hand-build because the design system is the brand.
- ❌ **3D / isometric** — flat is the language. Depth is reserved for stratigraphy (which is just stacked horizontal layers).
- ❌ **Decorative background gradients** — the diagram earns the page through clarity, not atmosphere.
- ❌ **More than 5 colors** — you're past the point of clarity.
- ❌ **Text-heavy diagrams** — if the diagram has more than ~10 words of label, the prose isn't doing its job.
- ❌ **Diagrams that need a key** — if the reader has to look up what each color means, the diagram has failed.

## Reusing diagrams

A diagram can be reused across posts when the visual makes the same point. The half-life curve, for example, appears in three essays.

When reusing, **do not customize the diagram per-post** by passing different data. Instead: build a shared core, and if a post needs a variant, build a *new named diagram* that composes the same geometry. This keeps the design system honest.

## Future diagram ideas (backlog)

These are documented hypotheses for diagrams we haven't built yet but expect to need:

- **The taste portfolio** — a portfolio chart showing %P/A/C/T (from "The half-life of a good tool") balance for the reader to plot.
- **The interrupt budget** — daily budget bar (8 hours) with each interrupt eating its cost + 23min shadow.
- **The skill spine** — a vertical spine made of long-half-life skills with optional surface-level skills branching off.
- **The decision archive** — a timeline of past decisions with retrospective quality ratings.
- **The reading curriculum** — books/essays plotted on years-since-published vs. usefulness-today.

When one of these gets built, move it from this list to the catalog.

— Continue to [`50-STORY-ARCS.md`](50-STORY-ARCS.md).
