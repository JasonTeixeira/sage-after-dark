/**
 * Sage After Dark — Content Schema
 *
 * The contract between MDX frontmatter and rendered React.
 * Zod gives us runtime validation; types are inferred.
 *
 * Adding a field?
 *   1. Update the schema below.
 *   2. Update the matching .mdx.template file in src/content/_templates/.
 *   3. The matching layout component picks it up automatically.
 */

import { z } from "zod";

/* -----------------------------------------------------------
 * Pillars — must match src/lib/tokens.ts pillar keys.
 * --------------------------------------------------------- */

export const PillarSchema = z.enum([
  "build",
  "signal",
  "mind",
  "world",
  "taste",
  "learning",
  "teach",
]);

export type Pillar = z.infer<typeof PillarSchema>;

/* -----------------------------------------------------------
 * Template kinds — one schema, six layouts.
 * --------------------------------------------------------- */

export const TemplateSchema = z.enum([
  "essay", // long-form, drop cap, margin notes
  "tutorial", // how-to with steps + prereqs + outcome
  "field_note", // monthly notebook spread, sketches encouraged
  "dispatch", // 200-500 word signal-style
  "arc_episode", // numbered, with prev/next/index nav
  "annual", // multi-page magazine artifact
]);

export type Template = z.infer<typeof TemplateSchema>;

/* -----------------------------------------------------------
 * Tutorial-specific — only required when template === "tutorial"
 * --------------------------------------------------------- */

const TutorialMetaSchema = z.object({
  prerequisites: z.array(z.string()).default([]),
  time_estimate: z.string().optional(), // "~15 min"
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  outcome: z.string().optional(), // "You'll be able to..."
  starter_repo: z.string().url().optional(),
});

/* -----------------------------------------------------------
 * Arc-specific — only required when template === "arc_episode"
 * --------------------------------------------------------- */

const ArcMetaSchema = z.object({
  arc_slug: z.string(), // "trayd-in-public"
  arc_title: z.string(), // "Trayd, In Public"
  episode: z.number().int().positive(),
  total_episodes: z.number().int().positive(),
});

/* -----------------------------------------------------------
 * The full frontmatter schema.
 * --------------------------------------------------------- */

export const FrontmatterSchema = z
  .object({
    // identity
    title: z.string().min(1).max(140),
    dek: z.string().max(280).optional(), // sub-headline
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),

    // taxonomy
    template: TemplateSchema,
    pillar: PillarSchema,
    tags: z.array(z.string()).default([]),

    // dates
    published: z.string(), // ISO date string, validated below
    updated: z.string().optional(),

    // status
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    featured: z.boolean().default(false),
    members_only: z.boolean().default(false),

    // sharing
    og_image: z.string().optional(), // path or URL; auto-generated if absent
    canonical: z.string().url().optional(),

    // optional creative metadata
    soundtrack: z.string().url().optional(), // Spotify/Apple Music link
    related: z.array(z.string()).default([]), // slugs

    // template-specific (validated conditionally below)
    tutorial: TutorialMetaSchema.optional(),
    arc: ArcMetaSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.template === "tutorial" && !data.tutorial) return false;
      return true;
    },
    { message: "Tutorial posts require `tutorial:` frontmatter block" },
  )
  .refine(
    (data) => {
      if (data.template === "arc_episode" && !data.arc) return false;
      return true;
    },
    { message: "Arc episodes require `arc:` frontmatter block" },
  )
  .refine((data) => !Number.isNaN(Date.parse(data.published)), {
    message: "`published` must be an ISO date string",
    path: ["published"],
  });

export type Frontmatter = z.infer<typeof FrontmatterSchema>;

/* -----------------------------------------------------------
 * The runtime post object — frontmatter + computed metadata.
 * --------------------------------------------------------- */

export interface Post {
  frontmatter: Frontmatter;
  /** Raw MDX source string. */
  source: string;
  /** Reading time in minutes (rounded). */
  reading_minutes: number;
  /** Word count. */
  word_count: number;
}
