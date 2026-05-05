/**
 * related-essays — pure scoring function to find essays related to a given post.
 *
 * Score (higher = more related):
 *   + 4 per shared tag
 *   + 3 if same arc
 *   + 2 if same pillar
 *   + 2 if same series
 *   + 1 per concept slug mentioned in both bodies
 *
 * Posts published within the last 60 days get a small recency bonus (+0.5)
 * to surface fresh thinking. The current post is always excluded. Drafts
 * are always excluded. Returns up to `limit` posts, score-descending.
 */

import type { Post } from "@/content/schema";

const CONCEPT_SLUGS = [
  "taste-as-deploy-gate",
  "taste",
  "learning-loop",
  "learning by shipping",
  "half-life-of-a-tool",
  "half-life",
  "the-system",
] as const;

export type ScoredPost = Post & { _score: number };

export function relatedEssays(
  current: Post,
  all: Post[],
  limit = 3,
): ScoredPost[] {
  const others = all.filter(
    (p) =>
      p.frontmatter.slug !== current.frontmatter.slug &&
      p.frontmatter.status !== "draft",
  );

  const tags = new Set((current.frontmatter.tags ?? []).map((t) => t.toLowerCase()));
  const arcSlug = current.frontmatter.arc?.arc_slug;
  const seriesSlug = current.frontmatter.series?.slug;

  const currentBody = (current.source ?? "").toLowerCase();
  const currentConcepts = CONCEPT_SLUGS.filter((c) => currentBody.includes(c));

  const sixtyDaysAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;

  const scored: ScoredPost[] = others.map((p) => {
    let score = 0;
    const otherTags = (p.frontmatter.tags ?? []).map((t) => t.toLowerCase());
    for (const t of otherTags) if (tags.has(t)) score += 4;

    if (arcSlug && p.frontmatter.arc?.arc_slug === arcSlug) score += 3;
    if (p.frontmatter.pillar === current.frontmatter.pillar) score += 2;
    if (seriesSlug && p.frontmatter.series?.slug === seriesSlug) score += 2;

    const otherBody = (p.source ?? "").toLowerCase();
    for (const c of currentConcepts) if (otherBody.includes(c)) score += 1;

    const t = new Date(p.frontmatter.published).getTime();
    if (t >= sixtyDaysAgo) score += 0.5;

    return { ...p, _score: score };
  });

  scored.sort((a, b) => b._score - a._score);
  // Keep only those with at least some signal (>= 2)
  const filtered = scored.filter((p) => p._score >= 2);
  return filtered.slice(0, limit);
}
