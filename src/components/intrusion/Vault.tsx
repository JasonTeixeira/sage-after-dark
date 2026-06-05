"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { DEEP_CUTS } from "@/content/vault/deep-cuts";
import "./intrusion.css";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

type VaultProps = {
  onClose: () => void;
};

// ---------------------------------------------------------------------------
// Scramble reveal
// ---------------------------------------------------------------------------

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ░▒▓#$%&/";
const SCRAMBLE_FRAMES = 26;
const SCRAMBLE_INTERVAL_MS = 40;
const TARGET_TITLE = "AFTER DARK";

function scrambleReveal(node: HTMLElement): void {
  let frame = 0;
  const id = setInterval(() => {
    node.textContent = TARGET_TITLE.split("").map((ch, i) => {
      if (ch === " ") return " ";
      if (i < (frame / SCRAMBLE_FRAMES) * TARGET_TITLE.length) return ch;
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }).join("");

    if (++frame > SCRAMBLE_FRAMES) {
      clearInterval(id);
      node.textContent = TARGET_TITLE;
    }
  }, SCRAMBLE_INTERVAL_MS);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Vault({ onClose }: VaultProps) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // Run the scramble reveal on mount (skip for reduced-motion)
  useEffect(() => {
    const node = titleRef.current;
    if (!node) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      node.textContent = TARGET_TITLE;
      return;
    }

    // Start from ciphertext-looking gibberish
    node.textContent = TARGET_TITLE.split("").map((ch) =>
      ch === " " ? " " : SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)],
    ).join("");
    scrambleReveal(node);
  }, []);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleItem = useCallback((id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      className="vault-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="After Dark vault"
      onClick={handleBackdropClick}
    >
      <div className="vault-card">
        {/* Decoded status chip */}
        <div className="vault-chip-decoded">
          <i aria-hidden="true" />
          decoded
        </div>

        {/* Scramble-reveal title */}
        <h1 ref={titleRef} className="vault-title" aria-label="After Dark">
          {TARGET_TITLE}
        </h1>

        <p className="vault-sub">
          The deep cuts. Director&#39;s-cut annotations, raw notes, and the
          things said only at this hour.
        </p>

        {/* Deep cuts list */}
        <div className="vault-list">
          {DEEP_CUTS.map((cut) => {
            const isOpen = openId === cut.id;
            return (
              <div
                key={cut.id}
                className={`vault-item${isOpen ? " open" : ""}`}
                onClick={() => toggleItem(cut.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleItem(cut.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isOpen}
                aria-controls={`vault-body-${cut.id}`}
              >
                <div className="vault-item-header">
                  <div className="vault-item-vt">{cut.title}</div>
                  <span
                    className="vault-item-toggle"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </div>

                <div className="vault-item-vd">{cut.dek}</div>

                {isOpen && (
                  <div
                    id={`vault-body-${cut.id}`}
                    className="vault-item-body"
                  >
                    {cut.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Back button */}
        <button
          className="vault-back"
          type="button"
          onClick={onClose}
        >
          ← back to the surface
        </button>
      </div>
    </div>
  );
}
