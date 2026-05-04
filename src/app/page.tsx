import { pillar } from "@/lib/tokens";

const swatches = [
  { name: "INK 0", hex: "#05070A", role: "Page background" },
  { name: "INK 1", hex: "#0A0E14", role: "Surfaces" },
  { name: "INK 2", hex: "#11161E", role: "Elevated" },
  { name: "RULE", hex: "#1C232E", role: "Hairlines" },
  { name: "BONE", hex: "#E8E6E0", role: "Primary text" },
  { name: "MUTE", hex: "#8A8F98", role: "Secondary" },
  { name: "CYAN", hex: "#00E5FF", role: "Accent · CTAs" },
  { name: "EMBER", hex: "#F59E0B", role: "Live · WIP" },
];

const pillarList: { key: keyof typeof pillar; label: string; desc: string }[] = [
  { key: "build", label: "//build", desc: "Engineering, architecture, the work itself" },
  { key: "signal", label: "//signal", desc: "Status, dispatches, /now updates" },
  { key: "mind", label: "//mind", desc: "Essays, theses, what I believe" },
  { key: "world", label: "//world", desc: "Industry, observations, the broader weather" },
  { key: "taste", label: "//taste", desc: "Music, film, design — the obsessions" },
  { key: "learning", label: "//learning", desc: "What I'm learning, in the open" },
  { key: "teach", label: "//teach", desc: "Tutorials, how-tos, evergreen craft" },
];

export default function Page() {
  return (
    <main className="tactical-grid min-h-screen">
      {/* Top tactical strip */}
      <div className="border-b border-rule">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3 text-tactical text-mute">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" />
            <span className="text-cyan">SAGE@AFTERDARK</span>
            <span className="hidden sm:inline">~ /system</span>
            <span className="hidden md:inline">· STATUS · ONLINE</span>
          </div>
          <div className="text-tactical text-mute tabular-nums">
            PHASE 00 · FOUNDATION
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-20">
        <div className="text-tactical text-cyan mb-6">
          $ sage init —phase=0 —ok
        </div>

        <h1 className="font-sans font-medium tracking-tight text-bone leading-[0.95]"
            style={{ fontSize: "var(--text-display)" }}>
          The foundation is live.
          <br />
          <span className="text-mute">Everything else stacks on top.</span>
          <span className="cursor-blink ml-2 inline-block h-[0.85em] w-[0.5ch] translate-y-[-0.05em] bg-cyan align-middle" />
        </h1>

        <p className="mt-8 max-w-[60ch] text-bone/80 leading-relaxed">
          Next.js 15 · Tailwind v4 · Geist + Geist Mono · TypeScript strict.
          Design tokens wired end-to-end. Reduced-motion respected. Tactical
          grid at 2.5% alpha. Vercel deploy live.
        </p>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-tactical text-mute">
          <span><span className="text-cyan">▸</span> repo · github</span>
          <span><span className="text-cyan">▸</span> deploy · vercel</span>
          <span><span className="text-cyan">▸</span> font · geist</span>
          <span><span className="text-cyan">▸</span> a11y · wcag aa</span>
        </div>
      </section>

      {/* Color system check */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="border-t border-rule pt-10">
          <div className="text-tactical text-cyan mb-2">// COLOR · LOCKED</div>
          <h2 className="font-sans font-medium text-bone tracking-tight"
              style={{ fontSize: "var(--text-h2)" }}>
            Eight tokens. Two accents.
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {swatches.map((s) => (
            <div key={s.name} className="flex flex-col gap-2">
              <div
                className="h-20 w-full border border-rule"
                style={{ background: s.hex }}
              />
              <div>
                <div className="text-tactical text-bone">{s.name}</div>
                <div className="text-tactical text-mute">{s.hex}</div>
                <div className="mt-1 text-[11px] text-mute leading-snug">
                  {s.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pillar color system check */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="border-t border-rule pt-10">
          <div className="text-tactical text-cyan mb-2">// PILLARS · 7 TOPICS</div>
          <h2 className="font-sans font-medium text-bone tracking-tight"
              style={{ fontSize: "var(--text-h2)" }}>
            Each topic gets its own hairline.
          </h2>
          <p className="mt-3 max-w-[60ch] text-mute">
            Pillar colors appear only as 1px borders, tag chips, and the reading-progress
            bar on each post. Cyan stays the global accent. Identity stays unified.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pillarList.map((p) => (
            <div
              key={p.key}
              className="border-l-2 bg-ink-1 px-5 py-4 transition-colors hover:bg-ink-2"
              style={{ borderLeftColor: pillar[p.key] }}
            >
              <div className="text-tactical" style={{ color: pillar[p.key] }}>
                {p.label}
              </div>
              <div className="mt-1 text-bone">{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-tactical text-mute">
          <div>© SAGE AFTER DARK · PHASE 00 · FOUNDATION</div>
          <div className="flex items-center gap-2">
            <span className="text-cyan">sage@afterdark</span>
            <span>~</span>
            <span>/system</span>
            <span className="cursor-blink ml-1 inline-block h-3 w-1.5 bg-cyan" />
          </div>
        </div>
      </footer>
    </main>
  );
}
