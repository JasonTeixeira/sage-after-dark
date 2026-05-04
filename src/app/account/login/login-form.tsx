"use client";

/**
 * Login form — POSTs to /api/auth/request, shows confirmation in place.
 *
 * We always show "if your email is on file, a link is on the way" so we don't
 * leak which addresses have accounts.
 */

import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const r = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!r.ok) {
        setState("err");
      } else {
        setState("ok");
      }
    } catch {
      setState("err");
    }
  }

  if (state === "ok") {
    return (
      <div
        role="status"
        className="border border-cyan/40 bg-cyan/5 px-5 py-5"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2">
          ▸ link dispatched
        </p>
        <p className="text-bone leading-relaxed">
          If <span className="font-mono">{email}</span> is on file, a sign-in
          link is on the way. Check your inbox — it expires in 15 minutes.
        </p>
        <p className="mt-3 text-bone/70 text-[14px]">
          No email arriving? It might be in spam, or the address might not
          have a membership yet.{" "}
          <a className="text-cyan underline decoration-cyan/40 underline-offset-2" href="/membership">
            See the membership
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-rule rounded p-6 bg-ink/40 border-l-2 border-l-cyan"
    >
      <label
        htmlFor="login-email"
        className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
      >
        // email
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="login-email"
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
          {state === "loading" ? "sending…" : "send link →"}
        </button>
      </div>
      {state === "err" && (
        <p
          role="alert"
          className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-ember"
        >
          ▸ network error · try again
        </p>
      )}
    </form>
  );
}
