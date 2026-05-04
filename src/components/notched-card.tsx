/**
 * NotchedCard — one corner clipped at 24px. The notch hosts a tiny mono label.
 *
 * The defining shape of the site. Use for: hero, post cards, archive cells,
 * any container that needs identity.
 *
 * Notch position determines where the label sits.
 */

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import type { PillarKey } from "@/lib/tokens";
import { pillar } from "@/lib/tokens";

type NotchPosition = "tl" | "tr" | "bl" | "br";

export function NotchedCard({
  children,
  label,
  notch = "tl",
  pillarKey,
  className,
  size = 24,
  bg = "ink-1",
  interactive = false,
}: {
  children: ReactNode;
  label?: string;
  notch?: NotchPosition;
  /** Adds a 1px left border in the pillar's color. */
  pillarKey?: PillarKey;
  className?: string;
  size?: number;
  bg?: "ink-0" | "ink-1" | "ink-2";
  interactive?: boolean;
}) {
  // Build the clip-path polygon based on which corner is notched.
  const clipPath = (() => {
    switch (notch) {
      case "tl":
        return `polygon(${size}px 0, 100% 0, 100% 100%, 0 100%, 0 ${size}px)`;
      case "tr":
        return `polygon(0 0, calc(100% - ${size}px) 0, 100% ${size}px, 100% 100%, 0 100%)`;
      case "bl":
        return `polygon(0 0, 100% 0, 100% 100%, ${size}px 100%, 0 calc(100% - ${size}px))`;
      case "br":
      default:
        return `polygon(0 0, 100% 0, 100% calc(100% - ${size}px), calc(100% - ${size}px) 100%, 0 100%)`;
    }
  })();

  // Label is positioned just past the bevel — outside the clipped surface
  // region so it never overlaps the card's padded content.
  const labelStyle = (() => {
    const off = size + 8; // 8px past the bevel terminus
    switch (notch) {
      case "tl":
        return { top: "6px", left: `${off}px` } as const;
      case "tr":
        return { top: "6px", right: `${off}px` } as const;
      case "bl":
        return { bottom: "6px", left: `${off}px` } as const;
      case "br":
      default:
        return { bottom: "6px", right: `${off}px` } as const;
    }
  })();

  const bgClass =
    bg === "ink-0" ? "bg-ink-0" : bg === "ink-2" ? "bg-ink-2" : "bg-ink-1";

  return (
    <div className={cn("relative h-full", className)}>
      {/* Hairline border layer — slightly larger via padding trick.
          Achieved with an outer wrapper using the same clip-path. */}
      <div
        className="absolute inset-0"
        style={{
          clipPath,
          background: pillarKey ? pillar[pillarKey] : "var(--color-rule)",
          opacity: pillarKey ? 0.9 : 1,
        }}
        aria-hidden="true"
      />
      <div
        className={cn(
          bgClass,
          "relative h-full",
          interactive && "transition-colors hover:bg-ink-2",
        )}
        style={{
          clipPath,
          // 1px inset to reveal the border layer
          margin: "1px",
        }}
      >
        {children}
      </div>
      {/*
        Corner label — rendered OUTSIDE the clipped surface, anchored to the
        notch edge so it sits in the bevel zone rather than overlapping the
        card's padded content. Pillar-tinted when pillarKey is set so it reads
        as part of the corner stamp.
      */}
      {label && (
        <div
          className={cn(
            "absolute font-mono uppercase tracking-[0.08em]",
            "text-[10px] leading-none pointer-events-none select-none",
            !pillarKey && "text-cyan/80",
          )}
          style={{
            ...labelStyle,
            color: pillarKey ? pillar[pillarKey] : undefined,
          }}
          aria-hidden="true"
        >
          {label}
        </div>
      )}
    </div>
  );
}
