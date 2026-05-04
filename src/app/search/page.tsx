/**
 * /search — full-text search across all posts.
 *
 * Search index is built at build time on the server (RSC),
 * then handed to a client component for fuzzy filtering.
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
} from "@/components";
import { getAllPosts } from "@/content/loader";
import { SearchClient, type SearchEntry } from "./_search-client";

export const metadata = {
  title: "Search",
  description: "Search every essay, tutorial, dispatch, and field note on Sage After Dark.",
};

export default async function SearchPage() {
  const posts = await getAllPosts();
  const index: SearchEntry[] = posts.map((p) => ({
    slug: p.frontmatter.slug,
    pillar: p.frontmatter.pillar,
    template: p.frontmatter.template,
    title: p.frontmatter.title,
    dek: p.frontmatter.dek ?? "",
    tags: p.frontmatter.tags ?? [],
    published: p.frontmatter.published,
    href: `/${p.frontmatter.pillar}/${p.frontmatter.slug}`,
  }));

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/search" mode="breadcrumb" />
          <StripSep />
          <span>INDEX · {index.length} POSTS</span>
        </TacticalStrip>

        <header className="mt-10 mb-10 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">// search</Tactical>
          <Display className="mb-6">Find a post</Display>
          <Lead>
            Type any word — title, tag, dek, pillar, or template. Results filter
            as you type. Press <kbd className="font-mono text-[11px] px-2 py-1 border border-rule rounded text-bone">/</kbd>{" "}
            on any page to jump back here.
          </Lead>
        </header>

        <SearchClient index={index} />
      </Container>
    </Page>
  );
}
