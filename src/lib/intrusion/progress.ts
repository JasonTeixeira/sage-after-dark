export type Profile = { handle: string; intrusions: number; fragments: string[]; lastSeen: number };
export type Rank = "script kiddie" | "operator" | "ghost";

export const rankOf = (n: number): Rank => (n >= 7 ? "ghost" : n >= 3 ? "operator" : "script kiddie");

export function nextProfile(p: Profile, now: number): Profile {
  return { ...p, intrusions: p.intrusions + 1, lastSeen: now };
}

const KEY = "sad:intrusion";
const EMPTY: Profile = { handle: "", intrusions: 0, fragments: [], lastSeen: 0 };

export function loadProfile(): Profile {
  if (typeof localStorage === "undefined") return EMPTY;
  try { return { ...EMPTY, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { return EMPTY; }
}
export function saveProfile(p: Profile): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(KEY, JSON.stringify(p));
}
export function forgetProfile(): void {
  if (typeof localStorage !== "undefined") localStorage.removeItem(KEY);
}
