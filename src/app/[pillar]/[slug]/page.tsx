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
import { Paywall } from "@/components/paywall";
import { JsonLd, articleLd, breadcrumbsLd } from "@/components/json-ld";
import { getSessionEmail } from "@/lib/auth";
import { memberStatus } from "@/lib/supabase";
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
  const ogUrl = fm.og_image ?? `/api/og?slug=${encodeURIComponent(fm.slug)}`;
  return {
    title: `${fm.title} — Sage After Dark`,
    description: fm.dek,
    alternates: {
      canonical: `/${fm.pillar}/${fm.slug}`,
      types: {
        "application/rss+xml": "/feed.xml",
        "application/feed+json": "/feed.json",
      },
    },
    openGraph: {
      title: fm.title,
      description: fm.dek,
      type: "article",
      publishedTime: fm.published,
      modifiedTime: fm.updated,
      tags: fm.tags,
      url: `/${fm.pillar}/${fm.slug}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: fm.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: fm.title,
      description: fm.dek,
      images: [ogUrl],
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

  // Members-only gate. Unsigned-in users see the paywall; non-active members
  // see the paywall with the dashboard CTA. Anything fails open as a safety
  // measure for content delivery, except an explicit "not active" answer.
  let isMember = false;
  let signedIn = false;
  if (post.frontmatter.members_only) {
    try {
      const email = await getSessionEmail();
      signedIn = Boolean(email);
      if (email) {
        const status = await memberStatus(email);
        isMember = status?.status === "active";
      }
    } catch (e) {
      console.warn("[post] member check failed", e);
      // Fail closed for paywalled content if we genuinely can't check.
      isMember = false;
    }
  }
  const showPaywall = post.frontmatter.members_only && !isMember;

  const fm = post.frontmatter;
  const url = `https://www.sageafterdark.com/${fm.pillar}/${fm.slug}`;
  const ogImage = fm.og_image ?? `https://www.sageafterdark.com/api/og?slug=${encodeURIComponent(fm.slug)}`;

  return (
    <Layout post={post}>
      <JsonLd
        data={articleLd({
          title: fm.title,
          description: fm.dek,
          url,
          datePublished: fm.published,
          dateModified: fm.updated,
          pillar: fm.pillar,
          tags: fm.tags,
          wordCount: post.word_count,
          readingMinutes: post.reading_minutes,
          ogImage,
        })}
      />
      <JsonLd
        data={breadcrumbsLd([
          { name: "Sage After Dark", url: "/" },
          { name: fm.pillar, url: `/${fm.pillar}` },
          { name: fm.title, url: `/${fm.pillar}/${fm.slug}` },
        ])}
      />
      {showPaywall ? (
        <Paywall pillar={post.frontmatter.pillar} signedIn={signedIn} />
      ) : (
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
      )}
    </Layout>
  );
}
