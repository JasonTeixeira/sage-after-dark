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
  const auth = req.headers.get("authorization") ?? "";
  const expected = process.env.CRON_SECRET;
  if (expected && auth !== `Bearer ${expected}`) {
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
