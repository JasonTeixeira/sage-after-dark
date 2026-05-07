# 60 — Workflows

How to ship a post end-to-end. Follow this sequence. Don't skip steps.

---

## 0. Decide what to write

Before you open the editor, answer four questions in one sentence each:

1. **Pillar** — build, signal, mind, world, taste, learning, or teach? (See `30-DESIGN-SYSTEM.md` for color tokens.)
2. **Template** — essay, tutorial, field_note, dispatch, arc_episode, or annual? (See `20-CONTENT-TEMPLATES.md`.)
3. **Access** — `public` (free) or `members` (paywalled)?
4. **Promise** — what does the reader walk away with? One sentence. If you can't write it, the post isn't ready.

If the post belongs to an arc, also pick:
- Arc slug (e.g. `late-night-curriculum`)
- Episode number (next available)

See `50-STORY-ARCS.md` for the active arcs and the backlog.

---

## 1. Draft prose first, in plain text

Open a scratch file. **Don't write MDX yet.** MDX components are scaffolding — they tempt you to fake structure when the writing is weak.

Write the body in this order:

1. **Cold open** — one scene, 2–4 sentences. No throat-clearing. (See `10-VOICE.md` § Cold opens.)
2. **The thesis** — one sentence, somewhere in the first 200 words.
3. **The middle** — argument, list, walkthrough, whatever the template calls for. Scenes, not abstractions.
4. **The diagnostic** — for essays/field_notes, end with a short list the reader can run on themselves tomorrow.
5. **The signoff** — one line. Quiet. Don't sell the next post.

Read it out loud. If a sentence is hard to say, cut it.

---

## 2. Pick the diagram

Every paid post earns one signature diagram. Free posts can skip it.

- Open `40-DIAGRAMS.md` and find the closest archetype (decay curve, two-axis quadrant, timeline, layered stack, etc.).
- Sketch on paper or in Figma first. Confirm it teaches one idea before you build it.
- Build it as a React component in `src/components/diagrams/<PostSlug>Diagram.tsx`. Pure SVG, no animation libs.
- Wire it into the MDX body via `<PostSlugDiagram />` after the first major section.

If the diagram doesn't add information the prose lacks, **delete it**. A weak diagram is worse than none.

---

## 3. Fork the template

```bash
cp src/content/_templates/essay.mdx.template src/content/posts/<slug>.mdx
```

Replace the template kind to match your post (`essay`, `tutorial`, `field_note`, `dispatch`, `arc_episode`, `annual`).

For a quick start, also see `docs/post-template.mdx` in this docs folder — a stripped-down skeleton with the most common frontmatter fields and component usage.

---

## 4. Fill the frontmatter

Frontmatter is validated by `src/content/schema.ts` (Zod). The build will fail loudly if anything is missing or wrong-shaped. **Authoritative source of truth is the schema** — if this doc and the schema disagree, the schema wins.

Required across all kinds:

```yaml
---
title: "Why I don't use a productivity system"
dek: "One sub-headline sentence that earns the click without spoiling the punchline."
slug: "why-i-dont-use-a-productivity-system"
template: essay
pillar: mind                # build · signal · mind · world · taste · learning · teach
tags: ["systems", "attention", "candor"]
published: "2026-05-08"     # ISO date, UTC
status: published          # draft · published · archived
featured: false
members_only: true         # true = paywalled, false = public
related:
  - "the-half-life-of-a-skill"
  - "taste-is-the-last-moat"
---
```

Arc / series episodes also need:

```yaml
series:
  slug: "late-night-curriculum"
  title: "Late-Night Curriculum"
  order: 5
```

**Slug rules:** lowercase, hyphens, no stop words you can drop, max ~60 chars. Slugs are immutable once shipped — they're the canonical URL.

**Date rules:** `published` is the date you intend to ship, in ISO. Combined with `status: published`, the post will render on prod after deploy.

---

## 5. Write the MDX body

Use components from `@/components` (single import surface — see `src/components/index.ts`). Common ones:

- `<DropCap>F</DropCap>` — first letter of the cold open.
- `<Sidenote>...</Sidenote>` — 2–3 per post, no more.
- `<FieldCard title="..." />` — 1–2 per essay.
- `<PullQuote>...</PullQuote>` — once, max.
- `<Diagnostic items={[...]} />` — for the closing self-check.
- `<PostSlugDiagram />` — the signature diagram.

**Never** import `SiteHeader` from the barrel — it's server-only. Use the direct path if you ever need it.

**Never** use `Math.random()` or `new Date()` at render time without `suppressHydrationWarning` — it breaks SSR.

**Never** type `\u00b7` literally in JSX or template strings. Type the middle dot character or use `&middot;`.

---

## 6. Preview locally

```bash
cd /home/user/workspace/sage-after-dark
npm run dev
```

Open the post URL: `http://localhost:3000/<pillar>/<slug>`.

Check:

- Cold open lands on first screen without scrolling on a 1280×800 viewport.
- Drop cap renders and aligns to the second line.
- Diagram is centered, captioned, and not pixelated on retina.
- Sidenotes float right on desktop, inline on mobile.
- Footnote numbers match.
- Reading time matches `readingMinutes` ±10%.

If you can, run reading mode (`?reading=1`) and verify the post still works stripped of chrome.

---

## 7. Run the editorial checklist

Open `80-EDITORIAL-CHECKLIST.md` and run every item. Don't skip. The checklist is the difference between a post that reads professional and one that reads like a draft.

---

## 8. Build

```bash
npm run build
```

Timeout 300000ms. The build:

- Validates every frontmatter object against the Zod schema.
- Generates the OG image for the post.
- Builds the archive, pillar pages, and arc index.
- Type-checks the diagram component.

If the build fails, fix it locally. **Never** push a broken build to main.

---

## 9. Commit

```bash
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" \
  add src/content/posts/<slug>.mdx src/components/diagrams/<PostSlug>Diagram.tsx
git -c user.email="sage@sageideas.org" -c user.name="Jason Teixeira" \
  commit -m "post: <slug> (<pillar>, #<episode> of <arc>)"
```

Commit message template:

- New post: `post: <slug> (<pillar>)` or `post: <slug> (<pillar>, #N of <arc>)`
- Diagram only: `diagram: <slug>`
- Voice/style fix: `edit(<slug>): <one-line reason>`
- Schema/component change: `schema: ...` or `feat(<component>): ...`

Email and name are required exactly as above. CI will reject commits with other identities.

---

## 10. Push

Use the GitHub connector with `api_credentials=["github"]`. Never `browser_task` for this.

```bash
git push origin main
```

Vercel auto-deploys main. Watch the deployment in the Vercel dashboard or via CLI:

```bash
npx vercel ls --token "$VERCEL_TOKEN"
```

with `api_credentials=["vercel"]`.

---

## 11. Verify on prod

Once Vercel reports "Ready":

1. Open `https://www.sageafterdark.com/<pillar>/<slug>` in incognito.
2. If `access: members`, confirm the paywall renders correctly for a logged-out reader.
3. Log in as a test member and confirm the full body loads.
4. Log in as admin and confirm bypass works (admin always sees full content — see `70-INFRASTRUCTURE.md`).
5. Check the OG card: `https://www.sageafterdark.com/<pillar>/<slug>/opengraph-image`.
6. Check the archive page picks up the new post.
7. If it's an arc episode, check the arc index page and the previous/next nav on the post.

---

## 12. Post-publish housekeeping

- If the post belongs to an arc, update `50-STORY-ARCS.md` to mark this episode shipped and bump the next one to `📝 NEXT`.
- If the post introduces a new motif, sidenote pattern, or component, update the relevant doc (`10-VOICE.md`, `30-DESIGN-SYSTEM.md`).
- If a typo or fact-error is reported within 48 hours, fix and re-deploy. Past 48 hours, only fix structural errors — small typos are part of the texture.

---

## Special workflows

### Republishing / unpublishing
- To unpublish, set `status: archived` (or change `published` to a future date) and redeploy. Don't delete the file — it breaks inbound links.
- To rename, **don't**. Slugs are immutable. Add a 301 in `next.config.js` if you absolutely must.

### Free → paid (or reverse)
Toggle `members_only:` and redeploy. The post URL doesn't change. Members see no difference; non-members will hit the paywall on next request.

### Series teasers
A free post inside a paid arc gets `members_only: false` but keeps the `series` frontmatter. The arc index will show it as ungated. (See post #4 of Late-Night Curriculum for the precedent.)

### Hot fixes
Small style/copy fixes can go straight to main. Anything that touches schema, payments, or auth: branch, PR, review.

---

## What never goes into a post

- Founder face, voice, video.
- Stock photography.
- Engagement hooks ("hit subscribe", "let me know in the comments").
- Calls to action that aren't the membership CTA.
- Footers from other newsletters / inspiration sources verbatim.
- Lorem ipsum that survives to prod. Search the build output for `lorem` before you push.
