/**
 * /about — the long version.
 *
 * A multi-section, interactive about page:
 *
 *  1. Hero          — monogram, animated tagline, identity strip
 *  2. By the numbers — animated stat row
 *  3. Long bio      — editorial paragraphs with a margin signature
 *  4. Story arc     — five-year tactical timeline
 *  5. Pillars tour  — what gets written, by area
 *  6. Principles    — interactive selector with detailed annotations
 *  7. Currently     — live "now" snapshot pulled from /now
 *  8. Reach me      — contact grid
 *  9. FAQ           — collapsible Q&A
 * 10. Where to start — three-link reading list
 *
 * No founder face. Tactical-editorial system throughout.
 */

import { format } from "date-fns";
import {
  Page,
  Container,
  EditorialColumn,
  Section,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  Hr,
  InlineLink,
  NotchedCard,
  PillarTag,
} from "@/components";
import Link from "next/link";
import { ABOUT, NOW, PRODUCTS } from "@/content/site-data";
import { Monogram } from "@/components/monogram";
import {
  CountUp,
  CursorTagline,
  InteractivePrinciples,
} from "@/components/about-interactive";

export const metadata = {
  title: "About",
  description:
    "About Jason Teixeira and Sage After Dark — late-night essays, tutorials, and dispatches from Sage Ideas.",
};

/* Static pillar data for the tour. */
const PILLAR_TOUR = [
  {
    key: "build" as const,
    code: "01",
    title: "Build",
    blurb: "Production software, the parts I had to learn the hard way.",
    href: "/build",
  },
  {
    key: "world" as const,
    code: "02",
    title: "World",
    blurb: "Pricing, positioning, and the texture of running a small studio.",
    href: "/world",
  },
  {
    key: "mind" as const,
    code: "03",
    title: "Mind",
    blurb: "Books, tools, and the half-life of decisions I keep returning to.",
    href: "/mind",
  },
  {
    key: "teach" as const,
    code: "04",
    title: "Teach",
    blurb: "Tutorials and runbooks I'd hand a new hire on day one.",
    href: "/teach",
  },
];

export default function AboutPage() {
  const updated = format(new Date(ABOUT.updated), "yyyy-MM-dd");

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        {/* ── Tactical strip ─────────────────────────────────────── */}
        <TacticalStrip>
          <TerminalPrompt path="~/about" mode="breadcrumb" />
          <StripSep />
          <span>UPDATED · {updated.toUpperCase()}</span>
          <StripSep />
          <span className="text-cyan">SIGNAL · ON</span>
        </TacticalStrip>

        {/* ── 1 · Hero ───────────────────────────────────────────── */}
        <header className="relative mt-10 mb-14">
          {/* Tactical corner brackets */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-2 -inset-y-2 hidden md:block"
          >
            <Bracket pos="tl" />
            <Bracket pos="tr" />
            <Bracket pos="bl" />
            <Bracket pos="br" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 items-center">
            <div className="shrink-0 relative">
              <Monogram size={144} glow />
              <div className="absolute -bottom-1 -right-1 font-mono text-[9px] tracking-[0.16em] text-cyan/80">
                JT · SAD
              </div>
            </div>

            <div className="max-w-3xl">
              <Tactical className="text-cyan mb-3 block">// identity</Tactical>
              <Display className="mb-5 leading-[0.95]">
                Jason Teixeira.
              </Display>
              <Lead className="mb-3">
                Operator at{" "}
                <InlineLink href="https://sageideas.dev">Sage Ideas</InlineLink>
                . Writer at this desk, with the lamp on.
              </Lead>
              <p className="font-mono text-[12px] uppercase tracking-[0.12em] text-mute">
                <span className="text-cyan">▸</span>{" "}
                <CursorTagline taglines={ABOUT.taglines} />
              </p>

              {/* Identity meta strip */}
              <ul className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.08em]">
                <li className="border-l border-cyan/60 pl-3">
                  <span className="block text-mute/80">Based</span>
                  <span className="block text-bone">{NOW.location}</span>
                </li>
                <li className="border-l border-rule pl-3">
                  <span className="block text-mute/80">Studio</span>
                  <span className="block text-bone">Sage Ideas</span>
                </li>
                <li className="border-l border-rule pl-3">
                  <span className="block text-mute/80">Cadence</span>
                  <span className="block text-bone">Weekly · long-form</span>
                </li>
                <li className="border-l border-rule pl-3">
                  <span className="block text-mute/80">Open to</span>
                  <span className="block text-bone">Email</span>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* ── 2 · By the numbers ─────────────────────────────────── */}
        <section className="mb-20">
          <Tactical className="text-cyan mb-5 block">
            // by the numbers
          </Tactical>
          <div className="grid grid-cols-2 md:grid-cols-4 border-t border-rule">
            {ABOUT.stats.map((s, i) => (
              <div
                key={i}
                className="border-b border-r border-rule last:border-r-0 md:[&:nth-child(4n)]:border-r-0 p-6 md:p-8 group hover:bg-cyan/[0.04] transition-colors"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 mb-2">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="font-sans text-bone text-[42px] md:text-[56px] leading-none tabular-nums tracking-tight">
                  <CountUp to={s.kpi} suffix={s.suffix} />
                </div>
                <div className="mt-3 text-mute text-[13px] leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3 · Long bio ───────────────────────────────────────── */}
        <Section label="// the long version">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 md:gap-16">
            <EditorialColumn className="space-y-5">
              {ABOUT.bio.map((para, i) => (
                <p
                  key={i}
                  className="text-bone/90 leading-[1.7] [font-size:var(--text-body)]"
                >
                  {i === 0 ? <FirstLetter>{para}</FirstLetter> : para}
                </p>
              ))}
            </EditorialColumn>

            {/* Margin signature card */}
            <aside className="hidden md:block w-[220px] sticky top-24 self-start">
              <NotchedCard notch="tr" pillarKey="mind" label="SIG">
                <div className="p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute mb-3">
                    Signed
                  </div>
                  <div className="font-sans text-bone text-[18px] leading-tight mb-1">
                    Jason Teixeira
                  </div>
                  <div className="text-mute text-[12px] leading-snug">
                    Brooklyn · {updated}
                  </div>
                  <div className="mt-4 pt-4 border-t border-rule font-mono text-[10px] uppercase tracking-[0.08em] text-cyan/80">
                    ▸ One operator
                    <br />▸ One studio
                    <br />▸ One cathedral / yr
                  </div>
                </div>
              </NotchedCard>
            </aside>
          </div>
        </Section>

        <Hr className="my-20" />

        {/* ── 4 · Story arc ──────────────────────────────────────── */}
        <Section label="// arc · 2014 → now">
          <p className="text-bone/80 mb-8 max-w-2xl text-[15px]">
            Five waypoints on the way here. Compressed, not complete.
          </p>

          <ol className="relative pl-8 md:pl-10 border-l border-rule">
            {ABOUT.arc.map((a, i) => {
              const isLast = i === ABOUT.arc.length - 1;
              return (
                <li
                  key={a.year}
                  className={`relative ${isLast ? "" : "pb-10"}`}
                >
                  {/* node */}
                  <span
                    aria-hidden
                    className={`absolute -left-[42px] md:-left-[50px] top-1 flex items-center gap-2`}
                  >
                    <span
                      className={`block w-2 h-2 rounded-[1px] ${
                        isLast ? "bg-cyan" : "bg-bone"
                      } ring-4 ring-ink-0`}
                    />
                  </span>
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan mb-1">
                    {a.year}
                  </div>
                  <h3 className="font-sans text-bone text-[20px] md:text-[22px] leading-snug mb-2">
                    {a.title}
                  </h3>
                  <p className="text-bone/70 leading-relaxed text-[15px] max-w-2xl">
                    {a.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </Section>

        <Hr className="my-20" />

        {/* ── 5 · Pillars tour ───────────────────────────────────── */}
        <Section label="// what I write about">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PILLAR_TOUR.map((p) => (
              <Link
                key={p.key}
                href={p.href}
                className="group block border border-rule hover:border-cyan/60 bg-ink-1 hover:bg-cyan/[0.04] p-6 transition-colors relative"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 tabular-nums">
                    {p.code}
                  </div>
                  <PillarTag pillar={p.key} />
                </div>
                <div className="font-sans text-bone text-[22px] mb-2 group-hover:text-cyan transition-colors">
                  {p.title} →
                </div>
                <div className="text-mute text-[14px] leading-relaxed">
                  {p.blurb}
                </div>
              </Link>
            ))}
          </div>
        </Section>

        <Hr className="my-20" />

        {/* ── 6 · Principles ─────────────────────────────────────── */}
        <Section label="// operating principles">
          <p className="text-bone/80 mb-8 max-w-2xl text-[15px]">
            Eight rules. Hover or arrow-key through them. They are not
            aspirations — these are the ones that survived being wrong on a
            Tuesday.
          </p>
          <InteractivePrinciples items={ABOUT.principlesDetailed} />
        </Section>

        <Hr className="my-20" />

        {/* ── 7 · Currently ──────────────────────────────────────── */}
        <Section label="// currently">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <NotchedCard notch="tl" pillarKey="build" label="STATUS">
              <div className="p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 mb-3">
                  This week
                </div>
                <p className="text-bone leading-relaxed text-[15px]">
                  {NOW.status}
                </p>
                <Link
                  href="/now"
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-cyan hover:underline"
                >
                  Read /now →
                </Link>
              </div>
            </NotchedCard>

            <NotchedCard notch="tl" pillarKey="world" label="DOING">
              <div className="p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 mb-3">
                  On the desk
                </div>
                <ul className="space-y-2 text-bone/90 text-[14px] leading-snug">
                  {NOW.this_week.slice(0, 3).map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-cyan">▸</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </NotchedCard>

            <NotchedCard notch="tl" pillarKey="mind" label="NOT">
              <div className="p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ember/80 mb-3">
                  Not doing
                </div>
                <ul className="space-y-2 text-bone/80 text-[14px] leading-snug">
                  {NOW.not_doing.slice(0, 3).map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-ember">×</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </NotchedCard>
          </div>
        </Section>

        <Hr className="my-20" />

        {/* ── 7b · Studio products strip ─────────────────────────── */}
        <Section label="// the day job">
          <p className="text-bone/80 mb-6 max-w-2xl text-[15px]">
            Three products under{" "}
            <InlineLink href="https://sageideas.dev">Sage Ideas</InlineLink> —
            funded by clients, operated by me.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRODUCTS.map((p) => (
              <a
                key={p.code}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block border border-rule hover:border-bone/60 bg-ink-1 p-5 transition-colors"
              >
                <div className="flex items-baseline gap-3 mb-2">
                  <span
                    className={`font-mono text-[20px] tabular-nums leading-none ${
                      p.accent === "cyan"
                        ? "text-cyan"
                        : p.accent === "ember"
                        ? "text-ember"
                        : "text-mute"
                    }`}
                  >
                    {p.code}
                  </span>
                  <span className="font-sans text-bone text-[18px] group-hover:text-cyan transition-colors">
                    {p.name} →
                  </span>
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute leading-snug">
                  {p.tagline}
                </div>
              </a>
            ))}
          </div>
        </Section>

        <Hr className="my-20" />

        {/* ── 8 · Reach me ───────────────────────────────────────── */}
        <Section label="// reach me">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ABOUT.contact.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  c.href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="group flex items-baseline justify-between gap-4 border border-rule hover:border-cyan/60 bg-ink-1 px-5 py-4 transition-colors"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute group-hover:text-cyan transition-colors">
                  {c.label}
                </span>
                <span className="font-sans text-bone group-hover:text-cyan transition-colors">
                  {c.value} →
                </span>
              </a>
            ))}
          </div>
        </Section>

        <Hr className="my-20" />

        {/* ── 9 · FAQ ────────────────────────────────────────────── */}
        <Section label="// frequently asked">
          <div className="max-w-3xl space-y-2">
            {ABOUT.faq.map((f, i) => (
              <details
                key={i}
                className="group border border-rule hover:border-cyan/40 bg-ink-1/60 transition-colors open:border-cyan/60"
              >
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4">
                  <span className="flex items-baseline gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan tabular-nums">
                      Q.{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-sans text-bone text-[16px]">
                      {f.q}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-cyan transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5 -mt-1 pl-[3.4rem]">
                  <p className="text-bone/80 leading-relaxed text-[15px]">
                    {f.a}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </Section>

        <Hr className="my-20" />

        {/* ── 10 · Where to start ────────────────────────────────── */}
        <Section label="// where to start">
          <p className="text-bone/80 mb-6 max-w-2xl">
            New here? Three places that explain the rest:
          </p>
          <ol className="space-y-5 max-w-2xl">
            <StartHere
              n="01"
              href="/best"
              title="The best of Sage After Dark"
              sub="Anchor essays, longest pieces, recent favorites."
            />
            <StartHere
              n="02"
              href="/now"
              title="What I'm working on this week"
              sub="Updated weekly. Current, or it isn't."
            />
            <StartHere
              n="03"
              href="/dispatch"
              title="The dispatch archive"
              sub="Every short, urgent letter sent so far."
            />
          </ol>
        </Section>

        {/* ── Closing line ───────────────────────────────────────── */}
        <div className="mt-24 text-center">
          <div className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em] text-mute/80">
            <span className="block w-12 h-px bg-rule" />
            <span>End of file · /about</span>
            <span className="block w-12 h-px bg-rule" />
          </div>
        </div>
      </Container>
    </Page>
  );
}

/* ---------------------------------------------------------------- */
/* Sub-components                                                   */
/* ---------------------------------------------------------------- */

function StartHere({
  n,
  href,
  title,
  sub,
}: {
  n: string;
  href: string;
  title: string;
  sub: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-baseline gap-4 border-b border-rule pb-3 hover:border-cyan transition-colors"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan tabular-nums">
          {n}
        </span>
        <span className="flex-1">
          <span className="block font-sans text-bone group-hover:text-cyan transition-colors text-lg">
            {title} →
          </span>
          <span className="block text-mute text-sm mt-1">{sub}</span>
        </span>
      </Link>
    </li>
  );
}

/**
 * Decorative bracket that anchors a corner of the hero.
 * Renders as 2 perpendicular 1px rules.
 */
function Bracket({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-6 h-6 border-cyan/50";
  const map: Record<typeof pos, string> = {
    tl: "top-0 left-0 border-l border-t",
    tr: "top-0 right-0 border-r border-t",
    bl: "bottom-0 left-0 border-l border-b",
    br: "bottom-0 right-0 border-r border-b",
  };
  return <span aria-hidden className={`${base} ${map[pos]}`} />;
}

/**
 * Drop-cap-styled first letter for the lead bio paragraph.
 * Renders as a span so it's safe inside <p>.
 */
function FirstLetter({ children }: { children: string }) {
  if (!children || typeof children !== "string") return <>{children}</>;
  const first = children.charAt(0);
  const rest = children.slice(1);
  return (
    <>
      <span className="float-left font-sans text-cyan text-[64px] leading-[0.85] mr-2 mt-1">
        {first}
      </span>
      {rest}
    </>
  );
}
