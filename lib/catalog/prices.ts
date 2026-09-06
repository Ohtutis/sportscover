// The price ladder — ONE source for every number the site shows.
//
// Rule (owner decision 2026-09-06): the site mirrors Etsy's presentation — a base price shown
// struck through and a sale price — but BOTH are 10% above their Etsy counterparts, rounded UP
// to the next .99. The sale is shown only while SALE_EXPIRES_AT is in the future; after that the
// site shows siteBase alone (never a struck-through price that is not real). Never type a price
// into JSX — tests fail the build if a "$<digits>" literal appears outside this module.

export type Family = "cards" | "posters" | "set" | "snset";

export interface Tier {
  /** Any-sport SKU; sport-specific SKUs replace ANY with the sport code (see skuFor). */
  sku: string;
  family: Family;
  tierKey: string;
  /** Etsy variant name, ≤20 characters, identical on both channels. */
  name: string;
  etsyBase: number;
  etsySale: number;
  physical: boolean;
  /** Rendered on the site only when true (sealed pack and 30×40 XL are gated). */
  enabled: boolean;
  featured?: boolean;
}

/** The shop-wide -30% Etsy sale end date. The owner updates this on every renewal. */
export const SALE_EXPIRES_AT = "2026-09-24T23:59:59-04:00";
export const SITE_MARKUP = 1.1;

export const tiers: Tier[] = [
  { sku: "GDE-ANY-CARD-DIG", family: "cards", tierKey: "DIG", name: "Digital Card Files", etsyBase: 41.99, etsySale: 29.39, physical: false, enabled: true },
  { sku: "GDE-ANY-CARD-P12", family: "cards", tierKey: "P12", name: "12 Printed Cards", etsyBase: 69.99, etsySale: 48.99, physical: true, enabled: true, featured: true },
  { sku: "GDE-ANY-CARD-P24", family: "cards", tierKey: "P24", name: "24 Printed Cards", etsyBase: 98.99, etsySale: 69.29, physical: true, enabled: true },
  { sku: "GDE-ANY-CARD-PACK", family: "cards", tierKey: "PACK", name: "Sealed Foil Pack", etsyBase: 84.99, etsySale: 59.49, physical: true, enabled: false },
  { sku: "GDE-ANY-POST-DIG", family: "posters", tierKey: "DIG", name: "Digital Poster Files", etsyBase: 41.99, etsySale: 29.39, physical: false, enabled: true },
  { sku: "GDE-ANY-POST-P1824", family: "posters", tierKey: "P1824", name: "18×24 Printed Poster", etsyBase: 83.99, etsySale: 58.79, physical: true, enabled: true, featured: true },
  { sku: "GDE-ANY-POST-P2436", family: "posters", tierKey: "P2436", name: "24×36 Printed Poster", etsyBase: 97.99, etsySale: 68.59, physical: true, enabled: true },
  { sku: "GDE-ANY-POST-P3040", family: "posters", tierKey: "P3040", name: "30×40 XL Poster", etsyBase: 155.99, etsySale: 109.19, physical: true, enabled: false },
  { sku: "GDE-ANY-SET-DIG", family: "set", tierKey: "DIG", name: "Digital Complete Set", etsyBase: 49.99, etsySale: 34.99, physical: false, enabled: true },
  { sku: "GDE-ANY-SET-PRINT", family: "set", tierKey: "PRINT", name: "Printed Set", etsyBase: 109.99, etsySale: 76.99, physical: true, enabled: true, featured: true },
  { sku: "GDE-ANY-SET-DLX", family: "set", tierKey: "DLX", name: "Deluxe Set", etsyBase: 135.99, etsySale: 95.19, physical: true, enabled: true },
  { sku: "GDE-ANY-SET-ULT", family: "set", tierKey: "ULT", name: "Ultimate Set", etsyBase: 199.99, etsySale: 139.99, physical: true, enabled: false },
];

export function ceilTo99(n: number): number {
  const whole = Math.ceil(n - 0.99 - 1e-9);
  return Math.round((whole + 0.99) * 100) / 100;
}

export function isSaleActive(now: Date = new Date()): boolean {
  return now.getTime() < new Date(SALE_EXPIRES_AT).getTime();
}

export const siteBase = (t: Tier): number => ceilTo99(t.etsyBase * SITE_MARKUP);
export const siteSale = (t: Tier): number => ceilTo99(t.etsySale * SITE_MARKUP);
export const etsyBuyerNow = (t: Tier, now?: Date): number => (isSaleActive(now) ? t.etsySale : t.etsyBase);
export const sitePrice = (t: Tier, now?: Date): number => (isSaleActive(now) ? siteSale(t) : siteBase(t));

/** What a price card renders: the current price, plus the struck-through base while the sale runs. */
export function priceDisplay(t: Tier, now?: Date): { current: number; compareAt?: number } {
  return isSaleActive(now) ? { current: siteSale(t), compareAt: siteBase(t) } : { current: siteBase(t) };
}

export const formatUsd = (n: number): string => `$${n.toFixed(2)}`;

export const tiersFor = (family: Family, includeDisabled = false): Tier[] =>
  tiers.filter((t) => t.family === family && (includeDisabled || t.enabled));

export const getTier = (sku: string): Tier | undefined => tiers.find((t) => t.sku === sku);

export function fromPrice(family: Family, now?: Date): number {
  const enabled = tiersFor(family);
  if (!enabled.length) throw new Error(`fromPrice: no enabled tiers for family "${family}"`);
  return Math.min(...enabled.map((t) => sitePrice(t, now)));
}

/** Build a sport-specific SKU from an any-sport tier, e.g. ("GDE-ANY-CARD-P12", "BKB") → GDE-BKB-CARD-P12. */
export function skuFor(anySku: string, sportCode: string): string {
  return anySku.replace(/^GDE-ANY-/, `GDE-${sportCode}-`);
}

export const FAMILY_LABELS: Record<Family, string> = {
  cards: "Trading Cards",
  posters: "Posters",
  set: "Complete Set",
  snset: "Senior Night Set",
};
