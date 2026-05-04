/**
 * /apple-icon — generated apple touch icon (180×180).
 * Renders the monogram on the dark ink background.
 */

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#05070A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="160" height="160" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
          <circle cx="48" cy="48" r="44" fill="none" stroke="#00E5FF" strokeWidth="1.4" opacity="0.55" />
          <circle cx="48" cy="48" r="38" fill="none" stroke="#00E5FF" strokeWidth="0.9" opacity="0.35" />
          <line x1="48" y1="2" x2="48" y2="10" stroke="#00E5FF" strokeWidth="1.4" />
          <line x1="48" y1="86" x2="48" y2="94" stroke="#00E5FF" strokeWidth="1.4" />
          <line x1="2" y1="48" x2="10" y2="48" stroke="#00E5FF" strokeWidth="1.4" />
          <line x1="86" y1="48" x2="94" y2="48" stroke="#00E5FF" strokeWidth="1.4" />
          <path d="M 64 32 Q 64 24 52 24 L 40 24 Q 28 24 28 36 Q 28 48 40 48 L 56 48 Q 68 48 68 60 Q 68 72 56 72 L 44 72 Q 32 72 32 64" fill="none" stroke="#E8E6E0" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 78 22 a 8 8 0 1 0 -6 12 a 6 6 0 0 1 6 -12 z" fill="#00E5FF" opacity="0.9" />
        </svg>
      </div>
    ),
    size,
  );
}
