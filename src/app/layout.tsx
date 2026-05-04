import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sageafterdark.com",
    siteName: "Sage After Dark",
    title: "Sage After Dark",
    description:
      "A tactical-editorial publication by Jason Teixeira. Field notes from building Sage Ideas.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sage After Dark",
    description:
      "A tactical-editorial publication by Jason Teixeira. Field notes from building Sage Ideas.",
    creator: "@JasonTeixeira",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink-0 text-bone antialiased">{children}</body>
    </html>
  );
}
