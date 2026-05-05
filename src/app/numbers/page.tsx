/**
 * /numbers — public dashboard.
 *
 * The promise: every number on this site is real. This page proves it.
 *
 * Sources:
 *   - Stripe live API → MRR, active subs, new/canceled in last 30d, churn proxy
 *   - Resend live API → subscriber count
 *   - MDX corpus on disk → posts, words, top reads
 *
 * Caching: revalidates hourly. A nightly cron (vercel.json) hits a public
 * refresh endpoint to warm the cache. Numbers are intentionally rounded to
 * remove false precision and protect operational privacy.
 *
 * Design promise: small numbers are the brand. We're Year 001.
 */

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
  Hr,
} from "@/components";
import Link from "next/link";
import { getPublicMetrics, type PublicMetrics } from "@/lib/stripe";
import { getSiteCounts } from "@/lib/live-counts";
import { getAllPosts } from "@/content/loader";
import { getTotalPageviews, getTopPosts } from "@/lib/living";
import { JsonLd, breadcrumbsLd } from "@/components/json-ld";

// Revalidate hourly. Nightly cron will warm the cache.
export const revalidate = 3600;

export const metadata = {
  title: "Numbers — Sage After Dark",
  description:
    "Every number on this site is real. MRR, subscribers, posts, words. Live, rounded, honest.",
  alternates: { canonical: "/numbers" },
};

async function safeMetrics(): Promise<PublicMetrics | null> {
  try {
    return await getPublicMetrics();
  } catch (e) {
    console.warn("[/numbers] stripe metrics failed", e);
    return null;
  }
}

export default async function NumbersPage() {
  const [metrics, counts, posts, traffic, topPosts] = await Promise.all([
    safeMetrics(),
    getSiteCounts(),
    getAllPosts(),
    getTotalPageviews(),
    getTopPosts(5),
  ]);

  const published = posts.filter((p) => p.frontmatter.status !== "draft");
  const topByLength = [...published]
    .sort((a, b) => (b.word_count ?? 0) - (a.word_count ?? 0))
    .slice(0, 5);
  const recent = [...published]
    .sort(
      (a, b) =>
        new Date(b.frontmatter.published).getTime() -
        new Date(a.frontmatter.published).getTime(),
    )
    .slice(0, 5);

  const asOfLabel = metrics
    ? new Date(metrics.asOf).toISOString().slice(0, 16).replace("T", " ") + " UTC"
    : "live · refreshed hourly";

  return (
    <Page>
      <JsonLd
        data={breadcrumbsLd([
          { name: "Sage After Dark", url: "/" },
          { name: "Numbers", url: "/numbers" },
        ])}
      />
      <Container size="default" className="pt-10 pb-24">
        <TacticalStrip variant="live">
          <span className="text-cyan">▸ NUMBERS · LIVE</span>
          <StripSep />
          <span>{counts.yearLabel}</span>
          <StripSep />
          <span>as of {asOfLabel}</span>
        </TacticalStrip>

        <header className="mt-8 mb-10">
          <Display>The numbers, real.</Display>
          <Lead className="mt-4 max-w-2xl">
            Every figure on this page comes from a live API or the actual
            corpus on disk. Rounded to remove false precision. Updated every
            hour. If a number embarrasses me, I leave it.
          </Lead>
        </header>

        <Hr />

        {/* Money */}
        <Section>
          <Tactical className="text-cyan mb-4">▸ MONEY · STRIPE LIVE</Tactical>
          {metrics ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule">
              <Stat
                label="MRR"
                value={`$${metrics.mrrUsd.toLocaleString("en-US")}`}
                suffix="/ mo"
                hint="rounded to nearest $5"
              />
              <Stat
                label="Active subscribers"
                value={String(metrics.activeSubs).padStart(3, "0")}
                hint="paying members today"
              />
              <Stat
                label="New · 30d"
                value={`+${metrics.newSubs30d}`}
                hint="started in last 30 days"
              />
              <Stat
                label="Churn · 30d"
                value={
                  metrics.churn30d === null
                    ? "—"
                    : `${(metrics.churn30d * 100).toFixed(1)}%`
                }
                hint={
                  metrics.churn30d === null
                    ? "denominator too small to be meaningful"
                    : `${metrics.canceledSubs30d} canceled / period start`
                }
              />
            </div>
          ) : (
            <TerminalPrompt path="stripe.metrics.unavailable" mode="breadcrumb" />
          )}

          {metrics && (
            <div className="mt-4">
              <Stat
                label="Lifetime revenue"
                value={`$${metrics.lifetimeUsd.toLocaleString("en-US")}`}
                hint="all paid invoices · rounded to nearest $10"
                wide
              />
            </div>
          )}
        </Section>

        <Hr />

        {/* Audience */}
        <Section>
          <Tactical className="text-cyan mb-4">▸ AUDIENCE · RESEND LIVE</Tactical>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-rule">
            <Stat
              label="Newsletter subscribers"
              value={counts.subscribersLabel}
              hint={counts.founding ? "founding window · under 100" : "thanks"}
            />
            <Stat
              label="Active arcs"
              value={String(counts.activeArcs)}
              hint="multi-episode threads in progress"
            />
            <Stat
              label="Episodes published"
              value={String(counts.episodesPublished)}
              hint="across all arcs"
            />
          </div>
        </Section>

        <Hr />

        {/* Corpus */}
        <Section>
          <Tactical className="text-cyan mb-4">▸ CORPUS · ON DISK</Tactical>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule">
            <Stat label="Total essays" value={counts.postsLabel} />
            <Stat label="Total words" value={counts.wordsLabel} />
            <Stat
              label="Posts this month"
              value={String(counts.postsThisMonth).padStart(2, "0")}
            />
            <Stat
              label="Avg essay length"
              value={`${counts.avgWords.toLocaleString("en-US")}w`}
            />
          </div>
        </Section>

        <Hr />

        {/* Traffic */}
        <Section>
          <Tactical className="text-cyan mb-4">▸ TRAFFIC · LIVE</Tactical>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-rule">
            <Stat
              label="Total pageviews"
              value={traffic.views.toLocaleString("en-US")}
              hint="all-time, bots excluded"
            />
            <Stat
              label="Unique visitors"
              value={traffic.unique_visitors.toLocaleString("en-US")}
              hint="hashed, no PII"
            />
            <Stat
              label="Pages tracked"
              value={String(topPosts.length).padStart(2, "0")}
              hint="posts with at least one read"
            />
          </div>
        </Section>

        <Hr />

        {/* Top reads — by real views if any, otherwise by length */}
        <Section>
          <Tactical className="text-cyan mb-4">
            ▸ {topPosts.length > 0 ? "TOP READS · BY VIEWS" : "LONGEST · BY WORD COUNT"}
          </Tactical>
          <ol className="font-mono text-sm space-y-2">
            {topPosts.length > 0
              ? topPosts.map((p, i) => {
                  const post = published.find((x) => x.frontmatter.slug === p.slug);
                  const title = post?.frontmatter.title ?? p.slug;
                  const href = post
                    ? `/${post.frontmatter.pillar}/${post.frontmatter.slug}`
                    : p.path;
                  return (
                    <li
                      key={p.slug}
                      className="flex items-baseline gap-3 border-b border-rule/50 pb-2"
                    >
                      <span className="text-mute text-xs tabular-nums w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <Link href={href} className="text-bone hover:text-cyan flex-1">
                        {title}
                      </Link>
                      <span className="text-mute text-xs tabular-nums">
                        {p.views.toLocaleString("en-US")} views
                      </span>
                    </li>
                  );
                })
              : topByLength.map((p, i) => (
                  <li
                    key={p.frontmatter.slug}
                    className="flex items-baseline gap-3 border-b border-rule/50 pb-2"
                  >
                    <span className="text-mute text-xs tabular-nums w-6">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Link
                      href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                      className="text-bone hover:text-cyan flex-1"
                    >
                      {p.frontmatter.title}
                    </Link>
                    <span className="text-mute text-xs tabular-nums">
                      {(p.word_count ?? 0).toLocaleString("en-US")}w
                    </span>
                  </li>
                ))}
          </ol>
        </Section>

        <Hr />

        {/* Recent */}
        <Section>
          <Tactical className="text-cyan mb-4">▸ RECENT · LAST 5</Tactical>
          <ol className="font-mono text-sm space-y-2">
            {recent.map((p) => (
              <li
                key={p.frontmatter.slug}
                className="flex items-baseline gap-3 border-b border-rule/50 pb-2"
              >
                <span className="text-mute text-xs tabular-nums w-24">
                  {p.frontmatter.published.slice(0, 10)}
                </span>
                <Link
                  href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                  className="text-bone hover:text-cyan flex-1"
                >
                  {p.frontmatter.title}
                </Link>
                <span className="text-mute text-[10px] uppercase tracking-[0.1em]">
                  {p.frontmatter.pillar}
                </span>
              </li>
            ))}
          </ol>
        </Section>

        <Hr />

        <footer className="mt-10 pt-6 border-t border-rule font-mono text-xs text-mute leading-relaxed space-y-2">
          <p>
            ▸ <span className="text-cyan">methodology</span> — Money figures come
            from the Stripe live API in this server. Subscribers come from the
            Resend audience for this domain. Corpus stats are derived from the
            actual MDX files on disk at build time. Numbers refresh hourly; a
            nightly cron warms the cache.
          </p>
          <p>
            ▸ <span className="text-cyan">privacy</span> — Money is rounded to
            the nearest $5 (MRR) or $10 (lifetime). Churn is suppressed when the
            denominator is below 5, because small numbers create misleading
            percentages.
          </p>
          <p>
            ▸ <span className="text-cyan">why</span> — Most operators hide their
            numbers. I'd rather show small honest numbers than hide them and
            pretend.
          </p>
        </footer>
      </Container>
    </Page>
  );
}

function Stat({
  label,
  value,
  suffix,
  hint,
  wide,
}: {
  label: string;
  value: string;
  suffix?: string;
  hint?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`bg-ink-1 p-4 ${wide ? "md:col-span-4" : ""}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute mb-2">
        {label}
      </div>
      <div className="font-mono text-3xl text-bone tabular-nums">
        {value}
        {suffix && (
          <span className="text-mute text-base ml-1">{suffix}</span>
        )}
      </div>
      {hint && (
        <div className="font-mono text-[10px] text-mute/80 mt-2">{hint}</div>
      )}
    </div>
  );
}
