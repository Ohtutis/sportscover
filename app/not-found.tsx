import type { Metadata } from "next";
import { NotFoundBody } from "../components/NotFoundBody";

export const metadata: Metadata = { title: "Not found", robots: { index: false, follow: false } };

/** The root 404. `NotFoundBody` reads the pathname, so an unknown `/c/<id>` gets the card variant (COPY §2.13). */
export default function NotFound() {
  return (
    <main id="main">
      <NotFoundBody />
    </main>
  );
}
