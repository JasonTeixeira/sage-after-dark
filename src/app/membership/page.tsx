/**
 * /membership — pricing + value prop for paid tier.
 *
 * Two plans: $5/mo and $50/yr (≈17% off). Value prop: "Things I teach."
 * Server-rendered. Posting the form to /api/checkout creates a Stripe
 * checkout session and 303-redirects.
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
  Hr,
  Section,
} from "@/components";
import { getSessionEmail } from "@/lib/auth";
import { memberStatus } from "@/lib/supabase";

export const metadata = {
  title: "Membership · Things I teach",
  description:
    "Members-only tutorials, full transcripts, and the long versions of dispatches I post in public. $5/month or $50/year.",
};

const PERKS = [
  "Members-only tutorials with the full transcripts and starter repos.",
  "The long versions of dispatches I post in public — context, sources, follow-ups.",
  "First access to every new essay, before it goes on the open feed.",
  "Direct reply line — your email lands in a folder I actually read.",
  "Cancel any time, in one click. No retention dark patterns.",
];

export default async function MembershipPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>;
}) {
  const sp = await searchParams;
  const canceled = sp?.canceled === "1";

  // If they're already a member, give them a way back to the dashboard.
  let isMember = false;
  try {
    const email = await getSessionEmail();
    if (email) {
      const ms = await memberStatus(email);
      isMember = ms?.status === "active";
    }
  } catch {
    /* status lookup is best-effort */
  }

  return (
    <Page>
      <Container size="default" className="pt-10 pb-24">
        <TacticalStrip variant="live">
          <TerminalPrompt path="~/membership" mode="breadcrumb" />
          <StripSep />
          <span>THINGS I TEACH</span>
          <StripSep />
          <span>$5 / MO · $50 / YR</span>
        </TacticalStrip>

        <header className="mt-10 mb-12">
          <Tactical className="text-cyan mb-4 block">
            // for the people who want the long versions
          </Tactical>
          <Display className="mb-6">Things I teach.</Display>
          <Lead>
            The members-only tier of Sage After Dark. Tutorials with full
            transcripts and starter repos. The long versions of every
            dispatch. First access to new essays. One reply away from me.
          </Lead>
        </header>

        {canceled && (
          <div
            role="status"
            className="mb-10 border border-ember/40 bg-ember/5 px-4 py-3 font-mono text-[12px] uppercase tracking-[0.08em] text-ember"
          >
            ▸ checkout canceled — no charge made
          </div>
        )}

        {isMember && (
          <div
            role="status"
            className="mb-10 border border-cyan/40 bg-cyan/5 px-4 py-3 font-mono text-[12px] text-cyan"
          >
            ▸ you&apos;re already a member —{" "}
            <a className="underline decoration-cyan/40 underline-offset-2" href="/account">
              open your dashboard
            </a>
          </div>
        )}

        {/* Plans */}
        <Section label="// pick a plan" className="border-t-0 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Monthly */}
            <NotchedCard notch="tl" pillarKey="teach" className="h-full">
              <div className="p-7 flex flex-col h-full">
                <div className="mb-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach">
                    monthly
                  </p>
                  <p className="mt-2 font-sans text-bone text-[44px] leading-none tabular-nums lining-nums">
                    $5
                    <span className="text-[15px] text-mute"> / mo</span>
                  </p>
                  <p className="mt-2 text-bone/70 text-[14px]">
                    Pay-as-you-go. Cancel any time.
                  </p>
                </div>
                <form
                  method="post"
                  action="/api/checkout"
                  className="mt-auto pt-4"
                >
                  <input type="hidden" name="plan" value="monthly" />
                  <button
                    type="submit"
                    className="w-full font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-3 border border-teach text-teach hover:bg-teach hover:text-ink transition-colors rounded"
                  >
                    ▸ start monthly
                  </button>
                </form>
              </div>
            </NotchedCard>

            {/* Annual */}
            <NotchedCard notch="tl" pillarKey="teach" className="h-full">
              <div className="p-7 flex flex-col h-full">
                <div className="mb-4">
                  <div className="flex items-baseline gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach">
                      annual
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-cyan">
                      ▸ save ~17%
                    </p>
                  </div>
                  <p className="mt-2 font-sans text-bone text-[44px] leading-none tabular-nums lining-nums">
                    $50
                    <span className="text-[15px] text-mute"> / yr</span>
                  </p>
                  <p className="mt-2 text-bone/70 text-[14px]">
                    Two months free. Lock in for a year.
                  </p>
                </div>
                <form
                  method="post"
                  action="/api/checkout"
                  className="mt-auto pt-4"
                >
                  <input type="hidden" name="plan" value="annual" />
                  <button
                    type="submit"
                    className="w-full font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-3 bg-teach text-ink border border-teach hover:bg-transparent hover:text-teach transition-colors rounded"
                  >
                    ▸ start annual
                  </button>
                </form>
              </div>
            </NotchedCard>
          </div>
        </Section>

        <Hr className="my-16" />

        {/* What's inside */}
        <Section label="// what's inside">
          <ul className="space-y-3 max-w-[68ch]">
            {PERKS.map((perk, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach tabular-nums mt-1.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-bone/90 leading-relaxed text-[17px]">
                  {perk}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Hr className="my-16" />

        {/* FAQ */}
        <Section label="// faq">
          <div className="space-y-8 max-w-[68ch]">
            <div>
              <h3 className="font-sans text-bone text-[18px] mb-2">
                What do I get that the free dispatch doesn&apos;t have?
              </h3>
              <p className="text-bone/80 leading-relaxed">
                The teaching. Tutorials with full transcripts, runnable starter
                repos, and the long versions of essays where I show every
                decision. The free feed gets the punchline; members get the
                work.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-bone text-[18px] mb-2">
                Can I cancel any time?
              </h3>
              <p className="text-bone/80 leading-relaxed">
                Yes. One click in your dashboard. You keep access through the
                end of the period you paid for, then it lapses. No retention
                emails.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-bone text-[18px] mb-2">
                Are there refunds?
              </h3>
              <p className="text-bone/80 leading-relaxed">
                Within 7 days, yes — email{" "}
                <a
                  className="text-cyan underline decoration-cyan/40 underline-offset-2"
                  href="mailto:sage@sageideas.org"
                >
                  sage@sageideas.org
                </a>{" "}
                and I&apos;ll process it the same day. After that, just cancel.
              </p>
            </div>
            <div>
              <h3 className="font-sans text-bone text-[18px] mb-2">
                What about teams or company plans?
              </h3>
              <p className="text-bone/80 leading-relaxed">
                Email me. We&apos;ll figure something out — I&apos;d rather
                make it right than build a billing matrix.
              </p>
            </div>
          </div>
        </Section>

        <Hr className="my-16" />

        <div className="text-center">
          <Tactical className="text-mute mb-4 block">
            // already a member?
          </Tactical>
          <a
            href="/account/login"
            className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-2 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded inline-block"
          >
            ▸ sign in
          </a>
        </div>
      </Container>
    </Page>
  );
}
