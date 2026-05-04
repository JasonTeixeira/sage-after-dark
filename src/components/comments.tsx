"use client";

import { useEffect, useRef } from "react";

/**
 * Giscus comments — backed by GitHub Discussions.
 *
 * Setup (one-time, in the repo):
 *   1. Enable GitHub Discussions on JasonTeixeira/sage-after-dark.
 *   2. Install the giscus app: https://github.com/apps/giscus
 *   3. Visit https://giscus.app to generate the repo / category IDs;
 *      copy them into the props below.
 *
 * Until those IDs are set, the script is omitted and a placeholder
 * is rendered so the layout stays stable.
 */

const REPO = "JasonTeixeira/sage-after-dark";
const REPO_ID = process.env.NEXT_PUBLIC_GISCUS_REPO_ID ?? "";
const CATEGORY = "General";
const CATEGORY_ID = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID ?? "";

export function Comments({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!REPO_ID || !CATEGORY_ID) return;
    // Avoid double-mount in dev StrictMode
    if (node.querySelector("iframe.giscus-frame")) return;

    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-repo", REPO);
    s.setAttribute("data-repo-id", REPO_ID);
    s.setAttribute("data-category", CATEGORY);
    s.setAttribute("data-category-id", CATEGORY_ID);
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
      // Clean up iframe + script if the component remounts
      while (node.firstChild) node.removeChild(node.firstChild);
    };
  }, [slug]);

  if (!REPO_ID || !CATEGORY_ID) {
    return (
      <div className="border border-dashed border-rule rounded p-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute">
          // comments
        </p>
        <p className="text-bone/60 text-[14px] mt-2">
          Discussion is paused for soft launch. Email{" "}
          <a
            href={`mailto:sage@sageideas.org?subject=Re: ${slug}`}
            className="text-cyan hover:underline"
          >
            sage@sageideas.org
          </a>{" "}
          with notes.
        </p>
      </div>
    );
  }

  return <div ref={ref} className="giscus" />;
}
