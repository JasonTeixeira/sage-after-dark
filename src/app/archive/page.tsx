/**
 * /archive — the body of work, sortable + filterable.
 *
 * Server-renders all posts. A client filter pill row toggles
 * pillar-specific subsets via URL state.
 */

import { format } from "date-fns";
import {
  Page,
  Container,
  Section,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  PillarTag,
} from "@/components";
import { getAllPosts } from "@/content/loader";
import { ArchiveFilter } from "./_filter";
import type { PillarKey } from "@/lib/tokens";
import Link from "next/link";

export const metadata = {
  title: "Archive",
  description:
    "Every essay, tutorial, dispatch, and field note shipped on Sage After Dark. Sorted newest first.",
};

const PILLAR_LABELS: Record<PillarKey, string> = {
  build: "//build",
  signal: "//signal",
  mind: "//mind",
  world: "//world",
  taste: "//taste",
  learning: "//learning",
  teach: "//teach",
};

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string }>;
}) {
  const sp = await searchParams;
  const allPosts = await getAllPosts();
  const activePillar =
    sp.pillar && Object.keys(PILLAR_LABELS).includes(sp.pillar)
      ? (sp.pillar as PillarKey)
      : null;

  const posts = activePillar
    ? allPosts.filter((p) => p.frontmatter.pillar === activePillar)
    : allPosts;

  // group by year for visual chunking
  const byYear: Record<string, typeof posts> = {};
  for (const p of posts) {
    const y = format(new Date(p.frontmatter.published), "yyyy");
    (byYear[y] ??= []).push(p);
  }
  const years = Object.keys(byYear).sort((a, b) => b.localeCompare(a));

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/archive" mode="breadcrumb" />
          <StripSep />
          <span>{posts.length.toString().padStart(3, "0")} POSTS</span>
          <StripSep />
          <span>SORTED · NEWEST FIRST</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">// the body of work</Tactical>
          <Display className="mb-6">Archive</Display>
          <Lead>
            Every essay, tutorial, dispatch, field note, arc episode, and
            annual ever shipped here. Filter by pillar, scan by year, find what
            you came for.
          </Lead>
        </header>

        <ArchiveFilter active={activePillar} pillarLabels={PILLAR_LABELS} />

        {posts.length === 0 ? (
          <Section className="border-t-0 pt-12">
            <p className="text-mute font-mono text-sm uppercase tracking-[0.08em]">
              // no posts in this pillar yet
            </p>
            <Link
              href="/archive"
              className="mt-4 inline-block text-cyan hover:text-bone font-mono text-[11px] uppercase tracking-[0.08em]"
            >
              ← clear filter
            </Link>
          </Section>
        ) : (
          years.map((year) => (
            <section
              key={year}
              className="mt-12 first:mt-8 border-t border-rule pt-8"
            >
              <div className="flex items-baseline gap-4 mb-6">
                <Display className="text-bone/30 [font-size:clamp(2rem,4vw,3rem)] leading-none">
                  {year}
                </Display>
                <Tactical>
                  {byYear[year].length.toString().padStart(2, "0")} posts
                </Tactical>
              </div>
              <div>
                {byYear[year].map((p) => (
                  <Link
                    key={p.frontmatter.slug}
                    href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                    className="group block border-b border-rule hover:bg-ink-1/40 transition-colors focus:outline-none"
                  >
                    <div className="grid grid-cols-12 items-baseline gap-4 py-4 px-2">
                      <div className="col-span-12 sm:col-span-2 font-mono text-[11px] uppercase tracking-[0.08em] text-mute tabular-nums">
                        {format(new Date(p.frontmatter.published), "MMM dd")}
                      </div>
                      <div className="col-span-12 sm:col-span-1">
                        <PillarTag pillar={p.frontmatter.pillar} size="sm" />
                      </div>
                      <div className="col-span-12 sm:col-span-2 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
                        {p.frontmatter.template.replace("_", " ")}
                      </div>
                      <div className="col-span-12 sm:col-span-7">
                        <h3 className="font-sans text-bone leading-snug group-hover:text-cyan transition-colors text-[17px]">
                          {p.frontmatter.title}
                        </h3>
                        {p.frontmatter.dek && (
                          <p className="mt-1 text-sm text-mute leading-relaxed line-clamp-1">
                            {p.frontmatter.dek}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </Container>
    </Page>
  );
}
