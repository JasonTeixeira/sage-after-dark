/**
 * /api/auth/reset — consume a reset token and set a new password.
 *
 * POST { token, password }
 *
 * Token may be issued for purpose='reset' (forgot flow) or purpose='set'
 * (admin-seeded initial password). Either way: consume the token, hash
 * the new password, save it, and sign the user in.
 */

import { hashPassword, passwordStrength, sha256Hex } from "@/lib/passwords";
import {
  consumePasswordReset,
  recordLogin,
  setMemberPassword,
} from "@/lib/supabase";
import { setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let payload: { token?: string; password?: string } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const token = String(payload.token ?? "").trim();
  const password = String(payload.password ?? "");

  if (!token || !/^[a-f0-9]{40,}$/i.test(token)) {
    return json({ error: "invalid_token" }, 400);
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

  const tokenHash = await sha256Hex(token);
  let email: string | null = null;
  try {
    email = await consumePasswordReset(tokenHash);
  } catch (e) {
    console.error("[auth/reset] db error", e);
    return json({ error: "server" }, 500);
  }
  if (!email) {
    return json({ error: "expired" }, 400);
  }

  let hash: string;
  try {
    hash = await hashPassword(password);
  } catch {
    return json({ error: "weak_password" }, 400);
  }

  try {
    await setMemberPassword(email, hash);
  } catch (e) {
    console.error("[auth/reset] save error", e);
    return json({ error: "server" }, 500);
  }

  try {
    await setSessionCookie(email);
  } catch (e) {
    console.error("[auth/reset] cookie error", e);
    return json({ error: "cookie" }, 500);
  }
  recordLogin(email).catch(() => {});

  return json({ ok: true, email });
}
