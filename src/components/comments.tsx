"use client";

/**
 * Comments — Giscus (GitHub Discussions) with Cusdis fallback.
 *
 * Behaviour:
 *   - If NEXT_PUBLIC_CUSDIS_APP_ID is set, render Cusdis.
 *   - Else if NEXT_PUBLIC_GISCUS_REPO_ID + NEXT_PUBLIC_GISCUS_CATEGORY_ID
 *     are set, mount Giscus.
 *     - If Giscus reports an error (e.g. the Giscus GitHub App hasn't
 *       been installed on the repo yet, or Discussions aren't enabled
 *       for this category), we silently swap to the friendly
 *       reply-by-email placeholder so visitors never see a raw error.
 *   - Else render the placeholder.
 *
 * The Giscus app must be installed once at https://github.com/apps/giscus
 * by the repo owner. Until that happens, the embed is hidden.
 */

import { useEffect, useRef, useState } from "react";

const CUSDIS_APP_ID = process.env.NEXT_PUBLIC_CUSDIS_APP_ID ?? "";
const CUSDIS_HOST =
  process.env.NEXT_PUBLIC_CUSDIS_HOST ?? "https://cusdis.com";

const GISCUS_REPO = "JasonTeixeira/sage-after-dark";
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "";
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "";

const GISCUS_CONFIGURED = !!(GISCUS_REPO_ID && GISCUS_CATEGORY_ID);

type Mode = "cusdis" | "giscus" | "placeholder";

function Placeholder({ slug }: { slug: string }) {
  return (
    <div className="border border-dashed border-rule rounded p-6 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
        // notes
      </p>
      <p className="text-bone/70 text-[14px] mt-2 leading-relaxed">
        Reply by email —{" "}
        <a
          href={`mailto:sage@sageideas.org?subject=Re: ${slug}`}
          className="text-cyan hover:underline"
        >
          sage@sageideas.org
        </a>
        . Or share a thought at{" "}
        <a href="/ask" className="text-cyan hover:underline">
          /ask
        </a>
        .
      </p>
    </div>
  );
}

export function Comments({
  slug,
  title,
}: {
  slug: string;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Initial mode is decided by env var presence — Cusdis wins,
  // otherwise Giscus, otherwise placeholder.
  const initialMode: Mode = CUSDIS_APP_ID
    ? "cusdis"
    : GISCUS_CONFIGURED
    ? "giscus"
    : "placeholder";
  const [mode, setMode] = useState<Mode>(initialMode);

  /* ----------------------------------------------------------------
   * Listen for Giscus error messages. The official Giscus iframe
   * posts metadata via window.postMessage; if we see anything that
   * looks like an error/warning (e.g. "giscus is not installed"),
   * we collapse to the placeholder.
   * -------------------------------------------------------------- */
  useEffect(() => {
    if (mode !== "giscus") return;

    // Only collapse on FATAL config errors (app not installed,
    // repo not found, discussions disabled). "Discussion not found"
    // is the NORMAL state for a post that hasn't been commented on
    // yet — Giscus shows the comment box and creates a discussion
    // on first reply. We must not hide the embed in that case.
    const FATAL_PATTERNS = [
      /not installed/i,
      /repo.*not.*found/i,
      /discussions.*not.*enabled/i,
      /category.*not.*found/i,
      /unauthorized/i,
    ];

    const onMessage = (event: MessageEvent) => {
      if (!event.origin.includes("giscus.app")) return;
      const data = event.data;
      if (data && typeof data === "object" && "giscus" in data) {
        const payload = (data as { giscus: { error?: string } }).giscus;
        if (payload && payload.error) {
          const msg = String(payload.error);
          // eslint-disable-next-line no-console
          console.warn("[comments] giscus message:", msg);
          if (FATAL_PATTERNS.some((re) => re.test(msg))) {
            setMode("placeholder");
          }
        }
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [mode]);

  /* ----------------------------------------------------------------
   * Mount the chosen embed. Re-runs when mode flips to placeholder
   * (which simply tears down any iframe).
   * -------------------------------------------------------------- */
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /* ---------- Cusdis path ---------- */
    if (mode === "cusdis") {
      if (node.querySelector("script[data-host]")) return;
      const s = document.createElement("script");
      s.src = `${CUSDIS_HOST}/js/cusdis.es.js`;
      s.async = true;
      s.defer = true;
      node.appendChild(s);
      return () => {
        while (node.firstChild) node.removeChild(node.firstChild);
      };
    }

    /* ---------- Giscus path ---------- */
    if (mode === "giscus") {
      if (node.querySelector("iframe.giscus-frame")) return;
      const s = document.createElement("script");
      s.src = "https://giscus.app/client.js";
      s.async = true;
      s.crossOrigin = "anonymous";
      s.setAttribute("data-repo", GISCUS_REPO);
      s.setAttribute("data-repo-id", GISCUS_REPO_ID);
      s.setAttribute("data-category", "General");
      s.setAttribute("data-category-id", GISCUS_CATEGORY_ID);
      s.setAttribute("data-mapping", "specific");
      s.setAttribute("data-term", slug);
      s.setAttribute("data-strict", "1");
      s.setAttribute("data-reactions-enabled", "1");
      s.setAttribute("data-emit-metadata", "0");
      s.setAttribute("data-input-position", "top");
      s.setAttribute("data-theme", "noborder_dark");
      s.setAttribute("data-lang", "en");
      s.setAttribute("data-loading", "lazy");
      node.appendChild(s);
      return () => {
        while (node.firstChild) node.removeChild(node.firstChild);
      };
    }
  }, [mode, slug]);

  /* ---------- Render branch ---------- */
  if (mode === "placeholder") {
    return <Placeholder slug={slug} />;
  }

  if (mode === "cusdis") {
    return (
      <div
        ref={ref}
        id="cusdis_thread"
        data-host={CUSDIS_HOST}
        data-app-id={CUSDIS_APP_ID}
        data-page-id={slug}
        data-page-url={
          typeof window !== "undefined" ? window.location.href : ""
        }
        data-page-title={title ?? slug}
        data-theme="dark"
      />
    );
  }

  return <div ref={ref} className="giscus" />;
}
