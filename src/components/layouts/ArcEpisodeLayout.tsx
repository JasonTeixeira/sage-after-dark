/**
 * ArcEpisodeLayout — serialized writing.
 *
 * Adds:
 *   - Arc title + episode counter (EP 03 / 12)
 *   - Prev/Next nav (computed from sibling episodes)
 *   - Link to arc index
 */

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Page,
  Container,
  EditorialColumn,
  Section,
  Tactical,
  StripSep,
} from "@/components";
import type { Post } from "@/content/schema";
import { getArcEpisodes } from "@/content/loader";
import { FloatingTOC } from "@/components/floating-toc";
import { FootnotePopover } from "@/components/footnote-popover";
import { TocScrubber } from "@/components/toc-scrubber";
import { AnchorCopy } from "@/components/anchor-copy";
import {
  PostStrip,
  PostHeader,
  RelatedPosts,
  ColophonLine,
  PostFooter,
} from "./shared";
import { ShareButtons } from "@/components/share-buttons";

export async function ArcEpisodeLayout({
  post,
  children,
}: {
  post: Post;
  children: ReactNode;
}) {
  const fm = post.frontmatter;
  const arc = fm.arc!;
  const episodes = await getArcEpisodes(arc.arc_slug);
  const idx = episodes.findIndex((e) => e.frontmatter.slug === fm.slug);
  const prev = idx > 0 ? episodes[idx - 1] : null;
  const next = idx >= 0 && idx < episodes.length - 1 ? episodes[idx + 1] : null;

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <PostStrip post={post} templateLabel="// arc episode" />

        {/* Arc strip */}
        <div className="mt-2 flex flex-wrap items-center gap-3 px-3 py-2 bg-ink-1/60 border border-rule font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
          <span className="text-cyan">ARC</span>
          <span className="text-bone">{arc.arc_title}</span>
          <StripSep />
          <span className="text-cyan">
            EP {String(arc.episode).padStart(2, "0")} / {String(arc.total_episodes).padStart(2, "0")}
          </span>
          <span className="ml-auto">
            <Link
              href={`/arcs/${arc.arc_slug}`}
              className="text-mute hover:text-cyan transition-colors"
            >
              → arc index
            </Link>
          </span>
        </div>

        <PostHeader post={post} />

        <Section className="border-t-0 pt-0 relative">
          <FloatingTOC rootSelector=".essay-prose" />
          <TocScrubber rootSelector=".essay-prose" />
          <FootnotePopover />
          <AnchorCopy />
          <EditorialColumn className="essay-prose relative" data-highlightable>
            {children}

            {/* Prev/Next nav */}
            <nav
              className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-rule pt-8"
              aria-label="Episode navigation"
            >
              {prev ? (
                <Link
                  href={`/${prev.frontmatter.pillar}/${prev.frontmatter.slug}`}
                  className="block border border-rule p-4 hover:border-cyan transition-colors group"
                >
                  <Tactical className="block mb-2 group-hover:text-cyan">
                    ← prev · ep {String(prev.frontmatter.arc?.episode ?? 0).padStart(2, "0")}
                  </Tactical>
                  <p className="font-sans text-bone leading-snug group-hover:text-cyan">
                    {prev.frontmatter.title}
                  </p>
                </Link>
              ) : (
                <div className="border border-rule/40 p-4 text-mute font-mono text-[11px] uppercase tracking-[0.08em]">
                  // start of arc
                </div>
              )}
              {next ? (
                <Link
                  href={`/${next.frontmatter.pillar}/${next.frontmatter.slug}`}
                  className="block border border-rule p-4 hover:border-cyan transition-colors group text-right"
                >
                  <Tactical className="block mb-2 group-hover:text-cyan">
                    next · ep {String(next.frontmatter.arc?.episode ?? 0).padStart(2, "0")} →
                  </Tactical>
                  <p className="font-sans text-bone leading-snug group-hover:text-cyan">
                    {next.frontmatter.title}
                  </p>
                </Link>
              ) : (
                <div className="border border-rule/40 p-4 text-mute font-mono text-[11px] uppercase tracking-[0.08em] text-right">
                  // arc continues //
                </div>
              )}
            </nav>

            <ColophonLine post={post} />
          </EditorialColumn>
          <div className="mx-auto" style={{ maxWidth: "66ch" }}>
            <RelatedPosts slugs={fm.related} currentSlug={fm.slug} />
          </div>
          <ShareButtons
            url={`https://www.sageafterdark.com/${post.frontmatter.pillar}/${post.frontmatter.slug}`}
            title={post.frontmatter.title}
            dek={post.frontmatter.dek}
          />
          <PostFooter post={post} />
        </Section>
      </Container>
    </Page>
  );
}
