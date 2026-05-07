/**
 * MDX → React component mappings.
 *
 * When a post writes plain markdown, MDX uses these to render it.
 * Custom components (Pullquote, MarginNote, etc.) are also exposed
 * so authors can use them inline.
 */

import type { MDXComponents } from "mdx/types";
import NextImage from "next/image";
import { cn } from "@/lib/cn";
import {
  Body,
  H1 as DH1,
  H2 as DH2,
  H3 as DH3,
  Pullquote,
  InlineLink,
  MarginNote,
  Tactical,
  DropCap,
  Sidenote,
  PullQuote,
  FieldCard,
  Diagnostic,
} from "@/components";
import {
  DiagramTasteGate,
  DiagramLearningLoop,
  DiagramHalfLife,
  DiagramSystem,
} from "@/components/diagrams";
import {
  DiagramNoiseVsSignal,
  DiagramFivePillars,
} from "@/components/diagrams-strategy";
import {
  DiagramSkillHalfLife,
  DiagramSecondBrain,
  DiagramLatencyArchitecture,
  DiagramHalfLifeTeaser,
  DiagramTasteMoat,
  DiagramAvailabilityCost,
  DiagramToolHalfLife,
} from "@/components/curriculum-diagrams";
import { Cipher, Redacted } from "@/components/cipher";
import { BonusFootnote } from "@/components/decoder-ring";

export const mdxComponents: MDXComponents = {
  /* ---------- headings ---------- */
  h1: ({ children, ...rest }) => (
    <DH1 className="mt-12 mb-4 scroll-mt-24" {...rest}>
      {children}
    </DH1>
  ),
  h2: ({ children, ...rest }) => (
    <DH2 className="mt-12 mb-4 scroll-mt-24" {...rest}>
      {children}
    </DH2>
  ),
  h3: ({ children, ...rest }) => (
    <DH3 className="mt-8 mb-3 scroll-mt-24" {...rest}>
      {children}
    </DH3>
  ),

  /* ---------- text ---------- */
  p: ({ children, ...rest }) => (
    <Body className="my-5" {...rest}>
      {children}
    </Body>
  ),

  blockquote: ({ children }) => <Pullquote>{children}</Pullquote>,

  a: ({ href, children, ...rest }) => (
    <InlineLink href={href ?? "#"} {...rest}>
      {children}
    </InlineLink>
  ),

  /* ---------- lists ---------- */
  ul: ({ children, ...rest }) => (
    <ul
      className="my-4 ml-6 list-disc text-bone/90 marker:text-cyan space-y-1.5"
      {...rest}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...rest }) => (
    <ol
      className="my-4 ml-6 list-decimal text-bone/90 marker:text-cyan marker:font-mono space-y-1.5"
      {...rest}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...rest }) => (
    <li className="leading-relaxed" {...rest}>
      {children}
    </li>
  ),

  /* ---------- code ---------- */
  code: ({ className, children, ...rest }) => {
    // Inline code (no language class) gets cyan accent
    if (!className) {
      return (
        <code
          className="font-mono text-[0.92em] text-cyan bg-ink-2 px-1.5 py-0.5 rounded-sm"
          {...rest}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
  },

  pre: ({ children, ...rest }) => (
    <pre
      className={cn(
        "my-6 overflow-x-auto rounded-sm",
        "bg-ink-1 border border-rule",
        "p-5 text-[13px] leading-relaxed",
      )}
      {...rest}
    >
      {children}
    </pre>
  ),

  /* ---------- separators ---------- */
  hr: () => (
    <div className="my-12 flex items-center justify-center gap-4">
      <span className="h-px flex-1 bg-rule" />
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-faint">
        §
      </span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  ),

  /* ---------- tables ---------- */
  table: ({ children, ...rest }) => (
    <div className="my-6 overflow-x-auto border border-rule">
      <table className="w-full border-collapse text-left" {...rest}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...rest }) => (
    <th
      className="border-b border-rule bg-ink-1 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-cyan"
      {...rest}
    >
      {children}
    </th>
  ),
  td: ({ children, ...rest }) => (
    <td
      className="border-b border-rule/60 px-4 py-2 text-[15px] text-bone/90"
      {...rest}
    >
      {children}
    </td>
  ),

  /* ---------- images ---------- */
  img: ({ alt, src, width, height, ...rest }) => {
    const safeAlt = alt ?? "";
    const url = typeof src === "string" ? src : "";
    // External or unresolved → fall back to native <img> to avoid next/image
    // domain config issues. Internal /public assets use next/image with auto blur.
    const isLocal = url.startsWith("/") && !url.startsWith("//");
    const w = typeof width === "number" ? width : Number(width) || 1600;
    const h = typeof height === "number" ? height : Number(height) || 900;

    return (
      <figure className="my-8">
        {isLocal ? (
          <NextImage
            src={url}
            alt={safeAlt}
            width={w}
            height={h}
            sizes="(min-width: 1024px) 720px, 100vw"
            placeholder="empty"
            className="w-full h-auto border border-rule"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={safeAlt}
            className="w-full border border-rule"
            loading="lazy"
            decoding="async"
            {...rest}
          />
        )}
        {safeAlt && (
          <figcaption className="mt-2 text-center">
            <Tactical>{safeAlt}</Tactical>
          </figcaption>
        )}
      </figure>
    );
  },

  /* ---------- expose custom components for inline use ---------- */
  Pullquote,
  PullQuote, // editorial magazine variant with attribution
  MarginNote,
  Sidenote, // Tufte-style margin note with mobile fallback
  Tactical,
  InlineLink,
  DropCap,
  // Anchor essay diagrams
  DiagramTasteGate,
  DiagramLearningLoop,
  DiagramHalfLife,
  DiagramSystem,
  DiagramNoiseVsSignal,
  DiagramFivePillars,
  // Late-Night Curriculum diagrams
  DiagramSkillHalfLife,
  DiagramSecondBrain,
  DiagramLatencyArchitecture,
  DiagramHalfLifeTeaser,
  DiagramTasteMoat,
  DiagramAvailabilityCost,
  DiagramToolHalfLife,
  // New essay primitives
  FieldCard,
  Diagnostic,
  // Cipher layer (inline + bonus)
  Cipher,
  Redacted,
  BonusFootnote,
};
