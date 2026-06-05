import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, randomToken, sha256Hex, passwordStrength } from "@/lib/passwords";

describe("passwords", () => {
  it("hashes and verifies a valid password roundtrip", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).toMatch(/^\$2[aby]\$/);
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("wrong password", hash)).toBe(false);
  });
  it("rejects passwords too short or too long", async () => {
    await expect(hashPassword("short")).rejects.toThrow("password_too_short");
    await expect(hashPassword("x".repeat(201))).rejects.toThrow("password_too_long");
  });
  it("verifyPassword returns false on empty/garbage input", async () => {
    expect(await verifyPassword("", "")).toBe(false);
    expect(await verifyPassword("pw", "not-a-hash")).toBe(false);
  });
  it("randomToken returns unique hex of requested length", () => {
    const a = randomToken(32), b = randomToken(32);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
    expect(a).not.toBe(b);
  });
  it("sha256Hex matches the known vector for 'abc'", async () => {
    expect(await sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
  it("passwordStrength gates correctly", () => {
    expect(passwordStrength("short").ok).toBe(false);
    const s = passwordStrength("Abcd1234efgh");
    expect(s.ok).toBe(true);
    expect(s.score).toBeGreaterThanOrEqual(2);
  });
});
