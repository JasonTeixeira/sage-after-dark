/**
 * Diagrams — original SVG diagrams for anchor essays.
 *
 * Hand-built, brand-correct, no third-party assets. Each diagram is a
 * standalone React component that takes optional caption + className.
 *
 * Aesthetic: tactical/technical drawing. Cyan accent, rule-thickness lines,
 * mono labels. Matches the editorial system already in use.
 */

import { ReactNode } from "react";

type DiagramProps = {
  caption?: ReactNode;
  className?: string;
};

function Frame({
  children,
  caption,
  className,
  number,
  title,
}: DiagramProps & {
  children: ReactNode;
  number: string;
  title: string;
}) {
  return (
    <figure
      className={`my-12 -mx-4 sm:mx-0 ${className ?? ""}`}
      role="img"
      aria-label={typeof caption === "string" ? caption : title}
    >
      <div className="border border-rule bg-ink-1/60 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
          <span>FIG · {number}</span>
          <span className="text-cyan">{title}</span>
        </div>
        <div className="w-full overflow-x-auto">{children}</div>
      </div>
      {caption && (
        <figcaption className="mt-3 text-xs text-mute font-mono uppercase tracking-[0.08em] text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ─── DIAGRAM 1: TASTE GATE ───────────────────────────────────────── */

export function DiagramTasteGate({ caption, className }: DiagramProps) {
  return (
    <Frame
      number="01"
      title="THE TASTE GATE"
      caption={caption ?? "ship → gate → either pass or revise. The gate is named, written down, and pre-decided."}
      className={className}
    >
      <svg
        viewBox="0 0 720 280"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <marker id="arrow-taste" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#00E5FF" />
          </marker>
        </defs>
        {/* nodes */}
        <g fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {/* Build */}
          <rect x="20" y="100" width="120" height="80" fill="#0A0E14" stroke="#2A3340" strokeWidth="1.5" />
          <text x="80" y="135" fill="#E8E6E0" fontSize="14" textAnchor="middle">BUILD</text>
          <text x="80" y="155" fill="#8A8F98" fontSize="10" textAnchor="middle">code complete</text>

          {/* Gate (diamond) */}
          <polygon points="320,140 380,80 440,140 380,200" fill="#0A0E14" stroke="#00E5FF" strokeWidth="2" />
          <text x="380" y="135" fill="#00E5FF" fontSize="13" textAnchor="middle" fontWeight="600">TASTE GATE</text>
          <text x="380" y="152" fill="#8A8F98" fontSize="10" textAnchor="middle">named criteria</text>
          <text x="380" y="166" fill="#8A8F98" fontSize="10" textAnchor="middle">pre-decided</text>

          {/* Ship */}
          <rect x="580" y="40" width="120" height="80" fill="#0A0E14" stroke="#34D399" strokeWidth="1.5" />
          <text x="640" y="75" fill="#34D399" fontSize="14" textAnchor="middle">SHIP</text>
          <text x="640" y="95" fill="#8A8F98" fontSize="10" textAnchor="middle">PASS</text>

          {/* Revise */}
          <rect x="580" y="160" width="120" height="80" fill="#0A0E14" stroke="#F59E0B" strokeWidth="1.5" />
          <text x="640" y="195" fill="#F59E0B" fontSize="14" textAnchor="middle">REVISE</text>
          <text x="640" y="215" fill="#8A8F98" fontSize="10" textAnchor="middle">FAIL · loop back</text>

          {/* Arrows */}
          <line x1="140" y1="140" x2="318" y2="140" stroke="#00E5FF" strokeWidth="1.5" markerEnd="url(#arrow-taste)" />
          <line x1="442" y1="120" x2="578" y2="80" stroke="#34D399" strokeWidth="1.5" markerEnd="url(#arrow-taste)" />
          <line x1="442" y1="160" x2="578" y2="200" stroke="#F59E0B" strokeWidth="1.5" markerEnd="url(#arrow-taste)" />

          {/* Loop-back arrow Revise → Build */}
          <path
            d="M 580 220 Q 360 270 80 200"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            markerEnd="url(#arrow-taste)"
          />
          <text x="340" y="262" fill="#F59E0B" fontSize="10" fontFamily="ui-monospace, Menlo" textAnchor="middle">named diff. fast loop. no feelings.</text>
        </g>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM 2: LEARNING-BY-SHIPPING LOOP ────────────────────────── */

export function DiagramLearningLoop({ caption, className }: DiagramProps) {
  return (
    <Frame
      number="02"
      title="THE LEARNING LOOP"
      caption={caption ?? "ship · observe · revise — the loop length is the learning rate. Tutorials are an inferior substitute."}
      className={className}
    >
      <svg viewBox="0 0 720 320" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <marker id="arrow-learn" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#A3E635" />
          </marker>
        </defs>
        <g fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {/* central title */}
          <text x="360" y="170" fill="#A3E635" fontSize="13" textAnchor="middle" fontWeight="600">LEARNING RATE</text>
          <text x="360" y="190" fill="#8A8F98" fontSize="10" textAnchor="middle">= 1 / loop length</text>

          {/* Three nodes around */}
          {/* SHIP top */}
          <circle cx="360" cy="60" r="44" fill="#0A0E14" stroke="#A3E635" strokeWidth="2" />
          <text x="360" y="56" fill="#A3E635" fontSize="13" textAnchor="middle" fontWeight="600">SHIP</text>
          <text x="360" y="74" fill="#8A8F98" fontSize="9" textAnchor="middle">smallest thing</text>

          {/* OBSERVE bottom-right */}
          <circle cx="580" cy="240" r="44" fill="#0A0E14" stroke="#A3E635" strokeWidth="2" />
          <text x="580" y="236" fill="#A3E635" fontSize="13" textAnchor="middle" fontWeight="600">OBSERVE</text>
          <text x="580" y="254" fill="#8A8F98" fontSize="9" textAnchor="middle">real users</text>

          {/* REVISE bottom-left */}
          <circle cx="140" cy="240" r="44" fill="#0A0E14" stroke="#A3E635" strokeWidth="2" />
          <text x="140" y="236" fill="#A3E635" fontSize="13" textAnchor="middle" fontWeight="600">REVISE</text>
          <text x="140" y="254" fill="#8A8F98" fontSize="9" textAnchor="middle">based on data</text>

          {/* Curved arrows ship → observe → revise → ship */}
          <path d="M 400 92 Q 540 130 560 200" fill="none" stroke="#A3E635" strokeWidth="1.6" markerEnd="url(#arrow-learn)" />
          <path d="M 540 252 Q 360 290 180 252" fill="none" stroke="#A3E635" strokeWidth="1.6" markerEnd="url(#arrow-learn)" />
          <path d="M 160 200 Q 180 130 320 92" fill="none" stroke="#A3E635" strokeWidth="1.6" markerEnd="url(#arrow-learn)" />

          {/* Anti-pattern footer */}
          <line x1="40" y1="300" x2="680" y2="300" stroke="#1C232E" strokeWidth="1" strokeDasharray="2 3" />
          <text x="40" y="316" fill="#8A8F98" fontSize="10">// anti-pattern: read 5 tutorials → never ship → never observe → never learn</text>
        </g>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM 3: HALF-LIFE OF A TOOL ──────────────────────────────── */

export function DiagramHalfLife({ caption, className }: DiagramProps) {
  return (
    <Frame
      number="03"
      title="HALF-LIFE OF A GOOD TOOL"
      caption={caption ?? "value over time decays — the gap between 'works for us' and 'fights us' opens silently."}
      className={className}
    >
      <svg viewBox="0 0 720 320" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="decay-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#34D399" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#F472B6" />
          </linearGradient>
        </defs>
        <g fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {/* axes */}
          <line x1="60" y1="40" x2="60" y2="260" stroke="#2A3340" strokeWidth="1" />
          <line x1="60" y1="260" x2="680" y2="260" stroke="#2A3340" strokeWidth="1" />
          <text x="50" y="50" fill="#8A8F98" fontSize="10" textAnchor="end">VALUE</text>
          <text x="680" y="278" fill="#8A8F98" fontSize="10" textAnchor="end">TIME →</text>

          {/* gridlines */}
          <line x1="60" y1="80" x2="680" y2="80" stroke="#1C232E" strokeWidth="1" strokeDasharray="2 4" />
          <line x1="60" y1="170" x2="680" y2="170" stroke="#1C232E" strokeWidth="1" strokeDasharray="2 4" />

          {/* Decay curve */}
          <path
            d="M 60 60 Q 200 80 360 130 Q 520 200 680 240"
            fill="none"
            stroke="url(#decay-grad)"
            strokeWidth="2.5"
          />

          {/* Phase markers */}
          <g>
            <circle cx="120" cy="72" r="4" fill="#34D399" />
            <text x="120" y="56" fill="#34D399" fontSize="11" textAnchor="middle">YEAR 1</text>
            <text x="120" y="44" fill="#8A8F98" fontSize="9" textAnchor="middle">honeymoon</text>

            <circle cx="360" cy="130" r="4" fill="#F59E0B" />
            <text x="360" y="114" fill="#F59E0B" fontSize="11" textAnchor="middle">YEAR 2</text>
            <text x="360" y="102" fill="#8A8F98" fontSize="9" textAnchor="middle">workarounds accumulate</text>

            <circle cx="600" cy="225" r="4" fill="#F472B6" />
            <text x="600" y="210" fill="#F472B6" fontSize="11" textAnchor="middle">YEAR 3+</text>
            <text x="600" y="198" fill="#8A8F98" fontSize="9" textAnchor="middle">it fights you</text>
          </g>

          {/* Decision band */}
          <line x1="60" y1="170" x2="680" y2="170" stroke="#00E5FF" strokeWidth="1" strokeDasharray="6 4" />
          <text x="68" y="166" fill="#00E5FF" fontSize="10">— decision threshold: when is the next adoption cheaper than the next workaround? —</text>
        </g>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM 4: THE SYSTEM ───────────────────────────────────────── */

export function DiagramSystem({ caption, className }: DiagramProps) {
  return (
    <Frame
      number="04"
      title="THE SYSTEM I ACTUALLY USE"
      caption={caption ?? "five surfaces, one inbox. Daily inputs flow left to right, weekly reviews loop top to bottom."}
      className={className}
    >
      <svg viewBox="0 0 720 320" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <marker id="arrow-sys" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#EAB308" />
          </marker>
        </defs>
        <g fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {/* Inbox (top center) */}
          <rect x="280" y="20" width="160" height="60" fill="#0A0E14" stroke="#EAB308" strokeWidth="2" />
          <text x="360" y="45" fill="#EAB308" fontSize="13" textAnchor="middle" fontWeight="600">INBOX</text>
          <text x="360" y="62" fill="#8A8F98" fontSize="10" textAnchor="middle">one place · everything lands</text>

          {/* Five surfaces in a row */}
          {[
            { x: 30, label: "CAPTURE", sub: "iA Writer", color: "#00E5FF" },
            { x: 170, label: "DAILY", sub: "Things 3", color: "#A78BFA" },
            { x: 310, label: "PROJECTS", sub: "Linear", color: "#34D399" },
            { x: 450, label: "REFERENCE", sub: "Bear", color: "#F472B6" },
            { x: 590, label: "ARCHIVE", sub: "DEVONthink", color: "#A3E635" },
          ].map((s) => (
            <g key={s.label}>
              <rect x={s.x} y={150} width={110} height={70} fill="#0A0E14" stroke={s.color} strokeWidth="1.5" />
              <text x={s.x + 55} y={178} fill={s.color} fontSize="11" textAnchor="middle" fontWeight="600">{s.label}</text>
              <text x={s.x + 55} y={196} fill="#E8E6E0" fontSize="10" textAnchor="middle">{s.sub}</text>
              <line x1={s.x + 55} y1={150} x2={s.x + 55} y2={86} stroke="#1C232E" strokeWidth="1" strokeDasharray="2 3" />
            </g>
          ))}

          {/* Inbox to surfaces */}
          <line x1="360" y1="80" x2="360" y2="146" stroke="#EAB308" strokeWidth="1.5" markerEnd="url(#arrow-sys)" />

          {/* Weekly review loop (bottom) */}
          <rect x="240" y="260" width="240" height="42" fill="#0A0E14" stroke="#EAB308" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="360" y="282" fill="#EAB308" fontSize="11" textAnchor="middle" fontWeight="600">WEEKLY REVIEW</text>
          <text x="360" y="296" fill="#8A8F98" fontSize="9" textAnchor="middle">prune · re-rank · close loops</text>

          {/* curved arrows from each surface back to weekly review */}
          {[85, 225, 365, 505, 645].map((cx, i) => (
            <path
              key={i}
              d={`M ${cx} 220 Q ${cx} 250 ${cx > 360 ? 470 : 250} 280`}
              fill="none"
              stroke="#EAB308"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
            />
          ))}
        </g>
      </svg>
    </Frame>
  );
}
