/**
 * /colophon — how this site is built. Stack, design, authoring, thanks.
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
  NotchedCard,
  InlineLink,
} from "@/components";
import { COLOPHON } from "@/content/site-data";

export const metadata = {
  title: "Colophon",
  description:
    "How Sage After Dark is built — Next.js 16, Tailwind v4, MDX, Vercel. The stack is open and copy-able.",
};

export default function ColophonPage() {
  const updated = format(new Date(COLOPHON.updated), "yyyy-MM-dd");
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/colophon" mode="breadcrumb" />
          <StripSep />
          <span>UPDATED · {updated.toUpperCase()}</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">// build notes</Tactical>
          <Display className="mb-6">Colophon</Display>
          <Lead>{COLOPHON.intro}</Lead>
        </header>

        <Section label="// the stack">
          <NotchedCard notch="tl" label="STACK" pillarKey="build">
            <ul className="divide-y divide-rule">
              {COLOPHON.stack.map((s) => (
                <li
                  key={s.tier}
                  className="flex items-baseline justify-between gap-6 px-6 py-4"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute shrink-0 w-28">
                    {s.tier}
                  </span>
                  <span className="font-sans text-bone/90 text-right">
                    {s.value}
                  </span>
                </li>
              ))}
            </ul>
          </NotchedCard>
        </Section>

        <Section label="// design system">
          <EditorialColumn>
            <ul className="space-y-3">
              {COLOPHON.design.map((d, i) => (
                <li
                  key={i}
                  className="text-bone/90 leading-[1.7] [font-size:var(--text-body)] before:content-['—'] before:text-cyan before:mr-3 before:font-mono"
                >
                  {d}
                </li>
              ))}
            </ul>
          </EditorialColumn>
        </Section>

        <Section label="// authoring">
          <EditorialColumn>
            <ul className="space-y-3">
              {COLOPHON.authoring.map((a, i) => (
                <li
                  key={i}
                  className="text-bone/90 leading-[1.7] [font-size:var(--text-body)] before:content-['—'] before:text-cyan before:mr-3 before:font-mono"
                >
                  {a}
                </li>
              ))}
            </ul>
          </EditorialColumn>
        </Section>

        <Hr className="my-16" />

        <Section label="// thanks">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COLOPHON.thanks.map((t, i) => (
              <NotchedCard
                key={i}
                notch="tl"
                label={String(i + 1).padStart(2, "0")}
                pillarKey="taste"
                className="h-full"
              >
                <div className="p-6">
                  <p className="text-bone/90 leading-relaxed text-[15px]">
                    {t}
                  </p>
                </div>
              </NotchedCard>
            ))}
          </div>
        </Section>

        <div className="mt-16 max-w-3xl">
          <p className="font-mono text-[12px] uppercase tracking-[0.08em] text-mute">
            Source:{" "}
            <InlineLink href="https://github.com/JasonTeixeira/sage-after-dark">
              github.com/JasonTeixeira/sage-after-dark
            </InlineLink>
          </p>
        </div>
      </Container>
    </Page>
  );
}
