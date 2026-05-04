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
import { ABOUT } from "@/content/site-data";

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

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">// identity</Tactical>
          <Display className="mb-6">About</Display>
          <Lead>
            Sage After Dark is the late-night studio for{" "}
            <InlineLink href="https://sageideas.dev">Sage Ideas</InlineLink>.
            What you came for is below.
          </Lead>
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
      </Container>
    </Page>
  );
}
