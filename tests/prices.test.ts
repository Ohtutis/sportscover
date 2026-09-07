import { describe, expect, it } from "vitest";
import {
  ceilTo99,
  ceilToHalf,
  etsyBuyerNow,
  getTier,
  perCardAnchor,
  priceDisplay,
  saleEndsLabel,
  siteBase,
  sitePrice,
  siteSale,
  tiers,
  SALE_EXPIRES_AT,
} from "../lib/catalog/prices";

// Fixed `now` values on either side of the sale end (GAPS #28) — never the wall clock.
const during = new Date(new Date(SALE_EXPIRES_AT).getTime() - 86_400_000);
const after = new Date(new Date(SALE_EXPIRES_AT).getTime() + 86_400_000);

describe("price rule: site = Etsy × 1.10, rounded up to .99, never below Etsy", () => {
  it("ceilTo99 rounds up to the next .99", () => {
    expect(ceilTo99(32.33)).toBe(32.99);
    expect(ceilTo99(53.89)).toBe(53.99);
    expect(ceilTo99(53.99)).toBe(53.99);
    expect(ceilTo99(54.0)).toBe(54.99);
  });
  for (const t of tiers) {
    it(`${t.sku} is above Etsy in both sale states`, () => {
      expect(siteSale(t)).toBeGreaterThan(t.etsySale);
      expect(siteBase(t)).toBeGreaterThan(t.etsyBase);
      expect(sitePrice(t, during)).toBeGreaterThan(etsyBuyerNow(t, during));
      expect(sitePrice(t, after)).toBeGreaterThan(etsyBuyerNow(t, after));
      expect(String(sitePrice(t, during))).toMatch(/\.99$/);
      expect(String(sitePrice(t, after))).toMatch(/\.99$/);
    });
  }
  it("shows the struck-through base only while the sale runs", () => {
    const t = tiers[1];
    expect(priceDisplay(t, during).compareAt).toBe(siteBase(t));
    expect(priceDisplay(t, after).compareAt).toBeUndefined();
    expect(priceDisplay(t, after).current).toBe(siteBase(t));
  });
  it("variant names match Etsy's 20-character limit", () => {
    for (const t of tiers) expect(t.name.length).toBeLessThanOrEqual(20);
  });
  it("ceilToHalf rounds up to the next half", () => {
    expect(ceilToHalf(4.499)).toBe(4.5);
    expect(ceilToHalf(4.5)).toBe(4.5);
    expect(ceilToHalf(6.416)).toBe(6.5);
    expect(ceilToHalf(6.01)).toBe(6.5);
    expect(ceilToHalf(7)).toBe(7);
  });
  it("perCardAnchor is computed from the 12-card tier, never typed (D23: 4.5 during the sale)", () => {
    const p12 = getTier("GDE-ANY-CARD-P12")!;
    expect(perCardAnchor(during)).toBe(4.5);
    expect(perCardAnchor(during)).toBe(ceilToHalf(sitePrice(p12, during) / 12));
    expect(perCardAnchor(after)).toBe(ceilToHalf(siteBase(p12) / 12));
    expect(perCardAnchor(after)).toBeGreaterThan(perCardAnchor(during));
  });
  it("saleEndsLabel prints the sale end as the site shows it", () => {
    expect(saleEndsLabel()).toBe("Sep 24, 2026");
  });
});
