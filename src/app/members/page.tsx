/**
 * /members — the members hub.
 *
 * Three states:
 *   1. Not signed in   → friendly gate with sign-in / sign-up CTAs
 *   2. Signed in but not active → "upgrade to unlock" panel
 *   3. Active member  → list of every members-only essay + dispatches block.
 */

import Link from "next/link";
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
  Section,
  Hr,
} from "@/components";
import { getSessionEmail } from "@/lib/auth";
import { memberStatus, whoami } from "@/lib/supabase";
import { getAllPosts } from "@/content/loader";
import { isAdminEmail } from "@/lib/admin-guard";

export const metadata = {
  title: "Members · Sage After Dark",
  description: "Tutorials, dispatches, and the members-only archive.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return "—";
  }
}

export default async function MembersPage() {
  const email = await getSessionEmail();

  // --- Gate 1: not signed in ---
  if (!email) {
    return (
      <Page>
        <Container size="narrow" className="pt-10 pb-24">
          <TacticalStrip variant="muted">
            <TerminalPrompt path="~/members" mode="breadcrumb" />
            <StripSep />
            <span>NOT SIGNED IN</span>
          </TacticalStrip>
          <header className="mt-10 mb-8">
            <Tactical className="text-teach mb-4 block">// members</Tactical>
            <Display className="mb-6">Members area.</Display>
            <Lead>
              Members get every tutorial, the full archive, dispatches before
              they go on the open feed, and a reply-to inbox I actually read.
              Sign in to unlock.
            </Lead>
          </header>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/account/login?next=/members"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors rounded"
            >
              ▸ sign in
            </Link>
            <Link
              href="/account/signup?next=/members"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-teach text-teach hover:bg-teach hover:text-ink transition-colors rounded"
            >
              ▸ create account
            </Link>
            <Link
              href="/membership"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded"
            >
              ▸ see plans
            </Link>
          </div>
        </Container>
      </Page>
    );
  }

  // Logged in. Look up status + profile.
  let status: Awaited<ReturnType<typeof memberStatus>> = null;
  let profile: Awaited<ReturnType<typeof whoami>> = null;
  try {
    [status, profile] = await Promise.all([
      memberStatus(email),
      whoami(email).catch(() => null),
    ]);
  } catch {
    /* fall through with nulls */
  }
  const isActive = status?.status === "active" || status?.status === "trialing";
  const isAdmin = isAdminEmail(email);
  const firstName = profile?.name?.split(" ")[0] ?? "";

  // --- Gate 2: signed in, not active, not admin ---
  if (!isActive && !isAdmin) {
    return (
      <Page>
        <Container size="narrow" className="pt-10 pb-24">
          <TacticalStrip variant="muted">
            <TerminalPrompt path="~/members" mode="breadcrumb" />
            <StripSep />
            <span>{email.toUpperCase()}</span>
            <StripSep />
            <span>NOT ACTIVE</span>
          </TacticalStrip>
          <header className="mt-10 mb-8">
            <Tactical className="text-teach mb-4 block">// upgrade</Tactical>
            <Display className="mb-6">
              You&apos;re in{firstName ? `, ${firstName}` : ""}— just not unlocked yet.
            </Display>
            <Lead>
              Your account is active but you&apos;re not on a paid plan. Members
              get the tutorial archive, early dispatches, and the
              members-only essays.
            </Lead>
          </header>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/membership"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-teach text-teach hover:bg-teach hover:text-ink transition-colors rounded"
            >
              ▸ see membership
            </Link>
            <Link
              href="/account"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded"
            >
              ▸ account
            </Link>
          </div>
        </Container>
      </Page>
    );
  }

  // --- State 3: active member (or admin previewing) ---
  const allPosts = await getAllPosts();
  const memberPosts = allPosts
    .filter((p) => p.frontmatter.members_only)
    .sort((a, b) => (a.frontmatter.published < b.frontmatter.published ? 1 : -1));

  const renews = fmtDate(status?.current_period_end ?? null);
  const planLabel = status?.plan === "annual" ? "annual" : status?.plan === "monthly" ? "monthly" : "—";

  return (
    <Page>
      <Container size="default" className="pt-10 pb-24">
        <TacticalStrip variant="live">
          <TerminalPrompt path="~/members" mode="breadcrumb" />
          <StripSep />
          <span>{email.toUpperCase()}</span>
          <StripSep />
          <span>{isAdmin ? "ADMIN · PREVIEW" : "MEMBER · ACTIVE"}</span>
        </TacticalStrip>

        <header className="mt-10 mb-12">
          <Tactical className="text-teach mb-4 block">// members</Tactical>
          <Display className="mb-6">
            Welcome back{firstName ? `, ${firstName}` : ""}.
          </Display>
          <Lead>
            Your full unlock. Every tutorial, every members-only essay, plus
            the early-access dispatch list. Reply to anything I send — it
            lands in a folder I actually read.
          </Lead>
        </header>

        {/* Member status row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          <NotchedCard notch="tl" pillarKey="teach">
            <div className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute mb-2">
                status
              </p>
              <p className="font-sans text-bone text-[20px]">
                {isAdmin && !isActive ? "Admin preview" : "Active"}
              </p>
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

        <Section label="// members-only essays" className="border-t-0 pt-0">
          {memberPosts.length === 0 ? (
            <p className="text-bone/80 leading-relaxed max-w-[68ch]">
              No members-only essays are live yet — the queue is loading.
              In the meantime, the{" "}
              <Link
                className="text-cyan underline decoration-cyan/40 underline-offset-2"
                href="/archive"
              >
                full archive
              </Link>{" "}
              is wide open to you.
            </p>
          ) : (
            <ul className="grid gap-4">
              {memberPosts.map((post) => {
                const fm = post.frontmatter;
                return (
                  <li key={fm.slug}>
                    <Link
                      href={`/${fm.pillar}/${fm.slug}`}
                      className="group block border border-rule rounded p-5 bg-ink/40 border-l-2 border-l-teach hover:border-l-cyan hover:bg-ink/60 transition-colors"
                    >
                      <div className="flex items-baseline gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-teach border border-teach/40 px-1.5 py-0.5 rounded">
                          ▸ members
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
                          {fmtDate(fm.published)}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
                          {fm.pillar}
                        </span>
                        {post.reading_minutes && (
                          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
                            {post.reading_minutes} min
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-[22px] text-bone leading-tight mb-1 group-hover:text-cyan transition-colors">
                        {fm.title}
                      </h3>
                      {fm.dek && (
                        <p className="text-bone/80 leading-relaxed text-[14px]">
                          {fm.dek}
                        </p>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Hr className="my-16" />

        <Section label="// dispatches" className="border-t-0 pt-0">
          <div className="border border-rule p-5 bg-ink-1/40 border-l-2 border-l-cyan max-w-[68ch]">
            <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-2">
              ▸ sunday transmission · weekly
            </p>
            <p className="text-bone/90 leading-relaxed text-[14px]">
              You&apos;re subscribed at{" "}
              <span className="font-mono text-cyan">{email}</span>. Members
              get the dispatch a few hours before it goes on the open feed.
              Reply to any email — I read every one.
            </p>
          </div>
        </Section>

        <Hr className="my-16" />

        <Section label="// quick links" className="border-t-0 pt-0">
          <div className="flex flex-wrap gap-3">
            <Link
              href="/account"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors rounded"
            >
              ▸ account
            </Link>
            <Link
              href="/archive"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded"
            >
              ▸ full archive
            </Link>
            <Link
              href="/now"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded"
            >
              ▸ what&apos;s playing now
            </Link>
            <Link
              href="/membership"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded"
            >
              ▸ manage plan
            </Link>
          </div>
        </Section>
      </Container>
    </Page>
  );
}
