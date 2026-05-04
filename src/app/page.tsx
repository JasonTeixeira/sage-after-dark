import {
  Page,
  Container,
  Section,
  Display,
  H2,
  Body,
  Lead,
  Caption,
  Tactical,
  Reticle,
  TerminalPrompt,
  StripSep,
  PillarTag,
  PillarBorder,
  ButtonLink,
} from "@/components";
import type { PillarKey } from "@/lib/tokens";

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

const pillarList: { key: PillarKey; desc: string }[] = [
  { key: "build", desc: "Engineering, architecture, the work itself" },
  { key: "signal", desc: "Status, dispatches, /now updates" },
  { key: "mind", desc: "Essays, theses, what I believe" },
  { key: "world", desc: "Industry, observations, the broader weather" },
  { key: "taste", desc: "Music, film, design — the obsessions" },
  { key: "learning", desc: "What I'm learning, in the open" },
  { key: "teach", desc: "Tutorials, how-tos, evergreen craft" },
];

export default function Home() {
  return (
    <Page>
      {/* Top tactical strip */}
      <div className="border-b border-rule">
        <Container>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan" />
              <TerminalPrompt path="/" mode="live" />
            </div>
            <Tactical>PHASE 01 · DESIGN SYSTEM</Tactical>
          </div>
        </Container>
      </div>

      <Container>
        {/* Hero */}
        <section className="pt-24 pb-20 relative">
          <div className="absolute top-6 right-0 hidden md:block">
            <Reticle size={20} />
          </div>

          <Tactical className="text-cyan mb-6 block">$ sage init —phase=1 —ok</Tactical>

          <Display>
            The system is live.
            <br />
            <span className="text-mute">Now we build.</span>
            <span className="cursor-blink ml-2 inline-block h-[0.85em] w-[0.5ch] translate-y-[-0.05em] bg-cyan align-middle" />
          </Display>

          <Lead className="mt-8">
            Every primitive is built, typed, and on display at{" "}
            <a href="/dev" className="text-cyan hover:underline">/dev</a>. Phase 2 ships the
            content engine — six post templates and the first essays already live.
          </Lead>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/templates" variant="primary">▸ Browse the templates</ButtonLink>
            <ButtonLink href="/dev" variant="outline">Component library</ButtonLink>
            <ButtonLink href="https://github.com/JasonTeixeira/sage-after-dark" variant="ghost">
              GitHub
            </ButtonLink>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-mute">
            <Tactical><span className="text-cyan">▸</span> next.js 15</Tactical>
            <Tactical><span className="text-cyan">▸</span> tailwind v4</Tactical>
            <Tactical><span className="text-cyan">▸</span> geist</Tactical>
            <Tactical><span className="text-cyan">▸</span> typescript strict</Tactical>
            <Tactical><span className="text-cyan">▸</span> wcag aa</Tactical>
          </div>
        </section>

        {/* Color check */}
        <Section label="// COLOR · LOCKED">
          <H2>Eight tokens. Two accents.</H2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
            {swatches.map((s) => (
              <div key={s.name} className="flex flex-col gap-2">
                <div
                  className="h-20 w-full border border-rule"
                  style={{ background: s.hex }}
                />
                <div>
                  <Tactical className="text-bone block">{s.name}</Tactical>
                  <Tactical className="block">{s.hex}</Tactical>
                  <Caption className="mt-1 block leading-snug">{s.role}</Caption>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Pillars check */}
        <Section label="// PILLARS · 7 TOPICS">
          <H2>Each topic gets its own hairline.</H2>
          <Body className="mt-3 text-mute max-w-[60ch]">
            Pillar colors appear only as 1px borders, tag chips, and the reading-progress
            bar on each post. Cyan stays the global accent. Identity stays unified.
          </Body>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pillarList.map((p) => (
              <PillarBorder key={p.key} pillar={p.key} className="bg-ink-1 py-4 pr-4 transition-colors hover:bg-ink-2">
                <PillarTag pillar={p.key} size="sm" />
                <Body className="mt-2 text-bone">{p.desc}</Body>
              </PillarBorder>
            ))}
          </div>
        </Section>
      </Container>

      {/* Footer */}
      <footer className="border-t border-rule">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-3 py-6">
            <Tactical>© SAGE AFTER DARK · PHASE 01</Tactical>
            <div className="flex items-center gap-3">
              <Tactical>
                <StripSep /> /system
              </Tactical>
              <TerminalPrompt path="/" mode="live" />
            </div>
          </div>
        </Container>
      </footer>
    </Page>
  );
}
