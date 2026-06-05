import { rankOf } from "./progress";
import type { Profile } from "./progress";

/**
 * The Operator — pure, memory-parameterized voice lines.
 * All functions return string arrays. Lines may contain inline <b>…</b> markup.
 */

/** Cold first-contact greeting. Ends by asking for a handle. */
export function firstVisitLines(): string[] {
  return [
    "▓ connection established.",
    "well. look who found the seam.",
    "most people read the 403 and leave. you pushed on it. i like that.",
    "before i let you wander — what do they call you?",
  ];
}

/**
 * Lines after the visitor submits their handle.
 * Acknowledges the handle and orients them inside.
 */
export function enteredLines(handle: string): string[] {
  return [
    `noted, ${handle}. the system will remember you now — it remembers everyone who gets in.`,
    "you're on the inside. type <b>help</b>. don't touch anything that hums.",
    "— ▓ the operator",
  ];
}

/**
 * Return-visit greeting. References handle, intrusion count, and rank.
 * When hour is 0–4 (late-night), the first line is a distinct late-night variant.
 */
export function returnLines(profile: Profile, hour: number): string[] {
  const { handle, intrusions } = profile;
  const rank = rankOf(intrusions);
  const lateNight = hour >= 0 && hour <= 4;

  const opener = lateNight
    ? `▓ back at ${hour === 0 ? "midnight" : `${hour}am`} again, ${handle}. the building is asleep. you aren't.`
    : `▓ ${handle}. back again — that's intrusion #${intrusions}.`;

  const middle = lateNight
    ? "the door was locked. you found the gap anyway. of course you did."
    : "the front door changed since you last came. you still found the way in. of course you did.";

  const rankLine =
    `rank: <b>${rank}</b>. ${intrusions >= 7 ? "you practically live here now." : "keep coming."}`;

  return [
    opener,
    middle,
    rankLine,
    "go on. type <b>help</b>.",
    "— ▓ the operator",
  ];
}
