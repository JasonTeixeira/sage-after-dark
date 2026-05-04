/**
 * SiteHeader — global top chrome.
 *
 * One row, full width. Terminal prompt on the left, primary nav
 * in the middle, search/cmd-k hint on the right. Hairline rule
 * underneath.
 */

import Link from "next/link";
import { TacticalStrip, StripSep, TerminalPrompt, Kbd } from "@/components";

const NAV = [
  { label: "essays", href: "/archive" },
  { label: "now", href: "/now" },
  { label: "taste", href: "/taste" },
  { label: "reading", href: "/reading" },
  { label: "about", href: "/about" },
];

const RIGHT_NAV = [{ label: "members", href: "/membership" }];

export function SiteHeader({ path = "/" }: { path?: string }) {
  return (
    <header className="border-b border-rule bg-ink-0/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-6">
        <TacticalStrip className="!border-0 !bg-transparent !px-0">
          <Link
            href="/"
            className="hover:text-cyan transition-colors focus:outline-none"
          >
            <TerminalPrompt path={path} />
          </Link>
          <StripSep />
          <nav
            aria-label="Primary"
            className="flex items-center gap-4 flex-wrap"
          >
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="hover:text-cyan transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <span className="ml-auto hidden sm:inline-flex items-center gap-4">
            {RIGHT_NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="text-teach hover:opacity-80 transition-opacity"
              >
                ▸ {n.label}
              </Link>
            ))}
            <StripSep />
            <Link
              href="/search"
              className="hover:text-cyan transition-colors"
              aria-label="Search"
            >
              search
            </Link>
            <Kbd>/</Kbd>
          </span>
        </TacticalStrip>
      </div>
    </header>
  );
}
