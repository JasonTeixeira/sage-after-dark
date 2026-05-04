/**
 * /tools — index of small utilities built around Sage After Dark's POV.
 */

import Link from "next/link";
import {
  Page,
  Container,
  Section,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  NotchedCard,
} from "@/components";

export const metadata = {
  title: "Tools",
  description:
    "Small, opinionated utilities built around the Sage After Dark POV: ship killable features, rollback in 30 seconds, write specs in five lines.",
};

const TOOLS = [
  {
    slug: "30-second-rollback",
    title: "30-Second Rollback",
    summary:
      "A printable, copy-pasteable runbook generator for the rollback you should already have.",
    status: "LIVE",
  },
];

export default function ToolsIndex() {
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/tools" mode="breadcrumb" />
          <StripSep />
          <span>SMALL UTILITIES · OPINIONATED · FREE</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="mb-4">// TOOLS</Tactical>
          <Display>Small tools, strong opinions.</Display>
          <Lead className="mt-6">
            Each tool here is a single page that does one thing. They embody the
            Sage After Dark POV: ship the smallest reversible thing, name it
            clearly, kill it cleanly when it stops paying rent.
          </Lead>
        </header>

        <Section className="mt-12">
          <ul className="grid gap-6 md:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/tools/${t.slug}`}
                  className="block group focus-visible:outline-none"
                >
                  <NotchedCard className="p-6 transition-colors group-hover:border-cyan group-focus-visible:border-cyan">
                    <div className="flex items-center gap-2 mb-3">
                      <Tactical className="text-xs text-cyan">
                        {t.status}
                      </Tactical>
                    </div>
                    <h2 className="font-sans text-2xl mb-2 group-hover:text-cyan transition-colors text-bone">
                      {t.title}
                    </h2>
                    <p className="text-base text-bone/70">{t.summary}</p>
                  </NotchedCard>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      </Container>
    </Page>
  );
}
