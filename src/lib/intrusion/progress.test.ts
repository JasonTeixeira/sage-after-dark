import { describe, it, expect } from "vitest";
import { rankOf, nextProfile, type Profile } from "@/lib/intrusion/progress";

describe("intrusion progress", () => {
  it("ranks by intrusion count", () => {
    expect(rankOf(0)).toBe("script kiddie");
    expect(rankOf(3)).toBe("operator");
    expect(rankOf(7)).toBe("ghost");
  });
  it("nextProfile increments intrusions and preserves handle (immutably)", () => {
    const p: Profile = { handle: "neo", intrusions: 2, fragments: [], lastSeen: 0 };
    const n = nextProfile(p, 1000);
    expect(n.intrusions).toBe(3);
    expect(n.handle).toBe("neo");
    expect(n.lastSeen).toBe(1000);
    expect(p.intrusions).toBe(2);
  });
});
