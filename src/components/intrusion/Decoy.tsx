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

// White-rabbit fragments leaked from behind the skin during a crack. A
// mastermind's clues — never naming the way in, only beckoning toward it.
const RABBIT_FRAGMENTS = [
  "// it's awake",
  "// you were expected",
  "// the seam is below ↓",
  "// 40.7128, -74.0060",
  "// don't trust the door",
  "// i can see the cursor",
  "// keep going",
  "// 0xSAD ::",
];

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
  const [rabbit, setRabbit] = useState<string | null>(null);

  // --- refs ---
  const trapHitsRef = useRef(0);
  const wrongRef = useRef(0);
  const gestureInitRef = useRef(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const binputRef = useRef<HTMLInputElement>(null);
  const revertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rabbitIdxRef = useRef(0);
  const rabbitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Leak a white-rabbit fragment whenever the core "pushes through" a crack.
  // Watches the html[data-core-phase] attribute the WebGL surge sets. No-op
  // under reduced motion (no WebGL → attribute never set).
  useEffect(() => {
    const root = document.documentElement;
    const showFragment = () => {
      const frag = RABBIT_FRAGMENTS[rabbitIdxRef.current % RABBIT_FRAGMENTS.length];
      rabbitIdxRef.current += 1;
      setRabbit(frag);
      if (rabbitTimerRef.current !== null) clearTimeout(rabbitTimerRef.current);
      rabbitTimerRef.current = setTimeout(() => setRabbit(null), 1400);
    };

    const observer = new MutationObserver(() => {
      const phase = root.getAttribute("data-core-phase");
      if (phase === "shatter" || phase === "crack") {
        showFragment();
      }
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-core-phase"],
    });

    return () => {
      observer.disconnect();
      if (rabbitTimerRef.current !== null) clearTimeout(rabbitTimerRef.current);
    };
  }, []);

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
        {/* Cracking-reveal layer — driven by html[data-core-phase] set by the
            WebGL surge choreography, so the skin tears exactly as the core
            blazes through. Decorative; the core itself lives behind the wall. */}
        <div id="core-reveal" aria-hidden="true">
          <div className="cr-tear" />
          <div className="cr-cracks" />
          <div className="cr-shatter" />
          <div className="cr-bleed" />
        </div>
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

        {/* White-rabbit leak — a fragment from behind, surfaced during a crack */}
        <div
          className={`rabbit-leak${rabbit ? " show" : ""}`}
          aria-hidden="true"
        >
          {rabbit}
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
