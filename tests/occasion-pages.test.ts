// The three occasion and banner pages (SEO plan 2026-10-06, builder O): /banners, /christmas-gift and
// /teams. Each renders with one H1, one FAQPage and one BreadcrumbList; /banners carries the banner
// ladder as Product JSON-LD; /christmas-gift prints exactly the dates christmasDates() computes; /teams
// is honest for today (the mailto, the free-proof form, the coach line from the master FAQ). Every
// internal link resolves, every dollar figure is a catalog price, and the truth lint holds on the
// rendered text — not just on the source.
import { describe, expect, it, vi } from "vitest";

// node_modules is a symlink on the owner's Mac: unwrap next/image's CJS default the way tests/blog.test.ts does.
vi.mock("next/image", async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const d = mod.default as Record<string, unknown> | undefined;
  return { ...mod, default: d && typeof d === "object" && "default" in d && !("$$typeof" in d) ? d.default : d };
});
// No app router under renderToStaticMarkup (tests/families.test.ts); nothing on these pages needs one, but a
// shared component that later reaches for it must not take the suite down.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => {}, push: () => {}, refresh: () => {}, back: () => {}, forward: () => {}, prefetch: () => {} }),
  usePathname: () => "/",
}));

import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { christmasDates, formatEt, toEtDate, addCalendarDays } from "../lib/capacity";
import { LEAD_TIMES } from "../lib/catalog/delivery";
import { faqById } from "../lib/catalog/faq";
import { listingIdForSku } from "../lib/catalog/listings";
import { SALE_EXPIRES_AT, bannerTiers, formatUsd, isSaleActive, priceDisplay, sitePrice } from "../lib/catalog/prices";
import { TEAM_ORDER_MAILTO, isChristmasWindow } from "../lib/catalog/seasons";
import { sportBySlug, sports } from "../lib/catalog/sports";
import { styles } from "../lib/catalog/styles";
import { tierNotes } from "../lib/catalog/tiers";
import { CANON } from "../lib/copy/canon";
import { freeProofMode } from "../lib/cta";
import { INTAKE_PATH } from "../lib/intake/copy";
import { PRODUCTS, optionOf, productByKey, productFromLabel, setFromLabel } from "../lib/intake/products";
import { pageMeta } from "../lib/seo/meta";
import { seniorNightSports } from "../lib/seo/senior-night-facts";
import { hubLine, sportPageSports } from "../lib/seo/sport-facts";
import { PAGES } from "../lib/seo/titles";
import { SUPPORT_EMAIL } from "../lib/site";
import BannersPage, {
  BANNER_LADDER,
  BANNER_SHIP_LINE,
  BANNER_SIZES,
  BANNER_SPORTS,
  BANNERS_H1,
  BannersBody,
  SN_BANNER_SPORTS,
  bannerQuestions,
  bannerTierParts,
  metadata as bannersMetadata,
} from "../app/(marketing)/banners/page";
import ChristmasGiftPage, {
  ALL_LATE_LINE,
  CHRISTMAS_H1,
  ChristmasGiftBody,
  PRINTED_LATE_LINE,
  christmasPlan,
  christmasQuestions,
  metadata as christmasMetadata,
  stateLine,
} from "../app/(marketing)/christmas-gift/page";
import TeamsPage, { EMAIL_LABEL, TEAMS_H1, TeamsBody, metadata as teamsMetadata, teamQuestions } from "../app/(marketing)/teams/page";

const ROOT = process.cwd();
const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), "utf8");
const render = (el: ReactElement): string => renderToStaticMarkup(el);
const count = (text: string, re: RegExp): number => text.match(re)?.length ?? 0;

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " };
const decode = (s: string): string => s.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (m) => ENTITIES[m] ?? m).replace(/\u00a0/g, " ");
const withoutScripts = (html: string): string => html.replace(/<script[\s\S]*?<\/script>/g, " ");
/** Inline tags (a link inside a sentence, an sr-only span) join their text without a space; block tags break it. */
const textOf = (html: string): string =>
  decode(withoutScripts(html).replace(/<\/?(?:a|span|strong|em|time|s|b|i)(?:\s[^>]*)?>/g, "").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const attrs = (html: string, name: string): string[] => [...html.matchAll(new RegExp(`\\s${name}="([^"]*)"`, "g"))].map((m) => decode(m[1]));
const hrefs = (html: string): string[] => attrs(withoutScripts(html), "href");
const headings = (html: string, tag: "h1" | "h2" | "h3"): string[] =>
  [...html.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "g"))].map((m) => textOf(m[1]));
const jsonLd = (html: string): Record<string, unknown>[] =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>);
const typesOf = (html: string): string[] => jsonLd(html).map((o) => String(o["@type"]));
/** renderToStaticMarkup escapes these; copy assertions compare against the escaped form. */
const esc = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ---------- the truth lint, on the rendered page ---------- */

/** tests/blog.test.ts FORBIDDEN, copied: that file scans posts, this one scans these three pages. */
const FORBIDDEN: Array<[RegExp, string]> = [
  [/cover\s?moment/i, "old brand"],
  [/\binstant(ly)?\b/i, "'instant' anything"],
  [/\b25 cards\b/i, "25 cards"],
  [/18\s*\+\s*4/, "'18 + 4'"],
  [/rounded corners/i, "cards are square-cut"],
  [/free shipping worldwide/i, "US only"],
  [/\btopps\b|\bpanini\b|upper deck|graded slab/i, "competitor / slab comparison"],
  [/\bAI generator\b/i, "'AI generator' framing"],
  [/neon future|vintage/i, "dropped finish"],
  [/\bpdf\b/i, "deliverables are PNG only"],
  [/\bverified\b/i, "'Verified' — the registry says Registered (D9)"],
  [/\bnumbered\b/i, "cards carry a registered card ID, never 'numbered' (S10, D21)"],
  [/\b(customer|verified|real|5-star) reviews?\b|\b\d(\.\d)? ?stars\b|\b\d\.\d\/5\b/i, "review / star claim"],
  [/\b(10|22) (collectible )?cards\b/i, "pack is 18 cards total"],
  [/stripe/i, "provider name — 'secure payment link'"],
  [/(?<![-\w])16 ?pt\b(?![-\w])|semi-?gloss/i, "unconfirmed stock claim"],
  [/\bcheaper\b|same price on etsy/i, "Etsy comparison wording"],
  [/\byouth\b/i, "never the age word"],
  [/supabase|resend|printful|printify|bay photo|whcc|qpmn|vertex|gemini|nano banana/i, "provider name in copy"],
  [/30\s*[×x]\s*40/i, "the 30 × 40 size is not sold"],
  [/\bsale\b|% off|\bdiscount|\bcoupon/i, "no sale talk"],
  [/\d\s?%/, "no percentages"],
  [/\bfamilies (love|say|told)|\d+\s+(families|parents|customers)\b/i, "no 'N families' / customer stories"],
  [/colour|favourite|centre\b|organis|\bgrey\b|practis|catalogue|licence|cheque/i, "US spelling"],
];

/**
 * TierCard's own sale vocabulary ("Sale price until …", the sr-only "Sale price " / "Regular price "),
 * printed only while SALE_EXPIRES_AT is in the future. It is the ladder's display rule (prices.ts), not
 * this page's prose, so it is lifted out before the "no sale talk" rule runs.
 */
const withoutTierSaleCopy = (text: string): string => text.replace(/Sale price until [A-Z][a-z]{2} \d{1,2}, \d{4}/g, " ").replace(/(Sale|Regular) price /g, " ");

/** The /sports hub line of every sport the catalog marks `numbered` — the one place these pages may say "their number". */
const NUMBERED_HUB_LINES = [...new Set(sports.filter((s) => s.numbered).map((s) => hubLine(s)))];

function expectTruthful(html: string): void {
  const prose = withoutTierSaleCopy(`${textOf(html)} ${attrs(html, "alt").join(" ")} ${attrs(html, "aria-label").join(" ")}`);
  for (const [re, why] of FORBIDDEN) expect(prose, why).not.toMatch(re);
  // A jersey number is promised only for a sport whose kit carries one (`sport.numbered`, through hubLine()).
  const ownWords = NUMBERED_HUB_LINES.reduce((text, line) => text.split(line).join(" "), prose);
  expect(ownWords).not.toMatch(/\btheir number\b|#\d{1,2}\b/i);
}

/** Every "$<digits>" on the page, scripts excluded (JSON-LD prices are numbers, never "$" strings). */
const dollarsIn = (html: string): string[] => withoutScripts(html).match(/\$\d[\d,]*(?:\.\d{2})?/g) ?? [];
const dollarOf = (label: string): string => label.match(/\$\d[\d,]*(?:\.\d{2})?/)?.[0] ?? "";

/** The product-tile prices both gift pages print: "from" each priced product, and the set. */
function productPrices(now: Date): string[] {
  return [...PRODUCTS.map((p) => productFromLabel(p, now)).filter((l): l is string => Boolean(l)).map(dollarOf), dollarOf(setFromLabel(now))];
}

/** The ladder prices /banners prints: each enabled tier's current price, and the struck regular price while a sale runs. */
function ladderPrices(now: Date): string[] {
  return bannerTiers
    .filter((t) => t.enabled)
    .flatMap((t) => {
      const p = priceDisplay(t, now);
      return [formatUsd(p.current), ...(p.compareAt !== undefined ? [formatUsd(p.compareAt)] : [])];
    });
}

function expectOnlyCatalogPrices(html: string, expected: string[]): void {
  const found = dollarsIn(html);
  for (const figure of found) expect(expected, `${figure} is not a catalog price`).toContain(figure);
  for (const figure of expected) expect(found, `${figure} is missing`).toContain(figure);
}

/* ---------- every link resolves ---------- */

const SPORT_PAGE_SLUGS = new Set(sportPageSports().map((s) => s.slug));
const SPOKE_SLUGS = new Set(seniorNightSports().map((s) => s.slug));
/** Built in parallel with these pages (SEO plan 2026-10-06): a row in the titles table, a page.tsx soon. */
const IN_FLIGHT = new Set(["/sports"]);
const FREE_PROOF_PARAMS = ["product", "option", "sport", "style", "classOf"];

function expectFreeProofQuery(query: string): void {
  const params = new URLSearchParams(query);
  for (const key of params.keys()) expect(FREE_PROOF_PARAMS, `unknown free-proof parameter "${key}"`).toContain(key);
  const products = (params.get("product") ?? "").split(",").filter(Boolean);
  for (const key of products) expect(productByKey(key), `product=${key}`).toBeTruthy();
  const option = params.get("option");
  if (option) {
    for (const part of option.split(",")) {
      const [p, o] = part.includes(":") ? part.split(":") : [undefined, part];
      const owners = (p ? [p] : products).map((key) => productByKey(key)!).filter(Boolean);
      expect(owners.some((product) => optionOf(product, o)), `option=${part}`).toBe(true);
    }
  }
  const sport = params.get("sport");
  if (sport) expect(sportBySlug(sport), `sport=${sport}`).toBeTruthy();
  const style = params.get("style");
  if (style) expect(styles.some((s) => s.code === style), `style=${style}`).toBe(true);
}

function expectResolves(href: string): void {
  if (href.startsWith("mailto:")) {
    expect(href.startsWith(`mailto:${SUPPORT_EMAIL}`), href).toBe(true);
    return;
  }
  expect(href.startsWith("/"), `${href} leaves the site (Etsy only through /go/etsy/)`).toBe(true);
  const [pathPart, query = ""] = href.split("#")[0].split("?");
  if (pathPart.startsWith("/go/etsy/")) {
    const sku = pathPart.slice("/go/etsy/".length);
    expect(sku).toMatch(/^GDE-[A-Z]{3}-[A-Z]+(?:-[A-Z0-9]+)?$/);
    if (/^GDE-(?!ANY-)[A-Z]{3}-(BAN|SNBAN)$/.test(sku)) expect(listingIdForSku(sku), `${sku} has no listing`).toBeTruthy();
    return;
  }
  if (pathPart === INTAKE_PATH) {
    expectFreeProofQuery(query);
    return;
  }
  const sportPage = /^\/sports\/([a-z0-9-]+)$/.exec(pathPart);
  if (sportPage) {
    expect(SPORT_PAGE_SLUGS.has(sportPage[1]), pathPart).toBe(true);
    return;
  }
  const spoke = /^\/senior-night\/([a-z0-9-]+)$/.exec(pathPart);
  if (spoke) {
    expect(SPOKE_SLUGS.has(spoke[1]), pathPart).toBe(true);
    return;
  }
  const file = pathPart === "/" ? "app/(marketing)/page.tsx" : `app/(marketing)${pathPart}/page.tsx`;
  if (IN_FLIGHT.has(pathPart) && !fs.existsSync(path.join(ROOT, file))) {
    expect(PAGES[pathPart], `${pathPart} is in flight but has no titles row`).toBeDefined();
    return;
  }
  expect(fs.existsSync(path.join(ROOT, file)), `${pathPart} has no page.tsx`).toBe(true);
}

/* ---------- the shared shape ---------- */

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen"];

const FILES = {
  "/banners": "app/(marketing)/banners",
  "/christmas-gift": "app/(marketing)/christmas-gift",
  "/teams": "app/(marketing)/teams",
} as const;

type Route = keyof typeof FILES;

const NOW = new Date();
const PAGE_HTML: Record<Route, () => string> = {
  "/banners": () => render(createElement(BannersBody, { now: NOW })),
  "/christmas-gift": () => render(createElement(ChristmasGiftBody, { now: NOW })),
  "/teams": () => render(createElement(TeamsBody, { now: NOW })),
};
const H1: Record<Route, string> = { "/banners": BANNERS_H1, "/christmas-gift": CHRISTMAS_H1, "/teams": TEAMS_H1 };
const METADATA = { "/banners": bannersMetadata, "/christmas-gift": christmasMetadata, "/teams": teamsMetadata } as const;
const BREADCRUMB: Record<Route, string> = { "/banners": "Banners", "/christmas-gift": "Christmas gift", "/teams": "Teams" };

describe("occasion pages — the shape every page shares", () => {
  for (const route of Object.keys(FILES) as Route[]) {
    describe(route, () => {
      const html = PAGE_HTML[route]();
      const src = read(`${FILES[route]}/page.tsx`);

      it("the default export renders the same page as its body", () => {
        const page = { "/banners": BannersPage, "/christmas-gift": ChristmasGiftPage, "/teams": TeamsPage }[route];
        const out = render(createElement(page));
        expect(count(out, /<h1[\s>]/g)).toBe(1);
        expect(headings(out, "h1")).toEqual([H1[route]]);
      });

      it("metadata is the titles-table row, and the page revalidates hourly", () => {
        expect(METADATA[route]).toEqual(pageMeta(route));
        expect(PAGES[route].phase).toBe("F1");
        expect(src).toContain("export const revalidate = 3600;");
        expect(src).toContain(`const PATH = "${route}";`);
        expect(src).toContain("pageMeta(PATH)");
      });

      it("one H1, H2s that end with a full stop, one FAQPage and one BreadcrumbList", () => {
        expect(count(html, /<h1[\s>]/g)).toBe(1);
        expect(headings(html, "h1")).toEqual([H1[route]]);
        expect(H1[route].endsWith(".")).toBe(true);
        const h2s = headings(html, "h2");
        expect(h2s.length).toBeGreaterThanOrEqual(4);
        for (const h2 of h2s) expect(h2.endsWith("."), h2).toBe(true);
        const types = typesOf(html);
        expect(types.filter((t) => t === "FAQPage")).toHaveLength(1);
        expect(types.filter((t) => t === "BreadcrumbList")).toHaveLength(1);
        const crumbs = jsonLd(html).find((o) => o["@type"] === "BreadcrumbList") as { itemListElement: { name: string }[] };
        expect(crumbs.itemListElement.map((i) => i.name)).toEqual(["Home", BREADCRUMB[route]]);
      });

      it("the FAQPage carries exactly the questions the page shows", () => {
        const faq = jsonLd(html).find((o) => o["@type"] === "FAQPage") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
        const visible = [...html.matchAll(/<details[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => ({
          q: textOf(m[1]),
          a: textOf(m[2]),
        }));
        expect(faq.mainEntity.map((e) => ({ q: e.name, a: e.acceptedAnswer.text }))).toEqual(visible);
        expect(visible.length).toBeGreaterThanOrEqual(3);
      });

      it("every internal link resolves", () => {
        const links = hrefs(html);
        expect(links.length).toBeGreaterThan(5);
        for (const href of links) expectResolves(href);
      });

      it("says nothing the truth lint forbids", () => {
        expectTruthful(html);
        expect(textOf(html).toLowerCase()).not.toContain("senior banner");
        expect(textOf(html)).not.toMatch(/trusted by|\d+\s+teams\b/i);
      });

      it("labels every fictional athlete it shows, and every image goes through the asset map with sizes", () => {
        const figures = [...html.matchAll(/<figure[\s\S]*?<\/figure>/g)].map((m) => m[0]);
        const images = count(html, /<img\s/g);
        expect(images).toBeGreaterThan(0);
        expect(figures.reduce((n, f) => n + count(f, /<img\s/g), 0), "an image outside a figure").toBe(images);
        for (const figure of figures) expect(figure).toContain(esc(CANON.fictionalLabel));
        for (const tag of src.match(/<Image[\s\S]*?\/>/g) ?? []) expect(tag).toMatch(/sizes=/);
        expect(src).not.toMatch(/\bpriority\b|fetchPriority/);
        expect(src).toMatch(/\basset(OrNull)?\(/);
      });

      it("the CTA blocks and the canon lines are marked data-shared", () => {
        expect(count(html, /data-shared=""/g)).toBeGreaterThanOrEqual(2);
        // the TrustLine never sits outside a shared block
        const shared = [...html.matchAll(/<div data-shared=""[^>]*>[\s\S]*?<\/ul><\/div>/g)].map((m) => m[0]).join(" ");
        expect(count(html, new RegExp(escapeRe(esc(CANON.trustLine.split(" · ")[0])), "g"))).toBe(count(shared, new RegExp(escapeRe(esc(CANON.trustLine.split(" · ")[0])), "g")));
        // a canon sentence that stands as its own line is marked; inside an FAQ answer it is part of that answer
        const outsideFaq = html.replace(/<details[\s\S]*?<\/details>/g, " ");
        for (const canon of [CANON.deliveryClocks, CANON.stagedDelivery, CANON.seniorDateLine]) {
          if (!outsideFaq.includes(esc(canon))) continue;
          const own = new RegExp(`>${escapeRe(esc(canon))}<`, "g");
          const shared = new RegExp(`data-shared=""[^>]*>${escapeRe(esc(canon))}<`, "g");
          expect(count(outsideFaq, shared), canon.slice(0, 40)).toBe(count(outsideFaq, own));
        }
      });

      it("has a text-only share image on lib/og", () => {
        const og = read(`${FILES[route]}/opengraph-image.tsx`);
        for (const token of ["OgFrame", "loadGoogleFont", "OG_SIZE", "OG_CONTENT_TYPE", "export const alt"]) expect(og).toContain(token);
        expect(og).not.toMatch(/<img|src=/);
        expect(og).not.toMatch(/\$\d/);
      });

      it("no paragraph opens with This, It or As mentioned", () => {
        const paragraphs = [...withoutScripts(html).matchAll(/<(p|li)(?=[\s>])[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => textOf(m[2]));
        for (const p of paragraphs) expect(p, p).not.toMatch(/^(This|It|As mentioned)\b/);
      });
    });
  }
});

/* ---------- /banners ---------- */

describe("/banners", () => {
  const html = render(createElement(BannersBody, { now: NOW }));
  const text = textOf(html);

  it("the H1 is the head phrase and the first sentence keeps 'sports banner'", () => {
    expect(BANNERS_H1).toBe("CUSTOM SPORTS BANNERS FROM YOUR PHOTOS.");
    const subhead = html.match(/<h1[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/)?.[1] ?? "";
    expect(textOf(subhead).split(". ")[0]).toMatch(/\bsports banner\b/i);
    expect(textOf(subhead)).not.toMatch(/\$\d/);
  });

  it("Product JSON-LD: one offer per enabled banner tier, each at its site price", () => {
    const products = jsonLd(html).filter((o) => o["@type"] === "Product");
    expect(products).toHaveLength(1);
    const product = products[0] as { name: string; url: string; offers: { offerCount: number; offers: { name: string; price: number; url: string }[] } };
    const enabled = bannerTiers.filter((t) => t.enabled);
    expect(product.name).toBe("Custom sports banner");
    expect(product.url.endsWith("/banners")).toBe(true);
    expect(product.offers.offerCount).toBe(enabled.length);
    for (const tier of enabled) {
      const offer = product.offers.offers.find((o) => o.name === tier.name);
      expect(offer, tier.sku).toBeTruthy();
      expect(offer!.price, tier.sku).toBe(sitePrice(tier, NOW));
      // the offer's anchor is the TierCard on this page
      expect(offer!.url.endsWith(`/banners#tier-${tier.sku}`)).toBe(true);
      expect(html).toContain(`id="tier-${tier.sku}"`);
    }
  });

  it("the ladder: digital first, one card per enabled tier, every price a catalog price", () => {
    expect(BANNER_LADDER[0].physical).toBe(false);
    expect(BANNER_LADDER.map((t) => t.sku).sort()).toEqual(bannerTiers.filter((t) => t.enabled).map((t) => t.sku).sort());
    expect(count(html, /<article/g)).toBe(BANNER_LADDER.length);
    const order = [...html.matchAll(/data-sku="([^"]+)"/g)].map((m) => m[1]);
    expect(order).toEqual(BANNER_LADDER.map((t) => t.sku));
    expectOnlyCatalogPrices(html, ladderPrices(NOW));
  });

  it("while a sale runs, the struck regular price is a catalog price too, and the JSON-LD carries the sale price", () => {
    const duringSale = new Date(new Date(SALE_EXPIRES_AT).getTime() - 86_400_000);
    expect(isSaleActive(duringSale)).toBe(true);
    const sale = render(createElement(BannersBody, { now: duringSale }));
    expectOnlyCatalogPrices(sale, ladderPrices(duringSale));
    expectTruthful(sale);
    const product = jsonLd(sale).find((o) => o["@type"] === "Product") as { offers: { offers: { name: string; price: number }[] } };
    for (const tier of bannerTiers.filter((t) => t.enabled)) {
      expect(product.offers.offers.find((o) => o.name === tier.name)?.price, tier.sku).toBe(sitePrice(tier, duringSale));
    }
    for (const page of [ChristmasGiftBody, TeamsBody]) expectOnlyCatalogPrices(render(createElement(page, { now: duringSale })), productPrices(duringSale));
  });

  it("each tier card says what the catalog says, and a printed one carries the banner's own shipping line", () => {
    expect(BANNER_SHIP_LINE).toBeTruthy();
    for (const tier of BANNER_LADDER) {
      const parts = bannerTierParts(tier);
      const card = html.match(new RegExp(`<article[^>]*data-sku="${tier.sku}"[\\s\\S]*?</article>`))?.[0] ?? "";
      for (const line of parts.box) expect(card, line).toContain(esc(line));
      if (tier.physical) {
        expect(tierNotes[tier.sku]).toContain(BANNER_SHIP_LINE);
        expect(parts.chip).toBe(BANNER_SHIP_LINE);
        expect(card).toContain(esc(BANNER_SHIP_LINE));
        // never the card/poster clock on a banner
        expect(card).not.toContain("PRINTS SHIP IN");
      } else {
        expect(card).toContain("DIGITAL IN");
        expect(card).not.toMatch(/300 dpi/i);
      }
    }
  });

  it("the sizes come from the ladder and the headings count what the catalog holds", () => {
    expect(BANNER_SIZES).toEqual(bannerTiers.filter((t) => t.enabled && t.physical).map((t) => `${t.tierKey.split("X").join(" × ")} ft`));
    const h2s = headings(html, "h2");
    expect(h2s).toContain(`${NUMBER_WORDS[BANNER_SIZES.length].toUpperCase()} SIZES, ONE FILE.`);
    expect(h2s).toContain(`${NUMBER_WORDS[BANNER_SPORTS.length].toUpperCase()} SPORTS.`);
    expect(h2s).toEqual(expect.arrayContaining(["WHERE IT HANGS.", "BANNER QUESTIONS."]));
    for (const size of BANNER_SIZES) expect(text).toContain(size);
  });

  it("every sport with a banner listing is named and links its own listing and the banner proof", () => {
    const withListing = sports.filter((s) => s.bannerListingId);
    expect(BANNER_SPORTS.map((s) => s.slug)).toEqual(withListing.map((s) => s.slug));
    const links = hrefs(html);
    for (const sport of withListing) {
      expect(headings(html, "h3")).toContain(`${sport.name}.`);
      expect(links, sport.slug).toContain(`/go/etsy/GDE-${sport.code}-BAN`);
      expect(links, sport.slug).toContain(`${INTAKE_PATH}?product=banner&sport=${sport.slug}`);
    }
  });

  it("the senior night banners link each sport's senior night page", () => {
    const withSnBanner = sports.filter((s) => s.seniorNightBannerListingId);
    expect(SN_BANNER_SPORTS.map((s) => s.slug).sort()).toEqual(withSnBanner.map((s) => s.slug).sort());
    expect(headings(html, "h3")).toContain("Senior night banners.");
    for (const sport of withSnBanner) expect(hrefs(html)).toContain(`/senior-night/${sport.slug}`);
  });

  it("claims no hardware and no material beyond printed vinyl in its own words", () => {
    expect(text).not.toMatch(/grommet|\bhem(s|med)?\b|\bstitch|\bpole\b|\boz\b|scrim|\bmesh\b|outdoor|weatherproof|waterproof/i);
    expect(read("app/(marketing)/banners/page.tsx").replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, "")).not.toMatch(/grommet/i);
    expect(text).toMatch(/printed vinyl/i);
  });

  it("answers its three questions from the facts above", () => {
    const qs = bannerQuestions();
    expect(qs).toHaveLength(3);
    expect(qs[0].a).toContain(BANNER_SIZES[0]);
    expect(qs[0].a).toContain(BANNER_SIZES[BANNER_SIZES.length - 1]);
    expect(qs[1].a).toContain(BANNER_SHIP_LINE.toLowerCase());
    expect(qs[1].a).toContain(CANON.stagedDelivery);
    expect(qs[2].a).toMatch(/same photos as the card/);
  });

  it("the hero and the closing open the banner proof, with Etsy as the outline", () => {
    const links = hrefs(html);
    expect(links.filter((h) => h === `${INTAKE_PATH}?product=banner`).length).toBeGreaterThanOrEqual(freeProofMode() ? 2 : 0);
    expect(links).toContain("/photo-guide");
  });
});

/* ---------- /christmas-gift ---------- */

/** A Christmas day stamp at 10:00 US Eastern (15:00 UTC in winter, 14:00 in October): never near midnight. */
const at = (iso: string): Date => new Date(`${iso}T15:00:00Z`);

describe("/christmas-gift", () => {
  const renderAt = (now: Date): string => render(createElement(ChristmasGiftBody, { now }));

  it("prints exactly the dates christmasDates() computes, in the table and in the FAQ", () => {
    for (const now of [at("2026-10-06"), at("2026-11-02"), at("2026-12-15"), at("2026-12-27"), at("2027-03-01"), NOW]) {
      const html = renderAt(now);
      const { year, printedBy, digitalBy } = christmasDates(now);
      const table = html.match(/<div[^>]*data-order-by=""[\s\S]*?<\/dl>/)?.[0] ?? "";
      expect(table).toContain(`<time dateTime="${printedBy}">${formatEt(printedBy, "long")}</time>`);
      expect(table).toContain(`<time dateTime="${digitalBy}">${formatEt(digitalBy, "long")}</time>`);
      expect(textOf(table)).toContain(`For Christmas ${year}`);
      // the only calendar dates in the table are the two computed ones
      expect([...table.matchAll(/dateTime="([^"]+)"/g)].map((m) => m[1])).toEqual([printedBy, digitalBy]);
      const arrive = christmasQuestions(christmasPlan(now))[0].a;
      expect(arrive).toContain(formatEt(printedBy, "long"));
      expect(arrive).toContain(formatEt(digitalBy, "long"));
      expect(html).toContain(esc(arrive));
    }
  });

  it("the late line shows only once today is past the printed date, and says which order is late", () => {
    const onTime = renderAt(at("2026-11-02"));
    expect(onTime).not.toContain(esc(PRINTED_LATE_LINE));
    expect(onTime).not.toContain(esc(ALL_LATE_LINE));
    expect(onTime).not.toContain("Planning ahead?");

    const printedLate = renderAt(at("2026-12-15"));
    expect(printedLate).toContain(esc(PRINTED_LATE_LINE));
    expect(printedLate).not.toContain(esc(ALL_LATE_LINE));

    const allLate = renderAt(at("2026-12-23"));
    expect(allLate).toContain(esc(ALL_LATE_LINE));
    expect(allLate).not.toContain(esc(PRINTED_LATE_LINE));
  });

  it("over a whole year, a late line is printed exactly when today is past the printed date", () => {
    for (let day = "2026-07-01"; day <= "2027-07-01"; day = addCalendarDays(day, 1)) {
      const now = at(day);
      const plan = christmasPlan(now);
      const { printedBy, digitalBy } = christmasDates(now);
      const today = toEtDate(now);
      const line = stateLine(plan);
      const late = line === PRINTED_LATE_LINE || line === ALL_LATE_LINE;
      expect(late, day).toBe(today > printedBy);
      if (late) expect(line, day).toBe(today > digitalBy ? ALL_LATE_LINE : PRINTED_LATE_LINE);
      // the holiday version only runs inside the window, before the Christmas the dates are for
      if (plan.season) expect(isChristmasWindow(now), day).toBe(true);
      if (!isChristmasWindow(now)) expect(line, day).toMatch(/^Planning ahead\?/);
    }
  });

  it("outside the window the table still renders, for the coming Christmas, with the one off-season line", () => {
    const early = renderAt(at("2026-10-06"));
    expect(textOf(early)).toContain("Planning ahead? These dates are for Christmas 2026.");
    expect(textOf(early)).toContain(formatEt("2026-10-20", "long"));
    const afterChristmas = renderAt(at("2026-12-27"));
    expect(textOf(afterChristmas)).toContain("These dates are for Christmas 2027.");
    expect(textOf(afterChristmas)).toContain(formatEt("2027-10-20", "long"));
    expect(afterChristmas).not.toContain(esc(PRINTED_LATE_LINE));
    // the URL carries no year
    expect(PAGES["/christmas-gift"].path).toBe("/christmas-gift");
  });

  it("the four gifts: name, blurb, catalog price or the proof line, and a prefilled free proof", () => {
    const html = renderAt(NOW);
    const h2s = headings(html, "h2");
    expect(h2s).toContain(`${NUMBER_WORDS[PRODUCTS.length].toUpperCase()} GIFTS, ONE SET OF PHOTOS.`);
    expect(h2s).toEqual(expect.arrayContaining(["BY SPORT.", "GIFT THE DIGITAL FIRST.", "CHRISTMAS QUESTIONS."]));
    for (const product of PRODUCTS) {
      expect(html).toContain(esc(product.blurb));
      expect(hrefs(html)).toContain(`${INTAKE_PATH}?product=${product.key}`);
    }
    expectOnlyCatalogPrices(html, productPrices(NOW));
    expect(textOf(html)).toContain(`priced as a Complete Set, ${setFromLabel(NOW)}.`);
    if (PRODUCTS.some((p) => productFromLabel(p, NOW) === null)) expect(textOf(html)).toContain("Price confirmed with your free proof");
  });

  it("by sport: the sport pages with their hub line, and the hub for every other sport", () => {
    const html = renderAt(NOW);
    for (const sport of sportPageSports()) {
      expect(hrefs(html)).toContain(`/sports/${sport.slug}`);
      expect(html).toMatch(new RegExp(`data-shared=""[^>]*>${escapeRe(esc(hubLine(sport)))}`));
    }
    expect(hrefs(html)).toContain("/sports");
  });

  it("gift the digital first: the digital clock from LEAD_TIMES, the note on /senior-night, the staged canon", () => {
    const html = renderAt(NOW);
    const [min, max] = LEAD_TIMES.digitalBusinessDays;
    expect(textOf(html)).toContain(`Digital files land ${min}–${max} business days after you order`);
    expect(hrefs(html)).toContain("/senior-night");
    expect(html).toMatch(new RegExp(`data-shared=""[^>]*>${escapeRe(esc(CANON.stagedDelivery))}`));
    expect(textOf(html)).not.toMatch(/card-sized/i);
  });

  it("closes with the set CTA, the standard delivery chips and the TrustLine", () => {
    const html = renderAt(NOW);
    expect(count(html, /aria-label="Delivery times"/g)).toBe(1);
    expect(hrefs(html)).toContain("/go/etsy/GDE-ANY-SET");
    if (freeProofMode()) expect(hrefs(html)).toContain(`${INTAKE_PATH}?product=cards,poster`);
  });

  it("the questions are standalone-true on any day", () => {
    for (const now of [at("2026-07-01"), at("2026-12-23"), at("2026-12-30")]) {
      const qs = christmasQuestions(christmasPlan(now));
      expect(qs.map((q) => q.q)).toEqual(["Will it arrive before Christmas?", "What if I'm late?", "Which sports?"]);
      expect(qs[0].a.startsWith("Yes, when it is ordered in time.")).toBe(true);
      expect(qs[1].a).toContain(CANON.stagedDelivery);
      expect(qs[2].a).toContain(`All ${NUMBER_WORDS[sports.length]}.`);
      for (const s of sportPageSports()) expect(qs[2].a.toLowerCase()).toContain(s.name.toLowerCase());
    }
  });
});

/* ---------- /teams ---------- */

describe("/teams", () => {
  const html = render(createElement(TeamsBody, { now: NOW }));
  const text = textOf(html);

  it("links the team mailto and the free-proof form, and the primary is the mailto", () => {
    const links = hrefs(html);
    expect(links.filter((h) => h === TEAM_ORDER_MAILTO).length).toBeGreaterThanOrEqual(2);
    if (freeProofMode()) expect(links).toContain(INTAKE_PATH);
    const mailtoButton = html.match(new RegExp(`<a href="${escapeRe(esc(TEAM_ORDER_MAILTO))}"[^>]*>([\\s\\S]*?)</a>`));
    expect(mailtoButton?.[1]).toBe(EMAIL_LABEL);
    expect(mailtoButton?.[0]).toContain("bg-accent");
  });

  it("prints the coach line verbatim from the master FAQ, and both team questions", () => {
    const coach = faqById("faq-31")!;
    expect(html).toMatch(new RegExp(`data-shared=""[^>]*>${escapeRe(esc(`${coach.q} ${coach.a}`))}`));
    const qs = teamQuestions();
    expect(qs.map((q) => q.id)).toEqual(["faq-30", "faq-31", "q-teams-finish", "q-teams-invoice"]);
    expect(qs[0].a).toBe(faqById("faq-30")!.a);
    expect(qs[1].a).toBe(coach.a);
  });

  it("the three claims, the four steps, and no team count", () => {
    for (const claim of ["SAME PRICE PER ATHLETE", "CREST APPROVED ONCE", "NO MINIMUM · NO DEPOSIT"]) expect(text).toContain(claim);
    const how = html.match(/aria-labelledby="teams-how"[\s\S]*?<\/section>/)?.[0] ?? "";
    const steps = how.match(/<ol[\s\S]*?<\/ol>/)?.[0] ?? "";
    expect(count(steps, /<li[\s>]/g)).toBe(4);
    expect(text).not.toMatch(/\btrusted\b|\bteams? (have|has) ordered\b|\d+\s+(teams|clubs|schools)\b/i);
    expect(text).not.toMatch(/\bteam link\b|\bdashboard\b/i);
  });

  it("each family's price is the catalog's single-athlete price", () => {
    expectOnlyCatalogPrices(html, productPrices(NOW));
    expect(text).toContain("Setup is free.");
    expect(text).toContain("A club invoice for the whole roster: ask us by email.");
  });

  it("the senior class and the end-of-season gift each carry a canon timing line", () => {
    expect(html).toMatch(new RegExp(`data-shared=""[^>]*>${escapeRe(esc(CANON.seniorDateLine))}`));
    expect(html).toMatch(new RegExp(`data-shared=""[^>]*>${escapeRe(esc(CANON.deliveryClocks))}`));
    expect(hrefs(html)).toEqual(expect.arrayContaining(["/senior-night", "/sports"]));
  });
});

/* ---------- the source rules ---------- */

describe("occasion pages — source", () => {
  const sources = (Object.values(FILES) as string[]).flatMap((dir) => [`${dir}/page.tsx`, `${dir}/opengraph-image.tsx`]);

  it("no typed price, no marketplace URL, no typed date", () => {
    for (const file of sources) {
      const src = read(file);
      expect(src, file).not.toMatch(/\$\d/);
      expect(src, file).not.toMatch(/etsy\.com/i);
      expect(src.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, ""), file).not.toMatch(/\b20\d\d-\d\d-\d\d\b/);
    }
  });

  it("CTAs come from ctaFor / freeProofHref / the team mailto, never a hand-written form URL", () => {
    for (const file of sources) {
      const src = read(file);
      expect(src, file).not.toMatch(/["'`]\/free-proof/);
      expect(src, file).not.toMatch(/["'`]\/go\/etsy/);
    }
  });

  it("the three routes are in the titles table and own their keywords", () => {
    for (const route of Object.keys(FILES)) expect(PAGES[route], route).toBeDefined();
  });
});

