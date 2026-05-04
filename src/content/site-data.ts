/**
 * Sage After Dark — site-wide editable copy.
 *
 * The static text that lives on /now, /taste, /reading, /about,
 * and /colophon. Edit this file, push, ship. No CMS.
 *
 * Each block is timestamped with `updated` so the pages can show
 * "last updated YYYY-MM-DD" — that's the only contract with the
 * reader: this is current, or it isn't.
 */

export const NOW = {
  updated: "2026-05-04",
  location: "Brooklyn, NY",
  status: "Heads-down on Trayd v2 onboarding + the first 12 episodes of Trayd, In Public.",
  this_week: [
    "Ship Trayd v2 paywall + checkout flow",
    "Write EP 02 of Trayd, In Public (subject: the first pricing call I lost on purpose)",
    "Record one tutorial: atomic-swap deploys end-to-end",
    "First 100 newsletter subscribers — currently 43",
  ],
  reading: ["Working in Public — Nadia Eghbal", "The Mom Test — Rob Fitzpatrick"],
  listening: ["Floating Points — Promises", "Nils Frahm — All Melody"],
  watching: ["Severance S2", "Slow Horses S4"],
  not_doing: [
    "Twitter/X scroll (one window/day)",
    "New side projects (two killed in April)",
    "Podcast appearances until the launch ships",
  ],
};

export const TASTE = {
  updated: "2026-05-04",
  intro:
    "What I'm watching, listening to, reading, and noticing. Updated when something replaces something. The list is short on purpose.",
  music: [
    {
      title: "Promises",
      by: "Floating Points & Pharoah Sanders",
      year: "2021",
      note: "Best ambient album of the decade. Writing music; thinking music.",
    },
    {
      title: "All Melody",
      by: "Nils Frahm",
      year: "2018",
      note: "I have written more words to this album than any other.",
    },
    {
      title: "Avalanches — Since I Left You",
      by: "The Avalanches",
      year: "2000",
      note: "Sample-based maximalism that aged perfectly. Joy as engineering.",
    },
  ],
  film: [
    {
      title: "Severance",
      by: "Apple TV / Dan Erickson",
      year: "2022–",
      note: "A show about software people written by someone who knows software people.",
    },
    {
      title: "The Bear",
      by: "Christopher Storer",
      year: "2022–",
      note: "Operations as character study. Required viewing for founders.",
    },
    {
      title: "Slow Horses",
      by: "Apple TV / Mick Herron",
      year: "2022–",
      note: "Office politics + spycraft. The best 'work' show on TV.",
    },
  ],
  books: [
    {
      title: "Working in Public",
      by: "Nadia Eghbal",
      year: "2020",
      note: "The book I most often hand to founders. Maintenance > novelty.",
    },
    {
      title: "The Mom Test",
      by: "Rob Fitzpatrick",
      year: "2013",
      note: "Customer interviews without the lying. Re-read every six months.",
    },
    {
      title: "Working",
      by: "Studs Terkel",
      year: "1974",
      note: "What every job sounds like from the inside. Read once a year, slowly.",
    },
  ],
  notes: [
    {
      title: "Construction Physics",
      by: "Brian Potter",
      year: "Substack",
      note: "Logistics, energy, and infrastructure history as engineering analog.",
    },
    {
      title: "Bits about Money",
      by: "Patrick McKenzie",
      year: "Substack",
      note: "Technical writing about boring systems is the highest form.",
    },
  ],
};

export const READING = {
  updated: "2026-05-04",
  intro:
    "Books and writers that shaped how I think about software, work, and writing. Listed in order of how often I return to them — not order of importance.",
  shelves: [
    {
      shelf: "On building",
      items: [
        { title: "Working in Public", by: "Nadia Eghbal" },
        { title: "The Mom Test", by: "Rob Fitzpatrick" },
        { title: "High Output Management", by: "Andy Grove" },
        { title: "An Elegant Puzzle", by: "Will Larson" },
        { title: "The Goal", by: "Eliyahu Goldratt" },
      ],
    },
    {
      shelf: "On writing",
      items: [
        { title: "On Writing Well", by: "William Zinsser" },
        { title: "Several Short Sentences About Writing", by: "Verlyn Klinkenborg" },
        { title: "Bird by Bird", by: "Anne Lamott" },
      ],
    },
    {
      shelf: "On craft",
      items: [
        { title: "The Art of Memoir", by: "Mary Karr" },
        { title: "Show Your Work", by: "Austin Kleon" },
        { title: "Working", by: "Studs Terkel" },
      ],
    },
    {
      shelf: "On taste",
      items: [
        { title: "Status and Culture", by: "W. David Marx" },
        { title: "How to Write One Song", by: "Jeff Tweedy" },
        { title: "Just Kids", by: "Patti Smith" },
      ],
    },
    {
      shelf: "On systems",
      items: [
        { title: "Thinking in Systems", by: "Donella Meadows" },
        { title: "Antifragile", by: "Nassim Taleb" },
        { title: "The Power Broker", by: "Robert Caro" },
      ],
    },
  ],
};

export const ABOUT = {
  updated: "2026-05-04",
  bio: [
    "I'm Jason Teixeira. I run Sage Ideas, where I build software for people who don't have time for software.",
    "Sage After Dark is the late-night studio — essays, tutorials, dispatches, and one annual cathedral. The day job is shipping product. The night job is figuring out what the day job means.",
    "I write about reliability, taste, building in public, and the texture of work. I publish on cadence. I roll back in under 30 seconds.",
  ],
  contact: [
    { label: "Email", value: "sage@sageideas.org", href: "mailto:sage@sageideas.org" },
    { label: "Twitter / X", value: "@JasonTeixeira", href: "https://twitter.com/JasonTeixeira" },
    { label: "GitHub", value: "JasonTeixeira", href: "https://github.com/JasonTeixeira" },
    { label: "Sage Ideas", value: "sageideas.dev", href: "https://sageideas.dev" },
  ],
  principles: [
    "Reversible deploys. Reversible decisions.",
    "Publishing badly beats drafting well.",
    "The infrastructure of low-trust collaboration is the only infrastructure worth investing in.",
    "Cadence > intensity.",
    "Pay your attention tax with care.",
  ],
};

export const COLOPHON = {
  updated: "2026-05-04",
  intro:
    "How this site is built, in case you want to build one too. The whole stack is open and copy-able.",
  stack: [
    { tier: "Framework", value: "Next.js 16 (App Router · Turbopack · RSC)" },
    { tier: "Language", value: "TypeScript strict" },
    { tier: "Styles", value: "Tailwind v4 (@theme tokens, no plugin layer)" },
    { tier: "Type", value: "Geist Sans + Geist Mono via next/font" },
    { tier: "Content", value: "MDX + gray-matter + Zod-validated frontmatter" },
    { tier: "Hosting", value: "Vercel (edge runtime where applicable)" },
    { tier: "Domain", value: "sageafterdark.com (Cloudflare DNS)" },
    { tier: "Repo", value: "github.com/JasonTeixeira/sage-after-dark (private until launch)" },
  ],
  design: [
    "Eight-color base palette. Two accents (cyan #00E5FF · ember #F59E0B).",
    "Seven pillar colors used only as 1px borders, tag chips, and reading progress bars.",
    "66ch editorial reading column. clamp() type scale. Tactical grid at 24px / 1% alpha.",
    "Geist Sans body, Geist Mono for tactical labels (uppercase, 0.08em tracking).",
    "WCAG AA contrast floor. Focus rings global. All motion gated by prefers-reduced-motion.",
  ],
  authoring: [
    "Posts live in `src/content/posts/*.mdx` — six templates in `src/content/_templates/`.",
    "Frontmatter is validated by Zod at build time. Bad metadata fails the build before it ships.",
    "Each post declares one of seven pillars and one of six templates; the layout is selected automatically.",
  ],
  thanks: [
    "The team at Vercel — for shipping the right primitives.",
    "The team at Cloudflare — for the seven seconds of DNS propagation.",
    "Geist's designers at Vercel — for the cleanest variable font on the modern web.",
    "Every blog I've ripped off in spirit: Pixel Aircraft, XOTC, Robin Sloan, Maggie Appleton, Patrick McKenzie.",
  ],
};
