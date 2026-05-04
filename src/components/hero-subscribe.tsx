"use client";

/**
 * HeroSubscribe — premium one-line email capture for the home hero.
 *
 * Design intent: feels like a tactical CLI input, not a Mailchimp form.
 *   [ you@domain.com                ] [ ▸ Get the next transmission ]
 *
 * Single field, single button, single line on desktop. Stacks on mobile.
 * Inline success state ("● Subscribed. Check your inbox.") replaces the form.
 * Subtle "what you'll get" microcopy below.
 */

import { useState } from "react";
import { cn } from "@/lib/cn";

export type HeroSubscribeProps = {
  /** Source attribution sent to /api/subscribe (e.g. "home_hero"). */
  source?: string;
  className?: string;
  /** Microcopy under the input. Defaults to the studio promise. */
  caption?: string;
};

export function HeroSubscribe({
  source = "home_hero",
  className,
  caption = "Sundays · one essay or one field note · no growth-hacks · unsubscribe in one click.",
}: HeroSubscribeProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

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
        setMsg("Subscribed. Check your inbox to confirm.");
        setEmail("");
      } else {
        setState("err");
        setMsg(data.error ?? "Something went wrong. Try again.");
      }
    } catch {
      setState("err");
      setMsg("Network error. Try again.");
    }
  }

  if (state === "ok") {
    return (
      <div
        role="status"
        className={cn(
          "border border-cyan/40 bg-cyan/[0.04] px-5 py-4 flex items-center gap-3",
          className,
        )}
      >
        <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
        <p className="text-bone text-[15px]">
          {msg}{" "}
          <span className="text-mute">
            (the founding window is now open — you&apos;re subscriber{" "}
            <span className="text-cyan">001+</span>)
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <form
        onSubmit={onSubmit}
        className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-stretch border border-rule focus-within:border-cyan/60 transition-colors bg-ink-1/40"
      >
        <label htmlFor="hero-email" className="sr-only">
          Email address
        </label>
        <span
          aria-hidden
          className="hidden sm:flex items-center pl-4 pr-1 font-mono text-[12px] uppercase tracking-[0.1em] text-faint border-r border-rule"
        >
          $
        </span>
        <input
          id="hero-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="flex-1 bg-transparent px-4 py-3 font-mono text-[14px] text-bone placeholder:text-mute focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="font-mono text-[12px] uppercase tracking-[0.1em] px-5 py-3 bg-cyan text-ink hover:bg-bone transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {state === "loading" ? "Sending\u2026" : "▸ Get the next transmission"}
        </button>
      </form>
      <p className="mt-3 text-[12px] text-mute leading-snug">
        {caption}
      </p>
      {state === "err" && msg ? (
        <p
          role="alert"
          className="mt-2 text-[12px] font-mono uppercase tracking-[0.08em] text-ember"
        >
          ⚠ {msg}
        </p>
      ) : null}
    </div>
  );
}
