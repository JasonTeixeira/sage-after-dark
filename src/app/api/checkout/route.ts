/**
 * /api/checkout — creates a Stripe Checkout Session for the membership.
 *
 * POST { plan: "monthly" | "annual", email?: string }
 *   → 303 redirect or { url } JSON depending on Accept header.
 *
 * The endpoint never reads the secret key directly; it delegates to
 * lib/stripe.ts which lazily resolves STRIPE_SECRET_KEY at call time.
 */

import {
  STRIPE_PRICE_ANNUAL,
  STRIPE_PRICE_MONTHLY,
  createCheckoutSession,
} from "@/lib/stripe";

export const runtime = "nodejs";

const SITE = "https://www.sageafterdark.com";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let payload: { plan?: string; email?: string } = {};
  try {
    const ct = req.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      payload = (await req.json()) as { plan?: string; email?: string };
    } else {
      const fd = await req.formData();
      payload = {
        plan: String(fd.get("plan") ?? ""),
        email: fd.get("email") ? String(fd.get("email")) : undefined,
      };
    }
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const plan = payload.plan === "annual" ? "annual" : "monthly";
  const priceId = plan === "annual" ? STRIPE_PRICE_ANNUAL : STRIPE_PRICE_MONTHLY;

  if (!process.env.STRIPE_SECRET_KEY) {
    return json({ error: "stripe_not_configured" }, 503);
  }

  try {
    const session = await createCheckoutSession({
      priceId,
      email: payload.email,
      successUrl: `${SITE}/account?welcome=1&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${SITE}/membership?canceled=1`,
      metadata: { plan },
    });

    // If the request came from a normal HTML form, redirect.
    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html") || !accept.includes("application/json")) {
      return Response.redirect(session.url, 303);
    }
    return json({ url: session.url });
  } catch (err) {
    console.error("[checkout] error", err);
    return json({ error: "checkout_failed" }, 500);
  }
}
