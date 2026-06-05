"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  encryptCaesar,
  decryptCaesar,
  currentShift,
  normaliseGuess,
  LIVE_PLAINTEXT,
} from "@/lib/cipher";
import { fail, enter } from "@/lib/intrusion/sound";
import "./intrusion.css";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type VaultGateProps = {
  onSolved: () => void;
};

// ---------------------------------------------------------------------------
// Hint ladder
// ---------------------------------------------------------------------------

const HINTS = [
  "It's a Caesar cipher — every letter rotated by a fixed key. Drag the ring.",
  "The key changes monthly. This month it's a single odd digit.",
  // Hint 3 (shift reveal) is computed at runtime.
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function VaultGate({ onSolved }: VaultGateProps) {
  // Compute cipher values client-side (avoids SSR/CSR hydration mismatch with Date).
  const [shift] = useState<number>(() => currentShift());
  const [ciphertext] = useState<string>(() =>
    encryptCaesar(LIVE_PLAINTEXT, currentShift()),
  );

  const [ringKey, setRingKey] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [hints, setHints] = useState<string[]>([]);
  const [nudge, setNudge] = useState<string | null>(null);
  const [hintsExhausted, setHintsExhausted] = useState(false);

  const answerRef = useRef<HTMLInputElement>(null);

  // Derived: live decoded text
  const decoded = decryptCaesar(ciphertext, ringKey);
  const decodedSolved = normaliseGuess(decoded) === LIVE_PLAINTEXT;
  const answerSolved = normaliseGuess(answer) === LIVE_PLAINTEXT;

  // Focus the answer input on mount
  useEffect(() => {
    answerRef.current?.focus();
  }, []);

  const triggerShake = useCallback(() => {
    setIsShaking(false);
    // Force reflow so the animation restarts if already shaking
    requestAnimationFrame(() => {
      setIsShaking(true);
    });
    // Remove the class after the animation ends (~400 ms)
    setTimeout(() => setIsShaking(false), 450);
  }, []);

  const handleHint = useCallback(() => {
    setHints((prev) => {
      if (prev.length >= HINTS.length + 1) return prev; // +1 for the dynamic shift hint
      if (prev.length < HINTS.length) {
        return [...prev, HINTS[prev.length]];
      }
      // Third hint: reveal the shift value
      setHintsExhausted(true);
      return [...prev, `The key is ${shift}. Now read it, and type it.`];
    });
  }, [shift]);

  const tryUnlock = useCallback(() => {
    if (decodedSolved || answerSolved) {
      enter();
      onSolved();
      return;
    }
    fail();
    triggerShake();
    setNudge(
      "not quite. rotate the key until the line turns green — type that, or just hit unlock.",
    );
    setAnswer("");
    setTimeout(() => setNudge(null), 4000);
  }, [decodedSolved, answerSolved, onSolved, triggerShake]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      tryUnlock();
    },
    [tryUnlock],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        tryUnlock();
      }
    },
    [tryUnlock],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className={`gate${isShaking ? " shake" : ""}`}
      role="group"
      aria-label="Cipher gate"
    >
      {/* Gate label */}
      <div className="gate-lbl">◈ cipher gate · sealed</div>

      {/* Ciphertext display */}
      <div className="gate-cipher" aria-label="Ciphertext">
        {ciphertext}
      </div>

      {/* Live decoded line */}
      <div
        className={`gate-decoded${decodedSolved ? " solved" : ""}`}
        aria-live="polite"
        aria-label="Decoded text"
      >
        {decoded}
      </div>

      {/* Decoder ring */}
      <div className="gate-ring">
        <label htmlFor="gate-ring-input">key</label>
        <input
          id="gate-ring-input"
          type="range"
          min={0}
          max={25}
          value={ringKey}
          aria-label="Decoder ring — rotate to shift the cipher key"
          onChange={(e) => setRingKey(Number(e.target.value))}
        />
        <span className="gate-keyval" aria-hidden="true">
          {ringKey}
        </span>
      </div>

      {/* Answer input + unlock button */}
      <form className="gate-ans" onSubmit={handleSubmit} noValidate>
        <span className="pr" aria-hidden="true">
          ~ $
        </span>
        <input
          ref={answerRef}
          type="text"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder="type the decoded phrase…"
          aria-label="Your answer — type the decoded phrase"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit">unlock</button>
      </form>

      {/* Hint ladder */}
      <div className="gate-hints">
        {!hintsExhausted && (
          <button
            className="gate-hintbtn"
            type="button"
            onClick={handleHint}
            aria-label={`Reveal hint ${hints.length + 1} of 3`}
          >
            need a hint? ▾
          </button>
        )}

        {hints.map((h, i) => (
          <div key={i} className="gate-hintline">
            › {h}
          </div>
        ))}

        {nudge && (
          <div className="gate-hintline warn" role="alert">
            › {nudge}
          </div>
        )}
      </div>
    </div>
  );
}
