/**
 * Supabase REST helpers — anon key only.
 *
 * All schema mutations go through SECURITY DEFINER RPCs we registered as
 * migrations. Anon key is used to invoke them. The service role key is
 * never exposed to this codebase.
 */

const URL_BASE = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = process.env.SUPABASE_ANON_KEY ?? "";

export function supabaseConfigured(): boolean {
  return Boolean(URL_BASE) && Boolean(KEY);
}

async function rpc<T = unknown>(name: string, body: Record<string, unknown>): Promise<T> {
  if (!URL_BASE || !KEY) {
    throw new Error("supabase_not_configured");
  }
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`supabase_${name}_${r.status}: ${text}`);
  }
  return (await r.json()) as T;
}

/* ---- subscribers ---- */
export async function subscribeEmail(email: string, source: string): Promise<void> {
  await rpc("subscribe", { p_email: email, p_source: source });
}

/* ---- members ---- */
export type MemberStatusRow = {
  status: string;
  plan: string | null;
  current_period_end: string | null;
};

export async function memberStatus(email: string): Promise<MemberStatusRow | null> {
  const rows = await rpc<MemberStatusRow[]>("sage_after_dark_member_status", { p_email: email });
  return rows[0] ?? null;
}

export async function upsertMember(args: {
  email: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  plan: string | null;
  currentPeriodEnd: string | null;
  webhookSecret: string;
}): Promise<void> {
  await rpc("sage_after_dark_upsert_member", {
    p_email: args.email,
    p_stripe_customer_id: args.stripeCustomerId,
    p_stripe_subscription_id: args.stripeSubscriptionId,
    p_status: args.status,
    p_plan: args.plan,
    p_current_period_end: args.currentPeriodEnd,
    p_secret: args.webhookSecret,
  });
}

/* ---- magic links ---- */
export async function createMagicLink(email: string, token: string, ttlMinutes = 15): Promise<void> {
  await rpc("sage_after_dark_create_magic_link", {
    p_email: email,
    p_token: token,
    p_ttl_minutes: ttlMinutes,
  });
}

export async function consumeMagicLink(token: string): Promise<string | null> {
  const out = await rpc<string | null>("sage_after_dark_consume_magic_link", { p_token: token });
  return out ?? null;
}

/* ---- stripe event idempotency ----
 * Returns true the FIRST time we see this event id, false on every retry.
 * Lets the webhook handler skip side effects on duplicates.
 */
export async function recordStripeEvent(
  eventId: string,
  eventType: string,
): Promise<boolean> {
  if (!supabaseConfigured()) return true; // dry-run: always allow
  try {
    const inserted = await rpc<boolean>("sage_after_dark_stripe_event_record", {
      p_event_id: eventId,
      p_event_type: eventType,
    });
    return Boolean(inserted);
  } catch (e) {
    // If the idempotency table isn't migrated yet, allow processing.
    console.warn("[stripe] idempotency check failed, allowing:", e);
    return true;
  }
}
