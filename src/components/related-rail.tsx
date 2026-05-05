/**
 * RelatedRail — "if you read this, read these next" rail.
 *
 * Server component. Renders 1-3 essay cards pulled from related-essays.ts.
 * Designed to sit between TransmissionFooter and the EssayStickyBar at the
 * bottom of an essay, but works anywhere with a list of posts.
 *
 * If there are no related essays (low corpus, low signal), it renders nothing
 * — silence beats filler.
 */

import Link from "next/link";
import type { Post } from "@/content/schema";

type Props = {
  posts: Post[];
  /** Optional eyebrow override. */
  label?: string;
};

const PILLAR_DOT: Record<string, string> = {
  build: "bg-cyan",
  signal: "bg-emerald-400",
  mind: "bg-violet-400",
  taste: "bg-amber-300",
  world: "bg-rose-300",
  learning: "bg-sky-400",
  paying: "bg-fuchsia-300",
};

export function RelatedRail({ posts, label = "▸ READ NEXT" }: Props) {
  if (!posts || posts.length === 0) return null;

  return (
    <section
      aria-label="Related essays"
      className="not-prose mt-12 mb-12 border-t border-rule pt-8"
    >
      <header className="flex items-center justify-between mb-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-cyan">
          {label}
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">
          curated by signal · not by algorithm
        </div>
      </header>

      <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-rule">
        {posts.map((p) => {
          const fm = p.frontmatter;
          const dot = PILLAR_DOT[fm.pillar] ?? "bg-mute";
          return (
            <li key={fm.slug} className="bg-ink-1">
              <Link
                href={`/${fm.pillar}/${fm.slug}`}
                className="group block h-full p-5 hover:bg-ink-2 transition-colors"
              >
                <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.14em] text-mute mb-3">
                  <span className={`inline-block w-1.5 h-1.5 ${dot}`} />
                  <span className="text-mute">{fm.pillar}</span>
                  <span className="text-mute/50">·</span>
                  <span>{fm.published.slice(0, 10)}</span>
                  {p.reading_minutes ? (
                    <>
                      <span className="text-mute/50">·</span>
                      <span>{p.reading_minutes} min</span>
                    </>
                  ) : null}
                </div>
                <h3 className="font-serif text-bone text-lg leading-snug group-hover:text-cyan transition-colors">
                  {fm.title}
                </h3>
                {fm.dek && (
                  <p className="mt-2 text-mute text-sm leading-relaxed line-clamp-3">
                    {fm.dek}
                  </p>
                )}
                <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-cyan/70 group-hover:text-cyan">
                  read essay →
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
