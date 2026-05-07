# 50 · Story Arcs — narrative threads, pillar themes, the backlog

The site has a **point of view** that develops across posts. New posts should reinforce or extend the existing arcs, not stand alone. This file is the map.

## The three master arcs

These are the worldviews the site keeps returning to. Almost every essay sits inside one (or at the intersection of two).

### Arc 1 — **Long half-life over short**

The big idea: **the spine matters more than the surface**. Skills, tools, attention, decisions, relationships — the things with long half-lives compound, and the things with short half-lives churn. The professional life that lasts is built on the spine.

**Posts in this arc:**
- The half-life of a skill (paid #1)
- The half-life of a good tool (paid #4)
- *The half-life of an essay* (planned)
- *The half-life of a decision* (planned)
- *The half-life of a team* (planned)

### Arc 2 — **Taste over output**

The big idea: **what you choose not to build is the moat**. Once everyone can ship, the only differentiator is what you choose to ship and what you refuse to. Taste is editorial. Taste is a deploy gate. Taste is the last moat.

**Posts in this arc:**
- Taste is the last moat (paid)
- Taste as a deploy gate (free)
- *Taste in writing*: what to delete first (planned)
- *Taste in tools*: how to evaluate without using (planned)
- *Taste in hiring*: the one signal that beats experience (planned)

### Arc 3 — **Slowness over availability**

The big idea: **focus is the asset; everything else is overhead**. Availability is a tax. Notifications are interest payments on a debt you didn't take out. The one-person studio's only edge is choosing what *not* to be available for.

**Posts in this arc:**
- The cost of being available (paid)
- The second-brain trap (paid)
- *Why I don't use a productivity system* (planned, paid #5 candidate)
- *The two-tab rule* (planned)
- *The Slack budget* (planned)

## Active series

### Late-Night Curriculum (paid, in progress)

The flagship paid series. 9 essays planned. Each is free-standing but together they form a curriculum on building a long career in software.

`series.slug = "late-night-curriculum"`

| # | Title | Pillar | Status |
|---|---|---|---|
| 1 | The half-life of a skill | learning | ✅ shipped |
| 2 | The second brain trap | mind | ✅ shipped |
| 3 | Latency is a worldview | build | ✅ shipped |
| — | The thirty-second half-life | learning | ✅ shipped (free teaser) |
| 4 | Taste is the last moat | taste | ✅ shipped (Phase 2 #1) |
| 5 | The cost of being available | mind | ✅ shipped (Phase 2 #2) |
| 6 | The half-life of a good tool | build | ✅ shipped (Phase 2 #3) |
| 7 | Why I don't use a productivity system | mind | 📝 next |
| 8 | The argument you have after the argument | mind | 📝 queued |
| 9 | The half-life of an essay | learning | 📝 queued |

The series page lives at `/series/late-night-curriculum` and auto-renders from frontmatter.

### Trayd, In Public (arc)

`arc.arc_slug = "trayd-in-public"`

A build-in-public arc following the launch of Trayd — a constraint-engine product. Episodes are 1,000–1,800 words, weekly during active phases.

| Ep | Title | Status |
|---|---|---|
| 01 | The decision | ✅ shipped |
| 02 | TBD | 📝 |

Arc episodes use `template: arc_episode` and require the `arc:` frontmatter block.

## The backlog (next 12 posts)

These are pre-validated post ideas. Each has a working title, a verdict, and 3–5 candidate findings. Pick from the top when starting a new post.

### Tier 1 — ship in the next 30 days

#### Late-Night Curriculum #5 · `why-i-dont-use-a-productivity-system`
- **Title:** *Why I don't use a productivity system.*
- **Pillar:** mind. **Members-only.**
- **Verdict:** "Every system I've tried imposed more overhead than it saved. The system that survived is the one I didn't notice I was using."
- **Findings:**
  - Productivity systems are mostly performance-of-productivity, not productivity.
  - The friction of capturing a thought destroys most of its value.
  - Inbox zero, GTD, second-brain — each has a half-life of about 18 months for the user before it becomes a guilt object.
  - The system I actually use is: a notebook, a Sunday review, and a refusal to add tools faster than I subtract them.
  - The 80/20 of any system is the *Sunday review*. Skip the rest.
- **Diagram candidate:** "Tools added vs. tools used over 12 months" — most systems show the gap widening.

#### Late-Night Curriculum #6 · `the-argument-after-the-argument`
- **Title:** *The argument you have after the argument.*
- **Pillar:** mind. **Members-only.**
- **Verdict:** "Most professional disagreements aren't about what they appear to be about. The real argument is one layer down. Most teams never get to it."
- **Findings:**
  - The surface argument is almost always tactical (which tool, which approach).
  - The argument *under* the surface argument is almost always about values (autonomy, risk tolerance, definition of done).
  - You can tell which is which by the temperature: tactical arguments cool down with information; values arguments don't.
  - Teams that get to the second layer make decisions that hold for years; teams that don't relitigate the same surface argument quarterly.
- **Diagram candidate:** Two-layer iceberg — surface argument above, values argument below. Most resolution effort spent above the line; most resolution value below.

#### Late-Night Curriculum #7 · `the-half-life-of-an-essay`
- **Title:** *The half-life of an essay.*
- **Pillar:** learning. **Members-only.**
- **Verdict:** "Most posts decay in 90 days. The ones that don't decay never did."
- **Findings:**
  - Time-bound essays (news reactions, hot takes, framework reviews) decay fast — fine for traffic, terrible for compounding.
  - Concept essays (frameworks, taxonomies, principles) compound for years.
  - The 80/20 of evergreen-ness is in *what the essay names* — if the noun in the title is a concept the reader will encounter again, the essay can compound.
  - Examples from this corpus.
- **Diagram candidate:** Reuse `DiagramHalfLife` with a new label set.

### Tier 2 — ship in the next 60 days

#### `choosing-stack-for-one-person-saas`
- **Pillar:** build. **Free first half, members-only decision matrix.**
- **Verdict:** "Boring stack. Boring deploy. Loud product."
- **Findings:** Next.js + Postgres + Stripe + Resend + Vercel. The default is the answer. What changes the default. The five things that aren't the framework war.

#### `reading-postgres-explain-plans`
- **Pillar:** build. **Members-only.**
- **Verdict:** "It's not magic. It's six things in a stack trace."
- **Findings:** Seq scan vs index scan. The cost vs actual time gap. When the planner is wrong. The minimum index portfolio. When to give up.

#### `resend-vs-postmark-vs-ses`
- **Pillar:** build. **Free.**
- **Verdict:** "If you're sending under 100k emails/mo, the answer is Resend. If you're sending more, it's still Resend. If you're a Fortune 500, you have a procurement team — they'll figure it out."
- **Findings:** Pricing breakpoints, deliverability scores, DX, vendor risk.

#### `the-tuesday-block`
- **Pillar:** mind. **Free.**
- **Verdict:** "The single calendar habit that doubled my output."
- **Findings:** Why a recurring writing block beats deadlines. Why Tuesday specifically. What to do when it gets disrupted (hint: don't reschedule, abandon the week's slot).

#### `taste-in-hiring`
- **Pillar:** taste. **Members-only.**
- **Verdict:** "The one signal that beats experience: what they show you when they're not showing off."
- **Findings:** Side projects vs. portfolios. Github commit graphs as taste signals. The interview question that surfaces taste.

### Tier 3 — backlog (longer horizon)

- `the-monday-question` — the single question that reframes a stuck week
- `the-rebuild-test` — when to rewrite from scratch vs. extend
- `naming-your-projects` — the underrated craft skill
- `slow-tools` — tools that pay back in years, not weeks
- `the-five-line-spec-revisited` — what changed in the year since the original dispatch
- `meetings-as-debt` — the financial framing of recurring meetings
- `field-note-june-2026` — monthly retro
- `field-note-july-2026` — monthly retro

## How to extend an arc

When picking the next post:

1. **Look at which arc has the least recent post.** Cycle through the three arcs to keep the site balanced.
2. **Check the pillar distribution** in the last 5 posts. If you've shipped 3 build posts in a row, write something in mind or taste.
3. **Pick from Tier 1 first.** Tier 2 only when Tier 1 is exhausted.
4. **Confirm the diagram.** If you don't have one, the post isn't ready — pick a different post.
5. **Check `related:` slugs.** Every new post should link forward and backward to at least 2 existing posts.

## Pillar tone notes

How the voice shifts depending on pillar:

- **build** — most technical, most code, most numbers. Still in-voice, but the sentences are denser. Sidenotes for asides.
- **signal** — most personal, most date-stamped. Field notes live here. The voice is at its most "log entry."
- **mind** — most discursive, longest paragraphs, most willing to wander before landing. Pull quotes do the heaviest lifting here.
- **world** — least personal, most argumentative. Industry observations need the most receipts.
- **taste** — most aesthetic, most likely to reference music/film/books. The voice gets warmer here.
- **learning** — most meta. The voice gets reflective. Sidenotes earn their place here.
- **teach** — most procedural, most numbered steps. The voice tightens up. Less wandering.

## How to NOT extend the corpus

Things we don't write:

- ❌ News reactions ("Vercel just announced X — here's what it means")
- ❌ Tier-list / ranking posts (we have opinions, but they live inside arguments, not lists)
- ❌ "Here are 10 X" listicles
- ❌ Hot takes on AI / crypto / fad-of-the-quarter
- ❌ "Lessons from $bigCompany" (we're not big-company analysts; we're practitioners)
- ❌ Anything that requires the reader to know the news cycle of the last 7 days

— Continue to [`60-WORKFLOWS.md`](60-WORKFLOWS.md).
