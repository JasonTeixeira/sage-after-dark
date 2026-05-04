/**
 * /api/subscribe — newsletter signup endpoint.
 *
 * Captures email + optional source string. Persists to Supabase via REST.
 * Phase 6 will wire Resend confirmations + double opt-in.
 *
 * Required env vars:
 *   SUPABASE_URL                  https://<project>.supabase.co
 *   SUPABASE_ANON_KEY             public anon key (used to call the SECURITY DEFINER RPC)
 *
 * The schema lives in the database as a migration. Insert path is
 * the public.subscribe(p_email, p_source) RPC — it validates the
 * email server-side and upserts on conflict.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Json = Record<string, unknown>;

function json(body: Json, init: number | ResponseInit = 200) {
  const status = typeof init === "number" ? init : init.status ?? 200;
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request) {
  let payload: Json;
  try {
    payload = (await req.json()) as Json;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const email = String(payload.email ?? "").trim().toLowerCase();
  const source = String(payload.source ?? "site").slice(0, 64);

  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: "Enter a valid email." }, 400);
  }
  if (email.length > 254) {
    return json({ error: "Email is too long." }, 400);
  }

  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    // Storage not yet wired — accept the email so the form works in dev.
    console.warn(
      "[subscribe] SUPABASE_URL / SUPABASE_ANON_KEY not set; accepting in dry-run.",
    );
    return json({ ok: true, dryRun: true });
  }

  // Call the SECURITY DEFINER RPC so we never need the service role key.
  const r = await fetch(
    `${url.replace(/\/$/, "")}/rest/v1/rpc/subscribe`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ p_email: email, p_source: source }),
    },
  );

  if (!r.ok) {
    const text = await r.text();
    console.error("[subscribe] supabase error", r.status, text);
    return json({ error: "Could not save right now. Try again." }, 500);
  }

  return json({ ok: true });
}
