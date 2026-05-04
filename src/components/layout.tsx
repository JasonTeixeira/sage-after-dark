/**
 * Layout primitives — page chrome and content widths.
 *
 *   <Page>           → full-screen wrapper, optional grid background
 *   <Container>      → max-w-6xl horizontal frame for everything
 *   <EditorialColumn>→ 66ch reading column for long-form
 *   <Section>        → bordered section with tactical label
 */

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Page({
  children,
  grid = true,
  className,
}: {
  children: ReactNode;
  grid?: boolean;
  className?: string;
}) {
  return (
    <main className={cn(grid && "tactical-grid", "min-h-screen", className)}>
      {children}
    </main>
  );
}

export function Container({
  children,
  className,
  size = "default",
}: {
  children: ReactNode;
  className?: string;
  /** default: max-w-6xl · narrow: max-w-3xl · wide: max-w-7xl */
  size?: "default" | "narrow" | "wide";
}) {
  const max =
    size === "narrow" ? "max-w-3xl" : size === "wide" ? "max-w-7xl" : "max-w-6xl";
  return (
    <div className={cn("mx-auto px-6", max, className)}>{children}</div>
  );
}

/**
 * EditorialColumn — the 66ch reading container for long-form essays.
 * Lives inside a wider Container so MarginNotes have room to float.
 */
export function EditorialColumn({
  children,
  className,
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto", className)}
      style={{ maxWidth: "66ch" }}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Section — a horizontal-rule separated section with a tactical label.
 */
export function Section({
  label,
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-rule pt-10 pb-16", className)}>
      {label && (
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-cyan mb-6">
          {label}
        </div>
      )}
      {children}
    </section>
  );
}
