import { describe, it, expect } from "vitest";
import { scenarioForMonth, SCENARIOS } from "@/lib/intrusion/scenarios";
describe("scenarios", () => {
  it("has at least one scenario", () => { expect(SCENARIOS.length).toBeGreaterThan(0); });
  it("is deterministic per month", () => { expect(scenarioForMonth(5).id).toBe(scenarioForMonth(5).id); });
  it("wraps month index within the deck", () => { expect(scenarioForMonth(13).id).toBe(scenarioForMonth(13 % SCENARIOS.length).id); });
});
