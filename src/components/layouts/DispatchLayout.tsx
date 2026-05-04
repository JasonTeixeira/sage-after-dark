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
        <PostFooter post={post} />
      </Container>
    </Page>
  );
}
