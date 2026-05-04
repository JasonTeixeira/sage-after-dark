"use client";

/**
 * Sidenote — Tufte-style margin note.
 *
 * Usage in MDX:
 *   This sentence has a side note.<Sidenote n={1}>The note text.</Sidenote>
 *
 * Behavior:
 *   - At lg+ breakpoints, an asterisk-anchor is inline and the note
 *     floats in the right margin, vertically aligned to its anchor.
 *   - On smaller screens, tapping the asterisk toggles an inline
 *     disclosure with the note text — it always remains readable.
 *   - The number `n` is purely cosmetic; if omitted, an asterisk is used.
 *
 * Design notes:
 *   - Implemented with absolute positioning relative to the prose
 *     column, so it requires the parent column to have `position: relative`
 *     OR the note can absolute-position to nearest positioned ancestor.
 *   - The `essay-prose` column already enables this via the
 *     `.essay-prose` global, but Sidenote also gracefully wraps in a
 *     <span> with an inline-block <aside> so it never breaks paragraphs.
 */

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Sidenote({
  n,
  children,
}: {
  n?: number | string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const label = n != null ? String(n) : "*";

  return (
    <>
      {/* Inline anchor (always visible) */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={`Toggle side note ${label}`}
        className={cn(
          "sidenote-anchor align-super text-[0.72em] font-mono text-cyan",
          "ml-0.5 px-0.5 hover:text-bone transition-colors",
        )}
      >
        [{label}]
      </button>

      {/*
       * Desktop: right-margin float at ≥ lg. We use CSS float + a
       * negative right margin so the note physically sits in the
       * column's right gutter rather than inside the prose. The
       * `shape-outside: none` keeps text from wrapping around it.
       *
       * On mobile (< lg) we hide this float entirely and surface the
       * note inline via the disclosure span below.
       */}
      <aside
        className={cn(
          "sidenote-aside hidden lg:block float-right clear-right",
          "w-[13rem] -mr-[15rem] ml-6 mb-3",
          "font-mono text-[12px] leading-snug text-bone/70",
          "border-l border-cyan/40 pl-3",
        )}
        aria-hidden="true"
      >
        <span className="block text-cyan/70 mb-1">[{label}]</span>
        {children}
      </aside>

      {/* Mobile: inline disclosure (toggled by anchor) */}
      <span
        className={cn(
          "lg:hidden",
          open ? "inline" : "hidden",
        )}
      >
        <span
          className={cn(
            "block my-3 ml-4 pl-3 border-l border-cyan/50",
            "font-mono text-[13px] leading-snug text-bone/75",
          )}
        >
          <span className="text-cyan/70 mr-1">[{label}]</span>
          {children}
        </span>
      </span>
    </>
  );
}
