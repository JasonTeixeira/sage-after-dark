/**
 * living — server-side data access for the editable, rotating surfaces.
 *
 * Reads come from public RPCs (anon key OK).
 * Writes require the admin secret (held in ADMIN_API_SECRET env var).
 *
 * If Supabase is unconfigured (e.g. local dev with no env), every getter
 * returns sensible empty defaults so pages still render.
 */

import "server-only";
import { unstable_noStore as noStore } from "next/cache";

const URL_BASE = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const ANON = process.env.SUPABASE_ANON_KEY ?? "";
const ADMIN_SECRET = process.env.ADMIN_API_SECRET ?? "";

function configured() {
  return Boolean(URL_BASE) && Boolean(ANON);
}

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!configured()) throw new Error("supabase_not_configured");
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`rpc_${name}_${r.status}: ${t}`);
  }
  return (await r.json()) as T;
}

// ---------- Types ----------

export type NowStatus = {
  status: string;
  location: string;
  this_week: string[];
  not_doing: string[];
  updated_at: string;
};

export type RotationKind =
  | "book"
  | "music"
  | "film"
  | "listening"
  | "watching"
  | "reading";

export type RotationItem = {
  id: string;
  title: string;
  by_line: string;
  year_label: string | null;
  note: string | null;
  shelf: string | null;
  rank: number;
  added_at: string;
  updated_at: string;
};

export type AdminRotationItem = RotationItem & {
  kind: RotationKind;
  active: boolean;
};

export type FeaturedSlot =
  | "editor_pick"
  | "popular_read"
  | "home_hero"
  | "member_only";

export type FeaturedRow = { slug: string; rank: number; pinned_at: string };

export type AdminFeaturedRow = FeaturedRow & {
  id: string;
  slot: FeaturedSlot;
  active: boolean;
};

export type ViewStats = {
  views: number;
  unique_visitors: number;
  last_seen_at?: string | null;
};

export type TopPostRow = {
  slug: string;
  path: string;
  views: number;
  unique_visitors: number;
};

// ---------- Public reads ----------

export async function getNowStatus(): Promise<NowStatus | null> {
  noStore();
  if (!configured()) return null;
  try {
    const rows = await rpc<NowStatus[]>("sage_after_dark_get_now_status", {});
    return rows[0] ?? null;
  } catch (e) {
    console.warn("[living] getNowStatus failed", e);
    return null;
  }
}

export async function getRotation(kind: RotationKind): Promise<RotationItem[]> {
  noStore();
  if (!configured()) return [];
  try {
    return await rpc<RotationItem[]>("sage_after_dark_get_rotation", {
      p_kind: kind,
    });
  } catch (e) {
    console.warn("[living] getRotation", kind, "failed", e);
    return [];
  }
}

export async function getFeatured(slot: FeaturedSlot): Promise<FeaturedRow[]> {
  noStore();
  if (!configured()) return [];
  try {
    return await rpc<FeaturedRow[]>("sage_after_dark_get_featured", {
      p_slot: slot,
    });
  } catch (e) {
    console.warn("[living] getFeatured", slot, "failed", e);
    return [];
  }
}

export async function getViewsForSlug(slug: string): Promise<ViewStats> {
  if (!configured()) return { views: 0, unique_visitors: 0 };
  try {
    const rows = await rpc<ViewStats[]>("sage_after_dark_views_for_slug", {
      p_slug: slug,
    });
    return rows[0] ?? { views: 0, unique_visitors: 0 };
  } catch {
    return { views: 0, unique_visitors: 0 };
  }
}

export async function getTotalPageviews(): Promise<{
  views: number;
  unique_visitors: number;
}> {
  if (!configured()) return { views: 0, unique_visitors: 0 };
  try {
    const rows = await rpc<Array<{ views: number; unique_visitors: number }>>(
      "sage_after_dark_total_pageviews",
      {},
    );
    return rows[0] ?? { views: 0, unique_visitors: 0 };
  } catch {
    return { views: 0, unique_visitors: 0 };
  }
}

export async function getTopPosts(limit = 10): Promise<TopPostRow[]> {
  if (!configured()) return [];
  try {
    return await rpc<TopPostRow[]>("sage_after_dark_top_posts", {
      p_limit: limit,
    });
  } catch {
    return [];
  }
}

// ---------- Admin (secret-gated) ----------

function requireSecret(): string {
  if (!ADMIN_SECRET) throw new Error("admin_secret_not_configured");
  return ADMIN_SECRET;
}

export type AdminMember = {
  email: string;
  status: string;
  plan: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  created_at: string;
};

export type AdminMagicLink = {
  email: string;
  created_at: string;
  consumed_at: string | null;
  expires_at: string;
};

export async function adminListMembers(): Promise<AdminMember[]> {
  noStore();
  return rpc<AdminMember[]>("sage_after_dark_admin_members", {
    p_secret: requireSecret(),
  });
}

export async function adminListMagicLinks(
  limit = 25,
): Promise<AdminMagicLink[]> {
  noStore();
  return rpc<AdminMagicLink[]>("sage_after_dark_admin_magic_links", {
    p_secret: requireSecret(),
    p_limit: limit,
  });
}

export async function adminListRotationAll(): Promise<AdminRotationItem[]> {
  noStore();
  return rpc<AdminRotationItem[]>("sage_after_dark_admin_rotation_all", {
    p_secret: requireSecret(),
  });
}

export async function adminListFeaturedAll(): Promise<AdminFeaturedRow[]> {
  noStore();
  return rpc<AdminFeaturedRow[]>("sage_after_dark_admin_featured_all", {
    p_secret: requireSecret(),
  });
}

export async function adminUpsertNowStatus(args: {
  status: string;
  location: string;
  this_week: string[];
  not_doing: string[];
}): Promise<void> {
  await rpc("sage_after_dark_upsert_now_status", {
    p_status: args.status,
    p_location: args.location,
    p_this_week: args.this_week,
    p_not_doing: args.not_doing,
    p_secret: requireSecret(),
  });
}

export async function adminAddRotation(args: {
  kind: RotationKind;
  title: string;
  by: string;
  year?: string | null;
  note?: string | null;
  shelf?: string | null;
  rank?: number | null;
}): Promise<string> {
  const id = await rpc<string>("sage_after_dark_add_rotation", {
    p_kind: args.kind,
    p_title: args.title,
    p_by: args.by,
    p_year: args.year ?? null,
    p_note: args.note ?? null,
    p_shelf: args.shelf ?? null,
    p_rank: args.rank ?? 100,
    p_secret: requireSecret(),
  });
  return id;
}

export async function adminDeactivateRotation(id: string): Promise<void> {
  await rpc("sage_after_dark_deactivate_rotation", {
    p_id: id,
    p_secret: requireSecret(),
  });
}

export async function adminPinPost(args: {
  slug: string;
  slot: FeaturedSlot;
  rank?: number | null;
}): Promise<string> {
  return rpc<string>("sage_after_dark_pin_post", {
    p_slug: args.slug,
    p_slot: args.slot,
    p_rank: args.rank ?? 100,
    p_secret: requireSecret(),
  });
}

export async function adminUnpinPost(id: string): Promise<void> {
  await rpc("sage_after_dark_unpin_post", {
    p_id: id,
    p_secret: requireSecret(),
  });
}
