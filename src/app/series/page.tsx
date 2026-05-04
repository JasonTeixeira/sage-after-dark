/**
 * /series — index of every series with multiple posts.
 *
 * Series are looser than arcs (no episode count, no fixed total). Use them
 * for thematic groupings: "rollback rules", "founder mistakes", etc.
 */

import Link from "next/link";
import {
  Page,
  Container,
  EditorialDisplay,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  NotchedCard,
} from "@/components";
import { getAllSeries } from "@/content/loader";

export const metadata = {
  title: "Series",
  description:
    "Multi-part essays grouped by thread on Sage After Dark. Less rigid than arcs, looser than tags.",
};

export default async function SeriesIndexPage() {
  const series = await getAllSeries();

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="sageafterdark.com/series" mode="breadcrumb" />
          <StripSep />
          <span>{series.length} SERIES</span>
        </TacticalStrip>

        <header className="mt-12 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">
            sageafterdark.com / <span className="text-bone">series</span>
          </Tactical>
          <EditorialDisplay className="mb-6">
            Threads with <em>installments.</em>
          </EditorialDisplay>
          <Lead className="[font-family:var(--font-sans)]">
            Series are looser than arcs — no episode counts, no rigid order.
            Just essays that belong to one bigger conversation.
          </Lead>
        </header>

        {series.length === 0 ? (
          <p className="text-mute font-mono text-sm uppercase tracking-[0.08em]">
            // no series yet — series are added when an essay declares
            <code className="mx-1 text-cyan">series:</code> in its frontmatter
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl">
            {series.map((s) => (
              <Link
                key={s.slug}
                href={`/series/${s.slug}`}
                className="group block focus:outline-none"
              >
                <NotchedCard notch="tl" className="h-full" interactive>
                  <div className="p-6">
                    <Tactical className="mb-3 block">
                      // {s.count} {s.count === 1 ? "post" : "posts"}
                    </Tactical>
                    <h3 className="font-sans font-medium text-bone leading-snug text-lg group-hover:text-cyan transition-colors">
                      {s.title}
                    </h3>
                  </div>
                </NotchedCard>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Page>
  );
}
