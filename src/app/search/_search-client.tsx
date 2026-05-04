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
  published: string;
  href: string;
};

function score(entry: SearchEntry, q: string): number {
  if (!q) return 1;
  const needle = q.toLowerCase().trim();
  if (!needle) return 1;
  const hay = [
    entry.title,
    entry.dek,
    entry.pillar,
    entry.template,
    ...entry.tags,
  ]
    .join(" ")
    .toLowerCase();
  if (!hay.includes(needle)) {
    // token-level fallback: every token must appear somewhere
    const tokens = needle.split(/\s+/).filter(Boolean);
    if (!tokens.every((t) => hay.includes(t))) return 0;
    return 0.4;
  }
  // boost title hits
  if (entry.title.toLowerCase().includes(needle)) return 2;
  return 1;
}

export function SearchClient({ index }: { index: SearchEntry[] }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const results = useMemo(() => {
    return index
      .map((e) => ({ entry: e, s: score(e, q) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => {
        if (b.s !== a.s) return b.s - a.s;
        return (
          new Date(b.entry.published).getTime() -
          new Date(a.entry.published).getTime()
        );
      })
      .map((r) => r.entry);
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
          {results.map((r) => (
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
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
