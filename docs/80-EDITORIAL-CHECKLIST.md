# 80 — Editorial Checklist

Run every item before you commit. The checklist is what separates a draft from a publishable post.

If an item doesn't apply (e.g. a free post with no diagram), skip and note why in the commit message.

---

## A. Voice & tone

- [ ] **Cold open** — first 2–4 sentences are a scene, not a thesis. No "In this post…".
- [ ] **Thesis** — one clear sentence somewhere in the first 200 words.
- [ ] **First person used sparingly.** I appears, but the post isn't about me.
- [ ] **No throat-clearing.** Cut "I want to talk about", "Let me start by", "It's important to note".
- [ ] **No engagement bait.** No "subscribe", "comment below", "what do you think".
- [ ] **Read out loud.** Every sentence should be sayable. Cut what isn't.
- [ ] **Tone matches pillar.** (See `10-VOICE.md`. Build is dry; mind is candid; taste is restrained; world is observed.)
- [ ] **No founder face / voice / video.** Ever.

---

## B. Structure

- [ ] **One promise.** The post does one thing. If you can't write the promise in one sentence, restructure.
- [ ] **Section breaks earn their place.** Every `##` heading is a turn in the argument, not a list of things.
- [ ] **Diagnostic at the end** for essays and field notes. The reader walks away with something to do.
- [ ] **Signoff is one line.** No "until next time", no teaser for the next post.
- [ ] **Length matches template.** (Essay 2,500–4,000 words; field note 800–1,200; tutorial 1,500–2,500; teaser 600.)
- [ ] **Reading time** in frontmatter matches actual reading time ±10%. Test at ~225 wpm.

---

## C. Frontmatter

- [ ] `slug` is lowercase, hyphenated, ≤60 chars, and unique. Matches `^[a-z0-9]+(-[a-z0-9]+)*$`.
- [ ] `template` matches the post kind exactly (essay / tutorial / field_note / dispatch / arc_episode / annual).
- [ ] `pillar` is one of build/signal/mind/world/taste/learning/teach.
- [ ] `members_only` is set explicitly (`true` or `false`).
- [ ] `published` is the intended ship date in ISO format.
- [ ] `status` is `published` (not `draft`) when shipping.
- [ ] `dek` is one sub-headline sentence, ≤280 chars.
- [ ] `tags` are 2–5 tags, drawn from the existing tag set when possible.
- [ ] If part of a series: `series.slug`, `series.title`, `series.order` all present and accurate.
- [ ] `related` lists 2–4 slugs of posts that genuinely pair with this one.
- [ ] Validates against `src/content/schema.ts` (build will fail otherwise).

---

## D. Components

- [ ] **`<DropCap>`** on the first letter of the cold open. No drop cap inside subsequent sections.
- [ ] **`<Sidenote>`** count ≤3. Each adds something the body shouldn't carry.
- [ ] **`<FieldCard>`** count ≤2. One per essay is normal.
- [ ] **`<PullQuote>`** at most once. Don't pull-quote your own thesis.
- [ ] **`<Diagnostic>`** present at the end for essays and field notes.
- [ ] **`<PostSlugDiagram />`** present once for paid posts. Centered, captioned.
- [ ] No `SiteHeader` imports from `@/components` barrel.
- [ ] No raw `\u00b7` escapes anywhere.
- [ ] No `Math.random()` or `new Date()` at render time without `suppressHydrationWarning`.

---

## E. Diagram

- [ ] Teaches one idea. If you can describe it in two clauses, it's two diagrams.
- [ ] No animation. SVG only.
- [ ] Caption explains what the diagram is, not what it means. (Meaning belongs to the prose.)
- [ ] Works in both light and dark mode (we ship dark; verify legibility).
- [ ] Renders at 2x retina without pixelation.
- [ ] Pillar color used for the primary mark; neutrals for everything else.
- [ ] Source data, if any, is footnoted in the caption.

---

## F. Links & footnotes

- [ ] All internal links are relative (`/pillar/slug`), not absolute.
- [ ] All external links open in a new tab and are HTTPS.
- [ ] Footnote numbers are sequential and match the rendered output.
- [ ] No dead links. (Hover and click each one.)
- [ ] No tracking parameters in any URL (`?utm_...` stripped).

---

## G. Build & types

- [ ] `npm run typecheck` passes.
- [ ] `npm run lint` passes (or only has pre-existing warnings, never new errors).
- [ ] `npm run build` succeeds end-to-end.
- [ ] No new console warnings during dev preview.
- [ ] No hydration mismatch warnings in the browser console.

---

## H. Visual review

Open the post locally and on a real phone if you can:

- [ ] Cold open lands on first screen at 1280×800 with no scroll.
- [ ] Drop cap aligns to the second line of the paragraph, not floating.
- [ ] Diagram is centered and not crushed on mobile.
- [ ] Sidenotes render in margin on desktop, inline on mobile.
- [ ] Reading mode (`?reading=1`) works — chrome strips, body remains.
- [ ] OG image renders at `/<pillar>/<slug>/opengraph-image` and is 1200×630.
- [ ] Archive thumbnail (if any) loads and is correct.
- [ ] No text wrap mid-word, no orphan headlines, no widow lines you can fix with a non-breaking space.

---

## I. Paywall (members-only posts)

- [ ] Logged-out reader sees the paywall after the cold open + first ~3 paragraphs.
- [ ] Logged-in active member sees the full body.
- [ ] Logged-in canceled member sees the paywall.
- [ ] Admin sees the full body regardless of membership status.
- [ ] Paywall CTA copy matches the post's tone (no aggressive sales language).

---

## J. Arc / series integration (arc episodes)

- [ ] Arc index page (`/series/<arc-slug>`) lists this episode in the right slot.
- [ ] Previous / next nav on the post points to the correct neighbors.
- [ ] Episode number in `ogSubtitle` matches arc frontmatter.
- [ ] If this is the last episode, the arc index reflects "complete".

---

## K. Pre-push final pass

- [ ] Re-read once, top to bottom, in the rendered preview, with no edits open.
- [ ] Read the first sentence and the last sentence — do they belong to the same post?
- [ ] One thing you almost left in but cut. (If nothing — you didn't edit hard enough.)
- [ ] Commit message follows the convention in `60-WORKFLOWS.md`.
- [ ] Git identity is `sage@sageideas.org` / `Jason Teixeira`.

---

## L. Post-publish (within 24 hours)

- [ ] Verified on prod in incognito.
- [ ] Verified as logged-in member.
- [ ] Verified as admin.
- [ ] OG image rendering on link unfurls (test by pasting URL into a Slack DM to yourself).
- [ ] Archive page shows the new post in the right position.
- [ ] If arc: arc index updated, `50-STORY-ARCS.md` updated to mark this shipped.
- [ ] If new component or motif introduced: `30-DESIGN-SYSTEM.md` or `10-VOICE.md` updated.

---

## What "done" looks like

A post is done when:

1. You'd be comfortable if a stranger read it as their first impression of Sage After Dark.
2. The thesis is recoverable from any 60-second skim.
3. The reader has one specific thing to do or notice tomorrow.
4. Nothing in the post is there because you're tired of editing.

If any of those four are shaky, it's not done. Sleep on it.
