/**
 * /taste — "What I'm into this week." (parity with strategy-doc mockup)
 *
 * Hero: serif italic display + Spotify-style Now Playing card
 * 2x2 panel grid: The books · The rotation · The screen · Small obsessions
 * Pullquote: "Taste is the price of admission..."
 * Reader picks footer: 4 short reader recs
 */

import { format } from "date-fns";
import {
  Page,
  Container,
  EditorialDisplay,
  EditorialHeading,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  NotchedCard,
  Pullquote,
} from "@/components";
import { TASTE, NOW_PLAYING } from "@/content/site-data";
import { getRotation } from "@/lib/living";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Taste",
  description:
    "What Jason Teixeira is into this week. Books, music, screen, and small obsessions. The taste log behind every essay.",
};

type TasteItem = { title: string; by: string; year: string; note: string };

const READER_PICKS = [
  {
    by: "Penelope Fitzgerald",
    location: "Berlin",
    pick: "The Blue Flower. Quiet historical fiction about silent fevers. 100 pages. Devastating.",
  },
  {
    by: "Lin · Sasha",
    location: "Berlin",
    pick: "Caroline Polachek live at Roundhouse. The vocal control is absurd.",
  },
  {
    by: "James · Jenna",
    location: "Lisbon",
    pick: "Fiamma Figura, Dollar Wine. Better than the eight-dollar wine.",
  },
  {
    by: "Mei · Berlin",
    location: "Lisbon",
    pick: "David Lynch's Catching the Big Fish. 80 pages on creativity and TM. Underrated.",
  },
];

export default async function TastePage() {
  // Live reads with fallback to static defaults
  const [liveBooks, liveMusic, liveFilm] = await Promise.all([
    getRotation("book"),
    getRotation("music"),
    getRotation("film"),
  ]);
  const toItem = (r: { title: string; by_line: string; year_label: string | null; note: string | null }) => ({
    title: r.title,
    by: r.by_line,
    year: r.year_label ?? "",
    note: r.note ?? "",
  });
  const books = liveBooks.length ? liveBooks.map(toItem) : TASTE.books;
  const music = liveMusic.length ? liveMusic.map(toItem) : TASTE.music;
  const film  = liveFilm.length  ? liveFilm.map(toItem)  : TASTE.film;

  // Updated stamp = max of any item's updated_at, fallback static
  const allUpdated = [...liveBooks, ...liveMusic, ...liveFilm].map((r) => r.updated_at);
  const latest = allUpdated.length ? allUpdated.sort().slice(-1)[0] : TASTE.updated;
  const updated = format(new Date(latest), "yyyy-MM-dd");

  return (
    <Page>
      <Container size="wide" className="pt-6 pb-24">
        {/* Tactical strip */}
        <TacticalStrip>
          <TerminalPrompt path="sageafterdark.com/taste" mode="breadcrumb" />
          <StripSep />
          <span>NOW PLAYING · UPDATES</span>
          <span className="ml-auto hidden md:flex items-center gap-3">
            <span>UPDATED · {updated.toUpperCase()}</span>
            <StripSep />
            <span>SPOTIFY</span>
            <StripSep />
            <span>LETTERBOXD</span>
            <StripSep />
            <span>GOODREADS</span>
          </span>
          <span className="ml-auto md:hidden">UPDATED · {updated.toUpperCase()}</span>
        </TacticalStrip>

        {/* Hero */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <header className="lg:col-span-7">
            <Tactical className="text-cyan mb-4 block">
              sageafterdark.com / <span className="text-bone">taste</span>
              <span className="ml-3">// a living page</span>
            </Tactical>
            <EditorialDisplay
              className="mb-6"
              style={{ fontSize: "clamp(2.5rem,6vw,5rem)" } as React.CSSProperties}
            >
              What I&apos;m <em>into</em>
              <br />this week.
            </EditorialDisplay>
            <Lead className="[font-family:var(--font-sans)]">
              A self-updating page of records, books, films, places, and small
              obsessions. The taste log behind every essay. Updated every Friday
              — sometimes sooner if a record breaks me.
            </Lead>
          </header>

          {/* Now Playing — Spotify-card */}
          <div className="lg:col-span-5">
            <NotchedCard notch="tl" pillarKey="taste" label="//NOW_PLAYING · APPLE_TV">
              <div className="p-5 flex gap-4 items-center">
                <div className="h-24 w-24 shrink-0 bg-gradient-to-br from-cyan/30 to-pillar-mind/30 border border-rule" />
                <div className="flex-1">
                  <Tactical className="text-cyan block">▮ NO REPEAT · 27 PLAYS · 7D</Tactical>
                  <h3
                    className="mt-2 text-bone leading-tight [font-family:var(--font-editorial)]"
                    style={{ fontSize: "clamp(1.4rem, 2vw, 1.85rem)" }}
                  >
                    Reflection
                  </h3>
                  <div className="mt-1 text-[12px] font-mono uppercase tracking-[0.08em] text-mute">
                    BRIAN ENO · 2017 · AMBIENT
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.08em] text-faint">
                    <span className="h-0.5 w-1/2 bg-cyan" />
                    <span className="h-0.5 w-1/2 bg-rule-hi" />
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.08em] text-faint">
                    <span>00:00</span>
                    <span>54:00</span>
                  </div>
                </div>
              </div>
            </NotchedCard>
          </div>
        </div>

        {/* 2x2 panel grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Panel: Books */}
          <Panel
            label="// CURRENTLY · READING"
            heading="The books."
            sublabel={`${books.length} ACTIVE · ${books.length} FINISHED YTD · PHYSICAL`}
            items={books}
          />
          {/* Panel: Music */}
          <Panel
            label="// CURRENTLY · ROTATION"
            heading="The rotation."
            sublabel={`${music.length} ALBUMS · TOP OF MIND THIS WEEK`}
            items={music}
            tone="cyan"
          />
          {/* Panel: Screen */}
          <Panel
            label="// THE SCREEN"
            heading="The screen."
            sublabel={`SHOWS THIS MONTH · ${film.length} FILMS`}
            items={film}
            tone="ember"
          />
          {/* Panel: Small obsessions */}
          <NotchedCard notch="tl" pillarKey="taste" label="//SMALL_OBSESSIONS">
            <div className="p-6">
              <Tactical className="block mb-1">
                <span className="text-cyan">// SMALL_OBSESSIONS</span>
              </Tactical>
              <EditorialHeading
                className="mb-1"
                style={{ fontSize: "clamp(1.5rem,2.4vw,2rem)" } as React.CSSProperties}
              >
                Small <em>obsessions.</em>
              </EditorialHeading>
              <Tactical className="block mb-5">
                THE THINGS I KEEP RECOMMENDING
              </Tactical>
              <div className="grid grid-cols-2 gap-3">
                {NOW_PLAYING.items.map((item, i) => (
                  <div
                    key={i}
                    className="border border-rule bg-ink-1/40 p-3 hover:border-cyan transition-colors"
                  >
                    <div className="text-cyan text-lg leading-none mb-2">▮</div>
                    <div className="text-bone text-[13px] leading-snug">
                      {item.label}
                    </div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.08em] text-faint">
                      {item.kind.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </NotchedCard>
        </div>

        {/* Pullquote */}
        <div className="mt-20 mb-20 max-w-3xl mx-auto text-center">
          <Pullquote className="border-0 pl-0 [font-family:var(--font-editorial)] [&>em]:text-cyan [&>em]:italic [&>em]:font-normal text-bone">
            Taste is the price of admission. <em>Without it,</em> every
            recommendation collapses into noise.
          </Pullquote>
          <Tactical className="block mt-4 text-faint">
            — FROM ESSAY 144 · &ldquo;ON BUILDERS &amp; LIBRARY OF BABEL&rdquo;
          </Tactical>
        </div>

        {/* Reader picks */}
        <div className="border-t border-rule pt-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <Tactical className="text-cyan block mb-2">// READER · CONTRIBUTIONS</Tactical>
              <EditorialHeading style={{ fontSize: "clamp(1.5rem,2.4vw,2rem)" } as React.CSSProperties}>
                What <em>you&apos;re</em> into.
              </EditorialHeading>
              <p className="mt-2 text-bone/70 text-[14px] max-w-[44ch]">
                Subscribers can submit one pick per week. The best ten land here
                on Fridays. No bad takes — just things you&apos;d hand to a
                friend without hedging.
              </p>
            </div>
            <Tactical className="hidden md:block">
              FROM · WHO · GENRE
            </Tactical>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {READER_PICKS.map((p, i) => (
              <div key={i} className="border border-rule bg-ink-1/30 p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.08em] text-faint mb-2">
                  FROM · {p.location.toUpperCase()}
                </div>
                <div
                  className="text-bone leading-snug [font-family:var(--font-editorial)] mb-2"
                  style={{ fontSize: "1rem" }}
                >
                  &ldquo;{p.by}&rdquo;
                </div>
                <p className="text-bone/70 text-[13px] leading-snug">{p.pick}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.08em]">
            <Link href="/account" className="text-cyan hover:text-bone transition-colors">
              ▸ SUBMIT A PICK
            </Link>
            <span className="text-faint">DEADLINE · THURSDAY 23:59 ET</span>
          </div>
        </div>
      </Container>
    </Page>
  );
}

/* -----------------------------------------------------------
 * Panel — one of the four taste cards (Books / Rotation / Screen)
 * --------------------------------------------------------- */
function Panel({
  label,
  heading,
  sublabel,
  items,
  tone = "default",
}: {
  label: string;
  heading: string;
  sublabel: string;
  items: TasteItem[];
  tone?: "default" | "cyan" | "ember";
}) {
  const accent =
    tone === "cyan"
      ? "var(--color-cyan)"
      : tone === "ember"
        ? "var(--color-ember)"
        : "var(--color-bone)";
  return (
    <NotchedCard notch="tl" pillarKey="taste" label={label}>
      <div className="p-6">
        <EditorialHeading
          className="mb-1"
          style={{ fontSize: "clamp(1.5rem,2.4vw,2rem)" } as React.CSSProperties}
        >
          {heading.replace(/\.$/, "")}
          <em>.</em>
        </EditorialHeading>
        <Tactical className="block mb-5 text-faint">{sublabel}</Tactical>
        <ul className="divide-y divide-rule">
          {items.map((it, i) => (
            <li key={i} className="py-3 flex gap-4 items-start">
              <div
                className="h-12 w-12 shrink-0 border border-rule bg-ink-1/40"
                style={{ borderLeftWidth: 2, borderLeftColor: accent }}
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <h4 className="text-bone font-medium font-sans text-[15px] leading-snug truncate">
                    {it.title}
                  </h4>
                  <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-faint shrink-0 ml-auto">
                    ★★★★★
                  </span>
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.08em] text-mute mt-0.5">
                  {it.by} · {it.year}
                </div>
                <p className="text-bone/70 text-[13px] leading-snug mt-1.5">
                  &ldquo;{it.note}&rdquo;
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </NotchedCard>
  );
}
