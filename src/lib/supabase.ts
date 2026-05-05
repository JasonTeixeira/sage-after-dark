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
  // PostgREST returns an empty body (204 / 200 with no content) for RETURNS
  // void functions. r.json() would throw SyntaxError on empty input.
  if (r.status === 204) return undefined as T;
  const text = await r.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
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

/* ---- password auth ---- */

export type PasswordRow = {
  email: string;
  password_hash: string | null;
  status: string;
  name: string | null;
  email_verified_at: string | null;
};

export async function getPasswordRow(email: string): Promise<PasswordRow | null> {
  const rows = await rpc<PasswordRow[]>("sage_after_dark_get_password", {
    p_email: email,
  });
  return rows[0] ?? null;
}

export async function registerMember(args: {
  email: string;
  passwordHash: string;
  name: string;
  referrer: string;
}): Promise<string> {
  return await rpc<string>("sage_after_dark_register_member", {
    p_email: args.email,
    p_password_hash: args.passwordHash,
    p_name: args.name,
    p_referrer: args.referrer,
  });
}

export async function recordLogin(email: string): Promise<void> {
  await rpc("sage_after_dark_record_login", { p_email: email });
}

export async function createPasswordReset(args: {
  email: string;
  tokenHash: string;
  purpose: "reset" | "set";
  ttlMinutes: number;
}): Promise<void> {
  await rpc("sage_after_dark_create_password_reset", {
    p_email: args.email,
    p_token_hash: args.tokenHash,
    p_purpose: args.purpose,
    p_ttl_minutes: args.ttlMinutes,
  });
}

export async function consumePasswordReset(
  tokenHash: string,
): Promise<string | null> {
  const out = await rpc<string | null>(
    "sage_after_dark_consume_password_reset",
    { p_token_hash: tokenHash },
  );
  return out ?? null;
}

export async function setMemberPassword(
  email: string,
  passwordHash: string,
): Promise<void> {
  await rpc("sage_after_dark_set_password", {
    p_email: email,
    p_password_hash: passwordHash,
  });
}

export async function updateProfile(args: {
  email: string;
  name: string | null;
  referrer: string | null;
}): Promise<void> {
  await rpc("sage_after_dark_update_profile", {
    p_email: args.email,
    p_name: args.name ?? "",
    p_referrer: args.referrer ?? "",
  });
}

export type WhoamiRow = {
  email: string;
  name: string | null;
  status: string;
  plan: string | null;
  current_period_end: string | null;
  has_password: boolean;
  created_at: string;
};

export async function whoami(email: string): Promise<WhoamiRow | null> {
  const rows = await rpc<WhoamiRow[]>("sage_after_dark_whoami", {
    p_email: email,
  });
  return rows[0] ?? null;
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
