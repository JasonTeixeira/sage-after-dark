/**
 * /concepts — index of canonical concept pages. Each concept owns one
 * diagram and is the citation target whenever an essay references it.
 */

import Link from "next/link";
import {
  Page,
  Container,
  EditorialDisplay,
  EditorialHeading,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  NotchedCard,
} from "@/components";

export const metadata = {
  title: "Concepts — the canonical diagrams",
  description:
    "The four diagrams that anchor everything I write: the taste gate, the learning loop, the half-life, and the system.",
  alternates: { canonical: "/concepts" },
};

const CONCEPTS = [
  {
    slug: "taste-as-deploy-gate",
    code: "C_01",
    title: "Taste as a Deploy Gate",
    sub: "ship · gate · pass or revise",
    blurb:
      "A named, pre-decided criterion that decides whether a piece of work passes — before feelings get in. The fastest way to keep a shop honest.",
  },
  {
    slug: "learning-loop",
    code: "C_02",
    title: "The Learning Loop",
    sub: "ship · observe · revise",
    blurb:
      "Tutorials are an inferior substitute for shipping. Learning rate equals the inverse of loop length. Cut the loop length; learning compounds.",
  },
  {
    slug: "half-life-of-a-tool",
    code: "C_03",
    title: "The Half-Life of a Good Tool",
    sub: "every tool decays · honeymoon → workarounds → fight",
    blurb:
      "A working tool degrades silently. The decision threshold isn't 'is it broken?' — it's 'is the next adoption cheaper than the next workaround?'",
  },
  {
    slug: "the-system",
    code: "C_04",
    title: "The System I Actually Use",
    sub: "five surfaces · one inbox · weekly review",
    blurb:
      "The actual five surfaces I use to keep work moving — capture, daily, projects, reference, archive — and the weekly review that prunes them.",
  },
] as const;

export default function ConceptsIndex() {
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/concepts" mode="breadcrumb" />
          <StripSep />
          <span>4 CANONICAL DIAGRAMS</span>
        </TacticalStrip>
        <header className="mt-10 mb-12 max-w-[58ch]">
          <Tactical className="text-cyan mb-4 block">// canon</Tactical>
          <EditorialDisplay className="mb-6">
            The <em>concepts.</em>
          </EditorialDisplay>
          <Lead>
            Four diagrams. Each one is an idea I keep coming back to. When an
            essay references a concept, this is the page it links to. Bookmark
            any one as the canonical reference.
          </Lead>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONCEPTS.map((c) => (
            <Link key={c.slug} href={`/concepts/${c.slug}`} className="group">
              <NotchedCard
                notch="tl"
                pillarKey="mind"
                label={c.code}
                className="h-full transition-colors group-hover:[&]:border-cyan"
              >
                <div className="p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-cyan mb-3">
                    {c.sub}
                  </div>
                  <EditorialHeading className="mb-3" style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.85rem)" }}>
                    {c.title}
                  </EditorialHeading>
                  <p className="text-bone/80 leading-relaxed text-[15px]">
                    {c.blurb}
                  </p>
                  <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.08em] text-cyan group-hover:text-bone">
                    Read the concept →
                  </div>
                </div>
              </NotchedCard>
            </Link>
          ))}
        </div>
      </Container>
    </Page>
  );
}
