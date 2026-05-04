/**
 * /atom.xml — Atom 1.0 feed (preferred by some readers over RSS).
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
  const updated =
    posts.length > 0
      ? new Date(posts[0].frontmatter.published).toISOString()
      : new Date().toISOString();

  const entries = posts
    .map((p) => {
      const fm = p.frontmatter;
      const url = `${SITE}/${fm.pillar}/${fm.slug}`;
      const pub = new Date(fm.published).toISOString();
      const upd = fm.updated ? new Date(fm.updated).toISOString() : pub;
      return `  <entry>
    <title>${escape(fm.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <updated>${upd}</updated>
    <published>${pub}</published>
    <author><name>Jason Teixeira</name><uri>${SITE}</uri></author>
    <category term="${fm.pillar}" />
    <category term="${fm.template}" />
    ${fm.dek ? `<summary>${escape(fm.dek)}</summary>` : ""}
  </entry>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Sage After Dark</title>
  <subtitle>Late-night essays, tutorials, and dispatches from a one-person studio.</subtitle>
  <link href="${SITE}" />
  <link href="${SITE}/atom.xml" rel="self" />
  <id>${SITE}/</id>
  <updated>${updated}</updated>
  <author><name>Jason Teixeira</name><uri>${SITE}</uri></author>
${entries}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
