/**
 * /tools/30-second-rollback — interactive runbook generator.
 *
 * The signature tool of the site: turns a 60-second form fill into
 * a printable, copy-pasteable rollback runbook for any production change.
 */

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
  Hr,
  InlineLink,
} from "@/components";
import { RollbackBuilder } from "@/components/rollback-builder";

export const metadata = {
  title: "30-Second Rollback",
  description:
    "Generate a printable, copy-pasteable rollback runbook for any production change in under a minute. The rollback you should already have.",
  openGraph: {
    title: "30-Second Rollback — Sage After Dark",
    description:
      "Generate a rollback runbook in 60 seconds. Print it. Tape it next to the deploy button.",
  },
};

export default function ThirtySecondRollback() {
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/tools/30-second-rollback" mode="breadcrumb" />
          <StripSep />
          <span>v1.0 · NO TRACKING · NO ACCOUNT</span>
        </TacticalStrip>

        <header className="mt-10 mb-10 max-w-3xl">
          <Tactical className="mb-4">// TOOL · RUNBOOK GENERATOR</Tactical>
          <Display>30-Second Rollback.</Display>
          <Lead className="mt-6">
            Every production change deserves a rollback plan that fits on a
            sticky note. Fill the form. Get the runbook. Print it. Tape it next
            to the deploy button. If the rollback takes longer than 30 seconds
            to read, it's too long.
          </Lead>
          <p className="mt-4 text-sm text-muted">
            Inspired by{" "}
            <InlineLink href="/build/tutorial-shipping-a-killable-feature">
              Shipping a Killable Feature
            </InlineLink>
            . No data leaves your browser.
          </p>
        </header>

        <Hr />

        <Section className="mt-12">
          <RollbackBuilder />
        </Section>

        <Section className="mt-20">
          <Tactical className="mb-4">// WHY THIS EXISTS</Tactical>
          <div className="prose-essay max-w-3xl space-y-4">
            <p>
              Most outages aren't caused by the change itself — they're caused
              by the time it takes to undo the change. A 12-minute rollback is a
              45-minute incident. A 30-second rollback is a tweet.
            </p>
            <p>
              This generator forces you to write down the four things you'll
              forget at 2am: <strong>what</strong> you changed,{" "}
              <strong>where</strong> the kill switch lives,{" "}
              <strong>who</strong> to ping if it doesn't work, and{" "}
              <strong>how</strong> you'll know it actually rolled back.
            </p>
            <p>
              Print it. Paste it into the PR description. Pin it in the deploy
              channel. Whatever it takes to make the rollback findable before
              you need it.
            </p>
          </div>
        </Section>
      </Container>
    </Page>
  );
}
