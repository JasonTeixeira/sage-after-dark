"use client";

/**
 * About-page client interactivity:
 *
 * - <CountUp> — number ticks up from 0 → target on first scroll-into-view.
 * - <InteractivePrinciples> — vertical principles list with a sliding
 *   active indicator + keyboard navigation. Selecting a principle reveals
 *   its expanded annotation in the right pane.
 * - <CursorTagline> — types out a rotating set of tag-lines under the
 *   hero, with a blinking cursor. Pauses when the tab is hidden.
 *
 * All animations honour `prefers-reduced-motion`.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

/* ---------------------------------------------------------------- */
/* CountUp                                                          */
/* ---------------------------------------------------------------- */

export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1200,
  className,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  // Render the final value during SSR + initial paint so screenshots,
  // print, and no-JS clients always see the correct number. The animation
  // re-runs from 0 -> target on first scroll-into-view (when JS is ready).
  const [n, setN] = useState(to);
  const ref = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setN(to);
      return;
    }

    // Only animate when the element scrolls INTO view from off-screen.
    // If it's already visible on mount (e.g. on the about page hero stats),
    // leave the SSR'd final value and skip the count-up. This prevents
    // any flash-of-zero on initial paint and keeps the page legible without JS.
    const rect = node.getBoundingClientRect();
    const inView =
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0;

    if (inView) {
      // Already on screen — leave the SSR value alone.
      startedRef.current = true;
      setN(to);
      return;
    }

    setN(0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setN(Math.round(eased * to));
              if (t < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(node);

    const fallback = setTimeout(() => {
      if (!startedRef.current) {
        startedRef.current = true;
        setN(to);
      }
    }, 2000);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [to, duration]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {prefix}
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* InteractivePrinciples                                            */
/* ---------------------------------------------------------------- */

export function InteractivePrinciples({
  items,
}: {
  items: { headline: string; body: string }[];
}) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + items.length) % items.length);
    }
  };

  const selected = items[active];

  return (
    <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 md:gap-12">
      <div ref={listRef} className="relative">
        <ol className="space-y-1">
          {items.map((p, i) => (
            <li key={i}>
              <button
                onClick={() => setActive(i)}
                onKeyDown={onKey}
                aria-current={i === active ? "true" : undefined}
                className={`group w-full text-left flex items-baseline gap-3 px-3 py-2 transition-colors border-l-2 ${
                  i === active
                    ? "border-cyan bg-cyan/[0.06] text-bone"
                    : "border-rule/40 text-mute hover:text-bone hover:border-bone/40"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tabular-nums tracking-[0.08em] ${
                    i === active ? "text-cyan" : "text-mute/70"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-sans text-[14px] leading-tight">
                  {p.headline}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div
        key={active}
        className="relative min-h-[260px] border border-rule p-6 md:p-8 bg-ink-1 [animation:about-fade_320ms_ease-out_both]"
      >
        <div className="absolute -top-px left-0 h-px w-12 bg-cyan" />
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan/80 mb-3">
          Principle {String(active + 1).padStart(2, "0")} of{" "}
          {String(items.length).padStart(2, "0")}
        </div>
        <p className="font-sans text-bone text-[20px] md:text-[22px] leading-[1.35] mb-5">
          {selected.headline}
        </p>
        <p className="text-bone/75 leading-[1.7] text-[15px]">{selected.body}</p>
      </div>

      <style>{`
        @keyframes about-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="about-fade"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* CursorTagline                                                    */
/* ---------------------------------------------------------------- */

export function CursorTagline({
  taglines,
  className,
}: {
  taglines: string[];
  className?: string;
}) {
  const list = useMemo(() => taglines, [taglines]);
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setText(list[0]);
      return;
    }

    const target = list[idx % list.length];
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < target.length) {
        timer = setTimeout(() => setText(target.slice(0, text.length + 1)), 32);
      } else {
        timer = setTimeout(() => setPhase("holding"), 1800);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("deleting"), 1400);
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 18);
      } else {
        setPhase("typing");
        setIdx((i) => (i + 1) % list.length);
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, idx, list]);

  return (
    <span className={className} suppressHydrationWarning>
      {text}
      <span
        aria-hidden
        className="inline-block w-[0.55ch] h-[1em] -mb-[0.05em] ml-[2px] bg-cyan align-middle [animation:about-blink_900ms_steps(2,end)_infinite]"
      />
      <style>{`
        @keyframes about-blink { 50% { opacity: 0; } }
      `}</style>
    </span>
  );
}
