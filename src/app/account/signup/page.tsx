/**
 * /account/signup — multi-step onboarding wizard.
 *
 * Step 1: email + password (creates the account, sets cookie)
 * Step 2: name + where they heard about us (PATCHes profile)
 * Step 3: friendly welcome with quick links
 */

import {
  Page,
  Container,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
} from "@/components";
import { SignupWizard } from "./signup-wizard";

export const metadata = {
  title: "Create account · Sage After Dark",
  description: "Create your Sage After Dark account.",
};

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next =
    sp?.next && /^\/[\w\-/]*$/.test(sp.next) ? sp.next : "/account/welcome";

  return (
    <Page>
      <Container size="narrow" className="pt-10 pb-24">
        <TacticalStrip variant="muted">
          <TerminalPrompt path="~/account/signup" mode="breadcrumb" />
          <StripSep />
          <span>AUTH · CREATE ACCOUNT</span>
        </TacticalStrip>

        <header className="mt-10 mb-10">
          <Tactical className="text-cyan mb-4 block">// new here</Tactical>
          <Display className="mb-6">Create your account.</Display>
          <Lead>
            Three quick steps. Email and password, a name we can use, and
            where you heard about Sage After Dark. That&apos;s it.
          </Lead>
        </header>

        <SignupWizard next={next} />

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
          // already have an account?{" "}
          <a
            className="text-cyan underline decoration-cyan/40 underline-offset-2"
            href="/account/login"
          >
            sign in
          </a>
        </p>
      </Container>
    </Page>
  );
}
