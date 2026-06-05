"use client";

import { useEffect, useRef, useState } from "react";
import * as sound from "@/lib/intrusion/sound";
import {
  loadProfile,
  saveProfile,
  nextProfile,
} from "@/lib/intrusion/progress";
import {
  firstVisitLines,
  enteredLines,
  returnLines,
} from "@/lib/intrusion/operator";
import "./intrusion.css";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OperatorProps {
  onEnter: (handle: string) => void;
}

// ---------------------------------------------------------------------------
// Typewriter helpers (plain text → char-by-char → then set innerHTML for markup)
// ---------------------------------------------------------------------------

const CHAR_DELAY = 15; // ms per character
const LINE_PAUSE = 260; // ms between lines within a block

function wait(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

/**
 * Type plain text char-by-char into `node.textContent`, then set
 * `node.innerHTML` to the raw string (which may contain <b> etc.)
 * after typing completes — exactly mirroring the prototype's approach.
 *
 * When `reduce` is true, skips the animation entirely.
 */
async function typeInto(
  node: HTMLElement,
  text: string,
  reduce: boolean,
  scrollFn: () => void,
): Promise<void> {
  const plain = text.replace(/<[^>]+>/g, "");
  if (reduce) {
    node.innerHTML = text;
    scrollFn();
    return;
  }
  return new Promise((res) => {
    let i = 0;
    const tick = () => {
      node.textContent = plain.slice(0, ++i);
      scrollFn();
      if (i < plain.length) {
        setTimeout(tick, CHAR_DELAY);
      } else {
        // Render the actual markup (e.g. <b>help</b>) once typing is done
        node.innerHTML = text;
        scrollFn();
        res();
      }
    };
    tick();
  });
}

/**
 * Append a block of lines to the transcript with the given class, typing
 * each line in sequence with a brief inter-line pause.
 */
async function typeBlock(
  transcript: HTMLElement,
  lines: string[],
  cls: string,
  reduce: boolean,
  scrollFn: () => void,
): Promise<void> {
  const block = document.createElement("div");
  block.className = cls;
  transcript.appendChild(block);

  for (const raw of lines) {
    const ln = document.createElement("div");
    block.appendChild(ln);
    await typeInto(ln, raw, reduce, scrollFn);
    if (!reduce) await wait(LINE_PAUSE);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Operator({ onEnter }: OperatorProps) {
  const screenRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const handleInputRef = useRef<HTMLInputElement>(null);

  // showInput drives whether the handle prompt is visible
  const [showInput, setShowInput] = useState(false);
  const [inputVal, setInputVal] = useState("");

  // Prevent double-run in StrictMode
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const transcript = transcriptRef.current;
    const screen = screenRef.current;
    if (!transcript || !screen) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scrollFn = () => {
      screen.scrollTop = screen.scrollHeight;
    };

    // All time reads are inside this effect — safe from SSR hydration mismatch
    const now = Date.now();
    const hour = new Date().getHours();

    sound.handshake();

    const profile = loadProfile();

    if (!profile.handle) {
      // ── First visit ────────────────────────────────────────────────
      (async () => {
        await typeBlock(
          transcript,
          firstVisitLines(),
          "op",
          reduce,
          scrollFn,
        );
        setShowInput(true);
        // Focus happens in the next effect watching showInput
      })();
    } else {
      // ── Return visit ───────────────────────────────────────────────
      (async () => {
        const p2 = nextProfile(profile, now);
        saveProfile(p2);
        await typeBlock(
          transcript,
          returnLines(p2, hour),
          "op",
          reduce,
          scrollFn,
        );
        sound.enter();
        onEnter(p2.handle);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus the handle input once it becomes visible
  useEffect(() => {
    if (showInput) {
      handleInputRef.current?.focus();
    }
  }, [showInput]);

  // ── Handle submission ─────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;

    const transcript = transcriptRef.current;
    const screen = screenRef.current;
    if (!transcript || !screen) return;

    const raw = inputVal.trim() || "anon";
    const scrollFn = () => {
      screen.scrollTop = screen.scrollHeight;
    };

    // Echo the chosen handle
    const echo = document.createElement("div");
    echo.className = "echo";
    echo.innerHTML = `<span class="pr">handle ▸</span> ${raw}`;
    transcript.appendChild(echo);
    scrollFn();

    setShowInput(false);
    setInputVal("");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = Date.now();
    const profile = loadProfile();

    const p2 = nextProfile({ ...profile, handle: raw }, now);
    saveProfile(p2);

    (async () => {
      await typeBlock(
        transcript,
        enteredLines(raw),
        "op",
        reduce,
        scrollFn,
      );
      sound.enter();
      onEnter(raw);
    })();
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div id="screen" ref={screenRef} tabIndex={-1} aria-label="Operator terminal">
      {/* aria-live region wraps the transcript so screen readers announce lines */}
      <div
        id="transcript"
        ref={transcriptRef}
        aria-live="polite"
        aria-atomic="false"
      />

      {showInput && (
        <div className="ask">
          <span className="pr" aria-hidden="true">
            handle ▸
          </span>
          <input
            ref={handleInputRef}
            type="text"
            spellCheck={false}
            maxLength={24}
            aria-label="Enter your handle"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />
        </div>
      )}
    </div>
  );
}
