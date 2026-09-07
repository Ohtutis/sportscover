import type { ReactNode } from "react";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

/**
 * The `/c/[cardId]` route group: arena end to end (DESIGN §2.4), the slim arena header (silver
 * shield, white wordmark, REGISTERED EDITION pill, no shop CTAs) and the navy imprint footer. The
 * page renders its own privacy-and-control lines (Report / Manage) at the end of `children`, right
 * above the footer; the finish font pair is applied by the page on its own wrapper.
 */
export default function RegistryLayout({ children }: { children: ReactNode }) {
  return (
    <div data-surface="arena" className="flex min-h-svh flex-col">
      <SiteHeader tone="arena" />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
