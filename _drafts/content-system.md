# Content system — Sage After Dark

A living engine, not a static site. The whole point of this site is to *visibly* move forward every week. Counters tick. /now refreshes. Books rotate. Posts ship. If a visitor returns in two weeks and nothing has changed, the site has lied.

This document is the cadence I commit to.

---

## Operating principle

> **Show the work in motion.**

The reader should feel three things on every visit:
1. **Currency** — /now updated within the last 14 days, /reading and /taste rotated within the last 30, posts shipped within the last 7.
2. **Accuracy** — every number is real (live counters, no hardcoded counts).
3. **Direction** — the changelog and the dispatch reveal what's next.

Anything that breaks one of those three is a bug.

---

## Weekly rhythm

### Sunday — `field-note` (free, ~600 words, signal pillar)
- One thing I shipped, one thing I learned, one thing I'm watching.
- Goes out as the **dispatch** newsletter.
- Slot: free, no paywall.
- Required: real screenshot or terminal cap, one number, one verdict.

### Tuesday — `tear-down` (members-only, ~1200 words, build pillar)
- A live product, infra choice, or repo decomposed.
- Format: opening verdict → 5-7 numbered findings → "what I'd steal" → "what I'd fix".
- Slot: paywalled at ~25% mark.
- Required: at least one diagram or table; cite primary sources only.

### Friday — `app-idea` or `lab-note` (free, ~800 words, mind pillar)
- A five-line spec for an app idea, or a lab note documenting an experiment-in-progress.
- Slot: free.
- Required: must be small enough to actually build over a weekend.

### Total per week: 3 posts, ~2,600 words, 1 paywalled

---

## Monthly rhythm

### First Sunday — `monthly-guide` (free + members deep-dive, ~2500 words, build pillar)
- One topic, ruthlessly. Examples: "Choosing a stack for a 1-person SaaS in 2026", "How to read a Postgres query plan", "When to use Resend vs Postmark vs SES".
- Free first 1500 words, members get the decision matrix and the war stories.
- Required: comparison table, failure mode list.

### Mid-month — `case-study` (members-only, ~2000 words, signal pillar)
- A *full* tear-down of one product or one decision over a longer arc.
- Members-only. The flagship piece each month.

### End-of-month — `review` (free, ~1000 words, mind pillar)
- The /now page made permanent. What I shipped, what I learned, what's queued.
- Counts get summarized. Plays well as a newsletter.

### Total per month: 3 long-form, ~5,500 words

---

## Quarterly rhythm

- **Pillar reset** — review the four pillars (build · signal · mind · taste). Drop one essay per pillar that codifies the current thinking.
- **Stack post** — full /uses + /colophon update with rationale.
- **Half-life check** — re-read every essay older than 12 months. Either update with a "still holds" stamp or flag it as superseded.

---

## Living surfaces (must rotate)

| Surface | Source of truth | Update cadence | Update mechanism |
|---|---|---|---|
| /now | `now_status` table | Weekly | /admin/now form |
| /reading | `rotation_items` (kind=reading) | Bi-weekly | /admin/rotation |
| /taste | `rotation_items` (kind=book/music/film) | Monthly | /admin/rotation |
| /now (listening/watching) | `rotation_items` (kind=listening/watching) | Bi-weekly | /admin/rotation |
| Home rotating slot | `featured_posts` (slot=home_hero) | Weekly | /admin/featured |
| /numbers | live computed (Stripe + corpus + page-view counts) | Hourly cache | automatic |
| Post view counts | `analytics_pageview` table | Per-visit | automatic, displayed on PostStrip |
| /changelog | git history (via prebuild script) | Per deploy | automatic |
| Resend audience size | Resend API (live) | Per-page-load | automatic |

Nothing on this site should ever be hardcoded if it can be counted.

---

## Pillar voice

- **Build (cyan)** — "Here's how I'd actually do it." First-person. Specific. Numbered findings.
- **Signal (ember)** — "Here's what's moving." Tear-downs, dispatches, what I read this week.
- **Mind (violet)** — "Here's a frame." Slower. More writing. Pulls metaphors from outside tech.
- **Taste (sand)** — "Here's what I'm absorbing." Books, music, films, with one-line takes.

---

## What I'm NOT doing

- No "viral" SEO posts.
- No takes on celebrity drama or AI Twitter beef.
- No video, no podcast, no founder face. (Standing rule.)
- No reposts of someone else's idea without first-hand reasoning.
- No dropping a post because the queue says it's Tuesday — if it's not ready, slip it.

---

## How a piece moves through the system

1. **Capture** — note in `_drafts/content-backlog.md`.
2. **Outline** — five-line spec: who's the reader, what's the verdict, what are the 3-7 findings, what's the takeaway, what's the call.
3. **Draft** — write in MDX in `src/content/posts/<pillar>/<slug>.mdx`.
4. **Status: `draft`** — invisible publicly. Visible to me at `/admin/posts` once added.
5. **Review** — re-read after 24 hours. Cut 20%.
6. **Status: `published`** — set in frontmatter, ship.
7. **Promote** — Sunday dispatch references it. /admin/featured pin if hero-worthy.
8. **Track** — page views accrue. Top-5 surfaces on `/numbers` and `/admin`.

---

## Definition of done (per piece)

- [ ] Frontmatter validates against schema.
- [ ] One real number, one real screenshot or table.
- [ ] Sources cited inline with primary URLs.
- [ ] No buzzword bingo, no "in today's fast-paced world" openers.
- [ ] Reading time <= advertised word count / 200 (mins).
- [ ] Mobile preview clean at 375px.
- [ ] Linked from the previous post in the arc, if any.
- [ ] Newsletter subject + preview text drafted.
