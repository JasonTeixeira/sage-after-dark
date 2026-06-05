/**
 * /start — the narrated strategy page.
 *
 * Long-scroll. Six sections. The single URL to share on HN, LinkedIn,
 * podcasts, etc. Designed as the canonical "what is Sage After Dark?"
 * answer.
 */

import Link from "next/link";
import { format } from "date-fns";
import {
  Page,
  Container,
  EditorialColumn,
  Section,
  EditorialDisplay,
  EditorialHeading,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  NotchedCard,
  ButtonLink,
  InlineLink,
  PillarTag,
  NewsletterForm,
  AnimatedDiagram,
  DiagramNoiseVsSignal,
  DiagramFivePillars,
  DiagramArcTimeline,
  Reveal,
  Hr,
} from "@/components";
import { ARCS, TRAYD_EPISODES } from "@/content/site-data";
import { getSiteCounts } from "@/lib/live-counts";

export const metadata = {
  title: "Start here — what Sage After Dark is",
  description:
    "The narrated strategy. The bet, the pillars, the arc system, the receipts. Read this if you've never been here before.",
  alternates: { canonical: "/start" },
};

export default async function StartPage() {
  const counts = await getSiteCounts();
  const today = format(new Date(), "yyyy-MM-dd");
  const traydArc = ARCS.find((a) => a.slug === "trayd-in-public");
  const traydTimeline = TRAYD_EPISODES.map((e) => ({
    n: Number(e.n),
    kind: e.kind,
    title: e.title,
  }));
  const currentEpisode =
    Number(TRAYD_EPISODES.find((e) => e.kind === "LIVE NOW")?.n) ||
    Math.max(...TRAYD_EPISODES.filter((e) => e.kind === "PUBLISHED").map((e) => Number(e.n)), 1);

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        {/* Magazine-style header bar from the strategy doc mockup */}
        <div className="border-b border-cyan/40 pb-3 mb-12 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em]">
          <div className="flex items-center gap-3 text-cyan">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
            <span>SAGE@AFTERDARK</span>
            <span className="text-faint">~</span>
            <span className="text-mute">/strategy</span>
            <span className="text-faint">·</span>
            <span className="text-mute">STRATEGY DOCUMENT</span>
            <span className="text-faint">·</span>
            <span className="text-cyan">V.01</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-mute">
            <span>PAGE 001</span>
            <span className="text-faint">·</span>
            <span>{today.toUpperCase()}</span>
          </div>
        </div>

        <TacticalStrip>
          <TerminalPrompt path="~/start" mode="breadcrumb" />
          <StripSep />
          <span>NARRATED · 6 SECTIONS · ~4 MIN</span>
        </TacticalStrip>

        {/* HERO */}
        <header className="mt-14 mb-16 max-w-[58ch]">
          <Tactical className="text-cyan mb-4 block">// the bet</Tactical>
          <EditorialDisplay className="mb-6">
            One person.<br />
            Five surfaces.<br />
            <em>One signal.</em>
          </EditorialDisplay>
          <Lead>
            Sage After Dark is the after-hours notebook of a one-person studio.
            Software, taste, psychology, and the slow internet — written by the
            same operator who ships production code by day. This page is the
            map. Read it once, then start anywhere.
          </Lead>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/" variant="primary">▸ The home page</ButtonLink>
            <ButtonLink href="/archive" variant="outline">▸ Browse the archive</ButtonLink>
            <ButtonLink href="/account/signup" variant="outline">▸ Create an account</ButtonLink>
          </div>
        </header>

        <Hr />

        {/* SECTION 01 — THE PROBLEM */}
        <Reveal>
          <Section label="// 01 · the problem">
            <EditorialHeading className="mb-6">
              The internet is loud. <em>Most of it isn&apos;t for you.</em>
            </EditorialHeading>
            <EditorialColumn>
              <p className="text-bone/90 leading-[1.7] text-[var(--text-body)]">
                The default modern feed is engineered for engagement, not for
                you. It rewards the loud over the precise, the new over the
                durable. A million tabs open, nothing finished, nobody&apos;s
                voice you&apos;d recognize across a room. We&apos;re drowning in
                signal&apos;s opposite.
              </p>
              <p className="mt-5 text-bone/90 leading-[1.7] text-[var(--text-body)]">
                Sage After Dark is built on the opposite premise. One operator,
                writing slowly, in the quiet hours, with a signature you could
                pick out of a stack of a hundred essays.
              </p>
            </EditorialColumn>
            <AnimatedDiagram>
              <DiagramNoiseVsSignal />
            </AnimatedDiagram>
          </Section>
        </Reveal>

        <Hr />

        {/* SECTION 02 — THE BET */}
        <Reveal>
          <Section label="// 02 · the bet">
            <EditorialHeading className="mb-6">
              Five pillars. <em>One voice.</em> No newsletter empire.
            </EditorialHeading>
            <EditorialColumn>
              <p className="text-bone/90 leading-[1.7] text-[var(--text-body)]">
                Everything I publish lands in one of five pillars. They aren&apos;t
                topics; they&apos;re surfaces of the same lens. The lens is mine.
                If you read three essays you&apos;ll know whether you want a
                fourth.
              </p>
            </EditorialColumn>
            <AnimatedDiagram>
              <DiagramFivePillars />
            </AnimatedDiagram>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(["build", "signal", "mind", "world", "taste"] as const).map(
                (k) => (
                  <Link
                    key={k}
                    href={`/${k}`}
                    className="group flex flex-col items-start gap-2 border border-rule p-3 hover:border-cyan transition-colors"
                  >
                    <PillarTag pillar={k} size="sm" />
                    <span className="text-[10px] font-mono uppercase tracking-[0.1em] text-faint group-hover:text-cyan">
                      browse pillar →
                    </span>
                  </Link>
                ),
              )}
            </div>
          </Section>
        </Reveal>

        <Hr />

        {/* SECTION 03 — WHAT YOU ACTUALLY GET */}
        <Reveal>
          <Section label="// 03 · what you actually get">
            <EditorialHeading className="mb-8">
              Four formats. <em>Each engineered for a different reason.</em>
            </EditorialHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  code: "FMT_01",
                  title: "Long-form essays",
                  body: "Deep dives — taste, learning, the half-life of tools. Diagrams included. Often the canonical reference for whatever idea I&apos;m wrestling with that month.",
                  cadence: "MONTHLY",
                },
                {
                  code: "FMT_02",
                  title: "Field notes & dispatches",
                  body: "Short transmissions. What broke, what I noticed, what I changed my mind about this week. Free. Always.",
                  cadence: "WEEKLY",
                },
                {
                  code: "FMT_03",
                  title: "Multi-episode arcs",
                  body: "Long-running field journals. Trayd, In Public is twelve episodes documenting a real product launch — the receipts public, the mistakes public, the numbers when I can share them.",
                  cadence: "12-WEEK SEASONS",
                },
                {
                  code: "FMT_04",
                  title: "Tutorials with runnable code",
                  body: "Members get the full transcripts, the starter repos, and the long versions of essays where I show every decision.",
                  cadence: "MEMBERS · ~2/MO",
                },
              ].map((f) => (
                <NotchedCard
                  key={f.code}
                  notch="tl"
                  pillarKey="mind"
                  label={f.code}
                  className="h-full"
                >
                  <div className="p-6">
                    <div className="text-cyan font-mono text-[10px] uppercase tracking-[0.12em] mb-3">
                      {f.cadence}
                    </div>
                    <h3 className="font-sans text-bone text-[18px] mb-2">
                      {f.title}
                    </h3>
                    <p
                      className="text-bone/80 leading-relaxed text-[15px]"
                      dangerouslySetInnerHTML={{ __html: f.body.replace(/&apos;/g, "&#39;") }}
                    />
                  </div>
                </NotchedCard>
              ))}
            </div>
          </Section>
        </Reveal>

        <Hr />

        {/* SECTION 04 — THE ARC SYSTEM */}
        <Reveal>
          <Section label="// 04 · the arc system">
            <EditorialHeading className="mb-6">
              Some stories take <em>twelve episodes.</em>
            </EditorialHeading>
            <EditorialColumn>
              <p className="text-bone/90 leading-[1.7] text-[var(--text-body)]">
                A blog post is a snapshot. An arc is a season. Each arc is a
                committed series — twelve episodes, weekly cadence, public
                start date, public end date — documenting one real thing as it
                happens. The current arc is{" "}
                <InlineLink href="/arcs/trayd-in-public">Trayd, In Public</InlineLink>:
                the build, launch, and operation of an AI companion for trades
                contractors. Every episode is a chapter of a real product. The
                receipts are public. The mistakes are public.
              </p>
            </EditorialColumn>
            {traydArc && (
              <AnimatedDiagram duration={1800}>
                <DiagramArcTimeline
                  episodes={traydTimeline}
                  current={currentEpisode}
                  arcCode={traydArc.code}
                  arcTitle="TRAYD, IN PUBLIC"
                />
              </AnimatedDiagram>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ButtonLink href="/arcs/trayd-in-public" variant="primary">
                ▸ Read the current arc
              </ButtonLink>
            </div>
          </Section>
        </Reveal>

        <Hr />

        {/* SECTION 05 — THE RECEIPTS */}
        <Reveal>
          <Section label="// 05 · the receipts">
            <EditorialHeading className="mb-6">
              Numbers. <em>Real ones.</em>
            </EditorialHeading>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Essays published" value={counts.postsLabel} />
              <Stat label="Words shipped" value={counts.wordsLabel} />
              <Stat label="Active arcs" value={String(counts.activeArcs)} />
              <Stat label="Subscribers" value={counts.subscribersLabel} />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
              <Badge title="Lighthouse" body="96+ across all key pages" />
              <Badge title="Free to read" body="all essays and dispatches are free, forever" />
              <Badge title="Open in public" body="archive, arcs, and now-playing all live" />
            </div>
            <p className="mt-6 text-mute text-[13px] font-mono uppercase tracking-[0.06em]">
              // a public dashboard at <InlineLink href="/numbers">/numbers</InlineLink>{" "}
              is coming next — MRR, churn, top-read essays, all rounded for privacy.
            </p>
          </Section>
        </Reveal>

        <Hr />

        {/* SECTION 06 — FINAL CTA */}
        <Reveal>
          <Section label="// 06 · subscribe / become a member">
            <NotchedCard notch="tl" pillarKey="signal" label="//SUBSCRIBE">
              <div className="p-8 grid md:grid-cols-[1fr_auto] gap-6 items-center">
                <div>
                  <EditorialHeading className="mb-3" style={{ fontSize: "clamp(1.4rem, 2.4vw, 2rem)" }}>
                    Get the late-night email.
                  </EditorialHeading>
                  <p className="text-bone/80 leading-relaxed">
                    Free dispatches every Friday. Members get the long versions,
                    the runnable repos, and the monthly cipher key.
                  </p>
                </div>
                <div className="w-full md:w-auto">
                  <NewsletterForm source="start-page" variant="inline" />
                </div>
              </div>
            </NotchedCard>
            <div className="mt-6 flex flex-wrap items-center gap-3 justify-center">
              <ButtonLink href="/account/signup" variant="primary">
                ▸ Create an account
              </ButtonLink>
              <ButtonLink href="/archive" variant="outline">
                ▸ Browse the archive
              </ButtonLink>
            </div>
            <p className="mt-10 text-center text-faint font-mono text-[10px] uppercase tracking-[0.12em]">
              ▸ press <span className="text-cyan">D</span> anywhere on the site for the decoder ring
            </p>
          </Section>
        </Reveal>
      </Container>
    </Page>
  );
}

/* ---- helpers ---- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-rule p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint mb-1">
        {label}
      </div>
      <div className="font-mono text-bone tabular-nums" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
        {value}
      </div>
    </div>
  );
}

function Badge({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-rule p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan mb-1">
        ▸ {title}
      </div>
      <div className="text-bone/80 text-[14px]">{body}</div>
    </div>
  );
}


