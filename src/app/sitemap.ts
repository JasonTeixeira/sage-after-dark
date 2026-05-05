import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags, getAllSeries } from "@/content/loader";
import { ARCS } from "@/content/site-data";

const SITE = "https://www.sageafterdark.com";

const PILLARS = [
  "build",
  "signal",
  "mind",
  "world",
  "taste",
  "learning",
  "teach",
] as const;

/** path → priority. Higher priority = surfaced more by crawlers. */
const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }> = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/start", priority: 0.9, changeFrequency: "monthly" },
  { path: "/archive", priority: 0.9, changeFrequency: "daily" },
  { path: "/best", priority: 0.8, changeFrequency: "weekly" },
  { path: "/concepts", priority: 0.8, changeFrequency: "weekly" },
  { path: "/numbers", priority: 0.7, changeFrequency: "daily" },
  { path: "/now", priority: 0.7, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/uses", priority: 0.6, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/taste", priority: 0.6, changeFrequency: "monthly" },
  { path: "/reading", priority: 0.6, changeFrequency: "monthly" },
  { path: "/search", priority: 0.6, changeFrequency: "monthly" },
  { path: "/tags", priority: 0.5, changeFrequency: "weekly" },
  { path: "/series", priority: 0.5, changeFrequency: "weekly" },
  { path: "/templates", priority: 0.5, changeFrequency: "monthly" },
  { path: "/dispatch", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools", priority: 0.5, changeFrequency: "monthly" },
  { path: "/tools/30-second-rollback", priority: 0.5, changeFrequency: "monthly" },
  { path: "/ask", priority: 0.4, changeFrequency: "monthly" },
  { path: "/colophon", priority: 0.4, changeFrequency: "monthly" },
];

const CONCEPT_SLUGS = [
  "taste-as-deploy-gate",
  "learning-loop",
  "half-life-of-a-tool",
  "the-system",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const conceptEntries: MetadataRoute.Sitemap = CONCEPT_SLUGS.map((slug) => ({
    url: `${SITE}/concepts/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const arcEntries: MetadataRoute.Sitemap = ARCS.map((a) => ({
    url: `${SITE}/arcs/${a.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const pillarEntries: MetadataRoute.Sitemap = PILLARS.map((k) => ({
    url: `${SITE}/${k}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE}/${p.frontmatter.pillar}/${p.frontmatter.slug}`,
    lastModified: new Date(p.frontmatter.updated ?? p.frontmatter.published),
    changeFrequency: "monthly",
    priority: p.frontmatter.featured ? 0.8 : 0.7,
  }));

  const tags = await getAllTags();
  const series = await getAllSeries();

  const tagEntries: MetadataRoute.Sitemap = tags.map((t) => ({
    url: `${SITE}/tags/${encodeURIComponent(t.tag)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const seriesEntries: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${SITE}/series/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...conceptEntries,
    ...arcEntries,
    ...pillarEntries,
    ...postEntries,
    ...tagEntries,
    ...seriesEntries,
  ];
}
