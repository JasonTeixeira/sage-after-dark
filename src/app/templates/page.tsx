/**
 * /templates — preview the six post templates.
 *
 * Each card links to a real example post and summarizes when to use
 * the template. This is also the source of truth for what to ship
 * with claude-code when authoring new posts.
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
  PillarTag,
  NotchedCard,
  TerminalPrompt,
  Hr,
} from "@/components";
import { getAllPosts } from "@/content/loader";
import type { Template } from "@/content/schema";
import type { PillarKey } from "@/lib/tokens";

type TemplateCard = {
  template: Template;
  pillar: PillarKey;
  label: string;
  tagline: string;
  use_for: string;
  word_count: string;
  example_slug: string;
};

const TEMPLATES: TemplateCard[] = [
  {
    template: "essay",
    pillar: "mind",
    label: "// essay",
    tagline: "Long-form, drop-cap, margin notes",
    use_for: "Argued positions, manifestos, deep-dives where the point lives in the prose.",
    word_count: "1,200–4,000 words",
    example_slug: "why-we-roll-back",
  },
  {
    template: "tutorial",
    pillar: "teach",
    label: "// tutorial",
    tagline: "Recipe-style how-to with prereqs + outcome",
    use_for: "‘Build X in Y minutes’ guides. Auto-numbered steps, starter repo, troubleshooting.",
    word_count: "800–2,500 words",
    example_slug: "30-second-rollback",
  },
  {
    template: "field_note",
    pillar: "signal",
    label: "// field note",
    tagline: "Notebook spread, monthly retro",
    use_for: "Monthly retros, ‘what I’ve been seeing,’ raw notebook pages with H3 ticks.",
    word_count: "600–1,200 words",
    example_slug: "field-note-april-2026",
  },
  {
    template: "dispatch",
    pillar: "signal",
    label: "// dispatch",
    tagline: "Short signal-style, one move",
    use_for: "Hot takes with receipts, single-image essays, observations that fit on a postcard.",
    word_count: "200–500 words",
    example_slug: "the-30-second-rollback-rule",
  },
  {
    template: "arc_episode",
    pillar: "build",
    label: "// arc episode",
    tagline: "Numbered, prev/next, arc index",
    use_for: "Serialized writing — Trayd, In Public; The Quiet Year; etc. Each episode ships on cadence.",
    word_count: "800–2,000 words",
    example_slug: "trayd-ep-01-the-decision",
  },
  {
    template: "annual",
    pillar: "mind",
    label: "// annual",
    tagline: "Magazine-style end-of-year artifact",
    use_for: "The once-a-year long read. Magazine hero, multi-section, slow.",
    word_count: "5,000+ words",
    example_slug: "annual-2025",
  },
];

export const metadata = {
  title: "Templates — Sage After Dark",
  description: "Six post templates with rendered examples and authoring guidelines.",
};

export default async function TemplatesPage() {
  const posts = await getAllPosts();
  const bySlug = new Map(posts.map((p) => [p.frontmatter.slug, p]));

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/sage-after-dark/templates" mode="breadcrumb" />
          <StripSep />
          <span>SIX KINDS OF POSTS</span>
          <StripSep />
          <span>{posts.length} EXAMPLES SHIPPED</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">// post templates · v0.1</Tactical>
          <Display className="mb-6">Six templates. One voice.</Display>
          <Lead>
            Every post on Sage After Dark uses one of these six templates. The
            templates are the contract: they tell you which fields to fill, how
            long to write, and what shape the result will take.
          </Lead>
        </header>

        <Hr className="mb-12" />

        <Section label="// the catalogue">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLATES.map((t) => {
              const example = bySlug.get(t.example_slug);
              return (
                <NotchedCard
                  key={t.template}
                  notch="tl"
                  label={t.label}
                  pillarKey={t.pillar}
                  className="h-full"
                >
                  <div className="p-7 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <PillarTag pillar={t.pillar} size="sm" />
                      <Tactical>{t.word_count}</Tactical>
                    </div>
                    <h2 className="font-sans text-2xl font-medium text-bone leading-tight mb-2">
                      {t.tagline}
                    </h2>
                    <p className="text-bone/70 leading-relaxed text-[15px] mb-6">
                      {t.use_for}
                    </p>
                    <div className="mt-auto pt-6 border-t border-rule">
                      {example ? (
                        <Link
                          href={`/${example.frontmatter.pillar}/${example.frontmatter.slug}`}
                          className="group inline-flex items-center gap-3 text-sm"
                        >
                          <Tactical className="group-hover:text-cyan">
                            example →
                          </Tactical>
                          <span className="text-bone group-hover:text-cyan transition-colors">
                            {example.frontmatter.title}
                          </span>
                        </Link>
                      ) : (
                        <Tactical>example coming</Tactical>
                      )}
                      {example && (
                        <div className="mt-2 flex gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
                          <span>
                            {format(
                              new Date(example.frontmatter.published),
                              "yyyy-MM-dd",
                            )}
                          </span>
                          <span>·</span>
                          <span>{example.reading_minutes} min</span>
                          <span>·</span>
                          <span>
                            {example.word_count.toLocaleString()} words
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </NotchedCard>
              );
            })}
          </div>
        </Section>

        <Section label="// authoring">
          <div className="max-w-2xl space-y-5 text-bone/85 leading-relaxed">
            <p>
              When you write a new post, copy the matching template from{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                src/content/_templates/
              </code>
              {" "}into{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                src/content/posts/&lt;your-slug&gt;.mdx
              </code>
              . Fill the frontmatter. Write the body. Push.
            </p>
            <p>
              The schema in{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                src/content/schema.ts
              </code>
              {" "}validates every post at build time — invalid frontmatter
              fails the build before it ships.
            </p>
            <p>
              Custom components available inside any post:{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                &lt;DropCap&gt;
              </code>
              ,{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                &lt;MarginNote&gt;
              </code>
              ,{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                &lt;Pullquote&gt;
              </code>
              ,{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                &lt;Tactical&gt;
              </code>
              ,{" "}
              <code className="font-mono text-cyan bg-ink-2 px-1.5 py-0.5">
                &lt;InlineLink&gt;
              </code>
              .
            </p>
          </div>
        </Section>
      </Container>
    </Page>
  );
}
