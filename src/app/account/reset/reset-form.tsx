"use client";

import { useMemo, useState } from "react";

function strengthScore(p: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;
  const score = Math.min(4, s) as 0 | 1 | 2 | 3 | 4;
  const labels = ["too short", "weak", "ok", "strong", "very strong"];
  return { score, label: labels[score] };
}

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const strength = useMemo(() => strengthScore(password), [password]);
  const matches = password.length > 0 && password === confirm;
  const canSubmit =
    password.length >= 8 && strength.score >= 2 && matches && !busy;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as {
          error?: string;
          reasons?: string[];
        };
        if (body.error === "expired") {
          setErr(
            "This link has been used or expired. Request a fresh reset link.",
          );
        } else if (body.error === "weak_password") {
          setErr(body.reasons?.[0] ?? "Choose a stronger password.");
        } else if (body.error === "invalid_token") {
          setErr("This link is invalid. Request a fresh one.");
        } else {
          setErr("Something went wrong. Try again.");
        }
        setBusy(false);
        return;
      }
      // Hard-nav so the new session cookie is read on the server.
      window.location.href = "/account?welcome=1";
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-rule rounded p-6 bg-ink/40 border-l-2 border-l-cyan grid gap-4"
    >
      <div>
        <label
          htmlFor="reset-password"
          className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
        >
          // new password
        </label>
        <input
          id="reset-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="at least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
          className="w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
        />
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={
                  "h-1 flex-1 rounded-sm " +
                  (i < strength.score
                    ? strength.score >= 3
                      ? "bg-cyan"
                      : strength.score === 2
                        ? "bg-amber-400"
                        : "bg-ember"
                    : "bg-rule")
                }
              />
            ))}
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
            // strength: <span className="text-bone">{strength.label}</span>
          </p>
        </div>
      </div>

      <div>
        <label
          htmlFor="reset-confirm"
          className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
        >
          // confirm password
        </label>
        <input
          id="reset-confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="type it again"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          disabled={busy}
          className="w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
        />
        {confirm.length > 0 && !matches && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-ember">
            ▸ passwords don&apos;t match
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
      >
        {busy ? "saving…" : "set password →"}
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
