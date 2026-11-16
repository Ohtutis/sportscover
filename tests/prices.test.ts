// Pricing v1 (owner decision 2026-10-07): digital DIGITAL_PRICE everywhere; printed = Etsy's buyer price
// × SITE_MARKUP rounded UP to .99 (always above Etsy); no comparison price on a single item; 2 / 3 / 4
// different PRINTED products save 15 / 20 / 25 %, the printed total rounded DOWN to .99 so the stated rate
// is never under-delivered. Pricing v2 (the same evening): digital files cost nothing extra, so after the
// first product every further product as digital files is DIGITAL_ADDON — four digital products are
// DIGITAL_PRICE + 3 × DIGITAL_ADDON, a digital product on a printed order is the add-on. The set tiers are
// the bundle of their parts. Every expected figure is derived from the rule, except the few the owner's
// brief names outright (the table below, and the digital figures), which pin the rule.
import { describe, expect, it } from "vitest";
import {
  BUNDLE_STEPS,
  DIGITAL_ADDON,
  DIGITAL_PRICE,
  SET_PARTS,
  SITE_MARKUP,
  bannerTiers,
  blanketTiers,
  bundleDiscountRate,
  bundleProductOf,
  bundleTotal,
  allDigitalTotal,
  type BundleLine,
  ceilTo99,
  ceilToHalf,
  etsyBuyerPrice,
  floorTo99,
  formatPercent,
  formatUsdShort,
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
      "GDE-ANY-BLK-DIG": 19.99,
      "GDE-ANY-BLK-3040": 53.99,
      "GDE-ANY-BLK-5060": 76.99,
      "GDE-ANY-BLK-6080": 109.99,
    };
    for (const [sku, price] of Object.entries(table)) expect(p(sku), sku).toBe(price);
  });
  it("the blanket ladder: the Etsy listing's four variants (digital first), Etsy's buyer prices, etsyBase = etsySale ÷ 0.7 on the .99", () => {
    expect(blanketTiers.map((t) => t.etsySale)).toEqual([17.49, 48.99, 69.29, 99.39]);
    expect(blanketTiers.map((t) => t.physical)).toEqual([false, true, true, true]);
    for (const t of blanketTiers) {
      expect(t.family).toBe("blanket");
      expect(t.enabled).toBe(true);
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

/** A bundle line from a SKU: the tier's site price, digital when the tier is not physical. */
const line = (product: string, sku: string): BundleLine => ({ product, price: p(sku), digital: !getTier(sku)!.physical });

describe("the bundle: printed 2 → 15 %, 3 → 20 %, all 4 → 25 % down to .99; digital files DIGITAL_PRICE, then DIGITAL_ADDON each (pricing v2)", () => {
  it("bundleDiscountRate", () => {
    expect([0, 1, 2, 3, 4].map(bundleDiscountRate)).toEqual([0, 0, 0.15, 0.2, 0.25]);
    expect(BUNDLE_STEPS.map((s) => [s.count, s.percent])).toEqual([
      [2, 15],
      [3, 20],
      [4, 25],
    ]);
    expect(formatPercent(0.15)).toBe("15%");
    // Whole percents, rounded DOWN: the chip never states more than the order saves.
    expect(formatPercent(0.1551)).toBe("15%");
    expect(formatPercent(0.2)).toBe("20%");
    expect(formatPercent(0.29)).toBe("29%");
    expect(formatPercent(0.5624)).toBe("56%");
  });
  it("one product is its own price — nothing struck, nothing saved", () => {
    const one = bundleTotal([line("cards", "GDE-ANY-CARD-P12")]);
    expect(one).toEqual({ productCount: 1, alaCarte: p("GDE-ANY-CARD-P12"), discountRate: 0, discount: 0, total: p("GDE-ANY-CARD-P12") });
    const digital = bundleTotal([line("cards", "GDE-ANY-CARD-DIG")]);
    expect(digital).toEqual({ productCount: 1, alaCarte: DIGITAL_PRICE, discountRate: 0, discount: 0, total: DIGITAL_PRICE });
    expect(bundleTotal([])).toEqual({ productCount: 0, alaCarte: 0, discountRate: 0, discount: 0, total: 0 });
  });
  it("counts DIFFERENT products: two lines of one product are not a bundle", () => {
    const twice = bundleTotal([
      { product: "cards", price: 38.99, digital: false },
      { product: "cards", price: 38.99, digital: false },
    ]);
    expect(twice.productCount).toBe(1);
    expect(twice.discount).toBe(0);
    expect(twice.total).toBe(77.98);
  });
  it("the owner's digital figures: the first 19.99, the second, third and fourth 5 each — and a digital product on a printed order is the add-on", () => {
    expect(DIGITAL_ADDON).toBe(5);
    expect([0, 1, 2, 3, 4].map(allDigitalTotal)).toEqual([0, 19.99, 24.99, 29.99, 34.99]);
    const digital = ["GDE-ANY-CARD-DIG", "GDE-ANY-POST-DIG", "GDE-ANY-BAN-DIG", "GDE-ANY-BLK-DIG"];
    const products = ["cards", "poster", "banner", "blanket"];
    for (let n = 1; n <= 4; n++) {
      const b = bundleTotal(digital.slice(0, n).map((sku, i) => line(products[i], sku)));
      expect(b.total, `${n} digital`).toBe(allDigitalTotal(n));
      expect(cents(b.alaCarte)).toBe(n * cents(DIGITAL_PRICE));
      // The digital saving beats the printed ladder's rate at every rung (the owner's rule).
      if (n >= 2) expect(b.discountRate, `${n} digital`).toBeGreaterThan(bundleDiscountRate(n));
    }
    const four = bundleTotal(digital.map((sku, i) => line(products[i], sku)));
    expect(four).toMatchObject({ productCount: 4, alaCarte: 79.96, discount: 44.97, total: 34.99 });
    expect(formatPercent(four.discountRate)).toBe("56%");
    // A printed poster + the cards' digital files: the poster's own price plus the add-on — nothing else moves.
    const mixed = bundleTotal([line("poster", "GDE-ANY-POST-P1824"), line("cards", "GDE-ANY-CARD-DIG")]);
    expect(mixed.total).toBe(Math.round((p("GDE-ANY-POST-P1824") + DIGITAL_ADDON) * 100) / 100);
    expect(mixed.total).toBe(51.99);
    // Two printed (the printed ladder) + two digital (two add-ons).
    const twoTwo = bundleTotal([line("cards", "GDE-ANY-CARD-P12"), line("poster", "GDE-ANY-POST-P1824"), line("banner", "GDE-ANY-BAN-DIG"), line("blanket", "GDE-ANY-BLK-DIG")]);
    expect(twoTwo.total).toBe(Math.round((floorTo99(85.98 * 0.85) + 2 * DIGITAL_ADDON) * 100) / 100);
    expect(twoTwo.total).toBe(82.99);
    expect(formatUsdShort(DIGITAL_ADDON)).toBe("$5");
    expect(formatUsdShort(DIGITAL_PRICE)).toBe("$19.99");
  });

  /** Every combination of one option per product, for every subset of products. */
  const OPTIONS: Record<string, string[]> = {
    cards: ["GDE-ANY-CARD-DIG", "GDE-ANY-CARD-P12", "GDE-ANY-CARD-P24"],
    poster: ["GDE-ANY-POST-DIG", "GDE-ANY-POST-P1824", "GDE-ANY-POST-P2436"],
    banner: ["GDE-ANY-BAN-DIG", "GDE-ANY-BAN-1X2", "GDE-ANY-BAN-2X4", "GDE-ANY-BAN-3X6"],
    blanket: ["GDE-ANY-BLK-DIG", "GDE-ANY-BLK-3040", "GDE-ANY-BLK-5060", "GDE-ANY-BLK-6080"],
  };
  function* combos(keys: string[]): Generator<BundleLine[]> {
    if (!keys.length) {
      yield [];
      return;
    }
    const [head, ...rest] = keys;
    for (const tail of combos(rest)) {
      yield tail;
      for (const sku of OPTIONS[head]) yield [line(head, sku), ...tail];
    }
  }
  it("every mix of products and options: the printed lines are the printed ladder by their number (on .99, never under the rate), every digital line the add-on after the first product", () => {
    let checked = 0;
    for (const lines of combos(Object.keys(OPTIONS))) {
      if (lines.length < 2) continue;
      const b = bundleTotal(lines);
      const alaCarte = lines.reduce((s, l) => s + cents(l.price), 0);
      const printed = lines.filter((l) => !l.digital);
      const digitalCount = lines.length - printed.length;
      const printedCents = printed.reduce((s, l) => s + cents(l.price), 0);
      const rate = bundleDiscountRate(printed.length);
      const digitalCents = printed.length ? digitalCount * cents(DIGITAL_ADDON) : cents(DIGITAL_PRICE) + (digitalCount - 1) * cents(DIGITAL_ADDON);
      expect(cents(b.alaCarte)).toBe(alaCarte);
      expect(b.productCount).toBe(lines.length);
      expect(String(b.total)).toMatch(/\.99$/);
      // The printed part: at or under printed × (1 − rate), within a dollar; the digital part exact.
      const printedPart = cents(b.total) - digitalCents;
      expect(printedPart).toBeLessThanOrEqual(printedCents * (1 - rate));
      expect(printedPart).toBeGreaterThan(printedCents * (1 - rate) - 100);
      expect(cents(b.discount)).toBe(alaCarte - cents(b.total));
      expect(b.discountRate).toBeCloseTo(b.discount / b.alaCarte, 10);
      expect(cents(b.total)).toBeLessThanOrEqual(alaCarte);
      checked++;
    }
    expect(checked).toBeGreaterThan(300);
  });
  it("adding a product never lowers the total, and moving a product from digital files to print never lowers it either", () => {
    const keys = Object.keys(OPTIONS);
    for (const lines of combos(keys)) {
      const base = bundleTotal(lines).total;
      for (const key of keys) {
        if (lines.some((l) => l.product === key)) continue;
        for (const sku of OPTIONS[key]) expect(bundleTotal([...lines, line(key, sku)]).total, `${key} ${sku}`).toBeGreaterThanOrEqual(base);
      }
      for (const l of lines) {
        if (!l.digital) continue;
        for (const sku of OPTIONS[l.product]) {
          if (!getTier(sku)!.physical) continue;
          expect(bundleTotal(lines.map((x) => (x === l ? line(l.product, sku) : x))).total, `${l.product} → ${sku}`).toBeGreaterThan(base);
        }
      }
    }
  });
  it("the brief's examples: 2, 3 and 4 printed products", () => {
    const two = bundleTotal([line("cards", "GDE-ANY-CARD-P12"), line("poster", "GDE-ANY-POST-P1824")]);
    expect(two).toMatchObject({ productCount: 2, alaCarte: 85.98, total: floorTo99(85.98 * 0.85) });
    expect(two.total).toBe(72.99);
    // The rate is the ladder's or a hair above it (the total rounds down to .99) — never under.
    expect(two.discountRate).toBeGreaterThanOrEqual(0.15);
    expect(formatPercent(two.discountRate)).toBe("15%");
    const four = bundleTotal([line("cards", "GDE-ANY-CARD-P12"), line("poster", "GDE-ANY-POST-P1824"), line("banner", "GDE-ANY-BAN-2X4"), line("blanket", "GDE-ANY-BLK-5060")]);
    expect(four.total).toBe(floorTo99((p("GDE-ANY-CARD-P12") + p("GDE-ANY-POST-P1824") + p("GDE-ANY-BAN-2X4") + p("GDE-ANY-BLK-5060")) * 0.75));
    expect(four.discountRate).toBeGreaterThanOrEqual(0.25);
    expect(formatPercent(four.discountRate)).toBe("25%");
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
      const expected = bundleTotal(parts.map((part) => ({ product: bundleProductOf(part), price: sitePrice(part), digital: !part.physical })));
      expect(setBundle(t)).toEqual(expected);
      expect(sitePrice(t)).toBe(expected.total);
      // The tier card: the bundle price, the parts' total to strike, and the saving.
      expect(priceDisplay(t)).toEqual({ current: expected.total, bundle: expected });
      expect(expected.discount).toBeGreaterThan(0);
      expect(expected.alaCarte).toBe(parts.reduce((s, part) => s + cents(sitePrice(part)), 0) / 100);
    });
  }
  it("the three enabled sets: two digital (the add-on, pricing v2), 12 cards + 18 × 24, 24 cards + 24 × 36 (the 2-product rate)", () => {
    expect(SET_PARTS["GDE-ANY-SET-DIG"]).toEqual(["GDE-ANY-CARD-DIG", "GDE-ANY-POST-DIG"]);
    expect(SET_PARTS["GDE-ANY-SET-PRINT"]).toEqual(["GDE-ANY-CARD-P12", "GDE-ANY-POST-P1824"]);
    expect(SET_PARTS["GDE-ANY-SET-DLX"]).toEqual(["GDE-ANY-CARD-P24", "GDE-ANY-POST-P2436"]);
    for (const sku of ["GDE-ANY-SET-PRINT", "GDE-ANY-SET-DLX"]) {
      expect(setBundle(getTier(sku)!).discountRate, sku).toBeGreaterThanOrEqual(0.15);
      expect(formatPercent(setBundle(getTier(sku)!).discountRate), sku).toBe("15%");
    }
    // The digital set: the cards' files and the poster's files as the add-on — and still above Etsy's digital set.
    expect(p("GDE-ANY-SET-DIG")).toBe(allDigitalTotal(2));
    expect(p("GDE-ANY-SET-DIG")).toBe(24.99);
    expect(p("GDE-ANY-SET-DIG")).toBeGreaterThan(getTier("GDE-ANY-SET-DIG")!.etsySale);
  });
  it("Etsy's set data stays the Etsy listings' own (the site only reads etsySale for single printed items)", () => {
    expect(getTier("GDE-ANY-SET-PRINT")).toMatchObject({ etsyBase: 89.99, etsySale: 62.99 });
    expect(() => bundleProductOf(getTier("GDE-ANY-SET-PRINT")!)).toThrow();
  });
});
