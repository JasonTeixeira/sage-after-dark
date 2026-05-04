/**
 * /reading — five book shelves: building, writing, craft, taste, systems.
 */

import { format } from "date-fns";
import {
  Page,
  Container,
  Section,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  NotchedCard,
} from "@/components";
import { READING } from "@/content/site-data";

export const metadata = {
  title: "Reading",
  description:
    "Books and writers that shaped how I think about software, work, and writing — five shelves.",
};

const SHELF_PILLARS: Record<
  string,
  "build" | "signal" | "mind" | "world" | "taste" | "learning" | "teach"
> = {
  "On building": "build",
  "On writing": "signal",
  "On craft": "teach",
  "On taste": "taste",
  "On systems": "mind",
};

export default function ReadingPage() {
  const updated = format(new Date(READING.updated), "yyyy-MM-dd");
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/reading" mode="breadcrumb" />
          <StripSep />
          <span>UPDATED · {updated.toUpperCase()}</span>
          <StripSep />
          <span>
            SHELVES · {READING.shelves.length} · BOOKS ·{" "}
            {READING.shelves.reduce((n, s) => n + s.items.length, 0)}
          </span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">// reading list</Tactical>
          <Display className="mb-6">Reading</Display>
          <Lead>{READING.intro}</Lead>
        </header>

        <div className="space-y-12">
          {READING.shelves.map((shelf) => {
            const pillar = SHELF_PILLARS[shelf.shelf] ?? "mind";
            return (
              <Section
                key={shelf.shelf}
                label={`// ${shelf.shelf.toLowerCase()}`}
              >
                <NotchedCard notch="tl" label="SHELF" pillarKey={pillar}>
                  <ul className="divide-y divide-rule pt-2">
                    {shelf.items.map((item, i) => (
                      <li
                        key={`${shelf.shelf}-${i}`}
                        className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 px-6 py-4 hover:bg-bone/[0.02] transition-colors"
                      >
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-sans text-bone text-[16px]">
                          {item.title}
                        </span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
                          {item.by}
                        </span>
                      </li>
                    ))}
                  </ul>
                </NotchedCard>
              </Section>
            );
          })}
        </div>
      </Container>
    </Page>
  );
}
