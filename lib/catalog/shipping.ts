// Where each package ships from, and when (CONTRACTS §4.6; rows verbatim from COPY §2.7 (2)).
// Partner names are the descriptive names declared to Etsy as Production Partners
// (docs/SUPPLIERS.md, C19) — never a company name on the site. Carrier and packaging cells carry
// "(per lab)" until the first tracked shipment is observed: no test order has been placed.

import { CANON } from "../copy/canon";
import { LEAD_TIMES } from "./delivery";
import { getTier } from "./prices";

export type PartnerKey = "cards" | "posters" | "pack";

export interface Partner {
  key: PartnerKey;
  /** C19, verbatim. */
  name: string;
  /** What the partner prints (COPY §2.6 (6)). */
  makes: string;
  /** The place part of the name, for the compact "Santa Cruz CA · Charlotte NC" form. */
  city: string;
}

export const PARTNERS: Partner[] = [
  { key: "cards", name: CANON.partners[0], makes: "the 12- and 24-card sets, with the printed certificate", city: "Santa Cruz CA" },
  { key: "posters", name: CANON.partners[1], makes: "18 × 24 and 24 × 36 posters, with the printed certificate", city: "Charlotte NC" },
  { key: "pack", name: CANON.partners[2], makes: "the sealed foil pack", city: "Hong Kong" },
];

export const partner = (key: PartnerKey): Partner => PARTNERS.find((p) => p.key === key) as Partner;

/** The pack partner is named only while the sealed-pack tier is enabled (GAPS #12, D18). */
export const packEnabled = (): boolean => Boolean(getTier("GDE-ANY-CARD-PACK")?.enabled);

/** Partners a page may list today (pack row hidden until D18). */
export const visiblePartners = (): Partner[] => PARTNERS.filter((p) => p.key !== "pack" || packEnabled());

/** The labs sentence (COPY §2.6 (6), §2.9 (4)). */
export const LABS_SENTENCE =
  "Labs receive only the finished artwork and a shipping address — never your photos. Color correction is switched off at the lab: what you approved is what prints.";

/** Digital tiers: no shipment at all. */
export const DIGITAL_SHIPS_FROM = "Delivered on your order page — PNG at 300 dpi, by design";

export interface ShippingRow {
  key: "digital" | "cards" | "posters" | "pack" | "ultimate";
  package: string;
  shipsFrom: string;
  carrier: string;
  timing: string;
  tracking: string;
  /** True when a cell is the lab's stated practice rather than an observed shipment. */
  perLab: boolean;
  /** Rows that exist only because of the sealed pack render only when its tier is enabled. */
  hiddenUntilPackEnabled?: boolean;
  /** Duties wording, added after the pack partner's DDP answer; none today. */
  customsNote?: string;
}

const [digitalMin, digitalMax] = LEAD_TIMES.digitalBusinessDays;
const [shipMin, shipMax] = LEAD_TIMES.printShipBusinessDays;
const [packMin, packMax] = LEAD_TIMES.sealedPackWeeks;
const SHIP_TIMING = `Ship within ${shipMin}–${shipMax} business days of your order, after proof approval`;

export const shippingRows: ShippingRow[] = [
  {
    key: "digital",
    package: "Digital files",
    shipsFrom: "Your order page",
    carrier: "—",
    timing: `${digitalMin}–${digitalMax} business days from your order`,
    tracking: "—",
    perLab: false,
  },
  {
    key: "cards",
    package: "12 or 24 printed cards + certificate",
    shipsFrom: partner("cards").name,
    carrier: "USPS, plain white-label box (per lab)",
    timing: SHIP_TIMING,
    tracking: "Yes",
    perLab: true,
  },
  {
    key: "posters",
    package: "Posters 18 × 24 / 24 × 36 + certificate",
    shipsFrom: partner("posters").name,
    carrier: "Tube, poster and certificate in one shipment (per lab)",
    timing: SHIP_TIMING,
    tracking: "Yes",
    perLab: true,
  },
  {
    // Tracking is "Yes"; the duties line waits for the partner's DDP answer (customsNote stays unset).
    key: "pack",
    package: "Sealed foil pack",
    shipsFrom: partner("pack").name,
    carrier: "International, tracked (per lab)",
    timing: `${packMin}–${packMax} weeks, ships separately`,
    tracking: "Yes",
    perLab: true,
    hiddenUntilPackEnabled: true,
  },
  {
    key: "ultimate",
    package: "Ultimate Set",
    shipsFrom: "All three",
    carrier: "—",
    timing: "Three tracked packages, staged",
    tracking: "Yes",
    perLab: false,
    hiddenUntilPackEnabled: true,
  },
];

/** The rows a page renders today: the pack row (and the Ultimate row that exists because of it) wait for D18. */
export function visibleShippingRows(): ShippingRow[] {
  const pack = packEnabled();
  return shippingRows.filter((r) => !r.hiddenUntilPackEnabled || pack);
}

const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

/**
 * The "Ships from" cell of a TierCard for any SKU (any-sport or sport-specific): digital tiers
 * are delivered on the order page; printed cards, posters and the pack name their partner; sets
 * name both labs because they ship as two packages (three for the Ultimate).
 */
export function shipsFromFor(sku: string): string {
  const m = /^GDE-[A-Z]{3}-(CARD|POST|SET|SNSET)-([A-Z0-9]+)$/.exec(sku.toUpperCase());
  if (!m) return DIGITAL_SHIPS_FROM;
  const [, product, tierKey] = m;
  if (tierKey === "DIG") return DIGITAL_SHIPS_FROM;
  const cards = partner("cards");
  const posters = partner("posters");
  const pack = partner("pack");
  if (product === "CARD") return tierKey === "PACK" ? `${pack.name} · tracked (per lab)` : `${cards.name} · tracked (per lab)`;
  if (product === "POST") return `${posters.name} · poster and certificate in one shipment, in a tube, tracked (per lab)`;
  if (tierKey === "ULT") return `${cards.city} · ${posters.city} · ${pack.name}`;
  return `Two packages: cards from the ${lowerFirst(cards.name)}; poster from the ${lowerFirst(posters.name)} · tracked (per lab)`;
}
