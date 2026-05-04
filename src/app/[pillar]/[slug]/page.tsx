/**
 * Dynamic post route — /[pillar]/[slug]
 *
 * Picks the right layout based on frontmatter.template and renders
 * the MDX with our custom mdxComponents map. Static-generated at build.
 */

import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import remarkGfm from "remark-gfm";
import { getAllPosts, getPostBySlug } from "@/content/loader";
import { mdxComponents } from "@/content/mdx-components";
import { LAYOUT_BY_TEMPLATE } from "@/components/layouts";
import type { Metadata } from "next";
import type { Pillar } from "@/content/schema";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({
    pillar: p.frontmatter.pillar,
    slug: p.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };

  const fm = post.frontmatter;
  return {
    title: `${fm.title} — Sage After Dark`,
    description: fm.dek,
    openGraph: {
      title: fm.title,
      description: fm.dek,
      type: "article",
      publishedTime: fm.published,
      modifiedTime: fm.updated,
      tags: fm.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: fm.title,
      description: fm.dek,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { pillar, slug } = await params;
  const post = await getPostBySlug(slug);

  // Validate pillar in URL matches frontmatter
  if (!post || post.frontmatter.pillar !== (pillar as Pillar)) {
    notFound();
  }

  const Layout = LAYOUT_BY_TEMPLATE[post.frontmatter.template];

  return (
    <Layout post={post}>
      <MDXRemote
        source={post.source}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                { behavior: "wrap", properties: { className: ["heading-anchor"] } },
              ],
            ],
          },
        }}
      />
    </Layout>
  );
}
