import type { Metadata } from "next";
import { NotFoundBody } from "../components/NotFoundBody";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = { title: "Not found", robots: { index: false, follow: false } };

/**
 * The root 404. `NotFoundBody` reads the pathname, so an unknown `/c/<id>` gets the card variant (COPY
 * §2.13). It renders OUTSIDE the marketing route group, so it used to ship with no header, no nav and
 * no footer: a dead end with two buttons and no way back into the site (audit 2026-09-08, S11). DESIGN
 * §4.20 puts the footer on every page, `/c` included, so both are rendered here.
 */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <NotFoundBody />
      </main>
      <SiteFooter />
    </>
  );
}
