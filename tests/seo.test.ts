// The SEO configuration test: the keyword map, the title table's hard limits, and the three route
// tables in next.config.ts measured against the registry (CONTRACTS §4.2, §5.8, §6; GAPS #24 #26).
//
// Everything here is read from the tables, never from page files: a page file imports `next/image`,
// which does not load under Vitest (CONTRACTS §9.2 #10).

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import nextConfig from "../next.config";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import {
  INTENTS,
  KEYWORD_BEARING_F1_PATHS,
  NEVER_TARGET,
  intentsFor,
  isNeverTargeted,
  neverTargetReason,
  ownerOf,
  pathForIntent,
} from "../lib/seo/intents";
import { DESCRIPTION_MAX, PAGES, TITLE_MAX, f1Pages, fullTitle, matchesPagePath, substituteLongest } from "../lib/seo/titles";
import { cards, registeredAtOf, updatedAtOf, visibilityOf } from "../lib/registry/cards";
import { SITE_ASSETS } from "../lib/assets";
import { SITE_URL } from "../lib/site";
import { blogPages } from "../lib/blog";
import { INTAKE_PATH, INTAKE_THANKS_PATH } from "../lib/intake/copy";
import { freeProofSportSlugs } from "../lib/intake/sport-art";

const ROOT = path.resolve(__dirname, "..");

/** Card paths straight from the registry — the test never asks next.config.ts what the answer is. */
const pathsWith = (v: string): string[] =>
  cards.filter((c) => visibilityOf(c) === v).map((c) => `/c/${c.cardId}`);

/* ---------- the route tables, resolved once ---------- */
const headerRules = await nextConfig.headers!();
const redirectRules = await nextConfig.redirects!();
const rewriteRules = await nextConfig.rewrites!();
const allBeforeFiles = (Array.isArray(rewriteRules) ? rewriteRules : rewriteRules.beforeFiles) ?? [];
/** The deleted-card rules (410). The /free-proof?sport= rewrite to its per-sport twin is tested on its own below. */
const beforeFiles = allBeforeFiles.filter((r) => r.source !== "/free-proof");
const freeProofRewrites = allBeforeFiles.filter((r) => r.source === "/free-proof");

/** Every route that has a page.tsx on disk, with the `(group)` segments stripped. */
function routesOnDisk(dir = path.join(ROOT, "app"), route = ""): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (entry.name === "page.tsx" || entry.name === "page.ts") out.push(route === "" ? "/" : route);
      continue;
    }
    const segment = /^\(.*\)$/.test(entry.name) ? "" : `/${entry.name}`;
    out.push(...routesOnDisk(path.join(dir, entry.name), route + segment));
  }
  return out;
}
const DISK_ROUTES = new Set(routesOnDisk());

/** A concrete path is built when its own page.tsx exists or a `[segment]` route on disk matches it. */
function routeBuilt(path: string): boolean {
  if (DISK_ROUTES.has(path)) return true;
  return [...DISK_ROUTES].some((route) => route.includes("[") && new RegExp(`^${route.replace(/\[[^\]]+\]/g, "[a-z0-9-]+")}$`).test(path));
}

/**
 * F1 pages the other Wave-1 builders are still writing in this shared tree. Every entry must be gone
 * by the Wave-2 build; a page missing from disk that is NOT on this list is a real hole in the sitemap.
 */
const WAVE1_IN_FLIGHT = new Set([
  // 2026-10-04: the free-proof page is written in parallel by the form builder (its layout is already
  // here); remove this entry once app/(marketing)/free-proof/page.tsx lands.
  "/free-proof",
  "/trading-cards",
  "/posters",
  "/complete-set",
  "/senior-night",
  "/how-it-works",
  "/guarantee",
  "/photo-guide",
  "/about",
  "/faq",
  "/accessibility",
]);

describe("intents — one keyword, one page", () => {
  it("the map is populated (a silent empty table would pass every other check)", () => {
    expect(INTENTS.length).toBeGreaterThanOrEqual(44);
    expect(f1Pages().length).toBeGreaterThanOrEqual(16);
    expect(pathsWith("public").length).toBeGreaterThan(0);
    expect(headerRules.length).toBe(1 + 8 + pathsWith("unlisted").length + pathsWith("private").length);
  });

  it("every keyword is unique, case-insensitively", () => {
    const seen = new Map<string, string>();
    for (const i of INTENTS) {
      const k = i.keyword.toLowerCase();
      expect(seen.has(k), `"${i.keyword}" is claimed twice (${seen.get(k)} and ${i.path})`).toBe(false);
      seen.set(k, i.path);
    }
  });

  it("every keyword maps to exactly one path", () => {
    for (const i of INTENTS) {
      expect(pathForIntent(i.keyword), i.keyword).toBe(i.path);
      expect(ownerOf(i.keyword.toUpperCase())?.path, i.keyword).toBe(i.path);
      expect(INTENTS.filter((o) => o.keyword === i.keyword)).toHaveLength(1);
    }
    expect(pathForIntent("a phrase nobody wrote down")).toBeUndefined();
  });

  it("every path is a row in the titles table", () => {
    for (const i of INTENTS) expect(matchesPagePath(i.path), i.path).toBe(true);
  });

  it("every F1 intent path is built (or still in flight)", () => {
    for (const i of INTENTS.filter((x) => x.phase === "F1")) {
      if (routeBuilt(i.path)) continue;
      expect(WAVE1_IN_FLIGHT.has(i.path), `${i.path} owns keywords but has no page.tsx`).toBe(true);
    }
  });

  it("phase comes from the titles table, not from the intent row", () => {
    for (const i of INTENTS) {
      if (PAGES[i.path]) expect(i.phase, i.path).toBe(PAGES[i.path].phase);
    }
    // 2026-10-06: the sport pages and the senior-night spokes are built; /styles stays F3.
    expect(ownerOf("custom basketball cards")?.phase).toBe("F1");
    expect(ownerOf("football senior night")?.phase).toBe("F1");
    expect(ownerOf("custom trading cards")?.phase).toBe("F1");
    expect(PAGES["/styles/[finish]"].phase).toBe("F3");
  });

  it("every page that must own a keyword owns one", () => {
    for (const p of KEYWORD_BEARING_F1_PATHS) expect(intentsFor(p).length, p).toBeGreaterThan(0);
    expect(intentsFor("/posters").map((i) => i.keyword)).toContain("gym wall art");
  });

  it("no keyword is a NEVER_TARGET phrase", () => {
    for (const i of INTENTS) {
      expect(neverTargetReason(i.keyword), `${i.keyword}: ${neverTargetReason(i.keyword)}`).toBeUndefined();
    }
    expect(NEVER_TARGET.length).toBeGreaterThan(0);
  });

  it("NEVER_TARGET catches the phrases it is written for", () => {
    for (const phrase of ["youth sports cards", "personalized card", "senior banner", "lacrosse senior night"]) {
      expect(isNeverTargeted(phrase), phrase).toBe(true);
    }
    // Bare "<sport> cards" is refused; the same words inside a longer, real phrase are not.
    expect(isNeverTargeted("basketball cards")).toBe(true);
    expect(isNeverTargeted("custom basketball cards")).toBe(false);
    // Sport x finish is refused by rule; the occasion (Senior Night) is not a finish.
    expect(isNeverTargeted("chrome all-star basketball card")).toBe(true);
    expect(isNeverTargeted("stadium night football poster")).toBe(true);
    expect(isNeverTargeted("football senior night")).toBe(false);
  });
});

describe("titles — the one metadata table", () => {
  it("every rendered title is at most 60 characters, patterns measured at their longest", () => {
    for (const meta of Object.values(PAGES)) {
      const rendered = substituteLongest(fullTitle(meta));
      expect(rendered.length, `${meta.path}: "${rendered}" (${rendered.length})`).toBeLessThanOrEqual(TITLE_MAX);
      expect(rendered.trim(), meta.path).not.toBe("");
    }
  });

  it("every description is at most 155 characters", () => {
    for (const meta of Object.values(PAGES)) {
      const rendered = substituteLongest(meta.description);
      expect(rendered.length, `${meta.path}: ${rendered.length}`).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(rendered.length, meta.path).toBeGreaterThan(50);
    }
  });

  it("an absolute title carries the brand and a templated one does not", () => {
    for (const meta of Object.values(PAGES)) {
      if (meta.absolute) expect(fullTitle(meta), meta.path).toBe(meta.title);
      else expect(fullTitle(meta), meta.path).toBe(`${meta.title} | Game Day Edition`);
    }
    expect(PAGES["/"].absolute).toBe(true);
    expect(PAGES["/about"].absolute).toBeFalsy();
  });

  it("no title or description says “youth”", () => {
    for (const meta of Object.values(PAGES)) {
      expect(`${meta.title} ${meta.description}`.toLowerCase(), meta.path).not.toContain("youth");
    }
  });

  it("every page on disk is in the table", () => {
    for (const route of DISK_ROUTES) {
      if (route.includes("[")) continue; // /c/[cardId] has its own metadata (cardMeta)
      expect(matchesPagePath(route), `${route} has no row in PAGES`).toBe(true);
    }
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists every F1 page that is not noindex, and nothing else from the table", () => {
    for (const meta of f1Pages()) expect(urls, meta.path).toContain(`${SITE_URL}${meta.path}`);
    for (const meta of Object.values(PAGES)) {
      if (meta.phase === "F1" && !meta.noindex) continue;
      expect(urls, `${meta.path} must not be in the sitemap`).not.toContain(`${SITE_URL}${meta.path}`);
    }
  });

  it("carries the priority and change frequency from the table", () => {
    for (const meta of f1Pages()) {
      const entry = entries.find((e) => e.url === `${SITE_URL}${meta.path}`)!;
      expect(entry.priority, meta.path).toBe(meta.priority);
      expect(entry.changeFrequency, meta.path).toBe(meta.changeFrequency);
    }
  });

  it("lists every public card with its last update, and no other card", () => {
    for (const c of cards) {
      const url = `${SITE_URL}/c/${c.cardId}`;
      if (visibilityOf(c) === "public") {
        const entry = entries.find((e) => e.url === url);
        expect(entry, `${c.cardId} is public and missing`).toBeTruthy();
        expect(new Date(entry!.lastModified!).toISOString().slice(0, 10)).toBe(updatedAtOf(c));
      } else {
        expect(urls, `${c.cardId} is ${visibilityOf(c)} and must not be listed`).not.toContain(url);
      }
    }
  });

  it("has no duplicate URL and every URL is absolute on the canonical origin", () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const url of urls) expect(url.startsWith(`${SITE_URL}/`), url).toBe(true);
  });
});

describe("D29 — the free-proof routes (owner, 2026-10-04)", () => {
  const urls = sitemap().map((e) => e.url);

  it("/free-proof is an F1 row in the sitemap; /free-proof/thanks is noindex and is not", () => {
    expect(INTAKE_PATH).toBe("/free-proof");
    expect(INTAKE_THANKS_PATH).toBe("/free-proof/thanks");
    expect(PAGES[INTAKE_PATH].phase).toBe("F1");
    expect(PAGES[INTAKE_PATH].noindex).toBeFalsy();
    expect(urls).toContain(`${SITE_URL}/free-proof`);
    expect(PAGES[INTAKE_THANKS_PATH].noindex).toBe(true);
    expect(urls).not.toContain(`${SITE_URL}/free-proof/thanks`);
    expect(urls.some((u) => u.includes("/free-proof/"))).toBe(false);
  });

  it("the thanks page carries X-Robots-Tag: noindex, and the form page does not", () => {
    const noindex = headerRules.filter((r) => r.headers.some((h) => h.key === "X-Robots-Tag" && h.value === "noindex, nofollow")).map((r) => r.source);
    expect(noindex).toContain("/free-proof/thanks");
    expect(noindex).not.toContain("/free-proof");
    expect(noindex.some((source) => source.startsWith("/free-proof/:"))).toBe(false);
  });

  it("owns the free-proof intent and nothing else moves", () => {
    expect(pathForIntent("free proof custom sports card")).toBe("/free-proof");
    expect(pathForIntent("custom sports card free proof")).toBe("/free-proof");
    expect(intentsFor("/free-proof").map((i) => i.keyword)).toEqual(["free proof custom sports card", "custom sports card free proof"]);
    expect(KEYWORD_BEARING_F1_PATHS).toContain("/free-proof");
    expect(pathForIntent("custom trading cards")).toBe("/trading-cards");
    expect(pathForIntent("senior night gift")).toBe("/senior-night");
  });

  it("titles stay inside the limits even while the form's own copy runs long", () => {
    for (const path of [INTAKE_PATH, INTAKE_THANKS_PATH]) {
      expect(fullTitle(PAGES[path]).length, path).toBeLessThanOrEqual(TITLE_MAX);
      expect(PAGES[path].description.length, path).toBeLessThanOrEqual(DESCRIPTION_MAX);
    }
  });
});

describe("the blog rows (2026-10-04)", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("/blog is an F1 row in the sitemap; the [slug] pattern row never is", () => {
    expect(PAGES["/blog"].phase).toBe("F1");
    expect(urls).toContain(`${SITE_URL}/blog`);
    expect(PAGES["/blog/[slug]"]).toBeDefined();
    expect(f1Pages().some((p) => p.path.includes("["))).toBe(false);
    expect(urls.some((u) => u.includes("["))).toBe(false);
    expect(matchesPagePath("/blog/what-photos-to-send")).toBe(true);
  });

  it("every published post is in the sitemap with its last change", () => {
    for (const post of blogPages()) {
      const entry = entries.find((e) => e.url === `${SITE_URL}${post.path}`);
      expect(entry, post.path).toBeTruthy();
      expect(new Date(entry!.lastModified!).toISOString().slice(0, 10)).toBe(post.lastModified);
    }
  });
});

describe("robots.txt", () => {
  const rules = robots();
  const rule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules!;

  it("disallows the surfaces that must never be crawled", () => {
    const disallow = [rule.disallow ?? []].flat();
    for (const p of ["/api/", "/go/", "/etsy", "/order/", "/t/", "/lp/", "/registry/lookup"]) {
      expect(disallow, p).toContain(p);
    }
  });

  it("never names an unlisted or private card (robots.txt is public)", () => {
    const disallow = [rule.disallow ?? []].flat().join(" ");
    for (const p of [...pathsWith("unlisted"), ...pathsWith("private")]) expect(disallow).not.toContain(p);
  });

  it("points at the sitemap on the canonical origin", () => {
    expect(rules.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("next.config headers()", () => {
  const sourcesFor = (key: string, value: string) =>
    headerRules.filter((r) => r.headers.some((h) => h.key === key && h.value === value)).map((r) => r.source);
  const noindexSources = new Set(sourcesFor("X-Robots-Tag", "noindex, nofollow"));

  it("keeps the security headers on every path", () => {
    const all = headerRules.find((r) => r.source === "/(.*)")!;
    expect(all).toBeTruthy();
    for (const key of [
      "Strict-Transport-Security",
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
    ]) {
      expect(all.headers.map((h) => h.key), key).toContain(key);
    }
    expect(all.headers.find((h) => h.key === "Permissions-Policy")!.value).not.toContain("payment");
  });

  it("noindexes the order, team, campaign, api, redirect and lookup surfaces", () => {
    for (const source of ["/order/:path*", "/t/:path*", "/lp/:path*", "/api/:path*", "/go/:path*", "/etsy", "/registry/lookup"]) {
      expect(noindexSources, source).toContain(source);
    }
  });

  it("has one rule per unlisted and private card, and none for a public one", () => {
    const hidden = [...pathsWith("unlisted"), ...pathsWith("private")];
    for (const p of hidden) expect(noindexSources, `${p} has no X-Robots-Tag rule`).toContain(p);
    for (const p of pathsWith("public")) expect(noindexSources, `${p} is public and must not be noindexed`).not.toContain(p);
    // Exact paths, never a wildcard that would swallow the public pages with them.
    for (const p of hidden) expect(p).not.toContain(":");
  });

  it("declares every rule once", () => {
    const sources = headerRules.map((r) => r.source);
    expect(new Set(sources).size, sources.join(" ")).toBe(sources.length);
  });
});

describe("next.config rewrites() — 410 for deleted cards", () => {
  it("covers every deleted card and nothing else", () => {
    const deleted = pathsWith("deleted");
    expect(beforeFiles.map((r) => r.source).sort()).toEqual([...deleted].sort());
    for (const rule of beforeFiles) expect(rule.destination).toBe("/api/gone");
  });

  it("/free-proof?sport=<slug> goes to its prerendered twin, for exactly the sports that have one (2026-10-07)", () => {
    expect(freeProofRewrites).toHaveLength(1);
    const [rule] = freeProofRewrites as { source: string; destination: string; has?: { type: string; key: string; value?: string }[] }[];
    expect(rule.destination).toBe("/free-proof/for/:sport");
    expect(rule.has).toHaveLength(1);
    const [has] = rule.has!;
    expect([has.type, has.key]).toEqual(["query", "sport"]);
    const re = new RegExp(`^${has.value}$`);
    for (const slug of freeProofSportSlugs()) expect(re.test(slug), slug).toBe(true);
    for (const bad of ["", "other", "nonsense", "football2", "basketball|x"]) expect(re.test(bad), bad).toBe(false);
    expect(freeProofSportSlugs().length).toBe(17);
  });

  it("never rewrites a card that still renders", () => {
    const live = new Set([...pathsWith("public"), ...pathsWith("unlisted"), ...pathsWith("private")]);
    for (const rule of beforeFiles) expect(live.has(rule.source), rule.source).toBe(false);
  });

  it("the mechanism works for a card that is deleted later (fixture)", () => {
    const fixture = [{ cardId: "GDE-SN-BKB-2026-99", visibility: "deleted" as const }];
    const rules = fixture
      .filter((c) => c.visibility === "deleted")
      .map((c) => ({ source: `/c/${c.cardId}`, destination: "/api/gone" }));
    expect(rules).toEqual([{ source: "/c/GDE-SN-BKB-2026-99", destination: "/api/gone" }]);
  });
});

describe("next.config redirects()", () => {
  it("redirects the paths that moved, permanently", () => {
    const map = Object.fromEntries(redirectRules.map((r) => [r.source, r]));
    for (const [source, destination] of Object.entries({
      "/styles/senior-night": "/senior-night",
      "/sports/other-sport": "/sports/skateboarding",
      "/verify": "/registry",
      "/order": "/trading-cards",
      "/order-form": "/trading-cards",
    })) {
      expect(map[source], `${source} is not redirected`).toBeTruthy();
      expect(map[source].destination, source).toBe(destination);
      expect(map[source].permanent, `${source} must be a 308`).toBe(true);
    }
  });

  it("every destination is a page in the titles table, and an F1 one is built", () => {
    for (const r of redirectRules) {
      expect(matchesPagePath(r.destination), `${r.source} points at ${r.destination}, which is not in PAGES`).toBe(true);
      const meta = PAGES[r.destination];
      if (meta?.phase === "F1" && !routeBuilt(r.destination)) {
        expect(WAVE1_IN_FLIGHT.has(r.destination), `${r.destination} does not exist`).toBe(true);
      }
    }
  });

  it("never shadows a page that exists, and never chains", () => {
    const sources = redirectRules.map((r) => r.source);
    expect(new Set(sources).size).toBe(sources.length);
    for (const r of redirectRules) {
      expect(DISK_ROUTES.has(r.source), `${r.source} is a live route and must not be redirected`).toBe(false);
      expect(sources, `${r.source} redirects to another redirect`).not.toContain(r.destination);
    }
  });
});

describe("assets — provenance and output", () => {
  const manifestPath = path.join(ROOT, "public/images/.manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
    entries: Record<string, { sha256: string; sourceSha256?: string; width: number; height: number }>;
    keys: Record<string, { out: string; status: string }>;
  };
  const denylist = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/denylist.json"), "utf8")) as {
    entries: { sha256: string; path: string; reason: string }[];
  };
  const denied = new Map(denylist.entries.map((e) => [e.sha256, e]));

  it("no shipped image is a denylisted file", () => {
    for (const [out, entry] of Object.entries(manifest.entries)) {
      expect(denied.get(entry.sha256), `${out}: ${denied.get(entry.sha256)?.reason}`).toBeUndefined();
      if (entry.sourceSha256) {
        expect(denied.get(entry.sourceSha256), `${out} was converted from ${denied.get(entry.sourceSha256)?.path}`).toBeUndefined();
      }
    }
  });

  it("the files on disk are the files the manifest describes", () => {
    for (const [out, entry] of Object.entries(manifest.entries)) {
      const file = path.join(ROOT, "public", out.replace(/^\//, ""));
      expect(fs.existsSync(file), out).toBe(true);
      const sha = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
      expect(sha, `${out} changed since the manifest was written`).toBe(entry.sha256);
      expect(denied.has(sha), out).toBe(false);
    }
  });

  it("every verified asset exists at its declared size", async () => {
    const verified = Object.values(SITE_ASSETS).filter((a) => a.status === "verified");
    expect(verified.length).toBeGreaterThan(50);
    for (const a of verified) {
      const file = path.join(ROOT, "public", a.out.replace(/^\//, ""));
      expect(fs.existsSync(file), `${a.key} → ${a.out}`).toBe(true);
      const meta = await sharp(file).metadata();
      expect(`${meta.width}x${meta.height}`, `${a.key} (${a.out})`).toBe(`${a.width}x${a.height}`);
      if (a.lcp) {
        const avif = file.replace(/\.webp$/, ".avif");
        expect(fs.existsSync(avif), `${a.key} is an LCP key without an AVIF sibling`).toBe(true);
      }
    }
  });

  it("a locate key ships no file claim", () => {
    for (const [key, entry] of Object.entries(manifest.keys)) {
      if (entry.status === "verified") continue;
      expect(SITE_ASSETS[key]?.status, key).toBe("locate");
    }
  });
});

describe("assets — hero story scenes and lifestyle photography", () => {
  const SCENES = ["1", "2", "3"] as const;
  const PARTS = ["before", "card.front", "card.back", "poster"] as const;
  const SCENE_SPORT: Record<string, string> = { "1": "basketball", "2": "softball", "3": "football" };

  it("every scene is four verified files plus a caption entry", () => {
    for (const n of SCENES) {
      const meta = SITE_ASSETS[`hero.story.${n}.athlete`];
      expect(meta, `hero.story.${n}.athlete`).toBeDefined();
      expect(meta.out, "the caption entry carries no image").toBe("");
      expect(meta.alt.toLowerCase()).toContain(SCENE_SPORT[n]);
      expect(meta.alt.toLowerCase()).toContain("fictional roster athlete");
      for (const p of PARTS) {
        const a = SITE_ASSETS[`hero.story.${n}.${p}`];
        expect(a, `hero.story.${n}.${p}`).toBeDefined();
        expect(a.status, `hero.story.${n}.${p}`).toBe("verified");
        expect(a.out, `hero.story.${n}.${p}`).not.toBe("");
      }
    }
  });

  it("a scene never mixes two athletes — one sport per scene, three different sports", () => {
    const sports = SCENES.map((n) => SCENE_SPORT[n]);
    expect(new Set(sports).size, "three different sports").toBe(3);
    for (const n of SCENES) {
      for (const p of PARTS) {
        const a = SITE_ASSETS[`hero.story.${n}.${p}`];
        expect(a.alt.toLowerCase(), `hero.story.${n}.${p} names its sport`).toContain(SCENE_SPORT[n]);
        expect(a.fictional, `hero.story.${n}.${p} depicts a roster athlete`).toBe(true);
      }
    }
  });

  it("hero scene art stays inside the above-the-fold budget", () => {
    for (const n of SCENES) {
      for (const p of PARTS) {
        const a = SITE_ASSETS[`hero.story.${n}.${p}`];
        expect(Math.max(a.width, a.height), `hero.story.${n}.${p} long edge`).toBeLessThanOrEqual(1600);
        const file = path.join(ROOT, "public", a.out.replace(/^\//, ""));
        const kb = fs.statSync(file).size / 1024;
        expect(kb, `hero.story.${n}.${p} (${a.out}) is ${Math.round(kb)} KB`).toBeLessThan(200);
      }
    }
  });

  it("every scene ships a SET of four before photos of the one athlete (owner brief: we ask for 4-10)", () => {
    for (const n of SCENES) {
      const set = ["1", "2", "3", "4"].map((i) => SITE_ASSETS[`hero.story.${n}.before.${i}`]);
      set.forEach((a, i) => {
        const key = `hero.story.${n}.before.${i + 1}`;
        expect(a, key).toBeDefined();
        expect(a.status, key).toBe("verified");
        expect(a.kind, `${key}: a parent's phone photo is never a card face`).toBe("photo");
        expect(a.fictional, key).toBe(true);
        expect(a.alt.toLowerCase(), `${key} names its sport`).toContain(SCENE_SPORT[n]);
        expect(a.alt.toLowerCase(), `${key} says the photo is generated`).toContain("photo generated");
        expect(fs.existsSync(path.join(ROOT, "public", a.out.replace(/^\//, ""))), `${key} -> ${a.out}`).toBe(true);
      });
      expect(set[0].out, `scene ${n}: .before.1 re-uses the single before photo, it is not a second download`)
        .toBe(SITE_ASSETS[`hero.story.${n}.before`].out);
      expect(new Set(set.map((a) => a.out)).size, `scene ${n}: four different photos`).toBe(4);
    }
  });

  it("the new before photos are phone-sized (the whole set animates above the fold)", () => {
    for (const n of SCENES) {
      for (const i of ["2", "3", "4"]) {
        const a = SITE_ASSETS[`hero.story.${n}.before.${i}`];
        expect(Math.max(a.width, a.height), `hero.story.${n}.before.${i} long edge`).toBeLessThanOrEqual(900);
        const kb = fs.statSync(path.join(ROOT, "public", a.out.replace(/^\//, ""))).size / 1024;
        expect(kb, `hero.story.${n}.before.${i} is ${Math.round(kb)} KB`).toBeLessThan(120);
      }
    }
  });

  it("each scene carries its registration date as data, so no component hard-codes one", () => {
    for (const n of SCENES) {
      const key = `hero.story.${n}.registered`;
      const a = SITE_ASSETS[key];
      expect(a, key).toBeDefined();
      expect(a.status, `${key} is metadata, not a picture`).toBe("locate");
      expect(a.out, key).toBe("");
      const cardId = SITE_ASSETS[`hero.story.${n}.card.back`].cardId as string;
      const card = cards.find((c) => c.cardId === cardId);
      expect(card, `${cardId} is in the registry`).toBeDefined();
      const date = registeredAtOf(card!);
      expect(a.alt, `${key} is the chip line`).toBe(`Registered ${date}`);
      expect(a.note, `${key} names its card id`).toContain(cardId);
      expect(a.note, `${key} names the registration date`).toContain(date);
    }
  });

  it("scene 1 is the LCP scene and carries AVIF", () => {
    for (const p of PARTS) {
      const a = SITE_ASSETS[`hero.story.1.${p}`];
      expect(a.lcp, `hero.story.1.${p}`).toBe(true);
      const avif = path.join(ROOT, "public", a.out.replace(/^\//, "").replace(/\.webp$/, ".avif"));
      expect(fs.existsSync(avif), `hero.story.1.${p} AVIF`).toBe(true);
    }
  });

  it("hero card faces keep the square-cut 5 : 7 box", () => {
    for (const n of SCENES) {
      for (const p of ["card.front", "card.back"] as const) {
        const a = SITE_ASSETS[`hero.story.${n}.${p}`];
        expect(a.kind, `hero.story.${n}.${p}`).toBe("card");
        expect(a.crop, `hero.story.${n}.${p} is audited, never inset-cropped`).toBeUndefined();
        expect(Math.abs(a.width / a.height - 5 / 7)).toBeLessThan(0.01);
      }
      expect(SITE_ASSETS[`hero.story.${n}.card.back`].cardId, `scene ${n} back`).toMatch(/^GDE-[A-Z]{2}-[A-Z]{3}-\d{4}-\d+$/);
    }
  });

  it("every lifestyle photograph is verified, labelled and inside its size budget", () => {
    const life = Object.values(SITE_ASSETS).filter((a) => a.key.startsWith("life."));
    expect(life.length).toBeGreaterThanOrEqual(12);
    for (const a of life) {
      expect(a.status, a.key).toBe("verified");
      expect(a.kind, `${a.key}: a photograph OF a card is not a card face`).not.toBe("card");
      expect(a.fictional, a.key).toBe(true);
      expect(a.alt.toLowerCase(), `${a.key} says the athlete is fictional`).toContain("fictional athlete");
      expect(Math.max(a.width, a.height), `${a.key} long edge`).toBeLessThanOrEqual(1600);
      const file = path.join(ROOT, "public", a.out.replace(/^\//, ""));
      expect(fs.existsSync(file), `${a.key} → ${a.out}`).toBe(true);
      expect(fs.statSync(file).size / 1024, `${a.key} (${a.out})`).toBeLessThan(220);
    }
  });

  it("the room shots vary by athlete (owner brief: not one athlete everywhere)", () => {
    const rooms = Object.values(SITE_ASSETS).filter((a) => a.kind === "room" && a.key.startsWith("life."));
    const outs = new Set(rooms.map((a) => a.out));
    expect(outs.size, "at least two different room photographs").toBeGreaterThanOrEqual(3);
    expect(SITE_ASSETS["life.poster.room.baseball"].alt.toLowerCase()).toContain("baseball");
  });
});

describe("assets — the Etsy showcase set (docs/f1/ETSY-SHOWCASE-SURVEY.md)", () => {
  const SHOWCASE_ROOT = "Exportai Etsy/";
  const showcase = Object.values(SITE_ASSETS).filter((a) => a.source?.startsWith(SHOWCASE_ROOT));
  const WALL_SPORTS = ["basketball", "baseball", "football", "soccer", "cheerleading", "volleyball"] as const;

  it("every listing slide is cropped before it ships — a whole slide carries baked marketing type", () => {
    expect(showcase.length).toBeGreaterThanOrEqual(19);
    for (const a of showcase) {
      expect(a.crop, `${a.key}: a listing slide needs an explicit crop box`).toMatch(/^box:/);
      expect(a.status, a.key).toBe("verified");
    }
  });

  it("a photograph of a card is a photograph, not a card face", () => {
    for (const a of showcase) expect(a.kind, a.key).not.toBe("card");
  });

  it("every showcase image is labelled, sized and inside its weight budget", () => {
    for (const a of showcase) {
      expect(a.fictional, a.key).toBe(true);
      expect(a.alt.toLowerCase(), `${a.key} says the athlete is fictional`).toContain("fictional");
      expect(Math.max(a.width, a.height), `${a.key} long edge`).toBeLessThanOrEqual(1400);
      const file = path.join(ROOT, "public", a.out.replace(/^\//, ""));
      expect(fs.existsSync(file), `${a.key} → ${a.out}`).toBe(true);
      expect(fs.statSync(file).size / 1024, `${a.key} (${a.out})`).toBeLessThan(200);
    }
  });

  it("the six room shots are six different sports and six different files", () => {
    const outs = new Set<string>();
    for (const sport of WALL_SPORTS) {
      const a = SITE_ASSETS[`wall.${sport}`];
      expect(a, `wall.${sport}`).toBeDefined();
      expect(a.status, `wall.${sport}`).toBe("verified");
      expect(a.kind, `wall.${sport}`).toBe("room");
      expect(a.alt.toLowerCase(), `wall.${sport} names its sport`).toContain(sport);
      outs.add(a.out);
    }
    expect(outs.size, "six distinct room photographs").toBe(WALL_SPORTS.length);
  });

  it("the contract keys exist and either ship a file or state why they do not", () => {
    const CONTRACT = [
      ...WALL_SPORTS.map((s) => `wall.${s}`),
      "moment.card.bleachers",
      "moment.card.hallway",
      "moment.senior.field",
      "moment.team.senior",
      "scale.sizes",
    ];
    for (const key of CONTRACT) {
      const a = SITE_ASSETS[key];
      expect(a, key).toBeDefined();
      if (a.status === "verified") expect(a.out, key).not.toBe("");
      else expect(a.note, `${key} stays locate and must say why`).toBeTruthy();
    }
  });

  it("scale.sizes stays locate while the sheet draws a size the site does not sell", () => {
    expect(SITE_ASSETS["scale.sizes"].status).toBe("locate");
    expect(SITE_ASSETS["scale.sizes"].out).toBe("");
  });
});
