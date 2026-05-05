/**
 * /concepts/[slug] — single canonical concept page.
 *
 * Each one: hero diagram (animated on scroll), 200-word definition,
 * "essays that use this concept" backlinks, and a CTA to the related
 * arc / pillar.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Page,
  Container,
  EditorialColumn,
  Section,
  EditorialDisplay,
  EditorialHeading,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  ButtonLink,
  AnimatedDiagram,
  DiagramTasteGate,
  DiagramLearningLoop,
  DiagramHalfLife,
  DiagramSystem,
  Reveal,
  Hr,
} from "@/components";
import { getAllPosts } from "@/content/loader";
import { JsonLd, breadcrumbsLd } from "@/components/json-ld";

type ConceptDef = {
  slug: string;
  code: string;
  title: string;
  italicTail: string;
  oneLiner: string;
  body: string[];
  diagram: "taste" | "learning" | "halflife" | "system";
  // Tag/keywords used to find related essays in the corpus
  match: RegExp;
  pillar: string; // pillar slug for related-essays CTA
};

const CONCEPTS: ConceptDef[] = [
  {
    slug: "taste-as-deploy-gate",
    code: "C_01",
    title: "Taste as a",
    italicTail: "Deploy Gate",
    oneLiner:
      "A pre-decided, named criterion that decides whether work passes — before feelings get in.",
    body: [
      "Taste is usually invisible: a feeling about whether the thing is good. That makes it impossible to argue with and impossible to improve. Most teams either over-rotate to the loudest taste in the room, or pretend taste doesn't exist and ship the average.",
      "The fix is to make taste explicit. Name the criteria before you build. Write them down. When the work is finished, run it through the gate as if you weren't the one who made it. The gate either passes or rejects. The rejection isn't an emotion — it's a named diff.",
      "I use this on everything: code, copy, design, this site. The single biggest leverage in a one-person studio is having one set of eyes that knows exactly what they're checking for, every time.",
    ],
    diagram: "taste",
    match: /taste|deploy gate|gate/i,
    pillar: "mind",
  },
  {
    slug: "learning-loop",
    code: "C_02",
    title: "The",
    italicTail: "Learning Loop",
    oneLiner:
      "Learning rate equals the inverse of loop length. Cut the loop, learning compounds.",
    body: [
      "Tutorials are an inferior substitute for shipping. They're shipping with the learning removed. You watch someone else close the loop and walk away with the satisfying feeling of progress without any.",
      "Real learning needs three things: a thing you ship (smallest possible), real observation (real users, real numbers), and a revision based on what you saw. The shorter that loop, the faster you learn — strictly. Two-week loops outperform two-month loops at every margin.",
      "The trap is reading more, planning more, scoping more — all of which feel like learning and aren't. The only signal that learning has occurred is that you ship something different the next time, on purpose.",
    ],
    diagram: "learning",
    match: /learning|ship|loop/i,
    pillar: "mind",
  },
  {
    slug: "half-life-of-a-tool",
    code: "C_03",
    title: "The Half-Life of",
    italicTail: "a Good Tool",
    oneLiner:
      "Every tool decays. The honest question isn't 'is it broken?' — it's 'is the next adoption cheaper than the next workaround?'",
    body: [
      "A new tool always feels like the right one in year one. It bends to your shape, you bend to its shape, you build on top of it. By year two you've added five workarounds you don't remember writing. By year three the workarounds outweigh the tool.",
      "Most teams don't decide to switch — they decide not to decide. Each individual workaround is small. The cumulative weight only shows up when someone new asks why the build script needs that one specific Node version.",
      "The decision threshold is a question, not a feeling: at this point, is the next workaround going to cost more than the next adoption? When the answer flips, switch. Don't wait for it to break.",
    ],
    diagram: "halflife",
    match: /half-life|tool|adoption|workaround/i,
    pillar: "build",
  },
  {
    slug: "the-system",
    code: "C_04",
    title: "The System",
    italicTail: "I Actually Use",
    oneLiner:
      "Five surfaces. One inbox. One weekly review. The rest is theatre.",
    body: [
      "Most productivity systems fail because they pretend the problem is information architecture. It isn't. The problem is having one place where everything lands, and a routine that drains that place into the right surface fast.",
      "I use five surfaces: capture (iA Writer), daily (Things), projects (Linear), reference (Bear), archive (DEVONthink). Each has one job, named on the diagram. The inbox is the bus station; the surfaces are the buses.",
      "The thing that makes it actually work is the weekly review — Friday afternoon, 45 minutes, prune everything older than two weeks, re-rank what's left, close the loops that closed themselves. Without the review, the system rots in three weeks.",
    ],
    diagram: "system",
    match: /system|inbox|weekly|capture|reference/i,
    pillar: "mind",
  },
];

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = CONCEPTS.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `${c.title} ${c.italicTail}`,
    description: c.oneLiner,
    alternates: { canonical: `/concepts/${slug}` },
  };
}

function renderDiagram(kind: ConceptDef["diagram"]) {
  switch (kind) {
    case "taste":
      return <DiagramTasteGate />;
    case "learning":
      return <DiagramLearningLoop />;
    case "halflife":
      return <DiagramHalfLife />;
    case "system":
      return <DiagramSystem />;
  }
}

export default async function ConceptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = CONCEPTS.find((x) => x.slug === slug);
  if (!c) notFound();

  const posts = await getAllPosts();
  const related = posts
    .filter((p) => {
      const hay = `${p.frontmatter.title} ${p.frontmatter.dek ?? ""} ${p.source.slice(0, 800)}`;
      return c.match.test(hay);
    })
    .slice(0, 5);

  return (
    <Page>
      <JsonLd
        data={breadcrumbsLd([
          { name: "Sage After Dark", url: "/" },
          { name: "Concepts", url: "/concepts" },
          { name: c.title, url: `/concepts/${slug}` },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTerm",
          name: c.title,
          description: c.oneLiner,
          url: `https://www.sageafterdark.com/concepts/${slug}`,
          inDefinedTermSet: "https://www.sageafterdark.com/concepts",
          termCode: c.code,
        }}
      />
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path={`~/concepts/${slug}`} mode="breadcrumb" />
          <StripSep />
          <span>{c.code} · CANONICAL</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-[58ch]">
          <Tactical className="text-cyan mb-4 block">// concept</Tactical>
          <EditorialDisplay className="mb-6">
            {c.title} <em>{c.italicTail}.</em>
          </EditorialDisplay>
          <Lead>{c.oneLiner}</Lead>
        </header>

        <Reveal>
          <AnimatedDiagram duration={1600}>
            {renderDiagram(c.diagram)}
          </AnimatedDiagram>
        </Reveal>

        <Hr className="my-12" />

        <Reveal>
          <Section label="// definition">
            <EditorialColumn>
              {c.body.map((p, i) => (
                <p
                  key={i}
                  className="my-5 text-bone/90 leading-[1.7] text-[var(--text-body)]"
                >
                  {p}
                </p>
              ))}
            </EditorialColumn>
          </Section>
        </Reveal>

        {related.length > 0 && (
          <>
            <Hr className="my-12" />
            <Reveal>
              <Section label="// essays that use this concept">
                <ul className="space-y-3">
                  {related.map((p) => (
                    <li key={p.frontmatter.slug}>
                      <Link
                        href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                        className="group flex items-baseline gap-3 border-b border-rule py-3 hover:border-cyan transition-colors"
                      >
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint w-24 shrink-0">
                          {p.frontmatter.pillar}
                        </span>
                        <span className="flex-1 text-bone group-hover:text-cyan transition-colors">
                          {p.frontmatter.title}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint shrink-0">
                          {p.reading_minutes} MIN →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Section>
            </Reveal>
          </>
        )}

        <Hr className="my-12" />

        <Reveal>
          <div className="text-center">
            <Tactical className="text-mute mb-4 block">// other concepts</Tactical>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {CONCEPTS.filter((x) => x.slug !== c.slug).map((x) => (
                <ButtonLink key={x.slug} href={`/concepts/${x.slug}`} variant="outline">
                  ▸ {x.title} {x.italicTail}
                </ButtonLink>
              ))}
            </div>
          </div>
        </Reveal>
      </Container>
    </Page>
  );
}
