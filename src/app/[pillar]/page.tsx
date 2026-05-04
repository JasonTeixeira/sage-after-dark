/**
 * /[pillar] — index page for a single pillar.
 *
 * Lists every post in that pillar, newest first. Each pillar gets
 * its own color identity, copy, and tagline.
 */

import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
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
  PillarBorder,
  PostCard,
} from "@/components";
import { getPostsByPillar } from "@/content/loader";
import { pillar as pillarTokens, type PillarKey } from "@/lib/tokens";
import type { Metadata } from "next";

const PILLARS: Record<
  PillarKey,
  { label: string; tagline: string; description: string }
> = {
  build: {
    label: "//build",
    tagline: "Engineering, architecture, the work itself",
    description:
      "Notes from the floor. Deploys, infrastructure, the texture of shipping software for people who don't have time for software.",
  },
  signal: {
    label: "//signal",
    tagline: "Status, dispatches, /now updates",
    description:
      "Short transmissions. Hot takes with receipts. The shape of the work this week.",
  },
  mind: {
    label: "//mind",
    tagline: "Essays, theses, what I believe",
    description:
      "Long-form arguments and slow thinking. The pieces I'd put on a shelf if the shelf could hold pixels.",
  },
  world: {
    label: "//world",
    tagline: "Industry, observations, the broader weather",
    description:
      "What's happening outside the studio. Markets, movements, the cultural pressure systems that shape our work.",
  },
  taste: {
    label: "//taste",
    tagline: "Music, film, design — the obsessions",
    description:
      "The art and artifacts that keep me writing. What I'm listening to, watching, and noticing.",
  },
  learning: {
    label: "//learning",
    tagline: "What I'm learning, in the open",
    description:
      "Half-formed thoughts, in-progress threads, drafts that benefit from being public before they're polished.",
  },
  teach: {
    label: "//teach",
    tagline: "Tutorials, how-tos, evergreen craft",
    description:
      "Reproducible recipes. Working starter repos. The kind of post you bookmark and come back to in six months.",
  },
};

export function generateStaticParams() {
  return Object.keys(PILLARS).map((pillar) => ({ pillar }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
  const { pillar } = await params;
  const cfg = PILLARS[pillar as PillarKey];
  if (!cfg) return { title: "Not found" };
  return {
    title: `${cfg.label} — ${cfg.tagline}`,
    description: cfg.description,
  };
}

export default async function PillarIndexPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const key = pillar as PillarKey;
  const cfg = PILLARS[key];
  if (!cfg) notFound();

  const posts = await getPostsByPillar(key);

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path={`~/${pillar}`} mode="breadcrumb" />
          <StripSep />
          <span>{posts.length.toString().padStart(3, "0")} POSTS</span>
          <StripSep />
          <Link
            href="/archive"
            className="hover:text-cyan transition-colors"
          >
            ← all pillars
          </Link>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <div className="mb-6">
            <PillarTag pillar={key} />
          </div>
          <PillarBorder pillar={key} className="pl-6">
            <Display
              className="mb-4"
              style={{ color: pillarTokens[key] }}
            >
              {cfg.tagline}
            </Display>
            <Lead className="text-bone/70">{cfg.description}</Lead>
          </PillarBorder>
        </header>

        {posts.length === 0 ? (
          <Section className="border-t-0 pt-12">
            <p className="text-mute font-mono text-sm uppercase tracking-[0.08em]">
              // nothing shipped under this pillar yet
            </p>
            <p className="text-bone/70 mt-3 max-w-[55ch]">
              Posts will appear here as they ship. In the meantime, you can{" "}
              <Link href="/archive" className="text-cyan hover:underline">
                browse the full archive
              </Link>
              .
            </p>
          </Section>
        ) : (
          <Section label={`// posts under ${cfg.label}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.map((p) => (
                <PostCard key={p.frontmatter.slug} post={p} />
              ))}
            </div>
          </Section>
        )}

        {/* Footer strip — reading-time totals */}
        {posts.length > 0 && (
          <div className="mt-12 pt-6 border-t border-rule font-mono text-[10px] uppercase tracking-[0.08em] text-faint flex flex-wrap gap-x-6 gap-y-2">
            <span>// pillar total</span>
            <span>
              {posts.reduce((s, p) => s + p.word_count, 0).toLocaleString()}{" "}
              words
            </span>
            <span>·</span>
            <span>
              {posts.reduce((s, p) => s + p.reading_minutes, 0)} min reading
            </span>
            <span>·</span>
            <span>
              earliest{" "}
              {format(
                new Date(posts[posts.length - 1].frontmatter.published),
                "yyyy-MM-dd",
              )}
            </span>
          </div>
        )}
      </Container>
    </Page>
  );
}
