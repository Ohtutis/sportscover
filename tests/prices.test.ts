// Pricing v1 (owner decision 2026-10-07): digital DIGITAL_PRICE everywhere; printed = Etsy's buyer price
// × SITE_MARKUP rounded UP to .99 (always above Etsy); no comparison price on a single item; bundles of
// 2 / 3 / 4 different products save 15 / 20 / 25 %, the total rounded DOWN to .99 so the stated rate is
// never under-delivered; the set tiers are the bundle of their parts. Every expected figure is derived
// from the rule, except the few the owner's brief names outright (the table below), which pin the rule.
import { describe, expect, it } from "vitest";
import {
  BUNDLE_STEPS,
  DIGITAL_PRICE,
  SET_PARTS,
  SITE_MARKUP,
  bannerTiers,
  blanketTiers,
  bundleDiscountRate,
  bundleProductOf,
  bundleTotal,
  ceilTo99,
  ceilToHalf,
  etsyBuyerPrice,
  floorTo99,
  formatPercent,
  fromPrice,
  getTier,
  isSetFamily,
  perCardAnchor,
  priceDisplay,
  setBundle,
  sitePrice,
  tiers,
} from "../lib/catalog/prices";
import * as prices from "../lib/catalog/prices";

const ALL = [...tiers, ...bannerTiers, ...blanketTiers];
const singles = ALL.filter((t) => !isSetFamily(t.family));
const sets = ALL.filter((t) => isSetFamily(t.family));
const p = (sku: string): number => sitePrice(getTier(sku)!);
const cents = (n: number): number => Math.round(n * 100);

describe("the rounding helpers", () => {
  it("ceilTo99 rounds up to the next .99", () => {
    expect(ceilTo99(32.33)).toBe(32.99);
    expect(ceilTo99(53.89)).toBe(53.99);
    expect(ceilTo99(53.99)).toBe(53.99);
    expect(ceilTo99(54.0)).toBe(54.99);
  });
  it("floorTo99 rounds down to the last .99 at or below", () => {
    expect(floorTo99(33.983)).toBe(32.99);
    expect(floorTo99(33.99)).toBe(33.99);
    expect(floorTo99(34.5)).toBe(33.99);
    expect(floorTo99(98.583)).toBe(97.99);
    expect(floorTo99(100)).toBe(99.99);
  });
  it("ceilToHalf rounds up to the next half", () => {
    expect(ceilToHalf(4.499)).toBe(4.5);
    expect(ceilToHalf(4.5)).toBe(4.5);
    expect(ceilToHalf(6.416)).toBe(6.5);
    expect(ceilToHalf(6.01)).toBe(6.5);
    expect(ceilToHalf(7)).toBe(7);
  });
});

describe("single items: digital is DIGITAL_PRICE, printed is Etsy × 1.10 up to .99", () => {
  it("the owner's numbers", () => {
    expect(DIGITAL_PRICE).toBe(19.99);
    expect(SITE_MARKUP).toBe(1.1);
  });
  for (const t of singles) {
    it(`${t.sku}`, () => {
      if (t.physical) {
        expect(sitePrice(t)).toBe(ceilTo99(t.etsySale * SITE_MARKUP));
      } else {
        expect(sitePrice(t)).toBe(DIGITAL_PRICE);
      }
      // Above what an Etsy buyer pays for the same thing, and on the .99.
      expect(etsyBuyerPrice(t)).toBe(t.etsySale);
      expect(sitePrice(t)).toBeGreaterThan(etsyBuyerPrice(t));
      expect(String(sitePrice(t))).toMatch(/\.99$/);
      // No comparison price for a single item — ever.
      expect(priceDisplay(t)).toEqual({ current: sitePrice(t) });
    });
  }
  it("the ladder the brief names (cards, posters, banners, blankets)", () => {
    const table: Record<string, number> = {
      "GDE-ANY-CARD-DIG": 19.99,
      "GDE-ANY-CARD-P12": 38.99,
      "GDE-ANY-CARD-P24": 57.99,
      "GDE-ANY-POST-DIG": 19.99,
      "GDE-ANY-POST-P1824": 46.99,
      "GDE-ANY-POST-P2436": 57.99,
      "GDE-ANY-BAN-DIG": 19.99,
      "GDE-ANY-BAN-1X2": 38.99,
      "GDE-ANY-BAN-2X4": 57.99,
      "GDE-ANY-BAN-3X6": 84.99,
      "GDE-ANY-BLK-3040": 53.99,
      "GDE-ANY-BLK-5060": 76.99,
      "GDE-ANY-BLK-6080": 109.99,
    };
    for (const [sku, price] of Object.entries(table)) expect(p(sku), sku).toBe(price);
  });
  it("the blanket ladder: physical, enabled, Etsy's buyer prices, etsyBase = etsySale ÷ 0.7 on the .99", () => {
    expect(blanketTiers.map((t) => t.etsySale)).toEqual([48.99, 69.29, 99.39]);
    for (const t of blanketTiers) {
      expect(t.family).toBe("blanket");
      expect(t.physical && t.enabled).toBe(true);
      expect(Math.abs(t.etsyBase - t.etsySale / 0.7)).toBeLessThan(0.01);
      expect(String(t.etsyBase)).toMatch(/\.99$/);
      expect(getTier(t.sku)).toBe(t);
    }
  });
  it("variant names match Etsy's 20-character limit", () => {
    for (const t of ALL) expect(t.name.length, t.sku).toBeLessThanOrEqual(20);
  });
  it("nothing on the site runs on a sale clock any more", () => {
    for (const gone of ["SALE_EXPIRES_AT", "isSaleActive", "saleEndsLabel", "siteSale", "siteBase", "etsyBuyerNow"]) expect(prices, gone).not.toHaveProperty(gone);
  });
  it("perCardAnchor follows the 12-card price (D23 — it moves with the ladder)", () => {
    expect(perCardAnchor()).toBe(ceilToHalf(p("GDE-ANY-CARD-P12") / 12));
    expect(perCardAnchor()).toBeGreaterThan(p("GDE-ANY-CARD-P12") / 12);
    expect(perCardAnchor()).toBeLessThan(5);
  });
  it("fromPrice is the family's cheapest enabled tier", () => {
    expect(fromPrice("cards")).toBe(DIGITAL_PRICE);
    expect(fromPrice("posters")).toBe(DIGITAL_PRICE);
    expect(fromPrice("set")).toBe(Math.min(...tiers.filter((t) => t.family === "set" && t.enabled).map((t) => sitePrice(t))));
  });
});

describe("the bundle: 2 → 15 %, 3 → 20 %, all 4 → 25 %, total down to .99", () => {
  it("bundleDiscountRate", () => {
    expect([0, 1, 2, 3, 4].map(bundleDiscountRate)).toEqual([0, 0, 0.15, 0.2, 0.25]);
    expect(BUNDLE_STEPS.map((s) => [s.count, s.percent])).toEqual([
      [2, 15],
      [3, 20],
      [4, 25],
    ]);
    expect(formatPercent(0.15)).toBe("15%");
  });
  it("one product is its own price — nothing struck, nothing saved", () => {
    const one = bundleTotal([{ product: "cards", price: p("GDE-ANY-CARD-P12") }]);
    expect(one).toEqual({ productCount: 1, alaCarte: p("GDE-ANY-CARD-P12"), discountRate: 0, discount: 0, total: p("GDE-ANY-CARD-P12") });
    expect(bundleTotal([])).toEqual({ productCount: 0, alaCarte: 0, discountRate: 0, discount: 0, total: 0 });
  });
  it("counts DIFFERENT products: two lines of one product are not a bundle", () => {
    const twice = bundleTotal([
      { product: "cards", price: 38.99 },
      { product: "cards", price: 38.99 },
    ]);
    expect(twice.productCount).toBe(1);
    expect(twice.discount).toBe(0);
    expect(twice.total).toBe(77.98);
  });

  /** Every combination of one option per product, for every subset of products: the rate is never under-delivered. */
  const OPTIONS: Record<string, string[]> = {
    cards: ["GDE-ANY-CARD-DIG", "GDE-ANY-CARD-P12", "GDE-ANY-CARD-P24"],
    poster: ["GDE-ANY-POST-DIG", "GDE-ANY-POST-P1824", "GDE-ANY-POST-P2436"],
    banner: ["GDE-ANY-BAN-DIG", "GDE-ANY-BAN-1X2", "GDE-ANY-BAN-2X4", "GDE-ANY-BAN-3X6"],
    blanket: ["GDE-ANY-BLK-3040", "GDE-ANY-BLK-5060", "GDE-ANY-BLK-6080"],
  };
  function* combos(keys: string[]): Generator<{ product: string; price: number }[]> {
    if (!keys.length) {
      yield [];
      return;
    }
    const [head, ...rest] = keys;
    for (const tail of combos(rest)) {
      yield tail;
      for (const sku of OPTIONS[head]) yield [{ product: head, price: p(sku) }, ...tail];
    }
  }
  it("every mix of products and options (digital + printed): total on .99 at or under à-la-carte × (1 − rate), within a dollar", () => {
    let checked = 0;
    for (const lines of combos(Object.keys(OPTIONS))) {
      if (lines.length < 2) continue;
      const b = bundleTotal(lines);
      const alaCarte = lines.reduce((s, l) => s + cents(l.price), 0);
      expect(cents(b.alaCarte)).toBe(alaCarte);
      expect(b.productCount).toBe(lines.length);
      expect(b.discountRate).toBe(bundleDiscountRate(lines.length));
      expect(String(b.total)).toMatch(/\.99$/);
      // Never less saving than stated, never more than a dollar beyond it.
      expect(cents(b.total)).toBeLessThanOrEqual(alaCarte * (1 - b.discountRate));
      expect(cents(b.total)).toBeGreaterThan(alaCarte * (1 - b.discountRate) - 100);
      expect(cents(b.discount)).toBe(alaCarte - cents(b.total));
      checked++;
    }
    expect(checked).toBeGreaterThan(300);
  });
  it("the brief's examples: 2, 3 and 4 printed products", () => {
    const two = bundleTotal([
      { product: "cards", price: p("GDE-ANY-CARD-P12") },
      { product: "poster", price: p("GDE-ANY-POST-P1824") },
    ]);
    expect(two).toMatchObject({ productCount: 2, alaCarte: 85.98, discountRate: 0.15, total: floorTo99(85.98 * 0.85) });
    expect(two.total).toBe(72.99);
    const four = bundleTotal([
      { product: "cards", price: p("GDE-ANY-CARD-P12") },
      { product: "poster", price: p("GDE-ANY-POST-P1824") },
      { product: "banner", price: p("GDE-ANY-BAN-2X4") },
      { product: "blanket", price: p("GDE-ANY-BLK-5060") },
    ]);
    expect(four.discountRate).toBe(0.25);
    expect(four.total).toBe(floorTo99((p("GDE-ANY-CARD-P12") + p("GDE-ANY-POST-P1824") + p("GDE-ANY-BAN-2X4") + p("GDE-ANY-BLK-5060")) * 0.75));
  });
});

describe("the set tiers are the bundle of their parts", () => {
  it("every set tier has parts, and every part is a single product on a ladder", () => {
    for (const t of sets) {
      expect(SET_PARTS[t.sku], t.sku).toBeDefined();
      for (const sku of SET_PARTS[t.sku]) expect(isSetFamily(getTier(sku)!.family)).toBe(false);
    }
  });
  for (const t of sets) {
    it(`${t.sku}`, () => {
      const parts = SET_PARTS[t.sku].map((sku) => getTier(sku)!);
      const expected = bundleTotal(parts.map((part) => ({ product: bundleProductOf(part), price: sitePrice(part) })));
      expect(setBundle(t)).toEqual(expected);
      expect(sitePrice(t)).toBe(expected.total);
      // The tier card: the bundle price, the parts' total to strike, and the saving.
      expect(priceDisplay(t)).toEqual({ current: expected.total, bundle: expected });
      expect(expected.discount).toBeGreaterThan(0);
      expect(expected.alaCarte).toBe(parts.reduce((s, part) => s + cents(sitePrice(part)), 0) / 100);
    });
  }
  it("the three enabled sets: two digital, 12 cards + 18 × 24, 24 cards + 24 × 36 — each with the 2-product rate", () => {
    expect(SET_PARTS["GDE-ANY-SET-DIG"]).toEqual(["GDE-ANY-CARD-DIG", "GDE-ANY-POST-DIG"]);
    expect(SET_PARTS["GDE-ANY-SET-PRINT"]).toEqual(["GDE-ANY-CARD-P12", "GDE-ANY-POST-P1824"]);
    expect(SET_PARTS["GDE-ANY-SET-DLX"]).toEqual(["GDE-ANY-CARD-P24", "GDE-ANY-POST-P2436"]);
    for (const sku of ["GDE-ANY-SET-DIG", "GDE-ANY-SET-PRINT", "GDE-ANY-SET-DLX"]) expect(setBundle(getTier(sku)!).discountRate, sku).toBe(0.15);
    expect(p("GDE-ANY-SET-DIG")).toBe(floorTo99(2 * DIGITAL_PRICE * 0.85));
  });
  it("Etsy's set data stays the Etsy listings' own (the site only reads etsySale for single printed items)", () => {
    expect(getTier("GDE-ANY-SET-PRINT")).toMatchObject({ etsyBase: 89.99, etsySale: 62.99 });
    expect(() => bundleProductOf(getTier("GDE-ANY-SET-PRINT")!)).toThrow();
  });
});
