"use client";

/**
 * EssayStickyBar — bottom-of-screen subscribe bar that appears once the
 * reader scrolls past 50% of the essay. Dismissible, remembered in
 * localStorage so it doesn't pester returning readers.
 *
 * Tactical mono styling, single-line on desktop, stacks on mobile.
 */

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const DISMISS_KEY = "sad:essay-bar-dismissed";

export function EssayStickyBar({
  source = "essay_sticky_bar",
}: {
  source?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );
  const [msg, setMsg] = useState("");
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      dismissedRef.current = true;
      return;
    }
    function onScroll() {
      if (dismissedRef.current) return;
      const doc = document.documentElement;
      const max = (doc.scrollHeight - doc.clientHeight) || 1;
      const pct = window.scrollY / max;
      if (pct > 0.5) setVisible(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function dismiss() {
    setVisible(false);
    dismissedRef.current = true;
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMsg("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await r.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (r.ok && data.ok) {
        setState("ok");
        setMsg("Subscribed. Check your inbox.");
        setEmail("");
        setTimeout(dismiss, 2400);
      } else {
        setState("err");
        setMsg(data.error ?? "Try again.");
      }
    } catch {
      setState("err");
      setMsg("Network error.");
    }
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Subscribe to Sage After Dark"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t border-rule bg-ink-0/95 backdrop-blur-md",
        "[print-color-adjust:exact] data-[print-hide=true]:hidden",
      )}
      data-print-hide
    >
      <div className="max-w-[88rem] mx-auto px-4 sm:px-8 py-3 flex items-center gap-3">
        <span className="hidden sm:flex h-2 w-2 rounded-full bg-cyan animate-pulse shrink-0" />
        <p className="text-[13px] text-bone hidden md:block">
          Liked this?{" "}
          <span className="text-mute">
            The next transmission lands Sunday.
          </span>
        </p>
        <form onSubmit={onSubmit} className="flex-1 flex gap-2 ml-auto max-w-md">
          <label htmlFor="sticky-email" className="sr-only">
            Email
          </label>
          <input
            id="sticky-email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === "loading" || state === "ok"}
            className="flex-1 bg-ink-1 border border-rule px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan disabled:opacity-50 rounded-sm"
          />
          <button
            type="submit"
            disabled={state === "loading" || state === "ok"}
            className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 bg-cyan text-ink hover:bg-bone transition-colors disabled:opacity-50 rounded-sm"
          >
            {state === "loading"
              ? "…"
              : state === "ok"
                ? "✓ subscribed"
                : "▸ subscribe"}
          </button>
        </form>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss subscribe bar"
          className="text-faint hover:text-bone text-lg leading-none px-2 -mr-2"
        >
          ×
        </button>
      </div>
      {state === "err" && msg ? (
        <div className="max-w-[88rem] mx-auto px-4 sm:px-8 pb-2 -mt-1">
          <p
            role="alert"
            className="text-[12px] font-mono uppercase tracking-[0.08em] text-ember"
          >
            ⚠ {msg}
          </p>
        </div>
      ) : null}
    </div>
  );
}
