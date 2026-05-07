# 70 — Infrastructure

The stack, the env, the deploy path, and the gotchas. Read this before touching anything below the content layer.

---

## Stack at a glance

| Layer | Service | Purpose |
| --- | --- | --- |
| Framework | Next.js 14 (App Router) | SSR, MDX, OG images |
| Hosting | Vercel | Production + preview deploys |
| DB | Supabase (Postgres) | Members, event log, password resets |
| Auth | Custom over Supabase RPC | Email + password, admin allowlist |
| Payments | Stripe (LIVE) | $5/month membership |
| Email | Resend (via Pipedream) | Magic links, password reset, receipts |
| Repo | GitHub `JasonTeixeira/sage-after-dark` | main is deployed |

---

## Repo layout

```
sage-after-dark/
├── CLAUDE.md                   # agent entry point
├── docs/                       # this directory — handoff docs
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # public pages: home, archive, about, etc.
│   │   ├── [pillar]/[slug]/    # post route — paywall lives here
│   │   ├── api/                # webhook + auth routes
│   │   ├── account/            # member dashboard
│   │   └── login/              # auth flows
│   ├── components/             # 55+ components, single import surface
│   │   ├── index.ts            # barrel — DO NOT export SiteHeader from here
│   │   └── diagrams/           # one file per signature diagram
│   ├── content/
│   │   ├── _templates/         # MDX boilerplates per template kind
│   │   ├── posts/              # 23+ published MDX files
│   │   └── schema.ts           # Zod schema for frontmatter
│   └── lib/
│       ├── admin-guard.ts      # isAdminEmail — admin allowlist
│       ├── tokens.ts           # color/motion/space tokens
│       ├── supabase/           # server + client helpers
│       └── stripe/             # checkout + webhook helpers
├── public/                     # static assets, fonts
└── package.json
```

---

## Environment variables

All env is managed in Vercel project settings. Local dev reads from `.env.local` (git-ignored).

### Required for build

| Var | Where used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | OG, canonical | `https://www.sageafterdark.com` in prod |
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client | Anon key, safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | Bypass RLS — never expose |
| `STRIPE_SECRET_KEY` | server only | Live key, `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | webhook handler | `whsec_...` for endpoint `we_1TTWniEGpp4mxtd4iqxhrAOl` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | checkout | `pk_live_...` |
| `RESEND_API_KEY` | server only | Used via Pipedream proxy |
| `ADMIN_EMAILS` | `lib/admin-guard` | Comma-separated allowlist |

### How to update

```bash
npx vercel env add VAR_NAME production --token "$VERCEL_TOKEN"
```

Use `api_credentials=["vercel"]`. After adding, redeploy main for the change to take effect.

---

## Supabase

**Project ID:** `hocrntqhgvmeaxwlhzwl`

### Tables

| Table | Purpose |
| --- | --- |
| `sage_after_dark_members` | One row per paying member. Columns: `id`, `email`, `stripe_customer_id`, `stripe_subscription_id`, `status` (`active` / `canceled` / `past_due`), `plan` (`monthly`), `password_hash`, `created_at`, `updated_at` |
| `stripe_event_log` | Append-only log of every webhook event Stripe delivered. Used for idempotency + audit. |
| `password_reset_tokens` | Single-use tokens for password reset. Expires in 1 hour. |

### RPCs

- `sage_after_dark_set_password(p_email, p_password)` — hashes and stores password for a member. Returns `true` if member exists.
- `sage_after_dark_check_password(p_email, p_password)` — verifies on login. Returns member row or null.

### Row-level security

All tables have RLS enabled. Server uses service-role key to bypass. **Never** use service-role key in client code.

### Common queries

```sql
-- Active members
select email, status, created_at from sage_after_dark_members where status = 'active';

-- Recent webhook events
select event_id, event_type, received_at from stripe_event_log order by received_at desc limit 20;
```

---

## Stripe

**Account:** Sage After Dark (live).

> ⚠️ The Stripe MCP connector connects to a *different* account (`acct_1QOltHEDeyGfkojJ`, Nexural.io). It can't manage SAD. To manage SAD live, use the Stripe CLI or REST API with a restricted key.

### Product / Price

- One product: "Sage After Dark Membership"
- One price: $5.00 USD / month, recurring

### Webhook

- Endpoint ID: `we_1TTWniEGpp4mxtd4iqxhrAOl`
- URL: `https://www.sageafterdark.com/api/stripe/webhook`
- Subscribed events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
- Signing secret stored as `STRIPE_WEBHOOK_SECRET`

### Webhook handler logic (`src/app/api/stripe/webhook/route.ts`)

1. Verify signature using `STRIPE_WEBHOOK_SECRET`.
2. Idempotency: insert event into `stripe_event_log`. If unique-key collision, return 200 and exit.
3. Dispatch on `event.type`:
   - `checkout.session.completed` → upsert member, mark `active`.
   - `customer.subscription.updated` → update `status`, `plan`.
   - `customer.subscription.deleted` → mark member `canceled` (or hard-delete row, depending on policy).
4. Respond 200. Stripe retries any non-2xx for up to 3 days.

> ⚠️ **DO NOT** modify the `subscribe` flow, `upsertMember` helper, or webhook handler without a full E2E test. They were verified end-to-end on the live account; breaking them silently breaks payments.

### How to drive Stripe from this environment

```bash
export STRIPE_API_KEY="rk_live_..."   # restricted key, scoped per-task
curl -u "$STRIPE_API_KEY:" https://api.stripe.com/v1/customers
```

Or:

```bash
stripe --api-key "$STRIPE_API_KEY" customers list --limit 5
```

The Stripe CLI is installed at `/usr/local/bin/stripe` (v1.21.8).

> ⚠️ **Restricted keys are scoped and rotated.** If a prior session created one, assume it's been rolled. Ask the user before assuming a key still works.

> ⚠️ **Known issue:** Stripe Dashboard cancel/refund actions have silently failed to persist in this account before. If the user reports they "did it in the dashboard" but the data doesn't reflect, verify via API and redo via CLI.

---

## Auth

Custom auth, not Supabase Auth.

### Login flow

1. User submits email + password to `/api/auth/login`.
2. Server calls `sage_after_dark_check_password` RPC.
3. If valid and `status = active`, set signed cookie (`sad_session`).
4. Cookie is read on every request via `lib/auth/session.ts`.

### Admin bypass

`src/lib/admin-guard.ts` exports `isAdminEmail(email)` which checks against `ADMIN_EMAILS`. The post page (`src/app/[pillar]/[slug]/page.tsx`) checks admin **before** member status — admin always sees full content, even without a paid membership.

> ⚠️ This bypass is critical for content QA. Don't refactor it out.

### Password reset

1. User requests reset → server generates token, stores in `password_reset_tokens`, sends Resend email.
2. User clicks link → server verifies token → user submits new password → server calls `sage_after_dark_set_password`.

---

## Vercel

- Project: `sage-after-dark` under user's personal scope.
- Production branch: `main`.
- Preview deploys: every other branch + every PR.
- Build command: `npm run build` (Next.js default).
- Output: `.next/`.
- Node version: 20.x.

### Deploys

```bash
npx vercel --token "$VERCEL_TOKEN" --yes --prod
```

Use `api_credentials=["vercel"]`. Auto-deploys on push to main, but manual deploys are allowed for debugging.

### Domain

- Apex: `sageafterdark.com` redirects to `www.sageafterdark.com`.
- Both managed by Vercel.

---

## Resend (email)

Routed through Pipedream connector (`resend__pipedream`). Templates are inline in `src/lib/email/`.

Transactional emails:

- Welcome (sent on `checkout.session.completed`)
- Password reset
- Receipt (Stripe handles natively; we don't duplicate)

---

## Build & deploy commands

| Action | Command |
| --- | --- |
| Local dev | `npm run dev` |
| Build | `npm run build` (timeout 300000ms) |
| Type check | `npm run typecheck` |
| Lint | `npm run lint` |
| Deploy prod | `npx vercel --token "$VERCEL_TOKEN" --yes --prod` |
| List deploys | `npx vercel ls --token "$VERCEL_TOKEN"` |

---

## Common gotchas

1. **`SiteHeader` is server-only.** Don't export it from `@/components` barrel. Import the direct path if needed.
2. **No `Math.random()` or `new Date()` in render** without `suppressHydrationWarning`. Causes hydration mismatch.
3. **No `\u00b7` escapes in JSX/template strings.** Type the middle dot or use `&middot;`.
4. **Admin allowlist is comma-separated**, not JSON. Trim whitespace.
5. **Stripe price ID is hardcoded** in `lib/stripe/checkout.ts`. If you create a new price for any reason, update it here.
6. **Webhook idempotency key** is `event_id`, not `event.id` — easy to typo.
7. **MDX template kind must match the schema discriminator**, or Zod validation throws on build.
8. **Vercel caches `node_modules` aggressively.** If a dep upgrade isn't taking, redeploy with cache cleared.
9. **Supabase service-role key has been rotated before.** If queries 401, re-fetch the key from the Supabase dashboard and update `SUPABASE_SERVICE_ROLE_KEY` in Vercel.
10. **OG image generation is at build time.** New posts won't have OG cards until the next deploy.

---

## Disaster recovery

| Scenario | Action |
| --- | --- |
| Prod down | Roll back via Vercel (`Deployments → previous → Promote`). |
| Webhook flooding errors | Check `stripe_event_log` for idempotency working. Pause endpoint in Stripe Dashboard if needed. |
| Member can't log in | Check `sage_after_dark_members` for their email + `status = active`. Reset password via RPC if needed. |
| Refund needed | `stripe refunds create -d charge=ch_...` via CLI, then verify member row is canceled. |
| Lost domain | Vercel → Settings → Domains. DNS at registrar. |

---

## Connectors used in this environment

When working on this repo from Computer:

| Connector | Use for |
| --- | --- |
| `github` | All `git`/`gh` commands. Never `browser_task` for repo work. |
| `vercel` | All `vercel` CLI commands. |
| `supabase` | DB queries, RPC calls. |
| `stripe` | **Only** for read operations on Nexural account. Use Stripe CLI with restricted key for SAD. |
| `resend__pipedream` | Send transactional emails. |
| `notion_mcp` | Notes, drafts, planning docs. |
