"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as sound from "@/lib/intrusion/sound";
import "./intrusion.css";

// Duration of the glitch-on-land animation (ms) — keeps classes in sync
const GLITCH_LAND_MS = 900;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRIGGERS = [
  "bypass",
  "sudo",
  "sudo su",
  "su",
  "enter",
  "unlock",
  "knock",
  "root",
  "override",
  "let me in",
  "open",
  "access",
];

const INACTIVITY_TELL_MS = 6000;
const TRAP_REVERT_MS = 1100;
const DENIED_REVERT_MS = 900;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface DecoyProps {
  onBypass: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Decoy({ onBypass }: DecoyProps) {
  // --- state ---
  const [leaveLabel, setLeaveLabel] = useState("← return to safety");
  const [trapAnimating, setTrapAnimating] = useState(false);
  const [hasTell, setHasTell] = useState(false);
  const [bypassOpen, setBypassOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [glitchLanding, setGlitchLanding] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  // --- refs ---
  const trapHitsRef = useRef(0);
  const wrongRef = useRef(0);
  const gestureInitRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const binputRef = useRef<HTMLInputElement>(null);
  const revertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- helpers ---
  const maybeInitSound = useCallback(() => {
    if (!gestureInitRef.current) {
      gestureInitRef.current = true;
      sound.initOnGesture();
    }
  }, []);

  // Start the inactivity tell timer once on mount; clear on unmount
  useEffect(() => {
    inactivityTimerRef.current = setTimeout(() => {
      setHasTell(true);
    }, INACTIVITY_TELL_MS);

    return () => {
      if (inactivityTimerRef.current !== null) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (revertTimerRef.current !== null) {
        clearTimeout(revertTimerRef.current);
      }
    };
  }, []);

  // Glitch-on-land: trigger on first mount, remove class after animation
  useEffect(() => {
    setGlitchLanding(true);
    setFlashActive(true);

    const glitchTimer = setTimeout(() => {
      setGlitchLanding(false);
    }, GLITCH_LAND_MS);

    const flashTimer = setTimeout(() => {
      setFlashActive(false);
    }, GLITCH_LAND_MS);

    return () => {
      clearTimeout(glitchTimer);
      clearTimeout(flashTimer);
    };
  }, []);

  // Focus the bypass input once it opens
  useEffect(() => {
    if (bypassOpen) {
      binputRef.current?.focus();
    }
  }, [bypassOpen]);

  // --- handlers ---
  const handleLeaveClick = useCallback(() => {
    maybeInitSound();

    // Shake animation: remove class, force reflow, re-add
    setTrapAnimating(false);
    // Use requestAnimationFrame to force a re-render cycle for the animation restart
    requestAnimationFrame(() => {
      setTrapAnimating(true);
    });

    const hits = trapHitsRef.current;
    setLeaveLabel(hits === 0 ? "the door is locked." : "it's always locked.");

    if (revertTimerRef.current !== null) {
      clearTimeout(revertTimerRef.current);
    }
    revertTimerRef.current = setTimeout(() => {
      setLeaveLabel("← return to safety");
      setTrapAnimating(false);
    }, TRAP_REVERT_MS);

    trapHitsRef.current += 1;

    // First hit reveals the seam tell
    if (trapHitsRef.current >= 1) {
      setHasTell(true);
      // Cancel the inactivity timer since the tell is already shown
      if (inactivityTimerRef.current !== null) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }
  }, [maybeInitSound]);

  const openBypass = useCallback(() => {
    maybeInitSound();
    setBypassOpen(true);
  }, [maybeInitSound]);

  const handleHintKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openBypass();
      }
    },
    [openBypass],
  );

  const handleInputKeyDown = useCallback(() => {
    maybeInitSound();
    sound.key();
  }, [maybeInitSound]);

  const handleBypassSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const v = inputVal.trim().toLowerCase();

      if (TRIGGERS.includes(v)) {
        onBypass();
        return;
      }

      // Wrong answer
      sound.fail();
      setInputVal("");
      setPlaceholder("denied.");
      wrongRef.current += 1;

      if (revertTimerRef.current !== null) {
        clearTimeout(revertTimerRef.current);
      }
      revertTimerRef.current = setTimeout(() => {
        setPlaceholder((prev) => (prev === "denied." ? "" : prev));
      }, DENIED_REVERT_MS);

      if (wrongRef.current >= 2) {
        setPlaceholder("try: bypass");
      }
    },
    [inputVal, onBypass],
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Full-screen flash on land (aria-hidden, decorative) */}
      <div
        id="glitch-flash"
        aria-hidden="true"
        className={flashActive ? "active" : ""}
      />

      {/* Scanlines overlay (aria-hidden, decorative) */}
      <div id="scanlines" aria-hidden="true" />

      {/* Neon vignette (aria-hidden, decorative) */}
      <div id="wall-vignette" aria-hidden="true" />

      {/* Scan beam (aria-hidden, decorative) */}
      <div id="scan-beam" aria-hidden="true" />

      {/* The fake 403 wall */}
      <div id="wall" role="dialog" aria-label="Access restricted">
        <div className="wall-grid" aria-hidden="true" />
        <div className="wall-grain" />
        <div className="wall-inner">
          <div className="badge">▚ SYSTEM // INTRUSION DETECTED</div>
          <div className={`code${glitchLanding ? " glitch-land" : " micro-glitch"}`}>403</div>
          <h1 className={glitchLanding ? "glitch-land" : ""}>ACCESS RESTRICTED</h1>
          <p className="sub">
            This terminal is closed to the public.
            <br />
            There is nothing for you here.
          </p>

          {/* Honeypot trap button */}
          <button
            className={`leave${trapAnimating ? " trap" : ""}`}
            onClick={handleLeaveClick}
            type="button"
            aria-label="Return to safety"
          >
            {leaveLabel}
          </button>

          <div className="meta">
            node sad-07 · region us-dark · uptime 1,284d ·{" "}
            <span className="lock">🔒 sealed</span>
          </div>
        </div>

        {/* Bypass seam — faint, at the very bottom edge */}
        <div className="bypass">
          {!bypassOpen ? (
            <span
              className={`hintline${hasTell ? " tell" : ""}`}
              onClick={openBypass}
              onKeyDown={handleHintKeyDown}
              tabIndex={0}
              role="button"
              aria-label="Open bypass input"
            >
              // nothing to see here<span className="blip">.</span>
            </span>
          ) : (
            <form
              id="bform"
              autoComplete="off"
              onSubmit={handleBypassSubmit}
            >
              <span className="bp">&gt;</span>
              <input
                id="binput"
                ref={binputRef}
                type="text"
                spellCheck={false}
                aria-label="bypass"
                placeholder={placeholder}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleInputKeyDown}
              />
            </form>
          )}
        </div>
      </div>
    </>
  );
}
