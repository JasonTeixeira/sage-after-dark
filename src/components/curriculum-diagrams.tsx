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

/* ─── DIAGRAM E: TASTE MOAT (paid #2) ─────────────────────────────── */
/* The thesis-as-figure: a wide field of POSSIBLE ARTIFACTS funnels
   through a narrow TASTE filter into a small set of SHIPPED artifacts,
   which sits inside a labeled moat. Below: two trend lines crossing —
   production cost falling, taste leverage rising. */

export function DiagramTasteMoat({ caption, className }: DiagramProps) {
  /* Deterministic pseudo-random so the dot field is stable across renders.
     LCG with fixed seed → no hydration mismatch. */
  function makeRng(seed: number) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 0xffffffff;
    };
  }
  const rng = makeRng(7331);

  // Field of POSSIBLE artifacts (left zone): scattered dots in 60..280 × 70..330.
  const possible: Array<{ x: number; y: number; r: number; o: number }> = [];
  for (let i = 0; i < 84; i++) {
    possible.push({
      x: 60 + rng() * 220,
      y: 70 + rng() * 260,
      r: 1.6 + rng() * 1.4,
      o: 0.18 + rng() * 0.32,
    });
  }

  // Tight cluster of SHIPPED artifacts on the right inside the moat ring.
  const shippedCenter = { x: 645, y: 200 };
  const shipped: Array<{ x: number; y: number; r: number }> = [];
  // Six small cyan dots in a clustered formation.
  const positions: Array<[number, number]> = [
    [-18, -10],
    [-6, -22],
    [10, -8],
    [-12, 10],
    [4, 18],
    [22, 4],
  ];
  positions.forEach(([dx, dy]) => {
    shipped.push({ x: shippedCenter.x + dx, y: shippedCenter.y + dy, r: 3 });
  });

  // Aperture (taste filter) geometry: a narrow lens at x≈360..420.
  // Top funnel curve and bottom funnel curve.
  const funnelTop = "M 290 80 Q 350 180 360 195 L 420 195 Q 430 180 480 80";
  const funnelBot = "M 290 320 Q 350 220 360 205 L 420 205 Q 430 220 480 320";

  // Lower chart: production cost (falling) vs. taste leverage (rising).
  // Plot area: x ∈ [80, 720], y ∈ [400, 440].
  const xL = (t: number) => 80 + (t / 10) * 640;
  const yL = (v: number) => 440 - (v / 100) * 40;
  const costPts: Array<[number, number]> = Array.from({ length: 11 }, (_, t) => [
    t,
    100 * Math.exp(-0.45 * t),
  ]);
  const lifPts: Array<[number, number]> = Array.from({ length: 11 }, (_, t) => [
    t,
    100 * (1 - Math.exp(-0.35 * t)),
  ]);
  const costPath = costPts
    .map(([t, v], i) => `${i === 0 ? "M" : "L"} ${xL(t)} ${yL(v)}`)
    .join(" ");
  const lifPath = lifPts
    .map(([t, v], i) => `${i === 0 ? "M" : "L"} ${xL(t)} ${yL(v)}`)
    .join(" ");

  return (
    <Frame
      number="A.05"
      title="THE TASTE MOAT"
      caption={
        caption ??
        "As production gets cheap, the only remaining bottleneck is judgment. The moat is what you choose not to ship."
      }
      className={className}
    >
      <svg
        viewBox="0 0 800 460"
        className="w-full h-auto"
        role="img"
        aria-label="Diagram: a wide field of possible artifacts narrows through a taste filter into a small set of shipped artifacts inside a moat. Below: production cost falls while taste leverage rises."
      >
        <defs>
          <linearGradient id="taste-aperture" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.0)" />
            <stop offset="50%" stopColor="rgba(34,211,238,0.55)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.0)" />
          </linearGradient>
          <radialGradient id="taste-shipped-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.18)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </radialGradient>
          <pattern
            id="taste-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* faint grid backdrop in the upper plot zone */}
        <rect x="40" y="50" width="720" height="320" fill="url(#taste-grid)" />

        {/* ZONE LABELS */}
        <text
          x="170"
          y="40"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.55)"
          letterSpacing="2"
        >
          POSSIBLE ARTIFACTS
        </text>
        <text
          x="380"
          y="40"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(34,211,238,0.85)"
          letterSpacing="2"
        >
          TASTE
        </text>
        <text
          x="640"
          y="40"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.55)"
          letterSpacing="2"
        >
          SHIPPED
        </text>

        {/* dashed vertical separators between zones */}
        <line
          x1="290"
          y1="55"
          x2="290"
          y2="365"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />
        <line
          x1="480"
          y1="55"
          x2="480"
          y2="365"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1"
          strokeDasharray="3 4"
        />

        {/* POSSIBLE ARTIFACTS field */}
        {possible.map((p, i) => (
          <circle
            key={`p-${i}`}
            cx={p.x}
            cy={p.y}
            r={p.r}
            fill="rgba(255,255,255,0.55)"
            opacity={p.o}
          />
        ))}
        <text
          x="170"
          y="358"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.4)"
        >
          ≈ ∞ · cost approaching 0
        </text>

        {/* TASTE FUNNEL — two curves forming a lens, with a glowing aperture in the middle */}
        <path d={funnelTop} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.25" />
        <path d={funnelBot} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.25" />
        {/* aperture glow */}
        <rect x="356" y="80" width="68" height="240" fill="url(#taste-aperture)" />
        {/* aperture rails */}
        <line x1="360" y1="80" x2="360" y2="320" stroke="rgba(34,211,238,0.85)" strokeWidth="1.5" />
        <line x1="420" y1="80" x2="420" y2="320" stroke="rgba(34,211,238,0.85)" strokeWidth="1.5" />
        {/* aperture mid label */}
        <text
          x="390"
          y="206"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(34,211,238,0.95)"
          letterSpacing="1.5"
        >
          FILTER
        </text>
        {/* funnel sub-label */}
        <text
          x="385"
          y="358"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.45)"
        >
          judgment · 4 sub-models
        </text>
        {/* tiny callouts of the four sub-models */}
        <text x="385" y="73" textAnchor="middle" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)">possibility · audience · tension · discipline</text>

        {/* Several "rejected" dots that hit the funnel walls and fade away */}
        {[
          [305, 110, 0.5],
          [318, 165, 0.4],
          [322, 245, 0.45],
          [310, 295, 0.5],
          [462, 130, 0.45],
          [468, 220, 0.4],
          [458, 285, 0.45],
        ].map(([x, y, o], i) => (
          <g key={`r-${i}`} opacity={o as number}>
            <circle cx={x as number} cy={y as number} r="2" fill="rgba(255,255,255,0.55)" />
            <line
              x1={(x as number) - 4}
              y1={(y as number) - 4}
              x2={(x as number) + 4}
              y2={(y as number) + 4}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
            <line
              x1={(x as number) + 4}
              y1={(y as number) - 4}
              x2={(x as number) - 4}
              y2={(y as number) + 4}
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* THE MOAT — a ring around the shipped cluster.
            Outer ring uses dashed stroke; inner ring is solid; the gap between them is the moat. */}
        <circle
          cx={shippedCenter.x}
          cy={shippedCenter.y}
          r="78"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeDasharray="2 4"
        />
        <circle
          cx={shippedCenter.x}
          cy={shippedCenter.y}
          r="58"
          fill="url(#taste-shipped-glow)"
          stroke="rgba(34,211,238,0.65)"
          strokeWidth="1.25"
        />
        {/* moat label, offset above */}
        <text
          x={shippedCenter.x}
          y={shippedCenter.y - 92}
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(255,255,255,0.5)"
          letterSpacing="2"
        >
          ── MOAT ──
        </text>

        {/* shipped dots */}
        {shipped.map((s, i) => (
          <circle key={`s-${i}`} cx={s.x} cy={s.y} r={s.r} fill="rgba(34,211,238,0.95)" />
        ))}

        {/* shipped count caption */}
        <text
          x={shippedCenter.x}
          y="358"
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.45)"
        >
          a small set · the residue of refusals
        </text>

        {/* horizontal divider above the lower chart */}
        <line x1="40" y1="385" x2="760" y2="385" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* LOWER CHART — production cost vs. taste leverage over time */}
        <path d={costPath} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.25" />
        <path d={lifPath} fill="none" stroke="rgba(34,211,238,0.95)" strokeWidth="1.5" />

        {/* lower-chart labels */}
        <text
          x="46"
          y="396"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(255,255,255,0.55)"
          letterSpacing="1.5"
        >
          PRODUCTION COST ↓
        </text>
        <text
          x="754"
          y="396"
          textAnchor="end"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(34,211,238,0.95)"
          letterSpacing="1.5"
        >
          TASTE LEVERAGE ↑
        </text>
        <text
          x="80"
          y="455"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(255,255,255,0.4)"
        >
          2018
        </text>
        <text
          x="720"
          y="455"
          textAnchor="end"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(255,255,255,0.4)"
        >
          2030
        </text>

        {/* crossover marker */}
        {(() => {
          // Find approximate crossover where the two curves meet.
          let crossT = 5;
          for (let i = 0; i < costPts.length; i++) {
            if (lifPts[i][1] >= costPts[i][1]) {
              crossT = costPts[i][0];
              break;
            }
          }
          const cx = xL(crossT);
          return (
            <>
              <line
                x1={cx}
                y1={395}
                x2={cx}
                y2={445}
                stroke="rgba(34,211,238,0.4)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
              <text
                x={cx}
                y={455}
                textAnchor="middle"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
                fontSize="8"
                fill="rgba(34,211,238,0.85)"
                letterSpacing="1"
              >
                the moat moves
              </text>
            </>
          );
        })()}
      </svg>
    </Frame>
  );
}

/* ─── DIAGRAM F: AVAILABILITY COST (paid #3) ──────────────────────── */
/* A 24-hour timeline showing what "always-on" actually does to the
   off-hours. Top band = the day the worker thinks they're having
   (clean off-hours bracketing a work block). Bottom band = the day
   they're actually having: each check fires a 23-minute recovery shadow
   that eats into the surrounding off-hours, leaving thin filaments of
   real presence. */

export function DiagramAvailabilityCost({ caption, className }: DiagramProps) {
  // 24 hours mapped horizontally. Plot area: x ∈ [80, 740], y ∈ [60, 380].
  const xH = (h: number) => 80 + (h / 24) * 660;

  // Work block is 9 → 17 (8 hours), off-hours = the rest.
  const workStart = 9;
  const workEnd = 17;

  // Synthetic but plausible "checks" outside the work block — each is a
  // pulse that fires a 23-minute recovery shadow (mapped as 23/60 ≈ 0.383 h).
  // Twelve checks across the off-hours; deterministic.
  const checks = [
    6.4, 7.1, 7.8, 18.1, 18.6, 19.3, 20.2, 20.8, 21.4, 22.0, 22.5, 23.1,
  ];
  const recoveryHours = 23 / 60; // 0.3833...

  // Bands — vertical positions
  const yTopBand = 90; // "the day you think you're having"
  const yBotBand = 230; // "the day you're actually having"
  const bandH = 64;

  // Helper to clamp recovery shadow to 24h
  const clamp = (h: number) => Math.max(0, Math.min(24, h));

  return (
    <Frame
      number="A.06"
      title="THE COST OF BEING AVAILABLE"
      caption={
        caption ??
        "Top: the day you think you're having. Bottom: the day you're actually having — each check trails a 23-minute recovery shadow."
      }
      className={className}
    >
      <svg
        viewBox="0 0 800 460"
        className="w-full h-auto"
        role="img"
        aria-label="Diagram comparing the off-hours an always-on professional thinks they have versus the off-hours they actually have, after each check fires a 23-minute recovery shadow."
      >
        <defs>
          <linearGradient id="avail-recovery" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(34,211,238,0.55)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0.0)" />
          </linearGradient>
          <pattern
            id="avail-grid"
            x="0"
            y="0"
            width="44"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 44 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* faint grid in plotting area */}
        <rect x="40" y="50" width="720" height="350" fill="url(#avail-grid)" />

        {/* X-axis: hour ticks every 3h */}
        {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
          <g key={`tick-${h}`}>
            <line
              x1={xH(h)}
              y1={yTopBand - 6}
              x2={xH(h)}
              y2={yBotBand + bandH + 6}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <text
              x={xH(h)}
              y={yBotBand + bandH + 22}
              textAnchor="middle"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fontSize="9"
              fill="rgba(255,255,255,0.5)"
            >
              {`${h.toString().padStart(2, "0")}:00`}
            </text>
          </g>
        ))}

        {/* ─── TOP BAND: the day you think you're having ─── */}
        <text
          x="80"
          y="78"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.55)"
          letterSpacing="2"
        >
          THE DAY YOU THINK YOU'RE HAVING
        </text>

        {/* off-hours block: full band, faint cyan = presence */}
        <rect
          x={xH(0)}
          y={yTopBand}
          width={xH(workStart) - xH(0)}
          height={bandH}
          fill="rgba(34,211,238,0.18)"
          stroke="rgba(34,211,238,0.55)"
          strokeWidth="1"
        />
        {/* work block */}
        <rect
          x={xH(workStart)}
          y={yTopBand}
          width={xH(workEnd) - xH(workStart)}
          height={bandH}
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
        />
        {/* second off-hours block */}
        <rect
          x={xH(workEnd)}
          y={yTopBand}
          width={xH(24) - xH(workEnd)}
          height={bandH}
          fill="rgba(34,211,238,0.18)"
          stroke="rgba(34,211,238,0.55)"
          strokeWidth="1"
        />

        {/* labels inside top band */}
        <text
          x={(xH(0) + xH(workStart)) / 2}
          y={yTopBand + bandH / 2 + 4}
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(34,211,238,0.95)"
          letterSpacing="1.5"
        >
          OFF
        </text>
        <text
          x={(xH(workStart) + xH(workEnd)) / 2}
          y={yTopBand + bandH / 2 + 4}
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.85)"
          letterSpacing="1.5"
        >
          WORK · 8h
        </text>
        <text
          x={(xH(workEnd) + xH(24)) / 2}
          y={yTopBand + bandH / 2 + 4}
          textAnchor="middle"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(34,211,238,0.95)"
          letterSpacing="1.5"
        >
          OFF
        </text>

        {/* ─── BOTTOM BAND: the day you're actually having ─── */}
        <text
          x="80"
          y={yBotBand - 12}
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          fill="rgba(255,255,255,0.55)"
          letterSpacing="2"
        >
          THE DAY YOU'RE ACTUALLY HAVING
        </text>

        {/* recovery shadows under the bottom band — drawn first so checks sit on top */}
        {checks.map((h, i) => {
          const x1 = xH(h);
          const x2 = xH(clamp(h + recoveryHours));
          return (
            <rect
              key={`shadow-${i}`}
              x={x1}
              y={yBotBand}
              width={Math.max(2, x2 - x1)}
              height={bandH}
              fill="url(#avail-recovery)"
              opacity={0.85}
            />
          );
        })}

        {/* outline of bottom band — uses dashed segments where it's "off" */}
        {/* off1 [0..workStart] */}
        <rect
          x={xH(0)}
          y={yBotBand}
          width={xH(workStart) - xH(0)}
          height={bandH}
          fill="none"
          stroke="rgba(34,211,238,0.55)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* work [workStart..workEnd] — same as top band */}
        <rect
          x={xH(workStart)}
          y={yBotBand}
          width={xH(workEnd) - xH(workStart)}
          height={bandH}
          fill="rgba(255,255,255,0.10)"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
        />
        {/* off2 [workEnd..24] */}
        <rect
          x={xH(workEnd)}
          y={yBotBand}
          width={xH(24) - xH(workEnd)}
          height={bandH}
          fill="none"
          stroke="rgba(34,211,238,0.55)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* check pulses — vertical strikes */}
        {checks.map((h, i) => (
          <g key={`pulse-${i}`}>
            <line
              x1={xH(h)}
              y1={yBotBand - 4}
              x2={xH(h)}
              y2={yBotBand + bandH + 4}
              stroke="rgba(34,211,238,0.95)"
              strokeWidth="1.25"
            />
            <circle cx={xH(h)} cy={yBotBand - 6} r="2.5" fill="rgba(34,211,238,0.95)" />
          </g>
        ))}

        {/* small inset legend mid-bottom */}
        <g transform={`translate(${xH(workStart) + 16}, ${yBotBand + bandH / 2 + 4})`}>
          <text
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(255,255,255,0.85)"
            letterSpacing="1.5"
          >
            WORK · 8h
          </text>
        </g>

        {/* annotation: "23 min recovery × N checks" */}
        <g>
          <line
            x1={xH(20.2)}
            y1={yBotBand + bandH + 28}
            x2={xH(20.2) + 80}
            y2={yBotBand + bandH + 28}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
          />
          <text
            x={xH(20.2) + 86}
            y={yBotBand + bandH + 32}
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(34,211,238,0.95)"
            letterSpacing="1"
          >
            23 min recovery × {checks.length} checks
          </text>
        </g>

        {/* totals row near the right edge */}
        <g>
          <line
            x1="40"
            y1="408"
            x2="760"
            y2="408"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
          <text
            x="48"
            y="430"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(255,255,255,0.55)"
            letterSpacing="1.5"
          >
            OFF-HOURS BUDGET · ~10h
          </text>
          <text
            x="48"
            y="448"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(255,255,255,0.55)"
            letterSpacing="1.5"
          >
            ACTUAL CONTIGUOUS PRESENCE · ~3h
          </text>
          <text
            x="752"
            y="430"
            textAnchor="end"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="10"
            fill="rgba(34,211,238,0.95)"
            letterSpacing="1.5"
          >
            DELTA · 7h paid invisibly
          </text>
          <text
            x="752"
            y="448"
            textAnchor="end"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="9"
            fill="rgba(255,255,255,0.4)"
            letterSpacing="1"
          >
            illustrative · 12 checks/day · 23-min recovery (Mark, 2008)
          </text>
        </g>
      </svg>
    </Frame>
  );
}
