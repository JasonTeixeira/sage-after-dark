/**
 * /admin (overview) — daily cockpit.
 */

import Link from "next/link";
import {
  Display,
  Lead,
  Tactical,
  NotchedCard,
  Hr,
  Section,
} from "@/components";
import {
  adminListMembers,
  adminListMagicLinks,
  getTotalPageviews,
  getTopPosts,
  getNowStatus,
} from "@/lib/living";
import { getSiteCounts } from "@/lib/live-counts";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try { return await fn(); } catch { return fallback; }
}

export default async function AdminOverview() {
  const [members, magicLinks, traffic, topPosts, counts, now] = await Promise.all([
    safe(adminListMembers, []),
    safe(() => adminListMagicLinks(8), []),
    safe(getTotalPageviews, { views: 0, unique_visitors: 0 }),
    safe(() => getTopPosts(5), []),
    getSiteCounts(),
    safe(getNowStatus, null),
  ]);

  const recentMagicLinks = magicLinks.slice(0, 5);
  const updatedDays = now?.updated_at
    ? Math.floor((Date.now() - new Date(now.updated_at).getTime()) / 86_400_000)
    : null;

  return (
    <div>
      <header className="mb-10">
        <Tactical className="text-cyan mb-3 block">// cockpit</Tactical>
        <Display className="mb-3">Overview</Display>
        <Lead>The numbers I check first thing every morning. Everything live.</Lead>
      </header>

      {/* Top metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule mb-8">
        <Stat label="Registered accounts" value={String(members.length).padStart(3, "0")} hint="all time" />
        <Stat label="Subscribers" value={counts.subscribersLabel} hint="Resend audience" />
        <Stat label="Pageviews" value={traffic.views.toLocaleString("en-US")} hint="all-time, no bots" />
        <Stat label="Unique visitors" value={traffic.unique_visitors.toLocaleString("en-US")} hint="hashed, no PII" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule mb-12">
        <Stat label="Posts" value={counts.postsLabel} hint="published" />
        <Stat label="Words" value={counts.wordsLabel} hint="across corpus" />
        <Stat label="Posts this month" value={String(counts.postsThisMonth).padStart(2, "0")} />
        <Stat
          label="/now last updated"
          value={updatedDays === null ? "—" : `${updatedDays}d ago`}
          hint={updatedDays !== null && updatedDays > 14 ? "STALE" : "fresh"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="// recent sign-ins">
          {recentMagicLinks.length === 0 ? (
            <p className="text-mute text-sm">No magic links recently.</p>
          ) : (
            <ul className="text-sm font-mono space-y-2">
              {recentMagicLinks.map((m, i) => (
                <li key={`${m.email}-${i}`} className="flex items-baseline gap-3 border-b border-rule/50 pb-2">
                  <span className="text-cyan text-[11px]">
                    {m.consumed_at ? "▸ used" : "○ pending"}
                  </span>
                  <span className="text-bone flex-1 truncate">{m.email}</span>
                  <span className="text-mute text-[11px]">
                    {new Date(m.created_at).toISOString().slice(0, 16).replace("T", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <Link href="/admin/auth-log" className="font-mono text-[11px] text-cyan hover:underline">
              full auth log →
            </Link>
          </div>
        </Card>

        <Card title="// top reads (live views)">
          {topPosts.length === 0 ? (
            <p className="text-mute text-sm">No tracked views yet. Pageview tracking is live; data accrues per visit.</p>
          ) : (
            <ul className="text-sm font-mono space-y-2">
              {topPosts.map((p, i) => (
                <li key={p.slug} className="flex items-baseline gap-3 border-b border-rule/50 pb-2">
                  <span className="text-mute text-[11px] w-6 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link href={p.path} className="text-bone hover:text-cyan flex-1 truncate">
                    {p.slug}
                  </Link>
                  <span className="text-mute text-[11px] tabular-nums">
                    {p.views.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Hr className="my-12" />

      <Section>
        <Tactical className="text-cyan mb-3">// quick actions</Tactical>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickLink href="/admin/now" title="Edit /now" desc="Status, this-week, not-doing." />
          <QuickLink href="/admin/rotation" title="Rotation items" desc="Books, music, listening, watching, reading shelves." />
          <QuickLink href="/admin/featured" title="Featured posts" desc="Pin posts to home_hero, editor_pick, popular_read." />
          <QuickLink href="/admin/posts" title="Post stats" desc="View counts per post." />
          <QuickLink href="/admin/members" title="Member list" desc="Status, plan, period end." />
          <QuickLink href="/numbers" title="Public /numbers" desc="What everyone else sees." />
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-ink-1 p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute mb-2">{label}</div>
      <div className="font-mono text-3xl text-bone tabular-nums">{value}</div>
      {hint && <div className="font-mono text-[10px] text-mute/80 mt-2">{hint}</div>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <NotchedCard notch="tl" pillarKey="signal" label={title.replace(/^\/\/\s*/, "")}>
      <div className="p-5">
        <Tactical className="block mb-3 text-cyan">{title}</Tactical>
        {children}
      </div>
    </NotchedCard>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block border border-rule p-4 hover:border-cyan/40 transition-colors">
      <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-1">{title}</div>
      <div className="text-bone/70 text-sm">{desc}</div>
    </Link>
  );
}
