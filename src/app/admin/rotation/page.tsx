/**
 * /admin/rotation — list rotation items grouped by kind, with add + deactivate.
 */

import { Display, Lead, Tactical, Hr } from "@/components";
import { adminListRotationAll } from "@/lib/living";
import { RotationManager } from "./rotation-manager";

export const dynamic = "force-dynamic";

export default async function AdminRotationPage() {
  const items = await adminListRotationAll().catch(() => []);

  return (
    <div>
      <header className="mb-8">
        <Tactical className="text-cyan mb-3 block">// rotation</Tactical>
        <Display className="mb-3">Rotation items</Display>
        <Lead>
          Books, music, films, listening, watching, reading. Active rows feed
          /now, /taste, /reading. Deactivated rows are kept for history.
        </Lead>
      </header>

      <Hr className="mb-8" />

      <RotationManager initial={items} />
    </div>
  );
}
