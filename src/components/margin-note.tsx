/**
 * MarginNote — pull-quotes and footnotes pulled into the right margin
 * on desktop. On mobile, falls back to inline italic block.
 *
 * Used within EditorialColumn. The parent column manages the actual
 * width budget; this component handles the float-right behavior on
 * lg+ breakpoints.
 */

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function MarginNote({
  children,
  number,
  className,
}: {
  children: ReactNode;
  /** If provided, renders as a numbered footnote anchor. */
  number?: number;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "my-4 border-l border-cyan/40 pl-4",
        "lg:float-right lg:clear-right lg:-mr-[14rem] lg:ml-6 lg:w-[12rem]",
        "lg:border-l lg:my-2",
        "font-sans text-[13px] leading-snug text-mute italic",
        className,
      )}
    >
      {number !== undefined && (
        <span className="not-italic font-mono text-cyan mr-1.5 text-[11px]">
          [{number.toString().padStart(2, "0")}]
        </span>
      )}
      {children}
    </aside>
  );
}
