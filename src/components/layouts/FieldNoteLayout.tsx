/**
 * FieldNoteLayout — looser, notebook-spread aesthetic.
 *
 * No drop cap. Smaller display. The grid background gets a touch
 * of opacity to evoke graph paper. Section H3s render with a tick
 * mark to feel like checked items in a notebook.
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
import { ShareButtons } from "@/components/share-buttons";

export function FieldNoteLayout({
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
        <PostStrip post={post} templateLabel="// field note" />
        <PostHeader post={post} />
        <Section className="border-t-0 pt-0">
          <EditorialColumn className="fieldnote-prose">
            {children}
            <ColophonLine post={post} />
          </EditorialColumn>
          <div className="mx-auto" style={{ maxWidth: "66ch" }}>
            <RelatedPosts slugs={fm.related} currentSlug={fm.slug} />
          </div>
          <ShareButtons
            url={`https://www.sageafterdark.com/${fm.pillar}/${fm.slug}`}
            title={fm.title}
            dek={fm.dek}
          />
          <PostFooter post={post} />
        </Section>
      </Container>
    </Page>
  );
}
