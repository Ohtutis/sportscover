// What a parent can ask for on /free-proof (owner decision 2026-10-04: a free watermarked proof first,
// payment only after approval — D4's own fallback path, now the main path while Stripe waits).
//
// Prices come ONLY from lib/catalog/prices.ts: every option names a tier `sku` and shows that tier's site
// price (pricing v1, 2026-10-07: digital DIGITAL_PRICE, printed Etsy × 1.10 up to .99 — cards, posters,
// banners and blankets). A product's "from" line is its cheapest
// option, and two or more products together are priced by prices.ts `bundleTotal` (orderBundle below).
// Never type a price here.

import { bundleTotal, formatUsd, fromPrice, getTier, sitePrice, type BundleTotal, type Tier } from "../catalog/prices";

export type ProductKey = "cards" | "poster" | "banner" | "blanket";

export interface ProductOption {
  key: string;
  label: string;
  /** One line under the label: what the option includes. */
  detail: string;
  /** The prices.ts tier SKU the option is priced from (must be an enabled tier — tested). */
  sku: string;
  printed: boolean;
}

export interface Product {
  key: ProductKey;
  name: string;
  /** One sentence on the tile. */
  blurb: string;
  options: ProductOption[];
}

/**
 * The wording for an option with no price. Every option is priced since the blanket ladder (2026-10-07), so
 * nothing on the form or the emails prints it; it stays exported for the blog posts that still name it.
 */
export const PRICE_ON_PROOF = "Price confirmed with your free proof";

export const PRODUCTS: readonly Product[] = [
  {
    key: "cards",
    name: "Trading cards",
    blurb: "Front and back, square-cut, with a registered card ID and the card's own page.",
    options: [
      {
        key: "digital",
        label: "Digital files",
        detail: "Front, back, certificate, flip video and the card's registry page — ready to print anywhere.",
        sku: "GDE-ANY-CARD-DIG",
        printed: false,
      },
      {
        key: "p12",
        label: "12 printed cards",
        detail: "Square-cut, UV-coated 2.5 × 3.5 in cards plus every digital file. Shipped free in the US.",
        sku: "GDE-ANY-CARD-P12",
        printed: true,
      },
      {
        key: "p24",
        label: "24 printed cards",
        detail: "Enough for the team and the family, plus every digital file. Shipped free in the US.",
        sku: "GDE-ANY-CARD-P24",
        printed: true,
      },
    ],
  },
  {
    key: "poster",
    name: "Poster",
    blurb: "Art for the wall — the stats stay on the card.",
    options: [
      {
        key: "digital",
        label: "Digital files",
        detail: "18 × 24 and 24 × 36 at 300 DPI, plus phone and desktop wallpapers.",
        sku: "GDE-ANY-POST-DIG",
        printed: false,
      },
      {
        key: "p1824",
        label: "18 × 24 in printed",
        detail: "Matte poster, 189 g/m², with a printed certificate. Shipped free in the US.",
        sku: "GDE-ANY-POST-P1824",
        printed: true,
      },
      {
        key: "p2436",
        label: "24 × 36 in printed",
        detail: "Matte poster, 189 g/m², with a printed certificate. Shipped free in the US.",
        sku: "GDE-ANY-POST-P2436",
        printed: true,
      },
    ],
  },
  {
    key: "banner",
    name: "Banner",
    blurb: "A vinyl banner for the fence, the gym wall or senior night.",
    options: [
      { key: "digital", label: "Digital file", detail: "Print-ready banner art at full size, plus phone and desktop wallpapers.", sku: "GDE-ANY-BAN-DIG", printed: false },
      { key: "1x2", label: "1 × 2 ft printed", detail: "Printed vinyl banner plus the digital file. Ships separately, 1–2 weeks.", sku: "GDE-ANY-BAN-1X2", printed: true },
      { key: "2x4", label: "2 × 4 ft printed", detail: "Printed vinyl banner plus the digital file. Ships separately, 1–2 weeks.", sku: "GDE-ANY-BAN-2X4", printed: true },
      { key: "3x6", label: "3 × 6 ft printed", detail: "Printed vinyl banner plus the digital file. Ships separately, 1–2 weeks.", sku: "GDE-ANY-BAN-3X6", printed: true },
    ],
  },
  {
    key: "blanket",
    name: "Blanket",
    blurb: "A plush blanket printed with their artwork — bedroom, dorm or the bleachers.",
    options: [
      // The Etsy listing's four variants (etsy/BLANKET-ROLLOUT-2026-10.md): the files in all three sizes, or a printed size
      // that includes them ("plus all files" on Etsy — every printed option on the site includes its digital files).
      {
        key: "digital",
        label: "Digital files",
        detail: "Print-ready blanket art in all three sizes, plus social graphics and phone and desktop wallpapers.",
        sku: "GDE-ANY-BLK-DIG",
        printed: false,
      },
      { key: "30x40", label: "30 × 40 in", detail: "Soft plush blanket, printed on one side, plus every digital file. Shipped free in the US.", sku: "GDE-ANY-BLK-3040", printed: true },
      { key: "50x60", label: "50 × 60 in", detail: "Soft plush blanket, printed on one side, plus every digital file. Shipped free in the US.", sku: "GDE-ANY-BLK-5060", printed: true },
      { key: "60x80", label: "60 × 80 in", detail: "Soft plush blanket, printed on one side, plus every digital file. Shipped free in the US.", sku: "GDE-ANY-BLK-6080", printed: true },
    ],
  },
];

export const PRODUCT_KEYS: readonly ProductKey[] = PRODUCTS.map((p) => p.key);

export const productByKey = (key: string): Product | undefined => PRODUCTS.find((p) => p.key === key);
export const optionOf = (product: Product, key: string): ProductOption | undefined => product.options.find((o) => o.key === key);

const tierOf = (opt: ProductOption): Tier => {
  const tier = getTier(opt.sku);
  if (!tier) throw new Error(`products: option sku ${opt.sku} is not on a ladder`);
  return tier;
};

/** An option's site price (prices.ts sitePrice of its tier). */
export const optionPrice = (opt: ProductOption): number => sitePrice(tierOf(opt));

/** "<price>" for an option. */
export const optionPriceLabel = (opt: ProductOption): string => formatUsd(optionPrice(opt));

/** "from <price>": the product's cheapest option. */
export function productFromLabel(product: Product): string {
  return `from ${formatUsd(Math.min(...product.options.map(optionPrice)))}`;
}

/** The set line under the product tiles: cards + poster together, the cheapest set tier (a bundle of the two). */
export const setFromLabel = (): string => `from ${formatUsd(fromPrice("set"))}`;

/** One chosen product: its key and option (and, on stored requests from before v4, a quantity). */
export interface ProductChoice {
  product: string;
  option: string;
  quantity?: number;
}

/**
 * The bundle a list of choices makes — one line per item at its option's site price (a stored request's
 * quantity counts each copy; bundles count DIFFERENT products). Choices that name no known option are left
 * out. Null for an empty list.
 */
export function orderBundle(choices: readonly ProductChoice[]): BundleTotal | null {
  const lines = choices.flatMap((c) => {
    const product = productByKey(c.product);
    const option = product ? optionOf(product, c.option) : undefined;
    if (!product || !option) return [];
    return Array.from({ length: Math.max(1, c.quantity ?? 1) }, () => ({ product: product.key, price: optionPrice(option) }));
  });
  return lines.length ? bundleTotal(lines) : null;
}

/** "12 printed cards" → the label a summary or an email prints for a choice. */
export function choiceLabel(productKey: string, optionKey: string): string {
  const product = productByKey(productKey);
  const option = product ? optionOf(product, optionKey) : undefined;
  if (!product || !option) return `${productKey} · ${optionKey}`;
  return `${product.name} · ${option.label}`;
}
