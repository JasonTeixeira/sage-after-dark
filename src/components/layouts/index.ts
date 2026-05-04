/**
 * Layouts — pick the right one based on frontmatter.template.
 */

export { EssayLayout } from "./EssayLayout";
export { TutorialLayout } from "./TutorialLayout";
export { FieldNoteLayout } from "./FieldNoteLayout";
export { DispatchLayout } from "./DispatchLayout";
export { ArcEpisodeLayout } from "./ArcEpisodeLayout";
export { AnnualLayout } from "./AnnualLayout";

import type { Template } from "@/content/schema";
import type { ComponentType, ReactNode } from "react";
import type { Post } from "@/content/schema";
import { EssayLayout } from "./EssayLayout";
import { TutorialLayout } from "./TutorialLayout";
import { FieldNoteLayout } from "./FieldNoteLayout";
import { DispatchLayout } from "./DispatchLayout";
import { ArcEpisodeLayout } from "./ArcEpisodeLayout";
import { AnnualLayout } from "./AnnualLayout";

type LayoutComponent = ComponentType<{ post: Post; children: ReactNode }>;

export const LAYOUT_BY_TEMPLATE: Record<Template, LayoutComponent> = {
  essay: EssayLayout,
  tutorial: TutorialLayout,
  field_note: FieldNoteLayout,
  dispatch: DispatchLayout,
  // ArcEpisodeLayout is async — TS still treats its result as ReactNode-compatible
  arc_episode: ArcEpisodeLayout as unknown as LayoutComponent,
  annual: AnnualLayout,
};
