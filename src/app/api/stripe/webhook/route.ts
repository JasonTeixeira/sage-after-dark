/**
 * /api/stripe/webhook — Stripe webhook receiver.
 *
 * Verifies the Stripe-Signature header against STRIPE_WEBHOOK_SECRET, then
 * upserts the member row via our SECURITY DEFINER RPC and sends a welcome
 * email on first activation.
 *
 * Subscribed events (configure in Stripe dashboard):
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 */

import { sendEmail, memberWelcomeEmail } from "@/lib/email";
import { createPortalSession, verifyStripeSignature } from "@/lib/stripe";
import { upsertMember } from "@/lib/supabase";

export const runtime = "nodejs";
// Must read the raw body byte-for-byte for HMAC verification.
export const dynamic = "force-dynamic";

type StripeEvent = {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
};

function planFromPriceId(priceId: string | undefined | null): string | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_ANNUAL_OVERRIDE) return "annual";
  // Hard-coded fallback to the live IDs declared in lib/stripe.ts.
  if (priceId === "price_1TTQAlEDeyGfkojJRN8EaiCG") return "annual";
  if (priceId === "price_1TTQAlEDeyGfkojJflooVpCR") return "monthly";
  return null;
}

function tsToIso(seconds: unknown): string | null {
  if (typeof seconds !== "number") return null;
  return new Date(seconds * 1000).toISOString();
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const supaSecret = process.env.SUPABASE_WEBHOOK_SECRET;
  if (!secret || !supaSecret) {
    console.error("[stripe webhook] secrets not configured");
    return new Response("config", { status: 503 });
  }

  const raw = await req.text();
  const ok = await verifyStripeSignature(raw, sig, secret);
  if (!ok) {
    console.warn("[stripe webhook] signature verification failed");
    return new Response("invalid signature", { status: 400 });
  }

  let evt: StripeEvent;
  try {
    evt = JSON.parse(raw) as StripeEvent;
  } catch {
    return new Response("invalid json", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "checkout.session.completed": {
        const obj = evt.data.object as {
          customer_email?: string;
          customer_details?: { email?: string };
          customer?: string;
          subscription?: string;
          metadata?: { plan?: string };
        };
        const email =
          obj.customer_email ?? obj.customer_details?.email ?? null;
        if (!email) break;
        const plan = obj.metadata?.plan ?? "monthly";
        await upsertMember({
          email,
          stripeCustomerId: obj.customer ?? null,
          stripeSubscriptionId: obj.subscription ?? null,
          status: "active",
          plan,
          currentPeriodEnd: null,
          webhookSecret: supaSecret,
        });

        // Best-effort welcome email with portal link.
        try {
          let portalUrl = "https://www.sageafterdark.com/account";
          if (obj.customer) {
            const ps = await createPortalSession({
              customerId: obj.customer,
              returnUrl: "https://www.sageafterdark.com/account",
            });
            portalUrl = ps.url;
          }
          const tpl = memberWelcomeEmail({ plan, portalUrl });
          await sendEmail({ to: email, ...tpl });
        } catch (e) {
          console.warn("[stripe webhook] welcome email failed", e);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const obj = evt.data.object as {
          status?: string;
          customer?: string;
          id?: string;
          current_period_end?: number;
          items?: { data?: Array<{ price?: { id?: string } }> };
          metadata?: { plan?: string };
        };
        const customerId = obj.customer;
        if (!customerId) break;

        // Look up email by customer id from our members table via REST.
        const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
        const key = process.env.SUPABASE_ANON_KEY;
        if (!url || !key) break;
        const r = await fetch(
          `${url}/rest/v1/sage_after_dark_members?stripe_customer_id=eq.${encodeURIComponent(customerId)}&select=email`,
          {
            headers: { apikey: key, Authorization: `Bearer ${key}` },
            cache: "no-store",
          },
        );
        if (!r.ok) break;
        const rows = (await r.json()) as Array<{ email: string }>;
        const email = rows[0]?.email;
        if (!email) break;

        const priceId = obj.items?.data?.[0]?.price?.id ?? null;
        const plan = planFromPriceId(priceId) ?? obj.metadata?.plan ?? null;
        const status =
          evt.type === "customer.subscription.deleted"
            ? "canceled"
            : obj.status ?? "active";

        await upsertMember({
          email,
          stripeCustomerId: customerId,
          stripeSubscriptionId: obj.id ?? null,
          status,
          plan,
          currentPeriodEnd: tsToIso(obj.current_period_end),
          webhookSecret: supaSecret,
        });
        break;
      }

      default:
        // Ignore other events; respond 200 so Stripe doesn't retry.
        break;
    }
  } catch (e) {
    console.error("[stripe webhook] handler error", e);
    return new Response("handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
