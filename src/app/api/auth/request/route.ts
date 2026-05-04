/**
 * /api/auth/request — issues a magic-link sign-in.
 *
 * POST { email: string }
 *
 * Generates a cryptographically random token, stores it in Supabase via the
 * SECURITY DEFINER RPC (with TTL), and emails the user a single-use link.
 *
 * Always returns { ok: true } — we don't disclose whether the address has
 * an account, to avoid enumeration.
 */

import { magicLinkEmail, sendEmail } from "@/lib/email";
import { createMagicLink } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE = "https://www.sageafterdark.com";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function randomToken(bytes = 32): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(req: Request) {
  let payload: { email?: string } = {};
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      payload = (await req.json()) as { email?: string };
    } else {
      const fd = await req.formData();
      payload = { email: String(fd.get("email") ?? "") };
    }
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "invalid_email" }, 400);
  }

  const token = randomToken();
  try {
    await createMagicLink(email, token, 15);
  } catch (e) {
    console.error("[auth/request] db error", e);
    // Still return ok so we don't leak account existence.
    return json({ ok: true });
  }

  const url = `${SITE}/api/auth/verify?token=${token}`;
  try {
    const tpl = magicLinkEmail({ url });
    await sendEmail({ to: email, ...tpl });
  } catch (e) {
    console.warn("[auth/request] email send failed", e);
  }

  return json({ ok: true });
}
