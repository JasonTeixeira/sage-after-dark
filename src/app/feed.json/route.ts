/**
 * /feed.json — JSON Feed v1.1 of all published posts.
 * Spec: https://www.jsonfeed.org/version/1.1/
 */

import { getAllPosts } from "@/content/loader";

export const dynamic = "force-static";

const SITE = "https://www.sageafterdark.com";

export async function GET() {
  const posts = await getAllPosts();

  const items = posts.map((p) => {
    const fm = p.frontmatter;
    const url = `${SITE}/${fm.pillar}/${fm.slug}`;
    return {
      id: url,
      url,
      title: fm.title,
      summary: fm.dek ?? "",
      date_published: new Date(fm.published).toISOString(),
      date_modified: fm.updated
        ? new Date(fm.updated).toISOString()
        : undefined,
      tags: [fm.pillar, fm.template, ...fm.tags],
      authors: [{ name: "Jason Teixeira", url: "https://sageideas.dev" }],
    };
  });

  const feed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Sage After Dark",
    home_page_url: SITE,
    feed_url: `${SITE}/feed.json`,
    description:
      "Late-night essays, tutorials, and dispatches from Jason Teixeira at Sage Ideas.",
    language: "en",
    authors: [{ name: "Jason Teixeira", url: "https://sageideas.dev" }],
    items,
  };

  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
