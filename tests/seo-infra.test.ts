// The SEO setup of 2026-10-06 (docs/SEO-PLAN-GDE-2026-10.md): the two fact tables are sound, the sitemap
// carries their pages with honest dates, /llms.txt carries the facts and the firewall, the IndexNow key
// is served, the entry attribution builds a clean record, and the navigation reaches the new pages.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sitemap from "../app/sitemap";
import { SITE_ASSETS } from "../lib/assets";
import { posts } from "../lib/blog";
import { faqAll } from "../lib/catalog/faq";
import { listingIdForSku, listingUrlForSku, ETSY_SHOP_FRONT } from "../lib/catalog/listings";
import { isNumberless, sportBySlug, sports } from "../lib/catalog/sports";
import { ctaFor } from "../lib/cta";
import { entryRecordFrom } from "../components/EntryAttribution";
import { FOOTER_COLUMNS, MOBILE_EXTRA_LINKS, TEAMS_HREF } from "../lib/nav";
import { INDEXNOW_KEY, INDEXNOW_KEY_PATH } from "../lib/seo/indexnow";
import { isNeverTargeted, ownerOf } from "../lib/seo/intents";
import { SENIOR_NIGHT_FACTS, SENIOR_NIGHT_SPORT_ORDER, seasonWord, seniorNightPages, seniorNightPath, seniorNightSports } from "../lib/seo/senior-night-facts";
import { SPORT_FACTS, hubLine, hubTiles, sportPagePath, sportPageSports, sportPages } from "../lib/seo/sport-facts";
import { DESCRIPTION_MAX, PAGES, TITLE_MAX, TITLE_SUFFIX } from "../lib/seo/titles";
import { BRAND, CANONICAL_ORIGIN, SITE_URL } from "../lib/site";

const ROOT = process.cwd();
const TODAY = new Date().toISOString().slice(0, 10);

/** tests/forbidden-strings.test.ts, applied to the facts' prose. */
const FORBIDDEN: Array<[RegExp, string]> = [
  [/\binstant(ly)?\b/i, "instant"],
  [/rounded corners/i, "rounded corners"],
  [/\btopps\b|\bpanini\b|upper deck|graded slab/i, "competitor"],
  [/\bpdf\b/i, "pdf"],
  [/\bverified\b/i, "verified"],
  [/\bnumbered\b/i, "numbered"],
  [/\byouth\b/i, "youth"],
  [/\bvintage\b/i, "vintage"],
  [/\bcheaper\b/i, "cheaper"],
  [/\$\s?\d/, "a dollar amount"],
  [/supabase|resend|printful|printify|bay photo|whcc|qpmn|vertex|gemini/i, "provider name"],
  [/colour|favourite|centre\b|organis|\bgrey\b|practis|catalogue|licence|cheque/i, "US spelling"],
  [/\b(jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2}\b/i, "a calendar date"],
];

const proseOf = (row: object): string =>
  JSON.stringify(row, (key, value) => (["id", "slug", "art", "posts", "updatedAt", "measured", "searches", "peakMonth"].includes(key) ? undefined : value));

describe("the sport fact table", () => {
  it("has one row per sport page, every slug a real sport with a live listing", () => {
    expect(SPORT_FACTS.length).toBeGreaterThanOrEqual(9);
    expect(new Set(SPORT_FACTS.map((f) => f.slug)).size).toBe(SPORT_FACTS.length);
    for (const f of SPORT_FACTS) expect(sportBySlug(f.slug)?.live, f.slug).toBe(true);
    expect(sportPageSports().map((s) => s.slug)).toEqual(SPORT_FACTS.map((f) => f.slug));
  });
  for (const f of SPORT_FACTS) {
    it(`${f.slug}: limits, ownership, honesty`, () => {
      expect(`${f.titleHead}${TITLE_SUFFIX}`.length, f.titleHead).toBeLessThanOrEqual(TITLE_MAX);
      expect(f.description.length, f.slug).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(f.description.length, f.slug).toBeGreaterThan(50);
      expect(f.h1.endsWith(".")).toBe(true);
      expect(f.h1).toBe(f.h1.toUpperCase());
      expect(f.verdict.length).toBeLessThanOrEqual(160);
      expect(f.photoTraps.length).toBeGreaterThanOrEqual(2);
      expect(f.questions.length).toBeGreaterThanOrEqual(2);
      expect(f.questions.length).toBeLessThanOrEqual(4);
      expect(new Set(f.questions.map((q) => q.id)).size).toBe(f.questions.length);
      for (const q of f.questions) expect(q.id.startsWith("q-"), q.id).toBe(true);
      // The head phrase is owned by this page in the keyword map and is never a never-target phrase.
      expect(isNeverTargeted(f.head.phrase), f.head.phrase).toBe(false);
      expect(ownerOf(f.head.phrase)?.path, f.head.phrase).toBe(sportPagePath(f.slug));
      expect(f.head.searches).toBeGreaterThan(0);
      expect(f.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(f.updatedAt <= TODAY, "a date in the future is not earned").toBe(true);
      for (const key of Object.values(f.art)) expect(SITE_ASSETS[key]?.status, `${f.slug} art ${key}`).toBe("verified");
      for (const slug of f.posts) expect(posts.some((p) => p.slug === slug), `${f.slug} post ${slug}`).toBe(true);
      const prose = proseOf(f);
      for (const [re, why] of FORBIDDEN) expect(prose, `${f.slug}: ${why}`).not.toMatch(re);
      const sport = sportBySlug(f.slug)!;
      if (isNumberless(sport) || !sport.hasBackNumber) expect(prose, `${f.slug} promises a number`).not.toMatch(/\btheir number\b/i);
    });
  }
  it("no two sports share a sentence outside the shared truths", () => {
    const seen = new Map<string, string>();
    for (const f of SPORT_FACTS) {
      const sentences = [f.verdict, f.frontLine, f.backLine, ...f.photoTraps, ...f.questions.map((q) => q.a)].map((s) => s.trim().toLowerCase());
      for (const s of sentences) {
        expect(seen.get(s), `"${s.slice(0, 60)}…" is on ${seen.get(s)} and ${f.slug}`).toBeUndefined();
        seen.set(s, f.slug);
      }
    }
  });
  it("hub tiles cover all 17 sports and say the right thing about the number", () => {
    const tiles = hubTiles();
    expect(tiles).toHaveLength(sports.length);
    expect(tiles.filter((t) => t.hasPage).map((t) => t.sport.slug)).toEqual(sportPageSports().map((s) => s.slug));
    expect(hubLine(sportBySlug("cheerleading")!)).toContain("No jersey number");
    expect(hubLine(sportBySlug("wrestling")!)).toContain("plain");
    expect(hubLine(sportBySlug("football")!)).toContain("number on the front and on the back");
  });
});

describe("the senior night fact table", () => {
  it("has the nine spokes in the hub's order, never dance, track, band or lacrosse", () => {
    expect(seniorNightSports().map((s) => s.slug)).toEqual([...SENIOR_NIGHT_SPORT_ORDER]);
    expect(SENIOR_NIGHT_FACTS.map((f) => f.slug).sort()).toEqual([...SENIOR_NIGHT_SPORT_ORDER].sort());
    for (const slug of ["lacrosse", "track-field"]) expect(SENIOR_NIGHT_FACTS.some((f) => f.slug === slug), slug).toBe(false);
  });
  for (const f of SENIOR_NIGHT_FACTS) {
    it(`${f.slug}: limits, ownership, honesty`, () => {
      expect(`${f.titleHead}${TITLE_SUFFIX}`.length, f.titleHead).toBeLessThanOrEqual(TITLE_MAX);
      expect(f.description.length, f.slug).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(f.h1.endsWith(".")).toBe(true);
      expect(f.h1.toLowerCase().replace(/\.$/, "")).toBe(f.head.phrase);
      expect(ownerOf(f.head.phrase)?.path, f.head.phrase).toBe(seniorNightPath(f.slug));
      expect(f.when.peakMonth).toBeGreaterThanOrEqual(1);
      expect(f.when.peakMonth).toBeLessThanOrEqual(12);
      expect(["fall", "winter", "spring"]).toContain(seasonWord(f.when.peakMonth));
      expect(f.photoNotes.length).toBeGreaterThanOrEqual(2);
      expect(f.questions.length).toBeGreaterThanOrEqual(2);
      expect(f.updatedAt <= TODAY).toBe(true);
      for (const key of Object.values(f.art)) expect(SITE_ASSETS[key]?.status, `${f.slug} art ${key}`).toBe("verified");
      for (const slug of f.posts) expect(posts.some((p) => p.slug === slug), `${f.slug} post ${slug}`).toBe(true);
      const prose = proseOf(f);
      for (const [re, why] of FORBIDDEN) expect(prose, `${f.slug}: ${why}`).not.toMatch(re);
      const sport = sportBySlug(f.slug)!;
      if (isNumberless(sport) || !sport.hasBackNumber) expect(prose, `${f.slug} promises a number`).not.toMatch(/\btheir number\b/i);
      // Every spoke's answers stand alone: none opens with a pronoun that needs the page around it.
      for (const q of f.questions) expect(q.a, q.id).not.toMatch(/^(This|It|As mentioned|These)\b/);
    });
  }
  it("ice hockey has no senior card yet and says so through the empty art, not a borrowed one", () => {
    expect(SENIOR_NIGHT_FACTS.find((f) => f.slug === "ice-hockey")!.art.card).toBeUndefined();
  });
});

describe("sitemap rows for the sport pages and the spokes", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);
  it("lists every sport page and every spoke with its own lastmod, and never the pattern rows", () => {
    for (const p of [...sportPages(), ...seniorNightPages()]) {
      const entry = entries.find((e) => e.url === `${SITE_URL}${p.path}`);
      expect(entry, p.path).toBeTruthy();
      expect(new Date(entry!.lastModified!).toISOString().slice(0, 10)).toBe(p.lastModified);
    }
    expect(urls.some((u) => u.includes("["))).toBe(false);
    expect(urls).toContain(`${SITE_URL}/banners`);
    expect(urls).toContain(`${SITE_URL}/christmas-gift`);
    expect(urls).toContain(`${SITE_URL}/teams`);
    expect(urls).toContain(`${SITE_URL}/sports`);
    expect(urls).not.toContain(`${SITE_URL}/styles/senior-night`);
    expect(PAGES["/senior-night/[sport]"].phase).toBe("F1");
    expect(PAGES["/sports/[sport]"].phase).toBe("F1");
  });
  it("a static page without history carries no lastmod — the build date is never a modification", () => {
    for (const p of ["/", "/trading-cards", "/banners", "/sports"]) {
      expect(entries.find((e) => e.url === `${SITE_URL}${p}`)?.lastModified, p).toBeUndefined();
    }
  });
});

describe("banner SKUs and CTA contexts", () => {
  it("resolve a sport's banner listing, and the shop front where no any-sport listing exists", () => {
    expect(listingIdForSku("GDE-FTB-BAN-2X4")).toBe(sportBySlug("football")!.bannerListingId);
    expect(listingIdForSku("GDE-FTB-SNBAN-DIG")).toBe(sportBySlug("football")!.seniorNightBannerListingId);
    expect(listingIdForSku("GDE-ANY-BAN-2X4")).toBeNull();
    expect(listingUrlForSku("GDE-ANY-BAN-2X4")).toBe(ETSY_SHOP_FRONT);
    expect(listingIdForSku("GDE-ICH-SNBAN")).toBeNull();
    expect(listingIdForSku("GDE-BKB-SNSET")).toBe("4580022282");
  });
  it("ctaFor('banners') prefills the banner and points Etsy at the sport's banner listing", () => {
    const cta = ctaFor("banners", { sport: "soccer" });
    expect(cta.primary.href).toContain("product=banner");
    expect(cta.primary.href).toContain("sport=soccer");
    expect(cta.secondary?.href).toBe("/go/etsy/GDE-SOC-BAN");
    expect(ctaFor("banners").secondary?.href).toBe("/go/etsy/GDE-ANY-BAN");
  });
  it("ctaFor('sport') prefills cards + poster and the sport's card listing", () => {
    const cta = ctaFor("sport", { sport: "baseball" });
    expect(cta.primary.href).toContain("product=cards,poster");
    expect(cta.primary.href).toContain("sport=baseball");
    expect(cta.secondary?.href).toBe("/go/etsy/GDE-BSB-CARD");
  });
});

describe("/llms.txt carries the facts, the sport pages and the firewall", () => {
  it("every FAQ answer verbatim, every sport line, the do-not-say list and the citation rule", async () => {
    const { GET } = await import("../app/llms.txt/route");
    const text = await GET().text();
    for (const item of faqAll()) expect(text, item.id).toContain(`- ${item.q} ${item.a}`);
    for (const f of SPORT_FACTS) expect(text).toContain(`](${CANONICAL_ORIGIN}${sportPagePath(f.slug)}): ${f.verdict}`);
    for (const f of SENIOR_NIGHT_FACTS) expect(text).toContain(`](${CANONICAL_ORIGIN}${seniorNightPath(f.slug)}):`);
    expect(text).toContain("## Do not say");
    expect(text).toContain("## How to cite");
    expect(text).toContain("square-cut at all four corners");
    expect(text).toContain(`${CANONICAL_ORIGIN}/banners`);
    expect(text.startsWith(`# ${BRAND}\n`)).toBe(true);
  });
});

describe("IndexNow key and the live-version endpoint", () => {
  it("the key file is committed under public/ and equals the constant", () => {
    const file = path.join(ROOT, "public", INDEXNOW_KEY_PATH.slice(1));
    expect(fs.existsSync(file), file).toBe(true);
    expect(fs.readFileSync(file, "utf8").trim()).toBe(INDEXNOW_KEY);
    expect(INDEXNOW_KEY).toMatch(/^[0-9a-f]{32}$/);
  });
  it("/api/version answers with the commit and never caches", async () => {
    const { GET } = await import("../app/api/version/route");
    const res = GET();
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toMatchObject({ sha: expect.any(String) });
  });
  it("the workflow pings only after production serves the pushed commit", () => {
    const yml = fs.readFileSync(path.join(ROOT, ".github/workflows/indexnow.yml"), "utf8");
    expect(yml).toContain("/api/version");
    expect(yml).toContain("scripts/seo/indexnow.ts");
    expect(yml).toContain("branches: [main]");
  });
});

describe("entry attribution", () => {
  it("builds a record from the first page: path without query, referrer trimmed, only the known tags", () => {
    const r = entryRecordFrom("/senior-night/volleyball", "?utm_source=pinterest&utm_campaign=sn&other=1", "https://www.pinterest.com/pin/1", new Date("2026-10-06T10:00:00Z"));
    expect(r.path).toBe("/senior-night/volleyball");
    expect(r.utm).toEqual({ utm_source: "pinterest", utm_campaign: "sn" });
    expect(r.referrer).toBe("https://www.pinterest.com/pin/1");
    expect(r.at).toBe("2026-10-06T10:00:00.000Z");
    expect(entryRecordFrom("", "", "x".repeat(400), new Date()).referrer).toHaveLength(300);
    expect(entryRecordFrom("", "", "", new Date()).path).toBe("/");
  });
  it("is mounted once in the marketing layout, not in the registry group", () => {
    expect(fs.readFileSync(path.join(ROOT, "app/(marketing)/layout.tsx"), "utf8")).toContain("<EntryAttribution />");
    expect(fs.readFileSync(path.join(ROOT, "app/(registry)/layout.tsx"), "utf8")).not.toContain("EntryAttribution");
  });
});

describe("navigation reaches the new pages", () => {
  it("footer Shop column and the mobile sheet link banners, the sport hub, the Christmas page and /teams", () => {
    const shop = FOOTER_COLUMNS[0].links.map((l) => l.href);
    for (const href of ["/banners", "/sports", "/christmas-gift", "/teams"]) expect(shop).toContain(href);
    expect(MOBILE_EXTRA_LINKS.map((l) => l.href)).toContain("/banners");
    expect(TEAMS_HREF).toBe("/teams");
  });
});
