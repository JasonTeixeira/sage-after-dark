"use client";

import { useEffect, useState, useCallback } from "react";
import { Decoy } from "./Decoy";
import { Operator } from "./Operator";
import { Terminal, type EssayMeta } from "./Terminal";
import { VaultGate } from "./VaultGate";
import { Vault } from "./Vault";
import { initOnGesture, peel, hum, isMuted, toggleMuted } from "@/lib/intrusion/sound";
import { loadProfile } from "@/lib/intrusion/progress";
import "./intrusion.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Phase = "decoy" | "peeling" | "operator" | "terminal";
type SubOverlay = "gate" | "vault" | null;

type Props = {
  essays: EssayMeta[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_KEY = "sad:thisSession";
const PEEL_DELAY_MS = 700;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function IntrusionRoot({ essays }: Props) {
  // ── Phase state ────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>("decoy");
  const [subOverlay, setSubOverlay] = useState<SubOverlay>(null);
  const [handle, setHandle] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [muted, setMuted] = useState(false);

  // ── Initial phase resolution (client-only) ────────────────────────────
  useEffect(() => {
    const profile = loadProfile();
    const thisSession = typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(SESSION_KEY) === "1"
      : false;

    if (profile.intrusions > 0 && thisSession) {
      // Returning user already in this session — skip straight to terminal
      // We need a handle; use saved handle or fallback
      setHandle(profile.handle || "anon");
      setPhase("terminal");
    }
    // else: stay at "decoy" (default)

    // Sync muted state
    setMuted(isMuted());
  }, []);

  // ── ESC on decoy → dismiss ─────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "decoy") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleDismiss = useCallback(() => {
    hum(false);
    setDismissed(true);
  }, []);

  const handleMuteToggle = useCallback(() => {
    const next = toggleMuted();
    setMuted(next);
  }, []);

  // Decoy.onBypass — peel animation + phase transition
  const handleBypass = useCallback(() => {
    initOnGesture();
    setPhase("peeling");
    peel();
    hum(true);

    // Set session flag
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }

    const reduce = typeof window !== "undefined"
      ? matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

    // Add CSS animation classes to the #wall element that Decoy just rendered
    const wallEl = document.getElementById("wall");
    if (wallEl) {
      wallEl.classList.add("peel", "glitch");
    }

    const delay = reduce ? 0 : PEEL_DELAY_MS;
    setTimeout(() => {
      setPhase("operator");
    }, delay);
  }, []);

  // Operator.onEnter
  const handleOperatorEnter = useCallback((h: string) => {
    setHandle(h);
    setPhase("terminal");
  }, []);

  // Terminal.onDecode → open gate
  const handleDecode = useCallback(() => {
    setSubOverlay("gate");
  }, []);

  // VaultGate.onSolved → open vault
  const handleGateSolved = useCallback(() => {
    setSubOverlay("vault");
  }, []);

  // Vault.onClose → back to terminal
  const handleVaultClose = useCallback(() => {
    setSubOverlay(null);
  }, []);

  // Terminal.onExit
  const handleExit = useCallback(() => {
    hum(false);
    setDismissed(true);
  }, []);

  // ── Don't render when dismissed ───────────────────────────────────────
  if (dismissed) return null;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      className="intrusion-root"
      role="dialog"
      aria-modal="true"
      aria-label="Sage After Dark intrusion overlay"
    >
      {/* ── Utility bar ─────────────────────────────────────────────── */}
      <div className="intrusion-bar" aria-label="Overlay controls">
        <button
          className="intrusion-bar-btn"
          type="button"
          onClick={handleMuteToggle}
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
          title={muted ? "Unmute" : "Mute"}
        >
          {muted ? "♪ off" : "♪ on"}
        </button>
        <button
          className="intrusion-bar-btn intrusion-bar-read"
          type="button"
          onClick={handleDismiss}
          aria-label="Skip to site — just read"
        >
          just read →
        </button>
      </div>

      {/* ── Phase layer ─────────────────────────────────────────────── */}
      {/* Keep Decoy mounted during peeling so #wall is still in DOM for the animation */}
      {(phase === "decoy" || phase === "peeling") && (
        <Decoy onBypass={handleBypass} />
      )}

      {phase === "operator" && (
        <Operator onEnter={handleOperatorEnter} />
      )}

      {phase === "terminal" && (
        <Terminal
          essays={essays}
          handle={handle}
          onDecode={handleDecode}
          onExit={handleExit}
        />
      )}

      {/* ── Sub-overlays (rendered on top of terminal) ──────────────── */}
      {subOverlay === "gate" && (
        <div className="intrusion-suboverlay" role="dialog" aria-label="Cipher gate">
          <VaultGate onSolved={handleGateSolved} />
        </div>
      )}

      {subOverlay === "vault" && (
        <Vault onClose={handleVaultClose} />
      )}
    </div>
  );
}
