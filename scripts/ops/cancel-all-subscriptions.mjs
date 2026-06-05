#!/usr/bin/env node
/**
 * cancel-all-subscriptions.mjs
 *
 * One-off ops tool: cancel every billable Stripe subscription so members stop
 * being charged after the site goes free. NO refunds (cancellation only).
 *
 * SAFETY: dry-run by default. It only LISTS what it would cancel unless you
 * pass --confirm. Nothing is mutated without --confirm.
 *
 * Usage:
 *   # 1) Preview (safe, no changes):
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/ops/cancel-all-subscriptions.mjs
 *
 *   # 2) Actually cancel (immediate, no refund):
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/ops/cancel-all-subscriptions.mjs --confirm
 *
 *   # Cancel at period end instead of immediately (members keep access until
 *   # their paid period lapses — but the site is free anyway):
 *   STRIPE_SECRET_KEY=sk_live_xxx node scripts/ops/cancel-all-subscriptions.mjs --confirm --at-period-end
 *
 * Run against TEST mode first (sk_test_...) to rehearse.
 */

const BASE = "https://api.stripe.com/v1";
const KEY = process.env.STRIPE_SECRET_KEY;
const CONFIRM = process.argv.includes("--confirm");
const AT_PERIOD_END = process.argv.includes("--at-period-end");

// Statuses that are still billing the customer and worth cancelling.
const CANCELABLE = new Set(["active", "trialing", "past_due", "unpaid"]);

if (!KEY) {
  console.error("ERROR: set STRIPE_SECRET_KEY in the environment.");
  process.exit(1);
}
if (KEY.startsWith("sk_live_") && CONFIRM) {
  console.log("⚠️  LIVE key + --confirm: this WILL cancel real customer subscriptions.\n");
}

async function stripe(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`stripe_${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function listAllSubscriptions() {
  const all = [];
  let startingAfter;
  for (let i = 0; i < 100; i++) {
    const q = new URLSearchParams({ status: "all", limit: "100" });
    if (startingAfter) q.set("starting_after", startingAfter);
    const page = await stripe(`/subscriptions?${q}`);
    all.push(...page.data);
    if (!page.has_more || page.data.length === 0) break;
    startingAfter = page.data[page.data.length - 1].id;
  }
  return all;
}

async function main() {
  console.log(`Mode: ${CONFIRM ? (AT_PERIOD_END ? "CANCEL @ period end" : "CANCEL immediately") : "DRY RUN (no changes)"}`);
  const subs = await listAllSubscriptions();
  const targets = subs.filter((s) => CANCELABLE.has(s.status));

  console.log(`\nFound ${subs.length} total subscriptions; ${targets.length} are billable and will be cancelled:\n`);
  for (const s of targets) {
    const email = s.customer_email ?? s.customer ?? "?";
    console.log(`  ${s.id}  status=${s.status}  customer=${s.customer}  ${email}`);
  }

  if (!CONFIRM) {
    console.log(`\nDRY RUN — nothing changed. Re-run with --confirm to cancel these ${targets.length}.`);
    return;
  }

  let ok = 0;
  let failed = 0;
  for (const s of targets) {
    try {
      if (AT_PERIOD_END) {
        await stripe(`/subscriptions/${s.id}`, {
          method: "POST",
          body: new URLSearchParams({ cancel_at_period_end: "true" }).toString(),
        });
      } else {
        // Immediate cancel, no proration refund.
        await stripe(`/subscriptions/${s.id}`, { method: "DELETE" });
      }
      ok++;
      console.log(`  cancelled ${s.id}`);
    } catch (e) {
      failed++;
      console.error(`  FAILED ${s.id}: ${e.message}`);
    }
  }
  console.log(`\nDone. Cancelled ${ok}, failed ${failed}.`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
