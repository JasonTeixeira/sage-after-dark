"use client";

/**
 * Global keyboard shortcuts.
 *
 *   /         open command palette  (handled by <CommandPalette />)
 *   cmd+k     open command palette  (handled by <CommandPalette />)
 *   g h       go home
 *   g a       go to /archive
 *   g n       go to /now
 *   g s       go to /search
 *   g t       go to /taste
 *   g r       go to /reading
 *   d         decoder ring          (handled by <DecoderRing />)
 *   s         studio status         (handled by <StudioWidget />)
 *   ?         open shortcut help overlay
 *   esc       close overlay / blur input
 *
 * Shortcuts ignore presses while typing in inputs / textareas / contentEditable.
 */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "⌘ k", label: "Command palette" },
  { keys: "/", label: "Command palette" },
  { keys: "g h", label: "Go home" },
  { keys: "g a", label: "Go to archive" },
  { keys: "g n", label: "Go to /now" },
  { keys: "g s", label: "Go to search" },
  { keys: "g t", label: "Go to /taste" },
  { keys: "g r", label: "Go to /reading" },
  { keys: "d", label: "Decoder ring" },
  { keys: "s", label: "Studio status" },
  { keys: "?", label: "Show shortcuts" },
  { keys: "esc", label: "Close" },
];

const G_MAP: Record<string, string> = {
  h: "/",
  a: "/archive",
  n: "/now",
  s: "/search",
  t: "/taste",
  r: "/reading",
  c: "/colophon",
  b: "/about",
};

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function KeyboardShortcuts() {
  const router = useRouter();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const gPending = useRef<number | null>(null);

  useEffect(() => {
    function clearG() {
      if (gPending.current) {
        window.clearTimeout(gPending.current);
        gPending.current = null;
      }
    }

    function onKey(e: KeyboardEvent) {
      // Esc always works, even in inputs
      if (e.key === "Escape") {
        if (overlayOpen) {
          setOverlayOpen(false);
          e.preventDefault();
          return;
        }
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;

      // "g X" two-key chord
      if (gPending.current) {
        const dest = G_MAP[e.key.toLowerCase()];
        clearG();
        if (dest) {
          e.preventDefault();
          router.push(dest);
          return;
        }
        return;
      }

      if (e.key === "g") {
        gPending.current = window.setTimeout(() => {
          gPending.current = null;
        }, 900);
        return;
      }

      // "/" is handled by <CommandPalette /> — do not intercept.

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setOverlayOpen((o) => !o);
        return;
      }
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearG();
    };
  }, [router, overlayOpen]);

  if (!overlayOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/80 backdrop-blur-sm"
      onClick={() => setOverlayOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="border border-rule rounded bg-ink p-6 w-[min(420px,90vw)]"
        style={{ borderLeft: "2px solid var(--color-cyan, #00E5FF)" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-4">
          // keyboard
        </p>
        <h3 className="font-sans text-bone text-[18px] mb-4">
          Shortcuts
        </h3>
        <ul className="space-y-2">
          {SHORTCUTS.map((s) => (
            <li
              key={s.keys}
              className="flex items-baseline justify-between gap-4 py-1 border-b border-rule/50 last:border-0"
            >
              <span className="font-sans text-bone/90 text-[14px]">
                {s.label}
              </span>
              <kbd className="font-mono text-[11px] uppercase tracking-[0.08em] px-2 py-1 border border-rule rounded text-bone bg-ink/70">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute mt-4">
          press <kbd className="px-1 border border-rule rounded">esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
