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

// GET intentionally not implemented — a GET handler combined with a <Link> in
// the UI would be triggered by Next.js RSC prefetch, silently logging users
// out the moment any page renders such a link. Logout must be a form POST.
export async function GET() {
  return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}
