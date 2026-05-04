/**
 * JsonLd — type-safe structured data component.
 *
 * Renders a <script type="application/ld+json"> tag with the given object.
 * Used for SEO-rich Article, Person, Organization, BreadcrumbList,
 * WebSite, and ItemList schemas.
 *
 * Per Google: place in <head> via metadata.other or directly in the page body.
 * We put it in the body — Next 15 supports this and search engines parse it.
 */

import React from "react";

type Json = Record<string, unknown> | unknown[];

export function JsonLd({ data }: { data: Json }) {
  return (
    <script
      type="application/ld+json"
      // The data is constructed server-side from typed inputs — safe.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

// ---- Helpers --------------------------------------------------------

const SITE = "https://www.sageafterdark.com";

export const PERSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jason Teixeira",
  url: SITE,
  sameAs: [
    "https://github.com/JasonTeixeira",
    "https://www.linkedin.com/in/jasonteixeira",
    "https://sageideas.dev",
  ],
  jobTitle: "Founder, Sage Ideas",
  description:
    "Operator of a one-person studio. Writes about reliability, taste, building in public, and the texture of work.",
} as const;

export const WEBSITE_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sage After Dark",
  url: SITE,
  inLanguage: "en-US",
  description:
    "After-hours essays, tutorials, and dispatches from a one-person studio. Software, taste, psychology, and the slow internet.",
  publisher: {
    "@type": "Person",
    name: "Jason Teixeira",
    url: SITE,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

export function articleLd(args: {
  title: string;
  description?: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  pillar: string;
  tags?: string[];
  wordCount?: number;
  readingMinutes?: number;
  ogImage?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": args.url.startsWith("http") ? args.url : `${SITE}${args.url}`,
    },
    author: PERSON_LD,
    publisher: PERSON_LD,
    datePublished: args.datePublished,
    dateModified: args.dateModified ?? args.datePublished,
    articleSection: args.pillar,
    keywords: args.tags?.join(", "),
    wordCount: args.wordCount,
    timeRequired: args.readingMinutes
      ? `PT${args.readingMinutes}M`
      : undefined,
    image: args.ogImage
      ? args.ogImage.startsWith("http")
        ? args.ogImage
        : `${SITE}${args.ogImage}`
      : undefined,
    inLanguage: "en-US",
  };
}

export function breadcrumbsLd(
  crumbs: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url.startsWith("http") ? c.url : `${SITE}${c.url}`,
    })),
  };
}
