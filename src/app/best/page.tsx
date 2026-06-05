/**
 * /best — the curated front door.
 *
 * Anchor essays first (the longest, most ambitious pieces), then
 * recent field notes and dispatches (the everyday signal).
 * No "popular" lie — we don't have view counts to sort by, so we curate.
 */

import Link from "next/link";
import { format } from "date-fns";
import {
  Page,
  Container,
  EditorialDisplay,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  PillarTag,
  NotchedCard,
} from "@/components";
import { getAllPosts } from "@/content/loader";

export const metadata = {
  title: "Best of Sage After Dark",
  description:
    "If you read four essays here, read these. The strongest, most-quoted, most-revisited writing in the archive.",
};

export default async function BestPage() {
  const all = await getAllPosts();

  // Tier 1: anchor essays — longest pieces as proxy for depth and ambition
  const anchors = all
    .sort((a, b) => (b.word_count ?? 0) - (a.word_count ?? 0))
    .slice(0, 8);

  // Tier 2: most recent dispatch + field note (the everyday signal)
  const recentSignal = all
    .filter(
      (p) =>
        p.frontmatter.template === "field_note" ||
        p.frontmatter.template === "dispatch",
    )
    .slice(0, 3);

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="sageafterdark.com/best" mode="breadcrumb" />
          <StripSep />
          <span>HAND-PICKED · {anchors.length}</span>
        </TacticalStrip>

        <header className="mt-12 mb-16 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">
            sageafterdark.com / <span className="text-bone">best</span>
          </Tactical>
          <EditorialDisplay className="mb-6">
            If you read <em>four,</em> read these.
          </EditorialDisplay>
          <Lead className="[font-family:var(--font-sans)]">
            No view counts, no upvotes, no popularity lie. These are the essays
            I&apos;d hand to a friend who asked &ldquo;where do I start?&rdquo; — the
            ones I&apos;d defend in any room.
          </Lead>
        </header>

        {/* Tier 1 — Anchor essays */}
        {anchors.length > 0 && (
          <section className="mb-20">
            <div className="flex items-baseline justify-between mb-6 border-b border-rule pb-3">
              <Tactical className="text-cyan">// the anchors</Tactical>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                AUTHOR&apos;S BET · LONG-FORM
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {anchors.map((p) => (
                <Link
                  key={p.frontmatter.slug}
                  href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                  className="group block focus:outline-none"
                >
                  <NotchedCard
                    notch="tl"
                    pillarKey={p.frontmatter.pillar}
                    className="h-full"
                    interactive
                  >
                    <div className="p-7">
                      <div className="flex items-baseline gap-3 mb-4">
                        <PillarTag pillar={p.frontmatter.pillar} size="sm" />
                        <Tactical className="text-faint">
                          {format(
                            new Date(p.frontmatter.published),
                            "yyyy-MM-dd",
                          )}
                        </Tactical>
                        <Tactical className="text-faint">
                          · {p.reading_minutes} MIN
                        </Tactical>
                      </div>
                      <h3
                        className="font-editorial text-bone leading-tight group-hover:text-cyan transition-colors"
                        style={{ fontSize: "clamp(1.5rem, 2.4vw, 2rem)" }}
                      >
                        {p.frontmatter.title}
                      </h3>
                      {p.frontmatter.dek && (
                        <p className="mt-3 text-bone/75 leading-relaxed">
                          {p.frontmatter.dek}
                        </p>
                      )}
                    </div>
                  </NotchedCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tier 2 — Recent signal */}
        {recentSignal.length > 0 && (
          <section className="mb-12">
            <div className="flex items-baseline justify-between mb-6 border-b border-rule pb-3">
              <Tactical className="text-cyan">
                // the everyday signal
              </Tactical>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                FIELD NOTES & DISPATCHES
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentSignal.map((p) => (
                <Link
                  key={p.frontmatter.slug}
                  href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                  className="group block focus:outline-none"
                >
                  <NotchedCard
                    notch="tl"
                    pillarKey={p.frontmatter.pillar}
                    className="h-full"
                    interactive
                  >
                    <div className="p-5">
                      <Tactical className="mb-2 block">
                        {format(
                          new Date(p.frontmatter.published),
                          "yyyy-MM-dd",
                        )}
                      </Tactical>
                      <h3 className="text-bone leading-snug group-hover:text-cyan transition-colors text-base">
                        {p.frontmatter.title}
                      </h3>
                    </div>
                  </NotchedCard>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-16 max-w-2xl">
          <p className="text-mute font-mono text-[12px] uppercase tracking-[0.08em]">
            Want everything?{" "}
            <Link href="/archive" className="text-cyan hover:underline">
              ▸ browse the full archive
            </Link>
            {" · "}
            <Link href="/tags" className="text-cyan hover:underline">
              ▸ by topic
            </Link>
          </p>
        </div>
      </Container>
    </Page>
  );
}
