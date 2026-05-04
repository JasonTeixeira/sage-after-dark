/**
 * /now — what I'm working on this week.
 *
 * Inspired by Derek Sivers' /now page convention. Updated weekly.
 * The contract with the reader: this is current, or it isn't.
 */

import { format } from "date-fns";
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
  StatusDot,
  Hr,
} from "@/components";
import { NOW } from "@/content/site-data";

export const metadata = {
  title: "Now",
  description:
    "What Jason Teixeira is working on this week. Updated weekly. The contract with the reader: this is current, or it isn't.",
};

export default function NowPage() {
  const updated = format(new Date(NOW.updated), "yyyy-MM-dd");
  const daysSince = Math.floor(
    (Date.now() - new Date(NOW.updated).getTime()) / (1000 * 60 * 60 * 24),
  );
  const stale = daysSince > 14;

  return (
    <Page>
      <Container size="default" className="pt-10 pb-24">
        <TacticalStrip variant={stale ? "muted" : "live"}>
          <TerminalPrompt path="~/now" mode="breadcrumb" />
          <StripSep />
          <span>UPDATED · {updated.toUpperCase()}</span>
          <StripSep />
          <span>{daysSince}D AGO</span>
          {stale && (
            <>
              <StripSep />
              <span className="text-ember">STALE</span>
            </>
          )}
        </TacticalStrip>

        <header className="mt-10 mb-12">
          <Tactical className="text-cyan mb-4 block">
            // current operating window
          </Tactical>
          <Display className="mb-6">Now</Display>
          <Lead>
            What I&apos;m working on this week. The /now page is the contract
            with you: this is current, or it isn&apos;t.
          </Lead>
        </header>

        <div className="space-y-12">
          {/* Status */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <StatusDot status={stale ? "idle" : "live"} />
              <Tactical>// status</Tactical>
            </div>
            <p className="text-bone/90 leading-relaxed text-lg">{NOW.status}</p>
            <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
              {NOW.location}
            </div>
          </section>

          <Hr />

          {/* This week */}
          <section>
            <Tactical className="mb-4 block">// this week</Tactical>
            <ul className="space-y-3">
              {NOW.this_week.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan tabular-nums mt-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-bone/90 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <Hr />

          {/* Two-column reading + listening */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
            <section>
              <Tactical className="mb-4 block">// reading</Tactical>
              <ul className="space-y-2 text-bone/90 leading-relaxed">
                {NOW.reading.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <Tactical className="mb-4 block">// listening</Tactical>
              <ul className="space-y-2 text-bone/90 leading-relaxed">
                {NOW.listening.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
            <section className="sm:col-span-2">
              <Tactical className="mb-4 block">// watching</Tactical>
              <ul className="space-y-2 text-bone/90 leading-relaxed">
                {NOW.watching.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <Hr />

          {/* Not doing */}
          <Section
            label="// what I'm NOT doing"
            className="border-rule-hi pt-8"
          >
            <p className="text-bone/70 mb-5 leading-relaxed max-w-[60ch]">
              Naming what you&apos;re ignoring is half the discipline of
              focus. The list of things I&apos;m saying no to this week:
            </p>
            <ul className="space-y-2">
              {NOW.not_doing.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-bone/80 leading-relaxed"
                >
                  <span className="font-mono text-cyan mt-1">×</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </Container>
    </Page>
  );
}
