"use client";

/**
 * ReadingProgress — top-of-viewport progress bar.
 *
 * Renders a 2px bar fixed to the top of the viewport. Width tracks how far
 * the user has scrolled through the document. Color = pillar color.
 *
 * Mounted only on post pages. Respects prefers-reduced-motion: the bar still
 * shows position, but transitions are instant.
 */

import { useEffect, useState } from "react";
import { pillar as pillarTokens, type PillarKey } from "@/lib/tokens";

export function ReadingProgress({ pillar }: { pillar: PillarKey }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      raf = 0;
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const color = pillarTokens[pillar];

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className="fixed top-0 left-0 right-0 z-50 h-[2px] pointer-events-none"
    >
      <div
        className="h-full origin-left transition-[width] duration-100 ease-out"
        style={{
          width: `${progress}%`,
          background: color,
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  );
}
