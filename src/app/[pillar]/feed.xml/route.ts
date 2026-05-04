/**
 * /[pillar]/feed.xml — pillar-scoped RSS 2.0 feed.
 *
 * Allows readers to subscribe only to /build, /signal, /mind, /world,
 * /taste, /teach, or /learning. SSG'd at build time per pillar.
 */

import { getAllPosts } from "@/content/loader";
import type { Pillar } from "@/content/schema";

export const dynamic = "force-static";

const SITE = "https://www.sageafterdark.com";

const VALID_PILLARS: readonly Pillar[] = [
  "build",
  "signal",
  "mind",
  "world",
  "taste",
  "teach",
  "learning",
] as const;

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function generateStaticParams() {
  return VALID_PILLARS.map((pillar) => ({ pillar }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ pillar: string }> },
) {
  const { pillar } = await ctx.params;
  if (!VALID_PILLARS.includes(pillar as Pillar)) {
    return new Response("Unknown pillar", { status: 404 });
  }

  const posts = (await getAllPosts()).filter(
    (p) => p.frontmatter.pillar === pillar,
  );

  const items = posts
    .map((p) => {
      const fm = p.frontmatter;
      const url = `${SITE}/${fm.pillar}/${fm.slug}`;
      const pub = new Date(fm.published).toUTCString();
      return `    <item>
      <title>${escape(fm.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pub}</pubDate>
      <category>${fm.pillar}</category>
      <category>${fm.template}</category>
      ${fm.dek ? `<description>${escape(fm.dek)}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sage After Dark · //${pillar}</title>
    <link>${SITE}/${pillar}</link>
    <description>The ${pillar} pillar — only essays in this category from Sage After Dark.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/${pillar}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
