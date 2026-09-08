// trust-pages (CONTRACTS §5.5, §8): /how-it-works · /guarantee · /photo-guide · /about · /faq · /contact.
// The rules these six pages must not break — schema counts, the copy that comes from the catalog, the
// GAPS overrides (#19 imprint gate, #31 "reprinted at cost", #34 panel grid) and the page budgets.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { faqAll, faqGroups, faqSubset } from "../lib/catalog/faq";
import { LABS_SENTENCE, PARTNERS, visiblePartners, visibleShippingRows } from "../lib/catalog/shipping";
import { photoChecklist, NEVER_ASKED_FOR, PHOTO_GUIDE_CLOSING } from "../lib/catalog/photo-checklist";
import { FILE_COUNTS } from "../lib/catalog/tiers";
import { CANON } from "../lib/copy/canon";
import { PAGES } from "../lib/seo/titles";
import { DELIVERED_COUNT, imprintComplete } from "../lib/site";

const ROOT = process.cwd();

const PAGE_PATHS = {
  "/how-it-works": "app/(marketing)/how-it-works/page.tsx",
  "/guarantee": "app/(marketing)/guarantee/page.tsx",
  "/photo-guide": "app/(marketing)/photo-guide/page.tsx",
  "/about": "app/(marketing)/about/page.tsx",
  "/faq": "app/(marketing)/faq/page.tsx",
  "/contact": "app/(marketing)/contact/page.tsx",
} as const;

type Route = keyof typeof PAGE_PATHS;
const ROUTES = Object.keys(PAGE_PATHS) as Route[];

const OG_ROUTES: Route[] = ["/how-it-works", "/guarantee", "/photo-guide", "/about"];

const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), "utf8");

/** Every file that ships as part of a route (page + its own islands + the OG image). */
function routeFiles(route: Route): string[] {
  const dir = path.dirname(PAGE_PATHS[route]);
  return fs
    .readdirSync(path.join(ROOT, dir))
    .filter((f) => f.endsWith(".tsx"))
    .map((f) => path.join(dir, f));
}

describe("trust-pages — the six files exist and take their metadata from PAGES", () => {
  for (const route of ROUTES) {
    it(`${route} exists, is in PAGES and calls pageMeta("${route}")`, () => {
      const src = read(PAGE_PATHS[route]);
      expect(PAGES[route]).toBeDefined();
      expect(src).toContain(`pageMeta("${route}")`.replace(")", "")); // pageMeta("/x") or pageMeta("/x", {…})
      expect(src).not.toMatch(/export const metadata: Metadata = \{/);
    });
  }

  for (const route of OG_ROUTES) {
    it(`${route} has an opengraph-image built on lib/og`, () => {
      const src = read(path.join(path.dirname(PAGE_PATHS[route]), "opengraph-image.tsx"));
      expect(src).toContain("OgFrame");
      expect(src).toContain("loadGoogleFont");
      expect(src).toContain("OG_SIZE");
    });
  }
});

describe("trust-pages — schema", () => {
  it("no page emits more than one FAQPage", () => {
    for (const route of ROUTES) {
      const src = read(PAGE_PATHS[route]);
      const body = src.replace(/^import [\s\S]*?;$/gm, ""); // an import of faqPage is not an emission
      const jsonLdFaqLists = body.match(/<FaqList[^>]*\bjsonLd\b/g)?.length ?? 0;
      const explicitFaqPage = body.match(/faqPage\(/g)?.length ?? 0;
      expect(jsonLdFaqLists + explicitFaqPage, `${route} emits more than one FAQPage`).toBeLessThanOrEqual(1);
    }
  });

  it("/faq opens the first answer of every group and leaves the rest shut", async () => {
    // A page of 34 shut rows answers nothing above the fold. The open row is a real <details>, so
    // the reader can shut it, and the schema is untouched (one FAQPage over faqAll()).
    const { default: FaqPage } = await import("../app/(marketing)/faq/page");
    const html = renderToStaticMarkup(FaqPage() as ReactElement);
    const groups = faqGroups();
    // The open row is FaqList's own `openFirst` now — /faq no longer keeps a second copy of the
    // accordion markup, so both accordions on the site can only ever look the same (audit N8).
    const open = html.match(/<details[^>]*\sopen=""/g)?.length ?? 0;
    expect(open).toBe(groups.length);
    const openIds = [...html.matchAll(/<details id="([^"]+)"[^>]*\sopen=""/g)].map((m) => m[1]);
    expect(openIds).toEqual(groups.map((g) => g.items[0].id));
    expect(html.match(/<details/g)?.length).toBe(faqAll().length);
  });

  it("/faq emits its FAQPage over faqAll()", () => {
    const src = read(PAGE_PATHS["/faq"]);
    expect(src).toMatch(/faqPage\(faqAll\(\)\)/);
    expect(faqAll().length).toBeGreaterThan(20);
  });

  it("/how-it-works emits article() and a 6-item FAQ subset with unique ids", () => {
    const src = read(PAGE_PATHS["/how-it-works"]);
    expect(src).toContain("article(");
    expect(src).toContain('faqSubset("how-it-works")');
    const subset = faqSubset("how-it-works");
    expect(subset).toHaveLength(6);
    expect(new Set(subset.map((i) => i.id)).size).toBe(subset.length);
  });

  it("/photo-guide emits article()", () => {
    expect(read(PAGE_PATHS["/photo-guide"])).toContain("article(");
  });

  it("/about emits person() and never organization() again", () => {
    const src = read(PAGE_PATHS["/about"]);
    expect(src).toContain("person()");
    expect(src).not.toContain("organization(");
  });

  it("every page renders Breadcrumbs (which carry the BreadcrumbList)", () => {
    for (const route of ROUTES) expect(read(PAGE_PATHS[route]), route).toContain("<Breadcrumbs");
  });
});

describe("trust-pages — copy comes from the catalog, not from the page", () => {
  it("/how-it-works and /about name the partners through PARTNERS", () => {
    for (const route of ["/how-it-works", "/about"] as Route[]) {
      const src = read(PAGE_PATHS[route]);
      expect(src, route).toContain("visiblePartners()");
      for (const p of PARTNERS) expect(src, `${route} hard-codes "${p.name}"`).not.toContain(p.name);
    }
    expect(visiblePartners().map((p) => p.name)).toEqual(PARTNERS.filter((p) => p.key !== "pack").map((p) => p.name));
  });

  it("the labs sentence is the constant, not retyped", () => {
    for (const route of ["/how-it-works", "/about"] as Route[]) {
      const src = read(PAGE_PATHS[route]);
      expect(src).toContain("LABS_SENTENCE");
      expect(src).not.toContain(LABS_SENTENCE.slice(0, 40));
    }
  });

  it("/guarantee builds its shipping table from visibleShippingRows()", () => {
    const src = read(PAGE_PATHS["/guarantee"]);
    expect(src).toContain("visibleShippingRows()");
    const rows = visibleShippingRows();
    expect(rows.map((r) => r.key)).toEqual(["digital", "cards", "posters"]);
    // The cells unique to this table (a stage name in the refund ladder may legitimately repeat a package name).
    const cells = rows.flatMap((r) => [r.carrier, r.timing, r.shipsFrom]).filter((c) => c.length > 8);
    for (const cell of cells) expect(src, `hard-coded cell "${cell}"`).not.toContain(cell);
  });

  it("/photo-guide renders the nine catalog rows, never its own list", () => {
    const src = read(PAGE_PATHS["/photo-guide"]);
    expect(src).toContain("<PhotoChecklist");
    expect(src).toContain("photoChecklist");
    expect(photoChecklist).toHaveLength(9);
    expect(src).toContain("NEVER_ASKED_FOR");
    expect(src).toContain("PHOTO_GUIDE_CLOSING");
    for (const item of photoChecklist) expect(src, `hard-coded "${item.title}"`).not.toContain(item.title);
    expect(src).not.toContain(NEVER_ASKED_FOR);
    expect(src).not.toContain(PHOTO_GUIDE_CLOSING);
  });

  it("canon sentences come from CANON / block(), never retyped", () => {
    const how = read(PAGE_PATHS["/how-it-works"]);
    expect(how).toContain("CANON.deliveryClocks");
    expect(how).toContain("CANON.proofChecklist");
    expect(how).toContain('block("how-its-made")');
    expect(how).toContain('block("independent-studio")');
    expect(how).not.toContain(CANON.deliveryClocks.slice(0, 40));

    const guarantee = read(PAGE_PATHS["/guarantee"]);
    expect(guarantee).toContain('block("our-promise")');
    // C11 (free in the US, US only) is the one delivery fact the shipping table does not carry, so
    // it is the one that stays under it; C10 and C12 were the table retyped as prose and were
    // dropped (owner review 2026-09-07) — both still stand on /how-it-works, in the FAQ and in the
    // terms, which the seo / libs suites assert.
    expect(guarantee).toContain("CANON.shipping");
    expect(guarantee).not.toContain("CANON.stagedDelivery");
    expect(guarantee).not.toContain("CANON.deliveryClocks");

    expect(read(PAGE_PATHS["/photo-guide"])).toContain('block("photos-that-work-best")');
    expect(read(PAGE_PATHS["/about"])).toContain('block("logo-sentence")');
  });

  it("/about renders the file count through FILE_COUNTS", () => {
    const src = read(PAGE_PATHS["/about"]);
    expect(src).toContain("FILE_COUNTS.set");
    expect(src).not.toMatch(new RegExp(`\\b${FILE_COUNTS.set} files\\b`));
  });
});

describe("trust-pages — the GAPS overrides", () => {
  it('#31 — "reprinted at cost" appears nowhere, and the delivered count is gated', () => {
    for (const route of ROUTES) expect(read(PAGE_PATHS[route]), route).not.toMatch(/reprinted at cost/i);
    const guarantee = read(PAGE_PATHS["/guarantee"]);
    expect(guarantee).toContain("DELIVERED_COUNT");
    expect(DELIVERED_COUNT).toBeLessThan(5);
    expect(guarantee).not.toMatch(/So far: \d+ editions delivered/);
  });

  it("#19 — /about gates the imprint; no 'legal entity' or 'Registered in Lithuania' without it", () => {
    const src = read(PAGE_PATHS["/about"]);
    expect(src).toContain("imprintComplete()");
    expect(imprintComplete()).toBe(false);
    // Both strings exist only inside the `complete ?` branch, after the gate.
    const gate = src.indexOf("{complete ? (");
    expect(gate).toBeGreaterThan(-1);
    expect(src.indexOf("THE LEGAL ENTITY.")).toBeGreaterThan(gate);
    expect(src.indexOf("Registered in Lithuania")).toBeGreaterThan(gate);
  });

  it("#34 — /photo-guide draws six panel captions in the image's order (3 pass, then 3 fail)", () => {
    const src = read(PAGE_PATHS["/photo-guide"]);
    const statuses = Array.from(src.matchAll(/status: "(pass|fail)", text:/g)).map((m) => m[1]);
    expect(statuses).toEqual(["pass", "pass", "pass", "fail", "fail", "fail"]);
  });

  it("/contact keeps the mailto-only shape: no form, no F2 route, no response window", () => {
    const src = read(PAGE_PATHS["/contact"]);
    expect(src).not.toContain("<form");
    expect(src).not.toContain("/order/recover");
    expect(src).not.toMatch(/within 1 business day, US Eastern/);
    expect(src).toContain("mailto:");
  });

  it("the six gates are the six COPY names, in order, each with one artefact", () => {
    const src = read(PAGE_PATHS["/how-it-works"]);
    const labels = Array.from(src.matchAll(/^\s{4}label: "([A-Z &]+)",$/gm)).map((m) => m[1]);
    expect(labels).toEqual(["PHOTO CHECK", "KIT BUILD", "REFERENCE SET", "THE SHOTS", "VERIFICATION", "FINISH"]);
    expect(src).toContain("<GateRow");
    expect(src).toContain("<ProofRejectedPair");
    expect(src).toContain('assetOrNull("home.rejected.fail")');
    expect(src).toContain('assetOrNull("home.rejected.pass")');
    // The photo-check artefact is HTML, never an image key that does not exist.
    expect(src).not.toContain('asset("how.gate.photo-check")');
  });
});

describe("trust-pages — budgets and the ban list", () => {
  const BANNED: [RegExp, string][] = [
    [/TEMPLATE/, '"TEMPLATE" label'],
    [/\bCover Moment\b/i, "old brand"],
    [/\binstant(ly)?\b/i, "'instant'"],
    [/\b25 cards\b/i, "25 cards"],
    [/18\s*\+\s*4/, "'18 + 4'"],
    [/rounded corners/i, "cards are square-cut"],
    [/free shipping worldwide/i, "US only"],
    [/\btopps\b|\bpanini\b|upper deck|graded slab/i, "competitor comparison"],
    [/\bAI generator\b/i, "'AI generator'"],
    [/neon future/i, "dropped finish"],
    [/\bvintage\b/i, "dropped finish"],
    [/\bpdf\b/i, "PNG only"],
    [/stripe payment link/i, "stale process copy"],
    [/\b16 ?pt\b/i, "unconfirmed stock claim"],
    [/semi-?gloss/i, "unconfirmed stock claim"],
    [/\bcheaper\b|same price on etsy/i, "Etsy comparison"],
    [/\bverified (edition|card|athlete|review|buyer|purchase|customer|seller)s?\b/i, "'Verified' badge wording"],
    [/\b(customer|verified|real|5-star) reviews?\b|\b\d(\.\d)? ?stars\b|\b\d\.\d\/5\b/i, "review / star claim"],
    [/\b(10|22) (collectible )?cards\b/i, "pack is 18 cards total"],
    [/\byouth\b/i, "never 'youth'"],
  ];

  for (const route of ROUTES) {
    for (const file of routeFiles(route)) {
      it(`${file} carries no banned string`, () => {
        const src = read(file);
        const hits = BANNED.filter(([re]) => re.test(src)).map(([, why]) => why);
        expect(hits, `forbidden: ${hits.join("; ")}`).toEqual([]);
      });

      it(`${file} has no "$<digits>" literal and no bare outline-none`, () => {
        const src = read(file);
        expect(src).not.toMatch(/\$\d/);
        expect(src).not.toMatch(/outline-none|focus:outline-0/);
      });
    }
  }

  it("preloads nothing above the fold, makes one delivery claim and plays no video", () => {
    // Owner review 2026-09-07: the mobile LCP is the headline on every one of these pages, so no
    // trust page preloads a hero image at all — `priority` fetches ahead of everything else whatever
    // the layout does with the pixels afterwards.
    for (const route of ROUTES) {
      for (const file of routeFiles(route)) {
        const src = read(file);
        expect(src.match(/\bpriority\b/g) ?? [], `${file}: preloaded image`).toEqual([]);
        expect(src, `${file}: fetchPriority`).not.toContain("fetchPriority");
        expect((src.match(/<DeliveryChips/g) ?? []).length, `${file}: DeliveryChips`).toBeLessThanOrEqual(1);
        expect(src, `${file}: <video>`).not.toContain("<video");
      }
    }
  });

  it("every page is ISR-revalidated and none imports art directly", () => {
    for (const route of ROUTES) {
      const src = read(PAGE_PATHS[route]);
      expect(src, route).toContain("export const revalidate = 3600");
      expect(src, route).not.toMatch(/from "\.\.\/.*(etsy|marketing|art-pipeline)\//);
    }
  });

  it("every <Image> in these files declares sizes and dimensions", () => {
    for (const route of ROUTES) {
      for (const file of routeFiles(route)) {
        const src = read(file);
        for (const tag of src.match(/<Image[\s\S]*?\/>/g) ?? []) {
          expect(tag, `${file}: <Image> without sizes`).toContain("sizes=");
          expect(tag.includes("fill") || (tag.includes("width=") && tag.includes("height=")), `${file}: <Image> without dimensions`).toBe(true);
        }
      }
    }
  });
});

/* ---------- the 2026-09-07 owner review: the opener, the claims and the columns ---------- */

describe("trust pages — the 2026-09-07 opener review", () => {
  /** The hero of a page: everything before its second <section>. */
  const heroOf = (route: Route): string => {
    const src = read(PAGE_PATHS[route]);
    const first = src.indexOf("<section");
    const second = src.indexOf("<section", first + 1);
    return src.slice(first, second === -1 ? undefined : second);
  };

  it("no page above the fold offers a claim shaped like a button", () => {
    // A filled accent lozenge beside an outlined one, a few pixels above a filled accent button
    // beside an outlined button, is the button pattern printed twice: people tried to click the
    // claims. Hero claims are typographic labels; the accent survives as a 3 px tick.
    for (const route of ROUTES) {
      const hero = heroOf(route);
      for (const tag of hero.match(/<Pill[^>]*>/g) ?? []) {
        expect(tag, `${route}: a chip pill in the hero`).toContain('variant="label"');
      }
    }
  });

  it("makes at most one accent claim per page", () => {
    for (const route of ROUTES) {
      const src = read(PAGE_PATHS[route]);
      expect((src.match(/tone="accent"/g) ?? []).length, `${route}: accent claims`).toBeLessThanOrEqual(1);
    }
  });

  it("every H1 has a subhead, and every heading ends with a full stop", () => {
    for (const route of ROUTES) {
      const src = read(PAGE_PATHS[route]);
      // /contact writes its subhead by hand because it carries a mailto link inside the sentence.
      if (route !== "/contact") {
        const h1 = src.slice(src.indexOf('as="h1"'));
        expect(h1.slice(0, 700), `${route}: an H1 with no subhead`).toContain("subhead=");
      }
      for (const title of src.match(/title="[^"]+"/g) ?? []) {
        expect(title.endsWith('."') || title.endsWith('?"'), `${route}: ${title}`).toBe(true);
      }
    }
  });

  it("gives /how-it-works and /guarantee two hero columns stretched to one row", () => {
    // A grid whose second column is much taller leaves the first one's content stranded hundreds of
    // pixels above the fold line; `items-stretch` plus `lg:h-full` on the object makes the two
    // columns end together.
    for (const route of ["/how-it-works", "/guarantee"] as Route[]) {
      const hero = heroOf(route);
      expect(hero, `${route}: hero grid`).toContain("lg:items-stretch");
      expect((hero.match(/lg:col-span-6/g) ?? []).length, `${route}: two six-wide columns`).toBe(2);
      // The object column fills the row: on /how-it-works that class lives in its HeroMedia figure.
      expect(read(PAGE_PATHS[route]), `${route}: the object fills its track`).toContain("lg:h-full");
    }
  });

  it("gives /how-it-works a real photograph and never a key asset() has not heard of", () => {
    const src = read(PAGE_PATHS["/how-it-works"]);
    for (const key of ["moment.card.hallway", "moment.card.bleachers", "life.card.hand"]) {
      expect(src, `missing hero key ${key}`).toContain(key);
    }
    expect(src).toContain("hasAsset");
    expect(src).not.toContain('asset("moment.');
    expect(src).not.toContain('asset("life.');
  });
});
