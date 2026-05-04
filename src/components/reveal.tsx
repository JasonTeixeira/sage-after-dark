"use client";

/**
 * Reveal — fade + 8px translate-up on first intersect.
 *
 * Wrap any block; when it scrolls into the viewport, it fades in.
 * Respects prefers-reduced-motion: in that mode the content is shown
 * immediately with no transform.
 *
 * Usage:
 *   <Reveal><Section>...</Section></Reveal>
 *   <Reveal as="article" delay={120}>...</Reveal>
 */

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  threshold = 0.12,
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handle = () => setReduced(mq.matches);
    mq.addEventListener("change", handle);
    return () => mq.removeEventListener("change", handle);
  }, []);

  useEffect(() => {
    if (reduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
            break;
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={cn(className)}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(8px)",
        transition: reduced
          ? "none"
          : `opacity 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 600ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: shown ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
