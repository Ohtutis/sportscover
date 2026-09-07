// `/` — the brand home, thirteen sections (DESIGN §5.1, COPY §2.1). Sections 01–03 stock,
// 04 arena, 05–12 stock; 13 is the navy footer, which the marketing layout renders.
import type { Metadata } from "next";
import { pageMeta } from "../../lib/seo/meta";
import { Families } from "./_home/Families";
import { Fears } from "./_home/Fears";
import { Finishes } from "./_home/Finishes";
import { Founder } from "./_home/Founder";
import { Hero } from "./_home/Hero";
import { Occasions } from "./_home/Occasions";
import { Photos } from "./_home/Photos";
import { Process } from "./_home/Process";
import { ProofBand } from "./_home/ProofBand";
import { ProofWall } from "./_home/ProofWall";
import { Registered } from "./_home/Registered";
import { Sports } from "./_home/Sports";

export const metadata: Metadata = pageMeta("/");

// ISR: the sale comparison (`isSaleActive`), the Christmas window and the order-by dates must not be
// frozen at build time — they have to move on their own, without a deploy (CONTRACTS §4.5).
export const revalidate = 3600;

export default function Home() {
  // GAPS #27: a registry miss comes back as /?miss=1#registry. The value is read in a client island
  // (LookupMiss) rather than from `searchParams` here — awaiting searchParams in a server page opts
  // the whole route out of prerendering, and this page is the LCP-critical one.
  const now = new Date();
  return (
    <>
      <Hero now={now} />
      <Fears />
      <Families now={now} />
      <ProofBand />
      <Registered />
      <Finishes />
      <Sports />
      <Process />
      <Photos />
      <ProofWall />
      <Founder />
      <Occasions now={now} />
    </>
  );
}
