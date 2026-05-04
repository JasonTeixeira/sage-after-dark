/**
 * /api/og — dynamic OG image generator (editorial brand).
 *
 * Renders 1200×630 social cards in the Sage After Dark voice:
 *   - Instrument Serif italic title (the brand mark)
 *   - Tactical chrome (terminal prompt, pillar tag, year label)
 *   - Pillar accent color + glow
 *   - Mini oscilloscope signal panel for visual continuity with the home
 *
 * Usage:
 *   /api/og?slug=why-we-roll-back
 *   /api/og?title=Custom%20title&pillar=mind&template=essay&date=2026-04-22
 *
 * Three "modes" determined by template:
 *   - essay        → big serif italic
 *   - tutorial     → mono prefix + serif title + "TUTORIAL · DIFFICULTY"
 *   - field_note   → smaller title + date dominant
 */

import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/content/loader";

export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const PILLAR_COLORS: Record<string, string> = {
  build: "#22D3EE",
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

const TEMPLATE_LABEL: Record<string, string> = {
  essay: "ESSAY",
  tutorial: "TUTORIAL",
  field_note: "FIELD NOTE",
  annual: "ANNUAL",
  dispatch: "DISPATCH",
};

// Fetch Instrument Serif (italic) at request time. next/og needs ArrayBuffer.
async function loadFonts(origin: string) {
  const [serifItalic, serifRegular, mono] = await Promise.all([
    fetch(
      `${origin}/_fonts/InstrumentSerif-Italic.ttf`,
    ).then((r) => (r.ok ? r.arrayBuffer() : null)),
    fetch(
      `${origin}/_fonts/InstrumentSerif-Regular.ttf`,
    ).then((r) => (r.ok ? r.arrayBuffer() : null)),
    fetch(
      `${origin}/_fonts/JetBrainsMono-Regular.ttf`,
    ).then((r) => (r.ok ? r.arrayBuffer() : null)),
  ]).catch(() => [null, null, null]);
  return { serifItalic, serifRegular, mono };
}

// Google Fonts CSS API → return raw TTF bytes for a single weight/style.
async function googleFontFile(
  family: string,
  italic = false,
): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    )}${italic ? ":ital@1" : ""}`;
    const css = await fetch(cssUrl, {
      headers: {
        // Edge CDN gives us TTF only when UA looks like a desktop browser.
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    }).then((r) => (r.ok ? r.text() : ""));
    const m = css.match(/url\((https:[^)]+\.ttf)\)/);
    if (!m) return null;
    const buf = await fetch(m[1]).then((r) => (r.ok ? r.arrayBuffer() : null));
    return buf;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  let title = searchParams.get("title") ?? "Sage After Dark";
  let pillar = (searchParams.get("pillar") ?? "build").toLowerCase();
  let template = searchParams.get("template") ?? "essay";
  let date = searchParams.get("date") ?? "";
  let dek = searchParams.get("dek") ?? "";
  let italic = searchParams.get("italic") ?? "";

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

  // Auto-detect italic phrase: last word group becomes the italic part.
  // E.g. "I write at night." → italic = "night."
  if (!italic) {
    const m = title.match(/[\s—–-]([\w'']+[.!?]?)$/);
    if (m && title.length > 12) italic = m[1];
  }
  const titleHead = italic ? title.slice(0, title.length - italic.length).trimEnd() : title;

  const accent = PILLAR_COLORS[pillar] ?? PILLAR_COLORS.build;
  const pillarLabel = PILLAR_LABELS[pillar] ?? PILLAR_LABELS.build;
  const templateLabel = TEMPLATE_LABEL[template] ?? template.toUpperCase().replace("_", " ");

  // Load brand fonts. Best-effort with graceful fallback to system serif.
  const [serifItalicBuf, serifRegularBuf] = await Promise.all([
    googleFontFile("Instrument Serif", true),
    googleFontFile("Instrument Serif", false),
  ]);

  const fonts: Array<{ name: string; data: ArrayBuffer; weight: 400; style: "normal" | "italic" }> = [];
  if (serifRegularBuf)
    fonts.push({ name: "InstrumentSerif", data: serifRegularBuf, weight: 400, style: "normal" });
  if (serifItalicBuf)
    fonts.push({ name: "InstrumentSerif", data: serifItalicBuf, weight: 400, style: "italic" });

  const titleFontSize = title.length > 80 ? 78 : title.length > 50 ? 92 : 110;

  // Deterministic mini-oscilloscope bars (no Math.random — must be stable).
  const bars = Array.from({ length: 48 }, (_, i) => {
    const phase = (i * 31) % 100;
    return 8 + (phase / 100) * 36;
  });

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
          fontFamily: "InstrumentSerif, Georgia, serif",
          padding: "56px 72px",
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

        {/* Subtle accent glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 500,
            height: 500,
            background: `radial-gradient(circle, ${accent}22 0%, transparent 60%)`,
          }}
        />

        {/* Top tactical strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 17,
            color: "#7A8290",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 14px ${accent}`,
              }}
            />
            <span style={{ color: accent }}>SAGE@AFTERDARK</span>
            <span style={{ color: "#525965" }}>·</span>
            <span>~/{pillar}</span>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span>YEAR 001</span>
            <span style={{ color: "#525965" }}>·</span>
            <span>{(date || "2026-05-04").toUpperCase()}</span>
          </div>
        </div>

        {/* Pillar tag + template label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 64,
            zIndex: 1,
          }}
        >
          <div
            style={{
              border: `1.5px solid ${accent}`,
              color: accent,
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: 18,
              padding: "6px 14px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {pillarLabel}
          </div>
          <span
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: 16,
              color: "#7A8290",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {templateLabel}
          </span>
        </div>

        {/* Title — serif with italic tail */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "baseline",
            marginTop: 28,
            fontSize: titleFontSize,
            lineHeight: 1.02,
            letterSpacing: "-0.015em",
            color: "#F5F7FA",
            zIndex: 1,
            maxWidth: "92%",
          }}
        >
          <span style={{ display: "flex" }}>{titleHead}</span>
          {italic ? (
            <span
              style={{
                display: "flex",
                marginLeft: titleHead ? "0.32em" : 0,
                fontStyle: "italic",
                color: accent,
              }}
            >
              {italic}
            </span>
          ) : null}
        </div>

        {/* Dek */}
        {dek ? (
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 26,
              lineHeight: 1.35,
              color: "#A1A8B3",
              maxWidth: "82%",
              fontFamily: "Georgia, serif",
              zIndex: 1,
            }}
          >
            {dek.length > 150 ? dek.slice(0, 150).trimEnd() + "…" : dek}
          </div>
        ) : null}

        {/* Spacer pushes oscilloscope + footer down */}
        <div style={{ flex: 1 }} />

        {/* Mini oscilloscope */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            height: 50,
            marginBottom: 22,
            zIndex: 1,
            opacity: 0.55,
          }}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: h,
                background: accent,
                opacity: 0.4 + (i / bars.length) * 0.6,
              }}
            />
          ))}
        </div>

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "ui-monospace, SFMono-Regular, monospace",
            fontSize: 16,
            color: "#7A8290",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            paddingTop: 22,
            borderTop: "1px solid rgba(232,234,237,0.12)",
            zIndex: 1,
          }}
        >
          <span>SAGEAFTERDARK.COM</span>
          <span style={{ color: accent }}>● TRANSMISSION</span>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
