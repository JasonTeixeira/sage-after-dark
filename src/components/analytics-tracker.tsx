"use client";

/**
 * AnalyticsTracker — privacy-first client tracker.
 *
 * Mounted once in the root layout. On every route change:
 *   - sends a pageview
 *   - watches scroll milestones (25/50/75%) — each fires once per route
 *   - fires `read_complete` at 80% scroll IF on a /<pillar>/<slug> page
 *   - fires a `dwell_60s` event after 60s of active time (visible tab)
 *
 * Respects:
 *   - DNT / globalPrivacyControl → all tracking disabled
 *   - prefers-reduced-data via localStorage opt-out (`sad:no-track`)
 *
 * Uses `navigator.sendBeacon` with fetch fallback.
 */

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const PILLARS = new Set([
  "build",
  "signal",
  "mind",
  "world",
  "taste",
  "learning",
  "teach",
]);

function isOptedOut(): boolean {
  if (typeof navigator === "undefined") return true;
  // Honor Do Not Track and Global Privacy Control
  // @ts-expect-error globalPrivacyControl not yet in lib.dom
  if (navigator.globalPrivacyControl === true) return true;
  if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") return true;
  try {
    if (window.localStorage.getItem("sad:no-track") === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

function send(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (isOptedOut()) return;
  const body = JSON.stringify(payload);
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const ok = navigator.sendBeacon("/api/analytics/track", blob);
      if (ok) return;
    }
  } catch {
    /* fall through to fetch */
  }
  fetch("/api/analytics/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

function classifyPath(path: string): {
  pillar: string;
  template: string;
  slug: string;
  isPost: boolean;
} {
  const parts = path.split("?")[0]!.split("#")[0]!.split("/").filter(Boolean);
  if (parts.length >= 2 && PILLARS.has(parts[0]!)) {
    return { pillar: parts[0]!, template: "", slug: parts[1]!, isPost: true };
  }
  if (parts[0] === "dispatch" && parts[1]) {
    return { pillar: "signal", template: "dispatch", slug: parts[1]!, isPost: true };
  }
  return { pillar: "", template: "", slug: "", isPost: false };
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const fired = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!pathname) return;
    fired.current = new Set(); // reset milestones per route

    const meta = classifyPath(pathname);

    send({
      kind: "pageview",
      path: pathname,
      pillar: meta.pillar,
      template: meta.template,
      slug: meta.slug,
      referrer: typeof document !== "undefined" ? document.referrer : "",
    });

    // ---------- scroll milestones + completion ----------
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const doc = document.documentElement;
        const scrolled = window.scrollY + window.innerHeight;
        const total = Math.max(doc.scrollHeight, 1);
        const pct = scrolled / total;
        const fire = (name: string) => {
          if (fired.current.has(name)) return;
          fired.current.add(name);
          send({
            kind: "event",
            name,
            path: pathname,
            slug: meta.slug,
          });
        };
        if (pct >= 0.25) fire("scroll_25");
        if (pct >= 0.5) fire("scroll_50");
        if (pct >= 0.75) fire("scroll_75");
        if (meta.isPost && pct >= 0.8) fire("read_complete");
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ---------- 60s dwell ----------
    let dwellMs = 0;
    let lastTick = performance.now();
    let dwellFired = false;
    const tick = () => {
      const now = performance.now();
      if (document.visibilityState === "visible") {
        dwellMs += now - lastTick;
      }
      lastTick = now;
      if (!dwellFired && dwellMs >= 60_000) {
        dwellFired = true;
        send({ kind: "event", name: "dwell_60s", path: pathname, slug: meta.slug });
      }
    };
    const dwellTimer = window.setInterval(tick, 5_000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearInterval(dwellTimer);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}
