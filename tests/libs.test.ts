// The lib half of Wave 0 (wave0-libs): capacity dates, JSON-LD builders, the titles table and
// metadata, the FAQ data, seasons, shipping, colour, alt text, canon, reviews, the checklist and the
// catalog additions. Every date-dependent assertion passes a fixed `now` (GAPS #28).
import { describe, expect, it } from "vitest";
import {
  addBusinessDays,
  addCalendarDays,
  businessDaysBetween,
  christmasDates,
  committedDates,
  formatEt,
  isBusinessDay,
  LAB_HOLIDAYS,
  nextAvailableStart,
  nextBusinessDay,
  orderByFor,
  orderByForCalendar,
  seniorNightPlan,
  SR_LEAD,
  subtractBusinessDays,
  toEtDate,
  weekdayOf,
  WEEKLY_CAP,
} from "../lib/capacity";
import { CHIPS, chipSegment, LEAD_TIMES } from "../lib/catalog/delivery";
import { faq, FAQ_SUBSETS, faqAll, faqGroups, faqSubset } from "../lib/catalog/faq";
import { NEVER_ASKED_FOR, photoChecklist } from "../lib/catalog/photo-checklist";
import { SALE_EXPIRES_AT, getTier, isSaleActive, sitePrice, tiers, tiersFor } from "../lib/catalog/prices";
import { activeOccasions, inWindow, isChristmasWindow, occasionById, occasions } from "../lib/catalog/seasons";
import { PARTNERS, shippingRows, shipsFromFor, visibleShippingRows, visiblePartners, DIGITAL_SHIPS_FROM } from "../lib/catalog/shipping";
import { backLine, isNumberless, NUMBERLESS_CODES, postersSports, sportByCode, sports } from "../lib/catalog/sports";
import { styles, styleBySlug } from "../lib/catalog/styles";
import { boxContents, FILE_COUNTS, tierNotes, TRUE_COUNT_LINKS, TRUE_COUNTS, trueCountRest } from "../lib/catalog/tiers";
import { trustLineSegments, TRUST_SEGMENTS } from "../lib/catalog/trust";
import { ARENA, contrastRatio, hexToRgb, SILVER, teamAccent } from "../lib/color";
import { CANON, LOOKUP_STRINGS } from "../lib/copy/canon";
import { block } from "../lib/blocks";
import { ALT_REGISTERED_BACK, altBefore, altCardBack, altCardFront, altPoster, altProof, altRegisteredFront, altRoom } from "../lib/alt";
import { publishedReviews } from "../lib/reviews";
import { article, breadcrumbList, faqPage, imageObject, isoDatePlusDays, organization, person, productFamily, videoObject, website } from "../lib/seo/jsonld";
import { cardMeta, cardTitle, pageMeta } from "../lib/seo/meta";
import { DESCRIPTION_MAX, f1Pages, fullTitle, matchesPagePath, PAGES, substituteLongest, TITLE_MAX, TITLE_SUFFIX } from "../lib/seo/titles";
import { getCard } from "../lib/registry/cards";
import { ETSY_SHOP_URL, SITE_URL } from "../lib/site";
import fs from "node:fs";
import path from "node:path";

const NOW_SALE = new Date(new Date(SALE_EXPIRES_AT).getTime() - 86_400_000);
const NOW_AFTER = new Date(new Date(SALE_EXPIRES_AT).getTime() + 86_400_000);
const TODAY = "2026-09-14"; // a Monday

describe("capacity (CONTRACTS §4.4)", () => {
  it("the cap is off and the holidays are weekday dates", () => {
    expect(WEEKLY_CAP).toBeNull();
    for (const d of LAB_HOLIDAYS) {
      expect(d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect([0, 6]).not.toContain(weekdayOf(d));
    }
    expect(LAB_HOLIDAYS).toContain("2026-09-07");
  });
  it("skips weekends and holidays", () => {
    expect(isBusinessDay("2026-09-05")).toBe(false); // Saturday
    expect(isBusinessDay("2026-09-07")).toBe(false); // Labor Day
    expect(isBusinessDay("2026-09-08")).toBe(true);
    expect(nextBusinessDay("2026-09-05")).toBe("2026-09-08");
    expect(addBusinessDays("2026-09-04", 2)).toBe("2026-09-09");
    expect(addBusinessDays("2026-09-04", 0)).toBe("2026-09-04");
    expect(subtractBusinessDays("2026-09-09", 2)).toBe("2026-09-04");
    expect(businessDaysBetween("2026-09-04", "2026-09-09")).toBe(2);
    expect(addCalendarDays("2026-12-31", 1)).toBe("2027-01-01");
  });
  it("toEtDate is the Eastern calendar date", () => {
    expect(toEtDate(new Date("2026-09-14T03:30:00Z"))).toBe("2026-09-13");
    expect(toEtDate(new Date("2026-09-14T12:00:00Z"))).toBe("2026-09-14");
  });
  it("SR_LEAD matches the Senior Night chip", () => {
    expect(CHIPS.seniorNight).toContain("1 WEEK");
    expect(CHIPS.seniorNight).toContain("2 WEEKS");
    expect(CHIPS.seniorNight).toContain("3–4 WKS");
    expect(SR_LEAD.filesDaysBefore).toBe(7);
    expect(SR_LEAD.printedSetDaysBefore).toBe(14);
    expect(SR_LEAD.sealedPackDaysBefore).toEqual([21, 28]);
  });
  it("orderByFor is the latest date whose lead still lands on time", () => {
    const d = orderByFor("2026-09-16", 2);
    expect(d).toBe("2026-09-14");
    expect(addBusinessDays(d, 2) <= "2026-09-16").toBe(true);
    expect(addBusinessDays(addCalendarDays(d, 1), 2) > "2026-09-16").toBe(true);
    expect(orderByForCalendar("2026-10-04", 14)).toBe("2026-09-20");
  });
  it("seniorNightPlan: tomorrow → fallback; 3 days → files only; 10 → files; 20 → printed set; 40 → all", () => {
    const at = (days: number) => seniorNightPlan(addCalendarDays(TODAY, days), TODAY);
    const fits = (days: number) => Object.fromEntries(at(days).rows.map((r) => [r.key, r.fits]));
    expect(fits(1)).toEqual({ files: false, printedSet: false, sealedPack: false });
    expect(at(1).anythingPrintedFits).toBe(false);
    expect(fits(3)).toEqual({ files: true, printedSet: false, sealedPack: false });
    expect(fits(10)).toEqual({ files: true, printedSet: false, sealedPack: false });
    expect(at(10).bestTier).toBe("GDE-ANY-SNSET-DIG");
    expect(fits(20)).toEqual({ files: true, printedSet: true, sealedPack: false });
    expect(at(20).bestTier).toBe("GDE-ANY-SNSET-PRINT");
    expect(fits(40)).toEqual({ files: true, printedSet: true, sealedPack: true });
    const plan = at(20);
    expect(plan.rows[0].arrivesBy < plan.night).toBe(true);
    expect(plan.rows[1].orderBy).toBe("2026-09-20");
    for (const row of plan.rows) expect(row.fits).toBe(row.orderBy >= TODAY);
    expect(seniorNightPlan("2026-10-04", TODAY)).toEqual(seniorNightPlan("2026-10-04", TODAY));
  });
  it("christmasDates rolls the year over after Dec 24 and orders by a business-day lead", () => {
    const sept = christmasDates(new Date("2026-09-14T12:00:00Z"));
    expect(sept.year).toBe(2026);
    expect(addBusinessDays(sept.digitalBy, LEAD_TIMES.digitalBusinessDays[1]) <= "2026-12-24").toBe(true);
    expect(addBusinessDays(sept.printedBy, LEAD_TIMES.printShipBusinessDays[1] + 5) <= "2026-12-24").toBe(true);
    expect(sept.printedBy < sept.digitalBy).toBe(true);
    expect(christmasDates(new Date("2027-01-03T12:00:00Z")).year).toBe(2027);
    expect(christmasDates(new Date("2026-12-24T12:00:00Z")).year).toBe(2026);
  });
  it("nextAvailableStart and committedDates follow the chips", () => {
    const n = nextAvailableStart(new Date("2026-09-05T15:00:00Z")); // Saturday before Labor Day
    expect(n).toEqual({ start: "2026-09-08", filesBy: "2026-09-10", printsShipBy: "2026-09-17" });
    expect(committedDates("digital", new Date("2026-09-14T12:00:00Z"))).toEqual({ earliest: "2026-09-15", latest: "2026-09-16" });
    expect(committedDates("prints", new Date("2026-09-14T12:00:00Z"))).toEqual({ earliest: "2026-09-21", latest: "2026-09-23" });
    expect(committedDates("pack", new Date("2026-09-14T12:00:00Z"))).toEqual({ earliest: "2026-10-05", latest: "2026-10-12" });
  });
  it("formatEt prints the three styles", () => {
    expect(formatEt("2026-09-14", "weekday-short")).toBe("Mon Sep 14");
    expect(formatEt("2026-09-14", "medium")).toBe("Sep 14, 2026");
    expect(formatEt("2026-09-14", "long")).toBe("September 14, 2026");
  });
});

describe("JSON-LD (CONTRACTS §4.1)", () => {
  const all = [organization(), website(), person(), breadcrumbList([{ name: "Home", href: "/" }, { name: "Posters", href: "/posters" }]), faqPage(faqSubset("posters")), article({ title: "t", description: "d", path: "/how-it-works", datePublished: "2026-09-07", dateModified: "2026-09-07" }), imageObject({ url: "/cards/x/front.webp", width: 900, height: 1260, caption: "c", path: "/c/x" }), videoObject({ name: "n", description: "d", thumbnailUrl: "/cards/x/front.webp", contentUrl: "/cards/x/flip.mp4", uploadDate: "2026-09-07", path: "/c/x" }), productFamily({ family: "cards", path: "/trading-cards", name: "n", description: "d", images: ["/images/x.webp"], tiers: tiersFor("cards"), now: NOW_SALE })];
  it("every builder returns @context and @type, round-trips and escapes nothing dangerous", () => {
    for (const o of all) {
      expect(o["@context"]).toBe("https://schema.org");
      expect(typeof o["@type"]).toBe("string");
      const json = JSON.stringify(o);
      expect(JSON.parse(json)).toEqual(o);
      expect(json).not.toContain("<");
      expect(json).not.toContain("$");
      expect(json).not.toMatch(/aggregateRating|"review"/);
    }
  });
  it("organization: sameAs has Etsy, address only with the imprint, founder without a photo today", () => {
    const o = organization();
    expect(o.sameAs).toContain(ETSY_SHOP_URL);
    expect(o.address).toBeUndefined();
    expect((o.founder as { image?: string }).image).toBeUndefined();
    expect(o.logo).toBe(`${SITE_URL}/brand/shield.png`);
    expect(website().publisher).toEqual({ "@id": `${SITE_URL}/#organization` });
    expect(person().jobTitle).toBe("Designer and founder");
  });
  it("breadcrumbs are positioned absolute URLs", () => {
    const b = breadcrumbList([{ name: "Home", href: "/" }, { name: "Posters", href: "/posters" }]);
    const items = b.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1].item).toBe(`${SITE_URL}/posters`);
  });
  it("productFamily: one offer per enabled tier at sitePrice, priceValidUntil only during the sale, shipping on physical only", () => {
    const build = (now: Date) => productFamily({ family: "cards", path: "/trading-cards", name: "n", description: "d", images: ["/images/x.webp"], tiers: tiersFor("cards", true), now });
    const during = build(NOW_SALE);
    const offers = (during.offers as { offers: Record<string, unknown>[]; lowPrice: number; highPrice: number; offerCount: number }).offers;
    const enabled = tiersFor("cards");
    expect(offers.length).toBe(enabled.length);
    for (const [i, t] of enabled.entries()) {
      expect(offers[i].price).toBe(sitePrice(t, NOW_SALE));
      expect(offers[i].priceValidUntil).toBe(isoDatePlusDays(SALE_EXPIRES_AT, 1));
      expect(offers[i].url).toBe(`${SITE_URL}/trading-cards#tier-${t.sku}`);
      expect(Boolean(offers[i].shippingDetails)).toBe(t.physical);
      expect((offers[i].hasMerchantReturnPolicy as { merchantReturnLink: string }).merchantReturnLink).toBe(`${SITE_URL}/guarantee`);
    }
    expect((during.offers as { lowPrice: number }).lowPrice).toBe(Math.min(...enabled.map((t) => sitePrice(t, NOW_SALE))));
    const after = build(NOW_AFTER);
    for (const o of (after.offers as { offers: Record<string, unknown>[] }).offers) expect(o.priceValidUntil).toBeUndefined();
    expect(isSaleActive(NOW_AFTER)).toBe(false);
    expect(during.category).toBe("Custom sports trading cards");
    expect(productFamily({ family: "set", path: "/complete-set", name: "n", description: "d", images: [], tiers: tiersFor("set"), now: NOW_SALE }).category).toBe("Custom sports poster and trading card set");
  });
  it("isoDatePlusDays adds calendar days to the date part", () => {
    expect(isoDatePlusDays("2026-09-24T23:59:59-04:00", 1)).toBe("2026-09-25");
    expect(isoDatePlusDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("titles + meta (CONTRACTS §4.3, §6.1, GAPS #24)", () => {
  it("every title ≤ 60 after templating, every description ≤ 155, never youth", () => {
    for (const p of Object.values(PAGES)) {
      const title = substituteLongest(fullTitle(p));
      expect(title.length, `${p.path}: ${title}`).toBeLessThanOrEqual(TITLE_MAX);
      expect(substituteLongest(p.description).length, p.path).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(title).not.toContain("{");
      expect(`${p.title} ${p.description}`).not.toMatch(/\byouth\b/i);
      expect(p.path.startsWith("/")).toBe(true);
    }
    expect(fullTitle(PAGES["/"])).toBe("Game Day Edition — Custom Sports Trading Cards & Posters");
    expect(fullTitle(PAGES["/about"])).toBe(`About the Independent Custom Card Studio${TITLE_SUFFIX}`);
  });
  it("every F1 route is in the table and F2/F3 patterns match", () => {
    for (const path of ["/", "/trading-cards", "/posters", "/complete-set", "/senior-night", "/how-it-works", "/guarantee", "/photo-guide", "/about", "/registry", "/faq", "/contact", "/accessibility", "/privacy", "/privacy/biometric", "/terms"]) {
      expect(PAGES[path]?.phase, path).toBe("F1");
    }
    expect(f1Pages().map((p) => p.path)).toContain("/");
    expect(f1Pages().map((p) => p.path)).not.toContain("/order/new");
    expect(matchesPagePath("/sports/basketball")).toBe(true);
    expect(matchesPagePath("/senior-night/volleyball")).toBe(true);
    expect(matchesPagePath("/nowhere")).toBe(false);
  });
  it("pageMeta keeps canonical and og.url relative and honours absolute titles", () => {
    const home = pageMeta("/");
    expect(home.title).toEqual({ absolute: "Game Day Edition — Custom Sports Trading Cards & Posters" });
    expect(home.alternates?.canonical).toBe("/");
    expect((home.openGraph as { url: string }).url).toBe("/");
    expect(pageMeta("/about").title).toBe("About the Independent Custom Card Studio");
    expect(pageMeta("/how-it-works", { type: "article" }).openGraph).toMatchObject({ type: "article" });
    expect(() => pageMeta("/nowhere")).toThrow();
  });
  it("cardMeta by visibility: public named, unlisted no name + noindex, private neutral + noindex", () => {
    const marcus = getCard("GDE-SN-BKB-2026-12")!;
    const pub = cardMeta(marcus);
    expect(pub.title).toEqual({ absolute: "Marcus Ellison · Stadium Night — Registered Edition" });
    expect(pub.robots).toBeUndefined();
    expect(pub.alternates?.canonical).toBe("/c/GDE-SN-BKB-2026-12");
    const unlisted = cardMeta({ ...marcus, visibility: "unlisted" });
    expect(unlisted.title).toEqual({ absolute: "Stadium Night — Registered Edition" });
    expect(JSON.stringify(unlisted)).not.toContain("Marcus");
    expect(unlisted.robots).toEqual({ index: false, follow: false });
    const priv = cardMeta({ ...marcus, visibility: "private" });
    expect(priv.title).toBe("Registered Edition");
    expect(JSON.stringify(priv)).not.toContain("Marcus");
    expect(cardTitle({ ...marcus, visibility: "deleted" })).toBe("Registered Edition");
  });
});

describe("faq (CONTRACTS §4.8, COPY §2.11)", () => {
  it("ids are unique, the master list is the 35 numbered items, subsets resolve", () => {
    const ids = faq.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(faq.filter((f) => !f.subsetOnly).length).toBe(35);
    for (const [key, list] of Object.entries(FAQ_SUBSETS)) {
      for (const id of list) expect(ids, `${key}: ${id}`).toContain(id);
      const items = faqSubset(key as keyof typeof FAQ_SUBSETS);
      expect(items.length, key).toBeGreaterThanOrEqual(4);
      expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    }
    expect(faqSubset("how-it-works").length).toBe(6);
    expect(faqSubset("senior-night").length).toBe(4);
  });
  it("faqAll hides the pack question while the pack is off and keeps the F1-only one", () => {
    const all = faqAll();
    expect(all.some((f) => f.id === "faq-04")).toBe(getTier("GDE-ANY-CARD-PACK")!.enabled);
    expect(all.some((f) => f.id === "faq-28")).toBe(true);
    expect(all.some((f) => f.subsetOnly)).toBe(false);
    expect(faqGroups().map((g) => g.group)[0]).toBe("products");
  });
  it("contains every question of the F0 site-config faqItems (while that file still exists)", () => {
    // app/site-config.ts is deleted by the home builder once every question lives here (CONTRACTS §5.2).
    const legacy = path.join(process.cwd(), "app", "site-config.ts");
    if (!fs.existsSync(legacy)) return;
    const src = fs.readFileSync(legacy, "utf8");
    const legacyQuestions = [...src.matchAll(/^\s*\["([^"]+)",\s*"/gm)].map((m) => m[1]);
    expect(legacyQuestions.length).toBeGreaterThanOrEqual(14);
    const questions = new Set(faq.map((f) => f.q));
    for (const q of legacyQuestions) expect(questions.has(q), q).toBe(true);
  });
  it("answers carry the canon sentences and resolved tokens", () => {
    const byId = (id: string) => faq.find((f) => f.id === id)!;
    expect(byId("faq-08").a).toBe(block("photos-that-work-best"));
    expect(byId("faq-12").a).toBe(CANON.numberlessLine);
    expect(byId("faq-14").a).toContain(CANON.deliveryClocks);
    expect(byId("faq-33").a).toContain("hello@gamedayedition.com");
    expect(byId("faq-04").a).toContain(CANON.packLine);
    expect(byId("faq-06").a).toContain(`${FILE_COUNTS.set} files and one live page`);
    for (const f of faq) expect(f.a, f.id).not.toMatch(/\{[a-z]+[:}]/i);
  });
});

describe("seasons / shipping / trust / canon / reviews / checklist", () => {
  it("occasions: Christmas wraps the year end; order is fixed", () => {
    const xmas = occasionById("christmas")!;
    expect(inWindow(xmas, "2026-10-20")).toBe(true);
    expect(inWindow(xmas, "2026-12-31")).toBe(true);
    expect(inWindow(xmas, "2027-01-05")).toBe(true);
    expect(inWindow(xmas, "2027-01-06")).toBe(false);
    expect(inWindow(xmas, "2026-10-19")).toBe(false);
    expect(isChristmasWindow(new Date("2026-11-15T12:00:00Z"))).toBe(true);
    expect(activeOccasions(new Date("2026-09-14T12:00:00Z")).map((o) => o.id)).toEqual(["senior-night", "end-of-season"]);
    expect(activeOccasions(new Date("2026-12-01T12:00:00Z")).map((o) => o.id)).toEqual(["senior-night", "christmas", "end-of-season"]);
    expect(occasions.find((o) => o.id === "christmas")!.hrefF1).toBe("/complete-set");
  });
  it("shipping rows and partners use the declared names; pack rows hidden until D18", () => {
    expect(PARTNERS.map((p) => p.name)).toEqual([...CANON.partners]);
    expect(PARTNERS[1].name).toBe("Print-on-demand poster printing partner, Charlotte NC");
    expect(shippingRows.map((r) => r.key)).toEqual(["digital", "cards", "posters", "pack", "ultimate"]);
    expect(visibleShippingRows().map((r) => r.key)).toEqual(["digital", "cards", "posters"]);
    expect(visiblePartners().map((p) => p.key)).toEqual(["cards", "posters"]);
    expect(shipsFromFor("GDE-ANY-CARD-DIG")).toBe(DIGITAL_SHIPS_FROM);
    expect(shipsFromFor("GDE-BKB-CARD-P12")).toBe("Professional photo print lab, Santa Cruz CA · tracked (per lab)");
    expect(shipsFromFor("GDE-ANY-POST-P1824")).toContain("Charlotte NC · poster and certificate in one shipment");
    expect(shipsFromFor("GDE-ANY-SET-PRINT")).toMatch(/^Two packages/);
    expect(shipsFromFor("GDE-ANY-SET-ULT")).toBe("Santa Cruz CA · Charlotte NC · Trading card pack printing partner, Hong Kong");
    expect(shipsFromFor("GDE-ANY-SNSET-DIG")).toBe(DIGITAL_SHIPS_FROM);
    for (const r of shippingRows.filter((x) => x.perLab)) expect(r.carrier).toContain("(per lab)");
  });
  it("trust line has three segments until Vertex is verified; canon strings are exact", () => {
    expect(trustLineSegments()).toEqual([...TRUST_SEGMENTS]);
    expect(CANON.trustLine).toBe("Never posted without your OK · Deleted after delivery, on a schedule you can see · Parent/guardian consent required");
    expect(CANON.packLine).toBe("18 cards — 4 holographic chase, 14 standard");
    expect(CANON.packLine).not.toContain("+");
    expect(CANON.fictionalLabel).toBe("Example — fictional athlete · photo and artwork generated");
    expect(CANON.registeredIdLine).not.toMatch(/numbered/i);
    expect(LOOKUP_STRINGS.miss).toContain("mind O versus 0");
  });
  it("reviews: none published today", () => {
    expect(publishedReviews()).toEqual([]);
  });
  it("photo checklist: nine rows, the crest row ends with C6", () => {
    expect(photoChecklist.map((i) => i.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(new Set(photoChecklist.map((i) => i.id)).size).toBe(9);
    expect(photoChecklist[8].body).toContain(block("logo-sentence"));
    expect(NEVER_ASKED_FOR).toContain("No date of birth");
  });
});

describe("catalog additions (tiers, sports, styles, delivery, colour, alt)", () => {
  it("TRUE_COUNT_LINKS mirror TRUE_COUNTS; FILE_COUNTS are the audited numbers", () => {
    expect(TRUE_COUNT_LINKS.map((l) => l.label)).toEqual(TRUE_COUNTS);
    for (const l of TRUE_COUNT_LINKS) expect(l.label.toLowerCase()).toContain(l.figure.toLowerCase());
    expect(FILE_COUNTS).toEqual({ set: 27, snset: 28 });
  });

  it("the score bug never says the figure twice, and only figures are figures (review 2026-09-07)", () => {
    for (const l of TRUE_COUNT_LINKS) {
      const rest = trueCountRest(l);
      if (l.numeral) {
        // The numeral is lifted out of the sentence under it: "17" + "sports", never "17" + "17 sports".
        expect(rest.toLowerCase(), l.figure).not.toContain(l.figure.toLowerCase());
        expect(rest.length, l.figure).toBeGreaterThan(0);
        expect(l.figure, `${l.figure} is set in Anton and carries no digit`).toMatch(/\d/);
      } else {
        expect(rest).toBe(l.label);
      }
    }
    // Every cell of the strip carries a figure now (owner review 2026-09-07): two of the five used to
    // be plain sentences beside 44 px numerals. `numeral` stays optional for callers with their own
    // items (/about §6 sets "Registry live since August 2026" as a sentence).
    expect(TRUE_COUNT_LINKS.filter((l) => l.numeral)).toHaveLength(TRUE_COUNT_LINKS.length);
    expect(TRUE_COUNT_LINKS.map((l) => trueCountRest(l))[0]).toBe("sports");
    expect(TRUE_COUNT_LINKS.map((l) => trueCountRest(l))[2]).toBe("Square-cut, UV-coated cards");
  });
  it("boxContents follows the COPY tier tables; posters gained the certificate line (GAPS #5)", () => {
    expect(boxContents("GDE-ANY-CARD-DIG")).toContain("Certificate of Authenticity");
    expect(boxContents("GDE-ANY-CARD-P12")).toEqual(["12 printed cards — square-cut, UV-coated, 2.5 × 3.5 in", "Free printed Certificate of Authenticity", "Every digital file above", "Printed and shipped free in the US"]);
    expect(tierNotes["GDE-ANY-POST-P1824"][1]).toBe("Free printed Certificate of Authenticity");
    expect(tierNotes["GDE-ANY-POST-P2436"][1]).toBe("Free printed Certificate of Authenticity");
    expect(boxContents("GDE-ANY-SET-PRINT")).toContain("Every digital file included");
    expect(boxContents("GDE-ANY-SET-PRINT")).not.toContain("Every digital file above");
    for (const t of tiers) expect(boxContents(t.sku).length, t.sku).toBeGreaterThan(0);
    expect(boxContents("GDE-NOPE")).toEqual([]);
  });
  it("sports: back lines, numberless codes, poster sports", () => {
    expect(backLine(sportByCode("BKB")!)).toBe("their number");
    expect(backLine(sportByCode("CHR")!)).toBe("their name, their club crest");
    expect(backLine(sportByCode("WRS")!)).toBe("plain back");
    expect(backLine(sportByCode("PKB")!)).toBe("plain back");
    expect(NUMBERLESS_CODES).toEqual(["CHR", "GYM", "SWM", "TEN", "GLF"]);
    expect(isNumberless(sportByCode("TEN")!)).toBe(true);
    expect(postersSports().map((s) => s.slug)).toEqual(["basketball", "football", "baseball", "softball", "soccer", "volleyball", "wrestling", "cheerleading"]);
    expect(sports.length).toBe(17);
  });
  it("styles have unique slugs; SR keeps the card's case", () => {
    expect(new Set(styles.map((s) => s.slug)).size).toBe(7);
    expect(styleBySlug("fire-and-smoke")?.code).toBe("FS");
    expect(styleBySlug("senior-night")?.displayCase).toBe("title");
  });
  it("chipSegment cuts the live chip and builds the pack segment from LEAD_TIMES", () => {
    expect(chipSegment("digital")).toBe("DIGITAL IN 1–2 DAYS");
    expect(chipSegment("prints")).toBe("PRINTS SHIP IN 5–7");
    expect(chipSegment("pack")).toBe("SEALED PACK SHIPS IN 3–4 WEEKS");
  });
  it("colour: contrast and the team-colour rule", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
    expect(contrastRatio("#FFF", "#000")).toBeCloseTo(21, 1);
    expect(hexToRgb("nope")).toBeNull();
    expect(teamAccent("#FFFFFF")).toEqual({ color: "#FFFFFF", mode: "text" });
    expect(teamAccent("#172C50")).toEqual({ color: "#172C50", mode: "rule" });
    expect(teamAccent("c9a227")).toEqual({ color: "#C9A227", mode: "text" });
    expect(teamAccent(undefined)).toEqual({ color: SILVER, mode: "rule" });
    expect(teamAccent("not a colour")).toEqual({ color: SILVER, mode: "rule" });
    expect(contrastRatio(SILVER, ARENA)).toBeGreaterThan(12);
  });
  it("alt text follows COPY §0.5 and refuses a number for a numberless sport", () => {
    const bkb = sportByCode("BKB")!;
    const chr = sportByCode("CHR")!;
    const sn = styles[0];
    expect(altCardFront(bkb, sn)).toBe("Custom basketball trading card front — Stadium Night finish — example artwork, fictional athlete");
    expect(altCardBack(bkb, sn)).toBe("Custom basketball trading card back with season stats, registered card ID and QR code — Stadium Night finish — example artwork, fictional athlete");
    expect(altPoster(bkb, sn)).toBe("Custom basketball poster, 18 × 24 in — Stadium Night finish — example artwork, fictional athlete");
    expect(altRoom(bkb, sn)).toBe("Custom basketball poster hung on a bedroom wall — Stadium Night finish — example artwork, fictional athlete");
    expect(altBefore(bkb)).toBe("Phone photo of a fictional basketball player — the starting point; photo generated");
    expect(altProof(bkb, sn)).toBe("Watermarked proof of a custom basketball card — Stadium Night finish — example, fictional athlete");
    expect(altCardFront(bkb, sn, false)).not.toContain("fictional");
    expect(altRegisteredFront(bkb, sn, true)).toBe("Registered card front — basketball — Stadium Night finish — example artwork, fictional athlete");
    expect(ALT_REGISTERED_BACK).toContain("registered card ID and QR code");
    expect(altCardFront(chr, sn)).not.toMatch(/#\d/);
    expect(() => altCardFront(chr, sn, true, "#12")).toThrow();
    expect(() => altCardFront(bkb, sn, true, "#12")).not.toThrow();
  });
});
