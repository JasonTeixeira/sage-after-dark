"use client";

/**
 * Multi-step signup wizard.
 *
 * Step 1: account creation (email + password) — POST /api/auth/signup
 * Step 2: profile (name + referrer)            — POST /api/auth/profile
 * Step 3: welcome screen with onward links
 *
 * The session cookie is set at step 1, so a hard reload at any time would
 * leave the user signed-in. We hard-nav at the end of step 3 so the
 * server reads the cookie correctly.
 */

import { useMemo, useState } from "react";

const REFERRERS = [
  "Search engine",
  "Hacker News",
  "Twitter / X",
  "LinkedIn",
  "Friend or colleague",
  "Newsletter",
  "Podcast",
  "Other",
];

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

export function SignupWizard({ next }: { next: string }) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [referrer, setReferrer] = useState("");
  const [referrerOther, setReferrerOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const strength = useMemo(() => strengthScore(password), [password]);
  const canSubmitStep1 =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    password.length >= 8 &&
    strength.score >= 2;

  async function submitStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmitStep1 || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => ({}))) as {
          error?: string;
          reasons?: string[];
        };
        if (r.status === 409 || body.error === "email_taken") {
          setErr(
            "An account already exists for that email. Try signing in instead.",
          );
        } else if (body.error === "weak_password") {
          setErr(body.reasons?.[0] ?? "Choose a stronger password.");
        } else if (body.error === "invalid_email") {
          setErr("That email looks invalid.");
        } else {
          setErr("Something went wrong. Try again.");
        }
        setBusy(false);
        return;
      }
      setStep(2);
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    const finalReferrer =
      referrer === "Other" ? referrerOther.trim() : referrer;
    try {
      const r = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, referrer: finalReferrer }),
      });
      if (!r.ok) {
        // Non-fatal — they can edit later.
        console.warn("[signup] profile save failed");
      }
      setStep(3);
    } catch {
      console.warn("[signup] profile network error");
      setStep(3);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Stepper step={step} />
      <div className="border border-rule rounded p-6 bg-ink/40 border-l-2 border-l-cyan mt-6">
        {step === 1 && (
          <form onSubmit={submitStep1} className="grid gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan">
              ▸ step 1 / 3 · account
            </p>
            <div>
              <label
                htmlFor="su-email"
                className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
              >
                // email
              </label>
              <input
                id="su-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                className="w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="su-password"
                className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
              >
                // password
              </label>
              <input
                id="su-password"
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
              <StrengthBar score={strength.score} label={strength.label} />
            </div>
            <button
              type="submit"
              disabled={!canSubmitStep1 || busy}
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
            >
              {busy ? "creating…" : "continue →"}
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
        )}

        {step === 2 && (
          <form onSubmit={submitStep2} className="grid gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan">
              ▸ step 2 / 3 · about you
            </p>
            <div>
              <label
                htmlFor="su-name"
                className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2"
              >
                // your name
              </label>
              <input
                id="su-name"
                type="text"
                required
                maxLength={80}
                autoComplete="name"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                className="w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2">
                // where did you hear about sage after dark?
              </label>
              <div className="grid sm:grid-cols-2 gap-2">
                {REFERRERS.map((r) => {
                  const active = referrer === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReferrer(r)}
                      className={
                        "text-left font-mono text-[12px] px-3 py-2 border rounded transition-colors " +
                        (active
                          ? "border-cyan text-cyan bg-cyan/5"
                          : "border-rule text-bone hover:border-cyan/60")
                      }
                    >
                      {active ? "▸ " : "  "}
                      {r}
                    </button>
                  );
                })}
              </div>
              {referrer === "Other" && (
                <input
                  type="text"
                  maxLength={200}
                  placeholder="tell us more…"
                  value={referrerOther}
                  onChange={(e) => setReferrerOther(e.target.value)}
                  disabled={busy}
                  className="mt-3 w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors disabled:opacity-50"
                />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy || !name.trim() || !referrer}
                className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
              >
                {busy ? "saving…" : "continue →"}
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={busy}
                className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-rule text-mute hover:text-bone transition-colors disabled:opacity-50 rounded"
              >
                skip
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="grid gap-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan">
              ▸ step 3 / 3 · you&apos;re in
            </p>
            <h2 className="font-display text-2xl text-bone">
              Welcome{name ? `, ${name.split(" ")[0]}` : ""}.
            </h2>
            <p className="text-bone/90 leading-relaxed">
              Your account is live and you&apos;re signed in. From here you
              can read every public essay, and members get the rest. No more
              email round-trips — your password works for every future
              sign-in.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 mt-2">
              <a
                href={next}
                className="border border-cyan text-cyan rounded px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] hover:bg-cyan hover:text-ink transition-colors"
              >
                ▸ go to account
              </a>
              <a
                href="/start"
                className="border border-rule text-bone rounded px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] hover:border-cyan hover:text-cyan transition-colors"
              >
                ▸ start reading
              </a>
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
              // want full access? become a member to unlock all tutorials.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps: Array<{ n: 1 | 2 | 3; label: string }> = [
    { n: 1, label: "account" },
    { n: 2, label: "about you" },
    { n: 3, label: "welcome" },
  ];
  return (
    <ol className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.08em]">
      {steps.map((s, i) => {
        const done = step > s.n;
        const active = step === s.n;
        return (
          <li key={s.n} className="flex items-center gap-3">
            <span
              className={
                "inline-flex items-center justify-center w-6 h-6 border rounded-sm " +
                (done
                  ? "border-cyan text-cyan bg-cyan/10"
                  : active
                    ? "border-cyan text-cyan"
                    : "border-rule text-mute")
              }
              aria-current={active ? "step" : undefined}
            >
              {done ? "✓" : s.n}
            </span>
            <span
              className={
                done || active ? "text-bone" : "text-mute"
              }
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-rule" aria-hidden>
                ─────
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StrengthBar({
  score,
  label,
}: {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
}) {
  const colors = [
    "bg-rule",
    "bg-ember",
    "bg-amber-400",
    "bg-cyan",
    "bg-cyan",
  ];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={
              "h-1 flex-1 rounded-sm " +
              (i < score ? colors[score] : "bg-rule")
            }
          />
        ))}
      </div>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
        // strength: <span className="text-bone">{label}</span>
        {score < 2 && (
          <span className="text-ember">
            {" "}
            · need 8+ chars and a mix of letters, numbers, or symbols
          </span>
        )}
      </p>
    </div>
  );
}
