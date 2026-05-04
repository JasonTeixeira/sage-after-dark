/**
 * /dispatch — newsletter archive index.
 *
 * Lists every dispatch (newsletter-format short post). Subscribe CTA at top.
 */

import Link from "next/link";
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
  HeroSubscribe,
  Hr,
} from "@/components";
import { getPostsByTemplate } from "@/content/loader";

export const metadata = {
  title: "Dispatches",
  description:
    "The newsletter archive. Every short, urgent dispatch sent from the desk after dark.",
};

export default async function DispatchIndex() {
  const dispatches = await getPostsByTemplate("dispatch");
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/dispatch" mode="breadcrumb" />
          <StripSep />
          <span>{dispatches.length} DISPATCHES · UPDATED MONTHLY</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="mb-4">// DISPATCHES</Tactical>
          <Display>The dispatch archive.</Display>
          <Lead className="mt-6">
            Short, urgent letters. Sent when something is true and the cost of
            saying it later outweighs the cost of saying it now. One link per
            issue, one idea per issue.
          </Lead>
        </header>

        <Section className="mb-16">
          <HeroSubscribe />
        </Section>

        <Hr />

        <Section className="mt-12">
          <ul className="divide-y divide-rule">
            {dispatches.map((p) => {
              const fm = p.frontmatter;
              return (
              <li key={fm.slug}>
                <Link
                  href={`/${fm.pillar}/${fm.slug}`}
                  className="group grid grid-cols-12 gap-6 py-6 hover:bg-ink-1/40 transition-colors"
                >
                  <div className="col-span-12 sm:col-span-2 font-mono text-[11px] uppercase tracking-[0.08em] text-mute tabular-nums">
                    {format(new Date(fm.published), "yyyy.MM.dd")}
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <h2 className="font-sans text-bone leading-snug group-hover:text-cyan transition-colors text-xl">
                      {fm.title}
                    </h2>
                    {fm.dek && (
                      <p className="mt-2 text-bone/70 leading-relaxed text-[15px] max-w-[68ch]">
                        {fm.dek}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
                      <span>{p.word_count ?? 0} WORDS</span>
                      <span>·</span>
                      <span>{p.reading_minutes ?? 1} MIN</span>
                    </div>
                  </div>
                </Link>
              </li>
              );
            })}
          </ul>
        </Section>
      </Container>
    </Page>
  );
}
