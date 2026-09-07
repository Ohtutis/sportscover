// 01b · The strip under the hero (owner review, 2026-09-07). He asked for the price and the delivery
// clock to come OUT of the hero and sit lower down, and pointed at a reference whose hero is followed
// immediately by a full-width band of big figures with small labels. This is that band.
//
// Four figures, none of them typed: the price comes from the ladder, the two clocks from
// `lib/catalog/delivery.ts`, the counts from the sport and style catalogs. The fourth is the promise
// the whole business runs on, and it is the one cell with no number in it.
//
// The band also carries the trust line (C14). It is the last element of the hero's CTA block — the
// block simply ends here rather than above the fold, which is what "the hero must be much cleaner"
// bought us.
import { TrustLine } from "../../../components/TrustLine";
import { LEAD_TIMES } from "../../../lib/catalog/delivery";
import { formatUsd, fromPrice } from "../../../lib/catalog/prices";
import { sports } from "../../../lib/catalog/sports";
import { finishes } from "../../../lib/catalog/styles";

export interface StripCell {
  /** The big Anton figure. */
  figure: string;
  /** The small line under it. */
  label: string;
}

/**
 * The cells, left to right. `now` is the page's own clock (the page is ISR): the sale price has to be
 * able to expire without a deploy, so the figure is computed per render, never at build time.
 */
export function stripCells(now: Date): StripCell[] {
  const [digitalMin, digitalMax] = LEAD_TIMES.digitalBusinessDays;
  const [shipMin, shipMax] = LEAD_TIMES.printShipBusinessDays;
  return [
    { figure: `from ${formatUsd(fromPrice("cards", now))}`, label: "digital edition" },
    { figure: `${digitalMin}–${digitalMax} days`, label: `digital files · prints ship in ${shipMin}–${shipMax}` },
    { figure: `${sports.length} sports · ${finishes.length} finishes`, label: "plus the Senior Night edition" },
    { figure: "Proof first", label: "nothing prints until you approve" },
  ];
}

/**
 * 2 × 2 on a phone, one row of four from `lg`. Every cell rules along its top and its left edge, and
 * the first cell of a row rules only along its top — so the band reads as one ruled table at both
 * layouts without an empty dividing column.
 */
const CELL = [
  "pr-5 lg:pr-8",
  "border-l pl-5 lg:pr-8",
  "pr-5 lg:border-l lg:pl-8 lg:pr-8",
  "border-l pl-5 lg:pl-8",
] as const;

export function HeroStrip({ now }: { now: Date }) {
  const cells = stripCells(now);
  return (
    <div className="pb-10 lg:pb-16">
      <div className="container-gallery">
        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {cells.map((cell, i) => (
            <div key={cell.label} className={`border-t border-hairline py-5 ${CELL[i % CELL.length]}`}>
              {/* Two lines reserved: the counts cell always wraps at four across, and a ragged row of
                  labels reads as a mistake. */}
              <dt className="min-h-[2em] font-display text-[1.5rem] uppercase leading-none tabular-nums text-balance sm:text-[1.75rem] lg:text-[2rem]">
                {cell.figure}
              </dt>
              <dd className="mt-2 font-body text-small text-muted-text text-pretty">{cell.label}</dd>
            </div>
          ))}
        </dl>
        <TrustLine className="mt-6" />
      </div>
    </div>
  );
}
