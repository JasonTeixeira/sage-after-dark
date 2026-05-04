/**
 * /api/og — dynamic OG image generator.
 *
 * Renders a 1200×630 social card matching the Sage After Dark
 * tactical aesthetic: terminal prompt, pillar tag, title, date.
 *
 * Usage:
 *   /api/og?slug=why-we-roll-back
 *   /api/og?title=Custom%20title&pillar=mind&template=essay&date=2026-04-22
 */

import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/content/loader";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const PILLAR_COLORS: Record<string, string> = {
  build: "#00E5FF",
  signal: "#F59E0B",
  mind: "#A78BFA",
  world: "#34D399",
  taste: "#F472B6",
  learning: "#A3E635",
  teach: "#EAB308",
};

const PILLAR_LABELS: Record<string, string> = {
  build: "//build",
  signal: "//signal",
  mind: "//mind",
  world: "//world",
  taste: "//taste",
  learning: "//learning",
  teach: "//teach",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  let title = searchParams.get("title") ?? "Sage After Dark";
  let pillar = (searchParams.get("pillar") ?? "build").toLowerCase();
  let template = searchParams.get("template") ?? "essay";
  let date = searchParams.get("date") ?? "";
  let dek = searchParams.get("dek") ?? "";

  if (slug) {
    const post = await getPostBySlug(slug);
    if (post) {
      const fm = post.frontmatter;
      title = fm.title;
      pillar = fm.pillar;
      template = fm.template;
      date = fm.published.slice(0, 10);
      dek = fm.dek ?? "";
    }
  }

  const accent = PILLAR_COLORS[pillar] ?? "#00E5FF";
  const pillarLabel = PILLAR_LABELS[pillar] ?? "//build";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0A0E13",
          color: "#E8EAED",
          fontFamily: "system-ui, sans-serif",
          padding: "60px 72px",
          position: "relative",
        }}
      >
        {/* Tactical grid */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(232,234,237,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(232,234,237,0.025) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Top strip: terminal prompt + system status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, monospace",
            fontSize: 18,
            color: "#7A8290",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 12px ${accent}`,
              }}
            />
            <span style={{ color: accent }}>SAGE@AFTERDARK</span>
            <span>~/{pillar}</span>
          </div>
          <span>{date.toUpperCase()}</span>
        </div>

        {/* Pillar tag */}
        <div
          style={{
            display: "flex",
            marginTop: 90,
            zIndex: 1,
          }}
        >
          <div
            style={{
              border: `1.5px solid ${accent}`,
              color: accent,
              fontFamily: "ui-monospace, monospace",
              fontSize: 18,
              padding: "8px 16px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {pillarLabel}
          </div>
          <div
            style={{
              marginLeft: 16,
              display: "flex",
              alignItems: "center",
              fontFamily: "ui-monospace, monospace",
              fontSize: 16,
              color: "#7A8290",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {template.replace("_", " ")}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            marginTop: 32,
            fontSize: title.length > 60 ? 64 : 80,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: "#F5F7FA",
            zIndex: 1,
            maxWidth: "100%",
          }}
        >
          {title}
        </div>

        {/* Dek */}
        {dek ? (
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 28,
              lineHeight: 1.4,
              color: "#A1A8B3",
              maxWidth: "85%",
              zIndex: 1,
            }}
          >
            {dek.length > 140 ? dek.slice(0, 140) + "..." : dek}
          </div>
        ) : null}

        {/* Bottom strip */}
        <div
          style={{
            position: "absolute",
            left: 72,
            right: 72,
            bottom: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, monospace",
            fontSize: 16,
            color: "#7A8290",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            paddingTop: 24,
            borderTop: "1px solid rgba(232,234,237,0.1)",
            zIndex: 1,
          }}
        >
          <span>SAGEAFTERDARK.COM</span>
          <span style={{ color: accent }}>● LIVE</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
