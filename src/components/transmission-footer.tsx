/**
 * TransmissionFooter — Cipher Layer 5.
 *
 * A signed footer at the end of every essay containing:
 *   - SHA256 hash of the post body (proves the version you're reading)
 *   - publish/update timestamps in UTC
 *   - a tiny seal/glyph
 *
 * The hash is computed at build time from the MDX source. If the content
 * changes, the hash changes — and a sharp reader can compare against an
 * archived version. It's both an easter egg and a small honesty mechanism.
 *
 * Server component. Inputs come from the post object on the route.
 */

import { createHash } from "node:crypto";

type Props = {
  source: string;
  published: string;
  updated?: string;
  pillar: string;
  slug: string;
};

export function TransmissionFooter({ source, published, updated, pillar, slug }: Props) {
  const hash = createHash("sha256").update(source).digest("hex");
  const short = `${hash.slice(0, 8)} · ${hash.slice(8, 16)}`;
  const channel = pillarChannel(pillar);

  return (
    <footer className="not-prose mt-16 mb-8 border-t border-rule pt-6 font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-cyan/80">▸ TRANSMISSION SIGNED</span>
        <span aria-hidden className="text-cyan/40 text-[14px] leading-none">
          ✦
        </span>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px]">
        <dt className="text-mute">channel</dt>
        <dd className="text-bone/80 font-mono">{channel}</dd>

        <dt className="text-mute">slug</dt>
        <dd className="text-bone/80 font-mono">/{pillar}/{slug}</dd>

        <dt className="text-mute">published</dt>
        <dd className="text-bone/80 font-mono">{formatUtc(published)}</dd>

        {updated && updated !== published && (
          <>
            <dt className="text-mute">updated</dt>
            <dd className="text-bone/80 font-mono">{formatUtc(updated)}</dd>
          </>
        )}

        <dt className="text-mute">sha256</dt>
        <dd
          className="text-cyan/80 font-mono break-all"
          title={hash}
        >
          {short}
        </dd>
      </dl>

      <div className="mt-3 text-[9px] text-mute/80">
        Hash computed at build time from the post body. If it changes, the essay
        has been edited. Verify with <span className="text-cyan/70">openssl sha256</span>.
      </div>
    </footer>
  );
}

function pillarChannel(p: string): string {
  const map: Record<string, string> = {
    build: "0xB1",
    signal: "0x59",
    mind: "0x71",
    taste: "0x7A",
    world: "0xCD",
    learning: "0x14",
    paying: "0xFA",
  };
  return `${map[p] ?? "0x00"} · ${p.toUpperCase()}`;
}

function formatUtc(iso: string): string {
  try {
    const d = new Date(iso);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const hh = String(d.getUTCHours()).padStart(2, "0");
    const mi = String(d.getUTCMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi} UTC`;
  } catch {
    return iso;
  }
}
