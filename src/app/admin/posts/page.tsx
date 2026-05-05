/**
 * /admin/posts — every published post with its live view count.
 */

import Link from "next/link";
import { Display, Lead, Tactical, Hr } from "@/components";
import { getAllPosts } from "@/content/loader";
import { getViewsForSlug, getTotalPageviews } from "@/lib/living";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const [posts, total] = await Promise.all([
    getAllPosts(),
    getTotalPageviews().catch(() => ({ views: 0, unique_visitors: 0 })),
  ]);

  // Resolve view counts in parallel.
  const rows = await Promise.all(
    posts.map(async (p) => {
      const v = await getViewsForSlug(p.frontmatter.slug).catch(() => ({
        views: 0,
        unique_visitors: 0,
      }));
      return {
        slug: p.frontmatter.slug,
        title: p.frontmatter.title,
        pillar: p.frontmatter.pillar,
        published: p.frontmatter.published,
        words: p.word_count,
        views: v.views,
        uniques: v.unique_visitors,
      };
    }),
  );

  // Sort by views desc.
  rows.sort((a, b) => b.views - a.views);

  return (
    <div>
      <header className="mb-8">
        <Tactical className="text-cyan mb-3 block">// posts</Tactical>
        <Display className="mb-3">Posts</Display>
        <Lead>
          {posts.length} published &middot;{" "}
          {total.views.toLocaleString("en-US")} total views &middot;{" "}
          {total.unique_visitors.toLocaleString("en-US")} unique visitors
        </Lead>
      </header>

      <Hr className="mb-6" />

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-rule">
              <Th>title</Th>
              <Th>pillar</Th>
              <Th align="right">views</Th>
              <Th align="right">uniques</Th>
              <Th align="right">words</Th>
              <Th>published</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.slug}
                className="border-b border-rule/40 hover:bg-ink-1/40"
              >
                <Td>
                  <Link
                    href={`/p/${r.slug}`}
                    className="text-bone hover:text-cyan"
                  >
                    {r.title}
                  </Link>
                  <div className="text-mute text-[10px] mt-1">{r.slug}</div>
                </Td>
                <Td className="text-cyan/80 uppercase text-[11px]">
                  {r.pillar}
                </Td>
                <Td align="right" className="text-bone tabular-nums">
                  {r.views.toLocaleString("en-US")}
                </Td>
                <Td align="right" className="text-bone/70 tabular-nums">
                  {r.uniques.toLocaleString("en-US")}
                </Td>
                <Td align="right" className="text-mute tabular-nums">
                  {r.words.toLocaleString("en-US")}
                </Td>
                <Td className="text-mute tabular-nums">
                  {r.published.slice(0, 10)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`font-mono text-[10px] uppercase tracking-[0.12em] text-mute py-3 px-2 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
  align = "left",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`py-3 px-2 ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      {children}
    </td>
  );
}
