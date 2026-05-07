# 00 · Overview — what Sage After Dark is

## One-sentence pitch

Sage After Dark is the **after-hours notebook of a one-person studio** — a tactical-editorial publication on software, taste, psychology, and the slow internet, written by Jason Teixeira (sageideas.dev).

## Who it's for

The reader we're writing for has these properties:

- **Builds software for a living** — engineer, founder, designer-who-codes, technical PM
- **Has been doing it for 5+ years** — past the "how do I deploy?" phase, into the "how do I think about this?" phase
- **Reads on weeknights, after the kids/dogs/standups are done** — the name is literal
- **Is suspicious of hype** — was burned by a JS framework once and remembers it
- **Wants prose that's earned**, not templated; specifics, not generalizations
- **Will pay $5/month for the good stuff** — and they have

We are NOT writing for:
- Junior devs looking for "how do I do X" tutorials (those go elsewhere — we link out)
- "AI thought leaders" looking for thought-leadership cliches
- Skimmers looking for listicles. Our average post is 2,500–4,000 words and that's a feature.

## What success looks like

- **Voice is unmistakable.** A reader can pick a Sage After Dark essay out of a paragraph from any other tech blog. The sentence patterns, the structure, the tone — all signature.
- **Members feel they're getting something they can't get elsewhere.** Paid posts are arguments and frameworks they will *use*, not summaries of what's already out there.
- **Compounding back-catalogue.** Posts age like wine. The half-life is years, not days. We never write to the news cycle.
- **Visible motion.** /now updates within 14 days. Counters tick live. Field notes ship monthly. The site never feels frozen.

## Cadence (target)

| Slot | When | Length | Pillar | Free? | Bucket |
|---|---|---|---|---|---|
| Field note | last Sunday of the month | 600–800 words | signal | free | dispatch newsletter |
| Paid essay | every 7–10 days | 2,500–4,000 words | mind / build / taste / learning | members-only | flagship |
| Free essay | once a quarter | 1,500–2,500 words | any | free | discovery / SEO |
| Dispatch | as needed | 200–500 words | signal / build | free | one-idea micro-post |
| Tutorial | quarterly | 1,200–2,000 words | teach | free or members | how-to with steps |
| Arc episode | weekly during an arc | 1,000–1,800 words | build / signal | members | numbered series |
| Annual | December | book-length | special | free | year-in-review microsite |

## The pillar system

Seven pillars, each with a color and a tone. Pillars are defined in `src/lib/tokens.ts` and enforced by `src/content/schema.ts`.

| Pillar | Color | Used for |
|---|---|---|
| **build** | cyan #00E5FF | engineering, infrastructure, tooling, production craft |
| **signal** | ember #F59E0B | dispatches, status, monthly retros, what's on |
| **mind** | violet #A78BFA | psychology, philosophy of work, attention, identity |
| **world** | green #34D399 | industry observations, market reads, ecosystem |
| **taste** | pink #F472B6 | aesthetics, art, music, films, what makes things good |
| **learning** | lime #A3E635 | meta-learning, skill decay, curriculum, half-lives |
| **teach** | gold #EAB308 | tutorials, how-tos, step-by-step rebuildables |

A post lives in exactly one pillar. If it could fit two, the better fit usually wins via the question: *what does the reader need to be in the mood for to enjoy this?*

## Active series

- **Late-Night Curriculum** (`series.slug = "late-night-curriculum"`) — flagship paid series. 9 essays planned. Each is a free-standing argument that works alone, but together form a worldview about how to build a long career in software without being eaten by churn.
- **Trayd, In Public** (arc) — building a real product in real time, with real numbers.

## Where to look in the repo

```
src/
├── app/                    # Next.js App Router
│   ├── [pillar]/[slug]/    # Essay pages (the main thing)
│   ├── api/                # Stripe webhook, OG images, analytics, Resend
│   ├── account/            # Member account/login
│   ├── archive/            # Filterable index
│   └── (everything else)
├── components/             # 60+ design-system components
├── content/
│   ├── posts/              # Every published .mdx file
│   ├── _templates/         # Boilerplate per template kind
│   ├── schema.ts           # Frontmatter Zod schema
│   ├── loader.ts           # Reads MDX → typed posts
│   ├── mdx-components.tsx  # Maps MDX tags → components
│   └── site-data.ts        # NOW, ARCS, PRODUCTS, NOW_PLAYING
└── lib/
    ├── tokens.ts           # Design tokens (colors, motion)
    ├── stripe.ts           # Stripe client + price IDs
    ├── supabase.ts         # Member CRUD + RPCs
    └── auth.ts             # Session cookie

docs/                       # YOU ARE HERE — the handoff suite
_drafts/                    # Old planning docs (still useful, see 50-STORY-ARCS)
supabase/                   # SQL migrations
public/                     # Static assets, monogram, favicons
```

## The non-negotiables

These are taste decisions that should never quietly drift:

1. **No `you'll learn how to` openings.** Show, don't promise.
2. **No filler transitions** ("Let's dive in", "In this post", "First off").
3. **No emojis in body copy.** Anywhere. Even one ruins the voice. (The site UI uses iconography sparingly; that's not the same thing.)
4. **No "thought leader" abstractions** without an immediate concrete receipt.
5. **No "the future of X"** unless the next sentence has a date and a specific testable claim.
6. **No "AI is going to" sentences** without naming a system, a number, and an observed behavior. We earned the right to opinions; we did not earn the right to vibes.

## The invariants

- **Lighthouse 95+** on every published page (perf + a11y + best practices + SEO).
- **No horizontal overflow** at 320 / 375 / 768 / 1024+.
- **WCAG AA contrast** on every text/background combo.
- **Every post has a frontmatter that passes Zod validation** (see `src/content/schema.ts`).
- **Every paid post has a free preview before the gate** that gives the reader the *thesis* — they shouldn't have to pay to know what they're paying for.

— Continue to [`10-VOICE.md`](10-VOICE.md).
