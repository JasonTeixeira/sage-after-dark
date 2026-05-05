"use client";

/**
 * AnimatedDiagram — wraps an SVG diagram and animates its strokes/paths
 * on viewport intersect using `stroke-dasharray` / `stroke-dashoffset`.
 *
 * Pass any SVG with strokes; this finds every <path>, <line>, <polygon>,
 * <circle>, and <rect> with a stroke attribute, measures total length,
 * and tweens dashoffset → 0 over `duration`. Respects reduced motion.
 *
 * Usage:
 *   <AnimatedDiagram>
 *     <YourDiagramComponent />
 *   </AnimatedDiagram>
 */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  duration?: number; // ms
  className?: string;
  threshold?: number;
};

export function AnimatedDiagram({
  children,
  duration = 1400,
  className,
  threshold = 0.18,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [played, setPlayed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPlayed(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !played) {
            runAnimation(el, duration);
            setPlayed(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [duration, played, threshold]);

  return (
    <div ref={ref} className={cn("animated-diagram", className)}>
      {children}
    </div>
  );
}

function runAnimation(root: HTMLElement, duration: number) {
  const svgs = root.querySelectorAll("svg");
  svgs.forEach((svg) => {
    const drawables = svg.querySelectorAll<SVGGeometryElement>(
      "path, line, polygon, polyline, circle, rect",
    );
    drawables.forEach((el, i) => {
      // Skip if no visible stroke
      const stroke = el.getAttribute("stroke");
      if (!stroke || stroke === "none") return;
      let length = 0;
      try {
        length = el.getTotalLength();
      } catch {
        return;
      }
      if (!length || !isFinite(length)) return;
      el.style.strokeDasharray = String(length);
      el.style.strokeDashoffset = String(length);
      el.getBoundingClientRect(); // force layout
      el.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${i * 35}ms, opacity 200ms ease-out`;
      requestAnimationFrame(() => {
        el.style.strokeDashoffset = "0";
      });
    });

    // Fade in text after lines
    const texts = svg.querySelectorAll<SVGTextElement>("text");
    texts.forEach((t, i) => {
      t.style.opacity = "0";
      t.style.transition = `opacity 400ms ease-out ${duration * 0.5 + i * 25}ms`;
      requestAnimationFrame(() => {
        t.style.opacity = "1";
      });
    });
  });
}
