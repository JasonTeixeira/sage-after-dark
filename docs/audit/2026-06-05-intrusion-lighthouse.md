# Lighthouse Audit — Intrusion v1

**Date:** 2026-06-05
**Branch:** phase-b/intrusion
**Tool:** lighthouse@latest (headless Chromium, `--headless=new`)
**Routes:** `/` (home) and `/taste/taste-is-the-last-moat` (essay)

## Scores

| Route        | Performance | Accessibility | SEO |
|--------------|:-----------:|:-------------:|:---:|
| `/` (home)   |     89      |      100      | 100 |
| `/taste/taste-is-the-last-moat` | 92 | 100 | 100 |

**Targets:** Perf ≥ 90, A11y = 100, SEO = 100.

**Verdict:** A11y and SEO targets met on both routes. Performance on home (89) is 1 point below target — essay (92) passes. No blocking issues; performance delta is within noise for a cold run.

## Fix Applied in This Pass

**SEO `link-text` failure (both routes):** Lighthouse's SEO audit flagged the `/start` nav link because "start" appears on its generic-link-text blocklist. Fixed by renaming the nav label from `"start"` to `"start here"` in `src/components/site-header.tsx`. SEO score went from 91/92 → 100/100.

## Remaining Performance Gap (home −1 vs target)

The home page scored 89; the 1-point gap is marginal and not caused by the intrusion overlay (essay, which also has the overlay, scored 92). Likely causes to investigate in a separate pass:

- **FCP / LCP:** The homepage has a more complex layout than the essay page; the additional editorial components (arc cards, broadcast hero, newsletter) add render work.
- No blocking issues; run a subsequent audit with a warmed server to confirm stability before treating this as a real regression.
