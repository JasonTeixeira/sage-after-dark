/**
 * /admin/featured — pin posts to home_hero, editor_pick, popular_read, member_only.
 */

import { Display, Lead, Tactical, Hr } from "@/components";
import { adminListFeaturedAll } from "@/lib/living";
import { getAllPosts } from "@/content/loader";
import { FeaturedManager } from "./featured-manager";

export const dynamic = "force-dynamic";

export default async function AdminFeaturedPage() {
  const [items, posts] = await Promise.all([
    adminListFeaturedAll().catch(() => []),
    getAllPosts(),
  ]);
  const slugs = posts.map((p) => ({
    slug: p.frontmatter.slug,
    title: p.frontmatter.title,
  }));

  return (
    <div>
      <header className="mb-8">
        <Tactical className="text-cyan mb-3 block">// featured</Tactical>
        <Display className="mb-3">Featured posts</Display>
        <Lead>
          Pin posts to home hero, editor pick, popular read, or member-only
          slots. Lower rank shows first.
        </Lead>
      </header>

      <Hr className="mb-8" />

      <FeaturedManager initial={items} slugs={slugs} />
    </div>
  );
}
