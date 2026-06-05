import { describe, it, expect, beforeAll, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: async () => ({ get: () => undefined, set: () => {}, delete: () => {} }),
}));

beforeAll(() => { process.env.SESSION_SECRET = "test-session-secret-please-change"; });

const { signSessionToken, verifySessionToken } = await import("@/lib/auth");

describe("session tokens", () => {
  it("signs and verifies a token roundtrip (case-normalized email)", async () => {
    const token = await signSessionToken("Member@Example.com");
    expect(token).toContain(".");
    expect(await verifySessionToken(token)).toBe("member@example.com");
  });
  it("rejects a tampered signature", async () => {
    const token = await signSessionToken("a@b.com");
    expect(await verifySessionToken(`${token.split(".")[0]}.deadbeef`)).toBeNull();
  });
  it("rejects a tampered payload", async () => {
    const token = await signSessionToken("a@b.com");
    const sig = token.split(".")[1];
    const evil = Buffer.from(JSON.stringify({ email: "admin@b.com", exp: 9999999999 })).toString("base64url");
    expect(await verifySessionToken(`${evil}.${sig}`)).toBeNull();
  });
  it("rejects malformed tokens", async () => {
    expect(await verifySessionToken("nodot")).toBeNull();
    expect(await verifySessionToken("")).toBeNull();
  });
  it("rejects an expired token", async () => {
    const { createHmac } = await import("node:crypto");
    const payload = Buffer.from(JSON.stringify({ email: "a@b.com", exp: 1 })).toString("base64url");
    const sig = createHmac("sha256", process.env.SESSION_SECRET!).update(payload).digest("base64url");
    expect(await verifySessionToken(`${payload}.${sig}`)).toBeNull();
  });
  it("throws when SESSION_SECRET is missing/short", async () => {
    const prev = process.env.SESSION_SECRET;
    process.env.SESSION_SECRET = "tooshort";
    await expect(signSessionToken("a@b.com")).rejects.toThrow("session_secret_missing");
    process.env.SESSION_SECRET = prev;
  });
});
