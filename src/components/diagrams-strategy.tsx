/**
 * Strategy diagrams — used on /start (the narrated strategy page)
 * and reusable elsewhere. Hand-built SVG. Cyan accent. Mono labels.
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

/* ─── DIAGRAM: NOISE VS SIGNAL ────────────────────────────────────── */
/**
 * The "internet noise" reticle. A scan-line field of dim noise dots
 * with a single cyan signal point in the cross-hairs. Used as the
 * opening visual of /start to dramatize the problem.
 */

export function DiagramNoiseVsSignal({ caption, className }: DiagramProps) {
  // Generate a stable pseudo-random field of dots
  const dots: { x: number; y: number; r: number; o: number }[] = [];
  let seed = 73;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 220; i++) {
    dots.push({
      x: 30 + rand() * 660,
      y: 20 + rand() * 240,
      r: 0.7 + rand() * 1.6,
      o: 0.08 + rand() * 0.22,
    });
  }
  return (
    <Frame
      number="00"
      title="THE NOISE / THE SIGNAL"
      caption={caption ?? "internet, ambient. one signal in the crosshairs."}
      className={className}
    >
      <svg
        viewBox="0 0 720 280"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {/* noise field */}
          {dots.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r}
              fill="#E8E6E0"
              opacity={d.o}
            />
          ))}

          {/* scan grid */}
          <g stroke="#1C232E" strokeWidth="0.5" opacity="0.5">
            <line x1="60" y1="40" x2="60" y2="240" />
            <line x1="660" y1="40" x2="660" y2="240" />
            <line x1="60" y1="40" x2="660" y2="40" />
            <line x1="60" y1="240" x2="660" y2="240" />
          </g>

          {/* reticle target — center */}
          <g transform="translate(360,140)">
            <circle r="42" fill="none" stroke="#00E5FF" strokeWidth="1.2" />
            <circle r="22" fill="none" stroke="#00E5FF" strokeWidth="1" opacity="0.7" />
            <circle r="3" fill="#00E5FF" />
            <line x1="-58" y1="0" x2="-46" y2="0" stroke="#00E5FF" strokeWidth="1" />
            <line x1="46" y1="0" x2="58" y2="0" stroke="#00E5FF" strokeWidth="1" />
            <line x1="0" y1="-58" x2="0" y2="-46" stroke="#00E5FF" strokeWidth="1" />
            <line x1="0" y1="46" x2="0" y2="58" stroke="#00E5FF" strokeWidth="1" />
          </g>

          {/* labels */}
          <text x="80" y="32" fill="#8A8F98" fontSize="10">// FIELD: open internet · 24h sample</text>
          <text x="640" y="262" fill="#8A8F98" fontSize="10" textAnchor="end">SIGNAL · 1 · CYAN</text>

          {/* annotation line to target */}
          <line x1="500" y1="140" x2="404" y2="140" stroke="#00E5FF" strokeWidth="0.8" strokeDasharray="3 3" />
          <text x="510" y="135" fill="#00E5FF" fontSize="11" fontWeight="600">a one-person studio</text>
          <text x="510" y="150" fill="#8A8F98" fontSize="10">writing at night</text>
        </g>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM: FIVE PILLARS ───────────────────────────────────────── */
/**
 * Five vertical columns labeled BUILD · SIGNAL · MIND · WORLD · TASTE.
 * Each column carries its pillar color as a vertical rule and a one-line
 * description. A horizontal "ARCS" beam crosses all five at the bottom
 * to show that arcs braid pillars together.
 */

export function DiagramFivePillars({ caption, className }: DiagramProps) {
  // Each pillar gets: a domain (top tag), a definition (large), a frequency,
  // and a weight bar that hints at how much I write in each surface.
  const pillars = [
    {
      key: "BUILD",
      color: "#00E5FF",
      tag: "the maker",
      def: "code, products,\u00A0craft",
      freq: "weekly",
      weight: 0.92,
    },
    {
      key: "SIGNAL",
      color: "#F59E0B",
      tag: "the operator",
      def: "dispatches,\u00A0live\u00A0status",
      freq: "daily",
      weight: 0.78,
    },
    {
      key: "MIND",
      color: "#A78BFA",
      tag: "the thinker",
      def: "essays,\u00A0first\u00A0principles",
      freq: "monthly",
      weight: 0.66,
    },
    {
      key: "WORLD",
      color: "#34D399",
      tag: "the watcher",
      def: "industry,\u00A0observations",
      freq: "as\u00A0needed",
      weight: 0.54,
    },
    {
      key: "TASTE",
      color: "#F472B6",
      tag: "the curator",
      def: "art, music,\u00A0what\u00A0i\u00A0love",
      freq: "sundays",
      weight: 0.48,
    },
  ];

  // Layout constants — a wider canvas with deliberate negative space.
  const W = 760;
  const H = 460;
  const COL_W = 130;
  const GUTTER = 14;
  const COLS_W = pillars.length * COL_W + (pillars.length - 1) * GUTTER;
  const COLS_X = (W - COLS_W) / 2;
  const TOP_Y = 70;
  const PILLAR_TOP = 96;
  const PILLAR_BASE = 330;
  const ARCS_Y = 396;

  return (
    <Frame
      number="01"
      title="THE FIVE PILLARS"
      caption={caption ?? "five surfaces. one voice. arcs braid them together."}
      className={className}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {pillars.map((p) => (
            <linearGradient
              key={`grad-${p.key}`}
              id={`pillar-grad-${p.key}`}
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop offset="0%" stopColor={p.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0.02" />
            </linearGradient>
          ))}
        </defs>

        <g fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {/* top axis with frame ticks */}
          <line x1="32" y1={TOP_Y} x2={W - 32} y2={TOP_Y} stroke="#2A3340" strokeWidth="1" />
          <text x="32" y={TOP_Y - 12} fill="#8A8F98" fontSize="10" letterSpacing="1">
            // SURFACES
          </text>
          <text x={W - 32} y={TOP_Y - 12} fill="#8A8F98" fontSize="10" textAnchor="end" letterSpacing="1">
            FIG · 01
          </text>
          {/* corner reticles on the top axis */}
          {[32, W - 32].map((x) => (
            <g key={`tick-${x}`}>
              <line x1={x} y1={TOP_Y - 4} x2={x} y2={TOP_Y + 4} stroke="#2A3340" strokeWidth="1" />
            </g>
          ))}

          {pillars.map((p, i) => {
            const cx = COLS_X + i * (COL_W + GUTTER) + COL_W / 2;
            const left = cx - COL_W / 2;
            const colHeight = PILLAR_BASE - PILLAR_TOP;
            const fillH = colHeight * p.weight;
            const fillY = PILLAR_BASE - fillH;
            return (
              <g key={p.key}>
                {/* faint column outline */}
                <rect
                  x={left}
                  y={PILLAR_TOP}
                  width={COL_W}
                  height={colHeight}
                  fill="none"
                  stroke="#1F2630"
                  strokeWidth="1"
                />
                {/* weighted column fill (gradient) */}
                <rect
                  x={left}
                  y={fillY}
                  width={COL_W}
                  height={fillH}
                  fill={`url(#pillar-grad-${p.key})`}
                />
                {/* fill cap line at the top of the weighted area */}
                <line
                  x1={left}
                  y1={fillY}
                  x2={left + COL_W}
                  y2={fillY}
                  stroke={p.color}
                  strokeWidth="1.5"
                />
                {/* outer left and right verticals — thicker, the actual pillar */}
                <line x1={left} y1={PILLAR_TOP} x2={left} y2={PILLAR_BASE} stroke={p.color} strokeWidth="2" />
                <line x1={left + COL_W} y1={PILLAR_TOP} x2={left + COL_W} y2={PILLAR_BASE} stroke={p.color} strokeWidth="2" opacity="0.55" />
                {/* base plinth */}
                <line x1={left - 6} y1={PILLAR_BASE} x2={left + COL_W + 6} y2={PILLAR_BASE} stroke={p.color} strokeWidth="2" />

                {/* tag chip above pillar */}
                <rect x={cx - 36} y={PILLAR_TOP - 22} width="72" height="14" fill="#0F1218" stroke={p.color} strokeOpacity="0.5" strokeWidth="1" />
                <text x={cx} y={PILLAR_TOP - 12} fill={p.color} fontSize="9" textAnchor="middle" letterSpacing="1.5">
                  {p.tag.toUpperCase()}
                </text>

                {/* big pillar name */}
                <text
                  x={cx}
                  y={PILLAR_TOP + 32}
                  fill={p.color}
                  fontSize="18"
                  textAnchor="middle"
                  fontWeight="700"
                  letterSpacing="2"
                >
                  {p.key}
                </text>

                {/* hairline under name */}
                <line
                  x1={cx - 24}
                  y1={PILLAR_TOP + 42}
                  x2={cx + 24}
                  y2={PILLAR_TOP + 42}
                  stroke={p.color}
                  strokeWidth="1"
                  opacity="0.6"
                />

                {/* definition (two-line auto via tspan) */}
                <text
                  x={cx}
                  y={PILLAR_TOP + 70}
                  fill="#E8E6E0"
                  fontSize="11"
                  textAnchor="middle"
                >
                  {p.def}
                </text>

                {/* frequency — small all-caps line near the base of the column */}
                <text
                  x={cx}
                  y={PILLAR_BASE - 10}
                  fill="#8A8F98"
                  fontSize="9"
                  textAnchor="middle"
                  letterSpacing="1.5"
                >
                  {p.freq.toUpperCase()}
                </text>

                {/* weight readout above column — a numeric */}
                <text
                  x={cx}
                  y={fillY - 6}
                  fill={p.color}
                  fontSize="9"
                  textAnchor="middle"
                  letterSpacing="1"
                  opacity="0.85"
                >
                  {Math.round(p.weight * 100)}%
                </text>

                {/* connector down to ARCS beam */}
                <line
                  x1={cx}
                  y1={PILLAR_BASE + 4}
                  x2={cx}
                  y2={ARCS_Y - 6}
                  stroke={p.color}
                  strokeWidth="1"
                  opacity="0.55"
                />
                <circle cx={cx} cy={ARCS_Y} r="3" fill={p.color} />
              </g>
            );
          })}

          {/* ARCS beam — horizontal */}
          <line
            x1="40"
            y1={ARCS_Y}
            x2={W - 40}
            y2={ARCS_Y}
            stroke="#00E5FF"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.85"
          />
          <text x="40" y={ARCS_Y - 8} fill="#00E5FF" fontSize="11" letterSpacing="1.5">
            ARCS →
          </text>
          <text x={W - 40} y={ARCS_Y - 8} fill="#8A8F98" fontSize="10" textAnchor="end" letterSpacing="1">
            braid pillars across time
          </text>

          {/* tiny scale legend — weight = how much i write here */}
          <text x="32" y={H - 12} fill="#5A6371" fontSize="9" letterSpacing="1">
            // % = SHARE OF OUTPUT · LAST 12 MONTHS
          </text>
        </g>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM: ARC TIMELINE ───────────────────────────────────────── */
/**
 * Horizontal episode timeline. Used on /arcs/[slug] above the existing
 * vertical episode list, and on /start as an example of arc structure.
 */

export function DiagramArcTimeline({
  caption,
  className,
  episodes,
  current,
  arcCode = "ARC_001",
  arcTitle = "TRAYD, IN PUBLIC",
}: DiagramProps & {
  episodes: { n: number; kind: string; title: string }[];
  current: number;
  arcCode?: string;
  arcTitle?: string;
}) {
  const total = episodes.length;
  const w = 720;
  const padX = 50;
  const span = w - padX * 2;
  const step = total > 1 ? span / (total - 1) : 0;

  return (
    <Frame
      number="A"
      title={`${arcCode} · ${arcTitle} · TIMELINE`}
      caption={caption ?? `episode ${current} of ${total} · live now`}
      className={className}
    >
      <svg
        viewBox="0 0 720 200"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <g fontFamily="ui-monospace, Menlo, Consolas, monospace">
          {/* spine */}
          <line
            x1={padX}
            y1={100}
            x2={w - padX}
            y2={100}
            stroke="#2A3340"
            strokeWidth="1.5"
          />
          {/* progress fill */}
          <line
            x1={padX}
            y1={100}
            x2={padX + step * Math.max(0, current - 1)}
            y2={100}
            stroke="#00E5FF"
            strokeWidth="2"
          />

          {episodes.map((ep, i) => {
            const x = padX + step * i;
            const isPub = ep.kind === "PUBLISHED" || ep.kind === "LIVE NOW";
            const isCurrent = ep.n === current;
            const r = isCurrent ? 8 : 5;
            const fill = isCurrent
              ? "#00E5FF"
              : isPub
                ? "#00E5FF"
                : ep.kind === "DRAFTING"
                  ? "rgba(0,229,255,0.4)"
                  : "#0A0E14";
            const stroke = isPub || isCurrent ? "#00E5FF" : "#2A3340";
            return (
              <g key={ep.n}>
                <circle
                  cx={x}
                  cy={100}
                  r={r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="1.5"
                />
                {isCurrent && (
                  <circle
                    cx={x}
                    cy={100}
                    r={16}
                    fill="none"
                    stroke="#00E5FF"
                    strokeWidth="1"
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      values="8;20;8"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0;0.6"
                      dur="2.4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <text
                  x={x}
                  y={75}
                  fill={isCurrent ? "#00E5FF" : isPub ? "#E8E6E0" : "#8A8F98"}
                  fontSize="10"
                  textAnchor="middle"
                >
                  EP{String(ep.n).padStart(2, "0")}
                </text>
                <text
                  x={x}
                  y={132}
                  fill={isCurrent ? "#00E5FF" : "#8A8F98"}
                  fontSize="9"
                  textAnchor="middle"
                  opacity={isPub || isCurrent ? 1 : 0.6}
                >
                  {ep.kind}
                </text>
              </g>
            );
          })}

          {/* axis caption */}
          <text x={padX} y={170} fill="#8A8F98" fontSize="10">
            START
          </text>
          <text x={w - padX} y={170} fill="#8A8F98" fontSize="10" textAnchor="end">
            END / ARC CLOSE
          </text>
        </g>
      </svg>
    </Frame>
  );
}
