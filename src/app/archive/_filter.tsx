/**
 * ArchiveFilter — pillar filter pills.
 *
 * Server component (a tag with href) — no client JS needed since
 * we toggle via URL search param. Keeps the page fully static.
 */

import Link from "next/link";
import { cn } from "@/lib/cn";
import { pillar as pillarTokens, type PillarKey } from "@/lib/tokens";

export function ArchiveFilter({
  active,
  pillarLabels,
}: {
  active: PillarKey | null;
  pillarLabels: Record<PillarKey, string>;
}) {
  const keys = Object.keys(pillarLabels) as PillarKey[];
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint mr-2">
        // filter
      </span>
      <Link
        href="/archive"
        className={cn(
          "font-mono text-[11px] uppercase tracking-[0.08em] px-2 py-1 border transition-colors",
          active === null
            ? "border-cyan text-cyan"
            : "border-rule text-mute hover:border-rule-hi hover:text-bone",
        )}
      >
        all
      </Link>
      {keys.map((k) => {
        const isActive = active === k;
        return (
          <Link
            key={k}
            href={`/archive?pillar=${k}`}
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.08em] px-2 py-1 border transition-colors",
              isActive ? "" : "hover:opacity-80",
            )}
            style={{
              color: isActive ? pillarTokens[k] : "var(--color-mute)",
              borderColor: isActive ? pillarTokens[k] : "var(--color-rule)",
            }}
          >
            {pillarLabels[k]}
          </Link>
        );
      })}
    </div>
  );
}
