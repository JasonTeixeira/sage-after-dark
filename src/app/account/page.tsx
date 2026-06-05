/**
 * /account — member dashboard.
 *
 * Server-rendered. Reads the session cookie, fetches member status from
 * Supabase, renders a tactical dashboard. Unauthenticated users get a
 * sign-in CTA. Inactive members get a re-subscribe CTA.
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
  Hr,
  Section,
} from "@/components";
import { getSessionEmail } from "@/lib/auth";

export const metadata = {
  title: "Account · Sage After Dark",
  description: "Your member dashboard.",
};

// Force fresh render — never cache somebody else's account.
export const dynamic = "force-dynamic";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const sp = await searchParams;
  const justArrived = sp?.welcome === "1";

  const email = await getSessionEmail();
  if (!email) {
    return (
      <Page>
        <Container size="narrow" className="pt-10 pb-24">
          <TacticalStrip variant="muted">
            <TerminalPrompt path="~/account" mode="breadcrumb" />
            <StripSep />
            <span>NOT SIGNED IN</span>
          </TacticalStrip>
          <header className="mt-10 mb-8">
            <Tactical className="text-cyan mb-4 block">// account</Tactical>
            <Display className="mb-6">Sign in.</Display>
            <Lead>
              You&apos;ll need to sign in to see your member dashboard.
              Use your password — or grab a single-use email link from the
              login page if you forgot it.
            </Lead>
          </header>
          <div className="flex flex-wrap gap-3">
            <a
              href="/account/login"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors rounded inline-block"
            >
              ▸ sign in
            </a>
            <a
              href="/account/signup"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-teach text-teach hover:bg-teach hover:text-ink transition-colors rounded inline-block"
            >
              ▸ create account
            </a>
          </div>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
            // no account yet?{" "}
            <a className="text-cyan underline decoration-cyan/40 underline-offset-2" href="/account/signup">
              create one
            </a>
          </p>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <Container size="default" className="pt-10 pb-24">
        <TacticalStrip variant="live">
          <TerminalPrompt path="~/account" mode="breadcrumb" />
          <StripSep />
          <span>{email.toUpperCase()}</span>
          <StripSep />
          <span>SIGNED IN</span>
        </TacticalStrip>

        <header className="mt-10 mb-12">
          <Tactical className="text-cyan mb-4 block">// dashboard</Tactical>
          <Display className="mb-6">Account.</Display>
          <Lead>
            Your account and dispatches. Your password sign-in keeps your
            session alive for 30 days.
          </Lead>
        </header>

        {justArrived && (
          <div
            role="status"
            className="mb-10 border border-cyan/40 bg-cyan/5 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-cyan"
          >
            ▸ signed in — welcome back
          </div>
        )}

        {/* Actions */}
        <Section label="// actions" className="border-t-0 pt-0">
          <div className="flex flex-wrap gap-3">
            <form method="post" action="/api/auth/logout">
              <button
                type="submit"
                className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-ember hover:text-ember transition-colors rounded"
              >
                ▸ sign out
              </button>
            </form>
          </div>
        </Section>

        <Hr className="my-16" />

        {/* Newsletter panel — every signed-in person sees this */}
        <Section label="// dispatches">
          <div className="max-w-[68ch] space-y-4">
            <div className="border border-rule p-5 bg-ink-1/40 border-l-2 border-l-cyan">
              <div className="flex items-baseline justify-between mb-3 gap-3 flex-wrap">
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan">
                  ▸ sunday transmission
                </p>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
                  21:00 ET · weekly
                </span>
              </div>
              <p className="text-bone/90 leading-relaxed text-[14px] mb-3">
                You’re subscribed at <span className="font-mono text-cyan">{email}</span>. One essay or one field note every Sunday — plus what I read this week and one thing I shipped.
              </p>
              <p className="text-mute text-[12px] font-mono uppercase tracking-[0.06em]">
                // change email or unsubscribe — use the one-click link in any dispatch, or reply with “stop”.
              </p>
            </div>
          </div>
        </Section>

        <Hr className="my-16" />

        <Section label="// what's unlocked">
          <ul className="space-y-3 max-w-[68ch]">
            <li className="flex items-start gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach tabular-nums mt-1.5">
                01
              </span>
              <span className="text-bone/90 leading-relaxed">
                Members-only tutorials with full transcripts and starter
                repos. Look for the{" "}
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach border border-teach/40 px-1.5 py-0.5 rounded">
                  ▸ MEMBERS
                </span>{" "}
                tag in any post header.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach tabular-nums mt-1.5">
                02
              </span>
              <span className="text-bone/90 leading-relaxed">
                Dispatch emails arrive in your inbox first, before they go on
                the open feed.
              </span>
            </li>
            <li className="flex items-start gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach tabular-nums mt-1.5">
                03
              </span>
              <span className="text-bone/90 leading-relaxed">
                Reply to any email — it lands in a folder I actually read.
              </span>
            </li>
          </ul>
        </Section>
      </Container>
    </Page>
  );
}
