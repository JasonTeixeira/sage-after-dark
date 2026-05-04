/**
 * SiteFooter — global bottom chrome.
 *
 * Three columns: identity · links · status strip.
 * Hairline rule above. Mono labels.
 */

import Link from "next/link";
import {
  Container,
  Tactical,
  StatusDot,
  TerminalPrompt,
} from "@/components";

const FOOTER_LINKS = [
  { label: "essays", href: "/archive" },
  { label: "now", href: "/now" },
  { label: "taste", href: "/taste" },
  { label: "reading", href: "/reading" },
  { label: "about", href: "/about" },
  { label: "colophon", href: "/colophon" },
  { label: "rss", href: "/feed.xml" },
];

const SOCIAL = [
  { label: "github", href: "https://github.com/JasonTeixeira" },
  { label: "twitter", href: "https://twitter.com/JasonTeixeira" },
  { label: "email", href: "mailto:sage@sageideas.org" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule mt-24">
      <Container size="wide" className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Tactical className="text-cyan mb-4 block">// sage after dark</Tactical>
            <p className="text-bone/80 leading-relaxed text-[15px] max-w-[34ch]">
              Late-night essays, tutorials, and signals from the desk of Jason
              Teixeira. Written in Geist, served at 60fps, rolled back in
              under 30 seconds.
            </p>
            <div className="mt-6">
              <StatusDot status="live" label="System · live" />
            </div>
          </div>

          <div>
            <Tactical className="mb-4 block">// pages</Tactical>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-bone/80 hover:text-cyan transition-colors text-[15px]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <Tactical className="mb-4 block">// elsewhere</Tactical>
            <ul className="space-y-2">
              {SOCIAL.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("http") ? "_blank" : undefined}
                    rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-bone/80 hover:text-cyan transition-colors text-[15px]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
          <span>© {year} sage ideas · all rights reserved</span>
          <TerminalPrompt path="/system" mode="breadcrumb" />
        </div>
      </Container>
    </footer>
  );
}
