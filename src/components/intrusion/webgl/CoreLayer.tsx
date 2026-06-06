"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// CoreLayer — the seam between the 403 skin and the living world.
//
// Decides ONCE, client-side, whether to spin up WebGL at all:
//  - prefers-reduced-motion: reduce  → render NOTHING here. A calm static
//    CSS radial core-glow (defined in intrusion.css, `.core-static`) sits
//    behind the skin instead. No three.js, no rAF, no motion.
//  - otherwise → dynamically import the heavy WebGL canvas (ssr:false) so it
//    never touches the server bundle or SSR HTML.
//
// Mounted inside .intrusion-root at a z-index below #wall (the decoy skin),
// above the root ink background. The skin handles all input; this only paints.
// ---------------------------------------------------------------------------

const CoreCanvas = dynamic(() => import("./CoreCanvas"), {
  ssr: false,
  loading: () => null,
});

export function CoreLayer() {
  const [mode, setMode] = useState<"pending" | "webgl" | "static">("pending");

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setMode(reduce ? "static" : "webgl");
  }, []);

  // Static fallback: a pure-CSS radial glow, no 3D, no motion.
  if (mode === "static") {
    return <div className="core-static" aria-hidden="true" />;
  }

  if (mode === "webgl") {
    return (
      <div className="core-layer" aria-hidden="true">
        <CoreCanvas />
      </div>
    );
  }

  // While deciding (one tick), paint the static glow so there's never a
  // black void flash, then swap to WebGL.
  return <div className="core-static" aria-hidden="true" />;
}
