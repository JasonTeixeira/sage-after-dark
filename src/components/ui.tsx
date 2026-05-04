/**
 * UI atoms — buttons, kbd hints, status dots, separators.
 */

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

/* -----------------------------------------------------------
 * Button — three variants. Always tactical.
 * --------------------------------------------------------- */

type ButtonVariant = "primary" | "ghost" | "outline";

function btnClasses(variant: ButtonVariant) {
  const base =
    "inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] " +
    "uppercase tracking-[0.08em] transition-colors duration-[var(--dur-fast)] " +
    "focus-visible:outline-2 focus-visible:outline-cyan focus-visible:outline-offset-2";
  switch (variant) {
    case "primary":
      // Use arbitrary value to guarantee the dark text wins over the
      // global `a { color: inherit }` rule and any utility ordering.
      return `${base} bg-cyan !text-[#05070A] hover:bg-cyan/90`;
    case "outline":
      return `${base} border border-rule-hi text-bone hover:border-cyan hover:text-cyan`;
    case "ghost":
    default:
      return `${base} text-mute hover:text-cyan`;
  }
}

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button {...rest} className={cn(btnClasses(variant), className)}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: ButtonVariant }) {
  return (
    <a {...rest} className={cn(btnClasses(variant), className)}>
      {children}
    </a>
  );
}

/* -----------------------------------------------------------
 * Kbd — keyboard shortcut hint
 * --------------------------------------------------------- */

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1",
        "font-mono text-[10px] uppercase",
        "border border-rule-hi bg-ink-2 text-mute",
        "rounded-sm",
      )}
    >
      {children}
    </kbd>
  );
}

/* -----------------------------------------------------------
 * StatusDot — live · idle · offline · wip
 * --------------------------------------------------------- */

export function StatusDot({
  status = "live",
  label,
  className,
}: {
  status?: "live" | "idle" | "offline" | "wip";
  label?: string;
  className?: string;
}) {
  const color =
    status === "live"
      ? "bg-cyan"
      : status === "wip"
        ? "bg-ember"
        : status === "offline"
          ? "bg-faint"
          : "bg-mute";
  const animate = status === "live" || status === "wip" ? "animate-pulse" : "";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("inline-block h-1.5 w-1.5 rounded-full", color, animate)} />
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
          {label}
        </span>
      )}
    </span>
  );
}

/* -----------------------------------------------------------
 * Hr — hairline rule
 * --------------------------------------------------------- */

export function Hr({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-rule", className)} />;
}
