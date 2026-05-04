/**
 * /api/og — dynamic OG image generator (editorial brand).
 *
 * Renders 1200×630 social cards in the Sage After Dark voice:
 *   - Instrument Serif italic title (the brand mark)
 *   - Tactical chrome (terminal prompt, pillar tag, year label)
 *   - Pillar accent color + glow
 *   - Mini oscilloscope signal panel for visual continuity with the home
 *
 * Fonts are self-hosted in public/_fonts/ and read at request time
 * via the file system (Node runtime). Graceful system-serif fallback
 * if the font files are missing.
 */

import { ImageResponse } from "next/og";
import { promises as fs } from "node:fs";
import path from "node:path";
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

let _fontCache: { regular: ArrayBuffer; italic: ArrayBuffer } | null = null;

async function loadFonts() {
  if (_fontCache) return _fontCache;
  try {
    const dir = path.join(process.cwd(), "public", "_fonts");
    const [regular, italic] = await Promise.all([
      fs.readFile(path.join(dir, "InstrumentSerif-Regular.ttf")),
      fs.readFile(path.join(dir, "InstrumentSerif-Italic.ttf")),
    ]);
    _fontCache = {
      regular: regular.buffer.slice(
        regular.byteOffset,
        regular.byteOffset + regular.byteLength,
      ) as ArrayBuffer,
      italic: italic.buffer.slice(
        italic.byteOffset,
        italic.byteOffset + italic.byteLength,
      ) as ArrayBuffer,
    };
    return _fontCache;
  } catch {
    return null;
  }
}

/**
 * Detect a stylish italic split point in a title.
 * Strategy:
 *   1. If title contains an em-dash, italicize everything after.
 *   2. Else if title has 6+ words, italicize the last 1-2 words.
 *   3. Else italicize the last word.
 * Returns { head, italic } where head + " " + italic === title (approx).
 */
function splitForItalic(title: string): { head: string; italic: string } {
  const dashMatch = title.split(/\s[—–]\s/);
  if (dashMatch.length === 2) {
    return { head: dashMatch[0] + " —", italic: dashMatch[1] };
  }
  const words = title.trim().split(/\s+/);
  if (words.length >= 6) {
    const tail = words.slice(-2).join(" ");
    return { head: words.slice(0, -2).join(" "), italic: tail };
  }
  if (words.length >= 3) {
    return { head: words.slice(0, -1).join(" "), italic: words[words.length - 1] };
  }
  return { head: "", italic: title };
}

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

  const overrideHead = searchParams.get("head");
  const overrideItalic = searchParams.get("italic");
  const { head: titleHead, italic: titleItalic } = overrideItalic
    ? { head: overrideHead ?? "", italic: overrideItalic }
    : splitForItalic(title);

  const accent = PILLAR_COLORS[pillar] ?? PILLAR_COLORS.build;
  const pillarLabel = PILLAR_LABELS[pillar] ?? PILLAR_LABELS.build;
  const templateLabel =
    TEMPLATE_LABEL[template] ?? template.toUpperCase().replace("_", " ");

  const fontFiles = await loadFonts();
  const fonts = fontFiles
    ? [
        {
          name: "InstrumentSerif",
          data: fontFiles.regular,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "InstrumentSerif",
          data: fontFiles.italic,
          weight: 400 as const,
          style: "italic" as const,
        },
      ]
    : undefined;

  // Auto-size title so it never overflows.
  const totalLen = title.length;
  const titleFontSize = totalLen > 64 ? 84 : totalLen > 44 ? 102 : 118;
  // Keep dek to a single line at this width; punchy beats complete.
  const dekTrimmed =
    dek.length > 95 ? dek.slice(0, 92).trimEnd() + "…" : dek;

  // Deterministic mini-oscilloscope bars — sine-like envelope.
  const bars = Array.from({ length: 56 }, (_, i) => {
    const t = i / 55;
    const env = Math.sin(t * Math.PI) * 0.7 + 0.3; // 0.3..1.0
    const wave = Math.sin(i * 0.7) * 0.3 + 0.7; // ripple
    return Math.max(6, env * wave * 42);
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
          padding: "52px 72px",
          position: "relative",
        }}
      >
        {/* Tactical grid backdrop */}
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

        {/* Soft accent glow top-right */}
        <div
          style={{
            position: "absolute",
            top: -240,
            right: -240,
            width: 560,
            height: 560,
            background: `radial-gradient(circle, ${accent}26 0%, transparent 60%)`,
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

        {/* Pillar tag + template */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 56,
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
            marginTop: 24,
            fontSize: titleFontSize,
            lineHeight: 1.04,
            letterSpacing: "-0.015em",
            color: "#F5F7FA",
            zIndex: 1,
            maxWidth: "94%",
          }}
        >
          {titleHead ? (
            <span style={{ display: "flex" }}>{titleHead}</span>
          ) : null}
          {titleItalic ? (
            <span
              style={{
                display: "flex",
                marginLeft: titleHead ? "0.32em" : 0,
                fontStyle: "italic",
                color: accent,
              }}
            >
              {titleItalic}
            </span>
          ) : null}
        </div>

        {/* Dek (small, single line preferred) */}
        {dekTrimmed ? (
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 22,
              lineHeight: 1.4,
              color: "#A1A8B3",
              maxWidth: "82%",
              fontFamily: "Georgia, serif",
              zIndex: 1,
            }}
          >
            {dekTrimmed}
          </div>
        ) : null}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Mini oscilloscope */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 4,
            height: 32,
            marginBottom: 18,
            marginTop: 8,
            zIndex: 1,
            opacity: 0.45,
          }}
        >
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                width: 5,
                height: h,
                background: accent,
                opacity: 0.45 + (i / bars.length) * 0.55,
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
            paddingTop: 18,
            borderTop: "1px solid rgba(232,234,237,0.12)",
            zIndex: 1,
          }}
        >
          <span>SAGEAFTERDARK.COM</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: accent,
                boxShadow: `0 0 10px ${accent}`,
                display: "flex",
              }}
            />
            <span style={{ color: accent }}>TRANSMISSION</span>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
