/**
 * Late-Night Curriculum — signature diagrams.
 *
 * One diagram per essay. Hand-built SVG. On-brand: cyan accent, mono labels,
 * thin strokes, dark surface. Each diagram is the visual thesis of its post.
 *
 * Conventions:
 *   - viewBox is ~ 800 × 460, scales to container width.
 *   - All numeric coordinates are exact, not "eyeballed."
 *   - Labels use font-mono via CSS class, not <text font-family>.
 *   - Captions live below the figure, not inside.
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

/* ─── DIAGRAM A: SKILL HALF-LIFE (paid #1) ────────────────────────── */
/* Decay curve: technical skills (steep) vs. judgment (flat) over time.
   X = years (0..10). Y = useful value (0..100).
   Two curves + annotated crossover point. */

export function DiagramSkillHalfLife({ caption, className }: DiagramProps) {
  // Generate exponential decay points for "technical skills"
  // V(t) = 100 * exp(-0.35 * t) → years 0..10
  const techPoints: [number, number][] = Array.from({ length: 11 }, (_, t) => [
    t,
    100 * Math.exp(-0.35 * t),
  ]);
  // "Taste / judgment" — slow decay V(t) = 100 * exp(-0.04 * t)
  const tastePoints: [number, number][] = Array.from({ length: 11 }, (_, t) => [
    t,
    100 * Math.exp(-0.04 * t),
  ]);

  // Map data to SVG coords. Plot area: x ∈ [80, 720], y ∈ [60, 360]
  const xMap = (yr: number) => 80 + (yr / 10) * 640;
  const yMap = (v: number) => 360 - (v / 100) * 300;

  const techPath = techPoints
    .map(([t, v], i) => `${i === 0 ? "M" : "L"} ${xMap(t)} ${yMap(v)}`)
    .join(" ");
  const tastePath = tastePoints
    .map(([t, v], i) => `${i === 0 ? "M" : "L"} ${xMap(t)} ${yMap(v)}`)
    .join(" ");

  return (
    <Frame
      number="A.01"
      title="HALF-LIFE OF A SKILL"
      caption={caption ?? "Technical knowledge decays exponentially. Judgment compounds. The gap is your career."}
      className={className}
    >
      <svg
        viewBox="0 0 800 440"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Grid */}
        <g stroke="rgba(255,255,255,0.04)" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line
              key={`h${i}`}
              x1="80"
              y1={60 + i * 60}
              x2="720"
              y2={60 + i * 60}
            />
          ))}
          {[0, 2, 4, 6, 8, 10].map((yr) => (
            <line
              key={`v${yr}`}
              x1={xMap(yr)}
              y1="60"
              x2={xMap(yr)}
              y2="360"
            />
          ))}
        </g>

        {/* Axes */}
        <line x1="80" y1="360" x2="720" y2="360" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="80" y1="60" x2="80" y2="360" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

        {/* Y axis labels */}
        <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
          <text x="70" y="64" textAnchor="end">100%</text>
          <text x="70" y="214" textAnchor="end">50%</text>
          <text x="70" y="364" textAnchor="end">0%</text>
        </g>

        {/* X axis labels */}
        <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(255,255,255,0.5)" textAnchor="middle">
          {[0, 2, 4, 6, 8, 10].map((yr) => (
            <text key={`xl${yr}`} x={xMap(yr)} y="380">
              year {yr}
            </text>
          ))}
        </g>

        {/* Tech curve — cyan */}
        <path
          d={techPath}
          fill="none"
          stroke="#67e8f9"
          strokeWidth="2"
        />
        {/* Taste curve — bone */}
        <path
          d={tastePath}
          fill="none"
          stroke="rgba(245,240,225,0.85)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />

        {/* Label: technical skills (early) */}
        <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="11" fill="#67e8f9">
          <line x1={xMap(1.6)} y1={yMap(57)} x2={xMap(1.6)} y2={yMap(57) - 22} stroke="#67e8f9" strokeWidth="1" />
          <text x={xMap(1.6)} y={yMap(57) - 28} textAnchor="middle">technical · half-life ≈ 2 yr</text>
        </g>

        {/* Label: judgment (late) */}
        <g fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="11" fill="rgba(245,240,225,0.9)">
          <line x1={xMap(8.2)} y1={yMap(72)} x2={xMap(8.2)} y2={yMap(72) - 22} stroke="rgba(245,240,225,0.5)" strokeWidth="1" strokeDasharray="2 2" />
          <text x={xMap(8.2)} y={yMap(72) - 28} textAnchor="middle">judgment · half-life ≈ 17 yr</text>
        </g>

        {/* Crossover marker — approx at year 1.0 the curves are still close, real divergence ~ year 4 */}
        <g>
          <circle cx={xMap(4)} cy={yMap(85)} r="3" fill="#67e8f9" />
          <line x1={xMap(4)} y1={yMap(85)} x2={xMap(4) + 90} y2={yMap(85) - 30} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <text
            x={xMap(4) + 96}
            y={yMap(85) - 26}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(255,255,255,0.6)"
          >
            curves diverge here
          </text>
          <text
            x={xMap(4) + 96}
            y={yMap(85) - 12}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(255,255,255,0.6)"
          >
            (year 4 · most people quit)
          </text>
        </g>

        {/* Axis titles */}
        <text
          x="400"
          y="420"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fill="rgba(255,255,255,0.5)"
        >
          time since acquisition →
        </text>
        <text
          x="20"
          y="210"
          transform="rotate(-90 20 210)"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="11"
          fill="rgba(255,255,255,0.5)"
        >
          ↑ remaining usefulness
        </text>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM B: SECOND-BRAIN INFORMATION FLOW (paid #7) ──────────── */
/* Pipeline diagram with leak points. Five stages, three leaks marked. */

export function DiagramSecondBrain({ caption, className }: DiagramProps) {
  const stages = [
    { x: 80, label: "CAPTURE", sub: "input firehose" },
    { x: 230, label: "PROCESS", sub: "decide / discard" },
    { x: 380, label: "LINK", sub: "connect / tag" },
    { x: 530, label: "RETRIEVE", sub: "find / use" },
    { x: 680, label: "OUTPUT", sub: "ship / share" },
  ];

  return (
    <Frame
      number="B.07"
      title="SECOND-BRAIN PIPELINE"
      caption={caption ?? "Five stages. Three leak points. The graveyard is where retrieval fails."}
      className={className}
    >
      <svg
        viewBox="0 0 800 460"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Top pipeline */}
        <g>
          {stages.map((s, i) => (
            <g key={s.label}>
              <rect
                x={s.x - 50}
                y="100"
                width="100"
                height="70"
                fill="rgba(103,232,249,0.05)"
                stroke="#67e8f9"
                strokeWidth="1"
              />
              <text
                x={s.x}
                y="130"
                textAnchor="middle"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="11"
                fill="#67e8f9"
                letterSpacing="1"
              >
                {s.label}
              </text>
              <text
                x={s.x}
                y="148"
                textAnchor="middle"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="9"
                fill="rgba(255,255,255,0.5)"
              >
                {s.sub}
              </text>
              {/* Stage number */}
              <text
                x={s.x - 44}
                y="92"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="9"
                fill="rgba(255,255,255,0.4)"
              >
                {String(i + 1).padStart(2, "0")}
              </text>

              {/* Arrow to next */}
              {i < stages.length - 1 && (
                <g>
                  <line
                    x1={s.x + 50}
                    y1="135"
                    x2={stages[i + 1].x - 50}
                    y2="135"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                  />
                  <polygon
                    points={`${stages[i + 1].x - 50},135 ${stages[i + 1].x - 56},132 ${stages[i + 1].x - 56},138`}
                    fill="rgba(255,255,255,0.3)"
                  />
                </g>
              )}
            </g>
          ))}
        </g>

        {/* Leak arrows down to graveyard */}
        {[0, 1, 3].map((leakIdx) => {
          const x = stages[leakIdx].x;
          const labels = ["panic-saves", "no-decisions", "untagged-orphans"];
          return (
            <g key={leakIdx}>
              <line
                x1={x}
                y1="170"
                x2={x}
                y2="280"
                stroke="rgba(248, 113, 113, 0.5)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <polygon
                points={`${x},280 ${x - 4},274 ${x + 4},274`}
                fill="rgba(248, 113, 113, 0.7)"
              />
              <text
                x={x + 8}
                y="220"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="9"
                fill="rgba(248, 113, 113, 0.85)"
              >
                {labels[[0, 1, 3].indexOf(leakIdx)]}
              </text>
            </g>
          );
        })}

        {/* Graveyard at bottom */}
        <g>
          <rect
            x="80"
            y="290"
            width="640"
            height="60"
            fill="rgba(248,113,113,0.06)"
            stroke="rgba(248,113,113,0.4)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text
            x="400"
            y="318"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="11"
            fill="rgba(248, 113, 113, 0.85)"
            letterSpacing="2"
          >
            // GRAVEYARD
          </text>
          <text
            x="400"
            y="336"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="9"
            fill="rgba(255,255,255,0.5)"
          >
            notes that never make it back · ~80% of every system
          </text>
        </g>

        {/* Output arrow upward to "Action" */}
        <g>
          <line x1="680" y1="100" x2="680" y2="60" stroke="#67e8f9" strokeWidth="1" />
          <polygon points="680,55 676,63 684,63" fill="#67e8f9" />
          <text
            x="680"
            y="46"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="#67e8f9"
            letterSpacing="1"
          >
            → THE WORLD
          </text>
        </g>

        {/* Caption strip */}
        <text
          x="80"
          y="400"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.5)"
        >
          a healthy second brain has thin pipes, not big buckets
        </text>
        <text
          x="80"
          y="418"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.4)"
        >
          ↳ measure the system by what comes OUT, not what goes in
        </text>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM C: LATENCY AS WORLDVIEW (paid #8) ───────────────────── */
/* "A person as a system" — async/sync paths, queues, caches. */

export function DiagramLatencyArchitecture({ caption, className }: DiagramProps) {
  return (
    <Frame
      number="C.08"
      title="A PERSON AS A SYSTEM"
      caption={caption ?? "The same primitives that ship websites at scale: queues, caches, async, batched I/O."}
      className={className}
    >
      <svg
        viewBox="0 0 800 460"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Outer system boundary */}
        <rect
          x="40"
          y="60"
          width="720"
          height="360"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <text
          x="50"
          y="78"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(255,255,255,0.4)"
          letterSpacing="1"
        >
          // SYSTEM · YOU
        </text>

        {/* Inputs (left) */}
        <g>
          {[
            { y: 120, label: "slack" },
            { y: 160, label: "email" },
            { y: 200, label: "calendar" },
            { y: 240, label: "phone" },
          ].map((inp) => (
            <g key={inp.label}>
              <rect
                x="60"
                y={inp.y - 12}
                width="80"
                height="24"
                fill="rgba(255,255,255,0.04)"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1"
              />
              <text
                x="100"
                y={inp.y + 4}
                textAnchor="middle"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="10"
                fill="rgba(255,255,255,0.7)"
              >
                {inp.label}
              </text>
            </g>
          ))}
          <text
            x="100"
            y="100"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="9"
            fill="rgba(255,255,255,0.4)"
            letterSpacing="1"
          >
            INPUTS
          </text>
        </g>

        {/* Queue */}
        <g>
          <rect
            x="180"
            y="140"
            width="120"
            height="80"
            fill="rgba(103,232,249,0.05)"
            stroke="#67e8f9"
            strokeWidth="1"
          />
          <text x="240" y="165" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="#67e8f9" letterSpacing="1">
            QUEUE
          </text>
          <text x="240" y="184" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
            inbox · ticket · DM
          </text>
          <text x="240" y="202" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
            answered in batches
          </text>

          {/* Queue cells */}
          {[0, 1, 2, 3].map((i) => (
            <line
              key={i}
              x1={195 + i * 23}
              y1="208"
              x2={195 + i * 23}
              y2="216"
              stroke="rgba(103,232,249,0.5)"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* Inputs → Queue arrows */}
        {[120, 160, 200, 240].map((y) => (
          <g key={y}>
            <line x1="140" y1={y} x2="180" y2={(140 + 80 / 2 + y) / 2} stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          </g>
        ))}

        {/* Cache */}
        <g>
          <rect
            x="180"
            y="260"
            width="120"
            height="60"
            fill="rgba(245,240,225,0.04)"
            stroke="rgba(245,240,225,0.5)"
            strokeWidth="1"
          />
          <text x="240" y="282" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(245,240,225,0.85)" letterSpacing="1">
            CACHE
          </text>
          <text x="240" y="300" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
            answered before
          </text>
          <text x="240" y="314" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
            return prior reply
          </text>
        </g>

        {/* Worker (sync) */}
        <g>
          <rect
            x="360"
            y="180"
            width="160"
            height="80"
            fill="rgba(103,232,249,0.08)"
            stroke="#67e8f9"
            strokeWidth="1.5"
          />
          <text x="440" y="210" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="11" fill="#67e8f9" letterSpacing="1">
            WORKER
          </text>
          <text x="440" y="228" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.6)">
            single-threaded mind
          </text>
          <text x="440" y="244" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.6)">
            one task at a time
          </text>
        </g>

        {/* Queue → Worker */}
        <line x1="300" y1="200" x2="360" y2="200" stroke="#67e8f9" strokeWidth="1" />
        <polygon points="360,200 354,197 354,203" fill="#67e8f9" />
        <text x="330" y="194" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
          batched
        </text>

        {/* Cache → Worker */}
        <line x1="300" y1="290" x2="360" y2="240" stroke="rgba(245,240,225,0.5)" strokeWidth="1" strokeDasharray="3 3" />
        <text x="318" y="274" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
          O(1)
        </text>

        {/* Worker → Output */}
        <line x1="520" y1="220" x2="600" y2="220" stroke="#67e8f9" strokeWidth="1" />
        <polygon points="600,220 594,217 594,223" fill="#67e8f9" />

        {/* Output */}
        <g>
          <rect
            x="600"
            y="180"
            width="140"
            height="80"
            fill="rgba(255,255,255,0.04)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          <text x="670" y="208" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(245,240,225,0.85)" letterSpacing="1">
            OUTPUT
          </text>
          <text x="670" y="226" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
            shipped work
          </text>
          <text x="670" y="240" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
            answers · code · words
          </text>
        </g>

        {/* Interrupt — the bad path */}
        <g>
          <line
            x1="100"
            y1="380"
            x2="440"
            y2="280"
            stroke="rgba(248,113,113,0.6)"
            strokeWidth="1"
          />
          <polygon points="440,280 432,279 434,287" fill="rgba(248,113,113,0.7)" />
          <text
            x="160"
            y="396"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(248,113,113,0.85)"
            letterSpacing="1"
          >
            INTERRUPT — synchronous · skips queue · breaks cache
          </text>
        </g>

        {/* Annotation: latency budget */}
        <g>
          <line x1="600" y1="360" x2="740" y2="360" stroke="rgba(245,240,225,0.4)" strokeWidth="1" />
          <line x1="600" y1="356" x2="600" y2="364" stroke="rgba(245,240,225,0.4)" strokeWidth="1" />
          <line x1="740" y1="356" x2="740" y2="364" stroke="rgba(245,240,225,0.4)" strokeWidth="1" />
          <text
            x="670"
            y="378"
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="9"
            fill="rgba(255,255,255,0.5)"
          >
            latency budget · 24h
          </text>
        </g>
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM D: TEASER MICRO (free post) ─────────────────────────── */
/* A 30-second version of the half-life curve. Compact, single-line. */

export function DiagramHalfLifeTeaser({ caption, className }: DiagramProps) {
  // Single decay curve, plot area 60..540 × 40..200
  const points: [number, number][] = Array.from({ length: 11 }, (_, t) => [
    t,
    100 * Math.exp(-0.32 * t),
  ]);
  const xMap = (t: number) => 60 + (t / 10) * 480;
  const yMap = (v: number) => 220 - (v / 100) * 160;
  const path = points
    .map(([t, v], i) => `${i === 0 ? "M" : "L"} ${xMap(t)} ${yMap(v)}`)
    .join(" ");

  return (
    <Frame
      number="T.01"
      title="THE 30-SECOND VERSION"
      caption={caption ?? "Most of what you know expires. The fix is not to learn faster — it's to learn the part that doesn't."}
      className={className}
    >
      <svg
        viewBox="0 0 600 280"
        className="w-full h-auto"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* axes */}
        <line x1="60" y1="220" x2="540" y2="220" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="60" y1="40" x2="60" y2="220" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

        {/* curve — area fill */}
        <path
          d={`${path} L ${xMap(10)} 220 L ${xMap(0)} 220 Z`}
          fill="rgba(103,232,249,0.06)"
        />
        {/* curve line */}
        <path d={path} fill="none" stroke="#67e8f9" strokeWidth="2" />

        {/* Half-life marker — V = 50 → t = ln(2)/0.32 ≈ 2.17 */}
        {(() => {
          const t = Math.log(2) / 0.32;
          return (
            <g>
              <line x1={xMap(t)} y1={yMap(50)} x2={xMap(t)} y2={yMap(0)} stroke="rgba(245,240,225,0.4)" strokeWidth="1" strokeDasharray="3 3" />
              <line x1={60} y1={yMap(50)} x2={xMap(t)} y2={yMap(50)} stroke="rgba(245,240,225,0.4)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={xMap(t)} cy={yMap(50)} r="3" fill="#67e8f9" />
              <text
                x={xMap(t) + 8}
                y={yMap(50) - 6}
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="11"
                fill="#67e8f9"
              >
                t½ ≈ 2.2 yr
              </text>
            </g>
          );
        })()}

        {/* labels */}
        <text x="50" y="44" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
          100%
        </text>
        <text x="50" y="226" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
          0
        </text>
        <text x="60" y="244" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
          today
        </text>
        <text x="540" y="244" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="10" fill="rgba(255,255,255,0.5)">
          year 10
        </text>
        <text
          x="300"
          y="265"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.4)"
          letterSpacing="1"
        >
          the half-life of a typical technical skill
        </text>
      </svg>
    </Frame>
  );
}
