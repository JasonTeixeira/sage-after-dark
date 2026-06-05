/**
 * /admin/members — list of members with status, plan, period end.
 */

import { Display, Lead, Tactical, Hr } from "@/components";
import { adminListMembers } from "@/lib/living";

export const dynamic = "force-dynamic";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "\u2014";
  return new Date(iso).toISOString().slice(0, 10);
}

function statusColor(s: string): string {
  switch (s) {
    case "active":
    case "trialing":
      return "text-cyan";
    case "past_due":
    case "unpaid":
      return "text-ember";
    case "canceled":
      return "text-mute";
    default:
      return "text-bone/70";
  }
}

export default async function AdminMembersPage() {
  const members = await safe(adminListMembers, []);

  const sorted = [...members].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const active = sorted.filter(
    (m) => m.status === "active" || m.status === "trialing",
  ).length;

  return (
    <div>
      <header className="mb-8">
        <Tactical className="text-cyan mb-3 block">// members</Tactical>
        <Display className="mb-3">Members</Display>
        <Lead>
          {active} active &middot; {sorted.length} registered accounts
        </Lead>
      </header>

      <Hr className="mb-6" />

      {sorted.length === 0 ? (
        <p className="text-mute text-sm font-mono">
          No members yet. When someone subscribes through Stripe, the webhook
          will populate this list.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="border-b border-rule">
                <Th>email</Th>
                <Th>status</Th>
                <Th>plan</Th>
                <Th>period end</Th>
                <Th>joined</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((m) => (
                <tr
                  key={`${m.email}-${m.created_at}`}
                  className="border-b border-rule/40 hover:bg-ink-1/40"
                >
                  <Td className="text-bone">{m.email}</Td>
                  <Td className={statusColor(m.status)}>{m.status}</Td>
                  <Td className="text-bone/80">{m.plan ?? "\u2014"}</Td>
                  <Td className="text-bone/70 tabular-nums">
                    {fmtDate(m.current_period_end)}
                  </Td>
                  <Td className="text-mute tabular-nums">
                    {fmtDate(m.created_at)}
                  </Td>
                </tr>
              ))}
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
