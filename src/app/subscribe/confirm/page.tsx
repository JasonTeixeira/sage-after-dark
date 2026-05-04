/**
 * /subscribe/confirm — landing page Resend redirects new subscribers to
 * after they click the double-opt-in link in their inbox.
 *
 * Replaces the default Resend confirmation screen with a page that feels
 * like the rest of Sage After Dark: tactical strip, editorial title,
 * founding-window microcopy, three "what happens next" cards, and a CTA
 * to read the latest transmissions while they wait for Sunday.
 */

import Link from "next/link";
import type { Metadata } from "next";
import {
  Page,
  Container,
  EditorialDisplay,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  ButtonLink,
  NotchedCard,
  Reticle,
} from "@/components";
import { getSiteCounts } from "@/lib/live-counts";

export const metadata: Metadata = {
  title: "Subscription confirmed — Sage After Dark",
  description:
    "You're in. The next transmission lands Sunday. Here's what to expect.",
  robots: { index: false, follow: true },
};

export default async function ConfirmPage() {
  const counts = await getSiteCounts();
  return (
    <Page>
      {/* Tactical strip — matches home */}
      <Container size="wide" className="pt-6 pb-2">
        <TacticalStrip variant="live">
          <TerminalPrompt path="/subscribe/confirm" mode="live" />
          <StripSep />
          <span>SUBSCRIPTION · CONFIRMED</span>
          <span className="ml-auto hidden md:flex items-center gap-3">
            <span className="text-cyan">● HANDSHAKE OK</span>
            <StripSep />
            <span>YEAR {counts.yearLabel.replace("Year ", "")}</span>
            <StripSep />
            <span>SUBSCRIBERS · {counts.subscribersLabel}</span>
          </span>
          <span className="ml-auto md:hidden text-cyan">● HANDSHAKE OK</span>
        </TacticalStrip>
      </Container>

      {/* Hero confirmation */}
      <Container size="wide" className="pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <section className="lg:col-span-7 relative">
            <div className="absolute -top-4 -left-2 hidden lg:block">
              <Reticle size={16} />
            </div>
            <Tactical className="text-cyan mb-6 block">
              // signal received · welcome to the after-hours
            </Tactical>
            <EditorialDisplay className="mb-8">
              You&apos;re <em>in.</em>
            </EditorialDisplay>
            <Lead className="max-w-[48ch] text-bone/80 [font-family:var(--font-sans)]">
              The handshake worked. Your address is on the dispatch list, and
              the next transmission lands{" "}
              <strong className="font-medium text-bone">Sunday night</strong>{" "}
              — one essay or one field note from the studio, written by the
              same operator who ships production code by day.
            </Lead>
            <p className="mt-6 max-w-[48ch] text-mute leading-relaxed text-[15px]">
              You&apos;re subscriber{" "}
              <span className="text-cyan font-mono">
                {counts.subscribersLabel}+
              </span>{" "}
              in the founding window. Founding readers get every essay free
              and a permanent founding-member badge if a paid tier ever opens.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ButtonLink href="/archive" variant="primary">
                ▸ Read the archive
              </ButtonLink>
              <Link
                href="/"
                className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute hover:text-bone transition-colors"
              >
                · Back to home
              </Link>
            </div>
          </section>

          {/* Right — receipt card */}
          <aside className="lg:col-span-5">
            <NotchedCard notch="tl" pillarKey="signal">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2">
                <Tactical className="text-cyan">RECEIPT · 0001</Tactical>
                <span className="ml-auto h-2 w-2 rounded-full bg-cyan animate-pulse" />
              </div>
              <div className="px-5 pb-5 space-y-4">
                <div className="border border-rule p-4 font-mono text-[12px] text-bone/80 leading-relaxed bg-ink-1/40">
                  <div className="flex justify-between border-b border-rule pb-2 mb-2 text-faint uppercase tracking-[0.08em] text-[10px]">
                    <span>Transmission Log</span>
                    <span>{counts.yearLabel.toUpperCase()}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-mute">status</span>
                      <span className="text-cyan">subscribed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mute">cadence</span>
                      <span>one letter / week</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mute">first send</span>
                      <span>this Sunday · 21:00 ET</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mute">cohort</span>
                      <span className="text-cyan">founding · 001+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-mute">unsubscribe</span>
                      <span>one click, every email</span>
                    </div>
                  </div>
                </div>
                <p className="text-faint text-[12px] font-mono uppercase tracking-[0.08em]">
                  // tip: drag the welcome email to your primary tab so the
                  Sunday letter doesn&apos;t land in promotions.
                </p>
              </div>
            </NotchedCard>
          </aside>
        </div>
      </Container>

      {/* What happens next — 3 cards */}
      <Container size="wide" className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {NEXT_STEPS.map((step) => (
            <NotchedCard key={step.label} notch="tl">
              <div className="p-6">
                <Tactical className="text-cyan mb-3 block">
                  {step.label}
                </Tactical>
                <h3 className="text-bone leading-snug [font-family:var(--font-editorial)] text-[1.4rem] mb-3">
                  {step.title}
                </h3>
                <p className="text-bone/75 leading-relaxed text-[14px]">
                  {step.body}
                </p>
              </div>
            </NotchedCard>
          ))}
        </div>
      </Container>

      {/* Closing line */}
      <Container size="wide" className="py-12">
        <div className="border-y border-rule py-6 text-center">
          <p className="text-mute text-[14px] leading-relaxed max-w-[52ch] mx-auto">
            Until Sunday — read something good, ship something small, and
            don&apos;t let the algorithm decide what&apos;s worth your
            attention.
          </p>
          <p className="mt-3 text-faint font-mono text-[11px] uppercase tracking-[0.1em]">
            — sage · after dark
          </p>
        </div>
      </Container>
    </Page>
  );
}

const NEXT_STEPS = [
  {
    label: "// 01 · TODAY",
    title: "A short welcome email arrives in a few minutes.",
    body:
      "It explains what to expect, links the four anchor essays, and gives you one small thing to do. No homework, just the lay of the land.",
  },
  {
    label: "// 02 · SUNDAY",
    title: "The first real transmission lands at 21:00 ET.",
    body:
      "One essay or one field note. What I read this week. One thing I shipped. Designed to be read in ten minutes with a glass of something.",
  },
  {
    label: "// 03 · ALWAYS",
    title: "No tracking pixels, no growth-hacks, one-click unsubscribe.",
    body:
      "Plain HTML, real prose, served by a one-person studio. If you stop reading, leave anytime — the door swings both ways.",
  },
] as const;
