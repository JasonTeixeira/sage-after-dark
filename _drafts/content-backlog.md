# Content backlog — Sage After Dark

A queue of 30 pieces ready to draft. Ordered roughly by ship priority. Each row is a five-line spec: pillar, slug, working title, who's it for, what's the verdict, what are the 3-7 findings.

The cadence in `content-system.md` calls for ~3 posts/week. At that pace this queue is ~10 weeks of runway.

---

## Tier 1 — ship next 4 weeks

### 01 · build · `choosing-stack-for-one-person-saas`
- **Title:** Choosing a stack for a one-person SaaS in 2026.
- **Reader:** indie dev one weekend from launch.
- **Verdict:** "Boring stack. Boring deploy. Loud product."
- **Findings:** Next.js + Postgres (Supabase or Neon) + Stripe + Resend + Vercel. Skip the framework war. Skip the auth provider. Skip the queue. Add things only when a metric demands it.
- **Type:** monthly-guide. Members get the decision matrix.

### 02 · signal · `trayd-week-1-numbers`
- **Title:** Trayd · week 1 · the numbers.
- **Reader:** anyone watching me build in public.
- **Verdict:** Real numbers from a real launch week.
- **Findings:** signups, paid, MRR, top three traffic sources, what surprised me, what I'd change tomorrow.
- **Type:** dispatch + post. Free.

### 03 · build · `reading-postgres-explain-plans`
- **Title:** How to read a Postgres EXPLAIN ANALYZE without crying.
- **Reader:** dev whose query just got slow.
- **Verdict:** "It's not magic. It's six things in a stack trace."
- **Findings:** seq scan vs index scan, the cost vs actual time gap, when the planner is wrong, what to do about it, when to give up and add an index.
- **Type:** tear-down. Members get the worked example.

### 04 · mind · `the-half-life-of-an-essay`
- **Title:** The half-life of an essay.
- **Reader:** anyone who writes online.
- **Verdict:** "Most posts decay in 90 days. The ones that don't decay never did."
- **Findings:** what makes a post compound vs decay, the 80/20 of evergreen, examples from this site.
- **Type:** essay. Free.

### 05 · build · `resend-vs-postmark-vs-ses`
- **Title:** Resend vs Postmark vs SES — which transactional email provider in 2026.
- **Reader:** dev choosing right now.
- **Verdict:** "Resend if you're new. Postmark if you care. SES if you're cheap and patient."
- **Findings:** deliverability test (real numbers), pricing at 10k/100k/1M, DX comparison, dashboard quality, vendor risk.
- **Type:** monthly-guide. Members get the cost spreadsheet.

### 06 · signal · `tear-down-cal-com-pricing-page`
- **Title:** Tear-down · Cal.com's pricing page.
- **Reader:** anyone designing a SaaS pricing page.
- **Verdict:** "Three tiers, one anchor, zero fluff. The annual toggle is doing real work."
- **Findings:** information density, anchor placement, comparison table choices, what they'd steal from Linear, what they'd fix.
- **Type:** tear-down. Members-only.

### 07 · mind · `not-doing-as-a-discipline`
- **Title:** Naming what you're not doing.
- **Reader:** anyone running their own roadmap.
- **Verdict:** "The /now page taught me discipline I didn't know I was missing."
- **Findings:** the cost of unstated no's, how a public 'not doing' list shapes Tuesday, three real examples from this year.
- **Type:** essay. Free.

### 08 · build · `weekend-app-five-line-spec`
- **Title:** The five-line app spec.
- **Reader:** dev with weekend energy.
- **Verdict:** "If you can't write the spec in five lines, the app isn't ready to build."
- **Findings:** the template, three worked examples, the 24-hour rule, when the spec changes mid-build.
- **Type:** lab-note. Free.

### 09 · signal · `case-study-trayd-month-1`
- **Title:** Trayd · month 1 · the full retro.
- **Reader:** founder watching another founder.
- **Verdict:** Long-form retro of the first 30 days.
- **Findings:** what shipped, what didn't, every metric, every surprise, what month 2 looks like.
- **Type:** monthly case-study. Members-only.

### 10 · taste · `field-recordings-i-listen-to-while-coding`
- **Title:** Field recordings I code to.
- **Reader:** anyone who's tired of lo-fi.
- **Verdict:** "Real-world rooms beat synthetic ambient."
- **Findings:** five albums, why each works, what kind of work each one fits.
- **Type:** taste post. Free.

---

## Tier 2 — drafting in next 4-8 weeks

### 11 · build · `postgres-schema-mistakes-i-keep-making`
Five mistakes, with the queries that catch each.

### 12 · signal · `tear-down-vercel-onboarding`
Vercel's first-deploy onboarding decomposed step by step.

### 13 · mind · `taste-as-compounding-asset`
Why taste is the asset that compounds fastest in this decade.

### 14 · build · `cron-jobs-without-a-queue`
Vercel cron + idempotent endpoints — when you don't need a queue yet.

### 15 · taste · `films-about-systems`
Films that get how systems actually behave (not just hacker movies).

### 16 · signal · `field-note-launch-day-checklist`
The 30-item launch-day checklist I used (and which 4 items mattered).

### 17 · build · `magic-link-auth-from-scratch`
No Auth0, no Clerk. ~150 lines. Pros, cons, what to add later.

### 18 · mind · `the-changelog-is-the-product`
A public changelog is a marketing asset, a hiring asset, and a discipline.

### 19 · signal · `tear-down-linear-keyboard-shortcuts`
What every keyboard-first product can steal from Linear's K-bar.

### 20 · build · `stripe-webhooks-that-dont-lie`
Idempotency keys, retries, signature verification, what breaks at 100 events/sec.

---

## Tier 3 — backlog (drafts queued)

### 21 · taste · `books-i-re-read`
Five books I re-read every year, and why.

### 22 · build · `feature-flags-for-a-team-of-one`
LaunchDarkly is overkill. A 50-line implementation that's enough.

### 23 · mind · `consistency-beats-volume`
Three posts a week for a year > thirty posts in a week, every time.

### 24 · signal · `case-study-resend-onboarding`
Resend's onboarding tear-down, top to bottom.

### 25 · build · `next-js-15-server-actions-in-anger`
Server actions, real production patterns, the gotchas.

### 26 · taste · `notebooks-pens-and-the-physical-loop`
The analog tools I use to think before I type.

### 27 · mind · `the-cost-of-a-broken-/now-page`
Why a stale /now page is worse than no /now page.

### 28 · build · `observability-on-a-zero-dollar-budget`
Vercel + Logflare + a Grafana Cloud free tier — where it ends.

### 29 · signal · `tear-down-pieter-levels-stack`
What Pieter Levels' stack tells you about lean-stack maximalism.

### 30 · build · `migrating-from-prisma-to-drizzle`
A real migration, not a benchmark — what changed, what didn't, what broke.

---

## How to use this file

- Each piece moves to `src/content/posts/<pillar>/<slug>.mdx` when drafting starts.
- Update status here as it moves: `idea → outlined → drafting → published → live`.
- When something ships, strike it through here and add the live URL.
- When something doesn't ship in 90 days, kill it. Idea decay is real.
