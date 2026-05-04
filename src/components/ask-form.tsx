"use client";

import { useState } from "react";

type State = "idle" | "submitting" | "success" | "error";

export function AskForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      question: String(fd.get("question") ?? ""),
      from: String(fd.get("from") ?? ""),
      anonymous: fd.get("anonymous") === "on",
      // honeypot
      website: String(fd.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong.");
      }
      setState("success");
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="border border-cyan/40 bg-ink-1 p-8">
        <p className="font-display text-cyan text-sm uppercase tracking-wider mb-3">
          // RECEIVED
        </p>
        <h3 className="font-sans text-bone text-2xl mb-3">
          Question landed. Thank you.
        </h3>
        <p className="text-bone/80 leading-relaxed">
          I read every one. If yours becomes an essay, you'll see it here. If it
          gets a direct answer, you'll see it in your inbox.
        </p>
        <button
          onClick={() => setState("idle")}
          className="mt-6 text-xs uppercase tracking-wider text-cyan hover:underline"
        >
          Ask another →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-label="Ask a question">
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] opacity-0"
        aria-hidden="true"
      />

      <label className="block">
        <span className="block font-display text-sm mb-1">Your question</span>
        <span className="block text-xs text-mute mb-2">
          Specific beats hypothetical.
        </span>
        <textarea
          name="question"
          required
          rows={6}
          placeholder="What's the one question you actually want answered?"
          className="w-full px-3 py-2 bg-ink-1 border border-rule focus:border-cyan focus:outline-none font-mono text-sm resize-y text-bone"
        />
      </label>

      <label className="block">
        <span className="block font-display text-sm mb-1">
          Email (optional)
        </span>
        <span className="block text-xs text-mute mb-2">
          Only used to send you a direct reply, if I send one.
        </span>
        <input
          type="email"
          name="from"
          placeholder="you@example.com"
          className="w-full px-3 py-2 bg-ink-1 border border-rule focus:border-cyan focus:outline-none font-mono text-sm text-bone"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-bone/80">
        <input type="checkbox" name="anonymous" className="accent-cyan" />
        Don't quote me by name if you publish a response.
      </label>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={state === "submitting"}
          className="px-5 py-2 bg-cyan text-ink-0 uppercase tracking-wider text-xs font-display hover:bg-cyan/90 transition-colors disabled:opacity-50"
        >
          {state === "submitting" ? "Sending…" : "Send question"}
        </button>
        {error && (
          <p className="text-xs text-pillar-signal" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
