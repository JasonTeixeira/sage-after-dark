/**
 * TutorialLayout — recipe-style how-to.
 *
 * Adds:
 *   - Prerequisites box (top)
 *   - Time estimate, difficulty, starter repo (in tactical strip)
 *   - Outcome box (top, just below header)
 *   - Step counter rendered via the H2 numbering CSS
 */

import type { ReactNode } from "react";
import {
  Page,
  Container,
  EditorialColumn,
  Section,
  Tactical,
  NotchedCard,
  ButtonLink,
  StripSep,
} from "@/components";
import type { Post } from "@/content/schema";
import {
  PostStrip,
  PostHeader,
  RelatedPosts,
  ColophonLine,
  PostFooter,
} from "./shared";

export function TutorialLayout({
  post,
  children,
}: {
  post: Post;
  children: ReactNode;
}) {
  const fm = post.frontmatter;
  const t = fm.tutorial;

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <PostStrip post={post} templateLabel="// tutorial" />

        {/* Tutorial-specific top strip */}
        {t && (
          <div className="mt-2 flex flex-wrap items-center gap-3 px-3 py-2 bg-ink-1/60 border border-rule font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
            {t.time_estimate && (
              <>
                <span className="text-cyan">EST</span>
                <span>{t.time_estimate}</span>
              </>
            )}
            {t.difficulty && (
              <>
                <StripSep />
                <span className="text-cyan">LEVEL</span>
                <span className="uppercase">{t.difficulty}</span>
              </>
            )}
            {t.starter_repo && (
              <>
                <StripSep />
                <span className="text-cyan">STARTER</span>
                <a
                  href={t.starter_repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bone hover:text-cyan transition-colors"
                >
                  {new URL(t.starter_repo).pathname.replace(/^\//, "")}
                </a>
              </>
            )}
          </div>
        )}

        <PostHeader post={post} />

        <Section className="border-t-0 pt-0">
          <EditorialColumn className="tutorial-prose">
            {/* Prerequisites */}
            {t && t.prerequisites.length > 0 && (
              <NotchedCard
                notch="tl"
                label="// prerequisites"
                pillarKey={fm.pillar}
                className="my-6"
              >
                <div className="p-6">
                  <Tactical className="text-cyan mb-3 block">
                    Before you start
                  </Tactical>
                  <ul className="list-disc ml-5 marker:text-cyan space-y-1.5 text-bone/90">
                    {t.prerequisites.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </NotchedCard>
            )}

            {/* Outcome */}
            {t?.outcome && (
              <NotchedCard
                notch="tr"
                label="// outcome"
                pillarKey="teach"
                className="my-6"
              >
                <div className="p-6">
                  <Tactical className="text-cyan mb-2 block">
                    By the end
                  </Tactical>
                  <p className="text-bone/90 leading-relaxed">{t.outcome}</p>
                </div>
              </NotchedCard>
            )}

            {/* Steps live in the MDX; H2s are auto-numbered */}
            <div className="tutorial-steps">{children}</div>

            {t?.starter_repo && (
              <div className="mt-12 flex justify-start">
                <ButtonLink href={t.starter_repo} variant="primary">
                  → Get the starter repo
                </ButtonLink>
              </div>
            )}

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
