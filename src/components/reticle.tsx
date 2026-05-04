/**
 * Reticle — the 16px '+' crosshair.
 *
 * Pure XOTC. Used sparingly — top-right of every hero card, occasionally
 * inline. Pulses softly on hover (gated by prefers-reduced-motion).
 */

import { cn } from "@/lib/cn";

export function Reticle({
  size = 16,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const half = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      className={cn("text-cyan transition-opacity", className)}
    >
      {/* outer ticks */}
      <line x1={half} y1="0" x2={half} y2={size * 0.3} stroke="currentColor" strokeWidth="1" />
      <line x1={half} y1={size * 0.7} x2={half} y2={size} stroke="currentColor" strokeWidth="1" />
      <line x1="0" y1={half} x2={size * 0.3} y2={half} stroke="currentColor" strokeWidth="1" />
      <line x1={size * 0.7} y1={half} x2={size} y2={half} stroke="currentColor" strokeWidth="1" />
      {/* center dot */}
      <circle cx={half} cy={half} r={1} fill="currentColor" />
    </svg>
  );
}
