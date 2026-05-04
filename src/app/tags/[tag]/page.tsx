/**
 * /tags/[tag] — every post sharing this tag, newest first.
 */

import Link from "next/link";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import {
  Page,
  Container,
  EditorialDisplay,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  PillarTag,
} from "@/components";
import { getAllTags, getPostsByTag } from "@/content/loader";

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map((t) => ({ tag: t.tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `Posts tagged #${decoded} on Sage After Dark.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = await getPostsByTag(decoded);
  if (posts.length === 0) notFound();

  const totalWords = posts.reduce((s, p) => s + (p.word_count ?? 0), 0);
  const minutes = posts.reduce((s, p) => s + (p.reading_minutes ?? 0), 0);

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        <TacticalStrip>
          <TerminalPrompt
            path={`sageafterdark.com/tags/${decoded}`}
            mode="breadcrumb"
          />
          <StripSep />
          <span>{posts.length} POSTS</span>
          <StripSep />
          <span>{totalWords.toLocaleString()} WORDS</span>
          <StripSep />
          <span>{minutes} MIN TOTAL</span>
        </TacticalStrip>

        <header className="mt-12 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">
            sageafterdark.com / tags /{" "}
            <span className="text-bone">{decoded}</span>
          </Tactical>
          <EditorialDisplay className="mb-6">
            #<em>{decoded}</em>
          </EditorialDisplay>
          <Lead className="[font-family:var(--font-sans)]">
            {posts.length} {posts.length === 1 ? "post" : "posts"} touching this
            thread, newest first.
          </Lead>
          <p className="mt-4 text-tactical text-mute">
            ▸{" "}
            <Link href="/tags" className="hover:text-cyan transition-colors">
              all tags
            </Link>{" "}
            ·{" "}
            <Link
              href="/archive"
              className="hover:text-cyan transition-colors"
            >
              full archive
            </Link>
          </p>
        </header>

        <ul className="max-w-4xl">
          {posts.map((p) => (
            <li
              key={p.frontmatter.slug}
              className="border-t border-rule first:border-t-0"
            >
              <Link
                href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                className="group flex items-baseline gap-4 py-4 hover:bg-ink-1/30 transition-colors px-1"
              >
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint w-24 shrink-0 tabular-nums">
                  {format(
                    new Date(p.frontmatter.published),
                    "yyyy-MM-dd",
                  ).toUpperCase()}
                </span>
                <PillarTag pillar={p.frontmatter.pillar} size="sm" />
                <h3
                  className="text-bone group-hover:text-cyan transition-colors flex-1 leading-snug [font-family:var(--font-editorial)]"
                  style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}
                >
                  {p.frontmatter.title}
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint shrink-0 tabular-nums hidden sm:inline">
                  {p.reading_minutes} MIN
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Page>
  );
}
