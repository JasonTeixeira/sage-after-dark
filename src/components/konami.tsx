"use client";

/**
 * Konami — easter egg.
 *
 * Listens for the Konami code:  ↑ ↑ ↓ ↓ ← → ← → b a
 * On match, opens a full-screen terminal-style overlay revealing a hidden
 * dispatch from the author. Press `esc` or click "close" to dismiss.
 *
 * Respects prefers-reduced-motion (no scanline anim).
 */

import { useEffect, useRef, useState } from "react";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export function Konami() {
  const [open, setOpen] = useState(false);
  const buf = useRef<string[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
        }
        return;
      }
      // Don't capture sequence while typing in inputs
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf.current.push(key);
      if (buf.current.length > SEQUENCE.length) {
        buf.current.shift();
      }
      if (
        buf.current.length === SEQUENCE.length &&
        buf.current.every((k, i) => k === SEQUENCE[i])
      ) {
        e.preventDefault();
        buf.current = [];
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hidden dispatch"
      className="fixed inset-0 z-[100] bg-ink-0/95 backdrop-blur-sm flex items-center justify-center p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-2xl border border-cyan/40 bg-ink-1 p-8 font-mono text-sm leading-relaxed text-bone shadow-[0_0_60px_rgba(0,229,255,0.15)]">
        {/* corner ticks */}
        <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-cyan" />
        <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-cyan" />
        <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-cyan" />
        <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-cyan" />

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 text-mute hover:text-cyan text-xs uppercase tracking-[0.08em]"
          aria-label="Close"
        >
          [ esc ]
        </button>

        <div className="text-cyan text-[10px] uppercase tracking-[0.12em] mb-4">
          ▸ INTERCEPT · CHANNEL 0xFA · DECRYPTED
        </div>

        <pre className="text-cyan/70 mb-4 text-[10px] leading-tight whitespace-pre overflow-x-auto">
{`  ____             _      ___           _      ___             _    
 / ___|  __ _  __ _ ___  |_ _|___  ___ | |_   |   \\ ___ _ _ __| |__ 
 \\___ \\ / _\` |/ _\` / -_)  | |/ _ \\/ -_)| ' \\  | |) / -_) ' \\/ /| / /
  ___) | (_| | (_| \\___|   |_\\___/\\___||_||_| |___/\\___|_|\\_\\_||_\\_\\\``}
        </pre>

        <p className="text-bone mb-4">
          You found the back door. Most people skim. You played the cheat code.
        </p>
        <p className="text-bone/80 mb-4">
          Here&apos;s the deal: I&apos;m building Sage Ideas in public. Every essay here is
          a real artifact from a real workshop. If you&apos;re reading this, you
          probably build things too — or want to.
        </p>
        <p className="text-bone/80 mb-4">
          Email me at{" "}
          <a
            href="mailto:sage@sageideas.org?subject=konami"
            className="text-cyan underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan"
          >
            sage@sageideas.org
          </a>{" "}
          with the subject line <span className="text-cyan">konami</span>. I&apos;ll send
          back something I&apos;ve never published — a draft, a tool, a half-finished
          idea worth finishing together.
        </p>
        <div className="text-cyan text-[10px] uppercase tracking-[0.12em] mt-6 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-cyan cursor-blink" />
          <span>END OF TRANSMISSION</span>
        </div>
      </div>
    </div>
  );
}
