/**
 * Sage After Dark — Design Tokens
 *
 * The single source of truth for color, motion, and spacing.
 * Tailwind v4 reads these via @theme in globals.css.
 * TypeScript reads these for canvas/JS-driven components.
 */

export const ink = {
  0: "#05070A", // page background
  1: "#0A0E14", // surfaces
  2: "#11161E", // elevated
} as const;

export const rule = {
  base: "#1C232E",
  hi: "#2A3340",
} as const;

export const text = {
  bone: "#E8E6E0", // primary
  mute: "#8A8F98", // secondary
  faint: "#4F5563", // tertiary
} as const;

export const accent = {
  cyan: "#00E5FF", // global accent · CTAs · cursor
  ember: "#F59E0B", // live · in-progress only
} as const;

/**
 * Pillar colors — used ONLY as 1px borders, tag chips, and the
 * reading-progress bar on each post. Cyan stays the global accent.
 */
export const pillar = {
  build: "#00E5FF", // tactical/engineering — same as cyan
  signal: "#F59E0B", // status/dispatches
  mind: "#A78BFA", // essays/thinking
  world: "#34D399", // industry/observations
  taste: "#F472B6", // art/music/film
  learning: "#A3E635", // what i'm learning
  teach: "#EAB308", // tutorials & how-tos
} as const;

export type PillarKey = keyof typeof pillar;

export const motion = {
  // durations (ms)
  fast: 120,
  base: 200,
  slow: 400,
  // easing
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
} as const;

export const space = {
  // editorial column max-width (in ch — 66ch is the reading target)
  measure: "66ch",
  // page horizontal padding
  gutter: "clamp(1rem, 4vw, 3rem)",
} as const;
