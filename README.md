# Sage After Dark

The after-hours notebook of a one-person studio. A tactical-editorial publication on software, taste, psychology, and the slow internet — written by Jason Teixeira ([sageideas.dev](https://sageideas.dev)).

🌐 **Live:** [www.sageafterdark.com](https://www.sageafterdark.com)
📦 **Repo:** [github.com/JasonTeixeira/sage-after-dark](https://github.com/JasonTeixeira/sage-after-dark)
🚀 **Deploy:** Vercel · `sage-ideas/sage-after-dark`

---

## Stack

- **Framework:** Next.js 15 (App Router) · React 19 · TypeScript
- **Styling:** Tailwind v4 · Geist Sans + Geist Mono (Geist Mono used for editorial display)
- **Content:** MDX with custom components
- **Search:** Client-side full-text with snippet rendering
- **Database:** Supabase (analytics, members, dispatch)
- **Payments:** Stripe (live, idempotent webhooks)
- **Email:** Resend (newsletter + AMA inbox)
- **Comments:** Cusdis (privacy-first, optional Giscus fallback)
- **Hosting:** Vercel · Edge middleware for `/r/[code]` short links

## Local development

```bash
npm install
npm run dev
# → http://localhost:3000
```

Build + typecheck:

```bash
npx tsc --noEmit
npm run build
```

## Architecture

```
src/
├── app/                    # App Router routes
│   ├── (pillar)/[slug]/    # Essay pages (build, signal, mind, world, taste, learning, teach)
│   ├── archive/            # Filterable index w/ activity heatmap
│   ├── ask/                # AMA submission form (Resend)
│   ├── tools/30-second-rollback/  # Interactive tool
│   ├── annual/2025/        # Year-in-review microsite
│   ├── dispatch/           # Newsletter archive
│   └── api/                # Stripe webhook, OG images, analytics ingest, Resend
├── components/             # 60+ tactical components (NotchedCard, TacticalStrip, etc.)
├── content/                # MDX essays + frontmatter pipeline
└── lib/                    # Supabase, Stripe, content loaders
```

## Design system

- **Backgrounds:** `bg-ink-0` (#05070A), `bg-ink-1` (#0A0E14), `bg-ink-2` (#11161E)
- **Text:** `text-bone` (#E8E6E0), `text-mute` (#8A8F98), `text-faint` (#7A828F)
- **Borders:** `border-rule` (#1C232E), `border-rule-hi` (#2A3340)
- **Accent:** `text-cyan`/`bg-cyan` (#00E5FF), `text-ember` (#F59E0B)
- **Pillar colors:** build=cyan · signal=ember · mind=#A78BFA · world=#34D399 · taste=#F472B6 · learning=#A3E635 · teach=#EAB308

## Quality

Lighthouse production audit (2026-05-04):

| Route                            | Performance | A11y | Best Practices | SEO |
|----------------------------------|------------:|-----:|---------------:|----:|
| `/`                              | 96          | 100  | 100            | 100 |
| `/archive`                       | 94          | 100  | 100            | 100 |
| `/about`                         | 96          | 100  | 100            | 100 |
| `/taste/taste-as-a-deploy-gate`  | 94          | 100  | 100            | 100 |

- WCAG AA contrast across all routes
- Zero horizontal overflow at 320 / 375 / 768 / 1024+
- Skip link, keyboard nav, focus rings throughout
- Privacy-first analytics (no cookies, no IDs, daily-rotated SHA256 hash)

## Environment variables

Set in Vercel → Settings → Environment Variables → Production.

### Required (already set)

```
SESSION_SECRET
RESEND_API_KEY
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### Final 3 keys to flip on memberships + newsletter

```
STRIPE_SECRET_KEY        sk_live_…   (Stripe → Developers → API keys)
STRIPE_WEBHOOK_SECRET    whsec_…     (Stripe → Webhooks → Add endpoint)
RESEND_AUDIENCE_ID                    (Resend → Audiences)
```

**Stripe webhook endpoint to register:**
- URL: `https://www.sageafterdark.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

### Optional polish

```
NEXT_PUBLIC_CUSDIS_APP_ID    Turns on comments under essays
NEXT_PUBLIC_CUSDIS_HOST      Default https://cusdis.com
ANALYTICS_SALT               Any random string; rotates the daily privacy hash
```

After adding the 3 keys, redeploy the latest production build in Vercel so the runtime picks them up.

## Launch posts

Drafts ready to publish:
- `_drafts/show-hn.md` — Show HN announcement
- `_drafts/linkedin-launch.md` — LinkedIn launch post

## Connectors / integrations

- **GitHub** — push via connector
- **Vercel** — production deploys
- **Supabase MCP** — schema migrations + analytics
- **Resend (Pipedream)** — newsletter + AMA forwarding
- **Stripe** — live membership + webhook idempotency

## Phases shipped

- **P12** — Sticky bar + hero email capture + double-opt-in confirm
- **P13** — Magazine layout, sign-off, related rail, sidenotes
- **P14** — 404, parchment reading mode, side reticles
- **P15** — Best-of, tags, field notes
- **P16** — /tools, /ask, /dispatch, share buttons, Pipedream auto-cross-post, /r/[code] short links
- **P17** — 4 hand-built SVG diagrams, About rebuild, monogram + favicon
- **P18** — Supabase analytics, Cusdis comments, full-text search, next/image pipeline, Stripe live wiring
- **P19** — A11y pass, mobile pass to 320px, Lighthouse 99+, launch post drafts
- **P20** — Editorial display switched from Instrument Serif → Geist Mono (modern terminal)

---

© 2026 Sage Ideas LLC · MIT License
