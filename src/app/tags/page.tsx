/**
 * /tags — index of every tag used in the corpus.
 *
 * Renders as a tag cloud. Each tag links to /tags/[tag]; size scales
 * loosely with frequency. No filtering, no ranking knobs — the cloud
 * IS the view.
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
} from "@/components";
import { getAllTags } from "@/content/loader";

export const metadata = {
  title: "Tags",
  description:
    "Every topic touched on Sage After Dark — pick a thread and follow it.",
};

export default async function TagsIndexPage() {
  const tags = await getAllTags();
  const max = tags.reduce((m, t) => Math.max(m, t.count), 1);

  function sizeFor(count: number) {
    const ratio = count / max;
    if (ratio > 0.66) return "text-2xl md:text-3xl text-bone";
    if (ratio > 0.33) return "text-xl md:text-2xl text-bone/90";
    if (ratio > 0.15) return "text-lg text-bone/75";
    return "text-base text-bone/60";
  }

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="sageafterdark.com/tags" mode="breadcrumb" />
          <StripSep />
          <span>{tags.length} TAGS</span>
        </TacticalStrip>

        <header className="mt-12 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">
            sageafterdark.com / <span className="text-bone">tags</span>
          </Tactical>
          <EditorialDisplay className="mb-6">
            Every <em>thread.</em>
          </EditorialDisplay>
          <Lead className="[font-family:var(--font-sans)]">
            Topics I keep returning to. Pick one and follow it backward through
            the archive.
          </Lead>
        </header>

        {tags.length === 0 ? (
          <p className="text-mute font-mono text-sm uppercase tracking-[0.08em]">
            // no tags yet
          </p>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3 max-w-4xl">
            {tags.map((t) => (
              <Link
                key={t.tag}
                href={`/tags/${encodeURIComponent(t.tag)}`}
                className={`${sizeFor(t.count)} hover:text-cyan transition-colors`}
              >
                #{t.tag}
                <sup className="text-faint font-mono text-[0.65em] ml-1 tabular-nums">
                  {t.count}
                </sup>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Page>
  );
}
