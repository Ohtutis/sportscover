// Real QR codes only: every card ID printed on a listing image or card back must resolve.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { cards, getCard, isIndexable, makeCardId, visibilityOf } from "../lib/registry/cards";

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
  it("every card ID printed in etsy/LISTING-STATE.md resolves", () => {
    const file = path.join(process.cwd(), "etsy", "LISTING-STATE.md");
    if (!fs.existsSync(file)) return;
    const ids = new Set(fs.readFileSync(file, "utf8").match(/GDE-[A-Z]{2}-[A-Z]{3}-20\d{2}-[0-9]{1,2}\b/g) ?? []);
    const missing = [...ids].filter((id) => !KNOWN_UNPRINTED.has(id) && !getCard(id));
    expect(missing).toEqual([]);
  });
});
