/**
 * Sage After Dark — Component System
 *
 * Single import surface for the entire design system.
 * All visual primitives ship from here.
 */

// Typography
export {
  Display,
  H1,
  H2,
  H3,
  Body,
  Lead,
  Caption,
  Tactical,
  Mono,
  Pullquote,
  DropCap,
  InlineLink,
} from "./typography";

// Tactical primitives
export { Reticle } from "./reticle";
export { NotchedCard } from "./notched-card";
export { Paywall } from "./paywall";
export { TacticalStrip, StripSep } from "./tactical-strip";
export { TerminalPrompt } from "./terminal-prompt";
export { MarginNote } from "./margin-note";

// Pillar system
export { PillarTag, PillarBorder } from "./pillar";

// UI atoms
export { Button, ButtonLink, Kbd, StatusDot, Hr } from "./ui";

// Layout
export { Page, Container, EditorialColumn, Section } from "./layout";

// Site chrome
export { SiteHeader } from "./site-header";
export { SiteFooter } from "./site-footer";

// Post listings
export { PostCard } from "./post-card";
export { NewsletterForm } from "./newsletter-form";
export { Comments } from "./comments";
export { KeyboardShortcuts } from "./keyboard-shortcuts";

// Motion
export { ReadingProgress } from "./reading-progress";
export { HeroReticle } from "./hero-reticle";
export { Reveal } from "./reveal";
export { Konami } from "./konami";
