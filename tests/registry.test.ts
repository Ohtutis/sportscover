// Real QR codes only: every card ID printed on a listing image or card back must resolve.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import {
  cardStats,
  cards,
  channelOf,
  deletedCardPaths,
  getCard,
  isIndexable,
  makeCardId,
  parseHighlight,
  privateCardPaths,
  registeredAtOf,
  seniorYears,
  showsJerseyNumber,
  styleCode,
  unlistedCardPaths,
  updatedAtOf,
  visibilityOf,
  type CardRecord,
} from "../lib/registry/cards";
import { cardMeta, cardTitle } from "../lib/seo/meta";
import { cardPageSku, ctaFor } from "../lib/cta";
import { sportByCode } from "../lib/catalog/sports";

/** IDs that appear in etsy/LISTING-STATE.md prose but were never printed (documented typos). */
const KNOWN_UNPRINTED = new Set(["GDE-PR-CHR-2026-00"]);

describe("registry", () => {
  it("has unique card IDs", () => {
    const ids = cards.map((c) => c.cardId);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("makeCardId appends a sequence on collision", () => {
    const p = { sportCode: "BKB", styleName: "Stadium Night", season: "2026", jerseyNumber: "12" };
    expect(makeCardId(p)).toBe("GDE-SN-BKB-2026-12-2");
    expect(makeCardId({ ...p, jerseyNumber: "99" })).toBe("GDE-SN-BKB-2026-99");
  });
  it("real customers are never public without consent", () => {
    for (const c of cards.filter((c) => !c.isFictional)) {
      if (isIndexable(c)) expect(c.consentPublicAt, `${c.cardId} public without consent`).toBeTruthy();
      expect(["unlisted", "private", "public", "deleted"]).toContain(visibilityOf(c));
    }
  });
  it("registeredAtOf / updatedAtOf resolve for every record (GAPS #36 fallbacks)", () => {
    const ISO = /^\d{4}-\d{2}-\d{2}$/;
    for (const c of cards) {
      expect(registeredAtOf(c), c.cardId).toMatch(ISO);
      expect(updatedAtOf(c), c.cardId).toMatch(ISO);
      expect(updatedAtOf(c) >= registeredAtOf(c), c.cardId).toBe(true);
    }
    const base = { createdAt: "2026-08-27" };
    expect(registeredAtOf(base)).toBe("2026-08-27");
    expect(updatedAtOf(base)).toBe("2026-08-27");
    expect(registeredAtOf({ ...base, registeredAt: "2026-09-01" })).toBe("2026-09-01");
    expect(updatedAtOf({ ...base, registeredAt: "2026-09-01" })).toBe("2026-09-01");
    expect(updatedAtOf({ ...base, registeredAt: "2026-09-01", updatedAt: "2026-09-05" })).toBe("2026-09-05");
  });
  it("every card ID printed in etsy/LISTING-STATE.md resolves", () => {
    const file = path.join(process.cwd(), "etsy", "LISTING-STATE.md");
    if (!fs.existsSync(file)) return;
    const ids = new Set(fs.readFileSync(file, "utf8").match(/GDE-[A-Z]{2}-[A-Z]{3}-20\d{2}-[0-9]{1,2}\b/g) ?? []);
    const missing = [...ids].filter((id) => !KNOWN_UNPRINTED.has(id) && !getCard(id));
    expect(missing).toEqual([]);
  });
});

describe("visibility and the record's own words (COPY §2.15, CONTRACTS §6.2)", () => {
  const unlisted = cards.filter((c) => visibilityOf(c) === "unlisted");
  it("there is at least one unlisted record to check", () => {
    expect(unlisted.length).toBeGreaterThan(0);
  });
  for (const c of unlisted) {
    it(`${c.cardId}: no first or last name in the title, description or OG`, () => {
      const text = JSON.stringify(cardMeta(c));
      expect(text).not.toContain(c.firstName);
      expect(text).not.toContain(c.lastName);
      expect(text).not.toContain(c.team);
      expect(cardTitle(c)).not.toContain(c.lastName);
      expect(JSON.parse(text).robots).toEqual({ index: false, follow: false });
    });
  }
  it("a private record's title and description carry no name", () => {
    const source = cards[0];
    const priv: CardRecord = { ...source, cardId: "GDE-XX-TST-2026-99", visibility: "private", isFictional: false };
    const text = JSON.stringify(cardMeta(priv));
    expect(text).not.toContain(priv.firstName);
    expect(text).not.toContain(priv.lastName);
    expect(cardTitle(priv)).toBe("Registered Edition");
  });
  it("path helpers list exactly the records of that visibility", () => {
    expect(unlistedCardPaths()).toEqual(unlisted.map((c) => `/c/${c.cardId}`));
    expect(privateCardPaths()).toEqual(cards.filter((c) => visibilityOf(c) === "private").map((c) => `/c/${c.cardId}`));
    expect(deletedCardPaths()).toEqual(cards.filter((c) => visibilityOf(c) === "deleted").map((c) => `/c/${c.cardId}`));
    for (const p of [...unlistedCardPaths(), ...privateCardPaths(), ...deletedCardPaths()]) expect(p.startsWith("/c/")).toBe(true);
  });
});

describe("showsJerseyNumber", () => {
  it("is false for every adult, whatever the sport", () => {
    for (const c of cards.filter((x) => x.ageBand === "adult")) expect(showsJerseyNumber(c), c.cardId).toBe(false);
    expect(cards.some((c) => c.ageBand === "adult")).toBe(true);
  });
  it("is false for the five sports that never wear a number", () => {
    for (const c of cards.filter((x) => ["CHR", "GYM", "SWM", "TEN", "GLF"].includes(x.sportCode))) {
      expect(showsJerseyNumber(c), c.cardId).toBe(false);
    }
  });
  it("is true for a numbered sport and a minor", () => {
    const c = getCard("GDE-SN-BKB-2026-12")!;
    expect(showsJerseyNumber(c)).toBe(true);
    expect(sportByCode(c.sportCode)?.numbered).toBe(true);
  });
});

describe("what /c reads off a record", () => {
  it("cardStats never returns an empty value and never more than three", () => {
    for (const c of cards) {
      const stats = cardStats(c);
      expect(stats.length).toBeLessThanOrEqual(3);
      for (const s of stats) expect(s.value.trim(), `${c.cardId} ${s.label}`).not.toBe("");
    }
    expect(cardStats(getCard("GDE-SN-BKB-2026-23")!).map((s) => s.label)).toEqual(["PPG", "APG", "RPG"]);
    expect(cardStats(getCard("GDE-SS-TEN-2026-12")!)).toEqual([]);
  });
  it("parseHighlight lifts the quote and the career fragment out of the printed line", () => {
    const sr = parseHighlight(getCard("GDE-SR-BKB-2026-12")!);
    expect(sr.quote).toBe("Leave it better than you found it.");
    expect(sr.line).not.toMatch(/FR 20\d\d/);
    expect(sr.line).not.toContain("Leave it better");
    expect(parseHighlight(getCard("GDE-FS-FTB-2026-54")!)).toEqual({
      line: "Three-year starter on the line \u00b7 2026 all-district.",
      quote: undefined,
    });
    expect(parseHighlight({ ...cards[0], playerHighlight: "" })).toEqual({});
  });
  it("seniorYears derives the four-year line from the class year", () => {
    expect(seniorYears("2026")).toEqual([
      { label: "FR", year: "2023" },
      { label: "SO", year: "2024" },
      { label: "JR", year: "2025" },
      { label: "SR", year: "2026" },
    ]);
    expect(seniorYears(undefined)).toBeUndefined();
  });
});

describe("ctaFor(\"card-page\") over every demo-etsy record (GAPS #18)", () => {
  for (const c of cards.filter((x) => channelOf(x) === "demo-etsy")) {
    it(`${c.cardId} → the expected SKU`, () => {
      const expected =
        styleCode(c.styleName) === "SR"
          ? `GDE-${c.sportCode}-SNSET`
          : sportByCode(c.sportCode)?.cardListingId
            ? `GDE-${c.sportCode}-CARD`
            : "GDE-ANY-SET";
      expect(cardPageSku(c)).toBe(expected);
      const cta = ctaFor("card-page", c);
      expect(cta.primary.href).toBe(`/go/etsy/${expected}`);
      expect(cta.primary.kind).toBe("outline");
      expect(cta.primary.label).toBe("Get yours on Etsy →");
      expect(cta.secondary).toBeUndefined();
      expect(cta.tone).toBe("arena");
    });
  }
});
