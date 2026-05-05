"use client";

/**
 * NowEditForm — client form that POSTs to /api/admin/now.
 */

import { useState } from "react";

type Initial = {
  status: string;
  location: string;
  this_week: string;
  not_doing: string;
};

export function NowEditForm({ initial }: { initial: Initial }) {
  const [status, setStatus] = useState(initial.status);
  const [location, setLocation] = useState(initial.location);
  const [thisWeek, setThisWeek] = useState(initial.this_week);
  const [notDoing, setNotDoing] = useState(initial.not_doing);
  const [state, setState] = useState<"idle" | "saving" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "saving") return;
    setState("saving");
    setErrMsg(null);
    try {
      const r = await fetch("/api/admin/now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          location,
          this_week: thisWeek,
          not_doing: notDoing,
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json.ok) {
        setState("err");
        setErrMsg(json.error ?? `http_${r.status}`);
      } else {
        setState("ok");
      }
    } catch (e) {
      setState("err");
      setErrMsg(e instanceof Error ? e.message : "network");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-3xl">
      <Field label="status" hint="One sentence. What you're working on now.">
        <textarea
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          rows={2}
          className={inputClass}
          required
          maxLength={500}
        />
      </Field>

      <Field label="location" hint="City &middot; mode (e.g. heads-down).">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={inputClass}
          required
          maxLength={200}
        />
      </Field>

      <Field
        label="this week"
        hint="One bullet per line. Up to 12. Numbered automatically."
      >
        <textarea
          value={thisWeek}
          onChange={(e) => setThisWeek(e.target.value)}
          rows={6}
          className={inputClass}
        />
      </Field>

      <Field
        label="not doing"
        hint="One bullet per line. The discipline of focus."
      >
        <textarea
          value={notDoing}
          onChange={(e) => setNotDoing(e.target.value)}
          rows={5}
          className={inputClass}
        />
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={state === "saving"}
          className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
        >
          {state === "saving" ? "saving…" : "save →"}
        </button>
        {state === "ok" && (
          <span
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan"
            role="status"
          >
            ▸ saved &middot; live in seconds
          </span>
        )}
        {state === "err" && (
          <span
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember"
            role="alert"
          >
            ▸ error: {errMsg ?? "unknown"}
          </span>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-1">
        // {label}
      </label>
      {hint && (
        <p className="text-mute text-[12px] mb-2 font-mono">{hint}</p>
      )}
      {children}
    </div>
  );
}
