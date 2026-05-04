"use client";

/**
 * FloatingTOC — sticky table of contents that auto-extracts h2/h3
 * headings from the rendered MDX, highlights the section currently
 * in view, and lets the reader jump to any section.
 *
 * Visual behavior:
 *   - Hidden on small screens (the hamburger TOC button shows instead).
 *   - At ≥ xl breakpoint (1280px) it floats in the right margin.
 *   - Position: fixed to the viewport, vertically centered-ish.
 *   - Active section is marked with a cyan dot and bone-colored text;
 *     other sections are mute and h3 entries are indented.
 *   - A small "▸ TOP" button at the bottom returns to top.
 *
 * Accessibility:
 *   - <nav aria-label="Table of contents">
 *   - Each item is a real anchor with smooth scroll;
 *     respects prefers-reduced-motion (instant jump in that case).
 *   - aria-current="true" on the active section.
 */

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Item = { id: string; text: string; level: 2 | 3 };

export function FloatingTOC({
  /** CSS selector for the prose container the headings live in. */
  rootSelector = ".essay-prose",
}: {
  rootSelector?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 1) Extract headings once after first paint.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const heads = Array.from(root.querySelectorAll("h2[id], h3[id]"));
    const next: Item[] = heads.map((h) => ({
      id: h.id,
      text: (h.textContent || "").trim(),
      level: h.tagName === "H3" ? 3 : 2,
    }));
    setItems(next);
  }, [rootSelector]);

  // 2) Track which section is in view via IntersectionObserver.
  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // Collect intersecting headings; pick the topmost.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).getBoundingClientRect().top -
              (b.target as HTMLElement).getBoundingClientRect().top,
          );
        if (visible[0]) {
          setActive(visible[0].target.id);
        }
      },
      {
        // Fire when the heading crosses the upper third of the viewport.
        rootMargin: "-10% 0% -70% 0%",
        threshold: [0, 1],
      },
    );
    items.forEach((it) => {
      const el = document.getElementById(it.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [items]);

  function jumpTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    setActive(id);
    setMobileOpen(false);
    // Update URL hash without jumping (we already scrolled).
    history.replaceState(null, "", `#${id}`);
  }

  function toTop() {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    setActive(null);
    setMobileOpen(false);
  }

  if (items.length < 2) return null; // Not worth a TOC.

  return (
    <>
      {/* ── Desktop: floating right-margin nav ─────────────── */}
      <nav
        aria-label="Table of contents"
        className={cn(
          "hidden 2xl:block fixed top-1/2 -translate-y-1/2 right-8 z-30",
          "max-w-[14rem] print:hidden",
        )}
      >
        <div className="border-l border-rule pl-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint mb-3">
            // contents
          </p>
          <ul className="space-y-1.5">
            {items.map((it) => {
              const isActive = active === it.id;
              return (
                <li key={it.id}>
                  <button
                    type="button"
                    onClick={() => jumpTo(it.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group flex items-start gap-2 text-left w-full",
                      "font-mono text-[11px] leading-snug transition-colors",
                      it.level === 3 && "pl-3",
                      isActive
                        ? "text-bone"
                        : "text-mute hover:text-bone",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-1 h-1.5 w-1.5 rounded-full shrink-0 transition-colors",
                        isActive
                          ? "bg-cyan shadow-[0_0_6px_var(--color-cyan)]"
                          : "bg-rule-hi group-hover:bg-mute",
                      )}
                    />
                    <span className="line-clamp-2">{it.text}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={toTop}
            className="mt-4 font-mono text-[10px] uppercase tracking-[0.1em] text-faint hover:text-cyan transition-colors"
          >
            ▴ to top
          </button>
        </div>
      </nav>

      {/* ── Mobile/tablet: floating button + sheet ─────────── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open table of contents"
        className={cn(
          "2xl:hidden fixed bottom-20 right-4 z-30",
          "h-11 w-11 rounded-full border border-rule bg-ink-1/95 backdrop-blur-md",
          "flex items-center justify-center text-cyan",
          "shadow-lg hover:bg-ink-2 transition-colors print:hidden",
        )}
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.1em]">
          §
        </span>
      </button>

      {mobileOpen && (
        <div
          className="2xl:hidden fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-end sm:items-center justify-center print:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            role="dialog"
            aria-label="Table of contents"
            className="w-full sm:max-w-md bg-ink-1 border border-rule max-h-[80vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-rule">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan">
                // contents
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close"
                className="text-faint hover:text-bone text-xl leading-none px-2"
              >
                ×
              </button>
            </div>
            <ul className="p-5 space-y-2">
              {items.map((it) => {
                const isActive = active === it.id;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => jumpTo(it.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "w-full text-left font-mono text-[13px] leading-snug py-1",
                        it.level === 3 && "pl-4",
                        isActive ? "text-cyan" : "text-bone/85",
                      )}
                    >
                      {it.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
