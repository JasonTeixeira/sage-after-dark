/**
 * Sage After Dark — Cipher system
 *
 * A simple, monthly-rotating Caesar cipher (with a fallback to keyword
 * lookups). Used by:
 *   - <Cipher> MDX tag (passive glitch-reveal)
 *   - <Redacted> MDX tag (hover-to-reveal)
 *   - Decoder ring overlay (<DecoderRing>) — reader solves a ciphertext
 *     to unlock bonus content
 *
 * Public API:
 *   - encryptCaesar(text, shift) / decryptCaesar(ciphertext, shift)
 *   - currentShift() — the rotating shift for the current month
 *   - LIVE_CIPHER — the canonical fragment to reveal in essays this cycle
 *   - LIVE_PLAINTEXT — what it decrypts to (for client validation)
 *   - LIVE_UNLOCK_KEY — opaque token returned to the server when solved
 */

export const LIVE_PLAINTEXT = "the answer was always postgres";
export const LIVE_UNLOCK_KEY = "decoder-2026-05-postgres";

// Cycle shifts each month so frequent readers re-engage.
// 2026-01 → 7, 2026-02 → 11, 2026-03 → 13, 2026-04 → 17, 2026-05 → 5,
// 2026-06 → 9, 2026-07 → 19, 2026-08 → 23, 2026-09 → 3, 2026-10 → 21,
// 2026-11 → 15, 2026-12 → 25.
const MONTHLY_SHIFTS: number[] = [7, 11, 13, 17, 5, 9, 19, 23, 3, 21, 15, 25];

export function currentShift(now: Date = new Date()): number {
  return MONTHLY_SHIFTS[now.getUTCMonth()] ?? 5;
}

export function encryptCaesar(text: string, shift: number): string {
  return [...text]
    .map((ch) => {
      const code = ch.charCodeAt(0);
      // A-Z
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // a-z
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
      return ch;
    })
    .join("");
}

export function decryptCaesar(ciphertext: string, shift: number): string {
  return encryptCaesar(ciphertext, (26 - (shift % 26)) % 26);
}

// Normalise a guess for comparison: lowercase, collapse whitespace.
export function normaliseGuess(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, " ");
}

// The active cipher fragment to display in essays this cycle.
// It's just LIVE_PLAINTEXT encrypted with the current shift.
// Computed lazily so SSR + client agree at request time of the month.
export function liveCiphertext(): string {
  return encryptCaesar(LIVE_PLAINTEXT, currentShift());
}
