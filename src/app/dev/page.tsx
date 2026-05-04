import {
  Page,
  Container,
  Section,
  Display,
  H1,
  H2,
  H3,
  Body,
  Lead,
  Caption,
  Tactical,
  Mono,
  Pullquote,
  DropCap,
  InlineLink,
  Reticle,
  NotchedCard,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  MarginNote,
  PillarTag,
  PillarBorder,
  Button,
  ButtonLink,
  Kbd,
  StatusDot,
  Hr,
} from "@/components";
import type { PillarKey } from "@/lib/tokens";

export const metadata = {
  title: "Component Library · Internal",
  robots: { index: false, follow: false },
};

const pillars: PillarKey[] = [
  "build",
  "signal",
  "mind",
  "world",
  "taste",
  "learning",
  "teach",
];

export default function DevShowcase() {
  return (
    <Page>
      {/* Top tactical strip */}
      <div className="border-b border-rule">
        <Container>
          <div className="flex items-center justify-between py-3">
            <TerminalPrompt path="/dev" mode="live" />
            <Tactical>COMPONENT LIBRARY · v0.1 · INTERNAL</Tactical>
          </div>
        </Container>
      </div>

      <Container>
        {/* Hero */}
        <section className="pt-16 pb-12">
          <Tactical className="text-cyan mb-4 block">// PHASE 01 · DESIGN SYSTEM</Tactical>
          <Display>
            Every primitive,
            <br />
            <span className="text-mute">in one room.</span>
          </Display>
          <Lead className="mt-6">
            Every visual element on Sage After Dark is built from these components.
            Phases 2 through 5 only assemble what exists here. If it&rsquo;s not on this
            page, it doesn&rsquo;t ship.
          </Lead>
        </section>

        {/* TYPOGRAPHY */}
        <Section label="// 01 · TYPOGRAPHY">
          <div className="space-y-8">
            <div>
              <Caption>Display · the hero</Caption>
              <Display className="mt-2">The foundation is live.</Display>
            </div>
            <div>
              <Caption>H1 · page title</Caption>
              <H1 className="mt-2">Why we refuse to ship anything.</H1>
            </div>
            <div>
              <Caption>H2 · section heading</Caption>
              <H2 className="mt-2">Eight tokens. Two accents.</H2>
            </div>
            <div>
              <Caption>H3 · sub-heading</Caption>
              <H3 className="mt-2">Three rules that keep it honest</H3>
            </div>
            <div>
              <Caption>Lead · post intro paragraph</Caption>
              <Lead className="mt-2">
                One rule. It changes what you build, what you charge, and who hires you. Worth writing down.
              </Lead>
            </div>
            <div>
              <Caption>Body · 17px reading size at 1.65 leading</Caption>
              <Body className="mt-2 max-w-[66ch]">
                Most software shipped this year cannot be rolled back. Not in 30 seconds. Not in 30 minutes.
                In some cases, not at all without a war-room and a written apology to customers. That is a
                strategic posture, not an accident. Teams ship one-way doors because the incentives reward
                velocity over reversibility, and because nobody fails a sprint review for shipping fast.
              </Body>
            </div>
            <div>
              <Caption>InlineLink · cyan on hover</Caption>
              <Body className="mt-2">
                You can read more on{" "}
                <InlineLink href="https://sageideas.dev">Sage Ideas</InlineLink>{" "}
                or in the <InlineLink href="#">colophon</InlineLink>.
              </Body>
            </div>
            <div>
              <Caption>Pullquote · with cyan border</Caption>
              <Pullquote>
                The studio takes the opposite bet. Every change ships either rolls back in
                under thirty seconds, or it doesn&rsquo;t ship that day.
              </Pullquote>
            </div>
            <div>
              <Caption>DropCap · first letter, 6em, cyan</Caption>
              <DropCap letter="T">
                he architectural restraint of Sage Ideas. The notched-corner brutalism of XOTC.
                The monospaced precision of a terminal. The cinematic darkness of Gotham. The
                white-margin reverence of a printed magazine.
              </DropCap>
            </div>
            <div>
              <Caption>Tactical · mono, uppercase, tracked</Caption>
              <div className="mt-2"><Tactical>// SECTION 06 · DESIGN SYSTEM · THE 99/100 PART</Tactical></div>
            </div>
            <div>
              <Caption>Mono · inline code voice</Caption>
              <Body className="mt-2">
                Run <Mono>$ sage init --phase=2</Mono> to bootstrap the templates.
              </Body>
            </div>
          </div>
        </Section>

        {/* PILLAR SYSTEM */}
        <Section label="// 02 · PILLAR SYSTEM">
          <H2 className="mb-2">Seven topics. Seven hairlines.</H2>
          <Body className="text-mute mb-8 max-w-[60ch]">
            Used only as 1px borders, tag chips, and reading-progress bars. Cyan stays the global accent.
          </Body>

          <div className="mb-10">
            <Caption className="block mb-3">PillarTag · all 7 variants</Caption>
            <div className="flex flex-wrap gap-2">
              {pillars.map((p) => (
                <PillarTag key={p} pillar={p} />
              ))}
            </div>
          </div>

          <div>
            <Caption className="block mb-3">PillarBorder · left rule + content</Caption>
            <div className="grid gap-3 sm:grid-cols-2">
              {pillars.map((p) => (
                <PillarBorder key={p} pillar={p} className="bg-ink-1 py-3 pr-4">
                  <PillarTag pillar={p} size="sm" />
                  <div className="mt-1.5 text-bone text-sm">
                    Sample post title in this pillar
                  </div>
                </PillarBorder>
              ))}
            </div>
          </div>
        </Section>

        {/* TACTICAL PRIMITIVES */}
        <Section label="// 03 · TACTICAL PRIMITIVES">
          {/* Reticle */}
          <div className="mb-10">
            <Caption>Reticle · the 16px crosshair</Caption>
            <div className="mt-3 flex items-center gap-6 bg-ink-1 border border-rule p-6">
              <Reticle size={16} />
              <Reticle size={20} />
              <Reticle size={28} />
              <Reticle size={40} />
            </div>
          </div>

          {/* TerminalPrompt */}
          <div className="mb-10">
            <Caption>TerminalPrompt · the breadcrumb is the prompt</Caption>
            <div className="mt-3 space-y-3 bg-ink-1 border border-rule p-6">
              <TerminalPrompt path="/" mode="breadcrumb" />
              <TerminalPrompt path="/build" mode="live" />
              <TerminalPrompt path="/build/why-we-refuse-to-ship" mode="live" />
            </div>
          </div>

          {/* TacticalStrip */}
          <div className="mb-10">
            <Caption>TacticalStrip · status bars, three variants</Caption>
            <div className="mt-3 space-y-3">
              <TacticalStrip>
                <span className="text-cyan">SAGE@AFTERDARK</span>
                <StripSep />
                <span>~ /build</span>
                <StripSep />
                <span>STATUS · ONLINE</span>
                <StripSep />
                <span className="ml-auto">03:47 EDT · ESSAY 217 · 1,840 WORDS</span>
              </TacticalStrip>
              <TacticalStrip variant="live">
                <span className="text-ember">LIVE</span>
                <StripSep />
                <span>RECORDING · DAY 12 · ARC 01</span>
                <StripSep />
                <span className="ml-auto">EP 03 / 12</span>
              </TacticalStrip>
              <TacticalStrip variant="muted">
                <span>ARCHIVED</span>
                <StripSep />
                <span>FIRST PUBLISHED 2024</span>
              </TacticalStrip>
            </div>
          </div>

          {/* NotchedCard */}
          <div className="mb-10">
            <Caption>NotchedCard · all four notch positions</Caption>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <NotchedCard label="[POST_217]" notch="tl" pillarKey="build">
                <div className="p-5 min-h-[140px]">
                  <PillarTag pillar="build" size="sm" />
                  <H3 className="mt-3">Notch · top-left</H3>
                  <Body className="mt-1 text-sm text-mute">
                    The default. Best for hero cards.
                  </Body>
                </div>
              </NotchedCard>
              <NotchedCard label="[POST_218]" notch="tr" pillarKey="mind">
                <div className="p-5 min-h-[140px]">
                  <PillarTag pillar="mind" size="sm" />
                  <H3 className="mt-3">Notch · top-right</H3>
                  <Body className="mt-1 text-sm text-mute">
                    Mirrors the reticle position.
                  </Body>
                </div>
              </NotchedCard>
              <NotchedCard label="[ARC_03]" notch="bl" pillarKey="learning">
                <div className="p-5 min-h-[140px]">
                  <PillarTag pillar="learning" size="sm" />
                  <H3 className="mt-3">Notch · bottom-left</H3>
                  <Body className="mt-1 text-sm text-mute">
                    Used for arc episode cards.
                  </Body>
                </div>
              </NotchedCard>
              <NotchedCard label="[FIELD_07]" notch="br" pillarKey="taste">
                <div className="p-5 min-h-[140px]">
                  <PillarTag pillar="taste" size="sm" />
                  <H3 className="mt-3">Notch · bottom-right</H3>
                  <Body className="mt-1 text-sm text-mute">
                    Reserved for footers and field notes.
                  </Body>
                </div>
              </NotchedCard>
            </div>
          </div>

          {/* MarginNote */}
          <div className="mb-2">
            <Caption>MarginNote · floats right on desktop, inline on mobile</Caption>
            <div className="mt-3 bg-ink-1 border border-rule p-6 lg:pr-[14rem] relative">
              <Body>
                The studio takes the opposite bet. Every change we ship to a production system either rolls
                back in under 30 seconds, or it doesn&rsquo;t ship that day. That is the rule.
              </Body>
              <MarginNote number={1}>
                This rule kills certain features outright. We&rsquo;ve walked from contracts because of it.
              </MarginNote>
              <Body className="mt-4">
                It is annoying. It is opinionated. It is the single most valuable engineering habit we&rsquo;ve
                built — and the one that makes us slowest in week one and fastest by week six.
              </Body>
            </div>
          </div>
        </Section>

        {/* UI ATOMS */}
        <Section label="// 04 · UI ATOMS">
          <div className="space-y-8">
            <div>
              <Caption className="block mb-3">Button · three variants</Caption>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Subscribe</Button>
                <Button variant="outline">Read essay</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </div>

            <div>
              <Caption className="block mb-3">ButtonLink · same variants, anchor-based</Caption>
              <div className="flex flex-wrap gap-3">
                <ButtonLink href="#" variant="primary">▸ Continue arc</ButtonLink>
                <ButtonLink href="#" variant="outline">View archive</ButtonLink>
                <ButtonLink href="#" variant="ghost">Skip</ButtonLink>
              </div>
            </div>

            <div>
              <Caption className="block mb-3">Kbd · keyboard hints (used everywhere)</Caption>
              <div className="flex flex-wrap items-center gap-2 text-mute text-sm">
                <Kbd>⌘</Kbd><Kbd>K</Kbd>
                <span className="ml-2 mr-1">search ·</span>
                <Kbd>g</Kbd><Kbd>h</Kbd>
                <span className="ml-2 mr-1">home ·</span>
                <Kbd>g</Kbd><Kbd>a</Kbd>
                <span className="ml-2 mr-1">archive ·</span>
                <Kbd>j</Kbd>/<Kbd>k</Kbd>
                <span className="ml-2">next/prev</span>
              </div>
            </div>

            <div>
              <Caption className="block mb-3">StatusDot · four states</Caption>
              <div className="flex flex-wrap gap-6">
                <StatusDot status="live" label="LIVE" />
                <StatusDot status="wip" label="IN PROGRESS" />
                <StatusDot status="idle" label="DRAFT" />
                <StatusDot status="offline" label="ARCHIVED" />
              </div>
            </div>

            <div>
              <Caption className="block mb-3">Hr · hairline rule</Caption>
              <Hr />
            </div>
          </div>
        </Section>

        {/* COMPOSED EXAMPLE */}
        <Section label="// 05 · COMPOSED · A SAMPLE POST CARD">
          <div className="grid gap-6 lg:grid-cols-2">
            <NotchedCard label="[POST_217]" notch="tl" pillarKey="build">
              <div className="p-7">
                <div className="flex items-center justify-between mb-6">
                  <PillarTag pillar="build" size="sm" />
                  <Reticle />
                </div>
                <H2>Why we refuse to ship anything that can&rsquo;t be rolled back in 30 seconds.</H2>
                <Body className="mt-4 text-mute">
                  One rule. It changes what you build, what you charge, and who hires you. Worth writing down.
                </Body>
                <div className="mt-6 flex items-center gap-3 text-mute">
                  <Tactical>~7 MIN READ</Tactical>
                  <StripSep />
                  <Tactical>04 MAY 2026</Tactical>
                  <StripSep />
                  <Tactical>1,840 WORDS</Tactical>
                </div>
              </div>
            </NotchedCard>

            <NotchedCard label="[FIELD_03]" notch="tr" pillarKey="learning">
              <div className="p-7">
                <div className="flex items-center justify-between mb-6">
                  <PillarTag pillar="learning" size="sm" />
                  <Reticle />
                </div>
                <H2>Field Note · April · the month I learned to stop refactoring.</H2>
                <Body className="mt-4 text-mute">
                  Twelve days into Trayd&rsquo;s migration, I made the call that probably saved the build. Here&rsquo;s why.
                </Body>
                <div className="mt-6 flex items-center gap-3 text-mute">
                  <Tactical>~5 MIN READ</Tactical>
                  <StripSep />
                  <Tactical>30 APR 2026</Tactical>
                  <StripSep />
                  <Tactical>1,210 WORDS</Tactical>
                </div>
              </div>
            </NotchedCard>
          </div>
        </Section>

        <div className="py-12 text-center">
          <TerminalPrompt path="/dev · end of library" mode="live" />
        </div>
      </Container>
    </Page>
  );
}
