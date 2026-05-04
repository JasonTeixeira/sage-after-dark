/**
 * Pillar primitives — topic identity.
 *
 *   <PillarTag pillar="build" />        → //build chip
 *   <PillarBorder pillar="teach">...</> → 1px left border in pillar color
 *
 * Pillar colors appear ONLY as: tag chips, 1px borders, reading-progress bar.
 * Cyan stays the global accent. Identity stays unified.
 */

import { cn } from "@/lib/cn";
import { pillar, type PillarKey } from "@/lib/tokens";
import type { ReactNode } from "react";

const PILLAR_LABEL: Record<PillarKey, string> = {
  build: "//build",
  signal: "//signal",
  mind: "//mind",
  world: "//world",
  taste: "//taste",
  learning: "//learning",
  teach: "//teach",
};

export function PillarTag({
  pillar: key,
  className,
  size = "md",
}: {
  pillar: PillarKey;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono uppercase tracking-[0.08em]",
        "border bg-ink-1/60 backdrop-blur-sm",
        size === "sm" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-1",
        className,
      )}
      style={{
        color: pillar[key],
        borderColor: pillar[key],
      }}
    >
      {PILLAR_LABEL[key]}
    </span>
  );
}

export function PillarBorder({
  pillar: key,
  children,
  className,
  side = "left",
}: {
  pillar: PillarKey;
  children: ReactNode;
  className?: string;
  side?: "left" | "top";
}) {
  return (
    <div
      className={cn(
        side === "left" ? "border-l-2 pl-5" : "border-t-2 pt-5",
        className,
      )}
      style={{
        borderColor: pillar[key],
      }}
    >
      {children}
    </div>
  );
}
