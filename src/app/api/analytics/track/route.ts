/**
 * /api/analytics/track — privacy-first analytics ingest.
 *
 * Accepts POST with one of two payloads:
 *   { kind: "pageview", path, pillar?, template?, slug?, referrer? }
 *   { kind: "event",    name: "scroll_25"|..., path, slug?, meta? }
 *
 * Visitor identity is a daily-rotated salted hash of (IP + UA). No cookies,
 * no localStorage IDs, no PII. Bots are dropped server-side.
 *
 * If Supabase is not configured, the endpoint accepts and no-ops so dev
 * builds never fail.
 */

import { createHash } from "node:crypto";

export const runtime = "nodejs";

type Json = Record<string, unknown>;

const URL_BASE = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const KEY = process.env.SUPABASE_ANON_KEY ?? "";
const SALT = process.env.ANALYTICS_SALT ?? process.env.SESSION_SECRET ?? "sad";

const BOT_RE =
  /bot|spider|crawler|headlesschrome|lighthouse|wget|curl|python-requests|axios|node-fetch/i;

function uaClass(ua: string): "mobile" | "tablet" | "desktop" | "bot" {
  if (!ua) return "desktop";
  if (BOT_RE.test(ua)) return "bot";
  if (/ipad|tablet/i.test(ua)) return "tablet";
  if (/mobi|android|iphone/i.test(ua)) return "mobile";
  return "desktop";
}

function dayKey(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}${d.getUTCMonth()}${d.getUTCDate()}`;
}

function visitorHash(ip: string, ua: string): string {
  return createHash("sha256")
    .update(`${SALT}:${dayKey()}:${ip}:${ua}`)
    .digest("hex")
    .slice(0, 24);
}

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "0.0.0.0"
  );
}

async function rpc(name: string, body: Json) {
  if (!URL_BASE || !KEY) return; // dry-run
  await fetch(`${URL_BASE}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
    // Fire-and-forget — never let analytics block the user.
    keepalive: true,
  }).catch((e) => console.warn(`[analytics] ${name} failed`, e));
}

const ALLOWED_EVENTS = new Set([
  "scroll_25",
  "scroll_50",
  "scroll_75",
  "read_complete",
  "share",
  "outbound",
  "dwell_60s",
]);

function s(v: unknown, max = 256): string {
  return String(v ?? "").slice(0, max);
}

export async function POST(req: Request) {
  let body: Json;
  try {
    body = (await req.json()) as Json;
  } catch {
    return new Response("bad json", { status: 400 });
  }

  const ua = req.headers.get("user-agent") ?? "";
  const cls = uaClass(ua);
  if (cls === "bot") return new Response(null, { status: 204 });

  const ip = clientIp(req);
  const hash = visitorHash(ip, ua);

  const kind = s(body.kind, 32);

  if (kind === "pageview") {
    const path = s(body.path, 512);
    if (!path || !path.startsWith("/")) return new Response("bad path", { status: 400 });
    await rpc("sage_after_dark_track_pageview", {
      p_path: path,
      p_pillar: s(body.pillar, 32),
      p_template: s(body.template, 32),
      p_slug: s(body.slug, 128),
      p_referrer: s(body.referrer, 512),
      p_ua_class: cls,
      p_visitor_hash: hash,
    });
    return new Response(null, { status: 204 });
  }

  if (kind === "event") {
    const name = s(body.name, 64);
    if (!ALLOWED_EVENTS.has(name)) return new Response("bad name", { status: 400 });
    const path = s(body.path, 512);
    if (!path || !path.startsWith("/")) return new Response("bad path", { status: 400 });
    const meta =
      body.meta && typeof body.meta === "object" ? (body.meta as Json) : null;
    await rpc("sage_after_dark_track_event", {
      p_kind: name,
      p_path: path,
      p_slug: s(body.slug, 128),
      p_meta: meta,
      p_visitor_hash: hash,
    });
    return new Response(null, { status: 204 });
  }

  return new Response("unknown kind", { status: 400 });
}
