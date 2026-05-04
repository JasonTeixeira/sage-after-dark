/**
 * PostCard — the standard list-item for posts.
 *
 * Two variants:
 *   - "feed":   notched card with pillar border, used in grids
 *   - "row":    one-line tactical row, used in archive lists
 */

import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/cn";
import { NotchedCard, PillarTag, Tactical } from "@/components";
import type { Post } from "@/content/schema";

const TEMPLATE_LABEL: Record<Post["frontmatter"]["template"], string> = {
  essay: "essay",
  tutorial: "tutorial",
  field_note: "field note",
  dispatch: "dispatch",
  arc_episode: "arc",
  annual: "annual",
};

export function PostCard({
  post,
  variant = "feed",
}: {
  post: Post;
  variant?: "feed" | "row" | "featured";
}) {
  const fm = post.frontmatter;
  const href = `/${fm.pillar}/${fm.slug}`;
  const date = format(new Date(fm.published), "yyyy-MM-dd");
  const tplLabel = TEMPLATE_LABEL[fm.template];
  const arcSuffix =
    fm.template === "arc_episode" && fm.arc
      ? ` · EP ${String(fm.arc.episode).padStart(2, "0")} / ${String(
          fm.arc.total_episodes,
        ).padStart(2, "0")}`
      : "";

  if (variant === "row") {
    return (
      <Link
        href={href}
        className={cn(
          "group block border-b border-rule hover:bg-ink-1/40 transition-colors",
          "focus:outline-none",
        )}
      >
        <div className="grid grid-cols-12 items-baseline gap-4 py-4 px-2">
          <div className="col-span-12 sm:col-span-2 font-mono text-[11px] uppercase tracking-[0.08em] text-mute tabular-nums">
            {date}
          </div>
          <div className="col-span-12 sm:col-span-1">
            <PillarTag pillar={fm.pillar} size="sm" />
          </div>
          <div className="col-span-12 sm:col-span-2 font-mono text-[11px] uppercase tracking-[0.08em] text-faint">
            {tplLabel}
            {arcSuffix}
          </div>
          <div className="col-span-12 sm:col-span-7">
            <h3 className="font-sans text-bone leading-snug group-hover:text-cyan transition-colors text-[17px]">
              {fm.title}
            </h3>
            {fm.dek && (
              <p className="mt-1 text-sm text-mute leading-relaxed line-clamp-1">
                {fm.dek}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={href} className="group block focus:outline-none">
        <NotchedCard
          notch="tl"
          pillarKey={fm.pillar}
          className="h-full"
          interactive
          size={32}
        >
          <div className="p-8 sm:p-10 flex flex-col h-full">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <PillarTag pillar={fm.pillar} size="sm" />
              <Tactical>
                {date} · {tplLabel}
                {arcSuffix} · {post.reading_minutes} min
              </Tactical>
            </div>
            <h2 className="font-sans font-medium text-bone leading-[1.05] tracking-tight text-3xl sm:text-4xl group-hover:text-cyan transition-colors">
              {fm.title}
            </h2>
            {fm.dek && (
              <p className="mt-4 text-bone/70 leading-relaxed text-lg max-w-[55ch]">
                {fm.dek}
              </p>
            )}
            <Tactical className="mt-auto pt-8 group-hover:text-cyan">
              read →
            </Tactical>
          </div>
        </NotchedCard>
      </Link>
    );
  }

  // "feed" — default
  return (
    <Link href={href} className="group block focus:outline-none h-full">
      <NotchedCard
        notch="tl"
        pillarKey={fm.pillar}
        className="h-full"
        interactive
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <PillarTag pillar={fm.pillar} size="sm" />
            <Tactical>
              {date} · {tplLabel}
              {arcSuffix}
            </Tactical>
          </div>
          <h3 className="font-sans font-medium text-bone leading-snug text-xl group-hover:text-cyan transition-colors">
            {fm.title}
          </h3>
          {fm.dek && (
            <p className="mt-2 text-bone/70 leading-relaxed text-[15px]">
              {fm.dek}
            </p>
          )}
          <Tactical className="mt-auto pt-6 group-hover:text-cyan">
            read · {post.reading_minutes} min →
          </Tactical>
        </div>
      </NotchedCard>
    </Link>
  );
}
