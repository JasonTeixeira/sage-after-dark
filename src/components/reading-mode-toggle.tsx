"use client";

/**
 * ReadingModeToggle — switches the document between "dark" (default) and
 * "parchment" (warm cream/sepia) themes for long-form reading.
 *
 * The toggle persists in localStorage and is read on mount; the global
 * `<html data-reading-mode="parchment">` attribute drives CSS overrides
 * defined in globals.css. Hydration-safe: defaults to dark on first render
 * and only swaps after the client mount effect.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "sad:reading-mode";

type Mode = "dark" | "parchment";

export function ReadingModeToggle() {
  const [mode, setMode] = useState<Mode>("dark");
  const [mounted, setMounted] = useState(false);

  // Read persisted preference on mount.
  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "parchment" || saved === "dark") {
        setMode(saved);
        document.documentElement.dataset.readingMode = saved;
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Persist + apply on change.
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore */
    }
    document.documentElement.dataset.readingMode = mode;
  }, [mode, mounted]);

  // Keyboard shortcut: Shift+R toggles, with view-transition if available.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.shiftKey &&
        (e.key === "R" || e.key === "r") &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement | null)?.isContentEditable
        )
      ) {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function toggle() {
    const next: Mode = mode === "dark" ? "parchment" : "dark";
    type DocumentWithVT = Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    const doc = document as DocumentWithVT;
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => setMode(next));
    } else {
      setMode(next);
    }
  }

  // Avoid hydration mismatch — render a stable placeholder until mounted.
  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle reading mode"
        className="font-mono text-[12px] tracking-wide uppercase text-mute hover:text-cyan transition-colors"
      >
        ▸ READ
      </button>
    );
  }

  const label = mode === "dark" ? "▸ PARCHMENT" : "▸ DARK";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${mode === "dark" ? "parchment" : "dark"} reading mode (Shift+R)`}
      title="Toggle reading mode (Shift+R)"
      className="font-mono text-[12px] tracking-wide uppercase text-mute hover:text-cyan transition-colors focus:outline-none"
      data-print-hide
    >
      {label}
    </button>
  );
}
