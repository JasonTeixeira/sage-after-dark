/**
 * Sage After Dark — Content Loader
 *
 * Reads MDX files from src/content/posts/, parses frontmatter,
 * validates with Zod, and returns typed Post objects.
 *
 * This runs at build time (RSC) — no client bundle impact.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { FrontmatterSchema, type Frontmatter, type Post } from "./schema";

const POSTS_DIR = path.join(process.cwd(), "src", "content", "posts");

/* -----------------------------------------------------------
 * List all post slugs (excluding drafts and templates).
 * --------------------------------------------------------- */

export async function getAllSlugs(): Promise<string[]> {
  try {
    const files = await fs.readdir(POSTS_DIR);
    return files
      .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"))
      .map((f) => f.replace(/\.mdx$/, ""));
  } catch {
    return [];
  }
}

/* -----------------------------------------------------------
 * Read one post by slug.
 * --------------------------------------------------------- */

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }

  const { data, content } = matter(raw);

  // Inject the slug from filename if missing in frontmatter
  if (!data.slug) data.slug = slug;

  // Validate
  const parsed = FrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    console.error(`[content] ${slug}.mdx invalid frontmatter:`, parsed.error.flatten());
    return null;
  }

  const stats = readingTime(content);

  return {
    frontmatter: parsed.data as Frontmatter,
    source: content,
    reading_minutes: Math.max(1, Math.round(stats.minutes)),
    word_count: stats.words,
  };
}

/* -----------------------------------------------------------
 * Read all published posts, sorted newest first.
 * --------------------------------------------------------- */

export async function getAllPosts(): Promise<Post[]> {
  const slugs = await getAllSlugs();
  const posts = await Promise.all(slugs.map(getPostBySlug));
  return posts
    .filter((p): p is Post => p !== null)
    .filter((p) => p.frontmatter.status === "published")
    .sort(
      (a, b) =>
        new Date(b.frontmatter.published).getTime() -
        new Date(a.frontmatter.published).getTime(),
    );
}

/* -----------------------------------------------------------
 * Filter helpers
 * --------------------------------------------------------- */

export async function getPostsByPillar(
  pillar: Frontmatter["pillar"],
): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.frontmatter.pillar === pillar);
}

export async function getPostsByTemplate(
  template: Frontmatter["template"],
): Promise<Post[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.frontmatter.template === template);
}

export async function getArcEpisodes(arcSlug: string): Promise<Post[]> {
  const all = await getAllPosts();
  return all
    .filter(
      (p) =>
        p.frontmatter.template === "arc_episode" &&
        p.frontmatter.arc?.arc_slug === arcSlug,
    )
    .sort((a, b) => (a.frontmatter.arc?.episode ?? 0) - (b.frontmatter.arc?.episode ?? 0));
}
