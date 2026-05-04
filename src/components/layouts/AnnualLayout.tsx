/**
 * AnnualLayout — magazine-style end-of-year artifact.
 *
 * Wider, more deliberate, more chrome. Hero spread takes the
 * full width of the wide container; body returns to 66ch.
 */

import type { ReactNode } from "react";
import { format } from "date-fns";
import {
  Page,
  Container,
  EditorialColumn,
  Section,
  Display,
  Lead,
  Tactical,
  PillarBorder,
  PillarTag,
} from "@/components";
import type { Post } from "@/content/schema";
import { PostStrip, RelatedPosts, ColophonLine, PostFooter } from "./shared";

export function AnnualLayout({
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
        <PostStrip post={post} templateLabel="// annual" />

        {/* Magazine hero */}
        <header className="mt-12 mb-20">
          <div className="flex items-center gap-3 mb-6">
            <PillarTag pillar={fm.pillar} />
            <Tactical>
              {format(new Date(fm.published), "yyyy")} · annual edition
            </Tactical>
          </div>
          <PillarBorder pillar={fm.pillar} className="pl-8">
            <Display className="mb-6 max-w-[18ch]">{fm.title}</Display>
            {fm.dek && (
              <Lead className="text-bone/70 max-w-[55ch] text-xl sm:text-2xl">
                {fm.dek}
              </Lead>
            )}
          </PillarBorder>
        </header>

        <Section className="border-t-0 pt-0">
          <EditorialColumn className="annual-prose">
            {children}
            <ColophonLine post={post} />
          </EditorialColumn>
          <div className="mx-auto" style={{ maxWidth: "66ch" }}>
            <RelatedPosts slugs={fm.related} currentSlug={fm.slug} />
          </div>
          <PostFooter post={post} />
        </Section>
      </Container>
    </Page>
  );
}
