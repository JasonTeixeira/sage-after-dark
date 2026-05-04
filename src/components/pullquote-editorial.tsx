/**
 * PullQuote — full-bleed editorial pull quote, MDX-friendly.
 *
 * Usage in MDX:
 *   <PullQuote attribution="— field note · 2026-04">
 *   The discipline isn't picking the right tool. It's noticing
 *   when a good one has gone bad.
 *   </PullQuote>
 *
 * Visual contract:
 *   - Sets in editorial serif italic at oversized scale
 *   - Cyan vertical rule on the left
 *   - Optional attribution renders below in mono caps
 *   - On lg+ the quote breaks out one column wider than the prose
 *     (negative margin) for a magazine feel — capped so it never
 *     overflows the editorial column container.
 *   - Pure server component, zero JS.
 */

import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PullQuote({
  children,
  attribution,
  align = "left",
}: {
  children: ReactNode;
  attribution?: string;
  align?: "left" | "center";
}) {
  return (
    <figure
      className={cn(
        "my-12 lg:-mx-8",
        align === "center" && "text-center",
      )}
    >
      <blockquote
        className={cn(
          "relative",
          align === "left" && "border-l-2 border-cyan pl-6 lg:pl-10",
          "[font-family:var(--font-editorial)] italic text-bone/95",
          "leading-[1.15] tracking-[-0.01em]",
          // Editorial scale, responsive
          "text-[1.65rem] sm:text-[2rem] lg:text-[2.4rem]",
        )}
      >
        <span className="relative">
          {/* Decorative quote mark for the center variant */}
          {align === "center" && (
            <span
              aria-hidden
              className="block text-cyan/60 [font-family:var(--font-editorial)] text-5xl leading-none mb-1"
            >
              &ldquo;
            </span>
          )}
          {children}
        </span>
      </blockquote>
      {attribution && (
        <figcaption
          className={cn(
            "mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-mute",
            align === "left" && "pl-6 lg:pl-10",
          )}
        >
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
