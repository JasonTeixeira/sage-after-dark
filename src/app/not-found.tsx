/**
 * 404 — terminal-style "not found".
 */

import Link from "next/link";
import {
  Page,
  Container,
  Display,
  Lead,
  Tactical,
  TacticalStrip,
  StripSep,
  TerminalPrompt,
  ButtonLink,
  Mono,
} from "@/components";

export const metadata = {
  title: "404 · Not Found",
  description: "The page you tried to reach is not on this site.",
};

export default function NotFound() {
  return (
    <Page>
      <Container size="wide" className="pt-10 pb-24">
        <TacticalStrip>
          <TerminalPrompt path="~/404" mode="breadcrumb" />
          <StripSep />
          <span>STATUS · 404</span>
          <StripSep />
          <span>SIGNAL · LOST</span>
        </TacticalStrip>

        <header className="mt-16 max-w-3xl">
          <Tactical className="text-ember mb-4 block">// 404</Tactical>
          <Display className="mb-6">Signal lost.</Display>
          <Lead>
            The page you tried to reach is not on this site. It may have been
            moved, retired, or never existed. The archive is the source of
            truth.
          </Lead>
        </header>

        <div className="mt-10 max-w-2xl space-y-2">
          <Mono className="text-mute block">
            <span className="text-cyan">$</span> grep -r &quot;{"{path}"}&quot;
            posts/
          </Mono>
          <Mono className="text-mute block">
            <span className="text-ember">→</span> 0 matches
          </Mono>
          <Mono className="text-mute block">
            <span className="text-cyan">$</span> ls /
          </Mono>
          <Mono className="text-bone/80 block">
            archive/ now/ taste/ reading/ about/ colophon/ search/
          </Mono>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <ButtonLink href="/">← Home</ButtonLink>
          <ButtonLink href="/archive">Browse archive</ButtonLink>
          <ButtonLink href="/search">Search</ButtonLink>
        </div>

        <p className="mt-16 max-w-2xl text-mute font-mono text-[11px] uppercase tracking-[0.08em]">
          if this was a link from this site,{" "}
          <Link href="mailto:sage@sageideas.org" className="text-cyan hover:underline">
            email me
          </Link>{" "}
          and I&apos;ll fix it.
        </p>
      </Container>
    </Page>
  );
}
