/**
 * Edge middleware — short links via /r/[code].
 *
 * Maps trackable short codes to canonical post URLs. Useful for newsletter
 * link tracking, social posts, conference handouts. The redirect happens at
 * the edge so it's fast and cacheable.
 *
 * Add new codes to SHORT_LINKS. Codes are case-insensitive.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/r/:code*"],
};

const SHORT_LINKS: Record<string, string> = {
  // anchor essays
  taste: "/taste/taste-as-a-deploy-gate",
  learning: "/learning/learning-by-shipping",
  halflife: "/world/the-half-life-of-a-good-tool",
  system: "/teach/the-system-i-actually-use",

  // tools
  rb: "/tools/30-second-rollback",
  rollback: "/tools/30-second-rollback",
  spec: "/build/dispatch-the-five-line-spec",
  quit: "/world/dispatch-when-to-quit-a-tool",
  killable: "/build/tutorial-shipping-a-killable-feature",

  // landings
  best: "/best",
  ask: "/ask",
  now: "/now",
  about: "/about",
  sub: "/subscribe",
  tools: "/tools",
  dispatch: "/dispatch",

  // annual
  "2025": "/mind/annual-2025",
  annual: "/mind/annual-2025",
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = pathname.match(/^\/r\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();

  const code = match[1].toLowerCase();
  const target = SHORT_LINKS[code];
  if (!target) {
    // Unknown short code → archive (graceful)
    const url = req.nextUrl.clone();
    url.pathname = "/archive";
    url.search = `?from=r&code=${encodeURIComponent(code)}`;
    return NextResponse.redirect(url, 307);
  }

  const url = req.nextUrl.clone();
  url.pathname = target;
  // Preserve query so UTM-style params still flow through
  return NextResponse.redirect(url, 307);
}
