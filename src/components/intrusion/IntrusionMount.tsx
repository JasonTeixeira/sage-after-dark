"use client";

import dynamic from "next/dynamic";
import type { EssayMeta } from "./Terminal";

const IntrusionRoot = dynamic(
  () => import("./IntrusionRoot").then((m) => m.IntrusionRoot),
  { ssr: false },
);

export function IntrusionMount({ essays }: { essays: EssayMeta[] }) {
  return <IntrusionRoot essays={essays} />;
}
