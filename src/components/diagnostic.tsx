"use client";

/**
 * Diagnostic — a small interactive "self-check" that lives at the end
 * of an essay. Three modes:
 *
 *   - kind="checklist"  → checkboxes with a running tally
 *   - kind="rating"     → 1–5 self-rating with a label band
 *   - kind="prompt"     → one prompt + a textarea (local-only, no submit)
 *
 * Designed to be intellectually generous: no leads, no email capture,
 * no analytics on input. Just a small ritual for the reader.
 */

import { useState } from "react";

type Item = string;

type ChecklistProps = {
  kind: "checklist";
  title: string;
  items: Item[];
  threshold?: { count: number; verdict: string }[]; // sorted ascending
};

type RatingProps = {
  kind: "rating";
  title: string;
  question: string;
  bands: [string, string, string, string, string]; // 1..5
};

type PromptProps = {
  kind: "prompt";
  title: string;
  prompt: string;
  placeholder?: string;
};

type Props = ChecklistProps | RatingProps | PromptProps;

export function Diagnostic(props: Props) {
  return (
    <section
      className="my-12 border border-rule bg-ink-1/50"
      aria-label={`Diagnostic: ${props.title}`}
    >
      <header className="border-b border-rule px-6 py-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
        <span className="text-cyan">// DIAGNOSTIC</span>
        <span className="text-faint">{props.title}</span>
      </header>
      <div className="px-6 py-6 sm:px-7">
        {props.kind === "checklist" && <Checklist {...props} />}
        {props.kind === "rating" && <Rating {...props} />}
        {props.kind === "prompt" && <Prompt {...props} />}
      </div>
    </section>
  );
}

/* ──────────────── Checklist ──────────────── */

function Checklist({ items, threshold }: ChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(
    () => items.map(() => false),
  );
  const count = checked.filter(Boolean).length;
  const verdict = threshold
    ? [...threshold]
        .sort((a, b) => a.count - b.count)
        .reduce<string>((acc, t) => (count >= t.count ? t.verdict : acc), "")
    : "";

  return (
    <>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex items-start gap-3 cursor-pointer group">
              <span
                className={[
                  "mt-1 flex-shrink-0 w-4 h-4 border border-rule",
                  "flex items-center justify-center font-mono text-[10px]",
                  "group-hover:border-cyan transition-colors",
                  checked[i] ? "bg-cyan text-ink border-cyan" : "bg-ink",
                ].join(" ")}
                aria-hidden
              >
                {checked[i] ? "✓" : ""}
              </span>
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={(e) => {
                  const next = [...checked];
                  next[i] = e.target.checked;
                  setChecked(next);
                }}
                className="sr-only"
              />
              <span className="text-[15px] leading-relaxed text-bone/90">
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="mt-6 pt-4 border-t border-rule flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-mute">
          score · {count} / {items.length}
        </span>
        {verdict && (
          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-cyan">
            → {verdict}
          </span>
        )}
      </div>
    </>
  );
}

/* ──────────────── Rating ──────────────── */

function Rating({ question, bands }: RatingProps) {
  const [value, setValue] = useState<number | null>(null);
  return (
    <>
      <p className="text-[15px] leading-relaxed text-bone/90 mb-5">
        {question}
      </p>
      <div className="flex gap-2 mb-5" role="radiogroup" aria-label={question}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            onClick={() => setValue(n)}
            className={[
              "flex-1 h-12 border font-mono text-sm transition-colors",
              value === n
                ? "border-cyan bg-cyan/10 text-cyan"
                : "border-rule text-bone/70 hover:border-cyan/50 hover:text-bone",
            ].join(" ")}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="min-h-[2rem]">
        {value !== null && (
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-cyan">
            → {bands[value - 1]}
          </p>
        )}
      </div>
    </>
  );
}

/* ──────────────── Prompt ──────────────── */

function Prompt({ prompt, placeholder }: PromptProps) {
  const [text, setText] = useState("");
  return (
    <>
      <p className="text-[15px] leading-relaxed text-bone/90 mb-4">{prompt}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder ?? "Write here. Nothing leaves your browser."}
        rows={4}
        className={[
          "w-full bg-ink border border-rule p-4",
          "text-[15px] leading-relaxed text-bone/90",
          "placeholder:text-faint",
          "focus:outline-none focus:border-cyan",
          "resize-y",
        ].join(" ")}
      />
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-faint">
        local-only · {text.length} chars · stays on your machine
      </p>
    </>
  );
}
