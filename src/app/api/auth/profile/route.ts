/**
 * /api/auth/profile — update the signed-in user's display name + referrer.
 *
 * POST { name, referrer }
 *
 * Auth required (session cookie). 401 otherwise.
 */

import { getSessionEmail } from "@/lib/auth";
import { updateProfile } from "@/lib/supabase";

export const runtime = "nodejs";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return json({ error: "unauth" }, 401);

  let payload: { name?: string; referrer?: string } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const name = String(payload.name ?? "").trim().slice(0, 80);
  const referrer = String(payload.referrer ?? "").trim().slice(0, 200);

  try {
    await updateProfile({ email, name, referrer });
  } catch (e) {
    console.error("[auth/profile] db error", e);
    return json({ error: "server" }, 500);
  }
  return json({ ok: true });
}
