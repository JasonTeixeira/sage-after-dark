"use client";

/**
 * AnchorCopy — clicking a heading's autolink anchor copies the URL with hash.
 *
 * rehype-autolink-headings wraps each heading's text in:
 *   <h2 id="x"><a class="heading-anchor" href="#x">…</a></h2>
 *
 * On click:
 *   - We don't suppress navigation — the URL hash should still update.
 *   - We additionally copy `${origin}${pathname}#${id}` to clipboard.
 *   - Show a tiny floating toast for ~1.4s confirming the copy.
 *
 * Failure modes:
 *   - clipboard API unavailable → silent (no broken UX).
 *   - selection is currently active → we still copy the URL (selection is
 *     a separate action, owned by HighlightToShare).
 */

import { useEffect, useState } from "react";

export function AnchorCopy({
  rootSelector = "[data-highlightable]",
}: {
  rootSelector?: string;
}) {
  const [toast, setToast] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const root = document.querySelector(rootSelector) as HTMLElement | null;
    if (!root) return;

    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const a = t.closest("a.heading-anchor") as HTMLAnchorElement | null;
      if (!a) return;
      // Find the heading id (rehype-slug puts it on the parent h2/h3/h4)
      const h = a.closest("h1, h2, h3, h4, h5, h6") as HTMLElement | null;
      const id = h?.id ?? "";
      if (!id) return;

      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      try {
        if (navigator.clipboard?.writeText) {
          void navigator.clipboard.writeText(url);
          const r = a.getBoundingClientRect();
          setToast({ x: r.right + 8, y: r.top + r.height / 2 });
          window.setTimeout(() => setToast(null), 1400);
        }
      } catch {
        // silent
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [rootSelector]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: toast.x,
        top: toast.y,
        transform: "translateY(-50%)",
        zIndex: 70,
      }}
      className="pointer-events-none border border-cyan/50 bg-ink-1/95 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-cyan whitespace-nowrap shadow-[0_4px_20px_rgba(0,229,255,0.2)]"
    >
      ✓ link copied
    </div>
  );
}
