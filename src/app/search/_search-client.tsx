"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { PillarTag } from "@/components";
import type { Pillar, Template } from "@/content/schema";

export type SearchEntry = {
  slug: string;
  pillar: Pillar;
  template: Template;
  title: string;
  dek: string;
  tags: string[];
  body: string; // plain-text excerpt of the post body for full-text search
  published: string;
  href: string;
};

function score(entry: SearchEntry, q: string): { s: number; snippet: string } {
  const empty = { s: 0, snippet: "" };
  if (!q) return { s: 1, snippet: "" };
  const needle = q.toLowerCase().trim();
  if (!needle) return { s: 1, snippet: "" };

  const titleLow = entry.title.toLowerCase();
  const dekLow = entry.dek.toLowerCase();
  const metaHay = [
    titleLow,
    dekLow,
    entry.pillar,
    entry.template,
    ...entry.tags,
  ]
    .join(" ");
  const bodyLow = entry.body.toLowerCase();

  const titleHit = titleLow.includes(needle);
  const dekHit = dekLow.includes(needle);
  const metaHit = metaHay.includes(needle);
  const bodyHit = bodyLow.includes(needle);

  if (!titleHit && !metaHit && !bodyHit) {
    // token-level fallback: every token must appear somewhere (meta OR body)
    const tokens = needle.split(/\s+/).filter(Boolean);
    const haystack = `${metaHay} ${bodyLow}`;
    if (!tokens.every((t) => haystack.includes(t))) return empty;
    return { s: 0.3, snippet: "" };
  }

  // Build a snippet around the first body match
  let snippet = "";
  if (bodyHit) {
    const idx = bodyLow.indexOf(needle);
    const start = Math.max(0, idx - 60);
    const end = Math.min(entry.body.length, idx + needle.length + 80);
    const raw = entry.body.slice(start, end).replace(/\s+/g, " ").trim();
    snippet = `${start > 0 ? "…" : ""}${raw}${end < entry.body.length ? "…" : ""}`;
  }

  let s = 0.4;
  if (bodyHit) s = 0.8;
  if (dekHit) s = 1.2;
  if (metaHit && !bodyHit && !dekHit) s = 1;
  if (titleHit) s = 2;
  return { s, snippet };
}

export function SearchClient({ index }: { index: SearchEntry[] }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    return index
      .map((e) => {
        const { s, snippet } = score(e, q);
        return { entry: e, s, snippet };
      })
      .filter((r) => r.s > 0)
      .sort((a, b) => {
        if (b.s !== a.s) return b.s - a.s;
        return (
          new Date(b.entry.published).getTime() -
          new Date(a.entry.published).getTime()
        );
      });
  }, [q, index]);

  return (
    <div className="max-w-4xl">
      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-[12px] text-cyan pointer-events-none">
          {">"}
        </span>
        <input
          ref={inputRef}
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="search field notes, essays, tutorials..."
          aria-label="Search posts"
          className="w-full bg-ink border border-rule rounded px-12 py-4 font-mono text-[14px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-[0.08em] text-mute pointer-events-none">
          {results.length} / {index.length}
        </span>
      </div>

      {results.length === 0 ? (
        <div className="border border-rule rounded p-8 text-center">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-mute">
            // no results
          </p>
          <p className="text-bone/70 mt-2">
            Try a shorter query, or browse the archive.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-rule border-y border-rule">
          {results.map(({ entry: r, snippet }) => (
            <li key={r.slug}>
              <Link
                href={r.href}
                className="group block py-5 hover:bg-bone/[0.02] transition-colors px-2 -mx-2"
              >
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <PillarTag pillar={r.pillar} />
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
                      {r.template.replace("_", " ")}
                    </span>
                  </div>
                  <time className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
                    {format(new Date(r.published), "yyyy-MM-dd")}
                  </time>
                </div>
                <h3 className="font-sans text-bone text-[18px] leading-tight group-hover:text-cyan transition-colors">
                  {r.title}
                </h3>
                {r.dek ? (
                  <p className="text-bone/70 mt-1 text-[14px] leading-snug">
                    {r.dek}
                  </p>
                ) : null}
                {snippet ? (
                  <p className="text-bone/55 mt-2 text-[13px] leading-snug font-mono">
                    {snippet}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
