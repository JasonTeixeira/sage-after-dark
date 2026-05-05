"use client";

/**
 * <Cipher> — a span that renders scrambled glyphs at first, then
 * decrypts itself character-by-character when it scrolls into the
 * viewport. Used inline in MDX:
 *
 *   <Cipher>the redacted phrase</Cipher>
 *
 * Respects prefers-reduced-motion (renders plain text immediately).
 */

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SCRAMBLE_GLYPHS = "█▓▒░╳┐ʇuǝɯƃɐɹɟ▮▯▰▱◧◨◩◪⌬";

function scramble(s: string): string {
  return [...s]
    .map((ch) =>
      ch === " "
        ? " "
        : SCRAMBLE_GLYPHS[Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)],
    )
    .join("");
}

export function Cipher({
  children,
  className,
  duration = 900,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
}) {
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.join("")
        : String(children ?? "");
  const [display, setDisplay] = useState<string>(() => scramble(text));
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplay(text);
      setDone(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let rafId = 0;
    let frame = 0;
    const totalFrames = Math.max(8, Math.round(duration / 40));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !done) {
            const tick = () => {
              frame += 1;
              const ratio = Math.min(1, frame / totalFrames);
              const lockChars = Math.floor(ratio * text.length);
              const out = [...text]
                .map((ch, i) => {
                  if (i < lockChars || ch === " ") return ch;
                  return SCRAMBLE_GLYPHS[
                    Math.floor(Math.random() * SCRAMBLE_GLYPHS.length)
                  ];
                })
                .join("");
              setDisplay(out);
              if (frame < totalFrames) {
                rafId = requestAnimationFrame(tick);
              } else {
                setDisplay(text);
                setDone(true);
              }
            };
            rafId = requestAnimationFrame(tick);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [text, duration, done]);

  return (
    <span
      ref={ref}
      className={`font-mono text-cyan ${className ?? ""}`}
      data-cipher
      data-decoded={done ? "true" : "false"}
      aria-label={text}
      style={{
        // Always render with a faintly-glowing cyan to telegraph "this is special"
        textShadow: done ? "none" : "0 0 6px rgba(0,229,255,0.35)",
      }}
    >
      {display}
    </span>
  );
}

/**
 * <Redacted> — a span shown as a black bar; hover (or tap on mobile)
 * peels back to reveal the real text. Used for "the number was ████".
 *
 *   <Redacted reveal="$48,210">$48,210</Redacted>
 *   <Redacted>the client name</Redacted>  // fully redacted, no peek
 */
export function Redacted({
  children,
  reveal,
  permanent = false,
  className,
}: {
  children: ReactNode;
  reveal?: ReactNode;
  permanent?: boolean;
  className?: string;
}) {
  const [shown, setShown] = useState(false);
  const text =
    typeof children === "string"
      ? children
      : Array.isArray(children)
        ? children.join("")
        : String(children ?? "");
  const visible = shown && !permanent;
  return (
    <span
      className={`relative inline-block align-baseline cursor-pointer select-none ${className ?? ""}`}
      onMouseEnter={() => !permanent && setShown(true)}
      onMouseLeave={() => !permanent && setShown(false)}
      onTouchStart={() => !permanent && setShown((s) => !s)}
      onClick={() => !permanent && setShown((s) => !s)}
      role={permanent ? undefined : "button"}
      aria-label={
        permanent
          ? "redacted"
          : visible
            ? "click to redact"
            : "tap to reveal"
      }
      data-redacted
      data-revealed={visible ? "true" : "false"}
    >
      <span
        aria-hidden={!visible}
        className="font-mono"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 200ms ease-out",
          color: "var(--color-cyan)",
        }}
      >
        {reveal ?? text}
      </span>
      <span
        aria-hidden={visible}
        className="absolute inset-0 font-mono"
        style={{
          background:
            "repeating-linear-gradient(90deg, #0A0E14 0 6px, #1C232E 6px 8px)",
          color: "transparent",
          opacity: visible ? 0 : 1,
          transition: "opacity 200ms ease-out",
          letterSpacing: "0.02em",
        }}
      >
        {text}
      </span>
    </span>
  );
}
