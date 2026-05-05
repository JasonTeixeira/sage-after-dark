"use client";

/**
 * Tabbed login form.
 *
 * Two modes: "password" (default) and "magic" (single-use email link).
 * Both POST to their respective API routes; on password success we hard-
 * navigate to `next` so the new session cookie is honored on the server.
 *
 * Security note: we never disclose whether an email exists. Both
 * "invalid credentials" (password) and "if on file" (magic) read the same
 * to a probing client.
 */

import { useState } from "react";

type Tab = "password" | "magic";

export function LoginForm({ next }: { next?: string | null } = {}) {
  const [tab, setTab] = useState<Tab>("password");
  return (
    <div className="border border-rule rounded bg-ink/40 border-l-2 border-l-cyan">
      <div className="flex border-b border-rule font-mono text-[11px] uppercase tracking-[0.08em]">
        <button
          type="button"
          onClick={() => setTab("password")}
          className={
            "flex-1 px-4 py-3 transition-colors " +
            (tab === "password"
              ? "text-cyan border-b-2 border-cyan -mb-px"
              : "text-mute hover:text-bone")
          }
          aria-pressed={tab === "password"}
        >
          // password
        </button>
        <button
          type="button"
          onClick={() => setTab("magic")}
          className={
            "flex-1 px-4 py-3 transition-colors " +
            (tab === "magic"
              ? "text-cyan border-b-2 border-cyan -mb-px"
              : "text-mute hover:text-bone")
          }
          aria-pressed={tab === "magic"}
        >
          // email link
        </button>
      </div>
      <div className="p-6">
        {tab === "password" ? (
          <PasswordTab next={next ?? null} />
        ) : (
          <MagicTab next={next ?? null} />
        )}
      </div>
    </div>
  );
}

function PasswordTab({ next }: { next: string | null }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "err">("idle");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setErr(null);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        setState("err");
        setErr(
          r.status === 401
            ? "Email or password is incorrect."
            : "Something went wrong. Try again.",
        );
        return;
      }
      // Hard nav so the new cookie is read on the server.
      window.location.href = next ?? "/account";
    } catch {
      setState("err");
      setErr("Network error. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label
          htmlFor="login-email"
          className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
        >
          // email
        </label>
        <input
          id="login-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label
            htmlFor="login-password"
            className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan"
          >
            // password
          </label>
          <a
            href="/account/forgot"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute hover:text-cyan transition-colors"
          >
            forgot?
          </a>
        </div>
        <input
          id="login-password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={state === "loading"}
          className="w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
      >
        {state === "loading" ? "signing in…" : "sign in →"}
      </button>
      {err && (
        <p
          role="alert"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember"
        >
          ▸ {err}
        </p>
      )}
    </form>
  );
}

function MagicTab({ next }: { next: string | null }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "err">(
    "idle",
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    try {
      const r = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next: next ?? undefined }),
      });
      setState(r.ok ? "ok" : "err");
    } catch {
      setState("err");
    }
  }

  if (state === "ok") {
    return (
      <div role="status">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2">
          ▸ link dispatched
        </p>
        <p className="text-bone leading-relaxed">
          If <span className="font-mono">{email}</span> is on file, a sign-in
          link is on the way. Check your inbox — it expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div>
        <label
          htmlFor="magic-email"
          className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
        >
          // email
        </label>
        <input
          id="magic-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading"}
          className="w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={state === "loading"}
        className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
      >
        {state === "loading" ? "sending…" : "send link →"}
      </button>
      {state === "err" && (
        <p
          role="alert"
          className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember"
        >
          ▸ network error · try again
        </p>
      )}
    </form>
  );
}
