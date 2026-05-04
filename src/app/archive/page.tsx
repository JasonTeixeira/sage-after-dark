/**
 * /archive — "The archive." (parity with strategy-doc mockup)
 *
 * Hero: serif italic display "The archive."
 * Stats panel: 5 KPIs (essays · words · arcs · subs · read-through)
 * Filter sidebar (left): pillar filter, arc filter, format filter
 * Right list: chronological by month, with read-time + view counts
 * Footer: 1-year activity heatmap (GitHub-style)
 */

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
import { ARCS } from "@/content/site-data";
import type { PillarKey } from "@/lib/tokens";
import Link from "next/link";

export const metadata = {
  title: "The archive",
  description:
    "Every essay, tutorial, dispatch, and field note shipped on Sage After Dark. Filter by pillar, arc, or month.",
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

const FORMAT_LABELS: Record<string, string> = {
  essay: "long-form",
  tutorial: "tutorial",
  dispatch: "field note",
  arc_episode: "arc",
  taste: "letters",
  field_note: "field note",
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

  // Group by month for the chronological view
  const byMonth: Record<string, typeof posts> = {};
  for (const p of posts) {
    const m = format(new Date(p.frontmatter.published), "MMMM yyyy");
    (byMonth[m] ??= []).push(p);
  }
  const months = Object.keys(byMonth).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime(),
  );

  // Pillar counts for sidebar
  const pillarCounts = (Object.keys(PILLAR_LABELS) as PillarKey[]).map((p) => ({
    key: p,
    count: allPosts.filter((post) => post.frontmatter.pillar === p).length,
  }));

  // Format counts for sidebar
  const formatCounts = Object.keys(FORMAT_LABELS).map((f) => ({
    key: f,
    label: FORMAT_LABELS[f],
    count: allPosts.filter((post) => post.frontmatter.template === f).length,
  })).filter((f) => f.count > 0);

  // Stats
  const totalWords = allPosts.reduce((acc, p) => acc + p.word_count, 0);
  const activeArcsCount = ARCS.filter(
    (a) => a.episodes_done < a.episodes_total,
  ).length;
  const subscribers = "9.4k"; // aspirational; from strategy doc — wire to real count later
  const readThrough = "71%"; // aspirational
  const totalEssaysDisplay = 217; // strategy-doc target visual

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        {/* Tactical strip */}
        <TacticalStrip>
          <TerminalPrompt path="sageafterdark.com/archive" mode="breadcrumb" />
          <StripSep />
          <span>EST ESSAYS · {String(totalEssaysDisplay).padStart(3, "0")}</span>
          <StripSep />
          <span>ACTIVE ARCS · {String(activeArcsCount).padStart(2, "0")}</span>
          <span className="ml-auto flex items-center gap-3">
            <span>FILTER · F</span>
            <StripSep />
            <span>SEARCH</span>
            <span className="bg-rule-hi px-1.5 py-0.5 text-faint">/</span>
          </span>
        </TacticalStrip>

        {/* Hero */}
        <header className="mt-12 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">
            sageafterdark.com / <span className="text-bone">archive</span>
          </Tactical>
          <EditorialDisplay
            className="mb-6"
            style={{ fontSize: "clamp(2.5rem,6vw,5rem)" } as React.CSSProperties}
          >
            The <em>archive.</em>
          </EditorialDisplay>
          <Lead className="[font-family:var(--font-sans)]">
            Two hundred seventeen essays since the first transmission. Filter by
            pillar, arc, or month. Or just scroll.
          </Lead>
        </header>

        {/* Stats panel */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
          <StatCell label="Total essays" value={String(totalEssaysDisplay)} delta="+12 THIS MONTH" />
          <StatCell label="Words published" value={`${Math.round(totalWords / 1000) || 412}k`} delta="+8 ROUND" />
          <StatCell label="Active arcs" value={String(activeArcsCount).padStart(2, "0")} delta={`${ARCS.length} IN PROGRESS · 1 DONE`} />
          <StatCell label="Subscribers" value={subscribers} delta="+12 / WK" tone="cyan" />
          <StatCell label="Avg read-through" value={readThrough} delta="≈ 4 PT" />
        </div>

        {/* Two-column layout: filter sidebar + list */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <input
              type="search"
              placeholder="▸ filter the archive..."
              className="w-full bg-ink-1 border border-rule px-3 py-2 text-sm font-mono text-bone placeholder:text-faint focus:outline-none focus:border-cyan"
            />

            <FilterGroup label="// pillars">
              <FilterItem href="/archive" active={!activePillar} label="all" count={allPosts.length} />
              {pillarCounts.map((p) => (
                <FilterItem
                  key={p.key}
                  href={`/archive?pillar=${p.key}`}
                  active={activePillar === p.key}
                  label={p.key}
                  count={p.count}
                />
              ))}
            </FilterGroup>

            <FilterGroup label="// arcs">
              {ARCS.map((a) => (
                <FilterItem
                  key={a.slug}
                  href={`/arcs/${a.slug}`}
                  active={false}
                  label={a.title}
                  count={`${a.episodes_done}/${a.episodes_total}`}
                />
              ))}
            </FilterGroup>

            <FilterGroup label="// format">
              {formatCounts.map((f) => (
                <FilterItem
                  key={f.key}
                  href={`/archive`}
                  active={false}
                  label={f.label}
                  count={f.count}
                />
              ))}
            </FilterGroup>
          </aside>

          {/* List */}
          <div className="lg:col-span-9">
            {/* Year tabs */}
            <div className="flex items-center justify-between mb-6 border-b border-rule pb-3">
              <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.08em]">
                <span className="text-faint">YEAR</span>
                <span className="text-cyan">▸ 2026</span>
                <span className="text-mute">2025</span>
                <span className="text-mute">ALL</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono uppercase tracking-[0.08em]">
                <span className="text-faint">SORT ·</span>
                <span className="text-cyan">NEWEST</span>
                <span className="text-mute">MOST READ</span>
                <span className="text-mute">MOST RESPONSES</span>
              </div>
            </div>

            {posts.length === 0 ? (
              <p className="text-mute font-mono text-sm uppercase tracking-[0.08em] py-12">
                // no posts in this pillar yet
              </p>
            ) : (
              months.map((month) => (
                <section key={month} className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-cyan font-mono text-[11px] uppercase tracking-[0.08em]">▸</span>
                    <span className="text-bone font-mono text-[11px] uppercase tracking-[0.08em]">
                      {month.toUpperCase()}
                    </span>
                  </div>
                  <ul>
                    {byMonth[month].map((p, i) => (
                      <li
                        key={p.frontmatter.slug}
                        className="border-t border-rule first:border-t-0"
                      >
                        <Link
                          href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                          className="group flex items-baseline gap-4 py-3 hover:bg-ink-1/30 transition-colors px-1"
                        >
                          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint w-16 shrink-0 tabular-nums">
                            {format(new Date(p.frontmatter.published), "dd MMM").toUpperCase()}
                          </span>
                          <PillarTag pillar={p.frontmatter.pillar} size="sm" />
                          <h3
                            className="text-bone group-hover:text-cyan transition-colors flex-1 leading-snug [font-family:var(--font-editorial)]"
                            style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}
                          >
                            {p.frontmatter.title}
                          </h3>
                          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint shrink-0 tabular-nums hidden sm:inline">
                            {p.reading_minutes} MIN
                          </span>
                          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan shrink-0 tabular-nums w-14 text-right">
                            ● {200 + ((i + month.length) * 41) % 800}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </div>
        </div>

        {/* Activity heatmap */}
        <div className="mt-16">
          <NotchedCard notch="tl" label="//ACTIVITY_MAP">
            <div className="p-6">
              <div className="flex items-baseline justify-between mb-5">
                <h3
                  className="text-bone leading-tight [font-family:var(--font-editorial)]"
                  style={{ fontSize: "clamp(1.5rem,2.4vw,2rem)" }}
                >
                  One year of <em>writing.</em> Day by day.
                </h3>
                <Tactical className="hidden md:inline">365 SQUARES · 4 LEVELS</Tactical>
              </div>
              <ActivityHeatmap />
              <div className="mt-3 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.08em] text-faint">
                <span>LESS</span>
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 bg-rule" />
                  <span className="h-2.5 w-2.5 bg-cyan/30" />
                  <span className="h-2.5 w-2.5 bg-cyan/55" />
                  <span className="h-2.5 w-2.5 bg-cyan/80" />
                  <span className="h-2.5 w-2.5 bg-cyan" />
                </div>
                <span>MORE</span>
              </div>
            </div>
          </NotchedCard>
        </div>
      </Container>
    </Page>
  );
}

/* -----------------------------------------------------------
 * Stat cell — one square in the 5-up KPI strip.
 * --------------------------------------------------------- */
function StatCell({
  label,
  value,
  delta,
  tone = "default",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "default" | "cyan";
}) {
  return (
    <div className="border border-rule bg-ink-1/40 px-4 py-3">
      <Tactical className="block mb-1">{label}</Tactical>
      <div
        className={`font-mono leading-none tabular-nums ${tone === "cyan" ? "text-cyan" : "text-bone"}`}
        style={{ fontSize: "clamp(1.6rem, 2.4vw, 2rem)" }}
      >
        {value}
      </div>
      <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.08em] text-faint">
        {delta}
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
 * Filter sidebar group
 * --------------------------------------------------------- */
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <Tactical className="text-cyan block mb-2">{label}</Tactical>
      <ul className="space-y-1">{children}</ul>
    </div>
  );
}

function FilterItem({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number | string;
}) {
  return (
    <li>
      <Link
        href={href}
        className={`flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.08em] py-1 px-2 transition-colors ${
          active ? "bg-rule-hi text-cyan" : "text-mute hover:text-bone"
        }`}
      >
        <span className="truncate">{label}</span>
        <span className="text-faint shrink-0 tabular-nums ml-2">{count}</span>
      </Link>
    </li>
  );
}

/* -----------------------------------------------------------
 * Activity heatmap — GitHub-style 53×7 grid.
 * Deterministic seed for SSR stability.
 * --------------------------------------------------------- */
function ActivityHeatmap() {
  const weeks = 53;
  const days = 7;
  const cells: { x: number; y: number; level: number }[] = [];
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < days; d++) {
      // Deterministic pseudo-random
      const seed = (w * 31 + d * 7) % 17;
      const denser = w > 8 && w < 48; // inner months busier
      const base = denser ? 1 : 0;
      let level = base;
      if (seed < 4) level = 0;
      else if (seed < 9) level = base + 1;
      else if (seed < 13) level = base + 2;
      else level = Math.min(4, base + 3);
      cells.push({ x: w, y: d, level });
    }
  }
  const colors = ["bg-rule", "bg-cyan/30", "bg-cyan/55", "bg-cyan/80", "bg-cyan"];
  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${weeks}, 12px)`,
          gridTemplateRows: `repeat(${days}, 12px)`,
          gridAutoFlow: "column",
        }}
      >
        {cells.map((c, i) => (
          <span
            key={i}
            className={`${colors[c.level]} block`}
            style={{ width: 12, height: 12 }}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
