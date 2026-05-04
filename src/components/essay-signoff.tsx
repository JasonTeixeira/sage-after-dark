/**
 * EssaySignoff — the personal closing block on every long-form essay.
 *
 * Replaces the generic "subscribe!" card with something that reads
 * like the author actually finished the piece and is signing off:
 *
 *   ┌────────────────────────────────────────────────┐
 *   │ ──── Sage @ 02:14 — desk lamp on, coffee cold  │
 *   │                                                │
 *   │  I write Sage After Dark from a desk in [city] │
 *   │  with a green-screen monitor and a cat that    │
 *   │  judges my code. If this hit something, the    │
 *   │  next transmission lands Sunday at 21:00 ET.   │
 *   │                                                │
 *   │  ▸ subscribe   ▸ reply to me                   │
 *   │                                                │
 *   │  // 001+ founding window · sageafterdark.com   │
 *   └────────────────────────────────────────────────┘
 *
 * Pure server component. Plays well with the EssayStickyBar — the
 * sticky bar is the *quick* hook; this is the *human* hook. Both
 * earn their keep in different reading moments.
 */

import Link from "next/link";
import { format } from "date-fns";
import { Tactical } from "@/components/typography";
import { NotchedCard } from "@/components/notched-card";
import { HeroSubscribe } from "@/components/hero-subscribe";
import type { Post } from "@/content/schema";

export function EssaySignoff({ post }: { post: Post }) {
  const fm = post.frontmatter;
  const date = format(new Date(fm.published), "yyyy-MM-dd");

  return (
    <section className="mt-20 max-w-3xl mx-auto">
      <NotchedCard notch="tl" pillarKey={fm.pillar}>
        <div className="px-6 sm:px-8 py-7">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse" />
            <Tactical className="text-cyan">
              // signed off · {date} · 02:14 desk lamp on
            </Tactical>
          </div>

          <p className="text-bone/90 leading-relaxed text-[15px] [font-family:var(--font-sans)]">
            I write{" "}
            <strong className="font-medium text-bone">Sage After Dark</strong>{" "}
            after the studio closes for the day — one essay or one field note
            a week, sent Sundays at 21:00 ET. No tracking, no growth-hacks,
            no schedule outside Sunday.
          </p>
          <p className="mt-4 text-bone/80 leading-relaxed text-[15px] [font-family:var(--font-sans)]">
            If this piece moved something for you (or annoyed you), the reply
            line on every email lands in an inbox I actually read. The list is
            small on purpose, and the founding window is still open.
          </p>

          {/* Inline subscribe — same component as the home hero, different source. */}
          <div className="mt-7">
            <HeroSubscribe
              source={`signoff:${fm.slug}`}
              caption="Sundays · one essay or one field note · no growth-hacks · unsubscribe in one click."
            />
          </div>

          <div className="mt-6 pt-5 border-t border-rule flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-mono uppercase tracking-[0.08em] text-mute">
            <Link
              href="/archive"
              className="hover:text-cyan transition-colors"
            >
              ▸ more from the archive
            </Link>
            <span className="text-rule-hi">·</span>
            <Link
              href={`/${fm.pillar}`}
              className="hover:text-cyan transition-colors"
            >
              ▸ more from //{fm.pillar}
            </Link>
            <span className="text-rule-hi">·</span>
            <a
              href={`mailto:sage@sageideas.org?subject=${encodeURIComponent(
                `re: ${fm.title}`,
              )}`}
              className="hover:text-cyan transition-colors"
            >
              ▸ reply to this essay
            </a>
            <span className="ml-auto text-faint">— sage · after dark</span>
          </div>
        </div>
      </NotchedCard>
    </section>
  );
}
