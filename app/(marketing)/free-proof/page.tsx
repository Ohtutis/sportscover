// /free-proof — the page a Meta ad lands on (owner decision 2026-10-04): choose what to make, send
// 4–10 photos, get a free watermarked proof; pay only after approving it, by secure payment link or on
// Etsy. One page, one long form, one submit — no wizard, no account, no payment on the site.
//
// v2 (owner design review 2026-10-04): a landing hero with one CTA that glides to step 1, four
// how-it-works cards, then the configurator — five numbered steps, the permissions panel, the conversion
// card — beside a sticky "Your order" panel. The page container is the gallery width (DESIGN §2.1: hero,
// product hero) so the steps keep their room beside the panel; every paragraph still stops at 60–62ch.
//
// v3 (owner review 2026-10-06): the hero is two columns — the copy, and the real watermarked proof with
// the phone photos it came from — and the four cards are the site's shared `ProofPathBand` (each with its
// picture), the same band every money page carries under its hero. The set is no longer a fifth product
// card. Pricing v1 (2026-10-07): any two or more products are a bundle — the ladder under the cards and
// "Your order" price it through prices.ts bundleTotal, the same function that prices the set tiers.
//
// v4 (owner review 2026-10-06, evening: "mixing sports is not cool"): step 1 is THEIR SPORT, and every
// athlete picture on the page — the hero proof, the how-it-works pictures, the product and style tiles,
// the live preview — shows the chosen sport. Six steps; no quantity; no marketing consent.
//
// v5 (owner review 2026-10-07: "too many faceless grey cards until you pick a sport — hook with the visuals at
// once, sell the idea that THEIR child ends up on the poster"): before a choice every picture shows ONE example
// sport's real art (SHOWCASE_SPORT), and the hero's "your photos" are that athlete's own phone photos — phone
// photos in, proof out. A link that names a sport (`/free-proof?sport=basketball`, every sport page's CTA and
// the ads) is rewritten in next.config.ts to its per-sport twin, app/(marketing)/free-proof/for/[sport], which is
// this page prerendered with that sport as the example, so the first paint is already their sport.
//
// This server page hands the form island everything it must not compute in the browser: every price
// label AND the number behind it (lib/intake/products.ts helpers over prices.ts — the island bundles those
// numbers, it never reads a ladder), the per-sport art map (lib/intake/sport-art.ts —
// resolved here so lib/assets.ts never reaches a client bundle), the sport choices with the nine that
// have their own pages marked, the two example photos, C5 from content/blocks and today's ET date. The
// ?sport=…&product=… prefill is read by the island inside its own Suspense boundary, so this route stays
// static (revalidated hourly like every other priced page): its HTML is the example sport, and a sport
// chosen on the page swaps in on the client into boxes of fixed size.

import type { Metadata } from "next";
import { INTAKE_PATH } from "../../../lib/intake/copy";
import { pageMeta } from "../../../lib/seo/meta";
import { FreeProofView } from "./_shared/view";

export const revalidate = 3600;

/** The titles table is the one metadata source (lib/seo/titles.ts row D29). */
export const metadata: Metadata = pageMeta(INTAKE_PATH);

export default function FreeProofPage() {
  return <FreeProofView />;
}
