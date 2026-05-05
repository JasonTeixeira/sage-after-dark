/**
 * /admin/auth-log — recent magic-link sign-in history.
 */

import { Display, Lead, Tactical, Hr } from "@/components";
import { adminListMagicLinks } from "@/lib/living";

export const dynamic = "force-dynamic";

function fmt(iso: string | null) {
  if (!iso) return "\u2014";
  return new Date(iso).toISOString().slice(0, 16).replace("T", " ");
}

export default async function AdminAuthLogPage() {
  const links = await adminListMagicLinks(100).catch(() => []);
  const used = links.filter((l) => l.consumed_at).length;
  const pending = links.filter((l) => !l.consumed_at).length;

  return (
    <div>
      <header className="mb-8">
        <Tactical className="text-cyan mb-3 block">// auth log</Tactical>
        <Display className="mb-3">Auth log</Display>
        <Lead>
          {links.length} magic links issued &middot; {used} used &middot;{" "}
          {pending} pending. Last 100 shown.
        </Lead>
      </header>

      <Hr className="mb-6" />

      {links.length === 0 ? (
        <p className="text-mute text-sm font-mono">
          No magic links issued yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-rule">
                <Th>email</Th>
                <Th>requested</Th>
                <Th>used</Th>
                <Th>expires</Th>
                <Th>status</Th>
              </tr>
            </thead>
            <tbody>
              {links.map((l, i) => {
                const expired = !l.consumed_at && Date.now() > new Date(l.expires_at).getTime();
                return (
                  <tr
                    key={`${l.email}-${l.created_at}-${i}`}
                    className="border-b border-rule/40 hover:bg-ink-1/40"
                  >
                    <Td className="text-bone">{l.email}</Td>
                    <Td className="text-mute tabular-nums">{fmt(l.created_at)}</Td>
                    <Td className="text-mute tabular-nums">
                      {fmt(l.consumed_at)}
                    </Td>
                    <Td className="text-mute tabular-nums">{fmt(l.expires_at)}</Td>
                    <Td>
                      {l.consumed_at ? (
                        <span className="text-cyan">used</span>
                      ) : expired ? (
                        <span className="text-mute">expired</span>
                      ) : (
                        <span className="text-ember">pending</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left font-mono text-[10px] uppercase tracking-[0.12em] text-mute py-3 px-2">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`py-3 px-2 ${className}`}>{children}</td>;
}
