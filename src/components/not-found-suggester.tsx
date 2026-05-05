"use client";

/**
 * NotFoundSuggester — fuzzy "did you mean?" panel for the 404 page.
 *
 * On mount, reads window.location.pathname, extracts candidate slug tokens,
 * fetches /api/search-index, and surfaces the top 3 matches. If nothing
 * matches with reasonable confidence, the panel renders nothing — silence
 * beats noise.
 */

import { useEffect, useState } from "react";
import Link from "next/link";

type Entry = {
  slug: string;
  pillar: string;
  title: string;
  dek: string;
  href: string;
  tags: string[];
  body: string;
};

function tokensFromPath(path: string): string[] {
  // Strip leading slashes, query, hash; split on / - _
  const cleaned = path
    .replace(/^\/+|\/+$/g, "")
    .split(/[?#]/)[0]
    .split(/[\/\-_]+/)
    .map((t) => t.toLowerCase().trim())
    .filter((t) => t.length >= 3 && !/^\d+$/.test(t));
  return Array.from(new Set(cleaned));
}

function score(e: Entry, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  const hay = `${e.title} ${e.dek} ${e.tags.join(" ")} ${e.slug} ${e.body}`.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    if (e.slug.toLowerCase().includes(t)) s += 4;
    else if (e.title.toLowerCase().includes(t)) s += 3;
    else if ((e.dek ?? "").toLowerCase().includes(t)) s += 2;
    else if (hay.includes(t)) s += 1;
  }
  return s;
}

export function NotFoundSuggester() {
  const [path, setPath] = useState<string>("");
  const [matches, setMatches] = useState<Entry[]>([]);

  useEffect(() => {
    setPath(window.location.pathname);
    const tokens = tokensFromPath(window.location.pathname);
    if (tokens.length === 0) return;

    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch("/api/search-index", { cache: "force-cache" });
        if (!r.ok) return;
        const data = (await r.json()) as { entries: Entry[] };
        if (cancelled) return;
        const scored = data.entries
          .map((e) => ({ e, s: score(e, tokens) }))
          .filter((x) => x.s >= 3)
          .sort((a, b) => b.s - a.s)
          .slice(0, 3)
          .map((x) => x.e);
        setMatches(scored);
      } catch {
        // silent
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (matches.length === 0) return null;

  return (
    <section
      aria-label="Suggestions"
      className="mt-12 max-w-3xl border border-cyan/40 bg-ink-1/60 p-5"
    >
      <header className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan mb-3">
        ▸ DID YOU MEAN ·{" "}
        <span className="text-mute">based on </span>
        <span className="text-bone">{path}</span>
      </header>
      <ul className="space-y-3">
        {matches.map((m) => (
          <li key={m.slug} className="border-b border-rule/50 pb-3 last:border-0">
            <Link
              href={m.href}
              className="group block hover:bg-ink-2/40 -mx-2 px-2 py-1 transition-colors"
            >
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
                  /{m.pillar}
                </span>
                <span className="font-sans text-bone group-hover:text-cyan transition-colors">
                  {m.title}
                </span>
              </div>
              {m.dek && (
                <p className="text-mute text-sm leading-relaxed line-clamp-2">
                  {m.dek}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
