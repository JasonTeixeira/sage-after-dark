/**
 * /api/auth/signup — create an account with email + password.
 *
 * POST { email, password, name?, referrer? }
 *
 * Hashes password with bcrypt, registers via SECURITY DEFINER RPC.
 * On success, sets the session cookie and returns { ok: true }.
 *
 * Returns 409 { error: "email_taken" } if a password already exists for
 * this email. Otherwise the row is created (or password filled in on an
 * existing magic-link/Stripe row).
 */

import { hashPassword, passwordStrength } from "@/lib/passwords";
import { registerMember, recordLogin } from "@/lib/supabase";
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
  let payload: {
    email?: string;
    password?: string;
    name?: string;
    referrer?: string;
  } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const password = String(payload.password ?? "");
  const name = String(payload.name ?? "").trim().slice(0, 80);
  const referrer = String(payload.referrer ?? "").trim().slice(0, 200);

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "invalid_email" }, 400);
  }
  const strength = passwordStrength(password);
  if (!strength.ok) {
    return json(
      {
        error: "weak_password",
        reasons:
          strength.reasons.length > 0
            ? strength.reasons
            : ["Mix letters, numbers, or symbols."],
      },
      400,
    );
  }

  let hash: string;
  try {
    hash = await hashPassword(password);
  } catch {
    return json({ error: "weak_password" }, 400);
  }

  try {
    await registerMember({ email, passwordHash: hash, name, referrer });
  } catch (e) {
    const msg = String((e as Error)?.message ?? "");
    if (/email_taken/i.test(msg)) {
      return json({ error: "email_taken" }, 409);
    }
    console.error("[auth/signup] db error", e);
    return json({ error: "server" }, 500);
  }

  try {
    await setSessionCookie(email);
  } catch (e) {
    console.error("[auth/signup] cookie error", e);
    return json({ error: "cookie" }, 500);
  }
  recordLogin(email).catch(() => {});

  return json({ ok: true, email });
}
