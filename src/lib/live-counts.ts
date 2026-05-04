/**
 * live-counts — single source of truth for every numeric claim on the site.
 *
 * Rule: if a number appears on a page, it MUST come from this module.
 * No literal counts in JSX. No "fake it till you make it" stats.
 *
 * Each value is derived from real artifacts:
 *   - Post counts come from the MDX corpus on disk (via loader)
 *   - Word totals come from real reading-time analysis
 *   - Subscriber count is read from Resend at build time, with a
 *     conservative fallback (founder seed: 1) if the env is unset
 *   - Arc progress is derived from ARCS in site-data
 *
 * Year framing: we are explicitly Year 001. Smallness is the brand.
 */

import { getAllPosts } from "@/content/loader";
import { ARCS, TRAYD_EPISODES } from "@/content/site-data";

// ---- Year framing ------------------------------------------------------

export const ESTABLISHED = "2026" as const;
export const YEAR_LABEL = "Year 001" as const;

// ---- Live: post corpus -------------------------------------------------

export type SiteCounts = {
  /** Real published essay count from MDX corpus. */
  totalPosts: number;
  /** Real total word count across published posts. */
  totalWords: number;
  /** Posts published this calendar month. */
  postsThisMonth: number;
  /** Average post length in words. */
  avgWords: number;
  /** Active arcs (any in_progress). */
  activeArcs: number;
  /** Episodes published across all arcs (currently Trayd). */
  episodesPublished: number;
  /** Real subscriber count (Resend). 0 if unavailable. */
  subscribers: number;
  /** Display-friendly subscriber line: "001" until > 99, then "0,123". */
  subscribersLabel: string;
  /** Display-friendly post count: 3-digit zero-padded. */
  postsLabel: string;
  /** Words display: "12,400" or "12.4k" depending on size. */
  wordsLabel: string;
  /** Year label, e.g. "Year 001". */
  yearLabel: string;
  /** Boolean: are we still in founding window (sub count low)? */
  founding: boolean;
};

let _cached: SiteCounts | null = null;

export async function getSiteCounts(): Promise<SiteCounts> {
  if (_cached) return _cached;

  const posts = await getAllPosts();
  const published = posts.filter((p) => p.frontmatter.status !== "draft");

  const totalPosts = published.length;
  const totalWords = published.reduce((sum, p) => sum + (p.word_count ?? 0), 0);
  const avgWords = totalPosts ? Math.round(totalWords / totalPosts) : 0;

  const now = new Date();
  const thisMonth = now.getUTCMonth();
  const thisYear = now.getUTCFullYear();
  const postsThisMonth = published.filter((p) => {
    const d = new Date(p.frontmatter.published);
    return d.getUTCMonth() === thisMonth && d.getUTCFullYear() === thisYear;
  }).length;

  const activeArcs = ARCS.filter((a) => a.episodes_done < a.episodes_total).length;
  const episodesPublished = TRAYD_EPISODES.filter(
    (e) => "kind" in e && (e.kind === "PUBLISHED" || e.kind === "LIVE NOW"),
  ).length;

  const subscribers = await fetchSubscriberCount();
  const founding = subscribers < 100;

  const counts: SiteCounts = {
    totalPosts,
    totalWords,
    postsThisMonth,
    avgWords,
    activeArcs,
    episodesPublished,
    subscribers,
    subscribersLabel: formatSubscribers(subscribers),
    postsLabel: String(totalPosts).padStart(3, "0"),
    wordsLabel: formatWords(totalWords),
    yearLabel: YEAR_LABEL,
    founding,
  };

  _cached = counts;
  return counts;
}

// ---- Subscribers (Resend) ----------------------------------------------

async function fetchSubscriberCount(): Promise<number> {
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!apiKey || !audienceId) return 0;

  try {
    const res = await fetch(
      `https://api.resend.com/audiences/${audienceId}/contacts`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return 0;
    const json: { data?: unknown[] } = await res.json();
    return Array.isArray(json.data) ? json.data.length : 0;
  } catch {
    return 0;
  }
}

// ---- Formatters --------------------------------------------------------

function formatSubscribers(n: number): string {
  if (n < 1) return "001"; // founder seat — never zero
  if (n < 1000) return String(n).padStart(3, "0");
  return n.toLocaleString("en-US");
}

function formatWords(n: number): string {
  if (n < 1000) return n.toLocaleString("en-US");
  if (n < 10_000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}
