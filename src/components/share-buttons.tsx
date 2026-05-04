"use client";

/**
 * ShareButtons — HN, LinkedIn, X (kept for completeness but disabled by prop),
 * copy-link, and email share.
 *
 * Renders below essays. Tactical mono row, brand-correct icons via SVG.
 * No third-party scripts.
 */

import { useState } from "react";

type Props = {
  url: string; // canonical absolute URL of the post
  title: string;
  dek?: string;
  showHN?: boolean;
  showLinkedIn?: boolean;
  showCopy?: boolean;
  showEmail?: boolean;
};

export function ShareButtons({
  url,
  title,
  dek,
  showHN = true,
  showLinkedIn = true,
  showCopy = true,
  showEmail = true,
}: Props) {
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;

  const hnUrl = `https://news.ycombinator.com/submitlink?u=${enc(url)}&t=${enc(title)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`;
  const emailUrl = `mailto:?subject=${enc(title)}&body=${enc(`${dek ? dek + "\n\n" : ""}${url}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <section
      className="mt-16 max-w-3xl mx-auto"
      aria-label="Share this essay"
      data-print-hide
    >
      <div className="border-t border-rule pt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute mb-4">
          // share this transmission
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {showHN && (
            <ShareLink
              href={hnUrl}
              label="Hacker News"
              icon={<HNIcon />}
            />
          )}
          {showLinkedIn && (
            <ShareLink
              href={linkedInUrl}
              label="LinkedIn"
              icon={<LinkedInIcon />}
            />
          )}
          {showEmail && (
            <ShareLink href={emailUrl} label="Email" icon={<MailIcon />} />
          )}
          {showCopy && (
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-2 px-3 py-2 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors text-[12px] font-mono uppercase tracking-[0.08em]"
            >
              <LinkIcon />
              {copied ? "Copied" : "Copy link"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ShareLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-3 py-2 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors text-[12px] font-mono uppercase tracking-[0.08em]"
    >
      {icon}
      {label}
    </a>
  );
}

function HNIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M0 0v24h24V0H0zm12 13.4L7.4 4h2.5l2.5 5.5c.3.6.5 1.1.6 1.6.1-.5.4-1 .6-1.6L15.5 4H18l-4.5 9.4V20h-1.5v-6.6z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM8 19H5V8h3v11zM6.5 6.7c-1 0-1.7-.8-1.7-1.7S5.5 3.3 6.5 3.3s1.7.8 1.7 1.7-.7 1.7-1.7 1.7zM20 19h-3v-5.6c0-3.4-4-3.1-4 0V19h-3V8h3v1.8c1.4-2.6 7-2.8 7 2.5V19z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  );
}
