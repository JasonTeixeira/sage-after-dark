/**
 * /admin layout — email-gated.
 *
 * Anyone who isn't the admin gets redirected to /account/login. The session
 * cookie is verified server-side; admin-only RPCs further enforce a secret.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdmin, getAdminEmail } from "@/lib/admin-guard";
import { Page, Container, TacticalStrip, StripSep, TerminalPrompt } from "@/components";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin — Sage After Dark",
  robots: { index: false, follow: false },
};

const TABS: Array<{ href: string; label: string }> = [
  { href: "/admin", label: "overview" },
  { href: "/admin/members", label: "members" },
  { href: "/admin/posts", label: "posts" },
  { href: "/admin/now", label: "/now" },
  { href: "/admin/rotation", label: "rotation" },
  { href: "/admin/featured", label: "featured" },
  { href: "/admin/auth-log", label: "auth log" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    redirect("/account/login?next=/admin");
  }
  const email = getAdminEmail();
  return (
    <Page>
      <Container size="default" className="pt-6 pb-24">
        <TacticalStrip variant="live">
          <TerminalPrompt path="~/admin" mode="breadcrumb" />
          <StripSep />
          <span>SIGNED IN · {email?.toUpperCase()}</span>
          <span className="ml-auto text-cyan">ADMIN · LIVE</span>
        </TacticalStrip>

        <nav className="mt-6 mb-10 flex flex-wrap items-center gap-1 border-b border-rule pb-2">
          {TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="font-mono text-[11px] uppercase tracking-[0.08em] text-mute px-3 py-2 hover:text-cyan border border-transparent hover:border-cyan/30 transition-colors"
            >
              {t.label}
            </Link>
          ))}
          <span className="ml-auto font-mono text-[10px] text-mute">
            <form method="post" action="/api/auth/logout" className="inline">
              <button type="submit" className="hover:text-ember">sign out</button>
            </form>
          </span>
        </nav>

        <div>{children}</div>
      </Container>
    </Page>
  );
}
