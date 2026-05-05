"use client";

/**
 * TerminalPalette — Cipher Layer 4.
 *
 * Opens on the Konami code (↑↑↓↓←→←→ b a) OR by pressing `?` then `t`.
 * A real interactive terminal with a small command vocabulary:
 *
 *   help        — list commands
 *   whoami      — narrative bio of the operator
 *   now         — what's being written now (reads studio-state)
 *   arc         — list active arcs and progress
 *   arc <slug>  — details for a specific arc
 *   decrypt <shift> <ciphertext>
 *               — Caesar-decrypt arbitrary input (lowercased)
 *   cipher      — show this month's live cipher
 *   numbers     — link to /numbers
 *   dispatch    — show the secret email channel
 *   clear       — clear the screen
 *   exit / esc  — close
 *
 * Reduced-motion friendly. No network calls — all state is local + props.
 */

import { useEffect, useRef, useState } from "react";
import { decryptCaesar, MONTHLY_SHIFTS } from "@/lib/cipher";

const KONAMI = [
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

type Line = { kind: "in" | "out" | "ok" | "err" | "ascii"; text: string };

const BANNER = `
  ____             _      ___           _
 / ___|  __ _  __ _ ___  |_ _|___  ___ | |_
 \\___ \\ / _\` |/ _\` / -_)  | |/ _ \\/ -_)| ' \\
  ___) | (_| | (_| \\___|   |_\\___/\\___||_||_|
 |____/ \\__,_|\\__, |       T E R M I N A L
              |___/        channel 0xFA · year 001
`.trim();

const HELP_TEXT = [
  "AVAILABLE COMMANDS",
  "  help                       this message",
  "  whoami                     operator bio",
  "  now                        what's being written now",
  "  arc                        list active arcs",
  "  arc <slug>                 details for an arc",
  "  decrypt <shift> <text>     caesar-decrypt arbitrary input",
  "  cipher                     show this month's live cipher",
  "  numbers                    open /numbers",
  "  dispatch                   secret email channel",
  "  clear                      clear screen",
  "  exit                       close terminal",
].join("\n");

const WHOAMI = [
  "operator   :: jason teixeira",
  "studio     :: sage ideas (year 001)",
  "publishing :: sage after dark — long-form, in public",
  "doctrine   :: small numbers, real artifacts, no growth hacks",
  "mission    :: turn one operator into a studio of one",
].join("\n");

const ARC_INDEX = [
  "ARC_001  trayd-in-public      03 / 12  episodes  (LIVE)",
  "ARC_002  becoming-a-studio    01 / 08  episodes  (slow burn)",
  "ARC_003  the-reading-list     04 / 12  episodes  (monthly)",
  "",
  "▸ try: arc trayd-in-public",
].join("\n");

const ARC_DETAILS: Record<string, string> = {
  "trayd-in-public": [
    "ARC_001 :: trayd, in public",
    "  cadence  :: weekly · fridays",
    "  format   :: long-form + primary docs",
    "  pillar   :: build",
    "  status   :: 03 / 12 episodes published, ep 04 drafting",
    "  url      :: /arcs/trayd-in-public",
  ].join("\n"),
  "becoming-a-studio": [
    "ARC_002 :: becoming a studio",
    "  cadence  :: biweekly",
    "  format   :: essay + ledger",
    "  pillar   :: world",
    "  status   :: 01 / 08 episodes",
    "  url      :: /arcs/becoming-a-studio",
  ].join("\n"),
  "the-reading-list": [
    "ARC_003 :: the reading list",
    "  cadence  :: monthly",
    "  format   :: essay + margin notes",
    "  pillar   :: mind",
    "  status   :: 04 / 12 episodes",
    "  url      :: /arcs/the-reading-list",
  ].join("\n"),
};

function thisMonthCipher(): string {
  const m = new Date().getUTCMonth(); // 0=Jan
  const shift = MONTHLY_SHIFTS[m] ?? 5;
  return [
    `▸ live cipher · month ${String(m + 1).padStart(2, "0")} · shift = ${shift}`,
    "",
    "  YMJ FSXBJW BFX FQBFDX UTXYLWJX",
    "",
    "▸ try: decrypt 5 YMJ FSXBJW BFX FQBFDX UTXYLWJX",
    "▸ solving the live cipher unlocks bonus material on the latest field note.",
  ].join("\n");
}

const DISPATCH = [
  "▸ secret channel",
  "  email   :: sage@sageideas.org",
  "  subject :: konami",
  "  payload :: i'll send back a draft, a tool, or a half-finished",
  "             idea worth finishing together.",
].join("\n");

export function TerminalPalette() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState<number>(-1);
  const buf = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Konami listener
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) return;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buf.current.push(key);
      if (buf.current.length > KONAMI.length) buf.current.shift();
      if (
        buf.current.length === KONAMI.length &&
        buf.current.every((k, i) => k === KONAMI[i])
      ) {
        e.preventDefault();
        buf.current = [];
        openTerminal();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // ESC closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // autofocus + autoscroll
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  function openTerminal() {
    setOpen(true);
    setLines([
      { kind: "ascii", text: BANNER },
      { kind: "out", text: "you found the back door. type `help` for commands." },
    ]);
  }

  function pushOut(text: string, kind: Line["kind"] = "out") {
    setLines((l) => [...l, { kind, text }]);
  }

  function run(raw: string) {
    const cmd = raw.trim();
    setLines((l) => [...l, { kind: "in", text: `▸ ${cmd}` }]);
    if (!cmd) return;

    const [verb, ...rest] = cmd.split(/\s+/);
    const arg = rest.join(" ");

    switch (verb.toLowerCase()) {
      case "help":
      case "?":
        pushOut(HELP_TEXT, "out");
        break;
      case "whoami":
        pushOut(WHOAMI, "ok");
        break;
      case "now":
        pushOut(
          [
            "▸ writing now",
            "  status :: DRAFTING",
            "  text   :: Trayd, Episode 04 — the week the calls came in.",
            "  arc    :: /arcs/trayd-in-public",
          ].join("\n"),
          "ok",
        );
        break;
      case "arc":
        if (!arg) {
          pushOut(ARC_INDEX, "out");
        } else if (ARC_DETAILS[arg]) {
          pushOut(ARC_DETAILS[arg], "ok");
        } else {
          pushOut(`unknown arc: ${arg}\ntry: trayd-in-public, becoming-a-studio, the-reading-list`, "err");
        }
        break;
      case "decrypt": {
        const m = arg.match(/^(\d+)\s+(.+)$/);
        if (!m) {
          pushOut("usage: decrypt <shift> <ciphertext>", "err");
          break;
        }
        const shift = parseInt(m[1], 10);
        const text = m[2];
        const out = decryptCaesar(text, shift);
        pushOut(`▸ shift ${shift}\n  ${text}\n  ${out}`, "ok");
        break;
      }
      case "cipher":
        pushOut(thisMonthCipher(), "out");
        break;
      case "numbers":
        pushOut("opening /numbers …", "ok");
        setTimeout(() => {
          window.location.href = "/numbers";
        }, 250);
        break;
      case "dispatch":
        pushOut(DISPATCH, "ok");
        break;
      case "clear":
      case "cls":
        setLines([]);
        break;
      case "exit":
      case "quit":
        setOpen(false);
        break;
      default:
        pushOut(`unknown command: ${verb}\ntry \`help\``, "err");
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      const v = input;
      if (v.trim()) {
        setHistory((h) => [...h, v]);
        setHistIdx(-1);
      }
      setInput("");
      run(v);
    } else if (e.key === "ArrowUp") {
      if (history.length === 0) return;
      e.preventDefault();
      const next = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(next);
      setInput(history[next] ?? "");
    } else if (e.key === "ArrowDown") {
      if (history.length === 0 || histIdx < 0) return;
      e.preventDefault();
      const next = histIdx + 1;
      if (next >= history.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(next);
        setInput(history[next]);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hidden terminal"
      className="fixed inset-0 z-[100] bg-ink-0/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-3xl border border-cyan/40 bg-ink-1 font-mono text-sm leading-relaxed text-bone shadow-[0_0_60px_rgba(0,229,255,0.15)]">
        <span className="absolute -top-px -left-px w-3 h-3 border-t border-l border-cyan" />
        <span className="absolute -top-px -right-px w-3 h-3 border-t border-r border-cyan" />
        <span className="absolute -bottom-px -left-px w-3 h-3 border-b border-l border-cyan" />
        <span className="absolute -bottom-px -right-px w-3 h-3 border-b border-r border-cyan" />

        <header className="flex items-center justify-between px-4 py-2 border-b border-cyan/30 text-cyan text-[10px] uppercase tracking-[0.14em]">
          <span>▸ TERMINAL · CHANNEL 0xFA · DECRYPTED</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-mute hover:text-cyan"
            aria-label="Close terminal"
          >
            [ esc ]
          </button>
        </header>

        <div
          ref={scrollRef}
          className="h-[60vh] sm:h-[70vh] overflow-y-auto p-4 space-y-1 text-[12px] sm:text-sm cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((ln, i) => (
            <pre
              key={i}
              className={`whitespace-pre-wrap break-words ${
                ln.kind === "in"
                  ? "text-cyan"
                  : ln.kind === "ok"
                    ? "text-emerald-300/90"
                    : ln.kind === "err"
                      ? "text-rose-300/90"
                      : ln.kind === "ascii"
                        ? "text-cyan/70 text-[10px] leading-tight"
                        : "text-bone/85"
              }`}
            >
              {ln.text}
            </pre>
          ))}

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-cyan select-none">▸</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              className="flex-1 bg-transparent outline-none border-0 text-bone caret-cyan font-mono text-[12px] sm:text-sm"
              aria-label="Terminal input"
            />
          </div>
        </div>

        <footer className="px-4 py-1.5 border-t border-cyan/30 font-mono text-[10px] uppercase tracking-[0.14em] text-mute flex items-center justify-between">
          <span>
            type <span className="text-cyan">help</span> · history{" "}
            <span className="text-cyan">↑/↓</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan animate-pulse" />
            CONNECTED
          </span>
        </footer>
      </div>
    </div>
  );
}
