import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteFooter, KeyboardShortcuts, HeroReticle, JsonLd, WEBSITE_LD, PERSON_LD, RouterTransitions, AnalyticsTracker, DecoderRing, TerminalPalette, CommandPalette } from "@/components";
import { SiteHeader } from "@/components/site-header";
import { getAllPosts } from "@/content/loader";
import { IntrusionMount } from "@/components/intrusion/IntrusionMount";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sageafterdark.com"),
  title: {
    default: "Sage After Dark",
    template: "%s · Sage After Dark",
  },
  description:
    "A tactical-editorial publication by Jason Teixeira. Field notes from building Sage Ideas — software, signal, mind, world, taste.",
  authors: [{ name: "Jason Teixeira", url: "https://sageideas.dev" }],
  creator: "Jason Teixeira",
  publisher: "Sage Ideas LLC",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
      "application/feed+json": "/feed.json",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.sageafterdark.com",
    siteName: "Sage After Dark",
    title: "Sage After Dark",
    description:
      "A tactical-editorial publication by Jason Teixeira. Field notes from building Sage Ideas.",
    images: [
      {
        url: "/api/og?head=I%20write&italic=at%20night.&pillar=signal&template=essay&dek=After-hours%20essays%20from%20a%20one-person%20studio.",
        width: 1200,
        height: 630,
        alt: "Sage After Dark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sage After Dark",
    description:
      "A tactical-editorial publication by Jason Teixeira. Field notes from building Sage Ideas.",
    images: [
      "/api/og?head=I%20write&italic=at%20night.&pillar=signal&template=essay&dek=After-hours%20essays%20from%20a%20one-person%20studio.",
    ],
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const posts = await getAllPosts();
  const essays = posts.map((p) => ({
    slug: p.frontmatter.slug,
    title: p.frontmatter.title,
    pillar: p.frontmatter.pillar,
    mins: p.reading_minutes,
    dek: p.frontmatter.dek ?? "",
  }));

  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink-0 text-bone antialiased flex flex-col min-h-screen">
        {/* Pre-boot shroud: opaque dark cover painted by the server so the
            editorial homepage never flashes through before IntrusionRoot mounts.
            z-index 59 = above all page content, below #wall (z-index 60).
            IntrusionRoot removes it once the decoy/overlay is painted.
            No-JS users get the real content — noscript hides this element. */}
        <div id="intrusion-preboot" aria-hidden="true" style={{position:"fixed",inset:0,zIndex:59,background:"#05070A"}} />
        <noscript><style>{`#intrusion-preboot{display:none!important}`}</style></noscript>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-ink-1 focus:text-cyan focus:px-3 focus:py-2 focus:border focus:border-cyan focus:font-mono focus:text-[12px] focus:uppercase focus:tracking-wide"
        >
          Skip to content
        </a>
        <JsonLd data={WEBSITE_LD} />
        <JsonLd data={PERSON_LD} />
        <SiteHeader />
        <div id="main" className="flex-1">{children}</div>
        <SiteFooter />
        <KeyboardShortcuts />
        <HeroReticle />
        <TerminalPalette />
        <CommandPalette />
        <DecoderRing />
        <RouterTransitions />
        <AnalyticsTracker />
        {/* IntrusionMount uses ssr:false so the overlay is absent from the
            server-rendered HTML. Bots and screen readers see only real content.
            The overlay appears after hydration for interactive visitors. */}
        <IntrusionMount essays={essays} />
      </body>
    </html>
  );
}
