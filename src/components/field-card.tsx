/**
 * FieldCard — a visually distinct, magazine-style callout for essays.
 *
 * Use for: a sharp definition, a counter-example, a tool, a "field note"
 * that deserves a frame around it. Distinct from MarginNote (small, inline)
 * and Pullquote (a single load-bearing sentence).
 *
 * Variants:
 *   - kind="definition"   → DEF · NOUN
 *   - kind="counter"      → COUNTER · CASE
 *   - kind="tool"         → TOOL · FIELD KIT
 *   - kind="warning"      → WARNING · DON'T
 *   - kind="evidence"     → EVIDENCE · RECEIPT
 */

import { ReactNode } from "react";

type Kind = "definition" | "counter" | "tool" | "warning" | "evidence";

const META: Record<Kind, { tag: string; subtag: string; accent: string }> = {
  definition: { tag: "DEF", subtag: "NOUN", accent: "text-cyan" },
  counter: { tag: "COUNTER", subtag: "CASE", accent: "text-amber-300" },
  tool: { tag: "TOOL", subtag: "FIELD KIT", accent: "text-cyan" },
  warning: { tag: "WARNING", subtag: "DON'T", accent: "text-red-400" },
  evidence: { tag: "EVIDENCE", subtag: "RECEIPT", accent: "text-emerald-300" },
};

type FieldCardProps = {
  kind?: Kind;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function FieldCard({
  kind = "definition",
  title,
  children,
  className,
}: FieldCardProps) {
  const m = META[kind];
  return (
    <aside
      className={[
        "my-8 border border-rule bg-ink-1/70",
        "relative",
        className ?? "",
      ].join(" ")}
      role="complementary"
    >
      {/* Notched corner — visual signature */}
      <div
        aria-hidden
        className="absolute top-0 right-0 w-3 h-3 border-l border-b border-rule bg-ink"
      />
      <div className="px-6 pt-5 pb-6 sm:px-7">
        <div className="flex items-center justify-between mb-3 font-mono text-[10px] uppercase tracking-[0.14em]">
          <span className={m.accent}>
            // {m.tag} · {m.subtag}
          </span>
          {title && (
            <span className="text-faint">{title}</span>
          )}
        </div>
        <div className="text-[15px] leading-[1.7] text-bone/95 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </aside>
  );
}
