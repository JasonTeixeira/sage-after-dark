/**
 * /api/admin/rotation — add a new rotation item.
 *
 * POST { kind, title, by, year?, note?, shelf?, rank? }
 * DELETE ?id=<uuid> deactivates an item.
 */

import { requireAdmin } from "@/lib/admin-guard";
import {
  adminAddRotation,
  adminDeactivateRotation,
  type RotationKind,
} from "@/lib/living";

export const runtime = "nodejs";

const KINDS: RotationKind[] = [
  "book",
  "music",
  "film",
  "listening",
  "watching",
  "reading",
];

function bad(message: string, status = 400) {
  return Response.json({ ok: false, error: message }, { status });
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

  const kind = String(body.kind ?? "") as RotationKind;
  if (!KINDS.includes(kind)) return bad("invalid_kind");

  const title = String(body.title ?? "").trim();
  if (!title || title.length > 200) return bad("invalid_title");

  const by = String(body.by ?? "").trim();
  if (by.length > 200) return bad("invalid_by");

  const year =
    body.year != null && String(body.year).trim() !== ""
      ? String(body.year).trim().slice(0, 12)
      : null;
  const note =
    body.note != null && String(body.note).trim() !== ""
      ? String(body.note).trim().slice(0, 500)
      : null;
  const shelf =
    body.shelf != null && String(body.shelf).trim() !== ""
      ? String(body.shelf).trim().slice(0, 60)
      : null;
  const rank =
    body.rank != null && Number.isFinite(Number(body.rank))
      ? Math.max(0, Math.min(9999, Number(body.rank)))
      : 100;

  try {
    const id = await adminAddRotation({ kind, title, by, year, note, shelf, rank });
    return Response.json({ ok: true, id });
  } catch (e) {
    console.error("[admin/rotation] add failed", e);
    return bad("server_error", 500);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return bad("not_admin", 403);
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{20,}$/i.test(id)) return bad("invalid_id");

  try {
    await adminDeactivateRotation(id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[admin/rotation] deactivate failed", e);
    return bad("server_error", 500);
  }
}
