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
          <Mono className="text-bone/80 block flex flex-wrap gap-x-3 gap-y-1">
            {[
              { name: "archive/", href: "/archive" },
              { name: "now/", href: "/now" },
              { name: "taste/", href: "/taste" },
              { name: "reading/", href: "/reading" },
              { name: "about/", href: "/about" },
              { name: "colophon/", href: "/colophon" },
              { name: "search/", href: "/search" },
              { name: "membership/", href: "/membership" },
              { name: "build/", href: "/archive?pillar=build" },
              { name: "signal/", href: "/archive?pillar=signal" },
              { name: "mind/", href: "/archive?pillar=mind" },
              { name: "world/", href: "/archive?pillar=world" },
              { name: "learning/", href: "/archive?pillar=learning" },
              { name: "teach/", href: "/archive?pillar=teach" },
            ].map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="text-bone/80 hover:text-cyan hover:underline underline-offset-2 transition-colors"
              >
                {d.name}
              </Link>
            ))}
          </Mono>
          <Mono className="text-mute block pt-2">
            <span className="text-cyan">$</span> _<span className="cursor-blink">█</span>
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
