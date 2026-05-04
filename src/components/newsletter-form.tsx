"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export type NewsletterFormProps = {
  source?: string;
  /** "card" = framed card · "inline" = compact one-liner */
  variant?: "card" | "inline";
  className?: string;
};

export function NewsletterForm({
  source = "site",
  variant = "card",
  className,
}: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string>("");

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
        setMsg("Subscribed. Check your inbox for confirmation.");
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

  if (variant === "inline") {
    return (
      <form
        onSubmit={onSubmit}
        className={cn("flex flex-col sm:flex-row gap-2", className)}
      >
        <label htmlFor={`nl-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nl-${source}`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="flex-1 bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
        >
          {state === "loading" ? "..." : "subscribe"}
        </button>
        {msg ? (
          <p
            role={state === "err" ? "alert" : "status"}
            aria-live="polite"
            className={cn(
              "font-mono text-[11px] uppercase tracking-[0.08em] mt-1 sm:mt-0 sm:ml-3 sm:self-center",
              state === "ok" ? "text-cyan" : state === "err" ? "text-ember" : "text-mute",
            )}
          >
            {msg}
          </p>
        ) : null}
      </form>
    );
  }

  // card variant
  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "border border-rule rounded p-6 bg-ink/40",
        "border-l-2 border-l-cyan",
        className,
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2">
        // dispatches
      </p>
      <h3 className="font-sans text-bone text-[20px] leading-tight mb-2">
        Get the late-night email.
      </h3>
      <p className="text-bone/70 text-[14px] leading-relaxed mb-4">
        One letter per week. Essays, tutorials, and the occasional dispatch.
        No tracking, no growth-hacking. Unsubscribe in one click.
      </p>
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor={`nlc-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`nlc-${source}`}
          type="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="flex-1 bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
        >
          {state === "loading" ? "sending..." : "subscribe →"}
        </button>
      </div>
      {msg ? (
        <p
          role={state === "err" ? "alert" : "status"}
          aria-live="polite"
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.08em] mt-3",
            state === "ok" ? "text-cyan" : state === "err" ? "text-ember" : "text-mute",
          )}
        >
          {msg}
        </p>
      ) : null}
    </form>
  );
}
