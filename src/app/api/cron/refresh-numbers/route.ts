/**
 * /api/cron/refresh-numbers — nightly cache warmer for /numbers.
 *
 * Triggered by Vercel cron (vercel.json). Re-fetches Stripe metrics and
 * forces ISR to revalidate the /numbers route so the next visitor sees a
 * warm page instead of a cold-fetch wait.
 *
 * Auth: Vercel cron requests carry an `Authorization: Bearer <CRON_SECRET>`
 * header. We verify it. Public hits get 401.
 */

import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPublicMetrics } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET>. We require it in
  // production so the route isn't world-callable. In a preview/dev where the
  // env isn't set, we still allow Vercel's own internal cron header.
  const auth = req.headers.get("authorization") ?? "";
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const expected = process.env.CRON_SECRET;
  if (expected) {
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (!isVercelCron) {
    // No secret configured and not coming from Vercel cron — reject.
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let metrics: Awaited<ReturnType<typeof getPublicMetrics>> | null = null;
  let error: string | null = null;
  try {
    metrics = await getPublicMetrics();
  } catch (e) {
    error = e instanceof Error ? e.message : "unknown";
  }

  try {
    revalidatePath("/numbers");
  } catch (e) {
    console.warn("[cron/refresh-numbers] revalidatePath failed", e);
  }

  return NextResponse.json({
    ok: !error,
    error,
    asOf: metrics?.asOf,
    activeSubs: metrics?.activeSubs,
    mrrUsd: metrics?.mrrUsd,
  });
}
