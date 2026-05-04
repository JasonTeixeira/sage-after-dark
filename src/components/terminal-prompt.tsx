/**
 * TerminalPrompt — the breadcrumb is the prompt.
 *
 *   sage@afterdark  ~  /signal
 *
 * Modes:
 *   - "breadcrumb" (default): no cursor, just the path
 *   - "live":                 blinking cursor at end
 *   - "typing":               static (typing animation hooked in Phase 5)
 */

import { cn } from "@/lib/cn";

export function TerminalPrompt({
  path = "/",
  user = "sage",
  host = "afterdark",
  mode = "breadcrumb",
  className,
}: {
  path?: string;
  user?: string;
  host?: string;
  mode?: "breadcrumb" | "live" | "typing";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[13px] tabular-nums shrink-0",
        "text-mute",
        className,
      )}
    >
      <span className="text-cyan shrink-0">
        {user}@{host}
      </span>
      <span className="text-rule-hi shrink-0" aria-hidden="true">~</span>
      <span className="text-bone shrink-0">{path}</span>
      {mode === "live" && (
        <span className="cursor-blink ml-0.5 inline-block h-3 w-1.5 bg-cyan align-middle shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}
