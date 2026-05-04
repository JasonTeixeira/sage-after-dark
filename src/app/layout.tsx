import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});
import { SiteHeader, SiteFooter, KeyboardShortcuts, HeroReticle, Konami, JsonLd, WEBSITE_LD, PERSON_LD } from "@/components";

export const metadata: Metadata = {
  metadataBase: new URL("https://sageafterdark.com"),
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
    url: "https://sageafterdark.com",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink-0 text-bone antialiased flex flex-col min-h-screen">
        <JsonLd data={WEBSITE_LD} />
        <JsonLd data={PERSON_LD} />
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <KeyboardShortcuts />
        <HeroReticle />
        <Konami />
      </body>
    </html>
  );
}
