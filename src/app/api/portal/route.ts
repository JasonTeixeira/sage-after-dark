/**
 * /api/portal — opens the Stripe billing portal for the signed-in member.
 *
 * Reads the session cookie, looks up the member's stripe_customer_id via the
 * member-status RPC (which returns it on the row), and returns/redirects to
 * the portal URL.
 */

import { getSessionEmail } from "@/lib/auth";
import { createPortalSession } from "@/lib/stripe";
import { memberStatus } from "@/lib/supabase";

export const runtime = "nodejs";

const SITE = "https://www.sageafterdark.com";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  const email = await getSessionEmail();
  if (!email) return json({ error: "not_signed_in" }, 401);

  // The member_status RPC returns plan/status; we extend it to include
  // stripe_customer_id by reading from the members table directly via REST.
  const status = await memberStatus(email);
  if (!status || status.status !== "active") {
    return json({ error: "no_active_membership" }, 403);
  }

  // Fetch customer id directly (one extra hop — keeps RPC API clean).
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key || !process.env.STRIPE_SECRET_KEY) {
    return json({ error: "service_unavailable" }, 503);
  }
  const r = await fetch(
    `${url}/rest/v1/sage_after_dark_members?email=eq.${encodeURIComponent(email)}&select=stripe_customer_id`,
    {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
    },
  );
  if (!r.ok) return json({ error: "lookup_failed" }, 500);
  const rows = (await r.json()) as Array<{ stripe_customer_id: string | null }>;
  const customerId = rows[0]?.stripe_customer_id;
  if (!customerId) return json({ error: "no_customer" }, 404);

  try {
    const session = await createPortalSession({
      customerId,
      returnUrl: `${SITE}/account`,
    });
    const accept = req.headers.get("accept") ?? "";
    if (accept.includes("text/html") || !accept.includes("application/json")) {
      return Response.redirect(session.url, 303);
    }
    return json({ url: session.url });
  } catch (err) {
    console.error("[portal] error", err);
    return json({ error: "portal_failed" }, 500);
  }
}
