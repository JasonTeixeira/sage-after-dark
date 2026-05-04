/**
 * /account/login — magic-link sign-in form for members.
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
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in · Sage After Dark",
  description: "Sign in to your member dashboard.",
};

const ERR_COPY: Record<string, string> = {
  missing: "No token in the link. Try requesting a new one.",
  expired: "That link has already been used or expired. Request a new one.",
  cookie: "Could not set the session cookie. Try again.",
  server: "Server error. Try again in a moment.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const sp = await searchParams;
  const errCode = sp?.error ?? null;
  const err = errCode && ERR_COPY[errCode] ? ERR_COPY[errCode] : null;

  return (
    <Page>
      <Container size="narrow" className="pt-10 pb-24">
        <TacticalStrip variant="muted">
          <TerminalPrompt path="~/account/login" mode="breadcrumb" />
          <StripSep />
          <span>AUTH · MAGIC LINK</span>
        </TacticalStrip>

        <header className="mt-10 mb-10">
          <Tactical className="text-cyan mb-4 block">// sign in</Tactical>
          <Display className="mb-6">Sign in.</Display>
          <Lead>
            Enter the email you used to subscribe. We&apos;ll send you a
            single-use link that expires in 15 minutes. No passwords.
          </Lead>
        </header>

        {err && (
          <div
            role="alert"
            className="mb-8 border border-ember/40 bg-ember/5 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ember"
          >
            ▸ {err}
          </div>
        )}

        <LoginForm />

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
          // not a member yet?{" "}
          <a className="text-cyan underline decoration-cyan/40 underline-offset-2" href="/membership">
            see the membership
          </a>
        </p>
      </Container>
    </Page>
  );
}
