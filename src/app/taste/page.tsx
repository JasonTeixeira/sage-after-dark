/**
 * /taste — music, film, books, notes shaping the work.
 *
 * Card grid by category. Editable in src/content/site-data.ts.
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
import { TASTE } from "@/content/site-data";
import type { PillarKey } from "@/lib/tokens";

export const metadata = {
  title: "Taste",
  description:
    "What Jason Teixeira is watching, listening to, reading, and noticing. Updated when something replaces something.",
};

const CATS: { key: keyof typeof TASTE; label: string; pillar: PillarKey }[] = [
  { key: "music", label: "// music", pillar: "taste" },
  { key: "film", label: "// film + tv", pillar: "taste" },
  { key: "books", label: "// books", pillar: "mind" },
  { key: "notes", label: "// notes + writers", pillar: "world" },
];

type TasteItem = { title: string; by: string; year: string; note: string };

export default function TastePage() {
  const updated = format(new Date(TASTE.updated), "yyyy-MM-dd");

  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/taste" mode="breadcrumb" />
          <StripSep />
          <span>UPDATED · {updated.toUpperCase()}</span>
        </TacticalStrip>

        <header className="mt-10 mb-12 max-w-3xl">
          <Tactical className="text-cyan mb-4 block">
            // the obsessions
          </Tactical>
          <Display className="mb-6">Taste</Display>
          <Lead>{TASTE.intro}</Lead>
        </header>

        {CATS.map(({ key, label, pillar }) => {
          if (key === "updated" || key === "intro") return null;
          const items = TASTE[key] as TasteItem[];
          if (!Array.isArray(items)) return null;
          return (
            <Section key={key} label={label}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {items.map((item, i) => (
                  <NotchedCard
                    key={i}
                    notch="tl"
                    pillarKey={pillar}
                    className="h-full"
                  >
                    <div className="p-6 flex flex-col h-full">
                      <h3 className="font-sans text-bone font-medium leading-snug text-lg">
                        {item.title}
                      </h3>
                      <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
                        {item.by} · {item.year}
                      </div>
                      <p className="mt-4 text-bone/75 leading-relaxed text-[15px]">
                        {item.note}
                      </p>
                    </div>
                  </NotchedCard>
                ))}
              </div>
            </Section>
          );
        })}
      </Container>
    </Page>
  );
}
