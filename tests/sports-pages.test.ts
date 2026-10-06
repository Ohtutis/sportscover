// /sports and /sports/[sport] (SEO plan 2026-10-06 §4, builder S): every sport page and the hub render
// with one H1 from the facts row, one FAQPage, one BreadcrumbList, links that resolve, nothing the truth
// lint forbids, no typed price, no number for a sport that wears none, a label on every fictional
// athlete, and a floor of sentences that belong to that sport alone (the integrator's
// tests/seo-families.test.ts measures the full duplication gate).
import { afterEach, describe, expect, it, vi } from "vitest";

// The pages call `notFound()`; nothing in them uses the router, which is stubbed the way
// tests/families.test.ts stubs it for components that do.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => {}, push: () => {}, refresh: () => {}, back: () => {}, forward: () => {}, prefetch: () => {} }),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

// tests/blog.test.ts: unwrap next/image's CJS default when vitest hands the exports object over.
vi.mock("next/image", async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const d = mod.default as Record<string, unknown> | undefined;
  return { ...mod, default: d && typeof d === "object" && "default" in d && !("$$typeof" in d) ? d.default : d };
});

import fs from "node:fs";
import path from "node:path";
import { createElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SITE_ASSETS } from "../lib/assets";
import { postBySlug } from "../lib/blog";
import { formatUsd, priceDisplay, tiersFor } from "../lib/catalog/prices";
import { isNumberless, sportBySlug, sports } from "../lib/catalog/sports";
import { CANON } from "../lib/copy/canon";
import { ctaFor, freeProofHref } from "../lib/cta";
import { INTAKE_PATH } from "../lib/intake/copy";
import { getCard, isIndexable } from "../lib/registry/cards";
import { seniorNightSports } from "../lib/seo/senior-night-facts";
import { hubTiles, sportFactsFor, sportPageSports } from "../lib/seo/sport-facts";
import { DESCRIPTION_MAX, PAGES, TITLE_MAX, TITLE_SUFFIX, pageFor } from "../lib/seo/titles";
import SportsHubPage, { metadata as hubMetadata } from "../app/(marketing)/sports/page";
import * as sportRoute from "../app/(marketing)/sports/[sport]/page";

const ROOT = process.cwd();
const APP = path.join(ROOT, "app/(marketing)");
const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), "utf8");

/* ---------- rendering ---------- */

const render = (node: ReactNode): string => renderToStaticMarkup(node as ReactElement);
const SportPage = sportRoute.default as unknown as (props: { params: Promise<{ sport: string }> }) => Promise<ReactElement>;
const renderSport = async (slug: string): Promise<string> => render(await SportPage({ params: Promise.resolve({ sport: slug }) }));
const renderHub = (): string => render(createElement(SportsHubPage));

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " };
const decode = (s: string): string => s.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);
const textOf = (html: string): string =>
  decode(html.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
const count = (text: string, needle: RegExp): number => text.match(needle)?.length ?? 0;
const pathOf = (href: string): string => href.split(/[?#]/)[0];

/* ---------- a small element tree: which element contains which ---------- */

interface El {
  tag: string;
  attrs: string;
  start: number;
  end: number;
}

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/** Every element with its [start, end) span in the markup. React's static markup is well formed, and JSON-LD escapes `<`. */
function elements(html: string): El[] {
  const out: El[] = [];
  const open: El[] = [];
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    const [whole, closing, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    const at = m.index ?? 0;
    if (closing) {
      for (let i = open.length - 1; i >= 0; i--) {
        if (open[i].tag !== tag) continue;
        open[i].end = at + whole.length;
        open.length = i;
        break;
      }
      continue;
    }
    const el: El = { tag, attrs, start: at, end: at + whole.length };
    out.push(el);
    if (!VOID.has(tag) && !attrs.trimEnd().endsWith("/")) open.push(el);
  }
  return out;
}

const inside = (outer: El, inner: El): boolean => outer.start <= inner.start && inner.end <= outer.end && outer !== inner;
const hasAttr = (el: El, name: string): boolean => new RegExp(`(^|\\s)${name}(=|\\s|$)`).test(el.attrs);
const slice = (html: string, el: El): string => html.slice(el.start, el.end);

/** What a reader reads as prose: <p> and <li> outside the blocks the duplication gate strips. */
const STRIPPED = (el: El): boolean =>
  hasAttr(el, "data-shared") || ["nav", "h1", "h2", "h3", "h4", "h5", "h6", "button", "figcaption", "script"].includes(el.tag);

function proseSentences(html: string): string[] {
  const els = elements(html);
  const stripped = els.filter(STRIPPED);
  const prose = els.filter((el) => (el.tag === "p" || el.tag === "li") && !stripped.some((s) => s === el || inside(s, el)));
  // The innermost block only: a list item that wraps a paragraph is read once, as the paragraph.
  const leaves = prose.filter((el) => !prose.some((other) => inside(el, other)));
  return leaves
    .map((el) => {
      // Drop stripped descendants (a heading inside a list item) before reading the text.
      let fragment = slice(html, el);
      for (const s of stripped.filter((s) => inside(el, s)).sort((a, b) => b.start - a.start)) {
        fragment = fragment.slice(0, s.start - el.start) + " " + fragment.slice(s.end - el.start);
      }
      return textOf(fragment);
    })
    .flatMap((text) => text.split(/(?<=[.!?])\s+(?=[A-Z0-9"“])/))
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s));
}

/** The gate's normalization: sport names (and their short forms) and numbers collapse into placeholders. */
const SPORT_WORDS = [...sports.map((s) => s.name), "hockey", "cheerleaders", "cheerleader", "cheer", "wrestlers", "wrestler"]
  .sort((a, b) => b.length - a.length)
  .map((w) => w.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&"));
const SPORT_RE = new RegExp(`\\b(${SPORT_WORDS.join("|")})\\b`, "gi");
const shape = (sentence: string): string =>
  sentence.toLowerCase().replace(SPORT_RE, "{sport}").replace(/\d+([.,]\d+)?/g, "#").replace(/\s+/g, " ").trim();

/* ---------- the rules ---------- */

/** tests/blog.test.ts FORBIDDEN, copied (that list scans posts; this one scans these pages). */
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
  [/\bsale\b|% off|\bdiscount|\bcoupon/i, "no sale talk on an evergreen page"],
  [/\d\s?%/, "no percentages"],
  [/\bfamilies (love|say|told)|\d+\s+(families|parents|customers)\b/i, "no 'N families' / customer stories"],
  [/colour|favourite|centre\b|organis|\bgrey\b|practis|catalogue|licence|cheque/i, "US spelling"],
];

/**
 * The ladder's own words are the catalog's. It used to be exempt from "no sale talk" while TierCard printed
 * a dated sale line; pricing v1 (2026-10-07) shows no sale anywhere, so the ladder answers to every rule.
 */
const LADDER_EXEMPT = new Set<string>();

/**
 * F1 pages the other builders of 2026-10-06 are writing in this tree at the same time (the SEO brief).
 * Each must also be an F1 row in lib/seo/titles.ts; remove an entry once its page.tsx lands.
 */
const IN_FLIGHT = new Set(["/banners", "/christmas-gift", "/teams"]);

/** Whether an internal href lands on a page: a page.tsx on disk, or a `[segment]` route whose param exists. */
function resolves(href: string): boolean {
  const p = pathOf(decode(href));
  if (p.startsWith("/go/etsy/")) return p.length > "/go/etsy/".length;
  if (p === INTAKE_PATH) return true;
  const seg = p.split("/").filter(Boolean);
  if (seg.length === 2 && seg[0] === "sports") return sportPageSports().some((s) => s.slug === seg[1]);
  if (seg.length === 2 && seg[0] === "senior-night") return seniorNightSports().some((s) => s.slug === seg[1]);
  if (seg.length === 2 && seg[0] === "blog") return Boolean(postBySlug(seg[1]));
  if (seg.length === 2 && seg[0] === "c") {
    const card = getCard(seg[1]);
    return Boolean(card && isIndexable(card));
  }
  if (fs.existsSync(path.join(APP, ...seg, "page.tsx"))) return true;
  return IN_FLIGHT.has(p) && PAGES[p]?.phase === "F1";
}

const hrefs = (html: string): string[] => [...html.matchAll(/\shref="([^"]*)"/g)].map((m) => decode(m[1]));

/** The ladder (`data-price-ladder`) and the page without it. */
function splitLadder(html: string): { ladder: string; rest: string } {
  const el = elements(html).find((e) => hasAttr(e, "data-price-ladder"));
  if (!el) return { ladder: "", rest: html };
  return { ladder: slice(html, el), rest: html.slice(0, el.start) + html.slice(el.end) };
}

/** Every rendered price the cards ladder may print for this render: the catalog's, through formatUsd. */
function catalogPrices(): Set<string> {
  const out = new Set<string>();
  // A card tier is a single item: one price, never a second one beside it (pricing v1).
  for (const tier of tiersFor("cards")) out.add(formatUsd(priceDisplay(tier).current));
  return out;
}

/** The public path of every <img> (next/image puts it in `url=`). */
const imgOut = (attrs: string): string => {
  const src = /\ssrc="([^"]+)"/.exec(attrs)?.[1] ?? "";
  const u = new URL(decode(src), "http://local");
  return u.searchParams.get("url") ?? u.pathname;
};

/** Every image comes from the asset map, has `sizes`, and sits in an exhibit that carries C13 when the athlete is fictional. */
function expectLabelledImages(html: string, where: string): void {
  const els = elements(html);
  const exhibits = els.filter((el) => hasAttr(el, "data-exhibit"));
  const imgs = els.filter((el) => el.tag === "img");
  expect(imgs.length, `${where}: no image rendered`).toBeGreaterThan(0);
  for (const img of imgs) {
    const out = imgOut(img.attrs);
    const spec = Object.values(SITE_ASSETS).find((a) => a.out === out);
    expect(spec, `${where}: ${out} is not in the asset map`).toBeTruthy();
    expect(img.attrs, `${where}: ${out} has no sizes`).toMatch(/\ssizes="/);
    const host = exhibits.find((ex) => inside(ex, img));
    expect(host, `${where}: ${out} sits outside an exhibit`).toBeTruthy();
    if (spec?.fictional) expect(slice(html, host as El), `${where}: ${out} — fictional athlete without C13`).toContain(CANON.fictionalLabel);
  }
}

/** Truth lint, links and prices — the same rules for the hub and every sport page. */
function expectHonest(html: string, where: string): void {
  const { ladder, rest } = splitLadder(html);
  const restText = textOf(rest);
  for (const [re, why] of FORBIDDEN) expect(restText, `${where}: ${why}`).not.toMatch(re);
  for (const [re, why] of FORBIDDEN.filter(([, w]) => !LADDER_EXEMPT.has(w))) expect(textOf(ladder), `${where} ladder: ${why}`).not.toMatch(re);
  expect(rest, `${where}: a typed price outside the ladder`).not.toMatch(/\$\s?\d/);
  const allowed = catalogPrices();
  expect(ladder, `${where}: a struck price on a single-item ladder`).not.toMatch(/<s[\s>]/);
  for (const m of ladder.matchAll(/\$\d[\d,]*(\.\d{2})?/g)) expect(allowed.has(m[0]), `${where}: ${m[0]} is not a catalog price`).toBe(true);
  for (const href of hrefs(html)) {
    expect(/^https?:|^\/\//.test(href), `${where}: external link ${href}`).toBe(false);
    if (href.startsWith("/")) expect(resolves(href), `${where}: ${href} does not resolve`).toBe(true);
  }
}

const pages = sportPageSports();

/* ---------- the route ---------- */

describe("/sports/[sport] — the route", () => {
  it("is static: one page per sport with a facts row and a live listing, nothing else", () => {
    expect(sportRoute.dynamicParams).toBe(false);
    expect(sportRoute.revalidate).toBe(3600);
    expect(sportRoute.generateStaticParams()).toEqual(sportPageSports().map((s) => ({ sport: s.slug })));
    expect(pages.length).toBeGreaterThan(0);
    for (const s of pages) expect(sportFactsFor(s.slug), s.slug).toBeTruthy();
  });

  it("an unknown or page-less sport is a 404", async () => {
    for (const slug of ["lacrosse", "gymnastics", "other-sport", "no-such-sport"]) {
      await expect(SportPage({ params: Promise.resolve({ sport: slug }) }), slug).rejects.toThrow("NEXT_NOT_FOUND");
    }
  });

  for (const sport of pages) {
    it(`${sport.slug}: metadata from the facts row — title ≤ ${TITLE_MAX} with the suffix, description 50–${DESCRIPTION_MAX}, canonical`, async () => {
      const facts = sportFactsFor(sport.slug)!;
      const meta = await sportRoute.generateMetadata({ params: Promise.resolve({ sport: sport.slug }) });
      expect(meta.title).toBe(facts.titleHead);
      const full = `${facts.titleHead}${TITLE_SUFFIX}`;
      expect(full.endsWith(" | Game Day Edition")).toBe(true);
      expect(full.length, full).toBeLessThanOrEqual(TITLE_MAX);
      expect(meta.description).toBe(facts.description);
      expect(facts.description.length, facts.description).toBeGreaterThanOrEqual(50);
      expect(facts.description.length, facts.description).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(meta.alternates?.canonical).toBe(`/sports/${sport.slug}`);
      const og = meta.openGraph as { url?: string; title?: string; description?: string };
      expect(og.url).toBe(`/sports/${sport.slug}`);
      expect(og.title).toBe(full);
      expect(og.description).toBe(facts.description);
      expect(Object.prototype.hasOwnProperty.call(og, "images"), "the share image is ./opengraph-image.tsx").toBe(false);
    });
  }

  it("the share image is text on lib/og, one per sport page", () => {
    const src = read("app/(marketing)/sports/[sport]/opengraph-image.tsx");
    for (const token of ["OgFrame", "loadGoogleFont", "OG_SIZE", "generateStaticParams", "sportPageSports", "facts?.h1", "facts?.verdict"]) {
      expect(src).toContain(token);
    }
    expect(src).not.toMatch(/<img|asset\(/);
  });
});

/* ---------- every sport page ---------- */

describe("/sports/[sport] — every page", () => {
  for (const sport of pages) {
    describe(sport.slug, () => {
      const facts = sportFactsFor(sport.slug)!;

      it("renders one H1 — the row's — with one FAQPage and one BreadcrumbList", async () => {
        const html = await renderSport(sport.slug);
        const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => textOf(m[1]));
        expect(h1s).toEqual([facts.h1]);
        expect(count(html, /"@type":"FAQPage"/g)).toBe(1);
        expect(count(html, /"@type":"BreadcrumbList"/g)).toBe(1);
        expect(html).toContain(`href="/sports"`);
        // The row's facts are on the page, and its questions keep their anchors.
        const text = textOf(html);
        for (const line of [facts.verdict, facts.frontLine, facts.backLine, ...facts.photoTraps]) expect(text).toContain(line);
        for (const q of facts.questions) expect(html).toContain(`id="${q.id}"`);
        if (isNumberless(sport)) expect(html).toContain('id="faq-12"');
        else expect(html).not.toContain('id="faq-12"');
        // Every H2 is Anton-ready: uppercase with a full stop.
        for (const m of html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)) {
          const h2 = textOf(m[1]);
          expect(h2.endsWith("."), h2).toBe(true);
          expect(h2, h2).toBe(h2.toUpperCase());
        }
      });

      it("every internal link resolves, nothing the truth lint forbids, no typed price", async () => {
        const html = await renderSport(sport.slug);
        expectHonest(html, sport.slug);
        // The ladder is there, priced by the catalog, with this sport's own SKUs.
        const { ladder } = splitLadder(html);
        expect(count(ladder, /<article/g)).toBe(tiersFor("cards").length);
        expect(ladder).toContain(`GDE-${sport.code}-CARD-`);
        // CTAs from ctaFor("sport"): in free-proof mode the form with the sport chosen; Etsy through /go/etsy only.
        const cta = ctaFor("sport", { sport: sport.slug });
        expect(hrefs(html)).toContain(cta.primary.href);
        if (cta.secondary) expect(hrefs(html)).toContain(cta.secondary.href);
      });

      it("never says 'their number' where the kit carries none", async () => {
        const html = await renderSport(sport.slug);
        const text = textOf(html);
        if (isNumberless(sport) || sport.slug === "wrestling") {
          expect(text).not.toMatch(/\btheir number\b/i);
          expect(text).not.toMatch(/#\d/);
        } else {
          expect(text).toMatch(/Back of the kit: their number/);
        }
      });

      it("labels every fictional athlete it shows", async () => {
        expectLabelledImages(await renderSport(sport.slug), sport.slug);
      });

      it("links its related pages: the hub, two neighbors, the senior-night spoke, banners, posts, example cards", async () => {
        const html = await renderSport(sport.slug);
        const links = new Set(hrefs(html).map(pathOf));
        const others = pages.filter((s) => s.slug !== sport.slug && links.has(`/sports/${s.slug}`));
        expect(others.length).toBe(Math.min(2, pages.length - 1));
        if (seniorNightSports().some((s) => s.slug === sport.slug)) expect(links.has(`/senior-night/${sport.slug}`)).toBe(true);
        expect(links.has("/banners")).toBe(Boolean(sport.bannerListingId));
        for (const slug of facts.posts) if (postBySlug(slug)) expect(links.has(`/blog/${slug}`), slug).toBe(true);
        expect([...links].some((l) => l.startsWith("/c/"))).toBe(true);
      });
    });
  }

  it("each page has at least six prose sentences no other sport page has (outside data-shared)", async () => {
    const shapes = new Map<string, Set<string>>();
    for (const sport of pages) shapes.set(sport.slug, new Set(proseSentences(await renderSport(sport.slug)).map(shape)));
    for (const [slug, own] of shapes) {
      const elsewhere = new Set([...shapes].filter(([s]) => s !== slug).flatMap(([, set]) => [...set]));
      const unique = [...own].filter((s) => !elsewhere.has(s));
      expect(unique.length, `${slug}: ${unique.length} sentences of its own`).toBeGreaterThanOrEqual(6);
    }
  });

  it("links /christmas-gift only inside the Christmas window", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-16T15:00:00Z"));
    const during = await renderSport(pages[0].slug);
    expect(during).toContain('href="/christmas-gift"');
    expectHonest(during, `${pages[0].slug} in the Christmas window`);
    vi.setSystemTime(new Date("2026-10-06T15:00:00Z"));
    expect(await renderSport(pages[0].slug)).not.toContain('href="/christmas-gift"');
  });
});

afterEach(() => {
  vi.useRealTimers();
});

/* ---------- the hub ---------- */

describe("/sports — the hub", () => {
  it("takes its metadata from the titles table, and leaves the share image to ./opengraph-image.tsx", () => {
    const row = pageFor("/sports");
    expect(hubMetadata.title).toBe(row.title);
    expect(hubMetadata.description).toBe(row.description);
    expect(hubMetadata.alternates?.canonical).toBe("/sports");
    const og = hubMetadata.openGraph as Record<string, unknown>;
    expect(og.url).toBe("/sports");
    expect(og.title).toBe(`${row.title}${TITLE_SUFFIX}`);
    // Next skips the file-based image whenever the segment's openGraph carries an `images` key.
    expect(Object.prototype.hasOwnProperty.call(og, "images")).toBe(false);
  });

  it("renders one uppercase H1 with a full stop, the canon truth line (shared) and one BreadcrumbList", () => {
    const html = renderHub();
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => textOf(m[1]));
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toBe(h1s[0].toUpperCase());
    expect(h1s[0]).toMatch(/\bSPORTS\b.*\.$/);
    expect(count(html, /"@type":"BreadcrumbList"/g)).toBe(1);
    expect(count(html, /"@type":"FAQPage"/g)).toBe(0);
    const shared = elements(html).filter((el) => hasAttr(el, "data-shared"));
    expect(shared.some((el) => textOf(slice(html, el)).includes(CANON.numberlessLine))).toBe(true);
  });

  it(`renders ${sports.length} tiles in roster order; a sport with a page links it, the rest open the free-proof form`, () => {
    const html = renderHub();
    const els = elements(html);
    const tiles = els.filter((el) => el.tag === "li" && hasAttr(el, "data-sport-tile"));
    expect(tiles.map((el) => /data-sport-tile="([^"]+)"/.exec(el.attrs)?.[1])).toEqual(sports.map((s) => s.slug));
    for (const { sport, hasPage } of hubTiles()) {
      const tile = tiles.find((el) => el.attrs.includes(`data-sport-tile="${sport.slug}"`))!;
      const fragment = slice(html, tile);
      const links = hrefs(fragment);
      expect(links, sport.slug).toHaveLength(1);
      if (hasPage) {
        expect(links[0]).toBe(`/sports/${sport.slug}`);
        expect(textOf(fragment)).not.toContain("Built to order");
      } else {
        expect(links[0]).toBe(freeProofHref({ products: ["cards", "poster"], sport: sport.slug }));
        expect(textOf(fragment)).toContain("Built to order");
      }
      expect(textOf(fragment)).toContain(sport.name);
    }
    for (const sport of sportPageSports()) expect(hrefs(html)).toContain(`/sports/${sport.slug}`);
  });

  it("says what the back of the kit shows for every sport, from the catalog", () => {
    const text = textOf(renderHub());
    for (const s of sports) expect(text).toContain(s.name);
    expect(text).toMatch(/Their number/);
    expect(text).toMatch(/Plain back/);
    expect(text).toMatch(/Their name, their club crest/);
  });

  it("every internal link resolves, nothing the truth lint forbids, and every fictional athlete is labelled", () => {
    const html = renderHub();
    expectHonest(html, "/sports");
    expectLabelledImages(html, "/sports");
    expect(hrefs(html)).toContain(ctaFor("home").primary.href);
  });

  it("the share image is text on lib/og", () => {
    const src = read("app/(marketing)/sports/opengraph-image.tsx");
    for (const token of ["OgFrame", "loadGoogleFont", "OG_SIZE"]) expect(src).toContain(token);
    expect(src).not.toMatch(/<img|asset\(/);
  });

  it("every sport named on the hub is a real catalog sport", () => {
    for (const { sport } of hubTiles()) expect(sportBySlug(sport.slug)).toBe(sport);
  });
});
