/**
 * DispatchLayout — short signal-style. 200-500 words.
 *
 * Minimal: strip, title, body. No related posts, no margin notes.
 * Designed to feel like an intercept.
 */

import type { ReactNode } from "react";
import { Page, Container, EditorialColumn } from "@/components";
import type { Post } from "@/content/schema";
import { PostStrip, PostHeader, ColophonLine, PostFooter } from "./shared";
import { ShareButtons } from "@/components/share-buttons";

export function DispatchLayout({
  post,
  children,
}: {
  post: Post;
  children: ReactNode;
}) {
  return (
    <Page>
      <Container size="default" className="pt-10 pb-24">
        <PostStrip post={post} templateLabel="// dispatch" />
        <PostHeader post={post} />
        <EditorialColumn className="dispatch-prose">
          {children}
          <ColophonLine post={post} />
        </EditorialColumn>
        <ShareButtons
          url={`https://www.sageafterdark.com/${post.frontmatter.pillar}/${post.frontmatter.slug}`}
          title={post.frontmatter.title}
          dek={post.frontmatter.dek}
        />
        <PostFooter post={post} />
      </Container>
    </Page>
  );
}
