/**
 * /api/auth/login — password sign-in.
 *
 * POST { email, password }
 *
 * Verifies the bcrypt hash and sets the session cookie. Generic 401 on any
 * failure — never disclose whether the email exists.
 */

import { verifyPassword } from "@/lib/passwords";
import { getPasswordRow, recordLogin } from "@/lib/supabase";
import { setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let payload: { email?: string; password?: string } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "invalid" }, 401);
  }
  if (!password || password.length < 1 || password.length > 200) {
    return json({ error: "invalid" }, 401);
  }

  let row: Awaited<ReturnType<typeof getPasswordRow>> = null;
  try {
    row = await getPasswordRow(email);
  } catch (e) {
    console.error("[auth/login] db error", e);
    return json({ error: "server" }, 500);
  }
  if (!row?.password_hash) {
    return json({ error: "invalid" }, 401);
  }

  const ok = await verifyPassword(password, row.password_hash);
  if (!ok) {
    return json({ error: "invalid" }, 401);
  }

  try {
    await setSessionCookie(email);
  } catch (e) {
    console.error("[auth/login] cookie error", e);
    return json({ error: "cookie" }, 500);
  }
  recordLogin(email).catch(() => {});

  return json({ ok: true, email });
}
