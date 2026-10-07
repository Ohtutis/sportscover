import { describe, expect, it } from "vitest";
import { blanketTiers, bundleTotal, formatUsd, getTier, sitePrice } from "../lib/catalog/prices";
import { INTAKE_COPY } from "../lib/intake/copy";
import { PRODUCTS, choiceLabel, optionPrice, optionPriceLabel, orderBundle, productFromLabel, setFromLabel } from "../lib/intake/products";
import { CONSENTS, CONSENT_ORDER, PHOTO_RULES, REQUEST_ID, SPORT_OTHER, SPORT_OTHER_MAX, makeRequestId, parseProofRequest } from "../lib/intake/types";
import { renderSummary, sportLabel } from "../lib/intake/server/summary";
import { ownerSubject } from "../lib/intake/server/email";
import type { StoredRequest } from "../lib/intake/server/record";

const photos = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `IMG_${i}.jpg`, size: 2_000_000, type: "image/jpeg" }));

const valid = () => ({
  products: [
    { product: "cards", option: "p12", quantity: 1 },
    { product: "blanket", option: "50x60", quantity: 2 },
  ],
  style: "SN",
  athlete: { firstName: "Marcus", lastName: "Ellison", sportSlug: "basketball", jerseyNumber: "12", position: "Guard", team: "Cedar Ridge Bears", season: "2026", stats: [{ value: "18.4", label: "PPG" }] },
  contact: { name: "Dana Ellison", email: "Dana@Example.com", phone: "", country: "United States" },
  consents: { guardian: true, biometric: true, license: true },
  photos: photos(5),
  source: { landingPath: "/free-proof", utm: { utm_source: "meta", fbclid: "abc" } },
});

describe("intake products (lib/intake/products.ts)", () => {
  it("every option points at an ENABLED tier, and the cheapest option is the 'from' price", () => {
    for (const p of PRODUCTS) {
      for (const o of p.options) {
        expect(o.sku, `${p.key}.${o.key} has a tier`).toBeTruthy();
        const tier = getTier(o.sku);
        expect(tier, `${p.key}.${o.key} → ${o.sku}`).toBeDefined();
        expect(tier?.enabled, `${o.sku} enabled`).toBe(true);
        expect(optionPriceLabel(o)).toMatch(/^\$\d+\.99$/);
        expect(optionPrice(o)).toBe(sitePrice(tier!));
      }
      expect(productFromLabel(p)).toBe(`from ${formatUsd(Math.min(...p.options.map(optionPrice)))}`);
    }
    expect(productFromLabel(PRODUCTS[0])).toMatch(/^from \$\d+\.99$/);
    expect(setFromLabel()).toMatch(/^from \$\d+\.99$/);
  });
  it("the blanket is priced from its ladder (pricing v1, 2026-10-07) — never a typed number", () => {
    const blanket = PRODUCTS.find((x) => x.key === "blanket")!;
    expect(blanket.options.map((o) => o.sku)).toEqual(blanketTiers.map((t) => t.sku));
    for (const o of blanket.options) expect(optionPriceLabel(o)).toBe(formatUsd(sitePrice(getTier(o.sku)!)));
    expect(productFromLabel(blanket)).toBe(`from ${formatUsd(Math.min(...blanketTiers.map((t) => sitePrice(t))))}`);
    const src = PRODUCTS.flatMap((p) => [p.blurb, ...p.options.flatMap((o) => [o.label, o.detail])]).join("\n");
    expect(src).not.toMatch(/\$\d/);
  });
  it("orderBundle: the chosen options through bundleTotal — distinct products, a stored quantity counts each copy", () => {
    const price = (product: string, option: string) => optionPrice(PRODUCTS.find((p) => p.key === product)!.options.find((o) => o.key === option)!);
    expect(orderBundle([])).toBeNull();
    expect(orderBundle([{ product: "cards", option: "p12" }])).toEqual(bundleTotal([{ product: "cards", price: price("cards", "p12") }]));
    const four = orderBundle([
      { product: "cards", option: "p12" },
      { product: "poster", option: "p1824" },
      { product: "banner", option: "2x4" },
      { product: "blanket", option: "50x60" },
    ])!;
    expect(four.productCount).toBe(4);
    expect(four.discountRate).toBe(0.25);
    expect(four.alaCarte).toBe(Math.round((price("cards", "p12") + price("poster", "p1824") + price("banner", "2x4") + price("blanket", "50x60")) * 100) / 100);
    const twoOfOne = orderBundle([{ product: "blanket", option: "50x60", quantity: 2 }, { product: "cards", option: "digital", quantity: 1 }])!;
    expect(twoOfOne.productCount).toBe(2);
    expect(twoOfOne.alaCarte).toBe(Math.round((2 * price("blanket", "50x60") + price("cards", "digital")) * 100) / 100);
    // An unknown choice is left out, never priced.
    expect(orderBundle([{ product: "mug", option: "x" }])).toBeNull();
  });
  it("blanket options are the listing's digital files and three sizes; banner options are the live listings' four variants", () => {
    expect(PRODUCTS.find((p) => p.key === "blanket")!.options.map((o) => [o.key, o.sku])).toEqual([
      ["digital", "GDE-ANY-BLK-DIG"], ["30x40", "GDE-ANY-BLK-3040"], ["50x60", "GDE-ANY-BLK-5060"], ["60x80", "GDE-ANY-BLK-6080"],
    ]);
    expect(PRODUCTS.find((p) => p.key === "banner")!.options.map((o) => [o.key, o.sku])).toEqual([
      ["digital", "GDE-ANY-BAN-DIG"], ["1x2", "GDE-ANY-BAN-1X2"], ["2x4", "GDE-ANY-BAN-2X4"], ["3x6", "GDE-ANY-BAN-3X6"],
    ]);
    expect(choiceLabel("cards", "p12")).toBe("Trading cards · 12 printed cards");
  });
});

describe("parseProofRequest (lib/intake/types.ts)", () => {
  it("accepts a complete request and normalises it", () => {
    const r = parseProofRequest(valid());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.contact.email).toBe("dana@example.com");
    expect(r.value.products).toHaveLength(2);
    expect(r.value.products[1].quantity).toBe(2);
    expect(r.value.athlete.classOf).toBe("");
    expect(r.value.source.utm).toEqual({ utm_source: "meta", fbclid: "abc" });
    expect(r.value.consents.marketing).toBe(false);
  });
  it("requires the three consents, 4–10 photos, a product, a style and a reachable parent", () => {
    const r = parseProofRequest({ ...valid(), consents: { guardian: true }, photos: photos(3), products: [], style: "ZZ", contact: { name: "", email: "nope" } });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(Object.keys(r.errors).sort()).toEqual(
      ["consents.biometric", "consents.license", "contact.email", "contact.name", "photos", "products", "style"].sort(),
    );
    expect(r.errors.photos).toContain("4–10");
  });
  it("Senior Night needs the class year; numberless sports drop the number; a crest needs its own consent", () => {
    const sr = parseProofRequest({ ...valid(), style: "SR" });
    expect(sr.ok).toBe(false);
    if (!sr.ok) expect(sr.errors["athlete.classOf"]).toBeDefined();
    const gym = parseProofRequest({ ...valid(), athlete: { ...valid().athlete, sportSlug: "gymnastics", jerseyNumber: "7" } });
    expect(gym.ok && gym.value.athlete.jerseyNumber).toBe("");
    const crest = parseProofRequest({ ...valid(), crest: { name: "crest.svg", size: 4000, type: "image/svg+xml" } });
    expect(crest.ok).toBe(false);
    if (!crest.ok) expect(crest.errors["consents.crest"]).toBeDefined();
    const crestOk = parseProofRequest({ ...valid(), crest: { name: "crest.svg", size: 4000, type: "image/svg+xml" }, consents: { guardian: true, biometric: true, license: true, crest: true } });
    expect(crestOk.ok).toBe(true);
  });
  it("accepts HEIC by extension when the browser sends no MIME type, rejects oversize files and the honeypot", () => {
    const heic = parseProofRequest({ ...valid(), photos: [...photos(3), { name: "IMG_9.HEIC", size: 3_000_000, type: "" }] });
    expect(heic.ok).toBe(true);
    const big = parseProofRequest({ ...valid(), photos: [...photos(3), { name: "x.jpg", size: PHOTO_RULES.maxBytes + 1, type: "image/jpeg" }] });
    expect(big.ok).toBe(false);
    const bot = parseProofRequest({ ...valid(), website: "http://spam" });
    expect(bot.ok).toBe(false);
  });
  it("consent sentences are the spec's, versioned, and the required three come first", () => {
    expect(CONSENT_ORDER.slice(0, 3)).toEqual(["guardian", "biometric", "license"]);
    expect(CONSENTS.biometric.text).toContain("/privacy/biometric");
    expect(CONSENTS.crest.text).toContain("NFL, FIFA, NCAA, Olympic");
    for (const k of CONSENT_ORDER) expect(CONSENTS[k].text.trim().endsWith(".")).toBe(true);
  });
  it("mints a date-sorted reference id", () => {
    const id = makeRequestId(new Date("2026-10-04T12:00:00Z"), () => 0.5);
    expect(id).toMatch(REQUEST_ID);
    expect(id.startsWith("GDE-R-20261004-")).toBe(true);
  });
});

describe("'Other sport or activity' (owner, 2026-10-06) — the typed words, never Skateboarding", () => {
  const other = (sportOther: unknown, extra: Record<string, unknown> = {}) =>
    parseProofRequest({ ...valid(), athlete: { ...valid().athlete, sportSlug: SPORT_OTHER, sportOther, ...extra } });

  it("accepts 'other' with the typed sport or activity — trimmed, at most 40 characters — and keeps the optional number", () => {
    const r = other("  Rowing  ");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.athlete).toMatchObject({ sportSlug: "other", sportOther: "Rowing", jerseyNumber: "12" });
    const long = other("x".repeat(80));
    expect(long.ok && long.value.athlete.sportOther).toBe("x".repeat(SPORT_OTHER_MAX));
    expect(SPORT_OTHER_MAX).toBe(40);
  });

  it("rejects 'other' without words, on its own field — and never asks for the catalog sport instead", () => {
    for (const empty of ["", "   ", undefined, 42]) {
      const r = other(empty);
      expect(r.ok, String(empty)).toBe(false);
      if (r.ok) continue;
      expect(r.errors["athlete.sportOther"]).toBe("Tell us the sport or activity.");
      expect(r.errors).not.toHaveProperty("athlete.sportSlug");
    }
  });

  it("never confuses it with other-sport (the catalog's Skateboarding, code OTH): each keeps its own slug and label", () => {
    expect(SPORT_OTHER).toBe("other");
    const skate = parseProofRequest({ ...valid(), athlete: { ...valid().athlete, sportSlug: "other-sport", sportOther: "rowing" } });
    expect(skate.ok).toBe(true);
    if (!skate.ok) return;
    // The catalog sport never carries typed words, and prints as Skateboarding.
    expect(skate.value.athlete).toMatchObject({ sportSlug: "other-sport", sportOther: "" });
    expect(sportLabel("other-sport")).toBe("Skateboarding");
    expect(sportLabel(SPORT_OTHER, "rowing")).toBe("Other: rowing");
    expect(sportLabel("basketball", "rowing")).toBe("Basketball");
    // An unknown slug is still refused as a sport — "other" is the only free-text door.
    const bad = parseProofRequest({ ...valid(), athlete: { ...valid().athlete, sportSlug: "rowing" } });
    expect(bad.ok ? {} : bad.errors).toHaveProperty("athlete.sportSlug");
  });

  it("the owner's and the customer's summaries, and the owner's subject line, print the typed activity", () => {
    const parsed = other("rowing");
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const r: StoredRequest = {
      ...parsed.value,
      requestId: "GDE-R-20261006-7KQ2MX",
      status: "received",
      createdAt: "2026-10-06T12:00:00.000Z",
      ipHash: "0".repeat(64),
      userAgent: "ua",
      issued: { photos: parsed.value.photos.map((_, i) => `p/${i}`), crest: null },
    };
    for (const audience of ["owner", "customer"] as const) {
      const text = renderSummary(r, { audience });
      expect(text, audience).toContain("Sport: Other: rowing");
      expect(text, audience).not.toContain("Skateboarding");
    }
    expect(ownerSubject(r)).toBe("Free proof request GDE-R-20261006-7KQ2MX — Marcus Ellison (Other: rowing, Stadium Night)");
    // A record stored before the field existed still prints.
    const legacy = { ...r, athlete: { ...r.athlete, sportSlug: "basketball", sportOther: undefined as unknown as string } };
    expect(renderSummary(legacy, { audience: "owner" })).toContain("Sport: Basketball");
  });
});

describe("intake copy", () => {
  it("uses the site's delivery clocks and never a provider name or a typed price", () => {
    const all = JSON.stringify(INTAKE_COPY);
    expect(all).toContain("1–2 business days");
    expect(all).toContain("5–7");
    expect(all).not.toMatch(/\b(stripe|paypal|wise|revolut)\b/i);
    expect(all).not.toMatch(/\$\d/);
    // The bundle copy compares with buying separately — never a sale, a former price or a clock (FTC / Omnibus).
    const bundle = [
      INTAKE_COPY.bundle.title,
      INTAKE_COPY.bundle.lead,
      ...[2, 3, 4].map((n) => INTAKE_COPY.bundle.step(n, n === 4, "15%")),
      INTAKE_COPY.bundle.nudgeFirst("a poster", "$1.00"),
      INTAKE_COPY.bundle.nudgeMore("a banner", "$1.00"),
      INTAKE_COPY.bundle.top("25%"),
      INTAKE_COPY.summary.separately,
      INTAKE_COPY.summary.bundleSaving,
      INTAKE_COPY.summary.savingValue("$1.00", "15%"),
    ].join(" ");
    expect(bundle).not.toMatch(/\bsale\b|\bwas\b|regular price|limited time|\bends?\b|% off|\bdiscount/i);
    expect(INTAKE_COPY.h1.endsWith(".")).toBe(true);
    // v8: three lines at 19ch ("TURN THEIR PHOTOS / INTO THEIR OWN / SPORTS COLLECTIBLE.").
    expect(INTAKE_COPY.h1.length).toBeLessThanOrEqual(60);
    expect(INTAKE_COPY.h1).toBe("TURN THEIR PHOTOS INTO THEIR OWN SPORTS COLLECTIBLE.");
  });
});
