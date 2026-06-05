/**
 * /account/welcome — friendly post-signup landing page.
 *
 * Reached either at the end of the signup wizard (where the wizard has
 * already shown step 3 in-place) or via direct link as a "you're in" page
 * for someone who reset their password from a 'set' token.
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
import { getSessionEmail } from "@/lib/auth";
import { whoami } from "@/lib/supabase";

export const metadata = {
  title: "Welcome · Sage After Dark",
  description: "You're in.",
};

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const email = await getSessionEmail();
  const profile = email ? await whoami(email).catch(() => null) : null;
  const firstName = profile?.name?.split(" ")[0] ?? "";

  return (
    <Page>
      <Container size="narrow" className="pt-10 pb-24">
        <TacticalStrip variant="muted">
          <TerminalPrompt path="~/account/welcome" mode="breadcrumb" />
          <StripSep />
          <span>STATUS · ONLINE</span>
        </TacticalStrip>

        <header className="mt-10 mb-10">
          <Tactical className="text-cyan mb-4 block">// you're in</Tactical>
          <Display className="mb-6">
            Welcome{firstName ? `, ${firstName}` : ""}.
          </Display>
          <Lead>
            Your account is live. From here on, your password works for every
            sign-in — no email round-trips, no waiting on links.
          </Lead>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="/account"
            className="border border-cyan text-cyan rounded px-5 py-4 font-mono text-[12px] uppercase tracking-[0.08em] hover:bg-cyan hover:text-ink transition-colors"
          >
            ▸ open dashboard
          </a>
          <a
            href="/start"
            className="border border-rule text-bone rounded px-5 py-4 font-mono text-[12px] uppercase tracking-[0.08em] hover:border-cyan hover:text-cyan transition-colors"
          >
            ▸ start reading
          </a>
          <a
            href="/now"
            className="border border-rule text-bone rounded px-5 py-4 font-mono text-[12px] uppercase tracking-[0.08em] hover:border-cyan hover:text-cyan transition-colors"
          >
            ▸ what's playing now
          </a>
        </div>

        <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
          // tip: bookmark{" "}
          <a
            className="text-cyan underline decoration-cyan/40 underline-offset-2"
            href="/account/login"
          >
            /account/login
          </a>{" "}
          for fast password sign-in next time
        </p>
      </Container>
    </Page>
  );
}
