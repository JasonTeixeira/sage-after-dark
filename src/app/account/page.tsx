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
  NotchedCard,
  StatusDot,
  Hr,
  Section,
} from "@/components";
import { getSessionEmail } from "@/lib/auth";
import { memberStatus } from "@/lib/supabase";

export const metadata = {
  title: "Account · Sage After Dark",
  description: "Your member dashboard.",
};

// Force fresh render — never cache somebody else's account.
export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

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
              You&apos;ll need to sign in to see your member dashboard. We use
              one-time magic links — no passwords.
            </Lead>
          </header>
          <a
            href="/account/login"
            className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors rounded inline-block"
          >
            ▸ sign in
          </a>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
            // not a member?{" "}
            <a className="text-cyan underline decoration-cyan/40 underline-offset-2" href="/membership">
              see the membership
            </a>
          </p>
        </Container>
      </Page>
    );
  }

  let status: Awaited<ReturnType<typeof memberStatus>> = null;
  let lookupError = false;
  try {
    status = await memberStatus(email);
  } catch (e) {
    console.warn("[account] status lookup failed", e);
    lookupError = true;
  }

  const isActive = status?.status === "active";
  const planLabel = status?.plan === "annual" ? "annual" : status?.plan === "monthly" ? "monthly" : "—";
  const renews = formatDate(status?.current_period_end ?? null);

  return (
    <Page>
      <Container size="default" className="pt-10 pb-24">
        <TacticalStrip variant={isActive ? "live" : "muted"}>
          <TerminalPrompt path="~/account" mode="breadcrumb" />
          <StripSep />
          <span>{email.toUpperCase()}</span>
          <StripSep />
          <span>{isActive ? "MEMBER · ACTIVE" : "NOT ACTIVE"}</span>
        </TacticalStrip>

        <header className="mt-10 mb-12">
          <Tactical className="text-cyan mb-4 block">// dashboard</Tactical>
          <Display className="mb-6">Account.</Display>
          <Lead>
            Manage your membership, billing, and dispatches. Magic-link sign-in
            keeps your session alive for 30 days.
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

        {lookupError && (
          <div
            role="alert"
            className="mb-10 border border-ember/40 bg-ember/5 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ember"
          >
            ▸ couldn&apos;t load your status — try again in a moment
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <NotchedCard notch="tl" pillarKey={isActive ? "teach" : undefined}>
            <div className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute mb-2">
                status
              </p>
              <div className="flex items-center gap-2">
                <StatusDot status={isActive ? "live" : "idle"} />
                <span className="font-sans text-bone text-[20px]">
                  {isActive ? "Active" : status?.status ?? "Inactive"}
                </span>
              </div>
            </div>
          </NotchedCard>
          <NotchedCard notch="tl">
            <div className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute mb-2">
                plan
              </p>
              <p className="font-sans text-bone text-[20px] capitalize">
                {planLabel}
              </p>
            </div>
          </NotchedCard>
          <NotchedCard notch="tl">
            <div className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute mb-2">
                renews
              </p>
              <p className="font-sans text-bone text-[20px] tabular-nums lining-nums">
                {renews}
              </p>
            </div>
          </NotchedCard>
        </div>

        {/* Actions */}
        <Section label="// actions" className="border-t-0 pt-0">
          <div className="flex flex-wrap gap-3">
            {isActive && (
              <form method="post" action="/api/portal">
                <button
                  type="submit"
                  className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors rounded"
                >
                  ▸ manage billing
                </button>
              </form>
            )}
            {!isActive && (
              <a
                href="/membership"
                className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-teach text-teach hover:bg-teach hover:text-ink transition-colors rounded"
              >
                ▸ start membership
              </a>
            )}
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
