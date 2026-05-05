"use client";

/**
 * DecoderRing — a fixed bottom-left button that opens a terminal-style
 * cipher solver. The reader pastes the live ciphertext fragment into the
 * decoder; if their decryption matches LIVE_PLAINTEXT (case/space
 * normalised), they unlock a bonus footnote on the latest essay.
 *
 * The unlock is recorded in localStorage so the bonus footnote will
 * render on subsequent essay loads. Pure client; no network call.
 *
 * Triggers:
 *   - click the floating button (bottom-left)
 *   - press the `D` key
 *   - press `Esc` to close
 */

import { useEffect, useState } from "react";
import {
  liveCiphertext,
  decryptCaesar,
  currentShift,
  normaliseGuess,
  LIVE_PLAINTEXT,
  LIVE_UNLOCK_KEY,
} from "@/lib/cipher";

const STORAGE_KEY = "sad:decoder";

type Status = "idle" | "wrong" | "solved" | "already";

export function DecoderRing() {
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState<number>(13);
  const [guess, setGuess] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [solvedEarlier, setSolvedEarlier] = useState(false);
  const [ciphertext, setCiphertext] = useState("");

  // Hydrate from localStorage + compute current cipher on mount only.
  useEffect(() => {
    setCiphertext(liveCiphertext());
    const has = typeof window !== "undefined" && window.localStorage
      ? window.localStorage.getItem(STORAGE_KEY)
      : null;
    if (has) {
      try {
        const o = JSON.parse(has);
        if (o?.unlockKey === LIVE_UNLOCK_KEY) {
          setSolvedEarlier(true);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  // Keyboard: `D` to open (when nothing is focused), `Esc` to close.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        if (e.key === "Escape") setOpen(false);
        return;
      }
      if (e.key === "Escape") setOpen(false);
      else if ((e.key === "d" || e.key === "D") && !e.metaKey && !e.ctrlKey) {
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function trySolve() {
    if (normaliseGuess(guess) === normaliseGuess(LIVE_PLAINTEXT)) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            unlockKey: LIVE_UNLOCK_KEY,
            solvedAt: new Date().toISOString(),
          }),
        );
      } catch {
        /* ignore */
      }
      setStatus("solved");
      setSolvedEarlier(true);
    } else {
      setStatus("wrong");
    }
  }

  function tryShiftAuto() {
    // Decrypt with current month's shift to give the reader a hint
    setGuess(decryptCaesar(ciphertext, shift));
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open decoder ring"
        className="fixed bottom-5 left-5 z-40 grid place-items-center h-11 w-11 rounded-full border border-cyan/50 bg-ink-1/80 backdrop-blur text-cyan hover:border-cyan hover:bg-ink-2 transition-colors shadow-[0_0_20px_rgba(0,229,255,0.18)]"
        title="Decoder ring · press D"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <line x1="12" y1="1.5" x2="12" y2="4" stroke="currentColor" strokeWidth="1" />
          <line x1="12" y1="20" x2="12" y2="22.5" stroke="currentColor" strokeWidth="1" />
          <line x1="1.5" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="1" />
          <line x1="20" y1="12" x2="22.5" y2="12" stroke="currentColor" strokeWidth="1" />
        </svg>
        {solvedEarlier && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-cyan border border-ink-0" aria-hidden="true" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Decoder ring"
          className="fixed inset-0 z-50 grid place-items-center bg-ink-0/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-xl border border-cyan/60 bg-ink-1 shadow-[0_0_60px_rgba(0,229,255,0.25)]">
            {/* header */}
            <div className="flex items-center justify-between border-b border-rule px-4 py-2 font-mono text-[11px] uppercase tracking-[0.12em]">
              <span className="text-cyan">▸ DECODER · v.01</span>
              <span className="text-mute">SAGE@AFTERDARK ~/cipher</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-mute hover:text-cyan"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* body */}
            <div className="p-5 font-mono text-[13px]">
              <p className="text-mute mb-1">// LIVE TRANSMISSION · {new Date().toISOString().slice(0, 7)} · CAESAR</p>
              <div className="my-4 border border-rule bg-ink-0 p-4">
                <div className="text-[10px] uppercase tracking-[0.12em] text-faint mb-1">CIPHERTEXT</div>
                <div className="text-cyan break-all">{ciphertext.toUpperCase()}</div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3 items-end">
                <label className="block">
                  <span className="block text-[10px] uppercase tracking-[0.12em] text-faint mb-1">SHIFT</span>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={shift}
                    onChange={(e) => setShift(Math.max(1, Math.min(25, Number(e.target.value) || 1)))}
                    className="w-full bg-ink-0 border border-rule text-bone px-3 py-2 focus:outline-none focus:border-cyan"
                  />
                </label>
                <button
                  type="button"
                  onClick={tryShiftAuto}
                  className="border border-rule text-mute hover:text-cyan hover:border-cyan py-2 px-3 text-[11px] uppercase tracking-[0.08em]"
                >
                  ▸ Try shift {shift} → fill below
                </button>
              </div>

              <label className="block mt-4">
                <span className="block text-[10px] uppercase tracking-[0.12em] text-faint mb-1">YOUR ANSWER</span>
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => {
                    setGuess(e.target.value);
                    setStatus("idle");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") trySolve();
                  }}
                  placeholder="type the decrypted phrase…"
                  className="w-full bg-ink-0 border border-rule text-bone px-3 py-2 focus:outline-none focus:border-cyan"
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={trySolve}
                  className="bg-cyan text-ink-0 font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 hover:bg-cyan/90"
                >
                  ▸ Submit
                </button>
                <span className="text-[11px] uppercase tracking-[0.08em]">
                  {status === "wrong" && (
                    <span className="text-ember">// signal lost · try again</span>
                  )}
                  {status === "solved" && (
                    <span className="text-cyan">// signal acquired · footnote unlocked on the latest essay</span>
                  )}
                  {status === "idle" && solvedEarlier && (
                    <span className="text-cyan">// already solved · footnote live</span>
                  )}
                </span>
              </div>

              <p className="mt-6 text-[11px] text-faint leading-relaxed border-t border-rule pt-4">
                A monthly Caesar cipher. Try shifts 1–25; today&apos;s shift is{" "}
                <span className="text-cyan">{currentShift()}</span>. Solve it to
                surface a hidden &quot;director&apos;s commentary&quot; footnote on the
                latest essay. Members get the shift in their newsletter.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook for any component that wants to know whether the user has
 * solved the live cipher. Returns true after the user solves it.
 * Renders nothing on SSR; rehydrates client-side.
 */
export function useDecoderUnlocked(): boolean {
  const [u, setU] = useState(false);
  useEffect(() => {
    const has = window.localStorage.getItem(STORAGE_KEY);
    if (has) {
      try {
        const o = JSON.parse(has);
        if (o?.unlockKey === LIVE_UNLOCK_KEY) setU(true);
      } catch {
        /* ignore */
      }
    }
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      try {
        if (!e.newValue) return setU(false);
        const o = JSON.parse(e.newValue);
        setU(o?.unlockKey === LIVE_UNLOCK_KEY);
      } catch {
        /* ignore */
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return u;
}

/**
 * <BonusFootnote> — renders nothing until the user has solved the live
 * cipher. Place this at the bottom of essays that have director-commentary
 * to unlock.
 */
export function BonusFootnote({ children }: { children: React.ReactNode }) {
  const unlocked = useDecoderUnlocked();
  if (!unlocked) return null;
  return (
    <aside
      className="my-12 border border-cyan/40 bg-cyan/5 p-5 font-mono text-[13px] text-bone"
      data-bonus
    >
      <div className="text-[10px] uppercase tracking-[0.12em] text-cyan mb-2">
        ▸ DECODED · DIRECTOR&apos;S COMMENTARY
      </div>
      <div className="leading-relaxed">{children}</div>
    </aside>
  );
}
