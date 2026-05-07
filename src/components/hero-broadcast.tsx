"use client";

/**
 * HeroBroadcast — rotating transmission graphic for the home hero card.
 *
 * Five variants, picked deterministically on first paint (seeded by the
 * day-of-year + a small client-side roll). The user can flip through them
 * with the // TRANSMISSION · 1/5 · NEXT control. All variants share the
 * same outer frame so swaps look like channel changes, not layout shifts.
 *
 * SSR safety:
 *   - The initial pick is deterministic (no Math.random / new Date at first
 *     paint). After mount, a one-shot effect picks a fresh index so repeat
 *     visitors who refresh see different things, without a hydration mismatch.
 */

import { useEffect, useMemo, useRef, useState } from "react";

type BroadcastVariant = {
  id: string;
  label: string;
  Component: React.ComponentType<BroadcastViewProps>;
};

type BroadcastViewProps = {
  active: boolean;
};

type Post = {
  slug: string;
  pillar: string;
  title: string;
  dek?: string;
  drop?: string;
  published?: string;
};

export type HeroBroadcastProps = {
  /** A small list of recent posts. Used by several variants. */
  posts: Post[];
  /** Optional initial seed for the variant picker (e.g. day-of-year). */
  initialSeed?: number;
};

/* ─── Variant registry ─────────────────────────────────────────── */

const VARIANTS: BroadcastVariant[] = [
  { id: "crt",          label: "CRT TERMINAL",       Component: CRTTerminal },
  { id: "oscilloscope", label: "OSCILLOSCOPE",       Component: Oscilloscope },
  { id: "constellation",label: "CONSTELLATION MAP",  Component: Constellation },
  { id: "observatory",  label: "OBSERVATORY DIAL",   Component: Observatory },
  { id: "signature",    label: "SIGNATURE DIAGRAM",  Component: Signature },
];

/* ─── Outer wrapper ───────────────────────────────────────────── */

export function HeroBroadcast({ posts, initialSeed = 0 }: HeroBroadcastProps) {
  // Deterministic initial index — no hydration mismatch.
  const [idx, setIdx] = useState<number>(
    Math.abs(initialSeed) % VARIANTS.length,
  );
  // After hydration, roll a fresh index so refreshes vary.
  useEffect(() => {
    const t = setTimeout(() => {
      setIdx(Math.floor(Math.random() * VARIANTS.length));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Provide posts to variants via closure (the Component prop is fixed).
  // We do this by rendering the active component with the posts in scope.
  const Active = VARIANTS[idx].Component;

  return (
    <div className="flex flex-col h-full">
      <div
        className="relative h-44 mx-5 border border-rule overflow-hidden"
        data-broadcast-stage
      >
        {/* All variants live in the same stage; only the active one is
            visible. We keep them mounted so animations stay smooth when you
            cycle. Inactive ones are pointer-events:none + opacity 0. */}
        {VARIANTS.map((v, i) => {
          const Component = v.Component;
          return (
            <div
              key={v.id}
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: i === idx ? 1 : 0,
                pointerEvents: i === idx ? "auto" : "none",
              }}
              aria-hidden={i !== idx}
            >
              <Component active={i === idx} />
              {/* shared subtle scanline overlay for cohesion */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "repeating-linear-gradient(to bottom, rgba(255,255,255,0.012) 0 1px, transparent 1px 3px)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          );
        })}

        {/* corner ticks — drawn once for all variants */}
        <Corner pos="tl" />
        <Corner pos="tr" />
        <Corner pos="bl" />
        <Corner pos="br" />

        {/* Pass posts down via context-free prop drilling: each variant
            can read the posts via the closure component below.
            We deliberately do not use React context here to keep the
            module tree-shake-friendly. */}
        <PostsBridge posts={posts} />
      </div>

      {/* Rotation control */}
      <div
        className="mx-5 mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-faint select-none"
      >
        <span className="flex items-center gap-2">
          <span className="text-cyan">//</span>
          <span>TRANSMISSION · {idx + 1}/{VARIANTS.length}</span>
          <span className="text-rule-hi">·</span>
          <span className="text-mute">{VARIANTS[idx].label}</span>
        </span>
        <button
          type="button"
          onClick={() => setIdx((i) => (i + 1) % VARIANTS.length)}
          className="text-cyan hover:text-bone transition-colors"
          aria-label="Next transmission variant"
        >
          NEXT ▸
        </button>
      </div>
    </div>
  );
}

/* ─── Posts bridge ────────────────────────────────────────────── */
/* Variants read posts via a tiny module-scoped store updated on every
   render of the wrapper. This avoids React context but keeps types tidy. */

let _postsStore: Post[] = [];
function PostsBridge({ posts }: { posts: Post[] }) {
  // Update synchronously during render so children that mount in the same
  // commit see the latest list.
  _postsStore = posts;
  return null;
}
function usePosts(): Post[] {
  return _postsStore;
}

/* ─── Shared atoms ─────────────────────────────────────────────── */

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const cls = {
    tl: "top-1 left-1",
    tr: "top-1 right-1 rotate-90",
    bl: "bottom-1 left-1 -rotate-90",
    br: "bottom-1 right-1 rotate-180",
  }[pos];
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      className={`absolute ${cls} pointer-events-none`}
      aria-hidden
    >
      <path
        d="M 0 4 L 0 0 L 4 0"
        fill="none"
        stroke="rgba(34,211,238,0.65)"
        strokeWidth="1"
      />
    </svg>
  );
}

/* ───────────────────────────────────────────────────────────────
   VARIANT 1 — CRT TERMINAL
   Live-typing terminal that prints a small excerpt of the latest
   essay's opening, with cursor blink + faint scan lines + status bar.
   ─────────────────────────────────────────────────────────────── */

function CRTTerminal({ active }: BroadcastViewProps) {
  const posts = usePosts();
  const latest = posts[0];
  const lines = useMemo(() => buildTerminalLines(latest), [latest]);
  const fullText = lines.join("\n");

  const [typed, setTyped] = useState<string>("");
  const idxRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    idxRef.current = 0;
    setTyped("");
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      idxRef.current = Math.min(fullText.length, idxRef.current + 2);
      setTyped(fullText.slice(0, idxRef.current));
      if (idxRef.current < fullText.length) {
        setTimeout(tick, 22);
      }
    };
    const t0 = setTimeout(tick, 220);
    return () => {
      cancelled = true;
      clearTimeout(t0);
    };
  }, [active, fullText]);

  // Render
  return (
    <div className="absolute inset-0 bg-[rgba(0,12,16,0.55)]">
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(to bottom, rgba(34,211,238,0.06) 0 1px, transparent 1px 3px)",
        }}
      />
      {/* vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* terminal text */}
      <pre
        className="absolute inset-0 m-0 p-3 pr-3 pb-7 font-mono text-[10.5px] leading-[14px] text-cyan/90 whitespace-pre-wrap overflow-hidden"
        style={{ fontVariantLigatures: "none" }}
      >
        {typed}
        <span className="inline-block w-[7px] h-[12px] bg-cyan/90 align-text-bottom animate-pulse ml-0.5" />
      </pre>
      {/* status bar */}
      <div className="absolute bottom-0 left-0 right-0 h-5 px-2 flex items-center justify-between bg-[rgba(0,32,42,0.85)] border-t border-cyan/30 font-mono text-[9px] uppercase tracking-[0.08em] text-cyan/80">
        <span className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
          <span>tty1</span>
          <span className="text-cyan/50">·</span>
          <span>ssh sage@afterdark</span>
        </span>
        <span className="flex items-center gap-2 text-cyan/70">
          <span>buf {2143}</span>
          <span className="text-cyan/40">·</span>
          <span>sig −42dBm</span>
        </span>
      </div>
    </div>
  );
}

function buildTerminalLines(p?: Post): string[] {
  const slug = p?.slug ?? "—";
  const pillar = (p?.pillar ?? "world").toUpperCase();
  const title = p?.title ?? "Sage After Dark";
  const drop = p?.drop ?? p?.dek ?? "After hours, the work gets quieter and more honest.";
  // Truncate drop to ~220 chars so the type animation finishes before viewers leave.
  const trimmed =
    drop.length > 220 ? drop.slice(0, 217).trimEnd() + "…" : drop;
  return [
    `$ cat /var/log/sage/${slug}.md`,
    `# ${title}`,
    `# pillar=${pillar}  status=published  signal=clean`,
    ``,
    trimmed,
  ];
}

/* ───────────────────────────────────────────────────────────────
   VARIANT 2 — OSCILLOSCOPE
   Animated carrier wave + skyline + threshold + frequency overlay.
   Refined version of the original SignalPanel.
   ─────────────────────────────────────────────────────────────── */

function Oscilloscope({ active }: BroadcastViewProps) {
  // animated phase, only ticks while active
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const loop = (t: number) => {
      if (cancelled) return;
      setPhase(((t - start) / 1000) % 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active]);

  // Build a stable skyline (deterministic) and animate a sine carrier on top.
  const bars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const seed = (i * 9301 + 49297) % 233280;
        return 12 + (seed % 60);
      }),
    [],
  );

  // Carrier path
  const points: string[] = [];
  for (let x = 0; x <= 480; x += 6) {
    const y =
      88 +
      Math.sin((x / 480) * Math.PI * 4 + phase * 1.5) * 14 +
      Math.sin((x / 480) * Math.PI * 11 + phase * 2.4) * 4;
    points.push(`${x === 0 ? "M" : "L"} ${x} ${y.toFixed(2)}`);
  }
  const carrier = points.join(" ");

  return (
    <svg
      viewBox="0 0 480 176"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <pattern id="osc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1C232E" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="osc-fade" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop offset="0%" stopColor="rgba(34,211,238,0)" />
          <stop offset="40%" stopColor="rgba(34,211,238,0.9)" />
          <stop offset="60%" stopColor="rgba(34,211,238,0.9)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </linearGradient>
      </defs>
      <rect width="480" height="176" fill="url(#osc-grid)" />
      {/* Skyline */}
      {bars.map((h, i) => (
        <rect
          key={i}
          x={i * 10}
          y={176 - h}
          width="6"
          height={h}
          fill="#0A2C33"
          stroke="#00E5FF"
          strokeOpacity="0.4"
          strokeWidth="0.5"
        />
      ))}
      {/* horizontal threshold marker */}
      <line
        x1="0"
        y1="88"
        x2="480"
        y2="88"
        stroke="rgba(34,211,238,0.25)"
        strokeWidth="0.5"
        strokeDasharray="2 4"
      />
      {/* animated carrier */}
      <path d={carrier} fill="none" stroke="url(#osc-fade)" strokeWidth="1.25" />
      {/* Reticle */}
      <g transform="translate(240, 88)">
        <circle r="20" fill="none" stroke="#00E5FF" strokeWidth="1" opacity="0.55" />
        <circle r="3" fill="#00E5FF" />
        <line x1="-30" y1="0" x2="-22" y2="0" stroke="#00E5FF" strokeWidth="1" />
        <line x1="22" y1="0" x2="30" y2="0" stroke="#00E5FF" strokeWidth="1" />
        <line x1="0" y1="-30" x2="0" y2="-22" stroke="#00E5FF" strokeWidth="1" />
        <line x1="0" y1="22" x2="0" y2="30" stroke="#00E5FF" strokeWidth="1" />
      </g>
      {/* frequency overlay */}
      <g>
        <text
          x="10"
          y="16"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(34,211,238,0.85)"
          letterSpacing="1"
        >
          FREQ · 102.7 SAGE
        </text>
        <text
          x="470"
          y="16"
          textAnchor="end"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="9"
          fill="rgba(34,211,238,0.55)"
          letterSpacing="1"
        >
          LIVE
        </text>
      </g>
    </svg>
  );
}

/* ───────────────────────────────────────────────────────────────
   VARIANT 3 — CONSTELLATION MAP
   Latest essays as nodes in a starfield. Deterministic positions
   (no jitter on hydration), with a settling animation that draws the
   connecting lines in over the first ~1.2s.
   ─────────────────────────────────────────────────────────────── */

function Constellation({ active }: BroadcastViewProps) {
  const posts = usePosts();
  // Up to 18 posts as nodes
  const nodes = useMemo(() => {
    const list = posts.slice(0, 18);
    // deterministic positions: hash of slug → (x, y) in plotting area
    return list.map((p, i) => {
      const h = hashSlug(p.slug);
      // distribute across the panel with a slight bias toward center
      const x = 30 + ((h % 4200) / 4200) * 420;
      const y = 25 + (((h >> 8) % 1300) / 1300) * 126;
      const isLatest = i === 0;
      return { ...p, x, y, isLatest, idx: i };
    });
  }, [posts]);

  // Edges: connect each node to its 2 nearest neighbors (deterministic).
  const edges = useMemo(() => {
    const out: Array<{ a: number; b: number; d: number }> = [];
    for (let i = 0; i < nodes.length; i++) {
      const dists = nodes
        .map((n, j) => ({
          j,
          d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y),
        }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 2);
      dists.forEach((d) => {
        if (i < d.j) out.push({ a: i, b: d.j, d: d.d });
      });
    }
    return out;
  }, [nodes]);

  // Settling animation: draw lines in over time using strokeDashoffset.
  const [t, setT] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let cancelled = false;
    const start = performance.now();
    const loop = (now: number) => {
      if (cancelled) return;
      const dt = Math.min(1, (now - start) / 1200);
      setT(dt);
      if (dt < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [active]);

  return (
    <svg
      viewBox="0 0 480 176"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="ctr-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.7)" />
          <stop offset="100%" stopColor="rgba(34,211,238,0)" />
        </radialGradient>
        <pattern id="ctr-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#10171F" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="480" height="176" fill="url(#ctr-grid)" />
      {/* edges */}
      {edges.map((e, i) => {
        const a = nodes[e.a];
        const b = nodes[e.b];
        if (!a || !b) return null;
        // animate line draw via stroke dasharray
        const len = e.d;
        const dash = `${len * t} ${len * (1 - t) + 0.001}`;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="rgba(34,211,238,0.35)"
            strokeWidth="0.6"
            strokeDasharray={dash}
          />
        );
      })}
      {/* nodes */}
      {nodes.map((n) => (
        <g key={n.slug}>
          {n.isLatest && (
            <circle cx={n.x} cy={n.y} r="14" fill="url(#ctr-glow)" />
          )}
          <circle
            cx={n.x}
            cy={n.y}
            r={n.isLatest ? 3 : 1.6}
            fill={n.isLatest ? "#7CF6FF" : "rgba(255,255,255,0.6)"}
          />
        </g>
      ))}
      {/* corner labels */}
      <text
        x="10"
        y="14"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        fill="rgba(34,211,238,0.85)"
        letterSpacing="1"
      >
        // CONSTELLATION · {nodes.length} POSTS
      </text>
      <text
        x="470"
        y="14"
        textAnchor="end"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        fill="rgba(255,255,255,0.45)"
        letterSpacing="1"
      >
        ◉ LATEST
      </text>
    </svg>
  );
}

function hashSlug(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

/* ───────────────────────────────────────────────────────────────
   VARIANT 4 — OBSERVATORY DIAL
   24-hour radial dial with current local time as a sweeping hand,
   plus tiny readouts: moon phase, ink, buffer.
   ─────────────────────────────────────────────────────────────── */

function Observatory({ active }: BroadcastViewProps) {
  // Live time as a hand. Update once a minute.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, [active]);

  const cx = 240;
  const cy = 88;
  const r = 62;

  // Hand angle: 0..24h → 0..360deg. 00:00 at top.
  const hourFraction = now ? (now.getHours() + now.getMinutes() / 60) / 24 : 0;
  const angle = hourFraction * 2 * Math.PI - Math.PI / 2;
  const handX = cx + Math.cos(angle) * (r - 6);
  const handY = cy + Math.sin(angle) * (r - 6);

  // 24 ticks
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * 2 * Math.PI - Math.PI / 2;
    const inner = i % 6 === 0 ? r - 9 : r - 4;
    return {
      i,
      x1: cx + Math.cos(a) * (r - 1),
      y1: cy + Math.sin(a) * (r - 1),
      x2: cx + Math.cos(a) * inner,
      y2: cy + Math.sin(a) * inner,
      major: i % 6 === 0,
    };
  });

  return (
    <svg
      viewBox="0 0 480 176"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <radialGradient id="obs-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(34,211,238,0.06)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>
      <rect width="480" height="176" fill="rgba(0,8,11,0.4)" />
      <rect x={cx - 80} y={cy - 80} width="160" height="160" fill="url(#obs-bg)" />

      {/* outer ring */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(34,211,238,0.55)" strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r - 14} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <circle cx={cx} cy={cy} r={r - 28} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth="0.5" />

      {/* ticks */}
      {ticks.map((t) => (
        <line
          key={t.i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          stroke={t.major ? "rgba(34,211,238,0.85)" : "rgba(255,255,255,0.35)"}
          strokeWidth="1"
        />
      ))}
      {/* hour labels (00 06 12 18) */}
      {[0, 6, 12, 18].map((h) => {
        const a = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const x = cx + Math.cos(a) * (r + 12);
        const y = cy + Math.sin(a) * (r + 12) + 3;
        return (
          <text
            key={h}
            x={x}
            y={y}
            textAnchor="middle"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="9"
            fill="rgba(255,255,255,0.55)"
          >
            {h.toString().padStart(2, "0")}
          </text>
        );
      })}

      {/* hand — only when client time exists, to avoid SSR jitter */}
      {now && (
        <>
          <line
            x1={cx}
            y1={cy}
            x2={handX}
            y2={handY}
            stroke="rgba(34,211,238,0.95)"
            strokeWidth="1.5"
          />
          <circle cx={cx} cy={cy} r="2.5" fill="rgba(34,211,238,0.95)" />
        </>
      )}

      {/* readouts on the left */}
      <g>
        <text x="10" y="20" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(34,211,238,0.85)" letterSpacing="1">
          // OBSERVATORY
        </text>
        <text x="10" y="44" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          MOON · WAXING GIB
        </text>
        <text x="10" y="58" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          INK  · DRYING
        </text>
        <text x="10" y="72" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          BUF  · 14 OPEN TABS
        </text>
        <text x="10" y="86" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          ROOM · 19.4°C
        </text>
      </g>

      {/* readouts on the right */}
      <g>
        <text x="470" y="20" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(34,211,238,0.85)" letterSpacing="1">
          24H · LOCAL
        </text>
        <text x="470" y="44" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          STATUS · WRITING
        </text>
        <text x="470" y="58" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          QUEUE  · 3 POSTS
        </text>
        <text x="470" y="72" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          MUSIC  · ENO
        </text>
        <text x="470" y="86" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.55)" letterSpacing="1">
          SIGNAL · CLEAN
        </text>
      </g>

      {/* current time bottom */}
      <text
        x="240"
        y="170"
        textAnchor="middle"
        fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
        fontSize="9"
        fill="rgba(34,211,238,0.85)"
        letterSpacing="2"
      >
        {now
          ? `${now.getHours().toString().padStart(2, "0")}:${now
              .getMinutes()
              .toString()
              .padStart(2, "0")} · LOCAL`
          : "—— · ——"}
      </text>
    </svg>
  );
}

/* ───────────────────────────────────────────────────────────────
   VARIANT 5 — SIGNATURE DIAGRAM
   The signature SVG of the latest curriculum essay, scaled into the
   panel. We use a stylized mini version (decay curve + nodes) that
   visually echoes DiagramSkillHalfLife / DiagramTasteMoat without
   pulling the full 800x460 component into a 480x176 frame.
   ─────────────────────────────────────────────────────────────── */

function Signature({ active }: BroadcastViewProps) {
  void active;
  // A condensed signature: a half-life decay curve from upper-left to
  // lower-right, with a "taste" plateau curve above it. Three labeled
  // nodes mark inflection points — same DNA as the curriculum diagrams.

  // Plot area: x ∈ [50, 460], y ∈ [30, 150]
  const xMap = (t: number) => 50 + (t / 10) * 410;
  const yMap = (v: number) => 150 - (v / 100) * 120;

  const decay: Array<[number, number]> = Array.from({ length: 11 }, (_, t) => [
    t,
    100 * Math.exp(-0.32 * t),
  ]);
  const taste: Array<[number, number]> = Array.from({ length: 11 }, (_, t) => [
    t,
    100 * Math.exp(-0.04 * t),
  ]);

  const decayPath = decay
    .map(([t, v], i) => `${i === 0 ? "M" : "L"} ${xMap(t)} ${yMap(v)}`)
    .join(" ");
  const tastePath = taste
    .map(([t, v], i) => `${i === 0 ? "M" : "L"} ${xMap(t)} ${yMap(v)}`)
    .join(" ");

  // crossover marker
  let crossT = 6;
  for (let i = 0; i < decay.length; i++) {
    if (taste[i][1] > decay[i][1]) {
      crossT = decay[i][0];
      break;
    }
  }

  return (
    <svg
      viewBox="0 0 480 176"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <pattern id="sig-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#10171F" strokeWidth="0.5" />
        </pattern>
        <linearGradient id="sig-decay-fill" x1="0%" x2="0%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect width="480" height="176" fill="url(#sig-grid)" />

      {/* baseline + axis */}
      <line x1="50" y1="150" x2="460" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
      <line x1="50" y1="30" x2="50" y2="150" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />

      {/* decay area fill */}
      <path
        d={`${decayPath} L 460 150 L 50 150 Z`}
        fill="url(#sig-decay-fill)"
      />
      {/* curves */}
      <path d={decayPath} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.2" />
      <path d={tastePath} fill="none" stroke="rgba(34,211,238,0.95)" strokeWidth="1.4" />

      {/* crossover marker */}
      <line
        x1={xMap(crossT)}
        y1="30"
        x2={xMap(crossT)}
        y2="150"
        stroke="rgba(34,211,238,0.4)"
        strokeWidth="0.6"
        strokeDasharray="2 3"
      />

      {/* labels */}
      <text x="60" y="46" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(34,211,238,0.85)" letterSpacing="1">
        // SIGNATURE · HALF-LIFE
      </text>
      <text x="460" y="46" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.55)" letterSpacing="1">
        TASTE
      </text>
      <text x="460" y="146" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="9" fill="rgba(255,255,255,0.55)" letterSpacing="1">
        TECHNIQUE
      </text>
      <text x={xMap(crossT) + 4} y={42} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(34,211,238,0.85)" letterSpacing="1">
        t½
      </text>

      {/* axis labels */}
      <text x="50" y="170" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.4)">today</text>
      <text x="460" y="170" textAnchor="end" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="8" fill="rgba(255,255,255,0.4)">+10y</text>
    </svg>
  );
}
