import { describe, it, expect } from "vitest";
import { encryptCaesar, decryptCaesar, currentShift, normaliseGuess, liveCiphertext, MONTHLY_SHIFTS, LIVE_PLAINTEXT } from "@/lib/cipher";

describe("cipher", () => {
  it("encrypt/decrypt roundtrips for any shift", () => {
    for (const s of [0, 1, 5, 13, 25, 26]) expect(decryptCaesar(encryptCaesar(LIVE_PLAINTEXT, s), s)).toBe(LIVE_PLAINTEXT);
  });
  it("shifts letters, preserves non-letters", () => {
    expect(encryptCaesar("abc XYZ!", 1)).toBe("bcd YZA!");
  });
  it("currentShift uses the month's configured shift (UTC)", () => {
    expect(currentShift(new Date("2026-01-15T00:00:00Z"))).toBe(MONTHLY_SHIFTS[0]);
    expect(currentShift(new Date("2026-12-15T00:00:00Z"))).toBe(MONTHLY_SHIFTS[11]);
  });
  it("normaliseGuess lowercases, trims, collapses whitespace", () => {
    expect(normaliseGuess("  The   ANSWER  ")).toBe("the answer");
  });
  it("liveCiphertext decrypts back to plaintext at current shift", () => {
    expect(decryptCaesar(liveCiphertext(), currentShift())).toBe(LIVE_PLAINTEXT);
  });
});
