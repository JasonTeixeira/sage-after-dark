/**
 * /feed.xml — RSS 2.0 feed of all published posts.
 */

import { getAllPosts } from "@/content/loader";

export const dynamic = "force-static";

const SITE = "https://www.sageafterdark.com";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getAllPosts();

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
    <title>Sage After Dark</title>
    <link>${SITE}</link>
    <description>Late-night essays, tutorials, and dispatches from Jason Teixeira at Sage Ideas.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
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
