"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CoreScene } from "./CoreScene";

// ---------------------------------------------------------------------------
// CoreCanvas — the lazy, client-only WebGL host that sits BEHIND the 403 skin.
//
// Responsibilities:
//  - Cap dpr [1, 1.5]; lower on mobile.
//  - Pause the render loop when the tab is hidden (frameloop = "never").
//  - Drive the `surge` beat (0..1) that the SentientCore + NeuralField use to
//    "push through" — both on the opening blaze and on recurring cracks. The
//    CSS reveal layer reads the same timing via the document attribute set
//    here, so the screen-skin crack and the core surge stay in lockstep.
//
// This file is ONLY ever loaded via a dynamic ssr:false import, so three/r3f
// never reach the server bundle or the SSR HTML.
// ---------------------------------------------------------------------------

type Quality = "high" | "mobile";

function detectQuality(): Quality {
  if (typeof navigator === "undefined") return "high";
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 820;
  const lowMem =
    typeof (navigator as { deviceMemory?: number }).deviceMemory === "number" &&
    (navigator as { deviceMemory?: number }).deviceMemory! <= 4;
  return coarse || narrow || lowMem ? "mobile" : "high";
}

export function CoreCanvas() {
  const surgeRef = useRef(0);
  const [visible, setVisible] = useState(true);
  const [quality] = useState<Quality>(() =>
    typeof window === "undefined" ? "high" : detectQuality(),
  );

  // Pause the loop when the tab is hidden — no GPU churn in the background.
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // ── Surge choreography ────────────────────────────────────────────────
  // Animates surgeRef along a beat envelope and mirrors the phase onto a
  // document attribute so the CSS crack-reveal can sync to the exact moment
  // the core "blazes through".
  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    const root = document.documentElement;

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    // Animate surge from a..b over `dur` ms, set a reveal phase attribute.
    function ramp(from: number, to: number, dur: number, phase: string) {
      return new Promise<void>((resolve) => {
        root.setAttribute("data-core-phase", phase);
        const start = performance.now();
        const step = (now: number) => {
          if (cancelled) return resolve();
          const t = Math.min(1, (now - start) / dur);
          surgeRef.current = from + (to - from) * ease(t);
          if (t < 1) raf = requestAnimationFrame(step);
          else resolve();
        };
        raf = requestAnimationFrame(step);
      });
    }

    const wait = (ms: number) =>
      new Promise<void>((r) => {
        const id = setTimeout(r, ms);
        // best-effort cancel
        if (cancelled) clearTimeout(id);
      });

    async function run() {
      // ── First 3 seconds: the WOW. ───────────────────────────────────
      // 0–0.4s building instability (small surge, micro-glitch on skin)
      await ramp(0, 0.18, 400, "tremble");
      // 0.4–1.1s VIOLENT failure → core BLAZES through
      await ramp(0.18, 1.0, 700, "shatter");
      // 1.1–2.2s system fights to keep skin on — surge ebbs, flickers
      await ramp(1.0, 0.45, 700, "fight");
      await ramp(0.45, 0.65, 200, "fight");
      await ramp(0.65, 0.32, 200, "fight");
      // 2.2–3s the 403 reasserts; core still bleeding through the seams
      await ramp(0.32, 0.12, 800, "veil");

      // ── Ongoing: a crack opens every ~6–10s, then re-seals. ─────────
      while (!cancelled) {
        await wait(6000 + Math.random() * 4000);
        if (cancelled) break;
        await ramp(0.12, 0.85, 450, "crack");
        await ramp(0.85, 0.12, 900, "reseal");
      }
    }

    run();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      root.removeAttribute("data-core-phase");
    };
  }, []);

  return (
    <Canvas
      className="core-canvas"
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        stencil: false,
        depth: true,
      }}
      dpr={quality === "mobile" ? [1, 1.25] : [1, 1.5]}
      camera={{ position: [0, 0, 5.4], fov: 55, near: 0.1, far: 100 }}
      frameloop={visible ? "always" : "never"}
      style={{ position: "absolute", inset: 0 }}
    >
      <CoreScene quality={quality} surgeRef={surgeRef} />
    </Canvas>
  );
}

export default CoreCanvas;
