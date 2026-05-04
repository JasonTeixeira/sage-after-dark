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
    "First 100 newsletter subscribers — founding window now open",
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
    { label: "GitHub", value: "JasonTeixeira", href: "https://github.com/JasonTeixeira" },
    { label: "LinkedIn", value: "in/jasonteixeira", href: "https://www.linkedin.com/in/jasonteixeira" },
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

/* -----------------------------------------------------------
 * Story arcs — multi-part series. Featured on home.
 * --------------------------------------------------------- */
export const ARCS = [
  {
    slug: "trayd-in-public",
    code: "ARC_001",
    title: "Trayd, In Public",
    italic: "In Public",
    episodes_done: 3,
    episodes_total: 12,
    status: "latest",
    pull:
      "The first ten paying contractors. The week the calls came in.",
    summary:
      "A twelve-episode field journal documenting the build, launch, and operation of Trayd — an AI companion for trades contractors. Every episode is a real chapter of a real product. The receipts are public. The mistakes are public. The numbers, when I can share them, are public.",
    pillar: "build" as const,
    started: "2026-03-10",
    cadence: "weekly · fridays",
    format: "long-form + primary docs",
  },
  {
    slug: "becoming-a-studio",
    code: "ARC_002",
    title: "Becoming a Studio",
    italic: "a Studio",
    episodes_done: 1,
    episodes_total: 8,
    status: "latest",
    pull:
      "On pricing the work — what I charge, what I refuse, why.",
    summary:
      "What it actually takes to turn one operator into a studio of one — pricing, positioning, the kinds of clients you say no to, and the day the calendar fills.",
    pillar: "world" as const,
    started: "2026-04-04",
    cadence: "biweekly",
    format: "essay + ledger",
  },
  {
    slug: "the-reading-list",
    code: "ARC_003",
    title: "The Reading List",
    italic: "Reading List",
    episodes_done: 4,
    episodes_total: 12,
    status: "latest",
    pull:
      "Borges, AI, and the unsettling math of the Library of Babel.",
    summary:
      "Books I'm reading and what they're doing to my thinking. Less review, more annotation. Twelve books, twelve essays, one year.",
    pillar: "mind" as const,
    started: "2026-01-01",
    cadence: "monthly",
    format: "essay + margin notes",
  },
];

/* -----------------------------------------------------------
 * Trayd, In Public — the 12-episode arc.
 * --------------------------------------------------------- */
export const TRAYD_EPISODES = [
  {
    n: "01",
    kind: "PUBLISHED",
    title: "“What if a contractor didn’t have to read?”",
    summary:
      "The first conversation that became Trayd. A drywall sub in Phoenix asked me a question that would not leave for three weeks. This is that question. The answer that emerged, and why bilingual voice was the obvious right thing.",
    date: "22 MAR",
    read: "15 MIN",
    views: "4,108",
    responses: "412",
  },
  {
    n: "02",
    kind: "PUBLISHED",
    title: "The HVAC — first thesis.",
    summary:
      "Why we picked easy job. Why HVAC. Why bilingual from day one. Why the quiet math of $50/m fit, and the meeting where I almost picked plumbing and was wrong.",
    date: "29 MAR",
    read: "12 MIN",
    views: "4,112",
    responses: "33",
  },
  {
    n: "03",
    kind: "LIVE NOW",
    title: "Why I rebuilt Trayd’s voice agent in a weekend.",
    summary:
      "The old stack hit 1.4s of round-trip latency on a Tuesday and I knew it had to go. What I didn’t expect was that the rewrite would teach me more about voice machines than five years of fintech ever did.",
    date: "05 APR",
    read: "12 MIN",
    views: "3,109",
    responses: "61",
  },
  {
    n: "04",
    kind: "SCHEDULED",
    title: "The first ten paying contractors. The week the calls came in.",
    summary:
      "Onboarding ten companies in five days. The DM that opened the floodgates. What I got wrong. The Saturday that almost lost three of them. The voice I’d give a refund to even though they didn’t ask.",
    date: "19 APR",
    read: "EST · 18 MIN",
    format: "LONG-FORM + DASHBOARD",
  },
  {
    n: "05",
    kind: "SCHEDULED",
    title: "The data wall. What we know after a thousand calls.",
    summary:
      "A thousand voice calls in. What contractors actually ask. The five categories nobody predicted. The chart I’m going to live with for years.",
    date: "26 APR",
    read: "—",
  },
  {
    n: "06",
    kind: "DRAFTING",
    title: "A bilingual product is two products. Both have to be great.",
    summary:
      "The translation problem nobody warned me about. Why “Spanish-first” and “Spanish toggle” are different products. The decision tree.",
    date: "03 MAY",
    read: "—",
  },
  {
    n: "07",
    kind: "PLANNED",
    title: "Pricing · The first hire · The mistake · The number · The wall · The end of the arc.",
    summary:
      "Six chapters to come. A pricing essay, the question of when to stop being one person, the public mistake, the first ARR number I’ll share, the wall I’m going to hit, and the closing chapter that turns this whole arc into a printed PDF for the people who read it all.",
    date: "SUMMER",
    read: "—",
  },
];

/* -----------------------------------------------------------
 * Products — the day-job side of Sage Ideas.
 * Shown on home in "By day, I ship production software" strip.
 * --------------------------------------------------------- */
export const PRODUCTS = [
  {
    code: "T",
    name: "Trayd",
    tagline: "AI companion for trades contractors · LIVE",
    href: "https://trayd.app",
    accent: "cyan" as const,
  },
  {
    code: "A",
    name: "Alphathreum",
    tagline: "DeFi calculations + NL prompts · BETA",
    href: "https://alphathreum.com",
    accent: "ember" as const,
  },
  {
    code: "N",
    name: "Naural",
    tagline: "AI tables for ops teams · PRIVATE",
    href: "https://naural.app",
    accent: "mute" as const,
  },
];

/* -----------------------------------------------------------
 * Now-playing tape strip — the rotating obsession marquee
 * shown above the products section on home.
 * --------------------------------------------------------- */
export const NOW_PLAYING = {
  status: "NOW PLAYING",
  items: [
    { kind: "album", label: "Reflection · Brian Eno" },
    { kind: "book", label: "A Pattern Language · Alexander" },
    { kind: "film", label: "Severance, S2 E04" },
    { kind: "app", label: "Linear — Monthly Replant" },
    { kind: "obs", label: "Pyrex glass" },
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
