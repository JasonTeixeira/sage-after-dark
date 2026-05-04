/**
 * Monogram — original SVG identity mark for Sage After Dark.
 *
 * Composition: stylized "S" inside a tactical reticle. Mono linework, cyan
 * accent stroke. Renders at any size. Used:
 *  - In the About page hero
 *  - As OG fallback identity
 *  - As favicon (rasterized via next-favicon convention)
 */

type Props = {
  size?: number;
  className?: string;
  glow?: boolean;
  ariaLabel?: string;
};

export function Monogram({ size = 96, className, glow = false, ariaLabel = "Sage After Dark monogram" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={ariaLabel}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {glow && (
        <defs>
          <filter id="mg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      <g filter={glow ? "url(#mg-glow)" : undefined}>
        {/* outer reticle */}
        <circle cx="48" cy="48" r="44" fill="none" stroke="#00E5FF" strokeWidth="1.2" opacity="0.55" />
        <circle cx="48" cy="48" r="38" fill="none" stroke="#00E5FF" strokeWidth="0.8" opacity="0.35" />

        {/* tick marks N/E/S/W */}
        <line x1="48" y1="2" x2="48" y2="10" stroke="#00E5FF" strokeWidth="1.2" />
        <line x1="48" y1="86" x2="48" y2="94" stroke="#00E5FF" strokeWidth="1.2" />
        <line x1="2" y1="48" x2="10" y2="48" stroke="#00E5FF" strokeWidth="1.2" />
        <line x1="86" y1="48" x2="94" y2="48" stroke="#00E5FF" strokeWidth="1.2" />

        {/* crosshair faint */}
        <line x1="48" y1="14" x2="48" y2="82" stroke="#1C232E" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="14" y1="48" x2="82" y2="48" stroke="#1C232E" strokeWidth="0.5" strokeDasharray="2 3" />

        {/* The S — drawn from two arcs */}
        <path
          d="M 64 32 Q 64 24 52 24 L 40 24 Q 28 24 28 36 Q 28 48 40 48 L 56 48 Q 68 48 68 60 Q 68 72 56 72 L 44 72 Q 32 72 32 64"
          fill="none"
          stroke="#E8E6E0"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Crescent moon (after dark) */}
        <path
          d="M 78 22 a 8 8 0 1 0 -6 12 a 6 6 0 0 1 6 -12 z"
          fill="#00E5FF"
          opacity="0.85"
        />
      </g>
    </svg>
  );
}
