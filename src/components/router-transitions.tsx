"use client";

/**
 * RouterTransitions — opt-in cross-route View Transitions API integration.
 *
 * Approach: intercept same-origin <a> clicks, suppress the default navigation,
 * call router.push wrapped in document.startViewTransition. Falls through to
 * native navigation when:
 *   - the View Transitions API is unsupported
 *   - the user prefers reduced motion
 *   - the link has a target, modifier keys are held, or it's a download / hash
 *
 * No effect on first paint or for users with reduced-motion enabled.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type DocumentWithVT = Document & {
  startViewTransition?: (cb: () => void) => unknown;
};

export function RouterTransitions() {
  const router = useRouter();

  useEffect(() => {
    const doc = document as DocumentWithVT;
    if (typeof doc.startViewTransition !== "function") return;

    const reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    function isInternalNav(a: HTMLAnchorElement, e: MouseEvent): string | null {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return null;
      }
      if (a.target && a.target !== "" && a.target !== "_self") return null;
      if (a.hasAttribute("download")) return null;
      const href = a.getAttribute("href");
      if (!href) return null;
      // Skip mailto / tel / external / hash-only / data
      if (/^(mailto:|tel:|sms:|javascript:|data:)/i.test(href)) return null;
      try {
        const url = new URL(a.href, window.location.href);
        if (url.origin !== window.location.origin) return null;
        // Pure hash on same path: let the browser scroll natively.
        if (
          url.pathname === window.location.pathname &&
          url.search === window.location.search &&
          url.hash
        ) {
          return null;
        }
        return url.pathname + url.search + url.hash;
      } catch {
        return null;
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const a = target.closest("a") as HTMLAnchorElement | null;
      if (!a) return;
      const path = isInternalNav(a, e);
      if (!path) return;

      e.preventDefault();
      const transition = doc.startViewTransition?.(() => {
        router.push(path);
      });
      // Best-effort: if startViewTransition returned a promise-like, swallow.
      if (
        transition &&
        typeof (transition as { ready?: Promise<unknown> }).ready?.catch ===
          "function"
      ) {
        (transition as { ready: Promise<unknown> }).ready.catch(() => {
          /* ignore */
        });
      }
    }

    document.addEventListener("click", onClick, { capture: false });
    return () => document.removeEventListener("click", onClick, false);
  }, [router]);

  return null;
}
