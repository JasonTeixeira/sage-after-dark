"use client";

/**
 * Diagnostic — small interactive "self-check" at the end of an essay.
 *
 * Three modes, all driven by simple JSON-safe primitives so MDX → RSC
 * serialization can't drop a prop:
 *
 *   <Diagnostic kind="checklist" title="..." items={["a","b"]}
 *               thresholds={[[0,"none"],[3,"some"]]} />
 *
 *   <Diagnostic kind="rating" title="..." question="..."
 *               bands={["1","2","3","4","5"]} />
 *
 *   <Diagnostic kind="prompt" title="..." prompt="..." />
 *
 * Notes:
 *  - thresholds use [number, string] tuples, not objects. Tuples survive
 *    the RSC serialization boundary cleanly; nested objects can sometimes
 *    be omitted depending on MDX compiler settings.
 *  - All array props are guarded with Array.isArray so a missing prop
 *    can never crash the page at hydration.
 */

import { useState } from "react";

type CommonProps = {
  title: string;
};

type ThresholdObj = { count: number; verdict: string };
type ThresholdTuple = [number, string];

type ChecklistProps = CommonProps & {
  kind: "checklist";
  items?: string[];
  /** [count, verdict] tuples — sorted ascending */
  thresholds?: Array<ThresholdTuple>;
  /** legacy: array of {count, verdict} objects — still supported */
  threshold?: Array<ThresholdObj>;
};

type RatingProps = CommonProps & {
  kind: "rating";
  question: string;
  bands?: string[];
};

type PromptProps = CommonProps & {
  kind: "prompt";
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

function Checklist({ items, thresholds, threshold }: ChecklistProps) {
  const safeItems = Array.isArray(items) ? items : [];

  // Accept both new tuple syntax (`thresholds`) and legacy object syntax
  // (`threshold`). Whichever is present and valid wins; both are guarded
  // so a missing or malformed prop can never crash hydration.
  const fromTuples: Array<[number, string]> = Array.isArray(thresholds)
    ? thresholds.filter(
        (t): t is [number, string] =>
          Array.isArray(t) &&
          t.length === 2 &&
          typeof t[0] === "number" &&
          typeof t[1] === "string",
      )
    : [];
  const fromObjects: Array<[number, string]> = Array.isArray(threshold)
    ? threshold
        .filter(
          (t): t is ThresholdObj =>
            !!t &&
            typeof t === "object" &&
            typeof (t as ThresholdObj).count === "number" &&
            typeof (t as ThresholdObj).verdict === "string",
        )
        .map((t) => [t.count, t.verdict] as [number, string])
    : [];
  const safeThresholds: Array<[number, string]> =
    fromTuples.length > 0 ? fromTuples : fromObjects;

  const [checked, setChecked] = useState<boolean[]>(() =>
    safeItems.map(() => false),
  );
  const count = checked.filter(Boolean).length;
  const verdict = [...safeThresholds]
    .sort((a, b) => a[0] - b[0])
    .reduce<string>((acc, [n, v]) => (count >= n ? v : acc), "");

  return (
    <>
      <ul className="space-y-3">
        {safeItems.map((item, i) => (
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
                checked={checked[i] ?? false}
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
          score · {count} / {safeItems.length}
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
  const safeBands: string[] =
    Array.isArray(bands) && bands.length === 5
      ? bands
      : ["", "", "", "", ""];
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
            → {safeBands[value - 1]}
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
