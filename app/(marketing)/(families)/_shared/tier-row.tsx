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
 * (GAPS #12). Prices come from `priceDisplay()` inside `TierCard`; the row itself never types a number.
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
  now: Date;
  className?: string;
}

export function TierRow({ family, context, sport, now, className = "" }: TierRowProps) {
  const visible = tiersFor(family, true).filter((tier) => tier.enabled);
  const columns = visible.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
  return (
    <div className={className || undefined}>
      <div className={`grid gap-4 md:grid-cols-2 ${columns}`}>
        {visible.map((tier) => {
          const sku = skuFor(tier.sku, sport.code);
          const pair = ctaFor(context, { sku, sport: sport.slug });
          // One button per tier in F1 ("Order on Etsy →"); when the site sells direct the outline
          // "Also on Etsy →" comes back with it, so the ladder never loses the marketplace link.
          const cta = pair.secondary?.kind === "etsy" ? pair : { primary: pair.primary, tone: pair.tone };
          return (
            <TierCard
              key={tier.sku}
              tier={tier}
              now={now}
              box={boxContents(tier.sku)}
              shipsFrom={shipsFromFor(sku)}
              chip={chipSegment(chipKindFor(tier))}
              cta={cta}
              sportCode={sport.code}
            />
          );
        })}
      </div>
      <p className="mt-6 max-w-[62ch] font-body font-medium text-ink">{CERTIFICATE_LINE}</p>
    </div>
  );
}
