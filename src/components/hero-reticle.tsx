"use client";

/**
 * HeroReticle — cursor-following crosshair.
 *
 * Tracks pointer movement inside any element marked `data-reticle-zone`.
 * Lerps a 24px crosshair towards the cursor position, fades in only when
 * the pointer is inside a zone. Mounts globally; cheap when no zones exist.
 *
 * Hidden when:
 *   - prefers-reduced-motion is set
 *   - touch / coarse pointer
 *   - cursor leaves all zones
 */

import { useEffect, useRef, useState } from "react";

export function HeroReticle() {
  const ref = useRef<HTMLDivElement | null>(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(pointer: fine)");
    const compute = () => setEnabled(!mq.matches && fine.matches);
    compute();
    mq.addEventListener("change", compute);
    fine.addEventListener("change", compute);
    return () => {
      mq.removeEventListener("change", compute);
      fine.removeEventListener("change", compute);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const zone = t?.closest<HTMLElement>("[data-reticle-zone]");
      if (!zone) {
        setVisible(false);
        return;
      }
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visible) {
        // first paint at exact cursor — no lerp tail from offscreen
        current.current.x = e.clientX;
        current.current.y = e.clientY;
        setVisible(true);
      }
    };

    const onLeave = () => setVisible(false);

    const tick = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      current.current.x += dx * 0.18;
      current.current.y += dy * 0.18;
      const el = ref.current;
      if (el) {
        el.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);
    raf.current = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      if (raf.current) window.cancelAnimationFrame(raf.current);
    };
  }, [enabled, visible]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-40 transition-opacity duration-300 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        willChange: "transform, opacity",
        mixBlendMode: "screen",
      }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        {/* outer ring */}
        <circle
          cx="16"
          cy="16"
          r="11"
          stroke="var(--color-cyan)"
          strokeOpacity="0.45"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* inner ticks */}
        <line x1="16" y1="2" x2="16" y2="9" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="16" y1="23" x2="16" y2="30" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="2" y1="16" x2="9" y2="16" stroke="var(--color-cyan)" strokeWidth="1" />
        <line x1="23" y1="16" x2="30" y2="16" stroke="var(--color-cyan)" strokeWidth="1" />
        {/* center dot */}
        <circle cx="16" cy="16" r="1.5" fill="var(--color-cyan)" />
      </svg>
    </div>
  );
}
