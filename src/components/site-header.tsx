/**
 * SiteHeader — global top chrome.
 *
 * One row, full width. Terminal prompt on the left, primary nav
 * in the middle, search/cmd-k hint on the right. Hairline rule
 * underneath.
 */

import Link from "next/link";
import { TacticalStrip, StripSep, TerminalPrompt, Kbd } from "@/components";
import { ReadingModeToggle } from "./reading-mode-toggle";
import { getSessionEmail } from "@/lib/auth";

const NAV = [
  { label: "start", href: "/start" },
  { label: "essays", href: "/archive" },
  { label: "concepts", href: "/concepts" },
  { label: "now", href: "/now" },
  { label: "taste", href: "/taste" },
  { label: "about", href: "/about" },
];

export async function SiteHeader({ path = "/" }: { path?: string }) {
  const sessionEmail = await getSessionEmail().catch(() => null);
  const isSignedIn = Boolean(sessionEmail);
  return (
    <header className="border-b border-rule bg-ink-0/80 backdrop-blur-sm sticky top-0 z-40" data-print-hide>
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
            {isSignedIn ? (
              <Link
                href="/account"
                className="text-cyan hover:opacity-80 transition-opacity"
              >
                ▸ account
              </Link>
            ) : (
              <>
                <Link
                  href="/account/login"
                  className="hover:text-cyan transition-colors"
                >
                  log in
                </Link>
                <Link
                  href="/account/signup"
                  className="font-mono text-[11px] uppercase tracking-[0.08em] px-3 py-1 border border-cyan text-cyan hover:bg-cyan hover:text-ink transition-colors rounded"
                >
                  ▸ sign up
                </Link>
              </>
            )}
            <StripSep />
            <ReadingModeToggle />
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
