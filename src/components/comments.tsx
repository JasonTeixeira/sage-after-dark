"use client";

/**
 * Comments — privacy-first via Cusdis.
 *
 * Cusdis (https://cusdis.com) is open-source, GDPR-friendly, no tracking,
 * no required login. We embed it via the official script.
 *
 * To enable, set NEXT_PUBLIC_CUSDIS_APP_ID in Vercel.
 * Until then, a graceful placeholder is shown.
 *
 * Falls back to Giscus (GitHub Discussions) if NEXT_PUBLIC_GISCUS_REPO_ID
 * is set instead — preserves backwards compatibility with prior wiring.
 */

import { useEffect, useRef } from "react";

const CUSDIS_APP_ID = process.env.NEXT_PUBLIC_CUSDIS_APP_ID ?? "";
const CUSDIS_HOST =
  process.env.NEXT_PUBLIC_CUSDIS_HOST ?? "https://cusdis.com";

const GISCUS_REPO = "JasonTeixeira/sage-after-dark";
const GISCUS_REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "";
const GISCUS_CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "";

export function Comments({
  slug,
  title,
}: {
  slug: string;
  title?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /* ---------- Cusdis path ---------- */
    if (CUSDIS_APP_ID) {
      // Avoid double-mount in dev StrictMode
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

    /* ---------- Giscus fallback ---------- */
    if (GISCUS_REPO_ID && GISCUS_CATEGORY_ID) {
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
  }, [slug]);

  /* ---------- placeholder when nothing configured ---------- */
  if (!CUSDIS_APP_ID && (!GISCUS_REPO_ID || !GISCUS_CATEGORY_ID)) {
    return (
      <div className="border border-dashed border-rule rounded p-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
          // notes
        </p>
        <p className="text-bone/60 text-[14px] mt-2">
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

  if (CUSDIS_APP_ID) {
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
