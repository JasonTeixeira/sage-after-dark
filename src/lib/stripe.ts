/**
 * Stripe REST helpers.
 *
 * We hit the Stripe REST API directly via fetch — keeps the bundle small
 * and avoids pulling the Stripe Node SDK. Webhook signature verification
 * uses Web Crypto so it runs anywhere Node 18+ does.
 */

const STRIPE_BASE = "https://api.stripe.com/v1";

export const STRIPE_PRODUCT_ID = "prod_USRifioJd71oZF";
export const STRIPE_PRICE_MONTHLY = "price_1TTWp5EGpp4mxtd4u3SPwXcH";
export const STRIPE_PRICE_ANNUAL = "price_1TTWp5EGpp4mxtd4EhfemchH";

function key(): string {
  const k = process.env.STRIPE_SECRET_KEY;
  if (!k) throw new Error("stripe_not_configured");
  return k;
}

function form(obj: Record<string, string | number | undefined | null>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    u.set(k, String(v));
  }
  return u.toString();
}

async function api<T = unknown>(path: string, body?: string): Promise<T> {
  const r = await fetch(`${STRIPE_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`stripe_${r.status}: ${txt}`);
  }
  return (await r.json()) as T;
}

/* ---- checkout sessions ---- */
export async function createCheckoutSession(args: {
  priceId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<{ id: string; url: string }> {
  const body: Record<string, string> = {
    mode: "subscription",
    "line_items[0][price]": args.priceId,
    "line_items[0][quantity]": "1",
    success_url: args.successUrl,
    cancel_url: args.cancelUrl,
    allow_promotion_codes: "true",
    "automatic_tax[enabled]": "false",
    "subscription_data[metadata][source]": "sage_after_dark",
  };
  if (args.email) body.customer_email = args.email;
  if (args.metadata) {
    for (const [k, v] of Object.entries(args.metadata)) {
      body[`metadata[${k}]`] = v;
    }
  }
  const session = await api<{ id: string; url: string }>(
    "/checkout/sessions",
    new URLSearchParams(body).toString(),
  );
  return { id: session.id, url: session.url };
}

/* ---- billing portal ---- */
export async function createPortalSession(args: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const session = await api<{ url: string }>(
    "/billing_portal/sessions",
    form({ customer: args.customerId, return_url: args.returnUrl }),
  );
  return { url: session.url };
}

/* ---- subscription details ---- */
export async function getSubscription(id: string): Promise<unknown> {
  return await api(`/subscriptions/${id}`);
}

/* ---- webhook signature verification (no SDK) ---- */
// Stripe-Signature header: "t=1492774577,v1=5257a869e7..."
// We verify v1 = HMAC_SHA256(secret, `${t}.${payload}`)
export async function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  toleranceSeconds = 300,
): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i), kv.slice(i + 1)];
    }),
  ) as { t?: string; v1?: string };
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const tNum = parseInt(t, 10);
  if (!Number.isFinite(tNum)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - tNum) > toleranceSeconds) return false;

  const enc = new TextEncoder();
  const data = enc.encode(`${t}.${payload}`);
  const k = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, data);
  const hex = [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");

  // constant-time compare
  if (hex.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

/* -----------------------------------------------------------
 * Public metrics — for /numbers dashboard.
 *
 * Pulls subscriptions.list (active only) + invoices.list (last 90 days)
 * and computes MRR, sub count, churn proxy. Intentionally rounded to
 * remove false precision and protect privacy.
 * --------------------------------------------------------- */

type StripeSubscription = {
  id: string;
  status: string;
  items: { data: { price: { id: string; unit_amount: number; recurring?: { interval: string } } }[] };
  canceled_at?: number | null;
  created: number;
};

type StripeListResp<T> = { data: T[]; has_more: boolean };

async function listAll<T>(path: string, params: Record<string, string> = {}): Promise<T[]> {
  const all: T[] = [];
  let starting_after: string | undefined;
  for (let i = 0; i < 10; i++) {
    const u = new URLSearchParams({ limit: "100", ...params });
    if (starting_after) u.set("starting_after", starting_after);
    const r = await api<StripeListResp<T> & { data: (T & { id?: string })[] }>(`${path}?${u}`);
    all.push(...r.data);
    if (!r.has_more || r.data.length === 0) break;
    const last = r.data[r.data.length - 1] as { id?: string };
    if (!last?.id) break;
    starting_after = last.id;
  }
  return all;
}

export type PublicMetrics = {
  /** Monthly recurring revenue, in dollars (rounded to nearest $5). */
  mrrUsd: number;
  /** Active subscribers (any active status). */
  activeSubs: number;
  /** Subs that started in the last 30 days. */
  newSubs30d: number;
  /** Subs that canceled in the last 30 days. */
  canceledSubs30d: number;
  /** Approx churn rate (canceled / start-of-period active), 0-1. Null if denominator is too small. */
  churn30d: number | null;
  /** Lifetime revenue, in dollars (rounded to nearest $10). */
  lifetimeUsd: number;
  /** When this snapshot was generated, ISO. */
  asOf: string;
};

export async function getPublicMetrics(): Promise<PublicMetrics> {
  const subs = await listAll<StripeSubscription>("/subscriptions", { status: "all" });

  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const active = subs.filter((s) => s.status === "active" || s.status === "trialing");
  const activeCount = active.length;

  // MRR — normalize annual prices to monthly
  let mrrCents = 0;
  for (const s of active) {
    for (const item of s.items.data) {
      const amt = item.price.unit_amount ?? 0;
      const interval = item.price.recurring?.interval;
      if (interval === "month") mrrCents += amt;
      else if (interval === "year") mrrCents += Math.round(amt / 12);
    }
  }
  const mrrUsd = roundTo(mrrCents / 100, 5);

  const newSubs30d = subs.filter((s) => s.created >= thirtyDaysAgo).length;
  const canceledSubs30d = subs.filter(
    (s) => s.canceled_at && s.canceled_at >= thirtyDaysAgo,
  ).length;

  // start-of-period active = currently-active that existed before window
  // + canceled-in-window (they were active at start)
  const startActive = active.filter((s) => s.created < thirtyDaysAgo).length + canceledSubs30d;
  const churn30d = startActive >= 5 ? canceledSubs30d / startActive : null;

  // Lifetime revenue from invoices.list (last ~10 pages worth ≈ 1000 invoices)
  type Invoice = { amount_paid: number; status: string };
  let lifetimeCents = 0;
  try {
    const invoices = await listAll<Invoice>("/invoices", { status: "paid" });
    for (const inv of invoices) lifetimeCents += inv.amount_paid ?? 0;
  } catch {
    // non-fatal — leave at 0 if invoice list fails
  }
  const lifetimeUsd = roundTo(lifetimeCents / 100, 10);

  return {
    mrrUsd,
    activeSubs: activeCount,
    newSubs30d,
    canceledSubs30d,
    churn30d,
    lifetimeUsd,
    asOf: new Date().toISOString(),
  };
}

function roundTo(n: number, step: number): number {
  return Math.round(n / step) * step;
}
