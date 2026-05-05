"use client";

/**
 * FeaturedManager — pin/unpin posts to slots.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminFeaturedRow, FeaturedSlot } from "@/lib/living";

const SLOTS: FeaturedSlot[] = [
  "home_hero",
  "editor_pick",
  "popular_read",
  "member_only",
];

const SLOT_LABEL: Record<FeaturedSlot, string> = {
  home_hero: "Home hero",
  editor_pick: "Editor's pick",
  popular_read: "Popular read",
  member_only: "Member-only",
};

type SlugRow = { slug: string; title: string };

export function FeaturedManager({
  initial,
  slugs,
}: {
  initial: AdminFeaturedRow[];
  slugs: SlugRow[];
}) {
  const [items, setItems] = useState<AdminFeaturedRow[]>(initial);
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Add form state
  const [slot, setSlot] = useState<FeaturedSlot>("home_hero");
  const [slug, setSlug] = useState("");
  const [rank, setRank] = useState("100");
  const [adding, setAdding] = useState<"idle" | "saving" | "ok" | "err">(
    "idle",
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function onPin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (adding === "saving") return;
    setAdding("saving");
    setErrMsg(null);
    try {
      const r = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot, slug: slug.trim(), rank: Number(rank) || 100 }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json.ok) {
        setAdding("err");
        setErrMsg(json.error ?? `http_${r.status}`);
        return;
      }
      setAdding("ok");
      setSlug("");
      startTransition(() => router.refresh());
    } catch (e) {
      setAdding("err");
      setErrMsg(e instanceof Error ? e.message : "network");
    }
  }

  async function onUnpin(id: string) {
    if (busyId) return;
    if (!confirm("Unpin this post?")) return;
    setBusyId(id);
    try {
      const r = await fetch(`/api/admin/featured?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!r.ok) {
        alert("Could not unpin. Try again.");
      } else {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, active: false } : it)),
        );
        startTransition(() => router.refresh());
      }
    } finally {
      setBusyId(null);
    }
  }

  const grouped = SLOTS.map((s) => ({
    slot: s,
    items: items
      .filter((it) => it.slot === s)
      .sort((a, b) => {
        if (a.active !== b.active) return a.active ? -1 : 1;
        return a.rank - b.rank;
      }),
  }));

  return (
    <div className="space-y-12">
      <section className="border border-cyan/30 p-6 bg-cyan/5">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan mb-4">
          // pin a post
        </h3>
        <form onSubmit={onPin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>slot</Label>
            <select
              value={slot}
              onChange={(e) => setSlot(e.target.value as FeaturedSlot)}
              className={inputClass}
            >
              {SLOTS.map((s) => (
                <option key={s} value={s}>
                  {SLOT_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label>post slug</Label>
            <input
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              list="post-slugs"
              className={inputClass}
              placeholder="trayd-week-1-progress"
            />
            <datalist id="post-slugs">
              {slugs.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </datalist>
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
          <div className="md:col-span-3 flex items-center gap-4">
            <button
              type="submit"
              disabled={adding === "saving"}
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-2 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors disabled:opacity-50 rounded"
            >
              {adding === "saving" ? "pinning…" : "pin →"}
            </button>
            {adding === "ok" && (
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan">
                ▸ pinned
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

      {grouped.map(({ slot, items }) => (
        <section key={slot}>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan mb-3">
            // {SLOT_LABEL[slot]} ({items.filter((i) => i.active).length} pinned)
          </h3>
          {items.length === 0 ? (
            <p className="text-mute text-sm font-mono pb-4">Nothing pinned.</p>
          ) : (
            <ul className="divide-y divide-rule/40">
              {items.map((it) => {
                const post = slugs.find((s) => s.slug === it.slug);
                return (
                  <li
                    key={it.id}
                    className={`py-3 flex items-baseline gap-4 ${it.active ? "" : "opacity-50"}`}
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute w-6 tabular-nums">
                      {String(it.rank).padStart(3, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-bone truncate">
                        {post?.title ?? it.slug}
                      </div>
                      <div className="font-mono text-[11px] text-mute mt-1">
                        /p/{it.slug}
                      </div>
                    </div>
                    {it.active ? (
                      <button
                        onClick={() => onUnpin(it.id)}
                        disabled={busyId === it.id}
                        className="font-mono text-[10px] uppercase tracking-[0.12em] text-ember hover:underline disabled:opacity-50"
                      >
                        {busyId === it.id ? "…" : "unpin"}
                      </button>
                    ) : (
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                        unpinned
                      </span>
                    )}
                  </li>
                );
              })}
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
