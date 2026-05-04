/**
 * Lightweight session cookie for /account.
 *
 * We don't have a full auth provider — paying members get a magic-link login.
 * After a successful magic-link consumption, we set a signed cookie that
 * holds the user's email. Verification lives server-side.
 *
 * Cookie format: base64url(payload).base64url(hmac)
 *   payload = JSON { email, exp }
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "sad_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const raw = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function hmac(payload: string): Promise<string> {
  const secret = process.env.SESSION_SECRET ?? "";
  if (!secret || secret.length < 16) throw new Error("session_secret_missing");
  const k = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(payload));
  return b64urlEncode(sig);
}

export async function signSessionToken(email: string): Promise<string> {
  const payload = JSON.stringify({
    email: email.toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SEC,
  });
  const payloadB64 = b64urlEncode(new TextEncoder().encode(payload));
  const sig = await hmac(payloadB64);
  return `${payloadB64}.${sig}`;
}

export async function verifySessionToken(token: string): Promise<string | null> {
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = await hmac(payloadB64);
  if (expected !== sig) return null;
  try {
    const decoded = JSON.parse(new TextDecoder().decode(b64urlDecode(payloadB64))) as {
      email?: string;
      exp?: number;
    };
    if (!decoded.email || !decoded.exp) return null;
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded.email;
  } catch {
    return null;
  }
}

export async function setSessionCookie(email: string): Promise<void> {
  const token = await signSessionToken(email);
  const c = await cookies();
  c.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SEC,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const c = await cookies();
  c.delete(COOKIE_NAME);
}

export async function getSessionEmail(): Promise<string | null> {
  const c = await cookies();
  const v = c.get(COOKIE_NAME)?.value;
  if (!v) return null;
  return await verifySessionToken(v);
}
