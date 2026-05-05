/**
 * passwords — bcrypt hashing + reset-token utilities.
 *
 * Hashes never leave the server. Reset tokens are random 32-byte strings;
 * we store SHA-256 of the token (so DB leaks don't expose live links) and
 * email out the plaintext.
 */

import "server-only";
import bcrypt from "bcryptjs";

const ROUNDS = 12; // ~250ms on Vercel — strong enough, fast enough.

export async function hashPassword(plaintext: string): Promise<string> {
  if (typeof plaintext !== "string" || plaintext.length < 8) {
    throw new Error("password_too_short");
  }
  if (plaintext.length > 200) {
    throw new Error("password_too_long");
  }
  return await bcrypt.hash(plaintext, ROUNDS);
}

export async function verifyPassword(
  plaintext: string,
  hash: string,
): Promise<boolean> {
  if (!plaintext || !hash) return false;
  try {
    return await bcrypt.compare(plaintext, hash);
  } catch {
    return false;
  }
}

export function randomToken(bytes = 32): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(s),
  );
  const arr = new Uint8Array(buf);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Light strength check — used as a UX gate in the API.
 * Browser-side we mirror the same rules for the meter.
 */
export function passwordStrength(p: string): {
  ok: boolean;
  score: 0 | 1 | 2 | 3 | 4;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (p.length < 8) reasons.push("At least 8 characters.");
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
  return {
    ok: reasons.length === 0 && score >= 2,
    score: Math.min(4, score) as 0 | 1 | 2 | 3 | 4,
    reasons,
  };
}
