import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components";

export const metadata: Metadata = {
  title: "Uses",
  description:
    "The exact stack behind Sage After Dark — hardware, editor, hosting, billing, and the small tools that make late-night writing possible.",
  alternates: { canonical: "https://sageafterdark.com/uses" },
};

type Item = { name: string; note: string; href?: string };
type Section = { id: string; title: string; items: Item[] };

const SECTIONS: Section[] = [
  {
    id: "writing",
    title: "Writing",
    items: [
      {
        name: "Markdown + frontmatter",
        note: "Every essay is a .md file in the repo. No CMS. No DB. The git history is the audit log.",
      },
      {
        name: "Geist Sans + Geist Mono",
        note: "Two fonts. Sans for body, Mono for everything tactical. Editorial weight comes from rhythm, not faces.",
        href: "https://vercel.com/font",
      },
      {
        name: "remark-gfm + rehype-slug",
        note: "Footnotes, autolinked headings, anchor copy. Boring tools, sharp output.",
      },
    ],
  },
  {
    id: "stack",
    title: "Stack",
    items: [
      { name: "Next.js 15 (App Router)", note: "RSC by default. Client components only when interaction demands it.", href: "https://nextjs.org" },
      { name: "TypeScript", note: "Strict. No `any` survives review." },
      { name: "Tailwind v4", note: "Utility-first. No design system file — tokens live in @theme.", href: "https://tailwindcss.com" },
      { name: "Vercel", note: "Zero-config Next.js host. Edge cache + ISR cover 99% of traffic.", href: "https://vercel.com" },
    ],
  },
  {
    id: "infra",
    title: "Infra",
    items: [
      { name: "Stripe", note: "Live prices, customer portal, monthly + annual tiers. Webhooks gated by signature.", href: "https://stripe.com" },
      { name: "Resend", note: "Transactional + audience for the newsletter. Welcome email is one HTML template.", href: "https://resend.com" },
      { name: "Supabase", note: "Auth (magic link only) + members table. No third-party identity providers — yet.", href: "https://supabase.com" },
      { name: "GitHub Actions", note: "Lighthouse CI on every PR. The 95+ floor is enforced, not aspirational.", href: "https://github.com/features/actions" },
    ],
  },
  {
    id: "writing-station",
    title: "Writing station",
    items: [
      { name: "MacBook Pro 14\" (M-series)", note: "Two windows: one editor, one preview. That's the whole desktop." },
      { name: "VS Code + Cursor", note: "Cursor for drafts, VS Code for surgical edits. Both pointed at the same repo." },
      { name: "Magic Trackpad", note: "Mechanical keyboards are romantic but loud. Trackpad keeps the studio quiet." },
      { name: "Hatch sunrise alarm", note: "I write between 9pm and 1am. The morning needs a soft landing." },
    ],
  },
  {
    id: "discipline",
    title: "Discipline",
    items: [
      { name: "Field notes", note: "End-of-month retro published as the next field-note essay. Compounds the work." },
      { name: "Half-Life concept", note: "Every essay is dated and decay-tested. If it stops being true, it gets a redaction notice — not a delete.", href: "/concepts/half-life-of-a-decision" },
      { name: "Taste as deploy gate", note: "If I wouldn't quote it back to myself in six months, it doesn't ship.", href: "/concepts/taste-as-deploy-gate" },
    ],
  },
];

export default function UsesPage() {
  return (
    <main className="min-h-screen pt-24 pb-32">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://sageafterdark.com" },
            { "@type": "ListItem", position: 2, name: "Uses", item: "https://sageafterdark.com/uses" },
          ],
        }}
      />
      <div className="max-w-[820px] mx-auto px-5 lg:px-0">
        <header className="mb-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan mb-3">
            // uses
          </p>
          <h1 className="font-serif text-bone text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.01em] mb-4">
            What I actually use.
          </h1>
          <p className="font-sans text-bone/80 text-[16px] leading-[1.6] max-w-[60ch]">
            No affiliate links. No &ldquo;productivity stack.&rdquo; Just the tools that
            survived a year of late nights.
          </p>
        </header>

        <nav aria-label="Sections" className="mb-12 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="font-mono text-[10px] uppercase tracking-[0.1em] text-mute hover:text-cyan border border-rule hover:border-cyan/40 px-2 py-1"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="space-y-16">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="font-mono text-[12px] uppercase tracking-[0.1em] text-cyan mb-4 pb-2 border-b border-rule">
                {s.title}
              </h2>
              <ul className="space-y-5">
                {s.items.map((it) => (
                  <li key={it.name} className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-2 sm:gap-6">
                    <div className="font-sans text-bone text-[14px]">
                      {it.href ? (
                        it.href.startsWith("/") ? (
                          <Link href={it.href} className="hover:text-cyan border-b border-rule hover:border-cyan/60">
                            {it.name}
                          </Link>
                        ) : (
                          <a href={it.href} target="_blank" rel="noreferrer" className="hover:text-cyan border-b border-rule hover:border-cyan/60">
                            {it.name}
                          </a>
                        )
                      ) : (
                        it.name
                      )}
                    </div>
                    <p className="font-sans text-bone/75 text-[14px] leading-[1.55]">
                      {it.note}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-20 pt-6 border-t border-rule font-mono text-[10px] uppercase tracking-[0.08em] text-mute">
          Inspired by <a href="https://uses.tech" target="_blank" rel="noreferrer" className="hover:text-cyan">uses.tech</a>.
          Updated whenever I swap a tool — see the <Link href="/changelog" className="hover:text-cyan">changelog</Link>.
        </p>
      </div>
    </main>
  );
}
