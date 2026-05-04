# Show HN: Sage After Dark — a tactical-editorial publication, built solo

I built **Sage After Dark** ([sageafterdark.com](https://www.sageafterdark.com)) — a one-person studio's after-hours notebook on software, taste, and the craft of shipping. It's the publication I always wanted to read: opinionated essays, field notes from real production work, and a few interactive tools that earn the link.

## What it is

A tactical-editorial site with seven content pillars (build, signal, mind, world, taste, learning, teach) — currently 17 essays/dispatches/field-notes — wrapped in a dark, terminal-inspired design system that I built from scratch. Original SVG diagrams, custom typography stack, full RSS/Atom/JSON feeds, real subscribe → magic-link → Stripe membership flow, and privacy-first analytics.

## Things I shipped that I'm proud of

- **`/tools/30-second-rollback`** — generates a deployable rollback runbook from your incident details. Localstorage draft, copy-as-Markdown, print-ready. ([try it](https://www.sageafterdark.com/tools/30-second-rollback))
- **Edge middleware short links** — 15 curated `/r/<code>` redirects on the edge (e.g. `/r/taste`, `/r/halflife`).
- **Privacy-first analytics** — pageviews, scroll milestones, read completion, dwell time. No cookies, no fingerprints. Daily-rotated salted hash. Honors DNT/GPC. Powered by Supabase RPCs (anon key only — service role never touches the codebase).
- **Stripe with idempotency** — webhook idempotency table prevents double-processing on retries.
- **Pagefind-style full-text search** — server-rendered index includes post bodies, client-side fuzzy match, snippets around the hit.
- **Konami code easter egg** — try `↑↑↓↓←→←→BA` on any page.

## Stack

Next.js 16 (App Router) · Tailwind v4 (zero config beyond `@theme`) · MDX with custom components · Supabase (RPCs, never service role) · Stripe (live mode, idempotent) · Resend (transactional + welcome) · Vercel (edge + serverless) · Cusdis (privacy-first comments).

## Numbers

- Lighthouse mobile (cold): Performance 99 · Accessibility 100 · Best Practices 100 · SEO 100
- TTI < 1.5s on a Moto G4 emulation
- 17 prerendered pages, ~50 routes total
- Zero third-party trackers, zero cookies for visitors

## What I'd love feedback on

1. The reading experience — does it feel like a real publication or a blog template?
2. The membership offer — annual ($72) or monthly ($9), gates one essay per pillar.
3. Whether the analytics opt-in / DNT story feels right.

Code: a private repo, but happy to share architecture details. Ask me anything.

— Jason ([sageideas.dev](https://sageideas.dev))
