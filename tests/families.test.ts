// The three product-family pages (/trading-cards, /posters, /complete-set) and the pieces they share.
//
// Page files import next/image and next/og, so the structural rules are asserted by reading the source
// (CONTRACTS §9.2 #10) and the behavioural ones by rendering the shared sections with
// renderToStaticMarkup — every shared piece is a synchronous server component, so both work.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SITE_ASSETS, hasAsset } from "../lib/assets";
import { chipSegment } from "../lib/catalog/delivery";
import { faqSubset } from "../lib/catalog/faq";
import { formatUsd, getTier, perCardAnchor, priceDisplay, sitePrice, skuFor, tiersFor, type Family } from "../lib/catalog/prices";
import { NUMBERLESS_CODES, backLine, isNumberless, postersSports, sportBySlug, sports } from "../lib/catalog/sports";
import { finishes } from "../lib/catalog/styles";
import { boxContents, FILE_COUNTS } from "../lib/catalog/tiers";
import { EDITION_SENTENCE } from "../components/EditionPanel";
import { CANON } from "../lib/copy/canon";
import { productFamily } from "../lib/seo/jsonld";
import { cardArtFor } from "../lib/registry/art";
import { ClosingSection } from "../app/(marketing)/(families)/_shared/closing";
import { DEMO_CARD_ID, DEMO_LABEL, demoCard, demoFaces } from "../app/(marketing)/(families)/_shared/demo-card";
import { FinishesRow, finishRowKeys } from "../app/(marketing)/(families)/_shared/finishes-row";
import { NumberlessSection, POSTER_NAME_BODY, SportGrid, numberlessFirstSentence, numberlessSportsClause } from "../app/(marketing)/(families)/_shared/numberless-block";
import { sectionIndex } from "../app/(marketing)/(families)/_shared/section";
import { SpecSheetSection, setFolderRows, specRows } from "../app/(marketing)/(families)/_shared/spec-sheet";
import { SportPicker, SPORT_PICKER_LABEL, numberlessPickerNote, pickSport } from "../app/(marketing)/(families)/_shared/sport-picker";
import { CERTIFICATE_LINE, TierRow, chipKindFor } from "../app/(marketing)/(families)/_shared/tier-row";
import { ctaFor } from "../lib/cta";
import TradingCardsPage from "../app/(marketing)/trading-cards/page";
import PostersPage from "../app/(marketing)/posters/page";
import CompleteSetPage from "../app/(marketing)/complete-set/page";

const ROOT = process.cwd();
const SHARED_DIR = "app/(marketing)/(families)/_shared";
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");
const render = (el: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(el);
const count = (text: string, needle: RegExp) => text.match(needle)?.length ?? 0;
/** Source without comments — the rules below are about rendered code, not about doc references. */
const strip = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
/** renderToStaticMarkup escapes these; copy assertions compare against the escaped form. */
const esc = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

interface FamilyPage {
  path: string;
  file: string;
  og: string;
  family: Family;
  faq: "trading-cards" | "posters" | "complete-set";
  h1: string;
  subhead: string;
}

const PAGES: FamilyPage[] = [
  {
    path: "/trading-cards",
    file: "app/(marketing)/trading-cards/page.tsx",
    og: "app/(marketing)/trading-cards/opengraph-image.tsx",
    family: "cards",
    faq: "trading-cards",
    h1: "CUSTOM TRADING CARDS FROM YOUR PHOTOS.",
    subhead:
      "Not a template with a photo dropped in — composed around your athlete: their photos, their kit, their colors, their season. Front and back, with a registered card ID on the back.",
  },
  {
    path: "/posters",
    file: "app/(marketing)/posters/page.tsx",
    og: "app/(marketing)/posters/opengraph-image.tsx",
    family: "posters",
    faq: "posters",
    h1: "CUSTOM SPORTS POSTERS FROM YOUR PHOTOS.",
    subhead:
      "Not a template with a photo dropped in — composed around your athlete. The poster is art for the wall; the stats live on the card.",
  },
  {
    path: "/complete-set",
    file: "app/(marketing)/complete-set/page.tsx",
    og: "app/(marketing)/complete-set/opengraph-image.tsx",
    family: "set",
    faq: "complete-set",
    h1: "THE COMPLETE EDITION: POSTER, CARDS, CERTIFICATE, REGISTRY.",
    subhead:
      "Everything we make for one athlete, counted — the poster, the card front and back, the certificate, the flip video, the wallpapers and the card's own registered page.",
  },
];

const sharedFiles = fs
  .readdirSync(path.join(ROOT, SHARED_DIR))
  .filter((f) => f.endsWith(".tsx"))
  .map((f) => `${SHARED_DIR}/${f}`);
const ownedFiles = [...PAGES.map((p) => p.file), ...PAGES.map((p) => p.og), ...sharedFiles];

describe("family pages — structure", () => {
  for (const page of PAGES) {
    describe(page.path, () => {
      const src = read(page.file);

      it("exists with the F1 revalidate window and its metadata from the titles table", () => {
        expect(src).toContain("export const revalidate = 3600;");
        expect(src).toContain(`pageMeta(PATH)`);
        expect(src).toContain(`const PATH = "${page.path}";`);
      });

      it("renders the COPY H1 and subhead byte-identically, once", () => {
        expect(src).toContain(page.h1);
        expect(src).toContain(page.subhead);
        expect(count(src, /as="h1"/g)).toBe(1);
      });

      it("emits Product JSON-LD exactly once", () => {
        expect(count(src, /productFamily\(/g)).toBe(1);
      });

      it("has exactly one priority image and no video above the fold", () => {
        expect(count(strip(src), /\bpriority\b/g)).toBe(1);
        expect(src).not.toMatch(/<video/);
      });

      it("gives every <Image> a sizes attribute", () => {
        for (const tag of src.match(/<Image[\s\S]*?\/>/g) ?? []) expect(tag).toMatch(/sizes=/);
      });

      it("does not mount CapacityNote (GAPS #13)", () => {
        expect(src).not.toContain("CapacityNote");
      });

      it("claims the delivery times once, in the hero", () => {
        expect(count(src, /DeliveryChips/g)).toBe(0); // the hero block owns the only one
      });
    });
  }

  it("the shared pieces carry no priority image and no video", () => {
    for (const file of sharedFiles) {
      const src = read(file);
      expect(strip(src), file).not.toMatch(/\bpriority\b/);
      expect(src, file).not.toMatch(/<video/);
    }
  });

  it("the hero block is the page's one DeliveryChips", () => {
    const hero = read(`${SHARED_DIR}/hero.tsx`);
    expect(count(hero, /<DeliveryChips/g)).toBe(1);
    expect(read(`${SHARED_DIR}/closing.tsx`)).not.toContain("DeliveryChips");
  });

  it("the closing block ends with the TrustLine, after the CTA pair and the short strip", () => {
    const closing = read(`${SHARED_DIR}/closing.tsx`);
    const order = ["<CtaPair", '<FourFears variant="short"', "<TrustLine"].map((s) => closing.indexOf(s));
    expect(order.every((i) => i > -1)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("emits exactly one FAQPage per page (the subset list in the closing block)", () => {
    const closing = read(`${SHARED_DIR}/closing.tsx`);
    expect(count(closing, /<FaqList/g)).toBe(1);
    expect(closing).toMatch(/<FaqList[^>]*jsonLd/);
    for (const page of PAGES) expect(count(read(page.file), /FaqList/g)).toBe(0);
  });

  it("never imports an image out of etsy/, marketing/ or art-pipeline/, and types no public image path", () => {
    for (const file of ownedFiles) {
      const src = read(file);
      expect(src, file).not.toMatch(/from "\.*\/*(etsy|marketing|art-pipeline)\//);
      expect(src, file).not.toMatch(/"\/images\//);
      expect(src, file).not.toMatch(/"\/cards\//);
    }
  });

  it("writes no dollar literal and no jersey number in copy", () => {
    for (const file of ownedFiles) {
      const src = strip(read(file));
      expect(src, file).not.toMatch(/\$\d/);
      // A jersey number, not a hex colour: "#12" ends at a word boundary, "#080C12" does not.
      expect(src, file).not.toMatch(/#\d{1,2}\b/);
    }
  });

  it("numbers the seven sections the way the copy does", () => {
    expect(sectionIndex(2)).toBe("02 / 07");
    expect(sectionIndex(7)).toBe("07 / 07");
    for (const page of PAGES) {
      const src = read(page.file);
      expect(src, page.path).toMatch(/index=\{3\}/);
      expect(src, page.path).toContain("<SpecSheetSection");
      expect(src, page.path).toContain("<FinishesSection");
      expect(src, page.path).toContain("<NumberlessSection");
      expect(src, page.path).toContain("<ClosingSection");
    }
  });
});

describe("family pages — the ladder", () => {
  for (const page of PAGES) {
    it(`${page.path}: four tiers, three rendered, the gated ones hidden`, () => {
      const all = tiersFor(page.family, true);
      const shown = all.filter((t) => t.enabled);
      expect(all).toHaveLength(4);
      expect(shown).toHaveLength(3);
      expect(all.filter((t) => !t.enabled).map((t) => t.sku)).toEqual([
        { cards: "GDE-ANY-CARD-PACK", posters: "GDE-ANY-POST-P3040", set: "GDE-ANY-SET-ULT", snset: "" }[page.family],
      ]);
    });

    it(`${page.path}: the row renders prices, chips, box contents and one Etsy CTA per tier`, () => {
      const now = new Date();
      const sport = sportBySlug("basketball")!;
      const html = render(
        createElement(TierRow, { family: page.family, context: page.faq === "posters" ? "posters" : page.family === "cards" ? "cards" : "set", sport, now }),
      );
      const shown = tiersFor(page.family, true).filter((t) => t.enabled);
      expect(count(html, /<article/g)).toBe(shown.length);
      for (const tier of shown) {
        const price = priceDisplay(tier, now);
        expect(html).toContain(formatUsd(price.current));
        expect(html).toContain(`id="tier-${tier.sku}"`);
        expect(html).toContain(`/go/etsy/${skuFor(tier.sku, sport.code)}`);
        expect(html).toContain(chipSegment(chipKindFor(tier)));
        for (const line of boxContents(tier.sku)) expect(html).toContain(esc(line));
      }
      expect(html).toContain(CERTIFICATE_LINE);
    });
  }

  it("the per-card anchor is computed, never typed", () => {
    const src = read(PAGES[0].file);
    expect(src).toContain("perCardAnchor(now)");
    expect(perCardAnchor(new Date())).toBeGreaterThan(0);
    const p12 = getTier("GDE-ANY-CARD-P12")!;
    expect(perCardAnchor(new Date())).toBeLessThan(sitePrice(p12, new Date()));
  });

  it("chip segments follow the tier kind", () => {
    expect(chipKindFor(getTier("GDE-ANY-CARD-DIG")!)).toBe("digital");
    expect(chipKindFor(getTier("GDE-ANY-CARD-P12")!)).toBe("prints");
    expect(chipKindFor(getTier("GDE-ANY-CARD-PACK")!)).toBe("pack");
    expect(chipKindFor(getTier("GDE-ANY-SET-ULT")!)).toBe("pack");
  });
});

describe("family pages — Product and FAQ markup", () => {
  const now = new Date();
  for (const page of PAGES) {
    it(`${page.path}: offers are the enabled tiers, priced from the ladder, with no rating or review`, () => {
      const data = productFamily({
        family: page.family,
        path: page.path,
        name: "n",
        description: "d",
        images: ["/images/x.webp"],
        tiers: tiersFor(page.family, true),
        now,
      }) as { offers: { offerCount: number; offers: { url: string; price: number }[] } };
      const shown = tiersFor(page.family, true).filter((t) => t.enabled);
      expect(data.offers.offerCount).toBe(shown.length);
      for (const offer of data.offers.offers) expect(offer.url).toContain(`${page.path}#tier-GDE-ANY-`);
      expect(data.offers.offers.map((o) => o.price)).toEqual(shown.map((t) => sitePrice(t, now)));
      expect(JSON.stringify(data)).not.toMatch(/aggregateRating|"review"/);
    });

    it(`${page.path}: the FAQ subset is six unique questions and renders them all`, () => {
      const items = faqSubset(page.faq);
      expect(items).toHaveLength(6);
      expect(new Set(items.map((i) => i.id)).size).toBe(6);
      const html = render(createElement(ClosingSection, { faq: page.faq, cta: ctaFor("cards") }));
      for (const item of items) expect(html).toContain(esc(item.q));
      expect(count(html, /<details/g)).toBe(6);
      expect(html).toContain("FAQPage");
    });
  }
});

describe("family pages — the sport picker", () => {
  it("falls back to the family default for an unknown, empty or unsupported sport", () => {
    expect(pickSport(undefined, sports, "basketball").slug).toBe("basketball");
    expect(pickSport("nope", sports, "basketball").slug).toBe("basketball");
    expect(pickSport(["soccer", "golf"], sports, "basketball").slug).toBe("soccer");
    expect(pickSport("golf", postersSports(), "basketball").slug).toBe("basketball");
  });

  it("lists only the sports with poster art on /posters", () => {
    const options = postersSports();
    expect(options).toHaveLength(8);
    expect(options.every((s) => s.hasPosterArt)).toBe(true);
    expect(options.map((s) => s.slug)).not.toContain("golf");
  });

  it("is a plain GET form that prefills from ?sport= and needs no JavaScript", () => {
    const html = render(createElement(SportPicker, { action: "/trading-cards", options: sports, selected: sportBySlug("soccer")! }));
    expect(html).toContain('method="get"');
    expect(html).toContain('action="/trading-cards"');
    expect(html).toContain('name="sport"');
    expect(html).toContain(SPORT_PICKER_LABEL);
    expect(html).toMatch(/<option[^>]*value="soccer"[^>]*selected/);
    expect(count(html, /<option/g)).toBe(sports.length);
  });

  it("says what a numberless sport carries instead — and never a number", () => {
    const cheer = sportBySlug("cheerleading")!;
    const html = render(createElement(SportPicker, { action: "/trading-cards", options: sports, selected: cheer }));
    expect(html).toContain(numberlessPickerNote(cheer));
    expect(numberlessPickerNote(cheer)).toBe("No jersey number in cheerleading — the card carries their name and club crest instead.");
    expect(html).not.toMatch(/#\d/);
    const numbered = render(createElement(SportPicker, { action: "/trading-cards", options: sports, selected: sportBySlug("basketball")! }));
    expect(numbered).not.toContain("No jersey number");
  });
});

describe("family pages — the spec sheets", () => {
  it("the card sheet hides the sealed-pack row while the tier is off (GAPS #12)", () => {
    const rows = specRows("cards");
    expect(rows.some((r) => String(r.key) === "Sealed pack")).toBe(getTier("GDE-ANY-CARD-PACK")?.enabled ?? false);
    expect(rows.map((r) => String(r.key))).toContain("Corners");
    expect(rows.find((r) => String(r.key) === "Corners")?.value).toBe("Square-cut");
  });

  it("the poster sheet promises the certificate in every shipped package (GAPS #5)", () => {
    const cert = specRows("posters").find((r) => String(r.key) === "Certificate");
    expect(String(cert?.value)).toContain("Free printed Certificate of Authenticity in every shipped package");
  });

  it("the set sheet is the five folders plus the live page, counted through FILE_COUNTS", () => {
    expect(specRows("set")).toHaveLength(6);
    const html = render(createElement(SpecSheetSection, { family: "set" }));
    expect(html).toContain(`${FILE_COUNTS.set} files and one live page. Counted, not implied.`);
    expect(read("app/(marketing)/complete-set/page.tsx")).not.toMatch(/\b27\b/);
    expect(read(`${SHARED_DIR}/spec-sheet.tsx`)).not.toMatch(/\b27 files\b/);
  });
});

describe("family pages — imagery and the numberless truth", () => {
  it("every asset key the pages use is verified", () => {
    const keys = [
      "cards.demo.front",
      "cards.demo.back",
      "cards.cheer.front",
      "cards.cheer.back",
      "posters.room",
      "set.hero.front",
      "set.hero.back",
      "set.hero.poster",
      ...finishRowKeys("card"),
      ...finishRowKeys("poster"),
    ];
    for (const key of keys) expect(hasAsset(key), key).toBe(true);
  });

  it("the six-finish rows are one athlete per row, six tiles, labelled once", () => {
    for (const variant of ["card", "poster"] as const) {
      const html = render(createElement(FinishesRow, { variant }));
      expect(count(html, /<li/g)).toBe(finishes.length);
      expect(count(html, new RegExp(esc(CANON.fictionalLabel), "g"))).toBe(1);
      for (const style of finishes) expect(html).toContain(esc(style.name));
    }
  });

  it("the 17-sport grid names every sport and captions each back from the catalog", () => {
    const html = render(createElement(SportGrid, {}));
    expect(count(html, /<li/g)).toBe(sports.length);
    for (const sport of sports) {
      expect(html).toContain(esc(sport.name));
      expect(html).toContain(backLine(sport));
    }
    expect(html).not.toMatch(/#\d/);
  });

  it("a numberless sport is never captioned or described with a number", () => {
    for (const code of NUMBERLESS_CODES) {
      const sport = sports.find((s) => s.code === code)!;
      expect(isNumberless(sport)).toBe(true);
      expect(backLine(sport)).toBe("their name, their club crest");
    }
    const html = render(createElement(NumberlessSection, { variant: "card" }));
    expect(html).toContain(esc(CANON.numberlessLine));
    expect(html).not.toMatch(/#\d/);
    expect(numberlessFirstSentence()).toBe(
      "Cheerleading, gymnastics, swimming, tennis and golf don't wear numbers — their card carries their name and club crest instead.",
    );
    // The poster page may not borrow the card's sentence: it says which sports wear no number,
    // and then what the POSTER carries. C9's "their card carries …" half never appears there.
    const poster = render(createElement(NumberlessSection, { variant: "poster" }));
    expect(numberlessSportsClause()).toBe("Cheerleading, gymnastics, swimming, tennis and golf don't wear numbers.");
    expect(poster).toContain(esc(numberlessSportsClause()));
    expect(poster).not.toContain(esc(numberlessFirstSentence()));
    expect(poster).not.toContain("their card carries");
    expect(poster).not.toContain("At checkout");
  });
});

describe("family pages — the sections that were unfinished", () => {
  it("/posters section 05 has content: the same seventeen sports, named", () => {
    const poster = render(createElement(NumberlessSection, { variant: "poster" }));
    for (const sport of sports) expect(poster, sport.slug).toContain(esc(sport.name));
    // A card front and a card-back caption are facts about the CARD; the poster page shows neither.
    expect(poster).not.toContain("plain back");
    expect(poster).not.toContain("their number");
    expect(poster).toContain(esc(POSTER_NAME_BODY));
  });

  it("the card variant still shows the faces and the back lines", () => {
    const card = render(createElement(NumberlessSection, { variant: "card" }));
    expect(card).toContain(backLine(sportBySlug("wrestling")!));
    expect(card).toContain(esc(CANON.fictionalLabel));
  });

  it("/complete-set section 03 shows the count it promises", () => {
    const src = read("app/(marketing)/complete-set/page.tsx");
    expect(src).toContain("setFolderRows()");
    const rows = setFolderRows();
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => String(r.key))).toEqual(["01-print", "02-social", "03-wallpapers", "04-bonus", "05-video"]);
    // The H1 is a four-item list: it may not set on a 16ch measure at the display size (DESIGN §3).
    expect(src).toContain('className="[&>h1]:max-w-[26ch] [&>h1]:text-h2"');
  });

  it("/trading-cards says the not-numbered sentence once — the EditionPanel owns it", () => {
    const src = read("app/(marketing)/trading-cards/page.tsx");
    expect(strip(src)).not.toContain("not individually numbered");
    expect(EDITION_SENTENCE).toContain("not individually numbered");
  });
});

describe("family pages — the demo edition", () => {
  it("the flip hero uses the generated, QR-patched pair and never autoplays above the fold", () => {
    const art = cardArtFor(DEMO_CARD_ID);
    expect(art).not.toBeNull();
    const faces = demoFaces();
    expect(faces).not.toBeNull();
    expect(faces?.front.src).toBe(art?.front);
    expect(faces?.back.src).toBe(art?.back);
    expect(faces?.front.width).toBeGreaterThan(0);
    expect(faces?.front.alt).toContain("Stadium Night");
    expect(faces?.back.alt).toContain("registered card ID and QR code");
    // DESIGN §5.2-1: a static pair in the hero, the flip in section 03 where it may run once. The
    // page therefore mounts exactly one CardFlip, and it is not the hero.
    const src = read(PAGES[0].file);
    expect(count(src, /<CardFlip/g)).toBe(1);
    expect(src.indexOf("<CardFlip")).toBeGreaterThan(src.indexOf("<SpecSheetSection"));
    expect(src).not.toMatch(/<CardFlip[\s\S]*?priority/);
  });

  it("the demo record is the fictional basketball edition, labelled as an example", () => {
    const card = demoCard();
    expect(card?.isFictional).toBe(true);
    expect(card?.cardId).toBe(DEMO_CARD_ID);
    expect(DEMO_LABEL).toBe("Example edition · Fictional athlete");
    for (const page of ["app/(marketing)/trading-cards/page.tsx", "app/(marketing)/complete-set/page.tsx"]) {
      expect(read(page)).toContain("demoLabel={DEMO_LABEL}");
    }
  });
});

describe("family pages — open-graph images", () => {
  for (const page of PAGES) {
    it(`${page.path}: declares alt, size and content type and prices from the ladder`, () => {
      const src = read(page.og);
      expect(src).toMatch(/export const alt = "/);
      expect(src).toContain("export const size = { width: OG_SIZE.width, height: OG_SIZE.height };");
      expect(src).toContain("export const contentType = OG_CONTENT_TYPE;");
      expect(src).toContain("familyOgImage(");
      expect(strip(src)).not.toMatch(/\$\d/);
    });
  }

  it("the share card draws its objects — Satori cannot decode the WebP the site ships", () => {
    const og = strip(read(`${SHARED_DIR}/og.tsx`));
    expect(og).toContain("fromPrice(family)");
    expect(og).not.toContain("<img");
  });
});

describe("family pages — assets referenced only through the map", () => {
  it("every SITE_ASSETS key the shared pieces build is either verified or has a text fallback", () => {
    for (const sport of sports) {
      const key = `sport.${sport.slug}.front`;
      expect(SITE_ASSETS[key], key).toBeDefined();
    }
    for (const style of finishes) {
      expect(SITE_ASSETS[`finish.${style.code}.front`]).toBeDefined();
      expect(SITE_ASSETS[`posters.finish.${style.code}`]).toBeDefined();
    }
  });
});

/**
 * The three pages are server-rendered on demand (they read `?sport=`), so `next build` never executes
 * them — these renders do, and they are the only place a runtime error in a family page would surface.
 */
describe("family pages — a full render", () => {
  type PageFn = (props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) => Promise<React.ReactElement>;
  const pages: [string, PageFn][] = [
    ["/trading-cards", TradingCardsPage as unknown as PageFn],
    ["/posters", PostersPage as unknown as PageFn],
    ["/complete-set", CompleteSetPage as unknown as PageFn],
  ];
  const html = async (page: PageFn, sport?: string) => render(await page({ searchParams: Promise.resolve(sport ? { sport } : {}) }));

  for (const [route, page] of pages) {
    it(`${route} renders one H1, three tiers, the Product and FAQPage markup and its breadcrumb`, async () => {
      const out = await html(page);
      expect(count(out, /<h1/g)).toBe(1);
      expect(count(out, /<article/g)).toBe(3);
      expect(out).toContain('"@type":"Product"');
      expect(count(out, /"@type":"Product"/g)).toBe(1);
      expect(count(out, /FAQPage/g)).toBe(1);
      expect(out).toContain("BreadcrumbList");
      expect(count(out, /aria-label="Delivery times"/g)).toBe(4); // the hero claim + one chip per tier card
      expect(count(out, /fetchPriority="high"/g)).toBeLessThanOrEqual(1);
      expect(out).not.toMatch(/<video/);
      expect(out).toContain(esc(CANON.trustLine.split(" · ")[0]));
    });
  }

  it("the picker's sport reaches every CTA on the page", async () => {
    const out = await html(pages[0][1], "soccer");
    expect(out).toContain("/go/etsy/GDE-SOC-CARD-P12");
    expect(out).toMatch(/<option[^>]*value="soccer"[^>]*selected/);
  });

  it("an unsupported sport on /posters falls back to the default, and its CTAs with it", async () => {
    const out = await html(pages[1][1], "golf");
    expect(out).not.toContain("GDE-GLF-");
    expect(out).toContain("/go/etsy/GDE-BKB-POST-P1824");
  });

  it("a numberless sport never gets a number, in copy or in a CTA", async () => {
    const out = await html(pages[0][1], "cheerleading");
    expect(out).toContain(esc(numberlessPickerNote(sportBySlug("cheerleading")!)));
    expect(out).not.toMatch(/#\d{1,2}\b/);
    expect(out).toContain("/go/etsy/GDE-CHR-CARD-P12");
  });
});
