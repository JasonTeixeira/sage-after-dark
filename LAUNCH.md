# Sage After Dark — Launch Kit

The deliverables for going public. Drafts only — review before sending.

Channels: **Hacker News · GitHub · LinkedIn · sageideas.dev**

---

## 1 · Hacker News submission (Show HN)

**Title:**
`Show HN: Sage After Dark – essays, tutorials, and dispatches with a 30s rollback rule`

**URL:**
`https://www.sageafterdark.com`

**Comment (post first reply yourself, immediately):**

> Author here. Sage After Dark is the late-night studio for my work — essays, tutorials, and short dispatches that go out on cadence instead of when they feel ready.
>
> The site is the manifestation of a rule I follow at my day job: nothing ships unless it can be rolled back in under 30 seconds. The site itself rolls back in 14. CI fails any commit whose `pnpm panic` rollback exceeds the budget.
>
> A few choices that might be interesting:
>
> - **No JavaScript framework runtime on most pages.** It's Next.js for the build pipeline and MDX, but most pages ship as static HTML with maybe 6KB of progressive enhancement (a reading-progress bar, a hero reticle, a Konami easter egg). The home page is < 30KB transferred.
> - **Members-only tier ($5/mo, $50/yr) for the long versions of tutorials.** Stripe + magic-link auth, no passwords. The free dispatches stay free forever; members get the full transcripts and starter repos.
> - **Tactical-editorial design.** Mono labels, hairline rules, pillar colors as data. No stock photography. No decorative imagery. The look encodes the work, not the other way around.
>
> Code is open as I publish it: github.com/JasonTeixeira/sage-after-dark.
>
> Happy to answer anything about the build, the rollback rule, the design system, or the publishing cadence.

---

## 2 · GitHub README — repo landing page

Pin this on the repo so anyone arriving from HN sees the build story before the source.

**Headline:**
`Sage After Dark — the late-night studio for Sage Ideas`

**Lede paragraphs:**

> A publication built around one rule: nothing ships that can't be rolled back in 30 seconds. The site itself rolls back in 14. CI fails any commit whose `pnpm panic` exceeds the budget.
>
> Live at [www.sageafterdark.com](https://www.sageafterdark.com). Author commentary on the build at [sageideas.dev](https://www.sageideas.dev).

**Sections to include:**

- **What this is** — one paragraph describing the editorial intent (essays, tutorials, dispatches across seven pillars).
- **The rollback rule** — link to `pnpm panic`, the CI gate, and the rollback essay.
- **Stack** — Next.js 15, Tailwind v4, MDX, Vercel, Supabase, Stripe, Resend.
- **Design system** — link to `/dev` (the live design system showcase) and `/colophon`.
- **Members tier** — what it unlocks, $5/mo and $50/yr, magic-link auth (no passwords).
- **How to run locally** — `pnpm install`, `pnpm dev`. Env vars listed in `.env.example`.
- **Editorial conventions** — frontmatter spec, the `members_only` flag, the seven pillars, the six post templates.
- **Reading order if you only have 10 minutes** — three links to the anchor essays.

**Top-of-readme badges (small, monochrome):**

- Live site
- Latest build status (Vercel)
- License
- "Rollback budget: 30s · current: ~14s"

---

## 3 · LinkedIn — long-form post

**Title:** Why I built another publication when there are already too many

I run Sage Ideas, where we ship product for people who don't have time for software. After two years, I noticed something: the most valuable work my team did never got written down. It went into Slack threads, post-mortems nobody read, and the heads of three engineers.

So I built a publication. Not a marketing blog. Not a Substack. The thing I actually wanted to read — essays that take craft seriously, tutorials with the working code attached, dispatches short enough to land between meetings.

It's called Sage After Dark.

**The discipline:** nothing ships that can't be rolled back in 30 seconds. The rule applies to the site itself (CI fails any commit whose rollback exceeds the budget) and it applies to my professional opinions in writing (every post has a date, every claim has a source, every essay has a "what I'd update" section after a year).

**The structure:** seven pillars — build, signal, mind, world, taste, learning, and teach. Every post belongs to exactly one. Each pillar has its own color, used only as a hairline marker. The visual language encodes the work; nothing is decorative.

**The economics:** free dispatches go out forever. A small membership tier ($5/mo or $50/yr) unlocks the long versions of tutorials and the full transcripts of dispatches I summarize in public. No tracking, no growth-hacking, no lifecycle email sequences. You can cancel in one click.

The first ten essays are live. The first dispatch went out tonight. If you'd like the late-night email, the link is in the comments.

— Jason

(Comment 1: link to https://www.sageafterdark.com)
(Comment 2: link to the build write-up on sageideas.dev)

---

## 4 · sageideas.dev cross-post — the build write-up

A long-form companion piece for the Sage Ideas site. The HN audience wants the engineering decisions; LinkedIn wants the editorial story; sageideas.dev gets the founder's-perspective build log.

**Title:** Building a publication you'd actually want to read

**Subtitle:** Why Sage Ideas now has a late-night studio, and what it cost to build it the way I wanted.

**Section outline:**

1. **The problem.** The most valuable work my team did was never written down. The publications I read were either marketing dressed as editorial, or editorial dressed as a personal brand. There wasn't a third option, so I built one.
2. **The constraint that shaped everything.** The 30-second rollback rule. How a deploy gate became an editorial principle, and why both versions of the rule live on the same site now.
3. **The design system.** Tactical-editorial. Mono labels, pillar colors as data, hairline rules, no decorative imagery. Why I called the corner-clipped card the "NotchedCard" and what it encodes.
4. **The stack and why each piece earned its keep.** Next.js 15 for the build pipeline, MDX for the content, Tailwind v4 for the design tokens, Supabase for state, Stripe for billing, Resend for email. The piece I almost picked but didn't (and why).
5. **The economics.** $5/mo, $50/yr. Why I priced it at the dinner-out tier instead of the SaaS tier, and what that signals about the audience I'm trying to reach.
6. **What's next.** The publishing cadence (one essay every two weeks, one dispatch a week, a tutorial monthly), the editorial calendar through Q3, and the experiments I'm planning (annual print edition, possible audio version).
7. **What I want from you.** Read the rollback essay. If it lands, subscribe to the dispatches. If you'd consider being a member, the door is at /membership.

**CTA at bottom:**

- Read the publication: [www.sageafterdark.com](https://www.sageafterdark.com)
- Subscribe to dispatches (free): [sageafterdark.com](https://www.sageafterdark.com#subscribe)
- See the source: [github.com/JasonTeixeira/sage-after-dark](https://github.com/JasonTeixeira/sage-after-dark)

---

## 5 · The first dispatch (sent to launch list)

**Subject:** Transmission 001 — Sage After Dark, live.

> ▸ TRANSMISSION 001
>
> The site is live. The doors are open.
>
> Tonight there are ten essays, two tutorials, and six dispatches in the archive. Roughly 30,000 words total. None of them are filler.
>
> If this is your first time on the list, you're getting the dispatches that go out from this address — short, dense, and delivered when something is worth saying. About one a week. Sometimes less. Never more than two.
>
> If you want the long versions — the full tutorials, the unabridged essays, the field notes from inside the day job — there's a members tier at sageafterdark.com/membership. $5/mo, $50/yr, cancel any time. The free feed stays free forever.
>
> Three pieces I'd start with:
>
> 1. **Why we refuse to ship anything that can't be rolled back in 30 seconds** — the rule that the whole site is built around. (sageafterdark.com/mind/why-we-roll-back)
> 2. **The half-life of a good tool** — every tool you adopt this year will go bad in three. The discipline of noticing when. (sageafterdark.com/world/the-half-life-of-a-good-tool)
> 3. **Taste as a deploy gate** — if you can't articulate what 'good' looks like before you ship, you'll discover it in production. (sageafterdark.com/taste/taste-as-a-deploy-gate)
>
> Reply if you want to talk. I read every reply.
>
> — Jason
>
> // SENT FROM SAGE@SAGEAFTERDARK.COM · UNSUBSCRIBE WITH ONE CLICK

---

## Sequencing

**Day 0 (launch day):**

- 7am ET: Push the production deploy. Run smoke checks.
- 8am ET: Email Transmission 001 to the launch list.
- 9am ET: Publish the cross-post on [sageideas.dev](https://www.sageideas.dev).
- 10am ET: Post the LinkedIn long-form. Drop the sageideas.dev link in comment 2.
- 11am ET: Push the polished README to GitHub. Pin the build write-up as the repo description.
- 12pm ET: Submit Show HN. Post the comment immediately.

**Day 1-3:**

- Reply to every HN comment within 2 hours.
- Reply to every email reply within 24 hours.
- Reply to every LinkedIn comment within 24 hours.
- Watch analytics. Note which essays land. Note which don't.

**Week 2:**

- Write a "what I learned launching" dispatch. Send to the list.
- Cross-post to sageideas.dev with the launch metrics.

---

## Measurements

The numbers I'll watch (not the numbers I'll publish):

- New subscribers/day (target: 50/day on launch day, 5/day steady-state)
- Members signed up (target: 10 in week one)
- Time on page for the rollback essay (the bellwether for content quality)
- HN frontpage rank (target: top 30)
- Email reply rate (target: > 2% — this is the only growth signal that matters)
- LinkedIn → sageafterdark.com referral rate (target: 5% of impressions)

If the rollback essay holds attention for > 5 minutes average, the project works. If not, the writing isn't yet what I want it to be, and I should keep editing before pushing harder.
