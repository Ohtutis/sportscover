// /senior-night (Wave 1, senior-night builder): the order-by plan at the DoD dates, the page's
// metadata row, one FAQPage, one delivery claim, and the build rules that only a source scan catches.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { addCalendarDays, seniorNightPlan, type IsoDate, type PlanRow } from "../lib/capacity";
import { CHIPS } from "../lib/catalog/delivery";
import { faqSubset } from "../lib/catalog/faq";
import { seniorNightSku } from "../lib/cta";
import { pageFor } from "../lib/seo/titles";
import { pageMeta } from "../lib/seo/meta";
import { CALC_COPY } from "../lib/copy/calc";
import { CALC_STRINGS } from "../components/OrderByCalculator";
import { metadata, SN_HERO_GROUP_LABEL } from "../app/(marketing)/senior-night/page";
import { GIFT_NOTE_STRINGS } from "../app/(marketing)/senior-night/_gift-note";

const read = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), "utf8");
const PAGE_PATH = "app/(marketing)/senior-night/page.tsx";
const page = read(PAGE_PATH);
const giftNote = read("app/(marketing)/senior-night/_gift-note.tsx");
const og = read("app/(marketing)/senior-night/opengraph-image.tsx");

/** A Monday clear of every LAB_HOLIDAY, so the plan is read from the lead times and not a holiday. */
const TODAY: IsoDate = "2026-10-05";
const rowOf = (rows: PlanRow[], key: PlanRow["key"]): PlanRow => rows.find((r) => r.key === key)!;
const planIn = (days: number) => seniorNightPlan(addCalendarDays(TODAY, days), TODAY);

describe("seniorNightPlan at the DoD dates (today = 2026-10-05)", () => {
  it("a night tomorrow: nothing fits, not even the files", () => {
    const plan = planIn(1);
    expect(rowOf(plan.rows, "files").fits).toBe(false);
    expect(rowOf(plan.rows, "printedSet").fits).toBe(false);
    expect(rowOf(plan.rows, "sealedPack").fits).toBe(false);
    expect(plan.anythingPrintedFits).toBe(false);
    expect(plan.bestTier).toBe("GDE-ANY-SNSET-DIG");
  });

  it("a night in 3 days: files only", () => {
    const plan = planIn(3);
    expect(rowOf(plan.rows, "files").fits).toBe(true);
    expect(rowOf(plan.rows, "printedSet").fits).toBe(false);
    expect(rowOf(plan.rows, "sealedPack").fits).toBe(false);
    expect(plan.anythingPrintedFits).toBe(false);
    expect(plan.bestTier).toBe("GDE-ANY-SNSET-DIG");
  });

  it("a night in 10 days: files, and nothing printed", () => {
    const plan = planIn(10);
    expect(rowOf(plan.rows, "files").fits).toBe(true);
    expect(rowOf(plan.rows, "printedSet").fits).toBe(false);
    expect(rowOf(plan.rows, "sealedPack").fits).toBe(false);
    expect(plan.anythingPrintedFits).toBe(false);
  });

  it("a night in 20 days: the printed set fits, the sealed pack does not", () => {
    const plan = planIn(20);
    expect(rowOf(plan.rows, "files").fits).toBe(true);
    expect(rowOf(plan.rows, "printedSet").fits).toBe(true);
    expect(rowOf(plan.rows, "sealedPack").fits).toBe(false);
    expect(plan.anythingPrintedFits).toBe(true);
    expect(plan.bestTier).toBe("GDE-ANY-SNSET-PRINT");
  });

  it("a night in 40 days: everything fits", () => {
    const plan = planIn(40);
    for (const row of plan.rows) expect(row.fits).toBe(true);
    expect(plan.anythingPrintedFits).toBe(true);
    expect(plan.bestTier).toBe("GDE-ANY-SNSET-PRINT");
  });

  it("every row is deterministic and orders by a date on or before the night", () => {
    const plan = planIn(30);
    expect(seniorNightPlan(plan.night, TODAY)).toEqual(plan);
    for (const row of plan.rows) expect(row.orderBy <= plan.night).toBe(true);
  });
});

describe("metadata", () => {
  it("comes from the PAGES table", () => {
    expect(metadata).toEqual(pageMeta("/senior-night"));
    const row = pageFor("/senior-night");
    expect(metadata.alternates?.canonical).toBe("/senior-night");
    expect(metadata.description).toBe(row.description);
    expect(row.title.length).toBeLessThanOrEqual(60);
    expect(row.description.length).toBeLessThanOrEqual(155);
    expect(metadata.robots).toBeUndefined();
  });
});

describe("the page", () => {
  it("emits exactly one FAQPage — one FaqList, and it is the jsonLd one", () => {
    expect(page.match(/<FaqList/g)?.length).toBe(1);
    expect(/<FaqList[^>]*\bjsonLd\b/.test(page)).toBe(true);
    expect(faqSubset("senior-night").length).toBe(4);
  });

  it("makes one delivery claim: CHIPS.seniorNight only", () => {
    expect(page.includes('kind="standard"')).toBe(false);
    expect(page.includes("CHIPS.standard")).toBe(false);
    expect(page.match(/kind="seniorNight"/g)?.length).toBeGreaterThan(0);
    // The chip text itself is never retyped — it comes from lib/catalog/delivery.ts.
    expect(page.includes(CHIPS.seniorNight)).toBe(false);
  });

  it("has one priority image and nothing that plays above the fold", () => {
    expect(page.match(/\bpriority\b/g)?.length).toBe(1);
    expect(page.includes("<video")).toBe(false);
    expect(page.includes("CardFlip")).toBe(false);
  });

  it("shows the nine COPY sports and never dance, track, band or lacrosse", () => {
    const slugs = [...page.matchAll(/\{ slug: "([a-z-]+)"/g)].map((m) => m[1]);
    expect(slugs).toEqual([
      "football",
      "volleyball",
      "cheerleading",
      "soccer",
      "basketball",
      "wrestling",
      "softball",
      "baseball",
      "ice-hockey",
    ]);
    for (const banned of ["dance", "track-field", "band", "lacrosse"]) expect(slugs).not.toContain(banned);
  });

  it("links every tile at that sport's Senior Night listing, or the any-sport one", () => {
    expect(seniorNightSku("football")).toBe("GDE-FTB-SNSET");
    expect(seniorNightSku("ice-hockey")).toBe("GDE-ANY-SNSET");
    expect(seniorNightSku("basketball")).toBe("GDE-ANY-SNSET");
    // Never a marketplace URL, and no price on this page.
    expect(page.includes("etsy.com")).toBe(false);
    expect(/\$\d/.test(page)).toBe(false);
  });

  it("shows no finish picker and no pack or certificate imagery (GAPS #12, #32)", () => {
    expect(page.includes("styleHrefF1")).toBe(false);
    expect(page.includes("/styles/")).toBe(false);
    expect(page.includes('asset("sn.cert")')).toBe(false);
    expect(/asset\("[^"]*pack[^"]*"\)/.test(page)).toBe(false);
    expect(page.includes("sn.hero.badge")).toBe(false); // the only badge export is another athlete's
  });

  it("composes the hero in code from the three SR layers and labels the group", () => {
    for (const key of ["sn.hero.poster", "sn.hero.front", "sn.hero.back"]) expect(page.includes(key)).toBe(true);
    expect(page.includes("sn.hero\"")).toBe(false); // the whole listing slide key stays locate
    expect(SN_HERO_GROUP_LABEL).toContain("fictional athlete");
    expect(page.includes("<FictionalLabel")).toBe(true);
  });

  it("reads the calculator's strings from a module a server component may read", () => {
    // components/OrderByCalculator.tsx is "use client": a server component that imports a const
    // across that boundary gets a client reference, so CALC_STRINGS.heading was undefined and
    // section 02 shipped an empty <h2>. The page reads lib/copy/calc.ts instead.
    expect(page.includes("CALC_STRINGS")).toBe(false);
    expect(page.includes('from "../../../lib/copy/calc"')).toBe(true);
    expect(CALC_COPY.heading).toBe("WHEN IS SENIOR NIGHT?");
    // Until the island imports them too, the two copies have to stay identical.
    expect(JSON.stringify(CALC_COPY)).toBe(JSON.stringify(CALC_STRINGS));
    for (const key of ["files", "printedSet", "sealedPack"] as const) {
      expect(CALC_COPY.rows[key].fits("Oct 3, 2026")).toBe(CALC_STRINGS.rows[key].fits("Oct 3, 2026"));
    }
  });

  it("claims the edition once, in the text column, and keeps accent off the artwork", () => {
    // One edition PILL on the page (section 03 names the line as a fact about the printed back).
    expect(page.match(/<Pill[^>]*>SENIOR EDITION · 1 OF 1<\/Pill>/g)?.length).toBe(1);
    expect(page.includes('pills={<Pill tone="accent">SENIOR EDITION · 1 OF 1</Pill>}')).toBe(true);
    // The only pill inside the mat is the gold one; no accent pill sits on the artwork.
    const media = page.slice(page.indexOf("function SeniorNightHeroMedia"), page.indexOf("function SportTile"));
    expect(media.includes('tone="accent"')).toBe(false);
    expect(media.match(/tone="gold"/g)?.length).toBe(1);
  });

  it("gives the text-only certificate a plain block and each exhibit one name", () => {
    const section = page.slice(page.indexOf('id="sn-what"'), page.indexOf('id="sn-sports"'));
    // GAPS #32: no certificate image — brackets around text alone read as a missing exhibit.
    expect(section.includes("<BracketFrame label=")).toBe(false);
    expect(section.match(/<BracketFrame/g)?.length).toBe(2);
    expect(section.match(/<h3/g)?.length).toBe(3);
    // A stretched grid cell strands the accent corners below the caption.
    expect(section.includes("grid items-start")).toBe(true);
  });

  it("keeps gold inside the media and the gold pill only", () => {
    expect(page.match(/tone="gold"/g)?.length).toBe(1);
    expect(page.includes("text-gold")).toBe(false);
    expect(page.includes("bg-gold")).toBe(false);
  });

  it("revalidates hourly and never sets outline-none", () => {
    expect(page.includes("export const revalidate = 3600")).toBe(true);
    expect(page.includes("outline-none")).toBe(false);
  });
});

describe("the printable gift note", () => {
  it("is wired to the calculator by id and starts hidden", () => {
    expect(page.includes('const GIFT_NOTE_ID = "gift-note"')).toBe(true);
    expect(page.includes("giftNoteId={GIFT_NOTE_ID}")).toBe(true);
    expect(giftNote.includes("hidden")).toBe(true);
    expect(giftNote.includes("print:block")).toBe(true);
    expect(page.includes("print:hidden")).toBe(true);
  });

  it("carries the COPY strings", () => {
    expect(GIFT_NOTE_STRINGS.heading).toBe("THIS IS YOUR SENIOR EDITION.");
    expect(GIFT_NOTE_STRINGS.bodyAfterName).toContain("one registered edition, yours alone");
    expect(GIFT_NOTE_STRINGS.bodyAfterName).toContain("One last home game — and it's on the wall for good.");
    expect(GIFT_NOTE_STRINGS.small).toBe("Game Day Edition · gamedayedition.com/senior-night");
  });
});

describe("the OG image", () => {
  it("is a text card on the shared frame — no listing slide, no price", () => {
    expect(og.includes("OgFrame")).toBe(true);
    expect(og.includes("CHIPS.seniorNight")).toBe(true);
    expect(/\$\d/.test(og)).toBe(false);
    expect(og.includes("ONE LAST HOME GAME.")).toBe(true);
  });
});
