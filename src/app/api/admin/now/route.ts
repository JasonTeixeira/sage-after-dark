/**
 * /api/admin/now — upsert the /now status row.
 * Requires admin session cookie. Body validated server-side.
 */

import { requireAdmin } from "@/lib/admin-guard";
import { adminUpsertNowStatus } from "@/lib/living";

export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
}

function toLines(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return bad("not_admin", 403);
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return bad("bad_json");
  }

  const status = String(body.status ?? "").trim();
  const location = String(body.location ?? "").trim();
  if (!status || status.length > 500) return bad("invalid_status");
  if (!location || location.length > 200) return bad("invalid_location");

  const this_week = toLines(body.this_week).slice(0, 12);
  const not_doing = toLines(body.not_doing).slice(0, 12);

  try {
    await adminUpsertNowStatus({ status, location, this_week, not_doing });
  } catch (e) {
    console.error("[admin/now] upsert failed", e);
    return bad("server_error", 500);
  }

  return Response.json({ ok: true });
}
