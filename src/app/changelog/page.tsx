import type { Metadata } from "next";
import { JsonLd } from "@/components";
import changelogData from "@/generated/changelog.json";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "What changed and when. Auto-generated from git history — every commit, every shipped wave, every fix.",
  alternates: { canonical: "https://www.sageafterdark.com/changelog" },
};

// Static at build time. Re-generated whenever a new build deploys.
export const dynamic = "force-static";
export const revalidate = false;

type Entry = {
  hash: string;
  date: string; // YYYY-MM-DD
  subject: string;
  type: "feat" | "fix" | "docs" | "perf" | "refactor" | "chore" | "other";
  scope: string | null;
};

function parseConventional(subject: string): Pick<Entry, "type" | "scope"> {
  const m = subject.match(/^([a-z]+)(?:\(([^)]+)\))?:/i);
  if (!m) return { type: "other", scope: null };
  const t = m[1].toLowerCase();
  const allowed = ["feat", "fix", "docs", "perf", "refactor", "chore"] as const;
  const type = (allowed as readonly string[]).includes(t)
    ? (t as Entry["type"])
    : "other";
  return { type, scope: m[2] ?? null };
}

type RawEntry = { hash: string; date: string; subject: string };

function getEntries(): Entry[] {
  const raw = (changelogData as { entries: RawEntry[] }).entries ?? [];
  return raw.map((e) => ({
    hash: e.hash,
    date: e.date,
    subject: e.subject,
    ...parseConventional(e.subject),
  }));
}

const TYPE_LABEL: Record<Entry["type"], string> = {
  feat: "FEATURE",
  fix: "FIX",
  docs: "DOCS",
  perf: "PERF",
  refactor: "REFACTOR",
  chore: "CHORE",
  other: "NOTE",
};

const TYPE_ACCENT: Record<Entry["type"], string> = {
  feat: "text-cyan border-cyan/40",
  fix: "text-amber-300 border-amber-300/40",
  perf: "text-cyan border-cyan/30",
  refactor: "text-bone border-rule",
  docs: "text-mute border-rule",
  chore: "text-mute border-rule",
  other: "text-mute border-rule",
};

export default function ChangelogPage() {
  const entries = getEntries();

  // Group by date
  const grouped = entries.reduce<Record<string, Entry[]>>((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});
  const dates = Object.keys(grouped).sort().reverse();

  return (
    <main className="min-h-screen pt-24 pb-32">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: "https://www.sageafterdark.com",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Changelog",
              item: "https://www.sageafterdark.com/changelog",
            },
          ],
        }}
      />
      <div className="max-w-[820px] mx-auto px-5 lg:px-0">
        <header className="mb-12">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cyan mb-3">
            // changelog
          </p>
          <h1 className="font-serif text-bone text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.01em] mb-4">
            What changed, and when.
          </h1>
          <p className="font-sans text-bone/80 text-[16px] leading-[1.6] max-w-[60ch]">
            Auto-generated from <span className="font-mono text-cyan">git log</span>.
            Every shipped wave, fix, and refactor. No marketing — just the
            commits.
          </p>
        </header>

        {dates.length === 0 ? (
          <p className="font-sans text-mute text-[14px]">
            No commits available in this build.
          </p>
        ) : (
          <ol className="space-y-12">
            {dates.map((date) => (
              <li key={date}>
                <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-rule">
                  <h2 className="font-mono text-[12px] uppercase tracking-[0.08em] text-bone">
                    {date}
                  </h2>
                  <span className="font-mono text-[10px] text-mute">
                    {grouped[date].length} commit
                    {grouped[date].length === 1 ? "" : "s"}
                  </span>
                </div>
                <ul className="space-y-3">
                  {grouped[date].map((e) => {
                    const cleaned = e.subject.replace(
                      /^[a-z]+(\([^)]+\))?:\s*/i,
                      "",
                    );
                    return (
                      <li key={e.hash} className="flex items-start gap-3">
                        <span
                          className={`mt-[3px] shrink-0 px-1.5 py-0.5 border font-mono text-[9px] uppercase tracking-[0.08em] ${TYPE_ACCENT[e.type]}`}
                        >
                          {TYPE_LABEL[e.type]}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-bone text-[14px] leading-[1.5]">
                            {cleaned}
                          </p>
                          <p className="font-mono text-[10px] text-mute mt-1">
                            <a
                              href={`https://github.com/JasonTeixeira/sage-after-dark/commit/${e.hash}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:text-cyan"
                            >
                              {e.hash}
                            </a>
                            {e.scope ? (
                              <>
                                {" · "}
                                <span className="text-bone/60">{e.scope}</span>
                              </>
                            ) : null}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
