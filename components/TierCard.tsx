import { formatUsd, priceDisplay, type Tier } from "../lib/catalog/prices";
import type { CtaPairProps } from "../lib/cta";
import { CtaPair } from "./CtaPair";
import { DeliveryChips } from "./DeliveryChips";
import { Pill } from "./Pill";

/**
 * A rate card, not a picture (DESIGN §4.9): the Etsy variant name, the price as the loudest number
 * (Anton 2 rem), what's in the box, where it ships from, the one matching delivery chip, the CTA pair. No
 * media. Price only via priceDisplay(tier) — a "$" literal fails CI. A single item never shows a second
 * price (pricing v1, 2026-10-07: no "regular" price, no sale); a SET tier is a bundle of its two parts, so
 * it shows the parts' à-la-carte total struck through beside its price and one line, "Bundle: save $X" —
 * the comparison is always the same items bought separately. The card is a column whose delivery chip and CTA
 * are pinned to the bottom as one block: while the chip sat directly under the box list, a printed
 * tier left 54 px of dead space between it and the CTA. The FEATURED pill is inset to the card's own
 * 24 px padding, not to the border.
 *
 * Two buttons (D29: "Get a free proof →" and the outline "Also on Etsy →") are stacked full width:
 * at 768 px a three-tier row leaves 176 px inside each card, and the pair side by side needs 327.
 */
export interface TierCardProps {
  tier: Tier;
  /** boxContents(sku) from lib/catalog/tiers.ts. */
  box: string[];
  /** shipsFromFor(sku) from lib/catalog/shipping.ts. */
  shipsFrom: string;
  /** chipSegment(kind) from lib/catalog/delivery.ts (GAPS #23). */
  chip: string;
  cta: CtaPairProps;
  id?: string;
  sportCode?: string;
  className?: string;
}

const LABEL = "font-label text-label font-semibold uppercase tracking-[0.12em] text-muted-text";

export function TierCard({ tier, box, shipsFrom, chip, cta, id, sportCode, className = "" }: TierCardProps) {
  const domId = id ?? `tier-${tier.sku}`;
  const price = priceDisplay(tier);
  const bundle = price.bundle && price.bundle.discount > 0 ? price.bundle : null;
  return (
    <article
      id={domId}
      aria-labelledby={`${domId}-name`}
      data-sku={tier.sku}
      data-sport-code={sportCode}
      className={`relative flex flex-col rounded-ui border bg-stock p-6 transition-[border-color] duration-hover ease-out hover:border-ink ${tier.featured ? "border-ink ring-1 ring-ink" : "border-hairline"} ${className}`.trim()}
    >
      {tier.featured ? (
        <Pill tone="accent" className="absolute -top-3 left-6">
          FEATURED
        </Pill>
      ) : null}
      <h3 id={`${domId}-name`} className="font-display text-h3 uppercase">
        {tier.name}
      </h3>
      <p className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-price tabular-nums">
          <span className="sr-only">{bundle ? "Bundle price " : "Price "}</span>
          {formatUsd(price.current)}
        </span>
        {bundle ? (
          <s data-tier-separately="" className="font-body text-base font-medium tabular-nums text-muted-text">
            <span className="sr-only">Bought separately </span>
            {formatUsd(bundle.alaCarte)}
          </s>
        ) : null}
      </p>
      {bundle ? (
        <p data-tier-saving="" className="mt-1 font-body text-small font-bold text-ink">
          Bundle: save {formatUsd(bundle.discount)} vs. buying separately
        </p>
      ) : null}
      {/*
        `grow` on the table, not on the space above the CTA (layout audit, 2026-09-08). The cards are
        stretched to one height, so the shortest ladder rung had to absorb the difference somewhere:
        with the slack sitting between the table and the chip it read as a 78–115 px hole punched into
        the featured card. Inside the ruled block it is the table's own last row, every card's bottom
        rule lands on one line, and the chip and CTA still sit on one baseline across the ladder.
      */}
      <dl className="mt-6 grow divide-y divide-hairline border-y border-hairline">
        <div className="py-3">
          <dt className={LABEL}>What&apos;s in the box</dt>
          <dd className="mt-2">
            <ul className="space-y-1 font-body text-[0.9375rem] text-ink">
              {box.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="py-3">
          <dt className={LABEL}>Ships from</dt>
          <dd className="mt-2 font-body text-small text-muted-text">{shipsFrom}</dd>
        </div>
      </dl>
      <div className="mt-auto pt-6">
        <DeliveryChips kind="standard" items={[chip]} />
        <CtaPair {...cta} stack={Boolean(cta.secondary)} className="mt-4" />
      </div>
    </article>
  );
}
