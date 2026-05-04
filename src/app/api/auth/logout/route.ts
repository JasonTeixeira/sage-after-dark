/**
 * /api/auth/logout — clears the session cookie and redirects home.
 */

import { clearSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const SITE = "https://www.sageafterdark.com";

export async function POST() {
  await clearSessionCookie();
  return Response.redirect(`${SITE}/`, 303);
}

export async function GET() {
  await clearSessionCookie();
  return Response.redirect(`${SITE}/`, 303);
}
