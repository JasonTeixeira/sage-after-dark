/**
 * Home — Sage After Dark front page (editorial layout, parity with strategy doc).
 *
 * Sections, top to bottom:
 *  1. Tactical strip (system status)
 *  2. Hero: "I write at night." + Latest transmission card
 *  3. Pillar tape strip (// FIELD NOTES FROM A ONE-PERSON STUDIO)
 *  4. Story arcs, in progress (3 arc cards)
 *  5. Latest dispatches (4 numbered cards #N..)
 *  6. Now-playing tape strip
 *  7. By day, I ship production software (Trayd / Alphathreum / Naural)
 *  8. Newsletter + footer
 */

import Link from "next/link";
import { format } from "date-fns";
import {
  Page,
  Container,
  Section,
  EditorialDisplay,
  EditorialHeading,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  PillarTag,
  ButtonLink,
  NotchedCard,
  Reticle,
  NewsletterForm,
  HeroSubscribe,
  Reveal,
  ReadThisIf,
} from "@/components";
import { getAllPosts } from "@/content/loader";
import { NOW, ARCS, PRODUCTS, NOW_PLAYING } from "@/content/site-data";
import { pillar as pillarTokens } from "@/lib/tokens";
import { getSiteCounts } from "@/lib/live-counts";

const PILLAR_LABELS = ["build", "signal", "mind", "world", "taste"] as const;

export default async function HomePage() {
  const posts = await getAllPosts();
  const counts = await getSiteCounts();
  const featured = posts.find((p) => p.frontmatter.featured) ?? posts[0];
  const dispatches = posts
    .filter((p) => p.frontmatter.slug !== featured?.frontmatter.slug)
    .slice(0, 4);

  // Build the Read-this-if recommendations from the real corpus.
  // Pure function on the post list — no extra reads, no I/O.
  const recItem = (p: typeof posts[number]) => ({
    pillar: p.frontmatter.pillar,
    slug: p.frontmatter.slug,
    title: p.frontmatter.title,
    dek: p.frontmatter.dek ?? "",
    reading: p.reading_minutes,
  });
  const pickByPillar = (pillars: string[]) =>
    pillars
      .map((pl) => posts.find((p) => p.frontmatter.pillar === pl))
      .filter((p): p is typeof posts[number] => Boolean(p))
      .map(recItem)
      .slice(0, 3);
  const recommender = {
    builder: pickByPillar(["build", "build", "signal"]).length === 3
      ? pickByPillar(["build", "build", "signal"])
      : posts.filter((p) => ["build", "signal"].includes(p.frontmatter.pillar)).slice(0, 3).map(recItem),
    operator: posts
      .filter((p) => ["mind", "world"].includes(p.frontmatter.pillar))
      .slice(0, 3)
      .map(recItem),
    curious: posts
      .filter((p) => ["taste", "mind"].includes(p.frontmatter.pillar))
      .slice(0, 3)
      .map(recItem),
  };
  // Fill any short bucket from the latest essays so each shows 3 items.
  for (const k of ["builder", "operator", "curious"] as const) {
    while (recommender[k].length < 3 && posts.length) {
      const next = posts.find(
        (p) => !recommender[k].some((x) => x.slug === p.frontmatter.slug),
      );
      if (!next) break;
      recommender[k].push(recItem(next));
    }
  }

  return (
    <Page>
      {/* ─── Tactical strip ─────────────────────────── */}
      <Container size="wide" className="pt-6 pb-2">
        <TacticalStrip variant="live">
          <TerminalPrompt path="/sageafterdark" mode="live" />
          <StripSep />
          <span className="truncate">ONE-PERSON STUDIO</span>
          <span className="ml-auto hidden md:flex items-center gap-3">
            <span>EST {counts.yearLabel.toUpperCase()} · 2026</span>
            <StripSep />
            <span>SUBSCRIBERS · {counts.subscribersLabel}</span>
            <StripSep />
            <span>ESSAYS · {counts.postsLabel}</span>
            <StripSep />
            <span>LOG IN</span>
            <StripSep />
            <span>SEARCH</span>
            <span className="bg-rule-hi px-1.5 py-0.5 text-faint">/</span>
          </span>
          <span className="ml-auto md:hidden">ESSAYS · {counts.postsLabel}</span>
        </TacticalStrip>
      </Container>

      {/* ─── Hero ──────────────────────────────────── */}
      <Container size="wide" className="pt-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left — editorial hero */}
          <section
            className="lg:col-span-7 relative"
            data-reticle-zone
          >
            <div className="absolute -top-4 -left-2 hidden lg:block">
              <Reticle size={16} />
            </div>
            <Tactical className="text-cyan mb-6 block">
              // world notes · sage day
            </Tactical>
            <EditorialDisplay className="mb-8">
              I write
              <br />
              at <em>night.</em>
            </EditorialDisplay>
            <Lead className="max-w-[44ch] text-bone/75 [font-family:var(--font-sans)]">
              <strong className="font-medium text-bone">Sage After Dark</strong>{" "}
              is the after-hours notebook of a one-person studio. Software,
              taste, psychology, and the slow internet — written by the same
              operator who ships production code by day.
            </Lead>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/archive" variant="primary">
                ▸ Read latest
              </ButtonLink>
              <Link
                href="#arcs"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute hover:text-bone transition-colors"
              >
                · Explore the arcs
              </Link>
            </div>

            {/* In-hero subscribe — premium one-line CLI capture */}
            <div className="mt-10 max-w-[44ch]">
              <div className="mb-3 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-faint">
                <span className="text-cyan">●</span>
                <span>FOUNDING WINDOW · OPEN</span>
                <span className="text-rule-hi">·</span>
                <span>SUBSCRIBE</span>
              </div>
              <HeroSubscribe source="home_hero" />
              <ul className="mt-4 space-y-1.5 text-[12px] text-mute font-mono">
                <li>
                  <span className="text-cyan">▸</span>{" "}
                  One essay or one field note · every Sunday
                </li>
                <li>
                  <span className="text-cyan">▸</span>{" "}
                  What I&apos;m reading + one thing I shipped that week
                </li>
                <li>
                  <span className="text-cyan">▸</span>{" "}
                  Zero growth-hacks · unsubscribe in one click
                </li>
              </ul>
            </div>
          </section>

          {/* Right — latest transmission card */}
          {featured && (
            <aside className="lg:col-span-5">
              <NotchedCard notch="tl" pillarKey={featured.frontmatter.pillar}>
                <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                  <Tactical className="text-cyan">
                    LATEST · TRANSMISSION
                  </Tactical>
                  <span className="ml-auto h-2 w-2 rounded-full bg-cyan animate-pulse" />
                </div>

                {/* Oscilloscope / signal panel */}
                <div className="relative h-44 mx-5 border border-rule overflow-hidden">
                  <SignalPanel />
                </div>

                <div className="px-5 pt-4 pb-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono uppercase tracking-[0.08em] text-mute">
                    <PillarTag pillar={featured.frontmatter.pillar} size="sm" />
                    <span>· {format(new Date(featured.frontmatter.published), "dd MMM yyyy").toUpperCase()}</span>
                    <span>· {featured.reading_minutes} min</span>
                    <span>· {featured.word_count.toLocaleString()} words</span>
                  </div>
                  <Link
                    href={`/${featured.frontmatter.pillar}/${featured.frontmatter.slug}`}
                    className="block mt-3 group"
                  >
                    <h2
                      className="text-bone leading-[1.15] group-hover:text-cyan transition-colors [font-family:var(--font-editorial)]"
                      style={{ fontSize: "clamp(1.4rem, 2.2vw, 1.85rem)" }}
                    >
                      {featured.frontmatter.title}
                    </h2>
                  </Link>
                  {featured.frontmatter.dek && (
                    <p className="mt-3 text-bone/70 leading-relaxed text-[15px]">
                      {featured.frontmatter.dek}
                    </p>
                  )}
                  <div className="mt-5 flex items-center justify-between border-t border-rule pt-3">
                    <Tactical>+ ALL · BY PILLAR</Tactical>
                    <Link
                      href={`/${featured.frontmatter.pillar}/${featured.frontmatter.slug}`}
                      className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan hover:text-bone transition-colors"
                    >
                      Read transmission →
                    </Link>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.08em] text-faint">
                    <span>♪ Brian Eno · Reflection</span>
                  </div>
                </div>
              </NotchedCard>
            </aside>
          )}
        </div>

        {/* ─── Pillar tape strip ───────────────────────── */}
        <div className="mt-14 border-y border-rule py-3 flex items-center gap-6 overflow-hidden text-[11px] font-mono uppercase tracking-[0.12em] text-mute">
          <span className="text-faint shrink-0">// FIELD NOTES FROM A ONE-PERSON STUDIO //</span>
          {PILLAR_LABELS.map((p) => (
            <Link
              key={p}
              href={`/${p}`}
              className="shrink-0 transition-colors hover:text-bone"
              style={{ color: pillarTokens[p] }}
            >
              · {p}
            </Link>
          ))}
          <span className="text-faint shrink-0 ml-auto hidden md:inline">//</span>
        </div>
      </Container>

      {/* ─── Story arcs ──────────────────────────────── */}
      <Container size="wide" className="py-16">
        <div id="arcs" />
        <Reveal>
          <div className="flex items-end justify-between mb-10">
            <EditorialHeading>
              Story <em>arcs,</em> in progress.
            </EditorialHeading>
            <Tactical className="hidden md:block">
              + ACTIVE · COMPLETED · LATER
            </Tactical>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {ARCS.map((arc) => (
              <Link
                key={arc.slug}
                href={`/arcs/${arc.slug}`}
                className="group block focus:outline-none h-full"
              >
                <NotchedCard
                  notch="tl"
                  pillarKey={arc.pillar}
                  className="h-full"
                  interactive
                  label={arc.code}
                >
                  <div className="p-6 flex flex-col h-full">
                    <h3
                      className="text-bone group-hover:text-cyan transition-colors leading-[1.05] tracking-[-0.005em] [font-family:var(--font-editorial)]"
                      style={{ fontSize: "clamp(1.4rem, 2vw, 1.85rem)" }}
                    >
                      {arc.title.replace(arc.italic, "")}
                      <em className="italic">{arc.italic}</em>
                    </h3>

                    <div className="mt-3 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.08em] text-mute">
                      <span>EPISODE {String(arc.episodes_done).padStart(2, "0")} / {arc.episodes_total}</span>
                      <span>·</span>
                      <span className="text-cyan">{arc.status}</span>
                    </div>
                    <p className="mt-4 text-bone/80 leading-snug text-[15px] flex-1">
                      &ldquo;{arc.pull}&rdquo;
                    </p>
                    <div className="mt-5 pt-4 border-t border-rule">
                      <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-cyan group-hover:text-bone transition-colors">
                        ▸ Continue arc
                      </span>
                    </div>
                  </div>
                </NotchedCard>
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>

      {/* ─── Latest dispatches ───────────────────────── */}
      <Container size="wide" className="py-16">
        <Reveal>
          <div className="flex items-end justify-between mb-10">
            <EditorialHeading>
              Latest <em>dispatches.</em>
            </EditorialHeading>
            <Link
              href="/archive"
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan hover:text-bone transition-colors hidden md:inline-flex"
            >
              SEE ARCHIVE · {counts.postsLabel} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dispatches.map((p, i) => {
              // Real transmission number = position in published order, newest = totalPosts.
              const num = counts.totalPosts - i;
              return (
                <Link
                  key={p.frontmatter.slug}
                  href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                  className="group block focus:outline-none"
                >
                  <NotchedCard
                    notch="tl"
                    pillarKey={p.frontmatter.pillar}
                    interactive
                    label={`//${p.frontmatter.pillar.toUpperCase()}`}
                    className="h-full"
                  >
                    <div className="p-5 pb-4 flex flex-col h-full min-h-[14rem]">
                      <div
                        className="font-mono text-[68px] leading-none text-rule-hi/80 group-hover:text-cyan/40 transition-colors self-end"
                      >
                        #{num}
                      </div>
                      <h3 className="mt-3 text-bone leading-snug font-sans text-[16px] group-hover:text-cyan transition-colors">
                        {p.frontmatter.title}
                      </h3>
                      {p.frontmatter.dek && (
                        <p className="mt-2 text-bone/70 leading-relaxed text-[13px] line-clamp-3">
                          {p.frontmatter.dek}
                        </p>
                      )}
                      <div className="mt-auto pt-4 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.08em] text-faint">
                        <span>{format(new Date(p.frontmatter.published), "dd MMM").toUpperCase()}</span>
                        <span>· {p.reading_minutes} MIN</span>
                        <span className="ml-auto text-cyan">● {p.word_count.toLocaleString()} W</span>
                      </div>
                    </div>
                  </NotchedCard>
                </Link>
              );
            })}
          </div>
        </Reveal>
      </Container>

      {/* ─── Now-playing tape ────────────────────────── */}
      <Container size="wide" className="py-2">
        <div className="border-y border-rule bg-ink-1/50 px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono uppercase tracking-[0.1em]">
          <span className="text-cyan flex items-center gap-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
            {NOW_PLAYING.status}
          </span>
          {NOW_PLAYING.items.map((item, i) => (
            <span key={i} className="text-mute shrink-0">
              <span
                className="text-cyan mr-1"
                style={{ color: i % 2 === 0 ? "var(--color-cyan)" : "var(--color-ember)" }}
              >
                ▮
              </span>
              {item.label}
            </span>
          ))}
        </div>
      </Container>

      {/* ─── Products (By day) ───────────────────────── */}
      <Container size="wide" className="py-16">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <EditorialHeading className="mb-6">
                By day, I ship <em>production software.</em>
              </EditorialHeading>
              <p className="text-bone/80 leading-relaxed text-[15px] max-w-[40ch]">
                <strong className="font-medium text-bone">Sage Ideas</strong>{" "}is
                the writing wing of a one-person studio that builds software for
                people who don&apos;t have time for software. The thing is where
                I think out loud. The studio is where the code goes live.
              </p>
              <Link
                href="https://sageideas.dev"
                target="_blank"
                rel="noopener"
                className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-cyan hover:text-bone transition-colors"
              >
                Visit sageideas.dev →
              </Link>
            </div>
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRODUCTS.map((prod) => (
                <Link
                  key={prod.code}
                  href={prod.href}
                  target="_blank"
                  rel="noopener"
                  className="group block focus:outline-none"
                >
                  <NotchedCard notch="tl" interactive className="h-full">
                    <div className="p-5 flex flex-col h-full">
                      <div
                        className="text-3xl font-medium font-sans"
                        style={{
                          color:
                            prod.accent === "cyan"
                              ? "var(--color-cyan)"
                              : prod.accent === "ember"
                                ? "var(--color-ember)"
                                : "var(--color-mute)",
                        }}
                      >
                        {prod.code}
                      </div>
                      <div className="mt-4 text-bone font-medium font-sans text-[15px] group-hover:text-cyan transition-colors">
                        {prod.name}
                      </div>
                      <p className="mt-1 text-faint leading-snug font-mono text-[10px] uppercase tracking-[0.08em]">
                        {prod.tagline}
                      </p>
                    </div>
                  </NotchedCard>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>

      {/* ─── Read this if… ──────────────────────────── */}
      <Container size="wide" className="py-12">
        <Reveal>
          <ReadThisIf recommendations={recommender} />
        </Reveal>
      </Container>

      {/* ─── Newsletter / status ─────────────────────── */}
      <Container size="wide" className="py-16">
        <Reveal>
          <Section label="// dispatches in your inbox">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <EditorialHeading className="mb-4">
                  One letter, <em>every Friday.</em>
                </EditorialHeading>
                <p className="text-bone/75 leading-relaxed text-[15px] max-w-[44ch]">
                  The week&apos;s essays, what I&apos;m reading, and one short
                  field note. No marketing. The whole thing, designed to read.
                </p>
                <p className="mt-4 text-faint text-[13px] font-mono uppercase tracking-[0.08em]">
                  Last sent · {format(new Date(NOW.updated), "yyyy-MM-dd")}
                </p>
              </div>
              <NewsletterForm source="home" variant="card" />
            </div>
          </Section>
        </Reveal>
      </Container>
    </Page>
  );
}

/**
 * SignalPanel — the oscilloscope skyline graphic for the Latest
 * Transmission card. Pure SVG, deterministic, low-key animated.
 */
function SignalPanel() {
  // Build a deterministic skyline of bars.
  const bars = Array.from({ length: 48 }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const h = 12 + (seed % 60);
    return h;
  });
  return (
    <svg
      viewBox="0 0 480 176"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {/* Grid */}
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1C232E" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="480" height="176" fill="url(#grid)" />
      {/* Skyline bars */}
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 10}
          y={176 - h}
          width="6"
          height={h}
          fill="#0A2C33"
          stroke="#00E5FF"
          strokeOpacity="0.5"
          strokeWidth="0.5"
        />
      ))}
      {/* Reticle */}
      <g transform="translate(240, 88)">
        <circle r="20" fill="none" stroke="#00E5FF" strokeWidth="1" opacity="0.6" />
        <circle r="3" fill="#00E5FF" />
        <line x1="-30" y1="0" x2="-22" y2="0" stroke="#00E5FF" strokeWidth="1" />
        <line x1="22" y1="0" x2="30" y2="0" stroke="#00E5FF" strokeWidth="1" />
        <line x1="0" y1="-30" x2="0" y2="-22" stroke="#00E5FF" strokeWidth="1" />
        <line x1="0" y1="22" x2="0" y2="30" stroke="#00E5FF" strokeWidth="1" />
      </g>
    </svg>
  );
}
