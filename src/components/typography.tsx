/**
 * Typography primitives — Sage After Dark
 *
 * Three rules:
 *   1. Every text element on the site goes through one of these.
 *   2. Sizes scale fluidly via clamp() in globals.css.
 *   3. Tactical labels are mono + uppercase + tracked. Always.
 */

import { cn } from "@/lib/cn";
import type { ReactNode, HTMLAttributes } from "react";

type Props = HTMLAttributes<HTMLElement> & { children: ReactNode };

/* -----------------------------------------------------------
 * Display + Headings
 * --------------------------------------------------------- */

export function Display({ className, children, ...rest }: Props) {
  return (
    <h1
      {...rest}
      className={cn(
        "font-sans font-medium tracking-tight text-bone leading-[0.95]",
        "[font-size:var(--text-display)]",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function H1({ className, children, ...rest }: Props) {
  return (
    <h1
      {...rest}
      className={cn(
        "font-sans font-medium tracking-tight text-bone leading-[1.05]",
        "[font-size:var(--text-h1)]",
        className,
      )}
    >
      {children}
    </h1>
  );
}

export function H2({ className, children, ...rest }: Props) {
  return (
    <h2
      {...rest}
      className={cn(
        "font-sans font-medium tracking-tight text-bone leading-[1.15]",
        "[font-size:var(--text-h2)]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ className, children, ...rest }: Props) {
  return (
    <h3
      {...rest}
      className={cn(
        "font-sans font-medium tracking-tight text-bone leading-[1.25]",
        "[font-size:var(--text-h3)]",
        className,
      )}
    >
      {children}
    </h3>
  );
}

/* -----------------------------------------------------------
 * Body + Lead
 * --------------------------------------------------------- */

export function Body({ className, children, ...rest }: Props) {
  return (
    <p
      {...rest}
      className={cn(
        "font-sans text-bone/90 leading-[1.65]",
        "[font-size:var(--text-body)]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Lead({ className, children, ...rest }: Props) {
  return (
    <p
      {...rest}
      className={cn(
        "font-sans text-bone/80 leading-[1.55] max-w-[60ch]",
        "text-lg sm:text-xl",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Caption({ className, children, ...rest }: Props) {
  return (
    <span
      {...rest}
      className={cn(
        "font-sans text-mute leading-snug",
        "[font-size:var(--text-small)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -----------------------------------------------------------
 * Tactical (mono · uppercase · tracked)
 * --------------------------------------------------------- */

export function Tactical({
  className,
  children,
  as: Component = "span",
  ...rest
}: Props & { as?: "span" | "div" | "p" }) {
  return (
    <Component
      {...rest}
      className={cn(
        "font-mono uppercase tracking-[0.08em] text-mute",
        "[font-size:var(--text-tactical)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}

export function Mono({ className, children, ...rest }: Props) {
  return (
    <code
      {...rest}
      className={cn(
        "font-mono text-cyan",
        "[font-size:var(--text-tactical)]",
        className,
      )}
    >
      {children}
    </code>
  );
}

/* -----------------------------------------------------------
 * Pullquote — used inside long-form essays
 * --------------------------------------------------------- */

export function Pullquote({ className, children, ...rest }: Props) {
  return (
    <blockquote
      {...rest}
      className={cn(
        "font-sans font-medium text-bone leading-[1.25] tracking-tight",
        "border-l-2 border-cyan pl-6 my-8",
        "text-2xl sm:text-3xl",
        className,
      )}
    >
      {children}
    </blockquote>
  );
}

/* -----------------------------------------------------------
 * DropCap — first letter of long-form essays
 *
 * Usage: wrap the first paragraph and pass the first letter
 *   <DropCap letter="T">he rest of the paragraph...</DropCap>
 * --------------------------------------------------------- */

export function DropCap({
  letter,
  children,
  className,
}: {
  letter: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-sans text-bone/90 leading-[1.65] [font-size:var(--text-body)]",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "float-left mr-3 leading-[0.8] font-medium text-cyan",
          "text-[5em] sm:text-[5.5em]",
        )}
        style={{ marginTop: "0.05em" }}
      >
        {letter}
      </span>
      {children}
    </p>
  );
}

/* -----------------------------------------------------------
 * Inline link — editorial cyan underline on hover
 * --------------------------------------------------------- */

export function InlineLink({
  href,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      {...rest}
      className={cn(
        "text-bone underline decoration-rule-hi underline-offset-[3px]",
        "transition-colors hover:text-cyan hover:decoration-cyan",
        className,
      )}
    >
      {children}
    </a>
  );
}
