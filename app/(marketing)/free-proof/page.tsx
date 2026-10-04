// /free-proof — the page a Meta ad lands on (owner decision 2026-10-04): choose what to make, send
// 4–10 photos, get a free watermarked proof; pay only after approving it, by secure payment link or on
// Etsy. One page, one long form, one submit — no wizard, no account, no payment on the site.
//
// This server page renders the stock hero and hands the form island everything it must not compute in
// the browser: every price label (lib/intake/products.ts helpers, so a sale boundary can never make the
// client disagree with the server), the finish card faces (lib/assets.ts), C5 from content/blocks and
// today's ET date. The ?product=… prefill is read by the island inside its own Suspense boundary, so this
// route stays static (revalidated hourly like every other priced page).

import type { Metadata } from "next";
import { IntakeForm } from "../../../components/intake/IntakeForm";
import { IntakeHero } from "../../../components/intake/IntakeHero";
import { setLineWithPrice, splitSetSentence } from "../../../components/intake/model";
import type { ProductTileData } from "../../../components/intake/ProductPicker";
import type { StyleTileData } from "../../../components/intake/StylePicker";
import { asset, hasAsset, type ImageSpec } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { toEtDate } from "../../../lib/capacity";
import { styles } from "../../../lib/catalog/styles";
import { INTAKE_COPY, INTAKE_PATH } from "../../../lib/intake/copy";
import { PRICE_ON_PROOF, PRODUCTS, optionPriceLabel, productFromLabel, setFromLabel } from "../../../lib/intake/products";
import { pageMeta } from "../../../lib/seo/meta";

export const revalidate = 3600;

/** The titles table is the one metadata source (lib/seo/titles.ts row D29). */
export const metadata: Metadata = pageMeta(INTAKE_PATH);

/** `product.<key>` images arrive from lib/assets.ts; a missing or still-`locate` key renders the typographic tile. */
const productImage = (key: string): ImageSpec | null => (hasAsset(`product.${key}`) ? asset(`product.${key}`) : null);

/** The seven style tiles: the six finishes on one fictional athlete, and the Senior Night edition. */
const styleImage = (code: string): ImageSpec => asset(code === "SR" ? "finish.SR.tile" : `finish.${code}.front`);

function intakeProducts(): ProductTileData[] {
  return PRODUCTS.map((p) => ({
    key: p.key,
    name: p.name,
    blurb: p.blurb,
    fromLabel: productFromLabel(p) ?? PRICE_ON_PROOF,
    image: productImage(p.key),
    options: p.options.map((o) => ({ key: o.key, label: o.label, detail: o.detail, priceLabel: optionPriceLabel(o), printed: o.printed })),
  }));
}

function intakeStyles(): StyleTileData[] {
  return styles.map((s) => ({ code: s.code, name: s.name, material: s.material, image: styleImage(s.code) }));
}

export default function FreeProofPage() {
  const { lead, set } = splitSetSentence(INTAKE_COPY.sections.products.subhead);
  return (
    <div className="container-site pb-16 md:pb-24">
      <IntakeHero />
      <IntakeForm
        products={intakeProducts()}
        styles={intakeStyles()}
        productsLead={lead}
        setLine={setLineWithPrice(set, setFromLabel())}
        photosSubhead={block("photos-that-work-best")}
        todayIso={toEtDate(new Date())}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
      />
    </div>
  );
}
