/**
 * /series/[slug] — every post in this series, sorted by series.order then date.
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
import { getAllSeries, getPostsBySeries } from "@/content/loader";

export async function generateStaticParams() {
  const all = await getAllSeries();
  return all.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPostsBySeries(slug);
  const title = posts[0]?.frontmatter.series?.title ?? slug;
  return {
    title,
    description: `The ${title} series on Sage After Dark.`,
  };
}

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPostsBySeries(slug);
  if (posts.length === 0) notFound();
  const title = posts[0].frontmatter.series?.title ?? slug;

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        <TacticalStrip>
          <TerminalPrompt
            path={`sageafterdark.com/series/${slug}`}
            mode="breadcrumb"
          />
          <StripSep />
          <span>{posts.length} POSTS</span>
        </TacticalStrip>

        <header className="mt-12 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">
            sageafterdark.com / series /{" "}
            <span className="text-bone">{slug}</span>
          </Tactical>
          <EditorialDisplay className="mb-6">
            <em>{title}</em>
          </EditorialDisplay>
          <Lead className="[font-family:var(--font-sans)]">
            {posts.length} {posts.length === 1 ? "essay" : "essays"} in this
            thread, in series order.
          </Lead>
          <p className="mt-4 text-tactical text-mute">
            ▸{" "}
            <Link href="/series" className="hover:text-cyan transition-colors">
              all series
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

        <ol className="max-w-4xl">
          {posts.map((p, i) => (
            <li
              key={p.frontmatter.slug}
              className="border-t border-rule first:border-t-0"
            >
              <Link
                href={`/${p.frontmatter.pillar}/${p.frontmatter.slug}`}
                className="group flex items-baseline gap-4 py-4 hover:bg-ink-1/30 transition-colors px-1"
              >
                <span className="font-mono text-[12px] uppercase tracking-[0.08em] text-cyan w-10 shrink-0 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <PillarTag pillar={p.frontmatter.pillar} size="sm" />
                <h3
                  className="text-bone group-hover:text-cyan transition-colors flex-1 leading-snug [font-family:var(--font-editorial)]"
                  style={{ fontSize: "clamp(1.05rem, 1.4vw, 1.25rem)" }}
                >
                  {p.frontmatter.title}
                </h3>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-faint shrink-0 tabular-nums hidden sm:inline">
                  {format(
                    new Date(p.frontmatter.published),
                    "yyyy-MM-dd",
                  ).toUpperCase()}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </Page>
  );
}
