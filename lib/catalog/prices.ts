// The price ladder — ONE source for every number the site shows.
//
// Pricing v1 (owner decision 2026-10-07): "Printed a little higher than Etsy for all listings; digital
// $19.99. If they add more than one printed thing, the price goes down — tier discount."
//
//   • Digital: DIGITAL_PRICE for every product (cards, poster, banner, blanket).
//   • Printed: Etsy's buyer price × SITE_MARKUP, rounded UP to the next .99. Etsy's buyer price is
//     `etsySale` — the shop-wide -30 % is permanent on Etsy (renewed continuously), so the site never
//     switches on a date and never shows a "regular" price beside a single item.
//   • Bundle: two or more different products in one order are priced together — 2 products save 15 %,
//     3 save 20 %, all 4 save 25 % (`bundleDiscountRate`). The bundle total is rounded DOWN to .99
//     (`floorTo99`), so the saving is never smaller than the rate it states. The comparison is always
//     "the same items bought separately": the à-la-carte total is the ONLY struck-through number the
//     site shows, and only beside a bundle total.
//   • The set tiers (/complete-set) are that bundle of their two parts — never an Etsy number.
//
// Etsy-facing data (`etsyBase`, `etsySale`, the SKUs) is the Etsy listings' own and stays as it is; the
// site rule only reads it. Never type a price into JSX — tests fail the build if a "$<digits>" literal
// appears outside this module.

export type Family = "cards" | "posters" | "set" | "snset" | "banner" | "blanket";

export interface Tier {
  /** Any-sport SKU; sport-specific SKUs replace ANY with the sport code (see skuFor). */
  sku: string;
  family: Family;
  tierKey: string;
  /** Etsy variant name, ≤20 characters, identical on both channels. */
  name: string;
  /** Etsy's listed price (shown struck through on Etsy only). */
  etsyBase: number;
  /** What an Etsy buyer pays — the shop-wide -30 % is permanent. The site's printed price reads this. */
  etsySale: number;
  physical: boolean;
  /** Rendered on the site only when true (sealed pack and 30×40 XL are gated). */
  enabled: boolean;
  featured?: boolean;
}

export const SITE_MARKUP = 1.1;
/** Every digital option on the site, whatever the product (owner, 2026-10-07). */
export const DIGITAL_PRICE = 19.99;

export const tiers: Tier[] = [
  { sku: "GDE-ANY-CARD-DIG", family: "cards", tierKey: "DIG", name: "Digital Card Files", etsyBase: 24.99, etsySale: 17.49, physical: false, enabled: true },
  { sku: "GDE-ANY-CARD-P12", family: "cards", tierKey: "P12", name: "12 Printed Cards", etsyBase: 49.99, etsySale: 34.99, physical: true, enabled: true, featured: true },
  { sku: "GDE-ANY-CARD-P24", family: "cards", tierKey: "P24", name: "24 Printed Cards", etsyBase: 74.99, etsySale: 52.49, physical: true, enabled: true },
  { sku: "GDE-ANY-CARD-PACK", family: "cards", tierKey: "PACK", name: "Sealed Foil Pack", etsyBase: 69.99, etsySale: 48.99, physical: true, enabled: false },
  { sku: "GDE-ANY-POST-DIG", family: "posters", tierKey: "DIG", name: "Digital Poster Files", etsyBase: 24.99, etsySale: 17.49, physical: false, enabled: true },
  { sku: "GDE-ANY-POST-P1824", family: "posters", tierKey: "P1824", name: "18×24 Printed Poster", etsyBase: 59.99, etsySale: 41.99, physical: true, enabled: true, featured: true },
  { sku: "GDE-ANY-POST-P2436", family: "posters", tierKey: "P2436", name: "24×36 Printed Poster", etsyBase: 74.99, etsySale: 52.49, physical: true, enabled: true },
  { sku: "GDE-ANY-POST-P3040", family: "posters", tierKey: "P3040", name: "30×40 XL Poster", etsyBase: 119.99, etsySale: 83.99, physical: true, enabled: false },
  { sku: "GDE-ANY-SET-DIG", family: "set", tierKey: "DIG", name: "Digital Complete Set", etsyBase: 34.99, etsySale: 24.49, physical: false, enabled: true },
  { sku: "GDE-ANY-SET-PRINT", family: "set", tierKey: "PRINT", name: "Printed Set", etsyBase: 89.99, etsySale: 62.99, physical: true, enabled: true, featured: true },
  { sku: "GDE-ANY-SET-DLX", family: "set", tierKey: "DLX", name: "Deluxe Set", etsyBase: 114.99, etsySale: 80.49, physical: true, enabled: true },
  { sku: "GDE-ANY-SET-ULT", family: "set", tierKey: "ULT", name: "Ultimate Set", etsyBase: 159.99, etsySale: 111.99, physical: true, enabled: false },
];

/**
 * The banner ladder (etsy/LISTING-STATE.md 2026-09-22, verified live 2026-10-04): the four variants every
 * sport's banner listing carries — Digital / 1×2 / 2×4 / 3×6 ft vinyl. Kept beside `tiers`, not inside
 * it: the family pages, the sport picker and the Etsy SKU → listing map know nothing about banners yet
 * (there is no any-sport banner listing; ten sports have their own). The intake form prices banner
 * options from here through `getTier`, which searches every ladder.
 */
export const bannerTiers: Tier[] = [
  { sku: "GDE-ANY-BAN-DIG", family: "banner", tierKey: "DIG", name: "Digital Banner Files", etsyBase: 24.99, etsySale: 17.49, physical: false, enabled: true },
  { sku: "GDE-ANY-BAN-1X2", family: "banner", tierKey: "1X2", name: "1x2 ft Vinyl Banner", etsyBase: 49.99, etsySale: 34.99, physical: true, enabled: true },
  { sku: "GDE-ANY-BAN-2X4", family: "banner", tierKey: "2X4", name: "2x4 ft Vinyl Banner", etsyBase: 74.99, etsySale: 52.49, physical: true, enabled: true, featured: true },
  { sku: "GDE-ANY-BAN-3X6", family: "banner", tierKey: "3X6", name: "3x6 ft Vinyl Banner", etsyBase: 109.99, etsySale: 76.99, physical: true, enabled: true },
];

/**
 * The blanket ladder (etsy/BLANKET-ROLLOUT-2026-10.md: all 11 sport listings live 2026-10-06, Printful):
 * the Etsy listings' four variants — the digital files (owner, 2026-10-07: "blanket digital too, 19.99")
 * and the three plush sizes. Etsy's buyer prices are 17.49 / 48.99 / 69.29 / 99.39 after the shop-wide
 * -30 %; `etsyBase` is that ÷ 0.7 on the .99 (the Etsy variants' listed price). "Digital Files" is the
 * Etsy variant's own name ("Digital Blanket Files" is 21 characters, one over Etsy's limit).
 */
export const blanketTiers: Tier[] = [
  { sku: "GDE-ANY-BLK-DIG", family: "blanket", tierKey: "DIG", name: "Digital Files", etsyBase: 24.99, etsySale: 17.49, physical: false, enabled: true },
  { sku: "GDE-ANY-BLK-3040", family: "blanket", tierKey: "3040", name: "30x40 Plush Blanket", etsyBase: 69.99, etsySale: 48.99, physical: true, enabled: true },
  { sku: "GDE-ANY-BLK-5060", family: "blanket", tierKey: "5060", name: "50x60 Plush Blanket", etsyBase: 98.99, etsySale: 69.29, physical: true, enabled: true },
  { sku: "GDE-ANY-BLK-6080", family: "blanket", tierKey: "6080", name: "60x80 Plush Blanket", etsyBase: 141.99, etsySale: 99.39, physical: true, enabled: true },
];

/** Every ladder the site prices from — getTier searches all of them. */
const LADDERS: readonly Tier[][] = [tiers, bannerTiers, blanketTiers];

/**
 * The one dollar literal the site may show that is not a ladder price: the free-proof page's "Today $0".
 * It lives here because the forbidden-strings lint allows typed dollar amounts in this module only —
 * nothing is due before a proof is approved, so the figure is a fact, not a price.
 */
export const DUE_TODAY_LABEL = "$0";

/** Round UP to the next .99: 32.33 → 32.99, 53.99 → 53.99, 54.00 → 54.99. */
export function ceilTo99(n: number): number {
  const whole = Math.ceil(n - 0.99 - 1e-9);
  return Math.round((whole + 0.99) * 100) / 100;
}

/** Round DOWN to the last .99 at or below: 33.983 → 32.99, 33.99 → 33.99, 98.583 → 97.99. */
export function floorTo99(n: number): number {
  const whole = Math.floor(n - 0.99 + 1e-9);
  return Math.round((whole + 0.99) * 100) / 100;
}

/** What an Etsy buyer pays for the same tier today: the sale price (the shop-wide -30 % is permanent). */
export const etsyBuyerPrice = (t: Tier): number => t.etsySale;

/** The set families: priced as the bundle of their parts (SET_PARTS), never from Etsy. */
export const isSetFamily = (family: Family): boolean => family === "set" || family === "snset";

/**
 * The site price of one tier. Digital → DIGITAL_PRICE; printed → Etsy's buyer price × SITE_MARKUP, up to
 * .99; a set → the bundle total of its parts. No clock: nothing on the site expires.
 */
export function sitePrice(t: Tier): number {
  if (isSetFamily(t.family)) return setBundle(t).total;
  if (!t.physical) return DIGITAL_PRICE;
  return ceilTo99(etsyBuyerPrice(t) * SITE_MARKUP);
}

// --- the bundle ------------------------------------------------------------------------------------

/**
 * The bundle ladder: how much the whole order saves by the number of DIFFERENT products in it (cards,
 * poster, banner, blanket — each at the option chosen, digital or printed). One product saves nothing.
 */
export const BUNDLE_STEPS: readonly { count: number; percent: number }[] = [
  { count: 2, percent: 15 },
  { count: 3, percent: 20 },
  { count: 4, percent: 25 },
];

const bundlePercent = (productCount: number): number =>
  BUNDLE_STEPS.reduce((pct, step) => (productCount >= step.count ? step.percent : pct), 0);

/** 1 → 0, 2 → 0.15, 3 → 0.2, 4 → 0.25. */
export const bundleDiscountRate = (productCount: number): number => bundlePercent(productCount) / 100;

/** One priced line of an order: which product it is (bundles count distinct products) and its site price. */
export interface BundleLine {
  product: string;
  price: number;
}

export interface BundleTotal {
  /** Distinct products in the order. */
  productCount: number;
  /** The same items bought separately — the one struck-through figure the site may show. */
  alaCarte: number;
  /** 0, 0.15, 0.2 or 0.25. */
  discountRate: number;
  /** alaCarte − total: never less than alaCarte × discountRate (the total rounds DOWN to .99). */
  discount: number;
  total: number;
}

/**
 * The one bundle function: the form's product step, "Your order", the request email and the set tiers
 * all price through it. A single product (or nothing) is its à-la-carte sum, untouched.
 */
export function bundleTotal(lines: readonly BundleLine[]): BundleTotal {
  const alaCarteCents = Math.round(lines.reduce((sum, l) => sum + l.price, 0) * 100);
  const productCount = new Set(lines.map((l) => l.product)).size;
  const percent = bundlePercent(productCount);
  // Integer cents throughout: alaCarteCents × (100 − percent) is exact, so a total that lands ON .99 stays there.
  const totalCents = percent > 0 ? Math.floor((alaCarteCents * (100 - percent) - 9900) / 10000) * 100 + 99 : alaCarteCents;
  return {
    productCount,
    alaCarte: alaCarteCents / 100,
    discountRate: percent / 100,
    discount: (alaCarteCents - totalCents) / 100,
    total: totalCents / 100,
  };
}

/** The product a tier is part of when an order is bundled: the four things the form sells. */
export function bundleProductOf(t: Tier): string {
  switch (t.family) {
    case "cards":
      return "cards";
    case "posters":
      return "poster";
    case "banner":
      return "banner";
    case "blanket":
      return "blanket";
    default:
      throw new Error(`bundleProductOf: ${t.sku} is a set, not a product`);
  }
}

/**
 * What each set tier is made of — the same pairs lib/cta.ts SET_TIER_OPTIONS prefills in the form, so a
 * set bought on /complete-set and the same two products ticked on /free-proof cost the same. The Ultimate
 * set (disabled) adds the sealed pack to the Deluxe pair.
 */
export const SET_PARTS: Record<string, readonly string[]> = {
  "GDE-ANY-SET-DIG": ["GDE-ANY-CARD-DIG", "GDE-ANY-POST-DIG"],
  "GDE-ANY-SET-PRINT": ["GDE-ANY-CARD-P12", "GDE-ANY-POST-P1824"],
  "GDE-ANY-SET-DLX": ["GDE-ANY-CARD-P24", "GDE-ANY-POST-P2436"],
  "GDE-ANY-SET-ULT": ["GDE-ANY-CARD-P24", "GDE-ANY-POST-P2436", "GDE-ANY-CARD-PACK"],
};

/** A set tier as the bundle of its parts. Throws for a tier that is not a set, or a set with no parts. */
export function setBundle(t: Tier): BundleTotal {
  const parts = isSetFamily(t.family) ? SET_PARTS[t.sku] : undefined;
  if (!parts) throw new Error(`setBundle: ${t.sku} has no parts in SET_PARTS`);
  return bundleTotal(
    parts.map((sku) => {
      const part = getTier(sku);
      if (!part) throw new Error(`setBundle: ${t.sku} lists ${sku}, which is not on a ladder`);
      return { product: bundleProductOf(part), price: sitePrice(part) };
    }),
  );
}

/**
 * What a price card renders: the price, and — for a set only — the bundle behind it (the à-la-carte total
 * to strike through and the saving). A single item never carries a comparison price.
 */
export function priceDisplay(t: Tier): { current: number; bundle?: BundleTotal } {
  if (isSetFamily(t.family)) {
    const bundle = setBundle(t);
    return { current: bundle.total, bundle };
  }
  return { current: sitePrice(t) };
}

export const formatUsd = (n: number): string => `$${n.toFixed(2)}`;
/** 0.15 → "15%". */
export const formatPercent = (rate: number): string => `${Math.round(rate * 100)}%`;

export const tiersFor = (family: Family, includeDisabled = false): Tier[] =>
  tiers.filter((t) => t.family === family && (includeDisabled || t.enabled));

export const getTier = (sku: string): Tier | undefined => {
  for (const ladder of LADDERS) {
    const found = ladder.find((t) => t.sku === sku);
    if (found) return found;
  }
  return undefined;
};

export function fromPrice(family: Family): number {
  const enabled = tiersFor(family);
  if (!enabled.length) throw new Error(`fromPrice: no enabled tiers for family "${family}"`);
  return Math.min(...enabled.map((t) => sitePrice(t)));
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
  banner: "Banners",
  blanket: "Blankets",
};

/** Round UP to the next half unit: 4.499 → 4.5, 6.416 → 6.5, 4.5 → 4.5. */
export function ceilToHalf(n: number): number {
  return Math.ceil(n * 2 - 1e-9) / 2;
}

/**
 * The per-card anchor the trading-cards page renders as "less than {perCard} per card" (COPY §0.2,
 * D23): the 12-card tier's site price divided by twelve, rounded up to the next half. Computed, never
 * typed — when the ladder moves the anchor moves with it.
 */
export function perCardAnchor(): number {
  const p12 = getTier("GDE-ANY-CARD-P12");
  if (!p12) throw new Error("perCardAnchor: GDE-ANY-CARD-P12 is missing from the ladder");
  return ceilToHalf(sitePrice(p12) / 12);
}
