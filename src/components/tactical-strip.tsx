/**
 * TacticalStrip — 24px-tall horizontal status bar.
 *
 * Variants:
 *   - "header": top of every page (terminal prompt + nav + cmd-k)
 *   - "post":   above hero of essays (status · LIVE, time, word count)
 *   - "footer": colophon strip
 *
 * Always mono. Always uppercase. Always tabular numerals.
 */

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function TacticalStrip({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "live" | "muted";
}) {
  const dotColor =
    variant === "live"
      ? "bg-ember animate-pulse"
      : variant === "muted"
        ? "bg-mute"
        : "bg-cyan";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2 min-w-0 overflow-x-auto whitespace-nowrap scrollbar-none",
        "bg-ink-1 border border-rule",
        "font-mono text-[10px] uppercase tracking-[0.08em] tabular-nums",
        "text-mute",
        className,
      )}
    >
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0", dotColor)} />
      {children}
    </div>
  );
}

/** Convenience: a separator dot used inside strips. */
export function StripSep() {
  return <span className="text-rule-hi">·</span>;
}
