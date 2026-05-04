/**
 * /arcs/[slug] — long-running multi-episode story arc.
 *
 * Hero: serif italic display title + ARC progress meter
 * Episodes timeline: published → live → scheduled → drafting → planned
 * Subscribe-to-arc CTA at bottom.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Page,
  Container,
  EditorialDisplay,
  EditorialHeading,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  PillarTag,
  NotchedCard,
  ButtonLink,
  NewsletterForm,
} from "@/components";
import { ARCS, TRAYD_EPISODES } from "@/content/site-data";

export async function generateStaticParams() {
  return ARCS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const arc = ARCS.find((a) => a.slug === slug);
  return {
    title: arc?.title ?? "Arc",
    description: arc?.summary,
  };
}

export default async function ArcPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const arc = ARCS.find((a) => a.slug === slug);
  if (!arc) notFound();

  // For now only Trayd has full episode data
  const episodes = slug === "trayd-in-public" ? TRAYD_EPISODES : [];
  const published = episodes.filter((e) => e.kind === "PUBLISHED" || e.kind === "LIVE NOW").length;
  const inProduction = episodes.filter(
    (e) => e.kind === "DRAFTING" || e.kind === "SCHEDULED",
  ).length;
  const upcoming = episodes.filter((e) => e.kind === "PLANNED").length;

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        {/* Tactical strip */}
        <TacticalStrip>
          <TerminalPrompt path={`/arcs/${arc.slug}`} mode="breadcrumb" />
          <StripSep />
          <span>{arc.code}</span>
          <StripSep />
          <span>{arc.episodes_total}-EPISODE ARC</span>
          <span className="ml-auto">
            {String(arc.episodes_done).padStart(2, "0")} / {arc.episodes_total} ·{" "}
            <span className="text-cyan">LIVE</span>
          </span>
        </TacticalStrip>

        {/* Hero */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
          <header className="lg:col-span-7">
            <Tactical className="text-cyan mb-3 block">
              {arc.code} · TRAYD-IN-PUBLIC
            </Tactical>
            <Tactical className="block mb-4 text-mute">
              <PillarTag pillar={arc.pillar} size="sm" />
              <span className="ml-2">· {arc.episodes_total} EPISODE ARC</span>
            </Tactical>
            <EditorialDisplay
              className="mb-6"
              style={{ fontSize: "clamp(2.5rem,6vw,5rem)" } as React.CSSProperties}
            >
              {arc.title.replace(arc.italic, "")}
              <br />
              <em>{arc.italic}.</em>
            </EditorialDisplay>
            <p className="text-bone/80 leading-relaxed text-[16px] max-w-[58ch]">
              {arc.summary}
            </p>
            <dl className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-[11px] font-mono uppercase tracking-[0.08em]">
              <div>
                <dt className="text-faint">STARTED</dt>
                <dd className="text-bone mt-1">{arc.started}</dd>
              </div>
              <div>
                <dt className="text-faint">CADENCE</dt>
                <dd className="text-bone mt-1">{arc.cadence}</dd>
              </div>
              <div>
                <dt className="text-faint">FORMAT</dt>
                <dd className="text-bone mt-1">{arc.format}</dd>
              </div>
              <div>
                <dt className="text-faint">PRIMARY DOCS</dt>
                <dd className="text-bone mt-1">link</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ButtonLink href="#subscribe" variant="primary">
                ▸ Subscribe to arc
              </ButtonLink>
              <ButtonLink href="#episodes" variant="outline">
                ▸ Share
              </ButtonLink>
            </div>
          </header>

          {/* Right: progress meter */}
          <aside className="lg:col-span-5">
            <NotchedCard notch="tl" pillarKey={arc.pillar} label="//ARC_PROGRESS">
              <div className="p-6">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-mute">
                    EPISODES PUBLISHED
                  </span>
                  <span className="text-cyan">●</span>
                </div>
                <div
                  className="font-mono text-bone leading-none tabular-nums"
                  style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}
                >
                  {String(arc.episodes_done).padStart(2, "0")}
                  <span className="text-faint">/{arc.episodes_total}</span>
                </div>
                <div className="mt-4 grid grid-cols-12 gap-1">
                  {Array.from({ length: arc.episodes_total }, (_, i) => {
                    const isDone = i < published;
                    const isProd = i >= published && i < published + inProduction;
                    const isUp = i >= published + inProduction;
                    const cls = isDone
                      ? "bg-cyan"
                      : isProd
                        ? "bg-cyan/30"
                        : "bg-rule";
                    return (
                      <span
                        key={i}
                        className={`h-3 ${cls}`}
                        aria-hidden="true"
                      />
                    );
                  })}
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-[0.08em]">
                  <div>
                    <div className="text-cyan">▮ {published} PUBLISHED</div>
                  </div>
                  <div>
                    <div className="text-cyan/60">▮ {inProduction} IN PRODUCTION</div>
                  </div>
                  <div>
                    <div className="text-faint">▮ {upcoming || arc.episodes_total - published - inProduction} UPCOMING</div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-rule flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.08em]">
                  <span className="text-faint">NEXT EPISODE</span>
                  <span className="text-bone">26 APR · 09:00 EDT</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ButtonLink href="#subscribe" variant="primary">
                    ▸ SUBSCRIBE TO ARC
                  </ButtonLink>
                  <ButtonLink href="/archive" variant="outline">▸ SHARE</ButtonLink>
                </div>
              </div>
            </NotchedCard>
          </aside>
        </div>

        {/* Episodes timeline */}
        <div id="episodes" className="border-t border-rule pt-10">
          <div className="flex items-end justify-between mb-8">
            <EditorialHeading style={{ fontSize: "clamp(1.75rem,3vw,2.5rem)" } as React.CSSProperties}>
              The <em>episodes.</em>
            </EditorialHeading>
            <Tactical className="hidden md:block">
              {published} PUBLISHED · {inProduction} IN PRODUCTION · {arc.episodes_total - published - inProduction} UPCOMING
            </Tactical>
          </div>
          <ol className="relative">
            {/* Spine */}
            <div className="absolute left-3 top-2 bottom-2 w-px bg-rule" aria-hidden="true" />
            {episodes.map((ep) => {
              const isPublished = ep.kind === "PUBLISHED" || ep.kind === "LIVE NOW";
              const accent =
                ep.kind === "LIVE NOW"
                  ? "bg-cyan animate-pulse"
                  : isPublished
                    ? "bg-cyan"
                    : ep.kind === "DRAFTING"
                      ? "bg-cyan/40"
                      : ep.kind === "SCHEDULED"
                        ? "bg-cyan/60"
                        : "bg-rule";
              return (
                <li key={ep.n} className="relative pl-10 pb-10 last:pb-0">
                  <span
                    className={`absolute left-1.5 top-2 h-3 w-3 rounded-full ${accent}`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono uppercase tracking-[0.08em] text-mute">
                    <span>EPISODE {ep.n}</span>
                    <span>·</span>
                    <span
                      className={`${
                        ep.kind === "LIVE NOW"
                          ? "text-cyan"
                          : isPublished
                            ? "text-cyan/80"
                            : ep.kind === "DRAFTING"
                              ? "text-ember"
                              : "text-faint"
                      }`}
                    >
                      {ep.kind}
                    </span>
                    <span>·</span>
                    <span className="text-faint">{ep.date}</span>
                    <span>·</span>
                    <span className="text-faint">{ep.read}</span>
                    {ep.views && (
                      <>
                        <span>·</span>
                        <span className="text-faint">{ep.views} reads</span>
                      </>
                    )}
                    {ep.responses && (
                      <>
                        <span>·</span>
                        <span className="text-faint">{ep.responses} responses</span>
                      </>
                    )}
                    {ep.format && (
                      <>
                        <span>·</span>
                        <span className="text-faint">{ep.format}</span>
                      </>
                    )}
                  </div>
                  <h3
                    className="mt-2 text-bone leading-tight [font-family:var(--font-editorial)]"
                    style={{ fontSize: "clamp(1.4rem, 2vw, 1.85rem)" }}
                  >
                    {ep.title}
                  </h3>
                  <p className="mt-2 text-bone/75 leading-relaxed text-[15px] max-w-[68ch]">
                    {ep.summary}
                  </p>
                  {isPublished && (
                    <Link
                      href={`/build/${arc.slug}-ep-${ep.n}`}
                      className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-cyan hover:text-bone transition-colors"
                    >
                      Read transmission →
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        {/* Subscribe to arc */}
        <div id="subscribe" className="mt-16">
          <NotchedCard notch="tl" pillarKey={arc.pillar}>
            <div className="p-6 flex flex-wrap items-center gap-6">
              <span className="h-10 w-10 rounded-full bg-cyan/20 grid place-items-center text-cyan">
                ●
              </span>
              <div className="flex-1 min-w-[16rem]">
                <div className="text-bone leading-snug font-medium">
                  Get the arc in your inbox.
                </div>
                <p className="text-bone/70 text-[13px] mt-0.5">
                  Each Friday at 7AM EDT, the next episode lands. No
                  marketing. The whole thing, designed to read.
                </p>
              </div>
              <div className="w-full lg:w-auto">
                <NewsletterForm source={`arc:${arc.slug}`} variant="inline" />
              </div>
            </div>
          </NotchedCard>
        </div>
      </Container>
    </Page>
  );
}
