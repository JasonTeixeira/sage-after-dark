/**
 * admin-guard — gate for /admin and admin API routes.
 *
 * Admin = the email matching ADMIN_EMAIL env var, signed-in via magic link.
 * Returns the admin email on success, null otherwise.
 */

import "server-only";
import { getSessionEmail } from "@/lib/auth";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").toLowerCase();

export async function isAdmin(): Promise<boolean> {
  if (!ADMIN_EMAIL) return false;
  const email = await getSessionEmail();
  return Boolean(email && email.toLowerCase() === ADMIN_EMAIL);
}

export async function requireAdmin(): Promise<string> {
  const email = await getSessionEmail();
  if (!email || !ADMIN_EMAIL || email.toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("not_admin");
  }
  return email;
}

export function getAdminEmail(): string | null {
  return ADMIN_EMAIL || null;
}

/**
 * Pure check: does this email match the admin? Synchronous — used by
 * components that already have the email in hand and don't want to
 * re-read the cookie.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || !ADMIN_EMAIL) return false;
  return email.toLowerCase() === ADMIN_EMAIL;
}
