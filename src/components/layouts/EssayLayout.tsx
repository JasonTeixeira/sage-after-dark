/**
 * EssayLayout — the long-form, magazine-grade template.
 *
 * Visual contract:
 *   - 66ch editorial column with drop cap support.
 *   - Pillar-bordered header with title, dek, tags.
 *   - <FloatingTOC>: sticky sidebar at xl+, mobile sheet below.
 *   - <HighlightToShare>: text-selection bubble inside the prose body.
 *   - <Sidenote> + <PullQuote>: available via mdxComponents.
 *   - <EssaySignoff>: hand-written closing CTA replacing the generic card.
 *   - Smarter <RelatedPosts>: auto-recommends by pillar+tag if frontmatter
 *     `related` array is empty.
 *   - <Comments> still renders below for discussion.
 */

import type { ReactNode } from "react";
import { Page, Container, EditorialColumn, Section, Tactical } from "@/components";
import type { Post } from "@/content/schema";
import {
  PostStrip,
  PostHeader,
  RelatedPosts,
  ColophonLine,
} from "./shared";
import { FloatingTOC } from "@/components/floating-toc";
import { HighlightToShare } from "@/components/highlight-to-share";
import { FootnotePopover } from "@/components/footnote-popover";
import { TocScrubber } from "@/components/toc-scrubber";
import { AnchorCopy } from "@/components/anchor-copy";
import { EssaySignoff } from "@/components/essay-signoff";
import { ShareButtons } from "@/components/share-buttons";
import { Comments } from "@/components/comments";

export function EssayLayout({
  post,
  children,
}: {
  post: Post;
  children: ReactNode;
}) {
  const fm = post.frontmatter;
  const url = `https://www.sageafterdark.com/${fm.pillar}/${fm.slug}`;

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <PostStrip post={post} templateLabel="// essay" />
        <PostHeader post={post} />

        <Section className="border-t-0 pt-0 relative">
          {/* Floating right-margin TOC at xl+; mobile sheet button below xl. */}
          <FloatingTOC rootSelector=".essay-prose" />

          {/* Left-edge reading-position rail (xl+ only). */}
          <TocScrubber rootSelector=".essay-prose" />

          {/* Selection-to-share bubble. Listens inside [data-highlightable]. */}
          <HighlightToShare postUrl={url} postTitle={fm.title} />

          {/* Hover-peek footnotes; suppresses jump-to-bottom. */}
          <FootnotePopover />

          {/* Heading anchors copy URL+hash to clipboard with toast. */}
          <AnchorCopy />

          <EditorialColumn className="essay-prose relative" data-highlightable>
            {children}
            <ColophonLine post={post} />
          </EditorialColumn>

          <div className="mx-auto" style={{ maxWidth: "66ch" }}>
            <RelatedPosts slugs={fm.related} currentSlug={fm.slug} />
          </div>

          {/* Share buttons — HN, LinkedIn, copy, email. */}
          <ShareButtons url={url} title={fm.title} dek={fm.dek} />

          {/* Personal end-of-essay sign-off. Replaces the generic card. */}
          <EssaySignoff post={post} />

          {/* Discussion still mounts below the sign-off. */}
          <div className="mt-16 max-w-3xl mx-auto">
            <Tactical className="block mb-4 text-cyan">// discussion</Tactical>
            <Comments slug={fm.slug} title={fm.title} />
          </div>
        </Section>
      </Container>
    </Page>
  );
}
