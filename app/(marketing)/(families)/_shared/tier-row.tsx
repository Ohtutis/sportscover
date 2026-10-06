import { TierCard } from "../../../../components/TierCard";
import { ctaFor, type CtaContext } from "../../../../lib/cta";
import { chipSegment, type ChipKind } from "../../../../lib/catalog/delivery";
import { skuFor, tiersFor, type Family, type Tier } from "../../../../lib/catalog/prices";
import { shipsFromFor } from "../../../../lib/catalog/shipping";
import { boxContents } from "../../../../lib/catalog/tiers";
import type { Sport } from "../../../../lib/catalog/sports";

/**
 * The ladder (DESIGN §5.2 row B): the family's four tiers in price order, rendering only the enabled
 * ones — the sealed pack, the 30 × 40 XL and the Ultimate set stay hidden until their tier flips
 * (GAPS #12). Prices come from `priceDisplay()` inside `TierCard` (a set tier's is the bundle of its two
 * parts, shown with the parts' total struck through); the row itself never types a number.
 * `CapacityNote` is deliberately not mounted (GAPS #13): one delivery claim per page.
 */
export const CERTIFICATE_LINE = "Free printed Certificate of Authenticity in every shipped package.";

/** Which segment of the standard delivery chip a tier carries (GAPS #23). */
export function chipKindFor(tier: Tier): ChipKind {
  if (!tier.physical) return "digital";
  return tier.tierKey === "PACK" || tier.tierKey === "ULT" ? "pack" : "prints";
}

export interface TierRowProps {
  family: Family;
  /** The CTA context this family uses (`cards` | `posters` | `set`). */
  context: CtaContext;
  /** The sport the picker selected — its code builds every per-tier SKU. */
  sport: Sport;
  className?: string;
}

export function TierRow({ family, context, sport, className = "" }: TierRowProps) {
  const visible = tiersFor(family, true).filter((tier) => tier.enabled);
  /*
    The ladder never orphans a tier (DESIGN §2.2: "Never an empty slot"). `md:grid-cols-2` used to be
    hard-coded, so at 768–1023 three tiers set as 2 + 1: two 377 px cards in row 1 and the third alone
    in row 2 beside a 377 × 634 hole, 78 px shorter than its neighbours (layout audit, 2026-09-08). The
    column count now follows the tier count all the way down: three tiers go three across from `md`,
    four tiers keep the 2 → 4 step because four 176 px cards do not fit a 768 px page.
  */
  const columns = visible.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";
  return (
    <div className={className || undefined}>
      {/*
        A snap scroller under `md`, a grid above it (DESIGN §2.6). Three stacked TierCards were ~1 600 px
        of the 3 320 px `/trading-cards` hero band on a 390 px phone — four screens before the buyer
        reached section 02 (owner review, 2026-09-07). Side by side they are one screen and the price
        ladder reads as a ladder.
      */}
      <ul className={`-mx-5 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto scroll-pl-5 px-5 pb-2 md:mx-0 md:grid md:overflow-visible md:px-0 ${columns}`}>
        {visible.map((tier) => {
          const sku = skuFor(tier.sku, sport.code);
          // The tier's own SKU and the picker's sport: in free-proof mode (D29) the primary opens
          // /free-proof with this product, this option and this sport prefilled, and the outline
          // "Also on Etsy →" opens this tier's listing. With Etsy as the primary (both flags off) the
          // card keeps one button — the registry lookup has no place on a rate card.
          const pair = ctaFor(context, { sku, sport: sport.slug });
          const cta = pair.secondary?.kind === "etsy" ? pair : { primary: pair.primary, tone: pair.tone };
          return (
            <li key={tier.sku} className="flex w-[82vw] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none">
              <TierCard
                tier={tier}
                box={boxContents(tier.sku)}
                shipsFrom={shipsFromFor(sku)}
                chip={chipSegment(chipKindFor(tier))}
                cta={cta}
                sportCode={sport.code}
                className="w-full"
              />
            </li>
          );
        })}
      </ul>
      <p className="mt-8 max-w-[62ch] font-body font-medium text-ink">{CERTIFICATE_LINE}</p>
    </div>
  );
}
