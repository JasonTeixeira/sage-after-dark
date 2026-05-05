"use client";

/**
 * RotationManager — add new rotation items, list current ones,
 * and deactivate any with a click. Optimistic UI.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminRotationItem, RotationKind } from "@/lib/living";

const KINDS: RotationKind[] = [
  "book",
  "music",
  "film",
  "listening",
  "watching",
  "reading",
];

const KIND_LABEL: Record<RotationKind, string> = {
  book: "Books (taste)",
  music: "Music (taste)",
  film: "Films (taste)",
  listening: "Listening (now)",
  watching: "Watching (now)",
  reading: "Reading (shelves)",
};

export function RotationManager({
  initial,
}: {
  initial: AdminRotationItem[];
}) {
  const [items, setItems] = useState<AdminRotationItem[]>(initial);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Form state
  const [kind, setKind] = useState<RotationKind>("book");
  const [title, setTitle] = useState("");
  const [by, setBy] = useState("");
  const [year, setYear] = useState("");
  const [note, setNote] = useState("");
  const [shelf, setShelf] = useState("");
  const [rank, setRank] = useState("100");
  const [adding, setAdding] = useState<"idle" | "saving" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (adding === "saving") return;
    setAdding("saving");
    setErrMsg(null);
    try {
      const r = await fetch("/api/admin/rotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title: title.trim(),
          by: by.trim(),
          year: year.trim() || null,
          note: note.trim() || null,
          shelf: shelf.trim() || null,
          rank: Number(rank) || 100,
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json.ok) {
        setAdding("err");
        setErrMsg(json.error ?? `http_${r.status}`);
        return;
      }
      setAdding("ok");
      setTitle("");
      setBy("");
      setYear("");
      setNote("");
      setShelf("");
      // Refresh server data so the new item appears.
      startTransition(() => router.refresh());
    } catch (e) {
      setAdding("err");
      setErrMsg(e instanceof Error ? e.message : "network");
    }
  }

  async function onDeactivate(id: string) {
    if (busyId) return;
    if (!confirm("Deactivate this item? It will stop appearing on the site."))
      return;
    setBusyId(id);
    try {
      const r = await fetch(
        `/api/admin/rotation?id=${encodeURIComponent(id)}`,
        { method: "DELETE" },
      );
      if (!r.ok) {
        alert("Could not deactivate. Try again.");
      } else {
        // Optimistic update
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, active: false } : it)),
        );
        startTransition(() => router.refresh());
      }
    } finally {
      setBusyId(null);
    }
  }

  // Group by kind, active first.
  const grouped = KINDS.map((k) => ({
    kind: k,
    items: items
      .filter((it) => it.kind === k)
      .sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return a.rank - b.rank;
      }),
  }));

  return (
    <div className="space-y-12">
      {/* Add form */}
      <section className="border border-cyan/30 p-6 bg-cyan/5">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan mb-4">
          // add new item
        </h3>
        <form onSubmit={onAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>kind</Label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as RotationKind)}
              className={inputClass}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>rank (lower = sooner)</Label>
            <input
              type="number"
              value={rank}
              onChange={(e) => setRank(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <Label>title</Label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
              maxLength={200}
            />
          </div>
          <div>
            <Label>by line (author / artist / director)</Label>
            <input
              value={by}
              onChange={(e) => setBy(e.target.value)}
              className={inputClass}
              maxLength={200}
            />
          </div>
          <div>
            <Label>year</Label>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={inputClass}
              maxLength={12}
            />
          </div>
          <div>
            <Label>shelf (reading kind only: now/up-next/holding/abandoned/recent)</Label>
            <input
              value={shelf}
              onChange={(e) => setShelf(e.target.value)}
              className={inputClass}
              maxLength={60}
            />
          </div>
          <div>
            <Label>note (one-line)</Label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
              maxLength={500}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={adding === "saving"}
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
            >
              {adding === "saving" ? "adding…" : "add item →"}
            </button>
            {adding === "ok" && (
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan">
                ▸ added
              </span>
            )}
            {adding === "err" && (
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ember">
                ▸ error: {errMsg ?? "unknown"}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* Lists by kind */}
      {grouped.map(({ kind, items }) => (
        <section key={kind}>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan mb-3">
            // {KIND_LABEL[kind]} ({items.filter((i) => i.active).length} active)
          </h3>
          {items.length === 0 ? (
            <p className="text-mute text-sm font-mono pb-4">No items yet.</p>
          ) : (
            <ul className="divide-y divide-rule/40">
              {items.map((it) => (
                <li
                  key={it.id}
                  className={`py-3 flex items-baseline gap-4 ${it.active ? "" : "opacity-50"}`}
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute w-6 tabular-nums">
                    {String(it.rank).padStart(3, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-bone truncate">
                      {it.title}
                      {it.by_line && (
                        <span className="text-mute"> &middot; {it.by_line}</span>
                      )}
                      {it.year_label && (
                        <span className="text-mute font-mono text-[11px]">
                          {" "}
                          ({it.year_label})
                        </span>
                      )}
                    </div>
                    {(it.shelf || it.note) && (
                      <div className="text-mute text-[12px] font-mono mt-1">
                        {it.shelf && (
                          <span className="text-cyan/80">[{it.shelf}]</span>
                        )}{" "}
                        {it.note}
                      </div>
                    )}
                  </div>
                  {it.active ? (
                    <button
                      onClick={() => onDeactivate(it.id)}
                      disabled={busyId === it.id}
                      className="font-mono text-[10px] uppercase tracking-[0.12em] text-ember hover:underline disabled:opacity-50"
                    >
                      {busyId === it.id ? "…" : "deactivate"}
                    </button>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                      inactive
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

const inputClass =
  "w-full bg-ink border border-rule rounded px-3 py-2 font-mono text-[13px] text-bone placeholder:text-mute focus:outline-none focus:border-cyan transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-[0.12em] text-mute mb-1">
      {children}
    </label>
  );
}
