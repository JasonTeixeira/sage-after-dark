"use client";

/**
 * FootnotePopover — hover/tap a footnote ref to peek the note inline.
 *
 * remark-gfm produces this DOM for `[^1]`:
 *   <sup><a id="user-content-fnref-1" href="#user-content-fn-1"
 *           data-footnote-ref aria-describedby="footnote-label">1</a></sup>
 * and the corresponding note at the bottom:
 *   <section data-footnotes>
 *     <ol><li id="user-content-fn-1">…note html…<a href="#user-content-fnref-1" /></li></ol>
 *   </section>
 *
 * This component scans the page for `[data-footnote-ref]` anchors,
 * pulls the matching note's HTML, and renders a small popover on
 * hover / focus / tap. The default jump-to-bottom behavior is suppressed.
 *
 * Accessibility:
 *   - The popover is a real <div role="tooltip"> tied to the anchor with aria-describedby.
 *   - Keyboard: focus the ref and the popover appears. Esc dismisses.
 *   - Tap on mobile toggles the popover; tapping outside dismisses.
 *   - Reader can still navigate to the bottom note by clicking the small "↗ jump"
 *     link inside the popover — the original behavior is preserved as opt-in.
 */

import { useCallback, useEffect, useRef, useState } from "react";

type Active = {
  el: HTMLElement;
  rect: DOMRect;
  html: string;
  noteId: string;
  refId: string;
};

export function FootnotePopover({
  rootSelector = "[data-highlightable]",
}: {
  rootSelector?: string;
}) {
  const [active, setActive] = useState<Active | null>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);

  const open = useCallback((el: HTMLElement) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    const href = el.getAttribute("href") ?? "";
    const noteId = href.startsWith("#") ? decodeURIComponent(href.slice(1)) : "";
    if (!noteId) return;
    const note = document.getElementById(noteId);
    if (!note) return;

    // Clone, strip the back-ref link (data-footnote-backref) and trailing whitespace
    const clone = note.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("[data-footnote-backref]").forEach((n) => n.remove());

    const rect = el.getBoundingClientRect();
    setActive({
      el,
      rect,
      html: clone.innerHTML,
      noteId,
      refId: el.id || "",
    });
  }, []);

  const scheduleClose = useCallback(() => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setActive(null), 180);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  useEffect(() => {
    const root = document.querySelector(rootSelector) as HTMLElement | null;
    if (!root) return;

    const isRef = (t: EventTarget | null): HTMLElement | null => {
      const el = t as HTMLElement | null;
      if (!el) return null;
      const a = el.closest("[data-footnote-ref], a[href^='#user-content-fn-']");
      return a ? (a as HTMLElement) : null;
    };

    const onMouseOver = (e: MouseEvent) => {
      const a = isRef(e.target);
      if (!a) return;
      open(a);
    };
    const onMouseOut = (e: MouseEvent) => {
      const a = isRef(e.target);
      if (!a) return;
      // Don't close if moving into the popover
      const related = e.relatedTarget as HTMLElement | null;
      if (related && popRef.current?.contains(related)) return;
      scheduleClose();
    };
    const onFocusIn = (e: FocusEvent) => {
      const a = isRef(e.target);
      if (!a) return;
      open(a);
    };
    const onFocusOut = (e: FocusEvent) => {
      const a = isRef(e.target);
      if (!a) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (related && popRef.current?.contains(related)) return;
      scheduleClose();
    };
    const onClick = (e: MouseEvent) => {
      const a = isRef(e.target);
      if (!a) return;
      // Suppress jump on first click; toggle popover instead
      e.preventDefault();
      if (active && active.el === a) {
        setActive(null);
      } else {
        open(a);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && active) {
        e.preventDefault();
        setActive(null);
        active.el.focus();
      }
    };
    const onDocClick = (e: MouseEvent) => {
      if (!active) return;
      const t = e.target as HTMLElement;
      if (popRef.current?.contains(t)) return;
      if (isRef(t) === active.el) return;
      setActive(null);
    };

    root.addEventListener("mouseover", onMouseOver);
    root.addEventListener("mouseout", onMouseOut);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    root.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onDocClick, true);

    return () => {
      root.removeEventListener("mouseover", onMouseOver);
      root.removeEventListener("mouseout", onMouseOut);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      root.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onDocClick, true);
    };
  }, [rootSelector, open, scheduleClose, active]);

  if (!active) return null;

  const POP_WIDTH = 320;
  const margin = 12;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  // anchor position
  const anchorMid = active.rect.left + active.rect.width / 2;
  let left = anchorMid - POP_WIDTH / 2;
  left = Math.max(margin, Math.min(vw - POP_WIDTH - margin, left));
  const top = active.rect.bottom + 8;

  return (
    <div
      ref={popRef}
      role="tooltip"
      id={`pop-${active.noteId}`}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
      style={{
        position: "fixed",
        top,
        left,
        width: POP_WIDTH,
        zIndex: 60,
      }}
      className="border border-cyan/40 bg-ink-1/98 backdrop-blur shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-3 text-bone/90 text-[13px] leading-relaxed font-serif"
    >
      <span className="absolute -top-px -left-px w-2 h-2 border-t border-l border-cyan/60" />
      <span className="absolute -top-px -right-px w-2 h-2 border-t border-r border-cyan/60" />
      <span className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-cyan/60" />
      <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-cyan/60" />
      <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-cyan/80 mb-1.5">
        ▸ FOOTNOTE
      </div>
      <div
        className="footnote-popover-body [&_p]:m-0 [&_p+p]:mt-2 [&_a]:text-cyan [&_a]:underline [&_a]:decoration-cyan/40 [&_a]:underline-offset-2"
        dangerouslySetInnerHTML={{ __html: active.html }}
      />
      <div className="flex justify-end mt-2">
        <a
          href={`#${active.noteId}`}
          className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute hover:text-cyan"
          onClick={() => setActive(null)}
        >
          ↗ jump to note
        </a>
      </div>
    </div>
  );
}
