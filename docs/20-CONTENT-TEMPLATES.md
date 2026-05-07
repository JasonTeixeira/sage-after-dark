# 20 · Content Templates — six post archetypes

Every post on Sage After Dark uses one of six templates. The template determines layout, frontmatter shape, and the structural beats. Pick the right one before drafting.

```
essay        — long-form argument with drop cap, margin notes, related rail
tutorial     — how-to with prereqs / outcome / steps
field_note   — monthly notebook spread (signal pillar)
dispatch     — 200–500 word signal-style micro-post
arc_episode  — numbered episode in a series (Trayd, etc.)
annual       — book-length end-of-year microsite
```

Boilerplate skeletons live in `src/content/_templates/*.mdx.template`. The schema validates them in `src/content/schema.ts`. You can also see [`docs/post-template.mdx`](post-template.mdx) for a copyable starting essay.

---

## 1. Essay (`template: essay`) — the flagship

**Use for:** argued positions, manifestos, deep-dives where the point lives in the prose. Most of the paid corpus is this.

### Frontmatter

```yaml
---
title: "The provocative thesis that names a real tension"
dek: "One sub-headline sentence that earns the click without spoiling the punchline."
slug: "the-provocative-thesis"
template: essay
pillar: mind                # build · signal · mind · world · taste · learning · teach
tags: ["thinking", "craft", "compounding"]
published: "2026-05-07"
status: published
featured: false             # true only for the *current* flagship; demotes when next one ships
members_only: true          # paid? false for free essays
series:                     # only for series like Late-Night Curriculum
  slug: "late-night-curriculum"
  title: "Late-Night Curriculum"
  order: 5
related:                    # 2–3 slugs that read well next
  - "the-half-life-of-a-skill"
  - "taste-is-the-last-moat"
---
```

### Required structural beats

In order:

1. **Drop cap opener** — `<DropCap letter="T">` on the first paragraph. The drop cap signals "this is a piece of writing, not a blog post."
2. **Thesis paragraph** — the cold open. No throat-clearing.
3. **First sidenote** within the first 2 paragraphs — `<Sidenote n="1">` — with an aside that earns its place.
4. **Signature diagram** — `<DiagramX />` placed after the thesis is established but before the first H2. See [`40-DIAGRAMS.md`](40-DIAGRAMS.md).
5. **3–6 H2 sections.** Each is a 200–500 word argument. Each ends on a memorable sentence.
6. **One pull quote** every ~700 words. `<PullQuote attribution="— title">…</PullQuote>`. The pull quote should be a sentence that could go on a t-shirt.
7. **At least one `<FieldCard>`** — a sidebar with a named principle, tool, counter-example, or test. See `30-DESIGN-SYSTEM.md`.
8. **At least one `<Diagnostic>`** near the end — a checklist, rating, or test the reader can apply to their own situation.
9. **The closer** — restates the thesis sharper than the opener. One image. One sentence. Section-titled "Land the plane" or similar (don't actually use that header — invent a verbal one).
10. **Sign-off line** — implied via `<EssaySignoff />`, but you can also include a final italicized sentence as the very last thing in the body.

### Word count

- **Free essay:** 1,500–2,500 words
- **Paid essay (flagship):** 2,500–4,000 words

### Drop cap rules

- One drop cap per essay. First letter of the first paragraph.
- Choose a letter the design respects (avoid Q, J — they look weird). T, S, A, M, W are ideal.
- The drop cap paragraph should be 60–120 words and stand alone as a thesis.

### Margin notes vs. sidenotes

Both are asides. Different placement:

- `<MarginNote number={1}>` — floats to the right margin at lg+ breakpoints, inlined on mobile. Use for tactile facts ("This was the third deploy that month").
- `<Sidenote n="1">` — collapses inline by default with a number that expands on hover. Use for funnier or more discursive asides.

In practice: most posts use `<Sidenote>`. `<MarginNote>` is for posts that have heavy technical receipts.

---

## 2. Tutorial (`template: tutorial`) — how-to

**Use for:** rebuildable how-tos. Reader should be able to follow along and have the artifact at the end.

### Frontmatter

```yaml
---
title: "Shipping a killable feature in a weekend"
dek: "A 2-hour pattern for adding paid features you can yank without regret."
slug: "tutorial-shipping-a-killable-feature"
template: tutorial
pillar: teach
tags: ["specs", "rollback", "patterns"]
published: "2026-04-12"
status: published
tutorial:
  prerequisites:
    - "Comfortable with Next.js App Router and Stripe"
    - "Have a Vercel + Supabase project running"
  time_estimate: "~90 min"
  difficulty: intermediate
  outcome: "A feature gated by a flag, behind a checkout, with a one-line rollback."
  starter_repo: "https://github.com/JasonTeixeira/killable-feature-starter"
---
```

### Required beats

1. **The "what you'll have at the end" paragraph** — show the artifact (screenshot, demo URL, or code block) before the tutorial starts.
2. **Prerequisites** as a `<TacticalStrip>`.
3. **Numbered steps**, H3 each (`### Step 1 — Generate the flag`).
4. Every step has: **what** (the action), **why** (one sentence), **artifact** (the code or config produced).
5. Code blocks with language fences. Real, copy-pastable code. No `// ... rest of code`.
6. **The verification block** at the end — what the reader runs to confirm it worked.
7. **The rollback section** — a separate H2 that shows how to undo this. Always present.

### Word count

1,200–2,000 words. Density over length.

---

## 3. Field note (`template: field_note`) — monthly retro

**Use for:** monthly reflections. One per month. Goes out as the dispatch newsletter.

### Frontmatter

```yaml
---
title: "Field note: May"
dek: "Smaller weeks, longer essays, and the meeting I should have skipped."
slug: "field-note-may-2026"
template: field_note
pillar: signal
tags: ["retro", "monthly", "focus"]
published: "2026-05-31"
status: published
related:
  - "field-note-april-2026"
  - "the-half-life-of-a-good-tool"
---
```

### Required beats

1. **One sentence opener** — the mood of the month in plain English. No throat-clearing.
2. **The big change** — the one decision or shift that defined the month. With a date.
3. **`### What I shipped`** — bulleted, with links. Be specific: 3–6 items.
4. **`### What I learned`** — 2–4 things, each one sentence.
5. **`### What I'm watching`** — 2–4 things on the radar.
6. **`### What I cut`** or **`### What I should have cut`** — honesty, not just wins.
7. **Closing image** — usually a sentence about the next month or a single thing that made the month worth it.

### Word count

600–800 words. Tight is the point.

---

## 4. Dispatch (`template: dispatch`) — micro-post

**Use for:** one-idea posts. A single argument, a single pattern, a single decision tree. No diagrams. No drop cap.

### Frontmatter

```yaml
---
title: "The five-line spec"
dek: "Most features deserve a sticky note, not a doc."
slug: "dispatch-the-five-line-spec"
template: dispatch
pillar: build
tags: ["specs", "focus", "principles"]
published: "2026-04-15"
status: published
---
```

### Required beats

1. **Cold open thesis** — first sentence states the claim.
2. **The receipt** — a brief story, a code block, or a list.
3. **The principle** — usually 2–4 sentences in the middle that name the rule.
4. **The closer** — one sentence that lands.

### Word count

200–500 words. Strict.

---

## 5. Arc episode (`template: arc_episode`) — numbered series

**Use for:** ongoing arcs like "Trayd, In Public." Each episode reads alone but is part of an enumerated chain.

### Frontmatter

```yaml
---
title: "Trayd · Episode 01 · The decision"
dek: "Why the next product is going to be a constraint engine, not another inbox."
slug: "trayd-ep-01-the-decision"
template: arc_episode
pillar: build
tags: ["trayd", "build-in-public"]
published: "2026-04-22"
status: published
arc:
  arc_slug: "trayd-in-public"
  arc_title: "Trayd, In Public"
  episode: 1
  total_episodes: 12
---
```

### Required beats

1. **Recap line** at the top (skip on episode 1) — 1 sentence summarizing the previous episode.
2. **The week's decision or event** — the one thing that happened.
3. **The receipts** — numbers (signups, MRR, infrastructure costs, hours), screenshots if relevant.
4. **What's next** — one sentence pointing at the next episode.

### Word count

1,000–1,800 words.

---

## 6. Annual (`template: annual`) — year in review

**Use for:** the December retrospective. One per year. Multi-page magazine artifact.

This is its own design problem and warrants direct review of `src/app/annual/2025/` before drafting another. Long form, lots of custom layout, often pull quotes from the year's best essays.

---

## Quick reference: which template do I use?

```
Did something happen in the last 30 days that I want to log?           → field_note
Is this a single idea I'd put on a sticky note?                        → dispatch
Am I making an argument with multiple sections?                        → essay
Will the reader build something and have an artifact?                  → tutorial
Is this episode N of a numbered series?                                → arc_episode
Is it December and time to compile the year?                           → annual
```

## Things that sound like exceptions but aren't

- **A "list post"** is just a deadpan-list essay. Use `template: essay`.
- **A "review"** of a tool is a dispatch (if short) or an essay (if you have an argument).
- **An "FAQ"** is not a post we publish on this site. If you need to answer questions, write an essay that answers the underlying question.
- **A "linkdump"** is not a post we publish either. The dispatch is for one idea, not a list of links.

— Continue to [`30-DESIGN-SYSTEM.md`](30-DESIGN-SYSTEM.md).
