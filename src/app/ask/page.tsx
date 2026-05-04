/**
 * /ask — AMA submission. Reader sends a question, it goes to me via Resend.
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
} from "@/components";
import { AskForm } from "@/components/ask-form";

export const metadata = {
  title: "Ask",
  description:
    "Send me a question. The good ones become essays. The very good ones get answered directly.",
};

export default function AskPage() {
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/ask" mode="breadcrumb" />
          <StripSep />
          <span>OPEN MAILBAG · NO ACCOUNT NEEDED</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="mb-4">// ASK</Tactical>
          <Display>Send me a question.</Display>
          <Lead className="mt-6">
            The good ones become essays. The very good ones get answered
            directly. The ones I'm not qualified for get an honest "I don't
            know." No question is dumb. The trick is asking the one you actually
            want answered.
          </Lead>
        </header>

        <Hr />

        <Section className="mt-12 max-w-2xl">
          <AskForm />
        </Section>

        <Section className="mt-20 max-w-2xl">
          <Tactical className="mb-3">// HOUSE RULES</Tactical>
          <ul className="space-y-3 text-bone/80 leading-relaxed">
            <li>One question per submission. Make it the real one.</li>
            <li>Specifics beat hypotheticals. Names of tools, sizes of teams, dollar amounts.</li>
            <li>Anonymity is fine. Just say so and I won't quote you by name.</li>
            <li>I read every one. I answer the ones I have something useful to say about.</li>
          </ul>
        </Section>
      </Container>
    </Page>
  );
}
