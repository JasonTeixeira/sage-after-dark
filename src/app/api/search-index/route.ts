/**
 * /api/search-index — JSON index for the Cmd+K command palette.
 *
 * Reuses the same MDX corpus as /search. Bodies are stripped to plain text
 * and trimmed to ~3KB per post to keep the payload reasonable. Cached at the
 * edge for an hour; the corpus only changes on rebuilds.
 */

import { NextResponse } from "next/server";
import { getAllPosts } from "@/content/loader";

export const revalidate = 3600;

function stripMdx(src: string): string {
  return src
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>~|`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 3000);
}

export async function GET() {
  const posts = await getAllPosts();
  const entries = posts
    .filter((p) => p.frontmatter.status !== "draft")
    .map((p) => ({
      slug: p.frontmatter.slug,
      pillar: p.frontmatter.pillar,
      template: p.frontmatter.template,
      title: p.frontmatter.title,
      dek: p.frontmatter.dek ?? "",
      tags: p.frontmatter.tags ?? [],
      body: stripMdx(p.source ?? ""),
      published: p.frontmatter.published,
      href: `/${p.frontmatter.pillar}/${p.frontmatter.slug}`,
    }));

  return NextResponse.json(
    { entries, count: entries.length },
    {
      headers: {
        "cache-control":
          "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
