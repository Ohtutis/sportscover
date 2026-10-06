// The body of /free-proof, shared by the page and its per-sport twins (app/(marketing)/free-proof/for/[sport]).
// See app/(marketing)/free-proof/page.tsx for the page's history (v1–v5) and what it hands the form island.

import { IntakeForm } from "../../../../components/intake/IntakeForm";
import { IntakeHero } from "../../../../components/intake/IntakeHero";
import type { ProductTileData } from "../../../../components/intake/ProductPicker";
import type { SportChoiceData } from "../../../../components/intake/SportPicker";
import { FreeProofBandNote, FreeProofStepVisual } from "../../../../components/intake/SportVisuals";
import type { StyleTileData } from "../../../../components/intake/StylePicker";
import { SHOWCASE_SPORT } from "../../../../components/intake/model";
import { ProofPathBand } from "../../../../components/ProofPath";
import { assetOrNull } from "../../../../lib/assets";
import { block } from "../../../../lib/blocks";
import { toEtDate } from "../../../../lib/capacity";
import { sports } from "../../../../lib/catalog/sports";
import { styles } from "../../../../lib/catalog/styles";
import { PRODUCTS, optionPrice, optionPriceLabel, productFromLabel } from "../../../../lib/intake/products";
import { freeProofArtMap } from "../../../../lib/intake/sport-art";
import { sportPageSports } from "../../../../lib/seo/sport-facts";

function intakeProducts(): ProductTileData[] {
  return PRODUCTS.map((p) => ({
    key: p.key,
    name: p.name,
    blurb: p.blurb,
    fromLabel: productFromLabel(p),
    options: p.options.map((o) => ({ key: o.key, label: o.label, detail: o.detail, priceLabel: optionPriceLabel(o), printed: o.printed, price: optionPrice(o) })),
  }));
}

function intakeStyles(): StyleTileData[] {
  return styles.map((s) => ({ code: s.code, name: s.name, material: s.material }));
}

/** Step 1's chips: every catalog sport in roster order; the ones with their own /sports page first (`featured`). */
function intakeSports(): SportChoiceData[] {
  const featured = new Set(sportPageSports().map((s) => s.slug));
  return sports.map((s) => ({ slug: s.slug, name: s.name, featured: featured.has(s.slug) }));
}

/**
 * The whole page under the layout. `example` is the sport every picture shows until the parent picks one:
 * SHOWCASE_SPORT on /free-proof, the link's sport on a per-sport twin (so `?sport=basketball` paints basketball
 * from the first byte, never football first).
 */
export function FreeProofView({ example = SHOWCASE_SPORT }: { example?: string }) {
  const products = intakeProducts();
  const art = freeProofArtMap();
  const sportChoices = intakeSports();
  // The band's pictures 03–04 follow the shown sport (client islands); 01 (the fan of sports and finishes), 02
  // (the mix of phone photos) and 05 (the promise) are the band's own defaults on every page.
  const bandVisuals = [
    null,
    null,
    <FreeProofStepVisual key="03" step={2} art={art} example={example} />,
    <FreeProofStepVisual key="04" step={3} art={art} example={example} />,
    null,
  ];
  return (
    <>
      <div className="container-gallery">
        <IntakeHero art={art} example={example} sports={sportChoices} />
      </div>
      {/* The band's own top padding is the hero's bottom air; step 1 opens on its own rule right under it. */}
      <ProofPathBand flushBottom visuals={bandVisuals} after={<FreeProofBandNote art={art} example={example} />} />
      <div className="container-gallery pb-16 md:pb-24">
        <IntakeForm
          sports={sportChoices}
          art={art}
          example={example}
          products={products}
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
