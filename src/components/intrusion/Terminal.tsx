"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { pillar } from "@/lib/tokens";
import { loadProfile, forgetProfile, rankOf } from "@/lib/intrusion/progress";
import * as sound from "@/lib/intrusion/sound";
import "./intrusion.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EssayMeta = {
  slug: string;
  title: string;
  pillar: string;
  mins: number;
  dek: string;
};

type TerminalProps = {
  essays: EssayMeta[];
  handle: string;
  onDecode: () => void;
  onExit: () => void;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PILLAR_KEYS = [
  "build",
  "signal",
  "mind",
  "world",
  "taste",
  "learning",
  "teach",
] as const;

const TAB_COMMANDS = [
  "help",
  "ls",
  "open",
  "search",
  "pillars",
  "about",
  "whoami",
  "profile",
  "clear",
  "forget",
  "decode",
  "vault",
  "exit",
];

const CHIP_COMMANDS: { label: string; cmd: string }[] = [
  { label: "help", cmd: "help" },
  { label: "ls", cmd: "ls" },
  { label: "open", cmd: "open " },
  { label: "search", cmd: "search " },
  { label: "pillars", cmd: "pillars" },
  { label: "about", cmd: "about" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] ?? c));
}

function pillarColor(p: string): string {
  return pillar[p as keyof typeof pillar] ?? "#8A8F98";
}

/**
 * Fuzzy-ish title match: exact substring on lowercased slug+title.
 */
function matchEssay(essays: EssayMeta[], query: string): EssayMeta | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;
  return (
    essays.find((e) => e.slug === q || e.title.toLowerCase() === q) ??
    essays.find((e) => e.slug.includes(q) || e.title.toLowerCase().includes(q))
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Terminal({ essays, handle, onDecode, onExit }: TerminalProps) {
  const router = useRouter();
  const screenRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputVal, setInputVal] = useState("");
  const historyRef = useRef<string[]>([]);
  const hposRef = useRef(-1);
  const gestureRef = useRef(false);

  // ── Scroll helper ──────────────────────────────────────────────────────
  const scroll = useCallback(() => {
    const el = screenRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  // ── Transcript DOM helpers ─────────────────────────────────────────────
  const appendNode = useCallback(
    (node: HTMLElement) => {
      const t = transcriptRef.current;
      if (t) t.appendChild(node);
      scroll();
      return node;
    },
    [scroll],
  );

  const makeEl = (tag: string, cls?: string, html?: string): HTMLElement => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  const addHtml = useCallback(
    (cls: string, html: string): HTMLElement => {
      return appendNode(makeEl("div", cls, html));
    },
    [appendNode],
  );

  const echo = useCallback(
    (cmd: string) => {
      addHtml(
        "echo",
        `<span class="pr">${escapeHtml(handle)} $</span> ${escapeHtml(cmd)}`,
      );
    },
    [addHtml, handle],
  );

  // ── Build essay list UL ────────────────────────────────────────────────
  const buildLsUl = useCallback(
    (list: EssayMeta[]): HTMLUListElement => {
      const ul = document.createElement("ul");
      ul.className = "ls";
      list.forEach((e) => {
        const li = document.createElement("li");
        const color = pillarColor(e.pillar);
        li.innerHTML = `<span class="pd" style="background:${color};box-shadow:0 0 9px -1px ${color}"></span><span class="pl">${escapeHtml(e.pillar)}</span><span class="ti">${escapeHtml(e.title)}</span><span class="rt">${e.mins} min</span>`;
        li.addEventListener("click", () => {
          router.push(`/${e.pillar}/${e.slug}`);
        });
        ul.appendChild(li);
      });
      return ul;
    },
    [router],
  );

  // ── Command implementations ────────────────────────────────────────────

  const cmdHelp = useCallback(() => {
    const w = makeEl("div", "out");
    w.innerHTML = `<div class="grp-lbl">what you can do</div>
<dl class="help">
  <dt>ls</dt><dd>list the essays</dd>
  <dt>open <small>&lt;name&gt;</small></dt><dd>read one · navigates to the real page</dd>
  <dt>search <small>&lt;term&gt;</small></dt><dd>find a thread through the work</dd>
  <dt>pillars</dt><dd>the seven veins of the work</dd>
  <dt>about</dt><dd>who's writing, and why</dd>
  <dt>profile</dt><dd>your session stats</dd>
  <dt>clear</dt><dd>wipe the screen</dd>
</dl>
<p class="more" style="margin-top:12px">some commands aren't on this list. the curious find them.</p>`;
    appendNode(w);
  }, [appendNode]);

  const cmdLs = useCallback(
    (arg: string) => {
      const list = arg ? essays.filter((e) => e.pillar === arg) : essays;
      const out = makeEl("div", "out");
      const ul = buildLsUl(list);
      out.appendChild(ul);
      if (!arg) {
        const more = makeEl(
          "p",
          "more",
          `showing ${list.length} essays · <code>pillars</code> to filter · click any line to read.`,
        );
        out.appendChild(more);
      }
      appendNode(out);
    },
    [essays, buildLsUl, appendNode],
  );

  const cmdSearch = useCallback(
    (term: string) => {
      if (!term.trim()) {
        addHtml(
          "out ai",
          `<span class="ai">search for what? try <code>search rollback</code>.</span>`,
        );
        return;
      }
      const q = term.toLowerCase();
      const hits = essays.filter((e) =>
        (e.title + " " + e.dek).toLowerCase().includes(q),
      );
      addHtml(
        "out ai",
        `<span class="ai">${hits.length} thread${hits.length === 1 ? "" : "s"} matching <b>${escapeHtml(term)}</b>:</span>`,
      );
      if (hits.length > 0) {
        const out = makeEl("div", "out");
        out.appendChild(buildLsUl(hits));
        appendNode(out);
      }
    },
    [essays, buildLsUl, addHtml, appendNode],
  );

  const cmdPillars = useCallback(() => {
    const out = makeEl("div", "out");
    out.innerHTML = `<div class="grp-lbl">the seven veins</div>`;
    const row = makeEl("div", "pillrow");
    PILLAR_KEYS.forEach((p) => {
      const color = pillarColor(p);
      const tag = makeEl("span", "pilltag", p);
      tag.style.color = color;
      tag.style.borderColor = color;
      tag.addEventListener("click", () => {
        echo(`ls ${p}`);
        cmdLs(p);
      });
      row.appendChild(tag);
    });
    out.appendChild(row);
    appendNode(out);
  }, [appendNode, echo, cmdLs]);

  const cmdAbout = useCallback(() => {
    addHtml(
      "out ai",
      `<span class="ai">I'm the front door to <b>Sage After Dark</b> — Jason Teixeira's notebook on software, taste, and the slow internet. One person, writing the work down as it happens. No tracking theater, no popups, no paywall. Just the work — and a little something hidden for people who like to look. <span style="color:var(--faint)">(hint: <code>decode</code>)</span></span>`,
    );
  }, [addHtml]);

  const cmdProfile = useCallback(() => {
    // loadProfile is called in an event handler, so localStorage is safe here
    const p = loadProfile();
    const intrusions = p.intrusions;
    const rank = rankOf(intrusions);
    addHtml(
      "out ai",
      `<span class="ai">handle: <b>${escapeHtml(handle)}</b> · intrusions: <b>${intrusions}</b> · rank: <b>${rank}</b></span>`,
    );
  }, [addHtml, handle]);

  // ── run ───────────────────────────────────────────────────────────────

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim();
      if (!cmd) return;

      echo(cmd);
      historyRef.current.unshift(cmd);
      hposRef.current = -1;

      const [name, ...rest] = cmd.split(/\s+/);
      const arg = rest.join(" ");

      switch (name.toLowerCase()) {
        case "help":
        case "?":
          cmdHelp();
          break;

        case "ls":
          cmdLs(arg);
          break;

        case "open":
        case "read": {
          if (!arg.trim()) {
            addHtml(
              "out ai",
              `<span class="ai">open what? try <code>open taste-is-the-last-moat</code>.</span>`,
            );
            break;
          }
          const match = matchEssay(essays, arg);
          if (match) {
            addHtml(
              "out ai",
              `<span class="ai">navigating to <b>${escapeHtml(match.title)}</b>…</span>`,
            );
            router.push(`/${match.pillar}/${match.slug}`);
          } else {
            addHtml(
              "out ai",
              `<span class="ai">no essay matching <b>${escapeHtml(arg)}</b>. try <code>ls</code> to see what's here.</span>`,
            );
          }
          break;
        }

        case "search":
          cmdSearch(arg);
          break;

        case "pillars":
          cmdPillars();
          break;

        case "about":
        case "whoami":
          cmdAbout();
          break;

        case "profile":
          cmdProfile();
          break;

        case "clear": {
          const t = transcriptRef.current;
          if (t) t.innerHTML = "";
          break;
        }

        case "forget":
          forgetProfile();
          addHtml(
            "out ai",
            `<span class="ai">profile wiped. you're a ghost again.</span>`,
          );
          break;

        case "exit":
          onExit();
          break;

        case "decode":
        case "vault":
          onDecode();
          break;

        case "sudo":
          addHtml(
            "out ai",
            `<span class="ai">nice try. there's no root here — only the work, and what's hidden behind it. try <code>decode</code>.</span>`,
          );
          break;

        default:
          addHtml(
            "out ai",
            `<span class="ai">unknown command <b>${escapeHtml(name)}</b>. type <code>help</code>. <span style="color:var(--faint)">…not everything announces itself.</span></span>`,
          );
      }
    },
    [
      echo,
      cmdHelp,
      cmdLs,
      cmdSearch,
      cmdPillars,
      cmdAbout,
      cmdProfile,
      addHtml,
      essays,
      router,
      onDecode,
      onExit,
    ],
  );

  // ── Greet on mount ─────────────────────────────────────────────────────
  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const t = transcriptRef.current;
    if (!t) return;

    const greet = makeEl(
      "div",
      "boot-greet",
      `<div class="mark">Sage // After Dark</div>
<p class="lede">The after-hours notebook of a one-person studio.<br><span class="dim">Software, taste, and the slow internet — written down as it happens.</span></p>
<p class="sys">// session active · ${essays.length} essays indexed</p>
<p class="greet">I'm listening, <b>${escapeHtml(handle)}</b>. Type <code>help</code> to begin. <b>Some things here are hidden.</b></p>`,
    );
    t.appendChild(greet);
    scroll();

    inputRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keyboard handler ───────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Init audio on first keystroke
    if (!gestureRef.current) {
      gestureRef.current = true;
      sound.initOnGesture();
    }
    sound.key();

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = historyRef.current;
      if (hposRef.current < h.length - 1) {
        hposRef.current += 1;
        setInputVal(h[hposRef.current] ?? "");
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hposRef.current > 0) {
        hposRef.current -= 1;
        setInputVal(historyRef.current[hposRef.current] ?? "");
      } else {
        hposRef.current = -1;
        setInputVal("");
      }
      return;
    }

    if (e.key === "Escape") {
      const t = transcriptRef.current;
      if (t) t.innerHTML = "";
      setInputVal("");
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const partial = inputVal.trim().toLowerCase();
      const match = TAB_COMMANDS.find((c) => c.startsWith(partial) && c !== partial);
      if (match) {
        const needsSpace = match === "open" || match === "search";
        setInputVal(needsSpace ? match + " " : match);
      }
      return;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputVal;
    setInputVal("");
    run(val);
  };

  // ── Click on screen focuses input unless interactive target ───────────
  const handleScreenClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest("a,button,input,.ls li,.pilltag")) {
      inputRef.current?.focus();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      id="screen"
      ref={screenRef}
      tabIndex={-1}
      aria-label="Sage After Dark terminal"
      onClick={handleScreenClick}
    >
      {/* Chip rail */}
      <div className="term-rail">
        <span className="lbl">quick</span>
        {CHIP_COMMANDS.map(({ label, cmd }) => (
          <button
            key={label}
            className="chip"
            type="button"
            onClick={() => {
              if (cmd.endsWith(" ")) {
                // Partial command — put in input for completion
                setInputVal(cmd);
                inputRef.current?.focus();
              } else {
                run(cmd);
                inputRef.current?.focus();
              }
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transcript */}
      <div
        id="transcript"
        ref={transcriptRef}
        aria-live="polite"
        aria-atomic="false"
      />

      {/* Prompt */}
      <form id="promptform" onSubmit={handleSubmit}>
        <span className="pr" aria-hidden="true">
          {handle} $
        </span>
        <input
          id="cmd"
          ref={inputRef}
          type="text"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-label="Command input"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="caret" aria-hidden="true" />
        <span className="live-region" aria-live="assertive" />
      </form>
    </div>
  );
}
