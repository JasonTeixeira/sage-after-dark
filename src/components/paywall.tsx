/**
 * Paywall — soft gate shown in place of MDX body when a post is members_only
 * and the viewer isn't an active member.
 *
 * Renders teaser text (the dek, plus a fade), then a NotchedCard CTA.
 */

import { NotchedCard } from "./notched-card";

export function Paywall({
  pillar,
  signedIn,
}: {
  pillar?: string;
  signedIn: boolean;
}) {
  return (
    <div className="relative my-12">
      {/* Soft fade above the gate */}
      <div className="pointer-events-none absolute -top-32 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-ink" />

      <NotchedCard notch="tl" pillarKey="teach" className="relative">
        <div className="p-8 sm:p-10 max-w-[64ch] mx-auto text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-teach mb-4">
            ▸ members only · things i teach
          </p>
          <h2 className="font-sans text-bone text-[28px] sm:text-[32px] leading-tight mb-4">
            The rest of this is for members.
          </h2>
          <p className="text-bone/80 leading-relaxed mb-8">
            Members get the full tutorial — transcript, runnable starter repo,
            and the long version of every dispatch. $5 a month. $50 a year.
            Cancel any time.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/membership"
              className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 bg-teach text-ink border border-teach hover:bg-transparent hover:text-teach transition-colors rounded"
            >
              ▸ become a member
            </a>
            {!signedIn ? (
              <a
                href="/account/login"
                className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded"
              >
                ▸ already a member · sign in
              </a>
            ) : (
              <a
                href="/account"
                className="font-mono text-[12px] uppercase tracking-[0.08em] px-5 py-3 border border-rule text-bone hover:border-cyan hover:text-cyan transition-colors rounded"
              >
                ▸ open dashboard
              </a>
            )}
          </div>
          {pillar && (
            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
              // pillar · {pillar}
            </p>
          )}
        </div>
      </NotchedCard>
    </div>
  );
}
