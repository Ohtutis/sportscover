"use client";

import { useSearchParams } from "next/navigation";
import { LookupStatus } from "./LookupForm";

/**
 * Renders the lookup status line from the `miss` search param on the client, so a page carrying a
 * lookup form still prerenders as static HTML. A server component that awaited `searchParams` would
 * opt the whole route out of static generation (Next 16 without Cache Components), which cost the
 * home page and the three family pages their prerender. Wrap this in <Suspense>.
 */
export function LookupMiss({ tone = "stock" }: { tone?: "stock" | "arena" }) {
  const miss = useSearchParams().get("miss") ?? undefined;
  return <LookupStatus miss={miss} tone={tone} />;
}
