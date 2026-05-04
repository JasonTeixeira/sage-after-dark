/**
 * /about — who, what, why, how to reach.
 */

import { format } from "date-fns";
import {
  Page,
  Container,
  EditorialColumn,
  Section,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  Hr,
  InlineLink,
  NotchedCard,
} from "@/components";
import Link from "next/link";
import { ABOUT } from "@/content/site-data";
import { Monogram } from "@/components/monogram";

export const metadata = {
  title: "About",
  description: "About Jason Teixeira and Sage After Dark — late-night essays, tutorials, and dispatches from Sage Ideas.",
};

export default function AboutPage() {
  const updated = format(new Date(ABOUT.updated), "yyyy-MM-dd");
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/about" mode="breadcrumb" />
          <StripSep />
          <span>UPDATED · {updated.toUpperCase()}</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-center max-w-4xl">
          <div className="shrink-0">
            <Monogram size={128} glow />
          </div>
          <div>
            <Tactical className="text-cyan mb-4 block">// identity</Tactical>
            <Display className="mb-6">About.</Display>
            <Lead>
              Sage After Dark is the late-night studio for{" "}
              <InlineLink href="https://sageideas.dev">Sage Ideas</InlineLink>.
              Essays, tutorials, dispatches — written between the day job and
              the next sunrise.
            </Lead>
          </div>
        </header>

        <EditorialColumn className="space-y-5">
          {ABOUT.bio.map((para, i) => (
            <p
              key={i}
              className="text-bone/90 leading-[1.7] [font-size:var(--text-body)]"
            >
              {para}
            </p>
          ))}
        </EditorialColumn>

        <Hr className="my-16" />

        <Section label="// principles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ABOUT.principles.map((p, i) => (
              <NotchedCard
                key={i}
                notch="tl"
                label={String(i + 1).padStart(2, "0")}
                pillarKey="mind"
                className="h-full"
              >
                <div className="p-6">
                  <p className="text-bone/90 leading-relaxed text-[17px]">
                    {p}
                  </p>
                </div>
              </NotchedCard>
            ))}
          </div>
        </Section>

        <Section label="// reach me">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ABOUT.contact.map((c) => (
              <a
                key={c.label}
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="group flex items-baseline justify-between gap-4 border-b border-rule py-4 hover:border-cyan transition-colors"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
                  {c.label}
                </span>
                <span className="font-sans text-bone group-hover:text-cyan transition-colors">
                  {c.value} →
                </span>
              </a>
            ))}
          </div>
        </Section>

        <Hr className="my-16" />

        <Section label="// where to start">
          <p className="text-bone/80 mb-6 max-w-2xl">
            New here? Three places that explain the rest:
          </p>
          <ol className="space-y-5 max-w-2xl">
            <StartHere n="01" href="/best" title="The best of Sage After Dark" sub="Anchor essays, longest pieces, recent favorites." />
            <StartHere n="02" href="/now" title="What I'm working on this week" sub="Updated weekly. Current, or it isn't." />
            <StartHere n="03" href="/dispatch" title="The dispatch archive" sub="Every short, urgent letter sent so far." />
          </ol>
        </Section>
      </Container>
    </Page>
  );
}

function StartHere({ n, href, title, sub }: { n: string; href: string; title: string; sub: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-baseline gap-4 border-b border-rule pb-3 hover:border-cyan transition-colors"
      >
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan tabular-nums">{n}</span>
        <span className="flex-1">
          <span className="block font-sans text-bone group-hover:text-cyan transition-colors text-lg">{title} →</span>
          <span className="block text-mute text-sm mt-1">{sub}</span>
        </span>
      </Link>
    </li>
  );
}
