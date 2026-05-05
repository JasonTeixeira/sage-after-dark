/**
 * studio-state — single source of truth for "what's being written now."
 *
 * Update this file as part of the publishing ritual. The StudioWidget on
 * essay pages reads `WRITING_NOW` and surfaces it as a tiny live signal.
 *
 * Why a hand-curated constant instead of a CMS? Because the act of editing
 * this file is itself the ritual. If the field is wrong, the studio is
 * sleeping. That's honest.
 */

export const WRITING_NOW = {
  kind: "DRAFTING" as "DRAFTING" | "EDITING" | "SCHEDULED" | "RESTING",
  text: "Trayd, Episode 04 — the week the calls came in.",
  /** Optional: link target for "writing about" — usually an arc slug. */
  arc_slug: "trayd-in-public" as string | null,
};
