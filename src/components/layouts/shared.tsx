/**
 * Shared layout primitives used across post layouts.
 *
 *   <PostHeader>          — title block with pillar tag, dek, byline strip
 *   <PostStrip>           — top tactical strip showing status/time/words/pillar
 *   <RelatedPosts>        — bottom rail rendering related cards by slug
 *   <ColophonLine>        — tiny footer block above the global footer
 *   <PostFooter>          — newsletter signup + comments at the end of every post
 */

import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/cn";
import {
  Display,
  Lead,
  Tactical,
  PillarTag,
  PillarBorder,
  TacticalStrip,
  StripSep,
  NotchedCard,
} from "@/components";
import type { Post } from "@/content/schema";
import { getPostBySlug } from "@/content/loader";
import { NewsletterForm } from "@/components/newsletter-form";
import { Comments } from "@/components/comments";
import { ReadingProgress } from "@/components/reading-progress";

export function PostStrip({
  post,
  templateLabel,
}: {
  post: Post;
  templateLabel: string;
}) {
  const fm = post.frontmatter;
  const dateLabel = format(new Date(fm.published), "yyyy-MM-dd").toUpperCase();
  const statusVariant: "default" | "live" | "muted" =
    fm.status === "published" ? "live" : "muted";

  return (
    <TacticalStrip variant={statusVariant} className="text-mute">
      <span className="text-cyan">{templateLabel}</span>
      <StripSep />
      <span>{dateLabel}</span>
      <StripSep />
      <span>{post.reading_minutes} MIN READ</span>
      <StripSep />
      <span>{post.word_count.toLocaleString()} WORDS</span>
      <span className="ml-auto">
        <PillarTag pillar={fm.pillar} size="sm" />
      </span>
    </TacticalStrip>
  );
}

export function PostHeader({ post }: { post: Post }) {
  const fm = post.frontmatter;
  return (
    <header className="mt-8 mb-12" data-reticle-zone>
      <ReadingProgress pillar={fm.pillar} />
      <PillarBorder pillar={fm.pillar} className="pl-6">
        <Display className="mb-4">{fm.title}</Display>
        {fm.dek && <Lead className="text-bone/70 max-w-[60ch]">{fm.dek}</Lead>}
      </PillarBorder>
      {fm.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {fm.tags.map((t) => (
            <span
              key={t}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute border border-rule px-2 py-1"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}

export async function RelatedPosts({ slugs }: { slugs: string[] }) {
  if (!slugs || slugs.length === 0) return null;
  const posts = (await Promise.all(slugs.map((s) => getPostBySlug(s)))).filter(
    (p): p is Post => p !== null,
  );
  if (posts.length === 0) return null;

  return (
    <section className="mt-20 border-t border-rule pt-10">
      <Tactical className="text-cyan mb-6 block">// related transmissions</Tactical>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((p) => (
          <Link
            key={p.frontmatter.slug}
            href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
            className="group block focus:outline-none"
          >
            <NotchedCard
              notch="tl"
              pillarKey={p.frontmatter.pillar}
              className="h-full"
              interactive
            >
              <div className="p-6">
                <Tactical className="mb-3 block">
                  {format(new Date(p.frontmatter.published), "yyyy-MM-dd")}
                </Tactical>
                <h3 className="font-sans font-medium text-bone leading-snug text-lg group-hover:text-cyan transition-colors">
                  {p.frontmatter.title}
                </h3>
                {p.frontmatter.dek && (
                  <p className="mt-2 text-sm text-bone/70 leading-relaxed">
                    {p.frontmatter.dek}
                  </p>
                )}
              </div>
            </NotchedCard>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function ColophonLine({ post }: { post: Post }) {
  const fm = post.frontmatter;
  return (
    <div className={cn("mt-16 pt-6 border-t border-rule")}>
      <Tactical className="block">
        // filed under //{fm.pillar} · {fm.template} ·{" "}
        {format(new Date(fm.published), "yyyy-MM-dd")}
        {fm.updated && <> · updated {format(new Date(fm.updated), "yyyy-MM-dd")}</>}
      </Tactical>
    </div>
  );
}

/* -----------------------------------------------------------
 * <PostFooter> — newsletter signup + comments. Mounts after
 * RelatedPosts on every post layout.
 * --------------------------------------------------------- */

export function PostFooter({ post }: { post: Post }) {
  const fm = post.frontmatter;
  return (
    <div className="mt-16 space-y-12 max-w-3xl mx-auto">
      <NewsletterForm source={`post:${fm.slug}`} variant="card" />
      <div>
        <Tactical className="block mb-4 text-cyan">// discussion</Tactical>
        <Comments slug={fm.slug} />
      </div>
    </div>
  );
}
