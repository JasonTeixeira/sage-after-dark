/**
 * Home — the front page.
 *
 * Hero strip · Featured essay · Latest grid · Dispatches rail · Pillars
 */

import Link from "next/link";
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
  PostCard,
  ButtonLink,
  NotchedCard,
  Reticle,
  NewsletterForm,
  Reveal,
} from "@/components";
import { getAllPosts } from "@/content/loader";
import { NOW } from "@/content/site-data";
import { pillar as pillarTokens, type PillarKey } from "@/lib/tokens";

const PILLARS: { key: PillarKey; label: string; tagline: string }[] = [
  { key: "build", label: "//build", tagline: "Engineering, architecture, the work itself" },
  { key: "signal", label: "//signal", tagline: "Status, dispatches, /now updates" },
  { key: "mind", label: "//mind", tagline: "Essays, theses, what I believe" },
  { key: "world", label: "//world", tagline: "Industry, observations, the broader weather" },
  { key: "taste", label: "//taste", tagline: "Music, film, design — the obsessions" },
  { key: "learning", label: "//learning", tagline: "What I'm learning, in the open" },
  { key: "teach", label: "//teach", tagline: "Tutorials, how-tos, evergreen craft" },
];

export default async function HomePage() {
  const posts = await getAllPosts();
  const featured = posts.find((p) => p.frontmatter.featured) ?? posts[0];
  const latest = posts
    .filter(
      (p) =>
        p.frontmatter.slug !== featured?.frontmatter.slug &&
        p.frontmatter.template !== "dispatch",
    )
    .slice(0, 4);
  const dispatches = posts
    .filter((p) => p.frontmatter.template === "dispatch")
    .slice(0, 3);
  const postCount = posts.length;

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-8">
        {/* Hero strip */}
        <TacticalStrip variant="live">
          <TerminalPrompt path="/sageafterdark" mode="live" />
          <StripSep />
          <span>{postCount.toString().padStart(3, "0")} POSTS LIVE</span>
          <StripSep />
          <span>SYS · OK</span>
          <span className="ml-auto">
            UPDATED · {format(new Date(NOW.updated), "yyyy-MM-dd").toUpperCase()}
          </span>
        </TacticalStrip>

        {/* Hero */}
        <section className="relative mt-12 mb-20 max-w-4xl" data-reticle-zone>
          <div className="absolute top-0 right-0 hidden md:block">
            <Reticle size={20} />
          </div>
          <Tactical className="text-cyan mb-6 block">
            // late-night transmissions from sage ideas
          </Tactical>
          <Display className="mb-6">
            Field notes from
            <br />
            <span className="text-mute">building in the open.</span>
            <span className="cursor-blink ml-2 inline-block h-[0.85em] w-[0.5ch] translate-y-[-0.05em] bg-cyan align-middle" />
          </Display>
          <Lead className="mt-6">
            Essays, tutorials, and dispatches from the desk of Jason Teixeira.
            Written in Geist, served at 60fps, rolled back in under 30 seconds.
          </Lead>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href="/archive" variant="primary">
              ▸ Read the archive
            </ButtonLink>
            <ButtonLink href="/now" variant="outline">
              What I&apos;m on now
            </ButtonLink>
            <ButtonLink href="/about" variant="ghost">
              About
            </ButtonLink>
          </div>
        </section>
      </Container>

      <Container size="wide" className="pb-16">
        {/* Featured */}
        {featured && (
          <Reveal>
            <Section label="// featured transmission" className="border-t-0 pt-0">
              <PostCard post={featured} variant="featured" />
            </Section>
          </Reveal>
        )}

        {/* Latest grid */}
        {latest.length > 0 && (
          <Reveal>
          <Section label="// latest essays + tutorials">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latest.map((p) => (
                <PostCard key={p.frontmatter.slug} post={p} />
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/archive"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-cyan hover:text-bone transition-colors"
              >
                See the full archive →
              </Link>
            </div>
          </Section>
          </Reveal>
        )}

        {/* Dispatches rail */}
        {dispatches.length > 0 && (
          <Reveal>
          <Section label="// dispatches">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dispatches.map((p) => (
                <Link
                  key={p.frontmatter.slug}
                  href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                  className="group block border border-rule hover:border-cyan transition-colors p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <PillarTag pillar={p.frontmatter.pillar} size="sm" />
                    <Tactical>
                      {format(new Date(p.frontmatter.published), "yyyy-MM-dd")}
                    </Tactical>
                  </div>
                  <h4 className="font-sans text-bone leading-snug text-lg group-hover:text-cyan transition-colors">
                    {p.frontmatter.title}
                  </h4>
                  {p.frontmatter.dek && (
                    <p className="mt-2 text-sm text-bone/70 leading-relaxed line-clamp-2">
                      {p.frontmatter.dek}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </Section>
          </Reveal>
        )}

        {/* Pillars */}
        <Reveal>
        <Section label="// the seven pillars">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PILLARS.map((p) => (
              <Link
                key={p.key}
                href={`/${p.key}`}
                className="group block focus:outline-none h-full"
              >
                <NotchedCard
                  notch="tl"
                  pillarKey={p.key}
                  className="h-full"
                  interactive
                >
                  <div className="p-5">
                    <div
                      className="text-base font-medium font-sans group-hover:text-cyan transition-colors"
                      style={{ color: pillarTokens[p.key] }}
                    >
                      {p.label}
                    </div>
                    <p className="mt-2 text-bone/70 text-sm leading-relaxed">
                      {p.tagline}
                    </p>
                  </div>
                </NotchedCard>
              </Link>
            ))}
          </div>
        </Section>
        </Reveal>

        {/* Newsletter */}
        <Reveal>
        <Section label="// dispatches">
          <div className="max-w-2xl">
            <NewsletterForm source="home" variant="card" />
          </div>
        </Section>
        </Reveal>
      </Container>
    </Page>
  );
}
