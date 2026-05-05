"use client";

/**
 * TocScrubber — left-edge vertical reading-position rail.
 *
 * Behavior:
 *   - Hidden on small screens (< xl).
 *   - Visualizes the essay as a vertical track. Each h2 is a major tick,
 *     each h3 a minor tick. The scrubber thumb tracks scroll position.
 *   - Hover/focus a tick to preview the section title.
 *   - Click a tick to scroll to that heading.
 *   - Updates ARIA label so the rail is screen-reader announceable.
 *
 * Sits alongside FloatingTOC: the scrubber is for at-a-glance position,
 * the TOC is for navigation. They complement each other.
 */

import { useEffect, useRef, useState } from "react";

type Tick = { id: string; text: string; level: 2 | 3; pct: number };

export function TocScrubber({
  rootSelector = ".essay-prose",
}: {
  rootSelector?: string;
}) {
  const [ticks, setTicks] = useState<Tick[]>([]);
  const [progress, setProgress] = useState(0);
  const [hover, setHover] = useState<Tick | null>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // Build ticks from headings — pct is relative to article scroll length
  useEffect(() => {
    const root = document.querySelector(rootSelector) as HTMLElement | null;
    if (!root) return;

    const compute = () => {
      const headings = Array.from(
        root.querySelectorAll("h2[id], h3[id]"),
      ) as HTMLElement[];
      const articleTop = root.getBoundingClientRect().top + window.scrollY;
      const articleHeight = root.scrollHeight;
      if (articleHeight <= 0) return;

      const next: Tick[] = headings.map((h) => {
        const top = h.getBoundingClientRect().top + window.scrollY;
        const rel = (top - articleTop) / articleHeight;
        return {
          id: h.id,
          text: (h.textContent ?? "").trim().replace(/\s+/g, " "),
          level: h.tagName === "H2" ? 2 : 3,
          pct: Math.max(0, Math.min(1, rel)) * 100,
        };
      });
      setTicks(next);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(root);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [rootSelector]);

  // Track scroll progress relative to the article
  useEffect(() => {
    const root = document.querySelector(rootSelector) as HTMLElement | null;
    if (!root) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = root.getBoundingClientRect();
        const articleTop = r.top + window.scrollY;
        const articleHeight = root.scrollHeight;
        const viewport = window.innerHeight;
        const scrolled = window.scrollY + viewport / 3 - articleTop;
        const pct = Math.max(0, Math.min(1, scrolled / articleHeight));
        setProgress(pct * 100);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [rootSelector]);

  if (ticks.length < 2) return null;

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  return (
    <div
      ref={railRef}
      aria-label="Reading position rail"
      role="navigation"
      className="hidden xl:block fixed left-6 top-1/2 -translate-y-1/2 z-30 pointer-events-none"
      style={{ height: "60vh" }}
    >
      {/* The rail */}
      <div className="relative w-px h-full bg-rule/60 pointer-events-auto">
        {/* Filled progress */}
        <div
          className="absolute left-0 top-0 w-px bg-cyan/70 transition-[height] duration-100"
          style={{ height: `${progress}%` }}
        />
        {/* Thumb */}
        <div
          aria-hidden
          className="absolute -left-1 w-[9px] h-[9px] border border-cyan bg-ink-0 rotate-45 transition-[top] duration-100"
          style={{ top: `calc(${progress}% - 4px)` }}
        />
        {/* Ticks */}
        {ticks.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => jump(t.id)}
            onMouseEnter={() => setHover(t)}
            onMouseLeave={() => setHover((h) => (h?.id === t.id ? null : h))}
            onFocus={() => setHover(t)}
            onBlur={() => setHover((h) => (h?.id === t.id ? null : h))}
            aria-label={`Jump to ${t.text}`}
            className={`absolute -left-[3px] block ${
              t.level === 2 ? "w-[7px] h-px bg-mute" : "w-[4px] h-px bg-mute/60"
            } hover:bg-cyan focus:outline-none focus:bg-cyan`}
            style={{ top: `${t.pct}%` }}
          />
        ))}
        {/* Hover tooltip */}
        {hover && (
          <div
            className="absolute left-4 px-2 py-1 border border-rule bg-ink-1 font-mono text-[10px] uppercase tracking-[0.1em] text-bone whitespace-nowrap pointer-events-none"
            style={{ top: `calc(${hover.pct}% - 9px)` }}
          >
            <span className="text-mute mr-2">
              {String(Math.round(hover.pct)).padStart(2, "0")}%
            </span>
            {hover.text.length > 38 ? `${hover.text.slice(0, 36)}…` : hover.text}
          </div>
        )}
      </div>

      {/* Top/bottom labels */}
      <div className="absolute -left-1 -top-5 font-mono text-[9px] uppercase tracking-[0.14em] text-mute/70">
        TOP
      </div>
      <div className="absolute -left-1 -bottom-5 font-mono text-[9px] uppercase tracking-[0.14em] text-mute/70">
        END
      </div>
    </div>
  );
}
