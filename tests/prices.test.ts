import { describe, expect, it } from "vitest";
import { ceilTo99, etsyBuyerNow, priceDisplay, siteBase, sitePrice, siteSale, tiers, SALE_EXPIRES_AT } from "../lib/catalog/prices";

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
});
