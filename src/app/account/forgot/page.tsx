/**
 * /account/forgot — request a password reset link.
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
import { ForgotForm } from "./forgot-form";

export const metadata = {
  title: "Forgot password · Sage After Dark",
  description: "Reset your Sage After Dark password.",
};

export default function ForgotPage() {
  return (
    <Page>
      <Container size="narrow" className="pt-10 pb-24">
        <TacticalStrip variant="muted">
          <TerminalPrompt path="~/account/forgot" mode="breadcrumb" />
          <StripSep />
          <span>AUTH · PASSWORD RESET</span>
        </TacticalStrip>

        <header className="mt-10 mb-10">
          <Tactical className="text-cyan mb-4 block">// reset</Tactical>
          <Display className="mb-6">Forgot your password.</Display>
          <Lead>
            Enter the email on your account and we&apos;ll send you a link to
            choose a new password. The link expires in 60 minutes.
          </Lead>
        </header>

        <ForgotForm />

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
          // remembered it?{" "}
          <a
            className="text-cyan underline decoration-cyan/40 underline-offset-2"
            href="/account/login"
          >
            back to sign in
          </a>
        </p>
      </Container>
    </Page>
  );
}
