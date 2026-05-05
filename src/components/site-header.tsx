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
import { isAdminEmail } from "@/lib/admin-guard";
import { memberStatus } from "@/lib/supabase";

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
  const isAdmin = isSignedIn && isAdminEmail(sessionEmail);
  let isMember = false;
  if (isSignedIn && !isAdmin) {
    try {
      const s = await memberStatus(sessionEmail!);
      isMember = s?.status === "active" || s?.status === "trialing";
    } catch {
      isMember = false;
    }
  }
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
              <>
                {isAdmin ? <AdminBadge /> : isMember ? <MemberBadge /> : null}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-ember hover:opacity-80 transition-opacity"
                  >
                    ▸ admin
                  </Link>
                )}
                <Link
                  href="/account"
                  className="text-cyan hover:opacity-80 transition-opacity"
                >
                  ▸ account
                </Link>
              </>
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

/**
 * MemberBadge — small monospace badge with a glyph. Shown next to the
 * "▸ account" link when the signed-in user has an active subscription.
 */
function MemberBadge() {
  return (
    <Link
      href="/members"
      className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-teach/60 rounded font-mono text-[10px] uppercase tracking-[0.08em] text-teach hover:bg-teach/10 transition-colors"
      title="Members area"
    >
      <MemberGlyph />
      <span>member</span>
    </Link>
  );
}

/**
 * AdminBadge — the admin equivalent. Ember accent so it's visually
 * distinct from the teal member badge.
 */
function AdminBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-ember/60 rounded font-mono text-[10px] uppercase tracking-[0.08em] text-ember"
      title="You are signed in as the site administrator"
    >
      <AdminGlyph />
      <span>admin</span>
    </span>
  );
}

/**
 * MemberGlyph — little inline SVG mark. A circle with a half-moon notch
 * (the Sage After Dark visual motif at small scale).
 */
function MemberGlyph() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M 5 1 A 4 4 0 0 1 5 9 A 2.4 2.4 0 0 0 5 1 Z" fill="currentColor" />
    </svg>
  );
}

/**
 * AdminGlyph — a chevron framed by a square. Reads as "command prompt".
 */
function AdminGlyph() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M 3 3 L 6 5 L 3 7" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="miter" />
    </svg>
  );
}

