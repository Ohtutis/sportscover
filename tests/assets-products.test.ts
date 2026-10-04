// The /free-proof product tiles (2026-10-04): one square image per product the form offers, declared in
// lib/assets.ts as `product.<key>` and produced by scripts/site-assets.ts into public/images/products/.
// Everything is read from the map, the manifest and the files on disk — never from a page.
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";
import { SITE_ASSETS, assetOrNull, hasAsset } from "../lib/assets";
import { PRODUCT_KEYS } from "../lib/intake/products";

const ROOT = path.resolve(__dirname, "..");
const MAX_BYTES = 120 * 1024;
const NOUN: Record<string, RegExp> = {
  cards: /trading card/i,
  poster: /\bposter\b/i,
  banner: /\bbanner\b/i,
  blanket: /\bblanket\b/i,
};

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "public/images/.manifest.json"), "utf8")) as {
  entries: Record<string, { source: string; sourceSha256: string; sha256: string; width: number; height: number; keys: string[]; crop?: string }>;
  keys: Record<string, { out: string; status: string }>;
};
const denied = new Set(
  (JSON.parse(fs.readFileSync(path.join(ROOT, "scripts/denylist.json"), "utf8")) as { entries: { sha256: string }[] }).entries.map(
    (e) => e.sha256,
  ),
);
const file = (out: string) => path.join(ROOT, "public", out.replace(/^\//, ""));

describe("assets — /free-proof product tiles", () => {
  it("every product the form offers has a verified tile key, and nothing else claims the prefix", () => {
    expect(PRODUCT_KEYS.length).toBe(4);
    for (const p of PRODUCT_KEYS) {
      const a = SITE_ASSETS[`product.${p}`];
      expect(a, `product.${p}`).toBeDefined();
      expect(a.status, `product.${p}`).toBe("verified");
      expect(hasAsset(`product.${p}`), `product.${p}`).toBe(true);
      expect(a.out).toBe(`/images/products/${p}.webp`);
    }
    const tiles = Object.keys(SITE_ASSETS).filter((k) => k.startsWith("product."));
    expect(tiles.sort()).toEqual(PRODUCT_KEYS.map((p) => `product.${p}`).sort());
  });

  it("one ratio for all four: square, the same declared size, never a card face", () => {
    const sizes = new Set<string>();
    for (const p of PRODUCT_KEYS) {
      const a = SITE_ASSETS[`product.${p}`];
      expect(a.width, a.key).toBe(a.height);
      expect(a.kind, a.key).not.toBe("card");
      sizes.add(`${a.width}x${a.height}`);
    }
    expect([...sizes]).toEqual(["800x800"]);
  });

  it("the files exist at their declared size and stay under 120 KB", async () => {
    for (const p of PRODUCT_KEYS) {
      const a = SITE_ASSETS[`product.${p}`];
      const f = file(a.out);
      expect(fs.existsSync(f), a.out).toBe(true);
      const meta = await sharp(f).metadata();
      expect(meta.format, a.out).toBe("webp");
      expect(`${meta.width}x${meta.height}`, a.out).toBe(`${a.width}x${a.height}`);
      expect(fs.statSync(f).size, `${a.out} is over budget`).toBeLessThanOrEqual(MAX_BYTES);
    }
  });

  it("each alt names the product and says the athlete is fictional; the blanket says it is a mockup", () => {
    for (const p of PRODUCT_KEYS) {
      const a = SITE_ASSETS[`product.${p}`];
      expect(a.alt.trim().length, a.key).toBeGreaterThan(40);
      expect(a.alt, a.key).toMatch(NOUN[p]);
      expect(a.alt, a.key).toMatch(/fictional roster athlete/);
      expect(a.alt, a.key).not.toMatch(/\$\d/);
    }
    expect(SITE_ASSETS["product.blanket"].alt).toMatch(/\bmockup\b/i);
    expect(SITE_ASSETS["product.blanket"].alt).toMatch(/not a photo of a finished blanket/);
  });

  it("every tile shows a roster athlete, so the spec the page reads carries fictional: true", () => {
    for (const p of PRODUCT_KEYS) {
      const a = SITE_ASSETS[`product.${p}`];
      expect(a.fictional, a.key).toBe(true);
      const spec = assetOrNull(a.key);
      expect(spec, a.key).not.toBeNull();
      expect(spec?.src).toBe(a.out);
      expect(spec?.fictional, a.key).toBe(true);
      expect(spec?.width).toBe(a.width);
      expect(spec?.height).toBe(a.height);
    }
  });

  it("the manifest records each file, its source, its crop box and the bytes on disk", () => {
    for (const p of PRODUCT_KEYS) {
      const a = SITE_ASSETS[`product.${p}`];
      const e = manifest.entries[a.out];
      expect(e, a.out).toBeDefined();
      expect(e.keys, a.out).toContain(a.key);
      expect(e.source, a.out).toBe(a.source);
      expect(a.crop, a.key).toMatch(/^box:/);
      expect(e.crop, a.out).toBe(a.crop);
      expect(denied.has(e.sourceSha256), `${a.out} was converted from a denylisted source`).toBe(false);
      const sha = crypto.createHash("sha256").update(fs.readFileSync(file(a.out))).digest("hex");
      expect(sha, `${a.out} changed since the manifest was written`).toBe(e.sha256);
      expect(manifest.keys[a.key], a.key).toEqual({ out: a.out, status: "verified" });
    }
  });

  it("the cards and poster tiles re-crop sources the site already ships, not new art", () => {
    expect(SITE_ASSETS["product.cards"].source).toBe(SITE_ASSETS["life.card.desk"].source);
    expect(SITE_ASSETS["product.poster"].source).toBe(SITE_ASSETS["posters.room"].source);
  });
});
