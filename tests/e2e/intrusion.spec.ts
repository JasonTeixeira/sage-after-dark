/**
 * Intrusion v1 — E2E verification suite
 *
 * Covers:
 *  1. Crawlable substrate (raw HTML, no JS)
 *  2. Break-in flow (JS enabled: decoy → bypass → operator)
 *  3. Just-read door (dismiss overlay without breaking in)
 *  4. No console errors on home + essay route
 */

import { test, expect, type Page } from "@playwright/test";

const ESSAY_SLUG = "taste-is-the-last-moat";
const ESSAY_PATH = `/taste/${ESSAY_SLUG}`;

// ---------------------------------------------------------------------------
// 1. Crawlable substrate (no-JS / raw HTML via request fixture)
// ---------------------------------------------------------------------------

test.describe("crawlable substrate (no JS)", () => {
  test("homepage raw HTML contains real content and NOT the overlay text", async ({
    request,
  }) => {
    const res = await request.get("/");
    expect(res.status()).toBe(200);
    const body = await res.text();

    // The server-rendered content should contain site identity words
    expect(body).toMatch(/Sage|night|essay/i);

    // The overlay is client-only; raw HTML must NOT contain the 403 wall text
    expect(body).not.toContain("ACCESS RESTRICTED");
  });

  test("essay route returns 200 with body text", async ({ request }) => {
    const res = await request.get(ESSAY_PATH);
    expect(res.status()).toBe(200);
    const body = await res.text();
    // Should have actual prose — check for a word likely in any essay
    expect(body.length).toBeGreaterThan(500);
  });
});

// ---------------------------------------------------------------------------
// 2. Break-in flow (with JS)
// ---------------------------------------------------------------------------

test.describe("break-in flow", () => {
  /**
   * Helper: navigate to home and wait until the decoy overlay is visible.
   * We wait up to 10 s for the client-side mount (ssr:false dynamic import).
   */
  async function waitForDecoy(page: Page) {
    await page.goto("/");
    // The overlay is injected by the client; wait for the wall heading
    await expect(
      page.getByRole("heading", { name: /ACCESS RESTRICTED/i })
    ).toBeVisible({ timeout: 10_000 });
  }

  test("decoy overlay shows ACCESS RESTRICTED on load", async ({ page }) => {
    await waitForDecoy(page);
    await expect(page.getByRole("heading", { name: /ACCESS RESTRICTED/i })).toBeVisible();
  });

  test("bypass flow: hintline → input → bypass → operator appears", async ({
    page,
  }) => {
    await waitForDecoy(page);

    // The hintline may need time to become visible (6 s inactivity timer OR
    // after clicking the trap button). Hover the bypass area and wait for it.
    const hintline = page.getByRole("button", { name: /Open bypass input/i });

    // If the hintline isn't visible yet, click the leave-button once to trigger
    // the tell reveal immediately (the first trap hit sets hasTell=true).
    await expect(hintline).toBeVisible({ timeout: 10_000 }).catch(async () => {
      // Trigger tell via the trap button click
      await page.getByRole("button", { name: /Return to safety/i }).click();
    });

    // Now the hintline should be visible
    await expect(hintline).toBeVisible({ timeout: 8_000 });
    await hintline.click();

    // The bypass input appears
    const bypassInput = page.getByRole("textbox", { name: /bypass/i });
    await expect(bypassInput).toBeVisible({ timeout: 5_000 });

    // Type a trigger word and submit
    await bypassInput.fill("bypass");
    await bypassInput.press("Enter");

    // After the peel animation the Operator screen should appear.
    // The operator types lines from firstVisitLines() — wait for any of those.
    await expect(
      page.getByText(/connection established|what do they call you|before i let you wander|look who found the seam/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});

// ---------------------------------------------------------------------------
// 3. Just-read door
// ---------------------------------------------------------------------------

test.describe("just-read door", () => {
  test("clicking 'just read →' dismisses the overlay and reveals real content", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for client-side mount
    await expect(
      page.getByRole("heading", { name: /ACCESS RESTRICTED/i })
    ).toBeVisible({ timeout: 10_000 });

    // Click the just-read button (aria-label: "Skip to site — just read")
    const justRead = page.getByRole("button", { name: /just read/i });
    await expect(justRead).toBeVisible({ timeout: 5_000 });
    await justRead.click();

    // Overlay should be gone
    await expect(
      page.getByRole("heading", { name: /ACCESS RESTRICTED/i })
    ).not.toBeVisible({ timeout: 5_000 });

    // Real page content should be visible (the site's main heading / body)
    // The homepage has "I write at night." or similar editorial hero text
    // We simply assert the page has meaningful text rendered
    const mainContent = page.locator("main, h1, h2").first();
    await expect(mainContent).toBeVisible({ timeout: 5_000 });
  });
});

// ---------------------------------------------------------------------------
// 4. No console errors
// ---------------------------------------------------------------------------

test.describe("no console errors", () => {
  /**
   * Known noisy third-party / browser extension messages to ignore:
   * - Chrome extensions inject messages starting with "[Extension]"
   */
  const IGNORED_PATTERNS = [/\[Extension\]/i];

  function isIgnored(msg: string): boolean {
    return IGNORED_PATTERNS.some((p) => p.test(msg));
  }

  test("homepage has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isIgnored(msg.text())) {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    // Wait for client mount to complete
    await page.waitForTimeout(3_000);

    expect(errors).toHaveLength(0);
  });

  test("essay route has no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isIgnored(msg.text())) {
        errors.push(msg.text());
      }
    });

    await page.goto(ESSAY_PATH);
    await page.waitForTimeout(2_000);

    expect(errors).toHaveLength(0);
  });
});
