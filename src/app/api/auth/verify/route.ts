/**
 * /api/auth/verify — consumes a magic-link token, sets the session cookie,
 * and redirects to /account.
 */

import { setSessionCookie } from "@/lib/auth";
import { consumeMagicLink } from "@/lib/supabase";

export const runtime = "nodejs";

const SITE = "https://www.sageafterdark.com";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return Response.redirect(`${SITE}/account/login?error=missing`, 303);

  let email: string | null = null;
  try {
    email = await consumeMagicLink(token);
  } catch (e) {
    console.error("[auth/verify] consume error", e);
    return Response.redirect(`${SITE}/account/login?error=server`, 303);
  }
  if (!email) {
    return Response.redirect(`${SITE}/account/login?error=expired`, 303);
  }

  try {
    await setSessionCookie(email);
  } catch (e) {
    console.error("[auth/verify] cookie error", e);
    return Response.redirect(`${SITE}/account/login?error=cookie`, 303);
  }

  return Response.redirect(`${SITE}/account?welcome=1`, 303);
}
