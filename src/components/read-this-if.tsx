"use client";

/**
 * <ReadThisIf> — three-button "this site sees me" recommender.
 *
 * The reader picks an audience tag (builder / operator / curious) and
 * we reveal three curated essays for that audience. Pure client; the
 * essay list is passed in as a prop so this stays a static dataset.
 */

import Link from "next/link";
import { useState } from "react";

type Item = {
  pillar: string;
  slug: string;
  title: string;
  dek: string;
  reading: number;
};

type Bucket = "builder" | "operator" | "curious";

const LABELS: Record<Bucket, string> = {
  builder: "I'm a builder",
  operator: "I'm an operator",
  curious: "I'm just curious",
};

const SUBLABELS: Record<Bucket, string> = {
  builder: "code, ship, debug",
  operator: "make a studio run",
  curious: "show me your taste",
};

export function ReadThisIf({
  recommendations,
}: {
  recommendations: Record<Bucket, Item[]>;
}) {
  const [active, setActive] = useState<Bucket | null>(null);
  const list = active ? recommendations[active] : [];

  return (
    <div className="border border-rule bg-ink-1/40 p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
        <h3
          className="text-bone leading-tight [font-family:var(--font-editorial)]"
          style={{ fontSize: "clamp(1.4rem,2.2vw,1.85rem)" }}
        >
          Read this <em>if…</em>
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">
          PICK ONE · I PICK THREE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(LABELS) as Bucket[]).map((b) => {
          const isActive = active === b;
          return (
            <button
              key={b}
              type="button"
              onClick={() => setActive(b)}
              aria-pressed={isActive}
              className={`group text-left border p-4 transition-colors ${
                isActive
                  ? "border-cyan bg-cyan/5 text-cyan"
                  : "border-rule text-bone hover:border-cyan hover:text-cyan"
              }`}
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint group-hover:text-cyan mb-1">
                ▸ AUDIENCE / {b.toUpperCase()}
              </div>
              <div className="font-sans text-[16px] mb-1">{LABELS[b]}</div>
              <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
                {SUBLABELS[b]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Reveal */}
      <div
        className="mt-6 grid gap-2 transition-all"
        style={{
          opacity: active ? 1 : 0,
          maxHeight: active ? "1200px" : "0px",
          overflow: "hidden",
        }}
        aria-live="polite"
      >
        {list.map((item, i) => (
          <Link
            key={item.slug}
            href={`/${item.pillar}/${item.slug}`}
            className="group flex items-baseline gap-3 border-b border-rule py-3 hover:border-cyan transition-colors"
          >
            <span className="font-mono text-cyan text-[11px] tabular-nums w-8 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint w-24 shrink-0">
              {item.pillar}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-bone group-hover:text-cyan transition-colors">
                {item.title}
              </span>
              <span className="block text-faint text-[13px] truncate">{item.dek}</span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint shrink-0">
              {item.reading} MIN →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
