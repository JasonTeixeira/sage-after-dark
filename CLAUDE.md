# CLAUDE.md — Sage After Dark agent entry point

> **For Claude Code, future agents, and any human picking this up cold.**
> Read this file first. It points to everything else.

This is the after-hours notebook of a one-person studio — a tactical-editorial publication on software, taste, psychology, and the slow internet. The site is **live at [www.sageafterdark.com](https://www.sageafterdark.com)** in production with real members and real revenue, so any change you make ships to a real audience.

## Read these in order before doing anything

1. **[`docs/00-OVERVIEW.md`](docs/00-OVERVIEW.md)** — what this site is, who it's for, what success looks like
2. **[`docs/10-VOICE.md`](docs/10-VOICE.md)** — the voice, what's on-brand vs. off-brand, sentence patterns to use, things never to write
3. **[`docs/20-CONTENT-TEMPLATES.md`](docs/20-CONTENT-TEMPLATES.md)** — six post archetypes with concrete structure rules
4. **[`docs/30-DESIGN-SYSTEM.md`](docs/30-DESIGN-SYSTEM.md)** — colors, type, every component, when to use each
5. **[`docs/40-DIAGRAMS.md`](docs/40-DIAGRAMS.md)** — every diagram in the system + how to design new ones
6. **[`docs/50-STORY-ARCS.md`](docs/50-STORY-ARCS.md)** — narrative arcs, pillar themes, the post backlog
7. **[`docs/60-WORKFLOWS.md`](docs/60-WORKFLOWS.md)** — how to ship a post end-to-end
8. **[`docs/70-INFRASTRUCTURE.md`](docs/70-INFRASTRUCTURE.md)** — stack, env vars, deploy, Stripe, Supabase, gotchas
9. **[`docs/80-EDITORIAL-CHECKLIST.md`](docs/80-EDITORIAL-CHECKLIST.md)** — pre-publish QA — every post passes this before merging
10. **[`docs/post-template.mdx`](docs/post-template.mdx)** — fork this when starting a new essay

## The five rules that override everything

1. **Quality > velocity.** This is a paid product. A bad post is worse than no post. If you can't write something with a real receipt — a screenshot, a number, a scene — don't write it.
2. **Specific beats abstract.** Always. "Tuesday at 11:47am, the deploy failed because someone had set `MAX_CONNECTIONS=10` in 2019" beats "deployments can be fragile" every single time.
3. **Voice is sacred.** The voice is described in [`10-VOICE.md`](docs/10-VOICE.md). Read it before writing a single sentence. The voice is the moat.
4. **The design system is the brand.** Don't invent components. Use the ones in `src/components/`. If a post needs something that doesn't exist, add it to the system properly — see [`30-DESIGN-SYSTEM.md`](docs/30-DESIGN-SYSTEM.md).
5. **Run the editorial checklist before declaring "done".** [`80-EDITORIAL-CHECKLIST.md`](docs/80-EDITORIAL-CHECKLIST.md). Every box. Every time.

## Three things that have bitten us before

- **Don't use `Math.random()` or `new Date()` at render time** without `suppressHydrationWarning`, or the SSR/CSR markup will mismatch and React will scream.
- **Don't export `SiteHeader` from `@/components`** barrel — it depends on `next/headers` and is server-only. Import it directly from `./site-header`.
- **Don't touch the Stripe webhook handler, `upsertMember`, or the subscribe API** without understanding the whole pipeline. They have idempotency keys and signature verification that took a long time to get right. See [`docs/70-INFRASTRUCTURE.md`](docs/70-INFRASTRUCTURE.md#stripe).

## Author identity for git commits

Always commit as the owner:

```bash
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" commit -m "..."
```

## Tone-of-commit examples

- ✅ `feat(curriculum): paid post #5 — when to quit a tool`
- ✅ `fix(paywall): admin always bypasses members-only gate`
- ✅ `docs: master handoff suite for editorial agents`
- ❌ `update stuff`
- ❌ `WIP`

## When in doubt

- **About content:** read three published essays in the same pillar before writing a new one. The pattern emerges.
- **About design:** open the live site, copy the structure of an existing page that solves the same problem.
- **About code:** check if a component already exists; if it doesn't, design it as a primitive that the next post can also reuse.
- **About voice:** if the sentence could appear on any tech blog, rewrite it.

— Jason
