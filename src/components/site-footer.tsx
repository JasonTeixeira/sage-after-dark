/**
 * SiteFooter — global bottom chrome.
 *
 * Curated, professional 3-column layout. Every link has a purpose.
 *   Read     — what to read next
 *   Personal — what I'm doing / who I am
 *   Connect  — how to reach me + verified social
 *
 * Hairline rule above. Mono labels. Single bottom strip with
 * copyright + system status.
 */

import Link from "next/link";
import {
  Container,
  Tactical,
  StatusDot,
} from "@/components";

const READ = [
  { label: "Start here", href: "/start" },
  { label: "Essays", href: "/archive" },
  { label: "Concepts", href: "/concepts" },
  { label: "Best of", href: "/best" },
  { label: "RSS", href: "/feed.xml" },
];

const PERSONAL = [
  { label: "About", href: "/about" },
  { label: "Now", href: "/now" },
  { label: "Numbers", href: "/numbers" },
  { label: "Uses", href: "/uses" },
  { label: "Changelog", href: "/changelog" },
  { label: "Reading", href: "/reading" },
  { label: "Taste", href: "/taste" },
];

const CONNECT = [
  { label: "Ask anything", href: "/ask" },
  { label: "GitHub", href: "https://github.com/JasonTeixeira", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jason-teixeira/", external: true },
  { label: "sageideas.dev", href: "https://sageideas.dev", external: true },
];

type FooterLink = { label: string; href: string; external?: boolean };

function FooterColumn({ heading, links }: { heading: string; links: FooterLink[] }) {
  return (
    <div>
      <Tactical className="mb-5 block text-mute">{`// ${heading}`}</Tactical>
      <ul className="space-y-2.5">
        {links.map((l) => {
          const isExternal = l.external || l.href.startsWith("http") || l.href.startsWith("mailto:");
          const Cmp: typeof Link | "a" = isExternal ? "a" : Link;
          return (
            <li key={l.href}>
              <Cmp
                href={l.href}
                {...(isExternal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="text-bone/85 hover:text-cyan transition-colors text-[14px] inline-flex items-center gap-1.5"
              >
                {l.label}
                {isExternal && (
                  <span aria-hidden="true" className="text-faint text-[10px] translate-y-[-1px]">
                    ↗
                  </span>
                )}
              </Cmp>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule mt-24" data-print-hide>
      <Container size="wide" className="py-14">
        {/* Identity row */}
        <div className="mb-12 max-w-[44ch]">
          <Tactical className="text-cyan mb-4 block">// sage after dark</Tactical>
          <p className="text-bone/85 leading-relaxed text-[15px]">
            The after-hours notebook of a one-person studio.
            Software, taste, psychology, and the slow internet —
            written by Jason Teixeira.
          </p>
        </div>

        {/* Three curated columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-12">
          <FooterColumn heading="Read" links={READ} />
          <FooterColumn heading="Personal" links={PERSONAL} />
          <FooterColumn heading="Connect" links={CONNECT} />
        </div>

        {/* Bottom strip */}
        <div className="mt-14 pt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
          <span>© {year} Sage Ideas LLC</span>
          <StatusDot status="live" label="System · live" />
        </div>
      </Container>
    </footer>
  );
}
