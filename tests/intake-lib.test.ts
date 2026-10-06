import { describe, expect, it } from "vitest";
import { getTier } from "../lib/catalog/prices";
import { INTAKE_COPY } from "../lib/intake/copy";
import { PRICE_ON_PROOF, PRODUCTS, choiceLabel, optionPriceLabel, productFromLabel, setFromLabel } from "../lib/intake/products";
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
  it("every priced option points at an ENABLED tier, and the cheapest priced option is the 'from' price", () => {
    for (const p of PRODUCTS) {
      for (const o of p.options) {
        if (!o.sku) continue;
        const tier = getTier(o.sku);
        expect(tier, `${p.key}.${o.key} → ${o.sku}`).toBeDefined();
        expect(tier?.enabled, `${o.sku} enabled`).toBe(true);
        expect(optionPriceLabel(o)).toMatch(/^\$\d+\.99$/);
      }
    }
    expect(productFromLabel(PRODUCTS[0])).toMatch(/^from \$\d+\.99$/);
    expect(setFromLabel()).toMatch(/^from \$\d+\.99$/);
  });
  it("the blanket is priced on the proof — never a typed number", () => {
    for (const key of ["blanket"]) {
      const p = PRODUCTS.find((x) => x.key === key)!;
      expect(productFromLabel(p)).toBeNull();
      for (const o of p.options) expect(optionPriceLabel(o)).toBe(PRICE_ON_PROOF);
    }
    const src = [PRICE_ON_PROOF, ...PRODUCTS.flatMap((p) => [p.blurb, ...p.options.flatMap((o) => [o.label, o.detail])])].join("\n");
    expect(src).not.toMatch(/\$\d/);
  });
  it("blanket sizes are the three the listing sells; banner options are the live listings' four variants", () => {
    expect(PRODUCTS.find((p) => p.key === "blanket")!.options.map((o) => o.key)).toEqual(["30x40", "50x60", "60x80"]);
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
    expect(INTAKE_COPY.h1.endsWith(".")).toBe(true);
    expect(INTAKE_COPY.h1.length).toBeLessThanOrEqual(40);
  });
});
