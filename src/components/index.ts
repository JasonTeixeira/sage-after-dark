/**
 * Sage After Dark — Component System
 *
 * Single import surface for the entire design system.
 * All visual primitives ship from here.
 */

// Typography
export {
  Display,
  EditorialDisplay,
  EditorialHeading,
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
// SiteHeader is intentionally not re-exported here — it depends on next/headers
// (server-only). Import it directly from "./site-header" in server components.
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
export { TerminalPalette } from "./terminal-palette";
export { CommandPalette } from "./command-palette";
export { NotFoundSuggester } from "./not-found-suggester";
export { StudioWidget } from "./studio-widget";
export { TransmissionFooter } from "./transmission-footer";
export { FootnotePopover } from "./footnote-popover";
export { TocScrubber } from "./toc-scrubber";
export { AnchorCopy } from "./anchor-copy";
export { RelatedRail } from "./related-rail";
export { JsonLd, PERSON_LD, WEBSITE_LD, articleLd, breadcrumbsLd } from "./json-ld";

// Newsletter funnel
export { HeroSubscribe } from "./hero-subscribe";
export { EssayStickyBar } from "./essay-sticky-bar";

// Magazine essay primitives (Phase 13)
export { FloatingTOC } from "./floating-toc";
export { Sidenote } from "./sidenote";
export { PullQuote } from "./pullquote-editorial";
export { HighlightToShare } from "./highlight-to-share";
export { EssaySignoff } from "./essay-signoff";
export { ReadingModeToggle } from "./reading-mode-toggle";
export { RouterTransitions } from "./router-transitions";
export { ShareButtons } from "./share-buttons";
export { Monogram } from "./monogram";
export { AnalyticsTracker } from "./analytics-tracker";
export { RollbackBuilder } from "./rollback-builder";
export { AskForm } from "./ask-form";

// Diagrams (animations + strategy set)
export { AnimatedDiagram } from "./diagram-animated";
export {
  DiagramTasteGate,
  DiagramLearningLoop,
  DiagramHalfLife,
  DiagramSystem,
} from "./diagrams";
export {
  DiagramNoiseVsSignal,
  DiagramFivePillars,
  DiagramArcTimeline,
} from "./diagrams-strategy";

// Cipher layer
export { Cipher, Redacted } from "./cipher";
export { DecoderRing, BonusFootnote, useDecoderUnlocked } from "./decoder-ring";

// Recommender
export { ReadThisIf } from "./read-this-if";
