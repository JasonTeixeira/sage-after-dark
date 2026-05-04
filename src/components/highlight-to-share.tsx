"use client";

/**
 * HighlightToShare — text-selection bubble.
 *
 * When the reader selects ≥ 12 chars of prose inside the post body,
 * a small floating bubble appears near the selection with three
 * actions:
 *   ▸ COPY      — copies the highlighted passage + a citation line
 *   ▸ TWEET     — opens an X intent prefilled (we keep it for compat
 *                 even though the studio doesn't run X — it's useful
 *                 to readers who do)
 *   ▸ LINKEDIN  — opens LinkedIn share with the URL
 *
 * Behavior:
 *   - Only listens inside the [data-highlightable] root.
 *   - Hides immediately on a new click that collapses the selection.
 *   - On mobile, positions itself just above the selection bounds.
 *   - 100% accessible: bubble is a real <div role="toolbar">; no
 *     keyboard trap; ESC dismisses it.
 *   - "COPY" gives a 1.4s "✓ copied" confirmation.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const MIN = 12;

export function HighlightToShare({
  rootSelector = "[data-highlightable]",
  postUrl,
  postTitle,
}: {
  rootSelector?: string;
  postUrl: string;
  postTitle: string;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handle = useCallback(() => {
    if (typeof window === "undefined") return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setPos(null);
      setText("");
      return;
    }
    const t = sel.toString().trim();
    if (t.length < MIN) {
      setPos(null);
      setText("");
      return;
    }
    // Confirm selection lives inside our root.
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.commonAncestorContainer)) return;
    const rect = range.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + window.scrollX;
    const y = rect.top + window.scrollY - 14;
    setText(t);
    setPos({ x, y });
  }, [rootSelector]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onUp() {
      // Defer so the click that closed an old selection completes first.
      setTimeout(handle, 10);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setPos(null);
        setText("");
      }
    }
    document.addEventListener("mouseup", onUp);
    document.addEventListener("keyup", onUp);
    document.addEventListener("touchend", onUp);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("keyup", onUp);
      document.removeEventListener("touchend", onUp);
      document.removeEventListener("keydown", onKey);
    };
  }, [handle]);

  if (!pos || !text) return null;

  const citation = `\n\n— "${postTitle}", Sage After Dark\n${postUrl}`;
  const tweetText = encodeURIComponent(`"${truncate(text, 200)}"\n\n${postUrl}`);
  const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
  const xUrl = `https://x.com/intent/tweet?text=${tweetText}`;

  function copy() {
    void navigator.clipboard
      .writeText(`"${text}"${citation}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      })
      .catch(() => {
        /* clipboard may be unavailable; fail silently */
      });
  }

  return (
    <div
      ref={ref}
      role="toolbar"
      aria-label="Share selection"
      className={cn(
        "absolute z-40 -translate-x-1/2 -translate-y-full",
        "flex items-stretch border border-cyan/60 bg-ink-1/95 backdrop-blur-md",
        "shadow-[0_8px_24px_rgba(0,0,0,0.5)] print:hidden",
      )}
      style={{ left: pos.x, top: pos.y }}
    >
      <button
        type="button"
        onClick={copy}
        className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bone hover:bg-cyan/10 hover:text-cyan transition-colors border-r border-rule"
      >
        {copied ? "✓ copied" : "▸ copy"}
      </button>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bone hover:bg-cyan/10 hover:text-cyan transition-colors border-r border-rule"
      >
        ▸ x
      </a>
      <a
        href={liUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.1em] text-bone hover:bg-cyan/10 hover:text-cyan transition-colors"
      >
        ▸ in
      </a>
      {/* Caret */}
      <span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 -bottom-2 h-0 w-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-cyan/60"
      />
    </div>
  );
}

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
