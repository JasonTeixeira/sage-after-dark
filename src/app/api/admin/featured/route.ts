/**
 * /api/admin/featured — pin/unpin featured posts.
 *
 * POST { slug, slot, rank? } — pin
 * DELETE ?id=<uuid> — unpin
 */

import { requireAdmin } from "@/lib/admin-guard";
import {
  adminPinPost,
  adminUnpinPost,
  type FeaturedSlot,
} from "@/lib/living";

export const runtime = "nodejs";

const SLOTS: FeaturedSlot[] = [
  "editor_pick",
  "popular_read",
  "home_hero",
  "member_only",
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

  const slug = String(body.slug ?? "").trim();
  if (!slug || slug.length > 200 || !/^[a-z0-9\-/]+$/i.test(slug))
    return bad("invalid_slug");

  const slot = String(body.slot ?? "") as FeaturedSlot;
  if (!SLOTS.includes(slot)) return bad("invalid_slot");

  const rank =
    body.rank != null && Number.isFinite(Number(body.rank))
      ? Math.max(0, Math.min(9999, Number(body.rank)))
      : 100;

  try {
    const id = await adminPinPost({ slug, slot, rank });
    return Response.json({ ok: true, id });
  } catch (e) {
    console.error("[admin/featured] pin failed", e);
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
    await adminUnpinPost(id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[admin/featured] unpin failed", e);
    return bad("server_error", 500);
  }
}
