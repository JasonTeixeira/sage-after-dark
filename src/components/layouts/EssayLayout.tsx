/**
 * EssayLayout — the long-form template.
 *
 * Visual contract:
 *   - 66ch editorial column
 *   - Pillar-bordered header
 *   - Drop cap rendered by the first paragraph of the MDX
 *   - Margin notes float right at lg+ via <MarginNote>
 *   - Pull-quotes via blockquotes
 *   - Related posts rail at the bottom
 */

import type { ReactNode } from "react";
import { Page, Container, EditorialColumn, Section } from "@/components";
import type { Post } from "@/content/schema";
import {
  PostStrip,
  PostHeader,
  RelatedPosts,
  ColophonLine,
  PostFooter,
} from "./shared";

export function EssayLayout({
  post,
  children,
}: {
  post: Post;
  children: ReactNode;
}) {
  const fm = post.frontmatter;
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <PostStrip post={post} templateLabel="// essay" />
        <PostHeader post={post} />
        <Section className="border-t-0 pt-0">
          <EditorialColumn className="essay-prose">
            {children}
            <ColophonLine post={post} />
          </EditorialColumn>
          <div className="mx-auto" style={{ maxWidth: "66ch" }}>
            <RelatedPosts slugs={fm.related} />
          </div>
          <PostFooter post={post} />
        </Section>
      </Container>
    </Page>
  );
}
