"use client";

/**
 * StudioWidget — small fixed-position panel on essay pages.
 *
 * Shows three lines of live context:
 *   - WRITING NOW: what's currently being drafted (from STUDIO_STATE)
 *   - ARC: the arc this essay belongs to + episode position
 *   - SIGNAL: tiny "now reading" pulse — increments while the user is on the page
 *
 * No backend required; the writing-now field is a hand-curated constant
 * (single source of truth in src/content/studio-state.ts). Updating it on
 * push is part of the publishing ritual — that's the point.
 *
 * Dismissable; remembers state in localStorage. Hidden on small screens.
 * Press 'S' to toggle.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Props = {
  arcCode?: string;
  arcTitle?: string;
  arcSlug?: string;
  episodeN?: number;
  episodeTotal?: number;
  writingNow: string;
  writingNowKind: "DRAFTING" | "EDITING" | "SCHEDULED" | "RESTING";
  pillar: string;
};

const KIND_DOT: Record<Props["writingNowKind"], string> = {
  DRAFTING: "bg-cyan animate-pulse",
  EDITING: "bg-amber-300",
  SCHEDULED: "bg-emerald-400",
  RESTING: "bg-mute",
};

const STORAGE_KEY = "sad:studio";

export function StudioWidget(props: Props) {
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(0);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // default open on first visit, hidden if user previously dismissed
      setOpen(stored !== "closed");
    } catch {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    // pulse counter — 1 unit every 7s of dwell, capped at 99
    tickRef.current = window.setInterval(() => {
      setPulse((p) => (p < 99 ? p + 1 : p));
    }, 7000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setOpen((o) => {
          const next = !o;
          try {
            localStorage.setItem(STORAGE_KEY, next ? "open" : "closed");
          } catch {}
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "closed");
    } catch {}
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          try {
            localStorage.setItem(STORAGE_KEY, "open");
          } catch {}
        }}
        className="hidden md:flex fixed bottom-4 right-4 z-40 items-center gap-2 border border-rule bg-ink-1/90 backdrop-blur px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mute hover:text-cyan hover:border-cyan/40 transition-colors"
        aria-label="Open studio panel (S)"
      >
        <span className={`inline-block w-2 h-2 ${KIND_DOT[props.writingNowKind]}`} />
        STUDIO
      </button>
    );
  }

  return (
    <aside
      className="hidden md:block fixed bottom-4 right-4 z-40 w-[280px] border border-rule bg-ink-1/95 backdrop-blur shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
      aria-label="Studio panel"
    >
      {/* corner ticks */}
      <span className="absolute -top-px -left-px w-2 h-2 border-t border-l border-cyan/60" />
      <span className="absolute -top-px -right-px w-2 h-2 border-t border-r border-cyan/60" />
      <span className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-cyan/60" />
      <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-cyan/60" />

      <header className="flex items-center justify-between px-3 py-2 border-b border-rule">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan">
          <span className={`inline-block w-2 h-2 ${KIND_DOT[props.writingNowKind]}`} />
          THE STUDIO
        </div>
        <button
          type="button"
          onClick={close}
          className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute hover:text-cyan"
          aria-label="Close studio panel"
        >
          [ × ]
        </button>
      </header>

      <div className="px-3 py-3 font-mono text-[11px] leading-relaxed text-bone/90 space-y-2.5">
        <div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-mute mb-0.5">
            ▸ WRITING {props.writingNowKind}
          </div>
          <div className="text-bone">{props.writingNow}</div>
        </div>

        {props.arcCode && props.arcSlug && (
          <div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-mute mb-0.5">
              ▸ FROM ARC
            </div>
            <Link
              href={`/arcs/${props.arcSlug}`}
              className="text-cyan hover:underline decoration-cyan/40 underline-offset-2"
            >
              {props.arcCode} · {props.arcTitle}
            </Link>
            {typeof props.episodeN === "number" && props.episodeTotal && (
              <div className="text-mute text-[10px] mt-0.5">
                Episode {String(props.episodeN).padStart(2, "0")} of{" "}
                {String(props.episodeTotal).padStart(2, "0")}
              </div>
            )}
          </div>
        )}

        <div>
          <div className="text-[9px] uppercase tracking-[0.14em] text-mute mb-0.5">
            ▸ SIGNAL · {props.pillar.toUpperCase()}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 bg-cyan animate-pulse" />
            <span className="text-bone/70 text-[10px]">
              you · dwell {String(pulse).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      <footer className="px-3 py-1.5 border-t border-rule font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
        press <span className="text-cyan">S</span> to toggle
      </footer>
    </aside>
  );
}
