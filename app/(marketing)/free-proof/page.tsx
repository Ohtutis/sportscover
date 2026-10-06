// /free-proof — the page a Meta ad lands on (owner decision 2026-10-04): choose what to make, send
// 4–10 photos, get a free watermarked proof; pay only after approving it, by secure payment link or on
// Etsy. One page, one long form, one submit — no wizard, no account, no payment on the site.
//
// v2 (owner design review 2026-10-04): a landing hero with one CTA that glides to step 1, four
// how-it-works cards, then the configurator — five numbered steps, the permissions panel, the conversion
// card — beside a sticky "Your order" panel. The page container is the gallery width (DESIGN §2.1: hero,
// product hero) so the steps keep their room beside the panel; every paragraph still stops at 60–62ch.
//
// This server page hands the form island everything it must not compute in the browser: every price
// label AND the number behind it (lib/intake/products.ts helpers + prices.ts sitePrice, so a sale boundary
// can never make the client disagree with the server), the Complete Set tiers as option pairs, the set
// card's saving (from the ladder only), the finish card faces and the two example photos (lib/assets.ts),
// C5 from content/blocks and today's ET date. The ?product=… prefill is read by the island inside its own
// Suspense boundary, so this route stays static (revalidated hourly like every other priced page).

import type { Metadata } from "next";
import { IntakeForm } from "../../../components/intake/IntakeForm";
import { HowItWorks, IntakeHero } from "../../../components/intake/IntakeHero";
import { setSaving, type SetCombo } from "../../../components/intake/model";
import type { ProductTileData, SetTileData } from "../../../components/intake/ProductPicker";
import type { StyleTileData } from "../../../components/intake/StylePicker";
import { asset, assetOrNull, hasAsset, type ImageSpec } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { toEtDate } from "../../../lib/capacity";
import { formatUsd, getTier, sitePrice } from "../../../lib/catalog/prices";
import { styles } from "../../../lib/catalog/styles";
import { SET_TIER_OPTIONS } from "../../../lib/cta";
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

/** An option's site price, from its tier — null when the option has no tier yet (the blanket). */
const optionPrice = (sku: string | undefined): number | null => {
  const tier = sku ? getTier(sku) : undefined;
  return tier ? sitePrice(tier) : null;
};

function intakeProducts(): ProductTileData[] {
  return PRODUCTS.map((p) => ({
    key: p.key,
    name: p.name,
    blurb: p.blurb,
    fromLabel: productFromLabel(p) ?? PRICE_ON_PROOF,
    image: productImage(p.key),
    options: p.options.map((o) => ({ key: o.key, label: o.label, detail: o.detail, priceLabel: optionPriceLabel(o), printed: o.printed, price: optionPrice(o.sku) })),
  }));
}

/** The enabled Complete Set tiers as the (cards option, poster option) pairs lib/cta.ts maps them to, with their site prices. */
function setCombos(): SetCombo[] {
  return Object.entries(SET_TIER_OPTIONS).flatMap(([sku, option]) => {
    const tier = getTier(sku);
    if (!tier || !tier.enabled) return [];
    const cards = typeof option === "string" ? option : option.cards;
    const poster = typeof option === "string" ? option : option.poster;
    return cards && poster ? [{ cards, poster, price: sitePrice(tier) }] : [];
  });
}

function intakeSetTile(products: ProductTileData[], combos: SetCombo[]): SetTileData {
  const saved = setSaving(products, combos);
  const t = INTAKE_COPY.setTile;
  return {
    name: t.name,
    blurb: t.blurb,
    fromLabel: setFromLabel(),
    badge: t.badge,
    savingsLine: saved === null ? null : t.savingsLine(formatUsd(saved)),
    images: { cards: productImage("cards"), poster: productImage("poster") },
  };
}

function intakeStyles(): StyleTileData[] {
  return styles.map((s) => ({ code: s.code, name: s.name, material: s.material, image: styleImage(s.code) }));
}

export default function FreeProofPage() {
  const products = intakeProducts();
  const combos = setCombos();
  return (
    <div className="container-gallery pb-16 md:pb-24">
      <IntakeHero />
      <HowItWorks className="mt-12 md:mt-16" />
      <IntakeForm
        className="mt-10 md:mt-14"
        products={products}
        setTile={intakeSetTile(products, combos)}
        setCombos={combos}
        styles={intakeStyles()}
        photosSubhead={block("photos-that-work-best")}
        examples={{ good: assetOrNull("intake.example.good"), bad: assetOrNull("intake.example.bad") }}
        todayIso={toEtDate(new Date())}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
      />
    </div>
  );
}
