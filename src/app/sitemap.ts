import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags, getAllSeries } from "@/content/loader";

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

const STATIC_PATHS = [
  "",
  "/archive",
  "/now",
  "/taste",
  "/about",
  "/colophon",
  "/reading",
  "/search",
  "/templates",
  "/best",
  "/tags",
  "/series",
  "/dispatch",
  "/tools",
  "/tools/30-second-rollback",
  "/ask",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((p) => ({
    url: `${SITE}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.6,
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
    ...pillarEntries,
    ...postEntries,
    ...tagEntries,
    ...seriesEntries,
  ];
}
