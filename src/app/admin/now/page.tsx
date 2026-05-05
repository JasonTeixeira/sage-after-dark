/**
 * /admin/now — edit the /now status row.
 */

import { Display, Lead, Tactical, Hr } from "@/components";
import { getNowStatus } from "@/lib/living";
import { NOW } from "@/content/site-data";
import { NowEditForm } from "./now-form";

export const dynamic = "force-dynamic";

export default async function AdminNowPage() {
  const live = await getNowStatus().catch(() => null);
  const initial = {
    status: live?.status ?? NOW.status,
    location: live?.location ?? NOW.location,
    this_week: (live?.this_week?.length ? live.this_week : NOW.this_week).join(
      "\n",
    ),
    not_doing: (live?.not_doing?.length ? live.not_doing : NOW.not_doing).join(
      "\n",
    ),
    updated_at: live?.updated_at ?? NOW.updated,
  };
  const days = Math.floor(
    (Date.now() - new Date(initial.updated_at).getTime()) / 86_400_000,
  );

  return (
    <div>
      <header className="mb-8">
        <Tactical className="text-cyan mb-3 block">// edit /now</Tactical>
        <Display className="mb-3">Edit /now</Display>
        <Lead>
          The contract with the reader is that this page is current. Last
          updated {days}d ago.
          {days > 14 && (
            <span className="text-ember"> &middot; STALE — refresh it</span>
          )}
        </Lead>
      </header>

      <Hr className="mb-8" />

      <NowEditForm initial={initial} />
    </div>
  );
}
