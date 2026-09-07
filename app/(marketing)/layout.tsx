import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { ReactNode } from "react";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

/**
 * Every stock page: header, `main#main` (the skip-link target), navy footer.
 *
 * Analytics live HERE and not in the root layout: /privacy promises that a card page carries no
 * trackers, and a beacon on /c would report the card ID in the URL. The registry group stays clean.
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
