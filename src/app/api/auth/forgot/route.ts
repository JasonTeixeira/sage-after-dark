/**
 * /api/auth/forgot — issue a password-reset link.
 *
 * POST { email }
 *
 * Always returns { ok: true } — never leak whether the address has an
 * account. If the email exists, a 60-minute reset token is created and
 * mailed.
 */

import { passwordResetEmail, sendEmail } from "@/lib/email";
import { randomToken, sha256Hex } from "@/lib/passwords";
import { createPasswordReset, getPasswordRow } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE = "https://www.sageafterdark.com";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let payload: { email?: string } = {};
  try {
    payload = (await req.json()) as typeof payload;
  } catch {
    return json({ ok: true });
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: true });
  }

  // Only issue a reset if there is a row for this email. Either way we
  // return ok so we don't disclose existence.
  let exists = false;
  try {
    const row = await getPasswordRow(email);
    exists = Boolean(row);
  } catch (e) {
    console.error("[auth/forgot] lookup error", e);
    return json({ ok: true });
  }
  if (!exists) return json({ ok: true });

  const plaintext = randomToken();
  const tokenHash = await sha256Hex(plaintext);
  try {
    await createPasswordReset({
      email,
      tokenHash,
      purpose: "reset",
      ttlMinutes: 60,
    });
  } catch (e) {
    console.error("[auth/forgot] db error", e);
    return json({ ok: true });
  }

  const url = `${SITE}/account/reset?token=${plaintext}`;
  try {
    const tpl = passwordResetEmail({ url });
    await sendEmail({ to: email, ...tpl });
  } catch (e) {
    console.warn("[auth/forgot] email send failed", e);
  }

  return json({ ok: true });
}
