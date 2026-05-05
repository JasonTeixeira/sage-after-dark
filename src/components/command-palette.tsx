"use client";

/**
 * CommandPalette — Cmd+K / Ctrl+K global search overlay.
 *
 * Loads the same /api/search-index used by the /search page (built at request
 * time from the corpus), then provides keyboard-first navigation:
 *   ↑/↓   move selection
 *   Enter open
 *   Esc   close
 *   /     focus input from anywhere
 *
 * Index loads lazily on first open — keeps initial bundle light. Subsequent
 * opens are instant (cached in memory).
 *
 * Also exposes "go to" pages (Start, Concepts, Numbers, Now, Archive) at the
 * top of an empty query so the palette doubles as global navigation.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Entry = {
  slug: string;
  pillar: string;
  template: string;
  title: string;
  dek: string;
  tags: string[];
  body: string;
  published: string;
  href: string;
};

type GoTo = { kind: "page"; label: string; href: string; hint: string };

const GOTO: GoTo[] = [
  { kind: "page", label: "Start here", href: "/start", hint: "/start" },
  { kind: "page", label: "Archive", href: "/archive", hint: "/archive" },
  { kind: "page", label: "Concepts", href: "/concepts", hint: "/concepts" },
  { kind: "page", label: "Numbers", href: "/numbers", hint: "/numbers" },
  { kind: "page", label: "Now", href: "/now", hint: "/now" },
  { kind: "page", label: "Best of", href: "/best", hint: "/best" },
  { kind: "page", label: "Reading", href: "/reading", hint: "/reading" },
  { kind: "page", label: "About", href: "/about", hint: "/about" },
];

function score(e: Entry, q: string): number {
  if (!q) return 0;
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const titleLow = e.title.toLowerCase();
  const dekLow = e.dek.toLowerCase();
  const tagsLow = e.tags.join(" ").toLowerCase();
  const bodyLow = e.body.toLowerCase();
  if (titleLow.includes(needle)) return 4;
  if (dekLow.includes(needle)) return 3;
  if (tagsLow.includes(needle)) return 2;
  if (bodyLow.includes(needle)) return 1;
  // token-level fallback
  const toks = needle.split(/\s+/).filter(Boolean);
  const hay = `${titleLow} ${dekLow} ${tagsLow} ${bodyLow}`;
  if (toks.every((t) => hay.includes(t))) return 0.5;
  return 0;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const [index, setIndex] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const loadIndex = useCallback(async () => {
    if (index || loading) return;
    setLoading(true);
    try {
      const r = await fetch("/api/search-index", { cache: "force-cache" });
      if (r.ok) {
        const data = (await r.json()) as { entries: Entry[] };
        setIndex(data.entries);
      }
    } catch {
      // silent — palette still works for goto pages
    } finally {
      setLoading(false);
    }
  }, [index, loading]);

  // Open hotkeys
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      const inField = tag === "INPUT" || tag === "TEXTAREA" || t?.isContentEditable;

      if (isMeta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (open) return;
      // "/" focuses palette only outside input fields
      if (e.key === "/" && !inField) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Load index on first open + autofocus
  useEffect(() => {
    if (!open) return;
    void loadIndex();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, loadIndex]);

  // Reset when reopening
  useEffect(() => {
    if (!open) {
      setQ("");
      setSel(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      // Show goto pages first, then 5 most recent posts
      const recent =
        index
          ?.slice()
          .sort(
            (a, b) =>
              new Date(b.published).getTime() - new Date(a.published).getTime(),
          )
          .slice(0, 5) ?? [];
      return {
        gotos: GOTO,
        posts: recent,
        empty: !!index && recent.length === 0,
      };
    }
    if (!index)
      return {
        gotos: GOTO.filter((g) =>
          g.label.toLowerCase().includes(trimmed.toLowerCase()),
        ),
        posts: [],
        empty: false,
      };
    const matchingGoto = GOTO.filter((g) =>
      `${g.label} ${g.hint}`.toLowerCase().includes(trimmed.toLowerCase()),
    );
    const matchingPosts = index
      .map((e) => ({ e, s: score(e, trimmed) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => {
        if (b.s !== a.s) return b.s - a.s;
        return new Date(b.e.published).getTime() - new Date(a.e.published).getTime();
      })
      .slice(0, 12)
      .map((x) => x.e);
    return {
      gotos: matchingGoto,
      posts: matchingPosts,
      empty: matchingGoto.length === 0 && matchingPosts.length === 0,
    };
  }, [q, index]);

  const flat = useMemo(() => {
    const list: Array<
      | { kind: "goto"; item: GoTo }
      | { kind: "post"; item: Entry }
    > = [];
    for (const g of results.gotos) list.push({ kind: "goto", item: g });
    for (const p of results.posts) list.push({ kind: "post", item: p });
    return list;
  }, [results]);

  // Clamp selection when results change
  useEffect(() => {
    if (sel >= flat.length) setSel(Math.max(0, flat.length - 1));
  }, [flat, sel]);

  const goSelected = useCallback(() => {
    const item = flat[sel];
    if (!item) return;
    const href = item.kind === "goto" ? item.item.href : item.item.href;
    setOpen(false);
    router.push(href);
  }, [flat, sel, router]);

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      goSelected();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[90] bg-ink-0/85 backdrop-blur-sm flex items-start justify-center pt-[10vh] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-2xl border border-cyan/40 bg-ink-1 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <span className="absolute -top-px -left-px w-2 h-2 border-t border-l border-cyan" />
        <span className="absolute -top-px -right-px w-2 h-2 border-t border-r border-cyan" />
        <span className="absolute -bottom-px -left-px w-2 h-2 border-b border-l border-cyan" />
        <span className="absolute -bottom-px -right-px w-2 h-2 border-b border-r border-cyan" />

        <header className="flex items-center px-4 py-3 border-b border-cyan/30">
          <span className="text-cyan font-mono text-sm mr-3 select-none">▸</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onInputKey}
            placeholder={loading ? "loading index…" : "search essays · type to filter · ⏎ open · esc close"}
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent outline-none border-0 text-bone caret-cyan font-mono text-sm placeholder:text-mute"
            aria-label="Search"
          />
          <kbd className="ml-3 hidden sm:inline-block font-mono text-[10px] uppercase tracking-[0.1em] text-mute border border-rule px-1.5 py-0.5">
            esc
          </kbd>
        </header>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {flat.length === 0 ? (
            <div className="px-3 py-8 text-center text-mute font-mono text-sm">
              {loading ? "loading…" : "no matches"}
            </div>
          ) : (
            <ul role="listbox">
              {results.gotos.length > 0 && (
                <li className="px-3 pt-2 pb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
                  ▸ go to
                </li>
              )}
              {results.gotos.map((g, i) => (
                <Item
                  key={`g-${g.href}`}
                  active={sel === i}
                  onMouseEnter={() => setSel(i)}
                  onClick={() => {
                    setOpen(false);
                    router.push(g.href);
                  }}
                >
                  <span className="text-bone">{g.label}</span>
                  <span className="text-mute font-mono text-[10px] ml-auto">
                    {g.hint}
                  </span>
                </Item>
              ))}

              {results.posts.length > 0 && (
                <li className="px-3 pt-3 pb-1 font-mono text-[9px] uppercase tracking-[0.14em] text-mute">
                  ▸ essays
                </li>
              )}
              {results.posts.map((p, i) => {
                const idx = results.gotos.length + i;
                return (
                  <Item
                    key={`p-${p.slug}`}
                    active={sel === idx}
                    onMouseEnter={() => setSel(idx)}
                    onClick={() => {
                      setOpen(false);
                      router.push(p.href);
                    }}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-bone truncate">{p.title}</span>
                      {p.dek && (
                        <span className="text-mute text-[11px] truncate font-sans">
                          {p.dek}
                        </span>
                      )}
                    </div>
                    <span className="text-mute font-mono text-[10px] ml-3 shrink-0">
                      /{p.pillar}
                    </span>
                  </Item>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between px-4 py-2 border-t border-cyan/30 font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          <span>
            <kbd className="text-cyan">↑↓</kbd> navigate ·{" "}
            <kbd className="text-cyan">⏎</kbd> open ·{" "}
            <kbd className="text-cyan">/</kbd> focus
          </span>
          <Link
            href="/search"
            onClick={() => setOpen(false)}
            className="text-cyan hover:underline"
          >
            full search →
          </Link>
        </footer>
      </div>
    </div>
  );
}

function Item({
  children,
  active,
  onMouseEnter,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onClick={onClick}
        role="option"
        aria-selected={active}
        className={`w-full text-left flex items-center gap-3 px-3 py-2 text-sm font-sans transition-colors ${
          active
            ? "bg-cyan/10 text-cyan border-l-2 border-cyan"
            : "border-l-2 border-transparent hover:bg-ink-2"
        }`}
      >
        <span
          className={`font-mono text-[10px] ${active ? "text-cyan" : "text-mute"} select-none`}
        >
          ▸
        </span>
        {children}
      </button>
    </li>
  );
}
