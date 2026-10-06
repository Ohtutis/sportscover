// /free-proof/for/<sport> — never linked, never in the sitemap: the prerendered twin of /free-proof that
// next.config.ts rewrites `/free-proof?sport=<slug>` to (owner review 2026-10-07). The browser keeps the
// /free-proof?sport=… address; this page is /free-proof with that sport as the example, so a parent who
// arrives from a sport page or an ad sees THEIR sport's art in the first paint instead of the showcase sport
// swapping to theirs once the script loads. Metadata is /free-proof's own, canonical included.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { INTAKE_PATH } from "../../../../../lib/intake/copy";
import { freeProofSportSlugs } from "../../../../../lib/intake/sport-art";
import { pageMeta } from "../../../../../lib/seo/meta";
import { FreeProofView } from "../../_shared/view";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams(): { sport: string }[] {
  return freeProofSportSlugs().map((sport) => ({ sport }));
}

export const metadata: Metadata = pageMeta(INTAKE_PATH);

export default async function FreeProofForSportPage({ params }: { params: Promise<{ sport: string }> }) {
  const { sport } = await params;
  if (!freeProofSportSlugs().includes(sport)) notFound();
  return <FreeProofView example={sport} />;
}
