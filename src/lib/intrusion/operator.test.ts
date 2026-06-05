import { describe, it, expect } from "vitest";
import { firstVisitLines, enteredLines, returnLines } from "@/lib/intrusion/operator";
import type { Profile } from "@/lib/intrusion/progress";

describe("operator voice", () => {
  it("first visit greets and asks for a handle", () => {
    const lines = firstVisitLines();
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.join(" ").toLowerCase()).toMatch(/call you|handle|name/);
  });
  it("entered lines acknowledge the chosen handle", () => {
    expect(enteredLines("neo").join(" ")).toMatch(/neo/);
  });
  it("return lines include handle, intrusion count and rank", () => {
    const p: Profile = { handle: "neo", intrusions: 4, fragments: [], lastSeen: 0 };
    const joined = returnLines(p, 14).join(" ");
    expect(joined).toMatch(/neo/);
    expect(joined).toMatch(/4/);
    expect(joined.toLowerCase()).toMatch(/operator/); // rankOf(4)
  });
  it("late-night hour yields a different opener than daytime", () => {
    const p: Profile = { handle: "neo", intrusions: 4, fragments: [], lastSeen: 0 };
    expect(returnLines(p, 3)[0]).not.toBe(returnLines(p, 14)[0]);
  });
});
