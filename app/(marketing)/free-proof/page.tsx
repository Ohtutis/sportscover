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
// card: it is what ticking cards and a poster together does, said in one computed line under the cards.
//
// v4 (owner review 2026-10-06, evening: "mixing sports is not cool"): step 1 is THEIR SPORT, and every
// athlete picture on the page — the hero proof, the how-it-works pictures, the product and style tiles,
// the live preview — shows the chosen sport, or the grey set before one is chosen. The parent's own
// photos are always grey "your photo" prints drawn in code. Six steps; no quantity; no marketing consent.
//
// This server page hands the form island everything it must not compute in the browser: every price
// label AND the number behind it (lib/intake/products.ts helpers + prices.ts sitePrice, so a sale boundary
// can never make the client disagree with the server), the Complete Set tiers as option pairs, the set
// line's "save from" figure (from the ladder only), the per-sport art map (lib/intake/sport-art.ts —
// resolved here so lib/assets.ts never reaches a client bundle), the sport choices with the nine that
// have their own pages marked, the two example photos, C5 from content/blocks and today's ET date. The
// ?sport=…&product=… prefill is read by the island inside its own Suspense boundary, so this route stays
// static (revalidated hourly like every other priced page): its HTML is the grey set, and the chosen
// sport's art arrives on the client into boxes of fixed size.

import type { Metadata } from "next";
import { IntakeForm } from "../../../components/intake/IntakeForm";
import { IntakeHero } from "../../../components/intake/IntakeHero";
import { minSetSaving, type SetCombo } from "../../../components/intake/model";
import type { ProductTileData, SetTileData } from "../../../components/intake/ProductPicker";
import type { SportChoiceData } from "../../../components/intake/SportPicker";
import { FreeProofBandNote, FreeProofStepVisual } from "../../../components/intake/SportVisuals";
import type { StyleTileData } from "../../../components/intake/StylePicker";
import { ProofPathBand } from "../../../components/ProofPath";
import { assetOrNull } from "../../../lib/assets";
import { block } from "../../../lib/blocks";
import { toEtDate } from "../../../lib/capacity";
import { formatUsd, getTier, sitePrice } from "../../../lib/catalog/prices";
import { sports } from "../../../lib/catalog/sports";
import { styles } from "../../../lib/catalog/styles";
import { SET_TIER_OPTIONS } from "../../../lib/cta";
import { INTAKE_COPY, INTAKE_PATH } from "../../../lib/intake/copy";
import { PRICE_ON_PROOF, PRODUCTS, optionPriceLabel, productFromLabel } from "../../../lib/intake/products";
import { freeProofArtMap } from "../../../lib/intake/sport-art";
import { pageMeta } from "../../../lib/seo/meta";
import { sportPageSports } from "../../../lib/seo/sport-facts";

export const revalidate = 3600;

/** The titles table is the one metadata source (lib/seo/titles.ts row D29). */
export const metadata: Metadata = pageMeta(INTAKE_PATH);

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

/** The set line under the four product cards: the smallest saving a set tier gives, and the tiers themselves. */
function intakeSetTile(products: ProductTileData[], combos: SetCombo[]): SetTileData {
  const saved = minSetSaving(products, combos);
  return { pickLine: saved === null ? null : INTAKE_COPY.setNote.pick(formatUsd(saved)), combos };
}

function intakeStyles(): StyleTileData[] {
  return styles.map((s) => ({ code: s.code, name: s.name, material: s.material }));
}

/** Step 1's chips: every catalog sport in roster order; the ones with their own /sports page first (`featured`). */
function intakeSports(): SportChoiceData[] {
  const featured = new Set(sportPageSports().map((s) => s.slug));
  return sports.map((s) => ({ slug: s.slug, name: s.name, featured: featured.has(s.slug) }));
}

export default function FreeProofPage() {
  const products = intakeProducts();
  const combos = setCombos();
  const art = freeProofArtMap();
  // The band's pictures 01 and 03 follow the chosen sport (client islands); 02 (the grey "your photo"
  // prints) and 04 (the tick) are the band's own defaults.
  const bandVisuals = [<FreeProofStepVisual key="01" step={0} art={art} />, null, <FreeProofStepVisual key="03" step={2} art={art} />, null];
  return (
    <>
      <div className="container-gallery">
        <IntakeHero art={art} />
      </div>
      {/* The band's own top padding is the hero's bottom air; step 1 opens on its own rule right under it. */}
      <ProofPathBand flushBottom visuals={bandVisuals} after={<FreeProofBandNote art={art} />} />
      <div className="container-gallery pb-16 md:pb-24">
        <IntakeForm
          sports={intakeSports()}
          art={art}
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
    </>
  );
}
