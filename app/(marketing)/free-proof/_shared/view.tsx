// The body of /free-proof, shared by the page and its per-sport twins (app/(marketing)/free-proof/for/[sport]).
// See app/(marketing)/free-proof/page.tsx for the page's history (v1–v8) and what it hands the form island.
//
// v8 order (the ads landing brief, 2026-10-07): hero (the result) → the three-beat strip → the form, at once,
// under its own heading → then, for the reader who wants more before sending: the how-it-works band, the
// before → after examples, the six trust lines, the FAQ, and the closing CTA back up to the form. On a phone
// a sticky bar carries the CTA while the form is out of view.

import { Examples } from "../../../../components/intake/Examples";
import { FinalCta } from "../../../../components/intake/FinalCta";
import { IntakeForm } from "../../../../components/intake/IntakeForm";
import { IntakeHero } from "../../../../components/intake/IntakeHero";
import type { ProductTileData } from "../../../../components/intake/ProductPicker";
import { ProofStrip } from "../../../../components/intake/ProofStrip";
import type { SportChoiceData } from "../../../../components/intake/SportPicker";
import { FreeProofBandNote, FreeProofStepVisual } from "../../../../components/intake/SportVisuals";
import { StickyCta } from "../../../../components/intake/StickyCta";
import type { StyleTileData } from "../../../../components/intake/StylePicker";
import { TrustGrid } from "../../../../components/intake/TrustGrid";
import { SHOWCASE_SPORT } from "../../../../components/intake/model";
import { FaqList } from "../../../../components/FaqList";
import { ProofPathBand } from "../../../../components/ProofPath";
import { assetOrNull } from "../../../../lib/assets";
import { block } from "../../../../lib/blocks";
import { toEtDate } from "../../../../lib/capacity";
import { faqSubset } from "../../../../lib/catalog/faq";
import { sports } from "../../../../lib/catalog/sports";
import { styles } from "../../../../lib/catalog/styles";
import { INTAKE_COPY } from "../../../../lib/intake/copy";
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
  // Only the band's 04 (the proof sheet) follows the shown sport (a client island); 01 (the fan of sports and
  // finishes), 02 (the mix of phone photos), 03 (the two likeness packs) and 05 (the promise) are the band's own
  // defaults on every page.
  const bandVisuals = [null, null, null, <FreeProofStepVisual key="04" step={3} art={art} example={example} />, null];
  const intro = INTAKE_COPY.formIntro;
  return (
    <>
      <div className="container-gallery">
        <IntakeHero art={art} example={example} />
        <ProofStrip className="mt-12 md:mt-16" />
      </div>

      {/* The form, at once (ads brief §4): its own heading is where every CTA on the page lands. */}
      <div className="container-gallery pb-16 md:pb-24">
        <section id="create" aria-labelledby="create-title" className="scroll-mt-20 pt-12 md:pt-16 lg:scroll-mt-24">
          <h2 id="create-title" tabIndex={-1} data-step-focus="" className="max-w-[16ch] font-display text-display uppercase text-balance">
            {intro.title}
          </h2>
          <p className="mt-4 max-w-[46ch] font-body text-[1.125rem] font-bold text-pretty md:text-sub">{intro.line}</p>
        </section>
        <div id="free-proof-form">
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
      </div>

      {/* For the reader who wants more before sending (ads brief §8–§13), after the form, never before it. */}
      <ProofPathBand id="how-it-works" flushBottom visuals={bandVisuals} after={<FreeProofBandNote art={art} example={example} />} />
      <div className="container-gallery">
        <Examples art={art} />
        <TrustGrid />
        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 py-16 md:py-20 lg:py-24 lg:scroll-mt-24">
          <h2 id="faq-title" className="max-w-[16ch] font-display text-h2 uppercase text-balance">
            {INTAKE_COPY.faqTitle}
          </h2>
          <FaqList items={faqSubset("free-proof")} jsonLd id="faq-list" headingLevel={3} className="mt-8" />
        </section>
        <FinalCta />
      </div>
      <StickyCta />
    </>
  );
}
