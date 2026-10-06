// /senior-night/[sport] — the nine senior-night spokes (SEO build 2026-10-06, builder N). Every spoke is
// rendered here from its row in lib/seo/senior-night-facts.ts and held to the brief: the static params are
// the hub's nine sports; the metadata fits the title table's limits; the page answers first (one H1 = the
// measured head phrase); it emits one FAQPage and one BreadcrumbList; it makes one delivery claim; its CTAs
// open the free proof with SR and the sport prefilled and the sport's own Etsy Senior Night set; the banner
// section exists only where a Senior Night banner listing does; every internal link resolves; it says
// nothing the truth lint forbids; every fictional athlete is labelled; and every spoke says at least six
// sentences of its own that no sibling says (the shared blocks are marked `data-shared` and not counted).
import { describe, expect, it, vi } from "vitest";

// node_modules is a symlink on the owner's Mac: unwrap next/image's CJS default the way tests/blog.test.ts
// does (a no-op when the default already is the component).
vi.mock("next/image", async (importOriginal) => {
  const mod = await importOriginal<Record<string, unknown>>();
  const d = mod.default as Record<string, unknown> | undefined;
  return { ...mod, default: d && typeof d === "object" && "default" in d && !("$$typeof" in d) ? d.default : d };
});

// renderToStaticMarkup has no app-router context (tests/families.test.ts); `notFound` throws a marker the
// unknown-slug test can catch.
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
  useRouter: () => ({ replace: () => {}, push: () => {}, refresh: () => {}, back: () => {}, forward: () => {}, prefetch: () => {} }),
}));

import fs from "node:fs";
import path from "node:path";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import SeniorNightSportPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
  revalidate,
} from "../app/(marketing)/senior-night/[sport]/page";
import { SITE_ASSETS } from "../lib/assets";
import { postBySlug } from "../lib/blog";
import { CHIPS } from "../lib/catalog/delivery";
import { faqSubset } from "../lib/catalog/faq";
import { listingIdForSku } from "../lib/catalog/listings";
import { bannerTiers } from "../lib/catalog/prices";
import { backLine, isNumberless, sportByCode, sportBySlug, sports, type Sport } from "../lib/catalog/sports";
import { tierNotes } from "../lib/catalog/tiers";
import { CALC_COPY } from "../lib/copy/calc";
import { CANON } from "../lib/copy/canon";
import { trustLineSegments } from "../lib/catalog/trust";
import { ctaFor } from "../lib/cta";
import { INTAKE_PATH } from "../lib/intake/copy";
import { productByKey } from "../lib/intake/products";
import { getCard, isIndexable } from "../lib/registry/cards";
import { SENIOR_NIGHT_SPORT_ORDER, seasonWord, seniorNightFactsFor, type SeniorNightFacts } from "../lib/seo/senior-night-facts";
import { sportPageSports } from "../lib/seo/sport-facts";
import { DESCRIPTION_MAX, TITLE_MAX, TITLE_SUFFIX } from "../lib/seo/titles";
import { GIFT_NOTE_STRINGS } from "../app/(marketing)/senior-night/_gift-note";

const ROOT = process.cwd();
const read = (rel: string): string => fs.readFileSync(path.join(ROOT, rel), "utf8");
const PAGE_FILE = "app/(marketing)/senior-night/[sport]/page.tsx";
const OG_FILE = "app/(marketing)/senior-night/[sport]/opengraph-image.tsx";
const MARKETING = path.join(ROOT, "app/(marketing)");

/* ---------- rendering helpers (tests/blog.test.ts) ---------- */

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'", "&#39;": "'", "&nbsp;": " " };
const decode = (s: string): string => s.replace(/&(amp|lt|gt|quot|#x27|#39|nbsp);/g, (m) => ENTITIES[m] ?? m);
const stripScripts = (html: string): string => html.replace(/<script[\s\S]*?<\/script>/g, " ");
const textOf = (html: string): string => decode(stripScripts(html).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const count = (text: string, needle: RegExp): number => text.match(needle)?.length ?? 0;
const pathOf = (href: string): string => href.split(/[?#]/)[0];
const hrefs = (html: string): string[] => [...html.matchAll(/href="([^"]*)"/g)].map((m) => decode(m[1]));

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/** The markup with every element the predicate names removed, subtree and all (the output of renderToStaticMarkup is well formed). */
function removeSubtrees(html: string, remove: (tag: string, attrs: string) => boolean): string {
  let out = "";
  let last = 0;
  let depth = 0; // > 0 while inside a removed subtree
  for (const m of html.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g)) {
    const [full, closing, rawTag, attrs] = m;
    const tag = rawTag.toLowerCase();
    if (depth === 0) out += html.slice(last, m.index);
    last = m.index! + full.length;
    const isVoid = VOID.has(tag) || attrs.trim().endsWith("/");
    if (depth > 0) {
      if (closing) depth -= 1;
      else if (!isVoid) depth += 1;
      continue;
    }
    if (!closing && remove(tag, attrs)) {
      if (!isVoid) depth = 1;
      continue;
    }
    out += full;
  }
  if (depth === 0) out += html.slice(last);
  return out;
}

/** What the duplication gate reads: no [data-shared] subtree, no headings, nav, buttons or figcaptions — just the <p>/<li> text. */
function ownText(html: string): string[] {
  const kept = removeSubtrees(
    stripScripts(html),
    (tag, attrs) => /\sdata-shared=""/.test(attrs) || /^h[1-6]$/.test(tag) || tag === "nav" || tag === "button" || tag === "figcaption",
  );
  return [...kept.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/g)].map((m) => textOf(m[2])).filter(Boolean);
}

const sentencesOf = (texts: string[]): string[] => texts.flatMap((t) => t.split(/(?<=[.!?])\s+/)).map((s) => s.trim()).filter(Boolean);

/** Sport names (catalog names, slugs and every spoke's own search word) and numbers collapse to placeholders, as the gate does. */
const SPORT_WORDS = [
  ...new Set([
    ...sports.flatMap((s) => [s.name, s.slug.replace(/-/g, " ")]),
    ...SENIOR_NIGHT_SPORT_ORDER.map((slug) => seniorNightFactsFor(slug)!.head.phrase.replace(/\bsenior night\b/i, "").trim()),
  ]),
]
  .map((w) => w.toLowerCase())
  .sort((a, b) => b.length - a.length);
const SPORT_RE = new RegExp(`\\b(${SPORT_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\&]/g, "\\$&")).join("|")})\\b`, "gi");
const shape = (sentence: string): string =>
  sentence.toLowerCase().replace(SPORT_RE, "{sport}").replace(/\d+(?:[.,]\d+)*/g, "{n}").replace(/\s+/g, " ").trim();

/** tests/blog.test.ts's FORBIDDEN list (itself copied from tests/forbidden-strings.test.ts), applied to the rendered page. */
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

/* ---------- the nine spokes, rendered once ---------- */

type PageFn = (props: { params: Promise<{ sport: string }> }) => Promise<ReactElement>;
const renderSpoke = async (slug: string): Promise<string> =>
  renderToStaticMarkup(await (SeniorNightSportPage as unknown as PageFn)({ params: Promise.resolve({ sport: slug }) }));

interface Spoke {
  slug: string;
  sport: Sport;
  facts: SeniorNightFacts;
  html: string;
}

const SPOKES: Spoke[] = await Promise.all(
  SENIOR_NIGHT_SPORT_ORDER.map(async (slug) => ({ slug, sport: sportBySlug(slug)!, facts: seniorNightFactsFor(slug)!, html: await renderSpoke(slug) })),
);

/** The section a heading id opens, up to the next <section>. */
const sectionOf = (html: string, id: string): string => {
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) return "";
  const start = html.lastIndexOf("<section", at);
  const end = html.indexOf("</section>", at);
  return html.slice(start, end);
};

/** Where an internal path is served from: a concrete page.tsx, a valid `[sport]` / `[slug]` / `[cardId]` param, or a redirect route. */
function resolves(p: string): boolean {
  if (p.startsWith("/go/etsy/")) {
    const sku = p.slice("/go/etsy/".length);
    return /^GDE-[A-Z]{3}-[A-Z0-9-]+$/.test(sku) && listingIdForSku(sku) !== null && fs.existsSync(path.join(ROOT, "app/go/etsy/[sku]/route.ts"));
  }
  if (p.startsWith("/c/")) {
    const card = getCard(p.slice(3));
    return Boolean(card && isIndexable(card)) && fs.existsSync(path.join(ROOT, "app/(registry)/c/[cardId]/page.tsx"));
  }
  const spoke = /^\/senior-night\/([a-z0-9-]+)$/.exec(p);
  if (spoke) return Boolean(seniorNightFactsFor(spoke[1]) && sportBySlug(spoke[1])) && fs.existsSync(path.join(ROOT, PAGE_FILE));
  const sportPage = /^\/sports\/([a-z0-9-]+)$/.exec(p);
  if (sportPage) {
    return sportPageSports().some((s) => s.slug === sportPage[1]) && fs.existsSync(path.join(MARKETING, "sports/[sport]/page.tsx"));
  }
  const post = /^\/blog\/([a-z0-9-]+)$/.exec(p);
  if (post) return Boolean(postBySlug(post[1])) && fs.existsSync(path.join(MARKETING, "blog/[slug]/page.tsx"));
  return fs.existsSync(path.join(MARKETING, p === "/" ? "" : p, "page.tsx"));
}

/* ---------- the route ---------- */

describe("/senior-night/[sport] — the route", () => {
  it("is static: one spoke per sport in SENIOR_NIGHT_SPORT_ORDER, nothing else, revalidated hourly", () => {
    expect(SENIOR_NIGHT_SPORT_ORDER).toHaveLength(9);
    expect(generateStaticParams()).toEqual(SENIOR_NIGHT_SPORT_ORDER.map((sport) => ({ sport })));
    expect(dynamicParams).toBe(false);
    expect(revalidate).toBe(3600);
    for (const banned of ["dance", "track-field", "band", "lacrosse"]) expect(SENIOR_NIGHT_SPORT_ORDER as readonly string[]).not.toContain(banned);
  });

  it("an unknown slug is a 404 and carries no metadata", async () => {
    await expect(renderSpoke("lacrosse")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(await generateMetadata({ params: Promise.resolve({ sport: "lacrosse" }) })).toEqual({});
  });

  it("the source keeps the build rules a render cannot see", () => {
    const src = read(PAGE_FILE);
    expect(src).toContain("export const revalidate = 3600;");
    expect(src).toContain("export const dynamicParams = false;");
    expect(count(src, /<FaqList[^>]*\bjsonLd\b/g)).toBe(1);
    expect(src).toContain('ctaFor("senior-night", { sport: slug })');
    expect(src).not.toMatch(/\$\d/);
    expect(src).not.toContain("etsy.com");
    expect(src).not.toMatch(/\bpriority\b|fetchPriority/);
    expect(src).not.toContain("CALC_STRINGS"); // a server component reads lib/copy/calc.ts, never the client island's export
    expect(src).not.toContain("outline-none");
    expect(src).not.toContain('kind="standard"');
    expect(src).toContain('<GiftNote id={GIFT_NOTE_ID} />');
  });

  it("the share image is the hub's text card, one per spoke, built on lib/og", () => {
    const og = read(OG_FILE);
    for (const token of ["OgFrame", "loadGoogleFont", "OG_SIZE", "generateStaticParams", "seniorNightSports()", "CHIPS.seniorNight", "facts?.h1", "facts?.verdict", "SENIOR EDITION · 1 OF 1"]) {
      expect(og, token).toContain(token);
    }
    expect(og).not.toMatch(/\$\d/);
    expect(og).not.toMatch(/asset\(|\.webp|\.png/); // text only — no listing slide, no art through a relative path
  });
});

/* ---------- every spoke ---------- */

describe("/senior-night/[sport] — every spoke", () => {
  for (const { slug, sport, facts, html } of SPOKES) {
    describe(slug, () => {
      const cta = ctaFor("senior-night", { sport: slug });
      const text = textOf(html);

      it("metadata: the row's title (≤ 60 with the suffix), description (50–155) and canonical", async () => {
        const meta = await generateMetadata({ params: Promise.resolve({ sport: slug }) });
        expect(TITLE_SUFFIX).toBe(" | Game Day Edition");
        expect(meta.title).toBe(facts.titleHead);
        expect(`${facts.titleHead}${TITLE_SUFFIX}`.length, facts.titleHead).toBeLessThanOrEqual(TITLE_MAX);
        expect(meta.description).toBe(facts.description);
        expect(facts.description.length, facts.description).toBeGreaterThanOrEqual(50);
        expect(facts.description.length, facts.description).toBeLessThanOrEqual(DESCRIPTION_MAX);
        expect(meta.alternates?.canonical).toBe(`/senior-night/${slug}`);
        const og = meta.openGraph as { url?: string; title?: string; description?: string } | undefined;
        expect(og?.url).toBe(`/senior-night/${slug}`);
        expect(og?.title).toBe(`${facts.titleHead}${TITLE_SUFFIX}`);
        expect(og?.description).toBe(facts.description);
        expect(meta.robots).toBeUndefined();
      });

      it("answers first: one H1, the head phrase in the measured word order, then the row's verdict", () => {
        const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/g)].map((m) => textOf(m[1]));
        expect(h1s).toEqual([facts.h1]);
        expect(facts.h1.endsWith(".")).toBe(true);
        expect(facts.h1.slice(0, -1).toLowerCase()).toBe(facts.head.phrase.toLowerCase());
        const hero = sectionOf(html, "sn-sport-hero");
        expect(textOf(hero)).toContain(facts.verdict);
        expect(textOf(hero)).toContain("SENIOR EDITION · 1 OF 1");
        // Every H2 ends with a full stop (COPY §0.1).
        for (const m of html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)) expect(textOf(m[1]).endsWith("."), textOf(m[1])).toBe(true);
      });

      it("emits exactly one FAQPage — the row's own questions — and one BreadcrumbList Home › Senior Night › sport", () => {
        const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]) as Record<string, unknown>);
        const faq = ld.filter((o) => o["@type"] === "FAQPage");
        const crumbs = ld.filter((o) => o["@type"] === "BreadcrumbList");
        expect(faq).toHaveLength(1);
        expect(crumbs).toHaveLength(1);
        const entities = faq[0].mainEntity as { name: string; acceptedAnswer: { text: string } }[];
        expect(entities.map((e) => e.name)).toEqual(facts.questions.map((q) => q.q));
        expect(entities.map((e) => e.acceptedAnswer.text)).toEqual(facts.questions.map((q) => q.a));
        const items = crumbs[0].itemListElement as { name: string; item: string }[];
        expect(items.map((i) => i.name)).toEqual(["Home", "Senior Night", sport.name]);
        expect(items[2].item.endsWith(`/senior-night/${slug}`)).toBe(true);
        // Every question is visible on the page: the row's and the shared four.
        for (const q of [...facts.questions, ...faqSubset("senior-night")]) expect(text).toContain(q.q);
      });

      it("makes one delivery claim — CHIPS.seniorNight — in the hero, repeated beside the closing pair", () => {
        const lists = [...html.matchAll(/<ul aria-label="Delivery times"[^>]*>([\s\S]*?)<\/ul>/g)].map((m) =>
          [...m[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li) => textOf(li[1])).join(" · "),
        );
        expect(lists.length).toBeGreaterThanOrEqual(1);
        expect(new Set(lists)).toEqual(new Set([CHIPS.seniorNight]));
        expect(count(sectionOf(html, "sn-sport-hero"), /aria-label="Delivery times"/g)).toBe(1);
        for (const segment of CHIPS.standard.split(" · ")) expect(text).not.toContain(segment);
      });

      it("the primary CTA opens the free proof with SR and the sport; Etsy is the sport's own Senior Night set", () => {
        const all = hrefs(html);
        expect(cta.primary.href).toContain("style=SR");
        expect(cta.primary.href).toContain(`sport=${slug}`);
        expect(pathOf(cta.primary.href)).toBe(INTAKE_PATH);
        expect(all.filter((h) => h === cta.primary.href).length).toBeGreaterThanOrEqual(2); // hero + closing
        const etsy = sport.seniorNightListingId ? `/go/etsy/GDE-${sport.code}-SNSET` : "/go/etsy/GDE-ANY-SNSET";
        expect(cta.secondary?.href).toBe(etsy);
        expect(all.filter((h) => h === etsy).length).toBeGreaterThanOrEqual(2);
        // No other sport's set, and never a marketplace URL.
        for (const h of all.filter((x) => /SNSET/.test(x))) expect(h).toBe(etsy);
        expect(html).not.toMatch(/etsy\.com/);
      });

      it("shows the banner section only for a sport with a Senior Night banner listing", () => {
        const section = sectionOf(html, "sn-sport-banner");
        const snban = `/go/etsy/GDE-${sport.code}-SNBAN`;
        if (!sport.seniorNightBannerListingId) {
          expect(section).toBe("");
          expect(html).not.toContain("SNBAN");
          expect(hrefs(html)).not.toContain("/banners");
          return;
        }
        expect(section).not.toBe("");
        expect(hrefs(section)).toContain(snban);
        expect(hrefs(section)).toContain("/banners");
        // Built from the catalog, never typed: the product blurb, every printed size, the banner shipping note.
        const words = textOf(section);
        expect(words).toContain(productByKey("banner")!.blurb.replace(/\.$/, ""));
        for (const tier of bannerTiers.filter((t) => t.physical && t.enabled)) {
          const [, w, h] = /^(\d+)\s*x\s*(\d+)/i.exec(tier.name)!;
          expect(words).toContain(`${w} × ${h}`);
          expect(words.toLowerCase()).toContain(tierNotes[tier.sku].at(-1)!.toLowerCase());
        }
      });

      it("every internal link resolves to a page, a spoke, a sport page, a post, a registered card or the Etsy redirect", () => {
        const internal = [...new Set(hrefs(html).filter((h) => h.startsWith("/")).map(pathOf))];
        expect(internal).toContain("/senior-night");
        expect(internal).toContain("/photo-guide");
        expect(internal).toContain(INTAKE_PATH);
        for (const p of internal) expect(resolves(p), p).toBe(true);
      });

      it("links the hub, the sport page, both neighboring spokes, the row's posts and the example's registered page", () => {
        const related = sectionOf(html, "sn-sport-related");
        const links = hrefs(related);
        expect(related).toContain('<nav aria-label="Related pages"');
        expect(links).toContain("/senior-night");
        if (sportPageSports().some((s) => s.slug === slug)) expect(links).toContain(`/sports/${slug}`);
        const order: readonly string[] = SENIOR_NIGHT_SPORT_ORDER;
        const at = order.indexOf(slug);
        expect(links).toContain(`/senior-night/${order[(at + order.length - 1) % order.length]}`);
        expect(links).toContain(`/senior-night/${order[(at + 1) % order.length]}`);
        expect(links).not.toContain(`/senior-night/${slug}`);
        for (const post of facts.posts.map(postBySlug)) if (post) expect(links).toContain(`/blog/${post.slug}`);
        for (const href of links.filter((h) => h.startsWith("/c/"))) {
          const card = getCard(href.slice(3))!;
          expect(card.sportCode).toBe(sport.code);
          expect(card.styleName).toBe("Senior Night");
        }
      });

      it("says nothing the truth lint forbids — no price, no number for a sport that wears none", () => {
        expect(html).not.toMatch(/\$\s?\d/);
        for (const [re, why] of FORBIDDEN) expect(text, why).not.toMatch(re);
        if (isNumberless(sport) || backLine(sport) !== "their number") {
          expect(html, "their number on a spoke whose kit carries none").not.toMatch(/\btheir number\b/i);
          expect(text).not.toMatch(/#\d/);
        }
      });

      it("labels every fictional athlete it shows, and shows no other sport's card front", () => {
        const figures = [...html.matchAll(/<figure\b[\s\S]*?<\/figure>/g)].map((m) => m[0]);
        const imgsInFigures = figures.reduce((n, f) => n + count(f, /<img\s/g), 0);
        expect(count(html, /<img\s/g), "an image outside a figure").toBe(imgsInFigures);
        const outOf = (src: string): string => {
          const u = new URL(decode(src), "http://local");
          return u.searchParams.get("url") ?? u.pathname;
        };
        for (const figure of figures) {
          const outs = [...figure.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => outOf(m[1]));
          for (const out of outs) expect(Object.values(SITE_ASSETS).some((a) => a.out === out), out).toBe(true);
          if (outs.some((out) => Object.values(SITE_ASSETS).some((a) => a.out === out && a.fictional))) {
            expect(figure, "fictional athlete without C13").toContain(CANON.fictionalLabel);
          }
        }
        const hero = sectionOf(html, "sn-sport-hero");
        const own = facts.art.card ? SITE_ASSETS[facts.art.card] : undefined;
        if (own && own.status === "verified") {
          expect(hero).toContain(encodeURIComponent(own.out));
        } else {
          // Ice hockey (GAPS #17): the hub's navy text tile, no image at all.
          expect(count(hero, /<img\s/g)).toBe(0);
          expect(textOf(hero)).toContain("Built to order — no example card yet.");
        }
        for (const other of SPOKES.filter((s) => s.slug !== slug)) {
          const key = other.facts.art.card;
          if (key && SITE_ASSETS[key]?.out && SITE_ASSETS[key].out !== own?.out) expect(html).not.toContain(encodeURIComponent(SITE_ASSETS[key].out));
        }
      });

      it("shows the example back, captioned with the sport it really shows, only where its kit agrees with the row", () => {
        const back = SITE_ASSETS["sn.back"];
        const backSport = sportByCode(getCard(back.cardId!)!.sportCode)!;
        expect(back.alt.toLowerCase()).toContain(backSport.name.toLowerCase());
        const section = sectionOf(html, "sn-sport-back");
        expect(textOf(section)).toContain(facts.backLine);
        if (backLine(backSport) === backLine(sport)) {
          expect(section).toContain(encodeURIComponent(back.out));
          expect(textOf(section)).toContain(`The senior edition back, ${backSport.name.toLowerCase()} example.`);
        } else {
          // A numbered shirt back beside "no number anywhere" would show the number the row says is not there.
          expect(count(section, /<img\s/g)).toBe(0);
          expect(textOf(section)).not.toContain("example.");
        }
      });

      it("renders the row: the night, the walk, the photo notes, the season word", () => {
        const when = textOf(sectionOf(html, "sn-sport-when"));
        expect(when).toContain(facts.when.line);
        expect(when).toContain(facts.ritual);
        expect(when).toContain(`${seasonWord(facts.when.peakMonth)} season`.toUpperCase());
        expect(when).toContain(`WHEN IS ${facts.head.phrase.replace(/\bsenior night\b/i, "").trim().toUpperCase()} SENIOR NIGHT.`);
        expect(when).toContain(CANON.seniorDateLine);
        expect(when).toContain(CALC_COPY.label);
        const photos = sectionOf(html, "sn-sport-photos");
        for (const note of facts.photoNotes) expect(textOf(photos)).toContain(note);
        expect(hrefs(photos)).toContain("/photo-guide");
      });

      it("marks every block that is identical across spokes by design as data-shared", () => {
        const own = removeSubtrees(stripScripts(html), (_tag, attrs) => /\sdata-shared=""/.test(attrs));
        const ownWords = textOf(own);
        expect(own).not.toContain('aria-label="Delivery times"');
        for (const segment of trustLineSegments()) expect(ownWords).not.toContain(segment);
        expect(ownWords).not.toContain(CANON.seniorDateLine);
        expect(ownWords).not.toContain(CALC_COPY.help);
        for (const item of faqSubset("senior-night")) expect(ownWords).not.toContain(item.a);
        expect(ownWords).not.toContain(GIFT_NOTE_STRINGS.heading);
        expect(ownWords).not.toContain("shows what the photo check looks for");
        expect(own).not.toContain("SNBAN");
        // …and the row's own words are still there.
        for (const note of facts.photoNotes) expect(ownWords).toContain(note);
        for (const q of facts.questions) expect(ownWords).toContain(q.a);
      });

      it("every shared block ends at its own first closing tag, so the gate's first-closing-tag strip removes it whole", () => {
        // tests/seo-families.test.ts strips `<tag … data-shared="">` up to the FIRST `</tag>`: a shared <div> that
        // holds another <div> ends early there and leaves the rest of its prose on the page.
        const firstCloseStrip = (h: string): string => h.replace(/<([a-z0-9]+)([^>]*)\sdata-shared=""[^>]*>[\s\S]*?<\/\1>/g, " ");
        const prose = (h: string): string[] =>
          [
            ...removeSubtrees(stripScripts(h), (tag) => /^h[1-6]$/.test(tag) || ["nav", "button", "figcaption", "details", "summary"].includes(tag)).matchAll(
              /<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/g,
            ),
          ]
            .map((m) => textOf(m[2]))
            .filter(Boolean);
        expect(prose(firstCloseStrip(html))).toEqual(prose(removeSubtrees(html, (_tag, attrs) => /\sdata-shared=""/.test(attrs))));
      });

      it("prints the gift note once, hidden until the calculator asks for it", () => {
        expect(count(html, /id="gift-note"/g)).toBe(1);
        expect(html).toMatch(/<div id="gift-note" hidden=""/);
        expect(html).toContain('class="print:hidden"');
      });

      it("counts its own sections: a spoke without a banner section has seven", () => {
        const total = sport.seniorNightBannerListingId ? 8 : 7;
        const indexes = [...html.matchAll(/>(\d\d) \/ (\d\d)</g)].map((m) => [Number(m[1]), Number(m[2])]);
        expect(indexes.map(([n]) => n)).toEqual(Array.from({ length: total - 1 }, (_, i) => i + 2));
        for (const [, of] of indexes) expect(of).toBe(total);
      });
    });
  }
});

/* ---------- the spokes against each other ---------- */

describe("/senior-night/[sport] — siblings differ in facts, not wording", () => {
  const shapes = new Map(SPOKES.map((s) => [s.slug, new Set(sentencesOf(ownText(s.html)).map(shape))]));

  for (const { slug, html } of SPOKES) {
    it(`${slug}: at least six sentences outside [data-shared] that no other spoke says`, () => {
      const mine = [...new Set(sentencesOf(ownText(html)).map(shape))];
      const others = SPOKES.filter((s) => s.slug !== slug).map((s) => shapes.get(s.slug)!);
      const unique = mine.filter((sentence) => !others.some((set) => set.has(sentence)));
      expect(unique.length, `unique: ${unique.length} of ${mine.length}`).toBeGreaterThanOrEqual(6);
    });
  }

  it("cheerleading and wrestling are among the spokes the numberless rule checks, and neither shows the numbered example back", () => {
    const checked = SPOKES.filter(({ sport }) => isNumberless(sport) || backLine(sport) !== "their number").map((s) => s.slug);
    expect(checked).toEqual(expect.arrayContaining(["cheerleading", "wrestling"]));
    const back = encodeURIComponent(SITE_ASSETS["sn.back"].out);
    const without = SPOKES.filter((s) => !sectionOf(s.html, "sn-sport-back").includes(back)).map((s) => s.slug);
    expect(without).toEqual(["cheerleading", "wrestling"]);
  });
});
