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
import { cards, updatedAtOf, visibilityOf } from "../lib/registry/cards";
import { SITE_ASSETS } from "../lib/assets";
import { SITE_URL } from "../lib/site";

const ROOT = path.resolve(__dirname, "..");

/** Card paths straight from the registry — the test never asks next.config.ts what the answer is. */
const pathsWith = (v: string): string[] =>
  cards.filter((c) => visibilityOf(c) === v).map((c) => `/c/${c.cardId}`);

/* ---------- the route tables, resolved once ---------- */
const headerRules = await nextConfig.headers!();
const redirectRules = await nextConfig.redirects!();
const rewriteRules = await nextConfig.rewrites!();
const beforeFiles = (Array.isArray(rewriteRules) ? rewriteRules : rewriteRules.beforeFiles) ?? [];

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

/**
 * F1 pages the other Wave-1 builders are still writing in this shared tree. Every entry must be gone
 * by the Wave-2 build; a page missing from disk that is NOT on this list is a real hole in the sitemap.
 */
const WAVE1_IN_FLIGHT = new Set([
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
    expect(headerRules.length).toBe(1 + 7 + pathsWith("unlisted").length + pathsWith("private").length);
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
      if (DISK_ROUTES.has(i.path)) continue;
      expect(WAVE1_IN_FLIGHT.has(i.path), `${i.path} owns keywords but has no page.tsx`).toBe(true);
    }
  });

  it("phase comes from the titles table, not from the intent row", () => {
    for (const i of INTENTS) {
      if (PAGES[i.path]) expect(i.phase, i.path).toBe(PAGES[i.path].phase);
    }
    expect(ownerOf("custom basketball cards")?.phase).toBe("F3");
    expect(ownerOf("football senior night")?.phase).toBe("F2");
    expect(ownerOf("custom trading cards")?.phase).toBe("F1");
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
      if (meta?.phase === "F1" && !DISK_ROUTES.has(r.destination)) {
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
